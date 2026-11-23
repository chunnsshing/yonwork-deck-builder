/* steps-5 — five numbered steps with arrows; `highlight` marks where to start */
YW.L['steps-5'] = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="steps s5">';
  (s.steps || []).forEach(function(c, i){
    if (i) h += '<div class="arrow"' + YW.anim(i + 3, 'fade') + '>→</div>';
    h += '<div class="card glass' + (c.highlight ? ' hot' : '') + '"' + YW.anim(i + 3) + '><div class="num">0' + (i + 1) + '</div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div>';
  });
  return { html: h + '</div>' + YW.band(s.band, 9) };
};
