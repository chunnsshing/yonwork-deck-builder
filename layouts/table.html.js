/* table — styled comparison table + optional footnote */
YW.L.table = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<table class="tbl"' + YW.anim(3) + '><thead><tr>';
  (s.columns || []).forEach(function(c){ h += '<th>' + esc(c) + '</th>'; });
  h += '</tr></thead><tbody>';
  (s.rows || []).forEach(function(r){ h += '<tr>' + r.map(function(c){ return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; });
  return { html: h + '</tbody></table>' + (s.footnote ? '<div class="fnote"' + YW.anim(5, 'fade') + '>' + esc(s.footnote) + '</div>' : '') };
};
