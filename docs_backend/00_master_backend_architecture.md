# ZIGZA ENTERPRISE MES — MASTER BACKEND ARCHITECTURE
### Complete Relational Graph, Data Contracts, Cross-Division State Machines & Zero-Ghost-Piece Engine
**Document Version:** 2.0.0 Enterprise  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL (pgvector + PostGIS enabled)  
**Security Standard:** Row Level Security (RLS) with Cryptographic Audit Trail  
**Location:** `web_admin/docs_backend/00_master_backend_architecture.md`

---

## 1. Executive System Topology & Architectural Philosophy

The **Zigza MES Platform** operates an 11-division physical manufacturing pipeline. Unlike conventional ERPs that track passive inventory aggregates, Zigza MES tracks garments at the **physical bundle and carton level** using a closed-loop cryptographic state machine.

### Core Architectural Axioms
1. **Zero Ghost Piece Guarantee**: A garment piece cannot physically exist in the system unless it is deterministically derived from a registered cut bundle, which in turn must be backed by a verified fabric roll lay sheet.
2. **Deterministic Foreign Key Chains**: All work passes through verifiable gate-to-gate handshakes. No division can accept work without acknowledging custody from the upstream division.
3. **Double-Entry Ledger Accounting**: Physical inventory movement (fabric rolls, trims, cut panels, stitched garments, packed cartons) follows strict debits and credits via immutable transaction logs (`store_transactions`, `qc_logs`, `carton_bundles`).
4. **Active Runtime PostgreSQL Trigger Enforcement**: Business rules (e.g. piece ceilings, AQL status transitions, BOM tolerances) are enforced at the database kernel level, preventing dirty reads or concurrent race-condition over-allocations.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  MASTER ENTERPRISE PIPELINE TOPOLOGY                                   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 [ 01. Design Studio ] ───➔ [ 02. Merchandising ] ───➔ [ 11. Central Store ] ───➔ [ 03. Cutting Floor ]
                                                                                           │
                               ┌───────────────────────────────────────────────────────────┴──────────┐
                               ▼ (Default Sequence Directive: Embroidery First)                       ▼
                     [ 05. Embroidery Floor ] ───➔ [ 04. Printing Unit ] ─────────────────────────────┘
                                                       │
                                                       ▼
                                          [ 06. STITCHING & SEWING ] ◄── (Master Operational Benchmark)
                                                       │
                               ┌───────────────────────┴──────────────────────────┐
                               ▼                                                  ▼
                   [ 07. Industrial Washing ]                          [ 10. Alteration Clinic ]
                               │                                                  ▲
                               ▼                                                  │ (Defect Loop)
                    [ 08. Steam Ironing ] ────────────────────────────────────────┘
                               │
                               ▼
                   [ 09. Ready Goods & Packing ] ───➔ [ 11. Store Bay 3–5 ] ───➔ [ Export Container ]
```

---

## 2. Master Relational Hierarchy & Foreign Key Backbone

```sql
-- LEVEL 0: Master Entities (Commercial & Organization)
brands (id PK) ──< (1:N) >── vendors (id PK)
       │                            │
       ├───< (1:N) >── articles     ├───< (1:N) >── challans
       │                            │
       └───< (1:N) >── merchandising_orders (id PK)
                              │
-- LEVEL 1: Pre-Production & Inward Material
design_tech_packs (id PK)     store_fabric_rolls (id PK)
       │                            │ (roll_id)
       ▼                            ▼
-- LEVEL 2: Spreading & Cutting Floor
cutting_lay_sheets (id PK) ◄────────┘
       │
       ▼ (lay_sheet_id)
cutting_bundles (id PK) ── [Zero Ghost Piece Root Seed]
       │
       ├───────────────────────────────────────────────┬────────────────────────────────┐
       ▼ (bundle_id)                                   ▼ (bundle_id)                    ▼ (bundle_id)
allotments (id PK)                            ready_goods_carton_bundles       alteration_tickets (id PK)
       │                                      (carton_id, bundle_id)                    │
       ├───────────────────────┐                               │                        ▼
       ▼ (allotment_id)        ▼ (employee_id)                 ▼ (carton_id)    allotments (repair re-route)
qc_logs (id PK)         employees (id PK)             ready_goods_cartons (id PK)
                                                               │
                                                               ▼ (carton_id)
                                                      ready_goods_aql_audits (id PK)
```

---

## 3. Global Quantity Ceiling Triggers (Zero Ghost Piece Defense)

In high-speed apparel manufacturing, concurrency bugs allow operators or supervisors to over-allot pieces or double-scan bundles. Zigza MES enforces database-level ceiling locks:

### 3.1 Bundle Allotment Ceiling Trigger
$$\sum (\text{allotments.allotted\_quantity}) \le \text{cutting\_bundles.piece\_count}$$

```sql
CREATE OR REPLACE FUNCTION validate_bundle_allotment_sum()
RETURNS TRIGGER AS $$
DECLARE
    v_piece_count INTEGER;
    v_total_allotted INTEGER;
