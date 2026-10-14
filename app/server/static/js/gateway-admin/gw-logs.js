/* ============================================================
   操作日志（logs）模块 —— 「实时日志」页的「操作日志」分段
   - 审计列表：登录 / 建链 / 删链 / 上传 / 下载 / 用户 / 设置等
   - 分类 / 动作筛选 + 关键字搜索 + 分页 + 每页数量
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;
    window.GWModules = window.GWModules || {};

    var esc = GW.escapeHtml;
    var panel = null;
    var state = {
        page: 1, perPage: 50, total: 0, totalPages: 1,
        category: '', action: '', q: '',
        categories: [], actions: [],
        inited: false, searchTimer: null
    };

    /* ---------- 加载 ---------- */
    function load(page) {
        if (page) state.page = page;
        if (!panel) panel = document.querySelector('[data-gwa-panel="logs"]');
        if (!panel) return;
        panel.innerHTML = '<div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div>';
        var qs = '?page=' + state.page + '&per_page=' + state.perPage +
            (state.category ? '&category=' + encodeURIComponent(state.category) : '') +
            (state.action ? '&action=' + encodeURIComponent(state.action) : '') +
            (state.q ? '&q=' + encodeURIComponent(state.q) : '');
        GW.api('/logs/activity' + qs).then(function (data) {
            state.total = data.total || 0;
            state.page = data.page || 1;
            state.totalPages = data.total_pages || 1;
            state.perPage = data.per_page || 50;
            state.categories = data.categories || [];
            state.actions = data.actions || [];
            render(data.logs || []);
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div>';
        });
    }

    /* ---------- 渲染 ---------- */
    function options(list, cur, allLabel) {
        return '<option value="">' + allLabel + '</option>' + (list || []).map(function (o) {
            return '<option value="' + esc(o.value) + '"' + (cur === o.value ? ' selected' : '') + '>' +
                esc(o.label) + '</option>';
        }).join('');
    }

    function rowHtml(l) {
        return '<tr>' +
            '<td data-label="时间" class="gwa-muted gwa-nowrap">' + esc(l.time || '-') + '</td>' +
            '<td data-label="操作者">' + esc(l.user || '（匿名）') + '</td>' +
            '<td data-label="类型" class="gwa-nowrap">' +
                '<span class="gwa-badge gwa-badge-accent">' + esc(l.category_label || '-') + '</span> ' +
                '<span class="gwa-badge">' + esc(l.action_label || '') + '</span>' +
            '</td>' +
            '<td data-label="内容">' + esc(l.detail || '-') + '</td>' +
            '<td data-label="IP" class="gwa-muted gwa-nowrap">' + esc(l.ip || '-') + '</td>' +
            '</tr>';
    }

    function render(logs) {
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<select class="form-select gwa-filter" data-role="category">' +
            options(state.categories, state.category, '全部分类') + '</select>';
        html += '<select class="form-select gwa-filter" data-role="action">' +
            options(state.actions, state.action, '全部动作') + '</select>';
        html += '<input type="search" class="form-input gwa-log-search" data-role="q" ' +
            'placeholder="搜索内容 / 操作者" value="' + esc(state.q) + '">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="refresh">刷新</button>';
        html += '</div>';
        html += '<div class="gwa-toolbar-right"><span class="gwa-muted">共 ' + state.total +
            ' 条 · 第 ' + state.page + '/' + state.totalPages + ' 页</span></div>';
        html += '</div>';

        if (!logs.length) {
            html += '<div class="gwa-empty">暂无操作日志<br>' +
                '<span class="gwa-muted">登录、创建/删除收集链接、上传、下载等操作会记录在这里</span></div>';
        } else {
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th style="width:150px">时间</th><th style="width:120px">操作者</th>' +
                '<th style="width:160px">类型</th><th>内容</th><th style="width:130px">IP</th>';
            html += '</tr></thead><tbody>' + logs.map(rowHtml).join('') + '</tbody></table></div>';
        }

        html += '<div class="gwa-list-foot">';
        html += '<div class="gwa-pager"></div>';
        html += '<div class="gwa-perpage"><label class="gwa-muted">每页显示</label>' +
            '<input type="number" class="form-input gwa-perpage-input" min="10" max="200" step="1" value="' +
            state.perPage + '"><span class="gwa-muted">条</span></div>';
        html += '</div>';

        panel.innerHTML = html;
        bind();
    }

    /* ---------- 事件绑定 ---------- */
    function bind() {
        var cat = panel.querySelector('[data-role="category"]');
        if (cat) cat.addEventListener('change', function () { state.category = cat.value; load(1); });

        var act = panel.querySelector('[data-role="action"]');
        if (act) act.addEventListener('change', function () { state.action = act.value; load(1); });

        var q = panel.querySelector('[data-role="q"]');
        if (q) {
            q.addEventListener('input', function () {
                if (state.searchTimer) clearTimeout(state.searchTimer);
                state.searchTimer = setTimeout(function () {
                    state.q = q.value.trim();
                    load(1);
                }, 350);
            });
        }

        var per = panel.querySelector('.gwa-perpage-input');
        if (per) {
            per.addEventListener('change', function () {
                var val = parseInt(per.value, 10);
                if (isNaN(val) || val < 10 || val > 200) {
                    GW.toast('每页显示需在 10-200 之间', 'error');
                    per.value = state.perPage;
                    return;
                }
                state.perPage = val;
                load(1);
            });
        }

        GW.renderPager(panel.querySelector('.gwa-pager'), state.page, state.totalPages, function (p) { load(p); });
    }

    function onPanelClick(e) {
        var btn = e.target.closest('[data-act]');
        if (btn && btn.getAttribute('data-act') === 'refresh') load(state.page);
    }

    /* ---------- 入口 ---------- */
    function init() {
        panel = document.querySelector('[data-gwa-panel="logs"]');
        if (!panel) return;
        if (!panel.dataset.bound) {
            panel.addEventListener('click', onPanelClick);
            panel.dataset.bound = '1';
        }
        load(state.inited ? state.page : 1);
        state.inited = true;
    }

    window.GWModules.logs = { init: init };
})();
