/* foundation — four workflow tiles standing on a gradient foundation bar */
YW.L.foundation = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="wf">';
  (s.workflows || []).forEach(function(c, i){
    h += '<div class="card glass' + (c.now ? ' now hot' : '') + '"' + YW.anim(i + 4) + '><div class="cap">' + esc(c.cap) + '</div><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p></div>';
  });
  return { html: h + '</div><div class="base"' + YW.anim(3, 'fade') + '>' + esc(s.foundation) + '</div>' };
};
