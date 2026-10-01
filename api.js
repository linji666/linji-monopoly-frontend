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

  /* 最近一次出错的原因，页面上能显示出来，方便找问题 */
  lastError: '',

  /* 页面用它判断"配好了没"。地址写死，所以总是 true */
  ready: function () { return !!this.base; },

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

  /* 没口令就弹一个自己画的框（手机的浏览器常把 prompt 拦掉）　返回 Promise */
  askToken: function () {
    var self = this;
    if (self._asking) return self._asking;

    self._asking = new Promise(function (resolve) {
      var old = document.getElementById('__linji_token_box');
      if (old) old.parentNode.removeChild(old);

      var box = document.createElement('div');
      box.id = '__linji_token_box';
      box.innerHTML =
        '<div style="position:fixed;inset:0;z-index:99999;background:rgba(20,14,32,.72);' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;' +
        'align-items:center;justify-content:center;padding:24px;' +
        'font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Noto Sans SC\',sans-serif">' +
          '<div style="width:100%;max-width:340px;background:#fff;border-radius:24px;' +
          'padding:26px 22px 22px;box-shadow:0 24px 70px rgba(60,30,90,.4)">' +
            '<div style="font-size:16px;font-weight:600;color:#5f5180;letter-spacing:1px;' +
            'margin-bottom:8px">填一下口令</div>' +
            '<div style="font-size:12px;color:#b8abca;line-height:1.7;margin-bottom:18px">' +
            '只填这一次，以后这台手机就记住了。</div>' +
            '<input id="__linji_token_input" type="password" inputmode="text" autocomplete="off" ' +
            'placeholder="我们俩的口令" style="width:100%;box-sizing:border-box;' +
            'background:#fbf7fe;border:1px solid rgba(178,138,190,.2);border-radius:15px;' +
            'padding:14px 15px;color:#40365a;font-size:16px;outline:none">' +
            '<div id="__linji_token_err" style="font-size:12px;color:#e0779f;' +
            'margin-top:10px;min-height:16px"></div>' +
            '<div style="display:flex;gap:10px;margin-top:14px">' +
              '<button id="__linji_token_later" style="flex:1;padding:14px 0;border:none;' +
              'border-radius:16px;background:#f6f1fa;color:#8a7fa4;font-size:15px;' +
              'font-family:inherit;font-weight:600">先不填</button>' +
              '<button id="__linji_token_ok" style="flex:1;padding:14px 0;border:none;' +
              'border-radius:16px;background:linear-gradient(135deg,#ff9ecd,#a98cff);' +
              'color:#fff;font-size:15px;font-family:inherit;font-weight:600;' +
              'box-shadow:0 10px 24px rgba(169,140,255,.42)">好</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(box);

      var inp = document.getElementById('__linji_token_input');
      var err = document.getElementById('__linji_token_err');

      function done(v) {
        self._asking = null;
        if (box.parentNode) box.parentNode.removeChild(box);
        if (v) { self.setToken(v); resolve(true); }
        else { resolve(false); }
      }

      document.getElementById('__linji_token_ok').onclick = function () {
        var v = (inp.value || '').trim();
        if (!v) { err.textContent = '还没填呢'; inp.focus(); return; }
        done(v);
      };
      document.getElementById('__linji_token_later').onclick = function () { done(''); };
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('__linji_token_ok').click();
      });
      inp.addEventListener('input', function () { err.textContent = ''; });

      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 120);
    });

    return self._asking;
  },

  /* 有口令就过，没有就问 */
  needToken: function () {
    var self = this;
    if (self.hasToken()) return Promise.resolve(true);
    return self.askToken();
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

  /* 把失败说清楚：到底是网络不通、还是被挡了、还是口令不对 */
  why: function (err, r) {
    var m = (err && err.message) || '';
    if (m === 'NO_TOKEN') return '还没填口令';
    if (m === 'TOKEN') return '口令不对';
    if (r && r.status) {
      if (r.status === 403) return '口令不对';
      if (r.status === 404) return '地址不对（404）';
      if (r.status === 502) return '后端连不上记忆库';
      return '服务器回了 ' + r.status;
    }
    if (m.indexOf('Failed to fetch') >= 0) return '连不上服务器（网络或跨域被挡）';
    if (m.indexOf('JSON') >= 0) return '收到的不是数据（可能被中间页挡了）';
    return m || '不知道哪儿出了问题';
  },

  /* 读全部 */
  state: function (w) {
    var self = this;
    var who = w || this.who;
    return this.needToken().then(function (ok) {
      if (!ok) throw new Error('NO_TOKEN');
      return fetch(self.base + '/api/state', { headers: self.headers({ 'X-Who': who }) });
    }).then(function (r) {
      if (r.status === 403) { self.clearToken(); throw new Error('TOKEN'); }
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e._r = r; throw e; }
      return r.json().catch(function () { throw new Error('JSON 读不出来'); });
    }).catch(function (e) {
      self.lastError = self.why(e, e && e._r);
      throw e;
    });
  },

  /* 通用 POST */
  post: function (path, body, extraHeaders) {
    var self = this;
    return this.needToken().then(function (ok) {
      if (!ok) throw new Error('NO_TOKEN');
      return fetch(self.base + path, {
        method: 'POST',
        headers: self.headers(extraHeaders),
        body: JSON.stringify(body || {})
      });
    }).then(function (r) {
      if (r.status === 403) { self.clearToken(); throw new Error('TOKEN'); }
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e._r = r; throw e; }
      return r.json().catch(function () { throw new Error('JSON 读不出来'); });
    }).catch(function (e) {
      self.lastError = self.why(e, e && e._r);
      throw e;
    });
  },

  /* 取记忆银河（走后端中转） */
  galaxy: function () {
    var self = this;
    return this.needToken().then(function (ok) {
      if (!ok) throw new Error('NO_TOKEN');
      return fetch(self.base + '/api/galaxy', { headers: self.headers() });
    }).then(function (r) {
      if (r.status === 403) { self.clearToken(); throw new Error('TOKEN'); }
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e._r = r; throw e; }
      return r.json().catch(function () { throw new Error('JSON 读不出来'); });
    }).catch(function (e) {
      self.lastError = self.why(e, e && e._r);
      throw e;
    });
  }
};

