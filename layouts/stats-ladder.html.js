/* stats-ladder — two stat tiles + four rising bars (grow from the bottom, staggered) */
YW.L['stats-ladder'] = function(s){
  var esc = YW.esc, H = [205, 265, 330, 400];
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + '<div class="sl"><div class="stats">';
  (s.stats || []).forEach(function(t, i){
    h += '<div class="stat glass ' + esc(t.tone || '') + '"' + YW.anim(i + 2) + '><div class="v">' + esc(t.value) + '</div><p>' + esc(t.label) + '</p></div>';
  });
  h += '</div><div class="bars">';
  (s.levels || []).forEach(function(l, i){
    h += '<div class="bar glass l' + (i + 1) + '" style="height:' + H[i] + 'px;--d:' + (0.35 + i * 0.14).toFixed(2) + 's" data-anim>' +
      '<div class="cap">' + esc(l.tag) + '</div><h4>' + esc(l.title) + '</h4><p>' + esc(l.body) + '</p><div class="who">' + esc(l.who) + '</div></div>';
  });
  return { html: h + '</div></div>' + (s.source ? '<div class="src"' + YW.anim(8, 'fade') + '>' + esc(s.source) + '</div>' : '') };
};
