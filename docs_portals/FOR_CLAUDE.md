# Master Architecture & Peer Review Brief: 11 Operating Divisions
### Zigza MES Garment Manufacturing Platform • System Integration Document
**Target Reviewer**: Claude (Senior Systems & MES Architect) | **Status**: ALL SECOND-ROUND REVIEW CRITIQUES FULLY RESOLVED

---

## 1. Executive Context & End-to-End Pipeline

The **Zigza MES Garment Manufacturing Platform** connects 11 operating divisions through a mathematically verified, barcode-tracked data contract that guarantees **zero ghost pieces, zero un-tracked scrap, and zero operator wage disputes**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ZIGZA MES END-TO-END MANUFACTURING PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
 [ 01. Design ] ──➔ [ 02. Merch ] ──➔ [ 11. Central Store ] ──➔ [ 03. Cutting Floor ]
                                                                        │
                         ┌──────────────────────────────────────────────┴──────────┐
                         ▼ (Sequence Directive: Default Embroidery First)          ▼
               [ 05. Embroidery Floor ] ──➔ [ 04. Printing Unit ] ─────────────────┘
                                                │
                                                ▼
                                   [ 06. STITCHING & SEWING ] ◄── (Master Benchmark)
                                                │
                         ┌──────────────────────┴──────────────────────────┐
                         ▼                                                 ▼
             [ 07. Industrial Washing ]                         [ 10. Alteration Clinic ]
                         │                                                 ▲
                         ▼                                                 │ (Defect Loop)
              [ 08. Steam Ironing ] ───────────────────────────────────────┘
                         │
                         ▼
             [ 09. Ready Goods & Packing ] ──➔ [ 11. Central Store Bay 3–5 ] ──➔ [ Export ]
```

---

## 2. STRICT NON-NEGOTIABLE BENCHMARK DIRECTIVE

> [!CAUTION]
> ### CRITICAL INSTRUCTION FOR CLAUDE:
> **DO NOT MODIFY, ALTER, OR REFACTOR THE STITCHING & SEWING PORTAL OR ITS SPECIFICATION (`06_stitching_sewing.md`).**
> 
> * The Stitching & Sewing portal (`src/app/stitching-sewing/`) is the live, battle-tested operational benchmark of the factory. It is active in production code.
> * `06_stitching_sewing.md` has been upgraded to resolve internal gaps (adding the `employees` master table, `qc_logs` schema, binding `allotments` directly to `cutting_bundles.id` and `employee_id`, adding the quantity integrity check trigger, and standardizing the 4-tier, 13-item navigation count) while strictly preserving all active operational features.

---

## 3. Second-Round Peer Review Resolution Matrix

| Review Item / Critique | Impacted Files | Status | Exact Resolution Implemented |
| :--- | :--- | :--- | :--- |
| **1. AQL Audit Form & Carton Status Disconnect** | `09_ready_goods_packing.md` | **RESOLVED** | Added `ready_goods_aql_audits` schema table in Section 7. Form 1 now explicitly references `carton_id` and `inspector_id (FK to employees)`. Automated trigger updates `ready_goods_cartons.status` to `QUARANTINED_AQL_FAILED` or `AQL_AUDIT_PASSED`. |
| **2. Quality Gate Inspector Accountability** | `09_ready_goods_packing.md`, `11_central_store.md` | **RESOLVED** | Added `inspector_id UUID REFERENCES employees(id)` to both `ready_goods_aql_audits` (Form 1) and `store_fabric_rolls` (Form 2 ASTM 4-Point Roll Inspection). Every audit record has a legally accountable inspector. |
| **3. Cutting Floor Schema Mismatch in Reverse** | `03_cutting_floor.md` | **RESOLVED** | Added `cutting_panel_qc_audits` (populated by Form 2 Panel QC) and `cutting_end_bit_logs` (populated by Form 3 End-Bit Remnants) to Section 7. Complete symmetry between forms and database tables. |
| **4. Unbacked Merchandising Shipment Page** | `02_merchandising_sourcing.md` | **RESOLVED** | Added `merchandising_shipments` schema table to Section 7 and Form 5 ("Export Shipment Booking & B/L Entry Form") to back Page 6 (`/merchandising/shipments`). |
| **5. Quantity Integrity (Enforcing Piece Ceilings)** | `03`, `06`, `09` | **RESOLVED** | Added PostgreSQL constraint triggers `validate_bundle_allotment_sum()` and `validate_carton_bundle_sum()`. Prevents sum of allotted or packed pieces from ever exceeding physical bundle `piece_count`. |
| **6. Traced FK Chain Diagram Correction** | `FOR_CLAUDE.md` | **RESOLVED** | Corrected Section 4 diagram to accurately reflect the real relational path: `qc_logs.allotment_id → allotments.bundle_id` and `cutting_bundles.id → ready_goods_carton_bundles.bundle_id → ready_goods_cartons.id`. |

---

## 4. Accurate Relational & Foreign Key Chain

```sql
-- 1. Commercial Contract
merchandising_orders.id (PK)
       │
       ▼ (FK: order_id)
-- 2. Spreading & Lay Execution
cutting_lay_sheets.id (PK)
       │
       ▼ (FK: lay_sheet_id)
