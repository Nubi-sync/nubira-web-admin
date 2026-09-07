# Brand & Multi-Vendor Management Architecture Proposal
### Nubira Creation / Zigza MES Garment Manufacturing Platform

---

## 1. Executive Summary

In apparel and garment manufacturing ERP systems (such as SAP Apparel, FastReact, and WFX), operations are structured hierarchically:
- A **Brand / Principal Buyer** (e.g. `OLLYPOP`, `FIRST SMILE`) provides bulk order requirements, design specifications, and brand packaging.
- Under each Brand, the factory manages multiple **Vendors / Job-Workers / Suppliers** (e.g., Fabric Mills, Stitching Units, Printing Houses, Trims Suppliers).

This document outlines how the **Brand + Vendor hierarchy** will operate seamlessly across all Web Admin modules, Mobile MES Apps, and the PostgreSQL database within the Nubira Creation / Zigza ecosystem.

---

## 2. Core Hierarchy: Brand vs Vendor

```
[ BRAND / PRINCIPAL BUYER ] (e.g. OLLYPOP, FIRST SMILE)
   │
   ├── [ VENDOR 01 (Stitching Unit) ] ─── Job Challan #101 (2,500 pcs) ──➔ Linemen / Stitching
   │
   ├── [ VENDOR 02 (Stitching Unit) ] ─── Job Challan #102 (3,000 pcs) ──➔ Linemen / Stitching
   │
   ├── [ VENDOR 03 (Processing Unit) ] ── Screen / Rotary Printing Lots ──➔ Printing Master
   │
   └── [ VENDOR 04 (Fabric Supplier) ] ── Raw Fabric Inward (GRN) ────────➔ Store Godown
```

| Entity | Role in Factory System | Real-World Example |
| :--- | :--- | :--- |
| **Brand (मूल बायर / पार्टी)** | Jiska kapda/design hai aur jisko final finished goods dispatch hone hain. | `OLLYPOP`, `FIRST SMILE`, `LAZY BONES` |
| **Vendor (सप्लायर / जॉब-वर्कर)** | Wo supplier jo kapda/trims supply karta hai YA wo external/contract unit jo cutting ke baad pieces stitch karke deta hai. | `Shanti Garments (Unit-01)`, `Star Apparel (Unit-02)`, `Vardhman Fabrics` |
| **Delivery Challan** | Production order jo specific Brand aur uske specific Vendor ke naam par issue hota hai. | `JOB-457 (Brand: OLLYPOP | Vendor: Shanti Garments | 2,400 pcs)` |

---

## 3. The 3 Primary Real-World Use Cases of Vendors

### Use Case 1: Raw Material Supplier (Inward / GRN)
* **Screen**: `Store Dashboard ➔ Truck Inwards (GRN)`
* **Workflow**:
  - Brand is `OLLYPOP` (the design/party for which goods will be made).
  - Material Supplier is `Vardhman Fabrics` (Fabric) or `Royal Trims` (Threads/Tags).
  - Store Manager records: `Brand: OLLYPOP | Vendor: Vardhman Fabrics | 50 Rolls`.
  - **Benefit**: Real-time record of which vendor supplied raw material for which brand's production run.

### Use Case 2: Cutting & Stitching Job-Worker Allocation
* **Screen**: `Production Orders & Allotments ➔ Challan Creation & Excel Import`
* **Workflow**:
  - Factory cuts 10,000 pieces for Brand `OLLYPOP`.
  - Admin allots the cutting lots across 3 different stitching vendors:
    - 3,000 pcs ➔ `Vendor 1: Shanti Garments`
    - 4,000 pcs ➔ `Vendor 2: Star Apparel`
    - 3,000 pcs ➔ `Vendor 3: RK Unit`
  - Store Manager issues BOM packages (fabric + thread + labels) specifically to each assigned vendor.
  - **Benefit**: Complete operational tracking of which vendor holds which cut lot.

