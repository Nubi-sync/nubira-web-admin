# Zigza Enterprise MES: Module Hub & Division Implementation Record

## Executive Overview
This document records the architectural specifications, implemented features, portal routes, database models, client interfaces, state synchronizations, and physical shop-floor handshakes delivered for:
1. **Module Hub & Visual Synchronization** (`/modules`)
2. **Dedicated Zigza AI Engine** (7-Way Division Isolation)
3. **Division 01: Design & Tech-Pack Studio** (`/design`)
4. **Division 02: Merchandising & Sourcing Desk** (`/merchandising`)
5. **Division 03: Cutting & Lay Floor Operations** (`/cutting`)

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
5. `/factory/zigza-ai` (Factory Floor Operations)
6. `/brands/zigza-ai` (Brand Commercial Portals)
7. `/washing/zigza-ai` (Industrial Washing Plant)
8. `/printing/zigza-ai` (Automated Screen & Digital Printing)
9. `/embroidery/zigza-ai` (Multi-Head Embroidery Operations)
10. `/stitching-sewing/zigza-ai` (Stitching, Sewing & Floor Control)

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
  - Each division AI view provides domain-specific quick query suggestions (e.g., tech-pack POM tolerances for Design, BOM variance queries for Merchandising, marker utilization and end-bit remanence for Cutting).

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
- **KPI Metrics**:
  1. `Active Tech-Packs`: Total specs with bulk-approved breakdown.
  2. `Sample Fit Approvals`: Pending prototype and pre-production reviews.
  3. `Size Grading Matrix`: Number of active size systems (Adult, Numeric, Kids, Plus).
  4. `PPS Readiness`: Real-time percentage SLA tracking.
- **Active Pipeline Queue**: Tabbed filters (`ALL`, `APPROVED_BULK`, `PPS_SUBMITTED`, `SAMPLE_DEV`, `REVISE_FIT`, `DRAFT`) with full-text search.

### 3.3 Tech-Pack Master Catalog (`/design/tech-packs`)
- **File**: [`src/app/design/tech-packs/components/TechPackCatalogClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/tech-packs/components/TechPackCatalogClient.tsx)
- **Dual-View Switcher**: Visual CAD Gallery & Detailed Spec Table.
- **Version History Diff Engine**: Compares measurement deltas between revisions (`Chest +1.5cm`, `Length -0.5cm`).
- **Form 1 (2-Step Stepper Modal)**: Garment meta, base size, shell fabric, GSM, target cut date, and ISO 4915 stitch & seam classifications.

### 3.4 Sample Approvals & PPS Gate (`/design/sample-approvals`)
- **File**: [`src/app/design/sample-approvals/components/SampleApprovalsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/sample-approvals/components/SampleApprovalsClient.tsx)
- **3-Stage Buyer Fit Pipeline**: Proto Sample &rarr; Size Set Sample &rarr; Pre-Production Sample (PPS).
- **Form 2 (Sample Audit Submission Modal)**: Live ASTM tolerance variance flag if $\Delta > \pm 0.5\text{ cm}$.

### 3.5 Dynamic Size Grading Matrix (`/design/grading-matrix`)
- **File**: [`src/app/design/grading-matrix/components/GradingMatrixClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/grading-matrix/components/GradingMatrixClient.tsx)
- Dynamic sizing support for Adult Alpha (`XS–3XL`), Numeric Jeans (`28–42`), Toddler/Kids (`2T–14`), and Plus Silhouette (`1X–5X`).

### 3.6 Fabric & Trims Library (`/design/materials-library`)
- **File**: [`src/app/design/materials-library/components/MaterialsLibraryClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/design/materials-library/components/MaterialsLibraryClient.tsx)
- Technical registry for shrinkage telemetry, spirality indexes, yarn counts, and calibrated sewing needles.

---

## 4. Division 02: Merchandising & Sourcing Desk (`/merchandising`)

