# Division 11 • Central Store & Raw Material Godown Master Guide
### Zigza MES Garment Platform • Division 11 (Step 11 of 11 • Dual-Gate Master Division)
**Where to find it in the app:** `/store`  
**Target Audience:** Chief Storekeeper, Fabric Inward Inspectors, Trims Custodians, Floor Material Issuance Clerks, and Export Logistics Dispatchers  
**Document File:** `docs_final/11_store.md`

---

## 1. Simple Summary: What Does This Division Do?

Every factory has a beginning and an end.  
In our platform, **Division 11 (Central Store & Raw Material Godown)** is the **Dual-Gate Master Division**:
- **Gate 1 (The Genesis Gate)**: Trucks arrive from textile mills and trim vendors carrying raw cloth rolls, zipper cartons, thread cones, and buttons. We weigh trucks, scan barcodes, and inspect cloth quality under the international ASTM 4-point system before letting anything enter the factory.
- **The Internal Shopping Counter**: When Cutting needs cloth or Sewing needs thread, the Store issues materials using the strict **FIFO (First-In, First-Out)** rule and records every button in a double-entry ledger so nothing is lost or stolen.
- **Gate 2 (The Export Depot Gate)**: When finished garments are packed into 200 export cartons (Division 09), they return to Central Store Export Bays 3–5. Here, cartons are loaded into 40-foot ocean shipping containers and driven to the seaport!

In an apparel factory, **Division 11** is the **alpha and omega warehouse fortress**—guarding raw materials coming in and certified finished goods going out.

