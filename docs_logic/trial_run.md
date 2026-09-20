# Trial Run: End-to-End Production Flow (Design Studio &rarr; Embroidery)

> **Tenant Account**: `admin@demo.com`  
> **Company Name**: `Demo Industries`  
> **Buyer / Brand**: `Hollypop`  
> **Article Reference**: `DEMO-101` (Streetwear Graphic Tee)  
> **Order Quantity**: `3,000 Pieces`  
> **Total Fabric Consumed**: `4,800.00 Meters`  

---

## 1. Executive Summary & Production Topology

This document traces the live demo data chain for `Demo Industries` (`admin@demo.com`) across the first five interconnected manufacturing modules:

```mermaid
flowchart LR
    A["1. Design Studio\nConcept DEMO-101\nSA Approved"] --> B["2. Merchandising\nBuyer PO BYR--2026-5150\n(3,000 Pcs @ ₹650)"]
    B --> C["Central Store & Sourcing\n6,000m Olive Single Jersey\n(4,800m Booked for PO)"]
    C -->|Challan ISS-2026-001001\n4,800m (24 Rolls)| D["3. Cutting Floor\nAlvarez, Martinez, Suarez\n(3,000 Cut Pieces)"]
    D -->|Challan ISS-2026-001002\n3,000 Cut Front Panels| E["4. Printing Division\nYamal, Ferran Tores\n(4-Color Plastisol)"]
    D -->|Challan ISS-2026-001004\n3,000 Back/Rib Panels| G["6. Sewing Line\n(Direct Route)"]
    E -->|Challan ISS-2026-001003\n3,000 Printed Panels| F["5. Embroidery Division\nSergio Ramos, Vini Jr\n(14.5k Stitches Crest)"]
```

---

## 2. Step-by-Step Module Chain Walkthrough

### Step 1: Design Studio (Division 01)
- **Portal Route**: `/design` | `/design/tech-packs`
- **Design Brief ID**: `24f895a6-b498-417d-b0c5-59cbfaba346c`
- **Article Number**: `DEMO-101`
- **Garment Type**: `Street wear • graphic tee (Olive Green, Red, White, Black)`
- **Tech-Pack Spec**: `5fd25338-05d3-46b9-9f64-5a3e635f02b6`
  - Shell Fabric: `Single Jersey 220 GSM 100% Combed Cotton`
  - Process Route: `Cutting &rarr; Screen Printing &rarr; Sleeve Embroidery &rarr; Sewing`
- **Status**: `SA_APPROVED` (Approved by SuperAdmin)

---

### Step 2: Merchandising & Commercial Sourcing (Division 02)
- **Portal Route**: `/merchandising` | `/merchandising/orders` | `/merchandising/store`
- **Buyer PO Number**: `BYR--2026-5150`
- **Buyer Name**: `Hollypop` (ID: `f83914f5-5728-4640-a7b4-dade9beb07cf`)
- **Commercial Contract**:
  - Quantity: `3,000 Pieces`
  - FOB Price: `₹650.00 / Piece` (Total PO Value: `₹19,50,000 INR`)
  - Delivery Target: `2026-10-12` (SS27 Season)
- **Merchandise Fabric Store (`/merchandising/store`)**:
  - Cloth Stock: `Single Jersey 220 GSM Olive Green` (Rack `RACK-A-04`)
  - Reserved Allocation: `4,800.00 Meters` booked against Article `DEMO-101`
  - Action Executed: `Issue to Cutting Floor`

---

### Step 3: Central Store Hub (Division 11)
- **Portal Route**: `/store`
- **On-Hand Fabric Ledger (`central_fabric_inventory`)**:
  | Fabric Type | Color | Total Meters | Booked Meters | Free Available | Rack Location | Supplier |
  | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
  | Single Jersey 220 GSM Combed Cotton | Olive Green | `6,000.00 m` | `4,800.00 m` (DEMO-101) | `1,200.00 m` | `RACK-A-04` | Vardhman Textiles |
  | Heavy Twill 280 GSM | Pitch Black | `3,500.00 m` | `2,000.00 m` (DEMO-102) | `1,500.00 m` | `RACK-B-02` | Arvind Mills |

---

### Step 4: Cutting Floor (Division 03)
- **Portal Route**: `/cutting` | `/cutting/store`
- **Inward Receipt Handshake**:
  - **Challan Ref**: `ISS-2026-001001` from `MERCHANDISE`
  - **Received**: `4,800.00 Meters` (24 Fabric Rolls)
  - **Rack**: `CUT-BAY-01` | **Received By**: `Alvarez` | **Variance**: `0.00 m`
