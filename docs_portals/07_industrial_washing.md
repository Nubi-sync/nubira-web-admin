# 07 • Industrial Washing & Wet Processing Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/washing` | **Division Order**: 07 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Industrial Washing & Wet Processing Division** is responsible for garment hand-feel, dimensional stabilization, and specialized aesthetic surface treatments. Operating commercial garment wash tumblers (600 kg batch capacity) and high-G hydro extractors, the division executes bio-polishing, enzyme washes, silicon softening, vintage stone washes, and desizing cycles. Strict water-to-goods liquor ratio management (1:5.0 standard) and thermal drying curves ensure **zero post-wash dimensional shrinkage** (< 1.5% tolerance) and superior colorfastness.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 07. INDUSTRIAL WASHING & WET PROCESSING                     │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ AATCC 135 (Dimensional Change) / ISO 6330  │
│ Upstream Inward Entity:        │ 06. Stitching & Sewing Floor               │
│ Downstream Outward Entity:     │ 08. Steam Ironing & Finishing Floor        │
│ Standard Liquor Ratio (M:L):   │ 1 : 5.0 (1 kg dry garment : 5 Liters water)│
│ Maximum Residual Shrinkage:    │ ≤ 1.5% Length × ≤ 1.5% Width (Strict Spec) │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 06. STITCHING & SEWING FLOOR ]
• 100% Stitched Garments in Numbered Lot Bags
• Sewing Challan Manifest (Article, Color, Size Breakdown)
• Expected Raw Piece Weight vs Target Washed Weight
            │
            ▼ (Inward Lot Handshake)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 07. INDUSTRIAL WASHING & WET PROCESSING                                     │
