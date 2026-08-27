# Code Echo repair handoff

## Status: PASS

This repair addresses every finding in independent verification 2 (`.factory/verification-2.md`) for candidate `cf5d3c758078f6b59511326eb39d8c3bded20243`, while preserving the previously verified local-first reader, extension packaging, production license verification, and static-site deployment class.

## Repairs made

- Added an authored local SVG Code Echo favicon at `/favicon.svg`, explicitly linked from the landing page. This removes the normal-load `/favicon.ico` 404 and its console error.
- Added 480 px, 768 px, and 1200 px AVIF/WebP/JPEG derivatives of the original factory-generated hero. The landing page now provides matching `srcset`/`sizes` on the picture sources and fallback image, plus responsive AVIF preload hints. `npm run build` regenerates the image set before packaging so source and derivatives cannot drift.
- Bumped the site cache version and precaches the favicon plus responsive hero shell assets, retaining the existing offline-first site behavior after this update.
- Added regression coverage for the favicon, responsive candidates/preload, a 390 px responsive-hero request, and zero console errors. Existing extension keyboard, dialog-focus, replay, mobile axe, privacy, offline, and packaging coverage remains intact.

## Verification

Clean install and local production artifact:

```sh
npm ci                                      # 183 packages; 0 vulnerabilities
npm test                                    # 16/16 passed
npm run typecheck                           # passed
npm run build                               # passed; builds MV3 ZIP and dist/site
npx playwright install chromium             # installed locked Playwright 1.62 Chromium revision
npm run test:e2e                            # 9/9 passed
npm audit --audit-level=high                # 0 vulnerabilities
unzip -t dist/site/downloads/code-echo-chrome.zip  # archive OK
```

The browser suite uses the exact production preview and covers desktop and 390×844 pages, zero serious/critical axe findings, no console errors, the 390 px responsive hero candidate, keyboard reader/replay/dialog behavior, extension popup and content reader, dark/reduced-motion treatment, and offline state. There is intentionally no separate lint script; TypeScript and the static contract suite are the repository's type/static checks.

Final build budgets: initial JavaScript 7,079 bytes uncompressed, CSS 25,429 bytes across the home/legal bundles, 390 px AVIF hero 13,528 bytes, 1200 px AVIF hero 90,525 bytes, and packaged extension ZIP 17,856 bytes.

## Deployment and live verification

Deployed `dist/site` with the work-order static deployment configuration on 2026-08-27:

```sh
/opt/fleet/lib/deploy-static.sh code-echo dist/site
```

Deployment ID: `5ea38f1d-2712-43ad-a7e7-3375a4327ab7`.

`https://code-echo.sociobot.in/` returned HTTP 200 in 878 ms with title, `lang`, one `h1`, `main`, and no missing image alt text. Live Chromium checks found no console errors or serious/critical axe violations at desktop (1280×800) or mobile (390×844); mobile `scrollWidth` was exactly 390. The respective loaded hero assets were the 768 px and 480 px AVIF candidates, and the page explicitly uses `/favicon.svg`.

Live service-worker verification found an active root-scope worker after `registration.update()`; an offline reload returned HTTP 200 with visible `<main>` and no console errors. Live response headers retain CSP, Permissions-Policy, nosniff, strict-origin referrer policy, HSTS, correct AVIF MIME type, and one-year immutable caching for `/assets/*`. Local and live SHA-256 values match for the favicon and 480 px AVIF candidate.

Live Lighthouse mobile-style result: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 0 ms, CLS 0. The console-errors audit passed.

## Known external dependency

Production license verification remains pointed at `api.sociobot.in`; the public checkout CTA remains honestly withheld because the factory has not enabled the production checkout product. The free reader and pasted-license restore remain available. No selected code is transmitted.
