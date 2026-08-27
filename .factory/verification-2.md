# Independent verification 2 — FAIL

Verified 2026-08-27 against candidate `cf5d3c758078f6b59511326eb39d8c3bded20243` and `https://code-echo.sociobot.in/`.

## Verdict

**FAIL.** The candidate repairs the earlier reader, mobile accessibility, production-billing configuration, response-policy, and deployment-identity defects; the core extension job works end to end. It still fails the factory definition of done because normal browser load emits a console error.

## Defects

### P1 — missing favicon causes a console error on every normal load

Chromium reports `Failed to load resource: the server responded with a status of 404` for `https://code-echo.sociobot.in/favicon.ico` at both desktop and 390 x 844. The exact local production preview likewise logs a 404 for `http://127.0.0.1:4173/favicon.ico`. `dist/site/` contains no favicon and the HTML has no explicit icon link. Lighthouse independently marks `errors-in-console` failed. This breaks the explicit “no console errors on load” quality gate.

### P2 — hero lacks responsive widths

The only AVIF hero is 98,183 bytes, well below the 300 KB mobile budget, but it has no width variants or `sizes`. Lighthouse reports `uses-responsive-images` (estimated 69 KiB) and `image-delivery-insight` (estimated 87 KiB). The performance contract calls for responsive `srcset`/`sizes`.

## Evidence that passed

```sh
npm ci                                      # 183 packages; 0 vulnerabilities
npm test                                    # 15/15 passed
npm run typecheck                           # passed
npm run build                               # passed; dist/site + MV3 ZIP
npm run test:e2e                            # 8/8 passed after npx playwright install chromium
npm audit --audit-level=high                # 0 vulnerabilities
unzip -t dist/site/downloads/code-echo-chrome.zip  # archive OK
```

No lint script exists. The supplied preinstalled Playwright browser did not match locked Playwright 1.62, so the required Chromium revision was installed before the E2E run.

- Build sizes: initial JS 6,598 bytes uncompressed (5,887 + 711), primary CSS 12,107 bytes, hero AVIF 98,183 bytes, extension ZIP 17,856 bytes. All are within budget.
- Live normal path parsed `parseHTTPResponse` into 13 chunks, beginning `const`; advancing gave `parseHTTPResponse`. Blank input announced `Add a code line first.` and returned focus to the textarea. A bad license made only `GET https://api.sociobot.in/api/v1/products/code-echo/verify?license=qa-invalid-token`, received `{ "valid": false, "reason": "invalid" }`, and kept the free reader usable.
- Fresh packaged-extension profile: `chrome.commands.getAll()` returned `Alt+Shift+E` and `Ctrl+Shift+Y`; a saved `HTTP → H T T P` dictionary entry, 1.5x rate, and contrast mode persisted locally. Selection opened the tray, focus cycled Close → Read → Next → Close, Escape returned focus to the invoking control, global replay reopened history, and an empty selection announced the correct recovery. No fetch/XHR happened while reading selected code.
- Axe had zero serious/critical findings on live desktop and 390 x 844 home, extension popup, and reader tray. At 390 px, page scroll width was 390, the primary download button was 226 x 50 px, and the confidence strip did not overflow. Focus was a visible 3 px blue outline with 3 px offset; reduced motion removed hero animation.
- The live service worker was active at root scope; `registration.update()` succeeded and offline reload returned HTTP 200 with a visible `<main>`.
- Initial live loads used only same-origin assets. No analytics, CDN fonts, or third-party scripts were observed. Selected code is not sent; Web Speech provider disclosure and local-first storage policy are present.
- SHA-256 bytes matched between the locally built candidate and live `/`, `/privacy/`, `/terms/`, initial JS/CSS, AVIF, service worker, webmanifest, and downloadable ZIP. This is candidate behavior, not deployment drift.
- Live CSP permits only self plus the production Sociobot API in `connect-src`; Permissions-Policy, nosniff, strict-origin referrer policy, and HSTS are present. Hashed JS/CSS/AVIF cache immutably for one year; AVIF, manifest, and ZIP MIME types are correct.
- Lighthouse (live mobile-style): Performance 100, Accessibility 100, Best Practices 96, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 0 ms, CLS 0. The Best Practices deduction is the P1 console error.

## Required next steps

1. Add and explicitly reference a local favicon; rebuild/deploy; confirm no desktop or 390 px console/page errors.
2. Add responsive hero width variants and `sizes`.
3. Production verification works, but checkout currently returns `404 {"error":"enabled factory product"}`. Keep checkout CTA withheld until the factory enables it.
