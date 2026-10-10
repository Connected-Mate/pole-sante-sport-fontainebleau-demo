import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const exportDir = path.join(root, 'exports');
await fs.mkdir(exportDir, { recursive: true });
const exists = filename => fs.access(filename).then(() => true, () => false);

// Replace an archive only after its replacement is complete and checked.
const archive = async (name, cwd, files) => {
  for (const filename of files) await fs.access(path.join(cwd, filename));
  const target = path.join(exportDir, name);
  const pending = path.join(exportDir, `.${name}.${process.pid}.tmp.zip`);
  try {
    await fs.rm(pending, { force: true });
    const result = spawnSync('zip', ['-q', '-r', pending, ...files], { cwd, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout || 'Export impossible');
    const integrity = spawnSync('unzip', ['-tqq', pending], { encoding: 'utf8' });
    if (integrity.status !== 0) throw new Error(`Archive invalide : ${name}`);
    const listing = spawnSync('unzip', ['-Z1', pending], { encoding: 'utf8' });
    if (listing.status !== 0) throw new Error(`Lecture de l’archive impossible : ${name}`);
    if (/(^|\/)\.local\/|auth\.json|access\.json|node_modules\//m.test(listing.stdout)) throw new Error('Fichier privé détecté dans export');
    await fs.rename(pending, target);
    console.log(`${name} : ${listing.stdout.trim().split('\n').length} entrées, aucun accès local inclus.`);
  } finally {
    await fs.rm(pending, { force: true });
  }
};

const research = (await fs.readdir(path.join(root, 'research'), { withFileTypes: true }))
  .filter(entry => entry.isFile() && /\.(?:json|md)$/.test(entry.name))
  .map(entry => `research/${entry.name}`).sort();

await archive('site-public.zip', path.join(root, 'dist'), ['.']);
await archive('apercu-social.zip', root, [
  'public/share-preview.html', 'public/share-preview.css',
  'public/brand-intro.css', 'public/brand-intro.js',
  'public/assets/logo.jpg', 'public/assets/real/pilates-mouvement.webp',
  'public/assets/social/pole-sante-sport-preview-v3.jpg',
  'public/assets/fonts', 'public/assets/favicon.svg',
  'scripts/render-share-preview.mjs', 'output/social/preview-master-v3.png',
  'research/real-sport-images.json', 'research/preview-sociale.md', 'research/preview-sociale-qa.json'
]);
await archive('sources-completes.zip', root, [
  'package.json', 'package-lock.json', '.gitignore', 'server.mjs',
  'content', 'public', 'scripts', 'admin', 'tests', ...research,
  'output/social/preview-master-v3.png', 'README.md', 'LIVRAISON.md', '.github'
]);

// Generated images are historical working files, separate from the current site.
if (await exists(path.join(root, 'output/imagegen'))) {
  await archive('archives-visuels-ia-historiques.zip', path.join(root, 'output/imagegen'), ['.']);
} else {
  console.log('archives-visuels-ia-historiques.zip : originaux historiques absents de ce poste ; archive existante conservée, le cas échéant.');
}

// Originals may live in ignored local research folders. Copy only audited images,
// using clean archive paths; never package the folders that contain local access.
const originalsName = 'photos-reelles-originaux.zip';
const auditPaths = ['research/portraits-officiels.json', 'research/real-sport-images.json'];
const auditedFiles = [];
const unavailable = [];
const destinations = new Set();
for (const auditPath of auditPaths) {
  let audit;
  try { audit = JSON.parse(await fs.readFile(path.join(root, auditPath), 'utf8')); }
  catch (error) { unavailable.push(`${auditPath} (${error.code || 'audit illisible'})`); continue; }
  const portraits = auditPath.includes('portraits');
  for (const entry of (portraits ? audit.portraits : audit.images) || []) {
    const original = portraits ? entry.originalPath : entry.sourceOriginalPath;
    if (!original || !entry.path) { unavailable.push(`${entry.name || entry.path || auditPath} (chemin original manquant)`); continue; }
    const source = path.resolve(root, original);
    if (!source.startsWith(root + path.sep) || !/\.(?:jpe?g|png|webp|avif|tiff?)$/i.test(source)) throw new Error(`Chemin image original invalide : ${original}`);
    const destination = `${portraits ? 'portraits' : 'disciplines'}/${path.parse(entry.path).name}${path.extname(source).toLowerCase()}`;
    if (destinations.has(destination)) throw new Error(`Nom original dupliqué : ${destination}`);
    destinations.add(destination);
    try {
      const bytes = await fs.readFile(source);
      if (entry.sourceSha256 && createHash('sha256').update(bytes).digest('hex') !== entry.sourceSha256) {
        unavailable.push(`${original} (empreinte différente de l’audit)`);
        continue;
      }
      auditedFiles.push({ bytes, destination });
    } catch (error) { unavailable.push(`${original} (${error.code || 'lecture impossible'})`); }
  }
}

if (unavailable.length || auditedFiles.length === 0) {
  const retained = await exists(path.join(exportDir, originalsName));
  console.warn(`${originalsName} : ${retained ? 'archive existante conservée sans modification' : 'archive non créée'}. Les originaux locaux nécessaires ne sont pas tous disponibles.`);
  for (const item of unavailable) console.warn(`  Manquant ou différent : ${item}`);
  if (!auditedFiles.length && !unavailable.length) console.warn('  Les deux audits ne recensent aucun original à exporter.');
} else {
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'pss-photos-reelles-'));
  try {
    const files = [];
    for (const { bytes, destination } of auditedFiles) {
      await fs.mkdir(path.dirname(path.join(stage, destination)), { recursive: true });
      await fs.writeFile(path.join(stage, destination), bytes);
      files.push(destination);
    }
    for (const auditPath of auditPaths) {
      const destination = path.basename(auditPath);
      await fs.copyFile(path.join(root, auditPath), path.join(stage, destination));
      files.push(destination);
    }
    await archive(originalsName, stage, files);
  } finally {
    await fs.rm(stage, { recursive: true, force: true });
  }
}
