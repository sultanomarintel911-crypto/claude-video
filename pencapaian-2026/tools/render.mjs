// Render bingkai ke JPEG (boleh disambung: bingkai sedia ada dilangkau).
// Guna: node tools/render.mjs <mula> <akhir-eksklusif> [--fps 30] [--size 1920x1080] [--dir out/frames] [--port 8765]
//       node tools/render.mjs --still 12.5,20 [--dir out/stills]   (bingkai tunggal untuk semakan)
import fs from 'fs'; import path from 'path'; import http from 'http'; import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const FPS = +opt('--fps', 30), [w, h] = opt('--size', '1920x1080').split('x').map(Number);
const dir = path.join(HERE, opt('--dir', a.includes('--still') ? 'out/stills' : 'out/frames')); fs.mkdirSync(dir, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const f = path.join(HERE, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(HERE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('console', m => m.type() === 'error' && console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.setDefaultTimeout(600000);
await page.goto(`http://localhost:${port}/index.html?still`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 600000 });
const shoot = async (t, file) => {
  const t0 = Date.now();
  await page.evaluate(t => window.render(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
  fs.writeFileSync(file + '.tmp', buf); fs.renameSync(file + '.tmp', file);
  console.log(`${path.basename(file)} ${Date.now() - t0}ms`);
};
if (a.includes('--still')) {
  for (const t of opt('--still').split(',').map(Number)) await shoot(t, path.join(dir, `t_${t.toFixed(2)}.jpg`));
} else {
  const f0 = +a[0], f1 = +a[1];
  for (let f = f0; f < f1; f++) {
    const file = path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`);
    if (!fs.existsSync(file)) await shoot(f / FPS, file);
  }
}
await browser.close(); srv.close();
