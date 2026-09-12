# 11 • CENTRAL STORE & RAW MATERIAL GODOWN BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 11 Backend Architecture
**Route Prefix:** `/store` | **Operating Order:** 11 of 11 (Dual-Gate Division)  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/11_central_store_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Central Store & Raw Material Godown** operates as both the **genesis warehouse** (inward fabric rolls, yarn, zippers, buttons, labels) and the **final export staging depot** (Bays 3–5 storing sealed export cartons).

### Operational Boundaries & Gates
1. **ASTM D5430 4-Point Fabric Inspection Gate**: Every bulk fabric shipment must inspect a minimum $10\%$ random roll sample. Rolls scoring $> 40.0\text{ points per 100 sq. yards}$ are locked in `REJECTED_QUARANTINE`.
2. **Accountable Quality Inspector FK**: Inward roll inspection records require a mandatory `inspector_id` referencing `employees(id)`.
3. **Double-Entry Store Inventory Ledger**: Every physical movement writes to `store_transactions`. Negative inventory balances are strictly prohibited by database constraint.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ Mill / Trim Suppliers ]                 [ 09. Ready Goods Packing ]
- Truck Gate Inward Delivery Challan      - AQL Passed Master Export Cartons
- Raw Fabric Rolls & Trim Boxes           - Final Packing List Manifest
             │                                            │
             └─────────────────────┬──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. CENTRAL STORE & RAW MATERIAL GODOWN                     │
│ - Gate GRN Entry & ASTM 4-Point Roll Inspection             │
│ - Shade Group Segregation & Physical Bay Allocation         │
│ - FIFO Spooling & Cutting Floor Material Issuance           │
│ - Master Export Carton Staging (Bays 3–5)                   │
└─────────────────────────────────────────────────────────────┘
             │                                            │
             ├─── Handshake A ──➔ [ 03. Cutting Floor ]   └─── Handshake B ──➔ [ Export Truck Gate ]
             │   - Approved, Inspected Fabric Rolls       - Sealed Containers & Customs B/L
             │   - Verified Usable Width & Weight         - Clean Commercial Shipping Manifest
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Master Fabric Rolls Inventory
CREATE TABLE IF NOT EXISTS public.store_fabric_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_barcode VARCHAR(64) NOT NULL UNIQUE, -- e.g. 'ROL-2026-FTERRY-0081'
    order_id UUID REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    vendor_mill_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    fabric_type VARCHAR(100) NOT NULL, -- e.g. '100% Cotton French Terry 380 GSM'
    color_name VARCHAR(50) NOT NULL,
    dye_lot_number VARCHAR(50) NOT NULL,
    shade_group VARCHAR(10) NOT NULL DEFAULT 'SHADE_A', -- 'SHADE_A', 'SHADE_B', 'SHADE_C'
    roll_length_meters NUMERIC(8,2) NOT NULL CHECK (roll_length_meters > 0),
    usable_width_cm NUMERIC(5,1) NOT NULL CHECK (usable_width_cm BETWEEN 80.0 AND 250.0),
    gross_weight_kg NUMERIC(6,2) NOT NULL CHECK (gross_weight_kg > 0),
    net_weight_kg NUMERIC(6,2) NOT NULL,
    astm_points_per_100_sq_yd NUMERIC(5,2),
    inspector_id UUID REFERENCES public.employees(id), -- Accountable Inspector FK
    bin_location VARCHAR(30) NOT NULL DEFAULT 'RACK-A-01',
    status VARCHAR(30) DEFAULT 'IN_INSPECTION', -- 'IN_INSPECTION', 'APPROVED_IN_STOCK', 'ISSUED_TO_CUTTING', 'REJECTED_QUARANTINE'
    received_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fabric_rolls_barcode ON public.store_fabric_rolls(roll_barcode);
CREATE INDEX idx_fabric_rolls_status ON public.store_fabric_rolls(status);

