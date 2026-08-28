# Adversarial first-read review 1 — Code Echo

**Verdict: FAIL**

Reviewed 2026-08-28 against `https://code-echo.sociobot.in` in fresh Chromium
contexts at 390×844 and 1440×900. No product source files were changed.

## Cold first read

Before scrolling on a phone, I understood the likely function as: select a
hard-to-read piece of code and have it read in smaller parts. I could not
identify the intended user from the first screen: it names neither dyslexic
developers nor learners. The primary action, **“Download for Chrome”**, starts a
manual preview-build installation, not a low-risk first use. The only try
action, **“Try the reading rhythm”**, sounds like a scroll effect, not sample
data.

This is blocking. The exact text that fails the three-question test is:

- “**Keep your place. Hear the tricky bit.**” — it does not say the job or who
  it is for.
- “**A reading layer for code**” — it identifies a medium but not a user or a
  concrete outcome.
- “**Download for Chrome**” and “**Try the reading rhythm**” — neither says a
  sample will open or what will happen after the click.

Required first-screen replacement:

> **Read selected code one piece at a time**
>
> For developers and learners who lose their place in unfamiliar code.
>
> **Try it with sample code** — opens a working reader with a realistic code
> selection. Free core reader. Code stays on your device. Works offline after
> setup.

## Blocking findings

### B1 — No one-click, isolated sample-data demo

**Evidence.** `/demo` returns the landing document (HTTP 200), and visiting
`/?demo=1` leaves the normal page unchanged. In a fresh mobile context it had
no “Demo — sample data, nothing is saved” banner, no **Reset demo**, no **Start
for real**, and showed `Select “Read this selection”` with `— / —`. Clicking
“Try the reading rhythm” changed only the hash to `#try-it`; the reader still
showed that empty prompt. A second click on **Read this selection** was required
to reach `const`, `Says: const`, and `1 / 13`.

**Why this loses or misleads a first-time visitor.** The landing page asks for
a download before showing the core job. “Try” does not enter a demo, and the
URL that catalog users and verifiers are meant to use is not a demo mode. The
visitor cannot tell whether changes are temporary or real settings.

**Required fix.** Make `/demo` and `?demo=1` load a reader already operating on
an opinionated sample, with the first chunk visibly selected and its spoken form
shown. Put a persistent banner on it: “Demo — sample data, nothing is saved”,
plus **Reset demo** and **Start for real**. Use a separate `demo:` storage
namespace, document it in `.factory/demo.md`, and test direct entry, visible
first result, reset, and proof that real storage is unread and unwritten.

### B2 — Claims contract absent; all visitor-facing claims are unlisted

**Evidence.** `.factory/claims.json` does not exist. `rg '@claim:'` finds no
tagged claim test. There was therefore no listed claim command to run from the
clean clone and no one-test-per-claim mapping.

Every claim-capable statement in the complete copy audit below is an
independently unlisted-claim finding. These are the required observable tests
(or the text must be removed or qualified):

| Claim group | Required tagged sandbox test |
| --- | --- |
| Parser, chunks, speech, and feature bullets | `@claim:chunk-reader` opens `/demo`, checks a realistic sample's first visual and spoken chunk, advances it, and compares demo/parser output with the extension. Add a tagged extension test for each context-menu, shortcut, setting, and replay promise. |
| “NO CODE UPLOADS”, “Nothing leaves this page”, local storage, analytics, and content-script network claims | `@claim:no-code-upload` intercepts the full demo and extension-reading flow, asserts no request contains selected text, and permits only declared origins. `@claim:local-storage` inspects separate demo and real namespaces before and after reset. |
| “WORKS OFFLINE” and offline states | `@claim:offline-reload` opens the demo, sets the context offline, reloads, and asserts the sample reader remains usable. |
| Price, free reader, pack restore, checkout, and refund claims | Do not offer unavailable checkout. Otherwise add isolated license-state tests that assert the stated price and each restore/revocation outcome. |
| README build, privacy, billing, and extension assertions | Add exactly one tagged clean-sandbox test for each † assertion; remove statements that cannot be observed. |

**Why this loses or misleads a first-time visitor.** “Works offline”, “no code
uploads”, storage, price, and shortcut promises are safety and purchasing
claims. The product supplies no reviewable evidence that they hold, including
in the purported demo.

### B3 — Clean-clone end-to-end suite fails before testing the product

**Evidence.** In a fresh clone, `npm ci`, `npm test`, and `npm run build`
passed. `npm run test:e2e` failed all 11 tests at browser launch:

