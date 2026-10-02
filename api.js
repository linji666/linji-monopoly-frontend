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

  /* 改口令的时候把这个名字升一位（_v2 → _v3），旧口令就自动作废了 */
  KEY: 'linji_app_token_v2',

  /* 最近一次出错的原因 */
  lastError: '',

  /* 出错时弹不弹小条（调好了可以关掉） */
  showErrors: true,

  ready: function () { return !!this.base; },

  /* ── 口令 ── */
  tokenRaw: function () {
    try { return localStorage.getItem(this.KEY) || ''; } catch (e) { return ''; }
  },
  /* 送出去的必须是纯英文数字，中文会让浏览器直接报错，这里先剔干净 */
  token: function () {
    return this.tokenRaw().replace(/[^\x21-\x7E]/g, '');
  },
  setToken: function (t) {
    var clean = String(t || '').replace(/[^\x21-\x7E]/g, '').trim();
    try { localStorage.setItem(this.KEY, clean); } catch (e) {}
    return clean;
  },
  clearToken: function () {
    try { localStorage.removeItem(this.KEY); } catch (e) {}
  },
  hasToken: function () { return !!this.token(); },

  /* 口令人话描述：只露前几位，方便确认填的是什么 */
  tokenHint: function () {
    var t = this.token();
    if (!t) return '（还没填）';
    return t.length <= 6 ? t : (t.slice(0, 6) + '…（共 ' + t.length + ' 位）');
  },

  /* 没口令就弹一个自己画的框 */
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
            '只填这一次，以后这台手机就记住了。<br>口令是英文字母和数字，别带中文。</div>' +
            '<input id="__linji_token_input" type="text" inputmode="email" ' +
            'autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
            'placeholder="我们俩的口令" style="width:100%;box-sizing:border-box;' +
            'background:#fbf7fe;border:1px solid rgba(178,138,190,.2);border-radius:15px;' +
            'padding:14px 15px;color:#40365a;font-size:16px;outline:none">' +
            '<div style="font-size:11px;color:#cbbfda;margin-top:8px">' +
            '想粘贴的话：长按上面那个框</div>' +
            '<div id="__linji_token_err" style="font-size:12px;color:#e0779f;' +
            'margin-top:8px;min-height:16px"></div>' +
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
        if (v) { resolve(self.setToken(v)); }
        else { resolve(false); }
      }

      document.getElementById('__linji_token_ok').onclick = function () {
        var v = (inp.value || '');
        var cleaned = String(v).replace(/[^\x21-\x7E]/g, '').trim();
        if (!cleaned) { err.textContent = '还没填，或者里面带了中文'; inp.focus(); return; }
        if (cleaned !== String(v).trim()) { err.textContent = '里面有中文，已经帮你去掉了'; }
        done(cleaned);
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

  needToken: function () {
    var self = this;
    if (self.hasToken()) return Promise.resolve(true);
    return self.askToken();
  },

  /* ── 请求头：值一律只留可见 ASCII，保证浏览器不报错 ── */
  clean: function (v) {
    return String(v == null ? '' : v).replace(/[^\x20-\x7E]/g, '');
  },
  headers: function (extra) {
    var h = {};
    h['Content-Type'] = 'application/json';
    h['X-Who'] = this.clean(this.who);
    h['X-Token'] = this.clean(this.token());
    h['ngrok-skip-browser-warning'] = '1';
    if (extra) {
      for (var k in extra) {
        if (!Object.prototype.hasOwnProperty.call(extra, k)) continue;
        h[this.clean(k)] = this.clean(extra[k]);
      }
    }
    return h;
  },

  why: function (err, r) {
    var m = (err && err.message) || '';
    if (m === 'NO_TOKEN') return '还没填口令';
    if (m === 'TOKEN') return '口令不对（填的是 ' + this.tokenHint() + '）';
    if (r && r.status) {
      if (r.status === 403) return '口令不对（填的是 ' + this.tokenHint() + '）';
      if (r.status === 404) return '地址不对（404）';
      if (r.status === 502) return '后端连不上记忆库';
      return '服务器回了 ' + r.status;
    }
    if (m.indexOf('non ISO-8859-1') >= 0 || m.indexOf('ISO-8859-1') >= 0)
      return '口令里混进了中文，已经清掉了，再试一次';
    if (m.indexOf('Failed to fetch') >= 0) return '连不上服务器（网络被挡）';
    if (m.indexOf('JSON') >= 0) return '收到的不是数据（被中间页挡了）';
    return m || '不知道哪儿出了问题';
  },

  shout: function (msg) {
    if (!this.showErrors) return;
    try {
      var id = '__linji_err_bar';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.cssText =
          'position:fixed;left:14px;right:14px;bottom:96px;z-index:99998;' +
          'background:rgba(190,60,110,.95);color:#fff;font-size:13px;line-height:1.6;' +
          'padding:12px 16px;border-radius:16px;box-shadow:0 10px 30px rgba(120,20,60,.35);' +
          'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans SC",sans-serif;' +
          'word-break:break-all;transition:opacity .3s';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.style.opacity = '0'; }, 6000);
    } catch (e) {}
  },

  fail: function (e, r) {
    var msg = '';
    try { msg = this.why(e, r); } catch (x) {}
    this.lastError = msg;
    this.shout('出了点问题：' + msg);
    return e;
  },

  state: function (w) {
    var self = this;
    var who = w || this.who;
    return this.needToken().then(function (ok) {
      if (!ok) throw new Error('NO_TOKEN');
      return fetch(self.base + '/api/state', { headers: self.headers({ 'X-Who': who }) });
    }).then(function (r) {
      if (r.status === 403) { self.clearToken(); throw new Error('TOKEN'); }
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e._r = r; throw e; }
      return r.json();
    }).catch(function (e) {
      throw self.fail(e, e && e._r);
    });
  },

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
      return r.json();
    }).catch(function (e) {
      throw self.fail(e, e && e._r);
    });
  },

  galaxy: function () {
    var self = this;
    return this.needToken().then(function (ok) {
      if (!ok) throw new Error('NO_TOKEN');
      return fetch(self.base + '/api/galaxy', { headers: self.headers() });
    }).then(function (r) {
      if (r.status === 403) { self.clearToken(); throw new Error('TOKEN'); }
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e._r = r; throw e; }
      return r.json();
    }).catch(function (e) {
      throw self.fail(e, e && e._r);
    });
  },

  /* 想重填口令的时候在页面控制台敲 __API__.resetToken() 就行 */
  resetToken: function () {
    this.clearToken();
    return this.askToken();
  }
};

/* ═══════════════════════════════════════════════════════
   时间解析（全站统一）
   ───────────────────────────────────────────────────────
   后端现在吐出来的是**本机时间**："2026-10-02 15:20"（不带时区）。
   这样页面里那些老写法 new Date(t.replace(/-/g,'/')) 也能算对。

   万一碰到带时区标记的（老的 UTC 数据，尾巴有 Z），就按带时区的读。
   ═══════════════════════════════════════════════════════ */
window.parseTime = function (t) {
  var raw = String(t == null ? '' : t).trim();
  if (!raw) return null;

  var iso;
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(raw)) {
    iso = raw;                                  /* 带了时区标记，直接读 */
  } else {
    iso = raw.replace(' ', 'T');                /* 没带 → 就当它是本机时间 */
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

/* 把页面里那个老的 since 也接到新的上面 */
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
