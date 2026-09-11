# 02 • Merchandising & Sourcing Desk Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/merchandising` | **Division Order**: 02 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Merchandising & Sourcing Desk** is the commercial engine and critical path coordinator of the garment factory. It converts buyer purchase orders into profitable manufacturing runs, monitors Bill of Materials (BOM) cost variances, sources bulk fabric and trims, and enforces strict compliance with Buyer Time & Action (T&A) delivery schedules.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    02. MERCHANDISING & SOURCING DESK                        │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ Incoterms 2020 (FOB/CIF) / ISO 9001 T&A   │
│ Upstream Inward Entity:        │ 01. Design Studio & Buyer Contract Team    │
│ Downstream Outward Entity:     │ 11. Central Store & 03. Cutting & 06. Sew │
│ BOM Cost Variance Target:      │ Within ± 1.5% of approved buyer quotation  │
│ On-Time Delivery (OTD) SLA:    │ ≥ 98.0% across all confirmed buyer POs     │
│ Critical Path Milestones:      │ 8 Standard T&A Gates with Alert Engine     │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 01. DESIGN STUDIO ]                     [ BUYER CONTRACT / EDI ]
• Approved Tech-Pack Spec                 • Confirmed Purchase Order (PO)
• Fabric Consumption per Piece            • Delivery Date & FOB Price
• Embellishment Sequence Rule             • Ratio Matrix by Color & Size
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 02. MERCHANDISING & SOURCING DESK                                           │
│ • Lock Pre-Costing & Post-Costing BOM Ledger                                │
│ • Create Dynamic T&A Critical Path Milestones (Lab dips, Inward, Cut, Sew)   │
│ • Issue Material Sourcing Requisitions (PR) for Fabric, Thread & Accessories│
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Handshake Payload A)                 ▼ (Handshake Payload B)
[ 11. CENTRAL STORE & GODOWN ]          [ 03. CUTTING & 06. SEWING ]
• Material Procurement Requisitions (PR)• Work Order Release Authorization
• Approved Vendor Challan List          • Confirmed Cut Quantity by Size-Color
• Required Fabric Meterage & Trims      • Ex-Factory Milestone Deadline & Rates
```

### Inward Handshake (What Merchandising Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Buyer PO Number** | Principal Buyer / Brand | String (e.g. `PO-ZIG-8901`) | Unique per buyer contract |
| **Approved Tech-Pack ID** | `01. Design Studio` | UUID (`design_tech_packs.id`)| Must have status `PPS_APPROVED` |
| **Fabric Yield (Consumption)**| `01. Design Studio` | Decimal (e.g. `1.35 kg/pc`) | Validated by marker test |
| **Total Order Quantity** | Buyer Contract | Integer (e.g. `24,000 pcs`) | Broken down by Color-Size matrix |
| **Contract Delivery Date** | Buyer Contract | ISO Date (e.g. `2026-10-15`) | Must allow ≥ minimum lead time |

### Outward Handshake (What Merchandising Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Purchase Requisition (PR)** | `11. Central Store` | PO Confirmation | Fabric meterage, yarn specs, zipper/button counts, approved suppliers |
| **Production Work Order** | `03. Cutting Floor` | Fabric Inward Verified | Total lot quantity, ratio breakdown (S-M-L-XL), target cut start date |
| **Target Stitching Rate** | `06. Stitching & Sewing` | Order Allotment | Fixed piece-rate per garment (e.g. ₹24.50/pc), style complexity rating |

---

## 3. Total Side Navigation Architecture

The Merchandising portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Merchandising Operations ]
  ├── 01. Desk Dashboard              -> /merchandising
  ├── 02. Buyer Purchase Orders       -> /merchandising/orders
  ├── 03. BOM & Costing Ledgers       -> /merchandising/costing
  ├── 04. Time & Action (T&A) Planner -> /merchandising/tna-calendar
  ├── 05. Trim & Sourcing Requisitions-> /merchandising/sourcing
  ├── 06. Shipment & FOB Pipeline     -> /merchandising/shipments
  ├── 07. Zigza AI Copilot            -> /merchandising/zigza-ai
  └── 08. Desk Profile                -> /merchandising/profile
```

---

## 4. Complete Page Specifications (All 8 Navigation Views)

### Page 1: Desk Dashboard (`/merchandising`)
* **Purpose**: Master summary of open buyer commitments, cost variances, and factory capacity loading.
* **4 Metric KPI Cards**:
  1. `Active Buyer POs`: **14 Orders** *(Total Booked: 185,000 Pcs)*
  2. `BOM Cost Realization`: **98.2%** *(Actual vs Planned variance within ±1.8%)*
  3. `Trim Procurement In-House`: **100% In-Stock** *(Zero floor line-stoppage)*
  4. `On-Time Delivery (OTD)`: **97.8%** *(3 international shipments departing this week)*
