# Zigza Manufacturing Landing Page — Visual & Typography Design System Report

This folder contains high-resolution (2x Retina scale) visual captures of every section of the **Zigza Introductory Site** along with the complete typography hierarchy, color palette, background specifications, and aesthetic design choices.

---

## 🎨 Global Design System & Palette

| Token / Asset | Value / Hex Code | Role / Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#FAF7F0` | Warm eggshell parchment background giving an artisanal, premium feel |
| **Alternate Section Bg**| `#FFFFFF` | Crisp pure white canvas for Workflow Pipeline and Pricing sections |
| **Footer Background** | `#FDFBF7` | Soft warm ivory background with top subtle divider |
| **Primary Brand Accent**| `#3A3564` | Deep royal purple-indigo for key highlights, active stages, and buttons |
| **Success / Sync Green**| `#10B981` / `#059669` / `#1F9D63` | Verified factory progress, digital roll logs, dispute-free wages |
| **Chaos / Alert Rose** | `#E11D48` / `#FB7185` | Traditional paper chaos callouts, defect flags, handwritten alerts |
| **Heading Typography** | `#0F172A` / `#1E293B` | High-contrast slate charcoal for maximum clarity across all ages |
| **Body Copy** | `#334155` / `#475569` | High-contrast slate-700 (14px–16px) for effortless legibility |
| **Outline Borders** | `#000000` / `#000000/60` | Crisp black outline aesthetic with dashed, dotted, and solid variants |
| **Pencil Font** | `Caveat`, cursive | Handcrafted floor annotations, notes, and callouts |
| **Monospace Font** | `JetBrains Mono` / `Courier` | Live timestamps, lot codes, prices, piece counts, and tags |

---

## 📸 Section-by-Section Visual & Typographic Specification

### 00. Complete Landing Page Overview
* **File**: `00_full_introductory_landing_page.png`
* **Description**: Full-page stitch from Top Navigation Bar down to the Enterprise Footer.

---

### 01. Intro & Hero Section
* **File**: `01_intro_and_hero_section.png`
* **Background**: `#FAF7F0` (Eggshell Canvas)
* **Key Enhancements**:
  * **Brand Pill**: `text-[13px] font-mono font-bold uppercase` (`#3A3564`)
  * **H1 Title**: `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]`
  * **Red Pencil Note**: `font-pencil text-[26px] 2xl:text-[32px] font-bold text-rose-600 -rotate-3` with hand-drawn arrow
  * **Hero Subtitle (Strict 2-Line Flow)**: `text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed font-normal max-w-3xl`
    * *Line 1*: *"Replace messy paper slips and endless calls with one simple system."*
    * *Line 2*: *"Get live order progress, cut fabric waste, and ship to buyers with zero panic."*
  * **3 Key Feature Badges (Strict 1-Line)**: `text-sm sm:text-[15px] font-semibold text-slate-900 bg-white border border-black/80 rounded-full px-4 py-2`
  * **Live Floor MES Mockup Table**:
    * Clean table with **0 horizontal scrollbars** (`[scrollbar-width:none] min-w-0 w-full`)
    * 14px–15px cell typography, live status badges, pulse indicators, and animated counter

---

### 02. Problem vs. Solution Section (Chaos to Real-Time Sync)
* **File**: `02_problem_vs_solution_section.png`
* **Background**: `#FAF7F0`
* **Typography & Styling**:
  * **Sticky Notes**: Red sad-face pencil note (`#E11D48`) vs. Green happy-face pencil note (`#059669`) with `font-pencil text-[28px] 2xl:text-[34px]`
  * **Traditional Challenges Card**: 2px solid `#FB7185` (Rose-400) border, `#FFFFFF` card background
    * Header: `text-xl sm:text-2xl font-bold text-slate-900`
    * 4 Pain Points: `text-base sm:text-[17px] font-bold text-slate-900` with `text-sm sm:text-[15px] text-slate-700` descriptions
  * **Zigza Digital Solution Card**: 2px solid `#10B981` (Emerald-500) border, `#FFFFFF` card background
    * Header: `text-xl sm:text-2xl font-bold text-slate-900`
    * 4 Solutions: `text-base sm:text-[17px] font-bold text-slate-900` with `text-sm sm:text-[15px] text-slate-700` descriptions

---

### 03. 6 Core Modular Engines
* **File**: `03_operating_modules_section.png`
* **Background**: `#FAF7F0`
* **Typography & Styling**:
  * **Section Heading**: `text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900`
  * **Subheading**: `text-base sm:text-lg text-slate-600`
  * **Engine Cards**: 6 responsive grid cards with hover elevation (`hover:border-black/70 hover:shadow-md`)
    * Card Titles: `text-lg sm:text-xl font-bold text-slate-900`
    * Expanding Seam Line: Expanding `#3A3564` stroke animation on hover
    * Features Checklist: `text-[14.5px] sm:text-[15.5px] text-slate-700 leading-relaxed`

---

### 04. The 8-Step Synchronized Factory Pipeline
* **File**: `04_floor_workflow_section.png`
* **Background**: `#FFFFFF` (Pure White with subtle border dividers)
* **Typography & Styling**:
  * **Connected Flow Roadmap**: Continuous vector lines connecting all 8 stages from Design (01) to Dispatch (08)
  * **Step Cards (Row 1: Stages 01–04 | Row 2: Stages 05–08)**:
    * Step Number Badges: `w-8 h-8 rounded-full font-mono font-bold text-xs sm:text-sm`
    * Step Titles: `text-[16.5px] sm:text-[17.5px] font-bold text-slate-900`
    * Step Micro-copy: `text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal`
    * Active State: Solid `#3A3564` 2px border, `#FAF7F0/40` background, 360-degree spin animation badge

