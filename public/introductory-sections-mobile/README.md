# Zigza Manufacturing Landing Page — Mobile Viewport (390px) Visual & Typography Report

This folder contains high-resolution (2x Retina scale) visual captures of every section of the **Zigza Introductory Site** rendered in **Mobile Device Viewport (390 × 844 px — iPhone / Pixel standard)** along with mobile responsive typography, touch targets, and visual layout specifications.

---

## 📱 Mobile Viewport Specifications

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Viewport Dimensions** | `390px × 844px` | Standard mobile form factor (iPhone 14 / Pixel 7) |
| **Device Scale Factor** | `2x` | Crystal-clear Retina capture with crisp typography |
| **Touch Interaction** | Enabled | Tested for minimum 44px touch targets |
| **Primary Background** | `#FAF7F0` | Warm parchment canvas (consistent with desktop) |
| **Alternate Section Bg**| `#FFFFFF` | Pure white canvas for Workflow and Pricing |
| **Footer Background** | `#FDFBF7` | Soft warm ivory with single-column responsive flow |

---

## 📸 Mobile Section-by-Section Visual & Typographic Specification

### 00. Complete Mobile Landing Page Stitch
* **File**: `00_full_mobile_introductory_landing_page.png`
* **Description**: Complete top-to-bottom visual scroll of the entire mobile landing page.

---

### 01. Intro & Hero Section (Mobile)
* **File**: `01_intro_and_hero_section.png`
* **Layout & Typography**:
  * **Top Header**: Zigza brand logo + mobile hamburger toggle button with smooth opening drawer.
  * **H1 Headline**: `text-4xl font-bold tracking-tight text-[#14140F] leading-[1.08]` with warm orange underline accent.
  * **Hero Subtitle**: `text-[17px] text-[#3D3C36] leading-relaxed font-normal` (clean 2-line flow without awkward word drops).
  * **Action Buttons**: Full-width stacked buttons (`w-full py-3.5 rounded-xl text-[15.5px]`):
    * Primary: Deep Indigo `#3A3564` ("Request a Live Demo")
    * Secondary: White with `#14140F]/30` border and subtle hover tint ("Staff Login to Portal")
  * **3 Key Benefit Pointers**: Vertically stacked with `#3A3564` checkmarks (`text-sm font-medium text-[#3D3C36]`).
  * **Live Floor MES Table**: 
    * Horizontally scrollable if needed with hidden scrollbars (`[scrollbar-width:none]`).
    * Full visibility of live cutting lots, operator wages, and piece counters.

---

