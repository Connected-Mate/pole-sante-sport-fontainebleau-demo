import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication, validateContent, setupCredentials } from '../server.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const content = () => ({
  site: { name: 'Établissement de test', address: '1 rue de Test', addressLocality: 'Fontainebleau', postalCode: '77300', heroTitle: 'Bienvenue', heroText: 'Texte de démonstration', phone: '', bookingUrl: '', hoursNote: 'Sur rendez-vous', team: [], demo: { enabled: true, retireAt: null }, media: { approved: false, assets: [] }, publicBaseUrl: 'https://example.com/', officialUrl: 'https://example.com/', objective: 'rendez-vous', addresses: [{ street: '1 rue de Test', label: 'Cabinet', note: 'À vérifier' }] },
  editorial: { services: [{ slug: 'prestation', title: 'Prestation', category: 'soins', intro: 'Introduction', paragraphs: ['Contenu de test.'], sourceUrls: ['https://example.com/'] }], articles: [], faq: [] },
});

function call(port, pathname, { method = 'GET', data, cookie, csrf, origin = true, raw } = {}) {
  return new Promise((resolve, reject) => {
    const payload = data === undefined ? undefined : JSON.stringify(data);
    const request = http.request({ host: '127.0.0.1', port, path: pathname, method, headers: {
      ...(origin ? { Origin: typeof origin === 'string' ? origin : `http://127.0.0.1:${port}` } : {}),
      ...(payload !== undefined ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    } }, (response) => {
      const chunks = []; response.on('data', (chunk) => chunks.push(chunk)); response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8'); let body; try { body = JSON.parse(text); } catch { body = text; }
        resolve({ status: response.statusCode, headers: response.headers, body, text });
      });
    });
    request.on('error', reject); request.end(payload ?? raw);
  });
}

test('validation des types, des clés et des liens', () => {
  assert.deepEqual(validateContent(content()), []);
  const wrongType = content(); wrongType.site.phone = 123; assert.ok(validateContent(wrongType).some((line) => line.includes('phone')));
  const unsafe = content(); unsafe.site.bookingUrl = 'javascript:alert(1)'; assert.ok(validateContent(unsafe).some((line) => line.includes('bookingUrl')));
  const injection = JSON.parse('{"site":{"__proto__":{"polluted":true}},"editorial":{}}'); assert.ok(validateContent(injection).some((line) => line.includes('interdit')));
  const wrongDate = content(); wrongDate.site.demo.retireAt = '2026-02-31'; assert.ok(validateContent(wrongDate).some((line) => line.includes('retireAt')));
  const longText = content(); longText.site.heroTitle = 'a'.repeat(501); assert.ok(validateContent(longText).some((line) => line.includes('heroTitle')));
  const badSlug = content(); badSlug.editorial.services[0].slug = '../../audit-canary'; assert.ok(validateContent(badSlug).some((line) => line.includes('slug')));
  const quoteSlug = content(); quoteSlug.editorial.services[0].slug = 'x" onmouseover="alert(1)'; assert.ok(validateContent(quoteSlug).some((line) => line.includes('slug')));
  const unsafeSource = content(); unsafeSource.editorial.services[0].sourceUrls = ['javascript:alert(1)']; assert.ok(validateContent(unsafeSource).some((line) => line.includes('sourceUrls')));
  const duplicate = content(); duplicate.editorial.services.push({ ...duplicate.editorial.services[0] }); assert.ok(validateContent(duplicate).some((line) => line.includes('existe déjà')));
  const badParagraphs = content(); badParagraphs.editorial.services[0].paragraphs = {}; assert.ok(validateContent(badParagraphs).some((line) => line.includes('paragraphs')));
  const portrait = content(); portrait.site.team = [{ name: 'Praticien', role: 'Praticien', service: 'prestation', address: '1 rue de Test', phone: '', bookingUrl: '', portrait: 'team/praticien.webp', portraitSourceUrl: 'https://example.com/profil' }];
  assert.deepEqual(validateContent(portrait), []);
  for (const unsafePath of ['../../portrait.jpg', 'https://example.com/portrait.jpg', 'team/x.svg']) {
    portrait.site.team[0].portrait = unsafePath;
    assert.ok(validateContent(portrait).some(line => line.includes('portrait')));
  }
  portrait.site.team[0].portrait = ''; portrait.site.team[0].portraitSourceUrl = 'javascript:alert(1)';
  assert.ok(validateContent(portrait).some(line => line.includes('portraitSourceUrl')));
});

