# Trial Run: End-to-End Production Flow (Design Studio &rarr; Embroidery)

> **Tenant Account**: `admin@demo.com`  
> **Company Name**: `Demo Industries`  
> **Buyer / Brand**: `Hollypop`  
> **Article Reference**: `DEMO-101-03` (Streetwear Graphic Tee)  
> **Contract Volume**: `6,000 Pieces`  
> **Total Fabric Consumed / Booked**: `4,800.00 Meters`  

---

## 1. Executive Summary & Production Topology

This document traces the live demo data chain for `Demo Industries` (`admin@demo.com`) across the interconnected manufacturing modules:

```mermaid
flowchart LR
    A["1. Design Studio\nConcept DEMO-101-03\nSA Approved"] --> B["2. Merchandising\nBuyer Contract Hollypop\n(6,000 Pcs Total Contract)"]
    B --> C["Central Store & Sourcing\n6,000m Olive Single Jersey\n(4,800m Booked for PO)"]
    C -->|Challan ISS-2026-001001\n4,800m (24 Rolls)| D["3. Cutting Floor\nAlvarez, Martinez, Suarez\n(3,800 Cut • 2,200 In Hand)"]
    D -->|Challan ISS-2026-001002\n3,800 Cut Front Panels| E["4. Printing Division\nYamal, Ferran Tores\n(3,300 Printed • 500 In Hand)"]
    E -->|Challan ISS-2026-001003\n3,300 Printed Panels| F["5. Embroidery Division\nSergio Ramos, Vini Jr\n(3,000 Running • 150 In Hand • 150 Done)"]
    D -->|Challan ISS-2026-001004\n3,800 Back/Rib Panels| G["6. Sewing Line\n(Direct Route)"]
```

---

## 2. Step-by-Step Module Chain Walkthrough

### Step 1: Design Studio (Division 01)
- **Portal Route**: `/design` | `/design/tech-packs`
- **Design Brief ID**: `24f895a6-b498-417d-b0c5-59cbfaba346c`
- **Article Number**: `DEMO-101-03`
- **Garment Type**: `Street wear • graphic tee (Olive Green, Red, White, Black)`
- **Tech-Pack Spec**: `5fd25338-05d3-46b9-9f64-5a3e635f02b6`
  - Shell Fabric: `Single Jersey 220 GSM 100% Combed Cotton`
  - Process Route: `Cutting &rarr; Screen Printing &rarr; Sleeve Embroidery &rarr; Sewing`
- **Status**: `SA_APPROVED` (Approved by SuperAdmin)

---

### Step 2: Merchandising & Commercial Sourcing (Division 02)
- **Portal Route**: `/merchandising` | `/merchandising/orders` | `/merchandising/store`
- **Selected Buyer Contract**: `Hollypop (6,000 Pcs)`
- **Commercial Summary**:
  - Active Articles: `1` (`DEMO-101-03`)
  - Active Buyer POs: `6,000 Pcs`
  - In Order: `6,000 Pcs`
- **Live Review Physical WIP Distribution (6,000 Pcs Total)**:
  | # | Stage | Pieces | Percentage | Physical Location |
  | :---: | :--- | :---: | :---: | :--- |
  | **1** | **In Pending** | **`2,200`** | **36.7%** | Central Store unassigned contract queue waiting for cutting |
  | **2** | **In Cutting** | **`0`** | **0.0%** | 3,800 cut pieces completed & dispatched to Printing |
  | **3** | **In Printing** | **`500`** | **8.3%** | 500 cut panels in hand waiting on printing floor |
  | **4** | **In Embroidery**| **`3,300`**| **55.0%** | 3,000 running on machines + 150 in hand + 150 verified done |
  | **5–8**| **Sewing, Iron, Wash, Alter** | **`0`** | **0.0%** | Downstream stages |
  | **&Sigma;** | **Total** | **`6,000`** | **100.0%** | **$2,200 + 0 + 500 + 3,300 = 6,000\text{ Pcs Total}$** |

---

### Step 3: Central Store Hub (Division 11)
- **Portal Route**: `/store`
- **On-Hand Fabric Ledger (`central_fabric_inventory`)**:
  | Fabric Type | Color | Total Meters | Booked Meters | Free Available | Rack Location | Supplier |
  | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
  | Single Jersey 220 GSM Combed Cotton | Olive Green | `6,000.00 m` | `4,800.00 m` (DEMO-101-03) | `1,200.00 m` | `RACK-A-04` | Vardhman Textiles |
  | Heavy Twill 280 GSM | Pitch Black | `3,500.00 m` | `2,000.00 m` (DEMO-102) | `1,500.00 m` | `RACK-B-02` | Arvind Mills |

---

