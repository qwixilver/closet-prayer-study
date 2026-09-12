import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyNotebook, emptyDraft, saveEntry, makeBackup, mergeBackup, validateBackup, validateNotebook, deleteEntry, journalText } from '../src/notebook.js';
import { topics, studies, searchStudies, studyById } from '../src/content.js';

const create = (notebook, title, seed = {}) => saveEntry(notebook, emptyDraft({ title, body: 'An honest observation.', ...seed }), 1700000000000);
test('reflection remains separate; correcting wording preserves the old version', () => {
  const first = create(emptyNotebook(), 'My first understanding');
  const second = create(first.notebook, 'A later understanding', { parentId: first.entry.id });
  assert.equal(second.notebook.entries.length, 2);
  assert.equal(second.notebook.entries[0].title, 'My first understanding');
  const correction = saveEntry(second.notebook, { ...first.entry, editId: first.entry.id, body: 'Corrected spelling.' }, 1800000000000);
  assert.equal(correction.entry.createdAt, first.entry.createdAt);
  assert.equal(correction.entry.revisions[0].snapshot.body, 'An honest observation.');
  assert.equal(correction.entry.revisions[0].at, 1800000000000);
  validateNotebook(correction.notebook);
});
test('full and selected exports round trip, keeping ancestors and corrections', () => {
  const first = create(emptyNotebook(), 'First');
  const second = create(first.notebook, 'Next', { parentId: first.entry.id });
  const third = create(second.notebook, 'Unrelated');
  const full = validateBackup(JSON.parse(JSON.stringify(makeBackup(third.notebook))));
  assert.deepEqual(full.data, third.notebook);
  const partial = makeBackup(third.notebook, [second.entry.id]);
  assert.equal(partial.data.entries.length, 2);
  assert.equal(partial.scope, 'selection');
  validateNotebook(partial.data);
});
test('merge is idempotent and preserves a differing entry without overwriting', () => {
  const first = create(emptyNotebook(), 'First');
  const copy = structuredClone(first.notebook); copy.entries[0].body = 'Different interpretation.';
  const backup = makeBackup(copy);
  const result = mergeBackup(first.notebook, backup);
  assert.equal(result.added, 1); assert.equal(result.conflicts, 1);
  assert.equal(result.notebook.entries[0].body, 'An honest observation.');
  const repeated = mergeBackup(result.notebook, backup);
  assert.equal(repeated.added, 0); assert.equal(repeated.notebook.entries.length, 2);
});
test('merging a changed parent and child preserves imported relationships', () => {
  const first = create(emptyNotebook(), 'First');
  const second = create(first.notebook, 'Next', { parentId: first.entry.id });
  const copy = structuredClone(second.notebook); copy.entries[0].body = 'Changed parent'; copy.entries[1].body = 'Changed child';
  const result = mergeBackup(second.notebook, makeBackup(copy));
  const parent = result.notebook.entries.find(e => e.body === 'Changed parent');
  const child = result.notebook.entries.find(e => e.body === 'Changed child');
  assert.equal(child.parentId, parent.id);
  assert.equal(mergeBackup(result.notebook, makeBackup(copy)).added, 0);
});
test('merge retains current unfinished work', () => {
  const current = emptyNotebook(); current.draft = emptyDraft({ body: 'Still writing' });
  const incoming = create(emptyNotebook(), 'Imported');
  assert.equal(mergeBackup(current, makeBackup(incoming.notebook)).notebook.draft.body, 'Still writing');
});
test('unchanged imported reflection follows its imported parent when the parent differs', () => {
  const first = create(emptyNotebook(), 'First');
  const second = create(first.notebook, 'Next', { parentId: first.entry.id });
  const copy = structuredClone(second.notebook); copy.entries[0].body = 'Changed parent only';
  const result = mergeBackup(second.notebook, makeBackup(copy));
  const parent = result.notebook.entries.find(e => e.body === 'Changed parent only');
  assert.ok(result.notebook.entries.some(e => e.title === 'Next' && e.parentId === parent.id));
  assert.equal(result.notebook.entries.length, 4);
  assert.equal(mergeBackup(result.notebook, makeBackup(copy)).added, 0);
});
test('invalid types, duplicate IDs, cycles, and foreign backups are rejected', () => {
  assert.throws(() => validateBackup({ version: 1, data: {} }), /Study backup/);
  const first = create(emptyNotebook(), 'First');
  const raw = makeBackup(first.notebook);
  raw.data.entries[0].body = 99; assert.throws(() => validateBackup(raw), /reflection/);
  const duplicate = makeBackup(first.notebook); duplicate.data.entries.push(duplicate.data.entries[0]);
  assert.throws(() => validateBackup(duplicate), /duplicate/);
  const cycle = create(first.notebook, 'Second', { parentId: first.entry.id }); cycle.notebook.entries[0].parentId = cycle.entry.id;
  assert.throws(() => validateNotebook(cycle.notebook), /circular/);
});
test('deleting an earlier entry retains later reflections', () => {
  const first = create(emptyNotebook(), 'First');
  const second = create(first.notebook, 'Second', { parentId: first.entry.id });
  const result = deleteEntry(second.notebook, first.entry.id);
  assert.equal(result.entries.length, 1); assert.equal(result.entries[0].parentId, null); validateNotebook(result);
});
test('readable chronological journal includes earlier wording and optional fields', () => {
  const first = create(emptyNotebook(), 'First', { fields: { understanding: 'My understanding' } });
  const corrected = saveEntry(first.notebook, { ...first.entry, editId: first.entry.id, body: 'Corrected' });
  const text = journalText(corrected.notebook.entries);
  assert.match(text, /An honest observation/); assert.match(text, /My understanding/); assert.match(text, /Corrected/);
});
test('search routes user language to the agreed content without invented answers', () => {
  assert.equal(searchStudies('I saw my dead grandmother')[0].id, 'death-sleep');
  assert.equal(searchStudies('What happens when we die?')[0].id, 'death-sleep');
  assert.equal(searchStudies('Why did Jesus die?')[0].id, 'love-cross');
  assert.equal(searchStudies('How do I start reading the Bible?')[0].id, 'read-context');
  assert.equal(searchStudies('Do I have to earn acceptance?')[0].id, 'gift-grace');
  assert.equal(searchStudies('How do I study the Bible?')[0].id, 'read-context');
  assert.equal(searchStudies('quantum banana accelerator').length, 0);
  assert.equal(searchStudies('Sabbath').some(s => s.id === 'sabbath-gift'), true);
  assert.equal(searchStudies('Shepherd’s Rod')[0].id, 'test-teaching');
});
test('all initial topics have complete, connected explorations with stable IDs', () => {
  assert.equal(topics.length, 7); assert.equal(studies.length, 21);
  assert.equal(new Set(studies.map(s => s.id)).size, studies.length);
  for (const topic of topics) assert.equal(studies.filter(s => s.topic === topic.id).length, 3);
  for (const s of studies) { assert.ok(s.readings.length >= 2); assert.ok(s.consider.length > 150); for (const id of s.related) assert.ok(studyById[id]); }
});
