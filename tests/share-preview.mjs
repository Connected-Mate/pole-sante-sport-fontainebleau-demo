import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE = (process.env.QA_BASE_URL || 'http://127.0.0.1:4174').replace(/\/?$/, '/');
const CHROME = process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RESULTS = path.join(ROOT, 'test-results');
const IMAGE = 'assets/social/pole-sante-sport-preview-v2.jpg';
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'content/site.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'dist/build-manifest.json'), 'utf8'));
const PUBLIC = new URL(site.publicBaseUrl.replace(/\/?$/, '/'));
const EXPECTED_IMAGE = new URL(IMAGE, PUBLIC).href;
const report = { startedAt: new Date().toISOString(), baseUrl: BASE, expectedImage: EXPECTED_IMAGE, buildTimestamp: manifest.builtAt, checks: [], failures: [], screenshots: [], runtimeErrors: [], httpErrors: [], failedRequests: [] };
await fs.mkdir(RESULTS, { recursive: true });

const check = async (name, action) => {
  const started = Date.now();
  try {
    const detail = await action();
    report.checks.push({ name, ok: true, elapsedMs: Date.now() - started, ...(detail === undefined ? {} : { detail }) });
  } catch (error) {
    const failure = { name, message: error.message };
    report.failures.push(failure);
    report.checks.push({ ...failure, ok: false, elapsedMs: Date.now() - started });
    console.error(`FAIL ${name}: ${error.message}`);
  }
};
const watch = page => {
  page.on('pageerror', error => report.runtimeErrors.push({ url: page.url(), message: error.message }));
  page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), message: request.failure()?.errorText }));
};
const ready = async page => {
  await page.waitForFunction(() => document.documentElement.dataset.previewReady === 'true');
  await page.evaluate(() => document.fonts.ready);
};
const loadPreview = async (page, url = new URL('share-preview.html', BASE).href) => {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await ready(page);
};

