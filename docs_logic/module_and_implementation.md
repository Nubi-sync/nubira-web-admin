# Zigza Enterprise MES: Module Hub & Division Implementation Record

## Executive Overview
This document records the architectural specifications, implemented features, portal routes, database models, client interfaces, state synchronizations, and physical shop-floor handshakes delivered for:
1. **Module Hub & Visual Synchronization** (`/modules`)
2. **Dedicated Zigza AI Engine** (7-Way Division Isolation)
3. **Division 01: Design & Tech-Pack Studio** (`/design`)
4. **Division 02: Merchandising & Sourcing Desk** (`/merchandising`)
5. **Division 03: Cutting & Lay Floor Operations** (`/cutting`)
6. **Division 04: Screen & Digital Printing Unit** (`/printing`)

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

## 7. Cross-Division Handshake Architecture

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
```

---

## 8. Quality, Performance & Compliance Metrics

- **Compilation Status**: Zero TypeScript compiler errors (`npx tsc --noEmit` exited code 0).
- **Turbopack Cache Invalidation**: Fully resolved runtime `TypeError: ... is not a function` by creating `'use client'` dedicated utilities ([`cuttingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/cuttingStorage.ts) and [`printingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/printing/utils/printingStorage.ts)).
- **Aesthetic Consistency**: Strict adherence to the Industrial Luxury design system across all views of Division 01, 02, 03, and 04.
- **Brand Terminology**: Canonical brand name **"Zigza AI"** maintained across all routes and copilots.
