/* share.js — builder link (config in the URL hash) and recent decks (this browser only).
   Loaded before app.js; app.js calls YWBoot() once its state exists. Nothing here touches the network:
   the hash is never sent to a server, and recent decks live in localStorage (wrapped in try/catch). */
(function(){
  'use strict';
  var KEY = 'yw-deck-recent', MAX = 8, B = null;

  /* ───────── link: #/b?v=1&lang=en&s=2&it=1&m=<ids>&a=<appendix ids>&c=<client> ───────── */
  function encode(c){
    var q = ['v=1', 'lang=' + c.lang, 's=' + c.stage, 'it=' + (c.it ? 1 : 0),
             'm=' + c.main.map(encodeURIComponent).join(','), 'a=' + c.appendix.map(encodeURIComponent).join(',')];
    if (c.client) q.push('c=' + encodeURIComponent(c.client));
    return '#/b?' + q.join('&');
  }
  function decode(hash){
    var m = /^#\/b\?(.*)$/.exec(hash || ''); if (!m) return null;
    var o = {};
    m[1].split('&').forEach(function(kv){
      var i = kv.indexOf('='); if (i < 0) return;
      try { o[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch(e){ o[kv.slice(0, i)] = ''; }
    });
    if (o.v !== '1' || !YW.CONTENT.site.presets[o.s]) return false;
    var list = function(s){ return (s || '').split(',').filter(function(id){ return YW.CONTENT.modules[id]; }); };
    return { lang: o.lang === 'zh' ? 'zh' : 'en', stage: +o.s, it: o.it === '1', main: list(o.m), appendix: list(o.a), client: (o.c || '').slice(0, 60) };
  }

  /* apply a decoded config onto the builder state */
  function apply(c){
    var st = B.state, M = YW.CONTENT.modules;
    st.lang = c.lang; st.it = c.it;
    B.applyPreset(c.stage);                 // sets order defaults for the stage, then we override the selection
    if (!c.main.length && !c.appendix.length) { B.setClient(c.client || ''); return; }   // empty m= and a=: the stage's preset as is
    st.on = {}; st.apx = {};
    ['cover', 'agenda', 'thank-you'].forEach(function(id){ st.on[id] = true; });
    c.main.forEach(function(id){ if (M[id].origin !== 'proposed') st.on[id] = true; });
    c.appendix.forEach(function(id){ if (M[id].origin !== 'proposed') { st.on[id] = true; st.apx[id] = true; } });
    var seq = c.main.concat(c.appendix);
    Object.keys(st.order).forEach(function(sec){
      if (sec === 'frame') return;
      var ids = st.order[sec], picked = seq.filter(function(id){ return ids.indexOf(id) >= 0; });
      st.order[sec] = picked.concat(ids.filter(function(id){ return picked.indexOf(id) < 0; }));
    });
    B.setClient(c.client || '');
    st.dirty = true;
  }

  function copy(text){
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function(res, rej){
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(new Error('copy failed')); } catch(e){ rej(e); }
      ta.remove();
    });
  }

  /* ───────── recent decks ───────── */
  function load(){ try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch(e){ return []; } }
  function save(list){ try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch(e){} }
  function paintRecent(){
    var ul = document.getElementById('recent'), list = load(), t = B.t, esc = YW.esc;
    document.getElementById('recent-clear').hidden = !list.length;
    if (!list.length) { ul.innerHTML = '<li class="empty">' + esc(t('recent.empty')) + '</li>'; return; }
    ul.innerHTML = list.map(function(r, i){
      var when = new Date(r.at), S = YW.CONTENT.site.stages[r.cfg.stage];
      var d = when.toLocaleString(B.state.lang === 'zh' ? 'zh-CN' : 'en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return '<li><div class="w"><b>' + esc(r.cfg.client || '—') + '</b><small>' + esc((S ? S.name[B.state.lang] : '') + ' · ' + r.cfg.lang.toUpperCase() +
        (r.cfg.it ? ' · IT' : '') + ' · ' + r.kind.toUpperCase() + ' · ' + d) + '</small></div>' +
        '<button class="btn sm" data-open="' + i + '">' + esc(t('recent.open')) + '</button>' +
        '<button class="x" data-del="' + i + '" aria-label="' + esc(t('recent.forget')) + '" title="' + esc(t('recent.forget')) + '">×</button></li>';
    }).join('');
  }
  window.YWRecent = {
    add: function(kind, c){
      var entry = { at: Date.now(), kind: kind, cfg: { lang: c.lang, stage: c.stage, it: !!c.it, main: c.main, appendix: c.appendix, client: c.client } };
      var list = load().filter(function(r){ return encode(r.cfg) !== encode(entry.cfg); });
      list.unshift(entry); save(list); paintRecent();
    },
    paint: function(){ paintRecent(); }
  };

  /* ───────── boot: called by app.js after its state exists ───────── */
  window.YWBoot = function(){
    B = window.YWBuilder;
    var c = decode(location.hash);
    if (c) { apply(c); setTimeout(function(){ B.toast(B.t('recent.restored')); }, 300); }
    else if (c === false) setTimeout(function(){ B.toast(B.t('recent.bad_link')); }, 300);

    document.getElementById('copy-link').addEventListener('click', function(){
      var url = location.href.split('#')[0] + encode(B.cfg(true));
      history.replaceState(null, '', url);
      copy(url).then(function(){ B.toast(B.t('export.copied')); }, function(){ window.prompt(B.t('export.link'), url); });
    });
    window.addEventListener('hashchange', function(){
      var c2 = decode(location.hash); if (c2) { apply(c2); B.paintAll(); paintRecent(); }
    });
    document.getElementById('recent').addEventListener('click', function(e){
      var o = e.target.closest('[data-open]'), d = e.target.closest('[data-del]'), list = load();
      if (o) { var r = list[+o.dataset.open]; if (r) { apply(r.cfg); B.paintAll(); paintRecent(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
      if (d) { list.splice(+d.dataset.del, 1); save(list); paintRecent(); }
    });
    document.getElementById('recent-clear').addEventListener('click', function(){ save([]); paintRecent(); });
    document.getElementById('lang').addEventListener('click', function(){ setTimeout(paintRecent, 0); });
    setTimeout(paintRecent, 0);
  };
  window.YWLink = { encode: encode, decode: decode };
})();
