export const FORMAT = 'closet-prayer/study-backup';
export const VERSION = 1;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const uid = () => crypto.randomUUID?.() || [...crypto.getRandomValues(new Uint8Array(16))].map(v => v.toString(16).padStart(2, '0')).join('');
export const emptyNotebook = () => ({ schemaVersion: 1, entries: [], visits: [], draft: null });
export const emptyDraft = (seed = {}) => ({ title: '', body: '', topics: [], passages: '', fields: {}, studyId: null, parentId: null, editId: null, query: '', ...seed });
export const fieldLabels = { observations: 'What I noticed', understanding: 'My current understanding', questions: 'What I’m still wondering', next: 'What I want to explore next' };

function fail(message) { throw new Error(message); }
function str(value, name, max = 200000) {
  if (typeof value !== 'string' || value.length > max) fail(`Invalid ${name} in this backup.`);
  return value;
}
function nullableId(value, name) { return value === null || value === undefined ? null : str(value, name, 250); }
function fields(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 40) fail('Invalid research fields.');
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [str(k, 'field name', 100), str(v, 'field text')]));
}
function details(value) {
  if (!value || typeof value !== 'object') fail('Invalid entry.');
  if (!Array.isArray(value.topics) || value.topics.length > 30) fail('Invalid entry topics.');
  return {
    title: str(value.title, 'title', 500), body: str(value.body, 'reflection'),
    topics: [...new Set(value.topics.map(t => str(t, 'topic', 120)))],
    passages: str(value.passages, 'passages', 10000), fields: fields(value.fields),
    studyId: nullableId(value.studyId, 'study reference'), parentId: nullableId(value.parentId, 'earlier entry'),
    query: str(value.query ?? '', 'starting question', 2000),
  };
}
function timestamp(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 8640000000000000) fail('Invalid date in this backup.');
  return value;
}
export function validateNotebook(raw) {
  if (raw?.schemaVersion !== VERSION) fail('This notebook uses an unsupported version. Your current data has not been changed.');
  if (!Array.isArray(raw.entries) || raw.entries.length > 10000 || !Array.isArray(raw.visits) || raw.visits.length > 10000) fail('Invalid notebook contents.');
  const entries = raw.entries.map(e => {
    if (!Array.isArray(e.revisions) || e.revisions.length > 1000) fail('Invalid correction history.');
    const entry = {
      ...details(e), id: str(e.id, 'entry ID', 250), createdAt: timestamp(e.createdAt), updatedAt: timestamp(e.updatedAt),
      revisions: e.revisions.map(r => ({ id: str(r.id, 'revision ID', 250), at: timestamp(r.at), snapshot: details(r.snapshot) })),
    };
    if (!entry.id || entry.parentId === entry.id) fail('Invalid entry relationship.');
    if (e.importedFrom) entry.importedFrom = str(e.importedFrom, 'import reference', 250);
    return entry;
  });
  const ids = new Set(entries.map(e => e.id));
  if (ids.size !== entries.length) fail('This backup has duplicate entry IDs.');
  const byId = new Map(entries.map(e => [e.id, e]));
  for (const e of entries) {
    const seen = new Set([e.id]); let parent = e.parentId;
    while (parent) {
      if (!ids.has(parent)) fail('An earlier entry is missing from this backup.');
      if (seen.has(parent)) fail('This backup contains a circular entry relationship.');
      seen.add(parent); parent = byId.get(parent).parentId;
    }
  }
  const visits = raw.visits.map(v => ({ studyId: str(v.studyId, 'visited study', 250), at: timestamp(v.at) }));
  let draft = null;
  if (raw.draft) {
    draft = { ...details(raw.draft), editId: nullableId(raw.draft.editId, 'draft entry') };
    if (draft.editId && !ids.has(draft.editId)) fail('The draft refers to a missing entry.');
    if (draft.parentId && !ids.has(draft.parentId)) fail('The draft refers to a missing earlier entry.');
  }
  return { schemaVersion: VERSION, entries, visits, draft };
}
export function snapshot(entry) { return details(entry); }
export function saveEntry(notebook, draft, now = Date.now()) {
  if (![draft.title, draft.body, draft.passages, ...Object.values(draft.fields)].some(v => v.trim())) fail('Write a question, observation, or reflection before saving.');
  const base = { ...details(draft), title: draft.title.trim() || 'Untitled reflection' };
  let entry;
  if (draft.editId) {
    const old = notebook.entries.find(e => e.id === draft.editId);
    if (!old) fail('The entry you were editing is no longer available.');
    entry = { ...old, ...base, updatedAt: now, revisions: [...old.revisions, { id: uid(), at: now, snapshot: snapshot(old) }] };
  } else entry = { ...base, id: uid(), createdAt: now, updatedAt: now, revisions: [] };
  return { notebook: { ...notebook, entries: [...notebook.entries.filter(e => e.id !== entry.id), entry], draft: null }, entry };
}
export function deleteEntry(notebook, id) {
  return { ...notebook, entries: notebook.entries.filter(e => e.id !== id).map(e => e.parentId === id ? { ...e, parentId: null } : e),
    draft: notebook.draft?.editId === id || notebook.draft?.parentId === id ? null : notebook.draft };
}
export function makeBackup(notebook, selectedIds = null) {
  let data = notebook;
  if (selectedIds) {
    const ids = new Set(selectedIds); const byId = new Map(notebook.entries.map(e => [e.id, e]));
    for (const id of ids) { const parent = byId.get(id)?.parentId; if (parent) ids.add(parent); }
    data = { ...notebook, entries: notebook.entries.filter(e => ids.has(e.id)), visits: [], draft: null };
  }
  return { format: FORMAT, version: VERSION, scope: selectedIds ? 'selection' : 'full', exportedAt: Date.now(), data: validateNotebook(data) };
}
export function validateBackup(raw) {
  if (raw?.format !== FORMAT || raw?.version !== VERSION || !['full', 'selection'].includes(raw?.scope)) fail('Choose a Closet Prayer Study backup. Prayer Journal backups use a different format.');
  timestamp(raw.exportedAt);
  return { ...raw, data: validateNotebook(raw.data) };
}
const stable = value => value && typeof value === 'object' ? Array.isArray(value) ? value.map(stable) : Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value;
const comparable = e => JSON.stringify(stable({ ...e, id: undefined, importedFrom: undefined }));
function hash(text) { let a = 2166136261; for (const c of text) { a ^= c.charCodeAt(0); a = Math.imul(a, 16777619); } return (a >>> 0).toString(16); }
export function mergeBackup(current, incoming) {
  const backup = validateBackup(incoming);
  const all = new Map(current.entries.map(e => [e.id, e]));
  const source = new Map(backup.data.entries.map(e => [e.id, e]));
  const map = new Map(); let added = 0, conflicts = 0;
  const mergeOne = original => {
    if (map.has(original.id)) return map.get(original.id);
    const entry = { ...original, parentId: original.parentId ? mergeOne(source.get(original.parentId)) : null };
    let id = entry.id;
    if (all.has(id) && comparable(all.get(id)) !== comparable(entry)) {
      id = `${entry.id.slice(0, 150)}~${hash(comparable(entry))}`;
      let n = 0;
      while (all.has(id) && comparable(all.get(id)) !== comparable(entry)) id = `${entry.id.slice(0, 150)}~${hash(comparable(entry))}-${++n}`;
    }
    map.set(original.id, id);
    if (!all.has(id)) {
      const conflict = id !== original.id;
      all.set(id, { ...entry, id, ...(conflict ? { importedFrom: original.id } : {}) });
      added++; if (conflict) conflicts++;
    }
    return id;
  };
  for (const entry of backup.data.entries) mergeOne(entry);
  const visits = new Map(current.visits.map(v => [v.studyId, v]));
  for (const v of backup.data.visits) if (!visits.has(v.studyId) || visits.get(v.studyId).at < v.at) visits.set(v.studyId, v);
  const notebook = validateNotebook({ ...current, entries: [...all.values()], visits: [...visits.values()] });
  return { notebook, added, conflicts };
}
export function journalText(entries, topicName = id => id) {
  return ['CLOSET PRAYER · RESEARCH JOURNAL', '', ...[...entries].sort((a, b) => a.createdAt - b.createdAt).flatMap(e => [
    `${new Date(e.createdAt).toLocaleString()} — ${e.title}`, `Entry: ${e.id}`, e.parentId ? `Reflection on: ${e.parentId}` : '',
    e.topics.map(topicName).join(', '), e.query ? `Starting question: ${e.query}` : '', e.passages ? `Passages: ${e.passages}` : '', '', e.body,
    ...Object.entries(e.fields).filter(([, v]) => v.trim()).flatMap(([key, value]) => ['', `${fieldLabels[key] || key}:`, value]),
    ...e.revisions.flatMap(r => ['', `Earlier version (preserved ${new Date(r.at).toLocaleString()}):`, r.snapshot.title, r.snapshot.body,
      `Passages: ${r.snapshot.passages}`, ...Object.entries(r.snapshot.fields).flatMap(([k, v]) => [`${fieldLabels[k] || k}: ${v}`])]),
    '', '────────────────────────', '',
  ])].filter(x => x !== undefined).join('\n');
}
