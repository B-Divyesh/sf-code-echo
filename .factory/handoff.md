# Code Echo v1 handoff

## Independent verification status — FAIL (2026-08-27)

Candidate `7614f83cff6af72db4e179b878fa785f376d758e` was independently tested from a clean checkout and against `https://code-echo.sociobot.in/`. The live bytes match the candidate for the tested site/ZIP assets, so this is not a deployment-only failure.

Do not release this candidate until the P1 defects in [.factory/verification.md](verification.md) are fixed and reverified: Chromium does not register the promised `Alt+Shift+R` replay shortcut; opening the reader leaves focus on the underlying page; 390 px mobile axe has a serious scrollable-region keyboard violation; and the public paid flow targets `pilot-api.sociobot.in`. Clean-install `npm test` also fails until a build generates `.wxt/tsconfig.json`. Full commands, response-policy findings, passing evidence, and exact reproduction details are in the verification report.

## Shipped

- WXT + TypeScript Manifest V3 extension with a selection action, context-menu action, `Alt+Shift+E` read command, and `Alt+Shift+R` latest-selection replay.
- A page-safe Shadow DOM reading tray that keeps one syntax chunk visible, sequences browser-native speech, supports previous/next/replay/stop, and has explicit empty, speech-unavailable, restricted-page, and offline behavior.
- User-controlled rate, volume, 18–32 px chunk size, paper/night/high-contrast treatment, token/word/line chunking, identifier splitting/literal/spelling, and individually selectable punctuation names.
- Local pronunciation dictionary and deduplicated ten-item replay history in `chrome.storage.local`, with history deletion.
- US$9 one-time Echo Pack contract: pilot Sociobot checkout, pasted-license restore, once-per-day verification cache, optimistic offline state after a valid verdict, quiet revocation handling, JavaScript/TypeScript + Python + Git packs, and opt-in `chrome.storage.sync`. Core reading and accessibility controls are never gated.
- Static Vite product site in `dist/site`, interactive shared-parser preview, mobile layout, paper/dark themes, offline service worker, `/privacy/`, `/terms/`, robots and sitemap files, and stable packaged download at `/downloads/code-echo-chrome.zip`.
- Product-specific risograph visual system recorded in `.factory/design.md`. The original factory-generated hero source and prompt sidecars are under `assets/src/`; optimized AVIF/WebP/JPEG derivatives are under `site/public/assets/`.
- Expanded README, MIT license, unit/static contract tests, real-browser Playwright flows, and axe checks.

## Verification completed 2026-08-27

- `npm test`: 13/13 tests passed.
- `npx tsc --noEmit`: passed with strict TypeScript.
- `npm run build`: passed from a cleaned output tree. Deploy root is `dist/site/index.html`; extension package is `dist/site/downloads/code-echo-chrome.zip`.
- `npm run test:e2e`: 8/8 Playwright tests passed in Chromium, covering all three public pages, light and dark accessibility, a real loaded extension popup/content script, the in-page Shadow DOM reader, 390 px layout, demo controls, console errors, and offline state.
- axe-core: zero serious or critical findings on landing, privacy, terms, dark landing, popup, and the page with the reader open.
- Lighthouse mobile against the production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.5 s, CLS 0, TBT 0 ms, Speed Index 0.9 s.
- Production payload: landing JavaScript 6.60 KB uncompressed across initial chunks; landing CSS 12.06 KB; AVIF hero 98.2 KB; complete extension 37.93 KB uncompressed / 17.66 KB zip. All are below the factory budgets.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Original hero was visually reviewed at full resolution: no people, brands, words, watermarks, broken anatomy, or unintended product UI. Desktop and 390 px full-page screenshots were also reviewed for overflow and hierarchy.

## Run and verify

```sh
npm install
npm test
npm run build
npm run test:e2e
```

For manual extension testing, load `.output/chrome-mv3` as an unpacked extension, select code on a normal HTTPS page, and press `Alt+Shift+E`. The static deploy directory is exactly `dist/site`.

## Known release tasks / gaps

- The checkout and verifier intentionally use `https://pilot-api.sociobot.in` while this product is staged. The factory must register the test product, set its return URL to the site, and switch the API base to production at release.
- The ZIP is a load-unpacked preview package; Chrome Web Store signing/listing is outside this repository and remains a factory release task.
- Automated tests verify the Web Speech invocation and visual progression, but headless Chromium cannot judge audible voice quality. A pilot should sample browser/OS voices and complete the success-measure reading task.
- Browser speech privacy depends on the user’s configured browser/OS voice provider; this is disclosed in the popup and privacy policy.