> `Executable doesn't exist at /opt/pw-browsers/chromium-1234/...`

The repository permits `@playwright/test` `^1.62.1`, while the supplied browser
is Playwright 1.58 / Chromium 1208. No assertion ran.

**Why this loses or misleads a first-time visitor.** The README says the suite
checks a real loaded extension, mobile layout, and offline states. In a clean
review environment it verifies none of them.

**Required fix.** Pin Playwright to the factory-supplied version, or install the
matching browser as a reproducible prerequisite. Run `npm run test:e2e`
successfully from a clean clone, then tag the relevant tests for B2.

### B4 — Required routes and metadata are incomplete; the 404 is the home page

**Evidence.** `/not-a-real-page` returns HTTP 200 and the landing `<h1>`, not a
designed 404. `/demo` likewise returns the landing document. The landing has a
title, description, favicon, language, h1, and main landmark, but no canonical
link, Open Graph fields, Twitter card metadata, or apple-touch icon. Its title,
“Code Echo — keep your place in unfamiliar code”, does not plainly say it reads
selected code.

**Why this loses or misleads a first-time visitor.** Shared links get no useful
preview, mistyped/deep links silently show unrelated content, and the verifier
URL `/demo` is not what it says it is.

**Required fix.** Add a real `/demo` and a styled 404 with platform 404 handling
and a Home link. Add canonical, OG and Twitter title/description/image, an
180px apple-touch icon, and the title **“Code Echo — reads selected code aloud”**.

## Minor findings

### M1 — Plain-language headings and the secondary action are vague

“Dense line in. One chunk at a time.”, “Support on demand, then out of the
way.”, “No font folklore. Real controls.”, “Preset the fiddly names.”, and
“Try the reading rhythm.” use metaphor or insider wording. Replace them with
“Read a sample line in short parts”; “Read selected code on the page you are
using”; “Choose how code looks and sounds”; “Use common code name
pronunciations”; and **“Try it with sample code”**.

### M2 — Four copy units exceed the 22-word hard cap

| Location | Count | Quote | Proposed rewrite |
| --- | ---: | --- | --- |
| Landing footer | 24 | “Hero artwork was generated for Code Echo with the factory image model on 27 August 2026; no stock assets or third-party fonts are used.” | “Code Echo's hero artwork was generated on 27 August 2026. The site uses no stock art or third-party fonts.” |
| README intro | 26 | “Select a line or identifier on a documentation or code-review page; Code Echo shows one syntax chunk at a time and reads it with browser-native speech.” | “Select code on a documentation or review page. Code Echo shows short syntax chunks and reads the part you choose.” |
| README testing | 33 | “The end-to-end suite starts a local preview, runs axe against every public page and the extension popup, checks the on-page reader through a real loaded extension, and covers 390 px and offline states.” | “The end-to-end suite checks public pages and the extension popup. It covers the reader, 390 px layout, and offline reload.” |
| README paid unlock | 35 | “Hosted checkout is intentionally not advertised until the factory completes production product registration; the UI remains honest and supports pasted-license restore, daily cached verification, offline optimistic access after a valid check, and quiet revocation handling.” | Remove implementation detail until checkout exists; then state one verified behavior per sentence. |

### M3 — Header and footer are inconsistent across routes

The landing header has navigation; legal-route headers have only wordmark and
theme switch. Legal footers omit the product one-liner, counterpart legal link,
Param Factory attribution, and build identifier. Use the same compact structure
on landing, demo, legal, and 404 routes.

## Checks completed

- Fresh live mobile and desktop contexts: HTTP 200, no console errors, no
  horizontal overflow at 390 px. The risograph workbench treatment is distinct,
  not a generic SaaS template.
- Demo privacy exercise: after the two-click preview flow, `localStorage` was
  empty and all observed requests were same-origin. This is not accepted as
  demo isolation because no demo mode, namespace, banner, reset, or real-data
  boundary exists.
- Offline exercise: after a first online load and service-worker control,
  offline reload returned HTTP 200 and retained the landing h1. This supports
  the behavior but remains an unlisted claim.
- Link crawl: `/`, `/privacy/`, `/terms/`, ZIP download, favicon, manifest, and
  external Source returned 200. `/not-a-real-page` incorrectly returned the
  home document with 200.
- Manual axe scans at 390 px: no violations on `/`, `/privacy/`, or `/terms/`.
- Clean clone: `npm test` passed (17 tests); `npm run build` passed and created
  `dist/site`; `npm run test:e2e` failed at browser launch as B3 documents.


