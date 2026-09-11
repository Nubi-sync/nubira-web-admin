# 01 • Design & Tech-Pack Studio Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/design` | **Division Order**: 01 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Design & Tech-Pack Studio** is the digital inception point of the garment manufacturing lifecycle. It bridges creative fashion concepts and industrial mass manufacturing by standardizing CAD sketches, dynamic Point of Measure (POM) grading tables, Bill of Materials (BOM), measurement tolerances, and size grading matrices.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       01. DESIGN & TECH-PACK STUDIO                         │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D6961 / ISO 8559 Garment Sizing       │
│ Upstream Inward Entity:        │ Buyer Brand / Fashion House Concept        │
│ Downstream Outward Entity:     │ 02. Merchandising (Costing/PO) & 03. Cut   │
│ Target Sample Approval Cycle:  │ ≤ 3.5 Days (Target: 95% First-Time-Right)  │
│ Measurement Tolerance Limits:  │ ± 0.5 cm (Chest/Length) | ± 0.25 cm (Neck) │
│ Grading Engine Support:        │ Fully Normalized: Alpha, Numeric, Kids, +  │
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
│ • Digitize Tech-Pack (Measurements, Specs, Seam Types, SPI)                 │
│ • Generate Normalized Size Grading (Alpha XS–3XL, Kids 2T–14, Plus 1X–5X)   │
│ • Define Embellishment Sequence (Embroidery-First vs Print-First Rule)      │
│ • Physical Sample Fit Approval (Proto -> Size Set -> Pre-Production Sample)  │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Handshake Payload A)                 ▼ (Handshake Payload B)
[ 02. MERCHANDISING & SOURCING ]        [ 03. CUTTING & LAY FLOOR ]
• Approved BOM Fabric Specs              • Approved Marker Specs
• Trims & Thread Consumption Matrix     • Grade Rule Files (DXF/AAMA)
• Target Garment Cost Benchmarks        • Approved Shrinkage Allowances
• Embellishment Sequence Flag           • Cut Notch & Placement Geometry
```

### Inward Handshake (What Design Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Buyer Brand ID** | Buyer / Brand | UUID (`brands.id`) | Must match active registered Brand |
| **Season / Style Ref** | Buyer Tech-Pack | String (e.g. `SS27-HOODIE-01`) | Unique per season |
| **CAD Sketch / Vector** | Design Agency | Vector PDF / SVG / AI | High-res 300 DPI vector |
| **Base Measurement Sheet** | Buyer Spec | JSON / Excel Table | Must define base size (e.g. `M` or `32`) |
| **Fabric Spec Requirement** | Buyer Fabric Team | GSM, Yarn Count, Blend | Standard ASTM nomenclature |

### Outward Handshake (What Design Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **BOM Spec & Fabric Consumption** | `02. Merchandising` | Status $\rightarrow$ `PPS_APPROVED` | Fabric GSM, shrinkage %, thread consumption/garment, trim counts |
| **Graded CAD & Pattern Cut Spec** | `03. Cutting Floor` | Status $\rightarrow$ `BULK_APPROVED` | DXF/AAMA pattern files, grade rule matrix, notch specs, lay allowances |
| **Embellishment Sequence Rule** | `04. Print / 05. Embroid` | Work Order Generation | Strict sequence: e.g. `EMBROIDERY_FIRST_THEN_PRINT` |
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

## 4. Complete Page Specifications (All 7 Navigation Views)

### Page 1: Studio Dashboard (`/design`)
* **Purpose**: Real-time cockpit for creative direction, pending sample approvals, and tech-pack release velocity.
* **4 Metric KPI Cards**:
  1. `Active Tech-Packs`: **28 Specs** *(12 Approved for Bulk, 16 In-Progress)*
  2. `Sample Fit Approvals`: **8 Pending** *(Avg Approval Cycle: 3.2 Days)*
  3. `Grading Rule Profiles`: **14 Active Systems** *(Adult Alpha, Numeric Men's, Toddler 2T–5T, Plus)*
  4. `PPS First-Time-Right`: **96.4%** *(Target SLA: > 95.0%)*
* **Primary Interactive Table: Active Development Pipeline**
  * Columns: `Style Ref`, `Buyer / Brand`, `Garment Category`, `Base Size`, `PPS Status`, `Embellishment Flow`, `Target Cut Date`, `Actions`.
  * Status Badges: `DRAFT` (Grey), `SAMPLE_DEV` (Amber), `PPS_SUBMITTED` (Sky), `APPROVED_BULK` (Emerald), `REVISE_FIT` (Rose).

### Page 2: Tech-Pack Catalog (`/design/tech-packs`)
* **Purpose**: Master repository of approved garment specifications and CAD sketches.
* **Interactive Views**:
  * Dual-tab view: `Visual Gallery` (Vector CAD cards with front/back thumbnails) vs `Detailed Spec Table`.
  * Version History Diff Engine: Compares `v1.0` vs `v1.1` measurement diffs with color-coded alerts (e.g. `Chest +1.5cm`).

### Page 3: Sample Approvals & Fit Iterations (`/design/sample-approvals`)
* **Purpose**: Track physical prototype approvals through the 3-stage buyer gate:
  1. **Proto Sample** (Aesthetic & Silhouette fit).
  2. **Size Set Sample** (Measurement verification across all sizes).
  3. **Pre-Production Sample (PPS)** (Sealed golden piece for factory production).
* **Defect & Rejection Tracker**: Tracks variance Pareto (e.g. Neck drop too low, sleeve pitch puckering).

### Page 4: Dynamic Size Grading Matrix (`/design/grading-matrix`)
* **Purpose**: Fully normalized, multi-system size grading engine supporting any sizing taxonomy.
* **Visual Matrix View**:
  | Point of Measure (POM) | Tolerance (±) | XS (cm) | S (cm) | M (Base) | L (cm) | XL (cm) | 2XL (cm) | Grade Step |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Half Chest Width** | 0.50 cm | 48.0 | 50.5 | **53.0** | 55.5 | 58.0 | 60.5 | +2.5 cm |
  | **Body Length from HPS** | 0.50 cm | 68.0 | 70.0 | **72.0** | 74.0 | 76.0 | 78.0 | +2.0 cm |
  | **Sleeve Length from CB**| 0.50 cm | 82.0 | 84.5 | **87.0** | 89.5 | 92.0 | 94.5 | +2.5 cm |
  | **Neck Opening Width** | 0.25 cm | 17.5 | 18.0 | **18.5** | 19.0 | 19.5 | 20.0 | +0.5 cm |
* **Dynamic Scheme Selector**: Switch between `Adult Unisex (XS–3XL)`, `Kids (2T–14)`, `Men's Trousers (28–44)`, `Plus Size (1X–5X)`.

