# 🏭 ZIGZA APP MODULES & ADMIN ERP — UI/UX DESIGN SYSTEM & SPECIFICATION MANUAL

> **MANDATORY INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS**:  
> Whenever creating, modifying, styling, or refactoring pages, modals, tables, queues, or components in the **Zigza Web Admin ERP Application** (including Cutting, Merchandising, Store, Ready Goods, Alteration, Design, Printing, Washing, Security, Reports, Profile, and Settings), **STRICTLY ADHERE TO THIS MANUAL.**
>
> Zero deviations are permitted. This design system was engineered specifically for high-contrast manufacturing telemetry, executive speed, and effortless clarity across industrial factory displays.

---

## 🎨 Global Color Architecture & Token Reference

| Token Name | Hex / Class Code | Role & Scope | Strict Constraints |
| :--- | :--- | :--- | :--- |
| **Deep Royal Blue** | `#1D4ED8`<br>`hover:bg-[#1E40AF]` | **Primary Interactive Action Buttons** across the entire platform. | **The ONLY permissible color for primary buttons** (`+ Add Worker`, `+ Book PO`, `Submit`, `Save`, `Confirm`). Must have `text-white font-bold`. |
| **Electric Mint / Cyan** | `#14C8B4`<br>`text-[#0B1220]` | **Active Tab / Status Filter Pills**, live sync pulses, active stepper indicators. | **Selected/Active queue pills ONLY**. **MUST use `text-[#0B1220]` dark font** (8.5:1 contrast). **NEVER use white text on cyan** (fails WCAG). |
| **Crisp White Secondary** | `#FFFFFF`<br>`border-slate-200` | **Secondary Buttons**, Cancel, Back, Reset, Close, and Export buttons. | `bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0B1220] shadow-2xs font-semibold rounded-xl`. |
| **Deep Obsidian Navy** | `#0B1220`<br>`#162032` | **Typography Authority & Dark Surfaces** (`h1`, `h2`, table headers, modal titles). | **STRICTLY PROHIBITED for interactive buttons or active status pills.** |
| **Soft Mint Wash** | `#F0FDFA`<br>`border-black/15` | **Icon container badges, metric widgets, active card backgrounds.** | High-legibility accent wash. **Never invert to dark/black on hover.** |
| **Tech Canvas Background** | `#F8FAFC` | **Universal App Canvas Background.** | High dynamic range, anti-glare for factory displays. |
| **Slate Charcoal** | `#1E293B` / `#334155` / `#64748B` | **Data labels, body copy, descriptions, subtitles.** | High contrast, minimum 12px–14px. No illegible light-gray text. |

---

## 🚫 The 5 Golden Prohibitions (Zero-Tolerance Rules)

1. ❌ **NO BLACK BUTTONS**: Never use `bg-[#0B1220]`, `bg-[#162032]`, `bg-black`, `bg-slate-900`, or `bg-[#2C274E]` for any button or CTA.
2. ❌ **NO WHITE TEXT ON CYAN**: Electric Cyan (`#14C8B4`) must **always** be paired with Deep Obsidian text (`text-[#0B1220] font-bold`). White text on cyan is illegible and prohibited.
3. ❌ **NO DARK SECONDARY BUTTONS**: Cancel, Dismiss, and Secondary buttons must **always** be crisp white with a subtle border (`bg-white border-slate-200 text-slate-700`).
4. ❌ **NO BLACK HOVER INVERSION**: Never make icon containers turn solid black or navy on hover (`hover:bg-[#162032]`, `hover:bg-slate-900`). Keep them clean in `#F0FDFA` or slate tones.
5. ❌ **NO MICRO-TEXT**: Never use font sizes below `11px`. Body text, table values, and forms must remain `>= 13px`–`14px` for readability by shop-floor managers aged 30+.

---

## 🧩 Standard Component Specifications

### 1. Primary Action Buttons (Header CTAs, Form Submits, Add Records)

Use for: `+ Add Worker`, `+ Book New PO`, `+ Inward Roll`, `+ Create Tech Pack`, modal `Save`, `Submit`, `Confirm`.

```tsx
// Standard Primary Button
<button
  type="submit"
  className="px-4.5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-[0.98] flex items-center gap-2"
>
  <Plus className="w-4 h-4 text-white" />
  <span>Add Worker</span>
</button>
```

---

### 2. Secondary & Cancel Action Buttons

Use for: Modal `Cancel`, `Close`, `Back`, table `Export CSV`, `Filter`, `Reset`, auxiliary actions.

```tsx
// Standard Secondary Button
<button
  type="button"
  onClick={onClose}
  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0B1220] text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-2"
>
  Cancel
</button>
```

---