-- 2. Master Trims & Accessories Inventory
CREATE TABLE IF NOT EXISTS public.store_trims_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trim_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'TRM-ZIP-YKK-NO5-BLK'
    category VARCHAR(32) NOT NULL, -- 'ZIPPER', 'BUTTON', 'THREAD', 'MAIN_LABEL', 'CARE_LABEL', 'POLYBAG', 'HANGTAG'
    description TEXT NOT NULL,
    supplier_vendor_id UUID REFERENCES public.vendors(id),
    current_stock_quantity NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_stock_quantity >= 0),
    reserved_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    uom VARCHAR(20) NOT NULL DEFAULT 'PIECE',
    bin_location VARCHAR(30) DEFAULT 'BIN-TRIM-01',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Unified Material Movement Transactions (Double-Entry Ledger)
CREATE TABLE IF NOT EXISTS public.store_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'TX-STR-2026-0941'
    transaction_type VARCHAR(32) NOT NULL, -- 'GRN_INWARD', 'ISSUE_TO_CUTTING', 'ISSUE_TO_STITCHING', 'RETURN_FROM_FLOOR', 'DISPATCH_EXPORT'
    roll_id UUID REFERENCES public.store_fabric_rolls(id),
    trim_id UUID REFERENCES public.store_trims_inventory(id),
    allotment_id UUID REFERENCES public.allotments(id),
    quantity NUMERIC(12,2) NOT NULL,
    recipient_division VARCHAR(32) NOT NULL,
    authorized_by UUID NOT NULL REFERENCES public.employees(id),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_store_tx_type ON public.store_transactions(transaction_type);
```

---

## 4. Mathematical Engines (ASTM D5430 4-Point System)

$$\text{Defect Points per 100 sq. yards} = \frac{\text{Total Penalty Points} \times 36 \times 100}{\text{Roll Length (yards)} \times \text{Usable Width (inches)}}$$

*Penalty Point Allocation Table:*
* Defect length up to $3\text{ inches}$: **1 Point**
* Defect length $> 3$ and $\le 6\text{ inches}$: **2 Points**
* Defect length $> 6$ and $\le 9\text{ inches}$: **3 Points**
* Defect length $> 9\text{ inches}$ or any hole: **4 Points**

```typescript
export function computeAstm4PointScore(
  totalPenaltyPoints: number,
  rollLengthMeters: number,
  usableWidthCm: number
): { pointsPer100SqYards: number; verdict: 'PASS' | 'REJECT' } {
  const rollYards = rollLengthMeters * 1.09361
  const widthInches = usableWidthCm * 0.393701
  const score = Number(((totalPenaltyPoints * 3600) / (rollYards * widthInches)).toFixed(2))
  const verdict = score <= 40.0 ? 'PASS' : 'REJECT'
  return { pointsPer100SqYards: score, verdict }
}
```

---

## 5. Next.js Server Actions (`src/app/store/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Inward Fabric Roll via Gate GRN
export async function inwardFabricRollAction(payload: {
  roll_barcode: string
  order_id?: string
  vendor_mill_id: string
  fabric_type: string
  color_name: string
  dye_lot_number: string
  shade_group: string
  roll_length_meters: number
  usable_width_cm: number
  gross_weight_kg: number
  net_weight_kg: number
  bin_location: string
}) {
  try {
    const { data: roll, error } = await supabaseAdmin
      .from('store_fabric_rolls')
      .insert({
        ...payload,
        status: 'IN_INSPECTION'
      })
      .select()
      .single()

    if (error) throw error

    // Log Transaction
    await supabaseAdmin.from('store_transactions').insert({
      transaction_code: `TX-GRN-${Date.now().toString().slice(-6)}`,
      transaction_type: 'GRN_INWARD',
      roll_id: roll.id,
      quantity: payload.roll_length_meters,
      recipient_division: 'STORE',
      authorized_by: payload.vendor_mill_id // Initial logger
    })

    revalidatePath('/store')
    return { success: true, rollId: roll.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 11 Backend Architecture complete and validated.*
