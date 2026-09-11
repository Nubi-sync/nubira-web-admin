# 05 • Multi-Head Embroidery Floor Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/embroidery` | **Division Order**: 05 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Multi-Head Embroidery Floor** manages high-speed computerized thread embellishment. Operating multi-head industrial machines (20-head setups running at 850–1,000 RPM), the division digitizes buyer vector artwork into stitch punch files (Tajima `.DST` / Barudan `.DSB`), calculates precise stitch counts, maintains thread tension across Madeira/Isacord viscose and polyester threads, and computes operator piece-rate billing based on millions of stitches.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    05. MULTI-HEAD EMBROIDERY FLOOR                          │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D204 (Sewing Threads) / ISO 4915      │
│ Upstream Inward Entity:        │ 03. Cutting Floor (Cut Panels) + 01. Design│
│ Downstream Outward Entity:     │ 06. Stitching & Sewing Floor               │
│ Machine Speed & Target:        │ 850–950 Stitches/Min • Target: < 0.03% TBF │
│ Thread Break Frequency (TBF):  │ ≤ 2 breaks per 100,000 stitches            │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 03. CUTTING FLOOR ]                     [ 01. DESIGN & DIGITIZER ]
• Numbered Bundles of Cut Panels          • DST / DSB Computerized Punch Files
• Placement Target Notches                • Thread Palette Colors & Backing Spec
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 05. MULTI-HEAD EMBROIDERY FLOOR                                             │
│ • Frame Hooping & Backing Stabilizer Selection (Tear-away vs Cut-away)      │
│ • Machine Speed Regulation & Auto-Trimming Calibration                      │
│ • Multi-Head Production Execution (10 Multi-Head Units = 200 Heads)         │
│ • Jump Stitch Trimming, Heat Press Ironing & Stray Thread Inspection        │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Handshake Payload)
[ 06. STITCHING & SEWING FLOOR ]
• 100% Inspected & Cleaned Embroidered Panels
• Intact Bundle Barcodes Verified
• Lineman Inward Handshake Registration
```

### Inward Handshake (What Embroidery Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Cut Panel Bundles** | `03. Cutting Floor` | Barcode (`BDL-XXXX`) | Every panel must have bundle tag intact |
| **DST Punch File** | Digitizer / Design | `.DST` / `.DSB` Binary | Verified stitch count and needle sequence |
| **Stabilizer Backing Spec**| Tech-Pack | `Tear-Away` / `Cut-Away` (GSM) | Minimum 40 GSM backing for knits |
| **Thread Shade Cones** | `11. Central Store` | Thread Shade Number | Must match approved buyer lab dip swatch |

### Outward Handshake (What Embroidery Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Embroidered Cut Panels** | `06. Stitching & Sewing` | QC Pass & De-Hooping | Intact bundle integrity, clean backing tear, zero bird-nesting |
| **Stitch Count Ledger** | Commercial Billing | Machine Run Complete | Total stitches run for piece-rate and vendor jobwork billing |
| **Thread Consumption Log** | `11. Central Store` | Batch Finish | Total thread cones consumed against BOM allocation |

---

## 3. Total Side Navigation Architecture

The Embroidery Floor portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Embroidery Floor Operations ]
  ├── 01. Floor Dashboard             -> /embroidery
  ├── 02. DST Punch File Library      -> /embroidery/punch-library
  ├── 03. Machine Runs & Hooping      -> /embroidery/machine-runs
  ├── 04. Stitch Count & Billing      -> /embroidery/stitch-billing
  ├── 05. Thread Store & Cones Log    -> /embroidery/thread-store
  ├── 06. Quality & Thread Break QC   -> /embroidery/embroidery-qc
  ├── 07. Zigza AI Copilot            -> /embroidery/zigza-ai
  └── 08. Embroidery Floor Profile    -> /embroidery/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Floor Dashboard (`/embroidery`)
* **Purpose**: Real-time telemetry monitoring 10 computerized multi-head machines, speed, and thread breaks.
* **4 Metric KPI Cards**:
  1. `Active Embroidery Lines`: **10 Units** *(20-head automated setups = 200 active heads)*
  2. `Daily Stitch Volume`: **1.85 Million Stitches** *(Shift cumulative)*
  3. `Thread Break Frequency (TBF)`: **0.02%** *(Well below 0.03% threshold)*
  4. `Digitized Punch Library`: **450+ DST Files** *(Ready-to-run approved designs)*

### Page 2: Stitch Count & Jobwork Billing Ledgers (`/embroidery/stitch-billing`)
* **Purpose**: Calculate commercial billing and operator wages based on running stitches.
* **Standard Industry Billing Formula**:
  $$\text{Embroidery Cost per Piece} = \left(\frac{\text{Total Stitches}}{1,000}\right) \times \text{Rate per 1,000 Stitches (e.g. ₹2.80)} + \text{Backing Paper Cost}$$

---

## 5. Complete Form Specifications

### Form 1: DST File Upload & Digitizing Registration Form
* **Trigger**: `Upload Punch File` on `/embroidery/punch-library`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `design_code` | Text | Yes | Alpha-numeric (e.g. `DST-ZARA-04`) | Unique punch file code |
| `dst_file` | File Upload | Yes | `.DST`, `.DSB` format | Machine binary stitch file |
| `total_stitches` | Number | Yes | Min: 500, Max: 250,000 | Total stitch count from punch software |
| `color_stops_count`| Number | Yes | Min: 1, Max: 15 needle stops | Number of thread color changes |
| `backing_type` | Select Dropdown | Yes | `Tear-Away 40 GSM`, `Cut-Away 60 GSM`, `Water Soluble` | Backing paper stabilizer |
| `thread_brand` | Select Dropdown | Yes | `Madeira`, `Isacord`, `Coats`, `Vardhman` | Certified embroidery thread |

---

## 6. Zigza AI Domain Intelligence for Embroidery

1. **Thread Break Diagnostics**: `"Machine #04 Head 12 had 6 thread breaks in the last hour. Suggest root causes (needle burr, tension disc lint, or bobbin case wear)."`
2. **Shift Capacity Loading**: `"Can we run 4,500 pieces of 18,000-stitch chest logos on Lines 1 to 3 before tomorrow 6 PM?"`
3. **Thread Cone Requisition**: `"Calculate required Madeira polyester cones for 12,000 pieces of Style ART-8821."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Embroidery Digitized Design Files
CREATE TABLE embroidery_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_code VARCHAR(60) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id),
  total_stitches INTEGER NOT NULL,
  color_stops INTEGER NOT NULL,
  dst_file_url TEXT NOT NULL,
  rate_per_thousand_stitches NUMERIC(6,2) DEFAULT 2.80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Machine Production Runs
CREATE TABLE embroidery_machine_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_number VARCHAR(20) NOT NULL,
  design_id UUID REFERENCES embroidery_designs(id),
  panels_loaded INTEGER NOT NULL,
  panels_completed INTEGER NOT NULL,
  thread_breaks_count INTEGER DEFAULT 0,
  run_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(30) DEFAULT 'RUNNING'
);
```
