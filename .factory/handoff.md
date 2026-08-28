# Review handoff — Code Echo, adversarial first-read review 2

## Completed

- Reviewed the live product cold at 390×844 and 1440×900.
- Exercised the one-click demo, Reset, Start for real, localStorage isolation,
  request privacy, and offline behavior.
- Ran every `.factory/claims.json` command from a fresh clone.
- Re-ran unit tests, typecheck, build, the complete Playwright suite, live axe
  scans, the factory URL verifier, metadata checks, and a live link crawl.
- Audited every landing-page and README copy unit and checked every earlier
  review finding against both production and source.
- Wrote `.factory/review-2.md`. No product source was modified.

## Verdict

**FAIL.** The review records 10 blocking and 8 minor findings. The highest-risk
issues are demo edits surviving **Start for real**, unlisted or under-tested
visitor claims, and the still-inconsistent route headers from review 1.

## Verification summary

Fresh clone: `/tmp/code-echo-review2.OQulu8` at
`d69e1354e676f75eec0f6fbe7a83102d7e0fe7c1`.

```text
npm test             16 passed
npm run typecheck    passed
npm run build        passed; dist/site created
npm run test:e2e     15 passed
five claim commands  passed individually
```

Live axe scans found no serious or critical violations. The factory URL
verifier passed `/`, `/demo/`, `/privacy/`, and `/terms/`. All crawled product
links and the extension download resolved; an unknown route returned the
designed page with HTTP 404.

## Evidence

- Cold screenshots: `/tmp/code-echo-phone-cold.png` and
  `/tmp/code-echo-desktop-cold.png`
- Demo screenshot: `/tmp/code-echo-demo-initial.png`
- URL verifier output and screenshots: `/tmp/code-echo-verify/`
- Full evidence, exact quotes, claim results, history matrix, and fixes:
  `.factory/review-2.md`

## Left for the repair round

Address every finding in `.factory/review-2.md`, then repeat the entire review
from a fresh browser context and clean clone. In particular, extend tests to
cover demo exit and observable reader outcomes instead of stored settings only.
