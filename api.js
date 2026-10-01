/* ═══════════════════════════════════════════════════════
   我们俩的 App · 总开关
   ───────────────────────────────────────────────────────
   公开的代码里没有口令。
   口令存在你自己手机里（localStorage），第一次用的时候填一次。
   ═══════════════════════════════════════════════════════ */
window.__API__ = {

  /* 后端地址。ngrok 换域名了，改这一行，重新推一次就行 */
  base: 'https://princess-angling-hamburger.ngrok-free.dev/app',

  /* 这台手机是谁：'me' = 桐桐，'linji' = 林霁 */
  who: 'me',

  KEY: 'linji_app_token',

  /* ── 口令 ── */
  token: function () {
    try { return localStorage.getItem(this.KEY) || ''; } catch (e) { return ''; }
  },
  setToken: function (t) {
    try { localStorage.setItem(this.KEY, String(t || '').trim()); } catch (e) {}
  },
  clearToken: function () {
    try { localStorage.removeItem(this.KEY); } catch (e) {}
  },
  hasToken: function () { return !!this.token(); },

  /* 没填口令时弹一个框让填 */
  ensureToken: function () {
    if (this.hasToken()) return true;
    var t = window.prompt('第一次用，填一下我们俩的口令：');
    if (t === null) return false;
    t = String(t).trim();
    if (!t) return false;
    this.setToken(t);
    return true;
  },

  /* 统一的请求头 */
  headers: function (extra) {
    var h = {
      'Content-Type': 'application/json',
      'X-Who': this.who,
      'X-Token': this.token(),
      /* ngrok 免费版会往浏览器里插一张警告页，这个头让它别插 */
      'ngrok-skip-browser-warning': '1'
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  },

  /* 读全部 */
  state: function (w) {
    var self = this;
    var who = w || this.who;
    return fetch(this.base + '/api/state', { headers: this.headers({ 'X-Who': who }) })
      .then(function (r) {
        if (r.status === 403) throw new Error('TOKEN');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function (e) {
        /* 口令错了 → 清掉重新问一次 */
        if (e && e.message === 'TOKEN') {
          self.clearToken();
          throw e;
        }
        throw e;
      });
  },

  /* 通用 POST */
  post: function (path, body, extraHeaders) {
    var self = this;
    return fetch(this.base + path, {
      method: 'POST',
      headers: this.headers(extraHeaders),
      body: JSON.stringify(body || {})
    }).then(function (r) {
      if (r.status === 403) throw new Error('TOKEN');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function (e) {
      if (e && e.message === 'TOKEN') self.clearToken();
      throw e;
    });
  },

  /* 取记忆银河（走后端中转） */
  galaxy: function () {
    return fetch(this.base + '/api/galaxy', { headers: this.headers() })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }
};
