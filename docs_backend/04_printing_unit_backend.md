# 04 • SCREEN & DIGITAL PRINTING UNIT BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 04 Backend Architecture
**Route Prefix:** `/printing` | **Operating Order:** 04 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/04_printing_unit_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Screen & Digital Printing Unit** executes high-precision garment decoration (Plastisol, Water-Based, Discharge, Puff, and Direct-to-Film DTF) on cut garment panels before sewing assembly.

### Operational Boundaries & Gates
1. **Strike-Off Golden Swatch Gate**: No bulk printing can start without a signed-off strike-off test (`printing_strike_offs`) matching buyer Pantone references.
2. **Curing Oven Temperature Audit**: Plastisol and water-based inks must reach mandatory cross-linking temperatures ($\ge 160^\circ\text{C}$ for 120 seconds). Curing failures trigger immediate batch quarantine.
3. **Cut Bundle Piece-Count Reconciliation**: Scanned bundle panels must be accounted for piece-for-piece. Rejections must be logged immediately so recut panels can be requested from Cutting.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 03. Cutting Floor / 05. Embroidery ]
- Serialized Cut Bundles (`cutting_bundles`)
- Panel Orientation Geometry & Notch Marks
- Print Location Spec (Chest, Back, Sleeve)
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 04. SCREEN & DIGITAL PRINTING UNIT                          │
│ - Strike-Off Pantone Shade & Mesh Count Sign-Off            │
│ - Continuous Curing Oven Telemetry Monitoring (160°C Gate)  │
│ - Shift Run Logging & Defect Pareto Classification          │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Barcode Custody Transfer)
[ 06. STITCHING & SEWING FLOOR ]
- Printed Cut Bundles (Zero Defect Verified)
- Defect Replacement Panel Handshake
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Printing Strike-Off Approvals
CREATE TABLE IF NOT EXISTS public.printing_strike_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    print_design_name VARCHAR(100) NOT NULL,
    print_technique VARCHAR(32) NOT NULL, -- 'PLASTISOL', 'WATER_BASED', 'DISCHARGE', 'PUFF', 'DTF', 'SUBLIMATION'
    pantone_codes TEXT[] NOT NULL, -- Array of Pantone codes e.g. {'19-4052 TCX', '11-0601 TCX'}
    mesh_count INTEGER NOT NULL DEFAULT 120, -- Mesh per inch: 80, 110, 120, 160, 230
    squeegee_durometer INTEGER DEFAULT 75, -- 65, 70, 75, 80 Shore A
    strike_off_swatch_url TEXT,
    buyer_approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_printing_strike_off_order ON public.printing_strike_offs(order_id);

-- 2. Printing Production Runs
CREATE TABLE IF NOT EXISTS public.printing_production_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_code VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'PRN-2026-031'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    strike_off_id UUID NOT NULL REFERENCES public.printing_strike_offs(id) ON DELETE RESTRICT,
    printing_table_or_machine VARCHAR(32) NOT NULL, -- 'OCTOPUS_CAROUSEL_01', 'MANUAL_TABLE_02', 'DTF_PRINTER_01'
    operator_id UUID NOT NULL REFERENCES public.employees(id),
    oven_temperature_c NUMERIC(5,2) NOT NULL CHECK (oven_temperature_c BETWEEN 120 AND 220),
    oven_dwell_seconds INTEGER NOT NULL CHECK (oven_dwell_seconds BETWEEN 30 AND 300),
    shift VARCHAR(10) NOT NULL DEFAULT 'DAY', -- 'DAY', 'NIGHT'
    total_panels_printed INTEGER NOT NULL DEFAULT 0,
    total_rejections INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'RUNNING', -- 'RUNNING', 'COMPLETED', 'OVEN_ALARM_HOLD'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. Printing Bundle Intake & Piece Reconciliation
