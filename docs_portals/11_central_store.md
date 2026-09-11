# 11 • Central Store & Raw Material Godown Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/store` | **Division Order**: 11 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Central Store & Raw Material Godown** is the factory's inventory nerve center and logistics custodian. Managing over **50,000 finished export garments** and **30+ tons of raw knit/woven fabric rolls**, the godown controls Truck Gate Entry (Goods Received Note - GRN), ASTM D5430 4-Point System fabric inspection, shade lot segregation, trims warehouse binning, cutting challan material issuance, and final container export dispatch.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 11. CENTRAL STORE & RAW MATERIAL GODOWN                     │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D5430 (4-Point Fabric Inspection)     │
│ Upstream Inward Entity:        │ Fabric Mills / Trims Suppliers / 09. Ready │
│ Downstream Outward Entity:     │ 03. Cut / 06. Sew / Export Shipping Dock   │
│ Fabric Inspection 4-Point SLA: │ ≤ 28 Penalty Points per 100 Square Yards   │
│ Inventory Ledger Accuracy:     │ ≥ 99.9% Barcode Verified Physical Audit    │
│ Gate Entry Workflow:           │ 2-Step Stepper: Vehicle Gate -> Weighbridge│
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ EXTERNAL FABRIC MILLS & TRIMS SUPPLIERS ]
• Raw Fabric Truck Delivery (Lorry Receipts, Mill Packing Lists)
• Thread Cones, Zippers, Hangtags, Polybags, Corrugated Cartons
            │
            ▼ (Gate Inward GRN)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 11. CENTRAL STORE & RAW MATERIAL GODOWN                                     │
│ • Gate Pass Security Log & Truck Weighbridge Registration                   │
│ • ASTM D5430 4-Point Fabric Inspection Machine (10% Random Roll Audit)      │
│ • Fabric GSM & Width Verification (± 3% Tolerance)                          │
│ • Barcode Bin Storage (Bay 1-2: Fabric Yard | Bay 3-5: Finished Export Box) │
│ • Material Issue Challans (Fabric -> Cutting | Thread/Trims -> Sewing)     │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Floor Issue Payload)                 ▼ (Export Dispatch Payload)
[ 03. CUTTING & 06. SEWING ]            [ OVERSEAS EXPORT CONTAINER TRUCKS ]
• Scanned Fabric Rolls by Shade Lot     • Sealed Master Export Cartons
• Complete Trims BOM Package            • Container Stuffing Loading Sheet
• Automated Inventory Depletion         • Customs Gate Pass & Delivery Challan
```

### Inward Handshake (What Central Store Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Mill Lorry Receipt (LR)** | External Fabric Mill | Lorry Transport No | Must match commercial PO |
| **Fabric Roll Packing Slip**| Mill Supplier | Roll No, Gross/Net Kg, Meterage| Every physical roll must have mill ticket |
| **Sealed Finished Cartons** | `09. Ready Goods` | Carton Manifest (`CTN-XXXX`)| Verified AQL 2.5 pass label |

### Outward Handshake (What Central Store Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Allocated Fabric Rolls** | `03. Cutting Floor` | Cutting Lay Requisition| Scanned roll barcodes, exact shade band (Shade A/B/C) |
| **Thread & Trims Package** | `06. Stitching & Sewing`| Sewing Order Start | Required cones, brand labels, zipper counts |
| **Export Container Manifest**| Container Logistics | Port Gate Pass | Total cartons, total pcs, gross weight, seal number |

---

## 3. Total Side Navigation Architecture

The Central Store portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Central Store Operations ]
  ├── 01. Store Dashboard             -> /store
  ├── 02. Fabric Godown & 4-Point QC  -> /store/fabric-godown
  ├── 03. Trims & Accessories Whse    -> /store/trims-warehouse
  ├── 04. Truck Inward Gate (GRN)     -> /store/truck-inwards
  ├── 05. Material Issues to Floor    -> /store/material-issues
  ├── 06. Finished Goods Bay (Bay 3-5)-> /store/finished-godown
  ├── 07. Zigza AI Copilot            -> /store/zigza-ai
  └── 08. Central Store Profile       -> /store/profile
```

---

## 4. Complete Page Specifications (All 8 Navigation Views)

### Page 1: Store Dashboard (`/store`)
* **Purpose**: Master inventory cockpit of fabric yardage, trim stocks, and finished export goods.
* **4 Metric KPI Cards**:
  1. `Fabric Rolls in Godown`: **1,240 Rolls** *(32.5 Metric Tons in Stock)*
  2. `Finished Export Stock`: **42,500 Pcs** *(Stored in Central Godown Bay 3–5)*
  3. `Challans Issued Today`: **18 Challans** *(Cutting & Floor dispatch active)*
  4. `Inventory Ledger Accuracy`: **99.9%** *(100% Barcode verified cycle count)*

### Page 2: Fabric Godown & 4-Point Inspection (`/store/fabric-godown`)
* **Purpose**: Digital roll yardage ledger and inspection console enforcing the **ASTM D5430 4-Point System**:
  * Defect up to 3 inches: **1 Point**
  * Defect 3 to 6 inches: **2 Points**
  * Defect 6 to 9 inches: **3 Points**
  * Defect over 9 inches / Holes: **4 Points**
  * **Pass Standard**: Total penalty points $\le 28$ per 100 sq yards.