### 4.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the 8-item navigation structure for the `/merchandising` portal:
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
- **Executive Metric KPI Cards**:
  1. `Active Buyer POs`: **14 Orders** (Total Booked: 185,000 Pcs)
  2. `BOM Cost Realization`: **98.2%** (Actual vs Planned variance within $\pm 1.8\%$)
  3. `Trim Procurement In-House`: **100% In-Stock** (Zero floor line-stoppage)
  4. `On-Time Delivery (OTD)`: **97.8%** (International vessel bookings on schedule)
- **Critical Path Health Monitor**:
  - Live timeline tracking Lab Dips, Fabric Inward, Fit PPS, Pre-Costing lock, Bulk Cut, and Vessel ETD.
  - Multi-dimensional filters by Brand (`Zara Global`, `Ollypop Kids`, `H&M Basics`, `Nubira Essentials`), Style Reference, and Date Range.

### 4.3 Buyer Purchase Orders & Size-Color Matrix (`/merchandising/orders`)
- **Files**:
  - Client View: [`src/app/merchandising/orders/components/OrdersCatalogClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/orders/components/OrdersCatalogClient.tsx)
  - Modal Form: [`src/app/merchandising/orders/components/CreateOrderModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/orders/components/CreateOrderModal.tsx)
- **Features**:
  - Detailed catalog listing PO Number, Buyer, Style Name, Order Quantity, FOB Price, Total Contract Value, Ex-Factory Date, and Status (`PENDING_BOM`, `IN_FABRIC`, `IN_PRODUCTION`, `CONTAINER_STUFFED`, `SHIPPED`).
  - Interactive Size-Color Breakdown Drawer: Displays dynamic matrix breakdown across sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`) per colorway.
- **Form 1: 2-Step Stepper New Order Modal**:
  - **Step 1: Order Commercials**: PO Number format validation, registered brand selection, style ref/name, currency (`USD`, `EUR`, `GBP`, `INR`), unit FOB price, total contract quantity, and ex-factory delivery date.
  - **Step 2: Dynamic Color-Size Matrix**: Dynamic colorway additions with real-time size breakdown matrix.
  - **Integrity Validation**: Automatically verifies that $\sum (\text{Matrix Quantities}) = \text{Target Order Quantity}$ before submission.

### 4.4 BOM & Costing Ledgers (`/merchandising/costing`)
- **Files**:
  - Client View: [`src/app/merchandising/costing/components/BomCostingClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/costing/components/BomCostingClient.tsx)
  - Modal Form: [`src/app/merchandising/costing/components/CreateCostingModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/costing/components/CreateCostingModal.tsx)
- **Calculation Engine**:
  $$\text{Direct Subtotal} = \text{Fabric} + \text{Trims} + \text{Embellishment} + \text{CMT Sewing} + \text{Washing} + \text{Packing}$$
  $$\text{Net FOB Cost} = \text{Direct Subtotal} \times (1 + \text{Factory Overhead Rate } 12\%)$$
  $$\text{Cost Variance \%} = \frac{\text{Actual Realized Cost} - \text{Net FOB Cost}}{\text{Net FOB Cost}} \times 100$$
- **Variance Warning System**: Automatic alert badge flags items exceeding target budget by $> 2.0\%$. Tab filters: `ALL`, `ON_TARGET`, `VARIANCE_ALERT`.

### 4.5 Time & Action (T&A) Planner (`/merchandising/tna-calendar`)
- **Files**:
  - Client View: [`src/app/merchandising/tna-calendar/components/TnaPlannerClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/tna-calendar/components/TnaPlannerClient.tsx)
  - Modal Form: [`src/app/merchandising/tna-calendar/components/UpdateTnaMilestoneModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/tna-calendar/components/UpdateTnaMilestoneModal.tsx)
- **8 Standard Critical Path Milestone Gates**:
  1. `FABRIC_LAB_DIP`: Lab dip shade submission & buyer approval.
  2. `FIT_PPS_APPROVAL`: Golden seal Pre-Production Sample authorization.
  3. `BULK_FABRIC_INWARD`: Mill fabric delivery, 4-point inspection, and shrinkage testing.
  4. `TRIMS_ACCESSORIES_INWARD`: Zippers, labels, buttons, threads store verification.
  5. `CUTTING_START`: Spreading table allocation & computerized cutting release.
  6. `SEWING_OUTPUT_COMPLETION`: Floor line exit piece count validation.
  7. `FINAL_AQL_INSPECTION`: Buyer third-party AQL 1.5/2.5 quality clearance.
  8. `EX_FACTORY_CONTAINER_STUFF`: Container loading & port handover.
- **Milestone Update Modal**: Update planned date, actual date, status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`, `ESCALATED`), and audit remarks.