- **Task Allocations Matrix (`cutting_task_allocations`)**:
  | Task Ref | Assigned Worker | Role | Table / Machine | Pieces Cut | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `BA-CUT-001` | **Alvarez** | Cutting Master | Table 01 (Straight Knife 8") | `1,000 / 1,000` | `COMPLETED` |
  | `BA-CUT-002` | **Martinez** | Spreading Master | Table 02 (Band Knife Precision) | `1,000 / 1,000` | `COMPLETED` |
  | `BA-CUT-003` | **Suarez** | Knife Cutter | Table 03 (Manual End Cutter) | `1,000 / 1,000` | `COMPLETED` |
- **Outward Issue Dispatches**:
  - `ISS-2026-001002` &rarr; **3,000 Cut Front Panels** dispatched to `PRINTING` (Status: `RECEIVED`)
  - `ISS-2026-001004` &rarr; **3,000 Back Panels & Collars** routed directly to `SEWING` (Status: `IN_TRANSIT`)

---

### Step 5: Printing Division (Division 04)
- **Portal Route**: `/printing` | `/printing/store`
- **Inward Receipt Handshake**:
  - **Challan Ref**: `ISS-2026-001002` from `CUTTING`
  - **Received**: `3,000 Pieces` (120 Cut Bundles)
  - **Rack**: `PRINT-INTAKE-01` | **Received By**: `Yamal` | **Variance**: `0 pcs`
- **Task Allocations Matrix (`printing_task_allocations`)**:
  | Task Ref | Assigned Worker | Technique | Table / Machine | Pieces Printed | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `PRT-TSK-001` | **Yamal** | 4-Color Screen Plastisol | Table 01 (Screen 4-Color) | `1,500 / 1,500` | `COMPLETED` |
  | `PRT-TSK-002` | **Ferran Tores** | High-Density Raised 3D | Table 02 (High-Density Print) | `1,500 / 1,500` | `COMPLETED` |
- **Outward Issue Dispatch**:
  - `ISS-2026-001003` &rarr; **3,000 Printed Front Panels** dispatched to `EMBROIDERY` (Status: `RECEIVED`)

---

### Step 6: Embroidery Division (Division 05)
- **Portal Route**: `/embroidery` | `/embroidery/store`
- **Inward Receipt Handshake**:
  - **Challan Ref**: `ISS-2026-001003` from `PRINTING`
  - **Received**: `3,000 Pieces` (120 Printed Bundles)
  - **Rack**: `EMB-FRAME-01` | **Received By**: `Sergio Ramos` | **Variance**: `0 pcs`
- **Task Allocations Matrix (`embroidery_task_allocations`)**:
  | Task Ref | Assigned Operator | Embroidery Spec | Machine Frame | Completed / Total | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `EMB-TSK-001` | **Sergio Ramos** | 14.5k Stitches Sleeve Badge | `TAJIMA-20-HEAD-01` | `1,200 / 1,500` | `IN_PROGRESS` |
  | `EMB-TSK-002` | **Vini Jr** | 14.5k Stitches 3D Puff Logo | `BARUDAN-15-HEAD-02` | `800 / 1,500` | `IN_PROGRESS` |

---

## 3. Master Inter-Module Challan Ledger

| Challan Number | Sending Stage | Receiving Stage | Article | Material / Component | Quantity | Challan Status | Verified Date |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `ISS-2026-001001` | **Merchandise Store** | **Cutting Floor** | `DEMO-101` | Single Jersey 220 GSM Rolls | `4,800.00 m` | `RECEIVED` | 2026-09-18 |
| `ISS-2026-001002` | **Cutting Floor** | **Printing Division** | `DEMO-101` | Cut Front Chest Panels | `3,000.00 pcs` | `RECEIVED` | 2026-09-19 |
| `ISS-2026-001003` | **Printing Division** | **Embroidery Division**| `DEMO-101` | Screen Printed Front Panels | `3,000.00 pcs` | `RECEIVED` | 2026-09-20 |
| `ISS-2026-001004` | **Cutting Floor** | **Sewing Floor** | `DEMO-101` | Back Panels & Neck Rib Collars | `3,000.00 pcs` | `IN_TRANSIT` | 2026-09-20 |

---

## 4. Verification Checkpoints for `admin@demo.com`

When logged in as `admin@demo.com`, navigate through the following sidebar links:

1. **Central Store Hub** (`/store`):
   - Check `Fabric Inventory` tab &rarr; Verify 6,000m Olive Green (4,800m booked) & 3,500m Pitch Black.
   - Check `Material Issues` tab &rarr; Verify all 4 inter-module challans.
2. **Merchandise Store** (`/merchandising/store`):
   - Check available cloth matrix &rarr; 1,200m free stock, 4,800m reserved for `DEMO-101`.
3. **Cutting Floor Store** (`/cutting/store`):
   - Check `Inwards Received` &rarr; 4,800m received from Merchandise.
   - Check `Outward Issues` &rarr; 3,000 pcs sent to Printing and 3,000 pcs sent to Sewing.
   - Check Floor Dashboard (`/cutting`) &rarr; 3 task allocations completed by Alvarez, Martinez, and Suarez.
4. **Printing Floor Store** (`/printing/store`):
   - Check `Inwards Received` &rarr; 3,000 cut front panels received from Cutting.
   - Check `Outward Issues` &rarr; 3,000 printed panels issued to Embroidery.
   - Check Floor Dashboard (`/printing`) &rarr; Tasks completed by Yamal and Ferran Tores.
5. **Embroidery Floor Store** (`/embroidery/store`):
   - Check `Inwards Received` &rarr; 3,000 printed panels received from Printing.
   - Check Floor Dashboard (`/embroidery`) &rarr; Active allocations running on Tajima 20-Head and Barudan 15-Head machines with 2,000 / 3,000 pieces completed.
