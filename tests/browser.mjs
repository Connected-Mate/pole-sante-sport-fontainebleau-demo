import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const ROOT = process.cwd();
const BASE = (process.env.QA_BASE_URL || 'http://127.0.0.1:4174').replace(/\/?$/, '/');
const CHROME = process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RESULTS = path.join(ROOT, 'test-results');
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'content/site.json'), 'utf8'));
const editorial = JSON.parse(await fs.readFile(path.join(ROOT, 'content/editorial.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'dist/build-manifest.json'), 'utf8'));
const PUBLIC = new URL(site.publicBaseUrl.replace(/\/?$/, '/'));
const report = { startedAt: new Date().toISOString(), baseUrl: BASE, browser: CHROME, checks: [], pages: [], accessibility: [], screenshots: [], failures: [], notes: ['Read-only browser QA. No calls or bookings placed.', 'GitHub Pages fixture uses the existing dist export with the configured repository path. Public-origin asset requests on custom 404 are proxied to this fixture.'] };
await fs.mkdir(RESULTS, { recursive: true });
const check = async (name, action) => {
  const started = Date.now();
  try { const detail = await action(); report.checks.push({ name, ok: true, elapsedMs: Date.now() - started, ...(detail === undefined ? {} : { detail }) }); }
  catch (error) { const failure = { name, message: error.message }; report.failures.push(failure); report.checks.push({ ...failure, ok: false, elapsedMs: Date.now() - started }); console.error(`FAIL ${name}: ${error.message}`); }
};
const noDemo = async page => {
  await page.addInitScript(() => { try { sessionStorage.setItem('pss-demo-seen', 'yes'); } catch {} });
};
const visibleCount = async (page, selector) => page.locator(`${selector}:visible`).count();
const pageUrl = (base, file) => new URL(file, base).href;
const unique = (values, message) => assert.equal(new Set(values).size, values.length, message);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml' };

let browser;
let fixture;
try {
  browser = await chromium.launch({ executablePath: CHROME, headless: true });
  report.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await noDemo(page);
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push({ url: page.url(), error: error.message }));
  const localLinks = new Map();
  await check('24 pages declared', () => assert.equal(manifest.pages.length, 24));

  for (const item of manifest.pages) {
    await check(`page metadata and local references: ${item.file}`, async () => {
      const response = await page.goto(pageUrl(BASE, item.file), { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const data = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        robots: document.querySelector('meta[name="robots"]')?.content,
        h1: [...document.querySelectorAll('h1')].map(x => x.textContent.trim()),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(x => JSON.parse(x.textContent)),
        references: [...document.querySelectorAll('a[href], img[src], script[src], link[rel="stylesheet"], link[rel="icon"]')].map(x => ({ url: x.href || x.src, tag: x.tagName, raw: x.getAttribute('href') || x.getAttribute('src') })),
        emptyAltMissing: [...document.querySelectorAll('img')].filter(x => !x.hasAttribute('alt')).length
      }));
      assert.equal(data.h1.length, 1, 'Exactly one h1 required');
      assert.ok(data.title?.trim() && data.description?.trim(), 'Title and description required');
      assert.match(data.robots || '', /\bnoindex\b/);
      assert.equal(data.canonical, new URL(item.file, PUBLIC).href);
      assert.equal(data.emptyAltMissing, 0, 'Images need an alt attribute');
      assert.ok(data.jsonld.length > 0);
      for (const ref of data.references) {
        assert.ok(!/^(javascript|data):/i.test(ref.url || ''), `Unsafe reference: ${ref.raw}`);
        const url = new URL(ref.url, page.url());
        if (!['http:', 'https:'].includes(url.protocol)) continue;
        if (url.origin === new URL(BASE).origin) {
          assert.ok(url.pathname.startsWith(new URL(BASE).pathname), `Link escapes deployment prefix: ${url}`);
          url.hash = ''; localLinks.set(url.href, item.file);
        } else if (url.origin === PUBLIC.origin && url.pathname.startsWith(PUBLIC.pathname)) {
          const local = new URL(url.pathname.slice(PUBLIC.pathname.length) + url.search, BASE);
          localLinks.set(local.href, item.file);
        }
        if (ref.raw?.startsWith('#')) assert.equal(await page.locator(`[id=${JSON.stringify(ref.raw.slice(1))}]`).count(), 1, `Anchor ${ref.raw} missing`);
      }
      report.pages.push({ file: item.file, status: response.status(), title: data.title, description: data.description, h1: data.h1[0], robots: data.robots, canonical: data.canonical, jsonldBlocks: data.jsonld.length });
    });
  }
  await check('unique titles, descriptions and page headings', () => {
    assert.equal(report.pages.length, 24);
    unique(report.pages.map(x => x.title), 'Duplicate title');
    unique(report.pages.map(x => x.description), 'Duplicate description');
    unique(report.pages.map(x => x.h1), 'Duplicate h1');
  });
  await check('all internal href/src targets exist', async () => {
    const broken = [];
    for (const [url, from] of localLinks) {
      const response = await context.request.get(url);
      if (!response.ok()) broken.push({ url, from, status: response.status() });
    }
    assert.deepEqual(broken, []);
    return { targets: localLinks.size };
  });

  for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 768, height: 1024 }, { name: 'desktop', width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    for (const item of manifest.pages) await check(`no horizontal overflow ${viewport.name}: ${item.file}`, async () => {
      await page.goto(pageUrl(BASE, item.file), { waitUntil: 'networkidle' });
      const metrics = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('body *')].filter(x => { const s = getComputedStyle(x), r = x.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && !x.matches('.skip,.sr-only,dialog,dialog *'); }).slice(0, 8).map(x => ({ tag: x.tagName, class: x.className, left: x.getBoundingClientRect().left, right: x.getBoundingClientRect().right })) }));
      assert.ok(metrics.width <= metrics.viewport + 1, JSON.stringify(metrics));
    });
    if (viewport.name !== 'tablet') await check(`viewport screenshot ${viewport.name}`, async () => {
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.evaluate(() => scrollTo(0, 0));
      const filename = `qa-home-${viewport.name}.png`;
      await page.screenshot({ path: path.join(RESULTS, filename), fullPage: false, animations: 'disabled' });
      report.screenshots.push(filename);
    });
  }

  const keyboardContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const keyboard = await keyboardContext.newPage();
  await check('modal opens, traps Tab, closes with Escape and reopens', async () => {
    await keyboard.goto(BASE, { waitUntil: 'networkidle' });
    assert.equal(await keyboard.locator('#demo-dialog').evaluate(x => x.open), true);
    for (let i = 0; i < 6; i++) {
      await keyboard.keyboard.press('Tab');
      assert.equal(await keyboard.evaluate(() => Boolean(document.activeElement.closest('#demo-dialog'))), true, `Focus escaped modal on Tab ${i + 1}`);
    }
    await keyboard.keyboard.press('Escape');
    assert.equal(await keyboard.locator('#demo-dialog').evaluate(x => x.open), false);
    assert.equal(await keyboard.evaluate(() => sessionStorage.getItem('pss-demo-seen')), 'yes');
    await keyboard.locator('[data-open-demo]').first().focus();
    await keyboard.keyboard.press('Enter');
    assert.equal(await keyboard.locator('#demo-dialog').evaluate(x => x.open), true);
    await keyboard.locator('#close-demo').focus();
    await keyboard.keyboard.press('Enter');
    assert.equal(await keyboard.locator('#demo-dialog').evaluate(x => x.open), false);
  });
  await check('mobile menu by keyboard: Enter, Tab, Escape', async () => {
    await keyboard.goto(BASE, { waitUntil: 'networkidle' });
    await keyboard.locator('.menu-toggle').focus();
    await keyboard.keyboard.press('Enter');
    assert.equal(await keyboard.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await keyboard.locator('#navigation').isVisible(), true);
    await keyboard.keyboard.press('Tab');
    assert.equal(await keyboard.evaluate(() => Boolean(document.activeElement.closest('#navigation'))), true);
    await keyboard.keyboard.press('Escape');
    assert.equal(await keyboard.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await keyboard.locator('#navigation').isVisible(), false);
    assert.equal(await keyboard.locator('.menu-toggle').evaluate(x => x === document.activeElement), true);
  });
  await check('FAQ keyboard Enter and Space', async () => {
    await keyboard.goto(pageUrl(BASE, 'faq.html'), { waitUntil: 'networkidle' });
    const first = keyboard.locator('details').first();
    await first.locator('summary').focus();
    await keyboard.keyboard.press('Enter'); assert.equal(await first.evaluate(x => x.open), true);
    await keyboard.keyboard.press('Space'); assert.equal(await first.evaluate(x => x.open), false);
  });

  await check('specialty filters show the correct disciplines', async () => {
    await page.goto(pageUrl(BASE, 'specialites.html'), { waitUntil: 'networkidle' });
    for (const category of ['soins', 'mouvement', 'bien-etre', 'all']) {
      await page.locator(`[data-filter="${category}"]`).click();
      assert.equal(await page.locator(`[data-filter="${category}"]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await visibleCount(page, '.service-card'), category === 'all' ? editorial.services.length : editorial.services.filter(x => x.category === category).length);
    }
  });
  await check('14 practitioners, 4 kines, and every specialty has a contact', async () => {
    await page.goto(pageUrl(BASE, 'rendez-vous.html'), { waitUntil: 'networkidle' });
    assert.equal(await visibleCount(page, '.person'), 14);
    await page.locator('#speciality-select').selectOption('kinesitherapie');
    assert.equal(await visibleCount(page, '.person'), 4);
    assert.match(await page.locator('#results-count').textContent(), /4 interlocuteurs/);
    for (const service of editorial.services) {
      await page.locator('#speciality-select').selectOption(service.slug);
      assert.ok(await visibleCount(page, '.person') >= 1, `No contact for ${service.slug}`);
    }
    await page.goto(pageUrl(BASE, 'rendez-vous.html?specialite=kinesitherapie'), { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#speciality-select').inputValue(), 'kinesitherapie');
    assert.equal(await visibleCount(page, '.person'), 4);
  });
  await check('calls and three official Doctolib links', async () => {
    await page.goto(pageUrl(BASE, 'rendez-vous.html'), { waitUntil: 'networkidle' });
    const cards = await page.locator('.person').evaluateAll(people => people.map(p => ({ name: p.querySelector('h3').textContent, hrefs: [...p.querySelectorAll('a')].map(a => a.getAttribute('href')) })));
    for (const person of site.team) {
      const card = cards.find(x => x.name === person.name); assert.ok(card, `Missing ${person.name}`);
      if (person.phone) assert.ok(card.hrefs.includes('tel:' + person.phone.replace(/[^+\d]/g, '')), `Wrong telephone ${person.name}`);
      if (person.bookingUrl) assert.ok(card.hrefs.includes(person.bookingUrl), `Wrong booking ${person.name}`);
    }
    assert.equal(cards.flatMap(x => x.hrefs).filter(x => x.startsWith('https://www.doctolib.fr/')).length, 3);
  });
  await check('Google map loads only after a deliberate click', async () => {
    const mapRequests = [];
    await page.route('https://maps.google.com/**', route => { mapRequests.push(route.request().url()); return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="fr"><title>Carte de test</title><body>Carte externe neutralisée pendant le test.</body></html>' }); });
    await page.goto(pageUrl(BASE, 'contact.html'), { waitUntil: 'networkidle' });
    assert.equal(await page.locator('iframe').count(), 0); assert.equal(mapRequests.length, 0);
    const itineraries = await page.locator('.map-links a').evaluateAll(a => a.map(x => x.href));
    assert.equal(itineraries.length, 6); assert.ok(itineraries.some(x => /160/.test(x))); assert.ok(itineraries.some(x => /143/.test(x)));
    await page.locator('#load-map').click();
    await page.locator('#map-slot iframe').waitFor();
    await page.locator('#map-slot iframe').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('iframe').count(), 1);
    assert.match(await page.locator('iframe').getAttribute('src'), /q=143/);
    assert.ok(mapRequests.length >= 1);
    await page.unroute('https://maps.google.com/**');
  });

  const representative = ['index.html', 'specialites.html', 'specialites/kinesitherapie.html', 'equipe.html', 'rendez-vous.html', 'faq.html', 'contact.html', 'galerie.html', 'journal/preparer-premier-rendez-vous.html', 'mentions-legales.html', 'confidentialite.html'];
  for (const size of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    for (const file of representative) await check(`axe serious/critical ${size.name}: ${file}`, async () => {
      await page.goto(pageUrl(BASE, file), { waitUntil: 'networkidle' });
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const violations = result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, helpUrl: v.helpUrl, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
      report.accessibility.push({ file, viewport: size.name, violations });
      const severe = violations.filter(v => ['serious', 'critical'].includes(v.impact));
      assert.deepEqual(severe, [], JSON.stringify(severe));
    });
  }
  await check('axe modal and open mobile menu', async () => {
    await keyboard.goto(BASE, { waitUntil: 'networkidle' });
    for (const state of ['modal', 'menu']) {
      if (state === 'modal') await keyboard.locator('[data-open-demo]').first().click();
      else { await keyboard.keyboard.press('Escape'); await keyboard.locator('.menu-toggle').click(); }
      const result = await new AxeBuilder({ page: keyboard }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const severe = result.violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
      report.accessibility.push({ file: 'index.html', viewport: `mobile-${state}`, violations: severe });
      assert.deepEqual(severe, [], JSON.stringify(severe));
    }
  });

  const prefix = PUBLIC.pathname;
  fixture = http.createServer(async (req, res) => {
    const requested = new URL(req.url, 'http://localhost').pathname;
    if (!requested.startsWith(prefix)) { res.writeHead(404); return res.end('Outside repository path'); }
    const relative = decodeURIComponent(requested.slice(prefix.length));
    const filename = path.resolve(ROOT, 'dist', relative || 'index.html');
    if (!filename.startsWith(path.join(ROOT, 'dist') + path.sep)) { res.writeHead(403); return res.end(); }
    try { const data = await fs.readFile(filename); res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' }); res.end(data); }
    catch { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end(await fs.readFile(path.join(ROOT, 'dist/404.html'))); }
  });
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  const fixtureOrigin = `http://127.0.0.1:${fixture.address().port}`;
  const fixtureBase = fixtureOrigin + prefix;
  report.fixtureBase = fixtureBase;
  const fixturePage = await context.newPage(); await noDemo(fixturePage);
  await fixturePage.route(`${PUBLIC.origin}/**`, async route => {
    const requested = new URL(route.request().url());
    if (requested.pathname.startsWith(prefix)) {
      const response = await context.request.get(fixtureOrigin + requested.pathname + requested.search);
      return route.fulfill({ response });
    }
    return route.abort();
  });
  await check('GitHub repository subpath: all 24 pages and their local references', async () => {
    const urls = new Set(); const outside = [];
    for (const item of manifest.pages) {
      const response = await fixturePage.goto(pageUrl(fixtureBase, item.file), { waitUntil: 'networkidle' }); assert.equal(response.status(), 200);
      const refs = await fixturePage.locator('a[href], img[src], script[src], link[rel="stylesheet"], link[rel="icon"]').evaluateAll(nodes => nodes.map(x => x.href || x.src));
      for (const ref of refs) {
        const url = new URL(ref); if (url.origin !== fixtureOrigin && url.origin !== PUBLIC.origin) continue;
        if (!url.pathname.startsWith(prefix)) outside.push(url.href);
        else urls.add(fixtureOrigin + url.pathname + url.search);
      }
    }
    assert.deepEqual(outside, []);
    const broken = [];
    for (const url of urls) { const r = await context.request.get(url); if (!r.ok()) broken.push({ url, status: r.status() }); }
    assert.deepEqual(broken, []); return { prefix, references: urls.size };
  });
  await check('GitHub nested 404 keeps CSS, scripts and home link working', async () => {
    const failed = []; fixturePage.on('response', response => { if (response.status() >= 400 && !response.url().includes('non-existent-qa')) failed.push({ url: response.url(), status: response.status() }); });
    const response = await fixturePage.goto(pageUrl(fixtureBase, 'specialites/non-existent-qa.html'), { waitUntil: 'networkidle' });
    assert.equal(response.status(), 404);
    assert.match(await fixturePage.locator('h1').textContent(), /détour/i);
    assert.deepEqual(failed, []);
    const home = await fixturePage.getByRole('link', { name: 'Revenir à l’accueil' }).getAttribute('href');
    const resolved = await fixturePage.getByRole('link', { name: 'Revenir à l’accueil' }).evaluate(a => a.href);
    assert.equal(new URL(resolved).pathname, prefix + 'index.html', `Wrong home link ${home}`);
    return { status: response.status(), home: resolved };
  });
  await check('no browser runtime errors', () => assert.deepEqual(runtimeErrors, []));
  await context.close(); await keyboardContext.close();
} catch (error) {
  report.failures.push({ name: 'browser suite setup/execution', message: error.stack || error.message });
} finally {
  if (fixture) await new Promise(resolve => fixture.close(resolve));
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.summary = { passed: report.checks.filter(x => x.ok).length, failed: report.failures.length, pages: report.pages.length, axeRuns: report.accessibility.length };
  await fs.writeFile(path.join(RESULTS, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
  if (report.failures.length) process.exitCode = 1;
}
