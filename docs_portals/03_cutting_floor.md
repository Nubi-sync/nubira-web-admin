# 03 • Cutting & Lay Floor Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/cutting` | **Division Order**: 03 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Cutting & Lay Floor** is the physical conversion point where raw fabric rolls are transformed into precisely cut garment components. Cutting efficiency directly dictates factory profitability: fabric accounts for **60% to 70% of total garment cost**. The Cutting Floor enforces strict marker efficiency (target > 86%), computerized auto-cutting, shade grouping, and 100% QR barcode bundle tracking to feed the **Zero Ghost Piece Guarantee** backed by strict database quantity integrity constraints.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         03. CUTTING & LAY FLOOR                             │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D3887 (Knit) / ISO 13934 (Tensile)   │
│ Upstream Inward Entity:        │ 01. Design (CAD) + 11. Store (Fabric)     │
│ Downstream Outward Entity:     │ 04. Print / 05. Embroider / 06. Sewing    │
│ Target Marker Efficiency:      │ ≥ 86.5% (High Yield Marker Target)        │
│ End-Bit Scrap Allowance:       │ ≤ 1.8% of Total Issued Fabric Meterage    │
│ Bundle Traceability Standard:  │ Direct FK + Quantity Integrity Check Trigger│
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 11. CENTRAL STORE ]                     [ 01. DESIGN & 02. MERCH ]
• Fabric Roll Meterage & Weight           • Graded CAD Marker (DXF/AAMA)
• Dye Lot & Shade Banding (Shade A/B/C)   • Order Ratio & Target Cut Qty
• 4-Point Inspection Passed Rolls Only    • Embellishment Sequence Directive
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 03. CUTTING & LAY FLOOR                                                     │
│ • Fabric Roll Relaxation (24h for Lycra / Single Jersey knits)              │
│ • Table Spreading & Ply Counting (e.g. 80 Plies per Lay)                    │
│ • Computerized Gerber / Lectra Auto-Cutting or Band Knife Precision Cut     │
│ • Numbering, Fusing, Bundle Sorting & QR Barcode Ticket Printing            │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Handshake Payload A)                 ▼ (Handshake Payload B)
[ 04. PRINTING / 05. EMBROIDERY ]       [ 06. STITCHING & SEWING FLOOR ]
• Cut Front/Back Panels for Embellish   • Fully Numbered Bundle Packs
• Sequence: Embroidery-First vs Print   • Direct FK Link: cutting_bundles.id
• Registration Notches & Placement Mark • Quantity Integrity Trigger Bound
```

### Inward Handshake (What Cutting Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Fabric Roll Challan** | `11. Central Store` | Delivery Challan No | Must be 4-Point inspected and GRN verified |
| **Roll Shade Grouping** | Fabric Mill / Lab | `Shade A`, `Shade B`, `Shade C` | Plies must NEVER mix different shade bands |
| **Approved DXF Marker** | `01. Design Studio` | Gerber / Lectra DXF | Checked against shrinkage test values |
| **Order Ratio Matrix** | `02. Merchandising` | Ratio String (e.g. `1:2:2:1`) | Sizes `S-M-L-XL` distribution |

### Outward Handshake (What Cutting Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **QR Tagged Bundle Lots** | `06. Stitching & Sewing` | Bundle Audit Passed | Bundle ID (`cutting_bundles.id`), Style, Color, Size, Ply Range (`1–50`), Piece Count |
| **Panel Embellishment Lots**| `04. Print / 05. Embroider`| Embellish Required | Raw cut panels, registration notches, placement template reference |
| **Fabric Scrap & End-Bit Log**| `11. Central Store` | Lay Completion | Actual meterage consumed, remnant roll weight, wastage % |

---

## 3. Total Side Navigation Architecture

The Cutting Floor portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Cutting Floor Operations ]
  ├── 01. Floor Dashboard             -> /cutting
  ├── 02. Spreading & Lay Sheets      -> /cutting/lay-sheets
  ├── 03. Marker Efficiency Planner   -> /cutting/marker-planning
  ├── 04. Bundle QR Ticket Station    -> /cutting/bundle-generation
  ├── 05. Fabric Rolls & End-Bit Log  -> /cutting/fabric-rolls
  ├── 06. Cut Panel QC Audit Station  -> /cutting/panel-qc
  ├── 07. Zigza AI Copilot            -> /cutting/zigza-ai
  └── 08. Cutting Floor Profile       -> /cutting/profile
```

---

## 4. Complete Page Specifications (All 8 Navigation Views)

