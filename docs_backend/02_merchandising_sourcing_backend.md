# 02 • MERCHANDISING & SOURCING DESK BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 02 Backend Architecture
**Route Prefix:** `/merchandising` | **Operating Order:** 02 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/02_merchandising_sourcing_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Merchandising & Sourcing Desk** governs commercial contracts, Bill of Materials (BOM) cost budgets, Critical Path Time & Action (T&A) milestones, bulk fabric/trim procurement requisitions, and international export container logistics.

### Operational Boundaries & Gates
1. **Commercial Contract Gate**: Every production run must be anchored to a confirmed Buyer Purchase Order (`merchandising_orders`).
2. **Double-Entry BOM Costing Ledger**: Compares approved pre-costing estimates against actual post-costing factory ledger entries. BOM cost variance must not exceed $\pm 1.5\%$.
3. **Critical Path T&A Automation**: An 8-stage automated milestone schedule (Lab Dip, Fabric Inward, Fit PPS, Cutting Start, Sewing Complete, Washing, AQL Audit, Ex-Factory) is generated automatically upon PO confirmation.
4. **Export Handshake Gate**: No shipment container can be sealed without linking to passed AQL audit cartons from Division 09.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 01. Design Studio ]                      [ Commercial Buyer Contract ]
- Approved Tech-Pack ID                     - Buyer PO Number & Currency
- Fabric Consumption Yield per Piece        - Delivery Date & Incoterms (FOB/CIF)
- Embellishment Sequence Directive          - Quantity Breakdown (Size × Color Ratio)
             │                                            │
             └─────────────────────┬──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 02. MERCHANDISING & SOURCING DESK                           │
│ - Lock Planned vs Actual BOM Costing                        │
│ - Auto-Generate Dynamic 8-Gate T&A Critical Calendar        │
│ - Issue Purchase Requisitions (PR) for Fabric & Trims       │
│ - Book Export Ocean Containers & Bill of Lading (B/L)       │
└─────────────────────────────────────────────────────────────┘
             │                                            │
             ├─── Handshake A ──➔ [ 11. Central Store ]   ├─── Handshake B ──➔ [ 03. Cutting & 06. Sewing ]
             │   - Purchase Requisition (PR)              │   - Authorized Work Order
             │   - Approved Vendor & Mill Details         │   - Confirmed Cut Quantities by Ratio
             │   - Fabric Meterage & Accessory BOM        │   - Target Piece-Rate Stitching Budget
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Buyer Purchase Orders (Master Commercial Contract)
CREATE TABLE IF NOT EXISTS public.merchandising_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'PO-ZIG-8901'
    buyer_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
    tech_pack_id UUID NOT NULL REFERENCES public.design_tech_packs(id) ON DELETE RESTRICT,
    season VARCHAR(32) NOT NULL, -- 'SS27', 'AW27'
    total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
    fob_price_per_piece NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    order_date DATE DEFAULT CURRENT_DATE,
    ex_factory_date DATE NOT NULL,
    incoterm VARCHAR(10) DEFAULT 'FOB', -- 'FOB', 'CIF', 'EXW', 'DDP'
    status VARCHAR(32) DEFAULT 'PENDING_COSTING', -- 'PENDING_COSTING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'CANCELLED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merch_orders_buyer ON public.merchandising_orders(buyer_id);
CREATE INDEX idx_merch_orders_status ON public.merchandising_orders(status);

-- 2. Size & Color Breakdown Ratio
CREATE TABLE IF NOT EXISTS public.merchandising_order_ratios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE CASCADE,
    color_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(30), -- Pantone / Hex
    size_label VARCHAR(20) NOT NULL, -- 'S', 'M', 'L', 'XL'
    ratio_units INTEGER NOT NULL DEFAULT 1,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE(order_id, color_name, size_label)
);

CREATE INDEX idx_order_ratios_order ON public.merchandising_order_ratios(order_id);

