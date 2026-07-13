/*!
 * TXT Reader — 纯原生小说阅读器
 * 支持：流式下载、编码检测、章节目录、CSS multi-column 分页、移动端 tap 翻页
 * 无第三方依赖，PC + 移动端通用
 */
(function () {
  'use strict';

  // ============ DOM 引用 ============
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    body: document.body,
    topbar: $('tr-topbar'),
    fn: $('tr-fn'),
    chapterLabel: $('tr-chapter-label'),
    progressPct: $('tr-progress-pct'),
    btnPrev: $('btn-prev'),
    btnNext: $('btn-next'),
    btnFontMinus: $('btn-font-minus'),
    btnFontPlus: $('btn-font-plus'),
    btnLineHeight: $('btn-line-height'),
    btnToc: $('btn-toc'),
    btnMode: $('btn-mode'),
    btnTheme: $('btn-theme'),
    btnSettings: $('btn-settings'),
    tocOverlay: $('toc-overlay'),
    tocPanel: $('toc-panel'),
    tocClose: $('toc-close'),
    tocList: $('toc-list'),
    loading: $('loading'),
    progress: $('progress'),
    error: $('error'),
    errTitle: $('err-title'),
    errDesc: $('err-desc'),
    view: $('view'),
    content: $('content'),
    tapLeft: $('tap-left'),
    tapRight: $('tap-right'),
    pageIndicator: $('page-indicator'),
    settingsOverlay: $('settings-overlay'),
    settings: $('settings-panel'),
    settingsClose: $('settings-close'),
    fsMinus: $('fs-minus'),
    fsPlus: $('fs-plus'),
    fsValue: $('fs-value'),
    lhBtn: $('lh-btn'),
    themeBtns: document.querySelectorAll('.tr-theme-row button')
  };

  // ============ 全局状态 ============
  var fileUrl = window.__FILE_URL__ || window.__TXT_FILE_URL__ || '';
  var filename = window.__FILENAME__ || window.__TXT_FILENAME__ || '文本文件';

  var fullText = '';
  var allLines = [];
  var chapters = [];
  var renderedIdx = 0;
  var scanIdx = 0;
  var scanDone = false;
  var firstRenderDone = false;

  var mode = 'scroll'; // 'scroll' | 'paged'
  var curPage = 0;
  var totalPages = 1;

  // 设置
  var settings = {
    fontSize: 16,
    lineHeights: [1.6, 1.9, 2.2],
    lhIdx: 1,
    pageWidth: 700,
    theme: 'light'
  };

  // 常量
  var CHAPTER_RE = /^[ \t]*(?:第[零〇一二三四五六七八九十百千0-9]+[章节卷部篇回]|第?\s*[0-9]{1,4}\s*[章节卷部篇回]|[Cc]hapter\s+[0-9IVXivx]+|(?:序章|楔子|尾声|番外[篇]?|后记|前言|引言|终章|跋|附录))/m;
  var RENDER_BATCH = 300;
  var SCAN_CHUNK = 4000;
  var STREAM_CHUNK = 65536;

  // ============ 工具函数 ============
  function setLoading(text) {
    if (els.loading) {
      els.loading.classList.remove('hidden');
      if (text && els.progress) els.progress.textContent = text;
    }
  }
  function hideLoading() {
    if (els.loading) els.loading.classList.add('hidden');
  }
  function showError(title, desc) {
    if (els.loading) els.loading.classList.add('hidden');
    if (els.error) {
      els.error.classList.add('show');
      if (title && els.errTitle) els.errTitle.textContent = title;
      if (desc && els.errDesc) els.errDesc.textContent = desc;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ============ 编码检测 ============
  function detectEncoding(sample) {
    // 采样前 10000 字符统计 \uFFFD 占比
    var len = Math.min(sample.length, 10000);
    if (len === 0) return 'utf-8';
    var bad = 0;
    for (var i = 0; i < len; i++) {
      if (sample.charCodeAt(i) === 0xFFFD) bad++;
    }
    return (bad / len > 0.05) ? 'gbk' : 'utf-8';
  }

  // ============ 流式下载 + 解码 ============
  function fetchStream(onProgress, onChunk, onDone, onError) {
    if (typeof fetch !== 'function') {
      // 老浏览器回退到 XHR
      fetchXHR(onProgress, onChunk, onDone, onError);
      return;
    }

    fetch(fileUrl, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) {
        onError(new Error('HTTP ' + res.status));
        return;
      }
      var ct = res.headers.get('Content-Type') || '';
      // 如果返回的是 HTML，说明是错误页
      if (ct.indexOf('text/html') !== -1) {
        onError(new Error('服务器返回了错误页面（可能未登录或文件不存在）'));
        return;
      }
      var total = parseInt(res.headers.get('Content-Length') || '0', 10);
      var loaded = 0;
      var reader = res.body.getReader();
      var decoder = null;
      var pending = '';
      var firstChunk = true;

      function pushChunk(text) {
        if (text.length === 0) return;
        pending += text;
        if (pending.length >= STREAM_CHUNK) {
          onChunk(pending);
          pending = '';
        }
      }

      function pump() {
        reader.read().then(function (result) {
          if (result.done) {
            if (decoder) {
              var tail = decoder.decode();
              if (tail) pushChunk(tail);
            }
            if (pending) { onChunk(pending); pending = ''; }
            onDone();
            return;
          }
          var value = result.value;
          loaded += value.length;
          if (total > 0) {
            onProgress(loaded, total);
          } else {
            onProgress(loaded, 0);
          }

          if (firstChunk) {
            firstChunk = false;
            // 用 utf-8 试解码首块做编码检测
            var sampleDec = new TextDecoder('utf-8');
            var sample = sampleDec.decode(value.slice(0, Math.min(value.length, 65536)), { stream: true });
            var enc = detectEncoding(sample);
            decoder = new TextDecoder(enc, { stream: true });
            var decoded = decoder.decode(value, { stream: true });
            pushChunk(decoded);
          } else {
            var d = decoder.decode(value, { stream: true });
            pushChunk(d);
          }
          pump();
        }).catch(onError);
      }
      pump();
    }).catch(onError);
  }

  // 老浏览器 XHR 回退
  function fetchXHR(onProgress, onChunk, onDone, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.withCredentials = true;
    xhr.onprogress = function (e) {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    };
    xhr.onload = function () {
      if (xhr.status !== 200) {
        onError(new Error('HTTP ' + xhr.status));
        return;
      }
      var buf = xhr.response;
      var bytes = new Uint8Array(buf);
      // 检测编码
      var sampleLen = Math.min(bytes.length, 65536);
      var sample = new TextDecoder('utf-8').decode(bytes.slice(0, sampleLen));
      var enc = detectEncoding(sample);
      var text = new TextDecoder(enc).decode(bytes);
      onChunk(text);
      onDone();
    };
    xhr.onerror = function () { onError(new Error('网络错误')); };
    xhr.send();
  }

  // ============ 章节扫描（分块异步） ============
  function parseChaptersAsync(startLine) {
    if (scanDone) return;
    scanIdx = startLine || 0;

    function scanChunk() {
      var start = scanIdx;
      var end = Math.min(start + SCAN_CHUNK, allLines.length);
      for (var i = start; i < end; i++) {
        var line = allLines[i];
        if (CHAPTER_RE.test(line)) {
          var title = line.trim().substring(0, 50);
          chapters.push({
            id: 'ch-line-' + i,
            title: title,
            line: i
          });
        }
      }
      scanIdx = end;

      // 增量更新 TOC UI
      buildTocUI();

      if (scanIdx < allLines.length) {
        // 更新进度
        if (els.progress && !firstRenderDone) {
          var pct = Math.round(scanIdx / allLines.length * 100);
          els.progress.textContent = '正在解析章节 ' + pct + '%（' + scanIdx + '/' + allLines.length + ' 行）';
        }
        setTimeout(scanChunk, 0);
      } else {
        scanDone = true;
        buildTocUI();
      }
    }
    setTimeout(scanChunk, 0);
  }

  // ============ TOC UI ============
  function buildTocUI() {
    if (!els.tocList) return;
    var html = '';
    if (chapters.length === 0) {
      html = '<a data-line="0">全文</a>';
    } else {
      for (var i = 0; i < chapters.length; i++) {
        var ch = chapters[i];
        html += '<a data-line="' + ch.line + '" data-idx="' + i + '">' + escapeHtml(ch.title) + '</a>';
      }
    }
    els.tocList.innerHTML = html;
    // 绑定点击
    var links = els.tocList.querySelectorAll('a');
    for (var j = 0; j < links.length; j++) {
      links[j].addEventListener('click', onTocClick);
    }
  }

  function onTocClick(e) {
    e.preventDefault();
    var line = parseInt(e.currentTarget.getAttribute('data-line') || '0', 10);
    closeToc();
    if (mode === 'scroll') {
      var el = document.getElementById('ch-line-' + line);
      if (el) {
        els.view.scrollTop = el.offsetTop - 10;
      } else {
        renderUntilLine(line, function () {
          var el2 = document.getElementById('ch-line-' + line);
          if (el2) els.view.scrollTop = el2.offsetTop - 10;
        });
      }
    } else {
      // paged 模式：跳到包含该行的页
      goToLine(line);
    }
  }

  function renderUntilLine(targetLine, cb) {
    if (renderedIdx > targetLine) {
      cb && cb();
      return;
    }
    var end = Math.min(renderedIdx + RENDER_BATCH, allLines.length, targetLine + 1);
    renderBatch(renderedIdx, end);
    if (renderedIdx <= targetLine && renderedIdx < allLines.length) {
      setTimeout(function () { renderUntilLine(targetLine, cb); }, 0);
    } else {
      cb && cb();
    }
  }

  // ============ 渲染 ============
  function renderBatch(start, end) {
    if (!els.content) return;
    var frag = document.createDocumentFragment();
    for (var i = start; i < end; i++) {
      var line = allLines[i];
      var isChapter = CHAPTER_RE.test(line);
      if (isChapter) {
        var h = document.createElement('span');
        h.className = 'chapter-heading';
        h.id = 'ch-line-' + i;
        h.textContent = line.trim().substring(0, 50);
        frag.appendChild(h);
        frag.appendChild(document.createTextNode('\n'));
      } else {
        frag.appendChild(document.createTextNode(line));
        frag.appendChild(document.createTextNode('\n'));
      }
    }
    els.content.appendChild(frag);
    renderedIdx = end;
  }

  function renderFirst(visible) {
    if (firstRenderDone) return;
    if (allLines.length === 0) return;
    var end = Math.min(RENDER_BATCH, allLines.length);
    renderBatch(0, end);
    firstRenderDone = true;
    hideLoading();
    // 后台继续渲染剩余
    renderAllRemaining();
  }

  function renderAllRemaining() {
    if (mode === 'paged') return; // 翻页模式不后台渲染全部
    if (renderedIdx >= allLines.length) {
      if (!scanDone) parseChaptersAsync(0);
      return;
    }
    var end = Math.min(renderedIdx + RENDER_BATCH, allLines.length);
    renderBatch(renderedIdx, end);
    if (renderedIdx < allLines.length) {
      setTimeout(renderAllRemaining, 0);
    } else {
      if (!scanDone) parseChaptersAsync(0);
    }
  }

  // ============ 分页（每页只渲染当前页内容 + 溢出测量） ============
  var linesPerPage = 0;
  var currentLine = 0;
  var currentEnd = 0;
  var pageStarts = [0]; // 历史栈：每页起始行

  function calcLinesPerPage() {
    var lh = settings.lineHeights[settings.lhIdx] * settings.fontSize;
    var pageH = els.view.clientHeight - 64;
    return Math.max(10, Math.floor(pageH / lh));
  }

  function togglePaged() {
    if (mode === 'scroll') {
      // 切换到翻页模式
      mode = 'paged';
      els.body.dataset.mode = 'paged';
      els.btnMode.textContent = '滚动';
      els.btnMode.classList.add('active');
      linesPerPage = calcLinesPerPage();
      pageStarts = [currentLine || 0];
      renderCurrentPage(currentLine || 0);
    } else {
      // 切换回滚动模式
      mode = 'scroll';
      els.body.dataset.mode = 'scroll';
      els.btnMode.textContent = '翻页';
      els.btnMode.classList.remove('active');
      els.content.innerHTML = '';
      renderedIdx = 0;
      firstRenderDone = false;
      renderFirst(true);
      if (currentLine > 0) {
        renderUntilLine(currentLine, function () {
          var el = document.getElementById('ch-line-' + currentLine);
          if (el) els.view.scrollTop = el.offsetTop - 10;
        });
      }
    }
  }

  // 渲染指定起始行的当前页，溢出时自动减少行数
  function renderCurrentPage(start) {
    if (mode !== 'paged' || linesPerPage <= 0) return;
    var end = Math.min(start + linesPerPage, allLines.length);
    els.content.innerHTML = '';
    renderBatch(start, end);

    // 溢出检查：移除多余行确保底部不截断
    var viewH = els.view.clientHeight;
    var safety = 0;
    while (els.content.scrollHeight > viewH && end > start + 1 && safety < 100) {
      // 移除最后 2 个节点（textNode + textNode 或 span + textNode）
      if (els.content.lastChild) els.content.removeChild(els.content.lastChild);
      if (els.content.lastChild) els.content.removeChild(els.content.lastChild);
      end--;
      safety++;
    }

    currentLine = start;
    currentEnd = end;
    curPage = pageStarts.length - 1;
    var actualPerPage = Math.max(1, end - start);
    totalPages = Math.max(1, Math.ceil(allLines.length / actualPerPage));
    updatePageIndicator();
    updateChapterLabelPaged();
  }

  function nextPage() {
    if (currentEnd >= allLines.length) return;
    pageStarts.push(currentEnd);
    renderCurrentPage(currentEnd);
  }

  function prevPage() {
    if (pageStarts.length <= 1) return;
    pageStarts.pop();
    var start = pageStarts[pageStarts.length - 1];
    renderCurrentPage(start);
  }

  function goToLine(line) {
    pageStarts = [line];
    renderCurrentPage(line);
  }

  function updatePageIndicator() {
    if (els.pageIndicator) {
      els.pageIndicator.textContent = (curPage + 1) + ' / ' + totalPages;
    }
  }

  function updateChapterLabelPaged() {
    if (!els.chapterLabel) return;
    if (chapters.length === 0) {
      els.chapterLabel.textContent = '';
      return;
    }
    // 根据 currentLine 找当前章节
    var found = null;
    for (var i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].line <= currentLine) {
        found = chapters[i];
        break;
      }
    }
    els.chapterLabel.textContent = found ? found.title : '';
    highlightTocItem(found ? chapters.indexOf(found) : -1);
  }

  function highlightTocItem(idx) {
    var links = els.tocList ? els.tocList.querySelectorAll('a') : [];
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove('active');
    }
    if (idx >= 0 && links[idx]) {
      links[idx].classList.add('active');
    }
  }

  // ============ 目录抽屉 ============
  function openToc() {
    els.tocOverlay.classList.add('open');
    els.tocPanel.classList.add('open');
  }
  function closeToc() {
    els.tocOverlay.classList.remove('open');
    els.tocPanel.classList.remove('open');
  }

  // ============ 设置 ============
  function applySettings() {
    els.view.style.setProperty('--tr-fs', settings.fontSize + 'px');
    els.view.style.setProperty('--tr-lh', String(settings.lineHeights[settings.lhIdx]));
    els.view.style.setProperty('--tr-pw', settings.pageWidth + 'px');
    els.body.dataset.theme = settings.theme;
    saveSettings();
    if (mode === 'paged') {
      linesPerPage = calcLinesPerPage();
      renderCurrentPage(currentLine);
    }
  }

  function loadSettings() {
    try {
      var s = localStorage.getItem('tr-settings');
      if (s) {
        var parsed = JSON.parse(s);
        if (typeof parsed.fontSize === 'number') settings.fontSize = parsed.fontSize;
        if (typeof parsed.lhIdx === 'number') settings.lhIdx = parsed.lhIdx;
        if (typeof parsed.pageWidth === 'number') settings.pageWidth = parsed.pageWidth;
        if (typeof parsed.theme === 'string') settings.theme = parsed.theme;
      }
    } catch (e) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem('tr-settings', JSON.stringify(settings));
    } catch (e) {}
  }

  function changeFontSize(delta) {
    settings.fontSize = Math.max(12, Math.min(28, settings.fontSize + delta * 2));
    if (els.fsValue) els.fsValue.textContent = settings.fontSize;
    applySettings();
  }

  function cycleLineHeight() {
    settings.lhIdx = (settings.lhIdx + 1) % settings.lineHeights.length;
    if (els.lhBtn) els.lhBtn.textContent = settings.lineHeights[settings.lhIdx];
    applySettings();
  }

  function setTheme(theme) {
    settings.theme = theme;
    // 更新主题按钮 active 状态
    els.themeBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
    applySettings();
  }

  function cycleTheme() {
    var themes = ['light', 'dark', 'sepia'];
    var idx = themes.indexOf(settings.theme);
    idx = (idx + 1) % themes.length;
    setTheme(themes[idx]);
  }

  // ============ 设置弹层 ============
  function openSettings() {
    els.settingsOverlay.classList.add('open');
    els.settings.classList.add('open');
    // 同步当前值
    if (els.fsValue) els.fsValue.textContent = settings.fontSize;
    if (els.lhBtn) els.lhBtn.textContent = settings.lineHeights[settings.lhIdx];
    els.themeBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === settings.theme);
    });
  }
  function closeSettings() {
    els.settingsOverlay.classList.remove('open');
    els.settings.classList.remove('open');
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 工具栏按钮
    if (els.btnPrev) els.btnPrev.addEventListener('click', prevPage);
    if (els.btnNext) els.btnNext.addEventListener('click', nextPage);
    if (els.btnFontMinus) els.btnFontMinus.addEventListener('click', function () { changeFontSize(-1); });
    if (els.btnFontPlus) els.btnFontPlus.addEventListener('click', function () { changeFontSize(1); });
    if (els.btnLineHeight) els.btnLineHeight.addEventListener('click', cycleLineHeight);
    if (els.btnToc) els.btnToc.addEventListener('click', openToc);
    if (els.btnMode) els.btnMode.addEventListener('click', togglePaged);
    if (els.btnTheme) els.btnTheme.addEventListener('click', cycleTheme);
    if (els.btnSettings) els.btnSettings.addEventListener('click', openSettings);

    // 目录关闭
    if (els.tocClose) els.tocClose.addEventListener('click', closeToc);
    if (els.tocOverlay) els.tocOverlay.addEventListener('click', closeToc);

    // 设置关闭
    if (els.settingsClose) els.settingsClose.addEventListener('click', closeSettings);
    if (els.settingsOverlay) els.settingsOverlay.addEventListener('click', closeSettings);

    // 设置面板内按钮
    if (els.fsMinus) els.fsMinus.addEventListener('click', function () { changeFontSize(-1); });
    if (els.fsPlus) els.fsPlus.addEventListener('click', function () { changeFontSize(1); });
    if (els.lhBtn) els.lhBtn.addEventListener('click', cycleLineHeight);
    els.themeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-theme'));
      });
    });

    // tap zone 翻页
    if (els.tapLeft) els.tapLeft.addEventListener('click', prevPage);
    if (els.tapRight) els.tapRight.addEventListener('click', nextPage);

    // 键盘翻页
    document.addEventListener('keydown', function (e) {
      if (mode !== 'paged') return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      }
    });

    // 滚动模式：滚动时更新章节标签
    if (els.view) {
      var scrollTimer = null;
      els.view.addEventListener('scroll', function () {
        if (mode !== 'scroll') return;
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateChapterLabelScroll, 100);
      });
    }

    // 窗口 resize：debounce 重算分页
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (mode === 'paged') {
          linesPerPage = calcLinesPerPage();
          renderCurrentPage(currentLine);
        }
      }, 150);
    });
  }

  function updateChapterLabelScroll() {
    if (mode !== 'scroll' || !els.chapterLabel || chapters.length === 0) return;
    var scrollTop = els.view.scrollTop;
    var found = null;
    for (var i = chapters.length - 1; i >= 0; i--) {
      var el = document.getElementById(chapters[i].id);
      if (el && el.offsetTop - 20 <= scrollTop) {
        found = chapters[i];
        // 记录当前阅读位置（章节起始行）
        currentLine = chapters[i].line;
        break;
      }
    }
    els.chapterLabel.textContent = found ? found.title : '';
    highlightTocItem(found ? chapters.indexOf(found) : -1);
  }

  // ============ 启动 ============
  function start() {
    if (!fileUrl) {
      showError('加载失败', '文件 URL 缺失');
      return;
    }

    // 加载设置
    loadSettings();
    applySettings();
    if (els.fn) els.fn.textContent = filename;

    setLoading('加载中...');

    var firstChunkDone = false;

    fetchStream(
      function (loaded, total) {
        // 进度
        if (els.progress) {
          if (total > 0) {
            var kb = Math.round(loaded / 1024);
            var totKb = Math.round(total / 1024);
            var pct = Math.round(loaded / total * 100);
            els.progress.textContent = '下载 ' + pct + '%（' + kb + '/' + totKb + ' KB）';
          } else {
            els.progress.textContent = '已下载 ' + Math.round(loaded / 1024) + ' KB';
          }
        }
      },
      function (text) {
        // 收到文本块
        fullText += text;
        if (!firstChunkDone && fullText.length > 0) {
          firstChunkDone = true;
          // 首次有数据：切行 + 立即渲染首屏
          allLines = fullText.split('\n');
          renderFirst(true);
        } else {
          // 后续块：追加行
          allLines = fullText.split('\n');
        }
      },
      function () {
        // 下载完成
        allLines = fullText.split('\n');
        if (!firstRenderDone) {
          renderFirst(true);
        }
        // 确保 TOC 至少有占位
        if (chapters.length === 0 && scanDone === false) {
          // 启动章节扫描
          if (!scanDone) parseChaptersAsync(0);
        }
      },
      function (err) {
        console.error('TXT 加载失败:', err);
        showError('加载失败', (err && err.message) ? err.message : '网络错误');
      }
    );
  }

  // ============ 初始化 ============
  function init() {
    bindEvents();
    start();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
