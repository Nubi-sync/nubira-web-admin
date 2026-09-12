# 06 • STITCHING & SEWING FLOOR BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 06 Master Operational Benchmark
**Route Prefix:** `/stitching-sewing` | **Operating Order:** 06 of 11  
**Status:** Live Production Reconciled (Benchmark Standard)  
**Location:** `web_admin/docs_backend/06_stitching_sewing_backend.md`

---

## 1. Executive Division Overview & Benchmark Authority

The **Stitching & Sewing Floor** is the core operational benchmark of Zigza MES. It controls assembly line balancing, tailor piece-rate wage calculation, lineman bundles, inline & endline QC inspection, mending repair desks, and warehouse handovers.

### Benchmark Axioms (Synchronized with Production Code)
1. **Live Production Reconciled**: Matches live database DDL and Server Actions in `web_admin/src/app/stitching-sewing/supervisor-desk/actions.ts`.
2. **Zero Wage Dispute Guarantee**: Operators are compensated strictly for verified passed pieces recorded in `qc_logs` and `allotments`.
3. **5-Station Pipeline State Machine**:
   $$\text{Store Godown Trims} \longrightarrow \text{Lineman Stitching} \longrightarrow \text{Mending Desk} \longrightarrow \text{Inline/Endline QC} \longrightarrow \text{Store/Dispatch}$$

---

## 2. Inward & Outward Handshake Pipeline

```
[ 03. Cutting / 04. Print / 05. Embroid ]
- Cut Component Bundles (`cutting_bundles`)
- Thread & Trims Inward from Central Store
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 06. STITCHING & SEWING FLOOR BENCHMARK                      │
│ - Lineman Floor Ticket Allotments (`allotments`)            │
│ - Live Multi-Supervisor Desk (Absentee Line Reassignments)  │
│ - Endline Inspection & Defect Classification (`qc_logs`)    │
│ - Piece-Rate Wage Accrual Ledger                            │
└─────────────────────────────────────────────────────────────┘
             │
             ├─── Approved Pieces ──➔ [ 07. Washing OR 08. Ironing ]
             └─── Repairable Defects ──➔ [ 10. Alteration Clinic ]
```

---

## 3. Database Schema (PostgreSQL DDL — Live Production Parity)

```sql
-- 1. Stitching Line Allotments (Work In Progress WIP)
CREATE TABLE IF NOT EXISTS public.allotments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_id UUID NOT NULL REFERENCES public.challans(id) ON DELETE RESTRICT,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE RESTRICT,
    bundle_id UUID REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    lineman_id UUID NOT NULL REFERENCES public.employees(id),
    employee_id UUID REFERENCES public.employees(id), -- Specific Tailor
    operation_name VARCHAR(100) DEFAULT 'COMPLETE_GARMENT_STITCHING',
    piece_rate NUMERIC(8,2) NOT NULL DEFAULT 24.50,
    allotted_quantity INTEGER NOT NULL CHECK (allotted_quantity > 0),
    completed_quantity INTEGER DEFAULT 0,
    qc_total_passed INTEGER DEFAULT 0,
    qc_total_rejected INTEGER DEFAULT 0,
    mending_status VARCHAR(40) DEFAULT 'PENDING_STITCHING', -- 'PENDING_STITCHING', 'IN_MENDING', 'COUNT_VERIFIED', 'WITH_LINEMAN_FOR_REPAIR'
    mending_counted_qty INTEGER,
    mending_notes TEXT,
    status VARCHAR(30) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'QC_PENDING', 'APPROVED_FOR_STORE', 'DISPATCHED'
    allotted_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_allotments_lineman ON public.allotments(lineman_id);
CREATE INDEX idx_allotments_bundle ON public.allotments(bundle_id);
CREATE INDEX idx_allotments_status ON public.allotments(status);

-- 2. Comprehensive QC Inspection & Defect Audit Log
CREATE TABLE IF NOT EXISTS public.qc_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allotment_id UUID NOT NULL REFERENCES public.allotments(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id),
    inspector_id UUID NOT NULL REFERENCES public.employees(id),
    inspection_type VARCHAR(30) NOT NULL, -- 'INLINE_STITCHING', 'ENDLINE_QC', 'MENDING_RECEIVING', 'STORE_AUDIT'
    pieces_inspected INTEGER NOT NULL CHECK (pieces_inspected > 0),
    pieces_passed INTEGER NOT NULL CHECK (pieces_passed >= 0),
    pieces_rejected INTEGER NOT NULL DEFAULT 0,
    defect_category VARCHAR(50), -- 'SKIP_STITCH', 'NEEDLE_PUCKERING', 'OPEN_SEAM', 'SHADE_VARIANCE', 'OIL_STAIN', 'ASYMMETRY'
    defect_severity VARCHAR(20) DEFAULT 'MINOR', -- 'MINOR', 'MAJOR', 'CRITICAL'
    disposition VARCHAR(30) NOT NULL, -- 'PASS_TO_STORE', 'PASS_TO_WASHING', 'SEND_TO_ALTERATION', 'SCRAP'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qc_logs_allotment ON public.qc_logs(allotment_id);
CREATE INDEX idx_qc_logs_inspector ON public.qc_logs(inspector_id);
```

---

## 4. Mathematical Engines & Payroll Formulas

### 4.1 Piece-Rate Daily Tailor Wage Calculation
$$\text{Operator Daily Wage (₹)} = \sum_{i=1}^{n} \left(\text{QC Passed Pieces}_i \times \text{Operation Piece Rate}_i\right)$$
*Zero Wage Dispute Protection:* If 20 pieces are sewn but 2 are failed by Endline QC and routed to Alteration, the operator's wage ledger credits $18 \times \text{Rate}$. The remaining 2 pieces are credited only upon secondary QC clearance.

### 4.2 Defect Density (DHU - Defects Per Hundred Units)
$$\text{DHU} = \left(\frac{\text{Total Defects Found}}{\text{Total Garments Inspected}}\right) \times 100$$
*Factory SLA:* Endline DHU must not exceed $3.50\%$.

---

## 5. Next.js Server Actions (`src/app/stitching-sewing/supervisor-desk/actions.ts`)

```typescript
// Live Production Methods Active in Codebase:
// 1. advanceLinemanLotToMendingAction(allotmentId, targetMendingSupervisorId, notes)
// 2. verifyMendingAndHandoverToQCAction(allotmentId, verifiedQty, qcSupervisorId, notes)
// 3. submitQCInspectionAction(allotmentId, passedQty, defectiveQty, defectType, disposition)
// 4. reassignLinemanDeskLotAction(allotmentId, newLinemanId, transferReason)
// 5. inwardApprovedLotToStoreGodownAction(allotmentId, inwardQty, bayLocation)
```

---
*Division 06 Benchmark documentation fully aligned with production codebase.*
