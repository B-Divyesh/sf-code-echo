# Code Echo visual thesis

## Direction: the marked-up workbench

Code Echo uses a **risograph tactile collage** rather than a polished developer-dashboard aesthetic. The product is about slowing a dense line down, circling one piece, and hearing it again. Its interface therefore borrows from an annotated workshop sheet: warm paper, imperfect ink registration, torn code strips, crop marks, and a single movable reading window. Decoration always explains the reading model—many marks become one held chunk.

The extension UI stays quieter than the marketing site. Its chunk reader is a dark ink tray with a yellow focus slip. Controls feel like labelled physical tools, not floating glass. The page overlay is deliberately compact so it preserves the user's place.

## Palette

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| paper / background | `#F4EBD8` | `#171512` | warm reading field |
| sheet / surface | `#FFF9EC` | `#24201B` | raised paper |
| ink / text | `#211D19` | `#FFF7E8` | primary text |
| muted ink | `#625A50` | `#C9BEAD` | secondary copy |
| echo blue | `#155C73` | `#72CDE0` | interactive accent |
| signal coral | `#C33E32` | `#FF877C` | attention and spoken state |
| marker yellow | `#F4C542` | `#F4C542` | current syntax chunk |
| success | `#17643C` | `#68D391` | verified / saved |
| danger | `#9F2923` | `#FF9B91` | invalid / failed |

Body and control text maintain at least 4.5:1 contrast. Yellow is never used as text on paper and status is always paired with words or an icon. A user-selectable high-contrast mode removes texture and uses black, white, and yellow.

## Type

- **Editorial/display:** Georgia, Charter, `Times New Roman`, serif. It gives the site the human, printed tone of an annotated reference book.
- **Code/UI:** `SFMono-Regular`, Consolas, `Liberation Mono`, monospace. It keeps punctuation unambiguous and does not claim one font is universally “dyslexia friendly.”
- No third-party fonts. Body text is at least 16 px with 1.55 leading; reading chunks start at 22 px. The type control offers 18–32 px rather than imposing a single answer.

Scale: 14 (metadata), 16 (body), 20 (section), 32 (subhead), clamp 44–72 (hero). Spacing follows a 4/8 px rhythm with 16, 24, 32, 48, 72, and 96 px as the main intervals.

## Shape and interaction grammar

- Sheets use 2 px ink rules and 2–5 px offset “misregistration” shadows instead of generic card shadows.
- Buttons are rectangular labels with 10 px corners, a 2 px rule, and a 2 px pressed translation.
- The active chunk is the only yellow reading strip. Previous and next fragments recede as torn-edge slips.
- Focus is a 3 px blue ring with a 3 px paper offset. Touch targets are at least 44×44 px.
- Empty states show an outlined selection bracket; errors show the same bracket broken once, never an alarming modal.

## Motion policy

The chunk strip advances 18 px from the reading direction while fading over 180 ms. Opening the on-page tray scales from the selected text's lower edge over 220 ms. Buttons translate by 2 px on press. Nothing loops. Under `prefers-reduced-motion: reduce`, all movement is removed and chunk changes use an instantaneous ink-color change. Speech is never autoplayed without an explicit selection/command.

## Responsive intent

At 390 px the hero collage moves below the primary download action, secondary navigation collapses to the footer, and comparisons stack. The extension popup is designed at 360 px and never requires horizontal scrolling. On-page controls wrap below the chunk instead of covering page content.

## Asset plan and provenance

### Hero collage

Use case: `stylized-concept`. A wide editorial risograph still life of code-reading aids: layered torn paper strips containing abstract punctuation-like marks, a dark reading window framing one yellow strip, blue and coral soy-ink overlaps, registration dots, pencil guide marks, and fibrous paper grain. The illustration must not contain legible words, logos, brands, people, or a fake product UI. It supports the landing-page explanation that Code Echo turns a dense selection into one speakable piece.

Prompt:

> Wide landing-page hero illustration in a tactile two-pass risograph collage. Warm recycled paper background; layered torn paper code strips with abstract brackets, underscores, dots, and camel-hump marks; a dark navy-black reading window isolates one marker-yellow strip; imperfect teal-blue and vermilion ink registration, halftone grain, small crop marks, pencil guide arrows. Editorial still life, handmade print texture, confident negative space, no gradients. No readable text, no letters forming words, no logos, no watermarks, no brands, no people, no screens, no photorealism.

Generated with the factory image deployment through `/opt/fleet/lib/gen-image.sh`, 2026-08-27. The generated image is original to this product and is disclosed in the site footer. Source PNG and the exact prompt sidecar live under `assets/src/`; optimized AVIF/WebP derivatives live under `site/public/assets/`.

`site/public/assets/code-echo-social.jpg` is a reviewed 1200×630 crop of that
same original hero asset for social metadata; it adds no new subject matter.

### Authored graphics

The Echo bracket mark, punctuation chips, arrows, texture overlays, and extension icons are hand-authored SVG/CSS for Code Echo. They use only geometric primitives and contain no third-party assets.

## Non-goals

No neon gradients, rounded SaaS dashboards, stock developer photography, “brain” symbolism, medical claims, or a novelty font pitch. The reader supports individual preferences; it does not prescribe them.