* **Critical Path Health Monitor**:
  * Bar chart showing % completion across the 5 core milestones: `Fabric Inward` (92%), `Cutting` (78%), `Sewing` (64%), `Finishing` (42%), `Carton Pack` (30%).

### Page 2: Buyer Purchase Orders (`/merchandising/orders`)
* **Purpose**: Directory of all commercial purchase orders with status tracking and amendment history.
* **Primary Order Matrix Table**:
  * Columns: `PO Number`, `Brand / Buyer`, `Style Description`, `Total Pcs`, `Unit FOB Price (₹/$)`, `Order Value`, `Ex-Factory Date`, `Order Status`, `Actions`.
  * Status Filter: `BOOKED`, `FABRIC_PENDING`, `IN_PRODUCTION`, `IN_PACKING`, `DISPATCHED`, `CLOSED`.

### Page 3: BOM Costing Ledgers (`/merchandising/costing`)
* **Purpose**: Line-by-line financial ledger of pre-costing vs actual post-costing for every style.
* **Standard Garment Costing Structure**:
  $$\text{Total FOB Cost} = \text{Fabric} + \text{Trims} + \text{Printing/Embroidery} + \text{CMT (Cut/Make/Trim)} + \text{Washing} + \text{Packing} + \text{Factory Overhead (12\%)}$$
* **Live Variance Engine**: Flags in red any style where raw material cost exceeds quote by > 2.0%.

### Page 4: Time & Action (T&A) Calendar (`/merchandising/tna-calendar`)
* **Purpose**: Interactive Gantt-chart and checklist mapping every critical path event from order placement to shipment.
* **8 Tracked Industry Milestones**:
  1. Lab Dip Approval (Target: Day +7)
  2. Bulk Fabric Inward (Target: Day +20)
  3. Size Set Sample Approval (Target: Day +24)
  4. Pre-Production Meeting & Pilot Cut (Target: Day +28)
  5. Bulk Cutting & Lineman Allotment (Target: Day +32)
  6. Mid-Inspection Audit (Target: Day +42)
  7. Final AQL 2.5 Audit & Carton Sealing (Target: Day +52)
  8. Container Handover / Port Departure (Target: Day +55)

### Page 5: Trim & Sourcing Requisitions (`/merchandising/sourcing`)
* **Purpose**: Material Requisition (PR) console pushing automated procurement requests to `11. Central Store`.
* **Columns**: `PR Number`, `Linked PO`, `Material Name`, `Required Qty`, `Unit (Kg/Mtr/Gross)`, `Supplier Name`, `Target In-House Date`, `Fulfillment Status` (`PENDING`, `ORDERED`, `STORE_RECEIVED`).

### Page 6: Shipment & FOB Pipeline (`/merchandising/shipments`)
* **Purpose**: Commercial export logistics tracking port cutoffs, Bill of Lading (BL) releases, and forwarder container bookings.
* **Metrics**: CBM volume booked, carrier name (Maersk/MSC), port of loading (Nhava Sheva/Mundra), destination port (Rotterdam/New York).

### Page 7: Zigza AI Copilot (`/merchandising/zigza-ai`)
* **Purpose**: Commercial intelligence, margin calculation, and T&A delay prediction engine.
* **Pre-Loaded Prompts**:
  1. `"Which buyer POs have ex-factory dates in the next 14 days where sewing output is below 70%?"`
  2. `"If French Terry fabric price increases by ₹18/kg, how does that impact our net margin on PO-8901?"`
  3. `"Check trim inward status for Zara PO-8905 and report any missing hangtags or care labels."`

### Page 8: Merchandising Desk Profile (`/merchandising/profile`)
* **Purpose**: Merchandiser account credentials, assigned brand portfolio, and commercial signing limits.

---

## 5. Complete Form Specifications

### Form 1: Master Buyer Purchase Order (PO) 2-Step Stepper
* **Trigger**: `Book New Buyer PO` on `/merchandising/orders`
* **Step 1: Commercial Order Basics**:
  * `po_number` (Text, Unique)
  * `brand_id` (Dropdown, Registered Brands)
  * `tech_pack_id` (Dropdown, Approved Tech-Packs)
  * `currency` (`INR`, `USD`, `EUR`, `GBP`)
  * `unit_fob_price` (Decimal, 2 places)
  * `total_order_qty` (Number, e.g. `24,000`)
  * `ex_factory_date` (Date Picker)
* **Step 2: Dynamic Color & Size Matrix Grid Entry**:
  * Interactive grid: Rows = Colors (e.g. `Jet Black`, `Heather Grey`), Columns = Sizes (dynamically populated from linked Tech-Pack sizing scheme).
  * Auto-validation: Sum of all cells in grid must equal `total_order_qty`.