---

### 05. Trusted Across India's Garment Hubs & Nationwide Map
* **File**: `05_roles_and_network_section.png`
* **Background**: `#FAF7F0`
* **Typography & Styling**:
  * **Left Column (4 Trust Pillars)**:
    * 2px dotted `border-black/60` outline cards
    * Outline Icon Badges: `#FAF7F0` background with `border-black/15`
    * Pillar Titles: `text-[17px] sm:text-lg font-bold text-slate-900`
    * Pillar Descriptions: `text-[14.5px] sm:text-[15.5px] text-slate-700 leading-relaxed`
  * **Right Column (Pan-India Manufacturing Network)**:
    * High-clarity Pan-India outline vector map (`/india_outline_map.png`)
    * Northern Stitching Line Operator illustration (`/illustrations/tailor.png`)
    * Warehouse Dispatch Logistics Parcel illustration (`/illustrations/parcel.png`)
    * Connecting dotted vector telemetry lines

---

### 06. Predictable Subscription Plans & Production Pricing
* **File**: `06_pricing_and_roi_section.png`
* **Background**: `#FFFFFF` (Pure White with `#57564E/15` border)
* **Typography & Styling**:
  * **3 Pricing Cards**:
    1. **Modular Floor**: `₹1,999/mo` (`text-4xl font-extrabold font-mono text-slate-900`)
    2. **Full Access + Zigza AI** *(Recommended Highlight)*: `₹4,999/mo` (`text-4xl font-extrabold font-mono text-[#3A3564]`, `#FAF7F0` card with 2px solid `#3A3564` border)
    3. **Custom Engineering**: `Custom` (`text-4xl font-extrabold font-mono text-slate-900`)
  * **Features List**: `text-[14.5px] sm:text-[15px]` with high-contrast emerald checkmarks
  * **CTA Buttons**: High-contrast, bold buttons with arrow icons

---

### 07. Frequently Asked Questions (FAQ)
* **File**: `07_faq_section.png`
* **Background**: `#FAF7F0`
* **Typography & Styling**:
  * **Accordion Cards**: Rounded white boxes with clean borders
  * **Question Headers**: `text-base sm:text-lg font-bold text-slate-900`
  * **Answer Explanations**: `text-sm sm:text-[15.5px] text-slate-700 leading-relaxed font-normal`
  * **Smooth Expand / Collapse**: Arrow rotate micro-animations

---

### 08. Direct Query & Plant Consultation Window
* **File**: `08_contact_and_query_section.png`
* **Background**: `#FAF7F0`
* **Typography & Styling**:
  * **Left Column**: Plant consultation info, WhatsApp direct link (`#1F9D63`), and phone support
  * **Right Column**: Interactive consultation query form
    * Input Labels: `text-sm font-bold text-slate-800`
    * Inputs & Selects: `text-sm sm:text-[15px] text-slate-900` with 12px rounded borders
    * Live duplicate phone/email validation feedback

---

### 09. Enterprise Footer
* **File**: `09_footer_section.png`
* **Background**: `#FDFBF7` (Soft Warm Ivory) with `border-t border-slate-200`
* **Typography & Layout**:
  * **5-Column Grid Layout**:
    * **Brand Column (Col 1 & 2)**: Zigza brand logo + garment factory mission copy
    * **Column 1 (`Platform`)**: Floor Modules, 8-Step Pipeline, Role Solutions, Subscription Plans, FAQs
    * **Column 2 (`Access & Support`)**: Staff Portal Sign In, Schedule Live Demo, 7-Day Free Trial, WhatsApp
    * **Column 3 (`Social Handles`)**: **Instagram**, **LinkedIn**, **Twitter / X**, **Facebook**
  * **Social Outline Icons (Zero Solid Fill)**:
    * Built as 100% stroke outline SVG components (`fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`)
    * **Instagram**: Squircle camera body with lens circle & flash pin
    * **LinkedIn**: Pure outline `'i'` (dot + stem) and `'n'` arch glyph
    * **Twitter / X**: Outlined thick diagonal bar with thin crossing stroke
    * **Facebook**: Classic Feather/Lucide lowercase `'f'` with crossbar
    * Encased in `w-8 h-8 rounded-lg border border-black/35 bg-transparent group-hover:border-black group-hover:bg-[#FAF7F0]` badges
  * **Bottom Bar**: "Proudly Made in India" badge with Indian flag SVG + copyright & policy links

---

## 🎯 Readability & Age 30+ Ergonomics Summary

1. **No Micro-Text**: All body copy, table cells, feature pointers, and descriptions are maintained at `>=14px` (typically `15px–16px`).
2. **Elevated Contrast**: Replaced low-contrast gray text (`#94A3B8`) with deep slate (`#334155` / `#0F172A`) for effortless reading on non-OLED/budget factory screens.
3. **No Horizontal Scrollbar**: Fixed table layout with responsive percentage column widths.
4. **Balanced Line Wrapping**: Hero description constrained to 2 balanced lines; feature badges stay on 1 single line.
5. **Clear Brand Identifiers**: High-contrast black outline social icons with zero solid fill matching the artisanal aesthetic.
