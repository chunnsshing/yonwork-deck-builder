/* compare-2 — two columns: cap, optional title, points, optional note; optional question band */
YW.L['compare-2'] = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="cmp2">';
  [s.left, s.right].forEach(function(c, i){
    if (!c) return;
    h += '<div class="col glass"' + YW.anim(i + 3) + '><div class="cap' + (i ? '' : ' muted') + '">' + esc(c.cap) + '</div>' +
      (c.title ? '<h4>' + esc(c.title) + '</h4>' : '<div style="height:12px"></div>') + YW.ul(c.points, i ? 'yes' : '') +
      (c.note ? '<div class="note">' + esc(c.note) + '</div>' : '') + '</div>';
  });
  return { html: h + '</div>' + (s.question ? '<div class="qband"' + YW.anim(6, 'fade') + '>' + esc(s.question) + '</div>' : '') };
};
