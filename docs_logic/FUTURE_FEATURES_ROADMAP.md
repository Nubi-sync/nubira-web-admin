# Zigza ERP / MES — Future Features & Enhancements Roadmap

## 1. Mending & Sewing Handover Discrepancy Engine

### 1.1 Overview & Ground Industrial Problem
In garment export manufacturing, when bundles/lots are handed over from the Sewing Line (Lineman) to Mending / Checking tables, piece count discrepancies often occur. 
If an incomplete lot (shortage) is allowed to move forward to Washing or Finishing:
- **Shade & Washing Tone Variations**: Pieces washed separately at different times suffer color and chemical wash tone mismatches.
- **Carton Breakdown Mess**: Final carton packing and export buyer ratios (XS/S/M/L/XL) fail due to missing units.
- **Custody & Accountability Confusion**: Mending supervisors get blamed for missing pieces that were lost on the sewing line.

---

### 1.2 Proposed Architecture & Business Logic

#### A. Fast Swipe vs. Discrepancy Input
1. **Swipe-to-Verify (Fast Flow)**:
   - If physical count on table exactly matches dispatched quantity (e.g., 84/84 pcs), supervisor swipes right.
   - Immediate **100% Custody Transfer** accepted.
2. **Tap-to-Count (Discrepancy Flow)**:
   - If physical count is short (e.g., 80 found out of 84), supervisor taps the card and enters `80`.
   - System calculates: `Shortage: -4 pcs`.
   - Card displays: `⚠️ SHORTAGE (-4 pcs) • Lineman Alerted`.

#### B. Strict Lot Gatekeeper (Auto-Hold on Shortage)
- **Hard Block Rule**: A lot with a pending shortage is automatically placed in **`HOLD / SHORTAGE_LOCKED`** state.
- **Action Disabled**: The `"Forward to Washing / Finishing"` action button is disabled/greyed out until the lot count is balanced (84/84) or formally resolved.

#### C. Lineman Discrepancy Alert & Resolution Loop
1. **Real-time Push / Dashboard Alert**:
   - Lineman receives: `⚠️ Shortage Alert: Lot #<ID> (Color: <Color>, Size: <Size>) reported short by -4 pcs at Mending Table.`
2. **Resolution Options**:
   - **Found on Line**: Lineman brings remaining 4 pieces -> Mending supervisor enters balance -> Total hits 84/84 -> **Auto-Unlocked**.
   - **Audit / Re-count**: Lineman visits Mending table for joint physical recount.
   - **Damaged / Cut Panel Loss**: Lineman marks piece as damaged -> Triggers re-cut request to Cutting department.

#### D. Floor Manager Emergency Override
- If missing pieces cannot be found and production cannot wait:
  - Floor Manager / Production In-charge can use PIN/Approval to execute:
    - `"Force Close Shortage & Release Lot"` with mandatory reason logging (e.g., `Cut Damage / Lost on Floor`).
  - Lot moves forward with revised base count (80 pcs) and an audit discrepancy log attached.

---

### 1.3 Database & Telemetry Plan (Supabase)
- **Table**: `mes_line_handover_discrepancies`
  - `id` (UUID)
  - `lot_id` (FK to production lot)
  - `dispatched_qty` (int)
  - `received_qty` (int)
  - `shortage_qty` (int)
  - `status` (`PENDING_RESOLUTION`, `RESOLVED_MATCH`, `FORCE_CLOSED`)
  - `flagged_by` (Mending Supervisor UUID)
  - `assigned_lineman_id` (Lineman UUID)
  - `resolved_by` (Manager UUID for overrides)
  - `resolution_reason` (Text)
  - `created_at`, `resolved_at` (Timestamps)
