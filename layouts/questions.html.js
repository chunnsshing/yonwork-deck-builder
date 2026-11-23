/* questions — four question bubbles */
YW.L.questions = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="qs">';
  (s.questions || []).forEach(function(q, i){ h += '<div class="qb glass"' + YW.anim(i + 3) + '>' + esc(q) + '</div>'; });
  return { html: h + '</div>' + YW.band(s.band, 8) };
};
