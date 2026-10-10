import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const SOURCE_ROOT = path.dirname(fileURLToPath(import.meta.url));
const SESSION_TTL = 8 * 60 * 60 * 1000;
const MAX_BODY = 2 * 1024 * 1024;
const CONTENT_FILES = ['site', 'editorial'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

async function privateWrite(filename, value) {
  await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temporary = `${filename}.${randomBytes(6).toString('hex')}.tmp`;
  await fs.writeFile(temporary, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.rename(temporary, filename);
  await fs.chmod(filename, 0o600);
}
async function readJson(filename) { return JSON.parse(await fs.readFile(filename, 'utf8')); }
async function exists(filename) { try { await fs.access(filename); return true; } catch { return false; } }
function digest(data) { return createHash('sha256').update(JSON.stringify(data)).digest('hex'); }
function constantEqual(a, b) { const left = Buffer.from(a || ''); const right = Buffer.from(b || ''); return left.length === right.length && timingSafeEqual(left, right); }
function problem(status, message) { const error = new Error(message); error.status = status; return error; }

export async function setupCredentials(root = SOURCE_ROOT, { port = 4173 } = {}) {
  const local = path.join(root, '.local');
  await fs.mkdir(local, { recursive: true, mode: 0o700 });
  await fs.chmod(local, 0o700);
  const authPath = path.join(local, 'auth.json');
  const accessPath = path.join(local, 'access.json');
  if (await exists(authPath)) {
    if (port && await exists(accessPath)) {
      const access = await readJson(accessPath);
      const url = `http://127.0.0.1:${port}/admin/`;
      if (access.url !== url) await privateWrite(accessPath, { ...access, url });
    }
    return accessPath;
  }
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(32).toString('hex');
  await privateWrite(authPath, { salt, hash: scryptSync(password, salt, 64).toString('hex') });
  await privateWrite(accessPath, { url: `http://127.0.0.1:${port || 4173}/admin/`, password, note: 'Accès local uniquement. Ne pas partager ni publier ce fichier. Aucun compte patient.' });
  return accessPath;
}

function inspectJson(value, location, errors, depth = 0) {
  if (depth > 12) { errors.push(`${location} : imbrication excessive.`); return; }
  if (typeof value === 'string') { if (value.length > 20000) errors.push(`${location} : texte trop long (20 000 caractères maximum).`); return; }
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'number') { if (!Number.isFinite(value)) errors.push(`${location} : nombre invalide.`); return; }
  if (Array.isArray(value)) {
    if (value.length > 500) { errors.push(`${location} : trop d’éléments (500 maximum).`); return; }
    value.forEach((entry, index) => inspectJson(entry, `${location}[${index}]`, errors, depth + 1));
    return;
  }
  if (!value || typeof value !== 'object') { errors.push(`${location} : type de donnée non pris en charge.`); return; }
  if (Object.keys(value).length > 300) { errors.push(`${location} : trop de champs (300 maximum).`); return; }
  for (const [key, entry] of Object.entries(value)) {
    const current = `${location}.${key}`;
    if (FORBIDDEN_KEYS.has(key) || key.length > 100) errors.push(`${current} : nom de champ interdit.`);
    if (/(?:url|href|website|link)$/i.test(key)) checkUrl(entry, current, errors);
    if (/(?:urls|hrefs|websites|links)$/i.test(key)) {
      if (!Array.isArray(entry)) errors.push(`${current} : tableau de liens requis.`);
      else entry.forEach((url, index) => checkUrl(url, `${current}[${index}]`, errors, key.toLowerCase().includes('source')));
    }
    if (key === 'slug' && (typeof entry !== 'string' || entry.length > 100 || !SAFE_SLUG.test(entry))) errors.push(`${current} : identifiant invalide (minuscules, chiffres et tirets uniquement).`);
    inspectJson(entry, current, errors, depth + 1);
  }
}

function checkUrl(value, location, errors, onlyWeb = false) {
  if (typeof value !== 'string') { errors.push(`${location} : chaîne de lien requise.`); return; }
  if (!value) return;
  try {
    if (value !== value.trim() || /[\u0000-\u001f\u007f]/.test(value)) throw new Error();
    const url = new URL(value);
    if (!(onlyWeb ? ['https:', 'http:'] : ['https:', 'http:', 'tel:', 'mailto:']).includes(url.protocol) || url.username || url.password) throw new Error();
  } catch { errors.push(`${location} : lien invalide. Protocoles autorisés : ${onlyWeb ? 'https, http' : 'https, http, tel, mailto'}.`); }
}

function objectEntry(value, location, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { errors.push(`${location} : objet requis.`); return false; }
  return true;
}
function textFields(value, keys, location, errors) {
  for (const key of keys) if (typeof value[key] !== 'string') errors.push(`${location}.${key} : texte requis.`);
}
function textList(value, location, errors) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) errors.push(`${location} : tableau de textes requis.`);
}
function questions(value, location, errors) {
  if (!Array.isArray(value)) { errors.push(`${location} : tableau requis.`); return; }
  value.forEach((item, index) => { const label = `${location}[${index}]`; if (objectEntry(item, label, errors)) textFields(item, ['q', 'a'], label, errors); });
}

