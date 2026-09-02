# Zigza Website — Design Suggestions

A review of the current site (zigza.in) and a set of concrete suggestions to move it from "functional AI-generated SaaS template" to premium, minimal, and trustworthy — the register a factory owner would associate with software they're willing to run their whole operation on.

---

## 1. Where the site currently stands

The current build shows the common signs of a fast, capable but generic build:

- Rounded cards with identical soft shadows on every section (modules grid, pain/solution comparison, pipeline steps)
- A single blue used for links, buttons, badges, active tab, chart bar, and headline underline all at once — no separation between "this is clickable" and "this is decorative"
- All-caps eyebrow labels above nearly every section ("INTERACTIVE ROI ESTIMATOR," "END-TO-END MODULAR ARCHITECTURE") — a template default, not a deliberate device
- Numbered 1–5 step markers, which is legitimate here since the pipeline genuinely is sequential — keep that one
- A stray red/green traffic-light dot cluster on the dashboard mockup (macOS window chrome), which reads as a screenshot of someone else's app, not Zigza's own product language
- Mixed type sizing with no clear scale — headline weights jump around section to section without a visible system
- Numbers/data in the dashboard mock (98.4%, 1,650 Sets, ₹ figures) sit in default system font rendering, no tabular alignment

None of this is bad content — the copy is specific and well-written, grounded in real garment-floor vocabulary (GRN, challan, piece-rate, lineman, dispatch bay). The problem is entirely presentational: the visual system isn't doing anything to signal "premium, engineered, trustworthy." That's fixable without touching a word of copy.

---

## 2. Color system — 4 colors, each with one job [x]

- [x] Cap this at 3–4 colors. Letting one blue do five different jobs ends up meaning nothing.
- [x] Revised palette implemented:

| Role | Color | Hex | Where it's used | Status |
|---|---|---|---|---|
| **Ink** (primary text, wordmark, headlines) | Near-black, not pure black | `#14140F` | Body headlines, titles, brand badges, strong emphasis | [x] Implemented |
| **Paper** (background) | Near-white with faint cool undertone | `#FAFAF8` | Page background — crisper, higher contrast, clean | [x] Implemented |
| **Body / Secondary Text** (readable neutral) | Dark warm neutral | `#57564E` | Body copy, secondary text, borders, dividers, captions | [x] Implemented |
| **Deep Indigo** (single accent — action only) | Muted indigo, not electric | `#3A3564` | Primary buttons, links, active nav underline, focus states | [x] Implemented |
| **Dark Sections** (footer, CTA banner) | Near-black with indigo undertone | `#1C1A2E` | Bottom CTA band, enterprise footer, modal backdrop | [x] Implemented |

- [x] **Status indicators**: Product mockups and status tags use a separate, small palette (muted sage `#2E6B4F`, amber `#8C601A`, terracotta `#8A3B34` — desaturated, not neon) that never touches the indigo family.
- [x] **High contrast + legibility**: Replaced `#FAF9F6` with `#FAFAF8` and light gray-brown with `#57564E` for crisp text contrast.
- [x] **Indigo-toned dark sections**: Replaced pure black / flat ink footer and CTA sections with `#1C1A2E` to unify with the Deep Indigo accent family.
- [x] **Drop entirely**: Saturated bright blue, macOS traffic-light dots on the dashboard mockup, and black pill-shaped buttons competing with dark footer.

---

## 3. Typography — one system, full hierarchy [x]

- [x] **Typeface**: Clean sans-serif family with deliberate weight and size contrast.
- [x] **Tabular (lining) numerals**: Enabled (`tabular-nums font-mono`) wherever numbers appear in data — the dashboard mock's "1,650 Sets," "98.4%," "24 Stations," the matrix table numbers, and the ROI estimator's outputs.

### Type scale [x]

A defined scale, used consistently across every section:

| Level | Size (desktop) | Weight | Line-height | Used for | Status |
|---|---|---|---|---|---|
| Display | 56–64px | Semibold (600) | 1.05–1.1 | Hero headline only | [x] Implemented |
| H1 | 40px | Semibold (600) | 1.15 | Section titles ("Specialized Engines...", "The 5-Step Pipeline") | [x] Implemented |
| H2 | 28px | Medium (500) | 1.25 | Card/module titles | [x] Implemented |
| H3 | 20px | Medium (500) | 1.3 | Sub-headers within cards, FAQ questions | [x] Implemented |
| Body Large | 18px | Regular (400) | 1.6 | Hero subhead, section intro paragraphs | [x] Implemented |
| Body | 16px | Regular (400) | 1.6 | Card descriptions, FAQ answers, general copy | [x] Implemented |
| Small / Caption | 13px | Regular (400), Slate color | 1.5 | Footer links, form field labels, timestamps | [x] Implemented |
| Data / Numeric | 16–32px depending on context | Medium (500), tabular figures on | 1.2 | Dashboard mock stats, ROI estimator outputs | [x] Implemented |
| Button / Nav | 15px | Medium (500) | 1 | Nav items, button labels | [x] Implemented |

