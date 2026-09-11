# 09 • Ready Goods & Export Carton Packing Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/ready-goods` | **Division Order**: 09 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Ready Goods & Export Carton Packing Division** is the final defense against customer non-conformance. It enforces international **AQL 2.5 (Acceptable Quality Limit - Normal Level II Sampling)** audits, verifies EAN-13/UPC barcode hangtags against buyer PO matrices, seals garments in moisture-barrier polybags, and packs master export cartons according to strict solid-size or ratio assortments. Every sealed carton receives a GS1-standard carton barcode label with verified gross weight, establishing the final link in the **Zero Ghost Piece referential & quantity integrity chain**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 09. READY GOODS & EXPORT CARTON PACKING                     │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standard Standard:    │ ISO 2859-1 (AQL 2.5) / GS1-128 Barcoding   │
│ Upstream Inward Entity:        │ 08. Steam Ironing + 11. Store (Cartons)    │
│ Downstream Outward Entity:     │ 11. Central Store Godown / Container Dock  │
│ AQL 2.5 Critical Defect SLA:   │ 0 Critical Allowed • Max Minor Defects: 2% │
│ Barcode Scan Match Rate:       │ 100.0% Perfect Match (Zero EAN Mismatch)   │
│ Quantity Integrity Standard:   │ Trigger-Enforced Bundle & Carton Ceilings  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Inward & Outward Handshake Pipeline

```
[ 08. STEAM IRONING FLOOR ]               [ 11. CENTRAL STORE ]
• Pressed, Wrinkle-Free Garments          • Master 5-Ply Corrugated Cartons
• Inspection Pass Lot Challan             • Buyer Printed Polybags & Barcode Hangtags
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 09. READY GOODS & EXPORT CARTON PACKING                                     │
│ • AQL 2.5 Statistical Sample Inspection (Form 1 -> ready_goods_aql_audits)  │
│ • Carton Status Transition: PACKED -> AQL_AUDIT_PASSED or QUARANTINED       │
│ • Barcode Hangtag Attachment (Kimble Tag Gun / Micro-Tach Fastener)         │
│ • Polybag Folding & Silica Gel Desiccant Insertion                          │
│ • Solid / Assorted Carton Packing (Form 2 -> ready_goods_carton_bundles)   │
│ • Carton Gross Weight Scale Check (Tolerance ± 0.15 kg) & GS1 Barcode Label │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Handshake Payload)
[ 11. CENTRAL STORE GODOWN / EXPORT CONTAINER LOADING ]
• Master Carton Packing Manifest (Total Cartons, Net/Gross Weight, CBM)
• Verified Sealed Cartons Stacked in Central Godown Bay 3–5
• Gate Pass Authorization for Final Container Stuffing
```

### Inward Handshake (What Ready Goods Receives)
| Input Parameter | Source Entity | Data Format | Validation Rule |
| :--- | :--- | :--- | :--- |
| **Pressed Garments** | `08. Steam Ironing` | Physical Batch | Zero wrinkles, zero dampness |
| **EAN-13 / UPC Barcodes** | `11. Central Store` | Barcode Labels | Must match buyer style-color-size SKU |
| **Packing Ratio Assortment**| `02. Merchandising` | Ratio Specification | Exact ratio (e.g. `2S - 4M - 4L - 2XL` per carton) |

### Outward Handshake (What Ready Goods Delivers to Next Portals)
| Output Payload | Recipient Portal | Handshake Trigger | Critical Data Transferred |
| :--- | :--- | :--- | :--- |
| **Sealed Export Cartons** | `11. Central Store` | AQL Pass & Scale Checked | Carton No range (`001–150`), Gross Weight, CBM volume |
| **AQL 2.5 Audit Certificate**| Buyer QA Team | Form 1 Submission | Sample size, major/minor defect count, signed inspector ID |
| **Packing Rejection Log** | `10. Alteration Clinic`| Stains / Hangtag Error | Flagged pieces sent back for cleaning or re-tagging |

---