## Complete copy audit

Counts use whitespace-separated visible tokens. Atomic copy units include headings, labels, buttons, and prose; sentences within a unit are represented as printed.

### Landing page

| Element | Words | Copy |
| --- | ---: | --- |
| A | 4 | Skip to main content |
| A | 2 | []Code Echo |
| A | 3 | How it works |
| A | 1 | Privacy |
| A | 2 | Echo Pack |
| BUTTON | 2 | ◐Ink mode |
| P | 6 | 01 A reading layer for code |
| H1 | 3 | Keep your place. |
| H1 | 4 | Hear the tricky bit. |
| P | 7 | Select an unfamiliar identifier or punctuation-heavy line. |
| P | 15 | Code Echo separates it into visible syntax chunks and reads exactly the parts you choose. |
| A | 4 | Download for Chrome ↓ |
| A | 4 | Try the reading rhythm |
| P | 1 | 0 |
| FIGCAPTION | 10 | ↳ One selection becomes one speakable piece at a time. |
| P | 4 | 02 Try the rhythm |
| H2 | 3 | Dense line in. |
| H2 | 5 | One chunk at a time. |
| P | 10 | This preview uses the same deterministic parser as the extension. |
| P | 8 | Speech comes from your browser or operating system. |
| LABEL | 2 | Sample selection |
| LABEL | 1 | 9× |
| BUTTON | 3 | Read this selection |
| P | 5 | The spoken form appears here. |
| BUTTON | 1 | ← |
| BUTTON | 1 | Replay |
| BUTTON | 1 | → |
| P | 1 | Ready. |
| P | 4 | Nothing leaves this page. |
| P | 5 | 03 On any code page |
| H2 | 8 | Support on demand, then out of the way. |
| LI | 13 | 1Select the sticky partA line, token, or identifier on documentation and review pages. |
| LI | 10 | 2Press Alt Shift EThe reading tray opens beside your place. |
| LI | 5 | The context menu works too. |
| LI | 16 | 3Replay without huntingPress R inside the tray or Ctrl Shift Y anywhere for your latest selection. |
| P | 5 | 04 Your reading, your rules |
| H2 | 3 | No font folklore. |
| H2 | 2 | Real controls. |
| P | 6 | Dyslexia is not one visual preference. |
| P | 10 | Adjust the support you want and leave the rest alone. |
| LI | 10 | Speak punctuationChoose each mark: braces, dots, arrows, commas, or none. |
| LI | 10 | Shape identifiersSplit camelCase and snake_case, say as written, or spell. |
| LI | 15 | Hold one chunkChoose syntax token, word group, or whole line and set 18–32 px type. |
| LI | 10 | Save local overridesTeach the reader your project names and acronyms. |
| P | 5 | 05 Privacy is the architecture |
| H2 | 6 | Your code is not our input. |
| P | 10 | Parsing, preferences, and ten-item replay history live in the extension. |
| P | 10 | Code Echo has no analytics and no server for snippets. |
| P | 22 | Web Speech uses a voice supplied by your browser or operating system; depending on those settings, that provider may process spoken text. |
| A | 5 | Read the plain-language privacy policy |
| P | 4 | 06 Optional Echo Pack |
| H2 | 4 | Preset the fiddly names. |
| P | 3 | US$9 one-time purchase |
| LI | 4 | JavaScript + TypeScript pronunciations |
| LI | 5 | Python “dunder” and common terms |
| LI | 4 | Git and code-review shorthand |
| LI | 6 | Optional settings sync through your browser |
| P | 13 | The full reader, custom pronunciation dictionary, visual controls, replay, and history stay free. |
| P | 4 | Checkout is being prepared. |
| P | 14 | The full free reader is available now; existing licenses can still be restored below. |
| P | 2 | One-time license. |
| P | 6 | Sociobot/Dodo is the merchant of record. |
| P | 4 | Refunds revoke the license. |
| H3 | 2 | Already purchased? |
| P | 9 | Paste a license to verify it on this browser. |
| P | 11 | Then paste the same license in the extension to install packs. |
| LABEL | 2 | License token |
| BUTTON | 2 | Verify license |
| P | 3 | Privacy · Terms |
| A | 1 | Privacy |
| A | 1 | Terms |
| P | 5 | 07 Install the preview build |
| H2 | 4 | Three steps, no account. |
| LI | 6 | Download and unzip the Chrome package. |
| LI | 7 | Open chrome://extensions and turn on Developer mode. |
| LI | 8 | Choose “Load unpacked,” then select the unzipped folder. |
| A | 1 | 0 |
| A | 2 | []Code Echo |
| P | 12 | A selective code reader, not a diagnosis or a general screen reader. |
| A | 1 | Privacy |
| A | 1 | Terms |
| A | 1 | Source |
| P | 24 | Hero artwork was generated for Code Echo with the factory image model on 27 August 2026; no stock assets or third-party fonts are used. |
### README

