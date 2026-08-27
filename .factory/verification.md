# Independent verification — FAIL

Verified 2026-08-27 against candidate `7614f83cff6af72db4e179b878fa785f376d758e` and the live URL `https://code-echo.sociobot.in/`.

## Verdict

**FAIL.** The build and most core reader paths work, but the candidate has release-blocking keyboard/accessibility defects, its promised global replay shortcut is not registered, and the public purchase flow points at the pilot billing service. The live deployment byte-matches the candidate assets tested below, so these are current deployed defects rather than a deployment-only failure.

## Release blockers (P1)

1. **The documented `Alt+Shift+R` replay-history command does not exist in Chromium.** In a fresh Chromium profile with the built unpacked extension, `chrome.commands.getAll()` reported `Alt+Shift+E` for `read-selection` but `shortcut: ""` for `replay-latest`. Pressing `Alt+Shift+R` after seeding local history left `#echo-reader` hidden after a 5-second wait. This breaks the brief's one-key replay-history job and contradicts the popup, site, README, and manifest copy. `R` only replays after the tray is already open; the popup history remains a manual fallback.
2. **Opening the reader does not move keyboard focus into its dialog.** After selecting code and using `Alt+Shift+E`, the active element was `BODY` and the Shadow DOM had no active element. The next Tab focused the underlying page's skip-link (`A`), not Close/Previous/Read/Next in the tray. This fails the required dialog-focus and keyboard-only behavior; it also leaves a screen-reader user at the old document position while a `role="dialog"` is open.
3. **Live 390 px mobile has an axe serious violation.** Independent axe on `https://code-echo.sociobot.in/` at 390×844 reports `scrollable-region-focusable` (serious) on `.confidence-strip > .shell`: the horizontally scrollable strip has neither focusability nor focusable content. This violates the explicit no-serious/critical accessibility acceptance criterion and makes its overflow inaccessible from a keyboard.
4. **The public production-domain purchase flow targets the pilot billing API.** The live `Buy the Echo Pack` link, popup checkout link, extension host permission, and verifier all use `https://pilot-api.sociobot.in/api/v1/products/code-echo/...`, not the release API described by the billing contract. This was also listed as an unfinished factory release task in the prior handoff. A public `code-echo.sociobot.in` build must not advertise a US$9 purchase through test billing.

## Other defects (P2)

1. **Tests do not run after the documented clean-install sequence.** After clean `npm ci`, `npm test` failed before collecting any tests because `tsconfig.json` extends missing generated file `.wxt/tsconfig.json`. Exact error: `TSConfckParseError: failed to resolve "extends":"./.wxt/tsconfig.json"`. `npm run build` generates that file and a second `npm test` then passes, but the README instructs `npm test` before build and clean-checkout testability is not met.
2. **Live hashed assets are not immutable-cached.** The tested JS, CSS, AVIF, ZIP, service worker, HTML, and legal-page responses all return `cache-control: public, must-revalidate, max-age=30`; the hashed JS/CSS assets should have long-lived immutable caching under the performance contract. The live AVIF and webmanifest are also served as `application/octet-stream` rather than their media types.
3. **The live response has no Content-Security-Policy or Permissions-Policy.** HSTS, `nosniff`, and strict-origin referrer policy are present, but these browser response policies are absent. This is not the source of a current console error, but should be supplied before release.

## Evidence of behavior that passed

- Clean checkout was exactly `7614f83cff6af72db4e179b878fa785f376d758e`; `npm ci` installed 183 packages and `npm audit --audit-level=high` reported zero vulnerabilities.
- Exact clean production command `npm run build` passed and produced `dist/site/`, `.output/chrome-mv3/`, and `.output/code-echo-1.0.0-chrome.zip` (17,657 bytes).
- After the build-generated WXT configuration existed: `npm test` passed 13/13 and `npx tsc --noEmit` passed. There is no repository lint script.
- After installing the missing Playwright Chromium test browser, `npm run test:e2e` passed 8/8: public pages, extension popup/content flow, reader preview, desktop axe coverage, reduced-motion/offline paths, and a repository 390 px layout assertion.
- Independent live normal path: the demo parsed the representative `parseHTTPResponse` sample into 13 chunks, initially displayed `const`, advanced correctly, and had no console/page errors. Blank input announced `Add a code line first.` and returned focus to the source field. An invalid dummy license made only the expected GET to `pilot-api.sociobot.in` and announced that the free reader remains usable.
- Independent extension path: selecting `chrome://extensions` on a local documentation-style page, then `Alt+Shift+E`, opened the tray with visual `chrome`; empty selection announced `Select a code line or identifier first.`; a saved `HTTP → H T T P` dictionary override and rate persisted in `chrome.storage.local`. No selected-code request was observed.
- Initial live-page requests were same-origin only (HTML, local JS/CSS and hero AVIF). The only tested third-party request was the explicit license verification above. No analytics/CDN fonts/scripts were observed. The site discloses browser/OS Web Speech provider handling, and the extension manifest has only `storage`, `contextMenus`, `activeTab`, and the pilot billing host permission.
- Live desktop axe found zero serious/critical violations; live 390 px found the P1 violation above. Desktop and 390 px visual review found no page-level horizontal overflow; at 390 px `document.documentElement.scrollWidth` was 390 and the primary download button was 226×50 px.
- `prefers-reduced-motion: reduce` produced `animation-name: none`; the live service worker was active, its `registration.update()` completed, and an offline reload returned the cached page (HTTP 200) with visible `<main>` and no errors.
- Live page had one `h1`, title, language, main landmark, alt text, visible designed focus styling in source, and no console/page errors in independent desktop/mobile runs.
- Lighthouse mobile-style run against live deployment: Performance 100, Accessibility 100, Best Practices 96, SEO 100; FCP 1.1 s, LCP 1.4 s, CLS 0, TBT 90 ms. The Lighthouse accessibility score does not supersede the independent mobile axe serious finding.
- Budgets from exact build: initial JS 6,604 bytes uncompressed (5,893 + 711), CSS 12,060 bytes, AVIF hero 98,183 bytes, and packaged extension 17,657 bytes — all within stated size budgets.
- Live identity comparison: SHA-256 matched local candidate output for `index.html`, `/privacy/`, `/terms/`, `sw.js`, `manifest.webmanifest`, the download ZIP, linked JS/CSS/module-preload assets, and hero AVIF.

## Commands and environment notes

```sh
npm ci
npm test                         # fails from clean checkout: missing .wxt/tsconfig.json
npm run build                    # passes
npm test                         # 13/13 pass after build
npx tsc --noEmit                 # passes after build
npm audit --audit-level=high     # zero vulnerabilities
npx playwright install chromium
npm run test:e2e                 # 8/8 pass
```

Independent Chromium/axe, request, response-header, service-worker, mobile, and Lighthouse checks were additionally run against the live URL. Audible Web Speech quality cannot be judged in headless Chromium; this does not affect the defects above.

## Required next steps

1. Choose and register a replay shortcut that Chromium actually accepts; assert its registration and execution in a real-browser test.
2. Move focus into the tray on open, provide a sensible close/focus-return path, and add keyboard-focus tests.
3. Remove or make keyboard-focusable the 390 px horizontal confidence strip; run axe at mobile viewport in CI.
4. Switch published checkout/verification configuration and host permission from pilot to the registered production Sociobot API before publishing the paid offer.
5. Make unit/type tests self-contained from `npm ci` (or document/run the required WXT generation before tests) and add immutable caching, correct asset MIME types, CSP, and Permissions-Policy at deployment.
