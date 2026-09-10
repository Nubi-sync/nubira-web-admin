# Future Implementation Backlog
### Nubira Creation / Zigza MES Platform

This document stores features and modules deferred for future releases as decided during architectural planning.

---

## 1. Store & Godown Inventory Multi-Vendor Integration (`/store` & `/inventory`)

### Background & Objective
Enable deep raw material and BOM tracking tagged by Brand (e.g. `OLLYPOP`) and Supplier Vendor (e.g. `Vardhman Fabrics`, `Royal Trims`) in the Godown and Store inventory systems.

### Scope & Modules to Implement in Future

#### A. Web Admin Store Actions (`web_admin/src/app/store/actions.ts`)
- **`createTruckInwardGrn`**:
  - Accept `brand_name` and `vendor_id` alongside `party_name`.
  - Store incoming fabric and trims directly linked to the registered supplier vendor and buyer brand.
- **`issueBomMaterials`**:
  - Tag which specific Vendor contractor unit (`vendor_id`, `vendor_name`) received the issued BOM packages (fabric, threads, brand neck tags).

#### B. Web Admin Store UI (`web_admin/src/app/store/components/StoreDashboardClient.tsx`)
- **Truck Inward (GRN) Modal**:
  - Add Brand selector (`OLLYPOP`, `FIRST SMILE`, etc.).
  - Add Vendor selector (`Vardhman Fabrics`, `Royal Trims`, or custom party).
- **GRN Cards & Table**:
  - Display Brand badge and Supplier Vendor badge.
  - Filter GRNs by Brand and Supplier.

#### C. Mobile Store Dashboard (`mobile_app/lib/features/dashboard/store_dashboard.dart`)
- In Truck Inward GRN dialog:
  - Add Brand and Supplier Vendor dropdown selectors populated dynamically from Supabase `brands` and `vendors`.
- In Material Issue Handover:
  - Show contractor unit name when handing over BOM materials.

---

## 2. Mobile App Multi-Vendor Handshake (QC, Mending, Production Manager)

### Background & Objective
Display vendor contractor unit metadata and track production variance/defects tagged by Vendor directly inside the factory floor mobile applications.

### Scope & Modules to Implement in Future

#### A. Production Manager Mobile App (`mobile_app/lib/features/dashboard/production_manager_dashboard.dart`)
- **Active Floor Allotment Cards**:
  - Display `Vendor: [Vendor Name]` badge alongside Lineman on each active lot card.
- **Challan Reference Sheet Modal**:
  - Show contractor unit name, stitching rate, and contractor contact info in the allotment drilldown sheet.

#### B. Mending Operator Mobile App (`mobile_app/lib/features/dashboard/mending_dashboard.dart`)
- **Physical Count Verification**:
  - Tag physical count variances and missing pieces (shortages) directly to the assigned Vendor in `qc_logs` and `allotments`.
  - Display Vendor unit badge on lot cards waiting for mending verification.

#### C. QC Inspector Mobile App (`mobile_app/lib/features/dashboard/qc_dashboard.dart`)
- **Inspection Task Cards**:
  - Show Vendor unit badge on garment inspection tasks so QC checkers know which contractor unit produced the garments.
- **Defect Logging**:
  - Tag stitching defects and alteration logs in `qc_logs` with the responsible vendor unit.

---

## 3. Vendor Billing & Reconciliation Ledger (`/reports`)

### Background & Objective
Provide a dedicated financial reconciliation and contractor payout module calculating vendor earnings strictly on verified, QC-passed output, complete with exportable settlement vouchers.

### Payout Calculation Logic
$$\text{Total Payable} = \text{QC Passed Pcs} \times \text{Stitching Rate}$$
*Note: Count variances and missing pieces (shortages) are recorded purely as production audit/ledger metrics — zero financial penalty deductions.*

### Scope & Modules to Implement in Future

#### Web Admin Reports (`web_admin/src/app/reports/components/ReportsClient.tsx`)
- **Add 5th Tab**: "Vendor Billing & Reconciliation" (`Vendor Ledger`).
- **Filters**:
  - Brand dropdown (`All Brands`, `OLLYPOP`, `FIRST SMILE`, etc.).
  - Vendor dropdown (dynamically filtered by selected Brand).
  - Date Range picker (Today, This Week, This Month, Custom).
- **KPI Summary Cards**:
  - Total Challans Handled
  - Total Cut Pieces Issued
  - Total Stitched Pieces Counted
  - Total Shortage Pieces Flagged (audit metric)
  - Total QC Passed Pieces
  - Total Alterations
  - Net Payout Payable (`₹`)
- **Detailed Reconciliation Table**:
  | Challan # | Art # | Vendor Unit | Issued Pcs | Counted Pcs | Shortage | QC Passed | Alteration | Rate (₹/pc) | Total Payable (₹) |
- **Export & Print**:
  - Export to Excel (.xlsx) statement.
  - Printable Vendor Settlement Voucher.

---

*Status: Deferred for future release. Current focus is Database Foundation (brands, vendors), Web Admin Master Directory (`/vendors`), Production Orders Challan Hub (`/production-orders`) with Brand/Vendor hierarchy & Excel Import, and Dispatch Gate Pass (`/dispatch`).*


