# 10 • ALTERATION & QUALITY REWORK CLINIC BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 10 Backend Architecture
**Route Prefix:** `/alter` | **Operating Order:** 10 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/10_alteration_rework_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Alteration & Quality Rework Clinic** serves as the factory's triage hospital. It diagnoses, disassembles, repairs, and re-certifies garments rejected during sewing inline/endline QC, industrial washing, or steam pressing.

### Operational Boundaries & Gates
1. **Root-Cause Tailor Tracking**: Every defect intake ticket must record the originating sewing operator (`original_tailor_id`) to track line defect Pareto distributions.
2. **Secondary AQL Quality Clearance**: Repaired garments cannot re-enter the main production stream without an explicit secondary sign-off from a certified QC Inspector.
3. **Scrap vs Salvage Financial Ledger**: Irreparable garments must be formally condemned to `alteration_scrap_logs` with monetary loss calculations.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 06. Stitching QC / 08. Ironing / 09. AQL ]
- Defective Garment Tickets (`qc_logs.disposition = 'SEND_TO_ALTERATION'`)
- Specific Defect Code (Open Seam, Skip Stitch, Asymmetry)
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. ALTERATION & QUALITY REWORK CLINIC                      │
│ - Defect Intake Triage & Severity Classification            │
│ - Repair Tailor / Special Machine Reassignment              │
│ - Secondary Quality Clearance Gate (Re-Audit)               │
│ - Scrap Loss Financial Accrual Ledger                       │
└─────────────────────────────────────────────────────────────┘
             │
             ├─── Repaired & Passed ──➔ [ 08. Ironing OR 09. Packing ]
             └─── Condemned Irreparable ──➔ [ Scrap Disposal Ledger ]
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Master Alteration Tickets
CREATE TABLE IF NOT EXISTS public.alteration_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'ALT-2026-00412'
    allotment_id UUID REFERENCES public.allotments(id) ON DELETE RESTRICT,
    bundle_id UUID REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    defect_category VARCHAR(50) NOT NULL, -- 'OPEN_SEAM', 'SKIP_STITCH', 'ASYMMETRY', 'BROKEN_THREAD', 'OIL_STAIN'
    defect_severity VARCHAR(20) DEFAULT 'MAJOR', -- 'MINOR', 'MAJOR', 'CRITICAL'
    original_tailor_id UUID REFERENCES public.employees(id),
    repair_tailor_id UUID REFERENCES public.employees(id),
    pieces_received INTEGER NOT NULL CHECK (pieces_received > 0),
    pieces_repaired INTEGER DEFAULT 0,
    pieces_scrapped INTEGER DEFAULT 0,
    secondary_qc_inspector_id UUID REFERENCES public.employees(id),
    status VARCHAR(30) DEFAULT 'INTAKE', -- 'INTAKE', 'IN_REPAIR', 'SECONDARY_QC_PASSED', 'CONDEMNED_SCRAP'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alter_tickets_allotment ON public.alteration_tickets(allotment_id);
CREATE INDEX idx_alter_tickets_status ON public.alteration_tickets(status);

-- 2. Alteration Scrap Financial Ledger
CREATE TABLE IF NOT EXISTS public.alteration_scrap_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.alteration_tickets(id) ON DELETE CASCADE,
    scrapped_pieces INTEGER NOT NULL CHECK (scrapped_pieces > 0),
    scrap_reason TEXT NOT NULL,
    fabric_weight_kg NUMERIC(6,2),
    estimated_financial_loss_inr NUMERIC(10,2) NOT NULL,
    authorized_by UUID NOT NULL REFERENCES public.employees(id), -- Production Manager Auth
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Rework Recovery Efficiency
$$\text{Rework Recovery \%} = \left(\frac{\text{Pieces Repaired \& Passed}}{\text{Total Pieces Received}}\right) \times 100$$
*Factory Standard SLA:* Clinic must achieve $\ge 92.0\%$ recovery rate; $< 8.0\%$ condemned scrap.

---

## 5. Next.js Server Actions (`src/app/alter/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function resolveAlterationTicketAction(payload: {
  ticket_id: string
  pieces_repaired: number
  pieces_scrapped: number
  secondary_qc_inspector_id: string
  scrap_reason?: string
  financial_loss_inr?: number
}) {
  try {
    const isFullPass = payload.pieces_scrapped === 0

    await supabaseAdmin
      .from('alteration_tickets')
      .update({
        pieces_repaired: payload.pieces_repaired,
        pieces_scrapped: payload.pieces_scrapped,
        secondary_qc_inspector_id: payload.secondary_qc_inspector_id,
        status: isFullPass ? 'SECONDARY_QC_PASSED' : 'CONDEMNED_SCRAP',
        resolved_at: new Date().toISOString()
      })
      .eq('id', payload.ticket_id)

    if (payload.pieces_scrapped > 0) {
      await supabaseAdmin.from('alteration_scrap_logs').insert({
        ticket_id: payload.ticket_id,
        scrapped_pieces: payload.pieces_scrapped,
        scrap_reason: payload.scrap_reason || 'Unrecoverable structural defect',
        estimated_financial_loss_inr: payload.financial_loss_inr || 0,
        authorized_by: payload.secondary_qc_inspector_id
      })
    }

    revalidatePath('/alter')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 10 Backend Architecture complete and validated.*
