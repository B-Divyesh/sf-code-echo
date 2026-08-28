# Adversarial first-read review 2 — Code Echo

**Verdict: FAIL**

Reviewed 2026-08-28 against `https://code-echo.sociobot.in` in fresh Chromium
contexts at 390×844 and 1440×900. No product source files were changed.

## Cold first read

Before scrolling, I understood the product as a browser aid that breaks selected
code into short readable parts. It is for developers and learners who lose their
place in unfamiliar code. The first click should be **“Try it with sample
code”**, which says it opens a working reader with a realistic selection.

All three answers are available on the first screen at both viewport sizes. The
mobile first screen has no horizontal overflow and the primary action is fully
visible. The exact supporting text is:

> **Read selected code one piece at a time**
>
> For developers and learners who lose their place in unfamiliar code.
>
> **Try it with sample code** — Opens a working reader with a realistic code
> selection.

## Blocking findings

### F-2-1 — Demo edits survive “Start for real” (reopens review-1 B1)

**Exact quote/location:** `/demo/` says **“Demo — sample data, nothing is
saved”** and offers **“Start for real.”**

**Evidence:** In a fresh live context, I changed `#demo-source` to
`const secretDemoEdit = true;`, selected **Start for real**, and returned to
`/demo/?demo=1`. The edited value returned. The key
`demo:code-echo:source=const secretDemoEdit = true;` remained in localStorage on
the normal landing page. `site/src/main.ts` clears demo keys only in the
**Reset demo** handler; the **Start for real** link has no discard handler.

**Why this fails:** The demo is isolated from real keys, and Reset works, but
the banner's absolute “nothing is saved” statement is false across visits. The
demo-sandbox contract also requires leaving demo mode to discard demo data.

**Concrete fix:** Before navigating from **Start for real**, remove every key
with the `demo:code-echo:` prefix. Add a `@claim:demo-isolation` assertion that
edits the sample, leaves through that action, revisits `/demo/?demo=1`, confirms
the default sample is restored, and confirms a seeded real key is unchanged.

### F-2-2 — “Free core reader” is an unlisted pricing claim (reopens review-1 B2)

**Exact quote/location:** Landing hero and product-facts strip: **“Free core
reader.”**

**Evidence:** `.factory/claims.json` has no free-core claim. The closest test,
`@claim:extension-controls`, opens the unpacked extension without a license but
does not assert which controls remain free or map that result to this pricing
sentence. The README's sentence **“Every visitor-facing claim is listed in
.factory/claims.json.”** is therefore also inaccurate.

**Why this fails:** “Free” is a purchasing claim. A visitor can rely on it when
deciding whether to install the extension.

**Concrete fix:** Add a `free-core-reader` entry and exactly one tagged test
that starts with no license, loads the downloadable extension, and verifies
selection reading, visual controls, custom pronunciations, replay, and history
remain available without payment. Alternatively, remove the claim.

### F-2-3 — The no-account claim is not in the claim contract (reopens review-1 B2)

**Exact quote/location:** Landing privacy section: **“The sample reader has no
account or upload step.”**

**Evidence:** `no-code-upload` covers requests containing sample code, but no
claim entry names or test asserts the no-account promise.

**Why this fails:** Setup and account requirements affect whether a visitor can
try the product immediately.

**Concrete fix:** Add a `no-account-demo` claim whose clean-context test enters
the demo and completes reading without authentication, cookies, or an account
request. Keep upload behavior under `no-code-upload`.

### F-2-4 — The context-menu path is claimed but neither listed nor tested (reopens review-1 B2)

**Exact quote/location:** Landing “How it works”: **“Press Alt Shift E or use
the context menu.”**

**Evidence:** `extension-controls` names and exercises `Alt+Shift+E`. It does
not name or invoke the context-menu action. The prior review explicitly required
a test for that promise.

**Why this fails:** One of the two advertised ways to perform the core action
has no claim mapping or end-to-end evidence.

**Concrete fix:** Add a separate `context-menu-reader` claim and tagged loaded-
extension test that selects text, invokes the real extension menu item, and
asserts the reader opens with that text; or remove “or use the context menu.”

### F-2-5 — The in-tray `R` replay path is claimed but not tested (reopens review-1 B2)

**Exact quote/location:** Landing “How it works”: **“Use R in the tray or Ctrl
Shift Y.”**