### Form 2: BOM Costing Sheet Entry Form
* **Trigger**: `Create Costing Sheet` on `/merchandising/costing`
* **Fields**: `po_id`, `fabric_cost_per_kg`, `fabric_consumption_kg`, `sewing_thread_cost`, `zipper_cost`, `labels_tags_cost`, `stitching_cm_rate`, `washing_cost`, `printing_embroidery_cost`, `packaging_cost`, `rejection_contingency_percent` (Default: 2%).
* **Post-Submit Action**: Computes net garment FOB cost and factory gross margin percentage.

### Form 3: Time & Action (T&A) Milestone Update Form
* **Trigger**: `Update Milestone` on `/merchandising/tna-calendar`
* **Fields**:
  | Field Name | Type | Required | Validation / Options | Tooltip / Hint |
  | :--- | :--- | :--- | :--- | :--- |
  | `milestone_id` | Select Dropdown | Yes | Active milestones for PO | Target event |
  | `planned_date` | Date | Yes | Default from template | Original target date |
  | `actual_completed_date`| Date | Yes | Past or current date | When physically completed |
  | `milestone_status` | Select Dropdown | Yes | `ON_SCHEDULE`, `DELAYED`, `COMPLETED`, `ESCALATED` | Health indicator |
  | `delay_reason` | Select Dropdown | No | `FABRIC_DELAY`, `LAB_DIP_REJECT`, `SAMPLE_REVISION`, `POWER_OUTAGE` | Root cause |
  | `mitigation_notes`| Textarea | No | Max 500 chars | Plan to recover lost time |

### Form 4: Material Sourcing Requisition (PR) Form
* **Trigger**: `Generate Sourcing PR` on `/merchandising/sourcing`
* **Fields**: `order_id`, `material_name`, `material_type` (`FABRIC`, `SEWING_THREAD`, `LABEL`, `ZIPPER`, `POLYBAG`, `CARTON`), `required_quantity`, `unit`, `suggested_vendor_id`, `required_in_store_date`.
* **Post-Submit Action**: Inserts into `merchandising_sourcing_requisitions` and immediately pushes inward notification to `11. Central Store`.

---

## 6. Zigza AI Domain Intelligence for Merchandising

1. **Critical Path Bottleneck Alert**: `"Which buyer POs have ex-factory dates in the next 14 days where sewing output is below 70%?"`
2. **Fabric Consumption Re-Costing**: `"If French Terry fabric price increases by ₹18/kg, how does that impact our net margin on PO-8901?"`
3. **BOM Shortage Query**: `"Check trim inward status for Zara PO-8905 and report any missing hangtags or care labels."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Buyer Purchase Orders Master
CREATE TABLE merchandising_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(60) NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id) ON DELETE RESTRICTED,
  tech_pack_id UUID REFERENCES design_tech_packs(id),
  total_quantity INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  unit_fob_price NUMERIC(10,2) NOT NULL,
  total_contract_value NUMERIC(14,2) NOT NULL,
  ex_factory_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'BOOKED', -- BOOKED, IN_FABRIC, IN_PRODUCTION, PACKED, DISPATCHED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bill of Materials (BOM) Costing Ledger
CREATE TABLE merchandising_bom_costings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  fabric_cost NUMERIC(8,2) NOT NULL,
  trims_accessories_cost NUMERIC(8,2) NOT NULL,
  embellishment_cost NUMERIC(8,2) DEFAULT 0.00,
  cmt_sewing_rate NUMERIC(8,2) NOT NULL,
  washing_finishing_cost NUMERIC(8,2) DEFAULT 0.00,
  packaging_cost NUMERIC(8,2) NOT NULL,
  factory_overhead_percent NUMERIC(4,2) DEFAULT 12.00,
  net_fob_cost NUMERIC(10,2) NOT NULL,
  target_margin_percent NUMERIC(4,2) NOT NULL,
  actual_realized_cost NUMERIC(10,2),
  variance_percent NUMERIC(4,2)
);

-- 3. Time & Action (T&A) Milestones
CREATE TABLE merchandising_tna_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  milestone_name VARCHAR(100) NOT NULL,
  planned_date DATE NOT NULL,
  actual_date DATE,
  status VARCHAR(30) DEFAULT 'ON_SCHEDULE', -- ON_SCHEDULE, DELAYED, COMPLETED, ESCALATED
  delay_reason VARCHAR(100),
  sort_order INTEGER NOT NULL
);

-- 4. Material Sourcing Requisitions (PR)
CREATE TABLE merchandising_sourcing_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE CASCADE,
  material_name VARCHAR(100) NOT NULL,
  material_type VARCHAR(40) NOT NULL, -- FABRIC, SEWING_THREAD, LABEL, ZIPPER, CARTON
  required_quantity NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  required_in_store_date DATE NOT NULL,
  fulfillment_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, ORDERED, STORE_RECEIVED
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
