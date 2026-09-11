# Zigza Enterprise MES: Module Hub & Division Implementation Record

## Executive Overview
This document records the architectural specifications, implemented features, portal routes, database models, client interfaces, state synchronizations, and physical shop-floor handshakes delivered for:
1. **Module Hub & Visual Synchronization** (`/modules`)
2. **Dedicated Zigza AI Engine** (7-Way Division Isolation)
3. **Division 01: Design & Tech-Pack Studio** (`/design`)
4. **Division 02: Merchandising & Sourcing Desk** (`/merchandising`)
5. **Division 03: Cutting & Lay Floor Operations** (`/cutting`)
6. **Division 04: Screen & Digital Printing Unit** (`/printing`)
7. **Division 05: Multi-Head Embroidery Unit** (`/embroidery`)
8. **Division 06: Stitching & Sewing Floor** (`/stitching-sewing`)
9. **Division 07: Industrial Washing Plant** (`/washing`)
10. **Division 08: Ironing & Steam Pressing Operations** (`/iron`)
11. **Division 09: Ready Goods & Export Carton Packing** (`/ready-goods`)

All divisions strictly conform to the **Industrial Luxury** aesthetic defined in [`docs_logic/design.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_logic/design.md) (Palette `#3A3564` Indigo Night, `#FAF7F0` Cream Canvas, `#FFFFFF` crisp encapsulated cards, `#09090B` Ink, and semantic status badge pastels).

---

## 1. Module Hub Architecture & Visual Synchronization (`/modules`)

### 1.1 Card Border & Synced Kinetic Orbit Point
- **Structural Styling**:
  - The division cards (`/modules`) feature a slim, crisp dark border (`border border-slate-900/35`) and rounded corners (`rounded-2xl` / `16px`).
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
3. `/merchandising/zigza-ai` (Merchandising & Sourcing Desk)
4. `/cutting/zigza-ai` (Cutting & Lay Floor Operations)
5. `/printing/zigza-ai` (Screen & Digital Printing Unit)
6. `/embroidery/zigza-ai` (Multi-Head Embroidery Operations)
7. `/stitching-sewing/zigza-ai` (Stitching, Sewing & Floor Control)
8. `/washing/zigza-ai` (Industrial Washing Plant)
9. `/factory/zigza-ai` (Factory Floor Operations)
10. `/brands/zigza-ai` (Brand Commercial Portals)

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
- **Tailored Quick Prompts & Division Context**:
  - Each division AI view provides domain-specific quick query suggestions (e.g., tech-pack POM tolerances for Design, BOM variance queries for Merchandising, marker utilization for Cutting, mesh counts & oven temperature checks for Printing).

---

## 3. Division 01: Design & Tech-Pack Studio (`/design`)

### 3.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 7-item navigation structure for the `/design` portal:
- **Workspace Hub**: `All Modules` (`/modules`)
- **1. Design Studio**:
  - `Studio Dashboard` (`/design`)
  - `Tech-Pack Catalog` (`/design/tech-packs`)
  - `Sample Approvals (PPS)` (`/design/sample-approvals`)
  - `Size Grading Matrix` (`/design/grading-matrix`)
  - `Fabric & Trims Library` (`/design/materials-library`)
  - `Zigza AI` (`/design/zigza-ai`)
- **Account**: `Studio Profile` (`/design/profile`)

### 3.2 Studio Dashboard (`/design`)
- **File**: [`src/app/design/components/DesignDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/components/DesignDashboardClient.tsx)
- **KPI Metrics**: Active Tech-Packs, Sample Fit Approvals, Size Grading Matrix, PPS Readiness.
- **Active Pipeline Queue**: Tabbed filters (`ALL`, `APPROVED_BULK`, `PPS_SUBMITTED`, `SAMPLE_DEV`, `REVISE_FIT`, `DRAFT`) with full-text search.

### 3.3 Tech-Pack Master Catalog (`/design/tech-packs`)
- **File**: [`src/app/design/tech-packs/components/TechPackCatalogClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/tech-packs/components/TechPackCatalogClient.tsx)
- **Dual-View Switcher**: Visual CAD Gallery & Detailed Spec Table.
- **Version History Diff Engine**: Compares measurement deltas between revisions.
- **Form 1 (2-Step Stepper Modal)**: Garment meta, base size, shell fabric, GSM, target cut date, and ISO 4915 seam classes.

### 3.4 Sample Approvals & PPS Gate (`/design/sample-approvals`)
- **File**: [`src/app/design/sample-approvals/components/SampleApprovalsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/sample-approvals/components/SampleApprovalsClient.tsx)
- **3-Stage Buyer Fit Pipeline**: Proto Sample &rarr; Size Set Sample &rarr; Pre-Production Sample (PPS).
- **Form 2 (Sample Audit Submission Modal)**: Live ASTM tolerance variance flag if $\Delta > \pm 0.5\text{ cm}$.

### 3.5 Dynamic Size Grading Matrix (`/design/grading-matrix`)
- **File**: [`src/app/design/grading-matrix/components/GradingMatrixClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/grading-matrix/components/GradingMatrixClient.tsx)
- Dynamic sizing support for Adult Alpha (`XS–3XL`), Numeric Jeans (`28–42`), Toddler/Kids (`2T–14`), and Plus Silhouette (`1X–5X`).

### 3.6 Fabric & Trims Library (`/design/materials-library`)
- **File**: [`src/app/design/materials-library/components/MaterialsLibraryClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/materials-library/components/MaterialsLibraryClient.tsx)
- Technical registry for shrinkage telemetry, spirality indexes, yarn counts, and calibrated needles.

---

## 4. Division 02: Merchandising & Sourcing Desk (`/merchandising`)

### 4.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 8-item navigation structure for `/merchandising`:
- **Workspace Hub**: `All Modules` (`/modules`)
- **2. Merchandising**:
  - `Desk Dashboard` (`/merchandising`)
  - `Buyer Purchase Orders` (`/merchandising/orders`)
  - `BOM & Costing Ledgers` (`/merchandising/costing`)
  - `Time & Action (T&A) Planner` (`/merchandising/tna-calendar`)
  - `Trim & Sourcing Requisitions` (`/merchandising/sourcing`)
  - `Shipment & FOB Pipeline` (`/merchandising/shipments`)
  - `Zigza AI` (`/merchandising/zigza-ai`)
- **Account**: `Desk Profile` (`/merchandising/profile`)

### 4.2 Desk Dashboard (`/merchandising`)
- **File**: [`src/app/merchandising/components/MerchandisingDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/components/MerchandisingDashboardClient.tsx)
- **Executive KPI Cards**: Active Buyer POs (14 Orders), BOM Cost Realization (98.2%), Trim In-Stock (100%), On-Time Delivery (97.8%).
- **Critical Path Health Monitor**: Real-time progress across Lab Dips, Fabric Inward, PPS, Cut, and Vessel ETD.

### 4.3 Buyer Purchase Orders & Size-Color Matrix (`/merchandising/orders`)
- **Files**: [`OrdersCatalogClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/orders/components/OrdersCatalogClient.tsx), [`CreateOrderModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/orders/components/CreateOrderModal.tsx)
- **Form 1 (2-Step Stepper)**: Validates $\sum (\text{Matrix Quantities}) = \text{Target Order Quantity}$.

### 4.4 BOM & Costing Ledgers (`/merchandising/costing`)
- **Files**: [`BomCostingClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/costing/components/BomCostingClient.tsx), [`CreateCostingModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/costing/components/CreateCostingModal.tsx)
- **Formulas**: Direct Subtotal + 12% Factory Overhead. Cost variance flag on $> 2.0\%$.

### 4.5 Time & Action (T&A) Planner (`/merchandising/tna-calendar`)
- **Files**: [`TnaPlannerClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/tna-calendar/components/TnaPlannerClient.tsx), [`UpdateTnaMilestoneModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/tna-calendar/components/UpdateTnaMilestoneModal.tsx)
- 8 Standard Critical Path Milestone Gates: Lab dip, PPS, fabric inward, trims inward, cut, sew, AQL, container stuffing.

### 4.6 Trim & Sourcing Requisitions (`/merchandising/sourcing`)
- **Files**: [`SourcingRequisitionsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/sourcing/components/SourcingRequisitionsClient.tsx), [`CreateRequisitionModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/sourcing/components/CreateRequisitionModal.tsx)
- Procurement requisition pipeline with vendor lead times and store receiving states.

### 4.7 Shipment & FOB Pipeline (`/merchandising/shipments`)
- **Files**: [`ShipmentPipelineClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/shipments/components/ShipmentPipelineClient.tsx), [`BookShipmentModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/shipments/components/BookShipmentModal.tsx)
- Container logistics (20ft, 40ft HC, LCL), forwarder, vessel, CBM volume, and sailing tracking.

---

## 5. Division 03: Cutting & Lay Floor Operations (`/cutting`)

### 5.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 11-item navigation structure for `/cutting`:
- `Floor Dashboard` (`/cutting`)
- `Fabric Relaxation Staging` (`/cutting/fabric-relaxation`)
- `Spreading & Lay Plans` (`/cutting/lay-sheets`)
- `CAD Markers & Nesting` (`/cutting/markers`)
- `Cutting Orders & Queue` (`/cutting/orders`)
- `Bundle Tickets & Barcodes` (`/cutting/bundles`)
- `Cut Panel QC Audits` (`/cutting/panel-qc`)
- `End-Loss & Remnants` (`/cutting/end-loss`)
- `Reports & Analytics` (`/cutting/reports`)
- `Zigza AI` (`/cutting/zigza-ai`)
- `Division Profile` (`/cutting/profile`)

### 5.2 Implemented Floor Components & Features
- **Floor Dashboard**: 4 active spreading tables, auto-cutter telemetry, daily volume counter (8,240 Pcs), 88.4% marker efficiency.
- **Fabric Relaxation**: ASTM D3887 24–48h conditioning ledger, nominal vs tested GSM, air-conditioned staging bays.
- **Lay Plans**: Multi-roll spreading, ply counting (80 plies), expected pieces formula $\text{Total Plies} \times \sum (\text{Ratio})$.
- **CAD Markers**: Gerber/Lectra yield metrics ($\ge 86.5\%$), grainline constraints (`ONE_WAY`, `EITHER_WAY`, `FACE_TO_FACE`).
- **Cutting Orders Queue**: Live shift progression: `QUEUED` &rarr; `SPREADING` &rarr; `CUTTING` &rarr; `INSPECTED` &rarr; `BUNDLED`.
- **Bundle QR Station**: Zero Ghost Piece thermal QR barcode tickets (20–50 cut pieces/pack) with handovers to 04 Printing, 05 Embroidery, 06 Sewing.
- **Cut Panel QC**: ASTM notch depth ($\pm 1\text{ mm}$), top-to-bottom ply deflection ($\le 1.5\text{ mm}$), pass/recut verdicts.
- **End-Loss Remnants**: Remnant tracking codes (`REM-2026-01`), scrap allocation, pocket trimming salvage.
- **Reports & Analytics**: Style yield, machine blade hours, defect pareto, and CSV download.
- **Zero-Regression Storage**: Created [`cuttingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/cuttingStorage.ts) with `'use client'` and defensive `Array.isArray()` fallbacks, completely resolving Turbopack HMR export caching errors.

---

## 6. Division 04: Screen & Digital Printing Unit (`/printing`)

### 6.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 8-item navigation structure for `/printing`:
- **Workspace Hub**: `All Modules` (`/modules`)
- **4. Printing Division**:
  - `Floor Dashboard` (`/printing`)
  - `Screen & Stencil Library` (`/printing/screens`)
  - `Table Batch Queue & DTG` (`/printing/table-runs`)
  - `Strike-Off Lab Approvals` (`/printing/strike-offs`)
  - `Ink Kitchen & Recipes` (`/printing/ink-kitchen`)
  - `Curing Oven & Fastness QC` (`/printing/curing-qc`)
  - `Zigza AI` (`/printing/zigza-ai`)
- **Account**: `Division Profile` (`/printing/profile`)

### 6.2 Print Floor Dashboard (`/printing`)
- **Files**:
  - Server Page: [`src/app/printing/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/page.tsx)
  - Client Component: [`src/app/printing/components/PrintingDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/components/PrintingDashboardClient.tsx)
- **Executive Metric KPI Cards**:
  1. `Active Table Lots`: **8 Conveyor Tables** (Continuous rotary passes running)
  2. `Panels Printed Today`: **7,450 Pcs** (Against planned target, 0.9% rejection rate)
  3. `Strike-Off Approval Rate`: **100% Passed** ($\Delta E \le 0.85$ average against Pantone TCX standard)
  4. `Screen Stencil Ready`: **4 / 5 Screens** (120–305 mesh exposed & tension checked)
- **Active Conveyor Table & DTG Units Status Matrix**:
  - Real-time station cards for `Table 01` (60m Conveyor, Plastisol running), `Table 02` (Water-based completed), `DTG Unit 01` (Kornit Atlas, Digital running), and `Table 03` (Manual Vacuum, High-Density setup).
  - Shows stroke speed (CPM), job progress percentage bar, and live oven temperature probe readout (160°C verified).

### 6.3 Screen & Stencil Library (`/printing/screens`)
- **Files**:
  - Server Page: [`src/app/printing/screens/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/screens/page.tsx)
  - Client Component: [`src/app/printing/screens/components/ScreensClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/screens/components/ScreensClient.tsx)
  - Modal Form: [`src/app/printing/screens/components/CreateScreenModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/screens/components/CreateScreenModal.tsx)
- **Technical Capabilities**:
  - Full catalog of photo-emulsion screens with mesh counts from 120T (heavy underbase/fleece) up to 305T (micro-detail typography).
  - Frame tension tracking in Newtons per centimeter (N/cm) with green/amber threshold indicators ($> 22\text{ N/cm}$ standard).
  - Separation channels (Base White, Highlight Silver Blue, Sunset Orange, Fine Detail Black).
  - Physical warehouse slot indexing (`Rack S-01 / Bin 04`).
  - Interactive status transitions: `READY_FOR_PRINT` &rarr; `IN_USE` &rarr; `NEEDS_RECLAMATION` &rarr; `DAMAGED_MESH`.

### 6.4 Table Batch Queue & DTG Runs (`/printing/table-runs`)
- **Files**:
  - Server Page: [`src/app/printing/table-runs/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/table-runs/page.tsx)
  - Client Component: [`src/app/printing/table-runs/components/TableRunsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/table-runs/components/TableRunsClient.tsx)
  - Modal Form 1: [`src/app/printing/table-runs/components/StartRunModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/table-runs/components/StartRunModal.tsx)
  - Modal Form 2: [`src/app/printing/table-runs/components/LogProductionModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/table-runs/components/LogProductionModal.tsx)
- **Form 2 (Shift Production & Rejection Log Gate)**:
  - Directly updates `panels_completed` and `panels_rejected` for active jobs.
  - Root cause categorization for scrap re-cutting: `SMUDGE`, `BLEED`, `OFF_REGISTRATION`, `CURING_SCORCH`, `PINHOLE_LEAK`, `POOR_COVERAGE`.
  - Checkbox for verified thermal strip probe reading (160°C).

### 6.5 Strike-Off Lab Approvals (`/printing/strike-offs`)
- **Files**:
  - Server Page: [`src/app/printing/strike-offs/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/strike-offs/page.tsx)
  - Client Component: [`src/app/printing/strike-offs/components/StrikeOffsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/strike-offs/components/StrikeOffsClient.tsx)
  - Modal Form: [`src/app/printing/strike-offs/components/SubmitStrikeOffModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/strike-offs/components/SubmitStrikeOffModal.tsx)
- **Form 1 (Strike-Off Color Approval Gate)**:
  - Pre-bulk authorization standard enforcing **Delta E $\le 1.00$** color difference against Pantone TCX digital swatches using spectrophotometer readings.
  - 100% stretch elastic elongation test without ink surface micro-cracking.
  - AATCC 61 50-wash crocking rating (scale 1.0 to 5.0).
  - Validation rule: Form strictly blocks approving a strike-off if $\Delta E > 1.00$ or stretch test fails, preventing bulk color rejections.

### 6.6 Ink Kitchen & Recipe Formulations (`/printing/ink-kitchen`)
- **Files**:
  - Server Page: [`src/app/printing/ink-kitchen/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/ink-kitchen/page.tsx)
  - Client Component: [`src/app/printing/ink-kitchen/components/InkKitchenClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/ink-kitchen/components/InkKitchenClient.tsx)
  - Modal Form: [`src/app/printing/ink-kitchen/components/CreateRecipeModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/ink-kitchen/components/CreateRecipeModal.tsx)
- **Formulation Chemistry & Ledger**:
  - Exact 1,000g batch formulation calculator: Base Binder (g), Pigment Concentrate (g), Fixer / Cross-Linker (g), Retarder (g).
  - Dynamic formulation total sum feedback and viscosity in Centipoise (`cps`).
  - Strict environmental certification tagging: `OEKO-TEX Standard 100`, `GOTS 6.0`, `ZDHC Level 3`.

### 6.7 Curing Oven & Fastness QC (`/printing/curing-qc`)
- **Files**:
  - Server Page: [`src/app/printing/curing-qc/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/curing-qc/page.tsx)
  - Client Component: [`src/app/printing/curing-qc/components/CuringQcClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/curing-qc/components/CuringQcClient.tsx)
  - Modal Form: [`src/app/printing/curing-qc/components/LogCuringProbeModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/curing-qc/components/LogCuringProbeModal.tsx)
- **Thermal Calibration SLA**:
  - Monitors Continuous Tunnel Oven #1 (Gas Infrared) and Tunnel Oven #2 (Electric High-Airflow) at $160^\circ\text{C} \pm 3^\circ\text{C}$.
  - Conveyor belt speed ($2.8–3.0\text{ m/min}$) and dwell chamber duration ($2.5\text{ mins}$) to ensure complete ink cross-linking without scorch.
  - Automatic status categorization: `OPTIMAL` ($\le 3^\circ\text{C}$ variance), `TEMP_WARNING` ($3–5^\circ\text{C}$ variance), and `CRITICAL` ($> 5^\circ\text{C}$ variance).

### 6.8 Storage & Event Synchronization Architecture
- **Dedicated Client Storage Module**: [`src/app/printing/utils/printingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/utils/printingStorage.ts)
  - Marked explicitly with `'use client'`.
  - Defensive `Array.isArray()` fallbacks for all local storage parse operations.
  - Custom Event Bus: Emits `zigza:printing_updated` (`PRINTING_UPDATE_EVENT`) on every mutation. All open views, table lists, and modals re-render synchronously without page reloads.

### 6.9 Database Schema Blueprint (PostgreSQL / Supabase)
```sql
-- 1. Printing Production Runs
CREATE TABLE printing_production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  table_number VARCHAR(60) NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  technique VARCHAR(40) NOT NULL, -- PLASTISOL, WATER_BASED, DISCHARGE, DTG, PUFF, HIGH_DENSITY
  pantone_codes TEXT[] NOT NULL,
  total_panels_issued INTEGER NOT NULL CHECK (total_panels_issued > 0),
  panels_completed INTEGER NOT NULL DEFAULT 0,
  panels_rejected INTEGER NOT NULL DEFAULT 0,
  defect_reason VARCHAR(60), -- SMUDGE, BLEED, OFF_REGISTRATION, CURING_SCORCH, PINHOLE_LEAK
  curing_temp_c INTEGER DEFAULT 160,
  curing_temp_verified BOOLEAN DEFAULT FALSE,
  stroke_speed_cpm INTEGER,
  status VARCHAR(30) DEFAULT 'PRINTING', -- QUEUED, PRINTING, CURING, COMPLETED, QUARANTINED
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Screen & Stencil Library
CREATE TABLE printing_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_code VARCHAR(50) NOT NULL UNIQUE,
  artwork_ref VARCHAR(100) NOT NULL,
  color_separation VARCHAR(80) NOT NULL,
  mesh_count INTEGER NOT NULL, -- 120, 160, 180, 200, 230, 280, 305
  tension_newtons NUMERIC(4,1) NOT NULL,
  emulsion_type VARCHAR(100) NOT NULL,
  frame_material VARCHAR(30) DEFAULT 'ALUMINUM',
  rack_location VARCHAR(60) NOT NULL,
  status VARCHAR(30) DEFAULT 'READY_FOR_PRINT', -- READY_FOR_PRINT, IN_USE, NEEDS_RECLAMATION, DAMAGED_MESH
  exposures_count INTEGER DEFAULT 0,
  last_exposure_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Strike-Off Lab Approvals (Form 1)
CREATE TABLE printing_strike_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  pantone_target VARCHAR(80) NOT NULL,
  technique VARCHAR(40) NOT NULL,
  spectro_delta_e NUMERIC(4,2) NOT NULL, -- Must be <= 1.00 to pass
  curing_temp_c INTEGER DEFAULT 160,
  stretch_test_pass BOOLEAN DEFAULT TRUE,
  wash_fastness_rating NUMERIC(3,1) NOT NULL, -- 1.0 to 5.0 scale
  crocking_test_pass BOOLEAN DEFAULT TRUE,
  approval_status VARCHAR(30) DEFAULT 'APPROVED', -- APPROVED, REVISE_RECIPE, REJECTED, PENDING_LAB
  auditor_name VARCHAR(100) NOT NULL,
  remarks TEXT,
  tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ink Kitchen & Recipes
CREATE TABLE printing_ink_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_code VARCHAR(50) NOT NULL UNIQUE,
  color_name VARCHAR(100) NOT NULL,
  pantone_code VARCHAR(80) NOT NULL,
  technique VARCHAR(40) NOT NULL,
  base_binder_grams NUMERIC(6,1) NOT NULL,
  pigment_concentrate_grams NUMERIC(6,1) NOT NULL,
  fixer_crosslinker_grams NUMERIC(6,1) NOT NULL,
  retarder_grams NUMERIC(6,1) NOT NULL,
  viscosity_cps INTEGER NOT NULL,
  eco_compliance VARCHAR(60) DEFAULT 'OEKO-TEX Standard 100',
  prepared_by VARCHAR(100) NOT NULL,
  batch_volume_kg NUMERIC(6,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Curing Oven Thermal Logs
CREATE TABLE printing_curing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_number VARCHAR(50) NOT NULL UNIQUE,
  oven_id VARCHAR(100) NOT NULL,
  target_temp_c NUMERIC(5,1) DEFAULT 160.0,
  probe_temp_c NUMERIC(5,1) NOT NULL,
  conveyor_speed_mpm NUMERIC(4,1) NOT NULL,
  dwell_time_minutes NUMERIC(4,1) NOT NULL,
  active_run_id UUID REFERENCES printing_production_runs(id) ON DELETE SET NULL,
  wash_test_cycles INTEGER DEFAULT 50,
  fastness_rating NUMERIC(3,1) DEFAULT 4.5,
  auditor_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'OPTIMAL', -- OPTIMAL, TEMP_WARNING, CRITICAL
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Division 05: Multi-Head Embroidery Unit (`/embroidery`)

### 7.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 8-item navigation structure for `/embroidery`:
- **Workspace Hub**: `All Modules` (`/modules`)
- **5. Embroidery Division**:
  - `Floor Dashboard` (`/embroidery`)
  - `DST Punch File Library` (`/embroidery/punch-library`)
  - `Machine Runs & Hooping` (`/embroidery/machine-runs`)
  - `Stitch Count & Billing` (`/embroidery/stitch-billing`)
  - `Thread Store & Cones Log` (`/embroidery/thread-store`)
  - `Quality & Thread Break QC` (`/embroidery/embroidery-qc`)
  - `Zigza AI` (`/embroidery/zigza-ai`)
- **Account**: `Division Profile` (`/embroidery/profile`)

### 7.2 Floor Dashboard (`/embroidery`)
- **Files**:
  - Server Page: [`src/app/embroidery/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/page.tsx)
  - Client Component: [`src/app/embroidery/components/EmbroideryDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/components/EmbroideryDashboardClient.tsx)
- **Executive Metric KPI Cards**:
  1. `Active 20-Head Lines`: **10 Automated Lines** (200 Computerized Heads active)
  2. `Daily Stitch Throughput`: **1.85 Million Stitches** (Real-time shift cumulative)
  3. `Thread Break Frequency (TBF)`: **0.02%** (< 0.03% ASTM standard threshold)
  4. `DST Punch Library`: **Approved Tajima / Barudan Stitch Files**
- **Machine Floor Grid**:
  - Real-time telemetry monitoring 10 computerized multi-head machines (Tajima TFMX, Barudan, SWF).
  - Tracks running DST punch file, buyer PO, active operator, RPM speed gauge (850–920 RPM), active heads count, thread break frequency, and shift cycle progress percentage bar.

### 7.3 DST Punch File Library (`/embroidery/punch-library`)
- **Files**:
  - Server Page: [`src/app/embroidery/punch-library/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/punch-library/page.tsx)
  - Client Component: [`src/app/embroidery/punch-library/components/PunchLibraryClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/punch-library/components/PunchLibraryClient.tsx)
  - Modal: **Form 1** [`UploadPunchModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/punch-library/components/UploadPunchModal.tsx)