## 3. Total Side Navigation Architecture

The Ready Goods portal has **8 dedicated side navigation views**:

```
[ Workspace Hub ]
  └── 00. All Modules                 -> /modules (Central Enterprise Hub)

[ Ready Goods & Packing Operations ]
  ├── 01. Packing Dashboard           -> /ready-goods
  ├── 02. AQL 2.5 Inspection Station  -> /ready-goods/aql-inspection
  ├── 03. Hangtag & Polybag Station   -> /ready-goods/tagging-polybag
  ├── 04. Carton Packing Manifest     -> /ready-goods/carton-packing
  ├── 05. Scale Weight & Audit Log    -> /ready-goods/carton-weight
  ├── 06. Central Godown Handover     -> /ready-goods/handover
  ├── 07. Zigza AI Copilot            -> /ready-goods/zigza-ai
  └── 08. Ready Goods Profile         -> /ready-goods/profile
```

---

## 4. Complete Page Specifications (All 8 Navigation Views)

### Page 1: Packing Dashboard (`/ready-goods`)
* **Purpose**: Overview of packing floor throughput, carton sealing progress, and AQL audit results.
* **4 Metric KPI Cards**:
  1. `Total Packed Cartons`: **142 Cartons** *(5,680 Finished Export Garments)*
  2. `AQL 2.5 Inspection Score`: **PASS (0.4% Defects)** *(Threshold: 2.5% Maximum)*
  3. `Hangtag Barcode Match`: **100% OK** *(Zero EAN-13 scanning errors)*
  4. `Ready Godown Stocked`: **42,500 Pcs** *(Stored in Central Godown Bay 3–5)*

### Page 2: AQL 2.5 Statistical Inspection Station (`/ready-goods/aql-inspection`)
* **Purpose**: Console for conducting statistical quality audits on packed cartons before release.
* **Standard ISO 2859-1 Sampling Table Reference**:
  * Lot Size 3,201 to 10,000 pcs $\rightarrow$ Sample Size: **200 Garments**.
  * Critical Defects Allowed: **0** (Any critical defect fails the entire lot).
  * Major Defects Allowed: **≤ 10** (AQL 2.5 limit).
  * Minor Defects Allowed: **≤ 14** (AQL 4.0 limit).
* **State Transition Workflow**: Marking a carton or lot as `REJECT_QUARANTINE` updates `ready_goods_cartons.status` to `QUARANTINED_AQL_FAILED` and halts release.

### Page 3: Hangtag & Polybag Station (`/ready-goods/tagging-polybag`)
* **Purpose**: High-speed barcode verification station where operators scan individual garment hangtags with thermal verification.

### Page 4: Carton Packing Manifest (`/ready-goods/carton-packing`)
* **Purpose**: Real-time manifest tracking open cartons on packing conveyor lines, auto-summing pieces by size.

### Page 5: Scale Weight & Carton Audit Log (`/ready-goods/carton-weight`)
* **Purpose**: Digital weighbridge scale integration verifying that packed carton gross weight matches mathematical BOM weight ($\pm 0.15$ kg tolerance).

### Page 6: Central Godown Handover (`/ready-goods/handover`)
* **Purpose**: Pallet manifest generator releasing sealed cartons to Central Store Godown Bay 3–5.

### Page 7: Zigza AI Copilot (`/ready-goods/zigza-ai`)
* **Purpose**: AQL sampling advisor, carton assortment optimizer, and shipping volume calculator.
* **Pre-Loaded Prompts**:
  1. `"For a buyer lot of 4,800 hoodies, what is the ISO 2859-1 sample size and maximum allowed major defects?"`
  2. `"Carton #084 weighed 14.8 kg against expected 16.2 kg. Alert packing line for potential missing garments."`
  3. `"Calculate how many 7-ply master cartons of Style ART-7714 can fit in a standard 40ft High Cube container."`

### Page 8: Ready Goods Profile (`/ready-goods/profile`)
* **Purpose**: Packing floor supervisor credentials, certified AQL inspector authorizations, and scale calibration logs.