### 4.6 Trim & Sourcing Requisitions (`/merchandising/sourcing`)
- **Files**:
  - Client View: [`src/app/merchandising/sourcing/components/SourcingRequisitionsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/sourcing/components/SourcingRequisitionsClient.tsx)
  - Modal Form: [`src/app/merchandising/sourcing/components/CreateRequisitionModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/sourcing/components/CreateRequisitionModal.tsx)
- **Procurement Pipeline**:
  - PR Number tracking, PO association, Material Category (`SHELL_FABRIC`, `RIB_COLLAR`, `ZIPPER`, `MAIN_LABEL`, `SEWING_THREAD`, `POLYBAG`), required vs ordered quantities, unit cost, approved vendors, and ETA.
  - Interactive status toggling: `PENDING` &rarr; `ORDERED` &rarr; `IN_TRANSIT` &rarr; `STORE_RECEIVED`.

### 4.7 Shipment & FOB Pipeline (`/merchandising/shipments`)
- **Files**:
  - Client View: [`src/app/merchandising/shipments/components/ShipmentPipelineClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/shipments/components/ShipmentPipelineClient.tsx)
  - Modal Form: [`src/app/merchandising/shipments/components/BookShipmentModal.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/shipments/components/BookShipmentModal.tsx)
- **Container Logistics**:
  - Shipment Reference, PO Number, Container No, Container Type (`20ft Standard`, `40ft High Cube`, `LCL Consolidation`), Freight Forwarder, Vessel Name, Port of Loading (`Tuticorin`, `Chennai`, `Nhava Sheva`), Destination Port (`Rotterdam`, `New York`, `Hamburg`), ETD, ETA, and CBM volume.
  - Life cycle progression: `BOOKED` &rarr; `CONTAINER_STUFFED` &rarr; `CUSTOMS_CLEARED` &rarr; `SAILING` &rarr; `PORT_ARRIVED`.

### 4.8 Storage & Event Synchronization Architecture
- **Storage Utility**: [`src/app/merchandising/utils/merchandisingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/merchandising/utils/merchandisingStorage.ts)
- **Custom Event Bus**: Emits `zigza:merchandising_updated` (`MERCHANDISING_UPDATE_EVENT`) on every mutation. All open views and modals listen and re-render in real-time across tabs without page reloads.

---

## 5. Division 03: Cutting & Lay Floor Operations (`/cutting`)

### 5.1 Portal Routing & Sidebar Integration
[`AdminSidebar.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/components/layout/AdminSidebar.tsx) defines the comprehensive 11-item navigation structure for the `/cutting` portal:
- **Workspace Hub**: `All Modules` (`/modules`)
- **3. Cutting Floor**:
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
- **Account**: `Division Profile` (`/cutting/profile`)