- **Form 1 Technical Implementation**:
  - Registers machine binary stitch files (`.DST`, `.DSB`) with stitch density bounds (500 to 250,000 stitches).
  - Captures needle color stop sequences (1 to 15 stops), frame dimensions (mm), thread manufacturer (`Madeira`, `Isacord`, `Coats`, `Vardhman`), and backing stabilizer specification (`Tear-Away 40 GSM`, `Cut-Away 60 GSM`, `Water Soluble`).
  - Interactive DST inspector modal visualizing stitch density breakdown and needle sequences.

### 7.4 Machine Runs & Frame Hooping (`/embroidery/machine-runs`)
- **Files**:
  - Server Page: [`src/app/embroidery/machine-runs/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/machine-runs/page.tsx)
  - Client Component: [`src/app/embroidery/machine-runs/components/MachineRunsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/machine-runs/components/MachineRunsClient.tsx)
  - Modal 1: **Form 2** [`CompleteRunModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/machine-runs/components/CompleteRunModal.tsx)
  - Modal 2: [`StartRunModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/machine-runs/components/StartRunModal.tsx)
- **Form 2 Technical Implementation**:
  - Directly commits to `embroidery_machine_runs` recording `panels_completed`, `thread_breaks_count`, and machine odometer reading `total_stitches_run`.
  - Termination status validation: `COMPLETED`, `RUNNING`, `PAUSED_NEEDLE_ERROR`, `MAINTENANCE`.
  - Launches new 20-head runs with backing stabilizer specifications and RPM calibration.