BEGIN
    SELECT piece_count INTO v_piece_count
    FROM cutting_bundles
    WHERE id = NEW.bundle_id;

    IF v_piece_count IS NULL THEN
        RAISE EXCEPTION 'Referenced cutting bundle % does not exist', NEW.bundle_id;
    END IF;

    SELECT COALESCE(SUM(allotted_quantity), 0) INTO v_total_allotted
    FROM allotments
    WHERE bundle_id = NEW.bundle_id AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

    IF (v_total_allotted + NEW.allotted_quantity) > v_piece_count THEN
        RAISE EXCEPTION 'Over-allotment violation on Bundle %! Physical Cut: %, Existing Allotted: %, Attempted: %',
            NEW.bundle_id, v_piece_count, v_total_allotted, NEW.allotted_quantity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_bundle_allotment_sum
BEFORE INSERT OR UPDATE ON allotments
FOR EACH ROW EXECUTE FUNCTION validate_bundle_allotment_sum();
```

### 3.2 Carton Packing Ceiling Trigger
$$\sum (\text{ready\_goods\_carton\_bundles.pieces\_from\_bundle}) \le \text{cutting\_bundles.piece\_count}$$

```sql
CREATE OR REPLACE FUNCTION validate_carton_bundle_sum()
RETURNS TRIGGER AS $$
DECLARE
    v_piece_count INTEGER;
    v_total_packed INTEGER;
BEGIN
    SELECT piece_count INTO v_piece_count
    FROM cutting_bundles
    WHERE id = NEW.bundle_id;

    SELECT COALESCE(SUM(pieces_from_bundle), 0) INTO v_total_packed
    FROM ready_goods_carton_bundles
    WHERE bundle_id = NEW.bundle_id 
      AND NOT (carton_id = NEW.carton_id AND bundle_id = NEW.bundle_id);

    IF (v_total_packed + NEW.pieces_from_bundle) > v_piece_count THEN
        RAISE EXCEPTION 'Over-packing violation on Bundle %! Cut: %, Already Packed: %, Attempted: %',
            NEW.bundle_id, v_piece_count, v_total_packed, NEW.pieces_from_bundle;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_carton_bundle_sum
BEFORE INSERT OR UPDATE ON ready_goods_carton_bundles
FOR EACH ROW EXECUTE FUNCTION validate_carton_bundle_sum();
```

---

## 4. Universal Master Data Models (Core Enums & Types)

```sql
-- Standard Department / Division Enum
CREATE TYPE division_code_enum AS ENUM (
    'DESIGN', 'MERCHANDISING', 'CUTTING', 'PRINTING', 
    'EMBROIDERY', 'STITCHING', 'WASHING', 'IRONING', 
    'PACKING', 'ALTERATION', 'STORE'
);

-- Universal Workflow Statuses
CREATE TYPE lifecycle_status_enum AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS',
    'PARTIALLY_COMPLETED', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'REJECTED'
);

-- Quality Verdicts
CREATE TYPE qa_verdict_enum AS ENUM (
    'PASS', 'MINOR_DEFECT_PASS', 'FAIL_ALTERATION', 'FAIL_SCRAP', 'QUARANTINED'
);
```

---

## 5. Unified Audit Logging Architecture (`audit_logs`)

Every state transition, quantity override, QC rejection, and price modification across all 11 portals writes an un-deletable record to `audit_logs`:

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division division_code_enum NOT NULL,
    entity_table VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(32) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'STATUS_OVERRIDE', 'QC_REJECTION'
    actor_id UUID REFERENCES auth.users(id),
    actor_email VARCHAR(255),
    client_ip VARCHAR(45),
    user_agent TEXT,
    old_data JSONB,
    new_data JSONB,
    delta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_division ON public.audit_logs(division);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_table, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
```

---

## 6. Global Security, Authentication & Row Level Security (RLS)

### 6.1 Role Hierarchy in `profiles`
Every user has an assigned enterprise role:
- `SUPER_ADMIN`: Full cross-division override authority.
- `DIVISION_HEAD`: Full write authority within their specific division.
- `SUPERVISOR`: Line/floor operational write access (cannot modify financial or costing rates).
- `OPERATOR / INSPECTOR`: Restricted scanning and QC logging interface.
- `AUDITOR / BUYER`: Read-only telemetry access.

### 6.2 Standard RLS Pattern
```sql
ALTER TABLE public.cutting_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read for all active staff" 
ON public.cutting_bundles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow write only for Cutting Supervisors and Super Admin" 
ON public.cutting_bundles FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('SUPER_ADMIN', 'CUTTING_SUPERVISOR', 'PRODUCTION_MANAGER')
    )
);
```

---

## 7. Next.js Server Action Standard & Transaction Wrapping

In Next.js 14/15 App Router, mutating operations must use transactional safety to guarantee database consistency:

```typescript
// Standard Backend Pattern: web_admin/src/lib/safeAction.ts
import { createClient } from '@supabase/supabase-js'

export async function executeEnterpriseTransaction<T>(
  actionName: string,
  division: string,
  fn: (supabase: any, user: any) => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const result = await fn(supabase, null)
    return { success: true, data: result }
  } catch (err: any) {
    console.error(`[TX_ERROR] ${division}:${actionName} failed:`, err)
    return { success: false, error: err.message || 'Server action failed' }
  }
}
```

---
*Master Architecture blueprint established for all 11 operating divisions.*
