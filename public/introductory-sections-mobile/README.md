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
  * **Pure Black Outline Smartphone Mockup**: 
    * Sleek black outline phone chassis (`border-[3px] border-slate-900 rounded-[36px] bg-white p-2.5 shadow-xl`) and top camera notch pill.
    * Native Phone Status Row: `09:41` clock on left, cellular signal bars + **WiFi icon** + battery icon on right.
    * 3 Segmented Station Touch Tabs: `Cutting`, `Sewing`, and `QC & Pack`.
    * 2 High-Impact KPI Cards: Active batch / lot and live pieces cut with dynamic animated count-up.
    * Real-Time Vertical Activity Feed: 3 vertical cards with zero horizontal overflow, showing bundle tags, piece wages, and carton audit checkpoints.
    * Modern bottom smartphone swipe home indicator bar.

---

### 02. Traditional Chaos vs. Zigza Digital Solution (Mobile)
* **File**: `02_problem_vs_solution_section.png`
* **Layout & Typography**:
  * **Direct Clean Comparison Flow**: Seamless transition between Traditional Challenges and Zigza Digital Solution with the intermediate bridge pill removed for a clutter-free vertical layout.
  * **Traditional Paper Friction Card**: 2px solid `#FB7185` (Rose-400) border with 4 pain points (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * **Zigza Digital System Card**: 2px solid `#10B981` (Emerald-500) border with 4 solutions (`text-base font-bold text-slate-900` + `text-sm text-slate-700`).
  * Note: Handwritten pencil sticky notes automatically hidden on mobile screens (`hidden xl:flex`) to prevent mobile viewport overflow.

---

### 03. 6 Core Modular Engines (Mobile)
* **File**: `03_operating_modules_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900 tracking-tight`.
  * **Smooth Sliding Mobile Carousel**:
    * Silky-smooth CSS scroll transitions with `scroll-smooth`, accurate card center alignment on button click, and active slide scaling (`scale-100 opacity-100` vs `scale-[0.98] opacity-80`).
    * Interactive dot pagination indicators with real-time scroll sync and expanded active pill indicators (`w-7 bg-[#3A3564]`).
    * Tactile left/right chevron navigation buttons with subtle hover feedback and active tap animations.
    * Seam Accent: Full-width `#3A3564` 2.5px seam line indicator on each card.
    * Audit Checklist: `text-[14.5px] text-slate-700 leading-relaxed` with `#3A3564` check icons.

---

### 04. The 8-Step Synchronized Factory Pipeline (Mobile)
* **File**: `04_floor_workflow_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900`.
  * **Compact Vertical Timeline**:
    * Thin continuous vertical timeline track (`left-[15px] w-[2px] bg-slate-200`) with circular step node badges (`01` to `08`).
    * Sequential auto-advancing active node animation (`bg-[#3A3564] ring-2 ring-[#3A3564]/30 scale-110`) syncing with desktop pipeline logic.
    * Cuts section height by ~50% while reinforcing the factory flow narrative.

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
    * Responsive Pan-India outline vector map scaled cleanly (`max-w-[340px]`) with vertical padding preventing illustration cutoff.

---

### 06. Predictable Subscription Plans & Pricing (Mobile)
* **File**: `06_pricing_and_roi_section.png`
* **Layout & Typography**:
  * **Section Heading**: `text-3xl font-extrabold text-slate-900`.
  * **3 Vertically Stacked Pricing Tiers**:
    1. **Modular Floor**: `₹1,999/mo` (`text-4xl font-extrabold font-mono text-slate-900`).
    2. **Full Access + Zigza AI** *(Recommended Tier)*: `₹4,999/mo` (`text-4xl font-extrabold font-mono text-[#3A3564]`, `#FAF7F0` bg with 2px solid `#3A3564` border and "Most Popular" floating pill badge).
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
    * Section Anchor: `id="contact"` with `scroll-mt-24` and tightened mobile edge padding.

---

### 09. Enterprise Footer with Social Handles (Mobile)
* **File**: `09_footer_section.png`
* **Layout & Typography**:
  * **Brand Block & Social Row**: Zigza logo and concise manufacturing mission statement followed immediately by a clean 4-icon horizontal social bar (Instagram, LinkedIn, Twitter/X, Facebook) with `w-9 h-9` outline action tiles.
  * **Balanced 2-Column Grid**: Two-column layout (`grid-cols-2 gap-6`) for **Platform** and **Access & Support** with uppercase mono headers (`text-[12px] font-mono font-bold tracking-wider text-slate-900`).
  * **Zero Multiline Wrapping**: Streamlined labels (`Staff Sign In →`, `WhatsApp Support` with phone icon) preventing awkward text breaks on 390px screens.
  * **Centering & FAB Clearance**: Extended bottom padding (`pb-20 sm:pb-14`) ensuring the floating Back-to-Top FAB never overlaps the centered legal links (`Privacy Policy • Terms of Service • Security Standards`) or "Proudly Made in India" badge.

---

### 10. Global Mobile Ergonomics & Navigational Features
* **Floating Back to Top FAB**: Dynamic floating circular action button (`bg-[#3A3564] text-white shadow-lg`) appearing when scrolled past 600px, enabling one-tap return to top.
* **Sticky Navbar Headroom**: Extended `scroll-mt-24` (96px) across all section anchors (`#comparison`, `#modules`, `#workflow`, `#roles`, `#pricing`, `#faq`, `#contact`) preventing sticky header overlap.

---

## 🎯 Mobile Usability & Ergonomics Standards

1. **Zero Text Truncation**: No forced ellipsis or cut-off labels on 390px viewports.
2. **Accessible Touch Targets**: All buttons, accordion headers, and social links are sized at `>=44px` height for effortless thumb tapping.
3. **High Contrast on Budget Screens**: Deep `#0F172A` / `#334155` text maintains high contrast on non-OLED and budget Android displays.
4. **No Horizontal Body Overflow**: `overflow-x: hidden` enforced globally with clean responsive containers.