let browser;
let fixture;
try {
  browser = await chromium.launch({ executablePath: CHROME, headless: true });
  report.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  watch(page);
  await page.addInitScript(() => { try { sessionStorage.setItem('pss-demo-seen', 'yes'); } catch {} });

  await check('24 site pages declare the new social JPEG and complete card metadata', async () => {
    assert.equal(manifest.pages.length, 24);
    const pages = [];
    for (const item of manifest.pages) {
      const response = await page.goto(new URL(item.file, BASE).href, { waitUntil: 'load' });
      assert.equal(response.status(), 200, item.file);
      const meta = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('meta[property],meta[name]')].map(node => [node.getAttribute('property') || node.name, node.content])));
      assert.equal(meta['og:image'], EXPECTED_IMAGE, item.file);
      assert.equal(meta['og:image:type'], 'image/jpeg', item.file);
      assert.equal(meta['og:image:width'], '1200', item.file);
      assert.equal(meta['og:image:height'], '630', item.file);
      assert.ok(meta['og:image:alt']?.trim(), `${item.file}: og:image:alt missing`);
      assert.ok(meta['og:site_name']?.trim(), `${item.file}: og:site_name missing`);
      assert.equal(meta['twitter:card'], 'summary_large_image', item.file);
      assert.equal(meta['twitter:image'], EXPECTED_IMAGE, item.file);
      assert.ok(meta['twitter:image:alt']?.trim(), `${item.file}: twitter:image:alt missing`);
      assert.equal(meta['twitter:title'], meta['og:title'], item.file);
      assert.equal(meta['twitter:description'], meta['og:description'], item.file);
      assert.ok(meta['twitter:title']?.trim() && meta['twitter:description']?.trim(), item.file);
      assert.match(meta.robots, /\bnoindex\b/, item.file);
      assert.ok(!/facade/i.test(meta['og:image']), item.file);
      assert.equal(new URL(meta['og:image']).protocol, 'https:');
      pages.push(item.file);
    }
    return { pages, image: EXPECTED_IMAGE };
  });

  await check('social JPEG is served and decodes at exactly 1200 by 630 pixels', async () => {
    const url = new URL(IMAGE, BASE).href;
    const response = await context.request.get(url);
    assert.equal(response.status(), 200);
    assert.match(response.headers()['content-type'] || '', /^image\/jpeg\b/);
    const bytes = await response.body();
    assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
    const dimensions = await page.evaluate(async source => {
      const image = new Image(); image.src = source; await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, url);
    assert.deepEqual(dimensions, { width: 1200, height: 630 });
    return { ...dimensions, bytes: bytes.length, contentType: response.headers()['content-type'] };
  });

  await check('animated preview has noindex, a decoded sport photo and loaded local Manrope font', async () => {
    await loadPreview(page);
    const data = await page.evaluate(() => {
      const photo = document.querySelector('.card-photo img');
      return {
        robots: document.querySelector('meta[name="robots"]')?.content,
        photo: { source: photo.src, width: photo.naturalWidth, height: photo.naturalHeight, complete: photo.complete },
        font: getComputedStyle(document.querySelector('#card-title')).fontFamily,
        loadedFonts: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family),
        headings: document.querySelectorAll('h1').length
      };
    });
    assert.match(data.robots || '', /\bnoindex\b/);
    assert.equal(data.headings, 1);
    assert.match(data.photo.source, /sport-preview-photo\.webp$/);
    assert.ok(data.photo.complete && data.photo.width > 0 && data.photo.height > 0);
    assert.match(data.font, /^Manrope\b/);
    assert.ok(data.loadedFonts.some(font => font.replaceAll('"', '') === 'Manrope'), 'Manrope was not loaded');
    return data;
  });

  for (const width of [320, 390, 768, 1440]) await check(`preview fits viewport ${width}px`, async () => {
    await page.setViewportSize({ width, height: 960 });
    await loadPreview(page);
    const data = await page.evaluate(() => {
      const card = document.querySelector('.share-card').getBoundingClientRect();
      return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, card: { left: card.left, right: card.right, width: card.width, height: card.height } };
    });
    assert.ok(data.documentWidth <= data.viewport + 1, JSON.stringify(data));
    assert.ok(data.card.left >= -1 && data.card.right <= data.viewport + 1, JSON.stringify(data));
    assert.ok(Math.abs(data.card.width / data.card.height - 1200 / 630) < .002, JSON.stringify(data));
    return data;
  });

  await check('reduced motion prevents animation and disables replay', async () => {
    assert.equal(await page.locator('#replay').isDisabled(), true);
    const animations = await page.evaluate(() => document.querySelector('.share-card').getAnimations({ subtree: true }).map(animation => ({ state: animation.playState, name: animation.animationName })));
    assert.deepEqual(animations, []);
    return { animations, replayDisabled: true };
  });

  await check('capture mode produces a stable 1200 by 630 card without surrounding controls', async () => {
    await page.setViewportSize({ width: 1200, height: 630 });
    await loadPreview(page, new URL('share-preview.html?capture=1', BASE).href);
    const dimensions = await page.locator('.share-card').boundingBox();
    assert.deepEqual(dimensions, { x: 0, y: 0, width: 1200, height: 630 });
    assert.equal(await page.locator('.preview-toolbar').isVisible(), false);
    assert.equal(await page.locator('.preview-footer').isVisible(), false);
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    const filename = 'qa-share-preview-capture.png';
    await page.locator('.share-card').screenshot({ path: path.join(RESULTS, filename), animations: 'disabled' });
    report.screenshots.push(filename);
    return dimensions;
  });

  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference' });
  const motionPage = await motionContext.newPage(); watch(motionPage);
  await check('normal motion starts, finishes within five seconds and can replay by keyboard', async () => {
    await loadPreview(motionPage);
    const animations = await motionPage.evaluate(() => document.querySelector('.share-card').getAnimations({ subtree: true }).map(animation => ({ name: animation.animationName, state: animation.playState, endTime: animation.effect.getComputedTiming().endTime })));
    assert.ok(animations.length > 0, 'Expected entrance animations');
    assert.ok(animations.some(animation => animation.state === 'running'), 'Animations did not start');
    assert.ok(animations.every(animation => Number.isFinite(animation.endTime) && animation.endTime <= 5000), JSON.stringify(animations));
    await motionPage.waitForFunction(() => document.getAnimations().every(animation => ['finished', 'idle'].includes(animation.playState)), null, { timeout: 5500 });
    await motionPage.locator('#replay').focus();
    await motionPage.keyboard.press('Enter');
    assert.ok(await motionPage.evaluate(() => document.getAnimations().some(animation => animation.playState === 'running')), 'Keyboard replay did not restart motion');
    await motionPage.waitForFunction(() => document.getAnimations().every(animation => ['finished', 'idle'].includes(animation.playState)), null, { timeout: 5500 });
    return { animations, keyboardReplay: true, maxAnimationMs: Math.max(...animations.map(animation => animation.endTime)) };
  });

  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  fixture = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith(PUBLIC.pathname)) { response.writeHead(404); return response.end('Outside repository path'); }
    const relative = decodeURIComponent(pathname.slice(PUBLIC.pathname.length));
    const filename = path.resolve(ROOT, 'dist', relative || 'index.html');
    if (!filename.startsWith(path.join(ROOT, 'dist') + path.sep)) { response.writeHead(403); return response.end(); }
    try { const bytes = await fs.readFile(filename); response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' }); response.end(bytes); }
    catch { response.writeHead(404); response.end('Missing asset'); }
  });
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  const fixtureOrigin = `http://127.0.0.1:${fixture.address().port}`;
  const fixtureBase = fixtureOrigin + PUBLIC.pathname;
  const fixturePage = await context.newPage(); watch(fixturePage);
  const requests = new Set();
  fixturePage.on('request', request => requests.add(request.url()));
  await check('preview, photo, fonts and links work under the GitHub repository path', async () => {
    await loadPreview(fixturePage, new URL('share-preview.html', fixtureBase).href);
    const canonical = await fixturePage.locator('link[rel="canonical"]').getAttribute('href');
    assert.equal(canonical, new URL('share-preview.html', PUBLIC).href);
    const references = await fixturePage.locator('a[href],img[src],script[src],link[href]:not([rel="canonical"])').evaluateAll(nodes => nodes.map(node => node.href || node.src));
    for (const url of [...requests, ...references]) {
      const parsed = new URL(url);
      assert.equal(parsed.origin, fixtureOrigin, `Unexpected external resource ${url}`);
      assert.ok(parsed.pathname.startsWith(PUBLIC.pathname), `Asset escapes repository path: ${url}`);
      const response = await context.request.get(url);
      assert.equal(response.status(), 200, url);
    }
    const photo = await fixturePage.locator('.card-photo img').evaluate(image => ({ width: image.naturalWidth, height: image.naturalHeight }));
    assert.ok(photo.width > 0 && photo.height > 0);
    assert.equal(await fixturePage.evaluate(() => document.fonts.check('500 73px Manrope')), true);
    return { prefix: PUBLIC.pathname, requests: [...requests], references };
  });

  await check('no JavaScript, HTTP or request failures', () => {
    assert.deepEqual(report.runtimeErrors, []);
    assert.deepEqual(report.httpErrors, []);
    assert.deepEqual(report.failedRequests, []);
  });
  await motionContext.close(); await context.close();
} catch (error) {
  report.failures.push({ name: 'suite setup or execution', message: error.stack || error.message });
} finally {
  if (fixture) await new Promise(resolve => fixture.close(resolve));
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.summary = { passed: report.checks.filter(check => check.ok).length, failed: report.failures.length };
  await fs.writeFile(path.join(RESULTS, 'share-preview-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
  if (report.failures.length) process.exitCode = 1;
}
