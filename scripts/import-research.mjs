#!/usr/bin/env node
/**
 * Rebuild content/site.json.team from the sourced audit.
 * Other site settings are preserved. Run: node scripts/import-research.mjs
 * Review the audit first: this is an explicit import, never an automatic publish.
 */
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [audit, editorial, site] = await Promise.all([
  readJson('research/business-audit.json'),
  readJson('content/editorial.json'),
  readJson('content/site.json'),
]);
const serviceAliases = {
  dietetique: 'dietetique-nutrition',
  lpg: 'kine-esthetique-lpg',
  gestalt: 'gestalt-therapie',
};
const validServices = new Set(editorial.services.map(({ slug }) => slug));
const byPractitioner = new Map();
for (const service of audit.services) {
  const slug = serviceAliases[service.id] || service.id;
  if (!validServices.has(slug)) throw new Error(`Unknown editorial service: ${slug}`);
  for (const id of service.practitionerIds) {
    if (byPractitioner.has(id)) throw new Error(`Multiple service mappings for ${id}`);
    byPractitioner.set(id, slug);
  }
}
function formatPhone(value) {
  if (!value) return '';
  if (!/^\+33[1-9]\d{8}$/.test(value)) throw new Error(`Unexpected French phone format: ${value}`);
  return `0${value.slice(3)}`.match(/.{2}/g).join(' ');
}
const notes = {
  'isabelle-trohel': 'Numéro téléphonique à confirmer : il diffère entre le site historique et Doctolib. Utilisez le lien de réservation.',
  'jonathan-herjean': 'Plusieurs lieux figurent sur Doctolib : sélectionnez Fontainebleau.',
  raj: 'Le site historique indique le 143 rue Grande. Présence actuelle et horaires à confirmer auprès de l’intervenante.',
};
const team = audit.practitioners.map((person) => {
  const service = byPractitioner.get(person.id);
  if (!service) throw new Error(`Missing service for ${person.id}`);
  if (!person.name || !person.role || !person.sources?.[0]) throw new Error(`Incomplete sourced person: ${person.id}`);
  return {
    name: person.name,
    role: person.role,
    service,
    address: person.address ? person.address.split(',')[0].trim() : '',
    phone: formatPhone(person.phone),
    bookingUrl: person.bookingUrl || '',
    sourceUrl: person.sources[0],
    note: notes[person.id] || '',
  };
});
if (!team.length) throw new Error('Audit contains no practitioners; refusing to replace the team.');
await writeFile(new URL('content/site.json', root), JSON.stringify({ ...site, team }, null, 2) + '\n');
console.log(`Imported ${team.length} sourced practitioners across ${new Set(team.map((person) => person.service)).size} services. Other site settings preserved.`);
