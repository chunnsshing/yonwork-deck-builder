/* compare-2-proscons — two options side by side: strengths, limits, best suited to; footnote */
YW.L['compare-2-proscons'] = function(s, ctx){
  var esc = YW.esc, L = { pros: ctx.labels.pros, cons: ctx.labels.limits, suits: ctx.labels.suits };
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="cmp2 pc">';
  [['left', s.left], ['right', s.right]].forEach(function(p, i){
    var c = p[1]; if (!c) return;
    h += '<div class="col glass"' + YW.anim(i + 3) + '><h4 style="margin-top:0">' + esc(c.title) + '</h4>' + (c.sub ? '<div class="sub">' + esc(c.sub) + '</div>' : '') +
      '<div class="lbl">' + L.pros + '</div>' + YW.ul(c.pros, 'yes') + '<div class="lbl">' + L.cons + '</div>' + YW.ul(c.cons, 'no') +
      (s.suits && s.suits[p[0]] ? '<div class="suits"><b>' + L.suits + '</b>' + esc(s.suits[p[0]]) + '</div>' : '') + '</div>';
  });
  return { html: h + '</div>' + (s.footnote ? '<div class="fnote"' + YW.anim(6, 'fade') + '>' + esc(s.footnote) + '</div>' : '') };
};