export function validateContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object' || Array.isArray(content)) return ['Le contenu doit être un objet JSON.'];
  inspectJson(content, 'contenu', errors);
  for (const key of Object.keys(content)) if (!CONTENT_FILES.includes(key)) errors.push(`Fichier non autorisé : ${key}.`);
  const site = content.site;
  if (!site || typeof site !== 'object' || Array.isArray(site)) errors.push('site : un objet est requis.');
  else {
    for (const key of ['name', 'address', 'addressLocality', 'postalCode', 'heroTitle', 'heroText', 'phone', 'bookingUrl', 'hoursNote']) {
      if (typeof site[key] !== 'string' || site[key].length > (['heroText', 'hoursNote'].includes(key) ? 5000 : 500)) errors.push(`site.${key} : chaîne requise de longueur raisonnable.`);
    }
    for (const key of ['name', 'heroTitle', 'addressLocality']) if (typeof site[key] === 'string' && !site[key].trim()) errors.push(`site.${key} : ce champ ne peut pas être vide.`);
    if (!Array.isArray(site.team)) errors.push('site.team : tableau requis.');
    else site.team.forEach((person, index) => { const label = `site.team[${index}]`; if (objectEntry(person, label, errors)) {
      textFields(person, ['name', 'role', 'service', 'address', 'phone', 'bookingUrl'], label, errors);
      if (typeof person.service === 'string' && !SAFE_SLUG.test(person.service)) errors.push(`${label}.service : identifiant de prestation invalide.`);
      if (person.portrait !== undefined && (typeof person.portrait !== 'string' || (person.portrait && !/^team\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/.test(person.portrait)))) errors.push(`${label}.portrait : fichier local team/nom.jpg, png ou webp requis.`);
    } });
    if (site.addresses !== undefined) {
      if (!Array.isArray(site.addresses)) errors.push('site.addresses : tableau requis.');
      else site.addresses.forEach((address, index) => { const label = `site.addresses[${index}]`; if (objectEntry(address, label, errors)) textFields(address, ['street', 'label', 'note'], label, errors); });
    }
    if (!site.media || Array.isArray(site.media) || typeof site.media !== 'object' || typeof site.media.approved !== 'boolean') errors.push('site.media.approved : booléen requis.');
    if (!site.demo || Array.isArray(site.demo) || typeof site.demo !== 'object' || typeof site.demo.enabled !== 'boolean') errors.push('site.demo.enabled : booléen requis.');
    else if (site.demo.retireAt !== null && (typeof site.demo.retireAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(site.demo.retireAt) || Number.isNaN(Date.parse(`${site.demo.retireAt}T00:00:00Z`)) || new Date(`${site.demo.retireAt}T00:00:00Z`).toISOString().slice(0, 10) !== site.demo.retireAt)) errors.push('site.demo.retireAt : null ou date réelle au format AAAA-MM-JJ.');
  }
  if (!content.editorial || typeof content.editorial !== 'object') errors.push('editorial : objet ou tableau JSON requis.');
  else if (!Array.isArray(content.editorial)) {
    for (const collection of ['services', 'articles']) if (content.editorial[collection] !== undefined) {
      const items = content.editorial[collection];
      if (!Array.isArray(items)) { errors.push(`editorial.${collection} : tableau requis.`); continue; }
      const seen = new Set();
      items.forEach((item, index) => {
        const label = `editorial.${collection}[${index}]`;
        if (!objectEntry(item, label, errors)) return;
        textFields(item, ['slug', 'title', 'category', collection === 'services' ? 'intro' : 'excerpt'], label, errors);
        if (typeof item.slug === 'string' && seen.has(item.slug)) errors.push(`${label}.slug : cet identifiant existe déjà.`);
        seen.add(item.slug);
        textList(item.paragraphs, `${label}.paragraphs`, errors);
        if (item.questions !== undefined) questions(item.questions, `${label}.questions`, errors);
        if (item.sourceUrls !== undefined && !Array.isArray(item.sourceUrls)) errors.push(`${label}.sourceUrls : tableau requis.`);
      });
    }
    if (content.editorial.faq !== undefined) questions(content.editorial.faq, 'editorial.faq', errors);
    if (content.editorial.legal !== undefined && objectEntry(content.editorial.legal, 'editorial.legal', errors)) {
      for (const key of ['paragraphs', 'missing']) if (content.editorial.legal[key] !== undefined) textList(content.editorial.legal[key], `editorial.legal.${key}`, errors);
    }
  }
  return errors.slice(0, 60);
}