---

## 5. Complete Form Specifications

### Form 1: AQL 2.5 Final Audit Submission Form
* **Trigger**: `Conduct AQL Audit` on `/ready-goods/aql-inspection`
* **Purpose**: **Directly writes to `ready_goods_aql_audits` and executes carton status transitions**.

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `audit_number` | Text | Yes | Pattern: `^AQL-[0-9]{5,8}$` | Unique audit voucher |
| `order_id` | Select Dropdown | Yes | Active buyer purchase orders | Commercial contract |
| `carton_id` | Select Dropdown | Yes | Active packed cartons (`ready_goods_cartons.id`)| Target carton being audited |
| `inspector_id` | Select Dropdown | Yes | Certified QA inspectors (`employees.id`)| Accountable inspector FK |
| `lot_size_pieces` | Number | Yes | Min: 50, Max: 100,000 | Total pieces represented |
| `sample_size_audited`| Number (Auto) | Yes | Auto-calculated per ISO 2859-1 | Sample size drawn randomly |
| `critical_defects` | Number | Yes | Default: 0 | Broken needle, metal contamination |
| `major_defects` | Number | Yes | Open seams, wrong measurement > 1cm | Defect count affecting saleability |
| `minor_defects` | Number | Yes | Stray thread, slight fold crease | Minor cosmetic flaws |
| `audit_decision` | Select Dropdown | Yes | `PASS`, `RE_AUDIT`, `REJECT_QUARANTINE` | Master QA verdict |

* **Post-Submit Action**:
  - If `audit_decision == 'PASS'`: Automatically updates `ready_goods_cartons.status = 'AQL_AUDIT_PASSED'`.
  - If `audit_decision == 'REJECT_QUARANTINE'`: Automatically updates `ready_goods_cartons.status = 'QUARANTINED_AQL_FAILED'`.

### Form 2: Master Carton Packing & Gross Weight Form
* **Trigger**: `Seal & Register Carton` on `/ready-goods/carton-packing`
* **Purpose**: **Directly creates `ready_goods_cartons` records and binds bundles in `ready_goods_carton_bundles`**.

| Field Name | Type | Required | Validation / Options | Tooltip / Hint |
| :--- | :--- | :--- | :--- | :--- |
| `carton_number` | Text | Yes | Pattern: `^CTN-[0-9]{5,8}$` | Unique carton barcode |
| `order_id` | Select Dropdown | Yes | Active buyer purchase orders | Commercial contract |
| `packed_bundle_ids`| Multi-Select | Yes | Scanned bundle QR tickets (`cutting_bundles.id`)| Linking exact bundles packed |
| `total_pieces` | Number | Yes | Sum of pieces (e.g. 40 pcs) | Total garments in carton |
| `size_breakdown` | JSON Grid | Yes | E.g. `{"S": 10, "M": 15, "L": 15}` | Size ratio distribution |
| `measured_gross_weight_kg`| Number | Yes | Decimal from digital scale | Measured carton weight |
| `expected_gross_weight_kg`| Number | Yes | Auto-calculated from BOM | Theoretical weight |
| `godown_bay` | Select Dropdown | Yes | `BAY_3`, `BAY_4`, `BAY_5` | Storage location |

---

## 6. Zigza AI Domain Intelligence for Ready Goods

1. **AQL Sampling Guide**: `"For a buyer lot of 4,800 hoodies, what is the ISO 2859-1 sample size and maximum allowed major defects?"`
2. **Gross Weight Discrepancy Alert**: `"Carton #084 weighed 14.8 kg against expected 16.2 kg. Alert packing line for potential missing garments."`
3. **Container Stuffing Calculation**: `"Calculate how many 7-ply master cartons of Style ART-7714 can fit in a standard 40ft High Cube container."`

---

