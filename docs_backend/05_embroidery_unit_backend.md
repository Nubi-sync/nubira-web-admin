# 05 • MULTI-HEAD EMBROIDERY FLOOR BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 05 Backend Architecture
**Route Prefix:** `/embroidery` | **Operating Order:** 05 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/05_embroidery_unit_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Multi-Head Embroidery Floor** executes precision computerized embroidery on garment cut panels (chest logos, appliques, 3D puff embroidery) utilizing automated multi-head machines (Tajima, Barudan, Happy).

### Operational Boundaries & Gates
1. **DST / EMB Vector Metadata Gate**: Every design must parse and store exact stitch counts, thread color change stops, and dimension limits ($\text{mm}$) before line allotment.
2. **Multi-Head Batch Multiplier**: Machine runs process panels in parallel batches matching machine head count (e.g. a 20-head machine processes exactly 20 panels per run cycle).
3. **Thread Breakage Threshold (TBI)**: Thread breakage must not exceed 2.5 breaks per 100,000 stitches. Exceeding this triggers automatic bobbin and needle inspection.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 03. Cutting Floor ]                     [ 01. Design Studio ]
- Cut Garment Bundles (`cutting_bundles`)  - Approved DST Embroidery File
- Placement Notches on Cut Panels          - Colorway Thread Code Matrix (Madeira/Isacord)
             │                                            │
             └─────────────────────┬──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 05. MULTI-HEAD EMBROIDERY FLOOR                             │
│ - DST Stitch Count & Needle Allocation Ledger               │
│ - Multi-Head Machine Cycle Tracking (RPM & Dwell Time)      │
│ - Thread Breakage & Needle Defect Telemetry                 │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Barcode Custody Transfer)
[ 04. Printing Unit OR 06. Stitching Floor ]
- Embroidered Panels (Zero Puckering Passed)
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Embroidery Master Design Registry (DST / EMB)
CREATE TABLE IF NOT EXISTS public.embroidery_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'EMB-ZIG-HOODIE-CHEST-01'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    dst_file_url TEXT NOT NULL,
    total_stitches INTEGER NOT NULL CHECK (total_stitches > 0),
    color_change_count INTEGER NOT NULL DEFAULT 1,
    width_mm NUMERIC(6,2) NOT NULL,
    height_mm NUMERIC(6,2) NOT NULL,
    backing_type VARCHAR(30) DEFAULT 'TEARAWAY', -- 'TEARAWAY', 'CUTAWAY_2.5OZ', 'WATER_SOLUBLE'
    needle_type VARCHAR(30) DEFAULT 'DBxK5_SES_75_11', -- Industrial Ballpoint Needle
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Physical Multi-Head Embroidery Machines
CREATE TABLE IF NOT EXISTS public.embroidery_machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code VARCHAR(30) NOT NULL UNIQUE, -- e.g. 'TAJIMA_20_HEAD_01'
    brand VARCHAR(50) NOT NULL, -- 'TAJIMA', 'BARUDAN', 'SWF'
    head_count INTEGER NOT NULL CHECK (head_count IN (6, 12, 15, 18, 20, 24)),
    max_rpm INTEGER NOT NULL DEFAULT 1000,
    operational_rpm INTEGER NOT NULL DEFAULT 850,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Embroidery Production Shift Runs
CREATE TABLE IF NOT EXISTS public.embroidery_production_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'EMB-RUN-2026-081'
    machine_id UUID NOT NULL REFERENCES public.embroidery_machines(id) ON DELETE RESTRICT,
    design_id UUID NOT NULL REFERENCES public.embroidery_designs(id) ON DELETE RESTRICT,
    bundle_id UUID NOT NULL REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    operator_id UUID NOT NULL REFERENCES public.employees(id),
    shift VARCHAR(10) NOT NULL DEFAULT 'DAY',
    run_cycles INTEGER NOT NULL CHECK (run_cycles > 0),
    total_panels_completed INTEGER NOT NULL,
    thread_breaks_count INTEGER DEFAULT 0,
    needle_breakages INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'COMPLETED', -- 'RUNNING', 'COMPLETED', 'THREAD_ALARM'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_emb_runs_bundle ON public.embroidery_production_runs(bundle_id);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Embroidery Cycle Time Formula
$$T_{\text{cycle (minutes)}} = \frac{\text{Stitch Count}}{\text{Operational RPM}} \times \left(1 + \frac{\text{Color Changes} \times 12\text{ sec}}{60}\right)$$
*Example:* 8,500 stitches with 3 thread color changes running at 850 RPM:  
$$T_{\text{cycle}} = \frac{8500}{850} \times \left(1 + \frac{36}{60}\right) = 10 \times 1.6 = 16.0\text{ minutes per 20-head frame}$$

### 4.2 Thread Breakage Index (TBI)
$$\text{TBI} = \left(\frac{\text{Thread Breaks} \times 100,000}{\text{Total Stitches Run}}\right)$$
*SLA:* $\text{TBI} \le 2.50$. If $\text{TBI} > 3.0$, system logs warning for tension disc re-calibration.

---

## 5. Next.js Server Actions (`src/app/embroidery/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function recordEmbroideryRunAction(payload: {
  run_number: string
  machine_id: string
  design_id: string
  bundle_id: string
  operator_id: string
  run_cycles: number
  total_panels_completed: number
  thread_breaks_count: number
  needle_breakages: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('embroidery_production_runs')
      .insert({
        ...payload,
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Advance bundle custody
    await supabaseAdmin
      .from('cutting_bundles')
      .update({ current_division: 'EMBROIDERY' })
      .eq('id', payload.bundle_id)

    revalidatePath('/embroidery')
    return { success: true, runId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 05 Backend Architecture complete and validated.*
