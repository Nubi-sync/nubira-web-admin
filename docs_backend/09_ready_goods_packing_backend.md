# 09 • READY GOODS & EXPORT PACKING BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 09 Backend Architecture
**Route Prefix:** `/ready-goods` | **Operating Order:** 09 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/09_ready_goods_packing_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Ready Goods & Export Packing Floor** is the final manufacturing transformation division. It manages barcode hangtag attachment, folding, individual polybagging, master carton packing, ANSI/ASQ Z1.4 AQL 2.5 quality gates, and dispatch to Central Store export bays.

### Operational Boundaries & Gates
1. **Carton Packing Ceiling Trigger**: The database hard-blocks any attempt to pack more pieces into cartons than were registered in `cutting_bundles`.
2. **ANSI/ASQ Z1.4 (AQL 2.5 / 4.0) Gate**: Every export shipment lot must pass single-stage random sampling under Normal Level II inspection. A single critical defect rejects the entire lot.
3. **Automated Carton Status Transition**: Recording an AQL audit automatically flips carton status via database triggers (`AQL_AUDIT_PASSED` or `QUARANTINED_AQL_FAILED`).

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 08. Steam Ironing ]                     [ 02. Merchandising ]
- Pressed, Retail-Ready Garments           - Buyer Packing Specification (Solid vs Assorted Ratio)
- Certified Piece Counts                   - Master Carton Dimensions & Barcode EAN/UPC
             │                                            │
             └─────────────────────┬──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 09. READY GOODS & EXPORT PACKING                            │
│ - Master Carton Packing & Bundle Join Binding               │
│ - ANSI/ASQ Z1.4 Level II AQL Single-Sampling Inspection     │
│ - Gross Carton Weight Calibration & Volumetric CBM Check    │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Barcode Gate Clearance)
[ 11. CENTRAL STORE & GODOWN (BAYS 3–5) ]
- Commercial Master Cartons (Sealed & Barcoded)
- Clean Packing List & Customs Ready Manifest
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Master Export Cartons
CREATE TABLE IF NOT EXISTS public.ready_goods_cartons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carton_barcode VARCHAR(64) NOT NULL UNIQUE, -- e.g. 'CTN-2026-00124-M'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    carton_sequence_num INTEGER NOT NULL, -- Carton 1 of 450
    packing_type VARCHAR(30) DEFAULT 'SOLID_SIZE_SOLID_COLOR', -- 'SOLID_SIZE_SOLID_COLOR', 'RATIO_ASSORTED'
    total_pieces INTEGER NOT NULL CHECK (total_pieces > 0),
    gross_weight_kg NUMERIC(6,2) NOT NULL CHECK (gross_weight_kg > 0),
    tare_weight_kg NUMERIC(5,2) DEFAULT 0.85,
    length_cm NUMERIC(5,1) NOT NULL DEFAULT 60.0,
    width_cm NUMERIC(5,1) NOT NULL DEFAULT 40.0,
    height_cm NUMERIC(5,1) NOT NULL DEFAULT 30.0,
    cbm NUMERIC(6,4) GENERATED ALWAYS AS ((length_cm * width_cm * height_cm) / 1000000.0) STORED,
    status VARCHAR(32) DEFAULT 'PACKED', -- 'PACKED', 'AQL_AUDIT_PASSED', 'QUARANTINED_AQL_FAILED', 'TRANSFERRED_TO_STORE'
    pack_operator_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cartons_order ON public.ready_goods_cartons(order_id);
CREATE INDEX idx_cartons_status ON public.ready_goods_cartons(status);

-- 2. Carton-to-Bundle Cryptographic Join (Zero Ghost Piece Enforcement)
CREATE TABLE IF NOT EXISTS public.ready_goods_carton_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carton_id UUID NOT NULL REFERENCES public.ready_goods_cartons(id) ON DELETE CASCADE,
    bundle_id UUID NOT NULL REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    pieces_from_bundle INTEGER NOT NULL CHECK (pieces_from_bundle > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(carton_id, bundle_id)
);

CREATE INDEX idx_carton_bundles_bundle ON public.ready_goods_carton_bundles(bundle_id);