/* ═══════════════════════════════════════════════════════
   时间解析（全站统一）
   ───────────────────────────────────────────────────────
   服务器存的是 UTC。
   老数据： "2026-10-01 17:20"           （没带时区）
   新数据： "2026-10-01T09:20:00Z"       （带了 Z）
   两种都当 UTC 读，再换算成本机时间。
   ═══════════════════════════════════════════════════════ */
window.parseTime = function (t) {
  var raw = String(t == null ? '' : t).trim();
  if (!raw) return null;

  var iso;
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(raw)) {
    iso = raw;                                  /* 已带时区标记 */
  } else {
    iso = raw.replace(' ', 'T') + 'Z';          /* 没带，按 UTC 补 */
  }
  var d = new Date(iso);
  if (isNaN(d.getTime())) {
    d = new Date(raw.replace(/-/g, '/'));
    if (isNaN(d.getTime())) return null;
  }
  return d;
};

/* 显示成"刚刚 / N 分钟前 / N 小时前 / N 天前 / 日期" */
window.sinceText = function (t) {
  var d = window.parseTime(t);
  if (!d) return '';

  var s = (Date.now() - d.getTime()) / 1000;
  if (s < 0) s = 0;
  if (s < 60) return '刚刚';
  if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
  if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
  if (s < 86400 * 3) return Math.floor(s / 86400) + ' 天前';

  function p(n) { return n < 10 ? '0' + n : '' + n; }
  var now = new Date();
  return (d.getFullYear() === now.getFullYear() ? '' : d.getFullYear() + '-') +
         p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
         p(d.getHours()) + ':' + p(d.getMinutes());
};

/* ── 兜底：把页面里那个老的 since 也接到新的上面 ──
   页面里写的是 function since(){}（在顶层就等于 window.since），
   这里等它执行完再盖掉，之后所有 since(...) 都会走正确的那套。 */
(function () {
  function apply() {
    try { window.since = window.sinceText; } catch (e) {}
  }
  apply();
  setTimeout(apply, 0);
  setTimeout(apply, 60);
  setTimeout(apply, 400);
  if (document.readyState !== 'complete') {
    window.addEventListener('load', apply);
  }
})();