test('administration locale : authentification, workflow, sauvegarde et rollback', async (t) => {
  const root = await fs.mkdtemp(path.join(testDirectory, '.admin-fixture-'));
  let server;
  t.after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); await fs.rm(root, { recursive: true, force: true }); });
  for (const folder of ['content', 'scripts', 'dist', 'admin']) await fs.mkdir(path.join(root, folder));
  const initial = content();
  await Promise.all(Object.entries(initial).map(([key, value]) => fs.writeFile(path.join(root, 'content', `${key}.json`), JSON.stringify(value))));
  await fs.writeFile(path.join(root, 'dist', 'index.html'), '<h1>Site initial</h1>');
  await fs.writeFile(path.join(root, 'admin', 'index.html'), '<h1>Administration</h1>');
  const goodBuild = "import {promises as fs} from 'node:fs'; const site=JSON.parse(await fs.readFile('content/site.json','utf8')); await fs.mkdir('dist',{recursive:true}); await fs.writeFile('dist/index.html', '<h1>'+site.heroTitle+'</h1>');";
  await fs.writeFile(path.join(root, 'scripts', 'build.mjs'), goodBuild);
  const accessPath = await setupCredentials(root);
  const access = JSON.parse(await fs.readFile(accessPath, 'utf8'));
  await setupCredentials(root, { port: 4174 });
  const updatedAccess = JSON.parse(await fs.readFile(accessPath, 'utf8'));
  assert.equal(updatedAccess.url, 'http://127.0.0.1:4174/admin/');
  assert.equal(updatedAccess.password === access.password, true);
  assert.equal((await fs.stat(accessPath)).mode & 0o777, 0o600);
  assert.equal((await fs.stat(path.join(root, '.local'))).mode & 0o777, 0o700);
  server = await createApplication({ root, port: 0 });
  const port = server.address().port;
  assert.equal(server.address().address, '127.0.0.1');
  await t.test('connexion requise, mot de passe erroné et origine distante refusés', async () => {
    assert.equal((await call(port, '/api/content')).status, 401);
    assert.equal((await call(port, '/api/backup')).status, 401);
    assert.equal((await call(port, '/api/login', { method: 'POST', data: { password: 'incorrect' } })).status, 401);
    assert.equal((await call(port, '/api/login', { method: 'POST', data: { password: access.password }, origin: 'https://evil.example' })).status, 403);
    assert.equal((await call(port, '/api/login', { method: 'POST', data: { password: access.password }, origin: false })).status, 403);
  });
  const login = await call(port, '/api/login', { method: 'POST', data: { password: access.password } });
  assert.equal(login.status, 200);
  const cookie = login.headers['set-cookie'][0].split(';')[0]; const csrf = login.body.csrf;
  assert.match(login.headers['set-cookie'][0], /HttpOnly/); assert.match(login.headers['set-cookie'][0], /SameSite=Strict/);
  const authenticated = { cookie, csrf };
  await t.test('session, sécurité CSRF, chemins et fichiers privés', async () => {
    const session = await call(port, '/api/session', authenticated); assert.equal(session.body.authenticated, true); assert.equal(session.body.csrf, csrf);
    assert.equal((await call(port, '/api/draft', { method: 'PUT', cookie, data: initial })).status, 403);
    assert.equal((await call(port, '/api/draft', { method: 'PUT', ...authenticated, origin: 'https://evil.example', data: initial })).status, 403);
    for (const pathname of ['/../.local/access.json', '/%2e%2e/.local/access.json', '/%2e%2e%2f.local/access.json', '/admin/../../server.mjs', '/admin/%5c..%5c.local/access.json']) assert.equal((await call(port, pathname)).status, 403);
    for (const pathname of ['/.local/access.json', '/server.mjs', '/content/site.json']) assert.equal((await call(port, pathname)).status, 404);
    await fs.symlink(path.join(root, '.local', 'access.json'), path.join(root, 'dist', 'leak.json'));
    assert.equal((await call(port, '/leak.json')).status, 403); await fs.unlink(path.join(root, 'dist', 'leak.json'));
    const admin = await call(port, '/admin/'); assert.equal(admin.status, 200); assert.match(admin.headers['content-security-policy'], /script-src 'self'/);
    assert.equal(admin.headers['x-robots-tag'], 'noindex, nofollow, noarchive');
  });
  const next = content(); next.site.heroTitle = 'Titre publié';
  await t.test('brouillon isolé, validation et publication avec historique', async () => {
    assert.equal((await call(port, '/api/publish', { method: 'POST', ...authenticated, data: {} })).status, 409);
    assert.equal((await call(port, '/api/draft', { method: 'PUT', ...authenticated, data: next })).status, 200);
    const loaded = await call(port, '/api/content', authenticated); assert.equal(loaded.body.published.site.heroTitle, 'Bienvenue'); assert.equal(loaded.body.draft.content.site.heroTitle, 'Titre publié');
    assert.equal((await call(port, '/api/publish', { method: 'POST', ...authenticated, data: {} })).status, 409);
    assert.equal((await call(port, '/api/validate', { method: 'POST', ...authenticated, data: {} })).body.valid, true);
    const published = await call(port, '/api/publish', { method: 'POST', ...authenticated, data: {} }); assert.equal(published.status, 200);
    assert.equal((await call(port, '/')).text, '<h1>Titre publié</h1>');
    assert.equal((await call(port, '/api/content', authenticated)).body.draft, null);
    const history = await call(port, '/api/history', authenticated); assert.equal(history.body.history.length, 2);
    const backup = await call(port, '/api/backup', authenticated); assert.equal(backup.status, 200); assert.equal(backup.body.history.length, 2);
    assert.equal(backup.text.includes(access.password), false); assert.equal(backup.text.includes('"hash"'), false); assert.equal(backup.text.includes('"salt"'), false);
  });
  await t.test('restaurer crée un brouillon à revalider, édition invalide refusée', async () => {
    const history = (await call(port, '/api/history', authenticated)).body.history;
    const before = history.find((entry) => entry.reason === 'Avant publication');
    const restored = await call(port, '/api/restore', { method: 'POST', ...authenticated, data: { id: before.id } });
    assert.equal(restored.body.draft.content.site.heroTitle, 'Bienvenue'); assert.equal(restored.body.draft.validatedAt, null);
    assert.equal((await call(port, '/')).text, '<h1>Titre publié</h1>');
    assert.equal((await call(port, '/api/restore', { method: 'POST', ...authenticated, data: { id: '../../access' } })).status, 400);
    const unsafe = content(); unsafe.site.bookingUrl = 'data:text/html,hello';
    assert.equal((await call(port, '/api/draft', { method: 'PUT', ...authenticated, data: unsafe })).status, 422);
    const injection = JSON.parse('{"site":{"constructor":{"prototype":{}}},"editorial":{}}');
    assert.equal((await call(port, '/api/draft', { method: 'PUT', ...authenticated, data: injection })).status, 422);
    const invalid = content(); invalid.site.phone = 123;
    assert.equal((await call(port, '/api/draft', { method: 'PUT', ...authenticated, data: invalid })).status, 200);
    assert.equal((await call(port, '/api/validate', { method: 'POST', ...authenticated, data: {} })).status, 422);
  });
  await t.test('un build défaillant restaure les sources et dist', async () => {
    const broken = content(); broken.site.heroTitle = 'Publication qui échoue';
    await call(port, '/api/draft', { method: 'PUT', ...authenticated, data: broken });
    await call(port, '/api/validate', { method: 'POST', ...authenticated, data: {} });
    await fs.writeFile(path.join(root, 'scripts', 'build.mjs'), "import {promises as fs} from 'node:fs'; await fs.writeFile('dist/index.html','Écriture partielle'); process.exit(1);");
    const result = await call(port, '/api/publish', { method: 'POST', ...authenticated, data: {} }); assert.equal(result.status, 500);
    assert.equal((await call(port, '/')).text, '<h1>Titre publié</h1>');
    const loaded = await call(port, '/api/content', authenticated); assert.equal(loaded.body.published.site.heroTitle, 'Titre publié'); assert.equal(loaded.body.draft.content.site.heroTitle, broken.site.heroTitle);
  });
  await t.test('déconnexion et limitation des tentatives', async () => {
    assert.equal((await call(port, '/api/logout', { method: 'POST', ...authenticated, data: {} })).status, 200);
    assert.equal((await call(port, '/api/content', authenticated)).status, 401);
    for (let i = 0; i < 8; i++) assert.equal((await call(port, '/api/login', { method: 'POST', data: { password: 'incorrect' } })).status, 401);
    assert.equal((await call(port, '/api/login', { method: 'POST', data: { password: 'incorrect' } })).status, 429);
  });
});