### Page 5: Fabric & Trims Library (`/design/materials-library`)
* **Purpose**: Technical repository of validated fabrics, knit constructions, thread specifications, and certified trims.
* **Attributes Catalog**: Shrinkage %, spirality %, yarn counts, recommended sewing needle size (e.g. `Ball Point 75/11` for interlock).

### Page 6: Zigza AI Copilot (`/design/zigza-ai`)
* **Purpose**: Dedicated CAD, Pattern Engineering, and Fabric Yield intelligent assistant.
* **Pre-Loaded Quick Prompts**:
  1. `"Audit all active tech-packs awaiting buyer sample feedback > 4 days."`
  2. `"Calculate pattern lay shrinkage allowance for 380 GSM fleece with 4.2% length shrink."`
  3. `"Highlight measurement discrepancies between Proto 1 and PPS sample for Style ART-8821."`

### Page 7: Studio Profile & Team Roles (`/design/profile`)
* **Purpose**: Manage CAD designer assignments, sample tailor skill allocations, and brand authorizations.

---

## 5. Complete Form Specifications

### Form 1: New Tech-Pack Creation Stepper Modal
* **Trigger**: `Create Tech-Pack` Button on `/design/tech-packs`
* **Architecture**: 2-Step Stepper Modal (optimized for desktop & tablet entry):

