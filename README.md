# Closet Prayer Study

Development version 0.1.1 for the future **study.closetprayer.com**.

A Scripture-led exploration tool and private chronological research notebook. The initial collection contains **21 connected explorations across seven topic areas**. It is a personal development prototype, not a production content release.

## Update from 0.1.0

Replace the project files with this version, then stop the running preview and rerun `npm run dev:mobile`. Keep using the same browser and address/port so your existing notebook remains available. Close all Study tabs and reopen after rebuilding if the offline worker still shows the earlier version. Do not clear site data.

Changes: larger phone text, a title/logo home action that clears search and topic filters, an Explore button that returns from a study to its results and then home, fewer repeated storage notices, and a dedicated Prayer Journal card at the top of Settings.

## Try it on your computer or phone

Use Node.js **22.12 or newer** (Node 24 recommended). Extract the package, open a terminal in `closet-prayer-study`, and run:

```sh
npm ci
npm run dev:mobile
```

The built preview listens on **port 3000** and **all network interfaces**. On your computer, open `http://localhost:3000`. On your phone, open `http://YOUR-COMPUTER-LAN-IP:3000` or the computer's Tailscale IP with the same port. Both devices must be able to reach that computer. Allow Node through the computer's private-network firewall if necessary.

For editing with live updates:

```sh
npm run dev:network
```

The mobile preview avoids development hot reloads. `npm run dev:mobile` builds first, so stop it and rerun after source changes. Don't open `dist/index.html` by double-clicking it: this app needs an HTTP(S) server.

**Private Vault and offline installation need a secure browser context:** HTTPS on a phone, or localhost on your computer. Ordinary LAN HTTP supports the unencrypted notebook, but browsers restrict cryptography and service workers there. A future HTTPS GitHub Pages deployment supports both. Each distinct host/port is a separate notebook; export/import to move between addresses.

The package also includes `dist/`, a prebuilt copy. With Node installed, it can be served using any ordinary static web server; the documented npm commands are the supported starting path.

## What works

- Local keyword/synonym search with no AI requests. Searches such as `I saw my dead grandmother` lead to relevant authored explorations. Unmatched questions can start independent research entries.
- Seven expandable topics: God's character, Bible interpretation, suffering, salvation, Sabbath, death/resurrection, and Christ's return.
- Passage references and reading prompts. An optional “I need a Bible” control reveals external KJV or BSB links; no Scripture text is bundled or quoted in the guide.
- Optional explanations and freely chosen related questions. No course sequence, scores, completion targets, or estimated understanding.
- Free writing, optional structured prompts, custom topics, and custom prompt fields.
- Automatic draft saving, a dated journal, search/topic/date filters, chronological ordering, and links from later reflections to earlier entries.
- Corrections retain previous wording; new reflections keep earlier entries intact. Entry deletion is explicit and confirmed.
- Full and selective JSON exports, merge/replace import, readable text export, and browser printing.
- Selective exports include the ancestors needed to preserve reflection relationships. Merge retains both differing versions and skips identical entries. Merge keeps the current draft; full Replace restores the backup's draft.
- Optional Private Vault: encrypted local notebook and backups, passphrase and Recovery Code unlock, and a 15-minute inactivity lock. Reloading locks the notebook.
- Local offline cache after a successful built-app visit in a secure context. An updated service worker waits until old tabs close; it never forces a refresh over your writing.
- Persistent-storage request, light/dark modes, and mobile bottom navigation using the existing Prayer Journal's navy/yellow palette.

## Initial test to try

1. Search for a personal question and open a related exploration.
2. Look up a passage in your Bible and write a reflection.
3. Close the editor before saving, reload, and continue the saved draft from My journal.
4. Save the entry. Revisit it and choose “Reflect on this now.” Notice the earlier entry stays in place.
5. Export a full backup. Import it using Merge; identical entries should not duplicate.
6. On localhost or HTTPS, enable Private Vault and save the Recovery Code. Lock and unlock using both methods.