### 5.2 Floor Dashboard (`/cutting`)
- **File**: [`src/app/cutting/components/CuttingDashboardClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/components/CuttingDashboardClient.tsx)
- **4 Real-Time Shop Floor KPI Metric Cards**:
  1. `Daily Cut Volume`: **8,240 Pcs** (Across 4 active spreading tables)
  2. `Marker Efficiency`: **88.4%** (Target: $> 86.0\%$, +2.4% fabric savings)
  3. `Bundles Issued Today`: **328 Bundles** (100% QR barcode tagged)
  4. `Fabric Meterage Consumed`: **4,120 m** (End-bit scrap at 1.4%, below 1.8% SLA)
- **Active Spreading Table Status Matrix**:
  - Live visual cards for `Table 01` (Gerber Paragon HX-500, Spreading 80 Plies), `Table 02` (Lectra Vector Fashion FX, Auto-Cutting), `Table 03` (Eastman Band Knife EC-700, Bundling), and `Table 04` (Kuris Shuttle Table, Idle/Setup).
  - Modal drilldown for table maintenance, vacuum pressure, and current lay allocation.

### 5.3 Fabric Relaxation & Roll Staging (`/cutting/fabric-relaxation`)
- **File**: [`src/app/cutting/fabric-relaxation/components/FabricRelaxationClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/fabric-relaxation/components/FabricRelaxationClient.tsx)
- **Industry Standard**: ASTM D3887 tension-free conditioning for single jersey, fleece, and Lycra blends.
- **Features**:
  - Roll ledger tracking Barcode (`ROL-2026-101`), Dye Lot, Fabric Type, Colorway, Weight (kg), Meterage, Nominal GSM vs Tested GSM, Elapsed Conditioning Hours vs Required Hours (24–48h), and Storage Rack Bin.
  - One-click relaxation phase advancement: `ACCLIMATIZING` &rarr; `CONDITIONING_COMPLETED` &rarr; `ALLOCATED_TO_LAY`.
  - Stage New Fabric Roll Modal: Validates roll barcode, lot number, GSM, and air-conditioned bay assignment.

### 5.4 Spreading & Lay Plans (`/cutting/lay-sheets`)
- **File**: [`src/app/cutting/lay-sheets/components/LaySheetsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/lay-sheets/components/LaySheetsClient.tsx)
- **Features**:
  - Digital lay plan ledger linking PO numbers, brand, style, shell fabric, GSM, table allocation, roll barcodes, ply count (e.g. 80 plies), marker length (m), ratio breakdown (e.g. `S:1, M:2, L:2, XL:1`), total pieces cut, fabric weight, and spreading master.
  - Create Lay Sheet Stepper Modal with auto-calculation of expected pieces:
    $$\text{Expected Pieces} = \text{Total Plies} \times \sum (\text{Ratio Units})$$
  - Status progression: `SPREADING` &rarr; `READY_FOR_CUT` &rarr; `CUT_IN_PROGRESS` &rarr; `CUT_COMPLETED` &rarr; `BUNDLED`.

### 5.5 CAD Markers & Nesting (`/cutting/markers`)
- **File**: [`src/app/cutting/markers/components/MarkersClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/markers/components/MarkersClient.tsx)
- **Optimization Metric Engine**:
  $$\text{Marker Efficiency \%} = \frac{\text{Net Pattern Area (sq m)}}{\text{Marker Length (m)} \times \text{Fabric Usable Width (m)}} \times 100$$
- **Features**:
  - Multi-CAD software support: `Gerber AccuMark`, `Lectra Modaris`, `Optitex PDS`, `CLO3D`.
  - Grainline constraints: `ONE_WAY`, `EITHER_WAY`, `FACE_TO_FACE`.
  - Color-coded efficiency badges: Emerald for $\ge 87\%$, Amber for $85–86.9\%$, Rose for $< 85\%$.
  - Register New CAD Marker Modal: Captures usable width (inches), marker length, pattern nesting count, yield per garment, and target ratio.

### 5.6 Cutting Orders & Queue (`/cutting/orders`)
- **File**: [`src/app/cutting/orders/components/CuttingOrdersClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/orders/components/CuttingOrdersClient.tsx)
- **Features**:
  - Real-time cutting floor production dispatch queue.
  - Work Order card grid displaying order priority (`URGENT`, `HIGH`, `NORMAL`), buyer PO, style ref, planned vs cut pieces progress bar, table assignment, fabric staging status, and operator lead.
  - Queue progression controls: `QUEUED` &rarr; `SPREADING` &rarr; `CUTTING` &rarr; `INSPECTED` &rarr; `BUNDLED`.
  - Create New Cutting Order Modal: Schedules start time, operator leads, and target piece counts.

### 5.7 Bundle Tickets & Barcode Station (`/cutting/bundles`)
- **File**: [`src/app/cutting/bundles/components/BundlesClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/bundles/components/BundlesClient.tsx)
- **Zero Ghost Piece Core Handshake**:
  - Generates thermal QR tickets for 20–50 cut pieces per bundle pack.
  - QR payload encodes: Bundle ID, UUID, PO, Style, Color, Size, Ply Range (`1–40`), Piece Count, and Handover Destination (`04_PRINTING`, `05_EMBROIDERY`, `06_SEWING`).
  - Batch Generation Engine: Automatically splits total cut plies into standardized bundle lots.
  - Printable thermal QR bundle sticker preview card with direct print trigger.

