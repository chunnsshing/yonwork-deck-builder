/* agenda — one row per section that has ticked main modules: number, section, summary, minutes */
YW.L.agenda = function(s, ctx){
  var esc = YW.esc, rows = ctx.agenda || [];
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + '<div class="rows">';
  rows.forEach(function(r, i){
    h += '<div class="row glass"' + YW.anim(i + 2) + '>' +
      '<div class="n hl">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</div>' +
      '<div><h4>' + esc(r.name) + '</h4><p>' + esc(r.summary) + '</p></div>' +
      '<div class="min">' + esc(r.minLabel) + '</div></div>';
  });
  return { html: h + '</div>', cls: rows.length > 4 ? 'dense' : '' };
};
