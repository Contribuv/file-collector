/* ===== PDF.js 预览错误处理 =====
 * PDF.js 通过 Web Worker 加载，无法通过 fetch 拦截。
 * 改用 unhandledrejection + MutationObserver + 定时扫描 三重保障。
 */

(function() {
  'use strict';

  var _pdfErrorShown = false;

  function errorIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">' +
      '<circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.25)"/>' +
      '<line x1="12" y1="8" x2="12" y2="12" stroke="rgba(255,255,255,.4)"/>' +
      '<line x1="12" y1="16" x2="12.01" y2="16" stroke="rgba(255,255,255,.4)"/>' +
      '</svg>';
  }

  function showPdfError(status) {
    if (_pdfErrorShown) return;
    _pdfErrorShown = true;

    var title, desc, showRefresh = false;
    if (status === 401) {
      title = '访问令牌已过期';
      desc = '文件访问令牌已过期，请返回原页面刷新后重新打开预览。';
      showRefresh = true;
    } else if (status === 403) {
      title = '没有访问权限';
      desc = '您可能需要先验证通行证，或没有该文件的访问权限。';
    } else if (status === 404) {
      title = '文件不存在';
      desc = '文件可能已被删除或链接已失效。';
    } else if (status >= 500) {
      title = '服务器错误';
      desc = '服务端异常，请稍后重试。';
    } else {
      title = '加载失败';
      desc = '无法加载 PDF 文件，请检查文件是否可访问。';
    }

    var lb = document.getElementById('loadingBar');
    if (lb) lb.style.display = 'none';
    var oc = document.getElementById('outerContainer');
    if (oc) oc.style.display = 'none';

    var ov = document.createElement('div');
    ov.className = 'pdf-error-overlay';
    ov.innerHTML =
      '<div class="pdf-error-card">' +
        '<div class="pdf-error-icon">' + errorIcon() + '</div>' +
        '<div class="pdf-error-title">' + title + '</div>' +
        '<div class="pdf-error-desc">' + desc + '</div>' +
        (showRefresh ? '<button class="pdf-error-refresh" onclick="window.close();setTimeout(function(){window.location.replace(\'about:blank\')},150)">返回</button>' : '') +
        '<button class="pdf-error-close" onclick="window.close();setTimeout(function(){window.location.replace(\'about:blank\')},150)">关闭</button>' +
      '</div>';
    document.body.appendChild(ov);
  }

  /* ===== 方案 1：捕获 PDF.js 未处理的 Promise 拒绝 =====
   * PDF.js 抛出 UnexpectedResponseException / MissingPDFException 时，
   * error 对象上携带 .status 字段（401/403/404 等）  */
  window.addEventListener('unhandledrejection', function(e) {
    if (_pdfErrorShown) return;
    var reason = e && e.reason;
    if (!reason) return;
    var name = reason.name || '';
    if (name === 'UnexpectedResponseException' || name === 'MissingPDFException') {
      showPdfError(reason.status || 0);
      e.preventDefault && e.preventDefault();
    } else if (name === 'InvalidPDFException') {
      showPdfError(0);
      e.preventDefault && e.preventDefault();
    }
  });

  /* ===== 方案 2：劫持 console.error 检测 PDF.js 日志 ===== */
  (function() {
    var _origError = console.error;
    console.error = function() {
      _origError.apply(console, arguments);
      if (_pdfErrorShown) return;
      var msg = Array.prototype.join.call(arguments, ' ');
      if (msg.indexOf('Unexpected server response') !== -1 ||
          msg.indexOf('意外的服务器响应') !== -1) {
        var m = msg.match(/\((\d{3})\)/);
        showPdfError(m ? parseInt(m[1], 10) : 0);
      }
    };
  })();

  /* ===== 方案 3：MutationObserver 检测 DOM 错误文本 ===== */
  function isErrorText(t) {
    if (!t || t.length < 10) return false;
    return t.indexOf('Unexpected server response') !== -1 ||
           t.indexOf('意外的服务器响应') !== -1 ||
           t.indexOf('MissingPDFException') !== -1 ||
           t.indexOf('InvalidPDFException') !== -1;
  }
  function extractStatus(t) {
    var m = t.match(/\((\d{3})\)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function checkNode(n) {
    if (_pdfErrorShown || n.nodeType !== Node.ELEMENT_NODE) return;
    var t = (n.textContent || '').trim();
    if (isErrorText(t)) showPdfError(extractStatus(t) || 0);
  }
  (function init() {
    var t = document.body || document.documentElement;
    if (!t) { setTimeout(init, 100); return; }
    new MutationObserver(function(muts) {
      if (_pdfErrorShown) return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) checkNode(m.addedNodes[j]);
        } else if (m.type === 'characterData') {
          checkNode(m.target.parentNode);
        }
        if (_pdfErrorShown) return;
      }
    }).observe(t, { childList: true, subtree: true, characterData: true });
  })();

  /* ===== 方案 4：定时兜底 5s 后仍无页面则报错 ===== */
  setTimeout(function() {
    if (_pdfErrorShown) return;
    if (document.querySelectorAll('#viewer .page').length > 0) return;
    var t = (document.body.textContent || '').trim();
    if (isErrorText(t)) { showPdfError(extractStatus(t) || 0); return; }
    showPdfError(0);
  }, 5000);

})();
