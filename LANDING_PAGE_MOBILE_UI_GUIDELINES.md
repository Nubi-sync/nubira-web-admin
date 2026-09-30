# 📱 ZIGZA LANDING PAGE — MOBILE (390px) UI DESIGN & RESPONSIVENESS GUIDELINES

> **Purpose for AI & Developers**:  
> Whenever instructed to perform mobile UI design, viewport adjustments, mobile-responsive layout restructuring, touch target optimization, or mobile component styling for the **Zigza Introductory Landing Page** (`src/app/components/ZigzaLandingPageClient.tsx`), **STRICTLY adhere to the mobile specifications, component architectures, and ergonomics documented in this manual.**

---

## 📱 Mobile Viewport Specifications

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Target Viewport Dimensions** | `390px × 844px` | Standard modern mobile form factor (iPhone 14 / Pixel 7) |
| **Device Scale Factor** | `2x` | Crystal-clear Retina display rendering |
| **Touch Target Ergonomics** | Min `44px` height | All buttons, taps, accordion headers, and pill tabs |
| **Primary Canvas Background** | `#F8FAFC` | Crisp tech canvas |
| **Alternate Section Bg** | `#FFFFFF` | Pure white canvas for Workflow and Pricing |
| **Footer Background** | `#0B1220` | Midnight obsidian footer with high-contrast text |

---

