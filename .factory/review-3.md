# Code Echo review 3 — Read selected code one part at a time

Reviewed 2026-09-05 against the live product at
<https://code-echo.sociobot.in/>.

Implementation reviewed: `cb82985cf57f8a7dd99bcd737d3b26bd633958f9`  
Documentation baseline reviewed: `2117c1f1b1e57a286e33e7421f262493ad89e39e`

## Verdict: PASS

**0 findings. 0 untested public claims.**

No product source files were changed for this review. The implementation
candidate and the live product match for the checked artifacts. The later
documentation-only commits were reviewed as documentation and did not require
another product image.

## First screen

Fresh Chromium contexts at 1440×900 and 390×844 showed, before scrolling:

- Job: **Read selected code one part at a time**.
- Audience: **For developers and learners who lose their place in unfamiliar
  code.**
- First action: **Try it with sample code**.

The action measured 233×50 px at x=130, y=548 on desktop and x=14, y=535 on
phone. Phone document width was exactly 390 px. Both loads returned 200, had
no page or console errors, and requested only the product origin.

## Clean implementation checkout

A new local checkout at `cb82985` was used. `npm ci` installed 183 packages
with 0 reported vulnerabilities. These declared checks passed:

```text
npm test                                      PASS — 16 tests
npm run typecheck                             PASS
npm run build                                 PASS — dist/site and MV3 ZIP
unzip -t .output/code-echo-1.0.0-chrome.zip  PASS
npm run test:e2e                              PASS — 26 tests
```

The full browser suite uses a fresh persistent Chromium context for the
packaged extension. It exercised selection, `Alt+Shift+E`, `Ctrl+Shift+Y`,
in-reader `R`, focus recovery, settings/history persistence, empty-license
recovery, free reader controls, and the 4,000-character selection boundary.

## Public-claim verification

Every command listed in `.factory/claims.json` was run separately after the
clean build. Each selected one tagged outcome test and passed.

| Claim ID | Result |
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

The static claim contract test and current landing/README copy also passed.
The remaining Web Speech wording is a conditional browser/provider disclosure,
not an untestable product promise.

## Live product evidence

- `/?demo=1` redirected to `/demo/?demo=1`. The direct demo showed the
  persistent **Demo — sample data, nothing is saved** label, `const`,
  `Says: const`, and `1 / 13` immediately.
- **Reset demo** restored the shipped `parseHTTPResponse` sample. After an
  edit, **Start for real** removed all `demo:code-echo:` keys, retained a
  seeded real reader key, and a return to the demo restored the shipped sample.
- Normal and recovery paths worked: blank input announced `Add a code line
  first.`; a 5,000-character input displayed the safe 4,000-character part.
- After service-worker control and an online reload, a fresh context reloaded
  the demo offline with `const` visible, Next enabled, and the offline banner
  visible.
- The live demo's recorded requests stayed same-origin and did not contain the
  sample source. No account UI or account request was present.
- Route/title/h1 checks passed for `/`, `/demo/`, `/privacy/`, `/terms/`, and
  an unknown path. The unknown path intentionally returned HTTP 404 with the
  designed **Page not found** page and a working skip link; its browser
  navigation's expected 404 resource message is not an application error.
- Keyboard testing moved the demo skip link to `#main`. Reduced-motion styling
  reported `animation-name: none` and `transition-duration: 0s`.
- Axe found zero serious or critical violations on desktop home, phone demo,
  privacy, terms, and the designed 404. `verify-url.sh` also passed: HTTPS 200
  in 550 ms, valid title/lang, one h1, main landmark, no missing image alt
  text, no unlabelled buttons, and no root-page console errors.
- Internal links, including the extension ZIP, returned 200. The live headers
  include restrictive CSP with response-header `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and Permissions-Policy. No CDN
  fonts, third-party scripts, or analytics request was observed.
- Mobile Lighthouse passed: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 30 ms, CLS 0.

SHA-256 matched from the clean candidate build to production for the five page
documents, service worker, initial JS/CSS/module-preload assets, mobile hero
AVIF, favicon, manifest, and downloadable extension ZIP.

## Earlier finding disposition

| Earlier set | Current disposition |
| --- | --- |
| Review 1 B1 | Fixed and re-exercised: direct populated demo, persistent sample label, reset, isolated namespace, and discard-on-exit. |
| Review 1 B2; Review 2 F-2-2 through F-2-9 | Fixed: all 12 visitor-facing claims have separately run outcome tests. |
| Review 1 B3 | Fixed: Playwright is pinned to the supplied 1.58.2 browser; clean E2E passed. |
| Review 1 B4; Review 2 F-2-10 through F-2-12 | Fixed: real routes, route metadata, designed 404, navigation, focus, and announcements are covered and live-checked. |
| Review 1 M1–M3; Review 2 F-2-13 through F-2-18 | Fixed: current copy/controls use plain, consistent words; responsive and accessibility tests passed. |
| Verification 1–4 findings | Remain fixed: packaged-extension behavior, local privacy, skip links, validation recovery, responsive assets, headers, caching, and offline behavior passed current clean and live checks. |

## Constraint

Checkout remains intentionally unavailable until factory billing registration is
complete. No purchase action is offered, and the free core reader is available.
This is not a finding.