### 02. Traditional Chaos vs. Zigza Digital Solution (Mobile)
* **File**: `02_problem_vs_solution_section.png`
* **Layout & Typography**:
  * **Single Column Vertical Flow**: Traditional Challenges card stacked above Zigza Digital Solution card.
  * **Traditional Paper Friction Card**: 2px solid `#FB7185` (Rose-400) border with 4 pain points (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * **Zigza Digital System Card**: 2px solid `#10B981` (Emerald-500) border with 4 solutions (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * Note: Handwritten pencil sticky notes automatically hidden on mobile screens (`hidden xl:flex`) to prevent mobile viewport overflow.

---

### 03. 6 Core Modular Engines (Mobile)
* **File**: `03_operating_modules_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900 tracking-tight`.
  * **6 Vertically Stacked Module Cards**:
    * Clean white card backgrounds with `border-slate-200` borders and 24px padding.
    * Card Titles: `text-lg font-bold text-slate-900`.
    * Seam Accent: Full-width `#3A3564` 2.5px seam line indicator.
    * Audit Checklist: `text-[14.5px] text-slate-700 leading-relaxed` with `#3A3564` check icons.

---

### 04. The 8-Step Synchronized Factory Pipeline (Mobile)
* **File**: `04_floor_workflow_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900`.
  * **8 Interactive Step Cards (Vertical Sequence 01 to 08)**:
    * Number Badges: `w-8 h-8 rounded-full font-mono font-bold text-xs` (`bg-[#FAF7F0] text-[#3A3564]` / active: `bg-[#3A3564] text-white`).
    * Step Titles: `text-[16.5px] font-bold text-slate-900`.
    * Step Descriptions: `text-sm text-slate-700 leading-relaxed font-normal`.
    * Tap to activate with smooth active card highlight and 360-degree spin badge animation.

---

### 05. Trusted Across India's Garment Hubs & Map (Mobile)
* **File**: `05_roles_and_network_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900 leading-[1.15]`.
  * **4 Trust Pillars**:
    * 2px dotted `border-black/60` rounded cards with outline icon badges (`#FAF7F0` bg).
    * Titles: `text-[17px] font-bold text-slate-900`.
    * Descriptions: `text-[14.5px] text-slate-700 leading-relaxed`.
  * **Central Map Graphic**:
    * Responsive Pan-India outline vector map centered with tailor and dispatch parcel illustrations.

---

### 06. Predictable Subscription Plans & Pricing (Mobile)
* **File**: `06_pricing_and_roi_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900`.
  * **3 Vertically Stacked Pricing Tiers**:
    1. **Modular Floor**: `₹1,999/mo` (`text-4xl font-extrabold font-mono text-slate-900`).
    2. **Full Access + Zigza AI** *(Highlighted Tier)*: `₹4,999/mo` (`text-4xl font-extrabold font-mono text-[#3A3564]`, `#FAF7F0` bg with 2px solid `#3A3564` border).
    3. **Custom Engineering**: `Custom` (`text-4xl font-extrabold font-mono text-slate-900`).
  * **Punchy Feature Checklist**: `text-[14.5px] text-slate-800` with high-contrast emerald checkmarks.
  * **Full-Width Action Buttons**: Easy touch targets for quick mobile demo scheduling.

---

### 07. Frequently Asked Questions (FAQ) (Mobile)
* **File**: `07_faq_section.png`
* **Layout & Typography**:
  * **Accordion Cards**: Clean white boxes with full-width touch areas.
  * **Question Headers**: `text-base font-bold text-slate-900`.
  * **Answers**: `text-sm text-slate-700 leading-relaxed font-normal`.
  * **Chevron Micro-animations**: Smooth 180-degree rotation on tap.

---

### 08. Contact Us & Plant Consultation Window (Mobile)
* **File**: `08_contact_and_query_section.png`
* **Layout & Typography**:
  * **Direct WhatsApp & Phone Access**: Tap-to-call and tap-to-WhatsApp direct links with `#1F9D63` branding.
  * **Mobile Form**:
    * Generic clean placeholders: `placeholder="Enter your name"`, `placeholder="Enter company / factory name"`, `placeholder="Enter your query or message..."`.
    * Phone Input: Dedicated `+91` prefix badge with 10-digit mobile number validation.
    * Send Query Button: Full-width `#3A3564` action button.

---

### 09. Enterprise Footer with Social Handles (Mobile)
* **File**: `09_footer_section.png`
* **Layout & Typography**:
  * **Mobile Flow**: Brand information stacked cleanly above Navigation columns.
  * **Platform & Access Lists**: Touch-friendly line heights with `text-[14.5px]` typography.
  * **Social Handles Column**:
    * **Instagram**: Pure black outline camera icon
    * **LinkedIn**: Clean standalone `i` and `n` outline icon
    * **Twitter / X**: Pure black outline X icon
    * **Facebook**: Pure black outline lowercase `f` icon
    * Encased in `w-8 h-8 rounded-lg border border-black/35 bg-transparent` outline badges.
  * **Bottom Bar**: Proudly Made in India badge with Indian flag SVG + copyright & legal links.

---

## 🎯 Mobile Usability & Ergonomics Standards

1. **Zero Text Truncation**: No forced ellipsis or cut-off labels on 390px viewports.
2. **Accessible Touch Targets**: All buttons, accordion headers, and social links are sized at `>=44px` height for effortless thumb tapping.
3. **High Contrast on Budget Screens**: Deep `#0F172A` / `#334155` text maintains high contrast on non-OLED and budget Android displays.
4. **No Horizontal Body Overflow**: `overflow-x: hidden` enforced globally with clean responsive containers.
