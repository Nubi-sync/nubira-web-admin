# 06 • Stitching & Sewing Floor Master Architecture Specification
### Zigza MES Garment Manufacturing Platform • Benchmark Blueprint Document
**Route Prefix**: `/stitching-sewing` | **Division Order**: 06 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

> [!IMPORTANT]
> **MASTER BENCHMARK REFERENCE NOTICE**:
> This document represents the operational **Gold Standard** of the Zigza MES ecosystem. The Stitching & Sewing Floor is already 100% operational in active code. **NO CODE CHANGES ARE TO BE MADE TO THIS PORTAL**. All other 10 division documentation files take structural and architectural reference from this benchmark.

---

## 1. Executive Summary & Industry Scope

The **Stitching & Sewing Floor** is the core assembly engine of garment manufacturing. It coordinates progressive line operations, lineman piece-rate wage ledgers, barcode bundle allotments, 3-stage Quality Control (Cutting, Inline, and End-of-Line Finishing Audits), and real-time godown store handshakes. It enforces the **Zero Ghost Piece Guarantee**: every single cut piece entered into a sewing line is 100% accounted for as either a Passed Garment or an Alteration/Rejection Log.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    06. STITCHING & SEWING FLOOR (CORE MES)                  │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ GSD (General Sewing Data) / SAM / ISO 4915 │
│ Upstream Inward Entity:        │ 03. Cutting Floor + 04. Print + 05. Embroid│
│ Downstream Outward Entity:     │ 07. Washing / 08. Iron / 10. Alter / 09. RG│
│ Target Line Efficiency (OEE):  │ ≥ 85.0% Line Throughput                    │
│ First-Pass Yield (FPY):        │ ≥ 97.5% Right-First-Time Quality Pass      │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 03. CUTTING / 04. PRINT / 05. EMBROIDERY ]
• Numbered Bundles of Matched Cut Panels (with QR Barcode Tickets)
• Delivery Challan Matrix by Article, Color, and Size
• Raw Accessories & Thread Cones from Store Godown
            │
            ▼ (Inward Verification Handshake)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 06. STITCHING & SEWING FLOOR                                                │
│ • Lineman Allotment & Workstation Line Balancing (SAM Balancing)            │
│ • Progressive Assembly (Front Prep -> Back Prep -> Assembly -> Sleeve/Hem) │
│ • 3-Stage QC Audit (Defect Pareto Logging & Instant Traffic Light Feedback) │
│ • Daily Wage & Piece-Rate Ledger Generation (Real-Time Earnings per Lineman)│
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Clean Pass Payload)                  ▼ (Rework Payload)
[ 07. INDUSTRIAL WASHING / 08. IRONING ] [ 10. ALTERATION & QUALITY REWORK ]
• 100% QC Passed Garment Lots            • Skipped stitches, puckering, oil spots
• Verified Article & Challan Quantities  • Operator defect tagging for re-seam
• Outward Delivery Challan Manifest      • Secondary AQL clearance loop
```

---

## 3. Complete Side Navigation Architecture

The Stitching & Sewing Floor portal features a comprehensive **4-tier, 12-item navigation system**:

```
[ Tier 1: Workspace Hub ]
  └── 01. All Modules                 -> /modules (Central Enterprise Hub)

[ Tier 2: Sewing Floor Operations ]
  ├── 02. Master Floor Dashboard      -> /stitching-sewing/dashboard
  ├── 03. Store & Godown Inward       -> /stitching-sewing/store
  └── 04. Zigza AI Copilot            -> /stitching-sewing/zigza-ai

[ Tier 3: Production Execution ]
  ├── 05. Production Chart & Orders   -> /stitching-sewing/production-orders
  ├── 06. Target Allotments & Bundles -> /stitching-sewing/allotments
  ├── 07. Godown & WIP Inventory      -> /stitching-sewing/inventory
  └── 08. Dispatch & Challan Hub      -> /stitching-sewing/dispatch

[ Tier 4: Master Management ]
  ├── 09. Supervisor Profile          -> /stitching-sewing/profile
  ├── 10. Brands & Multi-Vendors      -> /stitching-sewing/vendors
  ├── 11. Floor Employees & Linemen   -> /stitching-sewing/employees
  ├── 12. Articles & Piece-Rate Specs -> /stitching-sewing/articles
  └── 13. Reports & Analytics Audit   -> /stitching-sewing/reports