### Page 1: Floor Dashboard (`/cutting`)
* **Purpose**: Real-time throughput control of spreading tables, auto-cutters, and bundle delivery to sewing.
* **4 Metric KPI Cards**:
  1. `Daily Cut Volume`: **8,240 Pcs** *(4 Active Spreading Tables Running)*
  2. `Marker Efficiency`: **88.4%** *(Target: > 86.0% • Fabric Savings: +2.4%)*
  3. `Bundles Issued Today`: **328 Bundles** *(100% QR Barcode Tagged)*
  4. `Fabric Meterage Consumed`: **4,120 m** *(End-bit scrap: 1.4% • Well below 1.8% SLA)*
* **Active Spreading Table Status Matrix**:
  * Visual cards representing `Table 01` (Spreading 80 Plies), `Table 02` (Auto-Cutting Line A), `Table 03` (QR Bundling), `Table 04` (Fabric Relaxation).

### Page 2: Spreading & Lay Sheets (`/cutting/lay-sheets`)
* **Purpose**: Digital lay sheet recording fabric roll numbers, plies, lay length, and operator assignments.
* **Primary Columns**: `Lay Sheet #`, `Cut Lot #`, `Table #`, `Fabric Roll IDs`, `Total Plies`, `Planned Pcs`, `Actual Pcs Cut`, `Spreading Operator (FK)`, `Actions`.

### Page 3: Marker Efficiency Planner (`/cutting/marker-planning`)
* **Purpose**: Marker optimization module calculating fabric utilization per ratio combination.
* **Calculation Engine**:
  $$\text{Marker Efficiency \%} = \frac{\text{Pattern Net Area (sq m)}}{\text{Marker Length (m)} \times \text{Fabric Usable Width (m)}} \times 100$$
* **Width Variance Handler**: Segregates markers for 58-inch vs 60-inch fabric rolls.

### Page 4: Bundle QR Ticket Station (`/cutting/bundle-generation`)
* **Purpose**: High-speed thermal label generation. Generates unique QR ticket for every bundle of 20–50 cut pieces.
* **QR Ticket Payload Standard**:
  ```json
  {
    "bundle_id": "BDL-8821-042",
    "bundle_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "style": "HOODIE-FRENCH-TERRY",
    "color": "JET_BLACK",
    "size": "L",
    "ply_range": "41-80",
    "piece_count": 40,
    "shade_group": "SHADE_A",
    "cutting_lot": "LOT-2026-03"
  }
  ```

### Page 5: Fabric Rolls & End-Bit Log (`/cutting/fabric-rolls`)
* **Purpose**: Roll-by-roll ledger tracking issued meters vs laid meters, leftover end-bits, and scrap percentages.
* **Columns**: `Roll Barcode`, `Fabric Type`, `Gross Weight`, `Total Meters`, `Laid Meters`, `End-Bit Remnant (m)`, `Scrap %`, `Status`.

### Page 6: Cut Panel QC Audit Station (`/cutting/panel-qc`)
* **Purpose**: Inspection of top, middle, and bottom plies from every cut stack against plastic template patterns.
* **Tolerances**: Notch depth $\pm 1$ mm, perimeter cut accuracy $\pm 1.5$ mm, ply-to-ply fraying score.

### Page 7: Zigza AI Copilot (`/cutting/zigza-ai`)
* **Purpose**: Spreading optimization, roll combination planning, and marker waste minimization assistant.
* **Pre-Loaded Prompts**:
  1. `"We have 18 meters left on Roll #402. Can we fit an additional mini-marker for 12 pieces of size S to avoid scrap?"`
  2. `"Check Lay Sheet #204 for mixed shades across Roll 102 and Roll 108."`
  3. `"How many cut bundles of Size L are ready for Lineman Line 4 today?"`

### Page 8: Cutting Floor Profile (`/cutting/profile`)
* **Purpose**: Master cutting master credentials, table allocations, and machine maintenance records.

---

## 5. Complete Form Specifications

### Form 1: New Lay Sheet Creation Form
* **Trigger**: `Create Lay Sheet` on `/cutting/lay-sheets`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `lay_sheet_number`| Text | Yes | Pattern: `^LAY-[0-9]{4,8}$` | Unique lay identifier |
| `cutting_table_id`| Select Dropdown | Yes | `Table 01`, `Table 02`, `Table 03`, `Table 04` | Physical spreading table |
| `po_id` | Select Dropdown | Yes | Active buyer purchase orders | Link to commercial order |
| `operator_id` | Select Dropdown | Yes | Active cutting floor employees (FK)| Spreading master responsible |
| `fabric_roll_ids` | Multi-Select | Yes | Filtered by same Shade Group | Scanned fabric rolls to be laid |
| `marker_length_m` | Number | Yes | Min: 2.0, Max: 50.0 (Decimal 2 places) | Physical length of marker paper |
| `total_plies` | Number | Yes | Min: 10, Max: 150 plies | Number of fabric layers stacked |
| `size_ratio_text` | Text | Yes | E.g. `S:1, M:2, L:2, XL:1` | Marker ratio breakdown |
| `expected_pieces` | Number (Auto) | Yes | Readonly auto-calculated | `Total Plies × Ratio Total` |