### Step 4: Cutting Floor (Division 03)
- **Portal Route**: `/cutting` | `/cutting/store`
- **Floor State (`/cutting`)**:
  - **In Hand**: `2,200 Pcs` (Unassigned contract pieces in queue)
  - **Pending Cutting**: `0 Pcs`
  - **Completed Cutting**: `3,800 Pcs` (Cut panels verified & bundled)
- **Task Allocations Matrix (`cutting_task_allocations`)**:
  | Task Ref | Assigned Worker | Article | Table / Machine | Pieces Cut | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `#CUT-0101` | **Alvarez** | `DEMO-101-03` | Table 01 (Straight Knife 8") | `1,000 / 1,000` | `Verified & Moved` |
  | `#CUT-0102` | **Martinez** | `DEMO-101-03` | Table 02 (Band Knife Precision) | `1,000 / 1,000` | `Verified & Moved` |
  | `#CUT-0103` | **Suarez** | `DEMO-101-03` | Table 03 (Manual End Cutter) | `1,000 / 1,000` | `Verified & Moved` |
  | `#CUT-0404` | **Alvarez** | `DEMO-101-03` | Table 01 | `800 / 800` | `Verified & Moved` |
- **Outward Dispatches**:
  - `ISS-2026-001002` &rarr; **3,800 Cut Front Panels** dispatched to `PRINTING` (Status: `RECEIVED`)
  - `ISS-2026-001004` &rarr; **3,800 Back Panels & Collars** routed directly to `SEWING` (Status: `IN_TRANSIT`)

---

### Step 5: Printing Division (Division 04)
- **Portal Route**: `/printing` | `/printing/store`
- **Floor State (`/printing`)**:
  - **In Hand**: `500 Pcs` (3,800 cut received - 3,300 printed)
  - **Pending Printing**: `0 Pcs`
  - **Completed Printing**: `3,300 Pcs` (Printed panels verified & cured)
- **Task Allocations Matrix (`printing_task_allocations`)**:
  | Task Ref | Assigned Worker | Article | Table / Machine | Pieces Printed | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `#PRN-0101` | **Yamal** | `DEMO-101-03` | Table 01 (Screen 4-Color) | `1,500 / 1,500` | `Verified & Done` |
  | `#PRN-0102` | **Ferran Tores** | `DEMO-101-03` | Table 02 (High-Density Print) | `1,500 / 1,500` | `Verified & Done` |
  | `#PRN-8713` | **Ferran Tores** | `DEMO-101-03` | Print Table 01 | `300 / 300` | `Verified & Done` |
- **Outward Dispatch**:
  - `ISS-2026-001003` &rarr; **3,300 Printed Front Panels** dispatched to `EMBROIDERY` (Status: `RECEIVED`)

---

### Step 6: Embroidery Division (Division 05)
- **Portal Route**: `/embroidery` | `/embroidery/store`
- **Floor State (`/embroidery`)**:
  - **In Hand**: `150 Pcs` (3,300 printed received - 3,000 running - 150 completed)
  - **Pending Embroidery**: `3,000 Pcs` (Running on multi-head lines)
  - **Completed Embroidery**: `150 Pcs` (Embroidered panels inspected & verified)
- **Task Allocations Matrix (`embroidery_task_allocations`)**:
  | Task Ref | Assigned Operator | Article | Machine Frame | Completed / Total | Status |
  | :--- | :--- | :--- | :--- | :---: | :---: |
  | `#EMB-0101` | **Sergio Ramos** | `DEMO-101-03` | Tajima 20-Head #1 | `0 / 1,500` | `IN PROGRESS` |
  | `#EMB-0102` | **Vini Jr** | `DEMO-101-03` | Tajima 20-Head #1 | `0 / 1,500` | `IN PROGRESS` |
  | `#EMB-7487` | **Sergio Ramos** | `DEMO-101-03` | Tajima 20-Head #1 | `150 / 150` | `Verified & Done` |

---

## 3. Master Inter-Module Challan Ledger

| Challan Number | Sending Stage | Receiving Stage | Article | Material / Component | Quantity | Challan Status | Verified Date |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `ISS-2026-001001` | **Merchandise Store** | **Cutting Floor** | `DEMO-101-03` | Single Jersey 220 GSM Rolls | `4,800.00 m` | `RECEIVED` |
| `ISS-2026-001002` | **Cutting Floor** | **Printing Division** | `DEMO-101-03` | Cut Front Chest Panels | `3,800.00 pcs` | `RECEIVED` |
| `ISS-2026-001003` | **Printing Division** | **Embroidery Division**| `DEMO-101-03` | Screen Printed Front Panels | `3,300.00 pcs` | `RECEIVED` |
| `ISS-2026-001004` | **Cutting Floor** | **Sewing Floor** | `DEMO-101-03` | Back Panels & Neck Rib Collars | `3,800.00 pcs` | `IN_TRANSIT` |

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
