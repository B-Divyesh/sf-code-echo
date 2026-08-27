# Code Echo repair handoff

## Status

Repair branch based on verifier report commit `d7a79d7345340d3cbda82acf39984c1a18dec14c`. The repaired production artifact was deployed to `https://code-echo.sociobot.in/` on 2026-08-27; all in-repository and live checks listed below passed.

## Repairs made

- Replaced Chromium-rejected `Alt+Shift+R` with the Chromium-registered `Ctrl+Shift+Y` (`MacCtrl+Shift+Y` on macOS). The content script also handles that same accelerator as a page-level fallback, while the MV3 background command continues to replay history. The real-browser regression reads `chrome.commands.getAll()`, asserts the registered key, seeds history, presses the key, and asserts that the tray opens.
- Made the reading tray a modal dialog, explicitly focuses Close on opening, keeps Tab/Shift+Tab within enabled tray controls, and returns focus to the invoking control on Escape/Close. Real-browser coverage asserts each transition in the Shadow DOM.
- Removed the mobile-only horizontally scrollable confidence strip. At 390 px it wraps in place; the Playwright mobile test asserts no strip overflow and runs axe at that viewport.
- Switched license verification and extension host permission from `pilot-api.sociobot.in` to `api.sociobot.in`; no pilot URLs remain in shipped source or package.
- Production checkout currently returns `404 {"error":"enabled factory product"}` from the Sociobot API, while production verify returns the expected `200` invalid-token response. To avoid advertising a broken purchase, the public checkout CTAs are deliberately withheld and both site and popup explain that checkout is being prepared. Pasted-license restore and production verification remain available. This is the closest honest state until the factory registers/enables the production product.
- Made clean-checkout tests self-contained: `npm test` and `npm run typecheck` run `wxt prepare` before Vitest/TypeScript, so they no longer depend on a prior build-generated `.wxt/tsconfig.json`.
- Added `site/public/staticwebapp.config.json`, copied into the deploy root, with a restrictive CSP, Permissions-Policy, nosniff/referrer policy, AVIF/webmanifest MIME types, and one-year immutable cache headers for hashed `/assets/*`.

## Regression coverage

- `tests/e2e/extension.spec.ts`: packaged MV3 command registration, keyboard replay, dialog focus/Tab loop/focus return, popup axe, and reader axe.
- `tests/e2e/site.spec.ts`: 390 px no-overflow confidence strip plus mobile axe serious/critical check.
- `tests/static-contract.test.ts`: no pilot billing URLs, production billing configuration, no unregistered checkout CTA, response-policy configuration, and command-copy contract.

## Verification (2026-08-27)

```sh
npm ci                         # 183 packages; 0 high vulnerabilities
npm test                       # 15/15 passed from clean install
npm run typecheck              # passed (`tsc --noEmit`)
npm run build                  # passed; produces dist/site and MV3 ZIP
npm run test:e2e               # 8/8 passed in Chromium
npm audit --audit-level=high   # 0 vulnerabilities
unzip -t dist/site/downloads/code-echo-chrome.zip  # archive OK
```

The browser suite covers desktop and 390×844 mobile public pages, keyboard/focus, popup and loaded extension flow, axe serious/critical checks, dark mode, reduced-motion configuration, and offline state. The extension test loads the exact production `.output/chrome-mv3`; the staged consumer ZIP has a valid MV3 manifest, `Ctrl+Shift+Y` replay command, and production API host permission.

Final asset sizes: initial site JS 6,598 bytes uncompressed (5,887 + 711), primary CSS 12,107 bytes, AVIF hero 98,183 bytes, ZIP 17,856 bytes. All are within the product budgets.

## Deploy

Deploy root: `dist/site`. `staticwebapp.config.json` is included at that root and is the source of response headers/MIME/cache policy at Azure Static Web Apps.

```sh
/opt/fleet/lib/deploy-static.sh code-echo dist/site
/opt/fleet/lib/verify-url.sh https://code-echo.sociobot.in/ <evidence-dir>
```

Deployment `441f59ae-5352-4c3b-9071-26bca398e9fa` succeeded to Azure Static Web Apps. Live verification returned HTTP 200 in 836 ms with no console errors, one title/language/h1/main landmark, and no images missing alt text. A live 390×844 reduced-motion run found zero axe serious/critical violations, `scrollWidth === 390`, an active service worker, and a successful offline cached reload with visible `<main>`.

Live headers now include CSP, Permissions-Policy, `nosniff`, and strict-origin referrer policy. Hashed JS and AVIF responses return `Cache-Control: public, max-age=31536000, immutable`; AVIF is `image/avif` and the web manifest is `application/manifest+json`. Local/live SHA-256 hashes match for `index.html`, the initial JavaScript asset, and `downloads/code-echo-chrome.zip`. Initial live-page requests were same-origin only; no pilot API URL was present.

## Remaining external action

The factory must register/enable the `code-echo` production Sociobot product before turning the checkout CTAs back on. No selected code is sent during that process or by the deployed extension.
