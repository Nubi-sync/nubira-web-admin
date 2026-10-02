# 📐 ZIGZA LANDING PAGE — DESKTOP UI DESIGN GUIDELINES & SPECIFICATION MANUAL

> **Purpose for AI & Developers**:  
> Whenever instructed to perform UI design, color styling, layout restructuring, typography hierarchy updates, or component enhancements on the **Zigza Introductory Landing Page** (`src/app/components/ZigzaLandingPageClient.tsx`), **STRICTLY adhere to the color architecture, typography scales, hierarchy rules, and section specifications documented in this manual.**

---

## 🎨 Global Design System & Color Palette

The Zigza marketing platform uses a high-contrast modern industrial design system optimized for executive clarity, manufacturing telemetry, and effortless legibility across all display types.

| Token / Asset | Hex Code / Value | Hierarchy Level | Role & Usage |
| :--- | :--- | :--- | :--- |
| **Deep Obsidian Navy** | `#0B1220` / `#162032` | **Level 1 (Core Structural Authority)** | Primary headlines (`h1`, `h2`), top navbar text, dark card surfaces, and modal title headers. **STRICTLY PROHIBITED for interactive buttons or active status pills.** |
| **Deep Royal Blue** | `#1D4ED8` | **Level 2 (Primary CTAs & Keyword Highlighter)** | **Primary Interactive Action Buttons across entire platform** (`bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold shadow-sm shadow-blue-500/20`), plus strategic keyword highlighting in headers. |
| **Electric Mint / Cyan** | `#14C8B4` | **Level 3 (Brand Accent & Active Tab Pills)** | **Active Tab / Status Filter Pills** (`bg-[#14C8B4] text-[#0B1220] font-bold shadow-2xs`), signature headline underlines (`decoration-[#14C8B4]`), live sync pulsing indicators, metric badges, button arrow icons, and verification checkmarks. |
| **Crisp White Secondary** | `#FFFFFF` / `border-slate-200` | **Level 3B (Secondary Action Buttons)** | **Secondary Interactive Action Buttons across entire platform** (`bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] border border-slate-200 shadow-2xs font-semibold rounded-xl`). |
| **Crisp Tech Canvas** | `#F8FAFC` / `#FFFFFF` | **Surface (Canvas)** | Ultra-clean tech canvas replacing warm parchment, maximizing dynamic range and preventing eye fatigue. |
| **Soft Mint Surface Wash** | `#F0FDFA` | **Surface (Accent Wash)** | Subtle 5% mint tint container background for active feature cards, status pills, and icon badges (`border-[#14C8B4]/30`). |
| **Slate Charcoal** | `#1E293B` / `#334155` / `#64748B` | **Level 4 (Body Copy & Subtitles)** | High-contrast body text (15px–16px), section subtitles, table values, and modal explanatory text. |
| **WhatsApp / Sync Green** | `#1F9D63` / `#10B981` | **Action (Communication)** | WhatsApp direct support CTA button, zero-dispute wage badges, and verified delivery timestamps. |
| **Friction / Alert Rose** | `#E11D48` / `#FB7185` | **Semantic (Alert / Chaos)** | Traditional paper friction callouts, defect flags, and handwritten warning annotations. |

---

## 🏛️ Color Hierarchy & Visual Influence Architecture

