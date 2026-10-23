/* ============================================================
   Gateway 集成管理面板 —— 公共前端层（window.GW）
   - 统一的 JSON API 调用（自动带 CSRF、统一错误处理）
   - toast / confirm / 分页 / 浮窗 / 灯箱 等通用交互
   - 各 Tab 模块注册于 window.GWModules，按需懒加载
   ============================================================ */
(function () {
    'use strict';

    var body = document.body;
    // 网关前缀仅在当前地址确实以其开头时才拼接（与 gateway.html 的 apiPath 约定一致），
    // 这样无论经 fnOS 统一网关（/app/file-collector/...）还是本地直连都能正确访问接口。
    function effectivePrefix() {
        var p = body.dataset.gatewayPrefix || '';
        if (p && window.location.pathname.indexOf(p) === 0) return p;
        return '';
    }
    var PREFIX = effectivePrefix();
    var GW = {
        base: PREFIX,
        csrf: body.dataset.csrfToken || '',
        isAdmin: body.dataset.isFnAdmin === '1',
        apiBase: PREFIX + '/gateway/admin/api',
        version: (body.dataset.version || '')
    };

    /* ---------- API ---------- */
    // opts: { method, json, form, raw, headers, timeout(ms), retry(n) }
    GW.api = function (path, opts) {
        opts = opts || {};
        var retries = (opts.retry !== undefined && opts.retry >= 0) ? opts.retry : 0;
        function call() {
            var init = { method: opts.method || 'GET', headers: {} };
            if (GW.csrf) init.headers['X-CSRFToken'] = GW.csrf;
            if (opts.json !== undefined) {
                init.headers['Content-Type'] = 'application/json';
                init.body = JSON.stringify(opts.json);
            } else if (opts.form !== undefined) {
                init.body = opts.form; // FormData
            }
            if (opts.headers) {
                for (var k in opts.headers) {
                    if (Object.prototype.hasOwnProperty.call(opts.headers, k)) init.headers[k] = opts.headers[k];
                }
            }
            var timeoutMs = (opts.timeout !== undefined && opts.timeout > 0) ? opts.timeout : 0;
            var t = null;
            if (timeoutMs > 0 && typeof AbortController !== 'undefined') {
                var ac = new AbortController();
                init.signal = ac.signal;
                t = setTimeout(function () { try { ac.abort(); } catch (e) {} }, timeoutMs);
            }
            return fetch(GW.apiBase + path, init).then(function (r) {
                if (t) clearTimeout(t);
                if (opts.raw) return r;
                return r.json().catch(function () { return {}; }).then(function (data) {
                    if (!r.ok || data.ok === false) {
                        var msg = (data && data.message) || ('请求失败 (' + r.status + ')');
                        var err = new Error(msg);
                        err.status = r.status;
                        err.data = data;
                        throw err;
                    }
                    return data;
                });
            }).catch(function (err) {
                if (t) clearTimeout(t);
                // 网络异常/超时：统一转成中文提示
                var name = (err && err.name) || '';
                if (name === 'AbortError' || err && (err.message === 'The operation was aborted' || /abort/i.test(err.message))) {
                    var e2 = new Error('请求超时，请稍后重试');
                    e2.status = 408;
                    throw e2;
                }
                if (err instanceof TypeError || /Failed to fetch/i.test(err.message)) {
                    var e3 = new Error('网络连接失败，请检查网络后重试');
                    e3.status = 0;
                    throw e3;
                }
                throw err;
            });
        }
        function attempt(n) {
            return call().catch(function (err) {
                if (n > 0) {
                    // 仅对网络/超时类错误重试（避免重复写操作导致副作用）
                    var isNetErr = err.status === 0 || err.status === 408;
                    if (isNetErr) return attempt(n - 1);
                }
                throw err;
            });
        }
        return attempt(retries);
    };

    /* ---------- 通用格式化 ---------- */
    GW.escapeHtml = function (s) {
        if (s === null || s === undefined) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    GW.escapeAttr = GW.escapeHtml;

    GW.fmtSize = function (bytes) {
        var n = Number(bytes);
        if (!isFinite(n) || n < 0) return '-';
        if (n < 1024) return n + ' B';
        var units = ['KB', 'MB', 'GB', 'TB'];
        var i = -1;
        do { n = n / 1024; i++; } while (n >= 1024 && i < units.length - 1);
        return (n >= 100 ? n.toFixed(0) : n.toFixed(n >= 10 ? 1 : 2)) + ' ' + units[i];
    };

    GW.fmtTime = function (t) {
        if (!t) return '-';
        return String(t);
    };

    /* ---------- toast ---------- */
    GW.toast = function (msg, type) {
        var wrap = document.querySelector('.gwa-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'gwa-toast-wrap';
            document.body.appendChild(wrap);
        }
        var t = document.createElement('div');
        t.className = 'gwa-toast' + (type ? ' gwa-toast-' + type : '');
        t.textContent = msg;
        wrap.appendChild(t);
        setTimeout(function () { t.remove(); }, 2600);
    };

    /* ---------- confirm（Promise<boolean>） ---------- */
    GW.confirm = function (message, opts) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'gwa-overlay';
            overlay.innerHTML =
                '<div class="gwa-modal" style="max-width:380px">' +
                '<div class="gwa-modal-body" style="font-size:14px;line-height:1.7"></div>' +
                '<div class="gwa-modal-foot">' +
                '<button type="button" class="btn btn-default btn-sm" data-act="cancel">取消</button>' +
                (opts.extraText ? '<button type="button" class="btn btn-default btn-sm" data-act="extra">' + opts.extraText + '</button>' : '') +
                '<button type="button" class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + ' btn-sm" data-act="ok">' +
                (opts.okText || '确定') + '</button>' +
                '</div></div>';
            overlay.querySelector('.gwa-modal-body').textContent = message;
            function done(v) {
                overlay.remove();
                document.removeEventListener('keydown', onKey);
                resolve(v);
            }
            function onKey(e) {
                if (e.key === 'Escape') done(false);
            }
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { done(false); return; }
                var act = e.target.getAttribute && e.target.getAttribute('data-act');
                if (act === 'ok') done(true);
                else if (act === 'extra') done('extra');
                else if (act === 'cancel') done(false);
            });
            document.addEventListener('keydown', onKey);
            document.body.appendChild(overlay);
        });
    };

    /* ---------- 模态框 ---------- */
    // 返回 { el, close }
    GW.modal = function (opts) {
        opts = opts || {};
        var overlay = document.createElement('div');
        overlay.className = 'gwa-overlay';
        overlay.innerHTML =
            '<div class="gwa-modal">' +
            '<div class="gwa-modal-head"><span class="gwa-modal-title"></span>' +
            '<button type="button" class="gwa-modal-close" aria-label="关闭">&times;</button></div>' +
            '<div class="gwa-modal-body"></div>' +
            '<div class="gwa-modal-foot"></div>' +
            '</div>';
        overlay.querySelector('.gwa-modal-title').textContent = opts.title || '';
        var bodyEl = overlay.querySelector('.gwa-modal-body');
        var footEl = overlay.querySelector('.gwa-modal-foot');
        if (opts.bodyHtml !== undefined) bodyEl.innerHTML = opts.bodyHtml;
        if (opts.width) overlay.querySelector('.gwa-modal').style.maxWidth = opts.width;
        if (opts.className) overlay.querySelector('.gwa-modal').classList.add(opts.className);
        if (opts.footerHtml !== undefined) footEl.innerHTML = opts.footerHtml;
        function close() { overlay.remove(); document.removeEventListener('keydown', onKey); }
        function onKey(e) { if (e.key === 'Escape') close(); }
        overlay.addEventListener('click', function (e) { if (e.target === overlay && opts.maskClose !== false) close(); });
        overlay.querySelector('.gwa-modal-close').addEventListener('click', close);
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        // 供外部统一关闭（如切换 Tab 时清理残留弹层）
        overlay._close = close;
        return { el: overlay, body: bodyEl, footer: footEl, close: close };
    };

    /* 关闭页面上所有模态（switchSection 切 Tab 时调用，避免弹层跨 Tab 残留） */
    GW.closeModal = function () {
        document.querySelectorAll('.gwa-overlay').forEach(function (ov) {
            if (ov._close) { ov._close(); } else { ov.remove(); }
        });
    };

    /* 关闭灯箱（同上） */
    GW.closeLightbox = function () {
        document.querySelectorAll('.gwa-lightbox').forEach(function (lb) { lb.remove(); });
    };

    /* ---------- 内嵌预览浮窗（txt 等，避免开新窗口割裂） ---------- */
    GW.previewModal = function (url, title) {
        return GW.modal({
            title: title || '预览',
            className: 'gwa-modal-preview',
            bodyHtml: '<iframe class="gwa-preview-frame" src="' + GW.escapeAttr(url) +
                '" title="文件预览"></iframe>'
        });
    };

    /* ---------- 记录浮窗（上传 / 下载日志，内嵌表格 + 分页） ---------- */
    // opts: { title, url, headers|headers(data), rowFn(row, data), emptyHtml, width, perPage }
    GW.logsModal = function (opts) {
        opts = opts || {};
        var perPage = opts.perPage || 20;
        var state = { page: 1, totalPages: 1 };
        var m = GW.modal({
            title: opts.title || '记录',
            width: opts.width || '760px',
            bodyHtml: '<div class="gwa-logs-modal"></div>'
        });
        var box = m.body.querySelector('.gwa-logs-modal');

        function load(page) {
            if (page) state.page = page;
            box.innerHTML = '<div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div>';
            var sep = opts.url.indexOf('?') >= 0 ? '&' : '?';
            GW.api(opts.url + sep + 'page=' + state.page + '&per_page=' + perPage)
                .then(function (data) {
                    state.page = data.page || 1;
                    state.totalPages = data.total_pages || 1;
                    var logs = data.logs || [];
                    var total = data.total || logs.length;
                    var headers = typeof opts.headers === 'function' ? opts.headers(data) : (opts.headers || '');
                    var html = '<div class="gwa-toolbar"><div class="gwa-toolbar-left">' +
                        '<span class="gwa-muted">共 ' + total + ' 条</span></div></div>';
                    if (!logs.length) {
                        html += '<div class="gwa-empty">' + (opts.emptyHtml || '暂无记录') + '</div>';
                    } else {
                        html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>' +
                            headers + '</tr></thead><tbody>' +
                            logs.map(function (row) { return opts.rowFn(row, data); }).join('') +
                            '</tbody></table></div>';
                    }
                    html += '<div class="gwa-pager"></div>';
                    box.innerHTML = html;
                    GW.renderPager(box.querySelector('.gwa-pager'), state.page, state.totalPages, load);
                })
                .catch(function (err) {
                    box.innerHTML = '<div class="gwa-empty">加载失败：' +
                        GW.escapeHtml(err.message || '未知错误') + '</div>';
                });
        }
        load(1);
        return m;
    };

    // 文件下载记录浮窗
    GW.downloadLogsModal = function (record) {
        var esc = GW.escapeHtml;
        return GW.logsModal({
            title: '下载记录 · ' + (record.original_name || ''),
            url: '/records/' + encodeURIComponent(record.id) + '/download-logs',
            headers: '<th style="width:40px">#</th>' +
                '<th style="width:160px">下载时间</th>' +
                '<th style="width:110px">来源</th>' +
                '<th style="width:130px">下载者 IP</th><th>User-Agent</th>',
            rowFn: function (r) {
                return '<tr>' +
                    '<td data-label="#" class="gwa-muted">' + esc(r.id) + '</td>' +
                    '<td data-label="下载时间" class="gwa-muted gwa-nowrap">' + esc(r.time) + '</td>' +
                    '<td data-label="来源" class="gwa-nowrap">' + esc(r.source_label) + '</td>' +
                    '<td data-label="下载者 IP" class="gwa-muted gwa-nowrap">' + esc(r.ip) + '</td>' +
                    '<td data-label="User-Agent" class="gwa-muted"><span class="gwa-ellipsis" title="' +
                        esc(r.user_agent) + '">' + esc(r.user_agent) + '</span></td>' +
                    '</tr>';
            },
            emptyHtml: '暂无下载记录<br><span class="gwa-muted">下载记录将在此处显示</span>'
        });
    };

    // 收集链接上传记录浮窗
    GW.uploadLogsModal = function (link) {
        var esc = GW.escapeHtml;
        return GW.logsModal({
            title: '上传记录 · ' + (link.title || ''),
            url: '/links/' + encodeURIComponent(link.id) + '/upload-logs',
            headers: function (data) {
                return '<th style="width:40px">#</th>' +
                    '<th style="width:160px">事件时间</th>' +
                    '<th style="width:120px">事件</th><th>详情</th>' +
                    (data.require_uploader ? '<th style="width:110px">上传者</th>' : '') +
                    '<th style="width:130px">上传者 IP</th><th style="width:70px">结果</th>';
            },
            rowFn: function (r, data) {
                return '<tr>' +
                    '<td data-label="#" class="gwa-muted">' + esc(r.id) + '</td>' +
                    '<td data-label="事件时间" class="gwa-muted gwa-nowrap">' + esc(r.time) + '</td>' +
                    '<td data-label="事件" class="gwa-nowrap">' + esc(r.event_label) + '</td>' +
                    '<td data-label="详情">' + esc(r.detail) + '</td>' +
                    (data.require_uploader ? '<td data-label="上传者">' + esc(r.uploader_name || '-') + '</td>' : '') +
                    '<td data-label="上传者 IP" class="gwa-muted gwa-nowrap">' + esc(r.ip) + '</td>' +
                    '<td data-label="结果" class="gwa-nowrap">' + (r.success
                        ? '<span class="gwa-badge gwa-badge-ok">成功</span>'
                        : '<span class="gwa-badge gwa-badge-danger">失败</span>') + '</td>' +
                    '</tr>';
            },
            emptyHtml: '暂无上传记录<br><span class="gwa-muted">上传记录将在此处显示</span>'
        });
    };

    /* ---------- 浮窗（屏幕居中 + 毛玻璃背景遮罩） ---------- */
    GW.popover = function (anchorEl, html) {
        GW.closePopover();
        // 背景遮罩：压暗 + 模糊页面其余内容，让浮窗成为第一视觉层级（PC/移动统一）
        var scrim = document.createElement('div');
        scrim.className = 'gwa-scrim';
        document.body.appendChild(scrim);
        requestAnimationFrame(function () { scrim.classList.add('is-show'); });
        var pop = document.createElement('div');
        pop.className = 'gwa-popover';
        pop.innerHTML = '<button type="button" class="gwa-popover-close" aria-label="关闭">&times;</button>' + html;
        pop.querySelector('.gwa-popover-close').addEventListener('click', GW.closePopover);
        document.body.appendChild(pop);
        // 屏幕居中弹窗：位置由 CSS（.gwa-popover，fixed + translate）控制，不再按锚点定位
        setTimeout(function () {
            document.addEventListener('click', onDocClick);
            document.addEventListener('keydown', onKey);
        }, 0);
        // 防抖：若浮窗已被关闭（例如快速连续点击），残留的监听器不应再去关闭
        // 之后新建的浮窗——否则会误关闭当前浮窗。
        function detach() {
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onKey);
        }
        function onDocClick(e) {
            if (!pop.isConnected) { detach(); return; }
            if (!pop.contains(e.target) && e.target !== anchorEl) GW.closePopover();
        }
        function onKey(e) {
            if (!pop.isConnected) { detach(); return; }
            if (e.key === 'Escape') GW.closePopover();
        }
        pop._cleanup = detach;
    };

    GW.closePopover = function () {
        var ex = document.querySelector('.gwa-popover');
        if (ex) { if (ex._cleanup) ex._cleanup(); ex.remove(); }
        var scrim = document.querySelector('.gwa-scrim');
        if (scrim) {
            scrim.classList.remove('is-show');
            setTimeout(function () { scrim.remove(); }, 200);
        }
    };

    /* ---------- 灯箱 ---------- */
    GW.lightbox = function (url) {
        var box = document.createElement('div');
        box.className = 'gwa-lightbox';
        box.innerHTML = '<button type="button" class="gwa-lightbox-close" aria-label="关闭">&times;</button><img alt="">';
        var img = box.querySelector('img');
        img.src = url;
        box.addEventListener('click', function (e) {
            if (e.target === box || e.target.classList.contains('gwa-lightbox-close')) box.remove();
        });
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', onKey); }
        });
        document.body.appendChild(box);
    };

    /* ---------- 分页控件 ---------- */
    // 渲染到容器，onGo(page) 回调
    GW.renderPager = function (container, page, totalPages, onGo) {
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        container.innerHTML =
            '<button type="button" class="btn btn-default btn-sm" data-go="prev"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>' +
            '<span class="gwa-pager-info">第 ' + page + ' / ' + totalPages + ' 页</span>' +
            '<button type="button" class="btn btn-default btn-sm" data-go="next"' + (page >= totalPages ? ' disabled' : '') + '>下一页</button>';
        container.querySelectorAll('[data-go]').forEach(function (b) {
            b.addEventListener('click', function () {
                var d = b.getAttribute('data-go');
                if (d === 'prev' && page > 1) onGo(page - 1);
                else if (d === 'next' && page < totalPages) onGo(page + 1);
            });
        });
    };

    /* ---------- 复制到剪贴板 ---------- */
    // 注意：非安全上下文（http 局域网地址）或文档未聚焦时，
    // navigator.clipboard.writeText 会抛 NotAllowedError；
    // 必须 catch 并回退到 textarea + execCommand，否则复制会静默失效（无提示、无动作）。
    GW.copy = function (text) {
        function fallbackCopy() {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                ta.setSelectionRange(0, ta.value.length);
                var ok = document.execCommand('copy');
                document.body.removeChild(ta);
                GW.toast(ok ? '已复制' : '复制失败，请手动复制', ok ? 'success' : 'error');
                return ok;
            } catch (e) {
                GW.toast('复制失败，请手动复制', 'error');
                return false;
            }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(function () {
                GW.toast('已复制', 'success');
            }, function () {
                fallbackCopy();
            });
        }
        fallbackCopy();
        return Promise.resolve();
    };

    /* ---------- 触发下载（POST JSON/form -> blob；或 GET 直链） ---------- */
    // opts: { method, json, form, filename, url(完整地址，给定则不拼 apiBase), timeout(ms) }
    // 下载不做自动重试（非幂等且耗流量），仅做超时保护 + 中文网络报错；
    // 默认 5 分钟，避免打包/备份等大文件下载被过早中断（传 timeout: 0 可关闭）。
    GW.downloadBlob = function (path, opts) {
        opts = opts || {};
        var init = { method: opts.method || 'POST', headers: {} };
        if (GW.csrf) init.headers['X-CSRFToken'] = GW.csrf;
        if (opts.json !== undefined) {
            init.headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(opts.json);
        } else if (opts.form !== undefined) {
            init.body = opts.form;
        }
        var timeoutMs = (opts.timeout !== undefined) ? opts.timeout : 300000;
        var timer = null;
        if (timeoutMs > 0 && typeof AbortController !== 'undefined') {
            var ac = new AbortController();
            init.signal = ac.signal;
            timer = setTimeout(function () { try { ac.abort(); } catch (e) {} }, timeoutMs);
        }
        var url = opts.url || (GW.apiBase + path);
        function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
        return fetch(url, init).then(function (r) {
            clearTimer();
            if (!r.ok) {
                // 后端失败时通常返回纯文本原因（如「选中的文件均无法打包…」），
                // 直接透出比「下载失败 (400)」有用得多；HTML 错误页则退化为状态码。
                return r.text().then(function (t) {
                    var msg = String(t || '').trim();
                    if (!msg || msg.charAt(0) === '<') msg = '下载失败 (' + r.status + ')';
                    else if (msg.length > 200) msg = msg.slice(0, 200) + '…';
                    throw new Error(msg);
                }, function () {
                    throw new Error('下载失败 (' + r.status + ')');
                });
            }
            // 后端用响应头回传「被跳过」的文件数量/名单，便于提示压缩包不完整
            var skipped = parseInt(r.headers.get('X-FC-Skipped') || '0', 10) || 0;
            var skippedNames = [];
            var rawSkipped = r.headers.get('X-FC-Skipped-Files') || '';
            if (rawSkipped) {
                try { skippedNames = decodeURIComponent(rawSkipped).split(',').filter(Boolean); } catch (e) { skippedNames = []; }
            }
            var cd = r.headers.get('Content-Disposition') || '';
            var name = opts.filename || 'download';
            // 优先 RFC 5987 扩展名（filename*=UTF-8''编码中文），否则会先匹配到
            // Werkzeug 对中文给出的 ASCII 降级名（filename=_.zip）导致「_.zip」
            var m = cd.match(/filename\*=utf-8''([^;\n]+)/i) ||
                    cd.match(/filename\s*=\s*"([^"\n]+)"/) ||
                    cd.match(/filename\s*=\s*([^";\n]+)/i);
            if (m) {
                try { name = decodeURIComponent(m[1]); } catch (e) { name = m[1]; }
            }
            return r.blob().then(function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
                return { skipped: skipped, skippedNames: skippedNames };
            });
        }).catch(function (err) {
            clearTimer();
            var name = (err && err.name) || '';
            if (name === 'AbortError' || (err && /abort/i.test(err.message || ''))) {
                throw new Error('下载超时，请稍后重试');
            }
            if (err instanceof TypeError || /Failed to fetch/i.test(err.message || '')) {
                throw new Error('网络连接失败，请检查网络后重试');
            }
            throw err;
        });
    };

    /* ---------- Tab 懒加载 ---------- */
    window.GWModules = window.GWModules || {};
    GW.ensureSection = function (name) {
        var mod = window.GWModules[name];
        if (mod && typeof mod.init === 'function') {
            try { mod.init(); } catch (e) { console.error('[GW] 模块初始化失败: ' + name, e); }
            return;
        }
        // 尚未实现：显示占位空态
        var panel = document.querySelector('[data-gwa-panel="' + name + '"]');
        if (panel && !panel.dataset.ready) {
            panel.innerHTML = '<div class="gwa-empty">该功能正在建设中…</div>';
            panel.dataset.ready = '1';
        }
    };

    /* ---------- 触发下载（隐藏 iframe，避免把当前面板导航走） ---------- */
    // 即使后端响应是 302 跳转页，也只发生在不可见 iframe 内，用户当前页面不受影响。
    GW.triggerDownload = function (url) {
        var f = document.createElement('iframe');
        f.setAttribute('aria-hidden', 'true');
        f.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0;visibility:hidden;';
        document.body.appendChild(f);
        f.src = url;
        setTimeout(function () {
            if (f.parentNode) f.parentNode.removeChild(f);
        }, 120000);
    };

    /* ---------- 文件选择器 ---------- */
    // 统一的美化版文件选择控件：原生 input[type=file] 视觉隐藏，
    // 按钮与文件名由 .gwa-file-picker 样式呈现；表单序列化（FormData）不受影响。
    GW.filePicker = function (name, attrs) {
        return '<label class="gwa-file-picker">' +
            '<input type="file" name="' + GW.escapeAttr(name) + '"' + (attrs ? ' ' + attrs : '') + '>' +
            '<span class="gwa-file-btn">选择文件</span>' +
            '<span class="gwa-file-name">未选择文件</span>' +
            '</label>';
    };

    // 全局委托：文件名变化时同步显示（面板内容为动态渲染，需事件委托）
    document.addEventListener('change', function (e) {
        var input = e.target;
        if (!input || input.type !== 'file') return;
        var wrap = input.closest('.gwa-file-picker');
        if (!wrap) return;
        var nameEl = wrap.querySelector('.gwa-file-name');
        if (!nameEl) return;
        var f = input.files && input.files[0];
        nameEl.textContent = f ? f.name : '未选择文件';
        nameEl.classList.toggle('gwa-has-file', !!f);
    });

    window.GW = GW;
})();
