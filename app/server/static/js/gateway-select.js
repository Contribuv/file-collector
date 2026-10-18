/* ============================================================
 * gateway-select.js
 * gateway 面板自绘下拉组件：表单 <select> 不再使用浏览器原生弹出菜单
 * （appearance 只能美化触发器，点开后的选项列表是 OS 级弹层、无法定制）。
 *
 * 做法：把原 <select> 隐藏并保留在 DOM 里（表单提交/业务 JS 读写
 * .value / change 事件的逻辑完全不受影响），在其上构建自绘触发器 + 选项
 * 浮层；展开时实时读取 select 的 options 渲染（天然兼容动态选项），
 * 选择时写回 select.value 并派发 change，让现有筛选/设置逻辑照常运行。
 * ============================================================ */
(function () {
    'use strict';

    var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4 10-10"/></svg>';
    var SEL_SELECTORS = 'select.form-select, select.form-input';

    /* ---- 构建 / 同步 ---- */
    function buildOne(sel) {
        if (sel.getAttribute('data-gwsel') === '1') return;
        sel.setAttribute('data-gwsel', '1');
        sel.classList.add('gwsel-native');

        var wrap = document.createElement('div');
        wrap.className = 'gwa-select-wrap';
        // 继承布局相关类（如 gwa-filter 的工具栏占行规则），保证移动/桌面排版不变
        ['gwa-filter', 'gwa-log-search'].forEach(function (c) {
            if (sel.classList.contains(c)) wrap.classList.add(c);
        });

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'gwa-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.innerHTML = '<span class="gwa-select-text"></span><span class="gwa-select-arrow" aria-hidden="true">' + CHEVRON + '</span>';

        var menu = document.createElement('div');
        menu.className = 'gwa-select-menu';
        menu.setAttribute('role', 'listbox');

        sel.parentNode.insertBefore(wrap, sel);
        wrap.appendChild(trigger);
        wrap.appendChild(sel);   // 原 select 移入 wrapper（display:none）
        wrap.appendChild(menu);

        function labelOf(target) {
            // 当前值对应的 option 文本；没有匹配项（如未选择空值）则显示空/占位
            if (!target) return sel.getAttribute('placeholder') || '';
            return target.textContent.trim();
        }
        function selectedOption() {
            var opts = sel.options;
            if (sel.selectedIndex >= 0 && opts.length) return opts[sel.selectedIndex];
            return null;
        }
        function syncLabel() {
            trigger.querySelector('.gwa-select-text').textContent = labelOf(selectedOption());
            trigger.disabled = sel.disabled;
            wrap.classList.toggle('disabled', sel.disabled);
        }
        function renderOptions() {
            var html = '';
            Array.prototype.forEach.call(sel.options, function (o) {
                var opt = document.createElement('div');
                opt.className = 'gwa-select-option' + (o.selected ? ' selected' : '') + (o.disabled ? ' disabled' : '');
                opt.setAttribute('role', 'option');
                opt.setAttribute('data-value', o.value);
                opt.innerHTML = '<span class="gwa-select-option-text"></span><span class="gwa-select-option-check" aria-hidden="true">' + (o.selected ? CHECK : '') + '</span>';
                opt.querySelector('.gwa-select-option-text').textContent = o.textContent;
                menu.appendChild(opt);
            });
        }
        function open() {
            closeAll();
            menu.innerHTML = '';
            renderOptions();
            syncLabel();
            wrap.classList.add('open');
            // 选中项滚到可视区
            var cur = menu.querySelector('.gwa-select-option.selected');
            if (cur) cur.scrollIntoView({ block: 'nearest' });
            // fixed 定位：滚动容器（.mac-main）的 overflow 会裁剪 absolute 浮层，
            // 这里按触发器位置用视口坐标对齐，并做上下翻转兜底
            var r = trigger.getBoundingClientRect();
            var mh = menu.getBoundingClientRect().height;
            var mw = Math.max(r.width, 180);
            var left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - mw - 8));
            var top;
            var bottomSafe = window.innerHeight - 96;
            if (r.bottom + 4 + mh < bottomSafe) top = r.bottom + 4;
            else if (r.top - mh - 8 > 96) top = r.top - mh - 8;
            else top = Math.max(96, bottomSafe - mh - 8);
            menu.style.left = left + 'px';
            menu.style.top = top + 'px';
            menu.style.width = Math.min(mw, window.innerWidth - 16) + 'px';
        }
        function close() {
            if (!wrap.classList.contains('open')) return;
            wrap.classList.remove('open');
            menu.innerHTML = '';
        }
        function choose(div) {
            if (!div || div.classList.contains('disabled')) return close();
            var val = div.getAttribute('data-value');
            if (String(sel.value) !== String(val)) {
                sel.value = val;
                // 现有业务逻辑监听的是 change 事件，手工写值后必须派发
                var ev = document.createEvent ? document.createEvent('HTMLEvents') : null;
                if (document.createEvent) { ev.initEvent('change', true, false); sel.dispatchEvent(ev); }
                else if (typeof Event === 'function') { sel.dispatchEvent(new Event('change', { bubbles: false })); }
            }
            syncLabel();
            close();
            trigger.focus();
        }

        trigger.addEventListener('click', function (ev) {
            ev.stopPropagation();
            if (wrap.classList.contains('open')) close();
            else open();
        });
        trigger.addEventListener('keydown', function (ev) {
            var k = ev.key;
            if (k === 'Enter' || k === ' ') { ev.preventDefault(); wrap.classList.contains('open') ? close() : open(); }
            else if (k === 'Escape') { close(); }
            else if (k === 'ArrowDown' || k === 'ArrowUp') {
                ev.preventDefault();
                if (!wrap.classList.contains('open')) { open(); return; }
                var opts = Array.prototype.slice.call(menu.querySelectorAll('.gwa-select-option:not(.disabled)'));
                if (!opts.length) return;
                var idx = opts.indexOf(menu.querySelector('.gwa-select-option.focused'));
                idx = k === 'ArrowDown' ? (idx + 1) % opts.length : (idx - 1 + opts.length) % opts.length;
                Array.prototype.forEach.call(menu.querySelectorAll('.focused'), function (x) { x.classList.remove('focused'); x.setAttribute('aria-selected', 'false'); });
                opts[idx].classList.add('focused');
                opts[idx].scrollIntoView({ block: 'nearest' });
            }
        });
        menu.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var div = ev.target.closest('.gwa-select-option');
            if (div) choose(div);
        });

        // select 每次业务层重建 options / 改变选中值时同步触发器
        sel.addEventListener('change', function () { syncLabel(); });
        try {
            var mo = new MutationObserver(function () { syncLabel(); if (wrap.classList.contains('open')) renderOptions(); });
            mo.observe(sel, { childList: true, attributes: true });
        } catch (e) { /* MutationObserver 不可用时依赖 change 事件兜底 */ }

        syncLabel();
    }

    function closeAll() {
        document.querySelectorAll('.gwa-select-wrap.open').forEach(function (w) { w.classList.remove('open'); });
        document.querySelectorAll('.gwa-select-menu').forEach(function (m) { m.innerHTML = ''; });
    }

    function scan(root) {
        (root || document).querySelectorAll(SEL_SELECTORS).forEach(buildOne);
    }

    /* ---- 全局交互兜底 ---- */
    document.addEventListener('click', function (ev) {
        if (!ev.target.closest || !ev.target.closest('.gwa-select-wrap')) closeAll();
    });
    // 滚动时关闭浮层（capture 才能捕到内部容器的滚动事件；
    // 菜单自身的滚动不算——否则一滚菜单就把自己关了）
    document.addEventListener('scroll', function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest('.gwa-select-menu')) return;
        closeAll();
    }, true);
    window.addEventListener('resize', closeAll);
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') closeAll();
    });

    /* ---- 动态渲染的 select（面板重绘/弹窗）自动接管 ---- */
    try {
        new MutationObserver(function (muts) {
            for (var i = 0; i < muts.length; i++) {
                var added = muts[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var n = added[j];
                    if (n.nodeType !== 1) continue;
                    if (n.matches && n.matches(SEL_SELECTORS)) buildOne(n);
                    else if (n.querySelectorAll) scan(n);
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* 降级：仅初始化时扫描一次 */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { scan(document); });
    } else {
        scan(document);
    }
})();