-- 3. Bill of Materials (BOM) Costing Ledger
CREATE TABLE IF NOT EXISTS public.merchandising_bom_costings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE CASCADE,
    item_category VARCHAR(32) NOT NULL, -- 'SHELL_FABRIC', 'RIB_KNIT', 'SEWING_THREAD', 'ZIPPER', 'BUTTONS', 'LABELS', 'PACKAGING'
    item_name VARCHAR(128) NOT NULL,
    supplier_vendor_id UUID REFERENCES public.vendors(id),
    consumption_per_pc NUMERIC(8,4) NOT NULL, -- e.g. 1.3500 kg or 6.0000 pcs
    unit_of_measure VARCHAR(20) NOT NULL, -- 'KG', 'METER', 'PIECE', 'CONE', 'GROSS'
    planned_rate_per_unit NUMERIC(10,2) NOT NULL,
    planned_cost_per_pc NUMERIC(10,2) NOT NULL,
    actual_cost_per_pc NUMERIC(10,2),
    variance_amount NUMERIC(10,2) GENERATED ALWAYS AS (actual_cost_per_pc - planned_cost_per_pc) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bom_costing_order ON public.merchandising_bom_costings(order_id);

-- 4. Dynamic Time & Action (T&A) Milestones
CREATE TABLE IF NOT EXISTS public.merchandising_tna_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE CASCADE,
    gate_name VARCHAR(64) NOT NULL, -- 'LAB_DIP_APPROVAL', 'FABRIC_INWARD', 'PPS_APPROVAL', 'CUTTING_START', 'SEWING_COMPLETE', 'WASHING_COMPLETE', 'FINAL_AQL_AUDIT', 'EX_FACTORY'
    target_date DATE NOT NULL,
    actual_date DATE,
    lead_time_days INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ON_TRACK', 'DELAYED', 'COMPLETED'
    responsible_role VARCHAR(32) NOT NULL,
    delay_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tna_order ON public.merchandising_tna_milestones(order_id);

-- 5. Sourcing Purchase Requisitions (PR)
CREATE TABLE IF NOT EXISTS public.merchandising_sourcing_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'PR-2026-041'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    category VARCHAR(32) NOT NULL, -- 'FABRIC', 'TRIMS', 'YARN', 'CARTONS'
    required_quantity NUMERIC(12,2) NOT NULL,
    uom VARCHAR(20) NOT NULL,
    required_in_house_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'PO_ISSUED', 'RECEIVED_STORE'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Export Shipments & Container Pipeline
CREATE TABLE IF NOT EXISTS public.merchandising_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_ref VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'SHP-ZIG-2026-09'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    container_number VARCHAR(30), -- e.g. 'MSKU-892182-1'
    container_type VARCHAR(20) DEFAULT '40_HIGH_CUBE', -- '20_STANDARD', '40_STANDARD', '40_HIGH_CUBE'
    forwarder_name VARCHAR(100) NOT NULL,
    bill_of_lading_no VARCHAR(50),
    total_cartons INTEGER NOT NULL CHECK (total_cartons > 0),
    total_gross_weight_kg NUMERIC(10,2) NOT NULL,
    total_cbm NUMERIC(8,3) NOT NULL,
    port_of_loading VARCHAR(50) DEFAULT 'JNPT Mumbai',
    port_of_discharge VARCHAR(50) NOT NULL,
    etd_date DATE NOT NULL,
    eta_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'BOOKED', -- 'BOOKED', 'CONTAINER_STUFFED', 'CUSTOMS_CLEARED', 'ON_VESSEL', 'DELIVERED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_order ON public.merchandising_shipments(order_id);