### 7.5 Stitch Count & Jobwork Billing Ledgers (`/embroidery/stitch-billing`)
- **Files**:
  - Server Page: [`src/app/embroidery/stitch-billing/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/stitch-billing/page.tsx)
  - Client Component: [`src/app/embroidery/stitch-billing/components/StitchBillingClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/stitch-billing/components/StitchBillingClient.tsx)
  - Modal: [`CreateBillingModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/stitch-billing/components/CreateBillingModal.tsx)
- **Commercial Piece-Rate Formula**:
  $$\text{Unit Embroidery Cost} = \left(\frac{\text{Stitch Count}}{1,000}\right) \times \text{Rate per 1k (e.g. ₹2.80)} + \text{Backing Paper Cost}$$
  $$\text{Total Invoice Amount} = \text{Total Pieces} \times \text{Unit Embroidery Cost}$$
- **Features**: One-click CSV ledger export, buyer-level piece-rate auditing, and billing statuses (`PENDING_AUDIT`, `APPROVED`, `INVOICED`).

### 7.6 Thread Store & Cones Log (`/embroidery/thread-store`)
- **Files**:
  - Server Page: [`src/app/embroidery/thread-store/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/thread-store/page.tsx)
  - Client Component: [`src/app/embroidery/thread-store/components/ThreadStoreClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/thread-store/components/ThreadStoreClient.tsx)
  - Modal: [`AddThreadConeModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/thread-store/components/AddThreadConeModal.tsx)
- **Features**: Spool weight consumption meters (initial vs current grams), shade matching against Pantone TCX standards, storage shelf allocation (Racks E-01 to E-04), and automatic low stock alerts (< 5 cones).

