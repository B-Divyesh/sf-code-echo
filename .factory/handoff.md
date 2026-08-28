# Repair handoff — Code Echo, perfection loop 1

Repair commit: `7516039da45ac93f7ddfe58fd5d2f20e6ac72f3b` (base reviewed:
`bee37c90471607715800d9226e4e4c64b6ff2e3b`).

## Completed

- Replaced the first screen with the required plain job, audience, sample
  action, result, and three tested facts.
- Added `/demo/` and `/?demo=1` redirect. The sample opens on a visible
  `const` chunk and spoken text, with the persistent demo banner, reset, and
  exit actions. Demo writes use only `demo:code-echo:` localStorage keys.
- Added `.factory/claims.json`, one Playwright test per claim, `.factory/demo.md`,
  and the copy audit. The network claim exercises both the sample and loaded
  extension flow.
- Pinned Playwright and axe packages to versions compatible with the supplied
  Chromium browser.
- Added real demo, legal, and styled 404 documents; canonical, OG/Twitter,
  favicon, 180 px touch icon, social image, sitemap, response override, and
  consistent headers/footers. The existing risograph workbench identity is
  retained.
- Added mobile, focus, axe, offline-reload, metadata, route, extension-control,
  and privacy tests. The social crop provenance is recorded in `design.md`.

## Exact verification evidence

A fresh local clone at `/tmp/code-echo-clean.Rtj3QQ` completed:

```sh
npm ci
npm test                 # 16 passed
npm run typecheck
npm run build            # dist/site and .output package produced
npm run test:e2e -- --workers=1  # 15 passed
```

Each declared claim command passed from that clean clone:

```sh
npm run test:e2e -- --grep @claim:chunk-reader
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:no-code-upload
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:extension-controls
```

`/opt/fleet/lib/verify-url.sh` passed on local `/` and `/demo/`: titles,
`lang`, one h1, main landmark, image alt text, labelled buttons, and zero
console errors. Playwright axe checks cover `/`, `/demo/`, `/privacy/`,
`/terms/`, `/404/`, the popup, the content-reader dialog, and 390 px layout;
all serious and critical violation sets were empty. Lighthouse mobile report
at `/tmp/code-echo-lighthouse.json` recorded performance `1.0` and
accessibility `1.0`.

## Deploy

Deploy the generated static directory `dist/site/`. The staged extension zip
is `dist/site/downloads/code-echo-chrome.zip`.

Deployed 2026-08-28 through `/opt/fleet/lib/deploy-static.sh` as Azure Static
Web Apps deployment `6d4031af-1ee4-408b-b851-ab11f879a479`. Production checks
passed at `https://code-echo.sociobot.in/` and `/demo/` with zero console
errors; `https://code-echo.sociobot.in/not-a-real-page` returned HTTP 404.

## Known gaps

No known blocking findings remain. The optional paid checkout is not advertised
until product registration exists; the accessible core reader and sample remain
available without it.
