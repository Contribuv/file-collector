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
            page: 1, perPage: null, total: 0, totalPages: 1, linkFilter: '',
            isAdmin: GW.isAdmin, records: [], links: [],
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
    function load(page) {
        if (page) state.page = page;
        if (!panel) panel = document.querySelector('[data-gwa-panel="records"]');
        if (!panel) return;
        panel.innerHTML = '<div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div>';
        var qs = '?page=' + state.page +
            (state.perPage ? '&per_page=' + state.perPage : '') +
            (state.linkFilter ? '&link_id=' + encodeURIComponent(state.linkFilter) : '');
        GW.api('/records' + qs).then(function (data) {
            state.records = data.records || [];
            state.page = data.page || 1;
            state.total = data.total || 0;
            state.totalPages = data.total_pages || 1;
            state.perPage = data.per_page || state.perPage || 50;
            state.links = data.links || [];
            state.linkFilter = data.link_filter || state.linkFilter;
            state.selected = {};
            render();
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div>';
        });
    }

    /* ---------- 渲染 ---------- */
    // 文件类型图标（内联 SVG，替代早期 emoji，保持与面板风格统一）
    var ICONS = {
        video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 9.5l6-3.2v11.4l-6-3.2z"/></svg>',
        audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };

    function nameCell(r) {
        var thumb = '';
        if (r.preview_kind === 'image') {
            thumb = '<img class="gwa-rec-thumb" loading="lazy" src="' + esc(recordUrl(r, 'preview-img')) + '" alt="">';
        } else {
            var icon = ICONS[r.preview_kind] || ICONS.file;
            thumb = '<span class="gwa-rec-icon" aria-hidden="true">' + icon + '</span>';
        }
        return '<td data-label="文件">' + thumb +
            '<span class="gwa-ellipsis gwa-rec-name" title="' + esc(r.original_name) + '">' + esc(r.original_name) + '</span></td>';
    }

    function uploaderCell(r, hasUploader) {
        if (!hasUploader) return '';
        return '<td data-label="上传者" class="gwa-muted">' + esc(r.uploader_name || '-') + '</td>';
    }

    function rowHtml(r, hasUploader) {
        return '<tr data-id="' + esc(r.id) + '">' +
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
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="batch-download">打包下载</button>';
        html += '<button type="button" class="btn btn-danger btn-sm" data-act="batch-delete">批量删除</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="refresh">刷新</button>';
        html += linkFilterHtml();
        html += '</div>';
        html += '<div class="gwa-toolbar-right"><span class="gwa-muted">共 ' + state.total + ' 条 · 第 ' + state.page + '/' + state.totalPages + ' 页</span></div>';
        html += '</div>';

        if (!state.records.length) {
            html += '<div class="gwa-empty">暂无上传记录<br><span class="gwa-muted">通过收集链接上传的文件会显示在这里</span></div>';
        } else {
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th class="gwa-col-sel"><input type="checkbox" class="gwa-sel-all"></th>';
            html += '<th>文件名</th><th>大小</th><th>来源</th><th>下载</th>';
            if (hasUploader) html += '<th>上传者</th>';
            html += '<th>上传时间</th><th style="text-align:right">操作</th>';
            html += '</tr></thead><tbody>' + state.records.map(function (r) { return rowHtml(r, hasUploader); }).join('') + '</tbody></table></div>';
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
            filter.addEventListener('change', function () { state.linkFilter = filter.value; load(1); });
        }
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
        fd.append('csrf_token', GW.csrf);
        ids.forEach(function (id) { fd.append('ids[]', id); });
        GW.toast('正在打包，请稍候…');
        fetch(GW.base + '/admin/records/batch-download', { method: 'POST', body: fd })
            .then(function (r) {
                if (!r.ok) throw new Error('打包失败 (' + r.status + ')');
                var cd = r.headers.get('Content-Disposition') || '';
                var name = 'files.zip';
                var m = cd.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
                if (m) { try { name = decodeURIComponent(m[1].replace(/"/g, '')); } catch (e) { name = m[1]; } }
                return r.blob().then(function (blob) {
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url; a.download = name;
                    document.body.appendChild(a); a.click(); a.remove();
                    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
                });
            })
            .catch(function (e) { GW.toast(e.message || '打包下载失败', 'error'); });
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
        } else {
            load(state.page);
        }
    }

    window.GWModules.records = { init: init };
})();
