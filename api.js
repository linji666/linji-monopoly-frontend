/* ═══════════════════════════════════════════════════════
   我们俩的 App · 总开关
   后端地址、口令、我是谁 —— 全在这儿。
   以后 ngrok 换域名了，只改下面 base 这一行。
   ═══════════════════════════════════════════════════════ */
window.__API__ = {

  /* 后端地址。指向 nginx 的 /app/ */
  base: 'https://princess-angling-hamburger.ngrok-free.dev/app',

  /* 写东西要口令（只读 /api/state 也要） */
  token: 'linji-tongtong-2026',

  /* 这台手机是谁：'me' = 桐桐，'linji' = 林霁 */
  who: 'me',

  /* 有没有配好。没配好就退回本机，离线也能看 */
  ready: function () {
    return !!(this.base && this.token);
  },

  /* 统一的请求头 */
  headers: function (extra) {
    var h = {
      'Content-Type': 'application/json',
      'X-Who': this.who,
      'X-Token': this.token,
      /* ngrok 免费版会往浏览器里插一张警告页，这个头让它别插 */
      'ngrok-skip-browser-warning': '1'
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  },

  /* 读全部 */
  state: function (w) {
    var who = w || this.who;
    return fetch(this.base + '/api/state', { headers: this.headers({ 'X-Who': who }) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  },

  /* 通用 POST */
  post: function (path, body, extraHeaders) {
    return fetch(this.base + path, {
      method: 'POST',
      headers: this.headers(extraHeaders),
      body: JSON.stringify(body || {})
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
};