async function requestBody(request) {
  if (!String(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw problem(415, 'Le type application/json est requis.');
  let size = 0;
  const chunks = [];
  for await (const chunk of request) { size += chunk.length; if (size > MAX_BODY) throw problem(413, 'Le contenu dépasse 2 Mo.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw problem(400, 'JSON invalide.'); }
}

function buildSite(root) {
  return new Promise((resolve, reject) => {
    const processBuild = spawn(process.execPath, [path.join(root, 'scripts', 'build.mjs')], { cwd: root, env: { ...process.env }, stdio: ['ignore', 'ignore', 'ignore'] });
    const timer = setTimeout(() => { processBuild.kill('SIGTERM'); reject(new Error('Le build a dépassé 60 secondes.')); }, 60000);
    processBuild.on('error', (error) => { clearTimeout(timer); reject(error); });
    processBuild.on('exit', (code) => { clearTimeout(timer); if (code === 0) resolve(); else reject(new Error('Échec du build.')); });
  });
}

export async function createApplication({ root = SOURCE_ROOT, port = 4173 } = {}) {
  root = path.resolve(root);
  await setupCredentials(root, { port });
  const local = path.join(root, '.local');
  const auth = await readJson(path.join(local, 'auth.json'));
  const sessions = new Map();
  const attempts = new Map();
  let busy = false;
  async function published() { return Object.fromEntries(await Promise.all(CONTENT_FILES.map(async (key) => [key, await readJson(path.join(root, 'content', `${key}.json`))]))); }
  async function draft() { try { return await readJson(path.join(local, 'draft.json')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
  async function writePublished(content) { for (const key of CONTENT_FILES) await privateWrite(path.join(root, 'content', `${key}.json`), content[key]); }
  async function snapshot(content, reason) {
    const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomBytes(4).toString('hex')}`;
    await privateWrite(path.join(local, 'history', `${id}.json`), { id, createdAt: new Date().toISOString(), reason, content });
    return id;
  }
  async function exclusive(action) { if (busy) throw problem(409, 'Une opération est déjà en cours. Réessayez dans un instant.'); busy = true; try { return await action(); } finally { busy = false; } }

  const server = http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.setHeader('X-Frame-Options', 'DENY');
    const json = (status, value) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(value)); };
    try {
      const actualPort = server.address()?.port || port;
      const permittedHosts = [`127.0.0.1:${actualPort}`, `localhost:${actualPort}`];
      if (!permittedHosts.includes(request.headers.host)) throw problem(403, 'Hôte local non autorisé.');
      const rawPath = (request.url || '/').split('?')[0];
      let pathname;
      try { pathname = decodeURIComponent(rawPath); } catch { throw problem(400, 'Chemin invalide.'); }
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some((part) => part === '..' || part === '.')) throw problem(403, 'Chemin interdit.');
      const isApi = pathname.startsWith('/api/');
      if (isApi) {
        response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        const now = Date.now();
        for (const [token, value] of sessions) if (value.expires < now) sessions.delete(token);
        for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
        const cookie = (request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('local_session='))?.slice('local_session='.length);
        const session = cookie ? sessions.get(cookie) : undefined;
        const mutates = !['GET', 'HEAD'].includes(request.method);
        if (mutates && !permittedHosts.some((host) => request.headers.origin === `http://${host}`)) throw problem(403, 'Origine de la requête refusée. Ouvrez le back-office sur son adresse locale.');
        if (pathname === '/api/session' && request.method === 'GET') return json(200, { authenticated: Boolean(session), ...(session ? { csrf: session.csrf, expiresAt: new Date(session.expires).toISOString() } : {}) });
        if (pathname === '/api/login' && request.method === 'POST') {
          const key = request.socket.remoteAddress;
          const previous = attempts.get(key);
          if (previous && previous.count >= 8) throw problem(429, 'Trop de tentatives. Réessayez dans 15 minutes.');
          const body = await requestBody(request);
          if (!body || typeof body !== 'object' || typeof body.password !== 'string' || body.password.length > 256) throw problem(400, 'Mot de passe invalide.');
          const valid = constantEqual(scryptSync(body.password, auth.salt, 64).toString('hex'), auth.hash);
          if (!valid) { attempts.set(key, { count: (previous?.count || 0) + 1, until: previous?.until || now + 15 * 60 * 1000 }); throw problem(401, 'Mot de passe incorrect.'); }
          attempts.delete(key);
          if (cookie) sessions.delete(cookie);
          const token = randomBytes(32).toString('base64url');
          const newSession = { csrf: randomBytes(32).toString('base64url'), expires: now + SESSION_TTL };
          sessions.set(token, newSession);
          response.setHeader('Set-Cookie', `local_session=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL / 1000}`);
          return json(200, { authenticated: true, csrf: newSession.csrf });
        }
        if (!session) throw problem(401, 'Connexion requise.');
        if (mutates && !constantEqual(request.headers['x-csrf-token'], session.csrf)) throw problem(403, 'Jeton de sécurité invalide. Rechargez la page.');
        if (pathname === '/api/logout' && request.method === 'POST') { sessions.delete(cookie); response.setHeader('Set-Cookie', 'local_session=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0'); return json(200, { ok: true }); }
        if (pathname === '/api/content' && request.method === 'GET') return json(200, { published: await published(), draft: await draft() });
        if (pathname === '/api/draft' && request.method === 'PUT') {
          const body = await requestBody(request);
          const safety = []; inspectJson(body, 'contenu', safety);
          if (safety.length || !body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !CONTENT_FILES.includes(key)) || !Object.hasOwn(body, 'site') || !Object.hasOwn(body, 'editorial')) return json(422, { error: 'Brouillon refusé.', errors: safety.length ? safety : ['Les champs site et editorial sont requis et sont les seuls autorisés.'] });
          return await exclusive(async () => { const next = { content: body, updatedAt: new Date().toISOString(), validatedAt: null, validationHash: null }; await privateWrite(path.join(local, 'draft.json'), next); return json(200, { ok: true, draft: next }); });
        }
        if (pathname === '/api/validate' && request.method === 'POST') return await exclusive(async () => {
          await requestBody(request);
          const current = await draft(); if (!current) throw problem(409, 'Enregistrez un brouillon avant validation.');
          const errors = validateContent(current.content);
          if (errors.length) return json(422, { valid: false, errors });
          current.validatedAt = new Date().toISOString(); current.validationHash = digest(current.content);
          await privateWrite(path.join(local, 'draft.json'), current);
          return json(200, { valid: true, validatedAt: current.validatedAt });
        });
        if (pathname === '/api/publish' && request.method === 'POST') return await exclusive(async () => {
          await requestBody(request);
          const current = await draft();
          if (!current || !current.validatedAt || current.validationHash !== digest(current.content)) throw problem(409, 'Validez le brouillon actuel avant de publier.');
          const errors = validateContent(current.content); if (errors.length) return json(422, { error: 'Contenu invalide.', errors });
          const before = await published();
          const beforeId = await snapshot(before, 'Avant publication');
          const dist = path.join(root, 'dist');
          const rollback = path.join(local, 'dist-rollback');
          await fs.rm(rollback, { recursive: true, force: true });
          const hadDist = await exists(dist);
          if (hadDist) await fs.cp(dist, rollback, { recursive: true });
          try { await writePublished(current.content); await buildSite(root); }
          catch {
            await writePublished(before);
            await fs.rm(dist, { recursive: true, force: true });
            if (hadDist) await fs.cp(rollback, dist, { recursive: true });
            await fs.rm(rollback, { recursive: true, force: true });
            throw problem(500, 'La génération a échoué. Les contenus et le site précédents ont été restaurés.');
          }
          await fs.rm(rollback, { recursive: true, force: true });
          const id = await snapshot(current.content, 'Publication locale');
          await fs.rm(path.join(local, 'draft.json'), { force: true });
          return json(200, { ok: true, id, beforeId, message: 'Site local généré. GitHub Pages ne change pas automatiquement : relisez le site, puis publiez les fichiers avec Git.' });
        });
        if (pathname === '/api/history' && request.method === 'GET') {
          const directory = path.join(local, 'history');
          const filenames = await exists(directory) ? (await fs.readdir(directory)).filter((name) => /^[\w-]+\.json$/.test(name)).sort().reverse() : [];
          const history = await Promise.all(filenames.slice(0, 100).map(async (name) => { const { id, createdAt, reason } = await readJson(path.join(directory, name)); return { id, createdAt, reason }; }));
          return json(200, { history });
        }
        if (pathname === '/api/restore' && request.method === 'POST') {
          const body = await requestBody(request); if (typeof body.id !== 'string' || !/^[\w-]{1,100}$/.test(body.id)) throw problem(400, 'Identifiant de version invalide.');
          return await exclusive(async () => {
            let previous; try { previous = await readJson(path.join(local, 'history', `${body.id}.json`)); } catch (error) { if (error.code === 'ENOENT') throw problem(404, 'Version introuvable.'); throw error; }
            const next = { content: previous.content, updatedAt: new Date().toISOString(), validatedAt: null, validationHash: null, restoredFrom: body.id };
            await privateWrite(path.join(local, 'draft.json'), next); return json(200, { ok: true, draft: next });
          });
        }
        if (pathname === '/api/backup' && request.method === 'GET') {
          const directory = path.join(local, 'history');
          const files = await exists(directory) ? (await fs.readdir(directory)).filter((name) => /^[\w-]+\.json$/.test(name)) : [];
          const history = await Promise.all(files.map((name) => readJson(path.join(directory, name))));
          response.setHeader('Content-Disposition', `attachment; filename="sauvegarde-contenus-${new Date().toISOString().slice(0, 10)}.json"`);
          return json(200, { format: 'local-content-backup-v1', createdAt: new Date().toISOString(), published: await published(), draft: await draft(), history });
        }
        throw problem(404, 'API inconnue.');
      }
      if (!['GET', 'HEAD'].includes(request.method)) throw problem(405, 'Méthode non autorisée.');
      const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
      const base = path.join(root, isAdmin ? 'admin' : 'dist');
      const relative = isAdmin ? pathname.replace(/^\/admin\/?/, '') : pathname.slice(1);
      if (relative.split('/').some((part) => part.startsWith('.')) || /(?:^|\/)(?:content|\.local|node_modules|server\.mjs|package\.json|admin)(?:\/|$)/.test(relative)) throw problem(404, 'Page introuvable.');
      let filename = path.resolve(base, relative || 'index.html');
      if (!filename.startsWith(`${base}${path.sep}`)) throw problem(403, 'Chemin interdit.');
      try { if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; if (!path.extname(filename)) filename += '.html'; }
      let real;
      try { real = await fs.realpath(filename); } catch { throw problem(404, 'Page introuvable. Lancez npm run build si le site n’est pas encore généré.'); }
      const realBase = await fs.realpath(base);
      if (!real.startsWith(`${realBase}${path.sep}`)) throw problem(403, 'Chemin interdit.');
      if (isAdmin) response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      response.writeHead(200, { 'Content-Type': MIME[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': isAdmin ? 'no-store' : 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : await fs.readFile(real));
    } catch (error) {
      if (!response.headersSent) json(error.status || 500, { error: error.status ? error.message : 'Erreur locale inattendue. Vérifiez les fichiers du projet.' });
      else response.end();
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT === undefined ? 4173 : Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT doit être un entier compris entre 1024 et 65535.');
  if (process.argv.includes('--setup')) console.log(`Accès local enregistré : ${await setupCredentials(SOURCE_ROOT, { port })}`);
  else {
    await createApplication({ port });
    console.log(`Site local : http://127.0.0.1:${port}/`);
    console.log(`Administration locale : http://127.0.0.1:${port}/admin/`);
    console.log(`Identifiants : ${path.join(SOURCE_ROOT, '.local', 'access.json')} (fichier local, à ne pas publier)`);
  }
}
