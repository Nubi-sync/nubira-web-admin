# Division 12 • Dispatch, Delivery Challans & Factory Gate-Out Master Guide
### Zigza MES Garment Platform • Division 12 (The Final Commercial Gateway)
**Where to find it in the app:** `/dispatch` (also accessible via `/stitching-sewing/dispatch`)  
**Target Audience:** Dispatch Managers, Logistics Coordinators, Gate Security Officers, Commercial Billing Clerks, and Transporters  
**Document File:** `docs_final/12_dispatch.md`

---

## 1. Simple Summary: What Does This Division Do?

Imagine you just ordered a brand new bicycle online. The factory made the wheels, welded the steel frame, painted it, tested the brakes, and packed it into a sturdy box. 

Now comes the most critical moment: **getting the bicycle from the factory loading dock onto the delivery truck, through the factory security gates, and safely into your hands with legal paperwork that proves you received it.**

In our apparel factory, **Division 12 (Dispatch & Logistics Hub)** is that final legal and physical gateway:
- **The Pre-Loading Physical Counting Audit**: Before even one box is lifted onto a truck, workers count every single piece to confirm that what is in the box matches the order ticket 100%. If 1 hoodie is missing, the system blocks the truck!
- **The Official Legal Delivery Challan (DC)**: The software creates the official government-compliant shipping document with vehicle number, driver contact, buyer tax number (GSTIN), and carton breakdown.
- **The Double-Entry Store Outward Sync**: The moment a delivery challan is confirmed, the system immediately writes an `OUTWARD` record in the central warehouse ledger (`store_transactions`), so factory stock is always 100% accurate.
- **Factory Gate-Out Authorization**: Factory security guards at the physical exit gate cannot open the gate boom barrier until the plant manager clicks "Authorize Gate Out" inside the software.

Without Division 12, a factory is like a bank without a security door. Division 12 ensures that **zero uncounted garments leave the factory**, **zero illegal trucks pass the gate**, and **buyers receive exactly what they paid for**.