### Use Case 3: Finished Goods Receiving, Shortage Audit & Payout
* **Screen**: `Store Receiving & Billing Reports`
* **Workflow**:
  - `Vendor 1 (Shanti Garments)` was issued 3,000 cut pieces.
  - They return 2,950 stitched pieces (50 pieces short).
  - **Shortage Tracking**: System highlights: `50 Pieces Shortage tagged to Vendor: Shanti Garments`.
  - **Automated Payout**: System calculates vendor payment strictly on QC Passed pieces:
    $$\text{Vendor Payout} = \text{QC Passed Pcs } (2,950) \times \text{Stitching Rate } (₹20) = ₹59,000$$
  - **Benefit**: Zero financial leakage; factory pays only for verified, top-quality output.

---

## 4. Module-by-Module Integration in Nubira Software

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NUBIRA CREATION / ZIGZA MES ECOSYSTEM                 │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│ WEB ADMIN MODULES            │ MOBILE MES APPS              │ DATABASE      │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • /production-orders         │ • Store Incharge App         │ • challans    │
│ • /inventory                 │ • Lineman Stitching App      │ • vendors     │
│ • /dispatch                  │ • QC Inspector App           │ • allotments  │
│ • /reports                   │ • Mending Operator App       │ • store_tx    │
│ • /dashboard                 │ • Dispatch Manager App       │ • qc_logs     │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

---

### Module 1: Delivery Challan Hub & Excel Import (`/production-orders`)
1. **Dual-Tier Hierarchy Filters**:
   - Selecting `Brand: OLLYPOP` instantly filters the Vendor dropdown to show only Ollypop's registered vendors (`Unit-01 Shanti`, `Unit-02 Star`, etc.).
2. **Excel Bulk Import Auto-Mapping**:
   - Uploading a master Excel sheet with 200–500 challans automatically matches the `VENDOR` / `UNIT` column and assigns challans directly to the respective vendor.
3. **Challan Card Visual Badging**:
   - Every challan displays dual badges: `Brand: OLLYPOP` and `Vendor: Shanti Garments`.

---

### Module 2: Store & Godown Inventory (`/inventory` & Store Mobile App)
Store operations follow a clean, structured 3-step physical flow:

```
[ Step 1: Raw Material Inward ] ──➔ Company se kapda / accessories aayi, Inward kiya.
[ Step 2: BOM Handover ]        ──➔ Admin ke order ke hisaab se dhaga, label, fabric floor ko diya.
[ Step 3: Piece Lena & Dena ]   ──➔ QC passed ready pieces godown me liye aur Dispatch me diye.
```

1. **Step 1: Raw Material Inward (Truck Inwards / GRN)**:
   - Store Manager logs incoming trucks, tagging both `Brand: OLLYPOP` and `Supplier/Vendor: Vardhman Fabrics`.
2. **Step 2: BOM Material Handover**:
   - Store Manager receives a notification for `Challan #457 (Brand: OLLYPOP | Vendor: Shanti Garments)`.
   - Store Manager physically issues fabric, thread, and Ollypop tags, then taps **"Handover Material"** in the app.
3. **Step 3: Finished Goods Handshake (Piece Lena & Dena)**:
   - **Piece Lena**: Store Manager accepts QC-passed pieces into the Godown (`2,350 pcs received for Brand: OLLYPOP`).
   - **Piece Dena**: Store Manager issues stock for final vehicle loading during dispatch.

---

### Module 3: QC Inspector Mobile App & Quality Logs (`qc_dashboard.dart` & `/reports`)
1. **Vendor Quality Accountability**:
   - If QC detects 40 pieces with stitching defects, the defect is logged against the specific **Vendor** responsible for stitching that lot.
2. **Vendor Quality Scorecard**:
   - Web Admin `/reports` displays real-time QC ratings:
     - `Shanti Garments`: **98% QC Pass Rate** (Grade A)
     - `Star Garments`: **86% QC Pass Rate** (14% Rework / Alterations)