### 5.8 Cut Panel QC Audit Station (`/cutting/panel-qc`)
- **File**: [`src/app/cutting/panel-qc/components/PanelQcClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/panel-qc/components/PanelQcClient.tsx)
- **Inspection Tolerances**:
  - Notch alignment tolerance: $\pm 1.0\text{ mm}$
  - Top-to-bottom ply shift/deflection tolerance: $\le 1.5\text{ mm}$
  - Grainline integrity: 100% aligned, zero knife-heat melting on synthetic fibers.
- **Features**:
  - Interactive Audit Log: Displays audit number (`QC-CUT-9011`), lay sheet ref, component name (`Front Body Panel`, `Sleeve Pair`, `Pocket Facing`), sampled plies (`Top Ply #1, Mid Ply #40, Bottom Ply #80`), top-to-bottom ply variance (mm), defects, verdict (`PASSED`, `PASSED_WITH_CONDITIONS`, `RECUT_REQUIRED`, `HOLD`), and auditor name.
  - Conduct Cut Panel Audit Modal: Direct audit submission recording ply samples, deflection measurements, and pass/recut verdicts.

### 5.9 End-Loss & Remnants (`/cutting/end-loss`)
- **File**: [`src/app/cutting/end-loss/components/EndLossClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/end-loss/components/EndLossClient.tsx)
- **Features**:
  - Roll-by-roll remnant ledger tracking end-bits and shrinkage trim cut-offs.
  - Columns: Remnant Code (`REM-2026-01`), Source Roll Barcode, Fabric Type, Colorway, Length (meters), Width (inches), Waste Reason, and Disposition (`AVAILABLE_FOR_RECUT`, `SALVAGED_FOR_POCKETS`, `RECYCLED_SCRAP`).
  - Quick Disposition Actions: One-click status reallocation (e.g. reserving remnant for pocket facings or recut panels to reduce factory fabric waste).
  - Log New Fabric Remnant Modal: Directly logs scrap meterage and return-to-store disposition.

### 5.10 Reports & Analytics (`/cutting/reports`)
- **File**: [`src/app/cutting/reports/components/CuttingReportsClient.tsx`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/reports/components/CuttingReportsClient.tsx)
- **Features**:
  - Style yield analytics comparing CAD target vs actual cut yield.
  - Auto-cutter table throughput and blade running hours ledger.
  - Defect Pareto distribution analysis (End-loss trim, notch depth shift, spreading waves, blade deflection).
  - CSV Export Engine: Generates downloadable shop-floor analytics reports (`cutting_floor_report_*.csv`).

### 5.11 Cutting Storage & Turbopack Resolution Architecture
- **Dedicated Client Storage Module**: [`src/app/cutting/utils/cuttingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/cuttingStorage.ts)
  - Marked explicitly with `'use client'`.
  - Safe defensive `Array.isArray()` fallbacks for all local storage parse operations.
  - Full functional export set:
    - Tables: `getCuttingTables`, `saveCuttingTables`
    - Lays: `getLaySheets`, `saveLaySheet`
    - Bundles: `getCutBundles`, `saveCutBundle`, `bulkAddCutBundles`
    - Markers: `getMarkers`, `saveMarker`
    - Fabric Rolls: `getFabricRolls`, `saveFabricRoll`
    - End-Loss: `getEndLossRemnants`, `saveEndLossRemnant`, `getEndBits`, `saveEndBit`
    - QC Audits: `getPanelAudits`, `savePanelAudit`, `getPanelQcAudits`, `savePanelQcAudit`
    - Event bus: `CUTTING_UPDATE_EVENT` (`zigza:cutting_updated`)
- **Turbopack Cache Invalidation**:
  - [`src/app/cutting/utils/storage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/storage.ts) acts as a clean, client-directed re-export proxy.
  - Direct imports across all client components updated to `cuttingStorage.ts`, completely eliminating the stale HMR export proxy error (`TypeError: ... is not a function`).

---

## 6. Enterprise Relational Database Blueprint (PostgreSQL / Supabase)

### 6.1 Division 02: Merchandising Database Models
```sql
-- 1. Merchandising Master Orders
CREATE TABLE merchandising_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(60) NOT NULL UNIQUE,
  brand_name VARCHAR(100) NOT NULL,
  style_ref VARCHAR(60) NOT NULL,
  style_name VARCHAR(150) NOT NULL,
  total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
  unit_fob_price NUMERIC(10,2) NOT NULL,
  total_contract_value NUMERIC(14,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  ex_factory_date DATE NOT NULL,
  status VARCHAR(40) DEFAULT 'PENDING_BOM', -- PENDING_BOM, IN_FABRIC, IN_PRODUCTION, CONTAINER_STUFFED, SHIPPED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Color-Size Matrix Quantities
CREATE TABLE merchandising_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  colorway VARCHAR(60) NOT NULL,
  size VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  UNIQUE (order_id, colorway, size)
);

-- 3. Bill of Materials (BOM) & Costing Ledgers
CREATE TABLE merchandising_bom_costings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  fabric_cost NUMERIC(8,2) NOT NULL,
  trims_cost NUMERIC(8,2) NOT NULL,
  embellishment_cost NUMERIC(8,2) NOT NULL,
  cmt_sewing_rate NUMERIC(8,2) NOT NULL,
  washing_cost NUMERIC(8,2) NOT NULL,
  packaging_cost NUMERIC(8,2) NOT NULL,
  factory_overhead_percent NUMERIC(5,2) DEFAULT 12.00,
  net_fob_cost NUMERIC(10,2) NOT NULL,
  actual_realized_cost NUMERIC(10,2) NOT NULL,
  variance_percent NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Time & Action (T&A) Milestones
CREATE TABLE merchandising_tna_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  milestone_name VARCHAR(100) NOT NULL,
  planned_date DATE NOT NULL,
  actual_date DATE,
  status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, DELAYED, ESCALATED
  sort_order INTEGER NOT NULL,
  responsible_entity VARCHAR(80),
  remarks TEXT
);

-- 5. Sourcing Requisitions (PR)
CREATE TABLE merchandising_sourcing_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number VARCHAR(60) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  material_category VARCHAR(50) NOT NULL,
  material_name VARCHAR(150) NOT NULL,
  required_quantity NUMERIC(10,2) NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL,
  unit_estimated_cost NUMERIC(10,2) NOT NULL,
  preferred_supplier VARCHAR(100),
  target_inward_date DATE NOT NULL,
  fulfillment_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, ORDERED, IN_TRANSIT, STORE_RECEIVED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Export Shipments & Container Logistics
CREATE TABLE merchandising_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref VARCHAR(60) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  container_number VARCHAR(60) NOT NULL,
  container_type VARCHAR(40) NOT NULL,
  forwarder_name VARCHAR(100) NOT NULL,
  carrier_vessel VARCHAR(100) NOT NULL,
  origin_port VARCHAR(80) NOT NULL,
  destination_port VARCHAR(80) NOT NULL,
  etd_date DATE NOT NULL,
  eta_date DATE NOT NULL,
  booking_cbm NUMERIC(8,2) NOT NULL,
  status VARCHAR(40) DEFAULT 'BOOKED', -- BOOKED, CONTAINER_STUFFED, CUSTOMS_CLEARED, SAILING, PORT_ARRIVED
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Division 03: Cutting Floor Database Models & Zero Ghost Piece Trigger
```sql
-- 1. Cutting Lay Sheets
CREATE TABLE cutting_lay_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lay_sheet_number VARCHAR(50) NOT NULL UNIQUE,
  table_number VARCHAR(20) NOT NULL,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  operator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  shade_group VARCHAR(20) NOT NULL,
  marker_length_meters NUMERIC(6,2) NOT NULL,
  total_plies INTEGER NOT NULL,
  total_cut_pieces INTEGER NOT NULL,
  efficiency_percent NUMERIC(4,2) NOT NULL,
  end_bit_meters NUMERIC(6,2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'SPREADING', -- SPREADING, READY_FOR_CUT, CUT_IN_PROGRESS, CUT_COMPLETED, BUNDLED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Physical Garment Bundles (Direct Link to Zero Ghost Piece Chain)
CREATE TABLE cutting_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_barcode VARCHAR(60) NOT NULL UNIQUE,
  lay_sheet_id UUID REFERENCES cutting_lay_sheets(id) ON DELETE CASCADE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  piece_count INTEGER NOT NULL CHECK (piece_count > 0),
  ply_start INTEGER NOT NULL,
  ply_end INTEGER NOT NULL,
  shade_group VARCHAR(20) NOT NULL,
  destination VARCHAR(40) DEFAULT '06_SEWING', -- 04_PRINTING, 05_EMBROIDERY, 06_SEWING
  current_location VARCHAR(50) DEFAULT 'CUTTING_EXIT',
  is_allotted_to_sewing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cut Panel QC Audit Logs
CREATE TABLE cutting_panel_qc_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES cutting_bundles(id) ON DELETE CASCADE,
  lay_sheet_id UUID REFERENCES cutting_lay_sheets(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  notch_accuracy_mm NUMERIC(3,1) NOT NULL,
  ply_deflection_mm NUMERIC(3,1) NOT NULL,
  shade_continuity_pass BOOLEAN DEFAULT TRUE,
  template_match_pass BOOLEAN DEFAULT TRUE,
  qc_verdict VARCHAR(30) DEFAULT 'PASS', -- PASS, PASSED_WITH_CONDITIONS, RE_CUT_PANELS, REJECT
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fabric Roll End-Bit Remnant Logs
CREATE TABLE cutting_end_bit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lay_sheet_id UUID REFERENCES cutting_lay_sheets(id) ON DELETE CASCADE,
  roll_barcode VARCHAR(60) NOT NULL,
  fabric_type VARCHAR(100) NOT NULL,
  colorway VARCHAR(50) NOT NULL,
  length_meters NUMERIC(6,2) NOT NULL,
  width_inches NUMERIC(5,2) NOT NULL,
  waste_reason VARCHAR(100) NOT NULL,
  disposition VARCHAR(50) DEFAULT 'AVAILABLE_FOR_RECUT', -- AVAILABLE_FOR_RECUT, SALVAGED_FOR_POCKETS, RECYCLED_SCRAP
  returned_to_store BOOLEAN DEFAULT TRUE,
  logged_by VARCHAR(80),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Zero Ghost Piece Quantity Integrity Check Trigger
-- Validates that allotments downstream in 06 Sewing never exceed the piece count of the cutting bundle
CREATE OR REPLACE FUNCTION fn_check_bundle_allotment_sum()
RETURNS TRIGGER AS $$
DECLARE
  v_bundle_pieces INTEGER;
  v_allocated_sum INTEGER;
BEGIN
  SELECT piece_count INTO v_bundle_pieces 
  FROM cutting_bundles 
  WHERE id = NEW.bundle_id;

  SELECT COALESCE(SUM(allotted_quantity), 0) INTO v_allocated_sum 
  FROM allotments 
  WHERE bundle_id = NEW.bundle_id AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (v_allocated_sum + NEW.allotted_quantity) > v_bundle_pieces THEN
    RAISE EXCEPTION 'Zero Ghost Piece Violation: Bundle % has % total pieces, but sum of allotments would reach %',
      NEW.bundle_id, v_bundle_pieces, (v_allocated_sum + NEW.allotted_quantity);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
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
- **Turbopack Cache Invalidation**: Fully resolved runtime `TypeError: ... is not a function` by creating `'use client'` dedicated utility [`cuttingStorage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/cuttingStorage.ts), updating all component imports, and maintaining safe re-exports in [`storage.ts`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/src/app/cutting/utils/storage.ts).
- **Aesthetic Consistency**: Strict adherence to the Industrial Luxury design system across all 8 views of Division 02 and 11 views of Division 03.
- **Brand Terminology**: Canonical brand name **"Zigza AI"** maintained across all routes and copilots.