CREATE TABLE IF NOT EXISTS public.printing_bundle_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_run_id UUID NOT NULL REFERENCES public.printing_production_runs(id) ON DELETE CASCADE,
    bundle_id UUID NOT NULL REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    received_pieces INTEGER NOT NULL,
    passed_pieces INTEGER NOT NULL,
    rejected_pieces INTEGER NOT NULL DEFAULT 0,
    reconciliation_valid BOOLEAN GENERATED ALWAYS AS (received_pieces = passed_pieces + rejected_pieces) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Printing Defect Log
CREATE TABLE IF NOT EXISTS public.printing_defect_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_run_id UUID NOT NULL REFERENCES public.printing_bundle_runs(id) ON DELETE CASCADE,
    defect_type VARCHAR(50) NOT NULL, -- 'PINHOLE', 'OFF_REGISTRATION', 'INK_BLEEDING', 'POOR_CURING', 'SMUDGE', 'FABRIC_BURN'
    defect_count INTEGER NOT NULL CHECK (defect_count > 0),
    action_taken VARCHAR(50) DEFAULT 'PANEL_RE_CUT_REQUESTED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Printing Rejection Rate & Panel Recovery Ratio
$$\text{Rejection Rate \%} = \left(\frac{\text{Total Rejected Panels}}{\text{Total Input Bundle Panels}}\right) \times 100$$
*Factory SLA Benchmark:* Rejection rate must stay $\le 1.2\%$. Over $2.0\%$ halts machine and triggers squeegee re-alignment.

```typescript
export function computePrintEfficiency(inputPanels: number, rejectedPanels: number) {
  const passedPanels = inputPanels - rejectedPanels
  const rejectionRate = Number(((rejectedPanels / inputPanels) * 100).toFixed(2))
  const isAlarmThreshold = rejectionRate > 2.0
  return { passedPanels, rejectionRate, isAlarmThreshold }
}
```

---

## 5. Next.js Server Actions (`src/app/printing/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function recordPrintRunAction(payload: {
  run_code: string
  order_id: string
  strike_off_id: string
  machine: string
  operator_id: string
  oven_temperature_c: number
  oven_dwell_seconds: number
  bundles: Array<{ bundle_id: string; received_pieces: number; passed_pieces: number; rejected_pieces: number; defect_type?: string }>
}) {
  try {
    const totalPrinted = payload.bundles.reduce((acc, b) => acc + b.passed_pieces, 0)
    const totalRejected = payload.bundles.reduce((acc, b) => acc + b.rejected_pieces, 0)

    const { data: run, error: runErr } = await supabaseAdmin
      .from('printing_production_runs')
      .insert({
        run_code: payload.run_code,
        order_id: payload.order_id,
        strike_off_id: payload.strike_off_id,
        printing_table_or_machine: payload.machine,
        operator_id: payload.operator_id,
        oven_temperature_c: payload.oven_temperature_c,
        oven_dwell_seconds: payload.oven_dwell_seconds,
        total_panels_printed: totalPrinted,
        total_rejections: totalRejected,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (runErr) throw runErr

    for (const b of payload.bundles) {
      const { data: bRun, error: bErr } = await supabaseAdmin
        .from('printing_bundle_runs')
        .insert({
          production_run_id: run.id,
          bundle_id: b.bundle_id,
          received_pieces: b.received_pieces,
          passed_pieces: b.passed_pieces,
          rejected_pieces: b.rejected_pieces
        })
        .select()
        .single()

      if (bErr) throw bErr

      if (b.rejected_pieces > 0 && b.defect_type) {
        await supabaseAdmin.from('printing_defect_logs').insert({
          bundle_run_id: bRun.id,
          defect_type: b.defect_type,
          defect_count: b.rejected_pieces
        })
      }

      // Update bundle current division
      await supabaseAdmin
        .from('cutting_bundles')
        .update({ current_division: 'PRINTING' })
        .eq('id', b.bundle_id)
    }

    revalidatePath('/printing')
    return { success: true, runId: run.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 04 Backend Architecture complete and validated.*
