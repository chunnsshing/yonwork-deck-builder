/* options-3 — three deployment options, each with a "what leaves your network" box, pros and cons */
YW.L['options-3'] = function(s, ctx){
  var esc = YW.esc, L = ctx.labels;
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="o3">';
  (s.options || []).forEach(function(o, i){
    h += '<div class="opt glass"' + YW.anim(i + 3) + '><h4>' + esc(o.title) + '</h4>' +
      '<div class="leave"><div class="cap">' + L.leaves + '</div><div>' + esc(o.leaves) + '</div></div>' +
      '<div class="lbl">' + L.pros + '</div>' + YW.ul(o.pros, 'yes') + '<div class="lbl">' + L.cons + '</div>' + YW.ul(o.cons, 'no') + '</div>';
  });
  return { html: h + '</div>' + (s.question ? '<div class="qband"' + YW.anim(7, 'fade') + '>' + esc(s.question) + '</div>' : '') };
};