**Evidence:** `extension-controls` checks `Ctrl+Shift+Y` only. It never presses
`R` in the tray, and the claim text in `claims.json` omits that path.

**Why this fails:** The page presents both shortcuts as supported outcomes, but
only one is verified.

**Concrete fix:** Add an `in-tray-replay` claim and tagged test that focuses the
open tray, presses `R`, and observes replay. Otherwise remove the `R` promise.

### F-2-6 — Punctuation behavior is not covered by a visitor-facing claim test (reopens review-1 B2)

**Exact quote/location:** Landing reader controls: **“Choose marks such as
braces, dots, arrows, and commas.”**

**Evidence:** The extension test unchecks one control and confirms storage. An
untagged unit test confirms parser behavior. No listed claim test proves that a
saved choice changes the spoken output in the loaded extension.

**Why this fails:** Saving a checkbox is not the promised reading result.

**Concrete fix:** Add a punctuation-control claim and tagged loaded-extension
test that reads the same sample before and after changing a mark, then observes
the spoken-form output change.

### F-2-7 — Identifier behavior is not covered by a visitor-facing claim test (reopens review-1 B2)

**Exact quote/location:** Landing reader controls: **“Split camelCase and
snake_case, read as written, or spell.”**

**Evidence:** The extension test saves `identifierMode: "spell"`; it does not
verify the resulting spoken form. No claim entry states these three outcomes.

**Why this fails:** Stored settings alone do not prove the reader applies them.

**Concrete fix:** Add an identifier-mode claim and tagged test that reads one
identifier in all three modes and checks the resulting spoken text.

### F-2-8 — Chunk-size behavior is not covered by a visitor-facing claim test (reopens review-1 B2)

**Exact quote/location:** Landing reader controls: **“Choose syntax tokens,
word groups, or whole lines.”**

**Evidence:** The extension test saves line mode, while an untagged unit test
checks chunking. No listed claim test observes all three modes in the product.

**Why this fails:** The visible promise concerns output, not persistence alone.

**Concrete fix:** Add a chunk-mode claim and tagged loaded-extension test that
selects the same multiline sample in each mode and checks the visible sequence.

### F-2-9 — Pronunciation overrides are not covered by a visitor-facing claim test (reopens review-1 B2)

**Exact quote/location:** Landing reader controls: **“Add pronunciations for
project names and acronyms.”**

**Evidence:** The extension test stores `HTTP → H T T P`; it never reads `HTTP`
and observes the override. The behavior is covered only by an untagged unit
test.

**Why this fails:** Saving a dictionary row does not prove it changes reading.

**Concrete fix:** Add a pronunciation-override claim and tagged loaded-extension
test that adds an override, reads matching code, and checks the spoken form.

### F-2-10 — Route headers remain inconsistent (reopens review-1 M3)

**Exact location:** Live header links differ by route:

| Route | Header links |
| --- | --- |
| `/` | Demo · How it works · Privacy |
| `/demo/` | Home · Privacy · Terms |
| `/privacy/`, `/terms/` | Demo · How it works · Privacy |
| `/404/` | Demo · Privacy · Terms |

On the legal routes, **“How it works”** links to `/`, not `/#how`, so its label
does not name the destination it opens. Source inspection confirms these are
different hard-coded header structures. Footers are now consistent.

**Why this fails:** The prior M3 required one compact header structure across
landing, demo, legal, and 404 routes. The repair handoff marks that work
complete, but it is only half-fixed. This review's history rule makes any
unfixed earlier finding blocking.

**Concrete fix:** Use the same navigation on every route and point **How it
works** to `/#how`. Add a route matrix test that asserts the same labels and
destinations on all five documents.

## Minor findings

### F-2-11 — Privacy, Terms, and 404 have incomplete social metadata

**Exact location:** Live `/privacy/` and `/terms/` omit `og:url` plus
`twitter:title`, `twitter:description`, and `twitter:image`. `/404/` also omits
those Twitter fields and omits `og:type` and `og:url`.

**Why this matters:** Shared deep links do not carry the complete route-specific
preview required by the site-structure contract. The current static test checks
only that `twitter:card` exists, so it misses the absent fields.

**Concrete fix:** Add the missing route-specific fields and make the metadata
test assert the full required field set and values on every route.

### F-2-12 — Navigation does not move or restore focus as specified

**Exact location:** Selecting the home-page **Privacy** link left
`document.activeElement` on `BODY` after `/privacy/` loaded. Browser Back also
left focus on `BODY`. There is no route-change announcement region.