### 7.7 Quality & Thread Break QC (`/embroidery/embroidery-qc`)
- **Files**:
  - Server Page: [`src/app/embroidery/embroidery-qc/page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/embroidery-qc/page.tsx)
  - Client Component: [`src/app/embroidery/embroidery-qc/components/EmbroideryQcClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/embroidery-qc/components/EmbroideryQcClient.tsx)
  - Modal: [`LogThreadBreakModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/embroidery-qc/components/LogThreadBreakModal.tsx)
- **Features**: Head 1–20 root cause logging: `BIRD_NESTING`, `NEEDLE_BREAKAGE`, `TENSION_LOOPING`, `HOOP_DISTORTION`, `MISSED_STITCH`, `JUMP_TRIM_STRAY`. Tracks corrective maintenance actions (needle replacement, tension spring calibration, rotary hook lint clearing) and auditor sign-offs.

### 7.8 PostgreSQL Database Schema Blueprint
```sql
-- 1. Digitized Stitch Files (DST / DSB)
CREATE TABLE embroidery_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_code VARCHAR(60) NOT NULL UNIQUE,
  design_name VARCHAR(120) NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  total_stitches INTEGER NOT NULL CHECK (total_stitches BETWEEN 500 AND 250000),
  color_stops_count INTEGER NOT NULL CHECK (color_stops_count BETWEEN 1 AND 15),
  dst_file_name VARCHAR(120) NOT NULL,
  rate_per_thousand_stitches NUMERIC(6,2) DEFAULT 2.80,
  backing_type VARCHAR(50) NOT NULL, -- Tear-Away 40 GSM, Cut-Away 60 GSM, Water Soluble
  thread_brand VARCHAR(50) NOT NULL, -- Madeira, Isacord, Coats, Vardhman
  status VARCHAR(30) DEFAULT 'APPROVED',
  width_mm NUMERIC(6,2),
  height_mm NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Machine Shift Production Runs (Form 2)
CREATE TABLE embroidery_machine_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) NOT NULL UNIQUE,
  machine_number VARCHAR(60) NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  design_id UUID REFERENCES embroidery_designs(id) ON DELETE RESTRICTED,
  design_code VARCHAR(60) NOT NULL,
  order_po VARCHAR(60) NOT NULL,
  panels_loaded INTEGER NOT NULL,
  panels_completed INTEGER NOT NULL DEFAULT 0,
  thread_breaks_count INTEGER NOT NULL DEFAULT 0,
  total_stitches_run BIGINT NOT NULL DEFAULT 0,
  rpm_speed INTEGER DEFAULT 880,
  active_heads INTEGER DEFAULT 20,
  total_heads INTEGER DEFAULT 20,
  backing_spec VARCHAR(100) NOT NULL,
  status VARCHAR(40) DEFAULT 'RUNNING', -- QUEUED, RUNNING, COMPLETED, PAUSED_NEEDLE_ERROR, MAINTENANCE
  run_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Commercial Stitch Billing Ledgers
