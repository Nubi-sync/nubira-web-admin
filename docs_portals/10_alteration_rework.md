# 10 • Alteration & Quality Rework Clinic Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/alter` | **Division Order**: 10 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Alteration & Quality Rework Clinic** is the factory's recovery center. Instead of allowing sewing or finishing defects to degrade into discarded scrap, the clinic diagnoses defect root causes using **Pareto 80/20 analysis**, unpicks faulty stitches, resets misaligned collars/plackets, removes oil stains via high-pressure chemical spray guns, and executes secondary AQL clearance. The division targets a **≥ 95.0% defect recovery rate**, salvaging millions of rupees in direct production costs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 10. ALTERATION & QUALITY REWORK CLINIC                      │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ASTM D3990 (Fabric Defects) / Six Sigma QA │
│ Upstream Inward Entity:        │ 06. Sewing / 08. Ironing / 09. Ready Goods │
│ Downstream Outward Entity:     │ Re-injected to 08. Ironing & 09. Packing   │
│ Target Recovery Clearance:     │ ≥ 95.0% Salvaged to First-Quality Standard │
│ Maximum True Scrap Write-Off:  │ ≤ 0.05% of Total Plant Manufacturing Pieces│
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 06. SEWING QC / 08. IRONING / 09. AQL REJECTS ]
• Quarantined Garments with Yellow/Red Defect Arrow Stickers
• Scanned Defect Intake Ticket (Lineman ID, Defect Classification)
            │
            ▼ (Intake Triage)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 10. ALTERATION & QUALITY REWORK CLINIC                                      │
│ • Defect Triage: Mending Seam vs Spot Clean vs Component Replacement        │
│ • Station 01-04: Master Stitchers (Collar unpicking, seam re-stitching)     │
│ • Station 05-06: Vacuum Spotting Gun (Trichloroethylene-free oil dissolver)│
│ • Secondary AQL Re-Inspection & Barcode Clearance Re-Approval              │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Recovered Passed Payload)            ▼ (Irreparable Scrap Payload)
[ 08. STEAM IRONING / 09. PACKING ]     [ 11. CENTRAL STORE SCRAP REQUISITION]
• 100% Repaired & Cleaned Garments      • Permanent Cut Scrap Record
• Defect Resolved Status Logged in MES  • Down-cycled or Fabric Salvage Sale
• Re-integrated into Packing Stream     • Re-cut Requisition to 03. Cutting
```

### Inward Handshake (What Alteration Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Defective Garment Barcode** | Floor QC Inspector | Barcode Scan (`BDL-XXXX-XX`)| Must be flagged as `REJECT_INLINE` |
| **Defect Category Code** | QC Inspector | Code (e.g. `DEF-SKIP-01`) | Standard ASTM D3990 defect taxonomy |
| **Lineman / Operator ID** | 06. Sewing Floor | Employee ID (`EMP-XXXX`) | Tracing operator responsible for feedback |

### Outward Handshake (What Alteration Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Repaired Garments** | `08. Steam Ironing` | Secondary QC Pass | Re-pressing authorization, defect resolved tag |
| **Scrap Replacement Order**| `03. Cutting Floor` | Irreparable Cut | Exact size-color replacement cut request |
| **Lineman Defect Audit** | `06. Sewing Floor` | Weekly Pareto Rollup | Training feedback for operators with high defect counts |

---

## 3. Total Side Navigation Architecture

The Alteration Clinic portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Alteration Clinic Operations ]
  ├── 01. Clinic Dashboard            -> /alter
  ├── 02. Defect Intake & Pareto      -> /alter/defect-intake
  ├── 03. Master Mending Stations     -> /alter/repair-stations
  ├── 04. Chemical Spotting & Clean   -> /alter/spot-cleaning
  ├── 05. Secondary AQL Re-Inspection -> /alter/secondary-qc
  ├── 06. Scrap Salvage & Write-Off   -> /alter/scrap-salvage
  ├── 07. Zigza AI Copilot            -> /alter/zigza-ai
  └── 08. Alteration Clinic Profile   -> /alter/profile
```

---

## 4. Page Specifications & Core Telemetry

### Page 1: Clinic Dashboard (`/alter`)
* **Purpose**: Real-time recovery monitoring, active repair queue, and defect Pareto breakdown.
* **4 Metric KPI Cards**:
  1. `Active in Queue`: **42 Pcs** *(Current Floor Defect Rate: 0.8% • Low)*
  2. `Repaired & Cleared Today`: **38 Pcs** *(Passed back to production flow)*
  3. `Top Recurring Defect`: **Skip Stitch** *(Line 4 Needle Tension adjusted)*
  4. `Recovery Clearance Rate`: **95.2%** *(True Scrap Rate: 0.04% • High salvage)*
* **Top 5 Defect Pareto Breakdown Table**:
  1. `Skip Stitches`: 34% *(Root cause: Needle burr / Incorrect thread tension)*
  2. `Broken Stitch / Seam Opening`: 26% *(Root cause: Low thread strength / Under-SPI)*
  3. `Needle Oil / Machine Stains`: 18% *(Root cause: Excessive lubrication on overlock)*
  4. `Puckering / Uneven Tension`: 14% *(Root cause: Differential feed calibration)*
  5. `Fabric Hole / Needle Cut`: 8% *(Root cause: Dull needle tip)*

---

## 5. Complete Form Specifications

### Form 1: Defect Intake & Triage Form
* **Trigger**: `Log Inward Defect` on `/alter/defect-intake`

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `garment_barcode` | Text | Yes | Scanned bundle/garment barcode | Barcode on physical garment |
| `defect_source` | Select Dropdown | Yes | `SEWING_LINE`, `WASHING`, `IRONING`, `PACKING_AQL` | Originating factory division |
| `defect_type` | Select Dropdown | Yes | `SKIP_STITCH`, `SEAM_OPEN`, `OIL_STAIN`, `PUCKERING` | ASTM defect category |
| `lineman_id` | Select Dropdown | Yes | Active sewing operators | Tracing source operator |
| `assigned_station` | Select Dropdown | Yes | `Mending Station 01-04`, `Spot Cleaning Gun` | Physical repair workstation |

---

## 6. Zigza AI Domain Intelligence for Alteration

1. **Defect Root Cause Advisor**: `"Line 2 reported 14 seam openings in the last 2 hours on Style ART-8821. What needle size and thread ticket is recommended for 380 GSM fleece?"`
2. **Scrap vs Repair Cost Model**: `"Is it cost-effective to unpick and replace an entire front pocket on a ₹350 garment or declare scrap?"`
3. **Operator Feedback Digest**: `"Generate a training summary for Lineman Dinesh highlighting his top 3 rework defect types this month."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Alteration Rework Tickets
CREATE TABLE alteration_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  challan_id UUID REFERENCES challans(id),
  source_division VARCHAR(40) NOT NULL,
  defect_type VARCHAR(60) NOT NULL,
  lineman_name VARCHAR(100),
  repair_station VARCHAR(30) NOT NULL,
  resolution_status VARCHAR(30) DEFAULT 'IN_REWORK', -- IN_REWORK, REPAIRED_PASSED, SCRAPPED
  repair_cost NUMERIC(6,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cleared_at TIMESTAMPTZ
);
```