**Why this matters:** A keyboard or screen-reader visitor receives no explicit
focus or polite announcement for the new route, despite the routing contract.

**Concrete fix:** On internal route entry, move focus to the route's `h1` when
navigation came from the site, announce its text in an `aria-live="polite"`
region, and add forward/back focus tests.

### F-2-13 — One concept has three public names

**Exact quotes:** **“one piece at a time”**, **“short parts”**, **“CURRENT
CHUNK”**, and README **“one syntax chunk at a time.”**

**Why this matters:** “Piece,” “part,” and “chunk” refer to the same reading
unit. Switching terms makes a new user wonder whether they are different modes.

**Concrete rewrite:** Use **part** throughout: “Read selected code one part at
a time,” “Current part,” “Replay this part,” and “one syntax part at a time.”

### F-2-14 — The theme button does not name its result

**Exact quote/location:** Header button: **“Ink mode”** (or **“Paper mode”**
after activation).

**Why this matters:** The visible noun label does not say what selecting it will
do. The hidden accessible name is clearer, so sighted and screen-reader users
receive different copy.

**Concrete rewrite:** Show **“Use dark theme”** and **“Use light theme”** as the
visible and accessible labels.

### F-2-15 — Replay does not name what will replay

**Exact quote/location:** Landing and demo reader button: **“Replay.”**

**Why this matters:** The button is a verb, but it does not name its result when
read outside the surrounding panel.

**Concrete rewrite:** **“Replay this part.”**

### F-2-16 — Previous and next controls are noun labels, not result-naming actions

**Exact quote/location:** Reader arrow accessible names: **“Previous chunk”**
and **“Next chunk.”**

**Why this matters:** The labels identify positions rather than the action.

**Concrete rewrite:** **“Show previous part”** and **“Show next part.”**

### F-2-17 — “Shape identifiers” is an isolated jargon heading

**Exact quote/location:** Landing reader-controls label: **“Shape
identifiers.”**

**Why this matters:** As a heading or screen-reader list item, “shape” does not
plainly describe splitting a code name for speech.

**Concrete rewrite:** **“Split code names.”**

### F-2-18 — “Hold one chunk” does not explain the control

**Exact quote/location:** Landing reader-controls label: **“Hold one chunk.”**

**Why this matters:** The phrase does not make sense out of context and does not
name the syntax-token, word-group, or whole-line choice below it.

**Concrete rewrite:** **“Choose the amount to show.”**

## Copy audit

Counts use whitespace-separated visible tokens. Every visible landing-page
copy unit is included, including headings, controls, labels, repeated facts,
alt text, and footer text. No unit exceeds 22 words. No banned marketing word
appears. Flags map to findings above.

### Landing page

