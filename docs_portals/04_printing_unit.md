# 04 • Screen & Digital Printing Unit Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/printing` | **Division Order**: 04 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Screen & Digital Printing Unit** executes garment surface embellishment. It manages physical screen preparation (exposure, mesh counts 120–305), ink chemistry (plastisol, water-based, discharge, puff), Direct-to-Garment (DTG) digital queues, strike-off color approvals, and thermal curing ovens. Flawless temperature regulation (160°C for 2.5 minutes) ensures 4.5+ wash fastness without cracking or bleeding.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    04. SCREEN & DIGITAL PRINTING UNIT                       │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ AATCC 61 (Colorfastness) / ISO 105-X12     │
│ Upstream Inward Entity:        │ 03. Cutting Floor (Cut Panels) + 01. Design│
│ Downstream Outward Entity:     │ 06. Stitching & Sewing (or 05. Embroidery) │
│ Curing Temperature SLA:        │ 160°C ± 3°C (Verified with heat probe strips)│
│ Strike-Off Color Match Delta:  │ Delta E ≤ 1.0 against Pantone TCX Standard │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 03. CUTTING FLOOR ]                     [ 01. DESIGN STUDIO ]
• Numbered Bundles of Cut Panels          • High-Res Vector Artwork (AI/PDF)
• Placement Registration Notches          • Pantone TCX Color Codes & Scale Specs
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 04. SCREEN & DIGITAL PRINTING UNIT                                          │
│ • Ink Kitchen Formulation (Pigment, Binder, Catalyst, Viscosity Test)      │
│ • Strike-Off Panel Run & Color Spectrophotometer Delta E Approval           │
│ • Table Screen Printing (60m Tables) or High-Speed Kornit DTG Run           │
│ • Continuous Tunnel Curing Oven (160°C) & Stretch-Wash Fastness Test        │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Handshake Payload)
[ 06. STITCHING & SEWING FLOOR ] (or 05. Embroidery if multi-technique)
• 100% Inspected & Cured Printed Panels
• Scanned Bundle Barcode Verification (Zero panel mix-up)
• Handover Challan to Lineman Dispatch
```

### Inward Handshake (What Printing Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Cut Panel Bundles** | `03. Cutting Floor` | Barcode (`BDL-XXXX`) | Every panel must have bundle tag intact |
| **Artwork Vector File** | `01. Design Studio` | Vector SVG / AI | 1:1 Scale with registration targets |
| **Pantone Color Reference**| Buyer / Design | E.g. `Pantone 19-4052 TCX` | Standard textile color system |
| **Print Technique** | Buyer Tech-Pack | `Plastisol`, `Discharge`, `DTG` | Defines ink recipe & screen mesh |

### Outward Handshake (What Printing Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Cured Printed Panels** | `06. Stitching & Sewing` | Curing & QC Pass | Intact bundle integrity, print pass badge, zero print smudge |
| **Dual Embellishment Panels**| `05. Embroidery Unit` | Dual Tech Flag | Position-matched panels needing chest embroidery over print |
| **Print Rejection / Defect Log**| `10. Alteration / Store` | Panel QC Failure | Exact piece count rejected for re-cut from end-bits |

---

## 3. Total Side Navigation Architecture

The Printing Unit portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Printing Unit Operations ]
  ├── 01. Print Floor Dashboard       -> /printing
  ├── 02. Screen & Stencil Library    -> /printing/screens
  ├── 03. Table Batch Queue & DTG     -> /printing/table-runs
  ├── 04. Strike-Off Lab Approvals    -> /printing/strike-offs
  ├── 05. Ink Kitchen & Recipes       -> /printing/ink-kitchen
  ├── 06. Curing Oven & Fastness QC   -> /printing/curing-qc
  ├── 07. Zigza AI Copilot            -> /printing/zigza-ai
  └── 08. Printing Unit Profile       -> /printing/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Print Floor Dashboard (`/printing`)
* **Purpose**: Overview of running printing tables, digital machine cycles, and curing oven temperature.
* **4 Metric KPI Cards**:
  1. `Active Print Tables`: **8 Tables** *(60m continuous conveyor tables)*
  2. `DTG Digital Units`: **4 Machines** *(High-res 1200 DPI industrial heads)*
  3. `Strike-Off Approvals`: **100% OK** *(Zero color shade rejection today)*
  4. `Tunnel Oven Curing Temp`: **160°C Verified** *(Thermal strip probe audit)*

### Page 2: Screen & Stencil Library (`/printing/screens`)
* **Purpose**: Catalog of photo-emulsion screens, mesh counts (e.g. 150 for glitter, 230 for high-detail halftones), and physical rack bin storage.

### Page 3: Ink Kitchen & Recipe Formulations (`/printing/ink-kitchen`)
* **Purpose**: Exact grams chemical ledger per print batch.
* **Recipe Formulation Ledger**:
  * Base Binder: 850 g
  * Pigment Concentrate: 120 g
  * Fixer / Cross-Linker: 30 g
  * Viscosity: 18,000 cps (Centipoise)

---

## 5. Complete Form Specifications

### Form 1: Strike-Off Color Approval Form
* **Trigger**: `Submit Strike-Off Test` on `/printing/strike-offs`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `order_id` | Select Dropdown | Yes | Active buyer purchase orders | Link to commercial order |
| `pantone_target` | Text | Yes | E.g. `Pantone 18-1662 TCX` | Target color swatch |
| `spectro_delta_e` | Number | Yes | Min: 0.00, Max: 5.00 (Decimal 2) | Must be ≤ 1.0 to pass |
| `curing_temp_c` | Number | Yes | Default: 160 (Min: 140, Max: 180)| Oven heat setting |
| `stretch_test_pass`| Boolean | Yes | Checkbox | No ink cracking on 100% stretch |
| `approval_status` | Select Dropdown | Yes | `APPROVED`, `REVISE_RECIPE`, `REJECTED` | Master approval state |

---

## 6. Zigza AI Domain Intelligence for Printing

1. **Viscosity & Weather Compensation**: `"Humidity is 84% today. Should we reduce water-based retarder in the black pigment recipe?"`
2. **Curing Audit Check**: `"Alert me if Tunnel Oven #2 temperature drops below 157°C during French Terry fleece curing."`
3. **Screen Reclamation Alert**: `"Which screens from completed Zara PO-8901 are ready for chemical stripping and reuse?"`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Printing Production Lots
CREATE TABLE printing_production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id),
  table_number VARCHAR(20) NOT NULL,
  technique VARCHAR(40) NOT NULL, -- PLASTISOL, WATER_BASED, DISCHARGE, DTG, PUFF
  pantone_codes TEXT[] NOT NULL,
  total_panels_issued INTEGER NOT NULL,
  total_panels_passed INTEGER NOT NULL,
  panels_rejected INTEGER DEFAULT 0,
  curing_temp_c INTEGER DEFAULT 160,
  status VARCHAR(30) DEFAULT 'PRINTING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
