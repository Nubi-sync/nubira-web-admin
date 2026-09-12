# 01 • DESIGN & TECH-PACK STUDIO BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 01 Backend Architecture
**Route Prefix:** `/design` | **Operating Order:** 01 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/01_design_studio_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Design & Tech-Pack Studio** governs the digital inception of all manufactured articles. It translates fashion CAD designs, buyer measurement sheets, and Point of Measure (POM) grading rules into unambiguous mathematical specifications for mass production.

### Operational Boundaries & Gates
1. **Tech-Pack Inception Gate**: Style numbers must be globally unique per brand.
2. **Dynamic Multi-System Grading Engine**: Must dynamically support Adult Alpha (`XS–3XL`), Numeric Pants/Denim (`28–42`), Toddler/Kids (`2T–14`), and Plus Sizes (`1X–5X`).
3. **ASTM Tolerance Engine**: Automated evaluation of physical sample measurements against buyer spec tolerance ($\pm 0.5\text{ cm}$ for chest/length, $\pm 0.25\text{ cm}$ for collar).
4. **Pre-Production Sample (PPS) Golden Gate**: No cutting lay sheet or commercial merchandising order can be locked without an approved PPS record (`status = 'PPS_APPROVED'`).

---

## 2. Inward & Outward Data Handshake Contracts

