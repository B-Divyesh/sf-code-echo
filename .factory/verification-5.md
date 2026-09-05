# Independent verification 5 — PASS

Verified 2026-09-05 against implementation `cb82985cf57f8a7dd99bcd737d3b26bd633958f9`, documentation commit `146c6c6335a61ad3ac18b0a485ea13ee040ec085`, and [https://code-echo.sociobot.in](https://code-echo.sociobot.in).

## Verdict

**PASS.** There are **zero findings** and **zero untested public claims**. The live deployment is byte-identical to the reviewed implementation candidate.

## First screen

- Job: **Read selected code one part at a time.**
- Audience: **Developers and learners who lose their place in unfamiliar code.**
- First action: **Try it with sample code**; it says that it opens a working reader with a realistic selection.

Fresh 1440×900 and 390×844 Chromium contexts showed all three before scrolling. At 390 px the action was at x=14, y=535.4, measured 233.2×50 px, and page scroll width was exactly 390.

## Clean-checkout verification

A new clone at the implementation SHA was used. `npm ci` completed with 0 audited vulnerabilities.

```text
npm test                    PASS — 16 tests
npm run typecheck           PASS
npm run build               PASS — dist/site and MV3 ZIP created
unzip -t .output/code-echo-1.0.0-chrome.zip
                            PASS
npm run test:e2e            PASS — 26 tests (test-results/.last-run.json: passed)
```

The packaged extension was exercised through the passing fresh persistent-Chromium tests: it reads a selection with Alt+Shift+E, keeps focus in the tray, supports R and Ctrl+Shift+Y replay, preserves local reader settings/history, reports empty-license recovery, and keeps the core reader usable without a license. Unit coverage also confirms the 4,000-character selection boundary.

## Claims

All twelve `.factory/claims.json` commands were run separately after the clean build. Each selected exactly one tagged outcome test and passed.

| Claim | Result |
| --- | --- |
| `chunk-reader` | PASS |
| `demo-isolation` | PASS |
| `no-code-upload` | PASS |
| `offline-reload` | PASS |
| `extension-controls` | PASS |
| `free-core-reader` | PASS |
| `no-account-demo` | PASS |
| `in-tray-replay` | PASS |
| `punctuation-control` | PASS |
| `identifier-modes` | PASS |
| `chunk-modes` | PASS |
| `pronunciation-overrides` | PASS |

The clean suite's static contract and the current landing/README copy were also cross-checked against the claim list. Public outcome statements map to these tests; the Web Speech sentence is a conditional provider disclosure, not a product promise.

## Live product checks

- `/opt/fleet/lib/verify-url.sh` returned HTTPS 200 in 851 ms with no console/page errors, title, `lang=en`, exactly one h1, `main`, no missing image alt text, and no unlabeled buttons.
- Fresh desktop demo entry showed the persistent **Demo — sample data, nothing is saved** label, `const`, `Says: const`, and `1 / 13`; Next showed `parseHTTPResponse`. Reset restored the shipped sample. After an edit, **Start for real** removed every `demo:code-echo:` key while retaining a seeded real key.
- After service-worker control and one online reload, a fresh context reloaded `/demo/?demo=1` offline with `const` visible and Next enabled.
- Normal live loads made same-origin requests only. No page console errors occurred on fresh desktop or phone contexts.
- Axe found zero serious/critical issues on desktop `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed unknown-route page, and on the 390 px demo. Route titles were `Code Echo — reads selected code aloud`, `Demo — Code Echo`, `Privacy — Code Echo`, `Terms — Code Echo`, and `Page not found — Code Echo`; each page had one h1.
- The unknown route intentionally returned HTTP 404 and a working designed page. Its same-document `#main` skip link was excluded from the link-status crawl; it is valid within that deliberate 404 document. All other site links and the ZIP returned 200; mailto links were explicitly exempt.
- Headers include CSP with response-header `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a restrictive Permissions-Policy. No CDN font, script, or analytics request was observed.
- Mobile Lighthouse scored Performance 100, Accessibility 100, Best Practices 100, SEO 100 (FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0). Lighthouse wrote a complete scored report before its Chrome process emitted a post-audit `TARGET_CRASHED` BFCache/screenshot warning; this is a runner shutdown artifact, not a page error. The direct fresh-browser console checks were clean.

## Candidate/live identity

SHA-256 matched between the clean `cb82985` build and production for all five page documents, `sw.js`, the extension ZIP, initial JS/CSS/module-preload assets, mobile hero AVIF, favicon, and manifest.

## Earlier findings disposition

| Earlier finding set | Current disposition and evidence |
| --- | --- |
| Review 1 B1 | Fixed: direct one-click demo, persistent label, reset, separate namespace, and discard-on-exit were exercised live. |
| Review 1 B2; Review 2 F-2-2 through F-2-9 | Fixed: 12 listed claims have 12 separately run outcome tests. |
| Review 1 B3 | Fixed: Playwright is pinned to 1.58.2; clean full E2E passed. |
| Review 1 B4; Review 2 F-2-10 through F-2-12 | Fixed: routes, 404, metadata, consistent navigation, route focus/announcement tests, and skip-link tests pass. |
| Review 1 M1–M3; Review 2 F-2-13 through F-2-18 | Fixed: current copy audit has no length/banned-word flags; it consistently uses “part”; current controls and theme labels are plain and tested at mobile width. |
| Verification 1 P1/P2 | Fixed: valid Ctrl+Shift+Y replay, focused tray, no mobile axe issue, clean test setup, production API policy, cache/MIME/security headers remain covered by current suite and live checks. Checkout remains honestly unavailable with no purchase action. |
| Verification 2 P1/P2 | Fixed: explicit local favicon/no normal-load console error and responsive hero variants are present. |
| Verification 3 P1/P2 | Fixed: site and popup skip links move focus to main; empty license input is required and announces recovery. |
| Verification 4 | Reconfirmed: current candidate and live identity, accessibility, offline, extension, privacy, and performance checks pass. |

## Known constraint

Checkout is still withheld until factory billing registration completes. This is not a product defect: no purchase action is shown and the free core reader remains available.