| Words | Copy | Flag |
| ---: | --- | --- |
| 4 | Skip to main content | — |
| 2 | Code Echo | — |
| 1 | Demo | — |
| 3 | How it works | — |
| 1 | Privacy | — |
| 2 | Ink mode | F-2-14 |
| 4 | 01 Code reading support | — |
| 8 | Read selected code one piece at a time | F-2-13 |
| 11 | For developers and learners who lose their place in unfamiliar code. | — |
| 5 | Try it with sample code | — |
| 9 | Opens a working reader with a realistic code selection. | — |
| 3 | Free core reader. | F-2-2 |
| 5 | Code stays on your device. | — |
| 4 | Works offline after setup. | — |
| 4 | Download the Chrome extension | — |
| 14 | Torn strips of punctuation converge into one yellow reading strip inside a dark frame. | — |
| 9 | One selection becomes one speakable piece at a time. | F-2-13 |
| 3 | FREE CORE READER | F-2-2 |
| 5 | CODE STAYS ON YOUR DEVICE | — |
| 4 | WORKS OFFLINE AFTER SETUP | — |
| 3 | 02 Sample reader | — |
| 7 | Read a sample line in short parts | F-2-13 |
| 8 | Try a code selection before installing the extension. | — |
| 2 | Sample selection | — |
| 2 | Rate 0.9× | — |
| 3 | Read this selection | — |
| 2 | CURRENT CHUNK | F-2-13 |
| 3 | — / — | — |
| 4 | Select “Read this selection” | — |
| 5 | The spoken form appears here. | — |
| 2 | Previous chunk | F-2-13, F-2-16 |
| 1 | Replay | F-2-15 |
| 2 | Next chunk | F-2-13, F-2-16 |
| 1 | Ready. | — |
| 7 | 03 Use it on a code page | — |
| 9 | Read selected code on the page you are using | — |
| 2 | Select code | — |
| 6 | Choose a line, token, or identifier. | — |
| 3 | Open the reader | — |
| 9 | Press Alt Shift E or use the context menu. | F-2-4 |
| 3 | Replay a chunk | F-2-13 |
| 9 | Use R in the tray or Ctrl Shift Y. | F-2-5 |
| 3 | 04 Reader controls | — |
| 6 | Choose how code looks and sounds | — |
| 10 | Set the support that helps you read a difficult line. | — |
| 2 | Speak punctuation | — |
| 9 | Choose marks such as braces, dots, arrows, and commas. | F-2-6 |
| 2 | Shape identifiers | F-2-17 |
| 9 | Split camelCase and snake_case, read as written, or spell. | F-2-7 |
| 3 | Hold one chunk | F-2-13, F-2-18 |
| 8 | Choose syntax tokens, word groups, or whole lines. | F-2-8 |
| 3 | Use code names | — |
| 7 | Add pronunciations for project names and acronyms. | F-2-9 |
| 3 | LOCAL ≠ UPLOAD | —; decorative and hidden from assistive technology |
| 2 | 05 Privacy | — |
| 5 | Code stays on your device | — |
| 9 | The sample reader has no account or upload step. | F-2-3 |
| 8 | Browser speech settings may use a voice provider. | —; necessary risk disclosure |
| 4 | Read the privacy policy | — |
| 4 | 06 Install the extension | — |
| 5 | Install Code Echo in Chrome | — |
| 6 | Download and unzip the Chrome package. | — |
| 7 | Open chrome://extensions and turn on Developer mode. | — |
| 8 | Choose “Load unpacked,” then select the unzipped folder. | — |
| 3 | Download Code Echo | — |
| 2 | Code Echo | — |
| 7 | A selective code reader for unfamiliar syntax. | — |
| 1 | Privacy | — |
| 1 | Terms | — |
| 16 | Built by Param Factory · build 1.0.1 · Original hero artwork generated on 27 August 2026. | — |

### README

The URL is counted as one token. Commands and headings are included because a
first-time contributor must also understand them. No unit exceeds 22 words;
the terminology flag is the only plain-words issue.

| Words | Copy | Flag |
| ---: | --- | --- |
| 2 | Code Echo | — |
| 13 | Code Echo is a Chrome extension for developers and learners reading unfamiliar code. | — |
| 10 | It reads selected code one syntax chunk at a time. | F-2-13 |
| 6 | Try the isolated sample at `/demo/?demo=1`. | — |
| 19 | It starts with a JavaScript selection and has a banner, reset action, and route back to the real product. | F-2-1: exit is tested manually but does not discard data |
| 7 | The sample uses only `demo:code-echo:` localStorage keys. | — |
| 7 | The extension opens selected code with `Alt+Shift+E`. | — |
| 7 | It replays the latest selection with `Ctrl+Shift+Y`. | — |
| 1 | Run | — |
| 2 | `npm ci` | — |
| 3 | `npm run dev` | — |
| 3 | `npm run dev:site` | — |
| 8 | Load `.output/chrome-mv3` in `chrome://extensions` with Developer mode on. | — |
| 3 | Verify and build | — |
| 2 | `npm test` | — |
| 3 | `npm run typecheck` | — |
| 3 | `npm run build` | — |
| 3 | `npm run test:e2e` | — |
| 9 | The project pins Playwright 1.58.2 for the supplied browser. | — |
| 7 | Every visitor-facing claim is listed in `.factory/claims.json`. | F-2-2–F-2-9 |
| 7 | Run each listed command after a build. | — |
| 21 | The browser tests use `/demo/?demo=1` from a clean context and cover reader chunks, isolation, local-only requests, offline reload, and extension shortcuts. | F-2-1, F-2-4–F-2-9: coverage is incomplete |
| 1 | Deploy | — |
| 6 | Deploy `dist/site/` as the static site. | — |
| 3 | Privacy and terms | — |
| 4 | Read Privacy and Terms. | — |
| 1 | License | — |
| 1 | MIT. | — |
| 2 | See LICENSE. | — |

## Demo, privacy, and offline evidence