CREATE TABLE embroidery_billing_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_code VARCHAR(50) NOT NULL UNIQUE,
  order_po VARCHAR(60) NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  design_code VARCHAR(60) NOT NULL,
  total_pieces INTEGER NOT NULL,
  stitch_count_per_piece INTEGER NOT NULL,
  total_stitches_billed BIGINT NOT NULL,
  rate_per_thousand NUMERIC(6,2) NOT NULL,
  backing_cost_per_piece NUMERIC(6,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  billing_status VARCHAR(30) DEFAULT 'PENDING_AUDIT', -- PENDING_AUDIT, APPROVED, INVOICED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Thread Cone Inventory Ledger
CREATE TABLE embroidery_thread_cones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cone_code VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(50) NOT NULL,
  shade_number VARCHAR(80) NOT NULL,
  pantone_match VARCHAR(80) NOT NULL,
  thread_type VARCHAR(60) NOT NULL,
  initial_weight_grams INTEGER NOT NULL,
  current_weight_grams INTEGER NOT NULL,
  cones_in_stock INTEGER NOT NULL,
  storage_bin VARCHAR(60) NOT NULL,
  status VARCHAR(30) DEFAULT 'IN_STOCK', -- IN_STOCK, LOW_STOCK, EXHAUSTED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Thread Break & Quality Audits
CREATE TABLE embroidery_qc_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_code VARCHAR(50) NOT NULL UNIQUE,
  run_id UUID REFERENCES embroidery_machine_runs(id) ON DELETE CASCADE,
  machine_number VARCHAR(50) NOT NULL,
  head_number INTEGER NOT NULL CHECK (head_number BETWEEN 1 AND 20),
  defect_type VARCHAR(50) NOT NULL,
  severity VARCHAR(30) NOT NULL, -- CRITICAL, MAJOR, MINOR
  action_taken TEXT NOT NULL,
  auditor_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Division 06: Stitching & Sewing Floor (Core MES Benchmark)

### 8.1 Executive & Operational Scope
The **Stitching & Sewing Floor** is the core assembly engine and master operational benchmark of the Zigza MES platform. It is 100% connected to live Supabase backend tables with referential integrity. It enforces the **Zero Ghost Piece Guarantee**: every single cut piece entered into a sewing line is accounted for through progressive workstation allotments, lineman piece-rate wage calculation ledgers, 3-stage QC auditing, and direct store godown handshakes.

### 8.2 Complete Side Navigation Architecture (4-Tier / 13-Route System)
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the complete 4-tier navigation structure:
- **Tier 1: Workspace Hub**:
  - `All Modules` (`/modules`)
- **Tier 2: 6. Sewing Operations**:
  - `Floor Dashboard` (`/stitching-sewing/dashboard`)
  - `Store Dashboard & Inward` (`/stitching-sewing/store`)
  - `Zigza AI Copilot` (`/stitching-sewing/zigza-ai`)
- **Tier 3: Production Execution**:
  - `Production Chart & Orders` (`/stitching-sewing/production-orders`)
  - `Target Allotments & Bundles` (`/stitching-sewing/allotments`)
  - `Godown & WIP Inventory` (`/stitching-sewing/inventory`)
  - `Dispatch & Challans Hub` (`/stitching-sewing/dispatch`)
- **Tier 4: Master Management**:
  - `Supervisor Profile` (`/stitching-sewing/profile`)
  - `Brands & Multi-Vendors` (`/stitching-sewing/vendors`)
  - `Floor Employees & Linemen` (`/stitching-sewing/employees`)
  - `Articles Master Catalog` (`/stitching-sewing/articles`)
  - `Reports & Analytics Audit` (`/stitching-sewing/reports`)

### 8.3 Implemented Floor Components & Features

1. **Master Floor Dashboard (`/stitching-sewing/dashboard`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/stitching-sewing/dashboard/page.tsx), [`DashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/DashboardClient.tsx)
   - **6-Stage Progressive Throughput Pipeline**:
     $$\text{Stage 1: Total Stocks} \to \text{Stage 2: Goods in Line} \to \text{Stage 3: Mending \& Checking} \to \text{Stage 4: Ready Goods} \to \text{Stage 5: RTO} \to \text{Stage 6: Ready Delivery}$$
   - Real-time TV View Mode toggle (`TvViewButton`) for shopfloor display monitors.
   - Multi-stage concurrent data synthesis from `articles`, `allotments`, `challans`, `daily_product`, `qc_logs`, `store_transactions`, `delivery_challans`, and `worker_assignments`.

2. **Store Dashboard & Receiving (`/stitching-sewing/store`)**:
   - Inward truck gate GRN logs (vehicle, party, rolls, transport slip).
   - Lineman trim/thread cone issuance and floor reissue/scrap exchange workflows.

3. **Production Chart & Challan Hub (`/stitching-sewing/production-orders`)**:
   - Vendor challan scheduling, multi-tier brand/vendor dropdowns, Excel order imports, and status tracking.

4. **Target Allotments (`/stitching-sewing/allotments`)**:
   - Individual lineman bundle allocation, size-tier matrix expansion, and live wage calculation:
     $$\text{Lineman Shift Wages} = \text{Verified Passed Pcs} \times \text{Article Stitching Rate (₹)}$$
   - Mending and QC inspection handovers.

5. **Godown & WIP Inventory (`/stitching-sewing/inventory`)**:
   - Real-time stock visibility across cut goods, WIP on line, and finished cartons.

6. **Dispatch & Challans (`/stitching-sewing/dispatch`)**:
   - Outward delivery challan generation for goods moving to Washing, Steam Ironing, or Central Godown.

7. **Brands & Multi-Vendors (`/stitching-sewing/vendors`)**:
   - Segregation of Principal Buyers (`brands` table) from Job-Workers (`vendors` table) with stitching rate defaults.

8. **Floor Employees & Linemen (`/stitching-sewing/employees`)**:
   - Lineman skill grades (Grade A Tailor, Overlock Master) and wage rate profiles.

9. **Articles Master Catalog (`/stitching-sewing/articles`)**:
   - Garment style repository with SAM minutes, default stitching rate, and size-specific pricing tiers (`size_rates`).

10. **Reports & Analytics (`/stitching-sewing/reports`)**:
    - Shift productivity exports, lineman wage summaries, rejection Pareto charts, and date-range CSV dumps.

11. **Dedicated Zigza AI (`/stitching-sewing/zigza-ai`)**:
    - Lineman wage audits, line-wise SAM velocity queries, and open challan aging diagnostics.

### 8.4 Complete Forms Catalog (All 9 Production Forms)
1. **Form 1: Delivery Challan Creation & Excel Import Form** (`/stitching-sewing/production-orders`)
2. **Form 2: New Article Registration Form** (`/stitching-sewing/articles`)
3. **Form 3: Daily Target Allotment Form** (`/stitching-sewing/allotments`) — Foreign Key bound to `employees.id` and `cutting_bundles.id`
4. **Form 4: Store Truck Inward (GRN) Form** (`/stitching-sewing/store`)
5. **Form 5: Accessory & Trim Allotment Form** (`/stitching-sewing/store`)
6. **Form 6: Floor Reissue & Scrap Exchange Form** (`/stitching-sewing/store`)
7. **Form 7A: Principal Buyer Brand Registration Form** (`/stitching-sewing/vendors`)
8. **Form 7B: Sub-Contract Vendor Registration Form** (`/stitching-sewing/vendors`)
9. **Form 8: Outward Delivery Challan & Dispatch Form** (`/stitching-sewing/dispatch`)

### 8.5 PostgreSQL Database Schema Reference (Live Backend Tables)
```sql
-- 1. Master Brands (Principal Buyers / Retailers)
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_code VARCHAR(30) NOT NULL UNIQUE,
  brand_name VARCHAR(100) NOT NULL UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  city VARCHAR(50) DEFAULT 'Kolkata',
  address TEXT,
  gstin VARCHAR(30),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Vendors & Sub-Contract Units (Job-Workers & Suppliers)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code VARCHAR(50) NOT NULL UNIQUE,
  vendor_name VARCHAR(100) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name VARCHAR(100),
  vendor_type VARCHAR(50) DEFAULT 'STITCHING_JOB_WORK',
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  city VARCHAR(50) DEFAULT 'Kolkata',
  address TEXT,
  gst_no VARCHAR(30),
  stitching_rate NUMERIC(8,2) DEFAULT 20.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Employees & Linemen Master
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  skill_grade VARCHAR(10) DEFAULT 'GRADE_A',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Core Production Articles & SAM Specs
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  art_no VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  stitching_rate NUMERIC(8,2) DEFAULT 0,
  size_rates JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Production Allotments (Zero Ghost Piece Binding)
CREATE TABLE allotments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID REFERENCES challans(id) ON DELETE CASCADE,
  bundle_id UUID, -- Bound to cutting_bundles.id
  lineman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  target_qty INTEGER NOT NULL,
  allotment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(40) DEFAULT 'PENDING_STITCHING',
  mending_status VARCHAR(40),
  mending_total_counted INTEGER DEFAULT 0,
  qc_status VARCHAR(40),
  qc_total_passed INTEGER DEFAULT 0,
  qc_total_alter INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quality Control Inspection Logs (3-Stage Audits)
CREATE TABLE qc_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allotment_id UUID REFERENCES allotments(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  qty_passed INTEGER NOT NULL DEFAULT 0,
  qty_rejected INTEGER NOT NULL DEFAULT 0,
  stage VARCHAR(50) NOT NULL, -- INLINE, END_OF_LINE, FINISHING
  defect_type VARCHAR(100),
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Store & Godown Transactions
CREATE TABLE store_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allotment_id UUID REFERENCES allotments(id) ON DELETE SET NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL, -- INWARD, OUTWARD, RTO, REJECT
  quantity INTEGER NOT NULL,
  party_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Outward Delivery Challans & Gate Passes
CREATE TABLE delivery_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_no VARCHAR(60) NOT NULL UNIQUE,
  buyer_name VARCHAR(100),
  total_pieces INTEGER NOT NULL,
  destination_type VARCHAR(50), -- WASHING, STEAM_IRONING, CENTRAL_GODOWN
  vehicle_no VARCHAR(30),
  driver_name VARCHAR(80),
  status VARCHAR(30) DEFAULT 'DISPATCHED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Division 07: Industrial Washing & Wet Processing

### 9.1 Executive & Operational Scope
The **Industrial Washing & Wet Processing Division (`/washing`)** is responsible for garment hand-feel enhancement, enzymatic bio-polishing, dimensional stabilization, and specialized aesthetic surface treatments. Operating commercial garment wash tumblers (600 kg batch capacity) and high-G hydro extractors, the division executes bio-polishing, silicon softening, vintage stone washes, and desizing cycles.
- **Industry Standards**: AATCC 135 (Dimensional Changes of Fabrics after Home Laundering) / ISO 6330.
- **Standard Liquor Ratio (M:L)**: **$1 : 5.0$** standard ($1\text{ kg dry garment} : 5\text{ Liters water}$).
- **Residual Shrinkage Tolerance**: $\le 1.5\%$ Length $\times \le 1.5\%$ Width (strict zero-defect standard).
- **Auto-Escalation Engine**: Any wash batch exhibiting $> 2.5\%$ shrinkage triggers an automated critical alert to **03 Cutting Floor** to halt lay cutting and apply CAD marker expansion factors.

### 9.2 Complete Side Navigation Architecture (8 Dedicated Views)
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the complete 8-view navigation structure:
- **Tier 1: Workspace Hub**:
  - `All Modules` (`/modules`)
- **Tier 2: 7. Washing Operations**:
  - `01. Washing Dashboard` (`/washing`)
  - `02. Wash Recipes & Chemistry` (`/washing/recipes`)
  - `03. Tumbler & Hydro Runs` (`/washing/machine-runs`)
  - `04. Liquor Ratio & Water Audit` (`/washing/liquor-audit`)
  - `05. Shrinkage & Fastness QC` (`/washing/shrinkage-qc`)
  - `06. Finishing Handover` (`/washing/handover`)
  - `07. Zigza AI Copilot` (`/washing/zigza-ai`)
- **Tier 3: Account**:
  - `08. Division Profile` (`/washing/profile`)

### 9.3 Implemented Floor Components & Features

1. **Master Washing Dashboard (`/washing`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/page.tsx), [`WashingDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/components/WashingDashboardClient.tsx)
   - **4 Master KPI Cards**:
     1. `Active Tumblers`: Running vs total 600 kg industrial drums with dynamic utilization progress bar.
     2. `Daily Wash Volume`: Cumulative pieces processed vs plant daily wet capacity (6,000 pcs).
     3. `Liquor Ratio (M:L)`: Current mean ratio benchmarked against $1:5.0$ eco-conservation target.
     4. `Residual Shrinkage`: AATCC 135 compliance indicator ($< 1.15\%$) and grey-scale colorfastness rating.
   - **Live Machine Floor Matrix**: Visual status cards for Washer 01–06, Hydro 01–04, and Tumbler Dryer 01–04 displaying active batch numbers, recipe formulas, time remaining, drum temperatures, and spin RPM.
   - **Active Batch Queue**: Live status progression (WASHING &rarr; HYDRO &rarr; DRYING &rarr; PASSED/FAILED) with inline stage advance triggers.
   - **Auto-Escalation Banner**: Flashing alert if any lot exceeds the $2.5\%$ shrinkage threshold with direct link to QC audit logs.

2. **Wash Recipes & Chemistry (`/washing/recipes`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/recipes/page.tsx), [`RecipesClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/recipes/components/RecipesClient.tsx), [`CreateRecipeModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/recipes/components/CreateRecipeModal.tsx)
   - Formulation cards specifying Neutral Cellulase Enzyme ($1.5\text{ g/L}$), Acetic Acid Buffer ($0.8\text{ g/L}$), and Micro-Silicon Softener ($2.0\text{ g/L}$) with pH targets ($5.2 - 5.5$), thermal curves, and certified hand-feel benchmarks.
   - Dynamic category filter: `ALL`, `BIO_POLISH`, `SILICON_SOFT`, `VINTAGE_STONE`, `DESIZE_NEUTRALIZE`.

3. **Tumbler & Hydro Runs (`/washing/machine-runs`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/machine-runs/page.tsx), [`MachineRunsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/machine-runs/components/MachineRunsClient.tsx), [`LoadBatchModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/machine-runs/components/LoadBatchModal.tsx)
   - 3-Stage equipment overview: Stage 1 Wash Tumblers (600 kg), Stage 2 Hydro Extractors (900 RPM / 45% moisture reduction), and Stage 3 Tumbler Dryers (65°C controlled curve).
   - Contains **Form 1: Wash Batch Run Logging Form**.

4. **Liquor Ratio & Water Audit (`/washing/liquor-audit`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/liquor-audit/page.tsx), [`LiquorAuditClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/liquor-audit/components/LiquorAuditClient.tsx), [`LogWaterAuditModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/liquor-audit/components/LogWaterAuditModal.tsx)
   - Environmental telemetry: Initial vs final water meter readings, calculated water consumed per kg dry load, and effluent discharge monitoring (pH 6.5–8.0 neutralizer standards).

5. **Shrinkage & Fastness QC Station (`/washing/shrinkage-qc`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/shrinkage-qc/page.tsx), [`ShrinkageQcClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/shrinkage-qc/components/ShrinkageQcClient.tsx), [`RecordShrinkageModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/shrinkage-qc/components/RecordShrinkageModal.tsx)
   - 10-piece statistical dimensional audit per batch.
   - Formula:
     $$\text{Shrinkage \%} = \frac{\text{Pre-Wash Dimension (cm)} - \text{Post-Wash Dimension (cm)}}{\text{Pre-Wash Dimension (cm)}} \times 100$$
   - Contains **Form 2: Shrinkage & Dimensional Audit Form** with live auto-verdict and automated CAD marker expansion notices to 03 Cutting Floor on $> 2.5\%$ shrinkage.

6. **Outward Finishing Handover (`/washing/handover`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/handover/page.tsx), [`HandoverClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/handover/components/HandoverClient.tsx), [`CreateHandoverModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/handover/components/CreateHandoverModal.tsx)
   - Digital gate passes transferring conditioned garments to 08 Steam Ironing & Finishing Floor. Verifies zero dampness, zero chemical odor, and piece count reconciliation against sewing challans.

7. **Zigza AI Copilot (`/washing/zigza-ai`)**:
   - Integrated with [`ZigzaAiClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/zigza-ai/components/ZigzaAiClient.tsx) using portal `'washing'` with domain prompts for enzyme activity, liquor ratio optimization, and shrinkage compensation alerts.

8. **Washing Division Profile (`/washing/profile`)**:
   - [`DivisionProfileView`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/profile/DivisionProfileView.tsx) displaying plant supervisor credentials, equipment capacity (6 Washers • 6 Hydros), and ISO wet processing certifications.

### 9.4 Complete Forms Catalog
1. **Form 1: Wash Batch Run Logging Form** (`/washing/machine-runs` via `LoadBatchModal.tsx`):
   - Fields: `batch_number` (`WB-XXXXX`), `washer_machine_id` (Washer 01–06), `challan_id` (Sewing lot reference), `operator_name`, `dry_weight_kg` (50–650 kg), `recipe_name`, `water_volume_liters` (auto-calculated: $\text{dry\_weight} \times 5.0$), `tumbler_temp_c` (40–85°C), `cycle_duration_minutes`.
2. **Form 2: Shrinkage & Dimensional Audit Form** (`/washing/shrinkage-qc` via `RecordShrinkageModal.tsx`):
   - Fields: `batch_id`, `sample_pieces_tested` (10 pcs), `pre_wash_length_cm`, `post_wash_length_cm`, `pre_wash_width_cm`, `post_wash_width_cm`, `colorfastness_rating` (1.0–5.0), `qc_status` (`PASS`, `MARGINAL_WARN`, `CRITICAL_FAIL`), auto-escalation alert trigger to Cutting CAD station.
3. **Form 3: Create Wash Chemical Recipe Form** (`/washing/recipes` via `CreateRecipeModal.tsx`)
4. **Form 4: Water & Effluent Discharge Audit Form** (`/washing/liquor-audit` via `LogWaterAuditModal.tsx`)
5. **Form 5: Finishing Handover Gate Pass Form** (`/washing/handover` via `CreateHandoverModal.tsx`)

### 9.5 PostgreSQL Database Schema Reference
```sql
-- 1. Washing Batches Master
CREATE TABLE washing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  machine_number VARCHAR(20) NOT NULL,
  operator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  recipe_name VARCHAR(100) NOT NULL,
  dry_weight_kg NUMERIC(6,2) NOT NULL,
  water_liters NUMERIC(8,2) NOT NULL,
  measured_shrinkage_length_pct NUMERIC(4,2),
  measured_shrinkage_width_pct NUMERIC(4,2),
  status VARCHAR(30) DEFAULT 'WASHING', -- WASHING, HYDRO, DRYING, PASSED, FAILED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wash Chemical Recipes
CREATE TABLE washing_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_code VARCHAR(30) NOT NULL UNIQUE,
  recipe_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  enzyme_type VARCHAR(100) NOT NULL,
  enzyme_dose_gpl NUMERIC(4,2) NOT NULL,
  acetic_acid_gpl NUMERIC(4,2) NOT NULL,
  softener_gpl NUMERIC(4,2) NOT NULL,
  temp_c INTEGER NOT NULL DEFAULT 55,
  cycle_minutes INTEGER NOT NULL DEFAULT 45,
  ph_target VARCHAR(20) NOT NULL DEFAULT '5.2 - 5.5',
  liquor_ratio VARCHAR(20) NOT NULL DEFAULT '1 : 5.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shrinkage Threshold Alerts (Auto-Escalation Engine)
CREATE TABLE washing_shrinkage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES washing_batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES merchandising_orders(id),
  measured_shrinkage_pct NUMERIC(4,2) NOT NULL,
  threshold_exceeded_by NUMERIC(4,2) NOT NULL,
  cutting_notified BOOLEAN DEFAULT FALSE,
  resolved_action TEXT, -- e.g. "CAD marker expanded by +1.4cm"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Water Consumption & Effluent Audit Logs
CREATE TABLE washing_water_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date DATE DEFAULT CURRENT_DATE,
  meter_initial INTEGER NOT NULL,
  meter_final INTEGER NOT NULL,
  liters_consumed INTEGER NOT NULL,
  dry_weight_kg NUMERIC(6,2) NOT NULL,
  liquor_ratio NUMERIC(4,2) NOT NULL,
  effluent_ph NUMERIC(3,1) NOT NULL,
  effluent_tds_ppm INTEGER,
  compliance_status VARCHAR(30) DEFAULT 'COMPLIANT',
  auditor_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outward Finishing Handover Gate Passes
CREATE TABLE washing_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handover_code VARCHAR(50) NOT NULL UNIQUE,
  batch_id UUID REFERENCES washing_batches(id) ON DELETE RESTRICTED,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  pieces_transferred INTEGER NOT NULL,
  transferred_to VARCHAR(60) DEFAULT '08. Steam Ironing & Finishing Floor',
  moisture_verified BOOLEAN DEFAULT TRUE,
  odor_free_verified BOOLEAN DEFAULT TRUE,
  piece_count_match BOOLEAN DEFAULT TRUE,
  supervisor_signoff VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Division 08: Ironing & Steam Pressing Floor

### 10.1 Executive & Operational Scope
The **Ironing & Steam Pressing Floor (`/iron`)** gives garments their crisp, commercial presentation. Utilizing centralized industrial boiler steam (operating at 4.2–4.8 Bar, nominal 4.5 Bar) and 12 vacuum suction buck tables, operators shape seams, eliminate wrinkles, and press collars/cuffs. Strict temperature regulation (Teflon shoe base covers at 140°C–160°C) prevents fabric glaze, shine marks, and synthetic fiber scorching.
- **Industry Standard**: ISO 105-X11 (Pressing Heat Fastness).
- **Boiler Steam Pressure Target**: 4.2 Bar – 4.8 Bar (continuous saturated steam flow).
- **Zero Glaze / Shine Defect SLA**: 100% defect-free under 1000-lux high-intensity inspection lamps.
- **Operator Wage Calculation**: Direct calculation based on verified wrinkle-free pieces pressed:
  $$\text{Operator Earnings} = \text{Verified Passed Pressed Pieces} \times \text{Pressing Piece Rate (e.g. ₹2.20/pc)}$$

### 10.2 Complete Side Navigation Architecture (8 Dedicated Views)
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the complete 8-view navigation structure:
- **Tier 1: Workspace Hub**:
  - `All Modules` (`/modules`)
- **Tier 2: 8. Ironing Operations**:
  - `01. Ironing Dashboard` (`/iron`)
  - `02. Steam Vacuum Buck Tables` (`/iron/tables`)
  - `03. Operator Piece-Rate Wages` (`/iron/wages`)
  - `04. Boiler Telemetry & Steam Log` (`/iron/boiler-telemetry`)
  - `05. Inline Finish & Glaze QC` (`/iron/finish-qc`)
  - `06. Outward Packing Handover` (`/iron/handover`)
  - `07. Zigza AI Copilot` (`/iron/zigza-ai`)
- **Tier 3: Account**:
  - `08. Division Profile` (`/iron/profile`)

### 10.3 Implemented Floor Components & Features

1. **Master Ironing Dashboard (`/iron`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/page.tsx), [`IronDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/components/IronDashboardClient.tsx)
   - **4 Master KPI Cards**:
     1. `Daily Pressed Volume`: Cumulative pieces (6,180 pcs) vs shift target (7,500 pcs • 82.4%).
     2. `Boiler Pressure`: Real-time steam header pressure (4.5 Bar optimal).
     3. `Active Vacuum Tables`: Active vs total vacuum buck stations (11 / 12 online).
     4. `First Pass QC Rate`: Finishing pass rate (99.1%) under ISO 105-X11 standards.
   - **Central Boiler Ticker**: Header pressure, boiler core temperature (154°C), and condensate trap health.
   - **Live 12-Table Vacuum Pressing Grid**: Station-by-station cards displaying table status, operator name, inward challan, target vs actual pieces pressed, iron temperature, and piece rate.
   - **Shift Production & Wage Summary**: Real-time shift piece-rate earnings ledger.

2. **Steam Vacuum Buck Tables (`/iron/tables`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/tables/page.tsx), [`TablesClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/tables/components/TablesClient.tsx)
   - **Form 1: Ironing Table Allotment Form** ([`AllotTableModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/tables/components/AllotTableModal.tsx)): Assigns operator, inward challan lot, hourly target (default 60 pcs/hr), and piece-rate (₹2.20/pc).
   - **Form 2: Operator Shift Pressing & Defect Completion Form** ([`LogProductionModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/tables/components/LogProductionModal.tsx)): Directly writes shift output to `iron_production_logs`, tracking wrinkle-free pieces, glaze/shine defects, and auto-calculated earnings.

3. **Operator Piece-Rate Wages (`/iron/wages`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/wages/page.tsx), [`WagesClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/wages/components/WagesClient.tsx)
   - Real-time payroll ledger with top earner highlights, average finishing piece-rates, defect deductions, and export-ready shift wage logs.

4. **Boiler Telemetry & Steam Pressure Logs (`/iron/boiler-telemetry`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/boiler-telemetry/page.tsx), [`BoilerTelemetryClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/boiler-telemetry/components/BoilerTelemetryClient.tsx), [`LogBoilerModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/boiler-telemetry/components/LogBoilerModal.tsx)
   - Hourly telemetry monitoring: Steam pressure (4.2–4.8 Bar), boiler temperature, condensate trap drainage (`NORMAL`, `DRAINING`, `CLOGGED`), and sediment blowdown verification.

5. **Inline Finish & Glaze QC Station (`/iron/finish-qc`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/finish-qc/page.tsx), [`FinishQcClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/finish-qc/components/FinishQcClient.tsx), [`RecordQcModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/finish-qc/components/RecordQcModal.tsx)
   - Spot-checking under high-intensity 1000-lux lamps for heat glaze, shine marks, water spots, and placket/seam symmetry. Quarantines defective pieces to 10 Alteration Clinic.

6. **Outward Packing Handover (`/iron/handover`)**:
   - **Files**: [`page.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/handover/page.tsx), [`PackingHandoverClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/handover/components/PackingHandoverClient.tsx), [`CreateTrolleyModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/handover/components/CreateTrolleyModal.tsx)
   - Mobile trolley gate pass manifests transferring verified wrinkle-free, zero-shine garments to 09 Ready Goods & Packing Floor.

7. **Zigza AI Copilot (`/iron/zigza-ai`)**:
   - Integrated with [`ZigzaAiClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/zigza-ai/components/ZigzaAiClient.tsx) under portal `'iron'` with domain queries for glaze prevention, boiler pressure trap troubleshooting, and shift output velocity forecasting.

8. **Ironing Floor Profile (`/iron/profile`)**:
   - [`DivisionProfileView`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/profile/DivisionProfileView.tsx) displaying Finishing Master profile, 12 boiler vacuum tables capacity, and ISO 105-X11 quality standards.

### 10.4 Complete Forms Catalog
1. **Form 1: Ironing Table Allotment Form** (`/iron/tables` via `AllotTableModal.tsx`):
   - Fields: `table_number` (Table 01–12), `operator_name`, `challan_id`, `target_hourly_pcs` (default 60), `piece_rate` (default ₹2.20), `iron_temp_c` (140°C–160°C).
2. **Form 2: Operator Shift Pressing & Wage Log Form** (`/iron/tables` via `LogProductionModal.tsx`):
   - Fields: `table_number`, `operator_name`, `challan_id`, `pieces_pressed`, `defect_shine_count`, `water_stain_count`, `piece_rate`, `total_earned_wages` (auto-calculated), `notes`.
3. **Form 3: Log Central Boiler Telemetry Form** (`/iron/boiler-telemetry` via `LogBoilerModal.tsx`)
4. **Form 4: Record Finishing & Glaze QC Form** (`/iron/finish-qc` via `RecordQcModal.tsx`)
5. **Form 5: Create Mobile Trolley Packing Handover Form** (`/iron/handover` via `CreateTrolleyModal.tsx`)

### 10.5 PostgreSQL Database Schema Reference
```sql
-- 1. Ironing Station Production Logs (Populated by Form 2)
CREATE TABLE iron_production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(20) NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  operator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  pieces_pressed INTEGER NOT NULL DEFAULT 0,
  defect_shine_count INTEGER NOT NULL DEFAULT 0,
  water_stain_count INTEGER NOT NULL DEFAULT 0,
  piece_rate NUMERIC(6,2) DEFAULT 2.20,
  total_earned_wages NUMERIC(10,2) GENERATED ALWAYS AS (pieces_pressed * piece_rate) STORED,
  shift_date DATE DEFAULT CURRENT_DATE,
  shift_type VARCHAR(20) DEFAULT 'SHIFT_1',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ironing Table Assignments & Allotments
CREATE TABLE iron_table_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(20) NOT NULL UNIQUE,
  operator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  target_hourly_pcs INTEGER DEFAULT 60,
  piece_rate NUMERIC(6,2) DEFAULT 2.20,
  iron_temp_c INTEGER DEFAULT 150,
  vacuum_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  allotment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Central Boiler Telemetry & Steam Pressure Logs
CREATE TABLE iron_boiler_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_time TIMESTAMPTZ DEFAULT NOW(),
  steam_pressure_bar NUMERIC(4,2) NOT NULL, -- 4.2 - 4.8 Bar target
  boiler_temp_c INTEGER NOT NULL,
  condensate_status VARCHAR(30) DEFAULT 'NORMAL', -- NORMAL, DRAINING, CLOGGED
  blowdown_done BOOLEAN DEFAULT FALSE,
  feed_water_level_pct INTEGER DEFAULT 85,
  operator_name VARCHAR(100) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Finishing Inline & Glaze QC Audits
CREATE TABLE iron_finish_qc_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_code VARCHAR(50) NOT NULL UNIQUE,
  table_number VARCHAR(20) NOT NULL,
  operator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  sample_pcs INTEGER NOT NULL DEFAULT 20,
  glaze_defects INTEGER DEFAULT 0,
  water_spots INTEGER DEFAULT 0,
  unaligned_seams INTEGER DEFAULT 0,
  qc_status VARCHAR(30) DEFAULT 'PASS', -- PASS, REWORK_ALTERATION
  auditor_name VARCHAR(100) NOT NULL,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outward Mobile Trolley Packing Handovers
CREATE TABLE iron_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trolley_code VARCHAR(50) NOT NULL UNIQUE,
  challan_id UUID REFERENCES challans(id) ON DELETE RESTRICTED,
  pieces_transferred INTEGER NOT NULL,
  transferred_to VARCHAR(60) DEFAULT '09. Ready Goods & Packing Floor',
  wrinkle_free_verified BOOLEAN DEFAULT TRUE,
  zero_shine_verified BOOLEAN DEFAULT TRUE,
  supervisor_signoff VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Division 09: Ready Goods & Export Carton Packing (`/ready-goods`)

### 11.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the complete 8-item navigation structure for the `/ready-goods` portal:
- **Workspace Hub**: `All Modules` (`/modules`)
- **9. Ready Goods & Packing Operations**:
  - `Packing Dashboard` (`/ready-goods`)
  - `AQL 2.5 Inspection` (`/ready-goods/aql-inspection`) [Badge: `AQL 2.5`]
  - `Hangtag & Polybag` (`/ready-goods/tagging-polybag`)
  - `Carton Packing Manifest` (`/ready-goods/carton-packing`)
  - `Scale Weight & Audit` (`/ready-goods/carton-weight`) [Badge: `±0.15kg`]
  - `Central Godown Handover` (`/ready-goods/handover`)
  - `Zigza AI` (`/ready-goods/zigza-ai`)
- **Account**: `Division Profile` (`/ready-goods/profile`)

### 11.2 Packing Dashboard (`/ready-goods`)
- **File**: [`src/app/ready-goods/components/ReadyGoodsDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/components/ReadyGoodsDashboardClient.tsx)
- **4 Metric KPI Cards**:
  - `Packed Cartons Today`: **142 Cartons** *(5,680 Finished Export Garments)*
  - `AQL 2.5 Audit Score`: **PASS (0.4% Defects)** *(Critical: 0, Major: 2, Limit ≤ 10)*
  - `Hangtag Barcode Match`: **100% Verified** *(Zero EAN-13 scanning errors)*
  - `Ready in Central Godown`: **42,500 pcs** *(Stored in Central Godown Bay 3–5)*
- **Live Master Export Carton Manifest**: Tabbed filtering (`ALL`, `PACKED`, `AQL_AUDIT_PASSED`, `QUARANTINED_AQL_FAILED`, `SHIPPED`), real-time search, size ratio breakdown chips, gross weighbridge comparison ($\pm 0.15\text{ kg}$ threshold), and detailed carton inspector modal.

### 11.3 AQL 2.5 Statistical Inspection Station (`/ready-goods/aql-inspection`)
- **File**: [`src/app/ready-goods/aql-inspection/components/AqlInspectionClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/aql-inspection/components/AqlInspectionClient.tsx)
- **ISO 2859-1 Normal Level II Sampling Reference Table**:
  - Interactive lookup table mapping lot sizes (e.g. 3,201–10,000 pcs $\rightarrow$ 200 pcs sample size).
  - SLA enforcement: Strict 0 Critical Defects allowed, $\le 10$ Major Defects, $\le 14$ Minor Defects.
- **Form 1 (AQL 2.5 Final Audit Submission Form)**: [`AqlAuditModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/aql-inspection/components/AqlAuditModal.tsx)
  - Fields: `audit_number` (`AQL-XXXXX`), `order_id`, `carton_id`, `inspector_name`, `lot_size_pieces`, `sample_size_audited` (auto-calculated per ISO 2859-1), `critical_defects` (0 allowed), `major_defects`, `minor_defects`, `audit_decision` (`PASS`, `RE_AUDIT`, `REJECT_QUARANTINE`), `remarks`.
  - **Automated Lifecycle Trigger**: Marking a carton or lot as `REJECT_QUARANTINE` automatically updates `ready_goods_cartons.status` to `QUARANTINED_AQL_FAILED` and halts godown release. Submitting `PASS` promotes carton to `AQL_AUDIT_PASSED`.

### 11.4 Hangtag & Polybag Station (`/ready-goods/tagging-polybag`)
- **File**: [`src/app/ready-goods/tagging-polybag/components/TaggingPolybagClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/tagging-polybag/components/TaggingPolybagClient.tsx)
- **Verification Engine**: [`ScanHangtagModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/tagging-polybag/components/ScanHangtagModal.tsx)
- **Operator Verification Checklist**:
  - 13-digit EAN-13 / UPC barcode matched with buyer SKU.
  - Kimble tag gun / micro-tach fastener attached firmly to armhole or neck seam.
  - 2g silica gel moisture-barrier desiccant pouch placed inside.
  - Warning-labeled polybag folded and adhesive heat-sealed.

### 11.5 Master Carton Packing Manifest (`/ready-goods/carton-packing`)
- **File**: [`src/app/ready-goods/carton-packing/components/CartonPackingClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/carton-packing/components/CartonPackingClient.tsx)
- **Form 2 (Master Carton Packing & Gross Weight Form)**: [`SealCartonModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/carton-packing/components/SealCartonModal.tsx)
  - Fields: `carton_number` (`CTN-XXXXX`), `order_id`, `packed_bundle_ids` (scanned bundle QR tickets from `cutting_bundles`), `total_pieces`, `size_breakdown` (ratio assortment grid e.g. `{"S": 10, "M": 15, "L": 15}`), `measured_gross_weight_kg`, `expected_gross_weight_kg` (auto-calculated from BOM yield + tare weight), `godown_bay` (`BAY_3`, `BAY_4`, `BAY_5`), operator signoff.
  - **Zero Ghost Piece Enforcement**: Bundle linkage verification preventing overpacking beyond physical cut bundle quantities.

### 11.6 Scale Weight & Carton Audit Log (`/ready-goods/carton-weight`)
- **File**: [`src/app/ready-goods/carton-weight/components/CartonWeightClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/carton-weight/components/CartonWeightClient.tsx)
- **Weighbridge Audit Modal**: [`ScaleAuditModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/carton-weight/components/ScaleAuditModal.tsx)
- **Telemetry & Tolerance**: Digital scale integration monitoring load cells across Bay 3, Bay 4, and Bay 5 with a strict $\pm 0.15\text{ kg}$ tolerance. Automatically warns and locks cartons exceeding tolerance to prevent foreign objects or missing pieces.

### 11.7 Central Godown Handover (`/ready-goods/handover`)
- **File**: [`src/app/ready-goods/handover/components/GodownHandoverClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/handover/components/GodownHandoverClient.tsx)
- **Pallet Manifest & Gate Pass Generator**: [`CreatePalletModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/handover/components/CreatePalletModal.tsx)
- **Export Staging**: Groups `AQL_AUDIT_PASSED` export cartons onto wooden/plastic export pallets (`PLT-XXXX`), calculates aggregate gross weight and CBM volume, designates godown high-rack bay and container dock gate (`DOCK_01`, `DOCK_02`, `DOCK_03`), and issues official dispatch gate passes.

### 11.8 PostgreSQL Database Schema Blueprint
```sql
-- 1. Master Packed Export Cartons
CREATE TABLE ready_goods_cartons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carton_number VARCHAR(40) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  total_pieces INTEGER NOT NULL CHECK (total_pieces > 0),
  size_breakdown JSONB NOT NULL,
  measured_gross_weight_kg NUMERIC(6,2) NOT NULL,
  expected_gross_weight_kg NUMERIC(6,2) NOT NULL,
  weight_variance_kg NUMERIC(4,2) GENERATED ALWAYS AS (measured_gross_weight_kg - expected_gross_weight_kg) STORED,
  status VARCHAR(40) DEFAULT 'PACKED', -- PACKED, AQL_AUDIT_PASSED, QUARANTINED_AQL_FAILED, UNPACKED_FOR_REWORK, SHIPPED
  godown_bay_location VARCHAR(30) DEFAULT 'BAY_3',
  dimensions_cm VARCHAR(30) DEFAULT '60x40x40',
  cbm_volume NUMERIC(5,3) DEFAULT 0.096,
  sealed_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Carton-to-Bundle Traceability Binding (Closes the Zero Ghost Piece Chain)
CREATE TABLE ready_goods_carton_bundles (
  carton_id UUID REFERENCES ready_goods_cartons(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES cutting_bundles(id) ON DELETE RESTRICTED,
  pieces_from_bundle INTEGER NOT NULL CHECK (pieces_from_bundle > 0),
  PRIMARY KEY (carton_id, bundle_id)
);

-- 3. AQL 2.5 Quality Audit Records (Populated by Form 1)
CREATE TABLE ready_goods_aql_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  carton_id UUID REFERENCES ready_goods_cartons(id) ON DELETE RESTRICTED,
  inspector_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  lot_size_pieces INTEGER NOT NULL,
  sample_size_audited INTEGER NOT NULL,
  critical_defects INTEGER NOT NULL DEFAULT 0,
  major_defects INTEGER NOT NULL DEFAULT 0,
  minor_defects INTEGER NOT NULL DEFAULT 0,
  audit_decision VARCHAR(30) NOT NULL, -- PASS, RE_AUDIT, REJECT_QUARANTINE
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weighbridge Scale Audit Logs
CREATE TABLE ready_goods_scale_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id VARCHAR(30) NOT NULL,
  carton_id UUID REFERENCES ready_goods_cartons(id) ON DELETE RESTRICTED,
  measured_weight_kg NUMERIC(6,2) NOT NULL,
  expected_weight_kg NUMERIC(6,2) NOT NULL,
  variance_kg NUMERIC(4,2) NOT NULL,
  tolerance_passed BOOLEAN DEFAULT TRUE,
  auditor_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Central Godown Pallet Gate Passes
CREATE TABLE ready_goods_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_code VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  total_cartons INTEGER NOT NULL,
  total_pieces INTEGER NOT NULL,
  total_gross_weight_kg NUMERIC(8,2) NOT NULL,
  total_cbm NUMERIC(6,3) NOT NULL,
  target_bay VARCHAR(30) DEFAULT 'BAY_3',
  dock_gate VARCHAR(30) DEFAULT 'DOCK_01',
  gate_pass_status VARCHAR(30) DEFAULT 'READY_FOR_STUFFING',
  supervisor_signoff VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trigger: Enforcing Carton Piece Ceiling Against Physical Bundles
CREATE OR REPLACE FUNCTION validate_carton_bundle_sum()
RETURNS TRIGGER AS $$
DECLARE
  v_bundle_pieces INTEGER;
  v_already_packed INTEGER;
BEGIN
  SELECT piece_count INTO v_bundle_pieces FROM cutting_bundles WHERE id = NEW.bundle_id;
  SELECT COALESCE(SUM(pieces_from_bundle), 0) INTO v_already_packed FROM ready_goods_carton_bundles
  WHERE bundle_id = NEW.bundle_id AND carton_id != COALESCE(NEW.carton_id, '00000000-0000-0000-0000-000000000000');
  
  IF (v_already_packed + NEW.pieces_from_bundle) > v_bundle_pieces THEN
    RAISE EXCEPTION 'Quantity Integrity Violation: Total pieces packed from bundle (%) exceeds physical bundle count (%)',
      (v_already_packed + NEW.pieces_from_bundle), v_bundle_pieces;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_carton_bundle_sum
BEFORE INSERT OR UPDATE ON ready_goods_carton_bundles
FOR EACH ROW EXECUTE FUNCTION validate_carton_bundle_sum();

-- 7. Trigger: Automated Carton Lifecycle Transition from AQL Decision
CREATE OR REPLACE FUNCTION update_carton_status_from_aql()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.audit_decision = 'PASS' THEN
    UPDATE ready_goods_cartons 
    SET status = 'AQL_AUDIT_PASSED', updated_at = NOW() 
    WHERE id = NEW.carton_id;
  ELSIF NEW.audit_decision = 'REJECT_QUARANTINE' THEN
    UPDATE ready_goods_cartons 
    SET status = 'QUARANTINED_AQL_FAILED', updated_at = NOW() 
    WHERE id = NEW.carton_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_carton_status_from_aql
AFTER INSERT OR UPDATE ON ready_goods_aql_audits
FOR EACH ROW EXECUTE FUNCTION update_carton_status_from_aql();
```

---

## 12. Cross-Division Handshake Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           CROSS-DIVISION DATA FLOW                            │
└───────────────────────────────────────────────────────────────────────────────┘

  [ 01. DESIGN & TECH-PACK ]
             │
             │ Tech-Pack specs, Fabric Yield (kg/pc), ASTM grading matrix
             ▼
  [ 02. MERCHANDISING & SOURCING ]
             │
             ├──────────────────────────┐
             │ Work Order PO            │ Procurement Requisition (PR)
             │ Ratio Matrix & Rates     │ Fabric & Trims
             ▼                          ▼
  [ 03. CUTTING & LAY FLOOR ]      [ 11. CENTRAL STORE ]
             │                          │
             │ Relax, Lay, Cut          │ 4-Point Pass Rolls
             │ Number & QR Barcode      │ Delivered to Tables
             │                          │
             ├──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼
  [ 04. PRINTING / 05. EMBROIDERY ]  [ 06. STITCHING & SEWING ] [ 11. CENTRAL STORE ]
  Raw Panels for Embellishment       QR-tagged bundles          Scrap & End-Bits
  Pattern registration notches       Direct FK + Zero Ghost     Returned to inventory
             │                          │
             │ Handover slip            │ QC Passed garments
             ▼                          ▼
  [ 06. STITCHING & SEWING ] ───────► [ 07. INDUSTRIAL WASHING ]
             │                          │ (Enzyme, Softener, 1:5.0 Ratio)
             │ (Raw non-washed goods)   │
             ├──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼ (Shrinkage > 2.5% Alert)
  [ 08. STEAM IRONING & FINISHING ] ────┘               [ 03. CUTTING FLOOR CAD ]
  12 Vacuum Buck Tables (4.5 Bar steam)                 Expand lay marker by +1.4cm
  Zero shine / glaze SLA
             │
             ▼ (Mobile Trolleys Manifest)
  [ 09. READY GOODS & PACKING FLOOR ]
  Tagging, Polybagging, Carton Assortments (AQL 2.5 Audit & ±0.15kg Scale Check)
             │
             ▼ (Pallet Gate Pass Handover)
  [ 11. CENTRAL STORE GODOWN / EXPORT CONTAINER LOADING ]
  High-Bay Stacking (Bay 3–5) & Dock 01–03 Container Stuffing
```

---

## 13. Quality, Performance & Compliance Metrics

- **Compilation Status**: Zero TypeScript compiler errors (`npx tsc --noEmit` exited code 0).
- **Turbopack Cache Invalidation**: Fully resolved runtime `TypeError: ... is not a function` by creating dedicated `'use client'` storage utilities ([`cuttingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/cuttingStorage.ts), [`printingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/utils/printingStorage.ts), [`embroideryStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/embroidery/utils/embroideryStorage.ts), [`washingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/washing/utils/washingStorage.ts), [`ironStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/iron/utils/ironStorage.ts), and [`readyGoodsStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/ready-goods/utils/readyGoodsStorage.ts)).
- **Live Supabase Synchronization**: Division 06 is 100% connected to live Supabase backend tables with full server action cache revalidations on all `/stitching-sewing/*` routes.
- **Aesthetic Consistency**: Strict adherence to the Industrial Luxury design system across all views of Division 01, 02, 03, 04, 05, 06, 07, 08, and 09.
- **Brand Terminology**: Canonical brand name **"Zigza AI"** maintained across all routes and copilots.




