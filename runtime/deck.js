/* deck.js — the HTML deck engine (ported from the event-talk deck, minus notes/script/video).
   Expects window.DECK = { lang, n, appendixFrom, titles:{en:[],zh:[]}, ui:{en:{},zh:{}} } and two
   .deck[lang] containers with the same number of .slide sections. No network access of any kind. */
(function(){
  'use strict';
  var D = window.DECK || {};
  var stage = document.getElementById('stage'),
      barfill = document.getElementById('barfill'),
      idx = document.getElementById('idx'), scrim = document.getElementById('scrim');
  var lang = D.lang === 'zh' ? 'zh' : 'en';
  var cur = 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function deckEl(){ return document.querySelector('.deck[lang="'+lang+'"]'); }
  function slides(){ return Array.prototype.slice.call(deckEl().querySelectorAll('.slide')); }
  function N(){ return slides().length; }

  /* Per-slide scene hooks: layouts can register YWScenes[name] = function(slideEl){ return cleanupFn } */
  var cleanup = null;
  function scene(sl){
    if (cleanup) { try { cleanup(); } catch(e){} cleanup = null; }
    var name = sl.getAttribute('data-scene');
    var S = window.YWScenes || {};
    if (name && S[name]) cleanup = S[name](sl, { reduce: reduce, lang: lang }) || null;
  }

  function render(){
    document.querySelectorAll('.deck').forEach(function(d){ d.classList.toggle('on', d.getAttribute('lang') === lang); });
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
    var ss = slides();
    ss.forEach(function(s, i){ s.classList.toggle('active', i === cur); });
    barfill.style.width = ((cur + 1) / ss.length * 100) + '%';
    paintIndex();
    scene(ss[cur]);
  }
  function go(n){
    var t = Math.max(0, Math.min(N() - 1, n));
    if (t === cur && deckEl().querySelector('.slide.active')) return;
    cur = t; render();
  }

  /* full window: scale by the 1280×800 design size, then stretch the stage to the window's shape (no letterbox) */
  function fit(){
    var s = Math.min(innerWidth / 1280, innerHeight / 800);
    stage.style.width = (innerWidth / s) + 'px';
    stage.style.height = (innerHeight / s) + 'px';
    stage.style.transform = 'scale(' + s + ')';
  }

  /* overview (O) */
  function paintIndex(){
    var ui = (D.ui || {})[lang] || {}, titles = (D.titles || {})[lang] || [];
    var h = '<h5>' + (ui.slides || 'Slides') + '</h5><ol>';
    titles.forEach(function(t, i){
      if (i === D.appendixFrom) h += '</ol><h5>' + (ui.appendix || 'Appendix') + '</h5><ol>';
      h += '<li data-i="' + i + '"' + (i === cur ? ' class="cur"' : '') + '><span class="k">' + (i + 1) + '</span><span>' + t + '</span></li>';
    });
    h += '</ol><div class="keys">' + (ui.keys || '') + '</div>';
    idx.innerHTML = h;
  }
  function overview(on){
    var v = on === undefined ? !idx.classList.contains('on') : on;
    idx.classList.toggle('on', v); scrim.classList.toggle('on', v);
    if (v) { var c = idx.querySelector('li.cur'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' }); }
  }
  idx.addEventListener('click', function(e){
    var li = e.target.closest('li'); if (!li) return;
    overview(false); go(+li.getAttribute('data-i'));
  });
  scrim.addEventListener('click', function(){ overview(false); });

  function toggleLang(){ lang = lang === 'en' ? 'zh' : 'en'; render(); }

  /* keys */
  addEventListener('keydown', function(e){
    var tg = e.target && e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (tg === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    var k = e.key;
    if (k === 'Escape') { overview(false); return; }
    if (k === 'f' || k === 'F') { e.preventDefault();
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){});
      return; }
    if (k === 'o' || k === 'O') { e.preventDefault(); overview(); return; }
    if (k === 'h' || k === 'H') { e.preventDefault(); document.body.classList.toggle('clean'); return; }
    if (k === 'l' || k === 'L') { e.preventDefault(); toggleLang(); return; }
    if (idx.classList.contains('on')) return;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N() - 1); }
  });

  /* click: right two-thirds forward, left third back; interactive elements don't advance */
  document.getElementById('fit').addEventListener('click', function(e){
    if (e.target.closest('button,a,input,label,[data-int]')) return;
    if (idx.classList.contains('on')) return;
    go(cur + (e.clientX < innerWidth / 3 ? -1 : 1));
  });

  /* touch swipe */
  var tx = 0, ty = 0;
  addEventListener('touchstart', function(e){ tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* the builder preview drives the deck through postMessage (same document only, no network) */
  addEventListener('message', function(e){
    var m = e.data || {};
    if (m.yw === 'go') go(m.n);
    if (m.yw === 'lang' && (m.lang === 'en' || m.lang === 'zh') && m.lang !== lang) { lang = m.lang; render(); }
  });

  addEventListener('resize', fit);
  fit();
  /* deep link: #7 (slide 7) or #zh-7 (slide 7 in Chinese) */
  var hm = location.hash.match(/^#(?:(en|zh)-)?(\d+)$/);
  if (hm && hm[1]) lang = hm[1];
  cur = Math.max(0, Math.min(N() - 1, (hm ? +hm[2] : 1) - 1));
  render();
  window.YWDeck = { go: go, get cur(){ return cur; }, get lang(){ return lang; }, toggleLang: toggleLang };
})();