```

---

## 4. Comprehensive Page-by-Page Technical Specifications

### Page 1: Master Floor Dashboard (`/stitching-sewing/dashboard`)
* **Purpose**: Real-time production intelligence cockpit. Supports a dedicated fullscreen **TV View Mode** for factory floor overhead monitors.
* **Core Metrics Bar (4 Key KPI Cards)**:
  1. `Daily Floor Output`: **4,850 Pcs** *(Target: 5,200 Pcs • 93.2% Target Realized)*
  2. `Active Linemen on Floor`: **38 Operators** *(8 Running Progressive Lines)*
  3. `First-Pass Yield (FPY)`: **97.8%** *(Rejection Scrap: 0.2% • Alteration: 2.0%)*
  4. `Store Handshake State`: **REALTIME** *(Zero discrepancy across GRN & Challans)*
* **Interactive Floor Views**:
  * Line-wise velocity graphs (Line 1 to Line 8 hourly production curves).
  * TV View toggle (`TvViewButton`) for live shopfloor broadcast.
  * Recent activity feed with human-readable relative time stamps (`Just now`, `5 min ago`).

### Page 2: Store Dashboard & Receiving (`/stitching-sewing/store`)
* **Purpose**: Inward material reception, truck gate inwarding, accessory allotments, and floor reissues.
* **5 Core Operational Tabs**:
  1. `Truck Inward (GRN)`: Log vehicle number, transport slip, roll counts, party name.
  2. `Accessory Allotment`: Issue thread cones, zippers, labels to specific linemen.
  3. `Active Floor Handshakes`: Live pending approvals between store and sewing floor.
  4. `Ready QC Allotments`: Finished goods received from line awaiting store racking.
  5. `Floor Reissue Hub`: Re-issuing damaged fabric panels or replacement trims.

### Page 3: Production Chart & Challan Hub (`/stitching-sewing/production-orders`)
* **Purpose**: Master production order scheduling, vendor challan breakdown, and Excel bulk imports.
* **Key Features**:
  * **Brand + Vendor Hierarchy Filtering**: Selecting Brand `OLLYPOP` dynamically populates only its contracted stitching vendors (`Unit-01 Shanti`, `Unit-02 Star`).
  * **Excel Bulk Import Engine**: Upload 200–500 challans in `.xlsx` format with automated column mapping (`CHALLAN_NO`, `ART_NO`, `COLOR`, `SIZE`, `QTY`, `VENDOR`).
  * **Challan Status Pipeline**: `PENDING`, `IN_PRODUCTION`, `QC_INSPECTED`, `DISPATCHED`.

### Page 4: Target Allotments (`/stitching-sewing/allotments`)
* **Purpose**: Individual lineman bundle allotment and daily piece-rate target management.
* **Key Data Table**:
  * Columns: `Challan #`, `Article`, `Lineman Name`, `Allotted Pcs`, `Completed Pcs`, `Defect Pcs`, `Piece Rate (₹)`, `Earned Wages (₹)`, `Status`.
* **Real-Time Earnings Calculation**:
  $$\text{Lineman Shift Wages} = \text{Verified Passed Pcs} \times \text{Article Stitching Rate (₹)}$$

### Page 5: Godown & WIP Inventory (`/stitching-sewing/inventory`)
* **Purpose**: Live stock visibility across all article variants, WIP pieces on floor, and boxed inventory.
* **Key Visuals**: Color-Size matrix balance, bin location tags (`Rack A-04`, `Bay 2`), shortage alerts.

### Page 6: Dispatch & Challan Gate Passes (`/stitching-sewing/dispatch`)
* **Purpose**: Outward logistics gate passes. Generates printable Delivery Challans for finished goods moving to Washing, Finishing, or Client Warehouses.

### Page 7: Articles Master Catalog (`/stitching-sewing/articles`)
* **Purpose**: Garment style repository. Defines `art_no`, description, piece stitching rate (`stitching_rate`), and active status.

### Page 8: Brands & Vendors (`/stitching-sewing/vendors`)
* **Purpose**: Multi-vendor directory. Separates Principal Buyers (Brands) from Contract Job-Workers (Vendors).

### Page 9: Employees & Linemen (`/stitching-sewing/employees`)
* **Purpose**: Operator directory, skill ratings (Grade A tailor, Overlock master), and wage configurations.

### Page 10: Reports & Analytics (`/stitching-sewing/reports`)
* **Purpose**: Production export ledgers, daily wage payouts, rejection Pareto charts, and date-range CSV exports.

---

## 5. Complete Forms Catalog (Every Form in Total)

The Stitching & Sewing portal contains **8 production-critical data entry forms**:

### Form 1: Delivery Challan Creation & Excel Import Form
* **Location**: `/stitching-sewing/production-orders`
* **Mode**: Manual Single Entry OR Excel Drag-and-Drop
* **Fields**: `challan_no`, `brand_id`, `vendor_id`, `article_id`, `color`, `size`, `total_quantity`, `stitching_rate_override`, `target_completion_date`, `notes`.
* **Validation**: `challan_no` must be unique; `total_quantity` > 0.

### Form 2: New Article Registration Form
* **Location**: `/stitching-sewing/articles`
* **Fields**: `art_no` (e.g. `ART-7714`), `description`, `category`, `stitching_rate` (Decimal e.g. `₹22.50`), `default_sam_minutes`, `is_active`.
* **Validation**: `art_no` unique constraint.

### Form 3: Daily Target Allotment Form
* **Location**: `/stitching-sewing/allotments`
* **Fields**: `challan_id`, `lineman_employee_id`, `target_quantity`, `line_number`, `shift` (`SHIFT_A`, `SHIFT_B`), `allotment_date`.
* **Validation**: Allocated quantity cannot exceed remaining unallocated challan balance.

### Form 4: Store Truck Inward (GRN) Form
* **Location**: `/stitching-sewing/store`
* **Fields**: `transport_no`, `vehicle_no`, `party_name`, `challan_no`, `item_type` (`FABRIC_ROLL`, `TRIMS`, `SEWING_THREAD`), `quantity`, `unit` (`KG`, `METERS`, `ROLLS`, `BOXES`), `gate_pass_no`, `driver_phone`.

### Form 5: Accessory & Trim Allotment Form
* **Location**: `/stitching-sewing/store`
* **Fields**: `accessory_name`, `challan_id`, `lineman_name`, `issued_qty`, `unit`, `issue_date`.

### Form 6: Floor Reissue & Scrap Exchange Form
* **Location**: `/stitching-sewing/store`
* **Fields**: `original_challan_id`, `damaged_panel_type`, `quantity`, `defect_reason`, `supervisor_signoff`.

### Form 7: Brand & Vendor Registration Form
* **Location**: `/stitching-sewing/vendors`
* **Fields**: `entity_type` (`BRAND` vs `VENDOR`), `name`, `contact_person`, `phone`, `gst_number`, `address`, `linked_brand_id` (if vendor).

### Form 8: Outward Delivery Challan & Dispatch Form
* **Location**: `/stitching-sewing/dispatch`
* **Fields**: `dispatch_challan_no`, `destination_type` (`WASHING`, `IRONING`, `CENTRAL_GODOWN`, `BUYER`), `destination_address`, `vehicle_no`, `driver_name`, `dispatched_items` (array of `article_id`, `size`, `qty`).

---

## 6. Zigza AI Domain Intelligence for Stitching & Sewing

The Stitching & Sewing Zigza AI assistant is deeply integrated with floor telemetry:
* **Context**: Queries live `allotments`, `production_orders`, `qc_logs`, and `store_transactions`.
* **Sample Prompts**:
  1. `"Show me line-wise output for today and highlight any line trailing behind hourly target."`
  2. `"Calculate total piece-rate wages earned by Lineman Ramesh for Style ART-7714 this week."`
  3. `"Audit open challans for Brand Ollypop and list any challan pending for more than 48 hours."`

---

## 7. Database Schema Reference (Active Supabase Architecture)

```sql
-- Core Production Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  art_no VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  stitching_rate NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Challans
CREATE TABLE challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_no VARCHAR(60) NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id),
  vendor_id UUID REFERENCES vendors(id),
  article_id UUID REFERENCES articles(id),
  color VARCHAR(50),
  size VARCHAR(20),
  quantity INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lineman Target Allotments
CREATE TABLE allotments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID REFERENCES challans(id) ON DELETE CASCADE,
  lineman_name VARCHAR(100) NOT NULL,
  allotted_quantity INTEGER NOT NULL,
  completed_quantity INTEGER DEFAULT 0,
  defect_quantity INTEGER DEFAULT 0,
  piece_rate NUMERIC(8,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Transactions & GRN
CREATE TABLE store_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE DEFAULT CURRENT_DATE,
  type VARCHAR(30) NOT NULL, -- INWARD, ALLOTMENT, REISSUE, DISPATCH
  quantity NUMERIC(10,2) NOT NULL,
  party_name VARCHAR(100),
  challan_no VARCHAR(60),
  transport_no VARCHAR(60),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
