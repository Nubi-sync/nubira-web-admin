# Zigza Enterprise MES: Module Hub & Division Implementation Record

## Executive Overview
This document records the architectural specifications, implemented features, portal routes, database models, and client interfaces delivered for the **Module Hub** and **Division 01: Design & Tech-Pack Studio**, as well as the **7-Way Isolated Zigza AI Engine**.

---

## 1. Module Hub Architecture & Visual Synchronization (`/modules`)

### 1.1 Card Border & Synced Kinetic Orbit Point
- **Structural Styling**:
  - The 6 division cards (`/modules`) feature a slim, crisp dark border (`border border-slate-900/35`) and rounded corners (`rounded-2xl` / `16px`).
  - All card borders and kinetic accents operate smoothly in lockstep synchronization without layout shift.
- **CSS Motion Path Animation**:
  - Utilizes CSS Motion Path `offset-path: rect(0 100% 100% 0 round 16px)` and `@keyframes syncPointOrbit` running from `offset-distance: 0%` to `100%` over a calm, continuous 8-second linear loop.
  - Avoids SVG stroke clipping and dasharray scaling bugs across varying viewport widths and card aspect ratios.
  - A single, refined shiny node (`6px` circular point with radial gradient and subtle halo glow) glides precisely along the outer perimeter of each box.
- **Interactive Click State**:
  - Clicking any card triggers an instant visual feedback state with a top-mounted smooth indeterminate progress bar container (`overflow-hidden rounded-t-2xl`) and an `"Opening..."` badge, preventing double-clicks during route transitions.

---

## 2. Dedicated Zigza AI Architecture (7-Way Division Isolation)

### 2.1 Route Isolation
Each of the enterprise divisions maintains its own dedicated AI route rather than redirecting to a single portal, preserving the division's sidebar context and workflow:
1. `/modules/zigza-ai` (Master Enterprise Overview)
2. `/design/zigza-ai` (Design & Tech-Pack Studio)
3. `/factory/zigza-ai` (Factory Floor Operations)
4. `/brands/zigza-ai` (Brand Commercial Portals)
5. `/washing/zigza-ai` (Industrial Washing Plant)
6. `/printing/zigza-ai` (Automated Screen & Digital Printing)
7. `/embroidery/zigza-ai` (Multi-Head Embroidery Operations)
8. `/stitching-sewing/zigza-ai` (Stitching, Sewing & Floor Control)

### 2.2 History Isolation & Persistence
- **Storage Scope**:
  - Even when logged in under the master enterprise email (`team.anga9@gmail.com`), chat sessions are strictly separated by division key:
    ```
    zigza_ai_chat_sessions_${portal}_${userEmail}
    ```
- **Cloud Bucket Sync**:
  - API endpoint `/api/chat/history` accepts a `portal` parameter and persists sessions to Supabase storage under:
    ```
    ${sanitizedEmail}_${portal}.json
    ```
  - Includes backwards-compatible fallbacks for legacy stitching sessions.
- **Tailored Quick Prompts & Division Context**:
  - Each division AI view provides domain-specific quick query suggestions (e.g., tech-pack POM tolerances for Design, stitch tension for Sewing, liquor ratios for Washing, mesh counts for Printing).

---

## 3. Division 01: Design & Tech-Pack Studio (`/design`)

### 3.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 7-item navigation structure for the `/design` portal:
- **Workspace Hub**:
  - `All Modules` (`/modules`)
- **1. Design Studio**:
  - `Studio Dashboard` (`/design`)
  - `Tech-Pack Catalog` (`/design/tech-packs`)
  - `Sample Approvals (PPS)` (`/design/sample-approvals`)
  - `Size Grading Matrix` (`/design/grading-matrix`)
  - `Fabric & Trims Library` (`/design/materials-library`)
  - `Zigza AI` (`/design/zigza-ai`)
- **Account**:
  - `Studio Profile` (`/design/profile`)

