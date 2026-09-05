# Code Echo repair handoff

## Independent verification 5

Verified 2026-09-05 with **PASS**: zero findings and zero untested claims.

- Implementation reviewed: `cb82985cf57f8a7dd99bcd737d3b26bd633958f9`
- Documentation/report base: `146c6c6335a61ad3ac18b0a485ea13ee040ec085`
- Live URL: `https://code-echo.sociobot.in/`
- Fresh clean checkout: `npm ci`, 16 unit tests, typecheck, production build,
  ZIP validation, all 12 declared claim commands, and all 26 E2E tests passed.
- Fresh live desktop and 390 px phone checks passed: first-screen clarity, demo
  isolation/reset/exit, offline reload, 404, links, route metadata/focus, axe,
  headers, privacy requests, and Lighthouse 100/100/100/100.
- Candidate/live SHA-256 comparisons matched five HTML documents, service
  worker, initial app assets, favicon, manifest, hero AVIF, and extension ZIP.

The only external constraint is unchanged: factory billing registration is not
complete, so checkout remains intentionally unavailable and no purchase action
is shown. See `.factory/verification-5.md` for the full evidence and earlier-
finding disposition.

## Release candidate

- Implementation commit: `cb82985cf57f8a7dd99bcd737d3b26bd633958f9`
- Base reviewed: `48d2bcd6b842bdaf6cccd08f45c6414dab37dfc3`
- Static artifact: `dist/site/`
- Packaged extension: `dist/site/downloads/code-echo-chrome.zip`
- Production URL: `https://code-echo.sociobot.in/`

## Completed repairs

- `Start for real` clears every `demo:code-echo:` key before navigation. A
  return to `/demo/?demo=1` starts with the shipped sample; real keys remain.
- `.factory/claims.json` now lists 12 claims, each with one tagged,
  outcome-level browser test. New tests cover the free core reader, no-account
  demo, in-reader `R` replay, punctuation, identifier, part-mode, and custom
  pronunciation outcomes in a packaged extension.
- All five routes now share Demo, How it works (`/#how`), and Privacy links.
  Legal and 404 pages have complete Open Graph/Twitter route metadata.
- Internal route changes focus the new `h1` and announce it politely. Legal
  skip links move focus into main content.
- Public copy now calls the reading unit a **part**. Theme buttons state their
  result, reader controls name their result, and the mobile theme label remains
  visible at 390 px.
- `.factory/demo.md`, `.factory/copy-audit.md`, `README.md`, and the catalog
  description are current. The catalog copy is also at
  `/work/.evidence/catalog-description.txt`.

## Findings disposition

| Finding | Disposition |
| --- | --- |
| F-2-1 | Fixed: `@claim:demo-isolation` edits, exits, revisits, and checks both namespaces. |
| F-2-2 | Fixed: `@claim:free-core-reader` verifies core controls with no license. |
| F-2-3 | Fixed: `@claim:no-account-demo` completes a direct demo with no account state. |
| F-2-4 | Removed honestly: the landing no longer promises the context-menu path. |
| F-2-5 | Fixed: `@claim:in-tray-replay` presses `R` in the loaded reader. |
| F-2-6–9 | Fixed: tagged tests observe punctuation, identifier, part-mode, and override outcomes. |
| F-2-10 | Fixed: route-matrix browser test checks all five headers and destinations. |
| F-2-11 | Fixed: route metadata browser test checks each required social field. |
| F-2-12 | Fixed: browser forward/back test checks heading focus and announcement. |
| F-2-13–18 | Fixed: copy audit plus reader-label and mobile-theme browser tests cover the rewrites. |
| Review 1 and verification 1–3 findings | Retained fixed and retested from a fresh checkout. |

## Verification

Fresh checkout `/tmp/code-echo-clean.J0DiTA` at the implementation commit:

```text
npm ci                                      passed; 0 audited vulnerabilities
npm test                                    passed; 16 tests
npm run typecheck                           passed
npm run build                               passed; dist/site and MV3 ZIP created
12 commands declared in .factory/claims.json passed individually
npm run test:e2e                            passed; 26 tests
unzip -t .output/code-echo-1.0.0-chrome.zip passed
```

Only `dist/site` was uploaded to the existing `sf-code-echo` static app. DNS
and app configuration were not changed. Production checks passed:

- Fresh 1440×900 and 390×844 loads showed job, audience, and sample action
  before scrolling. Both had no console errors; phone width was exactly 390 px.
- The live demo began at `const` / `Says: const` / `1 / 13`. Editing it, using
  **Start for real**, and returning restored the sample without changing real
  storage. Live offline reload kept the reader enabled.
- `verify-url.sh` passed: HTTPS 200, title, language, one h1, main, alt text,
  labelled buttons, and no console errors.
- Live axe scans found zero serious/critical findings on desktop home and 390 px
  home, demo, privacy, terms, and 404. Internal link crawl returned 200s; an
  unknown address returned the designed page with HTTP 404.
- Live bytes matched the candidate for five page documents, service worker,
  initial JS/CSS, and downloadable ZIP.
- Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100;
  FCP 1.0 s, LCP 1.2 s, TBT 20 ms, CLS 0.

Build sizes: initial JS 2,649 bytes gzip, initial CSS 3,724 bytes gzip, mobile
hero AVIF 13,528 bytes, extension ZIP 18,047 bytes. Evidence is in
`/work/.evidence/`.

## Known gap

Checkout remains unavailable until the factory completes Code Echo product
registration in the Sociobot billing system. The site and extension show no
purchase action; the core local reader remains available. This external
dependency is the only remaining release constraint.
