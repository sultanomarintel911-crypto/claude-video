// Render bingkai ke JPEG (boleh disambung semula: bingkai sedia ada dilangkau). Tanpa had masa 30 s per bingkai.
// Guna: node tools/render4k.mjs <bingkai-mula> <bingkai-akhir(eksklusif)> [--size 2160x3840] [--fps 24] [--dir out/frames]  (16:9: --size 3840x2160 --dir out/frames169)
// Dijalankan dari mana-mana; perlukan LIB (pustaka Lemo-Opuscar). Output: out/frames/f_00000.jpg …
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = process.env.LIB || '/root/lemo-opuscar';
process.chdir(LIB);
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const f0 = +a[0], f1 = +a[1], FPS = +opt('--fps', 24), [w, h] = opt('--size', '2160x3840').split('x').map(Number);
const dir = path.join(HERE, opt('--dir', 'out/frames')); fs.mkdirSync(dir, { recursive: true });
const { browser, page } = await openDemo(path.relative(LIB, HERE), { w, h });
page.setDefaultTimeout(600000);
for (let f = f0; f < f1; f++) {
  const file = path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`);
  if (fs.existsSync(file)) continue;
  const t0 = Date.now();
  await page.evaluate(t => window.render(t), f / FPS);
  const buf = await page.screenshot({ type: 'jpeg', quality: 95, timeout: 600000 });
  fs.writeFileSync(file + '.tmp', buf); fs.renameSync(file + '.tmp', file);
  console.log(`f ${f} ${Date.now() - t0}ms`);
}
await browser.close(); closeServer();
