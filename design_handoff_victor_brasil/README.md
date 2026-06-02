# Handoff: Victor Brasil — Personal Site (Photography + Engineering CV + Journal)

## Overview
A single-page personal site for **Victor Brasil — Photographer & Engineer**. A quiet, editorial landing page leads into four areas: a **Photography** gallery (albums + recents), an **Engineering** CV, a **Journal** (blog), and a **Contact** page. There is also a small "now playing / last played" element that links out to Spotify. The whole thing is a warm, gallery-quiet, technically-precise aesthetic (Apple-beige + espresso-brown + the classic Mac six-color rainbow used sparingly).

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-CDN** — a working prototype that shows the intended look, layout, copy, and interactions. **They are not meant to be shipped as-is.** They use React loaded from a CDN with in-browser Babel compilation (fine for a prototype, not for production).

**Your task:** recreate these designs in a real, production codebase. Recommended target is a static-site build (e.g. **Vite + React**, **Next.js**, or **Astro**) deployed to **Cloudflare Pages / Vercel / Netlify**, but use whatever fits. Lift the exact tokens, layout, and copy from the prototype; replace the CDN/Babel runtime with a real build, and replace the placeholder images with real photos.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final and intentional. Recreate the UI faithfully. The striped boxes are **honest placeholders** for real photos — they tell you where images go and at what aspect ratio; swap in real images.

---

## Design Tokens

### Colors (the "house style", from `landing/house.jsx` → `HOUSE`)
| Token | Hex | Use |
|---|---|---|
| `paper` | `#efe7d6` | Page background (warm apple beige) |
| `panel` | `#e7ddc7` | Slightly deeper panel beige |
| card surface | `#f5efe1` | Cards / pills (lighter than paper) |
| `ink` | `#191307` | Primary text (near-black espresso) |
| `ink2` | `#574733` | Secondary text (brown) |
| `brown` | `#7a5638` | Mid brown |
| `mocha` | `#6f4b34` | Mocha-brown accent — used on small mono labels/eyebrows |
| `muted` | `#8c8168` | Warm gray-tan (de-emphasized labels) |
| `line` | `rgba(25,19,7,0.16)` | Hairline borders |
| `lineHi` | `rgba(25,19,7,0.55)` | Stronger hairline |

### Mac rainbow accent (`apple`, from `directions/shared.jsx` → `FILM.apple`)
Order = classic Apple logo (green, yellow, orange, red, purple, blue):
`['#5f8a3e', '#e0ad38', '#d6822c', '#bf4a30', '#7a5a9e', '#3f73a0']`
Used **sparingly** as punctuation: the brand stripe by the wordmark, the rule under the masthead, section accent dots, album/journal accents, card top-spines, and the animated wordmark.

### Typography
| Role | Family | Notes |
|---|---|---|
| Display / wordmark / section titles | **Newsreader** (serif), weight 500 | Google Font |
| UI / body | **Archivo** (grotesk), 400–700 | Google Font |
| Metadata / labels | **Space Mono**, 400/700 | Uppercase, letter-spacing ~0.1–0.42em |
| Cursive (wordmark animation only) | **Sacramento** | Google Font |
| Retro display (wordmark animation only) | **Baloo 2**, weight 800 | Rounded; evokes the 1981 Apple wordmark |

Google Fonts import (already in the HTML `<head>`):
`Archivo:wght@400;500;600;700 · Baloo+2:wght@700;800 · Space+Mono:wght@400;700 · Sacramento · Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400`