## 7. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Master Packed Export Cartons
CREATE TABLE ready_goods_cartons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carton_number VARCHAR(40) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  total_pieces INTEGER NOT NULL CHECK (total_pieces > 0),
  size_breakdown JSONB NOT NULL,
  measured_gross_weight_kg NUMERIC(6,2) NOT NULL,
  expected_gross_weight_kg NUMERIC(6,2) NOT NULL,
  weight_variance_kg NUMERIC(4,2) GENERATED ALWAYS AS (measured_gross_weight_kg - expected_gross_weight_kg) STORED,
  status VARCHAR(40) DEFAULT 'PACKED', -- PACKED, AQL_AUDIT_PASSED, QUARANTINED_AQL_FAILED, UNPACKED_FOR_REWORK, SHIPPED
  godown_bay_location VARCHAR(30) DEFAULT 'BAY_3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Carton-to-Bundle Traceability Binding (Closes the Zero Ghost Piece Chain)
CREATE TABLE ready_goods_carton_bundles (
  carton_id UUID REFERENCES ready_goods_cartons(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES cutting_bundles(id) ON DELETE RESTRICTED,
  pieces_from_bundle INTEGER NOT NULL CHECK (pieces_from_bundle > 0),
  PRIMARY KEY (carton_id, bundle_id)
);

-- 3. AQL 2.5 Quality Audit Records (Populated by Form 1)
CREATE TABLE ready_goods_aql_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES merchandising_orders(id) ON DELETE RESTRICTED,
  carton_id UUID REFERENCES ready_goods_cartons(id) ON DELETE RESTRICTED,
  inspector_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  lot_size_pieces INTEGER NOT NULL,
  sample_size_audited INTEGER NOT NULL,
  critical_defects INTEGER NOT NULL DEFAULT 0,
  major_defects INTEGER NOT NULL DEFAULT 0,
  minor_defects INTEGER NOT NULL DEFAULT 0,
  audit_decision VARCHAR(30) NOT NULL, -- PASS, RE_AUDIT, REJECT_QUARANTINE
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Quantity Integrity Trigger: Enforcing Carton Piece Ceiling Against Bundles
CREATE OR REPLACE FUNCTION validate_carton_bundle_sum()
RETURNS TRIGGER AS $$
DECLARE
  v_bundle_pieces INTEGER;
  v_already_packed INTEGER;
BEGIN
  SELECT piece_count INTO v_bundle_pieces FROM cutting_bundles WHERE id = NEW.bundle_id;
  SELECT COALESCE(SUM(pieces_from_bundle), 0) INTO v_already_packed FROM ready_goods_carton_bundles
  WHERE bundle_id = NEW.bundle_id AND carton_id != COALESCE(NEW.carton_id, '00000000-0000-0000-0000-000000000000');
  
  IF (v_already_packed + NEW.pieces_from_bundle) > v_bundle_pieces THEN
    RAISE EXCEPTION 'Quantity Integrity Violation: Total pieces packed from bundle (%) exceeds physical bundle count (%)',
      (v_already_packed + NEW.pieces_from_bundle), v_bundle_pieces;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_carton_bundle_sum
BEFORE INSERT OR UPDATE ON ready_goods_carton_bundles
FOR EACH ROW EXECUTE FUNCTION validate_carton_bundle_sum();

-- 5. Automated Carton Lifecycle Transition Trigger from AQL Decision
CREATE OR REPLACE FUNCTION update_carton_status_from_aql()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.audit_decision = 'PASS' THEN
    UPDATE ready_goods_cartons 
    SET status = 'AQL_AUDIT_PASSED', updated_at = NOW() 
    WHERE id = NEW.carton_id;
  ELSIF NEW.audit_decision = 'REJECT_QUARANTINE' THEN
    UPDATE ready_goods_cartons 
    SET status = 'QUARANTINED_AQL_FAILED', updated_at = NOW() 
    WHERE id = NEW.carton_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_carton_status_from_aql
AFTER INSERT OR UPDATE ON ready_goods_aql_audits
FOR EACH ROW EXECUTE FUNCTION update_carton_status_from_aql();
```
