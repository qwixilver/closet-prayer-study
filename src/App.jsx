import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Search, NotebookPen, Settings as SettingsIcon, Sun, Moon, Heart, Sprout, Sunset, Leaf, CloudSun, ArrowLeft, ArrowUpRight, ChevronRight, Plus, X, LockKeyhole, ShieldCheck, Download, Upload, Check, Clock3, Pencil, Trash2, MessageCircle, ExternalLink, FileText, Filter, CircleHelp } from 'lucide-react';
import { topics, studies, studyById, topicById, searchStudies, bibleLink } from './content.js';
import { emptyDraft, saveEntry, deleteEntry, makeBackup, mergeBackup, fieldLabels, journalText } from './notebook.js';
import { loadNotebook, persistNotebook, enableVault, disableVault, unlockNotebook, lockNotebook, encodeBackup, decodeBackup, readBackupFile, downloadFile } from './storage.js';

const icons = { heart: Heart, book: BookOpen, sun: Sun, sprout: Sprout, sunset: Sunset, leaf: Leaf, cloud: CloudSun };
const topicName = id => topicById[id]?.name || id;
const date = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const time = value => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const filename = suffix => `closet-prayer-study-${new Date().toISOString().slice(0, 10)}${suffix}`;
const readRoute = () => location.hash.slice(1) || 'explore';
function Icon({ name, ...props }) { const Component = icons[name] || BookOpen; return <Component size={22} strokeWidth={1.7} aria-hidden="true" {...props} />; }
function TopicTag({ id }) { return <span className="tag">{topicName(id)}</span>; }

