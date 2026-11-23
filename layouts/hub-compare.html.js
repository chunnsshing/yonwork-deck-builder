/* hub-compare — X + AI (separate apps, each with its own AI) vs AI + X (one hub, animated dashed spokes) */
YW.L['hub-compare'] = function(s, ctx){
  var gid = 'hg-' + ctx.lang;   // ids must be unique: both language decks live in one document
  var esc = YW.esc, L = s.left || {}, R = s.right || {};
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="hc">';
  h += '<div class="col glass old"' + YW.anim(3) + '><div class="eq">' + esc(L.eq) + ' <span class="cap muted">' + esc(L.cap) + '</span></div><div class="apps">' +
    (L.apps || []).map(function(a){ return '<div class="app">' + esc(a) + '<i>AI</i></div>'; }).join('') + '</div>' + YW.ul(L.points) + '</div>';
  // hub: centre + nodes on an ellipse, viewBox 500×168
  var nodes = R.nodes || [], cx = 250, cy = 84, svg = '', lab = '';
  nodes.forEach(function(n, i){
    var a = -Math.PI / 2 + i * 2 * Math.PI / nodes.length, x = cx + Math.cos(a) * 190, y = cy + Math.sin(a) * 64;
    svg += '<line class="spoke" x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
    var w = Math.max(64, YW.vlen(n) * 6.6 + 22);
    lab += '<g><rect x="' + (x - w / 2).toFixed(1) + '" y="' + (y - 13).toFixed(1) + '" width="' + w.toFixed(1) + '" height="26" rx="13" fill="#fff" stroke="rgba(20,20,40,.12)"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y + 4.5).toFixed(1) + '" text-anchor="middle" font-size="12.5" font-weight="650" fill="#48484A">' + esc(n) + '</text></g>';
  });
  svg += lab + '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5B48"/><stop offset="1" stop-color="#E3172A"/></linearGradient></defs>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="38" fill="url(#' + gid + ')"/><text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">' + esc(R.core) + '</text>';
  h += '<div class="col glass new"' + YW.anim(4) + '><div class="eq"><b>' + esc(R.eq) + '</b> <span class="cap">' + esc(R.cap) + '</span></div>' +
    '<svg class="hub" viewBox="0 0 500 168" aria-hidden="true">' + svg + '</svg>' + YW.ul(R.points) + '</div>';
  return { html: h + '</div>' };
};