│ • Weigh Dry Garment Batch & Calculate Chemical Dosing (Enzyme, Silicon)     │
│ • Automated Cycle Execution: Desize -> Bio-Polish -> Soften -> Rinse        │
│ • High-G Centrifugal Hydro-Extraction (Moisture Reduction to 45%)           │
│ • Steam Tumbler Drying (65°C Controlled Heat Curve) & Relaxation Cool-Down  │
│ • Dimensional Shrinkage Template Audit (10 Samples per Batch)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Handshake Payload)
[ 08. STEAM IRONING & FINISHING FLOOR ]
• Conditioned, Dried & Softened Garments
• Verified Batch Piece Count Match
• Shrinkage Pass Certificate Attached to Lot Slip
```

### Inward Handshake (What Washing Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Sewing Delivery Challan** | `06. Stitching & Sewing`| Challan No (`JOB-XXXX`)| Must be QC passed from sewing lines |
| **Garment Total Pieces** | `06. Stitching & Sewing`| Integer (e.g. `1,200 pcs`)| Must match physical bag count |
| **Buyer Wash Recipe Spec** | `01. Design Studio` | Recipe Code (`WASH-BIO-04`)| Approved chemical cycle & temperature |
| **Target Hand-Feel Standard**| Buyer Tech-Pack | E.g. `Peach Finish / Ultra-Soft`| Certified reference swatch sample |

### Outward Handshake (What Washing Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Washed & Dried Garments** | `08. Steam Ironing` | Tumbler Unload & QC | Zero dampness, zero chemical odor, verified piece count |
| **Shrinkage & Shade Report**| `02. Merchandising` | Lab Dimension Check | Length/width change %, shade continuity band (Delta E < 0.8) |
| **Wash Defect Quarantine** | `10. Alteration / Clinic`| Color Bleed / Tear | Damaged pieces flagged for mending or replacement claim |

---

## 3. Total Side Navigation Architecture

The Washing Division portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Industrial Washing Operations ]
  ├── 01. Washing Dashboard           -> /washing
  ├── 02. Wash Recipes & Chemistry    -> /washing/recipes
  ├── 03. Tumbler & Hydro Runs        -> /washing/machine-runs
  ├── 04. Liquor Ratio & Water Audit  -> /washing/liquor-audit
  ├── 05. Shrinkage & Fastness QC     -> /washing/shrinkage-qc
  ├── 06. Outward Finishing Handover  -> /washing/handover
  ├── 07. Zigza AI Copilot            -> /washing/zigza-ai
  └── 08. Washing Division Profile    -> /washing/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Washing Dashboard (`/washing`)
* **Purpose**: Real-time monitoring of commercial wash tumblers, hydro extractors, and batch chemical cycles.
* **4 Metric KPI Cards**:
  1. `Active Wash Tumblers`: **6 / 6 Running** *(600 kg industrial machines at capacity)*
  2. `Daily Wash Volume`: **3,200 Pcs** *(Today cumulative wet load)*
  3. `Standard Liquor Ratio`: **1 : 5.2** *(Eco-friendly water conservation target met)*
  4. `Residual Shrinkage Rate`: **< 1.2%** *(Strictly within < 1.5% buyer tolerance)*
* **Active Tumbler Machine Matrix**:
  * Visual cards showing `Washer 01` (Bio-Enzyme Wash 55°C - 32 min remaining), `Washer 02` (Silicon Softening), `Hydro 01` (Spinning 900 RPM), `Dryer 01` (Tumbler 65°C).

### Page 2: Wash Recipes & Chemistry (`/washing/recipes`)
* **Purpose**: Chemical formulations library specifying enzyme grams, pH levels, and cycle duration.
* **Standard Silicon Enzyme Softening Formulation**:
  * Neutral Cellulase Enzyme: 1.5 g/L (Bio-polishing surface fuzz)
  * Acetic Acid Buffer: 0.8 g/L (Maintaining pH 5.2–5.5)
  * Micro-Silicon Softener: 2.0 g/L (Silk-touch hand-feel)
  * Cycle Duration: 45 min at 50°C

### Page 3: Shrinkage & Colorfastness QC (`/washing/shrinkage-qc`)
* **Purpose**: 10-piece statistical dimensional audit per batch.
* **Shrinkage Formula**:
  $$\text{Shrinkage \%} = \frac{\text{Pre-Wash Dimension (cm)} - \text{Post-Wash Dimension (cm)}}{\text{Pre-Wash Dimension (cm)}} \times 100$$

---

## 5. Complete Form Specifications

### Form 1: Wash Batch Run Logging Form
* **Trigger**: `Load New Wash Batch` on `/washing/machine-runs`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `batch_number` | Text | Yes | Pattern: `^WB-[0-9]{5}$` | Unique washing batch run ID |
| `washer_machine_id`| Select Dropdown | Yes | `Washer 01` to `Washer 06` | Physical commercial tumbler |
| `sewing_challan_id`| Select Dropdown | Yes | Active sewing challans | Inward lot reference |
| `dry_weight_kg` | Number | Yes | Min: 50, Max: 650 kg | Total dry weight loaded |
| `recipe_id` | Select Dropdown | Yes | Approved wash recipes | Chemical recipe applied |
| `water_volume_liters`| Number | Yes | Auto-calculated `dry_weight × 5` | Total water consumed |
| `tumbler_temp_c` | Number | Yes | Default: 65 (Min: 40, Max: 85) | Drying temperature setting |

---

## 6. Zigza AI Domain Intelligence for Washing

1. **Enzyme Activity Audit**: `"Garment batch #402 has heavy fuzz. Should we adjust cellulase enzyme run time from 35 min to 45 min?"`
2. **Liquor Ratio Optimization**: `"Calculate water savings if we drop liquor ratio on 2,500 cotton hoodies from 1:6 to 1:5."`
3. **Shrinkage Compensation Alert**: `"Style ART-9920 showed 2.1% width shrinkage. Alert Cutting Floor to expand marker width by 1.2 cm."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Washing Batches Master
CREATE TABLE washing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  challan_id UUID REFERENCES challans(id),
  machine_number VARCHAR(20) NOT NULL,
  recipe_name VARCHAR(100) NOT NULL,
  dry_weight_kg NUMERIC(6,2) NOT NULL,
  water_liters NUMERIC(8,2) NOT NULL,
  measured_shrinkage_length_pct NUMERIC(4,2),
  measured_shrinkage_width_pct NUMERIC(4,2),
  status VARCHAR(30) DEFAULT 'WASHING', -- WASHING, HYDRO, DRYING, PASSED, FAILED
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