- One click from `/` opened `/demo/?demo=1` on `const`, `Says: const`, and
  `1 / 13`; the sample is a realistic `parseHTTPResponse` JavaScript line.
- The demo banner, **Reset demo**, and **Start for real** were visible. Reset
  restored the default sample and removed demo-prefixed keys while preserving a
  seeded real key. F-2-1 records the separate exit failure.
- The complete live landing-to-demo exercise made same-origin requests only.
  No selected code appeared in request URLs or bodies.
- `@claim:offline-reload` reloaded the controlled demo offline and advanced the
  reader successfully.

## Claim test results from a clean clone

Fresh clone: `/tmp/code-echo-review2.OQulu8` at base commit
`d69e1354e676f75eec0f6fbe7a83102d7e0fe7c1`.

| Claim | Command | Result |
| --- | --- | --- |
| `chunk-reader` | `npm run test:e2e -- --grep @claim:chunk-reader` | PASS, 1 test |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS, 1 test; incomplete exit coverage in F-2-1 |
| `no-code-upload` | `npm run test:e2e -- --grep @claim:no-code-upload` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `extension-controls` | `npm run test:e2e -- --grep @claim:extension-controls` | PASS, 1 test; does not cover F-2-4–F-2-9 |

The full clean-clone verification also passed: `npm test` (16 tests),
`npm run typecheck`, `npm run build` (created `dist/site/` and the extension
package), and `npm run test:e2e` (15 tests).

## History verification

| Earlier finding | Live and code result |
| --- | --- |
| B1, no isolated one-click demo | **Reopened as F-2-1.** Direct entry, initial sample, banner, reset, and namespace isolation work; exit does not discard sample data. |
| B2, claims contract absent | **Reopened as F-2-2–F-2-9.** The contract and five passing tests now exist, but several visible claims remain unlisted or only test settings persistence. |
| B3, clean-clone E2E launch failure | **Fixed.** Playwright 1.58.2 is pinned; all 15 E2E tests pass in the clean clone. |
| B4, routes and metadata incomplete | **Fixed for the exact prior scope.** `/demo/` is real, an unknown URL returns the styled document with HTTP 404, and home metadata is complete. F-2-11 is a new per-route metadata gap. |
| M1, vague headings/action | **Fixed.** All five quoted phrases are absent and the sample action is explicit. |
| M2, four units over 22 words | **Fixed.** Those units were removed or rewritten; this audit has no over-cap unit. |
| M3, inconsistent headers/footers | **Reopened as F-2-10.** Footers match; headers do not. |

The prior handoff's “no known blocking findings” statement is not confirmed
because F-2-1 through F-2-10 remain.

## Structure, accessibility, links, and identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 each have `lang`,
  one `h1`, a `main`, a route-specific title, description, canonical URL,
  favicon, touch icon, and local assets. F-2-11 records missing social fields.
- An unknown URL returned HTTP 404 with the designed workbench page and working
  Home/Demo links. `robots.txt`, `sitemap.xml`, CSP, referrer policy,
  permissions policy, and MIME configuration are present.
- The live link crawl returned 200 for every product link and download;
  `mailto:` links were exempt. No dead link was found. F-2-10 records the
  mislabeled legal-page destination.
- Live axe scans at 390 px found no serious or critical violations on all five
  routes. The factory URL verifier found no console errors on `/`, `/demo/`,
  `/privacy/`, or `/terms/`. Focus, touch targets, contrast, reduced motion,
  landmarks, labels, and mobile overflow otherwise meet the checked baseline.
- The risograph paper, offset ink, marked reading strip, serif/monospace pair,
  and generated original art match `.factory/design.md`. The site is visually
  distinct and is not a generic SaaS template.
- First-load site JavaScript is 2.35 KB gzip in the clean build, below the
  150 KB limit.

## Missed leverage

No AI addition is justified. The brief calls for deterministic, local reading,
and model use would weaken the privacy and offline job. The product already has
custom pronunciations, replay, and optional browser sync; no missing import,
export, or sync path is obvious enough to add as a finding in this round.

## What would make this perfect

Nothing may remain for a PASS. Discard demo keys on exit, map every visible
claim to an outcome-level tagged test, make route headers and destinations
identical, complete per-route social metadata, restore/announce route focus,
and apply the listed copy rewrites. Then rerun the cold-read, demo-exit,
clean-clone claim, link, metadata, focus, axe, and full-suite checks from
scratch.
