/* self-check — clickable rows with ticks; a banner appears at the threshold (runtime/scenes.js) */
YW.L['self-check'] = function(s){
  var esc = YW.esc, b = s.banner || {};
  var h = YW.eyebrow(s.eyebrow, 0, true) + YW.head(s.heading, 1) + '<div class="rows">';
  (s.lines || []).forEach(function(l, i){ h += '<div class="row glass" data-int role="checkbox" aria-checked="false" tabindex="0"' + YW.anim(i + 2) + '><span class="tick">✓</span><span class="t">' + esc(l) + '</span></div>'; });
  h += '</div><div class="banner" data-threshold="' + (+b.threshold || 2) + '"><b>' + esc(b.title) + '</b><span>' + esc(b.body) + '</span></div>';
  return { html: h, scene: 'selfcheck' };
};