To maintain an authoritative interface without visual clutter, colors MUST follow strict hierarchy rules:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Deep Obsidian (#0B1220)       ── Primary Authority (Headings & Labels)   │
│ 2. Deep Royal Blue (#1D4ED8)      ── Primary CTAs & Header Terms             │
│ 3. Electric Mint / Cyan (#14C8B4) ── Active Tab Pills, Underlines & Pulses   │
│ 4. Crisp Tech White (Bordered)    ── Secondary Action Buttons (Sign In/Reset)│
│ 5. Slate Charcoal (#1E293B/#64748B) ── High-Legibility Subtitles & Body Copy │
│ 6. Crisp Tech Canvas (#F8FAFC)    ── Open, High-Contrast Surface Canvas     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Hierarchy Rules & Strategic Influence:

1. **Level 1 — Primary Structural Authority (`#0B1220`)**:
   * **Where to Apply**: `<h1>` and `<h2>` headline base text, top navigation brand text, and structural surfaces.
   * **STRICT PROHIBITION**: Never use solid `#0B1220` or `#162032` for interactive buttons or active filter pills.
   * **Visual Influence**: Sets an executive, trustworthy, and commanding tone that anchors data density.

2. **Level 2 — Primary Action CTAs & Keyword Highlighter (`#1D4ED8`)**:
   * **Where to Apply**: 
     * **ALL Primary Action Buttons**: Header actions (`+ Book New PO`, `+ Add Worker`), modal submission buttons, and hero CTAs (`bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold shadow-sm shadow-blue-500/20`).
     * **Header Keyword Highlights**: Key highlight words inside `<h1>`, `<h2>`, and `<h3>` headers (*"Garment Business"*, *"Zigza"*, *"Garment Factory"*, *"Synchronized Factory Pipeline"*).
   * **Visual Influence & Contrast**:
     * Strong chromatic visual capture (5.83:1 contrast ratio against white text). Instantly communicates primary interactivity.

3. **Level 3 — Dynamic Accent & Active Tab / Filter Pills (`#14C8B4`)**:
   * **Where to Apply**: 
     * **Active Filter / Status Tabs**: Selected tab pill state (`bg-[#14C8B4] text-[#0B1220] font-bold shadow-2xs`).
     * Underline decoration strokes (`decoration-[#14C8B4] decoration-4 underline-offset-8`), animated live floor sync pulses (`bg-[#14C8B4] animate-pulse`), CTA button arrow glyphs, and verification checkmark icons.
   * **Visual Influence**: High-speed automated data flow, precision cutting, and instantly identifiable active states.

4. **Level 3B — Secondary Action Buttons (Crisp White + Slate Border)**:
   * **Where to Apply**: Secondary actions like *"Sign In"*, *"Cancel"*, *"Reset Filters"*, *"Issue Challan"*, *"Record Counting"*.
   * **Styling**: `bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] border border-slate-200/80 shadow-2xs font-semibold rounded-xl`.

5. **Level 4 — Body Typography & Descriptions (`#64748B` / `#1E293B`)**:
   * **Where to Apply**: Subtitles (`text-slate-600`), module feature bullets, process descriptions, and FAQ answers.
   * **Visual Influence**: Clean, neutral reading experience that lets headings and badges guide the page flow.

---

## 🔤 Typography & Font Family Hierarchy

| Element | Font Family | Size & Weight | Line Height & Tracking | Typical Context |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Headline (`h1`)** | Plus Jakarta Sans / Inter | `text-[30px] sm:text-5xl lg:text-[58px]`<br>`font-bold` | `leading-[1.2] sm:leading-[1.08]`<br>`tracking-tight` | Main Hero Value Proposition |
| **Section Headings (`h2`)**| Plus Jakarta Sans / Inter | `text-3xl sm:text-4xl lg:text-5xl`<br>`font-bold` | `leading-tight`<br>`tracking-tight` | Section Titles (Modules, Pipeline, Pricing) |
| **Card & Modal Titles (`h3`)**| Plus Jakarta Sans / Inter | `text-xl sm:text-2xl`<br>`font-bold` | `leading-snug` | Feature Cards, Modal Dialogs |
| **Section Subtitles** | Public Sans / Inter | `text-base sm:text-lg lg:text-xl`<br>`font-normal` | `leading-relaxed` | Value Proposition Subtext (`text-slate-600`) |
| **Body Copy & Checklists** | Public Sans / Inter | `text-[14.5px] sm:text-[15.5px]`<br>`font-medium` | `leading-relaxed` | Feature descriptions, FAQ answers |
| **Data, SKUs & Counters** | JetBrains Mono | `text-xs sm:text-sm`<br>`font-bold tabular-nums` | `tracking-wide` | Batch numbers, roll weights, timestamps |
| **Floor Callouts / Notes** | Caveat (Handwritten) | `text-[26px] 2xl:text-[34px]`<br>`font-bold` | `leading-tight -rotate-3` | Pain-point sticky notes & floor callouts |

---

## 📸 Section-by-Section Visual & Typographic Specification

### 01. Intro & Hero Section
* **Background**: `#F8FAFC` (Crisp Tech Canvas)
* **Main Headline**: `text-[30px] sm:text-5xl lg:text-[58px] font-bold text-[#0B1220]`
  * Highlight: `<span class="text-[#1D4ED8] underline decoration-[#14C8B4] decoration-4 underline-offset-8">Garment Business</span>`
* **Subtitle (Strict 2-Line Flow)**: `text-[15px] sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto`
* **CTAs**:
  * Primary: Deep Royal Blue `#1D4ED8 hover:bg-[#1E40AF]` with white text and `#14C8B4` arrow icon (*"Request a Live Demo"*)
  * Secondary: Crisp White with `border border-slate-200/80` and `text-slate-700 hover:text-[#0B1220]` (*"Staff Login to Portal"*)
* **3 Benefit Pointers**: `text-sm sm:text-[14.5px] font-semibold text-slate-700` with `#14C8B4` checkmarks.

---

### 02. Problem vs. Solution Section (Traditional vs. Zigza)
* **Background**: `#FFFFFF` with `border-y border-slate-200/80`
* **Section Heading**: Why Garment Factories Are Switching from Paper to `<span class="text-[#1D4ED8]">Zigza</span>`
* **Handwritten Sticky Notes**: Red sad-face pencil note (`#E11D48`) vs Green happy-face note (`#059669`) with `font-pencil text-[28px] 2xl:text-[34px]`
* **Traditional Challenges Card**: 2px solid `#FB7185` (Rose-400) border, `#FFFFFF` card background.
* **Zigza Digital Solution Card**: 2px solid `#10B981` (Emerald-500) border, `#FFFFFF` card background.

---

### 03. 6 Core Modular Engines
* **Background**: `#F8FAFC`
* **Section Heading**: Everything You Need to Run Your `<span class="text-[#1D4ED8]">Garment Factory</span>`
* **Engine Cards**: 6 responsive grid cards with hover elevation (`hover:border-[#0B1220] hover:shadow-md`)
  * Icon Container: `#F0FDFA` background with `#14C8B4/30` border and `#0B1220` icon.
  * Card Titles: `text-lg sm:text-xl font-bold text-[#0B1220]`
  * Seam Accent: `#0B1220` line expanding into `#14C8B4` on hover.
  * Feature Checklist: `text-[14.5px] sm:text-[15.5px] text-slate-700 leading-relaxed` with `#14C8B4` check icons.

---

### 04. The 8-Step Synchronized Factory Pipeline
* **Background**: `#FFFFFF` with `border-y border-slate-200`
* **Section Heading**: The 8-Step `<span class="text-[#1D4ED8]">Synchronized Factory Pipeline</span>`
* **Roadmap Flow**: Connected timeline linking Stages 01 to 08 (CAD Tech Pack &rarr; Dispatch).
* **Step Cards**:
  * Step Number Badges: `w-8 h-8 rounded-full font-mono font-bold text-xs sm:text-sm`
  * Active State: `#0B1220` background, `#14C8B4` text, ring indicator, and spin badge.
  * Step Titles: `text-[16.5px] sm:text-[17.5px] font-bold text-slate-900`

---

### 05. Trusted Across India's Garment Hubs & Nationwide Map
* **Background**: `#F8FAFC`
* **Section Heading**: Trusted Across India's `<span class="text-[#1D4ED8]">Garment Hubs</span>`
* **Left Column (4 Trust Pillars)**:
  * 2px dotted `border-slate-300 hover:border-[#0B1220]` outline cards.
  * Outline Icon Badges: `#F0FDFA` background with `#14C8B4/30` border.
  * Pillar Titles: `text-[17px] sm:text-lg font-bold text-[#0B1220]`
* **Right Column (Manufacturing Network Map)**:
  * Pan-India vector map (`/india_outline_map.png`) with animated ping pulses and hub markers (Tirupur, Surat, Noida, Ludhiana, Bengaluru, Jaipur).

---

### 06. Predictable Subscription Plans & Production Pricing
* **Background**: `#FFFFFF`
* **Section Heading**: Predictable Plans for `<span class="text-[#1D4ED8]">Modern Plants</span>`
* **3 Pricing Cards**:
  1. **Modular Floor**: `₹1,999/mo` (`text-4xl font-extrabold font-mono text-[#0B1220]`)
  2. **Full Access + Zigza AI** *(Recommended)*: `₹4,999/mo` (`text-4xl font-extrabold font-mono text-[#0B1220]`, 2px `#0B1220` border, `#14C8B4` badge)
  3. **Custom Engineering**: `Custom` (`text-4xl font-extrabold font-mono text-[#0B1220]`)
* **Features List**: `text-[14.5px] sm:text-[15px] text-slate-700` with `#14C8B4` checkmarks.

---

### 07. Frequently Asked Questions (FAQ)
* **Background**: `#F8FAFC`
* **Section Heading**: Frequently Asked `<span class="text-[#1D4ED8]">Questions</span>`
* **Accordion Cards**: Rounded white boxes with clean borders (`border-slate-200 hover:border-[#0B1220]/40`).
* **Question Headers**: `text-base sm:text-lg font-bold text-[#0B1220]`
* **Answer Explanations**: `text-sm sm:text-[15.5px] text-slate-600 leading-relaxed font-normal`

---

### 08. Direct Query & Plant Consultation Window
* **Background**: `#F8FAFC`
* **Section Heading**: Have a Question? Talk With `<span class="text-[#1D4ED8]">Our Team</span>`
* **Left Column**: Plant consultation info, WhatsApp direct link (`#1F9D63`), and phone support.
* **Right Column**: Direct inquiry form with real-time validation and duplicate prevention feedback.

---

### 09. Enterprise Footer
* **Background**: `#0B1220` (Midnight Obsidian) with `#FFFFFF` and `slate-400` text.
* **Layout**: 5-column grid layout with Zigza brand logomark, platform module links, access portal links, and pure outline social icons.

---

## 🎯 Readability & Age 30+ Ergonomics Summary

1. **No Micro-Text**: All body copy, table cells, feature pointers, and descriptions are maintained at `>=14px` (typically `15px–16px`).
2. **Elevated Dynamic Range**: Replaced low-contrast gray text with deep obsidian (`#0B1220`) and slate (`#334155`) for effortless reading on non-OLED/budget factory displays.
3. **Keyword Focal Points**: Strategic `#1D4ED8` deep royal blue highlights guide fast scanning without creating cognitive overload.
4. **No Horizontal Scrollbar**: Fixed responsive table layout with percentage widths.
5. **Clear Brand Identifiers**: High-contrast outline icons, crisp telemetry accents, and unmistakable brand personality.
