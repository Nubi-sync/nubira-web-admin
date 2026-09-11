# 01 • Design & Tech-Pack Studio Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/design` | **Division Order**: 01 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Design & Tech-Pack Studio** is the digital inception point of the garment manufacturing lifecycle. It bridges creative fashion concepts and industrial mass manufacturing by standardizing CAD sketches, Bill of Materials (BOM), measurement tolerances, and size grading matrices.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       01. DESIGN & TECH-PACK STUDIO                         │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D6961 / ISO 8559 Garment Sizing       │
│ Upstream Inward Entity:        │ Buyer Brand / Fashion House Concept        │
│ Downstream Outward Entity:     │ 02. Merchandising (Costing/PO) & 03. Cut   │
│ Target Sample Approval Cycle:  │ ≤ 3.5 Days (Target: 95% First-Time-Right)  │
│ Measurement Tolerance Limits:  │ ± 0.5 cm (Chest/Length) | ± 0.25 cm (Neck) │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ BUYER / BRAND CREATIVE ]
            │
            ▼ (Inward Payload: CAD Spec, Moodboard, Colorways)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 01. DESIGN & TECH-PACK STUDIO                                               │
│ • Digitize Tech-Pack (Measurements, Specs, Seam Types)                      │
│ • Generate Size Grading (XS, S, M, L, XL, 2XL)                              │
│ • Physical Sample Fit Approval (Proto -> Size Set -> Pre-Production Sample)  │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Handshake Payload A)                 ▼ (Handshake Payload B)
[ 02. MERCHANDISING & SOURCING ]        [ 03. CUTTING & LAY FLOOR ]
• Approved BOM Fabric Specs              • Approved Marker Specs
• Trims & Thread Consumption Matrix     • Grade Rule Files (DXF/AAMA)
• Target Garment Cost Benchmarks        • Approved Shrinkage Allowances
```

### Inward Handshake (What Design Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Buyer Brand ID** | Buyer / Brand | UUID (`brands.id`) | Must match active registered Brand |
| **Season / Style Ref** | Buyer Tech-Pack | String (e.g. `SS27-HOODIE-01`) | Unique per season |
| **CAD Sketch / Vector** | Design Agency | Vector PDF / SVG / AI | High-res 300 DPI vector |
| **Base Measurement Sheet** | Buyer Spec | JSON / Excel Table | Must define base size (usually `M`) |
| **Fabric Spec Requirement** | Buyer Fabric Team | GSM, Yarn Count, Blend | Standard ASTM nomenclature |

### Outward Handshake (What Design Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **BOM Spec & Fabric Consumption** | `02. Merchandising` | Status $\rightarrow$ `PPS_APPROVED` | Fabric GSM, shrinkage %, thread consumption/garment, trim counts |
| **Graded CAD & Pattern Cut Spec** | `03. Cutting Floor` | Status $\rightarrow$ `BULK_APPROVED` | DXF/AAMA pattern files, grade rule matrix, notch specs, lay allowances |
| **Standard Seam & SPI Spec** | `06. Stitching & Sewing` | Job Challan Generation | Stitches Per Inch (SPI), seam classes (ISO 4915), thread count |

---

## 3. Total Side Navigation Architecture

The Design Studio portal has **7 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Design Studio Operations ]
  ├── 01. Studio Dashboard            -> /design
  ├── 02. Tech-Pack Catalog           -> /design/tech-packs
  ├── 03. Sample Approvals (PPS)      -> /design/sample-approvals
  ├── 04. Size Grading Matrix         -> /design/grading-matrix
  ├── 05. Fabric & Trims Library      -> /design/materials-library
  ├── 06. Zigza AI Copilot            -> /design/zigza-ai
  └── 07. Studio Profile              -> /design/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Studio Dashboard (`/design`)
* **Purpose**: Real-time cockpit for creative direction, pending sample approvals, and tech-pack release velocity.
* **4 Metric KPI Cards**:
  1. `Active Tech-Packs`: **28 Specs** *(12 Approved for Bulk, 16 In-Progress)*
  2. `Sample Fit Approvals`: **8 Pending** *(Avg Approval Cycle: 3.2 Days)*
  3. `Grading Rule Matrix`: **6 Sizes Standard** *(XS, S, M, L, XL, XXL)*
  4. `Pre-Production Sample Readiness`: **96.4%** *(Target SLA: > 95.0%)*
* **Primary Interactive Table: Active Development Pipeline**
  * Columns: `Style Ref`, `Buyer / Brand`, `Garment Category`, `Base Size`, `PPS Status`, `Tech-Pack Version`, `Target Cut Date`, `Actions`.
  * Status Badges: `DRAFT` (Grey), `SAMPLE_DEV` (Amber), `PPS_SUBMITTED` (Sky), `APPROVED_BULK` (Emerald), `REVISE_FIT` (Rose).

### Page 2: Tech-Pack Catalog (`/design/tech-packs`)
* **Purpose**: Master repository of approved garment specifications and CAD sketches.
* **Key Visuals**:
  * Dual-tab view: `Gallery Grid` (Visual CAD Cards with front/back thumbnails) vs `Master Spec Table`.
  * Version History control: Allows comparing `v1.0` vs `v1.1` measurement diffs with color-coded highlights.

### Page 3: Sample Approvals & Fit Iterations (`/design/sample-approvals`)
* **Purpose**: Track physical prototype approvals through the 3-stage buyer gate:
  1. **Proto Sample** (Aesthetic & Silhouette fit).
  2. **Size Set Sample** (Measurement verification across all sizes).
  3. **Pre-Production Sample (PPS)** (Sealed golden piece for factory production).
* **Metrics Tracked**: Rejection reasons (Neck too tight, sleeve length long, hem puckering).

### Page 4: Size Grading Matrix (`/design/grading-matrix`)
* **Purpose**: Matrix showing grade increment per measurement point (POM - Point of Measure).
* **Matrix Structure**:
  | Point of Measure (POM) | Tolerance (±) | XS (cm) | S (cm) | M (Base) | L (cm) | XL (cm) | 2XL (cm) | Grade Step |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Half Chest Width** | 0.5 cm | 48.0 | 50.5 | **53.0** | 55.5 | 58.0 | 60.5 | +2.5 cm |
  | **Body Length from HPS** | 0.5 cm | 68.0 | 70.0 | **72.0** | 74.0 | 76.0 | 78.0 | +2.0 cm |
  | **Sleeve Length from CB**| 0.5 cm | 82.0 | 84.5 | **87.0** | 89.5 | 92.0 | 94.5 | +2.5 cm |
  | **Neck Opening Width** | 0.25 cm | 17.5 | 18.0 | **18.5** | 19.0 | 19.5 | 20.0 | +0.5 cm |

### Page 5: Fabric & Trims Library (`/design/materials-library`)
* **Purpose**: Technical library of validated fabrics, knit constructions, and certified trims.
* **Attributes**: Shrinkage %, spirality %, yarn counts, recommended sewing needle size (e.g. `Ball Point 75/11` for interlock).

---

## 5. Complete Form Specifications

### Form 1: New Tech-Pack Creation Form
* **Trigger**: `Create Tech-Pack` Button on `/design/tech-packs`
* **Modal / Drawer Layout**:

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `style_number` | Text | Yes | Pattern: `^[A-Z0-9-]{6,20}$` | Unique factory article code (e.g. `ART-8821`) |
| `brand_id` | Select Dropdown | Yes | Active registered brands | Buyer brand owning the design |
| `garment_category`| Select Dropdown | Yes | `Hoodie`, `T-Shirt`, `Polo`, `Jogger`, `Jacket` | Base product silhouette |
| `base_size` | Select Dropdown | Yes | Default: `M` (`XS`, `S`, `M`, `L`, `XL`, `2XL`) | Root pattern grading base |
| `fabric_type` | Text | Yes | Max 100 chars (e.g. `100% Cotton French Terry`) | Primary shell fabric description |
| `target_gsm` | Number | Yes | Min: 80, Max: 600 (e.g. `380`) | Fabric weight in grams per sq meter |
| `cad_front_url` | File Upload | Yes | PNG, JPG, PDF (Max 15MB) | Front technical vector sketch |
| `cad_back_url` | File Upload | Yes | PNG, JPG, PDF (Max 15MB) | Back technical vector sketch |
| `stitches_per_inch`| Number | Yes | Default: 12 (Min: 8, Max: 18) | Sewing SPI standard |

* **Post-Submit Action**:
  - Writes to `design_tech_packs` table.
  - Automatically generates initial measurement matrix rows for base size.

### Form 2: Sample Approval Submission Form
* **Trigger**: `Submit Sample for Review` on `/design/sample-approvals`
* **Fields**: `tech_pack_id`, `sample_stage` (`PROTO`, `SIZE_SET`, `PPS`), `measured_chest`, `measured_length`, `measured_sleeve`, `fit_comments`, `buyer_reviewer_email`, `approval_status` (`APPROVED`, `REVISE_FIT`, `REJECTED`).
* **Post-Submit Action**: If approved as `PPS`, triggers outward notification to Merchandising and Cutting.

---

## 6. Zigza AI Domain Intelligence for Design Studio

The Design Studio Zigza AI operates as an automated CAD & Pattern Engineering Specialist:
1. **Tech-Pack Review**: `"Show me all active tech-packs currently waiting for sample approval."`
2. **Measurement Discrepancy Finder**: `"Compare sample measurements of PO-8801 against buyer spec and highlight any variance over ±0.5cm."`
3. **Shrinkage Compensation**: `"Calculate cutting pattern lay expansion for 380 GSM French Terry with 4.5% length shrinkage."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Tech-Pack Master Table
CREATE TABLE design_tech_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_number VARCHAR(50) NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id) ON DELETE RESTRICTED,
  category VARCHAR(50) NOT NULL,
  base_size VARCHAR(10) DEFAULT 'M',
  fabric_composition TEXT NOT NULL,
  target_gsm INTEGER NOT NULL,
  cad_front_url TEXT,
  cad_back_url TEXT,
  spi INTEGER DEFAULT 12,
  status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, SAMPLE_DEV, PPS_APPROVED, BULK_APPROVED
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Point of Measure (POM) Matrix
CREATE TABLE design_measurement_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_pack_id UUID REFERENCES design_tech_packs(id) ON DELETE CASCADE,
  pom_name VARCHAR(100) NOT NULL,
  tolerance_cm NUMERIC(4,2) DEFAULT 0.50,
  size_xs NUMERIC(5,2),
  size_s NUMERIC(5,2),
  size_m NUMERIC(5,2) NOT NULL,
  size_l NUMERIC(5,2),
  size_xl NUMERIC(5,2),
  size_2xl NUMERIC(5,2),
  grade_increment_cm NUMERIC(4,2),
  sort_order INTEGER DEFAULT 1
);
```