### Spacing / radius
- Page horizontal padding: **40px** desktop, **20px** mobile (≤760px).
- Card radius **8px**, pills **999px**, small media **4–6px**.
- Card top color-spine: **3px** solid (the section's accent color).
- Hairline dividers everywhere (`line`); section under-title rules use 1–2px.

---

## Global Chrome

### Top nav (`SiteApp` → `Nav`)
- Sticky, `rgba(239,231,214,0.86)` + `backdrop-filter: blur(10px)`, bottom hairline.
- **Left:** the six-color stripe chip (6 bars, 3px wide, 14px tall) + `VICTOR BRASIL` in Space Mono 12.5px, weight 700, letter-spacing 0.16em. Clicking returns home.
- **Right:** nav links `PHOTOGRAPHY · ENGINEERING · JOURNAL · CONTACT` (Space Mono 11.5px). Active link = `ink` with a 2px bottom border; inactive = `muted`.
- Mobile: wraps; links shrink to 10px, gap 13px.

### Footer (`Footer`)
- Top hairline. Left: `VICTOR@BRASIL.PHOTO` (mono 11px, muted). Center: the rainbow stripe. Right: `© 2026`.

---

## Screens / Views

State lives in `SiteApp`: `view` (`home | photography | engineering | journal | contact`), `photoNav` (`hub | recents | albums | album:<id>`), `journalNav` (`null | <index>`). Every view change scrolls to top.

### 1. Home (`Home`)
- Vertically-centered hero on `paper`.
- **Animated wordmark** (see "Animated wordmark" below) + a small **kicker** above it: `PHOTOGRAPHER · ENGINEER`, Space Mono 10.5px, letter-spacing **0.42em**, color `mocha`, ~12px below it the wordmark. Under the wordmark: the rainbow rule (six bars).
- **Tagline:** Archivo 17px, `ink2`, max-width 460px, centered: *"I make pictures and systems — both about light, structure, and patience. Choose a way in."*
- **"Last played" pill** (links to Spotify, `target=_blank`): rounded pill, card surface, hairline border. Contents: a 30px round album-art placeholder (tinted red `#bf4a30`), `LAST PLAYED` (mono 9.5px, `mocha`), `Northern Drift · Glassbird` (Archivo 13.5px), a 3-bar animated equalizer (red), and `SPOTIFY ↗` (mono 9.5px, `mocha`). Hover: border → red, slight lift.
- **Three preview cards** in a responsive grid (`repeat(auto-fit, minmax(300px,1fr))`, gap 26, max-width 1140): **Photography**, **Engineering**, **Journal**. Each card: `#f5efe1`, hairline border, radius 8, 3px top spine in the card's accent (green / blue / orange), min-height 372, padding 24/26. Header row = serif title 27px + `ENTER →` (mono 10px, `mocha`; on hover gap widens and color → accent). Hover: lift 4px, shadow, border → accent.
  - **Photography preview:** 2×2 grid of photo placeholders + `117 FRAMES · 9 SERIES`.
  - **Engineering preview:** `CURRENTLY` (mono, `mocha`) → "Senior Software Engineer" (serif 23) / "Google · since 2021" → one line of body → skill chips (`Distributed Systems`, `Go`, `C++`, `Reliability`) as mono pills.
  - **Journal preview:** `LATEST · 2026.04.12` (mono, `mocha`) → latest post title (serif 23) → excerpt → genre tag `FIELD` (mono, orange).

### Animated wordmark (`landing/animated_name.jsx` → `AnimatedMasthead`)
The name **"Victor Brasil"** is rendered as a single inline **SVG** (not HTML text — SVG gives reliable gradient fills + a draw reveal). It cycles styles on a timer and returns to rest:
- **Phase 0 — Serif (rest, ~5s):** Newsreader 500, fill `ink`.
- **Phase 1 — Cursive rainbow draw (~4.4s):** Sacramento, filled with a **horizontal rainbow** linear-gradient (the `apple` colors), revealed left→right via an animated `clipPath` rect (a `requestAnimationFrame` grows the rect width over ~1.8s, ease-out). I.e. it "draws itself in."
- **Phase 2 — Retro stripes (~3s):** Baloo 2 (800), filled with a **vertical 6-band hard-stop** gradient of the `apple` colors (the 1981 striped-Apple look, no logo).
- Layers cross-fade via opacity (0.6s). Sizing is responsive via the SVG `viewBox` + a `max-width` on the `<svg>`.
- **Implementation notes for production:** SVG `<text>` does not reflow when a web font loads late — ensure Sacramento/Baloo are loaded before first paint (preload, or gate render on `document.fonts.ready`). In the prototype the cursive text is remounted (`key`) on phase change to force re-layout with the loaded font. Respect `prefers-reduced-motion` (hold the serif, skip the cycle).

### 2. Photography (`landing/photography.jsx` → `PhotoFlow`)
Section header: green accent dot + `GALLERY` kicker (`mocha`) + "Photography" (serif 52) + right-aligned intro. Body is a mini-router on `photoNav`:
- **Hub (`hub`):** two side-by-side panes (`vb-twopane`, 1fr/1fr, gap 26; stack on mobile). Each pane: card surface, 3px green top-spine, a clickable header (serif 30 title + mono sub + `VIEW ALL →`).
  - **Recents pane:** 3-col grid of the **12 most recent** frames (all photos across albums, sorted by date desc). Each thumb links to its album.
  - **Albums pane:** 2-col grid of the **6 albums**, each album sorted by **last-updated** (newest photo date). Album cover = the album's **most-recent** photo. Card shows cover (4:3), name, `N · UPD <date>`.
- **Recents (`recents`):** breadcrumb `PHOTOGRAPHY / RECENTS`; 4-col grid of ALL frames newest-first, each with exposure + date; footer note about full-res RAW download per frame.
- **Albums (`albums`):** breadcrumb; 3-col grid of all albums sorted by last-updated, each with cover, name, places, frame count, `UPDATED <date>`.
- **Album detail (`album:<id>`):** breadcrumb `ALBUMS / <NAME>`; title + places + count; 4-col grid of that album's frames newest-first; "download full-res RAW per frame" note.
- Grids collapse to 2-col on mobile (`vb-grid4`, `vb-grid3`).

### 3. Engineering (`EngView`)
Blue accent. Section header `CURRICULUM`. A list of roles (from `VBDATA.cv`) as native `<details>` — click a row to expand its bullet list. Each summary row: serif role title (24) + org + date (mono) + a `+` in blue. First role open by default. Max-width 980.

### 4. Journal (`journalList` / `journalEntry`)
Orange accent. Section header `WRITING`.
- **List:** each entry is a clickable button row — grid `130px 1fr 120px`: date (mono, left), title (serif 26) + excerpt (Archivo 14.5) in the middle, genre tag (mono 10, orange) right. Hover: faint background + slides right 14px. Mobile grid `70px 1fr 60px`.
- **Entry (`journalEntry(idx)`):** `← ALL ENTRIES` back-link (mono, `mocha`) → date + genre (mono) → title (serif, clamp(30px,4.4vw,42px)) → italic dek → hairline → body paragraphs in **serif 18.5px, line-height 1.72** → `— VICTOR BRASIL` sign-off. Max-width 680.
- **Publishing model:** posts are plain data entries in `VBDATA.journal` (`[date, title, excerpt, genre, [body paragraphs]]`). For production, consider sourcing posts from Markdown/MDX files in a content folder so new posts are just a file drop — no backend/DB needed.

### 5. Contact (`ContactView`)
Purple accent. Section header `SAY HELLO`. A large serif `mailto:` link (`victor@brasil.photo`, clamp(30px,5vw,46px), purple underline) + a hairline list of social rows (grid `160px 1fr 24px`: label / handle / `↗`), each an external link with a hover background + slide. Rows: Instagram, GitHub, LinkedIn (the Email and Spotify entries are intentionally filtered OUT here — email is the big link above; Spotify lives on the home pill). Footer line: `BASED IN FRANKFURT · AVAILABLE WORLDWIDE`.

---

## Interactions & Behavior
- **Navigation** is in-page state (SPA). Wordmark/nav return home; cards and nav enter sections; breadcrumbs/back-links return.
- **Expandables:** CV roles and (in the prototype) use native `<details>`.
- **Hover states:** cards lift + accent border; `ENTER`/`VIEW ALL` arrows widen gap + recolor to accent; list rows tint + slide.
- **Animations:** wordmark cycle (above); equalizer bars (`@keyframes rotEq`, scaleY 0.3↔1, 0.9s loop); all opacity/transform transitions 0.15–0.7s.
- **Responsive:** ≤760px — reduce page padding to 20px, shrink nav, single-column the home cards and photography panes, 2-col the gallery grids, scale the masthead via the SVG.

## State Management
- `view`, `photoNav`, `journalNav` as above. No data fetching in the prototype — all content is static in `VBDATA`. In production, photography frames/albums and journal posts would come from content files or a CMS; CV is fine as static data.

## Assets
- **No real images** — all imagery is the `Ph` placeholder component (`directions/shared.jsx`): a diagonal-hatch box with corner ticks, a mono caption (place name), optional exposure/date, and an optional color `tint`. Replace each with a real photo at the same aspect ratio (gallery frames are 4:3; album covers 4:3; thumbnails square).
- **Photo hosting note:** display web-optimized AVIF/WebP (even 3–4k px looks great and loads fast); a "full-res RAW download" affordance is referenced per frame but storage is out of scope for v1.

## Files (in this bundle)
- `Victor Brasil.html` — entry point; loads fonts + the scripts below, mounts `<SiteApp/>`. Contains the global CSS (hover classes, `@keyframes`, mobile media query) in its `<style>`.
- `directions/shared.jsx` — `FILM` palette, `Ph` (placeholder), `Pops` (rainbow stripe).
- `landing/house.jsx` — `HOUSE` tokens, `VBMasthead`/`VBNav` (legacy helpers), and **`VBDATA`** (all content: photos, albums, cv, journal, socials).
- `landing/animated_name.jsx` — `AnimatedMasthead` (the SVG animated wordmark).
- `landing/photography.jsx` — `PhotoFlow` (gallery hub/recents/albums/detail).
- `landing/site_app.jsx` — `SiteApp` (nav, home, sections, contact, routing/state).

> Open `Victor Brasil.html` in a browser to see the live reference. Recreate it in your production stack using the tokens and specs above.
