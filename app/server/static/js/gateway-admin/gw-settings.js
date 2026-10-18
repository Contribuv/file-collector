/* ============================================================
   收集设置（settings）模块
   - 管理员：账号 / 页面与品牌 / 默认设置（全局）/ 上传路径 /
             功能开关 / 邮件（SMTP）/ 数据库备份恢复
   - 普通用户：账号 / 我的默认设置
   注：反向代理的运行状态统一放在「公网访问」Tab，此处不再重复展示。
   数据与写入均走 gateway_admin_bp 的 JSON API；角色裁剪在后端完成，
   前端仅按 is_admin 决定渲染哪些卡片。
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;
    window.GWModules = window.GWModules || {};

    var esc = GW.escapeHtml;
    var panel = null;
    var state = { data: null, inited: false };

    /* ---------------- 表单构件辅助 ---------------- */

    // 通用输入框：attrs 可携带 type / min / step / required / readonly 等
    function inp(name, value, attrs) {
        return '<input class="form-input" name="' + name + '" value="' +
            esc(value == null ? '' : value) + '"' + (attrs ? ' ' + attrs : '') + '>';
    }

    // 带单位后缀的数值输入
    function inpUnit(name, value, unit, attrs) {
        return '<div class="gwa-inline">' + inp(name, value, attrs) +
            '<span class="gwa-muted gwa-nowrap">' + esc(unit) + '</span></div>';
    }

    // 数值归一化显示：去掉无意义的尾随 0（"2.0" → "2"，"1.50" → "1.5"）
    function normNum(v) {
        var n = parseFloat(v);
        if (!isFinite(n)) return v == null ? '' : String(v);
        return String(Math.round(n * 1000) / 1000);
    }

    // 「单文件上限」专用控件：数值输入 + MB/GB 单位选择 + 隐藏字段（以 GB 提交）。
    // 后端 /settings/defaults 读取的 default_max_size 单位固定为 GB，
    // 因此这里始终把用户输入换算成 GB 写入隐藏字段。
    function sizeField(df) {
        var gb = parseFloat(df.max_file_size_gb);
        if (!isFinite(gb) || gb < 0) gb = 0;
        var unit = 'GB', val = gb;
        if (gb > 0 && gb < 1) { unit = 'MB'; val = Math.round(gb * 1024 * 10) / 10; }
        var valAttrs = (unit === 'MB')
            ? 'min="1" max="65536" step="1"'
            : 'min="0.01" max="64" step="0.01"';
        return '<div class="gwa-inline">' +
            '<input type="number" id="gwa-set-size-val" class="form-input" ' + valAttrs + ' value="' + esc(normNum(val)) + '">' +
            '<select id="gwa-set-size-unit" class="form-input gwa-unit">' +
            '<option value="MB"' + (unit === 'MB' ? ' selected' : '') + '>MB</option>' +
            '<option value="GB"' + (unit === 'GB' ? ' selected' : '') + '>GB</option>' +
            '</select>' +
            '</div>' +
            '<input type="hidden" id="gwa-set-size-hid" name="default_max_size" value="' + esc(normNum(gb)) + '">';
    }

    function sel(name, options, value) {
        var h = '<select class="form-input" name="' + name + '">';
        options.forEach(function (o) {
            h += '<option value="' + esc(o[0]) + '"' +
                (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        });
        return h + '</select>';
    }

    function sw(name, checked, label) {
        return '<label class="gwa-switch">' +
            '<input type="checkbox" name="' + name + '" value="1"' + (checked ? ' checked' : '') + '>' +
            '<span class="gwa-switch-track"><span class="gwa-switch-thumb"></span></span>' +
            '<span>' + esc(label) + '</span></label>';
    }

    function field(label, control, hint) {
        return '<div class="gwa-field"><div class="gwa-label">' + esc(label) + '</div>' + control +
            (hint ? '<div class="gwa-hint">' + hint + '</div>' : '') + '</div>';
    }

    function kv(k, v, mono) {
        return '<div class="gwa-kv"><span class="k">' + esc(k) + '</span>' +
            '<span class="v' + (mono ? ' gwa-mono' : '') + '">' + v + '</span></div>';
    }

    function card(title, inner, note) {
        return '<div class="gwa-card"' + (note ? '' : ' style="margin-top:16px"') + '>' +
            '<div class="gwa-card-title">' + esc(title) + '</div>' +
            (note ? '<div class="gwa-hint" style="margin:-6px 0 12px">' + note + '</div>' : '') +
            inner + '</div>';
    }

    // endpoint：API 相对路径；extraBtns：附加按钮 HTML
    function form(endpoint, inner, submitLabel, extraBtns, submitClass) {
        return '<form class="gwa-form" data-endpoint="' + endpoint + '">' + inner +
            '<div class="gwa-row" style="margin-top:10px">' +
            '<button type="submit" class="btn ' + (submitClass || 'btn-primary') + ' btn-sm">' +
            esc(submitLabel || '保存') + '</button>' +
            (extraBtns || '') + '</div></form>';
    }

    /* ---------------- 各设置卡片 ---------------- */

    function accountCard(d) {
        var acc = d.account || {};
        var inner = '';
        if (d.sso_need_pwd) {
            inner += '<div class="gwa-note">检测到当前账号尚未设置登录密码，请先设置后继续使用。</div>';
        }
        inner += '<div class="gwa-form-grid">';
        inner += field('用户名 *', inp('new_username', acc.username, 'required autocomplete="username"'));
        inner += field('昵称', inp('new_nickname', acc.nickname, 'autocomplete="nickname"'));
        inner += '</div>';
        inner += field('邮箱', inp('new_email', acc.email, 'type="email" autocomplete="email"'),
            '用于找回密码与系统通知，留空表示不设置');
        inner += '<hr class="gwa-hr">';
        inner += '<div class="gwa-form-grid">';
        if (!d.sso_need_pwd) {
            inner += field('原密码', inp('old_password', '', 'type="password" autocomplete="current-password"'),
                '修改账号信息或密码时必填');
        }
        inner += field(d.sso_need_pwd ? '设置密码 *' : '新密码',
            inp('new_password', '', 'type="password" autocomplete="new-password"'),
            '至少 8 位，需同时包含字母和数字；留空则不修改');
        inner += field('确认新密码', inp('confirm_password', '', 'type="password" autocomplete="new-password"'));
        inner += '</div>';
        return card('账号设置', form('/settings/account', inner, '保存'));
    }

    function brandingCard(d) {
        var b = d.branding || {};
        var inner = '';
        inner += field('站点标题 *', inp('site_title', b.site_title, 'maxlength="60" required'),
            '显示在浏览器标题栏与页面顶部');
        inner += field('分享页标题', inp('share_page_title', b.share_page_title, 'maxlength="60"'),
            '留空则使用站点标题');
        if (b.rp_running && b.rp_public_url) {
            inner += field('公网网址',
                inp('public_url', b.rp_public_url, 'readonly') +
                '<div class="gwa-hint" style="color:var(--gw-success)">反向代理已接管，分享链接将使用该地址</div>');
        } else {
            inner += field('公网网址', inp('public_url', b.public_url),
                '可手动填写公网访问地址（如反代域名），留空则自动探测');
        }
        inner += '<div class="gwa-form-row">';
        inner += field('收集页页尾', '<textarea class="form-input" name="collect_footer_text" rows="2">' + esc(b.collect_footer_text) + '</textarea>');
        inner += field('分享页页尾', '<textarea class="form-input" name="share_footer_text" rows="2">' + esc(b.share_footer_text) + '</textarea>');
        inner += '</div>';
        inner += field('登录页提示', '<textarea class="form-input" name="login_tip_text" rows="2">' + esc(b.login_tip) + '</textarea>');
        return card('页面与品牌', form('/settings/page-branding', inner, '保存'));
    }

    function defaultsCard(d) {
        var df = d.defaults || {};
        var admin = !!d.is_admin;
        var inner = '<div class="gwa-form-grid">';
        inner += field('默认最大文件数', inp('default_max_files', df.max_files, 'type="number" min="0" step="1"'),
            '0 表示不限制');
        inner += field('单文件上限', sizeField(df), '范围 0.01 - 64 GB（换算后）；小于 1 GB 会以 MB 显示');
        if (admin) {
            inner += field('单次上传个数', inp('upload_batch_limit', df.upload_batch_limit, 'type="number" min="0" max="500" step="1"'),
                '0 表示不限制');
        }
        inner += field('通行证有效期', inpUnit('passcode_ttl_minutes', df.passcode_ttl_minutes, '分钟', 'type="number" min="1" step="1"'));
        inner += field('默认链接有效期', inpUnit('default_link_expire_days', df.default_link_expire_days, '天', 'type="number" min="1" step="1"'));
        inner += field('收集附件上限', inpUnit('attachment_max_mb', df.attachment_max_mb, 'MB', 'type="number" min="0.1" step="0.1"'));
        inner += field('收集链接每页', inp('links_per_page_val', df.links_per_page, 'type="number" min="5" max="100" step="1"'));
        inner += field('上传记录每页', inp('records_per_page_val', df.records_per_page, 'type="number" min="5" max="200" step="1"'));
        inner += '</div>';
        if (admin) {
            inner += field('禁止上传的文件类型', inp('blocked_extensions_input', df.blocked_extensions),
                '空格分隔，如 exe php sh；留空则使用系统默认禁止列表');
        }
        return card(admin ? '默认设置（全局）' : '我的默认设置',
            form('/settings/defaults', inner, '保存'),
            admin ? '对全部用户生效的默认值（个人偏好除外）' : '仅对本人新建的收集链接生效');
    }

    function uploadPathCard(d) {
        var inner = field('自定义上传路径', inp('custom_upload_path', d.custom_upload_path),
            '留空使用默认路径；必须为已存在的绝对路径，例如 /vol2/1000/文件收集。修改后请确认飞牛应用已授权该目录读写权限');
        return card('上传路径', form('/settings/upload-path', inner, '保存'),
            '修改后会自动迁移数据库中已有的文件记录路径');
    }

    function togglesCard(d) {
        var t = d.toggles || {};
        var inner = '<div class="gwa-switch-stack">';
        inner += sw('allow_registration', t.allow_registration === '1', '允许用户注册');
        inner += sw('landing_page_enabled', t.landing_page_enabled === '1', '启用首页落地页');
        inner += sw('root_folder_enabled', t.root_folder_enabled === '1', '启用根目录模式');
        inner += '</div>';
        return card('功能开关', form('/settings/feature-toggles', inner, '保存'));
    }

    function smtpCard(d) {
        var s = d.smtp || {};
        var inner = '<div class="gwa-form-grid">';
        inner += field('SMTP 服务器', inp('smtp_host', s.smtp_host), '例如 smtp.qq.com');
        inner += field('加密方式', sel('smtp_use_tls', [['1', 'STARTTLS (端口 587)'], ['0', 'SSL (端口 465)']], s.smtp_use_tls));
        inner += field('端口', inp('smtp_port', s.smtp_port, 'type="number" min="1" max="65535"'));
        inner += field('邮箱账号', inp('smtp_username', s.smtp_username));
        inner += field('密码 / 授权码', inp('smtp_password', s.smtp_password, 'type="password" autocomplete="new-password"'));
        inner += field('发件人名称', inp('smtp_from_name', s.smtp_from_name));
        inner += field('发件人邮箱', inp('smtp_from_email', s.smtp_from_email, 'type="email"'));
        inner += '</div>';
        var extra = '<button type="button" class="btn btn-default btn-sm" data-act="test-smtp">发送测试邮件</button>';
        return card('邮件（SMTP）', form('/settings/smtp', inner, '保存配置', extra),
            '用于「忘记密码」等系统通知；发送测试邮件前会先保存当前配置');
    }

    function backupCard() {
        var inner = '<div class="gwa-row">';
        inner += '<button type="button" class="btn btn-default btn-sm" data-act="backup">下载数据库备份</button>';
        inner += '</div>';
        inner += '<hr class="gwa-hr">';
        inner += '<form class="gwa-form" data-endpoint="/settings/restore">' +
            '<div class="gwa-field"><div class="gwa-label">导入数据库备份</div>' +
            '<div class="gwa-row">' +
            GW.filePicker('db_file', 'accept=".db"') +
            '<button type="submit" class="btn btn-danger btn-sm">导入并覆盖</button>' +
            '</div><div class="gwa-hint">导入将覆盖现有数据（导入前系统会自动备份当前数据库）。' +
            '仅支持由本系统导出的 .db 文件</div></div></form>';
        return card('数据库备份与恢复', inner);
    }

    /* ---------------- 渲染 ---------------- */

    function render() {
        if (!panel) return;
        var d = state.data;
        if (!d) return;
        var html = '';
        if (d.is_admin) {
            html += accountCard(d);
            html += brandingCard(d);
            html += defaultsCard(d);
            html += uploadPathCard(d);
            html += togglesCard(d);
            html += smtpCard(d);
            html += backupCard();
        } else {
            html += accountCard(d);
            html += defaultsCard(d);
        }
        panel.innerHTML = html;
    }

    function load() {
        if (!panel) panel = document.querySelector('[data-gwa-panel="settings"]');
        if (!panel) return;
        if (!state.data) {
            panel.innerHTML = '<div class="gwa-card"><div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div></div>';
        }
        GW.api('/settings').then(function (data) {
            state.data = data;
            render();
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-card"><div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div></div>';
        });
    }

    /* ---------------- 交互 ---------------- */

    function setBusy(formEl, busy) {
        formEl.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(function (b) {
            b.disabled = busy;
        });
    }

    function submitForm(formEl) {
        var endpoint = formEl.getAttribute('data-endpoint');
        if (!endpoint) return;
        // 单文件上限：提交前把数值换算成 GB（以隐藏字段为准）并校验范围
        if (endpoint === '/settings/defaults') {
            syncSize();
            if (!validateDefaults()) return;
        }
        // 显式补齐未勾选的功能开关（表单不会提交未勾选的 checkbox）
        var isToggles = endpoint === '/settings/feature-toggles';
        var fd = new FormData(formEl);
        if (isToggles) {
            ['allow_registration', 'landing_page_enabled', 'root_folder_enabled'].forEach(function (k) {
                if (!fd.has(k)) fd.append(k, '0');
            });
        }
        setBusy(formEl, true);
        // 设置类保存偶发抖动时做一次轻量重试（仅网络/超时错误）。
        // 注意：账号改密不是幂等操作，不纳入重试，避免「其实已改成功」时二次提交报旧密码错误。
        var retry = (endpoint === '/settings/defaults' || endpoint === '/settings/upload-path'
            || endpoint === '/settings/page-branding' || endpoint === '/settings/feature-toggles'
            || endpoint === '/settings/smtp') ? 1 : 0;
        GW.api(endpoint, { method: 'POST', form: fd, retry: retry, timeout: 30000 }).then(function (data) {
            GW.toast(data.message || '已保存', 'success');
            if (endpoint === '/settings/account') {
                if (data.require_relogin) {
                    GW.toast('密码已修改，请重新登录', 'success');
                    setTimeout(function () { window.location.reload(); }, 1600);
                    return;
                }
            }
            // 全部设置卡片保存后都回读：以服务端实际保存结果为准回填，
            // 避免服务端做了格式归一化（如附件上限 fmt_mb）后表单值与实际值不一致，
            // 从而出现「提示成功但界面值没变/实际没生效」的错觉。
            load();
        }).catch(function (err) {
            GW.toast(err.message || '保存失败', 'error');
        }).then(function () {
            setBusy(formEl, false);
        });
    }

    function testSmtp(formEl) {
        var fd = new FormData(formEl);
        var to = fd.get('smtp_from_email') || '';
        GW.api('/settings/smtp', { method: 'POST', form: fd }).then(function () {
            var f2 = new FormData();
            f2.append('test_email', to);
            return GW.api('/settings/test-smtp', { method: 'POST', form: f2 });
        }).then(function (data) {
            GW.toast(data.message || '测试邮件已发送，请查收', 'success');
        }).catch(function (err) {
            GW.toast(err.message || '测试失败', 'error');
        });
    }

    function backup() {
        GW.downloadBlob('/settings/backup', { method: 'GET', filename: 'file-collector-backup.db' })
            .then(function () { GW.toast('备份已开始下载', 'success'); })
            .catch(function (err) { GW.toast(err.message || '备份失败', 'error'); });
    }

    /* ---------- 单文件上限：MB/GB 单位联动（事件委托，适配动态渲染） ---------- */
    function sizeEls() {
        if (!panel) return {};
        return {
            val: panel.querySelector('#gwa-set-size-val'),
            unit: panel.querySelector('#gwa-set-size-unit'),
            hid: panel.querySelector('#gwa-set-size-hid')
        };
    }

    function syncSize() {
        var el = sizeEls();
        if (!el.val || !el.unit || !el.hid) return;
        var v = parseFloat(el.val.value) || 0;
        var gb = el.unit.value === 'MB' ? v / 1024 : v;
        el.hid.value = String(Math.round(gb * 1000000) / 1000000);
    }

    function onSizeInput(e) {
        if (e.target && e.target.id === 'gwa-set-size-val') syncSize();
    }

    function onSizeChange(e) {
        var t = e.target;
        if (!t) return;
        if (t.id === 'gwa-set-size-unit') {
            var el = sizeEls();
            if (!el.val || !el.hid) return;
            var curGb = parseFloat(el.hid.value) || 0;
            if (t.value === 'MB') {
                el.val.value = normNum(Math.round(curGb * 1024 * 10) / 10);
                el.val.step = '1'; el.val.min = '1'; el.val.max = '65536';
            } else {
                el.val.value = normNum(Math.round(curGb * 100) / 100);
                el.val.step = '0.01'; el.val.min = '0.01'; el.val.max = '64';
            }
            syncSize();
        } else if (t.id === 'gwa-set-size-val') {
            syncSize();
        }
    }

    // 保存前校验单文件上限（换算成 GB 后须落在后端允许的 0.01 - 64）
    function validateDefaults() {
        var el = sizeEls();
        if (!el.hid) return true;
        var g = parseFloat(el.hid.value);
        if (isNaN(g) || g < 0.01 || g > 64) {
            GW.toast('单文件上限必须在 0.01 - 64 GB 之间', 'error');
            return false;
        }
        return true;
    }

    function bind() {
        if (!panel || panel.dataset.bound) return;
        panel.dataset.bound = '1';
        panel.addEventListener('submit', function (e) {
            var formEl = e.target.closest('form[data-endpoint]');
            if (!formEl) return;
            e.preventDefault();
            submitForm(formEl);
        });
        panel.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'test-smtp') {
                var f = btn.closest('form');
                if (f) testSmtp(f);
            } else if (act === 'backup') {
                backup();
            }
        });
        // 单文件上限单位联动（内容动态渲染，使用事件委托）
        panel.addEventListener('input', onSizeInput);
        panel.addEventListener('change', onSizeChange);
        // 进入面板时先同步一次隐藏字段，避免仅切换单位未触发 input 时提交旧值
        setTimeout(syncSize, 0);
    }

    function init() {
        panel = document.querySelector('[data-gwa-panel="settings"]');
        bind();
        load();
    }

    window.GWModules.settings = { init: init };
})();
