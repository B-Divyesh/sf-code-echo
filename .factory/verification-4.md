# Independent verification 4 — PASS

Verified on 2026-08-28 against candidate commit `ecd69e81a7c791b87076ac7bc865e86ee5d3baec` and the deployed URL `https://code-echo.sociobot.in/`.

## Verdict

**PASS.** This is a clean, buildable release candidate and the live deployment is byte-identical to the candidate artifacts examined. The local-first browser-extension job works end to end: a selected code token opens a focused syntax-chunk reader, the user can move/replay it with the keyboard, preferences persist locally, and no selected code is transmitted.

There are no P1 or P2 defects found in this verification.

## Local clean-checkout verification

```sh
npm ci                              # 183 packages installed; 0 vulnerabilities
npm test                            # 17/17 passed
npm run typecheck                   # passed
npm run build                       # passed; dist/site and MV3 ZIP produced
npx playwright install chromium     # Playwright Chromium 1234 installed for locked v1.62
npm run test:e2e                    # 11/11 passed
unzip -t .output/code-echo-1.0.0-chrome.zip  # archive valid
npm audit --audit-level=high        # 0 vulnerabilities
```

The repository has no separate lint script. Its typecheck and static-contract suite are the available type/static gates.

Build artifacts are within the stated budgets: initial home JavaScript is 6,341 bytes uncompressed (plus a 711-byte module-preload helper), home CSS is 12,107 bytes, the 390px AVIF hero is 13,528 bytes, and the Chrome extension ZIP is 18,007 bytes. The responsive hero has AVIF/WebP/JPEG `srcset` and `sizes` variants.

## Independent end-to-end evidence

- On the live page, the representative `parseHTTPResponse` source produced 13 chunks: it began at `const`, then Next displayed `parseHTTPResponse` at `2 / 13`. Blank source announced `Add a code line first.` and returned focus to the source textarea.
- In a fresh persistent Chromium profile loading the built MV3 output, selecting the documentation-style `chrome://extensions` token and pressing the real `Alt+Shift+E` command opened the tray at `chrome`, with `Says: chrome`, `1 / 2`, and focus on Close. ArrowRight moved to `2 / 2`; Escape returned focus to the invoking control; `Ctrl+Shift+Y` reopened the latest history item. No page request occurred while opening, navigating, or replaying selected code.
- Empty extension selection announced `Select a code line or identifier first.` A 5,000-character single-token selection safely rendered as a 4,000-character single chunk, the documented boundary. A saved `HTTP -> H T T P` override was applied by the on-page tray as `Says: H T T P`.
- Popup settings persisted a 1.5 speech rate, 32px text size, and local pronunciation override across reload. Empty license restore set `aria-invalid="true"` and announced `Paste a license token to verify it.` An invalid token made exactly one GET to `https://api.sociobot.in/api/v1/products/code-echo/verify?license=qa-invalid-token`, returned an honest inactive-license message, and left the free reader available.

## Accessibility, responsive, and visual checks

- `/opt/fleet/lib/verify-url.sh https://code-echo.sociobot.in/ <evidence-dir>` returned HTTPS 200 in 739 ms with no console/page errors, a title, `lang="en"`, exactly one h1, main landmark, no missing image alt attributes, and no unlabeled buttons.
- Independent axe scans found zero serious/critical violations on the live desktop home, live 390 x 844 home, packaged extension popup, and open extension reader tray.
- Keyboard-only checks confirmed the site and popup skip links visibly focus (3px `#155C73` outline with 3px offset) and move focus to their `main` targets. The reader focus loop begins on Close and retains focus within its controls; Escape restores the trigger focus.
- At 390 x 844, document scroll width was exactly 390, the primary download action measured 226 x 50 px and remained fully on screen, and visual desktop/mobile inspection found the intentional stacked layout, readable copy, and no clipping.
- With `prefers-reduced-motion: reduce`, the live hero reported `animation-name: none` and `transition-duration: 0s`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 20 ms, CLS 0. The console-errors audit passed.

## Privacy, PWA, security, and deployment identity

- Initial live load requested only `https://code-echo.sociobot.in` assets. Static/runtime inspection found no analytics, pixels, CDN fonts, or third-party scripts. The extension declares only `storage`, `contextMenus`, `activeTab`, and the production Sociobot verification host permission. Web Speech provider disclosure is present; speech-provider processing remains browser/OS controlled.
- SHA-256 matched local candidate output and live `/`, `/privacy/`, `/terms/`, `sw.js`, home JS/CSS, mobile hero AVIF, and downloadable ZIP. The live ZIP also passed `unzip -t` locally.
- The active root-scoped service worker successfully completed `registration.update()` and, after an online load, served an offline reload with HTTP 200, visible main content, and no errors.
- HTTPS responses include CSP restricted to self plus `https://api.sociobot.in` for `connect-src`, Permissions-Policy, HSTS, `nosniff`, and strict-origin referrer policy. Hashed JS/CSS/AVIF have one-year immutable caching; AVIF, manifest, and ZIP have correct MIME types.

## Known non-blocking release constraint

Production checkout remains intentionally withheld while the factory completes product registration. The UI does not present a dead purchase CTA; it truthfully says checkout is being prepared and allows existing licenses to be restored and verified. The free, accessibility-essential reader is fully available.