| Words | Copy |
| ---: | --- |
| 2 | Code Echo |
| 21 | Code Echo is a local-first Chrome extension for dyslexic developers, learners, and anyone who wants selective support while reading unfamiliar code. |
| 26 | Select a line or identifier on a documentation or code-review page; Code Echo shows one syntax chunk at a time and reads it with browser-native speech. |
| 7 | The reader is deterministic rather than AI-powered. |
| 8 | It does not explain, generate, or upload code. |
| 3 | What v1 includes |
| 8 | Selection chip, context-menu action, and `Alt+Shift+E` keyboard command |
| 7 | Syntax token, word group, or whole-line chunking |
| 7 | Per-mark punctuation controls and three identifier-reading modes |
| 9 | Adjustable speech rate, volume, chunk size, and paper/night/high-contrast themes |
| 7 | Local pronunciation dictionary and ten-item replay history |
| 9 | `R` in the reading tray or `Ctrl+Shift+Y` to replay |
| 7 | Clear empty, unavailable-speech, restricted-page, and offline states |
| 15 | Optional US$9 Echo Pack with JavaScript/TypeScript, Python, and Git presets plus opt-in Chrome settings sync |
| 10 | Static product site, interactive parser preview, privacy policy, and terms |
| 12 | Selected text, preferences, pronunciation overrides, and history stay in Chrome extension storage. |
| 20 | Web Speech is supplied by the browser or operating system and may use its configured speech provider; see the privacy policy. |
| 1 | Requirements |
| 4 | Node.js 22 or newer |
| 4 | npm 10 or newer |
| 8 | Current Chromium-based browser for loading the packaged extension |
| 1 | Develop |
| 7 | WXT writes development artifacts to `.output/`. |
| 9 | Load `.output/chrome-mv3` from `chrome://extensions` with Developer mode enabled. |
| 3 | Test and build |
| 9 | The reproducible production command is exactly `npm run build`. |
| 2 | It creates: |
| 3 | `.output/chrome-mv3/` — unpacked MV3 extension |
| 4 | `.output/code-echo-1.0.0-chrome.zip` — packaged extension |
| 4 | `dist/site/index.html` — static deploy root |
| 5 | `dist/site/downloads/code-echo-chrome.zip` — stable site download URL |
| 17 | `npm run build:site` also builds and stages the extension package so it works from a clean clone. |
| 16 | The factory deploys `dist/site`; this repository does not modify infrastructure, DNS, billing registration, or production configuration. |
| 33 | The end-to-end suite starts a local preview, runs axe against every public page and the extension popup, checks the on-page reader through a real loaded extension, and covers 390 px and offline states. |
| 14 | Install Chromium once with `npx playwright install chromium` if it is not already available. |
| 1 | Architecture |
| 9 | `entrypoints/` — WXT background, content, and popup entry points |
| 12 | `lib/reader.ts` — deterministic chunking and pronunciation logic shared by the extension and site demo |
| 6 | `lib/storage.ts` — Chrome local/sync storage helpers |
| 12 | `site/` — Vite static site, legal pages, service worker, and optimized art |
| 9 | `assets/src/` — generated source art and exact provenance prompts |
| 9 | `tests/` — reader behavior and static accessibility/privacy contract checks |
| 8 | `.factory/` — source brief, product-specific design thesis, and handoff |
| 2 | Paid unlock |
| 17 | The website and popup use the production Sociobot billing API and the `code-echo` slug for license verification. |
| 35 | Hosted checkout is intentionally not advertised until the factory completes production product registration; the UI remains honest and supports pasted-license restore, daily cached verification, offline optimistic access after a valid check, and quiet revocation handling. |
| 5 | No payment provider is embedded. |
| 3 | Privacy and security |
| 15 | There are no analytics, advertising scripts, CDN fonts, or third-party runtime dependencies on the site. |
| 10 | Extension host access is limited to the Sociobot license-verification API. |
| 20 | The content script runs on pages so it can read the user’s explicit selection; it never performs a network request. |
| 1 | License |
| 1 | MIT. |
| 2 | See [LICENSE](LICENSE). |
