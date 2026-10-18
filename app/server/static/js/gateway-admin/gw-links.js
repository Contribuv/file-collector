/* ============================================================
   收集链接（links）模块
   - 列表（分页 / 每页数量 / 管理员按创建人筛选）
   - 操作浮窗：复制收集·分享链接 / 编辑 / 启停 / 删除
   - 新建 / 编辑表单（模态框，FormData 提交）
   - 批量删除
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;
    window.GWModules = window.GWModules || {};

    var esc = GW.escapeHtml;
    var panel = null;
    var state = null;

    function initState() {
        state = {
            page: 1, perPage: 50, total: 0, totalPages: 1, creator: '',
            isAdmin: GW.isAdmin, links: [], creators: [], publicUrl: '',
            inited: false, defaults: null, selected: {}
        };
    }
    initState();

    /* ---------- 工具 ---------- */
    function originBase() {
        var pu = state.publicUrl;
        if (pu) {
            pu = String(pu).trim();
            if (pu) { if (!/\/$/.test(pu)) pu += '/'; return pu; }
        }
        return location.origin + (GW.base || '') + '/';
    }
    function collectUrl(l) { return originBase() + 'collect/' + encodeURIComponent(l.collect_id); }
    function shareUrl(l) { return originBase() + 'share/' + encodeURIComponent(l.share_id); }
    function fmtTime(t) { return t ? String(t).replace('T', ' ').replace(/\.\d+/, '') : '-'; }
    function stripHtml(s) { return String(s || '').replace(/<[^>]*>/g, ''); }
    // 数值归一化显示：去掉无意义的尾随 0（后端存的是 str(2.0) = "2.0"）
    function normNum(v) {
        var n = parseFloat(v);
        if (!isFinite(n)) return v == null ? '' : String(v);
        return String(Math.round(n * 1000) / 1000);
    }
    function limitText(l) {
        var f = (l.max_files === 0 || l.max_files === '0') ? '不限制' : (l.max_files + ' 个');
        var gb = parseFloat(l.max_file_size_gb) || 0;
        var size = gb < 1 ? Math.round(gb * 1024) + ' MB' : gb + ' GB';
        return f + ' / ' + size;
    }

    /* ---------- 列表加载 ---------- */
    function load(page) {
        if (page) state.page = page;
        if (!panel) panel = document.querySelector('[data-gwa-panel="links"]');
        if (!panel) return;
        panel.innerHTML = '<div class="gwa-card"><div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div></div>';
        var qs = '?page=' + state.page + '&per_page=' + state.perPage +
            (state.creator ? '&creator=' + encodeURIComponent(state.creator) : '');
        GW.api('/links' + qs).then(function (data) {
            state.links = data.links || [];
            state.page = data.page || 1;
            state.total = data.total || 0;
            state.totalPages = data.total_pages || 1;
            state.perPage = data.per_page || 50;
            state.creators = data.creators || [];
            state.isAdmin = !!data.is_admin;
            state.publicUrl = data.public_url || '';
            state.selected = {};
            render();
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-card"><div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div></div>';
        });
    }

    /* ---------- 渲染 ---------- */
    // 链接当前是否可对外使用：status 是创建者手动启停，expires_at 到点后
    // status 可能仍是 'active'，需同时判断是否过期
    function isAvailable(l) {
        return l.status === 'active' && !l.expired;
    }

    function shareCellHtml(l) {
        // 未开启分享页
        if (!l.share_enabled) return '<span class="gwa-badge gwa-badge-muted">未开启</span>';
        // 分享页自身有效期已到 → 停用
        if (l.share_expired) return '<span class="gwa-badge gwa-badge-danger">已停用</span>';
        // 收集链接被停用或已过期 → 分享页随链接停用
        if (!isAvailable(l)) return '<span class="gwa-badge gwa-badge-warn">随链接停用</span>';
        return '<span class="gwa-badge gwa-badge-ok">已开启</span>';
    }

    // 有效期图标（SVG，不使用表情符号）：inline-flex + 缩放不裁剪，窄屏也不换行
    function expireIcon(l) {
        if (!l.expires_at) return '';
        return '<span class="gwa-expire-icon" title="到期: ' + esc(l.expires_at.replace('T', ' ')) +
            (l.expired ? '（已过期）' : '') + '" aria-label="有效期至 ' + esc(l.expires_at.replace('T', ' ')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>';
    }

    function rowHtml(l) {
        var status = isAvailable(l)
            ? '<span class="gwa-badge gwa-badge-ok">已启用</span>'
            : '<span class="gwa-badge gwa-badge-muted">已停用</span>';
        return '<tr data-id="' + esc(l.id) + '">' +
            '<td class="gwa-col-sel"><input type="checkbox" class="gwa-sel-row" value="' + esc(l.id) + '"></td>' +
            '<td data-label="收集名称"><span class="gwa-ellipsis" title="' + esc(l.title) + '">' + esc(l.title) + '</span></td>' +
            '<td data-label="分享">' + shareCellHtml(l) + '</td>' +
            '<td data-label="限制" class="gwa-muted gwa-nowrap">' + esc(limitText(l)) + '</td>' +
            '<td data-label="收集">' + status + expireIcon(l) + '</td>' +
            '<td data-label="创建人" class="gwa-muted">' + esc(l.creator_name) + '</td>' +
            '<td data-label="创建" class="gwa-muted gwa-nowrap">' + esc(fmtTime(l.created_at)) + '</td>' +
            '<td data-label="操作" class="gwa-col-actions">' +
            '<button type="button" class="btn btn-default btn-sm" data-act="actions" data-id="' + esc(l.id) + '">操作</button>' +
            '</td></tr>';
    }

    function creatorFilterHtml() {
        if (!state.isAdmin || !state.creators.length) return '';
        var opts = '<option value="">全部创建人</option>' + state.creators.map(function (c) {
            return '<option value="' + esc(c.id) + '"' + (state.creator === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
        }).join('');
        return '<select class="form-select gwa-filter">' + opts + '</select>';
    }

    function render() {
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="create"><svg class="btn-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span class="btn-text">创建收集</span></button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="batch">批量删除</button>';
        html += creatorFilterHtml();
        html += '</div>';
        html += '<div class="gwa-toolbar-right"><span class="gwa-muted">共 ' + state.total + ' 个 · 第 ' + state.page + '/' + state.totalPages + ' 页</span></div>';
        html += '</div>';

        if (!state.links.length) {
            html += '<div class="gwa-card"><div class="gwa-empty">还没有收集链接<br><span class="gwa-muted">点击「创建收集」开始使用</span></div></div>';
        } else {
            html += '<div class="gwa-card">';
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th class="gwa-col-sel"><input type="checkbox" class="gwa-sel-all"></th>';
            html += '<th>收集名称</th><th>分享</th><th>限制</th><th>收集</th><th>创建人</th><th>创建</th><th style="text-align:right">操作</th>';
            html += '</tr></thead><tbody>' + state.links.map(rowHtml).join('') + '</tbody></table></div></div>';
        }

        html += '<div class="gwa-list-foot">';
        html += '<div class="gwa-pager"></div>';
        html += '<div class="gwa-perpage"><label class="gwa-muted">每页显示</label>' +
            '<input type="number" class="form-input gwa-perpage-input" min="5" max="100" step="1" value="' + state.perPage + '"><span class="gwa-muted">条</span></div>';
        html += '</div>';

        panel.innerHTML = html;
        bind();
    }

    /* ---------- 事件绑定 ---------- */
    function bind() {
        var perInput = panel.querySelector('.gwa-perpage-input');
        if (perInput) {
            perInput.addEventListener('change', function () {
                var val = parseInt(perInput.value, 10);
                if (isNaN(val) || val < 5 || val > 100) { GW.toast('每页显示需在 5-100 之间', 'error'); perInput.value = state.perPage; return; }
                GW.api('/links/set-per-page', { method: 'POST', form: toForm({ value: String(val) }) })
                    .then(function () { state.perPage = val; load(1); })
                    .catch(function (e) { GW.toast(e.message || '保存失败', 'error'); });
            });
        }
        var filter = panel.querySelector('.gwa-filter');
        if (filter) {
            filter.addEventListener('change', function () { state.creator = filter.value; load(1); });
        }
        var selAll = panel.querySelector('.gwa-sel-all');
        if (selAll) {
            selAll.addEventListener('change', function () {
                panel.querySelectorAll('.gwa-sel-row').forEach(function (cb) {
                    cb.checked = selAll.checked;
                    if (selAll.checked) state.selected[cb.value] = 1; else delete state.selected[cb.value];
                });
            });
        }
        panel.querySelectorAll('.gwa-sel-row').forEach(function (cb) {
            cb.addEventListener('change', function () {
                if (cb.checked) state.selected[cb.value] = 1; else delete state.selected[cb.value];
            });
        });
        GW.renderPager(panel.querySelector('.gwa-pager'), state.page, state.totalPages, function (p) { load(p); });
    }

    function toForm(obj) {
        var fd = new FormData();
        Object.keys(obj).forEach(function (k) { fd.append(k, obj[k]); });
        return fd;
    }

    /* ---------- 面板级委托 ---------- */
    function onPanelClick(e) {
        var btn = e.target.closest('[data-act]');
        if (!btn) return;
        var act = btn.getAttribute('data-act');
        if (act === 'create') { openForm(null); }
        else if (act === 'batch') { batchDelete(); }
        else if (act === 'actions') {
            var id = btn.getAttribute('data-id');
            var l = state.links.filter(function (x) { return x.id === id; })[0];
            if (l) showActions(btn, l);
        }
    }

    /* ---------- 操作浮窗 ---------- */
    function showActions(anchor, l) {
        var isActive = l.status === 'active';
        // 启停按钮按手动启停状态判断（已过期的链接仍可启停）；
        // 展示用「状态」则同时考虑有效期，与列表口径一致
        var descPlain = stripHtml(l.description).replace(/\s+/g, ' ').trim();
        if (descPlain.length > 80) descPlain = descPlain.substring(0, 80) + '...';
        var rows = '';
        rows += kv('状态', isAvailable(l) ? '<span class="gwa-badge gwa-badge-ok">已启用</span>' : '<span class="gwa-badge gwa-badge-muted">已停用</span>');
        rows += kv('限制', esc(limitText(l)));
        rows += kv('有效期', l.expires_at ? '<span class="gwa-expire">' + esc(l.expires_at.replace('T', ' ')) + '</span>' : '<span class="gwa-muted">永不过期</span>');
        if (descPlain) rows += kv('描述', esc(descPlain));
        rows += kv('创建', esc(fmtTime(l.created_at)));
        rows += kv('创建用户', esc(l.creator_name));
        rows += kv('上传记录', '<button type="button" class="gwa-link-btn" data-act="upload-logs">查看</button>');
        rows += kv('收集预览', l.allow_preview_download ? '<span class="gwa-badge gwa-badge-ok">已开启</span>' : '<span class="gwa-muted">未开启</span>');

        var html = '<div class="gwa-pop-info">' + rows + '</div>';
        html += '<div class="gwa-pop-actions">';
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="copy-share">复制分享链接</button>';
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="copy-collect">复制收集链接</button>';
        html += '</div>';
        html += '<div class="gwa-pop-actions">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="edit">编辑</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="toggle">' + (isActive ? '停用' : '启用') + '</button>';
        html += '<button type="button" class="btn btn-danger btn-sm" data-act="delete">删除</button>';
        html += '</div>';

        GW.popover(anchor, html);
        var pop = document.querySelector('.gwa-popover');
        if (!pop) return;
        pop.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-act]');
            if (!b) return;
            var a = b.getAttribute('data-act');
            if (a === 'copy-share') copyLink('share', l);
            else if (a === 'copy-collect') copyLink('collect', l);
            else if (a === 'upload-logs') { GW.closePopover(); GW.uploadLogsModal(l); }
            else if (a === 'edit') { GW.closePopover(); openForm(l.id); }
            else if (a === 'toggle') { GW.closePopover(); doToggle(l); }
            else if (a === 'delete') { GW.closePopover(); doDelete(l); }
        });
    }

    function kv(k, v) {
        return '<div class="gwa-pop-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
    }

    function copyLink(type, l) {
        var isLegacy = type === 'collect' ? l.is_legacy : l.is_share_legacy;
        if (isLegacy) {
            GW.toast('该链接的通行证为旧版加密存储，请在编辑中重新设置后再复制', 'error');
            return;
        }
        var url = type === 'collect' ? collectUrl(l) : shareUrl(l);
        var pass = type === 'collect' ? l.passcode : l.share_passcode;
        var hint = type === 'collect' ? '邀请您通过此链接上传文件' : '通过此链接给您分享了文件';
        var text;
        if (pass) {
            text = hint + '\n' + (type === 'collect' ? '上传通行证' : '分享通行证') + '：' + pass + '\n' + url;
        } else {
            text = hint + '\n' + url;
        }
        GW.copy(text);
    }

    function doToggle(l) {
        GW.api('/links/' + encodeURIComponent(l.id) + '/toggle', { method: 'POST' })
            .then(function () { GW.toast('状态已更新', 'success'); load(); })
            .catch(function (e) { GW.toast(e.message || '操作失败', 'error'); });
    }

    function doDelete(l) {
        GW.confirm('确定删除收集链接「' + l.title + '」？\n该链接的所有文件、文件夹及数据将被永久删除，无法找回！', { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/links/' + encodeURIComponent(l.id) + '/delete', { method: 'POST' })
                    .then(function (d) { GW.toast(d.message || '已删除', 'success'); load(); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    function batchDelete() {
        var ids = Object.keys(state.selected);
        if (!ids.length) { GW.toast('请先选择要删除的链接', 'error'); return; }
        GW.confirm('确定删除选中的 ' + ids.length + ' 个链接吗？\n所有关联文件与记录将被永久删除。', { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/links/batch-delete', { method: 'POST', form: toForm({ link_ids: ids.join(',') }) })
                    .then(function (d) { GW.toast(d.message || '已删除', 'success'); load(1); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    /* ============================================================
       新建 / 编辑表单
       ============================================================ */
    function radio(name, value, checked, label, desc) {
        return '<label class="gwa-radio' + (checked ? ' checked' : '') + '">' +
            '<input type="radio" name="' + name + '" value="' + value + '"' + (checked ? ' checked' : '') + '>' +
            '<span class="gwa-radio-body"><span class="gwa-radio-title">' + label + '</span>' +
            (desc ? '<span class="gwa-radio-desc">' + desc + '</span>' : '') + '</span></label>';
    }

    function switchBox(name, value, checked, label, hint) {
        return '<label class="gwa-switch"><input type="checkbox" name="' + name + '" value="' + value + '"' +
            (checked ? ' checked' : '') + '><span class="gwa-switch-track"><span class="gwa-switch-thumb"></span></span>' +
            '<span>' + label + '</span></label>' + (hint ? '<div class="gwa-hint">' + hint + '</div>' : '');
    }

    function buildFormData(data, isEdit) {
        var d = data;
        var def = d.defaults || {};
        var passKeep = isEdit ? (d.passcode_empty !== true || d.has_passcode) : false;
        var passEmpty = isEdit ? (d.passcode_empty === true && !d.has_passcode) : false;
        var shareKeep = isEdit ? (d.has_share_passcode || d.share_passcode_empty) : false;

        var h = '';
        // 收集名称
        h += '<div class="gwa-field"><label class="gwa-label">收集名称 *' + (isEdit ? ' <span class="gwa-tag-locked">已锁定</span>' : '') + '</label>';
        h += '<input type="text" class="form-input" name="title" maxlength="20" required value="' + esc(d.title || '') + '"' + (isEdit ? ' readonly' : '') + '>';
        h += isEdit ? '<div class="gwa-hint">收集名称已锁定，创建后不可修改。' : '<div class="gwa-hint">文件夹与收集链接名称，创建后不可修改。</div>';
        h += '</div>';

        // 描述
        h += '<div class="gwa-field"><label class="gwa-label">描述</label>';
        h += '<textarea class="form-input" name="description" rows="3">' + esc(d.description || '') + '</textarea></div>';

        // 附件
        h += '<div class="gwa-field"><label class="gwa-label">附件（可选）</label>';
        if (isEdit && d.attachment_name) {
            h += '<div class="gwa-attach-cur"><span class="gwa-ellipsis">' + esc(d.attachment_name) + '</span>' +
                '<button type="button" class="btn btn-default btn-sm" data-act="remove-attach">删除附件</button></div>';
            h += '<input type="hidden" name="remove_attachment" value="0">';
        }
        h += GW.filePicker('attachment');
        h += '</div>';

        // 自定义收集链接（仅新建）
        if (!isEdit) {
            h += '<div class="gwa-field"><label class="gwa-label">自定义收集链接 (可选)</label>';
            h += '<div class="gwa-inline"><span class="gwa-muted">/collect/</span><input type="text" class="form-input" name="collect_slug" placeholder="留空则使用系统生成ID" pattern="[a-zA-Z0-9][a-zA-Z0-9_\\-]*" minlength="3" maxlength="32"></div>';
            h += '<div class="gwa-hint">3-32位字母数字及 -_，创建后不可修改</div></div>';
        }

        // 限制
        h += '<div class="gwa-form-row">';
        h += '<div class="gwa-field"><label class="gwa-label">最大文件数量</label><input type="number" id="gwa-max-files" name="max_files" class="form-input" min="0" step="1" value="' + esc(d.max_files != null ? d.max_files : def.max_files) + '"><div class="gwa-hint">0 表示不限制</div></div>';
        // 单文件上限初始值：去掉尾随 0（后端存的是 str(2.0)="2.0"），避免输入框显示 2.0
        var sizeInitGb = normNum(d.max_file_size_gb != null ? d.max_file_size_gb : def.max_file_size_gb);
        h += '<div class="gwa-field"><label class="gwa-label">单文件上限</label><div class="gwa-inline">' +
            '<input type="number" id="gwa-size-val" class="form-input" min="0.01" step="0.01" value="' + esc(sizeInitGb) + '">' +
            '<select id="gwa-size-unit" class="form-input gwa-unit"><option value="MB">MB</option><option value="GB">GB</option></select>' +
            '</div><input type="hidden" id="gwa-size-hid" name="max_file_size_gb" value="' + esc(sizeInitGb) + '">' +
            '<div class="gwa-hint">范围 0.01 - 64 GB</div></div>';
        h += '</div>';

        // 有效期
        h += '<div class="gwa-form-row">';
        h += '<div class="gwa-field"><label class="gwa-label">收集页有效期 <span class="gwa-muted">0 或留空则永不过期</span></label>' +
            '<div class="gwa-inline"><input type="number" id="gwa-expire-days" name="expire_days" class="form-input" min="0" step="1" value="' + esc(isEdit ? (d.expire_days_value || '') : (def.expire_days || '')) + '" data-max-days="' + esc(def.expire_days || 30) + '">' +
            '<select id="gwa-expire-unit" name="expire_unit" class="form-input gwa-unit">' +
            opt('天', isEdit ? d.expire_unit : '天') + opt('小时', isEdit ? d.expire_unit : '天') + opt('分钟', isEdit ? d.expire_unit : '天') +
            '</select></div></div>';
        h += '<div class="gwa-field"><label class="gwa-label">截止时间 <span class="gwa-muted">仅展示</span></label>' +
            '<input type="text" id="gwa-expire-display" class="form-input" readonly value="' + esc(isEdit ? (d.expires_display || '') : '') + '" placeholder="根据有效期自动计算"></div>';
        h += '</div>';
        h += '<input type="hidden" id="gwa-clear-expiry" name="clear_expiry" value="0">';
        if (isEdit && d.has_expiry) {
            h += '<div><button type="button" class="btn btn-default btn-sm" data-act="clear-expiry">清除过期设置</button></div>';
        }

        // 功能开关
        h += '<div class="gwa-field gwa-switches">';
        h += switchBox('allow_delete', '1', d.allow_delete, '允许上传者删除已上传文件');
        h += switchBox('allow_preview_download', '1', d.allow_preview_download, '收集页显示预览按钮');
        h += switchBox('allow_download', '1', d.allow_download, '收集页显示下载按钮');
        h += '</div>';

        // 通行证
        h += '<hr class="gwa-hr"><h4 class="gwa-subtitle">通行证设置</h4>';
        h += '<div class="gwa-field"><label class="gwa-label">收集页通行证' + (isEdit ? '' : ' *') + '</label><div class="gwa-radio-group">';
        if (isEdit) h += radio('passcode_mode', 'keep', passKeep, '保持原有设置不变', d.passcode_empty ? '当前：空通行证' : (d.has_passcode ? '当前：已设置通行证' : '当前：无通行证'));
        h += radio('passcode_mode', 'set', !isEdit, '需要通行证验证', '');
        h += '<div class="gwa-field gwa-pass-wrap" id="gwa-pass-wrap"><input type="password" class="form-input" id="gwa-passcode" name="passcode" autocomplete="off" placeholder="请输入通行证"></div>';
        h += radio('passcode_mode', 'empty', passEmpty, '空通行证（任何人可直接访问）', '无需输入密码即可进入收集页');
        h += '</div><input type="hidden" id="gwa-empty-passcode" name="empty_passcode" value="0"></div>';

        // 上传者登记
        if (!isEdit) {
            h += '<div class="gwa-field gwa-switches">' + switchBox('require_uploader', '1', false, '上传者登记', '开启后上传者需填写昵称，文件按上传者分文件夹存放（创建后不可修改）') + '</div>';
        } else if (d.require_uploader) {
            h += '<div class="gwa-field gwa-note">上传者登记：已开启（创建时设定，不可修改）</div>';
        }

        // 分享页
        h += '<hr class="gwa-hr"><h4 class="gwa-subtitle">分享页设置</h4>';
        h += '<div class="gwa-field">' + switchBox('share_enabled', '1', d.share_enabled, '启用分享页', '开启后生成独立分享页面供他人查看和下载') + '</div>';
        h += '<div id="gwa-share-section"' + (d.share_enabled ? '' : ' style="display:none"') + '>';
        h += '<div class="gwa-field gwa-switches">' + switchBox('collect_disabled', '1', (d.collect_enabled === 0), '关闭收集页（仅保留分享页）', '关闭后收集链接不可访问，分享页仍可用') + '</div>';
        // 分享页通行证
        h += '<div class="gwa-field"><label class="gwa-label">分享页通行证' + (isEdit ? '' : ' *') + '</label><div class="gwa-radio-group">';
        if (isEdit) h += radio('share_passcode_mode', 'keep', shareKeep, '保持原有设置不变', d.has_share_passcode ? '当前：已设置通行证' : (d.share_passcode_empty ? '当前：空通行证' : '当前：复用收集页'));
        h += radio('share_passcode_mode', 'inherit', !shareKeep, '复用收集页通行证', '使用收集页通行证设置');
        h += radio('share_passcode_mode', 'set', false, '需要通行证验证', '');
        h += '<div class="gwa-field gwa-pass-wrap" id="gwa-share-pass-wrap"><input type="password" class="form-input" id="gwa-share-passcode" name="share_passcode" autocomplete="off" placeholder="请输入分享页通行证"></div>';
        h += radio('share_passcode_mode', 'empty', false, '空通行证（任何人可直接访问）', '');
        h += '</div><input type="hidden" id="gwa-share-passcode-empty" name="share_passcode_empty" value="0"></div>';
        // 分享页描述
        h += '<div class="gwa-field"><label class="gwa-label">分享页描述</label><textarea class="form-input" name="share_description" rows="2" placeholder="留空则使用收集页描述">' + esc(d.share_description || '') + '</textarea></div>';
        // 分享页 slug（仅新建）
        if (!isEdit) {
            h += '<div class="gwa-field"><label class="gwa-label">自定义分享链接 (可选)</label><div class="gwa-inline"><span class="gwa-muted">/share/</span><input type="text" class="form-input" name="share_slug" placeholder="留空则使用系统生成ID" pattern="[a-zA-Z0-9][a-zA-Z0-9_\\-]*" minlength="3" maxlength="32"></div></div>';
        }
        // 分享页有效期
        h += '<div class="gwa-form-row">';
        h += '<div class="gwa-field"><label class="gwa-label">分享页有效期</label><div class="gwa-inline">' +
            '<input type="number" id="gwa-share-expire-days" name="share_expire_days" class="form-input" min="0" step="1" value="' + esc(isEdit ? (d.share_expire_days_value || '') : (def.expire_days || '')) + '" data-max-days="' + esc(def.expire_days || 30) + '">' +
            '<select id="gwa-share-expire-unit" name="share_expire_unit" class="form-input gwa-unit">' +
            opt('天', isEdit ? d.share_expire_unit : '天') + opt('小时', isEdit ? d.share_expire_unit : '天') + opt('分钟', isEdit ? d.share_expire_unit : '天') +
            '</select></div></div>';
        h += '<div class="gwa-field"><label class="gwa-label">分享页截止时间 <span class="gwa-muted">仅展示</span></label>' +
            '<input type="text" id="gwa-share-expire-display" class="form-input" readonly value="' + esc(isEdit ? (d.share_expires_display || '') : '') + '"></div>';
        h += '</div>';
        h += '</div>'; // share section
        return h;
    }

    function opt(v, sel) { return '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + v + '</option>'; }

    function openForm(linkId) {
        if (linkId) {
            GW.api('/links/' + encodeURIComponent(linkId)).then(function (d) {
                renderForm(d.link, true, linkId);
            }).catch(function (e) { GW.toast(e.message || '加载失败', 'error'); });
        } else {
            GW.api('/links/defaults').then(function (d) {
                renderForm({ defaults: d.defaults }, false, null);
            }).catch(function (e) { GW.toast(e.message || '加载失败', 'error'); });
        }
    }

    function renderForm(data, isEdit, linkId) {
        var m = GW.modal({
            title: isEdit ? '编辑收集' : '创建收集链接',
            bodyHtml: '<div class="gwa-form">' + buildFormData(data, isEdit) + '</div>',
            footerHtml: '<button type="button" class="btn btn-default btn-sm" data-act="cancel">取消</button>' +
                '<button type="button" class="btn btn-primary btn-sm" data-act="submit">' + (isEdit ? '保存修改' : '创建收集链接') + '</button>',
            width: '640px'
        });

        var root = m.body;

        // 单文件上限单位切换
        initSizeUnit(root);
        // 通行证模式
        bindPasscodeMode(root);
        // 分享页
        bindShare(root);
        // 有效期
        bindExpire(root, 'gwa-expire-days', 'gwa-expire-unit', 'gwa-expire-display');
        bindExpire(root, 'gwa-share-expire-days', 'gwa-share-expire-unit', 'gwa-share-expire-display');
        if (isEdit) {
            if (!root.querySelector('#gwa-expire-display').value) calcExpire(root, 'gwa-expire-days', 'gwa-expire-unit', 'gwa-expire-display');
            if (!root.querySelector('#gwa-share-expire-display').value) calcExpire(root, 'gwa-share-expire-days', 'gwa-share-expire-unit', 'gwa-share-expire-display');
        } else {
            calcExpire(root, 'gwa-expire-days', 'gwa-expire-unit', 'gwa-expire-display');
            calcExpire(root, 'gwa-share-expire-days', 'gwa-share-expire-unit', 'gwa-share-expire-display');
        }

        root.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            var a = b.getAttribute('data-act');
            if (a === 'remove-attach') {
                root.querySelector('input[name="remove_attachment"]').value = '1';
                var cur = root.querySelector('.gwa-attach-cur');
                if (cur) cur.style.display = 'none';
                GW.toast('已标记删除附件，保存后生效');
            } else if (a === 'clear-expiry') {
                root.querySelector('#gwa-expire-days').value = '';
                root.querySelector('#gwa-expire-display').value = '永不过期';
                root.querySelector('#gwa-share-expire-days').value = '';
                root.querySelector('#gwa-share-expire-display').value = '永不过期';
                root.querySelector('#gwa-clear-expiry').value = '1';
            }
        });

        m.footer.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.getAttribute('data-act') === 'cancel') { m.close(); return; }
            if (b.getAttribute('data-act') === 'submit') submitForm(root, m, isEdit, linkId, b);
        });
    }

    function submitForm(root, m, isEdit, linkId, btn) {
        if (!validate(root)) return;
        var fd = new FormData();
        // 收集所有具名字段
        root.querySelectorAll('input[name], textarea[name], select[name]').forEach(function (el) {
            if (el.type === 'checkbox') { if (el.checked) fd.append(el.name, el.value); }
            else if (el.type === 'radio') { if (el.checked) fd.append(el.name, el.value); }
            else if (el.type === 'file') { if (el.files && el.files[0]) fd.append(el.name, el.files[0]); }
            else if (el.disabled) { /* skip */ }
            else { fd.append(el.name, el.value); }
        });
        // 未勾选的 checkbox 需要显式传 0 由后端判断（后端用 == '1'，缺省即为 0，无需补）

        btn.disabled = true;
        var orig = btn.textContent;
        btn.textContent = '提交中…';
        var path = isEdit ? '/links/' + encodeURIComponent(linkId) : '/links';
        GW.api(path, { method: 'POST', form: fd }).then(function (d) {
            GW.toast(d.message || '操作成功', 'success');
            m.close();
            load(isEdit ? state.page : 1);
        }).catch(function (e) {
            btn.disabled = false;
            btn.textContent = orig;
            GW.toast(e.message || '提交失败', 'error');
        });
    }

    function validate(root) {
        var title = root.querySelector('input[name="title"]');
        if (title && !title.value.trim()) { title.focus(); GW.toast('请输入收集名称', 'error'); return false; }
        var mf = root.querySelector('#gwa-max-files');
        if (mf) { var v = parseInt(mf.value, 10); if (isNaN(v) || v < 0) { mf.focus(); GW.toast('最大文件数量必须为 0 或正整数', 'error'); return false; } }
        var hid = root.querySelector('#gwa-size-hid');
        if (hid) { var g = parseFloat(hid.value); if (isNaN(g) || g < 0.01 || g > 64) { GW.toast('单文件上限必须在 0.01-64 GB 之间', 'error'); return false; } }
        var pm = root.querySelector('input[name="passcode_mode"]:checked');
        if (pm && pm.value === 'set') {
            var pw = root.querySelector('#gwa-passcode');
            if (pw && !pw.value.trim()) { pw.focus(); GW.toast('请输入通行证密码', 'error'); return false; }
        } else if (!pm) {
            GW.toast('请选择收集页通行证方式', 'error'); return false;
        }
        var shareEnabled = root.querySelector('input[name="share_enabled"]');
        if (shareEnabled && shareEnabled.checked) {
            var spm = root.querySelector('input[name="share_passcode_mode"]:checked');
            if (!spm) { GW.toast('请选择分享页通行证方式', 'error'); return false; }
            if (spm.value === 'set') {
                var sp = root.querySelector('#gwa-share-passcode');
                if (sp && !sp.value.trim()) { sp.focus(); GW.toast('请输入分享页通行证密码', 'error'); return false; }
            }
        }
        // slug 校验
        var cs = root.querySelector('input[name="collect_slug"]');
        var ss = root.querySelector('input[name="share_slug"]');
        if (!validSlug(cs)) return false;
        if (!validSlug(ss)) return false;
        return true;
    }

    function validSlug(el) {
        if (!el || !el.value) return true;
        if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,31}$/.test(el.value)) {
            el.focus(); GW.toast('自定义链接只能使用 3-32 位字母数字及 -_，且以字母或数字开头', 'error'); return false;
        }
        return true;
    }

    /* ---------- 表单内交互 ---------- */
    function initSizeUnit(root) {
        var val = root.querySelector('#gwa-size-val');
        var unit = root.querySelector('#gwa-size-unit');
        var hid = root.querySelector('#gwa-size-hid');
        if (!val || !unit || !hid) return;
        function sync() {
            var v = parseFloat(val.value) || 0;
            var gb = unit.value === 'MB' ? v / 1024 : v;
            hid.value = Math.round(gb * 1000000) / 1000000;
        }
        function onUnit() {
            var curGb = parseFloat(hid.value) || 0;
            if (unit.value === 'MB') { val.value = Math.round(curGb * 1024 * 10) / 10; val.step = '1'; val.min = '1'; }
            else { val.value = Math.round(curGb * 100) / 100; val.step = '0.01'; val.min = '0.01'; }
            sync();
        }
        var gb0 = parseFloat(hid.value) || 0;
        if (gb0 < 1 && gb0 > 0) { unit.value = 'MB'; val.value = Math.round(gb0 * 1024 * 10) / 10; val.step = '1'; val.min = '1'; }
        else { unit.value = 'GB'; val.value = gb0; val.step = '0.01'; val.min = '0.01'; }
        sync();
        val.addEventListener('input', sync);
        unit.addEventListener('change', onUnit);
    }

    function bindPasscodeMode(root) {
        var wrap = root.querySelector('#gwa-pass-wrap');
        var input = root.querySelector('#gwa-passcode');
        var emptyHid = root.querySelector('#gwa-empty-passcode');
        function apply() {
            var m = root.querySelector('input[name="passcode_mode"]:checked');
            if (!m) return;
            var mode = m.value;
            if (mode === 'set') { if (wrap) wrap.style.display = 'block'; if (input) input.disabled = false; if (emptyHid) emptyHid.value = '0'; }
            else if (mode === 'empty') { if (wrap) wrap.style.display = 'none'; if (input) { input.disabled = true; input.value = ''; } if (emptyHid) emptyHid.value = '1'; }
            else { if (wrap) wrap.style.display = 'none'; if (input) { input.disabled = true; input.value = ''; } if (emptyHid) emptyHid.value = '0'; }
        }
        root.querySelectorAll('input[name="passcode_mode"]').forEach(function (r) { r.addEventListener('change', apply); });
        apply();
    }

    function bindShare(root) {
        var cb = root.querySelector('input[name="share_enabled"]');
        var sec = root.querySelector('#gwa-share-section');
        if (cb && sec) {
            cb.addEventListener('change', function () {
                sec.style.display = cb.checked ? 'block' : 'none';
                // 开启「启用分享页」后内容变长，自动把浮窗内容区滚到底部，确保能看到完整的分享页设置
                if (cb.checked) {
                    // 向上寻找最近的可滚动容器（浮窗内容区），保证滚动真正生效
                    var scroller = null, n = sec.parentElement;
                    while (n && n !== document.body) {
                        var oy = getComputedStyle(n).overflowY;
                        if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { scroller = n; break; }
                        n = n.parentElement;
                    }
                    scroller = scroller || root;
                    setTimeout(function () {
                        try { scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' }); }
                        catch (e) { scroller.scrollTop = scroller.scrollHeight; }
                    }, 60);
                }
            });
        }
        var wrap = root.querySelector('#gwa-share-pass-wrap');
        var input = root.querySelector('#gwa-share-passcode');
        var emptyHid = root.querySelector('#gwa-share-passcode-empty');
        function apply() {
            var m = root.querySelector('input[name="share_passcode_mode"]:checked');
            if (!m) return;
            var mode = m.value;
            if (mode === 'set') { if (wrap) wrap.style.display = 'block'; if (input) input.disabled = false; if (emptyHid) emptyHid.value = '0'; }
            else if (mode === 'empty') { if (wrap) wrap.style.display = 'none'; if (input) { input.disabled = true; input.value = ''; } if (emptyHid) emptyHid.value = '1'; }
            else { if (wrap) wrap.style.display = 'none'; if (input) { input.disabled = true; input.value = ''; } if (emptyHid) emptyHid.value = '0'; }
        }
        root.querySelectorAll('input[name="share_passcode_mode"]').forEach(function (r) { r.addEventListener('change', apply); });
        apply();
    }

    function calcExpire(root, daysId, unitId, displayId) {
        var daysEl = root.querySelector('#' + daysId);
        var unitEl = root.querySelector('#' + unitId);
        var dispEl = root.querySelector('#' + displayId);
        if (!daysEl || !unitEl || !dispEl) return;
        var v = parseInt(daysEl.value, 10) || 0;
        if (v <= 0) { dispEl.value = '永不过期'; return; }
        var unit = unitEl.value;
        var minutes = unit === '分钟' ? v : (unit === '小时' ? v * 60 : v * 1440);
        var maxDays = parseInt(daysEl.getAttribute('data-max-days'), 10) || 30;
        if (minutes > maxDays * 1440) { dispEl.value = '超出最大 ' + maxDays + ' 天限制'; return; }
        var d = new Date();
        d.setMinutes(d.getMinutes() + minutes);
        function p(n) { return String(n).padStart(2, '0'); }
        dispEl.value = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function bindExpire(root, daysId, unitId, displayId) {
        var daysEl = root.querySelector('#' + daysId);
        var unitEl = root.querySelector('#' + unitId);
        if (daysEl) {
            daysEl.addEventListener('input', function () { calcExpire(root, daysId, unitId, displayId); });
            daysEl.addEventListener('change', function () { calcExpire(root, daysId, unitId, displayId); });
        }
        if (unitEl) {
            unitEl.addEventListener('change', function () { calcExpire(root, daysId, unitId, displayId); });
        }
    }

    /* ---------- 入口 ---------- */
    function init() {
        panel = document.querySelector('[data-gwa-panel="links"]');
        if (!panel) return;
        if (!panel.dataset.bound) {
            panel.addEventListener('click', onPanelClick);
            panel.dataset.bound = '1';
        }
        if (!state.inited) {
            state.inited = true;
            load(1);
        } else {
            load(state.page);
        }
    }

    window.GWModules.links = { init: init };
})();