```
+-----------------------------------------------------------------------------+
|                           THE FINAL GATEWAY BIG PICTURE                     |
|                                                                             |
|   [ Central Store Export Bay 3-5 ]                                          |
|   200 Sealed Master Cartons (5,000 Heavyweight Hoodies)                     |
|               |                                                             |
|               v                                                             |
|   ┌─────────────────────────────────────────────────────────────────────┐   |
|   │ 12. DISPATCH & LOGISTICS HUB (/dispatch)                            │   |
|   │ • Pre-Loading Counting Audit  ---> "Counted 5,000 / Expected 5,000" │   |
|   │ • Reconciliation Status       ---> "MATCHED: Zero Discrepancy"      │   |
|   │ • Generate Delivery Challan   ---> "Challan No: DC-ZIG-2026-8901"   │   |
|   │ • Register Transporter        ---> "Truck: MH-04-AZ-4912 / Ramesh"  │   |
|   │ • Store Outward Stock Ledger  ---> "5,000 Pcs Deducted from Godown" │   |
|   │ • Factory Gate-Out Approval   ---> "Security Gate Pass Issued [OK]" │   |
|   └─────────────────────────────────────────────────────────────────────┘   |
|               |                                                             |
|               v                                                             |
|   [ 40-Foot Ocean Shipping Container Truck Departs for Seaport / Buyer ]    |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Before looking at the software screens, here are simple explanations of terms used in the dispatch division:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Delivery Challan (DC)** | An official shipping document sent with goods to prove what was dispatched from the factory. | Like the printed delivery slip you sign when a courier delivers a parcel to your house. |
| **Consignor** | The person or company **sending** the goods (our factory). | "Zigza Apparel Manufacturing Ltd." |
| **Consignee** | The person or company **receiving** the goods (the buyer). | "Zara Global Logistics Hub, Spain." |
| **Pre-Loading Counting Audit** | Counting every garment right before it goes into the truck to make sure numbers match. | Counting your cash at the bank counter before walking away. |
| **Reconciliation Status** | A check comparing **Cut Qty**, **Counted Qty**, and **Dispatched Qty**. | If Cut = 5,000, Counted = 5,000, Dispatched = 5,000 -> "MATCHED (OK)". |
| **Discrepancy** | Any mismatch where the counted physical pieces do not equal the expected pieces. | You expected 500 shirts in a pallet, but you only counted 498. That is a -2 discrepancy! |
| **E-Way Bill** | An electronic road permit required by government tax authorities for transporting commercial goods. | Like a digital highway toll passport for cargo trucks. |
| **GSTIN** | Goods and Services Tax Identification Number. The official government tax number of a company. | Like an Aadhaar or Social Security Number for a business. |
| **Gate Pass / Gate-Out** | The formal permission ticket given to security guards to let a loaded truck drive out of the factory gate. | Like an airport boarding pass to enter the airplane. |
| **Store Outward** | A permanent record subtracting dispatched items from factory warehouse inventory. | If you have 5,000 hoodies in storage and ship 5,000, the outward record changes stock to 0. |
| **POD (Proof of Delivery)** | The signed and stamped copy of the delivery challan returned by the buyer after unloading. | Proves the buyer actually received the goods safely without damages. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us look at every page, tab, modal, and button in `/dispatch` and understand **every single element**.

---

### SCREEN 1: The Main Dispatch & Logistics Cockpit (`/dispatch`)

When the Dispatch Manager opens `/dispatch`, this is the command center they see:

```
+----------------------------------------------------------------------------------------------------+
| [TRUCK ICON] Dispatch & Logistics Hub                                                              |
| Pre-loading physical counting, delivery challans, and transport tracking                           |
|                                                                                                    |
| [ ClipboardCheck: Record Counting ]   [ + New Delivery Challan ]   [ Download: Export CSV ]        |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ |
| │ TOTAL DISPATCHED     │ │ DELIVERY CHALLANS    │ │ COUNTED AUDITS       │ │ DISCREPANCIES       │ |
| │ 54,200 pcs           │ │ 38 issued            │ │ 54,200 pcs           │ │ 0 mismatches        │ |
| └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └─────────────────────┘ |
|                                                                                                    |
| [ Tab 1: Delivery Challans Master (38) ]   [ Tab 2: Pre-Loading Counting Audits (94) ]              |
| -------------------------------------------------------------------------------------------------- |
| Search: [ Type challan, buyer, or vehicle...     ]   Filter: [ ALL ] [ MATCHED ] [ DISCREPANCY ]   |
|                                                                                                    |
| +-------------+------------+-------------+-------------+------------+-------+---------+----------+ |
| | CHALLAN NO  | DATE       | BUYER NAME  | DESTINATION | VEHICLE NO | PCS   | STATUS  | ACTIONS  | |
| +-------------+------------+-------------+-------------+------------+-------+---------+----------+ |
| | CH-2026-8901| 28-Oct-2026| Zara Global | JNPT Port   | MH-04-AZ-49| 5,000 | [DISP]  | [Print]  | |
| | CH-2026-8894| 27-Oct-2026| H&M Retail  | Mumbai Dist | MH-12-BQ-11| 3,200 | [APPR]  | [Print]  | |
| | CH-2026-8889| 26-Oct-2026| Mango Ind   | Delhi Hub   | DL-01-EE-90| 2,400 | [DISP]  | [Print]  | |
| +-------------+------------+-------------+-------------+------------+-------+---------+----------+ |
| Showing 1 to 10 of 38 records                           [ Previous ] Page 1 of 4 [ Next ]          |
+----------------------------------------------------------------------------------------------------+
```

#### What does each box and button do?

1. **Header Action Buttons**:
   - **`[ Record Counting ]`**: Opens the pre-loading count audit window. Before loading a truck, inspectors enter physical piece counts.
   - **`[ + New Delivery Challan ]`**: Opens the Challan Generator to create a new legal shipping ticket for an outgoing truck.
   - **`[ Export CSV ]`**: Downloads the entire active table as an Excel-compatible `.csv` file for accounting audits.

2. **The 4 KPI Health Cards**:
   - **Total Dispatched**: Total garments successfully loaded, documented, and shipped from the plant this month (e.g. `54,200 pcs`).
   - **Delivery Challans**: Total official shipping challans issued to date (e.g. `38 issued`).
   - **Counted Audits**: Total garments physically counted and verified before truck loading (e.g. `54,200 pcs`).
   - **Discrepancies**: Total piece mismatches detected between factory inventory and physical truck load. If this number is `0`, the factory is in perfect balance! If higher than `0`, clicking this card immediately filters the table to show the problem orders.

3. **Navigation Tabs**:
   - **Tab 1: Delivery Challans Master**: Lists every vehicle dispatch document, destination, buyer, and gate status.
   - **Tab 2: Pre-Loading Counting Audits**: Shows line-by-line physical piece counts by style, color, and size.

4. **Search and Status Filters**:
   - Search bar searches across Challan Numbers (`CH-2026-8901`), Buyer Names (`Zara`), or Vehicle Numbers (`MH-04-AZ-4912`) with instant filtering.
   - Quick filters allow 1-click viewing of `MATCHED` (clean shipments), `DISCREPANCY` (mismatched shipments), or `PENDING` (awaiting gate clearance).

---

### SCREEN 2: Creating a New Delivery Challan (The Builder Modal)

When the Logistics Coordinator clicks **`[ + New Delivery Challan ]`**, this comprehensive modal opens:

```
+----------------------------------------------------------------------------------------------------+
| CREATE NEW DELIVERY CHALLAN                                                                    [X] |
+----------------------------------------------------------------------------------------------------+
| 1. BUYER & DESTINATION DETAILS                                                                     |
| Challan Number:   [ CH-2026-8901                                ] (Auto-generated or custom)       |
| Buyer Name:       [ Zara Global Logistics                      *] (Required)                       |
| Destination:      [ Nhava Sheva (JNPT) Container Terminal, Bay 4]                                   |
| Delivery Date:    [ 28-Oct-2026                                 ]                                   |
|                                                                                                    |
| 2. TRANSPORT & VEHICLE DETAILS                                                                     |
| Vehicle Number:   [ MH-04-AZ-4912                               ] (e.g. Truck / Container No.)     |
| Driver Name:      [ Ramesh Kumar                                ]                                   |
| Driver Phone:     [ +91 98201 44819                             ]                                   |
| Total Bags/Boxes: [ 200 Master Export Cartons                   ]                                   |
|                                                                                                    |
| 3. COMMERCIAL BILLING & SHIPPING ADDRESSES (GST COMPLIANT)                                         |
| Billed To Name:   [ Inditex Trent Retail India Pvt Ltd          ]                                   |
| Billed To Addr:   [ Express Towers, 14th Floor, Nariman Point, Mumbai - 400021                     ] |
| Billed To GSTIN:  [ 27AAACI1681G1Z0                             ]                                   |
| Shipping To Name: [ Zara Global Freight Consolidation Center    ]                                   |
| Shipping Address: [ Container Freight Station (CFS), Dronagiri Node, Navi Mumbai - 400707          ] |
|                                                                                                    |
| 4. ARTICLE DISPATCH ITEMS BREAKDOWN                                                                |
| +-------------------------+---------------+----------+------------+------------------------------+ |
| | ARTICLE / STYLE         | COLOR         | SIZE     | QUANTITY   | ACTIONS                      | |
| +-------------------------+---------------+----------+------------+------------------------------+ |
| | ART-HD-8821 (Hoodie)    | Jet Black     | S        | [ 1,000 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Jet Black     | M        | [ 1,000 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Jet Black     | L        | [   500 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Jet Black     | XS       | [   500 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Vintage Grey  | S        | [   700 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Vintage Grey  | M        | [   700 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Vintage Grey  | L        | [   300 ]  | [ Trash ]                    | |
| | ART-HD-8821 (Hoodie)    | Vintage Grey  | XS       | [   300 ]  | [ Trash ]                    | |
| +-------------------------+---------------+----------+------------+------------------------------+ |
| [ + Add Another Item Row ]                                                                         |
|                                                                                                    |
| SUMMARY: Total Articles: 8 rows  •  TOTAL PIECES TO DISPATCH: 5,000 PCS                            |
|                                                                                                    |
| [ Cancel ]                                                  [ Confirm & Generate Challan ]         |
+----------------------------------------------------------------------------------------------------+
```

#### Why are these fields vital?

- **Vehicle & Driver Phone**: If a container truck breaks down on the highway or gets stuck at a border checkpoint, the factory dispatcher can instantly call the driver from this record.
- **GSTIN & Billing Address**: Essential for legal tax compliance. In Indian and international freight law, transporting goods without a valid tax challan and matching GSTIN can lead to vehicle seizure and heavy fines!
- **Multi-Row Article Breakdown**: Allows splitting the shipment into exact color and size combinations. The system tallies all rows dynamically to ensure the grand total matches the purchase order.
- **Automated Stock Depletion**: The exact millisecond the user clicks **`[ Confirm & Generate Challan ]`**, the system creates an `OUTWARD` transaction in `store_transactions` for every single row. Factory inventory automatically reduces without needing manual warehouse adjustments!

---

### SCREEN 3: Pre-Loading Physical Counting Audit (`/dispatch` Tab 2)

This screen manages the critical physical counting that takes place on the loading platform before cartons are handed over to the trucker:

```
+----------------------------------------------------------------------------------------------------+
| PRE-LOADING PHYSICAL COUNTING AUDIT CONSOLE                                                        |
| Track verified piece counts, expected targets, and reconciliation differences                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| Search: [ Filter by article, color, size... ]                    [ + Record New Count Audit ]      |
|                                                                                                    |
| +------------+---------------+--------------+------+---------+----------+------------+-----------+ |
| | ENTRY DATE | ARTICLE NO    | COLOR        | SIZE | COUNTED | EXPECTED | DIFFERENCE | STATUS    | |
| +------------+---------------+--------------+------+---------+----------+------------+-----------+ |
| | 28-Oct-2026| ART-HD-8821   | Jet Black    | S    | 1,000   | 1,000    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Jet Black    | M    | 1,000   | 1,000    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Jet Black    | L    |   500   |   500    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Jet Black    | XS   |   500   |   500    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Vintage Grey | S    |   700   |   700    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Vintage Grey | M    |   700   |   700    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Vintage Grey | L    |   300   |   300    | 0 pcs      | [MATCHED] | |
| | 28-Oct-2026| ART-HD-8821   | Vintage Grey | XS   |   300   |   300    | 0 pcs      | [MATCHED] | |
| +------------+---------------+--------------+------+---------+----------+------------+-----------+ |
| AUDIT TOTALS: Counted: 5,000 pcs  •  Expected: 5,000 pcs  •  Net Discrepancy: 0 pcs                |
+----------------------------------------------------------------------------------------------------+
```

#### What happens if there is a difference?
- If an auditor counts `498` pieces when `500` were expected, the table turns **rose-red** and highlights:
  - **Difference: -2 pcs (SHORTAGE)**
  - Status changes from green `[MATCHED]` to pulsing red `[DISCREPANCY]`.
- The system prevents the delivery challan from receiving final Gate-Out authorization until the missing 2 pieces are either located in Central Store or officially written off by the Plant Manager!

---

### SCREEN 4: The Official Printable Delivery Challan & Gate Pass

When clicking the **`[ Print ]`** button on any challan, the system renders a clean, professional, printable A4 legal delivery document:

```
+----------------------------------------------------------------------------------------------------+
|                                  DELIVERY CHALLAN & GATE PASS                                      |
|                               ZIGZA APPAREL MANUFACTURING LTD.                                     |
|                       Plot 42-45, Industrial Apparel Park, Phase II, India                         |
|                         GSTIN: 27AABBC1234F1Z8  •  CIN: U18101MH2024PLC123456                      |
+----------------------------------------------------------------------------------------------------+
| CHALLAN NO: DC-ZIG-2026-8901                           DATE: 28-Oct-2026                           |
| PO NUMBER:  PO-ZIG-8901                                E-WAY BILL: EWB-99120481239                 |
+----------------------------------------------------+-----------------------------------------------+
| CONSIGNOR (DISPATCH FROM):                         | CONSIGNEE (BILLED TO):                        |
| Zigza Apparel Manufacturing Ltd.                   | Inditex Trent Retail India Pvt Ltd            |
| Factory Gate #2, Export Logistics Terminal         | Express Towers, Nariman Point, Mumbai - 400021|
| State: Maharashtra (Code: 27)                      | GSTIN: 27AAACI1681G1Z0 • State Code: 27       |
+----------------------------------------------------+-----------------------------------------------+
| TRANSPORT DETAILS:                                 | SHIP TO / DELIVERY DESTINATION:               |
| Transporter: SafeCargo Container Logistics         | Container Freight Station (CFS), Dronagiri    |
| Vehicle No:  MH-04-AZ-4912 (40ft Container Truck)  | Nhava Sheva Port, Navi Mumbai - 400707        |
| Driver Name: Ramesh Kumar  (Ph: +91 98201 44819)   | Container Seal No: ZIG-SEAL-88412             |
+----------------------------------------------------+-----------------------------------------------+
| SL | ARTICLE / DESCRIPTION            | COLOR        | SIZE | PACKED CTNS | QUANTITY (PCS)         |
+----+----------------------------------+--------------+------+-------------+------------------------+
| 01 | ART-HD-8821 Heavy French Terry   | Jet Black    | S    | 40 Cartons  | 1,000 pcs              |
| 02 | ART-HD-8821 Heavy French Terry   | Jet Black    | M    | 40 Cartons  | 1,000 pcs              |
| 03 | ART-HD-8821 Heavy French Terry   | Jet Black    | L    | 20 Cartons  |   500 pcs              |
| 04 | ART-HD-8821 Heavy French Terry   | Jet Black    | XS   | 20 Cartons  |   500 pcs              |
| 05 | ART-HD-8821 Heavy French Terry   | Vintage Grey | S    | 28 Cartons  |   700 pcs              |
| 06 | ART-HD-8821 Heavy French Terry   | Vintage Grey | M    | 28 Cartons  |   700 pcs              |
| 07 | ART-HD-8821 Heavy French Terry   | Vintage Grey | L    | 12 Cartons  |   300 pcs              |
| 08 | ART-HD-8821 Heavy French Terry   | Vintage Grey | XS   | 12 Cartons  |   300 pcs              |
+----+----------------------------------+--------------+------+-------------+------------------------+
| GRAND TOTAL:                                                | 200 CARTONS | 5,000 PIECES           |
+-------------------------------------------------------------+-------------+------------------------+
| Total Cartons in Words: Two Hundred Export Master Cartons Only                                     |
| Total Quantity in Words: Five Thousand Garment Units Only                                          |
|                                                                                                    |
| DECLARATION:                                                                                       |
| Certified that the particulars given above are true and correct and the goods dispatched are of    |
| standard quality as per Purchase Order specifications.                                             |
|                                                                                                    |
| ____________________       ____________________       ____________________    ___________________  |
| Prepared By (Clerk)        Verified By (Store)        Authorized Signatory    Driver Signature     |
+----------------------------------------------------------------------------------------------------+
| GATE-OUT SECURITY CLEARANCE:                                                                       |
| Security Gate #2 Sign: [ APPROVED & LOGGED ]   •   Exit Time: 28-Oct-2026 05:45 PM  •  Officer: SP |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Complete Real-Life Story: Order PO-ZIG-8901 Leaves the Factory

To understand how Division 12 operates on the ground, let us follow the final hours of our running example order: **Order `PO-ZIG-8901` (5,000 Heavyweight French Terry Hoodies, Style `ART-HD-8821`, Buyer: Zara Global)**.

```
+-----------------------------------------------------------------------------+
|               CHRONOLOGICAL TIMELINE OF DISPATCH & FACTORY GATE-OUT         |
+-----------------------------------------------------------------------------+
|                                                                             |
| 1. TRANSFER FROM CENTRAL STORE TO DOCK (Day 6 - 08:30 AM)                   |
|    - 200 sealed master export cartons staged in Central Store Export Bay 3. |
|    - Heavy-duty hydraulic pallet jacks roll the 200 cartons onto Loading    |
|      Dock Platform #2.                                                      |
|                                                                             |
| 2. PRE-LOADING COUNTING AUDIT (Day 6 - 10:00 AM)                            |
|    - Dispatch Inspector scans every carton's barcode ticket.                |
|    - Software verifies:                                                     |
|      * Jet Black:    800 XS/L + 2,000 S/M = 3,000 pcs [MATCHED]             |
|      * Vintage Grey: 600 XS/L + 1,400 S/M = 2,000 pcs [MATCHED]             |
|    - Grand Counted Total = 5,000 / Expected = 5,000 (Delta = 0 pcs).        |
|    - Physical count audit logged into `/dispatch` Tab 2.                    |
|                                                                             |
| 3. TRUCK ARRIVAL & DRIVER REGISTRATION (Day 6 - 01:15 PM)                   |
|    - SafeCargo Logistics 40-foot ocean container truck docks at Bay #2.     |
|    - Vehicle Number: `MH-04-AZ-4912`.                                       |
|    - Driver Ramesh Kumar presents container inspection fitness certificate. |
|    - Dispatch Clerk inspects inside container: dry, clean, zero rust,       |
|      waterproof rubber door seals intact.                                   |
|                                                                             |
| 4. DELIVERY CHALLAN GENERATION (Day 6 - 02:30 PM)                           |
|    - Dispatch Manager clicks `[ + New Delivery Challan ]`.                  |
|    - System creates official document `DC-ZIG-2026-8901`.                   |
|    - Government E-Way Bill `EWB-99120481239` generated and linked.         |
|    - Automated double-entry inventory transaction triggered:                |
|      `store_transactions` logs `OUTWARD` 5,000 pcs for `ART-HD-8821`.       |
|                                                                             |
| 5. STUFFING THE CONTAINER (Day 6 - 03:00 PM to 04:45 PM)                    |
|    - Pallet loaders pack all 200 cartons into the 40-foot container.        |
|    - Weight distribution evenly balanced across truck axles.                |
|    - Heavy-duty container doors swung shut.                                 |
|    - High-security steel bullet seal snapped into lock hole:                |
|      Seal Number: `ZIG-SEAL-88412`.                                         |
|                                                                             |
| 6. PLANT MANAGER GATE-OUT AUTHORIZATION (Day 6 - 05:15 PM)                  |
|    - Dispatch Manager clicks `[ Authorize Gate Out ]` in `/dispatch`.       |
|    - Status changes to green `[ DISPATCHED / APPROVED ]`.                   |
|    - 4 copies of Delivery Challan printed and signed:                       |
|      Copy 1: Transporter/Driver Copy (travels with truck)                   |
|      Copy 2: Consignee/Buyer Copy (given to port forwarder)                 |
|      Copy 3: Commercial Accounts/Billing Copy (for invoicing)               |
|      Copy 4: Factory Security Gate Copy (filed at security office)          |
|                                                                             |
| 7. PASSING SECURITY GATE #2 & HIGHWAY DEPARTURE (Day 6 - 05:45 PM)          |
|    - Truck pulls up to Factory Security Gate #2.                            |
|    - Security Guard checks driver's printed Challan against system screen:  |
|      * Seal `ZIG-SEAL-88412` intact and untouched.                          |
|      * Driver identity and license verified.                                |
|    - Security stamps Gate Pass, lifts hydraulic boom barrier.               |
|    - Truck heads toward Nhava Sheva (JNPT) port for ocean voyage to Spain!  |
+-----------------------------------------------------------------------------+
```

---

## 5. What Do Downstream & External Parties Receive?

When a shipment leaves Division 12, here is who receives what:

### A. What the Transporter & Driver (SafeCargo Logistics) Receive:
1. **Printed Delivery Challan (Driver Copy)**:
   - Contains driver name, truck registration, container seal number, and destination address.
2. **Government E-Way Bill**:
   - Legal electronic road transit permit protecting the driver from highway police or tax inspection delays.
3. **Emergency Factory Helpline Contacts**:
   - 24/7 logistics dispatch contact numbers in case of vehicle breakdown or road issues.

### B. What the Buyer & Port Terminal (Zara Global & JNPT Port) Receive:
1. **Certified Commercial Shipping Manifest**:
   - Exact breakdown of all 200 cartons, size-wise pieces, gross weight, and net weight.
2. **Consignee Delivery Copy**:
   - Signed by port receiving officer and returned to the factory as legal **Proof of Delivery (POD)**.
3. **Container Seal Integrity Certificate**:
   - Confirms seal `ZIG-SEAL-88412` was locked at the factory and never opened en route.

### C. What Factory Finance & Accounts Receive:
1. **Final Commercial Invoicing Trigger**:
   - The delivery challan acts as the financial proof of goods dispatched. Accounts can now generate the final commercial invoice (e.g. 5,000 pcs @ Rs 750 = Rs 37,50,000).
2. **Audited Stock Depletion Ledger**:
   - Inventory accounts reflect zero open finished goods for Order `PO-ZIG-8901`.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world factory dispatch failure modes and how our system prevents them:

### 1. Short-Shipment Claims by the Buyer
- **What can go wrong:** The buyer opens the container in Spain and claims: *"You only sent 4,990 hoodies! 10 are missing! We are deducting money from your payment!"*
- **How our system protects you:** The **Pre-Loading Physical Counting Audit** (`Tab 2`) records the verified count before truck loading. Every carton has an exact weight recorded in Division 09 (`±0.15 kg` scale check). Together with the intact container seal certificate, the factory has airtight legal proof that all 5,000 pieces were dispatched.

### 2. The Rogue Truck (Driver / Vehicle Swap)
- **What can go wrong:** The transport agency books truck `MH-04-AZ-4912`, but on the morning of dispatch, an unverified replacement truck arrives. If the paperwork shows the old truck number, highway tax officers will seize the truck and fine the factory!
- **How our system protects you:** The Delivery Challan Builder forces the dispatcher to confirm or update the live vehicle number and driver phone number before printing.

### 3. Bypassing Factory Gate Security
- **What can go wrong:** A loaded truck tries to drive out through the factory gate before commercial paperwork or export clearance is completed.
- **How our system protects you:** The security gate terminal shows a live gate monitor. Security guards are strictly prohibited from opening the gate unless the status in the software reads `APPROVED`.

### 4. Expired or Missing E-Way Bill Penalties
- **What can go wrong:** A truck leaves the factory, but the commercial team forgot to generate the government E-Way bill. State tax checkpoints stop the truck and levy a 200% penalty on the garment value!
- **How our system protects you:** The dispatch client provides dedicated fields for E-Way bill registration and displays a clear reminder prompt before challan authorization.

### 5. Ghost Pieces Leaving Godown Unrecorded
- **What can go wrong:** Cartons are loaded onto a truck, but nobody records the outward entry in the warehouse computer. Warehouse reports still show 5,000 hoodies in stock when the shelves are completely empty!
- **How our system protects you:** Automated database triggers in `actions.ts`. Generating a delivery challan automatically executes `store_transactions.insert(type: 'OUTWARD')` for every single line item. Human forgetfulness cannot desynchronize factory stock!

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/dispatch` | Main logistics command center to monitor outgoing shipments and KPIs | Dispatch Manager |
| **2** | `/dispatch` (Tab 2) | Records physical pre-loading piece counts and flags discrepancies | Counting Auditor |
| **3** | `New Challan Modal` | Builds official legal delivery challan with buyer, transport, and items | Logistics Coordinator |
| **4** | `Print Challan View` | Renders formal A4 tax-compliant delivery challan and gate pass | Commercial Billing Clerk |
| **5** | `Gate-Out Action` | Formally authorizes factory exit and updates warehouse outward ledger | Plant Manager & Security |

*This document is written in clean, plain language with zero emojis so every dispatcher, logistics clerk, forklift driver, and gate security officer can follow it clearly.*