function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; d.showModal(); return () => { if (d.open) d.close(); }; }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'wide' : ''}`} onCancel={event => { event.preventDefault(); onClose?.(); }} aria-labelledby="dialog-title">
    <div className="modal-head"><h2 id="dialog-title">{title}</h2>{onClose && <button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={21} /></button>}</div>
    {children}
  </dialog>;
}

export default function App() {
  const [notebook, setNotebook] = useState(null), current = useRef(null);
  const [loading, setLoading] = useState(true), [startupError, setStartupError] = useState('');
  const [locked, setLocked] = useState(false), [protectedData, setProtected] = useState(false);
  const [route, setRoute] = useState(readRoute), [query, setQuery] = useState(''), [topic, setTopic] = useState('');
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme);
  const [saveState, setSaveState] = useState('saved'), [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(false), [confirm, setConfirm] = useState(null), [recoveryCode, setRecoveryCode] = useState('');
  const [busy, setBusy] = useState(false), [online, setOnline] = useState(navigator.onLine);
  const timer = useRef(null), changeVersion = useRef(0), latestSave = useRef(Promise.resolve()), lockAction = useRef(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const isStudy = route.startsWith('study/'), study = isStudy ? studyById[route.slice(6)] : null;
  const active = route.startsWith('journal') ? 'journal' : route === 'settings' ? 'settings' : 'explore';

  useEffect(() => {
    loadNotebook().then(result => { current.current = result.notebook; setNotebook(result.notebook); setLocked(result.locked); setProtected(result.protected); }).catch(e => setStartupError(e.message)).finally(() => setLoading(false));
    const nav = () => { setRoute(readRoute()); window.scrollTo(0, 0); };
    const connectivity = () => setOnline(navigator.onLine);
    window.addEventListener('hashchange', nav); window.addEventListener('online', connectivity); window.addEventListener('offline', connectivity);
    return () => { window.removeEventListener('hashchange', nav); window.removeEventListener('online', connectivity); window.removeEventListener('offline', connectivity); };
  }, []);

  const navigate = path => { if (readRoute() === path) { setRoute(path); window.scrollTo(0, 0); } else location.hash = path; };
  const goHome = () => { setQuery(''); setTopic(''); navigate('explore'); };
  const exploreBack = () => {
    if (active === 'explore' && !isStudy) goHome();
    else navigate('explore');
  };
  const handleLink = (event, action) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); action();
  };
  const commit = useCallback(async data => {
    clearTimeout(timer.current); timer.current = null;
    const version = changeVersion.current;
    setSaveState('saving');
    const operation = persistNotebook(data);
    latestSave.current = operation;
    try { await operation; if (version === changeVersion.current) setSaveState('saved'); }
    catch (error) { setSaveState('error'); setNotice(error.message); throw error; }
  }, []);
  const change = useCallback((data, immediate = false) => {
    current.current = data; changeVersion.current++; setNotebook(data); setSaveState('saving');
    clearTimeout(timer.current);
    if (immediate) return commit(data);
    timer.current = setTimeout(() => commit(current.current).catch(() => {}), 450);
  }, [commit]);
  const flush = useCallback(async () => { if (timer.current) await commit(current.current); else await latestSave.current; }, [commit]);
  useEffect(() => {
    const leaving = e => { if (saveState !== 'saved') { e.preventDefault(); e.returnValue = ''; } };
    const hidden = () => { if (document.hidden && timer.current) commit(current.current).catch(() => {}); };
    window.addEventListener('beforeunload', leaving); document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('beforeunload', leaving); document.removeEventListener('visibilitychange', hidden); };
  }, [saveState, commit]);
  useEffect(() => {
    if (!protectedData || locked || busy || recoveryCode) return;
    let last = Date.now();
    const activity = () => { if (Date.now() - last >= 15 * 60 * 1000) lockAction.current?.(); else last = Date.now(); };
    const interval = setInterval(() => { if (Date.now() - last >= 15 * 60 * 1000) lockAction.current?.(); }, 15000);
    const visible = () => { if (!document.hidden && Date.now() - last >= 15 * 60 * 1000) lockAction.current?.(); };
    window.addEventListener('pointerdown', activity); window.addEventListener('keydown', activity); document.addEventListener('visibilitychange', visible);
    return () => { clearInterval(interval); window.removeEventListener('pointerdown', activity); window.removeEventListener('keydown', activity); document.removeEventListener('visibilitychange', visible); };
  }, [protectedData, locked, busy, recoveryCode]);

  const run = async fn => { setBusy(true); try { return await fn(); } catch (e) { setNotice(e.message); } finally { setBusy(false); } };
  const lock = async () => {
    if (busy || locked) return;
    await run(async () => { await flush(); lockNotebook(); current.current = null; setNotebook(null); setLocked(true); setEditor(false); setQuery(''); setTopic(''); setNotice(''); setConfirm(null); setPendingDraft(null); navigate('explore'); });
  };
  lockAction.current = lock;
  const openStudy = target => {
    const found = studyById[target]; if (!found) return;
    const visits = [...current.current.visits.filter(v => v.studyId !== target), { studyId: target, at: Date.now() }];
    change({ ...current.current, visits }); navigate(`study/${target}`);
  };
  const startDraft = seed => {
    const draft = emptyDraft({ ...seed, title: (seed.title || '').slice(0, 500) });
    if (current.current.draft) { setPendingDraft(draft); return; }
    change({ ...current.current, draft }); setEditor(true);
  };
  const studyDraft = (selected = study) => startDraft({ title: query.trim() || selected.title, query: query.trim(), studyId: selected.id, topics: [selected.topic], passages: selected.readings.map(r => r.ref).join('; ') });
  const finishEntry = async () => run(async () => {
    const result = saveEntry(current.current, current.current.draft);
    await change(result.notebook, true); setEditor(false); setNotice('Your reflection is saved.'); navigate(`journal/${result.entry.id}`);
  });
  const exportBackup = async (ids = null) => run(async () => {
    const backup = await encodeBackup(makeBackup(current.current, ids));
    downloadFile(filename(ids ? '-selection.json' : '-backup.json'), JSON.stringify(backup, null, 2)); setNotice('Backup downloaded. Keep it somewhere you can find again.');
  });
  const exportText = entries => { downloadFile(filename('-journal.txt'), journalText(entries, topicName), 'text/plain;charset=utf-8'); setNotice('Readable journal downloaded.'); };
  const switchTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#111827' : '#f7f8fc';
    try { localStorage.setItem('cp-study:theme', next); } catch { setNotice('Your theme preference could not be saved on this browser.'); }
  };

  if (loading || startupError) return <main className="startup"><BookOpen size={36} /><h1>{startupError ? 'Your notebook could not be opened' : 'Opening your notebook…'}</h1>{startupError && <><p role="alert">{startupError}</p><button onClick={() => location.reload()}>Try again</button></>}</main>;

  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    <header className="topbar"><div className="topbar-inner">
      <a href="#explore" className="brand" aria-label="Closet Prayer Study home" onClick={e => handleLink(e, goHome)}><span className="brand-icon"><BookOpen size={26} strokeWidth={1.7} /></span><span><strong>Study</strong><small>Closet Prayer</small></span></a>
      <div className="header-actions"><span className="development">Development</span><span className={`save-indicator ${saveState === 'error' ? 'error-text' : ''}`} title="Notebook storage status">{locked ? <LockKeyhole size={15} /> : saveState === 'saved' ? <ShieldCheck size={15} /> : <Clock3 size={15} />}<span>{locked ? 'Locked' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Save failed' : 'Saving…'}</span></span>{protectedData && !locked && <button className="icon-button" onClick={lock} aria-label="Lock notebook" disabled={busy}><LockKeyhole size={19} /></button>}<button className="icon-button" onClick={switchTheme} aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={21} /> : <Moon size={21} />}</button></div>
    </div></header>
    {notice && <div className={`notice ${saveState === 'error' ? 'notice-error' : ''}`} role={saveState === 'error' ? 'alert' : 'status'}><span>{notice}</span><button className="icon-button" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={18} /></button></div>}
    {!online && <div className="offline-bar">You’re offline. You can keep studying and writing.</div>}
    <main id="main-content" tabIndex={-1} className="app-main">
      {locked ? <Unlock onUnlock={(secret, recovery) => run(async () => { const data = await unlockNotebook(secret, recovery); current.current = data; setNotebook(data); setLocked(false); setSaveState('saved'); setNotice(''); })} busy={busy} /> : notebook && <>
        {active === 'explore' && !isStudy && <Explore query={query} setQuery={setQuery} topic={topic} setTopic={setTopic} notebook={notebook} openStudy={openStudy} startDraft={startDraft} resume={() => setEditor(true)} navigate={navigate} />}
        {isStudy && (study ? <Study key={study.id} study={study} notebook={notebook} openStudy={openStudy} onWrite={() => studyDraft()} onBack={() => navigate('explore')} /> : <div className="empty"><h1>This exploration isn’t in this version.</h1><button onClick={() => navigate('explore')}>Return to search</button></div>)}
        {active === 'journal' && <Journal notebook={notebook} selectedId={route.slice(8)} startDraft={startDraft} resume={() => setEditor(true)} exportBackup={exportBackup} exportText={exportText} navigate={navigate} onDelete={entry => setConfirm({ title: 'Delete this entry?', text: 'This removes the entry and its correction history from this device. Later reflections remain in your notebook. Export a backup first if you want to keep a copy.', label: 'Delete entry', action: () => run(async () => { await change(deleteEntry(current.current, entry.id), true); setConfirm(null); navigate('journal'); }) })} busy={busy} />}
        {active === 'settings' && <Settings notebook={notebook} protectedData={protectedData} busy={busy} run={run} flush={flush} change={change} current={current} setProtected={setProtected} setRecoveryCode={setRecoveryCode} setConfirm={setConfirm} setNotice={setNotice} exportBackup={exportBackup} exportText={exportText} lock={lock} theme={theme} switchTheme={switchTheme} />}
      </>}
    </main>
    {!locked && <nav className="bottom-nav" aria-label="Main navigation"><div>{[['explore', 'Explore', Search], ['journal', 'My journal', NotebookPen], ['settings', 'Settings', SettingsIcon]].map(([id, label, Component]) => <a key={id} href={`#${id}`} onClick={id === 'explore' ? e => handleLink(e, exploreBack) : undefined} aria-current={active === id ? 'page' : undefined}><Component size={22} strokeWidth={1.8} /><span>{label}</span></a>)}</div></nav>}
    {editor && notebook?.draft && <Editor draft={notebook.draft} notebook={notebook} onChange={draft => change({ ...current.current, draft })} onSave={finishEntry} onClose={() => setEditor(false)} onDiscard={() => setConfirm({ title: 'Discard this draft?', text: 'This only removes the unfinished draft. Saved entries will remain.', label: 'Discard draft', action: () => run(async () => { await change({ ...current.current, draft: null }, true); setEditor(false); setConfirm(null); }) })} busy={busy} saveState={saveState} />}
    {pendingDraft && <Modal title="You have an unfinished reflection" onClose={() => setPendingDraft(null)}><div className="modal-body"><p>Finish or discard your saved draft before beginning another.</p><div className="actions"><button className="primary" onClick={() => { setPendingDraft(null); setEditor(true); }}>Continue my draft</button><button onClick={() => setPendingDraft(null)}>Keep exploring</button></div></div></Modal>}
    {confirm && <Modal title={confirm.title} onClose={() => { if (!busy) setConfirm(null); }}><div className="modal-body"><p>{confirm.text}</p><div className="actions"><button disabled={busy} onClick={() => setConfirm(null)}>Cancel</button><button disabled={busy} className="danger" onClick={confirm.action}>{busy ? 'Working…' : confirm.label}</button></div></div></Modal>}
    {recoveryCode && <Modal title="Keep your Recovery Code" onClose={null}><div className="modal-body"><p>Your notebook is now encrypted. Store this code somewhere safe, separate from this browser. It can unlock your notebook if you forget the passphrase.</p><p>If both are lost, the encrypted notebook cannot be recovered.</p><code className="recovery-code">{recoveryCode}</code><div className="actions"><button onClick={() => downloadFile('closet-prayer-study-recovery.txt', `Closet Prayer Study Recovery Code\n\n${recoveryCode}\n\nKeep this separate from your backups. Anyone with this code and your encrypted backup can read it.`, 'text/plain')}>Download code</button><button className="primary" onClick={() => setRecoveryCode('')}>I have saved my code</button></div></div></Modal>}
  </>;
}