### 3. Active Tab & Status Filter Pills (Queues, Module Filters)

Use for: Queue switchers (`[ Active Queue ]`, `[ In Progress ]`, `[ Completed ]`, `[ All Lots ]`).

```tsx
// Active Filter Tab vs Inactive Filter Tab
<div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto">
  {/* ACTIVE TAB */}
  <button
    onClick={() => setTab("active")}
    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#14C8B4] text-[#0B1220] border border-[#14C8B4] shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
  >
    <span>Active Queue</span>
    <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0B1220] text-white">
      12
    </span>
  </button>

  {/* INACTIVE TAB */}
  <button
    onClick={() => setTab("completed")}
    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
  >
    <span>Completed</span>
    <span className="px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
      48
    </span>
  </button>
</div>
```

---

### 4. Modal Dialog Standards

All modals across all ERP modules must follow this uniform structure:

```tsx
<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
    
    {/* Modal Header */}
    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
          <UserPlus className="w-5 h-5 text-[#0B1220]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0B1220]">Add New Worker</h2>
          <p className="text-xs text-slate-500">Register employee for piece-rate wage tracking</p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Modal Form Body */}
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Worker Full Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Ramesh Kumar"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1220] focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all outline-none"
        />
      </div>

      {/* Modal Actions Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-white" />
          <span>Save & Add Worker</span>
        </button>
      </div>
    </form>

  </div>
</div>
```

---

### 5. KPI Telemetry Cards & Metric Badges

Used at the top of every module dashboard (Cutting, Store, Ready Goods, etc.):

```tsx
<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
      Active Bundles
    </span>
    {/* High-legibility mint icon badge */}
    <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220]">
      <Layers className="w-5 h-5 text-[#0B1220]" />
    </div>
  </div>
  <div className="flex items-baseline gap-2">
    <span className="text-3xl font-extrabold font-mono text-[#0B1220] tabular-nums">
      1,428
    </span>
    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
      +14% vs target
    </span>
  </div>
</div>
```

---

### 6. ERP Data Tables & Semantic Status Chips

```tsx
// Status badge mapping standard across all tables
const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
    case "approved":
    case "in_stock":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "running":
    case "in_progress":
    case "active":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "pending":
    case "relaxing":
    case "under_review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rejected":
    case "scrap":
    case "defect":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};
```

---

## 📂 Quick File Reference & Cross-Check Matrix

When working in any module, reference the following canonical implementations:

| Module / Component Type | Canonical Reference File | Key Visual Verification Points |
| :--- | :--- | :--- |
| **Table Action Bar & Add Worker** | `src/app/cutting/components/CuttingDashboardClient.tsx` | Blue `+ Add Worker`, White `Worker List`, Electric Cyan status tabs |
| **Modal Submission & Form** | `src/app/cutting/components/AddWorkerModal.tsx` | Blue submit, White cancel, `#F0FDFA` header icon badge |
| **Multi-Stage Queue / Tabs** | `src/app/ready-goods/components/ReadyGoodsDashboardClient.tsx` | Electric Cyan active tab with `#0B1220` dark count badge |
| **Material Godown / Inwarding** | `src/app/store/fabric-godown/components/FabricGodownClient.tsx` | Blue `+ Inward Fabric Roll`, White `Inspect Roll` |
| **Tech Pack Catalog** | `src/app/design/tech-packs/components/TechPackCatalogClient.tsx` | Blue `+ Create Tech Pack`, White `Filter`, Cyan status pills |
| **Marketing Landing Page** | `src/app/components/ZigzaLandingPageClient.tsx` | Refer to `LANDING_PAGE_DESKTOP_UI_GUIDELINES.md` |

---

## 🚀 Starting a New AI Conversation — Recommended Prompt

When opening a new chat window or passing this project to another AI agent, paste this prompt:

```text
Please read and strictly follow the design system documented in:
1. APP_MODULES_UI_GUIDELINES.md (for all ERP admin modules, modals, tables, buttons, and queue tabs)
2. LANDING_PAGE_DESKTOP_UI_GUIDELINES.md (for the landing page desktop layout)
3. LANDING_PAGE_MOBILE_UI_GUIDELINES.md (for the landing page mobile layout)

MANDATORY RULES:
- Primary buttons MUST be Royal Blue (#1D4ED8 hover:bg-[#1E40AF] text-white font-bold). ZERO dark/black buttons anywhere.
- Secondary / Cancel buttons MUST be crisp white with slate border (bg-white border-slate-200 text-slate-700).
- Active queue / filter pills MUST be Electric Cyan (bg-[#14C8B4] text-[#0B1220] font-bold).
- Modals must pair Blue submit with White bordered cancel.
```
