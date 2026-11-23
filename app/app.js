/* app.js — the deck builder (HANDOFF §3). Vanilla JS; everything stays in this browser.
   State → selection → YW.assemble (HTML deck) / YW.buildPptx (PowerPoint). */
(function(){
  'use strict';
  var C = YW.CONTENT, S = C.site, M = C.modules, $ = function(id){ return document.getElementById(id); };
  var SECS = ['why', 'how', 'where', 'what', 'start'];
  var SEC_COL = { frame: '#A1A1A6', why: '#E3202C', how: '#D68A00', where: '#3D5AFE', what: '#0B8F80', start: '#A64AC9' };
  var PINNED = { cover: 1, agenda: 1, 'thank-you': 1 };

  var state = { lang: 'en', stage: 2, it: false, client: '', order: {}, on: {}, apx: {}, slide: 0, dirty: false };

  /* ───────── helpers ───────── */
  function t(key){ var p = key.split('.'), v = (C.i18n[p[0]] || {})[p[1]]; return v ? (v[state.lang] || v.en) : key; }
  function esc(s){ return YW.esc(s); }
  function title(id){ return YW.title(id, state.lang); }
  function overlayIds(n){ return (S.it_overlay[n || state.stage] || []).slice(); }
  function mins(n){ return (Math.round(n * 10) / 10).toString(); }
  function stagesOf(id){
    return Object.keys(S.presets).filter(function(n){
      var P = S.presets[n]; return P.main.indexOf(id) >= 0 || P.appendix.indexOf(id) >= 0 || (S.it_overlay[n] || []).indexOf(id) >= 0;
    });
  }
  function toast(msg){ var el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function(){ el.classList.remove('on'); }, 1800); }

  /* ───────── presets ───────── */
  function applyPreset(n){
    var P = S.presets[n];
    state.stage = +n; state.on = {}; state.apx = {};
    P.main.concat(P.appendix).forEach(function(id){ state.on[id] = true; });
    P.appendix.forEach(function(id){ state.apx[id] = true; });
    if (state.it) setOverlay(true);
    var pref = P.main.concat(P.appendix, overlayIds(n));
    state.order = {};
    ['frame'].concat(SECS).forEach(function(sec){
      var ids = C.order.filter(function(id){ return M[id].section === sec; });
      if (sec === 'frame') { state.order.frame = ['cover', 'agenda', 'thank-you'].filter(function(id){ return M[id]; }); return; }
      state.order[sec] = pref.filter(function(id){ return ids.indexOf(id) >= 0; }).concat(ids.filter(function(id){ return pref.indexOf(id) < 0; }));
    });
    state.dirty = false; state.slide = 0;
  }
  function setOverlay(on){
    overlayIds().forEach(function(id){
      if (M[id].origin === 'proposed') return;
      if (on) { state.on[id] = true; delete state.apx[id]; } else delete state.on[id];
    });
  }

  /* ───────── selection → deck config ───────── */
  function selection(){
    var main = [], appendix = [];
    SECS.forEach(function(sec){
      state.order[sec].forEach(function(id){
        if (!state.on[id] || M[id].origin === 'proposed') return;
        (state.apx[id] ? appendix : main).push(id);
      });
    });
    return { main: main, appendix: appendix };
  }
  function cfg(forExport){
    var s = selection();
    return { lang: state.lang, stage: state.stage, it: state.it, main: s.main, appendix: s.appendix,
             client: YW.cleanClient(state.client) || (forExport ? '' : 'Acme Trading'), date: YW.today() };
  }

  /* ───────── static UI text ───────── */
  function paintText(){
    document.documentElement.lang = state.lang === 'zh' ? 'zh-Hans' : 'en';
    [].forEach.call(document.querySelectorAll('[data-t]'), function(el){ el.textContent = t(el.getAttribute('data-t')); });
    $('client').placeholder = t('client.placeholder');
    $('dl-html').title = '';
    [].forEach.call($('lang').children, function(b){ b.classList.toggle('on', b.dataset.l === state.lang); b.setAttribute('aria-pressed', b.dataset.l === state.lang); });
    $('pack').innerHTML = (S.starter_pack || []).map(function(p){
      return '<a href="' + esc(p.url) + '"' + (p.current ? ' class="on" aria-current="page"' : ' rel="noopener"') + '>' + esc(p.label[state.lang] || p.label.en) + '</a>';
    }).join('');
  }

  /* ───────── step 1: stages ───────── */
  function paintStages(){
    $('stages').innerHTML = Object.keys(S.stages).map(function(n){
      var St = S.stages[n], P = S.presets[n], extra = overlayIds(n).reduce(function(a, id){ return a + M[id].minutes; }, 0);
      var len = P.length_min + ' ' + t('stage.min') + (extra ? ' (+' + mins(extra) + ' ' + t('stage.with_it') + ')' : '');
      return '<button class="stage' + (+n === state.stage ? ' on' : '') + '" data-s="' + n + '" role="radio" aria-checked="' + (+n === state.stage) + '">' +
        '<span class="n">' + t('stage.label') + ' ' + n + '</span><b>' + esc(St.name[state.lang]) + '</b><span class="d">' + esc(St.blurb[state.lang]) + '</span>' +
        '<span class="len">' + esc(len) + '</span></button>';
    }).join('');
  }
  $('stages').addEventListener('click', function(e){
    var b = e.target.closest('.stage'); if (!b || +b.dataset.s === state.stage) return;
    if (state.dirty && !window.confirm(t('stage.confirm'))) return;
    applyPreset(+b.dataset.s); paintAll();
  });
  $('it').addEventListener('change', function(e){ state.it = e.target.checked; setOverlay(state.it); paintAll(); });

  /* ───────── step 2: client ───────── */
  $('client').addEventListener('input', function(e){ state.client = e.target.value; paintExport(); refresh(); });

  /* ───────── step 3: topics ───────── */
  function rowHtml(id, sec){
    var m = M[id], pinned = !!PINNED[id], proposed = m.origin === 'proposed', on = !!state.on[id] && !proposed;
    var tags = '';
    if (pinned) tags += '<span class="tg pin">' + t('topics.pinned') + '</span>';
    if (m.audience.length === 1 && m.audience[0] === 'it') tags += '<span class="tg it">' + t('topics.it') + '</span>';
    if (proposed) tags += '<span class="tg draft" title="' + esc(t('topics.draft_tip')) + '">' + t('topics.draft') + '</span>';
    if (state.lang === 'zh' && m.zh_status !== 'reviewed') tags += '<span class="tg zh">' + t('topics.zh_draft') + '</span>';
    if (m.stale && m.stale.length) tags += '<span class="tg stale" title="' + esc(t('topics.stale_tip')) + '">' + t('topics.stale') + '</span>';
    var st = stagesOf(id), dots = [1, 2, 3].map(function(n){ return '<i class="' + (st.indexOf(String(n)) >= 0 ? 'on' : '') + '" title="' + t('stage.label') + ' ' + n + '"></i>'; }).join('');
    var canDrag = sec !== 'frame';
    return '<div class="row' + (on || pinned ? '' : ' off') + '" data-id="' + esc(id) + '" data-sec="' + sec + '"' + (canDrag ? ' draggable="true"' : '') + '>' +
      '<span class="grip' + (canDrag ? '' : ' no') + '" title="' + esc(t('topics.drag')) + '" aria-hidden="true">⋮⋮</span>' +
      '<input type="checkbox" aria-label="' + esc(title(id)) + '"' + (on || pinned ? ' checked' : '') + (pinned || proposed ? ' disabled' : '') + '>' +
      '<div class="t">' + esc(title(id)) + '<span class="tags">' + tags + '</span></div>' +
      '<div class="r"><span class="dots" aria-label="' + esc(t('stage.label') + ' ' + st.join(', ')) + '">' + dots + '</span>' +
      '<span class="min num">' + mins(m.minutes) + ' ' + t('stage.min') + '</span>' +
      (sec === 'frame' ? '' : '<button class="apx' + (state.apx[id] ? ' on' : '') + '"' + (on ? '' : ' disabled') + ' aria-pressed="' + !!state.apx[id] + '" title="' + esc(t('topics.appendix')) + '">' +
        (state.apx[id] ? t('topics.in_appendix') : t('topics.appendix')) + '</button>') + '</div></div>';
  }
  var openSecs = { frame: false, why: true, how: true, where: true, what: true, start: true };
  function paintTopics(){
    var h = '';
    ['frame'].concat(SECS).forEach(function(sec){
      var ids = state.order[sec], n = ids.filter(function(id){ return state.on[id] && M[id].origin !== 'proposed'; }).length;
      var name = sec === 'frame' ? t('topics.frame') : (S.sections[sec][state.lang] || S.sections[sec].en);
      h += '<details class="sec" data-sec="' + sec + '"' + (openSecs[sec] ? ' open' : '') + '><summary><span class="dot" style="background:' + SEC_COL[sec] + '"></span>' +
        esc(name) + '<span class="meta">' + n + ' / ' + ids.length + '</span></summary><div class="rows">' +
        ids.map(function(id){ return rowHtml(id, sec); }).join('') + '</div></details>';
    });
    $('topics').innerHTML = h;
  }
  $('topics').addEventListener('toggle', function(e){ var d = e.target.closest('.sec'); if (d) openSecs[d.dataset.sec] = d.open; }, true);
  $('topics').addEventListener('change', function(e){
    var row = e.target.closest('.row'); if (!row || e.target.type !== 'checkbox') return;
    var id = row.dataset.id;
    if (e.target.checked) state.on[id] = true; else { delete state.on[id]; delete state.apx[id]; }
    state.dirty = true; paintTopics(); paintTime(); refresh(id);
  });
  $('topics').addEventListener('click', function(e){
    var b = e.target.closest('.apx');
    if (b) { var id = b.closest('.row').dataset.id; if (state.apx[id]) delete state.apx[id]; else state.apx[id] = true; state.dirty = true; paintTopics(); paintTime(); refresh(id); return; }
    var tt = e.target.closest('.t'); if (tt) jumpTo(tt.closest('.row').dataset.id);
  });

  /* drag to reorder (within a section) */
  var drag = null;
  $('topics').addEventListener('dragstart', function(e){
    var row = e.target.closest('.row[draggable]'); if (!row) return;
    drag = { id: row.dataset.id, sec: row.dataset.sec }; row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', drag.id); } catch(err){}
    hideThumb();
  });
  function clearOver(){ [].forEach.call(document.querySelectorAll('.over-top,.over-bot'), function(r){ r.classList.remove('over-top', 'over-bot'); }); }
  $('topics').addEventListener('dragover', function(e){
    if (!drag) return; var row = e.target.closest('.row'); if (!row || row.dataset.sec !== drag.sec || row.dataset.id === drag.id) return;
    e.preventDefault(); clearOver();
    var r = row.getBoundingClientRect(); row.classList.add(e.clientY < r.top + r.height / 2 ? 'over-top' : 'over-bot');
  });
  $('topics').addEventListener('drop', function(e){
    if (!drag) return; var row = e.target.closest('.row'); if (!row || row.dataset.sec !== drag.sec) return;
    e.preventDefault();
    var list = state.order[drag.sec], from = list.indexOf(drag.id); list.splice(from, 1);
    var to = list.indexOf(row.dataset.id) + (row.classList.contains('over-bot') ? 1 : 0);
    list.splice(to, 0, drag.id); state.dirty = true;
    var moved = drag.id; drag = null; clearOver(); paintTopics(); refresh(moved);
  });
  $('topics').addEventListener('dragend', function(){ drag = null; clearOver(); [].forEach.call(document.querySelectorAll('.dragging'), function(r){ r.classList.remove('dragging'); }); });

  /* hover thumbnail: a one-module deck in a small iframe */
  var thumbCache = {}, thumbT = null;
  function thumbFor(id){
    var key = id + '|' + state.lang + '|' + state.stage + '|' + YW.cleanClient(state.client);
    if (!thumbCache[key]) {
      var c = cfg(); c.main = PINNED[id] ? [] : [id]; c.appendix = [];
      var r = YW.assemble(c), idx = id === 'cover' ? 0 : id === 'agenda' ? 1 : id === 'thank-you' ? r.plan.all.length - 1 : r.plan.all.indexOf(id);
      thumbCache[key] = { html: r.html.replace('<script>window.DECK=', '<style>.foot{display:none}</style><script>location.hash="#' + state.lang + '-' + (idx + 1) + '";window.DECK=') };
    }
    return thumbCache[key];
  }
  function hideThumb(){ clearTimeout(thumbT); $('thumb').classList.remove('on'); }
  $('topics').addEventListener('mouseover', function(e){
    var row = e.target.closest('.row'); if (!row || drag || matchMedia('(hover: none)').matches) return;
    if (row === hideThumb.row) return; hideThumb.row = row; hideThumb();
    thumbT = setTimeout(function(){
      var th = $('thumb'), r = row.getBoundingClientRect(), f = th.querySelector('iframe');
      f.srcdoc = thumbFor(row.dataset.id).html;
      var x = Math.min(r.right + 12, innerWidth - 300), y = Math.max(8, Math.min(r.top - 60, innerHeight - 190));
      if (x < r.right && r.left > 300) x = r.left - 300;
      th.style.left = x + 'px'; th.style.top = y + 'px'; th.classList.add('on');
    }, 380);
  });
  $('topics').addEventListener('mouseleave', function(){ hideThumb.row = null; hideThumb(); });

  /* ───────── time bar ───────── */
  function paintTime(){
    var sel = selection(), all = ['cover', 'agenda'].concat(sel.main, ['thank-you']);
    var by = {}, total = 0;
    all.forEach(function(id){ var s = M[id].section; by[s] = (by[s] || 0) + M[id].minutes; total += M[id].minutes; });
    var P = S.presets[state.stage], target = P.length_min + (state.it ? overlayIds().reduce(function(a, id){ return a + M[id].minutes; }, 0) : 0);
    var cls = total > target * 1.25 ? 'red' : total > target * 1.1 ? 'amber' : total >= target * 0.9 ? 'ok' : 'under';
    var scale = Math.max(total, target) * 1.08, segs = '', legend = '';
    ['frame'].concat(SECS).forEach(function(s){
      if (!by[s]) return;
      segs += '<div class="seg" style="width:' + (by[s] / scale * 100) + '%;background:' + SEC_COL[s] + '" title="' + esc(s === 'frame' ? t('topics.frame') : S.sections[s][state.lang]) + ': ' + mins(by[s]) + '"></div>';
      legend += '<span style="--c:' + SEC_COL[s] + '">' + esc(s === 'frame' ? t('topics.frame') : S.sections[s][state.lang]) + ' ' + mins(by[s]) + '</span>';
    });
    var status = cls === 'red' || cls === 'amber' ? t('time.over') : cls === 'ok' ? t('time.ok') : t('time.under');
    $('timebar').className = 'timebar ' + cls;
    $('timebar').innerHTML = '<div class="lbl2">' + t('time.label') + ' <b class="num">' + mins(total) + '</b> ' + t('time.of') + ' <span class="num">' + mins(target) + ' ' + t('stage.min') + '</span> ' + t('time.target') +
      '<span class="st">' + status + '</span></div><div class="track">' + segs + '<div class="target" style="left:' + (target / scale * 100) + '%"></div></div><div class="legend">' + legend + '</div>';
  }

  /* ───────── preview ───────── */
  var last = null, rt = null;
  function fitPreview(){ var f = $('frame'), s = f.clientWidth / 1280; $('pv').style.transform = 'scale(' + s + ')'; }
  if (window.ResizeObserver) new ResizeObserver(fitPreview).observe($('frame')); else addEventListener('resize', fitPreview);
  function paintPg(){
    if (!last) return; var n = last.plan.all.length; state.slide = Math.max(0, Math.min(n - 1, state.slide));
    $('pg').textContent = (state.slide + 1) + ' / ' + n;
    $('pgtitle').textContent = title(last.plan.all[state.slide]) + (state.slide >= last.plan.appendixFrom ? ' · ' + t('topics.in_appendix') : '');
  }
  function refresh(focusId){
    clearTimeout(rt);
    rt = setTimeout(function(){
      last = YW.assemble(cfg());
      if (focusId) { var i = last.plan.all.indexOf(focusId); if (i >= 0) state.slide = i; }
      paintPg();
      var pv = $('pv');
      pv.srcdoc = last.html.replace('<script>window.DECK=', '<script>location.hash="#' + state.lang + '-' + (state.slide + 1) + '";window.DECK=');
    }, 160);
  }
  function go(n){ if (!last) return; state.slide = n; paintPg(); $('pv').contentWindow.postMessage({ yw: 'go', n: state.slide }, '*'); }
  function jumpTo(id){ if (!last) return; var i = last.plan.all.indexOf(id); if (i >= 0) go(i); }
  $('prev').onclick = function(){ go(state.slide - 1); };
  $('next').onclick = function(){ go(state.slide + 1); };

  /* ───────── exports ───────── */
  function paintExport(){
    var ok = !!YW.cleanClient(state.client);
    ['dl-pptx', 'dl-html', 'present'].forEach(function(id){ $(id).disabled = !ok; });
    $('need').hidden = ok;
  }
  function download(blob, name){
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function exported(kind, c){ if (window.YWRecent) window.YWRecent.add(kind, c); }
  $('dl-html').onclick = function(){ var c = cfg(true), r = YW.assemble(c); download(new Blob([r.html], { type: 'text/html' }), r.filename); exported('html', c); };
  $('present').onclick = function(){ var c = cfg(true), r = YW.assemble(c); window.open(URL.createObjectURL(new Blob([r.html], { type: 'text/html' })), '_blank', 'noopener'); exported('present', c); };
  $('dl-pptx').onclick = function(){
    var b = $('dl-pptx'), c = cfg(true); b.disabled = true; b.textContent = t('export.working');
    setTimeout(function(){
      var r = YW.buildPptx(c);
      r.pptx.write({ outputType: 'blob' }).then(function(bl){
        download(new Blob([bl], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), r.filename); exported('pptx', c);
      }).catch(function(err){ window.alert('PowerPoint export failed: ' + err.message); })
        .then(function(){ b.textContent = t('export.pptx'); paintExport(); });
    }, 30);
  };

  /* ───────── language ───────── */
  $('lang').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b || b.dataset.l === state.lang) return; state.lang = b.dataset.l; paintAll(); });

  function paintAll(){ paintText(); paintStages(); $('it').checked = state.it; paintTopics(); paintTime(); paintExport(); refresh(); }

  /* public hooks for milestone 6 (builder link, recent decks) */
  window.YWBuilder = {
    state: state, cfg: cfg, selection: selection, applyPreset: applyPreset, setOverlay: setOverlay, paintAll: paintAll, t: t, toast: toast,
    setClient: function(v){ state.client = v; $('client').value = v; }
  };

  applyPreset(state.stage);
  if (window.YWBoot) window.YWBoot();   // may restore state from the URL (milestone 6)
  paintAll();
})();
