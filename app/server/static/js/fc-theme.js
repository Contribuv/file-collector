/* ============================================================
   全站主题模式公共脚本（自适应 / 深色 / 浅色）
   - 约定：localStorage 'fc-theme' = 'auto' | 'dark' | 'light'
   - 控件为单个按钮：点击循环 自适应 → 深色 → 浅色 → 自适应
     图标与文字随当前状态变化。
   - head 内联脚本负责首帧设置 data-theme（防闪烁），
     本文件负责按钮渲染 + 系统主题变化实时跟随。
   ============================================================ */
(function () {
  var KEY = 'fc-theme';
  var ORDER = ['auto', 'dark', 'light'];
  var LABEL = { auto: '自适应', dark: '深色', light: '浅色' };
  var ICONS = {
    /* 半填充圆：跟随系统 */
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/></svg>',
    /* 月亮 */
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    /* 太阳 */
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };
  var NEXT_TIP = { auto: '点击切换到深色', dark: '点击切换到浅色', light: '点击切换到自适应' };

  function readMode() {
    var m = 'auto';
    try { m = (localStorage.getItem(KEY) || 'auto').toLowerCase(); } catch (e) {}
    if (m !== 'dark' && m !== 'light') m = 'auto';
    return m;
  }

  function resolve(mode) {
    if (mode === 'dark' || mode === 'light') return mode;
    // auto：链接参数 > 飞牛全局主题 > 系统暗色偏好 > 浅色
    try {
      var param = (new URL(window.location.href).searchParams.get('theme') || '').trim().toLowerCase();
      if (param !== 'dark' && param !== 'light') param = '';
      if (!param) {
        var fnOS = (document.body && document.body.getAttribute('theme-mode') || '').trim().toLowerCase();
        if (fnOS === 'dark') param = 'dark';
      }
      if (!param && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) param = 'dark';
      if (param) return param;
    } catch (e) {}
    return 'light';
  }

  function renderButton(btn, mode) {
    /* 仅图标：无文本 */
    btn.innerHTML = ICONS[mode];
    btn.title = '主题：' + LABEL[mode] + '（' + NEXT_TIP[mode] + '）';
    btn.setAttribute('aria-label', '主题切换，当前' + LABEL[mode]);
  }

  function syncButtons(mode) {
    var btns = document.querySelectorAll('button.theme-switch');
    for (var i = 0; i < btns.length; i++) renderButton(btns[i], mode);
  }

  function apply() {
    var mode = readMode();
    document.documentElement.setAttribute('data-theme', resolve(mode));
    syncButtons(mode);
  }

  window.fcSetThemeMode = function (mode) {
    if (mode !== 'dark' && mode !== 'light') mode = 'auto';
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    apply();
  };

  /* 初始同步（head 内联已设 data-theme，这里只刷新按钮；万一未跑也能兜底） */
  apply();

  /* 系统主题变化（auto 模式）实时跟随 */
  try {
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { apply(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  } catch (e) {}

  /* 绑定循环点击：自适应 → 深色 → 浅色 → 自适应 */
  var btns = document.querySelectorAll('button.theme-switch');
  for (var i = 0; i < btns.length; i++) {
    (function (b) {
      b.addEventListener('click', function () {
        var cur = readMode();
        var idx = ORDER.indexOf(cur);
        var next = ORDER[(idx + 1) % ORDER.length];
        window.fcSetThemeMode(next);
      });
    })(btns[i]);
  }
})();
