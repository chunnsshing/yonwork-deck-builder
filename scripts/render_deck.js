#!/usr/bin/env node
/* Dev helper: render decks headless with the exact code the builder uses (dist/kit.js).
   node scripts/render_deck.js <out-dir> [--client "Acme Trading"] [--date 2026-11-23]
   Writes one HTML deck per preset × IT on/off (both languages are embedded in each file),
   plus all-modules.html (every module, preset 2) for layout screenshots. Prints a JSON manifest. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const out = path.resolve(args[0] || path.join(root, 'shots/decks'));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const client = opt('--client', 'Acme Trading'), date = opt('--date', '2026-11-23');

const ctx = { console, setTimeout, clearTimeout, TextEncoder, TextDecoder };
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/kit.js'), 'utf8'), ctx, { filename: 'kit.js' });
const YW = ctx.YW, C = YW.CONTENT;

function selection(stage, it) {
  const P = C.site.presets[stage], main = P.main.slice();
  if (it) {
    let after = -1;
    main.forEach((id, i) => { if (C.modules[id].section === 'where') after = i; });
    if (after < 0) main.forEach((id, i) => { if (['why', 'how'].includes(C.modules[id].section)) after = i; });
    (C.site.it_overlay[stage] || []).forEach((id, k) => { if (!main.includes(id)) main.splice(after + 1 + k, 0, id); });
  }
  return { main, appendix: P.appendix.slice() };
}

fs.mkdirSync(out, { recursive: true });
const manifest = [];
const wantPptx = args.includes('--pptx');
const pending = [];
for (const stage of Object.keys(C.site.presets)) {
  for (const it of [false, true]) {
    if (it && !(C.site.it_overlay[stage] || []).length) continue;
    const sel = selection(stage, it);
    const r = YW.assemble({ lang: 'en', stage: +stage, it, main: sel.main, appendix: sel.appendix, client, date });
    const file = `preset${stage}${it ? '-it' : ''}.html`;
    fs.writeFileSync(path.join(out, file), r.html);
    const entry = { file, stage: +stage, it, slides: r.plan.all, appendixFrom: r.plan.appendixFrom, missing: r.missing, pptx: {} };
    manifest.push(entry);
    if (wantPptx) for (const lang of ['en', 'zh']) {
      const p = YW.buildPptx({ lang, stage: +stage, it, main: sel.main, appendix: sel.appendix, client, date });
      const pf = `preset${stage}${it ? '-it' : ''}_${lang}.pptx`;
      entry.pptx[lang] = { file: pf, name: p.filename, slides: p.plan.all.length + (p.plan.appendix.length ? 1 : 0), missing: p.missing };
      pending.push(p.pptx.write({ outputType: 'base64' }).then(b => fs.writeFileSync(path.join(out, pf), Buffer.from(b, 'base64'))));
    }
  }
}
// every module once (proposed ones included, for layout review only — the builder never exports them)
const all = C.order.filter(id => !['cover', 'agenda', 'thank-you'].includes(id));
const r = YW.assemble({ lang: 'en', stage: 2, it: true, main: all, appendix: [], client, date });
fs.writeFileSync(path.join(out, 'all-modules.html'), r.html);
const allEntry = { file: 'all-modules.html', stage: 2, it: true, slides: r.plan.all, appendixFrom: r.plan.appendixFrom, missing: r.missing, pptx: {} };
manifest.push(allEntry);
if (wantPptx) for (const lang of ['en', 'zh']) {
  const p = YW.buildPptx({ lang, stage: 2, it: true, main: all, appendix: [], client, date });
  const pf = `all-modules_${lang}.pptx`;
  allEntry.pptx[lang] = { file: pf, name: p.filename, slides: p.plan.all.length, missing: p.missing };
  pending.push(p.pptx.write({ outputType: 'base64' }).then(b => fs.writeFileSync(path.join(out, pf), Buffer.from(b, 'base64'))));
}
Promise.all(pending).then(() => {
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log(JSON.stringify(manifest.map(m => ({ file: m.file, n: m.slides.length }))));
}).catch(e => { console.error(e); process.exit(1); });