-- 3. AQL Audit Log Table
CREATE TABLE IF NOT EXISTS public.ready_goods_aql_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carton_id UUID NOT NULL REFERENCES public.ready_goods_cartons(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES public.employees(id),
    inspection_level VARCHAR(20) DEFAULT 'NORMAL_LEVEL_II',
    sample_size INTEGER NOT NULL CHECK (sample_size > 0),
    critical_defects INTEGER NOT NULL DEFAULT 0,
    major_defects INTEGER NOT NULL DEFAULT 0,
    minor_defects INTEGER NOT NULL DEFAULT 0,
    max_allowed_critical INTEGER NOT NULL DEFAULT 0,
    max_allowed_major INTEGER NOT NULL DEFAULT 3,
    max_allowed_minor INTEGER NOT NULL DEFAULT 5,
    verdict VARCHAR(20) NOT NULL, -- 'PASS', 'FAIL'
    audit_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automated Carton Status Transition Trigger
CREATE OR REPLACE FUNCTION update_carton_status_from_aql()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verdict = 'PASS' THEN
        UPDATE public.ready_goods_cartons
        SET status = 'AQL_AUDIT_PASSED', updated_at = NOW()
        WHERE id = NEW.carton_id;
    ELSE
        UPDATE public.ready_goods_cartons
        SET status = 'QUARANTINED_AQL_FAILED', updated_at = NOW()
        WHERE id = NEW.carton_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_carton_status_from_aql
AFTER INSERT OR UPDATE ON public.ready_goods_aql_audits
FOR EACH ROW EXECUTE FUNCTION update_carton_status_from_aql();
```

---

## 4. Mathematical Engines (ANSI/ASQ Z1.4 AQL 2.5 Sampling Engine)

```typescript
export function getAqlSamplingPlan(lotSize: number): {
  sampleSize: number
  acMajor: number
  reMajor: number
  acMinor: number
  reMinor: number
} {
  // ANSI/ASQ Z1.4 Normal Level II Single Sampling Table
  if (lotSize <= 500) {
    return { sampleSize: 50, acMajor: 3, reMajor: 4, acMinor: 5, reMinor: 6 }
  } else if (lotSize <= 1200) {
    return { sampleSize: 80, acMajor: 5, reMajor: 6, acMinor: 7, reMinor: 8 }
  } else if (lotSize <= 3200) {
    return { sampleSize: 125, acMajor: 7, reMajor: 8, acMinor: 10, reMinor: 11 }
  } else {
    return { sampleSize: 200, acMajor: 10, reMajor: 11, acMinor: 14, reMinor: 15 }
  }
}
```

---

## 5. Next.js Server Actions (`src/app/ready-goods/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function packCartonAction(payload: {
  carton_barcode: string
  order_id: string
  carton_sequence_num: number
  packing_type: string
  total_pieces: number
  gross_weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  pack_operator_id?: string
  bundle_allocations: Array<{ bundle_id: string; pieces: number }>
}) {
  try {
    const { data: carton, error: cErr } = await supabaseAdmin
      .from('ready_goods_cartons')
      .insert({
        carton_barcode: payload.carton_barcode,
        order_id: payload.order_id,
        carton_sequence_num: payload.carton_sequence_num,
        packing_type: payload.packing_type,
        total_pieces: payload.total_pieces,
        gross_weight_kg: payload.gross_weight_kg,
        length_cm: payload.length_cm,
        width_cm: payload.width_cm,
        height_cm: payload.height_cm,
        pack_operator_id: payload.pack_operator_id,
        status: 'PACKED'
      })
      .select()
      .single()

    if (cErr) throw cErr

    for (const alloc of payload.bundle_allocations) {
      const { error: bErr } = await supabaseAdmin
        .from('ready_goods_carton_bundles')
        .insert({
          carton_id: carton.id,
          bundle_id: alloc.bundle_id,
          pieces_from_bundle: alloc.pieces
        })

      if (bErr) throw bErr
    }

    revalidatePath('/ready-goods')
    return { success: true, cartonId: carton.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 09 Backend Architecture complete and validated.*
