# 07 • INDUSTRIAL WASHING & WET PROCESSING BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 07 Backend Architecture
**Route Prefix:** `/washing` | **Operating Order:** 07 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/07_industrial_washing_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Industrial Washing & Wet Processing Plant** delivers technical garment finishes (Enzyme Softening, Bio-Polishing, Silicon Wash, Vintage Stone Wash, and Reactive Garment Dyeing) on sewn apparel before pressing.

### Operational Boundaries & Gates
1. **Chemical Recipe Compliance**: Automated validation of liquor ratios ($1:8$ to $1:12$) and dosing standards ($\text{g/L}$) to prevent fiber degradation.
2. **Post-Wash Shrinkage & Spirality Gate**: Random test specimens must be measured post-tumble dry. If dimensional shrinkage exceeds lab allowance by $\ge \pm 1.5\%$, the batch is held for steam re-shaping.
3. **Wet-to-Dry Weight Verification**: Garments leaving the hydro-extractor and industrial tumbler dryers must achieve residual moisture content $\le 6.0\%$.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 06. Stitching & Sewing Floor ]
- QC Passed Garments (`allotments`)
- Buyer Wash Code Reference (e.g. 'ENZYME_SILICON_30MIN')
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 07. INDUSTRIAL WASHING & WET PROCESSING                     │
│ - Chemical Dosing & Recipe Controller                       │
│ - Machine Batch Run (Washer -> Hydro-Extractor -> Tumbler)  │
│ - Pre-Wash vs Post-Wash Shrinkage Delta Audit               │
│ - Effluent Treatment Plant (ETP) pH Neutralization Log      │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Barcode Handshake)
[ 08. STEAM IRONING FLOOR ]
- Dried, Softened Garments (Moisture $\le 6.0\%$)
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Standard Washing Recipes
CREATE TABLE IF NOT EXISTS public.washing_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_code VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'WSH-ENZYME-SILK-01'
    wash_type VARCHAR(50) NOT NULL, -- 'BIO_ENZYME', 'SILICON_SOFTENER', 'STONE_WASH', 'GARMENT_DYE', 'ACID_WASH'
    liquor_ratio VARCHAR(10) DEFAULT '1:10', -- 1:8, 1:10, 1:12
    wash_temperature_c INTEGER NOT NULL CHECK (wash_temperature_c BETWEEN 30 AND 95),
    cycle_time_minutes INTEGER NOT NULL CHECK (cycle_time_minutes BETWEEN 10 AND 180),
    chemical_recipe_json JSONB NOT NULL, -- Array of { chemical_name, dosing_g_per_l }
    ph_target NUMERIC(3,1) NOT NULL DEFAULT 6.5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Washing Production Batches
CREATE TABLE IF NOT EXISTS public.washing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'WSH-BAT-2026-112'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    recipe_id UUID NOT NULL REFERENCES public.washing_recipes(id) ON DELETE RESTRICT,
    machine_id VARCHAR(30) NOT NULL, -- 'BELLY_WASHER_01', 'FRONT_LOAD_WASHER_02'
    operator_id UUID NOT NULL REFERENCES public.employees(id),
    total_garments INTEGER NOT NULL CHECK (total_garments > 0),
    dry_input_weight_kg NUMERIC(8,2) NOT NULL,
    hydro_extracted_weight_kg NUMERIC(8,2),
    tumbler_dry_weight_kg NUMERIC(8,2),
    residual_moisture_percent NUMERIC(4,2),
    status VARCHAR(30) DEFAULT 'WASHING', -- 'WASHING', 'HYDRO_EXTRACTION', 'TUMBLE_DRYING', 'QC_AUDIT', 'COMPLETED'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. Post-Wash Shrinkage & Distortion Audits
CREATE TABLE IF NOT EXISTS public.washing_shrinkage_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.washing_batches(id) ON DELETE CASCADE,
    specimen_size VARCHAR(10) NOT NULL,
    pre_wash_length_cm NUMERIC(6,2) NOT NULL,
    post_wash_length_cm NUMERIC(6,2) NOT NULL,
    length_shrinkage_percent NUMERIC(5,2) GENERATED ALWAYS AS (
        ((pre_wash_length_cm - post_wash_length_cm) / pre_wash_length_cm) * 100
    ) STORED,
    pre_wash_width_cm NUMERIC(6,2) NOT NULL,
    post_wash_width_cm NUMERIC(6,2) NOT NULL,
    width_shrinkage_percent NUMERIC(5,2) GENERATED ALWAYS AS (
        ((pre_wash_width_cm - post_wash_width_cm) / pre_wash_width_cm) * 100
    ) STORED,
    spirality_angle_deg NUMERIC(4,2) DEFAULT 0.00,
    is_within_spec BOOLEAN NOT NULL,
    inspector_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Chemical Dosing Quantity Formula
$$\text{Water Volume (L)} = \text{Dry Fabric Weight (kg)} \times \text{Liquor Ratio (e.g. 10)}$$
$$\text{Total Chemical Required (kg)} = \frac{\text{Water Volume (L)} \times \text{Dosing (g/L)}}{1,000}$$

```typescript
export function calculateWashingChemicals(
  dryWeightKg: number,
  liquorRatio: number,
  dosingGramsPerLiter: number
): { waterLiters: number; chemicalKg: number } {
  const waterLiters = dryWeightKg * liquorRatio
  const chemicalKg = Number(((waterLiters * dosingGramsPerLiter) / 1000).toFixed(3))
  return { waterLiters, chemicalKg }
}
```

### 4.2 Residual Moisture Retention Formula
$$\text{Moisture Retention \%} = \left(\frac{W_{\text{tumbled}} - W_{\text{bone\_dry}}}{W_{\text{bone\_dry}}}\right) \times 100$$
*Target Threshold:* Must be $\le 6.0\%$ before passing garments to Steam Ironing.

---

## 5. Next.js Server Actions (`src/app/washing/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createWashingBatchAction(payload: {
  batch_number: string
  order_id: string
  recipe_id: string
  machine_id: string
  operator_id: string
  total_garments: number
  dry_input_weight_kg: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('washing_batches')
      .insert({
        ...payload,
        status: 'WASHING'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/washing')
    return { success: true, batchId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 07 Backend Architecture complete and validated.*
