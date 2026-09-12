import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../dist/', import.meta.url);
async function filesAt(dir, prefix = '') {
  const list = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'sw.js') continue;
    if (entry.isDirectory()) list.push(...await filesAt(new URL(entry.name + '/', dir), prefix + entry.name + '/'));
    else list.push(prefix + entry.name);
  }
  return list;
}
const files = await filesAt(root);
const hash = createHash('sha256');
for (const f of files.sort()) hash.update(await readFile(new URL(f, root)));
const version = hash.digest('hex').slice(0, 12);
await writeFile(new URL('sw.js', root), `// Generated from the exact build contents. Do not edit.
const CACHE='cp-study-${version}';
const FILES=${JSON.stringify(files.map(f => './' + f))};
const ROOT=new URL('./',self.location).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
// No skipWaiting: a new build never forces a refresh over an unfinished draft.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cp-study-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||!req.url.startsWith(ROOT))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(req);
    if(cached)return cached;
    if(req.mode==='navigate')return (await cache.match(new URL('./index.html',ROOT).href))||fetch(req);
    return fetch(req);
  }));
});
`);
console.log(`Offline cache prepared: ${files.length} files (${version}).`);
