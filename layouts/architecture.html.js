/* architecture — numbered server components (2×2) inside the office server, two channels out, dashed links */
YW.L.architecture = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="arch"' + YW.anim(3, 'fade') + '><div class="srv">';
  (s.components || []).forEach(function(c){ h += '<div class="comp glass"><div class="n">' + esc(c.n) + '</div><div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div></div>'; });
  h += '</div><div class="chans">';
  (s.channels || []).forEach(function(c, i){ h += '<div class="chan glass ' + (i ? 'b' : 'a') + '"><div class="n">' + esc(c.id) + '</div><div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div></div>'; });
  // links from the server's right edge to each channel (percent coordinates of the .arch box)
  h += '</div><svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M65.4 50 C 68 50, 67.5 27, 70.2 27" vector-effect="non-scaling-stroke"/><path d="M65.4 50 C 68 50, 67.5 73, 70.2 73" vector-effect="non-scaling-stroke"/></svg></div>';
  return { html: h + (s.footnote ? '<div class="fnote"' + YW.anim(5, 'fade') + '>' + esc(s.footnote) + '</div>' : '') };
};
