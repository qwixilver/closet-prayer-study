# UI revision 0.1.1 — 2026-09-13

Production build passed. Targeted Chromium checks passed at 344 and 390 pixels: enlarged phone typography, no horizontal overflow, Explore returning from study to results and then home, title resetting search/topic without reloading, an unfinished draft preserved through home navigation, and the prominent Prayer Journal link. Both themes were visually inspected. No storage schema or encryption changes were made. Physical Fold testing remains with the owner.

# Validation — development version 0.1.0

Checked 2026-09-12 against the built static application. Test notebooks contained synthetic data only.

## Completed

- Production build succeeds and emits a static `dist/` with a content-versioned offline worker.
- All 11 Node tests pass: immutable earlier reflections, correction history, full/selected exports, idempotent merge, conflict copies, rewritten parent links, draft preservation, invalid imports, deletion relationships, readable export, search routing, and all 21 content connections.
- Browser checks pass in headless Chromium with normal browser origin security enabled:
  - Search begins at the visitor's question and routes the deceased-relative example to the authored death study.
  - Online Bible links are absent until requested, and the KJV/BSB choice changes the links.
  - A draft survives closing the editor and reloading the app.
  - Saved entries, corrected wording, and linked later reflections remain distinct.
  - Light/dark views render; no horizontal overflow at 344, 390, and 768 pixels.
  - Full backup downloads contain the expected entries.
  - Vault-enabled IndexedDB and backup files contain ciphertext instead of reflection text.
  - Wrong passphrase fails; the correct passphrase and Recovery Code both unlock.
  - Reloading and 15 minutes of inactivity both lock the Vault.
  - An encrypted backup opens and merges in a fresh browser context.
  - Repeated import adds no duplicate entries.
  - Malformed import leaves the notebook untouched.
  - Replace waits for confirmation; Cancel preserves all current entries.
  - The built application and journal reload offline after the service worker is ready.
  - A stale second tab cannot overwrite a newer saved notebook.
  - No page errors or external requests occur during local search, study, and journal flows.
- Desktop and mobile screenshots were visually inspected in both themes.

## Reproduce

```sh
npm ci
npm test
npm run build
```

Optional browser suite, after installing its development-only runner:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run test:browser
```

The browser suite starts its own server on `127.0.0.1:3123`, uses fresh synthetic notebooks, and writes results to the ignored `test-results/` directory. It never uploads notebook data.

## Not yet validated

- Physical Galaxy Z Fold 5 / iPhone browser and keyboard behavior.
- A deployment through the user's actual GitHub repository, DNS, or HTTPS configuration.
- Installation behavior on physical mobile devices, including OS-specific PWA differences.
- Large research collections near the 10 MB import limit.
- Independent security audit, screen-reader audit, or complete theological/editorial review.

These are development follow-ups. This version has not been published as a production site.
