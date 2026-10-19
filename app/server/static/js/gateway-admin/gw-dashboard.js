/* ============================================================
   信息面板（dashboard）模块
   - 统计卡片 + 最近上传
   - 预览/下载复用既有 /admin/records/* 端点（经网关前缀）
   - 删除走新 JSON 接口
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;

    window.GWModules = window.GWModules || {};

    var inited = false;
    var recent = [];

    function esc(s) { return GW.escapeHtml(s); }

    function fmtTime(t) {
        if (!t) return '-';
        return String(t).replace(/\.\d+/, '');
    }

    function base() { return GW.base || ''; }

    function statCard(value, label, accent) {
        return '<div class="gwa-stat">' +
            '<div class="gwa-stat-value' + (accent ? ' gwa-accent' : '') + '">' + esc(value) + '</div>' +
            '<div class="gwa-stat-label">' + esc(label) + '</div>' +
            '</div>';
    }

    function rowHtml(r) {
        // 文件名单元格：有存储目录时改为可点击按钮，与「文件记录」页一致——
        // 点击直接打开飞牛文件管理器并定位到文件所在目录
        var nameTd;
        if (r.stored_dir) {
            nameTd = '<td data-label="文件名">' +
                '<button type="button" class="gwa-rec-name gwa-ellipsis gwa-file-open" data-act="open-dir"' +
                ' data-dir="' + esc(r.stored_dir) + '"' +
                ' title="点击打开文件所在目录：' + esc(r.stored_dir) + '">' +
                esc(r.original_name) + '</button></td>';
        } else {
            nameTd = '<td data-label="文件名"><span class="gwa-ellipsis" title="' + esc(r.original_name) + '">' + esc(r.original_name) + '</span></td>';
        }
        return '<tr>' +
            nameTd +
            '<td data-label="来源" class="gwa-muted">' + esc(r.source) + '</td>' +
            '<td data-label="大小" class="gwa-nowrap">' + esc(r.file_size_display) + '</td>' +
            '<td data-label="时间" class="gwa-nowrap gwa-muted">' + esc(fmtTime(r.uploaded_at)) + '</td>' +
            '<td data-label="操作" class="gwa-col-actions">' +
            '<button type="button" class="btn btn-default btn-sm" data-act="detail" data-id="' + r.id + '">操作</button>' +
            '</td>' +
            '</tr>';
    }

    function previewUrl(r) {
        var ext = (r.ext || '').toLowerCase();
        var id = r.id;
        var b = base();
        if (ext === 'pdf') return b + '/office?type=a&rid=' + id + '&fn=' + encodeURIComponent(r.original_name);
        if (ext === 'txt') return b + '/txt?type=a&rid=' + id + '&fn=' + encodeURIComponent(r.original_name);
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].indexOf(ext) >= 0) {
            return b + '/doc?type=a&rid=' + id + '&fn=' + encodeURIComponent(r.original_name);
        }
        if (r.preview_kind === 'video' || r.preview_kind === 'audio') {
            return b + '/admin/records/' + id + '/preview_file';
        }
        return b + '/admin/records/' + id + '/preview-img';
    }

    function openDetail(r) {
        var id = r.id;
        var b = base();
        var rows = '';
        rows += '<div class="gwa-kv"><span class="k">文件名</span><span class="v">' + esc(r.original_name) + '</span></div>';
        rows += '<div class="gwa-kv"><span class="k">大小</span><span class="v">' + esc(r.file_size_display) + '</span></div>';
        rows += '<div class="gwa-kv"><span class="k">来源</span><span class="v">' + esc(r.source) + '</span></div>';
        rows += '<div class="gwa-kv"><span class="k">创建用户</span><span class="v">' + esc(r.creator) + '</span></div>';
        if (r.require_uploader && r.uploader_name) {
            rows += '<div class="gwa-kv"><span class="k">上传者</span><span class="v">' + esc(r.uploader_name) + '</span></div>';
        }
        rows += '<div class="gwa-kv"><span class="k">IP</span><span class="v">' + esc(r.uploader_ip) + '</span></div>';
        rows += '<div class="gwa-kv"><span class="k">时间</span><span class="v">' + esc(fmtTime(r.uploaded_at)) + '</span></div>';
        rows += '<div class="gwa-kv"><span class="k">下载记录</span><span class="v"><button type="button" class="gwa-link-btn" data-act="logs">查看</button></span></div>';

        var footer = '';
        if (r.previewable) {
            footer += '<button type="button" class="btn btn-default btn-sm" data-act="preview">预览</button>';
        }
        footer += '<button type="button" class="btn btn-default btn-sm" data-act="download">下载</button>';
        footer += '<button type="button" class="btn btn-danger btn-sm" data-act="delete">删除</button>';

        var m = GW.modal({ title: '文件详情', bodyHtml: rows, footerHtml: footer, width: '460px' });
        m.footer.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'preview') {
                var url = previewUrl(r);
                if (r.preview_kind === 'image') GW.lightbox(url);
                else if ((r.ext || '').toLowerCase() === 'txt') GW.previewModal(url, r.original_name);
                else window.open(url, '_blank');
            } else if (act === 'download') {
                GW.triggerDownload(b + '/admin/records/' + id + '/download');
            } else if (act === 'delete') {
                m.close();
                doDelete(r);
            }
        });
        // 「下载记录」按钮在模态框主体内（不在 footer）
        m.body.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act="logs"]');
            if (btn) GW.downloadLogsModal(r);
        });
    }

    function doDelete(r) {
        GW.confirm('确定删除「' + r.original_name + '」？此操作不可恢复。', { danger: true, okText: '删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/records/' + r.id + '/delete', { method: 'POST' })
                    .then(function () {
                        GW.toast('已删除', 'success');
                        recent = recent.filter(function (x) { return x.id !== r.id; });
                        renderStats();
                    })
                    .catch(function (err) { GW.toast(err.message || '删除失败', 'error'); });
            });
    }

    function bind(panel) {
        panel.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'goto-records') {
                if (window.switchSection) window.switchSection('records');
            } else if (act === 'detail') {
                var id = parseInt(btn.getAttribute('data-id'), 10);
                var r = recent.filter(function (x) { return x.id === id; })[0];
                if (r) openDetail(r);
            } else if (act === 'open-dir') {
                var dir = btn.getAttribute('data-dir') || '';
                if (window.openFileManagerDir) { window.openFileManagerDir(dir); }
                else { GW.toast('无法调用飞牛文件管理器，请在飞牛客户端中打开本页面。', 'error'); }
            }
        });
    }

    var stats = { total_links: 0, active_links: 0, total_uploads: 0, today_uploads: 0 };

    function renderStats() {
        var panel = document.querySelector('[data-gwa-panel="dashboard"]');
        if (!panel) return;
        var html = '';
        html += '<div class="gwa-stats">';
        html += statCard(stats.total_links, '收集链接');
        html += statCard(stats.active_links, '活跃链接', true);
        html += statCard(stats.total_uploads, '上传总数');
        html += statCard(stats.today_uploads, '今日上传', true);
        html += '</div>';

        html += '<div class="gwa-card">';
        html += '<div class="gwa-row-between" style="margin-bottom:12px;">';
        html += '<div class="gwa-card-title" style="margin:0;">最近上传</div>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="goto-records">查看全部</button>';
        html += '</div>';
        if (!recent.length) {
            html += '<div class="gwa-empty">暂无上传记录<br><span class="gwa-muted">创建收集链接后，用户上传的文件会在此显示</span></div>';
        } else {
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th>文件名</th><th>来源</th><th>大小</th><th>时间</th><th style="text-align:right;">操作</th>';
            html += '</tr></thead><tbody>' + recent.map(rowHtml).join('') + '</tbody></table></div>';
        }
        html += '</div>';
        panel.innerHTML = html;
    }

    function load() {
        var panel = document.querySelector('[data-gwa-panel="dashboard"]');
        if (panel) panel.innerHTML = '<div class="gwa-card"><div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div></div>';
        GW.api('/dashboard').then(function (data) {
            stats = data.stats || stats;
            recent = data.recent || [];
            renderStats();
        }).catch(function (err) {
            if (panel) panel.innerHTML = '<div class="gwa-card"><div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div></div>';
        });
    }

    function init() {
        var panel = document.querySelector('[data-gwa-panel="dashboard"]');
        if (panel && !panel.dataset.bound) {
            bind(panel);
            panel.dataset.bound = '1';
        }
        if (inited) {
            // 再次进入时刷新数据
            load();
            return;
        }
        inited = true;
        load();
    }

    window.GWModules.dashboard = { init: init };
})();
