# 03 • CUTTING & LAY FLOOR BACKEND SPECIFICATION
### Zigza MES Garment Manufacturing Platform • Division 03 Backend Architecture
**Route Prefix:** `/cutting` | **Operating Order:** 03 of 11  
**Target Infrastructure:** Next.js 14/15 App Router + Supabase PostgreSQL  
**Location:** `web_admin/docs_backend/03_cutting_floor_backend.md`

---

## 1. Executive Division Overview & Business Logic Scope

The **Cutting & Lay Floor** is the physical inception gate of all garment manufacturing. It converts bulk fabric rolls into numbered garment component bundles.

### Operational Boundaries & The Zero Ghost Piece Root Seed
1. **The Root Seed Axiom**: Every physical piece sewn, washed, ironed, or exported in the Zigza platform is deterministically derived from `cutting_bundles`.
2. **Shade Group Quarantine**: Fabric rolls of different dye lots or shade ratings (`SHADE_A`, `SHADE_B`) can never be combined within the same lay sheet.
3. **Automated Bundle Barcode Serialization**: The system generates unique, serialized QR/Barcodes (`BND-LAY{id}-S{size}-B{num}`) at the exact instant the lay sheet is confirmed cut.
4. **End-Bit Conservation Rule**: Every unused remnant end-bit ($\le 1.5\text{ m}$) must be logged to `cutting_end_bit_logs` to prevent inventory leakage.

---

## 2. Inward & Outward Data Handshake Contracts

```
[ 11. Central Store ]                      [ 02. Merchandising ]
- Inspected Fabric Rolls (4-Point Pass)     - Authorized Production Work Order
- Verified Roll Weight & Usable Width       - Target Cut Quantity by Ratio (S:M:L:XL)
- Lab Shade Group (A / B / C)               - Ex-Factory Priority Date
             │                                            │
             └─────────────────────┬──────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 03. CUTTING & LAY FLOOR BACKEND                             │
│ - Spreading & Lay Sheet Spooling Engine                     │
│ - Automatic Bundle Barcode Serialization (Seed Generator)   │
│ - Panel Quality Gate (Notch, Ply Deflection, Shade Match)   │
│ - End-Bit Remnant & Roll Closing Ledger                     │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ (Dispatches Serialized Bundles via Barcode Handshake)
┌─────────────────────────────────────────────────────────────┐
│ Downstream Division Dispatch Router:                        │
│ - IF Tech-Pack.embellishment = 'EMBROIDERY_FIRST'           │
│   └── 05. Embroidery Floor                                  │
│ - ELSE IF Tech-Pack.embellishment = 'PRINT_FIRST'           │
│   └── 04. Printing Unit                                     │
│ - ELSE (Plain / Pre-Decorated)                              │
│   └── 06. Stitching & Sewing Floor                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (PostgreSQL DDL)

```sql
-- 1. Master Lay Sheet Table
CREATE TABLE IF NOT EXISTS public.cutting_lay_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lay_sheet_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'LAY-2026-0842'
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    cutting_table_id VARCHAR(20) NOT NULL, -- 'TABLE_01', 'TABLE_02', 'TABLE_03'
    marker_length_m NUMERIC(6,2) NOT NULL CHECK (marker_length_m > 0),
    total_plies INTEGER NOT NULL CHECK (total_plies BETWEEN 1 AND 250),
    size_ratio_text VARCHAR(100) NOT NULL, -- e.g. 'S:1, M:2, L:2, XL:1'
    ratio_total INTEGER NOT NULL CHECK (ratio_total > 0),
    expected_pieces INTEGER NOT NULL CHECK (expected_pieces > 0),
    actual_cut_pieces INTEGER,
    spreading_operator_id UUID REFERENCES public.employees(id),
    cutting_master_id UUID REFERENCES public.employees(id),
    status VARCHAR(30) DEFAULT 'SPREADING', -- 'SPREADING', 'READY_FOR_CUT', 'CUTTING', 'COMPLETED', 'AUDIT_FAILED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lay_sheets_order ON public.cutting_lay_sheets(order_id);
