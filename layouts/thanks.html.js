/* thanks — animated heading + one QR card per starter-pack link (scenario library, estimator) */
YW.L.thanks = function(s, ctx){
  var esc = YW.esc;
  var h = YW.eyebrow(s.eyebrow, 0, true) +
    '<h1 class="title"' + YW.anim(1, 'scale') + '><span class="hl">' + esc(s.heading) + '</span></h1>' +
    '<div class="qrs">';
  (s.links || []).forEach(function(l, i){
    h += '<div class="qr glass"' + YW.anim(i + 3) + '>' +
      '<div class="code">' + YW.qrSvg(l.url) + '</div>' +
      '<div><div class="sub">' + esc(l.sub) + '</div><h4>' + esc(l.label) + '</h4>' +
      '<div class="url">' + esc(String(l.url).replace(/^https?:\/\//, '').replace(/[#?].*$/, '').replace(/\/$/, '')) + '</div></div>' +
      '</div>';
  });
  return { html: h + '</div>' };
};
