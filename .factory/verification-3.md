# Independent verification 3 — FAIL

Verified 2026-08-27 against candidate `80e0c68fa28892613ea33e1794152e81d323495d` and `https://code-echo.sociobot.in/`.

## Verdict

**FAIL.** The candidate is deployed and the core local-first code reader works end to end, but it fails the non-negotiable keyboard accessibility baseline: its skip links do not actually move focus to main content. A secondary invalid-input feedback gap exists in the license-restore form.

## Release-blocking defect

### P1 — site and extension skip links do not skip keyboard focus to main content

Both `site/index.html` and `entrypoints/popup/index.html` link to `#main`, but their target `<main id="main">` has no `tabindex="-1"` (or other focusable target). In fresh Chromium, Tab focuses `.skip-link`, Enter changes the fragment, and `document.activeElement.id` remains empty rather than `main`. The same markup makes the extension popup's “Skip to settings” link non-functional for keyboard focus. A user tabbing after the link is still routed through the masthead/header controls instead of being placed at the task content.

This violates the supplied accessibility contract's keyboard requirement (“skip link to main”) and the factory definition of done's keyboard requirement. Axe does not flag this behavioral defect, so its clean result is not sufficient to clear it.

### P2 — blank license submission supplies no error or recovery guidance

The popup's `#license-token` is not required. In a fresh extension profile, submitting an empty `#license-form` leaves `#license-status` empty; `form.checkValidity()` is `true`, and no browser validation or live status tells the user to paste a license. The landing-page form has the same code path. An invalid nonempty token correctly reports “License no longer active. The free reader is unchanged,” so the recovery path itself is otherwise sound.

## Evidence that passed

### Clean local candidate and package

```sh
git rev-parse HEAD                            # 80e0c68fa28892613ea33e1794152e81d323495d
npm ci                                        # 183 packages; 0 vulnerabilities
npm test                                      # 16/16 passed
npm run typecheck                             # passed
npm run build                                 # passed; MV3 output, ZIP, dist/site
npx playwright install chromium               # installed required locked Playwright 1.62 browser revision
npm run test:e2e                              # 9/9 passed
npm audit --audit-level=high                  # 0 vulnerabilities
unzip -t dist/site/downloads/code-echo-chrome.zip # archive OK
```

The first browser-test attempt could not launch because the environment's preinstalled browser was for a different Playwright revision; after the permitted matching Chromium install, all nine browser tests passed. There is no repository lint script. The exact production build's initial JavaScript is 6,598 bytes uncompressed (5,887-byte home bundle plus 711-byte module-preload helper), primary home CSS is 12,107 bytes, the 390 px AVIF is 13,528 bytes, the largest hero AVIF is 90,525 bytes, and the staged Chrome ZIP is 17,856 bytes: all within the stated budgets.

### Core-job and recovery exercise

- Loaded the built MV3 extension in a fresh Chromium profile and used the real `Alt+Shift+E` selection command on a documentation-style token. The tray opened at `chrome`, spoke `chrome`, then advanced from `1 / 2` to `2 / 2` with ArrowRight. Escape returned focus to the invoking control; `Ctrl+Shift+Y` replay is covered by the passing packaged-extension test.
- Empty selection announced exactly `Select a code line or identifier first.` A 5,000-character single-token selection was safely truncated to the documented 4,000-character limit, rendered in the tray, and remained recoverable.
- Popup controls persisted 1.5× rate, 32 px chunk size, and a local `HTTP → H T T P` override after reload. Empty dictionary submission uses native required-field validation; clearing history restores the empty-history state. Paid sync is disabled with no license.
- A deliberately invalid license made exactly one request to `https://api.sociobot.in/api/v1/products/code-echo/verify?license=not-a-real-license` and reported `License no longer active. The free reader is unchanged.` The free reader remained usable.
- The tray focus loop was keyboard-operable and its actual focus style was `rgb(21, 92, 115) solid 3px`. Local and live console/page-error collectors were empty.

### Accessibility, responsive behavior, and motion

- Axe reported no serious or critical violations on the local public pages, extension popup, and reader tray (the repository suite), or on the live home page at desktop and 390 × 844 (fresh independent scan).
- At 390 px live `document.documentElement.scrollWidth` was exactly 390; the download CTA and reader preview were visible. A visual mobile review found the designed stacked layout readable and free of horizontal clipping.
- Fresh reduced-motion Chromium returned `animationName: none` and `transitionDuration: 0s` for the hero. The live skip link itself becomes visibly focused, but has the P1 focus-transfer failure above.
- Live mobile Lighthouse report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.6 s, LCP 0.6 s, TBT 0 ms, CLS 0, console-errors audit passed. Lighthouse wrote the complete report before its Chrome process emitted a post-audit `TARGET_CRASHED` BFCache-gatherer warning; the scored audits listed here are present in `/tmp/code-echo-lighthouse.json` from this run.

### Privacy, PWA, deployment identity, and response policy

- Reading selected code generated no page requests beyond the local origin. A live normal load requested only `https://code-echo.sociobot.in`; source and runtime inspection found no analytics, advertising, CDN fonts, or third-party scripts. The only extension host permission and network call are the production Sociobot license-verification API. The Web Speech/provider disclosure is present.
- The live root's active service worker has root scope and a controller after `registration.update()`. After a prior online load, a CDP-triggered offline reload completed with `document.readyState === "complete"` and visible `<main>` from the cache, with no errors.
- Live `/` uses the same `home-BMqW4c2d.css` and `home-DNT4esCg.js` fingerprints as the freshly built candidate. SHA-256 matched for live/local `favicon.svg` and `assets/hero-risograph-480.avif`; the live downloadable ZIP is byte-identical to `.output/code-echo-1.0.0-chrome.zip` and passes `unzip -t`.
- Live responses are HTTPS 200 with CSP (`connect-src 'self' https://api.sociobot.in`), HSTS, `X-Content-Type-Options: nosniff`, `strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=()`. AVIF has `image/avif`; `/assets/*` has `Cache-Control: public, max-age=31536000, immutable`; HTML/SW/ZIP use the platform's 30-second revalidation cache. `/privacy/`, `/terms/`, and the manifest respond correctly.

## Required next steps

1. Make the site and popup skip targets programmatically focusable (normally `tabindex="-1"` on `main`) and move focus there on activation; add a real keyboard regression test that asserts `document.activeElement` is the target.
2. Mark the license-token input required or announce a clear status such as “Paste a license token to verify it,” on both site and popup; add invalid-empty regression coverage.
3. Rebuild, deploy, and rerun this verification. Do not rely only on axe for keyboard-navigation behavior.