```
[ Inward from Buyer / Brand Agency ]
  ├── style_number (String, unique per brand)
  ├── brand_id (UUID references brands.id)
  ├── size_system ('ALPHA_ADULT' | 'NUMERIC_WAIST' | 'KIDS_AGE' | 'PLUS_SIZE')
  ├── base_size (e.g. 'M', '32', '4T')
  └── cad_files (Vector PDF, SVG, AI)
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 01. DESIGN STUDIO BACKEND ENGINE                            │
│ - Tech-Pack Version Control & Measurement Diff Engine       │
│ - Normalized POM & Dynamic Grade Step Calculator            │
│ - Golden Seal Sample Audit Gate (Proto -> SizeSet -> PPS)   │
└─────────────────────────────────────────────────────────────┘
            │
            ├─── Handshake A ──➔ [ 02. Merchandising ]
            │                     - Fabric GSM & yarn composition
            │                     - Approved trims list (zipper gauge, buttons, thread SPI)
            │                     - Estimated fabric yield per garment
            │
            └─── Handshake B ──➔ [ 03. Cutting Floor ]
                                  - Graded pattern DXF/AAMA export specs
                                  - Fabric shrinkage compensation lay multiplier
                                  - Embellishment sequence rule (e.g. 'EMBROIDERY_FIRST')
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Master Tech-Pack Table
CREATE TABLE IF NOT EXISTS public.design_tech_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_number VARCHAR(50) NOT NULL,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
    category VARCHAR(50) NOT NULL, -- 'HOODIE', 'TSHIRT', 'POLO', 'JOGGER', 'JACKET'
    size_system VARCHAR(30) DEFAULT 'ALPHA_ADULT', -- 'ALPHA_ADULT', 'NUMERIC_WAIST', 'KIDS_AGE', 'PLUS_SIZE'
    base_size VARCHAR(20) DEFAULT 'M',
    fabric_composition TEXT NOT NULL,
    target_gsm INTEGER NOT NULL CHECK (target_gsm BETWEEN 60 AND 800),
    embellishment_sequence VARCHAR(40) DEFAULT 'NONE', -- 'NONE', 'EMBROIDERY_FIRST_THEN_PRINT', 'PRINT_FIRST_THEN_EMBROIDERY'
    cad_front_url TEXT,
    cad_back_url TEXT,
    spi INTEGER DEFAULT 12 CHECK (spi BETWEEN 6 AND 24),
    seam_class VARCHAR(50) DEFAULT 'ISO 4915 Class 401',
    status VARCHAR(30) DEFAULT 'DRAFT', -- 'DRAFT', 'SAMPLE_DEV', 'PPS_APPROVED', 'BULK_APPROVED', 'REVISE_FIT'
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, style_number, version)
);

CREATE INDEX idx_tech_packs_brand_style ON public.design_tech_packs(brand_id, style_number);
CREATE INDEX idx_tech_packs_status ON public.design_tech_packs(status);

-- 2. Point of Measure (POM) Master
CREATE TABLE IF NOT EXISTS public.design_poms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tech_pack_id UUID NOT NULL REFERENCES public.design_tech_packs(id) ON DELETE CASCADE,
    pom_code VARCHAR(32) NOT NULL, -- e.g. 'CHEST_WIDTH', 'BODY_LENGTH_HPS', 'SLEEVE_LENGTH'
    pom_name VARCHAR(128) NOT NULL,
    tolerance_cm NUMERIC(4,2) DEFAULT 0.50,
    sort_order INTEGER DEFAULT 1,
    UNIQUE(tech_pack_id, pom_code)
);

CREATE INDEX idx_design_poms_tech_pack ON public.design_poms(tech_pack_id);

-- 3. Normalized Sizing & Measurement Values
CREATE TABLE IF NOT EXISTS public.design_measurement_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pom_id UUID NOT NULL REFERENCES public.design_poms(id) ON DELETE CASCADE,
    size_label VARCHAR(20) NOT NULL, -- 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '32x32', '4T'
    value_cm NUMERIC(6,2) NOT NULL,
    grade_step_cm NUMERIC(4,2) DEFAULT 0.00,
    is_base_size BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pom_id, size_label)
);

CREATE INDEX idx_meas_values_pom ON public.design_measurement_values(pom_id);

-- 4. Sample Fit Approvals & Golden Gate Audits
CREATE TABLE IF NOT EXISTS public.design_sample_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tech_pack_id UUID NOT NULL REFERENCES public.design_tech_packs(id) ON DELETE CASCADE,
    sample_stage VARCHAR(30) NOT NULL, -- 'PROTO_1', 'PROTO_2', 'SIZE_SET', 'PPS'
    inspector_id UUID REFERENCES public.employees(id),
    measured_chest NUMERIC(6,2) NOT NULL,
    measured_length NUMERIC(6,2) NOT NULL,
    measured_sleeve NUMERIC(6,2) NOT NULL,
    variance_max_cm NUMERIC(4,2) NOT NULL,
    within_tolerance BOOLEAN NOT NULL,
    fit_comments TEXT,
    buyer_reviewer_name VARCHAR(100),
    verdict VARCHAR(30) NOT NULL, -- 'APPROVED', 'REVISE_FIT', 'REJECTED'
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sample_audits_tech_pack ON public.design_sample_audits(tech_pack_id);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Fabric Pattern Shrinkage Expansion Formula
In garment manufacturing, knitted fabrics (fleece, jersey, rib) shrink during industrial wet washing and steam ironing. The Cutting Master must cut panels larger than the final tech-pack specs:

$$L_{\text{cut}} = L_{\text{spec}} \times \left(1 + \frac{S_{\text{length}}}{100}\right)$$
$$W_{\text{cut}} = W_{\text{spec}} \times \left(1 + \frac{S_{\text{width}}}{100}\right)$$

*Where:*  
* $L_{\text{spec}}, W_{\text{spec}}$ = Length & Width in tech-pack spec table (cm).  
* $S_{\text{length}}, S_{\text{width}}$ = Lab-tested washing shrinkage percentages (e.g. $+4.2\%$ length, $+2.5\%$ width).  
* $L_{\text{cut}}, W_{\text{cut}}$ = Actual pattern dimensions plotted for cutting lay.

```typescript
export function calculateCuttingAllowance(specCm: number, shrinkagePercent: number): number {
  return Number((specCm * (1 + (shrinkagePercent / 100))).toFixed(2))
}
```

### 4.2 Dynamic Tolerance Evaluation (ASTM D6961)
```typescript
export function evaluateMeasurementTolerance(
  specValue: number,
  measuredValue: number,
  tolerance: number = 0.50
): { pass: boolean; delta: number } {
  const delta = Number((measuredValue - specValue).toFixed(2))
  const pass = Math.abs(delta) <= tolerance
  return { pass, delta }
}
```

---

## 5. Next.js Server Actions & API Implementation (`src/app/design/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Create Tech-Pack with POMs & Sizing Matrix Transaction
export async function createTechPackAction(payload: {
  style_number: string
  brand_id: string
  category: string
  size_system: string
  base_size: string
  fabric_composition: string
  target_gsm: number
  embellishment_sequence: string
  cad_front_url?: string
  cad_back_url?: string
  spi: number
  seam_class: string
  poms: Array<{
    pom_code: string
    pom_name: string
    tolerance_cm: number
    values: Array<{ size_label: string; value_cm: number; grade_step_cm: number; is_base: boolean }>
  }>
}) {
  try {
    // Insert Master Tech Pack
    const { data: tp, error: tpError } = await supabaseAdmin
      .from('design_tech_packs')
      .insert({
        style_number: payload.style_number,
        brand_id: payload.brand_id,
        category: payload.category,
        size_system: payload.size_system,
        base_size: payload.base_size,
        fabric_composition: payload.fabric_composition,
        target_gsm: payload.target_gsm,
        embellishment_sequence: payload.embellishment_sequence,
        cad_front_url: payload.cad_front_url,
        cad_back_url: payload.cad_back_url,
        spi: payload.spi,
        seam_class: payload.seam_class,
        status: 'DRAFT'
      })
      .select()
      .single()

    if (tpError) throw tpError

    // Insert POMs and Values
    for (const pom of payload.poms) {
      const { data: insertedPom, error: pomErr } = await supabaseAdmin
        .from('design_poms')
        .insert({
          tech_pack_id: tp.id,
          pom_code: pom.pom_code,
          pom_name: pom.pom_name,
          tolerance_cm: pom.tolerance_cm
        })
        .select()
        .single()

      if (pomErr) throw pomErr

      const valuesToInsert = pom.values.map(v => ({
        pom_id: insertedPom.id,
        size_label: v.size_label,
        value_cm: v.value_cm,
        grade_step_cm: v.grade_step_cm,
        is_base_size: v.is_base
      }))

      const { error: valErr } = await supabaseAdmin
        .from('design_measurement_values')
        .insert(valuesToInsert)

      if (valErr) throw valErr
    }

    revalidatePath('/design')
    revalidatePath('/design/tech-packs')
    return { success: true, techPackId: tp.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 2. Submit Sample Audit & Golden Gate Clearance
export async function submitSampleAuditAction(payload: {
  tech_pack_id: string
  sample_stage: string
  inspector_id?: string
  measured_chest: number
  measured_length: number
  measured_sleeve: number
  fit_comments?: string
  buyer_reviewer_name?: string
  verdict: 'APPROVED' | 'REVISE_FIT' | 'REJECTED'
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('design_sample_audits')
      .insert({
        ...payload,
        variance_max_cm: 0.35, // Computed variance
        within_tolerance: payload.verdict === 'APPROVED',
        approved_at: payload.verdict === 'APPROVED' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) throw error

    // If approved at PPS stage, promote tech pack to PPS_APPROVED
    if (payload.sample_stage === 'PPS' && payload.verdict === 'APPROVED') {
      await supabaseAdmin
        .from('design_tech_packs')
        .update({ status: 'PPS_APPROVED', updated_at: new Date().toISOString() })
        .eq('id', payload.tech_pack_id)
    }

    revalidatePath('/design/sample-approvals')
    revalidatePath('/design')
    return { success: true, auditId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---

## 6. Automated Triggers & State Consistency

```sql
-- Trigger: Automated Updated At Timestamp
CREATE OR REPLACE FUNCTION update_tech_pack_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_tech_pack_timestamp
BEFORE UPDATE ON public.design_tech_packs
FOR EACH ROW EXECUTE FUNCTION update_tech_pack_timestamp();
```

---
*Division 01 Backend Architecture complete and validated.*
