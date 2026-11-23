/* cards-4-steps — four numbered cards joined by arrows, last one highlighted; chips underneath */
YW.L['cards-4-steps'] = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="steps4">';
  (s.cards || []).forEach(function(c, i){
    if (i) h += '<div class="arrow"' + YW.anim(i + 3, 'fade') + '>→</div>';
    h += '<div class="card glass' + (c.highlight ? ' hot' : '') + '"' + YW.anim(i + 3) + '><div class="num">' + esc(c.n) + '</div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div>';
  });
  h += '</div>';
  if (s.chips && s.chips.length) h += '<div class="chips"' + YW.anim(8, 'fade') + '>' + s.chips.map(function(c){ return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>';
  return { html: h };
};
