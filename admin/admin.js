const byId = (id) => document.getElementById(id);
let csrf = '';
let dirty = false;
let validated = false;
let hasDraft = false;
let working = false;
function markDirty() { dirty = true; validated = false; byId('draft-state').textContent = 'Modifications non enregistrées.'; updateActions(); }
function readEditors() { return { site: JSON.parse(byId('site-editor').value), editorial: JSON.parse(byId('editorial-editor').value) }; }
function writeEditors(content) { byId('site-editor').value = JSON.stringify(content.site, null, 2); byId('editorial-editor').value = JSON.stringify(content.editorial, null, 2); }
function options(id, entries) {
  const select = byId(id); const previous = select.value; select.replaceChildren();
  for (const entry of entries) { const option = document.createElement('option'); option.value = entry.value; option.textContent = entry.label; select.append(option); }
  if (entries.some((entry) => entry.value === previous)) select.value = previous;
  select.disabled = !entries.length;
}
function showPerson(content) {
  const person = content.site?.team?.[Number(byId('person-select').value)]; byId('person-fields').hidden = !person;
  for (const key of ['name', 'role', 'address', 'phone', 'bookingUrl']) byId(key === 'bookingUrl' ? 'person-booking' : `person-${key}`).value = person?.[key] || '';
}
function selectedEntry(content) { const [collection, index] = byId('entry-select').value.split(':'); return { collection, entry: content.editorial?.[collection]?.[Number(index)] }; }
function showEntry(content) {
  const { collection, entry } = selectedEntry(content); byId('entry-fields').hidden = !entry;
  byId('entry-title').value = entry?.title || ''; byId('entry-intro').value = entry?.[collection === 'services' ? 'intro' : 'excerpt'] || '';
  byId('entry-paragraphs').value = Array.isArray(entry?.paragraphs) ? entry.paragraphs.join('\n\n') : '';
  byId('entry-sources').value = Array.isArray(entry?.sourceUrls) ? entry.sourceUrls.join('\n') : '';
}
function refreshGuided() {
  try {
    const content = readEditors(); if (!content.site || typeof content.site !== 'object' || !content.editorial || typeof content.editorial !== 'object') throw new Error();
    byId('guided-editor').disabled = false; byId('guided-warning').hidden = true;
    for (const [id, key] of [['hero-title', 'heroTitle'], ['hero-text', 'heroText'], ['hours-note', 'hoursNote']]) byId(id).value = content.site[key] || '';
    byId('retire-date').value = content.site.demo?.retireAt || '';
    options('person-select', (Array.isArray(content.site.team) ? content.site.team : []).map((person, index) => ({ value: String(index), label: person?.name || `Praticien ${index + 1}` })));
    options('entry-select', ['services', 'articles'].flatMap((collection) => (Array.isArray(content.editorial[collection]) ? content.editorial[collection] : []).map((entry, index) => ({ value: `${collection}:${index}`, label: `${collection === 'services' ? 'Prestation' : 'Article'} · ${entry?.title || 'Sans titre'}` }))));
    showPerson(content); showEntry(content);
  } catch { byId('guided-editor').disabled = true; byId('guided-warning').hidden = false; }
}
function guidedChange(change) {
  try { const content = readEditors(); change(content); writeEditors(content); markDirty(); }
  catch { byId('guided-editor').disabled = true; byId('guided-warning').hidden = false; showMessage('Corrigez le JSON avancé avant de poursuivre l’édition guidée.', true); }
}
function showMessage(text, error = false) { const element = byId('message'); element.textContent = text; element.classList.toggle('error', error); element.hidden = false; }
function updateActions() { byId('validate-draft').disabled = working || dirty || !hasDraft; byId('publish-draft').disabled = working || dirty || !validated; byId('save-draft').disabled = working; }
async function api(url, method = 'GET', data) {
  const response = await fetch(`/api/${url}`, { method, credentials: 'same-origin', headers: { ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && url !== 'login') { byId('workspace').hidden = true; byId('login-panel').hidden = false; csrf = ''; }
    throw new Error([result.error || 'Opération impossible.', ...(result.errors || [])].join('\n'));
  }
  return result;
}
async function operation(action) { if (working) return; working = true; updateActions(); try { await action(); } catch (error) { showMessage(error.message, true); } finally { working = false; updateActions(); } }
async function refreshHistory() {
  const result = await api('history');
  const list = byId('history-list'); list.replaceChildren();
  if (!result.history.length) { const li = document.createElement('li'); li.textContent = 'Les premières versions apparaîtront après une publication locale.'; list.append(li); }
  for (const entry of result.history) {
    const li = document.createElement('li'); const text = document.createElement('div'); text.textContent = entry.reason;
    const date = document.createElement('span'); date.textContent = new Date(entry.createdAt).toLocaleString('fr-FR'); text.append(date);
    const button = document.createElement('button'); button.className = 'button-secondary'; button.textContent = 'Restaurer en brouillon';
    button.addEventListener('click', () => operation(async () => {
      if (dirty && !window.confirm('Remplacer les modifications non enregistrées par cette version ?')) return;
      if (hasDraft && !window.confirm('Remplacer le brouillon actuel par cette version ?')) return;
      await api('restore', 'POST', { id: entry.id }); await loadContent(); showMessage('Version restaurée en brouillon. Relisez-la puis validez-la avant publication.');
    }));
    li.append(text, button); list.append(li);
  }
}
async function loadContent() {
  const result = await api('content'); const content = result.draft?.content || result.published;
  writeEditors(content); refreshGuided();
  dirty = false; hasDraft = Boolean(result.draft); validated = Boolean(result.draft?.validatedAt);
  byId('draft-state').textContent = result.draft ? `Brouillon enregistré le ${new Date(result.draft.updatedAt).toLocaleString('fr-FR')}${validated ? ' · Format validé' : ' · À valider'}` : 'Vous consultez les contenus publiés localement.';
  await refreshHistory(); updateActions();
}
async function enterWorkspace() { byId('login-panel').hidden = true; byId('workspace').hidden = false; byId('password').value = ''; await loadContent(); }
byId('login-form').addEventListener('submit', (event) => { event.preventDefault(); operation(async () => { const result = await api('login', 'POST', { password: byId('password').value }); csrf = result.csrf; await enterWorkspace(); byId('message').hidden = true; }); });
byId('logout').addEventListener('click', () => operation(async () => { if (dirty && !window.confirm('Se déconnecter sans enregistrer les modifications ?')) return; await api('logout', 'POST', {}); csrf = ''; dirty = false; byId('workspace').hidden = true; byId('login-panel').hidden = false; showMessage('Vous êtes déconnecté.'); }));
for (const id of ['site-editor', 'editorial-editor']) byId(id).addEventListener('input', () => { markDirty(); refreshGuided(); });
for (const [id, key] of [['hero-title', 'heroTitle'], ['hero-text', 'heroText'], ['hours-note', 'hoursNote']]) byId(id).addEventListener('input', () => guidedChange((content) => { content.site[key] = byId(id).value; }));
byId('retire-date').addEventListener('input', () => guidedChange((content) => { content.site.demo = { ...content.site.demo, retireAt: byId('retire-date').value || null }; }));
byId('person-select').addEventListener('change', () => showPerson(readEditors()));
byId('entry-select').addEventListener('change', () => showEntry(readEditors()));
for (const [id, key] of [['person-name', 'name'], ['person-role', 'role'], ['person-address', 'address'], ['person-phone', 'phone'], ['person-booking', 'bookingUrl']]) byId(id).addEventListener('input', () => guidedChange((content) => {
  const person = content.site.team[Number(byId('person-select').value)]; person[key] = byId(id).value;
  if (key === 'name') byId('person-select').selectedOptions[0].textContent = person.name || 'Praticien';
}));
for (const id of ['entry-title', 'entry-intro', 'entry-paragraphs', 'entry-sources']) byId(id).addEventListener('input', () => guidedChange((content) => {
  const { collection, entry } = selectedEntry(content);
  if (id === 'entry-title') { entry.title = byId(id).value; byId('entry-select').selectedOptions[0].textContent = `${collection === 'services' ? 'Prestation' : 'Article'} · ${entry.title}`; }
  else if (id === 'entry-intro') entry[collection === 'services' ? 'intro' : 'excerpt'] = byId(id).value;
  else entry[id === 'entry-paragraphs' ? 'paragraphs' : 'sourceUrls'] = byId(id).value.split(id === 'entry-paragraphs' ? /\n\s*\n/ : /\n/).map((text) => text.trim()).filter(Boolean);
}));
byId('save-draft').addEventListener('click', () => operation(async () => {
  let content; try { content = { site: JSON.parse(byId('site-editor').value), editorial: JSON.parse(byId('editorial-editor').value) }; } catch { throw new Error('Le JSON contient une erreur. Vérifiez les guillemets, virgules et accolades dans les deux zones.'); }
  await api('draft', 'PUT', content); dirty = false; validated = false; hasDraft = true; byId('draft-state').textContent = 'Brouillon enregistré · À valider'; showMessage('Brouillon enregistré sur cet ordinateur. Le site reste inchangé.');
}));
byId('validate-draft').addEventListener('click', () => operation(async () => { await api('validate', 'POST', {}); validated = true; byId('draft-state').textContent = 'Brouillon enregistré · Format validé'; showMessage('Le format du brouillon est valide. Relisez les coordonnées, les sources et les droits d’utilisation avant publication.'); }));
byId('publish-draft').addEventListener('click', () => operation(async () => { const result = await api('publish', 'POST', {}); await loadContent(); showMessage(result.message); }));
window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
operation(async () => { const session = await api('session'); if (session.authenticated) { csrf = session.csrf; await enterWorkspace(); } });
