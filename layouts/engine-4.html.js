/* engine-4 — dark engine card + 2×2 harness cards + three-step strip (the last step highlighted) */
YW.L['engine-4'] = function(s){
  var esc = YW.esc, e = s.engine || {};
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="eng">' +
    '<div class="engine"' + YW.anim(3) + '><div class="cap">' + esc(e.cap) + '</div><h4>' + esc(e.title) + '</h4><p>' + esc(e.body) + '</p>' +
    '<div class="kick">' + esc(e.kicker) + '</div></div><div class="g4">';
  (s.cards || []).forEach(function(c, i){
    h += '<div class="card glass"' + YW.anim(i + 4) + '><h4><span>' + esc(c.icon) + '</span>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p><div class="fix">' + esc(c.fix) + '</div></div>';
  });
  h += '</div></div><div class="strip">';
  (s.strip || []).forEach(function(t, i, a){
    var p = String(t).split(' · ');
    h += '<div' + (i === a.length - 1 ? ' class="on"' : '') + YW.anim(i + 8, 'fade') + '><b>' + esc(p[0]) + '</b>' + esc(p.slice(1).join(' · ')) + '</div>';
  });
  return { html: h + '</div>' };
};
