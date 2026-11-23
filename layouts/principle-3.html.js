/* principle-3 — AI / RULES / PEOPLE in lane colours */
YW.L['principle-3'] = function(s, ctx){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="p3">';
  (s.cols || []).forEach(function(c, i){
    h += '<div class="col glass lane-' + esc(String(c.badge).toLowerCase()) + '"' + YW.anim(i + 3) + '><span class="badge">' + esc(ctx.labels['lane_' + String(c.badge).toLowerCase()] || c.badge) + '</span><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div>';
  });
  return { html: h + '</div>' };
};