Keep backups of any real research recorded during development.

## A separate GitHub repository

Suggested repository name: **closet-prayer-study**, under the same GitHub account as the Prayer Journal. This package is independent of `P.U.S.H.-Prayer_Journal`; the original app was not modified. A hosted GitHub repository has not been created from this package.

Create an empty repository, then push this folder using GitHub Desktop or Git. Include the dotfiles and `.github/workflows/pages.yml`, plus `package-lock.json`. Do not commit `node_modules`, `dist`, exported personal notebooks, Recovery Codes, or private test data.

Suggested initial commit message:

```text
Build initial Scripture study guide and private research journal
```

## GitHub Pages, when you choose to publish

The workflow is **manual only**. Pushing code does not run a deployment.

1. In the new repository, open **Settings → Pages** and set the source to **GitHub Actions**.
2. Open **Actions → Deploy development build to GitHub Pages → Run workflow**. This publishes a reachable site; use local testing until you want that.
3. The relative build paths support a project URL such as `https://qwixilver.github.io/closet-prayer-study/` as well as a custom domain.
4. When ready for the subdomain, configure **study.closetprayer.com** as the custom domain under Pages. At the DNS provider, create a CNAME named `study` pointing to the account's GitHub Pages hostname (for that account, `qwixilver.github.io`), and follow GitHub's domain-verification and HTTPS steps.
5. Before production, complete the expansion/review milestones in `docs/ROADMAP.md`, remove the development indexing restrictions and update the version labels.

No DNS changes or deployment have been made. `noindex`/`robots.txt` discourage indexing; they are not access controls and do not make a published Pages site private.

## Code layout

| File | Purpose |
| --- | --- |
| `src/content.js` | Expandable topics, study records, stable IDs, editorial belief mappings, search terms, related-question links |
| `src/App.jsx` | Search, passages, journal, editor, settings, and Vault UI |
| `src/styles.css` | Shared light/dark tokens and responsive layout |
| `src/notebook.js` | Schema validation, history, merge logic, export selection, readable journal |
| `src/storage.js` | Atomic IndexedDB storage, revision checks, and envelope encryption |
| `scripts/build-offline.mjs` | Exact-build static offline cache |
| `tests/notebook.test.mjs` | Data integrity, content relationships, and search regression tests |

The structure is intentionally flexible: optional research fields are a string-keyed object, topics can include custom labels, and content is separated from interface code. Keep study IDs stable when rewriting or expanding material.

## Development constraints

- Notebook data is local to the browser's origin, in IndexedDB. The Prayer Journal and Study subdomain do not silently share data. Their backup formats are intentionally distinguished.
- No accounts, analytics, remote AI, or server persistence. External Bible links open only after the user asks for an online Bible.
- Revisited material affects only “Pick up a thread.” Notes are not analyzed for knowledge, belief, or agreement.
- The optional Vault follows the existing project's envelope-encryption model, but uses an atomic full-notebook record and its own namespace. This is new implementation, not a byte-for-byte copy of the existing backup format.
- Browser import limit: 10 MB; up to 10,000 entries. Large-journal performance remains a future development consideration.
- A stale browser tab is prevented from overwriting newer data. If that conflict appears, export its unsaved work before reloading. Merge does not replace the current draft; retain the export if you need to recover its draft separately.
- Vault key changes are not yet a separate settings flow. An unlocked user can turn the Vault off and enable it again with a new passphrase; old encrypted backups retain their original credentials.
- The first collection does not cover all 28 beliefs or every offshoot claim. It requires further editorial review and substantial expansion before production.
- Public-facing explanation of the interpretive foundation and optional local AI experiments remain deferred, as agreed.

## Verification

```sh
npm test
npm run build
```

See `docs/VALIDATION.md` for the browser flows checked for this version, and `docs/CONTENT.md` for source and authoring notes.

MIT licensed. Third-party dependencies retain their own licenses.
