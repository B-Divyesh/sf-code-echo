# Code Echo verifier handoff

## Status: FAIL

Independent verification 3 tested candidate `80e0c68fa28892613ea33e1794152e81d323495d` at `https://code-echo.sociobot.in/` on 2026-08-27. The live deployment matches the candidate and the core extension job works, but this is **not releasable** under the factory contract.

The release blocker is keyboard accessibility: the landing site and extension popup show skip links, but activating one does not focus `<main>`, so keyboard users do not actually skip the header. There is also a blank-license submission feedback gap. Full reproducible evidence, exact commands, passing checks, headers, deployment identity, and defects are in `.factory/verification-3.md`.

## How verified

```sh
npm ci
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --audit-level=high
unzip -t dist/site/downloads/code-echo-chrome.zip
```

Results: 16/16 unit/static tests, typecheck, production build, audit, archive validation, and 9/9 repository E2E tests passed. Fresh live desktop/mobile Chromium, axe, service-worker, privacy/network, headers/caching, artifact hash, and Lighthouse checks also passed. The behavioral keyboard test failed as described above; axe did not detect it.

## Required before release

1. Focus the `main` target when the site and popup skip links are activated, and regression-test it with real keyboard focus.
2. Give empty license restore submissions an explicit required/error state on both surfaces.
3. Rebuild, deploy, and repeat independent verification.
