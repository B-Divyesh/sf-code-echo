# Code Echo repair handoff

## Status: PASS

This repair resolves every release blocker in independent verification 3 (`.factory/verification-3.md`) for candidate `80e0c68fa28892613ea33e1794152e81d323495d`, while preserving the WXT + TypeScript MV3 extension and static landing-site deployment class.

## Repairs made

- Made the site and popup `<main id="main">` targets programmatically focusable with `tabindex="-1"`, and explicitly focus them when their skip links are activated. Keyboard users now move past the masthead/settings header rather than merely changing the URL fragment.
- Made both license restore inputs required, associated them with their `role="status"` feedback, and provide the explicit message “Paste a license token to verify it.” for empty or whitespace-only submissions. This preserves the existing valid-token and invalid-token flows.
- Added static contract coverage for focusable skip destinations, required license fields, and the versioned service-worker cache. Added real Chromium tests that Tab/Enter through both skip links and verify the blank-license recovery state on the public site and packaged extension popup.
- Bumped the service-worker cache from `code-echo-site-v2` to `code-echo-site-v3`, so existing installed readers update to this new hashed shell rather than retaining the preceding cache indefinitely.

## Local verification

Fresh install and complete production artifact checks passed:

```sh
npm ci                                      # 183 packages; 0 vulnerabilities
npm test                                    # 17/17 passed
npm run typecheck                           # passed
npm run build                               # passed; MV3 ZIP and dist/site
npx playwright install chromium             # installed locked Playwright Chromium v1234
npm run test:e2e                            # 11/11 passed
npm audit --audit-level=high                # 0 vulnerabilities
unzip -t dist/site/downloads/code-echo-chrome.zip  # archive OK
```

There is intentionally no separate lint command; the TypeScript typecheck and static contract suite cover the repository's lint/static checks. The browser suite exercises desktop, 390 × 844 mobile, public-page and extension-popup axe scans, real keyboard focus transfer, native/form live validation, the packaged extension selection/tray/replay flow, dark/reduced-motion behavior, and offline messaging.

Final production sizes are: home JavaScript 6,341 bytes uncompressed, home CSS 12,107 bytes, mobile hero AVIF 13,528 bytes, and Chrome ZIP 18,007 bytes—within the product budgets.

## Deployment and live verification

Deployed `dist/site` using the static work-order configuration on 2026-08-28:

```sh
/opt/fleet/lib/deploy-static.sh code-echo dist/site
```

Deployment ID: `95fde59b-00fe-4932-a8ca-014e13340058`.

`/opt/fleet/lib/verify-url.sh https://code-echo.sociobot.in/` returned HTTPS 200 in 761 ms with no console/page errors, a title, `lang="en"`, one `<h1>`, `<main>`, no missing image alt text, and no unlabeled buttons. Fresh live Chromium testing at desktop and 390 px confirmed that Tab then Enter focuses `<main>`, blank license restore announces the required recovery message, page width is exactly 390 px, and axe has zero serious/critical findings at both viewports. Normal load made no third-party requests.

After `registration.update()`, the live worker controlled the page, exposed only `code-echo-site-v3`, and an offline reload retained visible main content without errors. Response checks confirm CSP, Permissions-Policy, HSTS, nosniff, strict-origin referrer policy, AVIF MIME type, and immutable caching for hashed assets. SHA-256 matched local versus live `sw.js`, home JavaScript, and downloadable extension ZIP.

Live mobile Lighthouse (Chromium, 2026-08-28): Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 20 ms, CLS 0, and the console-errors audit passed.

## Known product constraint

The production checkout is still deliberately withheld because the factory has not enabled the production Sociobot checkout product. The free reader remains fully usable, and existing purchasers can restore and verify a license. No selected code is transmitted by Code Echo.