```
+-----------------------------------------------------------------------------+
|                           THE DUAL-GATE BIG PICTURE                         |
|                                                                             |
|   [ Mill Delivery Trucks ]              [ 09. Ready Goods Packing ]         |
|   4,250 kg French Terry Cloth           200 Master Export Cartons           |
|   5,100 Drawcords & Thread              5,000 Finished Hoodies              |
|              |                                       |                      |
|              v                                       v                      |
|   +---------------------------------------------------------------------+   |
|   | 11. CENTRAL STORE & RAW MATERIAL GODOWN (DUAL-GATE DEPOT)           |   |
|   |                                                                     |   |
|   | GATE 1: RAW MATERIAL INWARD (GENESIS)                               |   |
|   | • Truck GRN Weighbridge Entry                                       |   |
|   | • ASTM D5430 4-Point Fabric Inspection (Pass <= 40 points)          |   |
|   | • Shade Group Separation (Shade A / B / C in Rack A-01)             |   |
|   | • FIFO Issuance to [ 03 Cutting Floor ] and [ 06 Sewing Lines ]     |   |
|   |                                                                     |   |
|   | GATE 2: FINISHED EXPORT STAGING (DEPOT)                             |   |
|   | • Store Inward of Sealed Master Cartons (Bay 03)                    |   |
|   | • Customs Bill of Lading & Commercial Shipping Manifest             |   |
|   | • 40-Foot Sea Container Stuffing & Factory Gate Pass                |   |
|   +---------------------------------------------------------------------+   |
|              |                                       |                      |
|              v                                       v                      |
|   [ 03. Cutting & 06. Sewing ]              [ Seaport Ocean Container Ship ]|
|   Floors receive approved cloth             Truck carries sealed container  |
|   and thread to make clothes!               to ocean vessel heading abroad! |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used in the central store and warehouse every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Central Store (Godown)** | The giant high-ceiling warehouse building on the factory campus. | Holds thousands of fabric rolls on metal racks and pallets of export boxes. |
| **Dual-Gate Division** | A department that acts as both the entrance (Day 1) and the exit (Day 30) of the factory. | Division 11 receives raw cloth rolls on Day 1 and ships finished container boxes on Day 30! |
| **GRN (Goods Receipt Note)** | The official legal intake ticket created when a delivery truck unloads materials at the gate. | `GRN-2026-0941` confirms that 45 rolls of black French Terry arrived on truck TN-28-AB-4412. |
| **ASTM D5430 4-Point System** | The worldwide standard for inspecting raw fabric rolls for defects on lit inspection machines. | An inspector rolls cloth over a glass light table and taps penalty buttons (1, 2, 3, or 4 points) for snags, holes, or color stains. |
| **Penalty Points** | Penalty demerit points assigned to fabric flaws based on their length in inches. | Up to 3" = 1 pt. 3" to 6" = 2 pts. 6" to 9" = 3 pts. Over 9" or holes = 4 pts. If a roll scores over 40 points per 100 sq. yds, it is rejected! |
| **FIFO (First In, First Out)** | The golden warehouse rule: the oldest fabric roll received must be cut first before opening newer rolls. | Prevents older fabric from sitting in dark corners for 6 months and getting dusty or degraded. |
| **Double-Entry Store Ledger** | An accounting system where every physical item added or removed must have an equal matching record. | If 20 cones of black thread leave the store, the ledger records: `-20 cones Store` and `+20 cones Sewing Line 01`. Negative stock is mathematically impossible! |
| **Rack & Bin Location** | The exact GPS-like coordinate address of every shelf in the warehouse. | `RACK-A-01-BIN-04` tells a forklift driver exactly which aisle, shelf, and box to pick up in 10 seconds. |
| **Floor Reissue** | Giving a worker replacement trims if an accessory was lost or damaged on the sewing line. | If a tailor drops 3 buttons into a machine motor, the supervisor signs a Floor Reissue slip so the storekeeper can issue 3 replacements. |
| **Container Stuffing** | Loading sealed master export cartons into an ocean shipping container truck. | Stacking 200 cartons onto wooden pallets inside a 40-foot steel container at the factory loading dock. |
| **Gate Pass** | The official legal security document that allows an export truck to pass through the factory front gate. | Security guards at the front gate will never let a truck leave without a signed digital gate pass! |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 11 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Central Store Cockpit (`/store`)

This is the control tower where the Chief Storekeeper monitors daily truck deliveries, fabric godown inventory, active material issues to sewing lines, and export shipping bays.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 11 * Store ]   |
+-----------------------------------------------------------------------------------------+
| Central Store & Raw Material Godown                           [ Dual-Gate Depot Live ]  |
| Truck inwards GRN, ASTM 4-point fabric inspection, FIFO BOM issues, and export bays     |
|          [ + New Truck Inward GRN ] [ + Issue BOM Trims ] [ Finished Goods Outward ]    |
+---------------------+---------------------+---------------------+-----------------------+
| FINISHED EXPORT STCK| TODAY'S DISPATCH    | TRUCK DELIVERIES    | FABRIC GODOWN STOCK   |
| 14,850 Pcs in Bays  | 5,000 Pcs Exported  | 4 Trucks Inward     | 42,500 Meters (Rolls) |
| Bays 3–5 Staged     | 200 Master Cartons  | 100% GRN Verified   | 98.2% ASTM 4-Pt Pass  |
+---------------------+---------------------+---------------------+-----------------------+
| WAREHOUSE SUB-SYSTEM NAVIGATION CARDS:                                                  |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
| | Truck Inwards   | | Fabric Godown   | | Trims Warehouse | | Material Issues |        |
| | Gate GRN & mill | | ASTM 4-point    | | Zippers, buttons| | FIFO issuance to|        |
| | delivery weight | | roll inspection | | & thread stock  | | cutting & sewing|        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
+-----------------------------------------------------------------------------------------+
| LIVE STORE MATERIAL TRANSACTIONS & RECENT MOVEMENTS                                     |
| Tx Code    | Type    | Item / Article       | Quantity   | Recipient   | Status | Action|
| TX-0941    | INWARD  | French Terry 380 GSM | 4,250 kg   | Fabric Godown| PASS   | View  |
| TX-0942    | ISSUE   | French Terry 380 GSM | 432.0 m    | Cutting Tbl 1| DONE   | View  |
| TX-0943    | ISSUE   | YKK Drawcord Black   | 5,100 pcs  | Sewing Line 1| DONE   | View  |
| TX-0944    | OUTWARD | Master Export Box    | 200 Cartons| Export Gate | SHIPPED| Gate  |
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Master Warehouse KPI Cards (What are they & Why are they here?)

1. **Finished Export Stock (`14,850 Pcs in Bays`)**:
   - **What it shows:** Total finished garments sitting in sealed master cartons inside Export Bays 3–5.
   - **Why it is here:** Warehouse managers check available warehouse floor space before new shipments arrive.
2. **Today's Dispatch Outward (`5,000 Pcs • 200 Cartons`)**:
   - **What it shows:** Garments loaded into container trucks and cleared through the security gate today.
   - **Why it is here:** Confirms that buyer shipping deadlines booked in Merchandising are being hit on schedule.
3. **Truck Deliveries Inward (`4 Trucks Inward • 100% GRN`)**:
   - **What it shows:** Number of supplier trucks received at the gate weighbridge today.
   - **Why it is here:** Ensures no delivery truck is left waiting in the factory driveway un-unloaded.
4. **Fabric Godown Stock (`42,500 Meters • 98.2% Pass`)**:
   - **What it shows:** Total raw fabric rolls in inventory that have passed ASTM 4-point inspection and are ready for cutting.
   - **Why it is here:** Prevents cutting floor line stoppages by maintaining healthy raw material buffers.

---

#### Box 2: Unified Material Movement Ledger
Every row represents a physical movement of raw materials or finished goods:
- **Transaction Type**:
  - `[INWARD]`: Truck arrival from fabric mill or trim supplier.
  - `[ISSUE]`: Materials transferred to Cutting (Division 03) or Sewing (Division 06).
  - `[OUTWARD]`: Export shipment leaving the factory on ocean container trucks.
- **Double-Entry Protection**: If an item is issued to Cutting, store inventory decreases by that exact amount, preventing phantom stock or double-booking!

---

### SCREEN 2: Truck Delivery Gate & GRN Logging (`/store/truck-inwards`)

When a delivery truck arrives at the factory security gate, the inward clerk records the truck number, vendor delivery challan, and photographic evidence.

```
+------------------------------------------------------------------------+
| LOG NEW TRUCK INWARD DELIVERY (GRN)                              [ X ] |
+------------------------------------------------------------------------+
| GRN Number:            [ GRN-2026-0941                               ] |
| Vendor / Mill Name:    [ VARDHMAN TEXTILES LTD                       v]|
| Delivery Truck Plate:  [ TN-28-AB-4412                               ] |
| Vendor Challan Number: [ CHN-VARD-88219                              ] |
| Gate Weighbridge Gross:[ 12,450 kg ]   Tare Truck: [ 8,200 kg ]        |
| Net Material Weight:   [ 4,250 kg French Terry Cloth                 ] |
+------------------------------------------------------------------------+
| LINE ITEMS RECEIVED:                                                   |
| 1. 100% Cotton French Terry 380 GSM (Jet Black) - 45 Rolls (4,250 kg)  |
|    Dye Lot: LOT-402 • Status: [ RECEIVED - PENDING 4-POINT AUDIT ]     |
| Challan Photo Upload:  [ Photo of stamped delivery slip attached OK  ] |
| Receiver Signature:    [ K. Selvan (Senior Inward Clerk)             ] |
|                                      [ Cancel ] [ Create GRN & Inward] |
+------------------------------------------------------------------------+
```

---

### SCREEN 3: Fabric Godown & ASTM 4-Point Inspection (`/store/fabric-godown`)

Before fabric can be unrolled on cutting tables, certified fabric inspectors audit rolls on motorized light inspection machines under the **ASTM D5430 4-Point System**.

```
+-----------------------------------------------------------------------------------------+
| [<- Store Cockpit]                                              [ + Log Roll 4-Point ]  |
+-----------------------------------------------------------------------------------------+
| Fabric Rolls Inventory & ASTM D5430 4-Point Inspection                                  |
+---------------------+---------------------+---------------------+-----------------------+
| ROLLS IN STOCK      | AUDITED TODAY       | AVG 4-POINT SCORE   | QUARANTINE ROLLS      |
| 185 Rolls           | 18 Rolls (10% Rule) | 18.5 Points / 100 yds| 1 Roll (Defective)   |
| 42,500 Meters       | 100% Inspected      | Benchmark <= 40 pts | Locked from Cutting   |
+---------------------+---------------------+---------------------+-----------------------+
| FABRIC ROLLS INVENTORY TABLE:                                                           |
| Roll Barcode | Fabric Type         | Dye Lot | Shade | Length | Width | 4-Pt | Status   |
| ROL-FT-0081  | French Terry 380GSM | LOT-402 | SHADE_A | 96.0m  | 158cm | 14.2 | APPROVED |
| ROL-FT-0082  | French Terry 380GSM | LOT-402 | SHADE_A | 98.5m  | 158cm | 18.1 | APPROVED |
| ROL-FT-0083  | French Terry 380GSM | LOT-402 | SHADE_B | 94.0m  | 156cm | 22.0 | APPROVED |
| ROL-FT-0084  | French Terry 380GSM | LOT-402 | SHADE_A | 92.0m  | 158cm | 48.5 | REJECTED |
+-----------------------------------------------------------------------------------------+
```

#### How the ASTM 4-Point Formula Works:
$$\text{Defect Points per 100 sq. yards} = \frac{\text{Total Penalty Points} \times 36 \times 100}{\text{Roll Length (yards)} \times \text{Usable Width (inches)}}$$

- **Inspection Example for Roll `ROL-FT-0081`**:
  - Roll length: 96 meters ($105.0\text{ yards}$), Width: 158 cm ($62.2\text{ inches}$).
  - During rolling, the inspector finds:
    - 2 small slubs under 3 inches ($2 \times 1\text{ pt} = 2\text{ points}$).
    - 1 yarn dye streak 5 inches long ($1 \times 2\text{ pts} = 2\text{ points}$).
    - Total Penalty Points $= 4\text{ points}$.
  - Calculation:
    $$\text{Score} = \frac{4 \times 36 \times 100}{105.0 \times 62.2} = \frac{14,400}{6,531} = \mathbf{2.20\text{ points per 100 sq. yards}}$$
  - **Verdict**: Far below the 40-point limit! Status = **`APPROVED_IN_STOCK`**.
- **Look at Roll `ROL-FT-0084`**:
  - Found a 12-inch tear and 3 oil stains (total score $= 48.5$ points).
  - Score exceeds 40.0 points! Status = **`REJECTED_QUARANTINE`**. The system locks the barcode so the cutting floor can never accidentally spread this defective roll!

---

### SCREEN 4: Trims & Accessories Warehouse (`/store/trims-warehouse`)

A garment is more than cloth. This room holds buttons, zippers, drawcords, care tags, and polybags in thousands of numbered plastic bins.

```
+-----------------------------------------------------------------------------------------+
| [<- Store Cockpit]                                              [ + Add New Trim Item ] |
+-----------------------------------------------------------------------------------------+
| Trims & Accessories Inventory & Reorder Monitoring                                      |
+---------------------+---------------------+---------------------+-----------------------+
| TRIM ITEMS ACTIVE   | TOTAL STOCK VALUE   | BELOW MINIMUM LEVEL | REISSUES THIS WEEK    |
| 240 Items           | Rs 14,25,000.00     | 3 Items Low         | 42 Reissue Slips      |
+---------------------+---------------------+---------------------+-----------------------+
| TRIMS INVENTORY REPOSITORY:                                                             |
| Trim Code   | Category  | Description             | Stock Qty   | Unit  | Bin Location  |
| TRM-ZIP-01  | ZIPPER    | YKK #5 Antique Brass    | 12,400 pcs  | PIECE | BIN-RACK-01-A |
| TRM-DRW-02  | DRAWCORD  | 100% Cotton Braided Blk |  5,100 pcs  | PIECE | BIN-RACK-02-C |
| TRM-THR-03  | THREAD    | Coats Astra Black 40s/2 |    120 cones| CONE  | BIN-RACK-04-B |
| TRM-LBL-04  | MAIN_LABEL| Zara Satin Woven Neck   |  8,200 pcs  | PIECE | BIN-RACK-05-A |
+-----------------------------------------------------------------------------------------+
```

---

### SCREEN 5: Material Issuance to Production (`/store/material-issues`)

When Cutting or Sewing lines start a new work order, the storekeeper issues the exact required bill of materials (BOM).

```
+------------------------------------------------------------------------+
| ISSUE BOM MATERIALS TO SEWING FLOOR                              [ X ] |
+------------------------------------------------------------------------+
| Allotment Work Order:  [ ALT-0842 • PO-ZIG-8901 Zara Hoodie          v]|
| Receiving Lineman:     [ R. Kumar (Sewing Line 01)                   v]|
| Target Garments to Sew:[ 500 Hoodies                                 ] |
+------------------------------------------------------------------------+
| BOM MATERIAL ISSUANCE CHECKLIST:                                       |
| 1. Black Sewing Thread 40s/2:   Required: 12 Cones  | Issue: [ 12 OK ] |
| 2. Braided Cotton Drawcords:    Required: 510 pcs   | Issue: [ 510 OK] |
| 3. Gunmetal Hood Eyelets:       Required: 1,020 pcs | Issue: [ 1020OK] |
| 4. Woven Neck Brand Labels:     Required: 510 pcs   | Issue: [ 510 OK] |
| 5. Printed Wash Care Labels:    Required: 510 pcs   | Issue: [ 510 OK] |
+------------------------------------------------------------------------+
| ISSUANCE SUMMARY:                                                      |
| Stock deduction confirmed in store_trims_inventory.                    |
| Handover Slip #ISSUE-2026-402 printed. Lineman signature verified.     |
|                                          [ Cancel ] [ Authorize Issue ]|
+------------------------------------------------------------------------+
```

---

### SCREEN 6: Finished Goods Godown & Export Staging Bays (`/store/finished-godown`)

This is Gate 2—the final staging depot. AQL-passed master cartons from Division 09 are organized by ocean container bookings.

```
+-----------------------------------------------------------------------------------------+
| [<- Store Cockpit]                                                [ Dock Loading Active]|
+-----------------------------------------------------------------------------------------+
| Finished Goods Godown & Export Staging Bays (Bays 3–5)                                  |
+---------------------+---------------------+---------------------+-----------------------+
| CARTONS IN STAGING  | PALLETS READY       | ACTIVE CONTAINER    | TRUCK GATE PASS       |
| 200 Cartons         | 10 Pallets (20/pal) | MSC LORETTA (40ft HC| PASS-EXP-2026-042     |
| 5,000 Hoodies       | Shrink-wrapped OK   | 14.400 CBM Staged   | Customs Sealed OK     |
+---------------------+---------------------+---------------------+-----------------------+
| EXPORT BAY ALLOCATION CONSOLE:                                                          |
| Bay Location: [ BAY 03 - EXPORT CONTAINER STAGING ]                                     |
| Order:        PO-ZIG-8901 • ZARA GLOBAL • Heavyweight French Terry Hoodies              |
| Cartons:      Carton #001 to Carton #200 (100% Verified & AQL Passed)                   |
| Total Weight: Gross: 3,649.0 kg • Net: 3,479.0 kg • Tare: 170.0 kg                     |
| Total Volume: 14.400 CBM (Takes approx. 21% of 40-foot Sea Container)                   |
| Action:       [ Print Commercial Shipping Manifest ] [ Generate Gate Pass ]             |
+-----------------------------------------------------------------------------------------+
```

---

## 4. The Complete Story of Order PO-ZIG-8901 in Central Store

Let us trace how Central Store manages an order from Day 1 to Day 30:

```
=== PART 1: THE GENESIS INWARD (Day 1) ===
1. TRUCK ARRIVES AT FACTORY GATE (08:00 AM)
   Vardhman Textiles truck arrives carrying 45 rolls of Black French Terry (4,250 kg).
   Gate clerk logs GRN-2026-0941. Weighbridge confirms net weight: 4,250 kg.
       |
       v
2. ASTM 4-POINT INSPECTION AUDIT (10:00 AM)
   Inspector audits 5 random rolls (10% sample) on the light table.
   Average score: 16.4 points per 100 sq. yards (Well under 40-point limit).
   All rolls marked [ APPROVED_IN_STOCK ] and forklifted into Rack A-01.

=== PART 2: THE PRODUCTION ISSUANCE (Days 2 & 4) ===
3. ISSUING CLOTH TO CUTTING (Day 2 - 09:30 AM)
   Storekeeper pulls Rolls ROL-FT-0081 and ROL-FT-0082 under FIFO rules.
   Scans barcodes and issues 432.0 meters to Division 03 (Cutting Table 01).
       |
       v
4. ISSUING TRIMS TO SEWING (Day 4 - 08:00 AM)
   Sewing Line 01 starts assembling 500 hoodies.
   Store issues 510 drawcords, 1,020 eyelets, and 12 cones of Coats black thread.

=== PART 3: THE EXPORT DEPOT & CUSTOMS CLEARANCE (Day 6 to Day 7) ===
5. MASTER CARTONS RETURN TO STORE (Day 6 - 05:00 PM)
   Division 09 (Ready Goods Packing) finishes packing and AQL inspecting 5,000 hoodies.
   200 master cartons arrive at Central Store and are staged in Export Bay 03.
       |
       v
6. CONTAINER STUFFING & FACTORY GATE PASS (Day 7 - 09:00 AM)
   MSC Mediterranean 40-foot sea container backs up to Dock Bay 03.
   Forklifts load all 10 pallets (200 cartons, 14.400 CBM, 3,649 kg).
   Container doors locked with steel bolt seal #MSC-884210.
   System prints the Commercial Shipping Bill and Security Gate Pass!
   Truck drives out the factory gate heading for the seaport!
```

---

## 5. What Do Downstream Divisions Receive?

Because Division 11 is the Dual-Gate Division, it communicates across the entire factory:

### A. What Division 03 (Cutting Floor) Receives:
- Clean, inspected, approved fabric rolls with verified usable widths and shade group designations (`SHADE_A`, `SHADE_B`).

### B. What Division 06 (Stitching Floor) Receives:
- Complete BOM trim packages (matching thread cones, brand labels, care tags, and drawcords).

### C. What the Ocean Shipping Carrier & Customs Receive:
- 200 sealed, barcoded master cartons loaded into a secure container.
- Certified Commercial Packing List, Customs Gate Pass, and Export Bill of Lading.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world warehouse hazards and how our system prevents them:

### 1. Negative Inventory Phantom Stock
- **What can go wrong:** In sloppy manual stores, a clerk writes down that 500 zippers were issued when only 400 were in stock. The computer says -100 zippers exist! Workers spend hours searching for phantom boxes.
- **How our system protects you:** The database has a strict constraint: `CHECK (current_stock_quantity >= 0)`. The system physically blocks any transaction that would push inventory below zero!

### 2. Bypassing the ASTM 4-Point Inspection Gate
- **What can go wrong:** A lazy storekeeper skips inspecting the fabric rolls and issues them straight to cutting. The rolls have hidden center-crease holes that ruin 500 cut hoodies!
- **How our system protects you:** Every fabric roll inserted has status `IN_INSPECTION`. The cutting module refuses to select any roll until an inspector signs off an ASTM score $\le 40.0$.

### 3. Shade Group Mixing in Warehouse Racks
- **What can go wrong:** Forklift drivers stack `SHADE_A` rolls and `SHADE_B` rolls in the same pile. Cutters grab both and mix them in the same lay, causing two-tone mismatched garments!
- **How our system protects you:** The `/store/fabric-godown` console assigns distinct rack bins by shade group (e.g. Rack A for Shade A, Rack B for Shade B).

### 4. Trim Shrinkage & Floor Theft
- **What can go wrong:** Small valuable items like brass zippers or branded metal eyelets get stolen in worker pockets or lost on the floor.
- **How our system protects you:** Strict Floor Reissue logs track replacement items by reason (`LOST`, `MACHINE_DAMAGE`, `SHORT_IN_LOT`). Supervisors with high loss rates are flagged for training.

### 5. Loading the Wrong Carton Count into Containers
- **What can go wrong:** A forklift driver leaves 5 cartons behind on the warehouse floor. The sea container ships with 195 boxes instead of 200. The buyer charges a massive penalty for short-shipment!
- **How our system protects you:** Dock loading requires scanning every carton barcode onto the container manifest. The Gate Pass cannot print until the scanned count matches the order total ($200 / 200$ cartons).

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/store` | Main warehouse cockpit to monitor stock, issues, and dispatches | Chief Storekeeper |
| **2** | `/store/truck-inwards` | Logs gate GRN intake, vendor challans, and weighbridge weights | Inward Gate Clerk |
| **3** | `/store/fabric-godown` | Manages roll racks, shade groups, and ASTM D5430 4-point inspection | Fabric Inspector |
| **4** | `/store/trims-warehouse` | Tracks zippers, buttons, threads, labels, and minimum reorders | Trims Custodian |
| **5** | `/store/material-issues` | Issues BOM materials to Cutting and Sewing under FIFO rules | Issuance Clerk |
| **6** | `/store/finished-godown` | Stages export cartons in Bays 3–5 and generates container gate passes | Export Dispatcher |

*This document is written in clean, plain language with zero emojis so every storekeeper, forklift driver, and warehouse manager can follow it clearly.*