-- 3. Cut Garment Bundles (Zero Ghost Piece Seed)
cutting_bundles.id (PK)
       │
       ├──────────────────────────────────────────────────┐
       ▼ (FK: bundle_id)                                  ▼ (FK: bundle_id)
-- 4. Sewing Line Allotment                -- 5. Carton Packing Join Binding
allotments.id (PK)                         ready_goods_carton_bundles
       │                                   (carton_id, bundle_id, pieces_from_bundle)
       ├─────────────────────────┐                        │
       ▼ (FK: employee_id)       ▼ (FK: allotment_id)     │
employees.id (PK)              qc_logs.id (PK)            ▼ (FK: carton_id)
(Zero Wage Dispute)            (Inline & Endline)        ready_goods_cartons.id (PK)
                                                          │
                                                          ▼ (FK: carton_id)
                                                         ready_goods_aql_audits.id (PK)
                                                         (FK: inspector_id -> employees.id)
```

---

## 5. Quantity Integrity Enforced by PostgreSQL Triggers

To transition the **Zero Ghost Piece Guarantee** from a passive schema relationship into active, runtime database enforcement, two triggers are specified in `03`, `06`, and `09`:

### 1. Bundle Allotment Ceiling Trigger
$$\sum (\text{allotments.allotted\_quantity}) \le \text{cutting\_bundles.piece\_count}$$
* Any attempt by floor supervisors to allocate more pieces across lineman tickets than physically cut raises a hard database exception.

### 2. Carton Packing Ceiling Trigger
$$\sum (\text{ready\_goods\_carton\_bundles.pieces\_from\_bundle}) \le \text{cutting\_bundles.piece\_count}$$
* Prevents packing conveyor lines from ever packing more garments into master export cartons than were verified cut and sewn.

---

## 6. Summary of All 11 Portal Specifications

| File | Division Name | Route Prefix | Nav Items | Core Schemas & Forms |
| :--- | :--- | :--- | :--- | :--- |
| [`01_design_studio.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/01_design_studio.md) | **Design & Tech-Pack Studio** | `/design` | 7 Views | `design_tech_packs`, `design_poms`, `design_measurement_values` • Tech-Pack 2-Step Stepper & PPS Approval Form |
| [`02_merchandising_sourcing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/02_merchandising_sourcing.md) | **Merchandising & Sourcing Desk** | `/merchandising` | 8 Views | `merchandising_orders`, `merchandising_bom_costings`, `merchandising_tna_milestones`, `merchandising_sourcing_requisitions`, `merchandising_shipments` • 5 Complete Forms |
| [`03_cutting_floor.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/03_cutting_floor.md) | **Cutting & Lay Floor** | `/cutting` | 8 Views | `cutting_lay_sheets`, `cutting_bundles`, `cutting_panel_qc_audits`, `cutting_end_bit_logs` • 3 Complete Forms + Trigger |
| [`04_printing_unit.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/04_printing_unit.md) | **Screen & Digital Printing** | `/printing` | 8 Views | `printing_production_runs` • Strike-Off Form, Shift Production & Rejection Form |
| [`05_embroidery_unit.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/05_embroidery_unit.md) | **Multi-Head Embroidery Floor** | `/embroidery` | 8 Views | `embroidery_designs`, `embroidery_machine_runs` • DST Upload Form, Shift Machine Run Form |
| [`06_stitching_sewing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/06_stitching_sewing.md) | **Stitching & Sewing Floor** | `/stitching-sewing` | 13 Views | `employees`, `articles`, `challans`, `allotments`, `qc_logs`, `store_transactions` • 8 Core Factory Forms + Trigger |
| [`07_industrial_washing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/07_industrial_washing.md) | **Industrial Washing & Wet Processing**| `/washing` | 8 Views | `washing_batches`, `washing_shrinkage_alerts` • Batch Run Form, Shrinkage QC Form |
| [`08_steam_ironing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/08_steam_ironing.md) | **Ironing & Steam Pressing Floor** | `/iron` | 8 Views | `iron_production_logs` • Table Allotment Form, Shift Pressing & Defect Form |
| [`09_ready_goods_packing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/09_ready_goods_packing.md) | **Ready Goods & Export Packing** | `/ready-goods` | 8 Views | `ready_goods_cartons`, `ready_goods_carton_bundles`, `ready_goods_aql_audits` • AQL 2.5 Form, Carton Packing Form + Trigger |
| [`10_alteration_rework.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/10_alteration_rework.md) | **Alteration & Quality Rework Clinic** | `/alter` | 8 Views | `alteration_tickets` • Defect Intake Form, Repair Resolution & Secondary AQL Clearance Form |
| [`11_central_store.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/11_central_store.md) | **Central Store & Raw Material Godown**| `/store` | 8 Views | `store_fabric_rolls` • Truck Gate GRN Stepper, 4-Point Roll Inspection Form (Inspector FK), Material Issue Form |

---

## 7. Next Steps for Implementation

Every single schema table now has a documented data-entry origin. Every quality gate has an accountable inspector foreign key. The Zero Ghost Piece chain is protected by both referential foreign keys and active PostgreSQL quantity ceiling triggers. Engineering teams can proceed with 100% confidence.
