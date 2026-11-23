/* cards-3-numbered — big number, title, "what" line, body, tag */
YW.L['cards-3-numbered'] = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="grid c3">';
  (s.cards || []).forEach(function(c, i){
    h += '<div class="card glass"' + YW.anim(i + 3) + '><div class="big hl">' + esc(c.n) + '</div><h4>' + esc(c.title) + '</h4>' +
      (c.what ? '<div class="what">' + esc(c.what) + '</div>' : '') + '<p>' + esc(c.body) + '</p>' +
      (c.tag ? '<div class="tag"><span class="pilltag">' + esc(c.tag) + '</span></div>' : '') + '</div>';
  });
  return { html: h + '</div>' + YW.band(s.band, 7) };
};