#### Step 1: Core Design & Garment Meta
| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `style_number` | Text | Yes | Pattern: `^[A-Z0-9-]{6,20}$` | Unique factory article code (e.g. `ART-8821`) |
| `brand_id` | Select Dropdown | Yes | Active registered brands | Buyer brand owning the design |
| `garment_category`| Select Dropdown | Yes | `Hoodie`, `T-Shirt`, `Polo`, `Jogger`, `Jacket`, `Kids Romper` | Base product silhouette |
| `size_system` | Select Dropdown | Yes | `ALPHA_ADULT`, `NUMERIC_WAIST`, `KIDS_AGE`, `PLUS_SIZE` | Dynamic grading scheme |
| `base_size` | Text | Yes | E.g. `M`, `32`, `4T`, `1X` | Root pattern grading base size |
| `fabric_type` | Text | Yes | Max 100 chars (e.g. `100% Cotton French Terry`) | Primary shell fabric description |
| `target_gsm` | Number | Yes | Min: 80, Max: 600 (e.g. `380`) | Fabric weight in grams per sq meter |
| `embellishment_sequence`| Select Dropdown| Yes | `NONE`, `EMBROIDERY_FIRST_THEN_PRINT`, `PRINT_FIRST_THEN_EMBROIDERY` | Strict sequencing rule |

#### Step 2: Technical Vectors & Stitch Specifications
| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `cad_front_url` | File Upload | Yes | PNG, JPG, PDF, SVG (Max 15MB) | Front technical vector sketch |
| `cad_back_url` | File Upload | Yes | PNG, JPG, PDF, SVG (Max 15MB) | Back technical vector sketch |
| `stitches_per_inch`| Number | Yes | Default: 12 (Min: 8, Max: 18) | Sewing SPI standard |
| `seam_class` | Select Dropdown | Yes | `ISO 4915 Class 401`, `Class 504`, `Class 607` | Industrial seam standard |

### Form 2: Sample Approval Submission Form
* **Trigger**: `Submit Sample for Review` on `/design/sample-approvals`
* **Fields**: `tech_pack_id`, `sample_stage` (`PROTO`, `SIZE_SET`, `PPS`), `measured_chest`, `measured_length`, `measured_sleeve`, `fit_comments`, `buyer_reviewer_email`, `approval_status` (`APPROVED`, `REVISE_FIT`, `REJECTED`).
* **Post-Submit Action**: If approved as `PPS`, triggers automated outward notification to Merchandising and Cutting.

---

## 6. Zigza AI Domain Intelligence for Design Studio

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
  size_system VARCHAR(30) DEFAULT 'ALPHA_ADULT', -- ALPHA_ADULT, NUMERIC_WAIST, KIDS_AGE, PLUS_SIZE
  base_size VARCHAR(20) DEFAULT 'M',
  fabric_composition TEXT NOT NULL,
  target_gsm INTEGER NOT NULL,
  embellishment_sequence VARCHAR(40) DEFAULT 'NONE', -- NONE, EMBROIDERY_FIRST_THEN_PRINT, PRINT_FIRST_THEN_EMBROIDERY
  cad_front_url TEXT,
  cad_back_url TEXT,
  spi INTEGER DEFAULT 12,
  status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, SAMPLE_DEV, PPS_APPROVED, BULK_APPROVED
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Normalized Point of Measure (POM) Master
CREATE TABLE design_poms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_pack_id UUID REFERENCES design_tech_packs(id) ON DELETE CASCADE,
  pom_code VARCHAR(30) NOT NULL, -- e.g. CHEST_WIDTH, BODY_LENGTH
  pom_name VARCHAR(100) NOT NULL,
  tolerance_cm NUMERIC(4,2) DEFAULT 0.50,
  sort_order INTEGER DEFAULT 1
);

-- 3. Normalized Size Values (Fully Supports Kids, Plus-Size, Numeric)
CREATE TABLE design_measurement_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pom_id UUID REFERENCES design_poms(id) ON DELETE CASCADE,
  size_label VARCHAR(20) NOT NULL, -- e.g. 'XS', 'M', '2XL', '4T', '32x34', '3X'
  value_cm NUMERIC(6,2) NOT NULL,
  grade_step_cm NUMERIC(4,2) DEFAULT 0.00,
  is_base_size BOOLEAN DEFAULT FALSE,
  UNIQUE(pom_id, size_label)
);
```
