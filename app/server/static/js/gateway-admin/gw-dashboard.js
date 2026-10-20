/* ============================================================
   信息面板（dashboard）模块
   - 图标化统计卡（四张：收集链接/活跃链接/上传总数/今日上传）
   - 快捷操作格（创建收集直弹表单，其余跳对应分区）
   - 最近上传（按 stored_name 的相对目录聚合，规则与文件记录页一致）
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

    /* ---------- 图标库（feather 线性风格，与侧栏/更多抽屉同一族） ---------- */
    function svg(inner, sw) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) +
            '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    }

    var ICON = {
        link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
            '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
        activity: svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
        upload: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
            '<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
        calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/>' +
            '<line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>' +
            '<line x1="3" y1="10" x2="21" y2="10"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>', 2.4),
        file: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
            '<polyline points="14 2 14 8 20 8"/>' +
            '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        gear: svg('<circle cx="12" cy="12" r="3"/>' +
            '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
        book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
            '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
        terminal: svg('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'),
        users: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
            '<circle cx="9" cy="7" r="4"/>' +
            '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
        zap: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>')
    };

    /* ---------- 文件夹聚合（与「文件记录」页同一套规则） ----------
       判据必须用 stored_name（相对上传目录的路径，如 fsdownload/main.log），
       绝不能拿 stored_dir（绝对文件系统路径）当目录键——后者只在「点击文件名
       打开飞牛文件管理器」时使用，送给 records 的 dir 参数永远查不到数据。

       与后端 record_dirs.aggregate_folders 保持一致：
         * 根目录（stored_name 无 '/'）的散文件不聚合，各自成行；
         * _attachment/ 前缀同样平铺，不生成文件夹；
         * 同一相对目录出现 ≥2 个文件才折叠为文件夹行，聚合后的 data-dir
           为该相对目录，点击走 openDir（与记录页点文件夹行完全一致）。 */
    var ICON_FOLDER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
    var ICON_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

    var ATTACH_PREFIX = '_attachment/';

    /* 由 stored_name 取「直接所在目录」的相对路径：
       根目录返回 ''，_attachment 下的文件按根目录散文件处理（返回 ''），
       否则返回其 dirname（如 'fsdownload' 或 'a/b'）。 */
    function relDirOf(r) {
        var s = String(r.stored_name || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        if (!s || s.indexOf('/') < 0) return '';
        if (s.indexOf(ATTACH_PREFIX) === 0) return '';
        var i = s.lastIndexOf('/');
        return i > 0 ? s.slice(0, i) : '';
    }

    function groupItems() {
        var folders = {};
        var order = [];
        recent.forEach(function (r) {
            var dir = relDirOf(r);
            if (!dir) return;   // 根目录散文件 / 附件：不参与聚合
            if (!folders[dir]) {
                folders[dir] = { dir: dir, count: 0, size: 0, latest: '' };
                order.push(dir);
            }
            var f = folders[dir];
            f.count += 1;
            f.size += (r.file_size || 0);
            var t = String(r.uploaded_at || '');
            if (!f.latest || t > f.latest) f.latest = t;
        });
        var items = order
            .filter(function (d) { return folders[d].count >= 2; })
            .map(function (d) { return { time: folders[d].latest, isFolder: true, v: folders[d] }; });
        recent.forEach(function (r) {
            // 已被聚合的目录成员不再单独出文件行；单文件目录/根目录保持文件行
            var dir = relDirOf(r);
            if (dir && folders[dir] && folders[dir].count >= 2) return;
            items.push({ time: String(r.uploaded_at || ''), isFolder: false, v: r });
        });
        items.sort(function (a, b) {
            if (a.time === b.time) return a.isFolder ? -1 : 1;
            return a.time < b.time ? 1 : -1;
        });
        return items;
    }

    function folderRowHtml(f) {
        // data-dir 为相对上传目录（与记录页面包屑/文件夹行同源），openDir 才能命中
        var parts = String(f.dir || '').split('/').filter(function (s) { return s; });
        var name = parts.length ? parts[parts.length - 1] : f.dir;
        return '<tr class="gwa-folder-row" data-dir="' + esc(f.dir) + '" tabindex="0"' +
            ' title="在文件记录中打开 ' + esc(f.dir) + '">' +
            '<td colspan="5">' +
            '<span class="gwa-folder-icon" aria-hidden="true">' + ICON_FOLDER + '</span>' +
            '<span class="gwa-folder-name">' + esc(name) + '</span>' +
            '<span class="gwa-folder-chevron" aria-hidden="true">' + ICON_CHEVRON + '</span>' +
            '<span class="gwa-folder-meta">' + f.count + ' 个文件' +
            (f.size > 0 ? '<span class="cp-meta-size">' + esc(GW.fmtSize(f.size)) + '</span>' : '') +
            '</span></td></tr>';
    }


    function statCard(icon, value, label, tint) {
        // 图标色片（tint）+ 右侧数值/标签：PC 四列、窄屏两列（见 gateway-admin.css）
        return '<div class="gwa-stat gwa-tint-' + tint + '">' +
            '<span class="gwa-stat-ico" aria-hidden="true">' + icon + '</span>' +
            '<div class="gwa-stat-body">' +
            '<div class="gwa-stat-value">' + esc(value) + '</div>' +
            '<div class="gwa-stat-label">' + esc(label) + '</div>' +
            '</div></div>';
    }

    /* 快捷操作：首项直接弹出创建表单，其余跳对应分区；
       日志/用户管理仅飞牛管理员可见（与侧栏、更多抽屉的可见性保持一致） */
    function quickItems() {
        var items = [
            { act: 'create', label: '创建收集', icon: ICON.plus, tint: 'blue' },
            { act: 'records', label: '文件记录', icon: ICON.file, tint: 'violet' },
            { act: 'settings', label: '收集设置', icon: ICON.gear, tint: 'green' },
            { act: 'manual', label: '使用说明', icon: ICON.book, tint: 'orange' }
        ];
        if (document.body.getAttribute('data-is-fn-admin') === '1') {
            items.push({ act: 'logs', label: '实时日志', icon: ICON.terminal, tint: 'red' });
            items.push({ act: 'users', label: '用户管理', icon: ICON.users, tint: 'blue' });
        }
        return items;
    }

    function quickGridHtml() {
        return '<div class="gwa-card">' +
            '<div class="gwa-card-title gwa-card-title--ico">' + ICON.zap + '快捷操作</div>' +
            '<div class="gwa-quick-grid">' + quickItems().map(function (q) {
                return '<button type="button" class="gwa-quick gwa-tint-' + q.tint + '" data-act="' + q.act + '">' +
                    '<span class="gwa-quick-ico" aria-hidden="true">' + q.icon + '</span>' +
                    '<span class="gwa-quick-label">' + esc(q.label) + '</span></button>';
            }).join('') + '</div></div>';
    }

    function rowHtml(r) {
        // 文件名单元格：有存储目录时改为可点击按钮，与「文件记录」页一致——
        // 点击直接打开飞牛文件管理器并定位到文件所在目录
        var nameTd;
        if (r.stored_dir) {
            nameTd = '<td data-label="文件名">' +
                '<button type="button" class="gwa-rec-name gwa-ellipsis gwa-file-open" data-act="open-dir"' +
                ' data-dir="' + esc(r.stored_dir) + '"' +
                ' data-path="' + esc(r.stored_path || '') + '"' +
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
        if (r.stored_dir) {
            // 明确的「打开所在目录」入口（SDK 在 Web 端无法定位路径时的兜底）
            footer += '<button type="button" class="btn btn-default btn-sm" data-act="open-dir">打开所在目录</button>';
        }
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
            } else if (act === 'open-dir') {
                m.close();
                if (window.openFileManagerDir) { window.openFileManagerDir(r.stored_dir, r.stored_path || ''); }
                else { GW.toast('无法调用飞牛文件管理器，请在飞牛客户端中打开本页面。', 'error'); }
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
        function enterFolder(folderRow) {
            // 与「文件记录」页点文件夹行完全一致：进入记录页并直达该相对目录
            var dir = folderRow.getAttribute('data-dir') || '';
            if (window.GWModules.records && window.GWModules.records.openDir) {
                window.GWModules.records.openDir(dir);
            } else if (window.switchSection) {
                window.switchSection('records');
            }
        }
        panel.addEventListener('click', function (e) {
            var folderRow = e.target.closest('.gwa-folder-row');
            if (folderRow) { enterFolder(folderRow); return; }
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'goto-records') {
                if (window.switchSection) window.switchSection('records');
            } else if (act === 'create') {
                // 先切到收集链接（会顺带初始化列表并关闭既有弹层），再弹创建表单
                if (window.switchSection) window.switchSection('links');
                if (window.GWModules && window.GWModules.links && window.GWModules.links.openCreate) {
                    window.GWModules.links.openCreate();
                }
            } else if (['records', 'settings', 'manual', 'logs', 'users'].indexOf(act) >= 0) {
                if (window.switchSection) window.switchSection(act);
            } else if (act === 'detail') {
                var id = parseInt(btn.getAttribute('data-id'), 10);
                var r = recent.filter(function (x) { return x.id === id; })[0];
                if (r) openDetail(r);
            } else if (act === 'open-dir') {
                var dir = btn.getAttribute('data-dir') || '';
                var fpath = btn.getAttribute('data-path') || '';
                if (window.openFileManagerDir) { window.openFileManagerDir(dir, fpath); }
                else { GW.toast('无法调用飞牛文件管理器，请在飞牛客户端中打开本页面。', 'error'); }
            }
        });
        // 文件夹行支持键盘进入（与记录页一致：Enter / 空格）
        panel.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var folderRow = e.target.closest('.gwa-folder-row');
            if (!folderRow) return;
            e.preventDefault();
            enterFolder(folderRow);
        });
    }

    var stats = { total_links: 0, active_links: 0, total_uploads: 0, today_uploads: 0 };

    function renderStats() {
        var panel = document.querySelector('[data-gwa-panel="dashboard"]');
        if (!panel) return;
        var html = '';
        html += '<div class="gwa-stats">';
        html += statCard(ICON.link, stats.total_links, '收集链接', 'blue');
        html += statCard(ICON.activity, stats.active_links, '活跃链接', 'green');
        html += statCard(ICON.upload, stats.total_uploads, '上传总数', 'violet');
        html += statCard(ICON.calendar, stats.today_uploads, '今日上传', 'orange');
        html += '</div>';

        html += quickGridHtml();

        html += '<div class="gwa-card">';
        html += '<div class="gwa-row-between">';
        html += '<div class="gwa-card-title gwa-card-title--ico">' + ICON.upload + '最近上传</div>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="goto-records">查看全部</button>';
        html += '</div>';
        if (!recent.length) {
            html += '<div class="gwa-empty">暂无上传记录<br><span class="gwa-muted">创建收集链接后，用户上传的文件会在此显示</span></div>';
        } else {
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th>文件名</th><th>来源</th><th>大小</th><th>时间</th><th style="text-align:right;">操作</th>';
            html += '</tr></thead><tbody>' + groupItems().map(function (it) {
                return it.isFolder ? folderRowHtml(it.v) : rowHtml(it.v);
            }).join('') + '</tbody></table></div>';
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