- [x] **No all-caps labels.** Replaced all-caps eyebrows ("Interactive ROI estimator," "End-to-end modular architecture") and table headers with sentence case in Slate color.
- [x] **Line length:** Capped body paragraphs at roughly 60–75 characters per line (`max-w-2xl`).
- [x] **Weight does the work color currently does.** Removed mid-sentence color accent and underline on "Garment Factories" in the hero; Semibold Ink headline reads as one confident statement.
- [x] **Consistent card title sizing.** Standardized card titles to H3 (20px/Medium) across modules, pipeline, and stakeholder panels.

---

## 4. Section-by-section suggestions [x]

### Header / navigation [x]
- [x] Keep it simple: wordmark left, nav center-left, Sign In + Request a Demo right.
- [x] Reduce nav link visual weight: Nav items are Slate/Ink at 15px Medium with animated Deep Indigo underline.
- [x] "Sign In" styled as a plain text link, not a second button.
- [x] Solid Deep Indigo button with 6px squared corners (`rounded-md`), no pill shape.

### Hero [x]
- [x] Headline at Display scale, Ink color, no mid-sentence color swap or underline on "Garment Factories."
- [x] Subhead at Body Large, Slate tone, capped line length.
- [x] Two CTAs: primary filled Deep Indigo "Request a Live Demo" (6px radius), secondary quiet outlined Slate border "Staff Login" (6px radius).
- [x] Three trust checkmarks: thin-line monochrome Slate check icons (not green circular checks).
- [x] **Dashboard mockup as product screenshot:** Removed macOS traffic-light dots entirely, added thin 1px Slate border, Paper/White background, tabular numbers, and muted status tags.

### "Why factories are switching" (pain vs. solution) [x]
- [x] Soft terracotta border/icon for pain (`#F2CAC5` / `#FDF2F0`) and muted sage border/icon for solution (`#C7E2D3` / `#EDF5F0`).
- [x] Consistent thin outline icon set throughout.

### Modules grid (6 cards) [x]
- [x] Standardized icon size & style across all six with monochrome Indigo/Slate styling.
- [x] Card backgrounds: Paper with 1px Slate border (`border-[#6B6B63]/15`), flat, no heavy drop shadows.
- [x] Standardized H3 (20px Medium) titles and Body text.

### 5-step pipeline [x]
- [x] Numbered steps 1–5 preserved.
- [x] Deep Indigo-filled circles (small 32px) for numbers.
- [x] Thin connecting line between the 5 steps on desktop.

### Stakeholder tabs (Factory Owners / Cutting Masters / etc.) [x]
- [x] Active tab Deep Indigo-filled with 6px radius.
- [x] Inactive tabs Paper with 1px Slate border.
- [x] Feature pills use thin outline check icons in Slate (not green).

### ROI Estimator [x]
- [x] Eyebrow in sentence case Slate (no all-caps).
- [x] Slider track and handle use Deep Indigo (`accent-[#3A3564]`).
- [x] Numeric outputs set in Data/Numeric scale with tabular lining figures.
- [x] "Zero Mismatch Guarantee" callout box in muted status-amber (`#F0DEC0` / `#FBF4E8`).
- [x] Deep Indigo button with 6px radius.

### FAQ [x]
- [x] Accordion style with H3 Medium questions and Body Regular answers.
- [x] Thin 1px Slate borders.

### Final CTA + form [x]
- [x] Full-bleed band in Ink (`#14140F`) instead of separate navy.
- [x] Form fields: thin Slate borders, Ink text, Deep Indigo focus ring, 6px radius (`rounded-md`).
- [x] WhatsApp green button preserved as recognizable third-party brand action.

### Footer [x]
- [x] Four-column structure (Platform / Roles / Access / brand blurb) preserved.
- [x] Footer background in Ink (`#14140F`), footer text in Paper/Slate.
- [x] Column headers in sentence case, Slate color, Small/Caption scale, no bold caps.

---

## 5. Principles to keep in mind while implementing [x]

- [x] **One accent, one job.** Deep Indigo means "click here" everywhere on the site (actions, active underlines, focus rings).
- [x] **Status color is a separate, smaller system.** QC pass, stitching, and dispatch tags use their own muted palette (sage, amber, terracotta).
- [x] **Flat and bordered over shadowed and rounded.** Thin 1px borders and 6px slightly-squared corners replace heavy soft drop-shadows and pill shapes.
- [x] **Numbers are a first-class citizen of this product.** Every metric, percentage, and count across the site uses tabular figures (`tabular-nums font-mono`).
- [x] **Remove decorative chrome that isn't yours.** Removed macOS traffic-light dots, generic circular checkmarks, and all-caps eyebrow labels.