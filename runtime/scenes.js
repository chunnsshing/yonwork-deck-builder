/* scenes.js — per-slide behaviour for interactive layouts. YWScenes[name](slideEl, {reduce}) → cleanup fn.
   Clicks on [data-int] elements never advance the deck. */
window.YWScenes = {
  gates: function(sl, o){
    var timers = [], T = function(fn, ms){ timers.push(setTimeout(fn, ms)); };
    var steps = [].slice.call(sl.querySelectorAll('.step')), gates = [].slice.call(sl.querySelectorAll('.gate')),
        fill = sl.querySelector('.track i'), band = sl.querySelector('.band'), n = steps.length + gates.length;
    function reset(){
      steps.forEach(function(s){ s.classList.remove('on'); });
      gates.forEach(function(g){ g.className = 'node gate'; g.querySelector('b').textContent = '?'; });
      fill.style.width = '0%'; if (band) band.classList.remove('on');
    }
    function at(k){ fill.style.width = (k / (n - 1) * 100) + '%'; }
    function final(){ steps.forEach(function(s){ s.classList.add('on'); }); gates.forEach(function(g){ g.className = 'node gate ok'; g.querySelector('b').textContent = '✓'; }); at(n - 1); if (band) band.classList.add('on'); }
    function run(){
      timers.forEach(clearTimeout); timers = []; reset();
      if (o.reduce) { final(); return; }
      var t = 300;
      steps.forEach(function(st, i){
        T(function(){ st.classList.add('on'); at(i * 2); }, t); t += 900;
        var g = gates[i]; if (!g) return;
        T(function(){ g.className = 'node gate ask'; at(i * 2 + 1); }, t); t += 1500;
        T(function(){ g.className = 'node gate ok'; g.querySelector('b').textContent = '✓'; }, t); t += 500;
      });
      T(function(){ if (band) band.classList.add('on'); }, t + 300);
    }
    var rb = sl.querySelector('.replay'); if (rb) rb.onclick = function(e){ e.stopPropagation(); run(); rb.blur(); };
    run();
    return function(){ timers.forEach(clearTimeout); };
  },
  selfcheck: function(sl){
    var rows = [].slice.call(sl.querySelectorAll('.row')), banner = sl.querySelector('.banner');
    var th = +(banner && banner.getAttribute('data-threshold')) || 2;
    function upd(){ var c = rows.filter(function(r){ return r.classList.contains('on'); }).length; if (banner) banner.classList.toggle('on', c >= th); }
    rows.forEach(function(r){
      r.onclick = function(e){ e.stopPropagation(); r.classList.toggle('on'); r.setAttribute('aria-checked', r.classList.contains('on')); upd(); };
      r.onkeydown = function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); r.click(); } };
    });
    upd();
    return null;
  }
};
