/* ============================================================
   文件记录（records）模块
   - 列表（分页 / 每页数量 / 按链接筛选）
   - 预览：图片·视频·音频内建查看器（支持上一个/下一个）
           PDF / TXT / Office 打开既有预览页
   - 下载 / 下载记录 / 删除 / 批量删除 / 打包下载
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;
    window.GWModules = window.GWModules || {};

    var esc = GW.escapeHtml;
    var panel = null;
    var state = null;

    var OFFICE_EXTS = { doc: 1, docx: 1, xls: 1, xlsx: 1, ppt: 1, pptx: 1, csv: 1 };
    var MEDIA_KINDS = { image: 1, video: 1, audio: 1 };

    function initState() {
        state = {
            page: 1, perPage: null, total: 0, totalPages: 1, linkFilter: '', dir: '',
            isAdmin: GW.isAdmin, records: [], links: [], folders: [], breadcrumb: [],
            inited: false, selected: {},
            viewList: [], viewIndex: -1
        };
    }
    initState();

    /* ---------- 工具 ---------- */
    function fmtTime(t) { return t ? String(t).replace('T', ' ').replace(/\.\d+$/, '') : '-'; }
    function recordUrl(r, suffix) {
        return GW.base + '/admin/records/' + encodeURIComponent(r.id) + '/' + suffix;
    }
    function previewTabUrl(r) {
        var ext = (r.ext || '').toLowerCase();
        var base = GW.base;
        var qs = '?type=a&rid=' + encodeURIComponent(r.id) + '&fn=' + encodeURIComponent(r.original_name || '');
        if (ext === 'pdf') return base + '/office' + qs;
        if (ext === 'txt') return base + '/txt' + qs;
        if (OFFICE_EXTS[ext]) return base + '/doc' + qs;
        return '';
    }
    function kindLabel(kind) {
        return { image: '图片', video: '视频', audio: '音频' }[kind] || '文件';
    }

    /* ---------- 列表加载 ---------- */
    function load(page, dir) {
        if (page) state.page = page;
        if (dir !== undefined) state.dir = dir || '';
        if (!panel) panel = document.querySelector('[data-gwa-panel="records"]');
        if (!panel) return;
        panel.innerHTML = '<div class="gwa-card"><div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div></div>';
        var qs = '?page=' + state.page +
            (state.perPage ? '&per_page=' + state.perPage : '') +
            (state.linkFilter ? '&link_id=' + encodeURIComponent(state.linkFilter) : '') +
            (state.dir ? '&dir=' + encodeURIComponent(state.dir) : '');
        GW.api('/records' + qs).then(function (data) {
            state.records = data.records || [];
            state.folders = data.folders || [];
            state.breadcrumb = data.breadcrumb || [];
            state.dir = data.dir || '';
            state.page = data.page || 1;
            state.total = data.total || 0;
            state.totalPages = data.total_pages || 1;
            state.perPage = data.per_page || state.perPage || 50;
            state.links = data.links || [];
            state.linkFilter = data.link_filter || state.linkFilter;
            state.selected = {};
            render();
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-card"><div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div></div>';
        });
    }

    /* ---------- 渲染 ---------- */
    // 文件类型图标（内联 SVG，替代早期 emoji，保持与面板风格统一）
    var ICONS = {
        video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 9.5l6-3.2v11.4l-6-3.2z"/></svg>',
        audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };

    /* 扩展名专属图标（与收集页 / 分享页列表同款，见 share.html getFileIcon）。
       非 image/video/audio 的记录按扩展名取专属 svg，没有匹配项时退回内置的通用文件 svg。 */
    var EXT_ICONS = {
        pdf: '/static/img/pdf.svg',
        fpk: '/static/img/fpk.svg',
        doc: '/static/img/word.svg', docx: '/static/img/word.svg',
        xls: '/static/img/excel.svg', xlsx: '/static/img/excel.svg', csv: '/static/img/excel.svg',
        ppt: '/static/img/ppt.svg', pptx: '/static/img/ppt.svg',
        zip: '/static/img/archive.svg', rar: '/static/img/archive.svg', '7z': '/static/img/archive.svg',
        tar: '/static/img/archive.svg', gz: '/static/img/archive.svg', bz2: '/static/img/archive.svg', xz: '/static/img/archive.svg',
        py: '/static/img/code.svg', js: '/static/img/code.svg', ts: '/static/img/code.svg', java: '/static/img/code.svg',
        go: '/static/img/code.svg', rs: '/static/img/code.svg', c: '/static/img/code.svg', cpp: '/static/img/code.svg',
        cs: '/static/img/code.svg', php: '/static/img/code.svg', rb: '/static/img/code.svg', sh: '/static/img/code.svg',
        html: '/static/img/code.svg', css: '/static/img/code.svg', vue: '/static/img/code.svg',
        txt: '/static/img/txt.svg', log: '/static/img/txt.svg', md: '/static/img/txt.svg', rtf: '/static/img/txt.svg',
        json: '/static/img/config.svg', yaml: '/static/img/config.svg', yml: '/static/img/config.svg',
        toml: '/static/img/config.svg', ini: '/static/img/config.svg', xml: '/static/img/config.svg',
        env: '/static/img/config.svg', conf: '/static/img/config.svg'
    };
    /* 图标 URL：经飞牛统一网关访问时需带网关路径前缀。
       仅当当前地址确实以该前缀开头才拼接（与 gateway-admin.js effectivePrefix 同约定）：
       TCP 端口直连时前缀不存在，拼上会 404 */
    var sysPref = document.body.getAttribute('data-gateway-prefix') || '';
    if (sysPref && String(location.pathname).indexOf(sysPref) !== 0) sysPref = '';

    var EXT_DEFAULT = '/static/img/file.svg';

    function extIconCell(r) {
        var ext = String(r.ext || '').toLowerCase();
        var kind = r.preview_kind;
        // 图标列统一使用与收集页/分享页一致的扩展名专属图标，不显示预览缩略图
        if (kind === 'image' || ['jpg','jpeg','png','gif','webp','bmp','svg','ico','heic','heif'].indexOf(ext) >= 0) {
            return '<img class="gwa-rec-exticon" src="' + sysPref + '/static/img/image.svg" alt="">';
        }
        if (EXT_ICONS[ext]) {
            return '<img class="gwa-rec-exticon" src="' + sysPref + EXT_ICONS[ext] + '" alt="">';
        }
        if (kind === 'video') return '<img class="gwa-rec-exticon" src="' + sysPref + '/static/img/video.svg" alt="">';
        if (kind === 'audio') return '<img class="gwa-rec-exticon" src="' + sysPref + '/static/img/audio.svg" alt="">';
        // 通用兜底：保持内置的文件 svg 外观
        return '<span class="gwa-rec-icon" aria-hidden="true">' + (ICONS[kind] || ICONS.file) + '</span>';
    }

    /* ---------- 目录式导航（drill-down） ----------
       记录页按「文件管理器」的方式逐层浏览：根目录列出子文件夹与散落文件，
       点击文件夹进入后列出其子文件夹与文件。目录聚合由后端完成（见
       record_dirs.py），前端只负责渲染面包屑与当前目录内容。 */
    var ICON_FOLDER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
    var ICON_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
    var ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';

    /* 上一级目录（根目录返回 ''） */
    function parentDir(dir) {
        var d = String(dir || '').replace(/\/+$/, '');
        var i = d.lastIndexOf('/');
        return i > 0 ? d.slice(0, i) : '';
    }

    function crumbsHtml() {
        var parts = ['<button type="button" class="gwa-crumb' + (state.dir ? '' : ' is-current') +
            '" data-dir="">全部文件</button>'];
        state.breadcrumb.forEach(function (c) {
            var isLast = c.path === state.dir;
            parts.push('<span class="gwa-crumb-sep" aria-hidden="true">/</span>');
            parts.push('<button type="button" class="gwa-crumb' + (isLast ? ' is-current' : '') +
                '" data-dir="' + esc(c.path) + '">' + esc(c.name) + '</button>');
        });
        return '<div class="gwa-crumbs">' + parts.join('') + '</div>';
    }

    function folderRowHtml(f, colCount) {
        // 与文件行同构：先补一个空的勾选列单元格，使文件夹图标与文件行的图标列对齐，
        // 否则整行 colspan 会让文件夹图标顶到表格最左侧，与文件列表错位。
        return '<tr class="gwa-folder-row" data-dir="' + esc(f.path) + '" tabindex="0" title="打开文件夹 ' + esc(f.name) + '">' +
            '<td class="gwa-col-sel" aria-hidden="true"></td>' +
            '<td colspan="' + (colCount - 1) + '">' +
            '<span class="gwa-folder-icon" aria-hidden="true">' + ICON_FOLDER + '</span>' +
            '<span class="gwa-folder-name">' + esc(f.name) + '</span>' +
            '<span class="gwa-folder-chevron" aria-hidden="true">' + ICON_CHEVRON + '</span>' +
            '<span class="gwa-folder-meta">' + f.file_count + ' 个文件<span class="cp-meta-size">' +
            esc(f.size_display || GW.fmtSize(f.size)) + '</span></span>' +
            '</td></tr>';
    }

    function countText() {
        var t = '共 ' + state.total + ' 个文件';
        if (state.folders.length) t = state.folders.length + ' 个文件夹 · ' + t;
        if (state.total > 0) t += ' · 第 ' + state.page + '/' + state.totalPages + ' 页';
        return t;
    }

    function nameCell(r) {
        // 图标列统一：所有行共用同尺寸的扩展名专属图标盒（24px + 6px 间距），
        // 与文件夹图标（.gwa-folder-icon）完全对齐；点击预览仍通过行内操作可用
        var thumb = extIconCell(r);
        // 有绝对路径时，点击文件名直接打开飞牛文件管理器并定位到该文件所在目录
        if (r.stored_dir) {
            return '<td data-label="文件">' + thumb +
                '<button type="button" class="gwa-rec-name gwa-ellipsis gwa-file-open" data-act="open-dir"' +
                ' data-dir="' + esc(r.stored_dir) + '"' +
                ' title="点击打开文件所在目录：' + esc(r.stored_dir) + '">' +
                esc(r.original_name) + '</button></td>';
        }
        return '<td data-label="文件">' + thumb +
            '<span class="gwa-ellipsis gwa-rec-name" title="' + esc(r.original_name) + '">' + esc(r.original_name) + '</span></td>';
    }

    function uploaderCell(r, hasUploader) {
        if (!hasUploader) return '';
        return '<td data-label="上传者" class="gwa-muted">' + esc(r.uploader_name || '-') + '</td>';
    }

    function rowHtml(r, hasUploader, gid) {
        return '<tr data-id="' + esc(r.id) + '"' + (gid ? ' data-gid="' + gid + '"' : '') + '>' +
            '<td class="gwa-col-sel"><input type="checkbox" class="gwa-sel-row" value="' + esc(r.id) + '"></td>' +
            nameCell(r) +
            '<td data-label="大小" class="gwa-muted gwa-nowrap">' + esc(r.file_size_display || GW.fmtSize(r.file_size)) + '</td>' +
            '<td data-label="来源" class="gwa-muted"><span class="gwa-ellipsis" title="' + esc(r.source) + '">' + esc(r.source || '-') + '</span></td>' +
            '<td data-label="下载" class="gwa-muted gwa-nowrap">' + (r.download_count || 0) + ' 次</td>' +
            uploaderCell(r, hasUploader) +
            '<td data-label="上传时间" class="gwa-muted gwa-nowrap">' + esc(fmtTime(r.uploaded_at)) + '</td>' +
            '<td data-label="操作" class="gwa-col-actions">' +
            '<button type="button" class="btn btn-default btn-sm" data-act="actions" data-id="' + esc(r.id) + '">操作</button>' +
            '</td></tr>';
    }

    function linkFilterHtml() {
        if (!state.links.length) return '';
        var opts = '<option value="">全部链接</option>' + state.links.map(function (l) {
            return '<option value="' + esc(l.id) + '"' + (state.linkFilter === l.id ? ' selected' : '') + '>' + esc(l.title) + '</option>';
        }).join('');
        return '<select class="form-select gwa-filter">' + opts + '</select>';
    }

    function render() {
        var hasUploader = state.records.some(function (r) { return r.require_uploader || r.uploader_name; });
        var colCount = hasUploader ? 8 : 7;
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="batch-download">打包下载</button>';
        html += '<button type="button" class="btn btn-danger btn-sm" data-act="batch-delete">批量删除</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="refresh">刷新</button>';
        html += linkFilterHtml();
        html += '</div>';
        html += '<div class="gwa-toolbar-right"><span class="gwa-muted">' + countText() + '</span></div>';
        html += '</div>';

        // 内容区块卡片化（对齐参考控制面板的多卡布局；面包屑随卡首行）
        html += '<div class="gwa-card">';

        // 目录面包屑：仅在「有子文件夹」或「已进入子目录」时显示，
        // 全是散文件的平铺列表不带无意义的导航条（与收集页 / 老后台一致）
        if (state.dir || state.folders.length) {
            html += '<div class="gwa-dirbar">';
            if (state.dir) {
                html += '<button type="button" class="gwa-back" data-act="up" title="返回上级" aria-label="返回上级">' + ICON_BACK + '</button>';
            }
            html += crumbsHtml();
            html += '</div>';
        }

        if (!state.records.length && !state.folders.length) {
            html += '<div class="gwa-empty">' + (state.dir ? '此文件夹为空' : '暂无上传记录') +
                '<br><span class="gwa-muted">' +
                (state.dir ? '这个文件夹里还没有文件' : '通过收集链接上传的文件会显示在这里') +
                '</span></div>';
        } else {
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th class="gwa-col-sel"><input type="checkbox" class="gwa-sel-all"></th>';
            html += '<th>文件名</th><th>大小</th><th>来源</th><th>下载</th>';
            if (hasUploader) html += '<th>上传者</th>';
            html += '<th>上传时间</th><th style="text-align:right">操作</th>';
            html += '</tr></thead><tbody>';
            // 统一时序渲染：文件夹按其内最新上传时间（latest）与散文件交错排序
            // （期望顺序：文件夹-文件-文件夹-文件-文件…），不再「文件夹全部优先」
            var items = [];
            state.folders.forEach(function (f) { items.push({ time: String(f.latest || ''), isFolder: true, v: f }); });
            state.records.forEach(function (r) { items.push({ time: String(r.uploaded_at || ''), isFolder: false, v: r }); });
            items.sort(function (a, b) {
                if (a.time === b.time) return a.isFolder ? -1 : 1; // 同一时刻文件夹在前
                return a.time < b.time ? 1 : -1;
            });
            items.forEach(function (it) {
                html += it.isFolder ? folderRowHtml(it.v, colCount) : rowHtml(it.v, hasUploader, '');
            });
            html += '</tbody></table></div></div>';
        }

        html += '<div class="gwa-list-foot">';
        html += '<div class="gwa-pager"></div>';
        html += '<div class="gwa-perpage"><label class="gwa-muted">每页显示</label>' +
            '<input type="number" class="form-input gwa-perpage-input" min="5" max="200" step="1" value="' + state.perPage + '"><span class="gwa-muted">条</span></div>';
        html += '</div>';

        panel.innerHTML = html;
        bind();
    }

    /* ---------- 事件绑定 ---------- */
    function syncSel(cb) {
        if (cb.checked) state.selected[cb.value] = 1; else delete state.selected[cb.value];
    }

    function bind() {
        var perInput = panel.querySelector('.gwa-perpage-input');
        if (perInput) {
            perInput.addEventListener('change', function () {
                var val = parseInt(perInput.value, 10);
                if (isNaN(val) || val < 5 || val > 200) { GW.toast('每页显示需在 5-200 之间', 'error'); perInput.value = state.perPage; return; }
                GW.api('/records/set-per-page', { method: 'POST', form: toForm({ value: String(val) }) })
                    .then(function () { state.perPage = val; load(1); })
                    .catch(function (e) { GW.toast(e.message || '保存失败', 'error'); });
            });
        }
        var filter = panel.querySelector('.gwa-filter');
        if (filter) {
            filter.addEventListener('change', function () { state.linkFilter = filter.value; load(1, ''); });
        }
        // 点击文件夹行 → 进入该目录
        panel.querySelectorAll('.gwa-folder-row').forEach(function (head) {
            function enter() { load(1, head.getAttribute('data-dir')); }
            head.addEventListener('click', enter);
            head.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); enter(); }
            });
        });
        // 面包屑：点击可跳转到任意层级
        panel.querySelectorAll('.gwa-crumb').forEach(function (c) {
            c.addEventListener('click', function () {
                var d = c.getAttribute('data-dir') || '';
                if (d !== state.dir) load(1, d);
            });
        });
        var selAll = panel.querySelector('.gwa-sel-all');
        if (selAll) {
            selAll.addEventListener('change', function () {
                panel.querySelectorAll('.gwa-sel-row').forEach(function (cb) {
                    cb.checked = selAll.checked; syncSel(cb);
                });
            });
        }
        panel.querySelectorAll('.gwa-sel-row').forEach(function (cb) {
            cb.addEventListener('change', function () { syncSel(cb); });
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
        if (act === 'refresh') { load(state.page); }
        else if (act === 'up') { load(1, parentDir(state.dir)); }
        else if (act === 'open-dir') {
            var dir = btn.getAttribute('data-dir') || '';
            if (window.openFileManagerDir) { window.openFileManagerDir(dir); }
            else { GW.toast('无法调用飞牛文件管理器，请在飞牛客户端中打开本页面。', 'error'); }
        }
        else if (act === 'batch-delete') { batchDelete(); }
        else if (act === 'batch-download') { batchDownload(); }
        else if (act === 'actions') {
            var id = btn.getAttribute('data-id');
            var r = state.records.filter(function (x) { return String(x.id) === String(id); })[0];
            if (r) showActions(btn, r);
        }
    }

    /* ---------- 操作浮窗 ---------- */
    function showActions(anchor, r) {
        var rows = '';
        rows += kv('类型', esc(kindLabel(r.preview_kind)) + (r.ext ? ' · .' + esc(r.ext) : ''));
        rows += kv('大小', esc(r.file_size_display || GW.fmtSize(r.file_size)));
        rows += kv('来源', esc(r.source || '-'));
        rows += kv('创建用户', esc(r.creator || '-'));
        if (r.require_uploader || r.uploader_name) rows += kv('上传者', esc(r.uploader_name || '-'));
        rows += kv('上传 IP', esc(r.uploader_ip || '-'));
        rows += kv('上传于', esc(fmtTime(r.uploaded_at)));
        rows += kv('下载次数', (r.download_count || 0) + ' 次');

        var html = '<div class="gwa-pop-info">' + rows + '</div>';
        html += '<div class="gwa-pop-actions">';
        if (r.previewable) {
            html += '<button type="button" class="btn btn-primary btn-sm" data-act="preview">预览</button>';
        }
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="download">下载</button>';
        html += '</div>';
        html += '<div class="gwa-pop-actions">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="logs">下载记录</button>';
        html += '<button type="button" class="btn btn-danger btn-sm" data-act="delete">删除</button>';
        html += '</div>';

        GW.popover(anchor, html);
        var pop = document.querySelector('.gwa-popover');
        if (!pop) return;
        pop.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-act]');
            if (!b) return;
            var a = b.getAttribute('data-act');
            if (a === 'preview') { GW.closePopover(); previewRecord(r); }
            else if (a === 'download') { GW.closePopover(); doDownload(r); }
            else if (a === 'logs') { GW.closePopover(); GW.downloadLogsModal(r); }
            else if (a === 'delete') { GW.closePopover(); doDelete(r); }
        });
    }

    function kv(k, v) {
        return '<div class="gwa-pop-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
    }

    /* ---------- 单条操作 ---------- */
    function doDownload(r) {
        GW.triggerDownload(recordUrl(r, 'download'));
    }

    function doDelete(r) {
        GW.confirm('确定删除文件「' + r.original_name + '」？\n该文件将被永久删除，无法找回！', { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/records/' + encodeURIComponent(r.id) + '/delete', { method: 'POST' })
                    .then(function () { GW.toast('已删除', 'success'); load(state.page); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    function batchDelete() {
        var ids = Object.keys(state.selected);
        if (!ids.length) { GW.toast('请先选择要删除的记录', 'error'); return; }
        GW.confirm('确定删除选中的 ' + ids.length + ' 条记录吗？\n对应文件将被永久删除。', { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/records/batch-delete', { method: 'POST', form: toForm({ record_ids: ids.join(',') }) })
                    .then(function (d) { GW.toast(d.message || '已删除', 'success'); load(1); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    function batchDownload() {
        var ids = Object.keys(state.selected);
        if (!ids.length) { GW.toast('请先选择要打包下载的记录', 'error'); return; }
        var fd = new FormData();
        // 老后台端点从 form 读 csrf_token；downloadBlob 另外会带 X-CSRFToken 头，两者都留
        fd.append('csrf_token', GW.csrf);
        ids.forEach(function (id) { fd.append('ids[]', id); });
        GW.toast('正在打包，请稍候…');
        // 走 GW.downloadBlob：统一的超时保护与中文网络报错（原裸 fetch 无超时且报英文）
        GW.downloadBlob(null, {
            url: GW.base + '/admin/records/batch-download',
            method: 'POST',
            form: fd,
            filename: 'files.zip'
        }).then(function () {
            GW.toast('打包下载已开始', 'success');
        }).catch(function (e) {
            GW.toast(e.message || '打包下载失败', 'error');
        });
    }

    /* ---------- 预览调度 ---------- */
    function previewRecord(r) {
        if (MEDIA_KINDS[r.preview_kind]) { openViewer(r); return; }
        var url = previewTabUrl(r);
        if (!url) { GW.toast('该文件类型不支持预览', 'error'); return; }
        // TXT 直接在面板内浮窗预览，避免跳转新窗口造成割裂感
        if ((r.ext || '').toLowerCase() === 'txt') {
            GW.previewModal(url, r.original_name);
            return;
        }
        window.open(url, '_blank', 'noopener');
    }

    /* ---------- 媒体查看器（图片 / 视频 / 音频，支持上一个·下一个） ---------- */
    function mediaUrl(r) {
        return r.preview_kind === 'image' ? recordUrl(r, 'preview-img') : recordUrl(r, 'preview_file');
    }

    function openViewer(record) {
        state.viewList = state.records.filter(function (r) { return MEDIA_KINDS[r.preview_kind]; });
        state.viewIndex = state.viewList.findIndex(function (r) { return String(r.id) === String(record.id); });
        if (state.viewIndex < 0) state.viewIndex = 0;

        var box = document.createElement('div');
        box.className = 'gwa-viewer';
        box.innerHTML =
            '<div class="gwa-viewer-bar">' +
            '<span class="gwa-viewer-title"></span>' +
            '<span class="gwa-viewer-tools">' +
            '<button type="button" class="btn btn-default btn-sm" data-act="dl">下载</button>' +
            '<button type="button" class="gwa-viewer-close" aria-label="关闭">&times;</button>' +
            '</span></div>' +
            '<button type="button" class="gwa-viewer-nav gwa-viewer-prev" data-nav="prev" aria-label="上一个">‹</button>' +
            '<div class="gwa-viewer-stage"></div>' +
            '<button type="button" class="gwa-viewer-nav gwa-viewer-next" data-nav="next" aria-label="下一个">›</button>' +
            '<div class="gwa-viewer-count"></div>';
        document.body.appendChild(box);

        function close() { box.remove(); document.removeEventListener('keydown', onKey); }
        function onKey(e) {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') nav(-1);
            else if (e.key === 'ArrowRight') nav(1);
        }
        function current() { return state.viewList[state.viewIndex]; }

        function paint() {
            var r = current();
            if (!r) return;
            box.querySelector('.gwa-viewer-title').textContent = r.original_name;
            box.querySelector('.gwa-viewer-count').textContent =
                (state.viewIndex + 1) + ' / ' + state.viewList.length;
            var stage = box.querySelector('.gwa-viewer-stage');
            var kind = r.preview_kind;
            var html;
            if (kind === 'video') html = '<video src="' + esc(mediaUrl(r)) + '" controls autoplay playsinline></video>';
            else if (kind === 'audio') html = '<audio src="' + esc(mediaUrl(r)) + '" controls autoplay></audio>';
            else html = '<img src="' + esc(mediaUrl(r)) + '" alt="">';
            stage.innerHTML = html;
            var multi = state.viewList.length > 1;
            box.querySelector('.gwa-viewer-prev').style.display = multi ? '' : 'none';
            box.querySelector('.gwa-viewer-next').style.display = multi ? '' : 'none';
        }
        function nav(dir) {
            if (state.viewList.length < 2) return;
            state.viewIndex = (state.viewIndex + dir + state.viewList.length) % state.viewList.length;
            paint();
        }

        box.addEventListener('click', function (e) {
            var navb = e.target.closest('[data-nav]');
            if (navb) { nav(navb.getAttribute('data-nav') === 'prev' ? -1 : 1); return; }
            var act = e.target.closest('[data-act]');
            if (act && act.getAttribute('data-act') === 'dl') { doDownload(current()); return; }
            if (e.target === box || e.target.classList.contains('gwa-viewer-close') ||
                e.target.classList.contains('gwa-viewer-stage')) close();
        });
        document.addEventListener('keydown', onKey);
        paint();
    }

    /* ---------- 入口 ---------- */
    /* 供其他面板（信息面板最近上传的文件夹行）直达某目录：
       记录模块常驻（initState 在模块加载时执行），这里只改状态再触发节切换；
       switchSection('records') 会调用 init() → load(state.page)，
       此时 state.page=1、state.dir=目标目录，一次请求即达 */
    function openDir(dir) {
        dir = dir || '';
        state.page = 1;
        state.dir = dir;
        state._jumpFromDashboard = true;
        if (window.switchSection) { window.switchSection('records'); return; }
        load(1, dir);
    }

    function init() {
        panel = document.querySelector('[data-gwa-panel="records"]');
        if (!panel) return;
        if (!panel.dataset.bound) {
            panel.addEventListener('click', onPanelClick);
            panel.dataset.bound = '1';
        }
        if (!state.inited) {
            state.inited = true;
            load(1);
            return;
        }
        if (state._jumpFromDashboard) {
            state._jumpFromDashboard = false;
            load(state.page || 1, state.dir || '');
            return;
        }
        state.dir = '';
        state.page = 1;
        state.linkFilter = '';
        load(1);
    }

    window.GWModules.records = { init: init, openDir: openDir };
})();
