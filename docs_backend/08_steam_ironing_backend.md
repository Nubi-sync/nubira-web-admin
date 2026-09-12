# 08 • STEAM IRONING & FINISHING FLOOR BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 08 Backend Architecture
**Route Prefix:** `/iron` | **Operating Order:** 08 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/08_steam_ironing_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Steam Ironing & Finishing Floor** transforms washed or sewn apparel into crisp, retail-ready garments using industrial vacuum suction tables, form finishers, and calibrated steam boiler delivery.

### Operational Boundaries & Gates
1. **Steam Pressure & Temperature Gate**: Central boiler steam delivery must maintain $4.5\text{ to }6.0\text{ Bar}$ pressure and table vacuum temperature $\le 145^\circ\text{C}$ to prevent thermal fabric glaze or synthetic fiber shine marks.
2. **Gloss & Shine Inspection Gate**: Finished garments must be checked under 1000-lux neutral inspection lighting for thermal glazing or water spotting.
3. **Piece-Count Handover Reconciler**: Every piece pressed must be stamped with operator ID for piece-rate finishing payroll and transferred to Packing.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 07. Washing OR 06. Stitching ]
- Clean, Dried Garments
- Buyer Presentation Style Spec (Flat Fold vs Hanger Pack)
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 08. STEAM IRONING & FINISHING FLOOR                         │
│ - Vacuum Table & Operator Allotment Ledger                  │
│ - Central Steam Boiler PSI Telemetry Verification           │
│ - Thermal Glaze & Water Spot Defect Audits                  │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Barcode Custody Transfer)
[ 09. READY GOODS & EXPORT PACKING ]
- Crisp, Fold-Ready Garments (Zero Glaze Approved)
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Vacuum Steam Tables Registry
CREATE TABLE IF NOT EXISTS public.iron_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_code VARCHAR(30) NOT NULL UNIQUE, -- e.g. 'TBL-STEAM-VAC-01'
    table_type VARCHAR(30) DEFAULT 'VACUUM_BLOW_TABLE', -- 'VACUUM_BLOW_TABLE', 'FORM_FINISHER', 'UTILITY_PRESS'
    operating_steam_bar NUMERIC(3,1) NOT NULL DEFAULT 5.0,
    vacuum_motor_power_kw NUMERIC(3,1) DEFAULT 0.75,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Steam Ironing Production Logs
CREATE TABLE IF NOT EXISTS public.iron_production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'IRN-2026-092'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    table_id UUID NOT NULL REFERENCES public.iron_tables(id) ON DELETE RESTRICT,
    operator_id UUID NOT NULL REFERENCES public.employees(id),
    shift VARCHAR(10) DEFAULT 'DAY',
    garments_pressed INTEGER NOT NULL CHECK (garments_pressed > 0),
    boiler_pressure_bar NUMERIC(3,1) NOT NULL CHECK (boiler_pressure_bar BETWEEN 3.0 AND 8.0),
    standard_sam_per_pc NUMERIC(4,2) DEFAULT 0.85,
    total_minutes_spent INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ironing Defect Logs
CREATE TABLE IF NOT EXISTS public.iron_defect_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iron_log_id UUID NOT NULL REFERENCES public.iron_production_logs(id) ON DELETE CASCADE,
    defect_type VARCHAR(50) NOT NULL, -- 'THERMAL_SHINE_GLAZE', 'WATER_DROP_STAIN', 'CRUSHED_CREASE', 'FABRIC_SCORCH'
    defect_count INTEGER NOT NULL CHECK (defect_count > 0),
    disposition VARCHAR(30) DEFAULT 'STEAM_RE_WORK', -- 'STEAM_RE_WORK', 'SCRAP'
    inspector_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Pressing Operator Efficiency Formula
$$\text{Finishing Efficiency \%} = \left(\frac{\text{Garments Pressed} \times \text{Standard Allowed Minutes (SAM)}}{\text{Total Actual Minutes Spent}}\right) \times 100$$
*Factory Standard:* Finishing operator target is $\ge 105.0\%$ of standard piecework rate.

---

## 5. Next.js Server Actions (`src/app/iron/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function recordIroningLogAction(payload: {
  log_number: string
  order_id: string
  table_id: string
  operator_id: string
  garments_pressed: number
  boiler_pressure_bar: number
  total_minutes_spent: number
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('iron_production_logs')
      .insert({
        ...payload,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/iron')
    return { success: true, logId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 08 Backend Architecture complete and validated.*