```

---

## 4. Mathematical Engines & Financial Formulas

### 4.1 Total BOM Garment Cost & Gross Margin Formula
$$\text{Total Garment Cost} = \sum (\text{BOM Item Costs}) + \text{CM Rate (Cut \& Make)} + \text{Washing / Print / Embroidery Cost} + \text{Packaging}$$
$$\text{Gross Profit Margin \%} = \frac{\text{FOB Price} - \text{Total Garment Cost}}{\text{FOB Price}} \times 100$$

```typescript
export function computeGarmentEconomics(
  fobPrice: number,
  bomItems: Array<{ planned_cost_per_pc: number }>,
  cmRate: number,
  embellishmentRate: number
) {
  const totalBomCost = bomItems.reduce((acc, item) => acc + item.planned_cost_per_pc, 0)
  const totalCost = Number((totalBomCost + cmRate + embellishmentRate).toFixed(2))
  const profitMarginPercent = Number((((fobPrice - totalCost) / fobPrice) * 100).toFixed(2))
  return { totalCost, profitMarginPercent }
}
```

### 4.2 Ocean Container CBM Volumetric Calculator
$$\text{Carton Volume (CBM)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{1,000,000}$$
$$\text{Total Shipment CBM} = \text{Carton Volume} \times \text{Total Cartons}$$

*Container Capacities:*  
* `20ft Standard`: $28.0\text{ CBM}$ (Max Safe: $26.0\text{ CBM}$)  
* `40ft Standard`: $58.0\text{ CBM}$ (Max Safe: $55.0\text{ CBM}$)  
* `40ft High Cube`: $68.0\text{ CBM}$ (Max Safe: $64.0\text{ CBM}$)

---

## 5. Next.js Server Actions & API Implementation (`src/app/merchandising/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Create Buyer Order and Automatically Generate 8-Gate T&A Calendar
export async function createBuyerOrderAction(payload: {
  order_number: string
  buyer_id: string
  tech_pack_id: string
  season: string
  total_quantity: number
  fob_price_per_piece: number
  currency: string
  ex_factory_date: string
  incoterm: string
  ratios: Array<{ color_name: string; color_code?: string; size_label: string; ratio_units: number; quantity: number }>
}) {
  try {
    // 1. Insert Order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('merchandising_orders')
      .insert({
        order_number: payload.order_number,
        buyer_id: payload.buyer_id,
        tech_pack_id: payload.tech_pack_id,
        season: payload.season,
        total_quantity: payload.total_quantity,
        fob_price_per_piece: payload.fob_price_per_piece,
        currency: payload.currency,
        ex_factory_date: payload.ex_factory_date,
        incoterm: payload.incoterm,
        status: 'CONFIRMED'
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    // 2. Insert Ratios
    const ratioInserts = payload.ratios.map(r => ({
      order_id: order.id,
      color_name: r.color_name,
      color_code: r.color_code,
      size_label: r.size_label,
      ratio_units: r.ratio_units,
      quantity: r.quantity
    }))

    const { error: ratioErr } = await supabaseAdmin
      .from('merchandising_order_ratios')
      .insert(ratioInserts)

    if (ratioErr) throw ratioErr

    // 3. Auto-Generate Dynamic 8-Gate T&A Milestones Backwards from Ex-Factory
    const exFactory = new Date(payload.ex_factory_date)
    const gates = [
      { name: 'EX_FACTORY', offsetDays: 0, role: 'EXPORT_COORDINATOR' },
      { name: 'FINAL_AQL_AUDIT', offsetDays: 4, role: 'QA_MANAGER' },
      { name: 'WASHING_COMPLETE', offsetDays: 9, role: 'WASHING_SUPERVISOR' },
      { name: 'SEWING_COMPLETE', offsetDays: 14, role: 'STITCHING_HEAD' },
      { name: 'CUTTING_START', offsetDays: 24, role: 'CUTTING_MASTER' },
      { name: 'PPS_APPROVAL', offsetDays: 28, role: 'DESIGN_STUDIO' },
      { name: 'FABRIC_INWARD', offsetDays: 35, role: 'STORE_HEAD' },
      { name: 'LAB_DIP_APPROVAL', offsetDays: 45, role: 'MERCHANDISER' }
    ]

    const milestoneInserts = gates.map(g => {
      const targetDate = new Date(exFactory)
      targetDate.setDate(targetDate.getDate() - g.offsetDays)
      return {
        order_id: order.id,
        gate_name: g.name,
        target_date: targetDate.toISOString().split('T')[0],
        lead_time_days: g.offsetDays,
        responsible_role: g.role,
        status: 'ON_TRACK'
      }
    })

    const { error: tnaErr } = await supabaseAdmin
      .from('merchandising_tna_milestones')
      .insert(milestoneInserts)

    if (tnaErr) throw tnaErr

    revalidatePath('/merchandising')
    revalidatePath('/merchandising/orders')
    revalidatePath('/merchandising/tna-calendar')
    return { success: true, orderId: order.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 02 Backend Architecture complete and validated.*