---

### Module 4: Mending & Piece Count Mobile App (`mending_dashboard.dart`)
1. **Cutting vs Stitched Reconciliation**:
   - When 2,400 cut pieces are given to a vendor and 2,380 pieces are received, Mending operator logs the count.
   - The system displays a high-visibility alert: `20 Pieces Shortage from Vendor: Shanti Garments`.

---

### Module 5: Dispatch & Gate Pass (`/dispatch` & Dispatch Mobile App)
1. **Printable Delivery Challan & Gate Pass**:
   - Print slip includes standard compliance metadata:
     - `Billed To: OLLYPOP Head Office`
     - `Manufactured By: Unit-01 Shanti Garments (Vendor)`
2. **Vendor Dispatch Balance Ledger**:
   - Dispatch Manager monitors total pieces ordered vs total pieces dispatched per vendor.

---

### Module 6: Vendor Billing & Payout Ledger
1. **QC-Verified Billing**:
   - System calculates vendor payouts strictly on verified passed pieces:
     $$\text{Payout} = \text{QC Passed Pcs } (2,350) \times \text{Stitching Rate } (₹20) = ₹47,000$$
2. **Statement of Account**:
   - 1-Click generation of vendor settlement sheets at the end of each billing cycle.

---

## 5. Proposed Database Schema Changes

### 1. New Table: `vendors`
```sql
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code TEXT UNIQUE NOT NULL,
    vendor_name TEXT NOT NULL,
    brand_name TEXT NOT NULL, -- e.g. 'OLLYPOP'
    vendor_type TEXT NOT NULL DEFAULT 'STITCHING_JOB_WORK', -- 'STITCHING_JOB_WORK' | 'PRINTING' | 'EMBROIDERY' | 'TRIMS_SUPPLIER'
    contact_person TEXT,
    phone TEXT,
    city TEXT,
    address TEXT,
    gst_no TEXT,
    stitching_rate NUMERIC DEFAULT 20.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_brand_name ON public.vendors(brand_name);
```

### 2. Enhancements to Existing Tables
```sql
-- Link Challans to Vendor
ALTER TABLE public.challans 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Link Allotments to Vendor
ALTER TABLE public.allotments 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Fast Query Indexing
CREATE INDEX IF NOT EXISTS idx_challans_vendor_id ON public.challans(vendor_id);
CREATE INDEX IF NOT EXISTS idx_allotments_vendor_id ON public.allotments(vendor_id);
```

---

## 6. Implementation Roadmap

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 1          │     │        PHASE 2          │     │        PHASE 3          │
│ Database & Architecture │ ──➔ │ Web Admin UI & Ingestion│ ──➔ │ Mobile Handshake & QA   │
│ Migration & Models      │     │ Challan & Dispatch Hub  │     │ End-to-End Testing      │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

1. **Phase 1: Database Migration**:
   - Create `vendors` table in Supabase.
   - Add foreign keys to `challans` and `allotments`.
2. **Phase 2: Web Admin Implementation**:
   - Add `/vendors` Master Directory page with Brand-wise tabs.
   - Upgrade `/production-orders` with Brand + Vendor dual filters and Excel parser support.
   - Upgrade `/dispatch` with Vendor details on printable delivery challans.
3. **Phase 3: Mobile Handshake & Verification**:
   - Update Store Inward, Mending Count, and QC logs with vendor context.
   - Verify full end-to-end flow with sample test lots.

---

## 7. Sign-Off & Approval

| Role | Name | Status | Date |
| :--- | :--- | :--- | :--- |
| **System Architect / Engineering** | Antigravity AI Engine | Proposed & Verified | 2026-09-07 |
| **Factory Owner / Managing Director** | Management Sign-off | [ ] Approved / [ ] Needs Revision | ____/____/2026 |