### Page 3: Trims & Accessories Warehouse (`/store/trims-warehouse`)
* **Purpose**: Bin-location manager for threads, zippers, buttons, labels, and polybags with Re-Order Level (ROL) traffic lights.

### Page 4: Truck Inward Gate & GRN Hub (`/store/truck-inwards`)
* **Purpose**: Security gatehouse console registering truck arrival, weighbridge slips, and generating electronic GRNs.

### Page 5: Material Issues to Floor (`/store/material-issues`)
* **Purpose**: Barcode scanner dispatch station releasing reserved fabric rolls to Cutting and BOM trim packages to Sewing.

### Page 6: Finished Goods Export Staging Bay 3–5 (`/store/finished-godown`)
* **Purpose**: Pallet racking console tracking packed cartons waiting for container stuffing, cross-checked against buyer commercial invoices.

### Page 7: Zigza AI Copilot (`/store/zigza-ai`)
* **Purpose**: Deadstock identification, inventory cycle audit, and container load optimization assistant.
* **Pre-Loaded Prompts**:
  1. `"Identify all fabric rolls stored in Bay 1 that have remained un-issued for more than 90 days."`
  2. `"Which sewing thread colors have stock levels below 3 days of average line consumption?"`
  3. `"Cross-check loaded carton count for Container MSCU-4820 against buyer packing list."`

### Page 8: Central Store Profile (`/store/profile`)
* **Purpose**: Storekeeper authorizations, material custody sign-offs, and weighbridge calibration logs.

---

## 5. Complete Form Specifications

### Form 1: Truck Gate Inward & GRN 2-Step Stepper
* **Trigger**: `Record Truck Inward` on `/store/truck-inwards`
* **Step 1: Security & Transport Details**:
  * `grn_number` (Text, Unique Pattern: `^GRN-[0-9]{5,8}$`)
  * `vehicle_number` (Text, e.g. `DL-01-AB-1234`)
  * `supplier_id` (Dropdown, Registered Vendors)
  * `po_reference` (Dropdown, Active Buyer Orders)
* **Step 2: Consignment Quantities & Weighbridge**:
  * `item_category` (`RAW_FABRIC_ROLL`, `TRIMS`, `PACKAGING`, `CHEMICAL`)
  * `total_rolls_boxes` (Number, Min: 1)
  * `gross_weight_kg` (Number from weighbridge scale)
  * `driver_phone` (Phone)

### Form 2: ASTM D5430 4-Point Roll Inspection Form
* **Trigger**: `Inspect Fabric Roll` on `/store/fabric-godown`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `roll_barcode` | Text | Yes | Scanned mill roll barcode | Physical roll |
| `measured_width_inches`| Number | Yes | Tolerance $\pm 0.5$ inches | Width check |
| `measured_gsm` | Number | Yes | Tolerance $\pm 3\%$ of BOM spec | Weight check |
| `penalty_points_total` | Number | Yes | Sum of 1, 2, 3, 4 point defects | ASTM 4-Point count |
| `points_per_100_sq_yd` | Number (Auto) | Yes | Auto-calculated | Must be $\le 28$ to pass |
| `shade_group` | Select Dropdown | Yes | `SHADE_A`, `SHADE_B`, `SHADE_C` | Spectro shade banding |
| `inspection_verdict` | Select Dropdown | Yes | `PASS_FOR_CUTTING`, `REJECT_RETURN_TO_MILL`| Master roll status |

### Form 3: Material Floor Issue Challan Form
* **Trigger**: `Issue Material to Floor` on `/store/material-issues`
* **Fields**: `issue_challan_no`, `destination_division` (`CUTTING_FLOOR`, `SEWING_FLOOR`), `order_id`, `receiver_employee_id` (FK), `scanned_material_barcodes` (Array of fabric rolls or trim packs), `issue_notes`.

---

## 6. Zigza AI Domain Intelligence for Central Store

1. **Deadstock Inventory Finder**: `"Identify all fabric rolls stored in Bay 1 that have remained un-issued for more than 90 days."`
2. **Re-Order Level (ROL) Alert**: `"Which sewing thread colors have stock levels below 3 days of average line consumption?"`
3. **Container Load Reconciliation**: `"Cross-check loaded carton count for Container MSCU-4820 against buyer packing list."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Raw Fabric Rolls Inventory
CREATE TABLE store_fabric_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_barcode VARCHAR(50) NOT NULL UNIQUE,
  supplier_name VARCHAR(100) NOT NULL,
  fabric_type VARCHAR(100) NOT NULL,
  color_shade VARCHAR(50) NOT NULL,
  shade_group VARCHAR(10) NOT NULL, -- SHADE_A, SHADE_B, SHADE_C
  gross_weight_kg NUMERIC(6,2) NOT NULL,
  net_meterage NUMERIC(6,2) NOT NULL,
  measured_gsm INTEGER NOT NULL,
  four_point_penalty_score NUMERIC(4,1) DEFAULT 0.0,
  inspection_status VARCHAR(30) DEFAULT 'PENDING_INSPECTION', -- PENDING_INSPECTION, PASSED, REJECTED
  godown_rack_location VARCHAR(30) DEFAULT 'BAY_1_RACK_02',
  is_issued_to_cutting BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