function Explore({ query, setQuery, topic, setTopic, notebook, openStudy, startDraft, resume, navigate }) {
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => searchStudies(query, topic), [query, topic]);
  const recent = [...notebook.visits].sort((a, b) => b.at - a.at).map(v => studyById[v.studyId]).filter(Boolean).slice(0, 3);
  const lastEntry = [...notebook.entries].sort((a, b) => b.createdAt - a.createdAt)[0];
  const searching = Boolean(query.trim() || topic);
  return <div className="explore-page">
    <section className="search-section"><span className="eyebrow">OPEN YOUR BIBLE. FOLLOW YOUR QUESTIONS.</span><h1>What are you wondering about?</h1>
      <form className="search-box" role="search" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}><Search size={23} aria-hidden="true" /><label className="sr-only" htmlFor="study-search">Search a topic or question</label><input id="study-search" type="search" maxLength={2000} value={query} onChange={e => { setQuery(e.target.value); setSubmitted(false); }} placeholder="A question, a topic, something on your mind…" /><button className="search-submit" type="submit" aria-label="Search studies"><ArrowUpRight size={23} /></button></form>
      <p className="search-hint">Start wherever you are. There’s no set order.</p>
    </section>
    <div className="explore-layout"><div>
      {searching ? <section aria-label="Search results"><div className="section-heading"><h2>{topic ? topicName(topic) : 'Places to explore'}</h2><button className="text-button" onClick={() => { setQuery(''); setTopic(''); setSubmitted(false); }}>Clear search <X size={15} /></button></div><p className="muted small" aria-live="polite">{results.length ? `${results.length} related ${results.length === 1 ? 'exploration' : 'explorations'}` : 'No matching exploration yet.'}</p>
        <div className="result-list">{results.map(s => <button className="result" key={s.id} onClick={() => openStudy(s.id)}><span className="topic-symbol"><Icon name={topicById[s.topic].icon} /></span><span><small>{topicName(s.topic)}</small><strong>{s.title}</strong><span>{s.summary}</span></span><ChevronRight size={19} /></button>)}</div>
        {!results.length && <div className="empty"><CircleHelp size={29} /><h3>Your question can still be a beginning.</h3><p>This first collection doesn’t cover everything. Try a shorter topic, or keep the question in your journal and add passages as you find them.</p><button className="primary" onClick={() => startDraft({ title: query.trim(), query: query.trim(), topics: topic ? [topic] : [] })}><NotebookPen size={18} />Keep this question</button></div>}
        {results.length > 0 && (submitted || query.trim()) && <button className="open-question text-button" onClick={() => startDraft({ title: query.trim(), query: query.trim(), topics: topic ? [topic] : [] })}><Pencil size={16} />Begin my own research on this question</button>}
      </section> : <section><div className="section-heading"><h2>Or begin with something on your heart</h2></div><div className="topic-grid">{topics.map(t => <button className="topic-card" key={t.id} onClick={() => setTopic(t.id)}><span className="topic-symbol"><Icon name={t.icon} /></span><span><strong>{t.name}</strong><small>{t.hint}</small></span><ChevronRight size={17} /></button>)}</div></section>}
    </div><aside className="notebook-aside"><div className="section-heading"><h2>Your notebook</h2><NotebookPen size={20} /></div>
      {notebook.draft ? <div className="resume-box"><small>UNFINISHED REFLECTION</small><h3>{notebook.draft.title || 'A thought in progress'}</h3><button className="text-button" onClick={resume}>Continue writing <ArrowUpRight size={16} /></button></div> : lastEntry ? <div className="resume-box"><small>LAST REFLECTION · {date(lastEntry.createdAt)}</small><h3>{lastEntry.title}</h3><button className="text-button" onClick={() => navigate(`journal/${lastEntry.id}`)}>Revisit this thought <ArrowUpRight size={16} /></button></div> : <div className="notebook-empty"><p>A place for what you notice, what you wonder, and what begins to change.</p><span>Your first reflection will appear here.</span></div>}
      <button className="notebook-new" onClick={() => startDraft({})}><Plus size={18} />Write a reflection</button>
      {recent.length > 0 && <div className="recent"><h3>Pick up a thread</h3>{recent.map(s => <button key={s.id} onClick={() => openStudy(s.id)}>{s.title}<ChevronRight size={15} /></button>)}</div>}
    </aside></div>
  </div>;
}

