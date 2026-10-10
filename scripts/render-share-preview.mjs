/** Render the same HTML/CSS composition used by the animated public preview. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const imagePath = path.join(publicRoot, 'assets/real/pilates-mouvement.webp');
const socialDir = path.join(publicRoot, 'assets/social');
const masterDir = path.join(root, 'output/social');
const chrome = process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
await fs.access(imagePath).catch(() => { throw new Error('La photographie réelle pilates-mouvement.webp doit être présente avant le rendu de la carte.'); });

// A loopback-only, read-only fixture serves public assets independently of dist/.
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const requested = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const filename = path.resolve(publicRoot, `.${requested}`);
    if (!filename.startsWith(`${publicRoot}${path.sep}`)) { res.writeHead(403); res.end(); return; }
    const resolved = await fs.realpath(filename);
    if (!resolved.startsWith(`${publicRoot}${path.sep}`)) { res.writeHead(403); res.end(); return; }
    const bytes = await fs.readFile(resolved);
    res.writeHead(200, { 'Content-Type': mime[path.extname(resolved)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
let browser;
try {
  browser = await chromium.launch({ executablePath: chrome, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (!response.ok()) errors.push(`HTTP ${response.status()} ${response.url()}`); });
  await page.goto(`http://127.0.0.1:${server.address().port}/share-preview.html?capture=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.previewReady === 'true');
  await page.evaluate(async () => { await document.fonts.load('530 73px Manrope'); await document.fonts.ready; await Promise.all([...document.querySelectorAll('.share-card img')].map(image => image.decode())); });
  const metrics = await page.evaluate(() => {
    const card = document.querySelector('.share-card').getBoundingClientRect();
    const image = document.querySelector('.card-photo img');
    return { width: card.width, height: card.height, x: card.x, y: card.y, font: document.fonts.check('530 73px Manrope'), imageWidth: image.naturalWidth, imageHeight: image.naturalHeight, logoWidth: document.querySelector('.brand-logo').naturalWidth, activeAnimations: document.getAnimations().length };
  });
  assert.deepEqual(errors, [], 'Les ressources de la carte doivent toutes être chargées.');
  assert.equal(metrics.width, 1200); assert.equal(metrics.height, 630); assert.equal(metrics.x, 0); assert.equal(metrics.y, 0);
  assert.equal(metrics.font, true); assert.ok(metrics.imageWidth > 1000); assert.ok(metrics.logoWidth > 0); assert.equal(metrics.activeAnimations, 0);
  await fs.mkdir(socialDir, { recursive: true });
  await fs.mkdir(masterDir, { recursive: true });
  const card = page.locator('.share-card');
  const master = path.join(masterDir, 'preview-master-v3.png');
  const jpeg = path.join(socialDir, 'pole-sante-sport-preview-v3.jpg');
  await card.screenshot({ path: master, type: 'png', scale: 'device', animations: 'disabled' });
  await card.screenshot({ path: jpeg, type: 'jpeg', quality: 94, scale: 'css', animations: 'disabled' });
  console.log(JSON.stringify({ jpeg, jpegDimensions: [1200, 630], master, masterDimensions: [2400, 1260], sourceImage: path.relative(root, imagePath), metrics }, null, 2));
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
