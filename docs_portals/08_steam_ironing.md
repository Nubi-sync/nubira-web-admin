# 08 • Ironing & Steam Pressing Floor Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/iron` | **Division Order**: 08 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Ironing & Steam Pressing Floor** gives garments their crisp, commercial presentation. Utilizing centralized boiler steam (4.5 Bar operating pressure) and vacuum suction buck tables, operators shape seams, eliminate wrinkles, and press collars/cuffs. Strict temperature regulation (Teflon shoe covers) prevents fabric glaze, shine marks, and fiber scorching—especially critical for dark polyester blends and fine cotton knits.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    08. IRONING & STEAM PRESSING FLOOR                       │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ISO 105-X11 (Pressing Heat Fastness)       │
│ Upstream Inward Entity:        │ 07. Washing (or 06. Sewing for raw goods)  │
│ Downstream Outward Entity:     │ 09. Ready Goods & Packing Floor            │
│ Boiler Steam Pressure Target:  │ 4.2 Bar – 4.8 Bar (Continuous Steam Flow)  │
│ Zero Glaze / Shine Defect SLA: │ 100% Defect-Free (Strict visual inspection)│
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 07. WASHING ] (or 06. SEWING for non-wash styles)
• Dried, Softened Garment Batches
• Inward Challan Slip with Verified Piece Count
            │
            ▼ (Inward Handshake)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 08. IRONING & STEAM PRESSING FLOOR                                          │
│ • Boiler Steam Vacuum Pressing (Vacuum foot-pedal moisture extraction)      │
│ • Teflon Shoe Contact (140°C - 160°C temperature controlled)                │
│ • Inline Seam Flattening & Symmetry Check (Placket, Collar, Side Seams)     │
│ • Operator Piece-Rate Ticket Scanning & Daily Finishing Wage Ledger         │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Clean Pass Payload)                  ▼ (Defect Rework Payload)
[ 09. READY GOODS & PACKING ]           [ 10. ALTERATION & REWORK ]
• 100% Pressed, Wrinkle-Free Garments   • Fabric Shine / Glaze / Water Spots
• Verified Size-Color Ratio Bunches     • Heat Stain or Unstitched Seam found
• Handover Manifest to Tagging & Poly   • Re-cleaning / Panel replacement loop
```

### Inward Handshake (What Ironing Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Inward Challan No** | `07. Wash` / `06. Sew` | String (`CHL-XXXX`) | Verified physical piece count |
| **Garment Fabric Type** | Tech-Pack | `Cotton`, `Fleece`, `Poly` | Dictates iron shoe temperature setting |
| **Crease / Pleat Spec** | Buyer Design Spec | `Flat Front`, `Center Crease`| Strict styling compliance |

### Outward Handshake (What Ironing Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Pressed Garment Bundles** | `09. Ready Goods` | Inspection Passed | Complete absence of wrinkles, zero wet steam marks |
| **Finishing Wage Ledger** | Payroll Accounts | Operator Scan | Exact pieces pressed per operator for wage disbursement |
| **Thermal Defect Quarantine**| `10. Alteration` | Scorched / Glazed | Quarantined pieces tagged with operator ID |

---

## 3. Total Side Navigation Architecture

The Ironing Floor portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Ironing Floor Operations ]
  ├── 01. Ironing Dashboard           -> /iron
  ├── 02. Steam Vacuum Buck Tables    -> /iron/tables
  ├── 03. Operator Piece-Rate Wages   -> /iron/wages
  ├── 04. Boiler Telemetry & Steam Log-> /iron/boiler-telemetry
  ├── 05. Inline Finish & Glaze QC    -> /iron/finish-qc
  ├── 06. Outward Packing Handover    -> /iron/handover
  ├── 07. Zigza AI Copilot            -> /iron/zigza-ai
  └── 08. Ironing Floor Profile       -> /iron/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Ironing Dashboard (`/iron`)
* **Purpose**: Real-time throughput control of steam tables, operator velocity, and boiler pressure.
* **4 Metric KPI Cards**:
  1. `Daily Pressed Pieces`: **6,180 Pcs** *(Shift Target: 7,500 Pcs • 82.4% Complete)*
  2. `Central Steam Pressure`: **4.5 Bar** *(Optimal Operating Range: 4.2–4.8 Bar)*
  3. `Active Vacuum Tables`: **12 Tables** *(12 Station Vacuum Buck System active)*
  4. `Finishing First Pass Rate`: **99.1%** *(Zero shine or glaze rejects today)*

### Page 2: Operator Piece-Rate Wage Ledgers (`/iron/wages`)
* **Purpose**: Daily calculation of pressing wages.
* **Finishing Wage Calculation**:
  $$\text{Operator Earnings} = \text{Passed Pressed Pieces} \times \text{Pressing Piece Rate (e.g. ₹2.20/pc)}$$

---

## 5. Complete Form Specifications

### Form 1: Ironing Shift Operator Allotment Form
* **Trigger**: `Allot Ironing Table` on `/iron/tables`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `table_number` | Select Dropdown | Yes | `Table 01` to `Table 12` | Vacuum pressing station |
| `operator_name` | Text | Yes | Min 3 chars | Assigned pressing operator |
| `challan_id` | Select Dropdown | Yes | Active un-pressed challans | Inward lot to press |
| `target_hourly_pcs`| Number | Yes | Default: 60 (Min: 30, Max: 100) | Hourly production target |
| `piece_rate` | Number | Yes | Default: 2.20 (Decimal 2 places)| Wage rate per piece |

---

## 6. Zigza AI Domain Intelligence for Ironing

1. **Glaze Prevention Advice**: `"We are running 100% black polyester windbreakers on Table 4. What is the maximum iron base temperature to avoid fabric shine?"`
2. **Boiler Efficiency Audit**: `"Boiler pressure dropped to 3.8 Bar at 2:30 PM. Check condensate trap drainage."`
3. **Daily Output Forecast**: `"At current line pace of 680 pcs/hour, will we complete H&M PO-9011 before 6:00 PM cutoff?"`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Ironing Station Production Logs
CREATE TABLE iron_production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(20) NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  challan_id UUID REFERENCES challans(id),
  pieces_pressed INTEGER NOT NULL DEFAULT 0,
  defect_shine_count INTEGER DEFAULT 0,
  piece_rate NUMERIC(6,2) DEFAULT 2.20,
  total_earned_wages NUMERIC(10,2) GENERATED ALWAYS AS (pieces_pressed * piece_rate) STORED,
  shift_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
