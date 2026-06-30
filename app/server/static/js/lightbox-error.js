/* ===== 灯箱图片/视频/音频加载错误处理 =====
 * 由 share.html 和 collect.html 的 renderLightbox() 调用
 * 依赖: _lbItems, _lbIndex, closeLightbox 全局变量
 */

/* 错误 SVG 图标 */
var LBE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.35)"/><line x1="12" y1="8" x2="12" y2="12" stroke="rgba(255,255,255,.5)"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="rgba(255,255,255,.5)"/></svg>';

/* 根据 HTTP 状态码返回错误信息 */
function lightboxParseError(status) {
  if (status === 401) return { title: '访问令牌已过期', desc: '请刷新页面后重新验证通行证' };
  if (status === 403) return { title: '没有访问权限', desc: '预览功能可能未开启，或您无权查看此文件' };
  if (status === 404) return { title: '文件不存在', desc: '文件可能已被删除或链接已失效' };
  if (status >= 500) return { title: '服务器错误', desc: '服务端异常，请稍后重试' };
  return { title: '加载失败', desc: '无法加载此文件，请尝试下载后查看' };
}

/* 灯箱图片加载失败入口 */
function lightboxImgError(e) {
  var lb = document.getElementById('custom-lightbox');
  if (!lb) return;
  var active = lb.style.display !== 'none' && lb.style.display !== '';
  if (!active) return;

  // 尝试从图片 src 的 fetch 响应获取状态码
  var img = e && e.target;
  var src = (img && img.src) || '';
  var status = 0;

  // 用 fetch 重新请求获取状态码（图片已失败，再发一次轻量请求）
  if (src) {
    fetch(src, { method: 'HEAD', credentials: 'same-origin' }).then(function(r) {
      showLightboxError(r.status);
    }).catch(function() {
      showLightboxError(0);
    });
  } else {
    showLightboxError(0);
  }
}

function showLightboxError(status) {
  var lb = document.getElementById('custom-lightbox');
  if (!lb) return;
  // 移除旧错误层
  var old = lb.querySelector('.lb-error-overlay');
  if (old) old.remove();

  var info = lightboxParseError(status);
  var overlay = document.createElement('div');
  overlay.className = 'lb-error-overlay';
  overlay.innerHTML =
    '<div class="lb-error-icon">' + LBE_ICON + '</div>' +
    '<div class="lb-error-title">' + info.title + '</div>' +
    '<div class="lb-error-desc">' + info.desc + '</div>' +
    '<div class="lb-error-actions">' +
      '<button class="lb-error-btn" onclick="closeLightbox()">关闭</button>' +
      (status === 401 ? '<button class="lb-error-btn primary" onclick="location.reload()">刷新页面</button>' : '') +
    '</div>';
  lb.appendChild(overlay);

  // 隐藏导航按钮
  var prev = lb.querySelector('.lb-prev');
  var next = lb.querySelector('.lb-next');
  if (prev) prev.style.display = 'none';
  if (next) next.style.display = 'none';
}

/* 视频/音频错误 (HTMLMediaElement error) */
function lightboxMediaError(e, type) {
  var lb = document.getElementById('custom-lightbox');
  if (!lb) return;
  var old = lb.querySelector('.lb-error-overlay');
  if (old) old.remove();

  var title = type === 'video' ? '视频播放失败' : '音频播放失败';
  var desc = '文件格式可能不受支持，或文件已损坏';
  var overlay = document.createElement('div');
  overlay.className = 'lb-error-overlay';
  overlay.innerHTML =
    '<div class="lb-error-icon">' + LBE_ICON + '</div>' +
    '<div class="lb-error-title">' + title + '</div>' +
    '<div class="lb-error-desc">' + desc + '</div>' +
    '<div class="lb-error-actions">' +
      '<button class="lb-error-btn" onclick="closeLightbox()">关闭</button>' +
    '</div>';
  lb.appendChild(overlay);
}
