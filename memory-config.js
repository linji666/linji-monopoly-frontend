/* ═══════════════════════════════════════════════════════
   记忆银河 · 后端地址配置
   换域名 / 换口令 —— 只改这两个地方，别处不用动。

   为什么走 /app/api/galaxy 而不是直连 8002：
   直连要过 ngrok，免费版会往浏览器里插一张警告页，
   银河就取不到数据。走 App 后端中转，一个域名解决。
   ═══════════════════════════════════════════════════════ */
window.__MEMORY_API__ = 'https://princess-angling-hamburger.ngrok-free.dev/app/api/galaxy';

/* 中转要带的头（朋友那头也会用同一份） */
window.__MEMORY_HEADERS__ = {
  'X-Token': 'linji-tongtong-2026',
  'ngrok-skip-browser-warning': '1'
};
