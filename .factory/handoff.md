# Code Echo verification handoff

## Status: FAIL

Independent QA on 2026-08-27 tested commit `cf5d3c758078f6b59511326eb39d8c3bded20243` and the byte-identical live deployment at `https://code-echo.sociobot.in/`.

Core reader behavior passed: normal, boundary, and recovery paths; keyboard replay and modal focus; local settings/history; privacy/network limits; 390 px responsiveness; reduced motion; offline cached reload; and axe serious/critical checks. `npm ci`, 15 unit/static tests, typecheck, exact production build, audit, ZIP validation, and 8 Playwright E2E tests passed (after installing the Chromium revision required by locked Playwright 1.62). There is no lint script.

### P1 blocker

Normal browser load logs `Failed to load resource: the server responded with a status of 404` for `/favicon.ico` both locally and live. This violates the explicit no-console-errors-on-load gate. Lighthouse corroborates it: Best Practices 96, with Performance 100, Accessibility 100, and SEO 100.

### P2

The hero AVIF is within budget but has no responsive width variants or `sizes`; Lighthouse estimates 69–87 KiB avoidable delivery.

### Required follow-up

1. Add/reference a local favicon, redeploy, and re-run desktop plus 390 px console checks.
2. Add responsive hero sources and `sizes`.
3. Keep purchase CTA withheld until factory enables the production Sociobot checkout (verify works; checkout currently returns the documented 404).

See `.factory/verification-2.md` for exact commands and evidence. This verifier changed no product code.
