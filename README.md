# Code Echo

Code Echo is a local-first Chrome extension for dyslexic developers, learners, and anyone who wants selective support while reading unfamiliar code. Select a line or identifier on a documentation or code-review page; Code Echo shows one syntax chunk at a time and reads it with browser-native speech.

The reader is deterministic rather than AI-powered. It does not explain, generate, or upload code.

## What v1 includes

- Selection chip, context-menu action, and `Alt+Shift+E` keyboard command
- Syntax token, word group, or whole-line chunking
- Per-mark punctuation controls and three identifier-reading modes
- Adjustable speech rate, volume, chunk size, and paper/night/high-contrast themes
- Local pronunciation dictionary and ten-item replay history
- `R` in the reading tray or `Ctrl+Shift+Y` to replay
- Clear empty, unavailable-speech, restricted-page, and offline states
- Optional US$9 Echo Pack with JavaScript/TypeScript, Python, and Git presets plus opt-in Chrome settings sync
- Static product site, interactive parser preview, privacy policy, and terms

Selected text, preferences, pronunciation overrides, and history stay in Chrome extension storage. Web Speech is supplied by the browser or operating system and may use its configured speech provider; see [the privacy policy](site/privacy/index.html).

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Current Chromium-based browser for loading the packaged extension

## Develop

```sh
npm install
npm run dev          # WXT extension development
npm run dev:site     # product site at the printed local URL
```

WXT writes development artifacts to `.output/`. Load `.output/chrome-mv3` from `chrome://extensions` with Developer mode enabled.

## Test and build

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e # after a production build
```

The reproducible production command is exactly `npm run build`. It creates:

- `.output/chrome-mv3/` — unpacked MV3 extension
- `.output/code-echo-1.0.0-chrome.zip` — packaged extension
- `dist/site/index.html` — static deploy root
- `dist/site/downloads/code-echo-chrome.zip` — stable site download URL

`npm run build:site` also builds and stages the extension package so it works from a clean clone. The factory deploys `dist/site`; this repository does not modify infrastructure, DNS, billing registration, or production configuration.

The end-to-end suite starts a local preview, runs axe against every public page and the extension popup, checks the on-page reader through a real loaded extension, and covers 390 px and offline states. Install Chromium once with `npx playwright install chromium` if it is not already available.

## Architecture

- `entrypoints/` — WXT background, content, and popup entry points
- `lib/reader.ts` — deterministic chunking and pronunciation logic shared by the extension and site demo
- `lib/storage.ts` — Chrome local/sync storage helpers
- `site/` — Vite static site, legal pages, service worker, and optimized art
- `assets/src/` — generated source art and exact provenance prompts
- `tests/` — reader behavior and static accessibility/privacy contract checks
- `.factory/` — source brief, product-specific design thesis, and handoff

## Paid unlock

The website and popup use the production Sociobot billing API and the `code-echo` slug for license verification. Hosted checkout is intentionally not advertised until the factory completes production product registration; the UI remains honest and supports pasted-license restore, daily cached verification, offline optimistic access after a valid check, and quiet revocation handling. No payment provider is embedded.

## Privacy and security

There are no analytics, advertising scripts, CDN fonts, or third-party runtime dependencies on the site. Extension host access is limited to the Sociobot license-verification API. The content script runs on pages so it can read the user’s explicit selection; it never performs a network request.

## License

MIT. See [LICENSE](LICENSE).