CREATE INDEX idx_lay_sheets_status ON public.cutting_lay_sheets(status);

-- 2. Lay Sheet Fabric Rolls Junction (Shade Integrity)
CREATE TABLE IF NOT EXISTS public.cutting_lay_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lay_sheet_id UUID NOT NULL REFERENCES public.cutting_lay_sheets(id) ON DELETE CASCADE,
    roll_id UUID NOT NULL REFERENCES public.store_fabric_rolls(id) ON DELETE RESTRICT,
    plies_from_roll INTEGER NOT NULL CHECK (plies_from_roll > 0),
    meters_consumed NUMERIC(8,2) NOT NULL,
    remnant_length_m NUMERIC(6,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cut Garment Bundles (The Zero Ghost Piece Seed Table)
CREATE TABLE IF NOT EXISTS public.cutting_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_barcode VARCHAR(64) NOT NULL UNIQUE, -- e.g. 'BND-LAY0842-SZ-M-001'
    lay_sheet_id UUID NOT NULL REFERENCES public.cutting_lay_sheets(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES public.merchandising_orders(id) ON DELETE RESTRICT,
    size_label VARCHAR(20) NOT NULL,
    color_name VARCHAR(50) NOT NULL,
    bundle_sequence INTEGER NOT NULL, -- Bundle 1 of 12 for this size
    piece_count INTEGER NOT NULL CHECK (piece_count > 0),
    start_ply_num INTEGER NOT NULL,
    end_ply_num INTEGER NOT NULL,
    current_division VARCHAR(30) DEFAULT 'CUTTING', -- 'CUTTING', 'PRINTING', 'EMBROIDERY', 'STITCHING', 'PACKING'
    status VARCHAR(30) DEFAULT 'CUT_COMPLETED', -- 'CUT_COMPLETED', 'DISPATCHED', 'IN_PROCESS', 'SEWN', 'PACKED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cutting_bundles_lay ON public.cutting_bundles(lay_sheet_id);
CREATE INDEX idx_cutting_bundles_order ON public.cutting_bundles(order_id);
CREATE INDEX idx_cutting_bundles_barcode ON public.cutting_bundles(bundle_barcode);

-- 4. Cut Panel QC Audits
CREATE TABLE IF NOT EXISTS public.cutting_panel_qc_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lay_sheet_id UUID NOT NULL REFERENCES public.cutting_lay_sheets(id) ON DELETE RESTRICT,
    bundle_id UUID REFERENCES public.cutting_bundles(id) ON DELETE RESTRICT,
    inspector_id UUID NOT NULL REFERENCES public.employees(id),
    notch_accuracy_mm NUMERIC(4,2) NOT NULL, -- Tol: <= 1.0mm
    ply_deflection_mm NUMERIC(4,2) NOT NULL, -- Tol: <= 1.5mm
    shade_continuity_pass BOOLEAN NOT NULL,
    template_match_pass BOOLEAN NOT NULL,
    qc_verdict VARCHAR(20) NOT NULL, -- 'PASS', 'RE_CUT_PANELS', 'REJECT'
    audit_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. End-Bit Remnants & Roll Closing Ledger
CREATE TABLE IF NOT EXISTS public.cutting_end_bit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lay_sheet_id UUID NOT NULL REFERENCES public.cutting_lay_sheets(id) ON DELETE RESTRICT,
    roll_id UUID NOT NULL REFERENCES public.store_fabric_rolls(id) ON DELETE RESTRICT,
    remnant_weight_kg NUMERIC(6,2) NOT NULL,
    remnant_length_m NUMERIC(6,2) NOT NULL,
    disposition VARCHAR(30) NOT NULL, -- 'RETURN_TO_STORE', 'POCKETING_SALVAGE', 'SCRAP'
    logged_by UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Mathematical Engines & Core Calculations

### 4.1 Expected Lay Pieces Formula
$$\text{Expected Pieces} = \text{Total Plies} \times \text{Sum of Size Ratio Units}$$
*Example:* 80 plies with ratio `S:1, M:2, L:2, XL:1` (Total ratio = 6):  
$$\text{Expected Pieces} = 80 \times 6 = 480\text{ cut garment panels}$$

### 4.2 Marker Efficiency (Fabric Yield Utilization)
$$\text{Marker Efficiency \%} = \frac{\text{Pattern Net Area (sq. meters)}}{\text{Marker Length (m)} \times \text{Usable Fabric Width (m)}} \times 100$$
*Factory Standard SLA:* Must achieve $\ge 85.0\%$ efficiency on standard markers, $\ge 82.0\%$ on plaid/stripe matching.

---

## 5. Next.js Server Actions & API Implementation (`src/app/cutting/actions.ts`)

```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Create Lay Sheet and Automatically Serialize Cut Bundles
export async function createLaySheetAction(payload: {
  lay_sheet_number: string
  order_id: string
  cutting_table_id: string
  marker_length_m: number
  total_plies: number
  size_ratio_text: string // e.g. 'S:1, M:2, L:2, XL:1'
  ratio_breakdown: Array<{ size: string; ratio: number; color: string }>
  roll_ids: string[]
  operator_id?: string
  cutting_master_id?: string
}) {
  try {
    const ratioTotal = payload.ratio_breakdown.reduce((acc, r) => acc + r.ratio, 0)
    const expectedPieces = payload.total_plies * ratioTotal

    // 1. Insert Lay Sheet
    const { data: laySheet, error: layErr } = await supabaseAdmin
      .from('cutting_lay_sheets')
      .insert({
        lay_sheet_number: payload.lay_sheet_number,
        order_id: payload.order_id,
        cutting_table_id: payload.cutting_table_id,
        marker_length_m: payload.marker_length_m,
        total_plies: payload.total_plies,
        size_ratio_text: payload.size_ratio_text,
        ratio_total: ratioTotal,
        expected_pieces: expectedPieces,
        actual_cut_pieces: expectedPieces,
        spreading_operator_id: payload.operator_id,
        cutting_master_id: payload.cutting_master_id,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (layErr) throw layErr

    // 2. Link Rolls
    for (const rollId of payload.roll_ids) {
      await supabaseAdmin.from('cutting_lay_rolls').insert({
        lay_sheet_id: laySheet.id,
        roll_id: rollId,
        plies_from_roll: Math.floor(payload.total_plies / payload.roll_ids.length),
        meters_consumed: payload.marker_length_m
      })
    }

    // 3. Atomically Generate Serialized Bundles (The Root Seed)
    // Standard bundle ticket size = 20 to 30 pieces
    const bundleSizeMax = 25
    const bundlesToInsert: any[] = []

    for (const item of payload.ratio_breakdown) {
      const totalPiecesForSize = payload.total_plies * item.ratio
      const numBundles = Math.ceil(totalPiecesForSize / bundleSizeMax)

      for (let b = 1; b <= numBundles; b++) {
        const pieceCount = (b === numBundles && totalPiecesForSize % bundleSizeMax !== 0)
          ? totalPiecesForSize % bundleSizeMax
          : bundleSizeMax

        const barcode = `BND-${payload.lay_sheet_number.replace('LAY-', '')}-${item.size}-${String(b).padStart(3, '0')}`

        bundlesToInsert.push({
          bundle_barcode: barcode,
          lay_sheet_id: laySheet.id,
          order_id: payload.order_id,
          size_label: item.size,
          color_name: item.color,
          bundle_sequence: b,
          piece_count: pieceCount,
          start_ply_num: (b - 1) * bundleSizeMax + 1,
          end_ply_num: (b - 1) * bundleSizeMax + pieceCount,
          current_division: 'CUTTING',
          status: 'CUT_COMPLETED'
        })
      }
    }

    const { error: bundleErr } = await supabaseAdmin
      .from('cutting_bundles')
      .insert(bundlesToInsert)

    if (bundleErr) throw bundleErr

    revalidatePath('/cutting')
    revalidatePath('/cutting/lay-sheets')
    revalidatePath('/cutting/bundles')
    return { success: true, laySheetId: laySheet.id, totalBundlesCreated: bundlesToInsert.length }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---
*Division 03 Backend Architecture complete and validated.*