## 🎨 Mobile Color Hierarchy & Application Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Deep Obsidian (#0B1220)       ── Mobile Headings & Full-Width CTA Buttons│
│ 2. Deep Royal Blue (#1D4ED8)      ── Highlighted Header Terms (No Wrapping)  │
│ 3. Electric Mint (#14C8B4)        ── Headline Underlines & Verified Checkmarks│
│ 4. Slate Charcoal (#64748B)       ── Subtitles & Concise 2-3 Line Flow       │
│ 5. Crisp Tech Canvas (#F8FAFC)    ── Clean Mobile Surface Background        │
└─────────────────────────────────────────────────────────────────────────────┘
```

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
  * **H1 Headline**: `text-[30px] sm:text-5xl lg:text-[58px] font-bold tracking-tight text-[#0B1220] leading-[1.2]` with **"Garment Business"** (`text-[#1D4ED8]`) locked to a single unbroken line with `#14C8B4` mint underline accent.
  * **Hero Subtitle**: `text-[15px] sm:text-xl text-slate-600 leading-relaxed font-normal` (concise 3-line flow preventing dense wrapping on 390px screens).
  * **Action Buttons**: Full-width stacked buttons (`w-full py-3.5 rounded-xl text-[15.5px]`):
    * Primary: Deep Obsidian `#0B1220` ("Request a Live Demo") with `#14C8B4` arrow icon
    * Secondary: White with `#0B1220` text, 2px border ("Staff Login to Portal")
  * **3 Key Benefit Pointers**: Vertically stacked with `#14C8B4` checkmarks (`text-sm font-semibold text-slate-700`).
  * **Pure Black Outline Smartphone Mockup**: 
    * Sleek black outline phone chassis (`border-[3px] border-slate-900 rounded-[36px] bg-white p-2.5 shadow-xl`) and top camera notch pill.
    * Native Phone Status Row: `09:41` clock on left, cellular signal bars + **WiFi icon** + battery icon on right.
    * **In-Phone Brand Header**: Centered **Zigza brand logo** (`/z i g z a (8).png`) sized proportionally (`h-7`) right above the station tabs.
    * 3 Segmented Station Touch Tabs: `Cutting`, `Sewing`, and `QC & Pack`.
    * 2 High-Impact KPI Cards: Active batch / lot and live pieces cut with dynamic animated count-up.
    * Real-Time Vertical Activity Feed: 3 vertical cards with zero horizontal overflow, showing bundle tags, piece wages, and carton audit checkpoints.
    * **Modern 3-Button Android Navigation Bar**: Modern chevron Back (`<`), centered Home (`○`), and rounded-square Recents (`□`) with balanced widescreen spacing and breathing room.

---

### 02. Traditional Chaos vs. Zigza Digital Solution (Mobile)
* **File**: `02_problem_vs_solution_section.png`
* **Layout & Typography**:
  * **Section Heading**: Why Garment Factories Are Switching from Paper to `<span class="text-[#1D4ED8]">Zigza</span>`
  * **Direct Clean Comparison Flow**: Seamless vertical transition between Traditional Challenges and Zigza Digital Solution with the intermediate bridge pill removed for a clutter-free vertical layout.
  * **Traditional Paper Friction Card**: 2px solid `#FB7185` (Rose-400) border with 4 pain points (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * **Zigza Digital System Card**: 2px solid `#10B981` (Emerald-500) border with 4 solutions (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * Note: Handwritten pencil sticky notes automatically hidden on mobile screens (`hidden xl:flex`) to prevent mobile viewport overflow.

---

### 03. 6 Core Modular Engines (Mobile)
* **File**: `03_operating_modules_section.png`
* **Layout & Typography**:
  * **Section Heading**: Everything You Need to Run Your `<span class="text-[#1D4ED8]">Garment Factory</span>`
  * **Smooth Sliding Mobile Carousel**:
    * Silky-smooth CSS scroll transitions with `scroll-smooth`, accurate card center alignment on button click, and active slide scaling (`scale-100 opacity-100` vs `scale-[0.98] opacity-80`).
    * Interactive dot pagination indicators with real-time scroll sync and expanded active pill indicators (`w-7 bg-[#0B1220]`).
    * Tactile left/right chevron navigation buttons with subtle hover feedback and active tap animations.
    * Seam Accent: Full-width `#0B1220` 2.5px seam line indicator expanding to `#14C8B4` on each card.
    * Audit Checklist: `text-[14.5px] text-slate-700 leading-relaxed` with `#14C8B4` check icons.

---

### 04. The 8-Step Synchronized Factory Pipeline (Mobile)
* **File**: `04_floor_workflow_section.png`
* **Layout & Typography**:
  * **Section Heading**: The 8-Step `<span class="text-[#1D4ED8]">Synchronized Factory Pipeline</span>`
  * **Compact Vertical Timeline**:
    * Thin continuous vertical timeline track (`left-[15px] w-[2px] bg-slate-200`) with circular step node badges (`01` to `08`).
    * Sequential auto-advancing active node animation (`bg-[#0B1220] text-[#14C8B4] ring-2 ring-[#0B1220]/20 scale-110`) syncing with desktop pipeline logic.
    * **Interactive Tap/Hover Animation**: Smooth animated border outline (`border-2 border-[#0B1220]`) appearing around the active stage card with `transition-all duration-300 ease-out`.
    * Cuts section height by ~50% on mobile while reinforcing the synchronized factory narrative.

---

### 05. Trusted Across India's Garment Hubs & Map (Mobile)
* **File**: `05_roles_and_network_section.png`
* **Layout & Typography**:
  * **Section Heading**: Trusted Across India's `<span class="text-[#1D4ED8]">Garment Hubs</span>`
  * **4 Trust Pillars**:
    * 2px dotted `border-slate-300` rounded cards with outline icon badges (`#F0FDFA` bg, `#14C8B4/30` border).
    * Titles: `text-[17px] font-bold text-[#0B1220]`.
    * Descriptions: `text-[14.5px] text-slate-700 leading-relaxed`.
  * **Central Map Graphic**:
    * Responsive Pan-India outline vector map scaled cleanly (`max-w-[340px]`) with vertical padding preventing illustration cutoff.
    * **Central Zigza Logomark**: Embedded pure Zigza icon positioned seamlessly in the center of the network web connecting India's manufacturing hubs.

---

### 06. Predictable Subscription Plans & Pricing (Mobile)
* **File**: `06_pricing_and_roi_section.png`
* **Layout & Typography**:
  * **Section Heading**: Predictable Plans for `<span class="text-[#1D4ED8]">Modern Plants</span>`
  * **3 Vertically Stacked Pricing Tiers**:
    1. **Modular Floor**: `₹1,999/mo` (`text-4xl font-extrabold font-mono text-[#0B1220]`).
    2. **Full Access + Zigza AI** *(Recommended Tier)*: `₹4,999/mo` (`text-4xl font-extrabold font-mono text-[#0B1220]`, `#FFFFFF` bg with 2px solid `#0B1220` border and `#14C8B4` "Most Popular" floating pill badge).
    3. **Custom Engineering**: `Custom` (`text-4xl font-extrabold font-mono text-[#0B1220]`).
  * **Punchy Feature Checklist**: `text-[14.5px] text-slate-800` with high-contrast emerald checkmarks.
  * **Full-Width Action Buttons**: Easy touch targets for quick mobile demo scheduling.

---

### 07. Frequently Asked Questions (FAQ) (Mobile)
* **File**: `07_faq_section.png`
* **Layout & Typography**:
  * **Section Heading**: Frequently Asked `<span class="text-[#1D4ED8]">Questions</span>`
  * **Accordion Cards**: Clean white boxes with full-width touch areas (`border-slate-200`).
  * **Question Headers**: `text-base font-bold text-[#0B1220]`.
  * **Answers**: `text-sm text-slate-600 leading-relaxed font-normal`.
  * **Chevron Micro-animations**: Smooth 180-degree rotation on tap.

---

### 08. Contact Us & Plant Consultation Window (Mobile)
* **File**: `08_contact_and_query_section.png`
* **Layout & Typography**:
  * **Section Heading**: Have a Question? Talk With `<span class="text-[#1D4ED8]">Our Team</span>`
  * **Direct WhatsApp & Phone Access**: Tap-to-WhatsApp direct full-width action button with `#1F9D63` branding.
  * **Streamlined Mobile Form Inputs**:
    * Clean, comfortable input fields (`px-3.5 py-2.5 rounded-xl border border-slate-300`).
    * Phone Input: Dedicated `+91` prefix badge with 10-digit mobile number validation.
    * Send Query Button: Full-width `#0B1220` action button.
    * Section Anchor: `id="contact"` with `scroll-mt-24` and tightened mobile edge padding.

---

### 09. Enterprise Footer with Social Handles (Mobile)
* **File**: `09_footer_section.png`
* **Layout & Typography**:
  * **Background**: `#0B1220` with crisp white and slate-400 text.
  * **Brand Block & Social Row**: Zigza logo and concise manufacturing mission statement followed immediately by a clean 4-icon horizontal social bar (Instagram, LinkedIn, Twitter/X, Facebook) with `w-9 h-9` outline action tiles.
  * **Balanced 2-Column Grid**: Two-column layout (`grid-cols-2 gap-6`) for **Platform** and **Access & Support** with uppercase mono headers.
  * **Centering & FAB Clearance**: Extended bottom padding (`pb-20 sm:pb-14`) ensuring the floating Back-to-Top FAB never overlaps the centered legal links or "Proudly Made in India" badge.

---

### 10. Global Mobile Ergonomics & Navigational Features
* **Floating Back to Top FAB**: Dynamic floating circular action button (`bg-[#0B1220] text-white shadow-lg`) appearing when scrolled past 600px, enabling one-tap return to top.
* **Sticky Navbar Headroom**: Extended `scroll-mt-24` (96px) across all section anchors (`#comparison`, `#modules`, `#workflow`, `#roles`, `#pricing`, `#faq`, `#contact`) preventing sticky header overlap.

---

## 🎯 Mobile Usability & Ergonomics Standards

1. **Zero Text Truncation**: No forced ellipsis or cut-off labels on 390px viewports.
2. **Accessible Touch Targets**: All buttons, accordion headers, and social links are sized at `>=44px` height for effortless thumb tapping.
3. **High Contrast on Budget Screens**: Deep `#0B1220` / `#334155` text maintains high contrast on non-OLED and budget Android displays.
4. **No Horizontal Body Overflow**: `overflow-x: hidden` enforced globally with clean responsive containers.
