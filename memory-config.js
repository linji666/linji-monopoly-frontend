/* ═══════════════════════════════════════════════════════
   记忆银河 · 后端地址配置
   公开的代码里没有口令 —— 走 api.js 那套（存在本机、首次填一次）。
   ═══════════════════════════════════════════════════════ */
window.__MEMORY_API__ = 'https://princess-angling-hamburger.ngrok-free.dev/app/api/galaxy';

/* 请求头由 api.js 提供（含 X-Token 和 ngrok-skip-browser-warning）。
   万一 api.js 没加载，这里留一个最小的兜底。 */
window.__MEMORY_HEADERS__ = (function () {
  var h = { 'ngrok-skip-browser-warning': '1' };
  try {
    var t = localStorage.getItem('linji_app_token');
    if (t) h['X-Token'] = t;
  } catch (e) {}
  return h;
})();

/* 银河页面用这个问一次口令（首次打开时） */
window.__MEMORY_ASK_TOKEN__ = function () {
  if (window.__API__ && window.__API__.hasToken()) return window.__API__.token();
  if (window.__API__) {
    window.__API__.ensureToken();
    return window.__API__.token();
  }
  var t = window.prompt('第一次用，填一下我们俩的口令：');
  if (t) {
    try { localStorage.setItem('linji_app_token', String(t).trim()); } catch (e) {}
  }
  return t || '';
};
