import { emptyNotebook, validateNotebook, validateBackup, MAX_FILE_BYTES } from './notebook.js';

// Same envelope-encryption model as P.U.S.H.: random 256-bit data key, two
// independent PBKDF2 wraps, fresh AES-GCM IVs, session-only unwrapped key.
// All notebook contents (including drafts, searches and visits) are protected.
const DB_NAME = 'closet-prayer-study';
const encoder = new TextEncoder(), decoder = new TextDecoder();
const AAD = encoder.encode('closet-prayer-study:v1');
const ITERATIONS = 600000;
let dbPromise, revision = 0, currentEnvelope = null, key = null;
let writes = Promise.resolve();
const random = n => crypto.getRandomValues(new Uint8Array(n));
const b64 = bytes => { let s = ''; for (const v of new Uint8Array(bytes)) s += String.fromCharCode(v); return btoa(s); };
const unb64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
function requireCrypto() { if (!crypto?.subtle) throw new Error('Private Vault requires HTTPS or localhost. For phone testing, use an HTTPS address.'); }
async function derive(secret, info) {
  requireCrypto();
  if (typeof secret !== 'string' || secret.length > 10000 || !info || typeof info.salt !== 'string' || info.salt.length > 100 || !Number.isInteger(info.iterations) || info.iterations < 100000 || info.iterations > 2000000) throw new Error('Invalid encryption settings.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(info.salt), iterations: info.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(data, k) {
  const iv = random(12);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, k, data);
  return { iv: b64(iv), data: b64(cipher) };
}
async function unseal(payload, k) {
  if (!payload || typeof payload.iv !== 'string' || payload.iv.length > 30 || typeof payload.data !== 'string' || payload.data.length > MAX_FILE_BYTES * 2) throw new Error('Invalid encrypted payload.');
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(payload.iv), additionalData: AAD }, k, unb64(payload.data));
}
async function unwrap(vault, secret, recovery = false) {
  const info = recovery ? vault.recovery : vault.pass;
  const normalized = recovery ? secret.trim().toUpperCase().replace(/\s/g, '') : secret;
  const wrapKey = await derive(normalized, info);
  const raw = new Uint8Array(await unseal(info.wrapped, wrapKey));
  try { return await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); }
  finally { raw.fill(0); }
}
function database() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Browser storage is unavailable. Enable site storage and reload.'));
    request.onblocked = () => reject(new Error('Close other Study tabs and reload to open the notebook.'));
  });
  return dbPromise;
}
async function readEnvelope() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('state').objectStore('state').get('notebook');
    request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error);
  });
}
async function writeEnvelope(value) {
  const db = await database(); const expected = revision;
  return new Promise((resolve, reject) => {
    let failure;
    const tx = db.transaction('state', 'readwrite'); const store = tx.objectStore('state');
    const req = store.get('notebook');
    req.onsuccess = () => {
      if ((req.result?.revision || 0) !== expected) {
        failure = new Error('This notebook changed in another tab. Export your current work, then reload before continuing.');
        tx.abort(); return;
      }
      store.put({ ...value, revision: expected + 1 }, 'notebook');
    };
    tx.oncomplete = () => { revision = expected + 1; currentEnvelope = { ...value, revision }; resolve(); };
    tx.onabort = tx.onerror = () => reject(failure || new Error('The notebook could not be saved. Check available browser storage and export your work.'));
  });
}
function queued(fn) { const next = writes.then(fn); writes = next.catch(() => {}); return next; }
export async function loadNotebook() {
  currentEnvelope = await readEnvelope(); revision = currentEnvelope?.revision || 0;
  if (!currentEnvelope) return { notebook: emptyNotebook(), locked: false, protected: false };
  if (currentEnvelope.mode === 'vault') return { notebook: null, locked: true, protected: true };
  if (currentEnvelope.mode !== 'plain') throw new Error('Unrecognized notebook storage. Your stored data has not been changed.');
  return { notebook: validateNotebook(currentEnvelope.data), locked: false, protected: false };
}
export function persistNotebook(notebook) {
  const copy = structuredClone(notebook);
  return queued(async () => {
    const data = validateNotebook(copy);
    if (currentEnvelope?.mode === 'vault') {
      if (!key) throw new Error('Unlock your notebook before saving.');
      await writeEnvelope({ mode: 'vault', vault: currentEnvelope.vault, payload: await seal(encoder.encode(JSON.stringify(data)), key) });
    } else await writeEnvelope({ mode: 'plain', data });
  });
}
export async function unlockNotebook(secret, recovery = false) {
  const envelope = await readEnvelope();
  if (envelope?.mode !== 'vault') throw new Error('This notebook is not locked. Reload to continue.');
  let unlocked;
  try { unlocked = await unwrap(envelope.vault, secret, recovery); }
  catch { throw new Error(recovery ? 'That Recovery Code did not unlock the notebook.' : 'That passphrase did not unlock the notebook.'); }
  const data = validateNotebook(JSON.parse(decoder.decode(await unseal(envelope.payload, unlocked))));
  key = unlocked; currentEnvelope = envelope; revision = envelope.revision;
  return data;
}
export function lockNotebook() { key = null; }
export async function enableVault(notebook, secret) {
  if (secret.length < 12) throw new Error('Use a passphrase of at least 12 characters.');
  requireCrypto();
  return queued(async () => {
    const bytes = random(32);
    const recoveryCode = [...random(20)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().match(/.{1,5}/g).join('-');
    try {
      const dataKey = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
      const pass = { salt: b64(random(16)), iterations: ITERATIONS };
      const recovery = { salt: b64(random(16)), iterations: ITERATIONS };
      pass.wrapped = await seal(bytes, await derive(secret, pass));
      recovery.wrapped = await seal(bytes, await derive(recoveryCode, recovery));
      const payload = await seal(encoder.encode(JSON.stringify(validateNotebook(notebook))), dataKey);
      await writeEnvelope({ mode: 'vault', vault: { version: 1, pass, recovery }, payload });
      key = dataKey;
      return recoveryCode;
    } finally { bytes.fill(0); }
  });
}
export function disableVault(notebook) {
  return queued(async () => { if (!key) throw new Error('Unlock your notebook first.'); await writeEnvelope({ mode: 'plain', data: validateNotebook(notebook) }); key = null; });
}
export async function encodeBackup(backup) {
  if (currentEnvelope?.mode === 'vault') {
    if (!key) throw new Error('Unlock your notebook before exporting.');
    return { format: 'closet-prayer/study-encrypted', version: 1, vault: currentEnvelope.vault, payload: await seal(encoder.encode(JSON.stringify(backup)), key) };
  }
  return backup;
}
export async function decodeBackup(raw, secret = '', recovery = false) {
  if (raw?.format !== 'closet-prayer/study-encrypted') return validateBackup(raw);
  if (raw.version !== 1 || raw.vault?.version !== 1) throw new Error('Unsupported encrypted backup version.');
  let decoded;
  try { decoded = decoder.decode(await unseal(raw.payload, await unwrap(raw.vault, secret, recovery))); }
  catch { throw new Error('Unable to open this backup. Check its passphrase or Recovery Code; the file may also be damaged.'); }
  return validateBackup(JSON.parse(decoded));
}
export async function readBackupFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('This development version supports backups up to 10 MB.');
  let raw; try { raw = JSON.parse(await file.text()); } catch { throw new Error('This file is not a readable JSON backup.'); }
  if (raw?.format === 'closet-prayer/study-encrypted') return { encrypted: true, raw, name: file.name };
  return { encrypted: false, raw, backup: validateBackup(raw), name: file.name };
}
export function downloadFile(name, text, type = 'application/json') {
  const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