### Form 2: Cut Panel QC Audit Form
* **Trigger**: `Conduct Panel Audit` on `/cutting/panel-qc`
* **Purpose**: **Directly writes to `cutting_panel_qc_audits`**.

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `bundle_id` | Select Dropdown | Yes | Active cut bundles | Target bundle |
| `lay_sheet_id` | Select Dropdown | Yes | Active lay sheets | Originating lay |
| `inspector_id` | Select Dropdown | Yes | Active employees master (FK) | Inspector conducting audit |
| `notch_accuracy_mm`| Number | Yes | Tolerance $\pm 1.0$ mm | Notch position |
| `ply_deflection_mm`| Number | Yes | Tolerance $\pm 1.5$ mm | Top vs bottom ply shift |
| `shade_continuity_pass`| Boolean | Yes | Checkbox | No shade variance across stack |
| `template_match_pass` | Boolean | Yes | Checkbox | Silhouette matches master pattern |
| `qc_verdict` | Select Dropdown | Yes | `PASS`, `RE_CUT_PANELS`, `REJECT` | QA status |

### Form 3: End-Bit Remnant & Roll Closing Form
* **Trigger**: `Close Fabric Roll` on `/cutting/fabric-rolls`
* **Purpose**: **Directly writes to `cutting_end_bit_logs`**.

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `lay_sheet_id` | Select Dropdown | Yes | Active lay sheets | Associated lay |
| `roll_id` | Select Dropdown | Yes | Issued fabric rolls | Physical roll |
| `actual_laid_meters`| Number | Yes | Decimal 2 places | Meterage consumed in lay |
| `remnant_end_bit_meters`| Number | Yes | Decimal 2 places | Leftover remnant fabric |
| `scrap_reason` | Select Dropdown | Yes | `END_OF_ROLL_REMNANT`, `FABRIC_DEFECT_CUTOUT`, `WIDTH_NARROW` | Reason |
| `returned_to_store`| Boolean | Yes | Checkbox | Remnant physically moved back to store |
| `logged_by_id` | Select Dropdown | Yes | Active employees (FK) | Cutting supervisor |

---

## 6. Zigza AI Domain Intelligence for Cutting Floor

1. **End-Bit Optimization Query**: `"We have 18 meters left on Roll #402. Can we fit an additional mini-marker for 12 pieces of size S to avoid scrap?"`
2. **Shade Banding Audit**: `"Check Lay Sheet #204 for mixed shades across Roll 102 and Roll 108."`
3. **Sewing Line Feeding Velocity**: `"How many cut bundles of Size L are ready for Lineman Line 4 today?"`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

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
  status VARCHAR(30) DEFAULT 'SPREADING', -- SPREADING, CUTTING, BUNDLING, DISPATCHED
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
  current_location VARCHAR(50) DEFAULT 'CUTTING_EXIT', -- CUTTING_EXIT, PRINTING, EMBROIDERY, SEWING_FLOOR
  is_allotted_to_sewing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cut Panel QC Audit Logs (Populated by Form 2)
CREATE TABLE cutting_panel_qc_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES cutting_bundles(id) ON DELETE CASCADE,
  lay_sheet_id UUID REFERENCES cutting_lay_sheets(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  notch_accuracy_mm NUMERIC(3,1) NOT NULL,
  ply_deflection_mm NUMERIC(3,1) NOT NULL,
  shade_continuity_pass BOOLEAN DEFAULT TRUE,
  template_match_pass BOOLEAN DEFAULT TRUE,
  qc_verdict VARCHAR(30) DEFAULT 'PASS', -- PASS, RE_CUT_PANELS, REJECT
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fabric Roll End-Bit Remnant Logs (Populated by Form 3)
CREATE TABLE cutting_end_bit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lay_sheet_id UUID REFERENCES cutting_lay_sheets(id) ON DELETE CASCADE,
  roll_id UUID REFERENCES store_fabric_rolls(id) ON DELETE RESTRICTED,
  actual_laid_meters NUMERIC(6,2) NOT NULL,
  remnant_end_bit_meters NUMERIC(6,2) NOT NULL,
  scrap_reason VARCHAR(50) NOT NULL,
  returned_to_store BOOLEAN DEFAULT TRUE,
  logged_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quantity Integrity Enforcement (Zero Ghost Piece Constraint)
-- The runtime trigger `trg_validate_bundle_allotment_sum` is defined and attached 
-- to the `allotments` table in `06_stitching_sewing.md` (§7), validating that 
-- SUM(allotments.allotted_quantity) <= cutting_bundles.piece_count.
```
