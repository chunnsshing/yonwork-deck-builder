/* gates-anim — steps with yes-gates between them; a 10 s self-running build (runtime/scenes.js) with Replay */
YW.L['gates-anim'] = function(s, ctx){
  var esc = YW.esc, steps = s.steps || [], gates = s.gates || [], n = steps.length + gates.length;
  var h = YW.eyebrow(s.eyebrow, 0, true) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="pipe"' + YW.anim(3, 'fade') + '><div class="track"><i></i></div>';
  for (var k = 0; k < n; k++) {
    var left = 70 + k * (1112 - 140) / (n - 1);
    if (k % 2 === 0) { var st = steps[k / 2]; h += '<div class="node step" style="left:' + left + 'px"><div class="dot">' + (k / 2 + 1) + '</div><div class="t">' + esc(st) + '</div></div>'; }
    else { var g = gates[(k - 1) / 2]; h += '<div class="node gate" style="left:' + left + 'px"><div class="dia"><b>?</b></div><div class="q">' + esc(g) + '</div></div>'; }
  }
  h += '</div>';
  if (s.band) h += '<div class="band glass"><span class="pilltag">' + esc(s.band.tag) + '</span><span class="t">' + esc(s.band.text) + '</span>' +
    '<button class="replay" data-int>' + esc(ctx.labels.replay) + '</button></div>';
  return { html: h, scene: 'gates' };
};
