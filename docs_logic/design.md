# Zigza Enterprise Web Admin — Master Design System & Style Guide

> **Document Status**: Canonical & Authoritative Single Source of Truth  
> **Target Audience**: Core Engineering & AI Assistants  
> **Application**: Zigza Enterprise MES / Supply Chain Admin Suite  
> **Key Constraint**: Every portal and division must strictly adhere to this design specification. Never create ad-hoc layouts, unencapsulated sticky headers, or mismatched color/typography styles.

---

## 1. Design Philosophy & Brand Aesthetic

Zigza is built with an **Industrial Luxury** aesthetic tailored for precision garment factory operations. It merges the rugged, fast-paced nature of shop-floor apparel manufacturing with the refined elegance of modern enterprise software.

### Core Principles
1. **Encapsulated & Contained**: Every functional zone sits within an explicit, rounded, white card with a clean, slim border (`border-black/10`) and subtle elevation (`shadow-2xs`). Loose, unencapsulated content floating directly on the page canvas is strictly prohibited.
2. **Warm Canvas vs. Crisp White Cards**: The backdrop is always a warm paper/cream tint (`#FAF7F0` or `#FAFAF8`), contrasting against pure white (`#FFFFFF`) card surfaces.
3. **No Toy Emojis**: Always use crisp, clean SVG icons from `lucide-react`. Never use raw consumer emojis in headers, tables, or buttons.
4. **Data Density with Breathing Room**: Information-dense tables, metric counters, and status badges remain readable through strict padding scales (`p-4 sm:p-6 md:p-8`) and monospace numerical alignments.

---

## 2. Color Palette & Token Reference

