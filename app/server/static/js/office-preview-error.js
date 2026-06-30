/* ===== Office 预览错误处理 =====
 * 由 office_preview.html 加载
 */

(function() {
  'use strict';

  var fv = document.getElementById('fv');
  var errOverlay = document.getElementById('fv-err');
  var errTitle = document.getElementById('fv-err-title');
  var errDesc = document.getElementById('fv-err-desc');
  var errRetry = document.getElementById('fv-err-retry');
  if (!fv || !errOverlay) return;

  var errorShown = false;

  /* 根据错误信息推测具体原因 */
  function parseError(detail) {
    var msg = (detail && detail.message) || (detail && detail.toString()) || '';
    var statusMatch = msg.match(/Failed to fetch file:\s*(\d+)/);
    if (statusMatch) {
      var code = parseInt(statusMatch[1], 10);
      switch (code) {
        case 401:
          return { title: '访问已过期', desc: '文件访问令牌已过期，请返回原页面刷新后重新打开。', showDownload: false };
        case 403:
          return { title: '无法访问', desc: '没有权限访问此文件，可能需要先验证通行证。', showDownload: false };
        case 404:
          return { title: '文件不存在', desc: '文件可能已被删除或链接已失效。', showDownload: false };
        default:
          return { title: '预览失败', desc: '文件加载出错（状态码 ' + code + '），请下载后查看。', showDownload: true };
      }
    }
    if (msg.indexOf('central directory') >= 0)
      return { title: '无法访问', desc: '文件获取失败，可能是权限问题或链接已过期。请返回原页面刷新后重试。', showDownload: false };
    if (msg.indexOf('401') >= 0 || msg.indexOf('UNAUTHORIZED') >= 0 || msg.indexOf('令牌') >= 0)
      return { title: '访问已过期', desc: '文件访问令牌已过期，请返回原页面刷新后重新打开。', showDownload: false };
    if (msg.indexOf('403') >= 0 || msg.indexOf('权限') >= 0 || msg.indexOf('无权') >= 0)
      return { title: '无法访问', desc: '没有权限访问此文件，可能需要先验证通行证。', showDownload: false };
    if (msg.indexOf('404') >= 0)
      return { title: '文件不存在', desc: '文件可能已被删除或链接已失效。', showDownload: false };
    return { title: '预览失败', desc: '无法加载文件，请检查文件格式或下载后查看。', showDownload: true };
  }

  /* 隐藏 flyfish 内部错误提示（light DOM） */
  function hideFVError() {
    if (!fv) return;
    var shell = fv.querySelector('.file-viewer-web-shell');
    if (shell) {
      var errDivs = shell.querySelectorAll('div');
      errDivs.forEach(function(d) {
        var h = d.textContent || '';
        if (h.indexOf('预览失败') >= 0 || h.indexOf('PPTX') >= 0 ||
            h.indexOf('解析失败') >= 0 || h.indexOf('central directory') >= 0 ||
            h.indexOf('Failed to fetch') >= 0) {
          var p = d;
          while (p && p !== shell) {
            if (p.children.length > 0 && p.offsetHeight < shell.offsetHeight * 0.8) {
              p.style.display = 'none'; break;
            }
            p = p.parentElement;
          }
          if (p === shell || !p) d.style.display = 'none';
        }
      });
    }
    var all = fv.querySelectorAll('*');
    all.forEach(function(el) {
      var c = el.className || '';
      if (typeof c === 'string' && (c.indexOf('error') >= 0 || c.indexOf('Error') >= 0 || c.indexOf('fail') >= 0)) {
        el.style.display = 'none';
      }
    });
  }

  /* viewer-error 事件 */
  fv.addEventListener('viewer-error', function(e) {
    var info = parseError(e.detail);
    errTitle.textContent = info.title;
    errDesc.textContent = info.desc;
    // 控制下载按钮显隐
    if (errRetry) errRetry.style.display = info.showDownload ? '' : 'none';
    errOverlay.classList.add('show');
    errorShown = true;
    hideFVError();
  });

  /* viewer-load-complete 事件 */
  fv.addEventListener('viewer-load-complete', function() {
    errOverlay.classList.remove('show');
    errorShown = false;
  });

  /* MutationObserver 持续扫描 flyfish 内部新出现的错误元素 */
  var obsError = new MutationObserver(function() {
    if (errorShown) hideFVError();
  });
  obsError.observe(fv, {childList:true,subtree:true,attributes:true});
})();