### 3.2 Studio Dashboard (`/design`)
- **File**: [`src/app/design/components/DesignDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/components/DesignDashboardClient.tsx)
- **KPI Metrics**:
  1. `Active Tech-Packs`: Total specs with bulk-approved breakdown.
  2. `Sample Fit Approvals`: Pending prototype and pre-production reviews.
  3. `Size Grading Matrix`: Number of active size systems (Adult, Numeric, Kids, Plus).
  4. `PPS Readiness`: Real-time percentage SLA tracking.
- **Active Pipeline Queue**:
  - Tabbed filters: `ALL`, `APPROVED_BULK`, `PPS_SUBMITTED`, `SAMPLE_DEV`, `REVISE_FIT`, `DRAFT`.
  - Full-text search by style reference, style description, brand, or category.
  - Direct audit action links into physical sampling gates.

### 3.3 Tech-Pack Master Catalog (`/design/tech-packs`)
- **File**: [`src/app/design/tech-packs/components/TechPackCatalogClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/tech-packs/components/TechPackCatalogClient.tsx)
- **Dual-View Switcher**:
  - `Visual CAD Gallery`: Card grid displaying base sizes, target GSM, fabric compositions, embellishment routing, and target cut dates.
  - `Detailed Spec Table`: High-density tabular layout with sorting and search.
- **Version History Diff Engine**:
  - Compares measurement deltas between revisions (e.g., `Chest +1.5cm`, `Length -0.5cm`) with audit sign-off logs.
- **Form 1 (2-Step Stepper Modal)**:
  - **Step 1: Core Design & Garment Meta**: Style number validation (`^[A-Z0-9-]{4,25}$`), buyer/brand selection, silhouette category, grading system, base size, shell fabric, target GSM, and target cut date.
  - **Step 2: Technical Vectors & Seam Specs**: Embellishment sequence rule (`NONE`, `EMBROIDERY_FIRST_THEN_PRINT`, `PRINT_FIRST_THEN_EMBROIDERY`), stitches per inch (SPI 8–20), seam construction class (`ISO 4915 Class 401`, `Class 504`, `Class 607`), and auto-generated technical vector silhouette preview.

### 3.4 Sample Approvals & PPS Gate (`/design/sample-approvals`)
- **File**: [`src/app/design/sample-approvals/components/SampleApprovalsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/sample-approvals/components/SampleApprovalsClient.tsx)
- **3-Stage Buyer Fit Pipeline**:
  1. `Proto Sample`: Aesthetic silhouette, pocket placement, and drape on physical form.
  2. `Size Set Sample`: Cross-size measurement calibration across full size breakdown.
  3. `Pre-Production Sample (PPS)`: Buyer-signed golden piece authorizing bulk fabric cutting.
- **Form 2 (Sample Audit Submission Modal)**:
  - Captures measured chest, length, and sleeve vs target specifications.
  - Live ASTM tolerance calculation: Automatically flags red if variance exceeds $\pm 0.5$ cm.
  - Records auditor email and approval decision (`APPROVED`, `REVISE_FIT`, `PENDING_REVIEW`).

### 3.5 Dynamic Size Grading Matrix (`/design/grading-matrix`)
- **File**: [`src/app/design/grading-matrix/components/GradingMatrixClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/grading-matrix/components/GradingMatrixClient.tsx)
- **Multi-System Dynamic Sizing Support**:
  - `Adult Unisex Alpha (XS–3XL)`
  - `Toddler & Kids Sizing (2T–14)`
  - `Numeric Waist Jeans/Trousers (28–42)`
  - `Plus Size Silhouette (1X–5X)`
- **Interactive POM Matrix Table**:
  - Displays tolerance boundaries ($\pm$ cm), highlighted base sample column, and calculated size increments.
  - Dynamic `+ Add Point of Measure (POM)` modal calculates values across all sizes automatically based on the base value and grade step increment.

### 3.6 Fabric & Trims Library (`/design/materials-library`)
- **File**: [`src/app/design/materials-library/components/MaterialsLibraryClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/materials-library/components/MaterialsLibraryClient.tsx)
- **Technical Registry**:
  - Shrinkage telemetry (length % and width %), spirality indexes, yarn count, and construction details.
  - Sewing needle calibrations (e.g., `Ball Point 80/12 SES`, `Sharp 90/14`, `Overlock 80/12`).
  - Filtering by `FABRIC`, `TRIM`, and `THREAD`.
  - Material registration modal for cataloging certified mill specifications and lead times.

---

## 4. Quality & Compliance Metrics
- **Compilation**: Zero TypeScript compiler errors (`npx tsc --noEmit` exited code 0).
- **Design System Consistency**: Strict application of enterprise palette (`#3A3564` Deep Indigo, `#FAF7F0` Cream White, `#09090B` Ink, Emerald/Sky/Amber/Rose status badges).
- **Naming Conventions**: Reverted all labels to clean, canonical brand name **"Zigza AI"** across all modules and views.