| Token Name | Hex / Value | Usage & Context |
| :--- | :--- | :--- |
| **Primary Brand Steel** | `#3A3564` | Primary buttons, active nav links, brand accents, icon badges |
| **Primary Brand Hover** | `#2A2649` | Hover state for primary buttons and interactive brand elements |
| **Brand Mist / Cream** | `#FAF7F0` | Canvas background, icon badge backdrops, table headers, drawer headers |
| **Card White** | `#FFFFFF` | All surface cards, modal bodies, table containers, elevated components |
| **Foreground Ink (Dark)**| `#09090b` / `#0F172A` | Primary headings, table row values, active text |
| **Muted Ink (Body)** | `#475569` (slate-600) | Descriptions, subtitles, secondary table cell data |
| **Faint Ink (Labels)** | `#94A3B8` (slate-400) | Stage labels, breadcrumbs, placeholder text, timestamp markers |
| **Standard Border** | `border-black/10` | Universal card, input, and modal outlines |
| **Subtle Divider** | `border-slate-100` / `divide-slate-100` | Table row dividers, header splits, form dividers |
| **Card Elevation** | `shadow-2xs` | Default light shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.03)` |
| **Button Elevation** | `shadow-xs` / `shadow-sm` | Interactive button shadow |

### Status Badges & Tint System
All status badges and indicators use soft pastel tints paired with dark, readable contrasting text:

| Status Intent | Background | Text Color | Border | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Completed** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | In Stock, Cleared, Delivered, Active |
| **In Progress / Sailing** | `bg-blue-50` / `bg-sky-50`| `text-blue-700` / `text-sky-700` | `border-blue-200` | In Production, Sailing, En Route |
| **Warning / WIP** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | In Fabric, Container Stuffed, Pending |
| **Critical / Overrun** | `bg-rose-50` | `text-rose-700` | `border-rose-200` | Cost Exceeded >2%, Delayed, Escalated |
| **Brand Primary** | `bg-indigo-50` / `bg-[#FAF7F0]` | `text-[#3A3564]` | `border-indigo-200` / `border-black/10` | Division badges, Active counts |

---

## 3. Typography Hierarchy

### Font Family Setup
- **Headings & Titles**: `var(--font-heading)` &rarr; **Plus Jakarta Sans** (`font-extrabold`, `font-bold`)
- **Body & Controls**: `var(--font-public-sans)` / `font-sans` &rarr; **Public Sans** (`font-medium`, `font-semibold`)
- **Numbers, Codes, SKUs, Tables**: `var(--font-jetbrains-mono)` / `font-mono` &rarr; **JetBrains Mono** (`font-bold`, `font-mono`)
- **Handwritten Notes/Annotations**: `var(--font-caveat)` &rarr; **Caveat** (`font-[family-name:var(--font-caveat)]`)

### Exact Text Sizes & Classes

| Element | Tailwind Classes | Font Family & Weight | Typical Context |
| :--- | :--- | :--- | :--- |
| **Page H1 (Hero)** | `text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900` | Plus Jakarta Sans (`font-[family-name:var(--font-heading)]`) | Main Top Header Card |
| **Section H2** | `text-lg sm:text-xl font-bold tracking-tight text-slate-900` | Plus Jakarta Sans | Sub-section headers, Modal headers |
| **Card H3** | `text-base sm:text-lg font-bold text-slate-900` | Plus Jakarta Sans | Drawer titles, Card headings |
| **KPI Big Number** | `text-2xl sm:text-[28px] font-bold text-slate-900` | Plus Jakarta Sans | Metric Cards (Count, $, Pcs) |
| **Subtitle / Subtext** | `text-sm sm:text-base text-slate-600 mt-1` | Public Sans (`font-medium`) | Header card description |
| **Breadcrumbs** | `text-xs font-medium text-slate-400` | Public Sans | Top page path navigation |
| **Stage Indicator** | `text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400` | JetBrains Mono | `STAGE 01`, `STAGE 02` pill badges |
| **Status Badge / Pill**| `text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full` | JetBrains Mono | Table row status, active pills |
| **Table Head Column** | `text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500` | JetBrains Mono | Table `thead th` |
| **Table Body Cell** | `text-xs sm:text-sm text-slate-900` | Public Sans / Mono for numbers | Table `tbody td` |
| **Form Label** | `text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5` | JetBrains Mono | Inputs, Selects, Radios |
| **Input Value** | `text-xs sm:text-sm text-slate-900 font-medium` (or `font-mono`) | Public Sans / Mono | Form field value |
| **Micro Caption** | `text-[10px] sm:text-[11px] text-slate-400 font-medium` | Public Sans | Card secondary labels, tooltips |

---

## 4. Standard Page Anatomy & Layout Structure

Every page inside the application must follow this exact 5-layer hierarchy:

```
AdminShell (App Wrapper)
└── Canvas: <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
    ├── Layer 1: Breadcrumb Hierarchy Trail
    ├── Layer 2: Encapsulated Top Header Card (Title + Action Buttons)
    ├── Layer 3: Executive KPI Metric Cards (2 to 4 Cards Grid)
    ├── Layer 4: Toolbar & Filter Controls (Search + Status Pills)
    └── Layer 5: Primary Data Table / Ledger Container
```

### Layer 1: Breadcrumb Hierarchy Trail
```tsx
<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
  <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
    Merchandising & Sourcing
  </Link>
  <span>/</span>
  <span>Commercial Ops</span>
  <span>/</span>
  <span className="font-bold text-slate-900">Buyer Purchase Orders (PO)</span>
</div>
```

### Layer 2: Encapsulated Top Header Card
```tsx
<div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
  <div className="flex items-center gap-3.5">
    {/* 44x44px Icon Container */}
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
      <ClipboardList className="w-5 h-5" />
    </div>
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
          Buyer Purchase Orders (PO)
        </h1>
        <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
          {orders.length} Active Contracts
        </span>
      </div>
      <p className="text-sm sm:text-base text-slate-600 mt-1">
        Master buyer contract ledger, color & size distribution, and production line handover
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2.5 self-end sm:self-auto">
    <button
      type="button"
      onClick={() => setIsCreateModalOpen(true)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
    >
      <Plus className="w-4 h-4" />
      <span>Book New Buyer PO</span>
    </button>
  </div>
</div>
```

### Layer 3: Executive KPI Metric Cards (Grid of 4)
Always display high-level operational statistics using this 4-column responsive grid:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2">
      <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
        <ClipboardList className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
        STAGE 01
      </span>
    </div>
    <div className="mt-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
        Contracted POs
      </div>
      <div className="text-[11px] text-slate-400 font-medium">Registered commercial POs</div>
    </div>
    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
      <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
        {orders.length}
      </div>
      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
        Global Buyers
      </span>
    </div>
  </div>
  {/* Additional metric cards follow identical layout */}
</div>
```

### Layer 4 & 5: Toolbar & Primary Data Table Container
```tsx
<div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
  {/* Toolbar Header */}
  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
    {/* Filter Tabs */}
    <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
      {['ALL', 'BOOKED', 'IN_FABRIC', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveFilter(tab)}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === tab
              ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
              : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
          }`}
        >
          {tab.replace('_', ' ')}
        </button>
      ))}
    </div>

    {/* Search Box */}
    <div className="relative w-full sm:w-72">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
      />
    </div>
  </div>

  {/* Table Element */}
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
          <th className="py-3 px-4">PO Number</th>
          <th className="py-3 px-4">Buyer</th>
          <th className="py-3 px-4 text-right">Quantity</th>
          <th className="py-3 px-4 text-center">Status</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-xs">
        {/* Rows with hover:bg-slate-50 */}
      </tbody>
    </table>
  </div>
</div>
```

---

## 5. Modal & Form Sizing Guidelines

Never hardcode arbitrary widths or full-screen overlays without proper modal sizing. All modals use a centered backdrop and standard viewport constraints:

### Modal Sizing Standards

| Modal Category | Max Width Class | Typical Dimensions | Usage Scenario |
| :--- | :--- | :--- | :--- |
| **Small Confirmation / Alert** | `max-w-md` | `448px` | Delete confirm, status toggle, single input prompt |
| **Standard Single-Column Form**| `max-w-lg` | `512px` | Add article, add lineman, simple creation form |
| **Two-Column Standard Form** | `max-w-xl` | `576px` | Costing sheet, Sourcing PR, Book shipment |
| **Complex Stepper / Matrix** | `max-w-2xl` | `672px` | Buyer PO booking with Color/Size matrix |
| **Wide Data / Manifest Modal** | `max-w-4xl` | `896px` | Cutting lot breakdown, bulk allotment view |

### Standard Modal Architecture
```tsx
{/* 1. Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
  {/* 2. Container Card */}
  <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
    
    {/* 3. Modal Header */}
    <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
          Form Category
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
          Modal Title
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* 4. Scrollable Form Body */}
    <form onSubmit={handleSubmit}>
      <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
        {/* Form Inputs */}
      </div>

      {/* 5. Modal Footer Actions */}
      <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer"
        >
          Save & Confirm
        </button>
      </div>
    </form>
  </div>
</div>
```

### Form Field Design Pattern
All input fields, selects, and textareas must follow this exact styling:
- **Labels**: `block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5`
- **Required Asterisk**: `<span className="text-rose-500">*</span>`
- **Input Fields**:
  ```tsx
  <input
    type="text"
    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
  />
  ```
- **Monospace Code Inputs (PO, Art No, Dates)**: Add `font-mono uppercase font-bold text-[#3A3564]`

---

## 6. Card Perimeter Animations (The 6 Division Hub Cards)

On `/modules`, all 6 operational portal cards feature a **slim black border** and a **synchronized CSS motion-path shiny point** orbiting along the perimeter:

- **Border**: `border border-slate-900/35` (never thick, never clipped)
- **Outer Wrapper**: `relative rounded-2xl` without `overflow-hidden` (so the glowing point doesn't get clipped)
- **Loading Bar Container**: Strict `overflow-hidden rounded-t-2xl` on the inner progress track
- **Motion Path Orbit**:
  ```css
  .border-shiny-point {
    position: absolute;
    top: 0;
    left: 0;
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: #09090b;
    box-shadow: 0 0 6px 1.5px rgba(9, 9, 11, 0.45);
    offset-path: rect(0 100% 100% 0 round 16px);
    animation: syncPointOrbit 14s linear infinite;
    pointer-events: none;
    z-index: 10;
  }
  @keyframes syncPointOrbit {
    0%   { offset-distance: 0%; }
    100% { offset-distance: 100%; }
  }
  ```

---

## 7. Multi-Portal Routing & Isolated AI Standard

The application consists of **7 distinct divisions/portals**:
1. **Modules Hub**: `/modules`
2. **Factory Operations**: `/factory`
3. **Brands & Commercial**: `/brands`
4. **Washing & Finishing**: `/washing`
5. **Printing & Embellishment**: `/printing`
6. **Embroidery Division**: `/embroidery`
7. **Stitching & Sewing**: `/stitching-sewing`
*(Plus Merchandising & Sourcing under `/merchandising`)*

### Dedicated Zigza AI Route Architecture
Each portal owns an independent, dedicated AI page:
- `/modules/zigza-ai`
- `/factory/zigza-ai`
- `/brands/zigza-ai`
- `/washing/zigza-ai`
- `/printing/zigza-ai`
- `/embroidery/zigza-ai`
- `/stitching-sewing/zigza-ai`
- `/merchandising/zigza-ai`

**Rules**:
1. **Never redirect across portals**: Clicking "Zigza AI" in any portal must preserve that portal's sidebar and stay within that portal's route.
2. **7-Way Isolated Cloud & Local History**:
   - `localStorage` key: `zigza_ai_chat_sessions_${portal}_${userEmail}`
   - Supabase storage file: `${sanitizedEmail}_${portal}.json`
   - Even when logged in as the master company email (`team.anga9@gmail.com`), every portal maintains a 100% isolated chat history and domain-tailored quick prompts.

---

## 8. Anti-Patterns (What NEVER to Do)

1. **NEVER use sticky headers with unencapsulated page wrappers**:
   - *Wrong*: `<header className="sticky top-0 bg-[#FAF7F0] border-b">...<main className="px-6 py-8">...`
   - *Right*: Encapsulate everything inside `AdminShell` with breadcrumbs, top header card, and table card.
2. **NEVER use generic default browser colors**:
   - Avoid plain `#0000ff`, `#ff0000`, or standard raw Tailwind alerts. Always use the curated `#3A3564`, `#FAF7F0`, and soft tinted badge tokens.
3. **NEVER use emojis for status or navigation**:
   - Always use `lucide-react` icons.
4. **NEVER forget JetBrains Mono on numbers**:
   - Any quantity, PO number, article code, currency value, date, or variance percent must use `font-mono`.
5. **NEVER make destructive actions single-click**:
   - Delete, archive, and status resets must always open a confirmation modal or prompt.
