/* steps-3 — three steps with arrows; `future: true` draws a dashed card */
YW.L['steps-3'] = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="steps s3">';
  (s.steps || []).forEach(function(c, i){
    if (i) h += '<div class="arrow"' + YW.anim(i + 3, 'fade') + '>→</div>';
    h += '<div class="card glass' + (c.future ? ' future' : '') + '"' + YW.anim(i + 3) + '><div class="cap">' + esc(c.cap) + '</div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p>' +
      (c.example ? '<div class="ex">' + esc(c.example) + '</div>' : '') + '</div>';
  });
  return { html: h + '</div>' + YW.band(s.band, 7) };
};