function Study({ study, notebook, openStudy, onWrite, onBack }) {
  const [bible, setBible] = useState(false), [version, setVersion] = useState('KJV');
  const prior = notebook.entries.filter(e => e.studyId === study.id).length;
  return <article className="study-page"><button className="text-button back" onClick={onBack}><ArrowLeft size={17} />Back to my questions</button>
    <div className="study-heading"><span className="eyebrow">{topicName(study.topic)}</span><h1>{study.title}</h1><p className="lead">{study.opening}</p></div>
    <div className="study-layout"><div className="passage-area"><div className="section-heading"><h2>Open your Bible to…</h2><button className="text-button" onClick={() => setBible(!bible)} aria-expanded={bible}><BookOpen size={15} />{bible ? 'Use my own Bible' : 'I need a Bible'}</button></div>
      {bible && <div className="bible-help"><p>These links open an online Bible in a new tab.</p><label>Translation <select value={version} onChange={e => setVersion(e.target.value)}><option value="KJV">King James Version</option><option value="BSB">Berean Standard Bible</option></select></label></div>}
      {study.readings.map(r => <section className="passage" key={r.ref}><div className="passage-title"><BookOpen size={22} /><h3>{r.ref}</h3>{bible && <a href={bibleLink(r.ref, version)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${r.ref} online`}><ExternalLink size={17} /></a>}</div><p>{r.notice}</p></section>)}
      <details className="consider"><summary>Consider these passages together <Plus size={17} /></summary><p>{study.consider}</p></details>
      <section className="reflection-invite"><NotebookPen size={25} /><div><h2>What are you noticing?</h2><p>{study.prompts[0]}</p><button className="primary" onClick={onWrite}><Pencil size={17} />Write a reflection</button>{prior > 0 && <a className="text-button" href="#journal">Revisit my {prior === 1 ? 'earlier reflection' : `${prior} earlier reflections`}</a>}</div></section>
    </div><aside className="study-aside"><h2>Where does your curiosity lead?</h2><p>Follow another question whenever you’re ready.</p><div className="related-list">{study.related.map(id => studyById[id]).filter(Boolean).map(s => <button key={s.id} onClick={() => openStudy(s.id)}>{s.title}<ArrowUpRight size={17} /></button>)}</div><div className="quiet-prompt"><MessageCircle size={19} /><p>{study.prompts[1]}</p></div></aside></div>
  </article>;
}

function Editor({ draft, notebook, onChange, onSave, onClose, onDiscard, busy, saveState }) {
  const [customTopic, setCustomTopic] = useState(''), [customField, setCustomField] = useState('');
  const parent = notebook.entries.find(e => e.id === draft.parentId);
  const patch = fields => onChange({ ...draft, ...fields });
  const toggleTopic = id => patch({ topics: draft.topics.includes(id) ? draft.topics.filter(t => t !== id) : [...draft.topics, id].slice(0, 30) });
  return <Modal title={draft.editId ? 'Correct an earlier entry' : draft.parentId ? 'A new reflection on an earlier thought' : 'A place for your thoughts'} onClose={busy ? undefined : onClose} wide>
    <form onSubmit={e => { e.preventDefault(); onSave(); }}>
      <fieldset disabled={busy} className="editor-fields">
        {parent && <div className="parent-note"><small>LOOKING BACK AT · {date(parent.createdAt)}</small><strong>{parent.title}</strong><p>{parent.body.slice(0, 250)}{parent.body.length > 250 ? '…' : ''}</p></div>}
        {draft.editId && <p className="muted small">Your previous wording will remain in the entry’s correction history. To record a changed understanding, add a new reflection instead.</p>}
        <label htmlFor="entry-title">My question or title</label><input id="entry-title" autoFocus maxLength={500} value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="What is on your mind?" />
        <label htmlFor="entry-body">My thoughts</label><textarea id="entry-body" className="main-writing" maxLength={200000} value={draft.body} onChange={e => patch({ body: e.target.value })} placeholder="Write freely. A question, a discovery, or something you’re not yet sure about…" />
        <details className="writing-details"><summary>Passages, topics & optional prompts <Plus size={17} /></summary><div className="details-content">
          <label htmlFor="entry-passages">Passages I’m examining</label><textarea id="entry-passages" rows={2} maxLength={10000} value={draft.passages} onChange={e => patch({ passages: e.target.value })} placeholder="For example, John 11:11–14" />
          <span className="field-label">Related topics</span><div className="topic-picker">{[...topics.map(t => t.id), ...draft.topics.filter(t => !topicById[t])].map(id => <button type="button" key={id} aria-pressed={draft.topics.includes(id)} onClick={() => toggleTopic(id)}>{draft.topics.includes(id) && <Check size={13} />}{topicName(id)}</button>)}</div>
          <div className="inline-input"><label className="sr-only" htmlFor="custom-topic">My own topic</label><input id="custom-topic" maxLength={120} value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="Add my own topic" /><button type="button" disabled={!customTopic.trim()} onClick={() => { const t = customTopic.trim(); if (!draft.topics.includes(t)) patch({ topics: [...draft.topics, t].slice(0, 30) }); setCustomTopic(''); }}>Add</button></div>
          {[...new Set([...Object.keys(fieldLabels), ...Object.keys(draft.fields)])].map(key => <label className="stacked" key={key}>{fieldLabels[key] || key}<textarea rows={3} maxLength={200000} value={draft.fields[key] || ''} onChange={e => patch({ fields: { ...draft.fields, [key]: e.target.value } })} /></label>)}
          <div className="inline-input"><label className="sr-only" htmlFor="custom-field">My own prompt</label><input id="custom-field" maxLength={100} value={customField} onChange={e => setCustomField(e.target.value)} placeholder="Add my own prompt" /><button type="button" disabled={!customField.trim() || Object.keys(draft.fields).length >= 36} onClick={() => { const label = customField.trim(); if (!Object.hasOwn(draft.fields, label)) patch({ fields: { ...draft.fields, [label]: '' } }); setCustomField(''); }}>Add</button></div>
        </div></details>
      </fieldset><div className="editor-footer"><span className="muted small" role="status">{saveState === 'saved' ? 'Draft saved' : saveState === 'error' ? 'Draft has not saved' : 'Saving draft…'}</span><div className="actions"><button type="button" className="text-button" disabled={busy} onClick={onDiscard}>Discard draft</button><button type="submit" className="primary" disabled={busy}>{busy ? 'Saving…' : draft.editId ? 'Save correction' : 'Save reflection'}</button></div></div>
    </form>
  </Modal>;
}

function Journal({ notebook, selectedId, startDraft, resume, exportBackup, exportText, navigate, onDelete, busy }) {
  const [filter, setFilter] = useState(''), [search, setSearch] = useState(''), [order, setOrder] = useState('newest');
  const [from, setFrom] = useState(''), [to, setTo] = useState('');
  const topicIds = [...new Set(notebook.entries.flatMap(e => e.topics))];
  const selected = notebook.entries.find(e => e.id === selectedId);
  const entries = notebook.entries.filter(e => (!filter || e.topics.includes(filter)) && (!from || e.createdAt >= new Date(`${from}T00:00:00`).getTime()) && (!to || e.createdAt <= new Date(`${to}T23:59:59.999`).getTime()) && (!search.trim() || [e.title, e.body, e.passages, ...Object.values(e.fields), ...e.topics.map(topicName)].join(' ').toLowerCase().includes(search.toLowerCase().trim()))).sort((a, b) => order === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
  const exportReadable = () => exportText(entries);
  return <div className="journal-page"><div className="page-heading"><div><span className="eyebrow">A RECORD OF YOUR DISCOVERIES</span><h1>My journal</h1><p className="muted">Look back at your questions, discoveries, and changing understanding.</p></div><button className="primary" onClick={() => startDraft({})}><Plus size={18} />New reflection</button></div>
    {notebook.draft && <button className="draft-banner" onClick={resume}><Pencil size={19} /><span>Continue your draft <strong>{notebook.draft.title || 'Untitled reflection'}</strong></span><ChevronRight size={20} /></button>}
    {selected ? <><button className="text-button back" onClick={() => navigate('journal')}><ArrowLeft size={17} />All reflections</button><Entry entry={selected} notebook={notebook} startDraft={startDraft} navigate={navigate} exportBackup={exportBackup} onDelete={onDelete} busy={busy} /></> : <>
      {notebook.entries.length > 0 && <><div className="journal-toolbar"><div className="journal-search"><Search size={18} /><input aria-label="Search my journal" type="search" placeholder="Find a thought or passage…" value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="Filter by topic" value={filter} onChange={e => setFilter(e.target.value)}><option value="">All topics</option>{topicIds.map(id => <option key={id} value={id}>{topicName(id)}</option>)}</select><select aria-label="Chronological order" value={order} onChange={e => setOrder(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div><details className="date-filter"><summary><Filter size={15} />Dates & exports</summary><div className="date-tools"><label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>Through<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label><button disabled={!entries.length || busy} onClick={() => exportBackup(entries.map(e => e.id))}><Download size={16} />Export these entries</button><button disabled={!entries.length} onClick={exportReadable}><FileText size={16} />Readable journal</button><button onClick={() => window.print()}>Print</button></div></details><p className="muted small" aria-live="polite">{entries.length} {entries.length === 1 ? 'reflection' : 'reflections'}</p></>}
      {!entries.length ? <div className="empty journal-empty"><NotebookPen size={38} /><h2>{notebook.entries.length ? 'No reflections match these filters.' : 'Every discovery has a beginning.'}</h2><p>{notebook.entries.length ? 'Try another topic, date, or phrase.' : 'Keep a question, a passage, or a thought here. Over time, you’ll be able to see the path your study has taken.'}</p>{notebook.entries.length ? <button onClick={() => { setFilter(''); setSearch(''); setFrom(''); setTo(''); }}>Clear filters</button> : <button onClick={() => startDraft({})}>Write my first reflection</button>}</div> : <div className="timeline">{entries.map((e, index) => <div className="timeline-item" key={e.id}>{(index === 0 || date(entries[index - 1].createdAt) !== date(e.createdAt)) && <div className="timeline-date">{date(e.createdAt)}</div>}<button className="journal-card" onClick={() => navigate(`journal/${e.id}`)}><div className="entry-meta"><span>{time(e.createdAt)}{e.parentId ? ' · Looking back' : ''}</span>{e.revisions.length > 0 && <span>Corrected</span>}</div><h2>{e.title}</h2><p>{e.body || Object.values(e.fields).find(v => v.trim()) || e.passages}</p><div className="tags">{e.topics.map(id => <TopicTag key={id} id={id} />)}</div><span className="entry-open">Revisit this reflection <ArrowUpRight size={15} /></span></button></div>)}</div>}
    </>}</div>;
}

function Entry({ entry, notebook, startDraft, navigate, exportBackup, onDelete, busy }) {
  const parent = notebook.entries.find(e => e.id === entry.parentId);
  const children = notebook.entries.filter(e => e.parentId === entry.id).sort((a, b) => a.createdAt - b.createdAt);
  return <article className="entry-detail"><div className="entry-meta">{date(entry.createdAt)} · {time(entry.createdAt)}</div><h2>{entry.title}</h2><div className="tags">{entry.topics.map(id => <TopicTag key={id} id={id} />)}</div>
    {parent && <button className="parent-link" onClick={() => navigate(`journal/${parent.id}`)}><Clock3 size={18} /><span>Reflecting on: {parent.title}<small>{date(parent.createdAt)}</small></span><ChevronRight size={17} /></button>}
    {entry.query && entry.query !== entry.title && <p className="muted">Starting question: {entry.query}</p>}
    {entry.passages && <div className="entry-passages"><BookOpen size={18} /><span>{entry.passages}</span></div>}
    <div className="prose-text">{entry.body}</div>{Object.entries(entry.fields).filter(([, value]) => value.trim()).map(([key, value]) => <section className="entry-field" key={key}><h3>{fieldLabels[key] || key}</h3><p className="prose-text">{value}</p></section>)}
    {entry.studyId && studyById[entry.studyId] && <a className="text-button" href={`#study/${entry.studyId}`}><BookOpen size={16} />Return to the passages</a>}
    {entry.importedFrom && <p className="muted small">Preserved as a separate copy because an imported entry differed from the one already on this device.</p>}
    <div className="entry-actions"><button className="primary" onClick={() => startDraft({ title: entry.title, topics: entry.topics, parentId: entry.id, studyId: entry.studyId })}><MessageCircle size={17} />Reflect on this now</button><button onClick={() => startDraft({ ...entry, editId: entry.id })}><Pencil size={16} />Correct wording</button><button disabled={busy} onClick={() => exportBackup([entry.id])}><Download size={16} />Export</button><button onClick={() => window.print()}>Print</button><button className="icon-button danger-text" aria-label="Delete entry" onClick={() => onDelete(entry)}><Trash2 size={18} /></button></div>
    {entry.revisions.length > 0 && <details className="history"><summary>Earlier wording ({entry.revisions.length})</summary>{entry.revisions.map(r => <div className="revision" key={r.id}><small>Preserved when corrected on {date(r.at)} · {time(r.at)}</small><h3>{r.snapshot.title}</h3><p className="prose-text">{r.snapshot.body}</p><p>{r.snapshot.passages}</p>{Object.entries(r.snapshot.fields).filter(([, v]) => v.trim()).map(([k, v]) => <p className="prose-text" key={k}><strong>{fieldLabels[k] || k}</strong><br />{v}</p>)}</div>)}</details>}
    {children.length > 0 && <section className="later-reflections"><h3>Where this thought led</h3>{children.map(e => <button key={e.id} onClick={() => navigate(`journal/${e.id}`)}><span>{date(e.createdAt)}<strong>{e.title}</strong></span><ChevronRight size={17} /></button>)}</section>}
  </article>;
}

function Unlock({ onUnlock, busy }) {
  const [secret, setSecret] = useState(''), [recovery, setRecovery] = useState(false);
  return <section className="unlock"><span className="lock-symbol"><LockKeyhole size={30} /></span><h1>Your notebook is locked</h1><p>Unlock to return to your questions and reflections.</p><form onSubmit={e => { e.preventDefault(); onUnlock(secret, recovery); }}><label htmlFor="unlock-secret">{recovery ? 'Recovery Code' : 'Passphrase'}</label><input id="unlock-secret" autoFocus type="password" autoComplete="current-password" value={secret} onChange={e => setSecret(e.target.value)} required /><button type="submit" className="primary" disabled={busy}>{busy ? 'Unlocking…' : 'Unlock notebook'}</button></form><button className="text-button" onClick={() => { setRecovery(!recovery); setSecret(''); }}>{recovery ? 'Use my passphrase' : 'Use my Recovery Code'}</button></section>;
}

function Settings({ notebook, protectedData, busy, run, flush, change, current, setProtected, setRecoveryCode, setConfirm, setNotice, exportBackup, exportText, lock, theme, switchTheme }) {
  const [passphrase, setPassphrase] = useState(''), [repeat, setRepeat] = useState('');
  const [selected, setSelected] = useState(null), [importSecret, setImportSecret] = useState(''), [useRecovery, setUseRecovery] = useState(false);
  const [persisted, setPersisted] = useState(null), [offlineReady, setOfflineReady] = useState(false);
  useEffect(() => { navigator.storage?.persisted?.().then(setPersisted).catch(() => {}); navigator.serviceWorker?.getRegistration?.().then(r => setOfflineReady(Boolean(r?.active))).catch(() => {}); }, []);
  const selectFile = file => run(async () => {
    if (!file) return;
    const result = await readBackupFile(file); setSelected(result); setImportSecret(''); setNotice('Backup selected. Your existing notebook has not been changed.');
  });
  const applyImport = mode => run(async () => {
    await flush();
    const backup = selected.backup;
    if (mode === 'replace' && backup.scope !== 'full') throw new Error('Selected-entry backups must be merged.');
    const result = mode === 'merge' ? mergeBackup(current.current, backup) : { notebook: backup.data, added: backup.data.entries.length, conflicts: 0 };
    await change(result.notebook, true); setSelected(null); setConfirm(null); setImportSecret('');
    setNotice(mode === 'merge' ? `Import complete: ${result.added} entries added${result.conflicts ? `; ${result.conflicts} differing copies preserved` : ''}. Existing entries and your current draft were kept.` : 'Full notebook restored.');
  });
  return <div className="settings-page"><span className="eyebrow">YOUR STUDY SPACE</span><h1>Settings</h1>
    <section className="settings-section prayer-journal-card" aria-labelledby="prayer-journal-title"><span className="prayer-journal-symbol"><NotebookPen size={30} /></span><div><h2 id="prayer-journal-title">P.U.S.H. Prayer Journal</h2><p>Return to your prayers, requests, and answered prayers.</p><a className="primary prayer-journal-link" href="https://closetprayer.com" target="_blank" rel="noopener noreferrer">Open Prayer Journal <ExternalLink size={18} /></a></div></section>
    <section className="settings-section"><div className="section-heading"><h2><Sun size={21} />Appearance</h2></div><div className="settings-row"><div><strong>{theme === 'dark' ? 'Dark' : 'Light'} mode</strong><p>Choose the appearance that’s comfortable for you.</p></div><button onClick={switchTheme}>Use {theme === 'dark' ? 'light' : 'dark'} mode</button></div></section>
    <section className="settings-section"><h2><ShieldCheck size={21} />Private Vault</h2><p>Protect your notebook with a passphrase and Recovery Code.</p>
      {protectedData ? <><div className="vault-on"><ShieldCheck size={20} /><span>Private Vault is on. Locks after 15 minutes without activity.</span></div><div className="actions"><button onClick={lock} disabled={busy}><LockKeyhole size={16} />Lock now</button><button disabled={busy} onClick={() => setConfirm({ title: 'Turn off Private Vault?', text: 'Your notebook will remain on this device, stored without encryption. Existing encrypted backup files keep their original protection.', label: 'Turn off encryption', action: () => run(async () => { await flush(); await disableVault(current.current); setProtected(false); setConfirm(null); setNotice('Private Vault is off.'); }) })}>Turn off encryption</button></div></> : <form onSubmit={e => { e.preventDefault(); run(async () => { if (passphrase !== repeat) throw new Error('The passphrases do not match.'); await flush(); const code = await enableVault(current.current, passphrase); setProtected(true); setRecoveryCode(code); setPassphrase(''); setRepeat(''); }); }}><div className="two-fields"><label>New passphrase<input type="password" autoComplete="new-password" minLength={12} value={passphrase} onChange={e => setPassphrase(e.target.value)} required /></label><label>Repeat passphrase<input type="password" autoComplete="new-password" minLength={12} value={repeat} onChange={e => setRepeat(e.target.value)} required /></label></div><p className="muted small">Use at least 12 characters. After enabling, keep the Recovery Code somewhere safe.</p><button className="primary" disabled={busy}>{busy ? 'Working…' : 'Enable Private Vault'}</button></form>}
    </section>
    <section className="settings-section"><h2><Download size={21} />Keep a copy</h2><p>A full backup includes your entries, earlier wording, saved draft, and explored passages. Save a copy before clearing browser data or changing devices.</p><div className="actions"><button className="primary" onClick={() => exportBackup()} disabled={busy}><Download size={17} />{protectedData ? 'Export encrypted backup' : 'Export full backup'}</button><button disabled={busy || !notebook.entries.length} onClick={() => protectedData ? setConfirm({ title: 'Download a readable journal?', text: 'This text file will contain your reflections without encryption. Keep it somewhere private.', label: 'Download readable journal', action: () => { exportText(notebook.entries); setConfirm(null); } }) : exportText(notebook.entries)}><FileText size={17} />Readable journal</button></div><p className="muted small">For individual entries or a topic, use the export controls in My journal.</p></section>
    <section className="settings-section"><h2><Upload size={21} />Bring a copy back</h2><p>Merge adds entries while keeping your current notebook. Replace restores a full backup in place of it. Study and Prayer Journal backups are separate.</p><label className="file-label">Choose a Study backup<input aria-label="Choose a Study backup" type="file" accept=".json,application/json" disabled={busy} onChange={e => { selectFile(e.target.files[0]); e.target.value = ''; }} /></label>
      {selected && <div className="import-preview"><strong>{selected.name}</strong>{selected.encrypted && !selected.backup ? <form onSubmit={e => { e.preventDefault(); run(async () => { const backup = await decodeBackup(selected.raw, importSecret, useRecovery); setSelected({ ...selected, backup }); setImportSecret(''); }); }}><label>{useRecovery ? 'Backup Recovery Code' : 'Backup passphrase'}<input type="password" required value={importSecret} onChange={e => setImportSecret(e.target.value)} /></label><label className="checkbox"><input type="checkbox" checked={useRecovery} onChange={e => setUseRecovery(e.target.checked)} />Use a Recovery Code</label><button disabled={busy}>Open backup preview</button></form> : <><p>{selected.backup.data.entries.length} entries · {selected.backup.scope === 'full' ? 'Full notebook' : 'Selected entries'} · {date(selected.backup.exportedAt)}</p><p className="muted small">{protectedData ? 'Imported data will use this device’s current Vault protection.' : selected.encrypted ? 'Private Vault is off on this device. Imported data will be stored without encryption.' : 'Ready to merge or restore.'}</p><div className="actions"><button className="primary" disabled={busy} onClick={() => applyImport('merge')}>Merge into my notebook</button><button disabled={busy || selected.backup.scope !== 'full'} onClick={() => setConfirm({ title: 'Replace this notebook?', text: 'All current entries, visits, and your draft will be replaced by this full backup. Export your current notebook first if you want to keep it.', label: 'Replace notebook', action: () => applyImport('replace') })}>Replace from backup</button></div></>}<button className="text-button" disabled={busy} onClick={() => { setSelected(null); setImportSecret(''); }}>Clear selection</button></div>}
    </section>
    <section className="settings-section"><h2><BookOpen size={21} />On this device</h2><p>Your notebook is saved in this browser. Keep a backup to move it to another device or restore it later.</p><div className="settings-row"><div><strong>{offlineReady ? 'Offline study is available' : 'Offline study becomes available after the built app loads'}</strong><p>The study material is included with the app. Online Bible links need an internet connection.</p></div></div><p className="muted small">{persisted ? 'This browser has granted persistent storage.' : 'You can ask your browser to retain this notebook when storage is low. Keep regular backups too.'}</p>{!persisted && <button disabled={busy} onClick={() => run(async () => { const granted = await navigator.storage?.persist?.(); setPersisted(Boolean(granted)); setNotice(granted ? 'Persistent storage granted.' : 'This browser did not grant persistent storage. Continue keeping backups.'); })}>Request persistent storage</button>}
      <div className="settings-links"><span>Study 0.1.1 · Development version</span></div>
    </section>
  </div>;
}
