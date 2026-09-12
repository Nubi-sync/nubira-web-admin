# Division 08 • Steam Ironing & Finishing Floor Master Guide
### Zigza MES Garment Platform • Division 08 (Step 8 of 11)
**Where to find it in the app:** `/iron` (or `/stitching-sewing`)  
**Target Audience:** Finishing Supervisors, Boiler Engineers, Pressing Operators, Finish QC Auditors, and Plant Managers  
**Document File:** `docs_final/08_ironing.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 06 (Stitching Floor), tailors sewed the garments.  
In Division 07 (Industrial Washing), garments were softened in washing drums and tumble-dried.

However, when clothes exit tumble dryers or sewing lines, they are **rumpled, wrinkled, and puffy**:
- **Wrinkly clothes cannot be shipped to retail stores.** A customer in a store expects a brand-new hoodie or shirt to look razor-sharp, crisp, and smooth.
- **We cannot use regular home irons.** Home irons are too slow and can scorch or burn dark fabric, leaving ugly shiny streaks.
- **We use industrial vacuum steam tables and central steam boilers (4.5 Bar pressure).** High-pressure steam relaxes the cotton fibers in 3 seconds, and a powerful under-table vacuum motor sucks the hot steam straight through the cloth, instantly chilling and freezing the fabric into a crisp, wrinkle-free shape!

In an apparel factory, **Division 08 (Steam Ironing & Finishing Floor)** is the **presentation, pressing, and retail beauty clinic**.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 07. Washing Floor ] sends: 5,000 Softened, Dried Hoodies                |
|   [ Central Boiler    ] sends: 4.5 Bar dry steam at 154°C                   |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 08. STEAM IRONING & FINISHING FLOOR                     |               |
|   | 1. Boiler Telemetry    ---> Maintain 4.5 Bar pressure   |               |
|   |                             with clean condensate traps |               |
|   | 2. Teflon Iron Shoes   ---> Protect dark fabric from    |               |
|   |                             thermal shine and glaze     |               |
|   | 3. Vacuum Buck Tables  ---> Press body, hood, & sleeves;|               |
|   |                             pedal vacuum chills shape   |               |
|   | 4. Finish QC Audit     ---> 1,000-lux lamp check for    |               |
|   |                             water spots & crushed seams |               |
|   | 5. Finishing Wages     ---> Auto-calculate operator     |               |
|   |                             piece-rate (Rs 3.50/pc)     |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               v (All 5,000 garments crisp, zero-glaze, and bone-dry)        |
|   [ 09. Ready Goods & Export Packing ]                                      |
|   Workers fold garments, attach price hangtags, pack into polybags, and box  |
|   into export shipping cartons!                                             |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used on the steam finishing floor every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Steam Pressing** | Using high-temperature steam under pressure to relax cloth fibers and remove wrinkles without rubbing. | Pressing steam into a thick fleece hoodie so the seams lay completely flat and crisp. |
| **Vacuum Buck Table** | A specialized industrial ironing table with tiny holes connected to a powerful vacuum suction motor. | When the presser steps on the foot pedal, the table sucks the garment down tight so it cannot slip while ironing. |
| **Central Boiler** | A giant industrial steam generator in the factory utility yard that sends steam through steel pipes. | Generates steam at `4.5 Bar` pressure (approx. 154°C) to power 12 ironing tables simultaneously. |
| **Bar (Steam Pressure)** | The metric unit used to measure steam power. | Standard car tires have 2.2 Bar pressure. Our ironing steam runs at `4.5 Bar`—double the pressure of a car tire! |
| **Teflon Shoe** | A protective aluminum and non-stick Teflon cover clipped onto the bottom plate of the iron. | Like a non-stick frying pan, it stops the hot metal iron from scorching dark cotton or creating shiny marks! |
| **Thermal Glaze (Shine)** | An ugly mirror-like reflective shine created when a hot iron crushes dark fibers too hard. | If you iron a black hoodie with a bare iron, the seams turn shiny and reflective. That is thermal glaze, and buyers reject it! |
| **Water Spotting (Spitting)** | When an iron accidentally spits drops of rusty boiler water onto clean garments instead of dry steam. | Leaves water rings or dirty yellow stains on clean white shirts. Must be prevented by condensate traps! |
| **Condensate Trap** | An automatic valve in the steam pipe that catches cooled water droplets and drains them away. | Ensures only 100% dry, invisible steam reaches the iron plate with zero water spits. |
| **Form Finisher (Dummy)** | An inflatable textile mannequin doll that inflates with hot steam from the inside out. | Like putting a wet jacket on a ghost that puffs up with hot steam to remove all wrinkles in 10 seconds! |
| **First Pass Rate** | The percentage of garments that pass finishing inspection on the very first try. | If 100 hoodies are pressed and 99 pass with zero shine or water spots, the First Pass Rate is `99.0%`. |
| **Finishing SAM** | Standard Allowed Minutes to press one complete garment. | A basic t-shirt SAM is `0.45 minutes`; a heavyweight hoodie SAM is `0.85 minutes` (approx. 51 seconds). |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 08 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Steam Finishing Cockpit (`/iron`)

This is the control center where the Finishing Floor Supervisor monitors daily pressed piece counts, boiler pressure, table status, and piece-rate finishing payroll.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                                [ Division 08 * Iron ]|
+-----------------------------------------------------------------------------------------+
| Ironing & Steam Pressing Floor                                    [ Finishing Unit Live]|
| Boiler steam pressing (4.5 Bar), 12 vacuum buck tables, zero-glaze, & piece-rate wages   |
|         [ Boiler Gauges ] [ Vacuum Tables ] [ Finishing QC ] [ Handover to Packing ]    |
+---------------------+---------------------+---------------------+-----------------------+
| DAILY PRESSED VOLUME| BOILER PRESSURE     | ACTIVE VACUUM TABLES| FIRST PASS QC RATE    |
| 4,680 Pcs           | 4.5 Bar             | 10 / 12 Online      | 99.1% Pass            |
| Target: 7,500 (62%) | Optimal: 4.2-4.8 Bar| Teflon Shoes Active | Zero Glaze / Shine SLA|
+---------------------+---------------------+---------------------+-----------------------+
| BOILER STEAM TELEMETRY TICKER                                                           |
| Status: OPTIMAL FLOW • Pressure: 4.5 Bar • Boiler Temp: 154°C • Condensate: NORMAL    |
| Central boiler feeding 12 vacuum stations with automated condensate traps draining      |
+-----------------------------------------------------------------------------------------+
| STEAM VACUUM BUCK TABLES MATRIX (12 STATIONS)                                           |
| Table #  | Station Type     | Operator   | Challan Lot | Pieces Done | Rate   | Status |
| TBL-01   | Vacuum Buck Bed  | P. Raman   | PO-ZIG-8901 | 480 pcs     | Rs 3.50| ACTIVE |
| TBL-02   | Vacuum Buck Bed  | K. Suresh  | PO-ZIG-8901 | 495 pcs     | Rs 3.50| ACTIVE |
| TBL-03   | Utility Form Fin | M. Vimal   | PO-ZIG-8901 | 510 pcs     | Rs 3.50| ACTIVE |
| TBL-04   | Vacuum Buck Bed  | Maintenance| Offline     | 0 pcs       | --     | SERVICE|
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Operational KPI Cards (What are they & Why are they here?)

1. **Daily Pressed Volume (`4,680 Pcs • Target 7,500`)**:
   - **What it shows:** Total number of garments pressed, checked, and placed onto packing trollies today.
   - **Why it is here:** Finishing is the final physical barrier before packing. If pressing is slow, the packing lines run out of work and export container loading is delayed!
2. **Boiler Pressure (`4.5 Bar • Optimal Flow`)**:
   - **What it shows:** Live steam pressure feeding the floor from the factory boiler.
   - **Why it is here:** If pressure drops below 3.8 Bar, irons become cold and wet, spitting dirty water droplets onto clothes!
3. **Active Vacuum Tables (`10 / 12 Online`)**:
   - **What it shows:** How many ironing stations have active operators pressing garments.
   - **Why it is here:** Ensures maximum station utilization and alerts mechanics if a vacuum pump or table heater needs servicing.
4. **First Pass QC Rate (`99.1% • Zero Glaze SLA`)**:
   - **What it shows:** Percentage of garments that pass inspection without needing touch-ups.
   - **Why it is here:** Prevents expensive re-ironing and guarantees garments have zero thermal shine or scorch marks.

---

#### Box 2: Central Boiler Steam Telemetry Ticker
Continuous live feed from boiler room sensor probes:
- **Steam Pressure (`4.5 Bar`)**: Ideal operating range is 4.2 Bar to 4.8 Bar.
- **Boiler Temperature (`154°C`)**: Guarantees superheated dry steam.
- **Condensate Trap Status (`NORMAL`)**: Automatic traps open every 60 seconds to purge condensed water droplets so irons never spit water.

---

#### Box 3: 12-Station Vacuum Buck Tables Matrix
Every card represents an individual pressing station:
- **Table Number**: Table 01 to Table 12.
- **Station Type**: Standard Flat Vacuum Buck Table or Vertical Inflatable Form Finisher.
- **Operator Name**: Assigned presser (e.g. `P. Raman`).
- **Pieces Done Today**: Real-time counter of pressed pieces.
- **Piece Rate**: Payment rate per garment (e.g. `Rs 3.50 per piece`).
- **Live Status Badges**: `[ACTIVE]`, `[IDLE]`, or `[MAINTENANCE]`.

---

### SCREEN 2: Vacuum Table Operational Allotment (`/iron/tables`)

This page is where finishing supervisors assign operators to tables, allocate buyer order lots, and monitor operator speeds.

```
+-----------------------------------------------------------------------------------------+
| [<- Finishing Floor]                                            [ + Allot Table Work ]  |
+-----------------------------------------------------------------------------------------+
| Vacuum Table Work Allotments & Operator Assignments                                     |
+-----------------------------------------------------------------------------------------+
| TABLE ID | OPERATOR   | PO NUMBER   | ARTICLE REF   | TARGET | PRESSED | SAM   | STATUS |
| TBL-01   | P. Raman   | PO-ZIG-8901 | ART-HD-8821   | 500 pcs| 480 pcs | 0.85m | ACTIVE |
| TBL-02   | K. Suresh  | PO-ZIG-8901 | ART-HD-8821   | 500 pcs| 495 pcs | 0.85m | ACTIVE |
| TBL-03   | M. Vimal   | PO-ZIG-8901 | ART-HD-8821   | 500 pcs| 510 pcs | 0.85m | ACTIVE |
+-----------------------------------------------------------------------------------------+
```

#### How the Vacuum Foot Pedal Works (The 3-Step Pressing Cycle):
1. **Step 1 (Steam Flow)**: The operator places the hoodie front onto the table, pulls the iron trigger, and sweeps dry steam across the chest. Steam relaxes all cotton fibers.
2. **Step 2 (Vacuum Pedal)**: The operator steps on the table foot pedal. A 0.75 kW vacuum motor turns on underneath, instantly sucking the hot steam down through the table mesh.
3. **Step 3 (Chill & Freeze)**: As outside room air is sucked through the fabric, the cloth cools from 140°C down to 30°C in 2 seconds! This "freezes" the flat, crisp shape permanently into the garment.

---

### SCREEN 3: Finishing Quality Inspection Gate (`/iron/finish-qc`)

Every garment coming off the vacuum tables must pass through the Finish QC inspection station under 1,000-lux neutral daylight lamps.

```
+------------------------------------------------------------------------+
| FINISHING QUALITY AUDIT MODAL                                    [ X ] |
+------------------------------------------------------------------------+
| Allotment / Lot:       [ IRN-2026-092 • PO-ZIG-8901 Zara Hoodie      ] |
| Pressing Operator:     [ P. Raman (Table 01)                         ] |
| Total Inspected:       [ 100 Garments                                ] |
+------------------------------------------------------------------------+
| DEFECT AUDIT CHECKLIST:                                                |
| Passed (Zero Glaze):   [ 99 Garments ] ---> [ Pass to Packing Floor ]  |
| Rejected for Touch-up: [  1 Garment  ] ---> [ Return to Iron Table ]   |
|                                                                        |
| Defect Type Found:     [ THERMAL_SHINE_GLAZE_SEAM                    v]|
| Defect Severity:       [ MINOR                                       v]|
| Corrective Action:     [ STEAM_PUFF_BRUSH_REWORK                     v]|
| Inspector Notes:       [ Minor seam shine on right sleeve cuff.       ]|
+------------------------------------------------------------------------+
|                                        [ Cancel ] [ Submit QC Report ] |
+------------------------------------------------------------------------+
```

#### The 4 Critical Checks in Finishing QC:
1. **Thermal Shine & Glaze (ISO 105-X11 Standard)**:
   - Inspector tilts the dark fabric under bright light. If seams look shiny or glassy, the Teflon shoe was worn out or iron pressure was too heavy!
2. **Water Droplet Spotting**:
   - Checks for dirty yellow or rusty water stains caused by boiler line spitting.
3. **Crushed Creases & Pocket Flares**:
   - The kangaroo pocket and hood seams must lay completely flat without accidental pressed-in wrinkles or fold creases.
4. **Bone-Dry Touch Check**:
   - The garment must feel completely cool and dry to the touch. If it feels warm and damp, the operator released the vacuum pedal too early!

---

### SCREEN 4: Finishing Piece-Rate Payroll & Wages (`/iron/wages`)

In apparel finishing, pressers are compensated on **piece-rate wages** based on the number of clean, passed garments they press each shift.

```
+-----------------------------------------------------------------------------------------+
| [<- Finishing Floor]                                             [ + Export Wage Sheet ]|
+-----------------------------------------------------------------------------------------+
| Finishing Piece-Rate Payroll & Operator Daily Wage Ledger                               |
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL SHIFT WAGES   | TOTAL PRESSED PCS   | AVG OPERATOR OUTPUT | OPERATOR EFFICIENCY   |
| Rs 16,380.00        | 4,680 Pcs           | 468 Pcs / Operator  | 108.4% (Above Target) |
| (4,680 pcs @ Rs 3.50| Net Finishing Wages | 10 Operators Active | Standard SAM: 0.85m   |
+---------------------+---------------------+---------------------+-----------------------+
| OPERATOR DAILY EARNINGS TABLE:                                                          |
| Operator Name | Table ID | Pieces Pressed | Passed QC | Defect | Piece Rate | Total Wage|
| P. Raman      | TBL-01   | 480 pcs        | 478 pcs   | 2 pcs  | Rs 3.50    | Rs 1,673.0|
| K. Suresh     | TBL-02   | 495 pcs        | 494 pcs   | 1 pc   | Rs 3.50    | Rs 1,729.0|
| M. Vimal      | TBL-03   | 510 pcs        | 508 pcs   | 2 pcs  | Rs 3.50    | Rs 1,778.0|
+-----------------------------------------------------------------------------------------+
```

#### How Finishing Efficiency is Calculated:
$$\text{Finishing Efficiency \%} = \left(\frac{\text{Passed Pieces} \times \text{Standard SAM (0.85 min)}}{\text{Actual Shift Minutes (420 min)}}\right) \times 100$$
- If an operator presses 494 hoodies in 420 minutes:
  $$\text{Efficiency} = \left(\frac{494 \times 0.85}{420}\right) \times 100 = \mathbf{100.0\%}\text{ target achieved}!$$

---

### SCREEN 5: Custody Handover to Ready Goods Packing (`/iron/handover`)

Once inspected, garments are folded or placed on hangers and wheeled in clean canvas trollies to the Packing Department.

```
+-----------------------------------------------------------------------------------------+
| [<- Finishing Floor]                                                                    |
+-----------------------------------------------------------------------------------------+
| Handover Custody Transfer to Ready Goods Packing                                        |
+---------------------+---------------------+---------------------+-----------------------+
| COMPLETED LOTS READY| TOTAL PRESSED PCS   | ZERO-GLAZE AUDIT    | HANDOVER CARTONS      |
| 6 Lots              | 5,000 Pcs           | 100% Passed         | 200 Trolley Bins      |
+---------------------+---------------------+---------------------+-----------------------+
| HANDOVER VERIFICATION TABLE:                                                            |
| Lot Number  | Style Code  | Order PO    | Qty Pressed | QC Status    | Transfer Action  |
| IRN-LOT-091 | ART-HD-8821 | PO-ZIG-8901 | 800 pcs     | [ 100% PASS ]| [ Handover -> ]  |
| IRN-LOT-092 | ART-HD-8821 | PO-ZIG-8901 | 800 pcs     | [ 100% PASS ]| [ Handover -> ]  |
| IRN-LOT-093 | ART-HD-8821 | PO-ZIG-8901 | 800 pcs     | [ 100% PASS ]| [ Handover -> ]  |
+-----------------------------------------------------------------------------------------+
```

---

## 4. The Complete Story of Order PO-ZIG-8901 in Steam Finishing

Let us follow how **5,000 Heavyweight French Terry Hoodies** are pressed to retail perfection:

```
1. 5,000 WASHED HOODIES ARRIVE (Day 5 - 11:30 AM)
   Division 07 (Industrial Washing) wheels 5,000 clean, dry hoodies to Finishing.
   Residual moisture verified: 5.3% (Bone Dry).
       |
       v
2. CENTRAL BOILER PRESSURE VERIFIED (Day 5 - 11:45 AM)
   Finishing supervisor checks boiler telemetry:
   - Steam Pressure: 4.5 Bar (Locked).
   - Boiler Temp: 154°C.
   - Condensate traps auto-drained.
       |
       v
3. 12 VACUUM TABLES LOADED (Day 5 - 12:00 PM)
   Teflon shoe covers inspected on all 12 irons (zero scratches).
   Work order PO-ZIG-8901 allotted across 10 pressing operators.
       |
       v
4. PRESSING & VACUUM EXECUTION (Day 5 - 12:15 PM to 05:00 PM)
   Operators follow the calibrated 5-step movement:
   - 1. Sleeve smoothing: Steam cuff and sleeve seams flat.
   - 2. Kangaroo pocket: Steam pocket borders without crushing fleece loops.
   - 3. Front & back body: Sweep iron across chest graphic.
   - 4. Hood curvature: Lay hood on buck horn and steam 3D embroidery.
   - 5. Vacuum Pedal: Hold foot down for 3 seconds. Vacuum sucks out all heat.
       |
       v
5. FINISH QC 100% AUDIT (Day 5 - 05:30 PM)
   Auditors check garments under 1,000-lux neutral lights:
   - 4,985 Hoodies Passed (Zero thermal glaze, sharp seams, bone dry).
   - 15 Hoodies returned to operators for 10-second steam puff touch-ups.
       |
       v
6. PIECE-RATE WAGE ACCRUAL (Day 5 - 06:00 PM)
   System logs piece-rate credit for 5,000 finished hoodies:
   - 5,000 pcs x Rs 3.50 = Rs 17,500.00 total finishing payroll.
       |
       v
7. HANDOVER TO READY GOODS PACKING (Day 5 - 06:30 PM)
   Hoodies stacked cleanly in 25-piece canvas trollies.
   Barcode status updated: [ DISPATCHED_TO_PACKING ].
   Handed over to Division 09 (Ready Goods Packing) for hangtags and polybags!
```

---

## 5. What Do Downstream Divisions Receive?

When garments leave Division 08, here is who receives what:

### A. What Division 09 (Ready Goods & Export Packing) Receives:
1. **The Crisp, Retail-Ready Garments**:
   - All 5,000 hoodies pressed flat, bone-dry, with zero wrinkles.
   - Guaranteed zero thermal shine/glaze on seams.
2. **The Finishing Transfer Manifest**:
   - Lists exact piece counts per size and color (e.g. 800 XS, 1,700 S, 1,700 M, 800 L).
   - Packing crews can immediately fold, tag, and pack without sorting out messy, wrinkled clothes.

### B. The Touch-Up Rework Loop (Within Division 08):
- Any garment with a minor fold crease or pocket curl is handed back to Table 01 for a quick 10-second steam touch-up and re-vacuumed.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world finishing floor hazards and how our system prevents them:

### 1. Thermal Shine & Seam Glaze on Dark Cotton
- **What can go wrong:** An operator uses an old iron with a scratched or missing Teflon shoe. When the hot bare metal touches black French Terry, the intense heat melts cotton micro-fibers, creating a permanent mirror-like shine. The buyer will reject the entire shipment!
- **How our system protects you:** The `/iron/tables` checklist requires daily shift verification of Teflon shoe condition. QC auditors inspect dark seams under 1,000-lux lamps and fail any lot with glaze defects.

### 2. Boiler Water Spitting Stains
- **What can go wrong:** If the steam pipe condensate trap fails, cooled water accumulates in the iron hose. When the operator presses the steam trigger, the iron shoots a jet of dirty, rusty hot water directly onto a clean white chest graphic!
- **How our system protects you:** Live boiler telemetry monitors condensate drainage. If pipe temperature drops below 135°C, the system issues a **Condensate Trap Alert** to blow the drain valve before water reaches the iron plates.

### 3. Premature Vacuum Release (Wrinkle Rebound)
- **What can go wrong:** An operator is in a rush to hit piece-rate targets, so they steam the garment and pull it off the table *without* holding down the vacuum pedal. The hot, damp cloth cools slowly in the cart and wrinkles immediately rebound!
- **How our system protects you:** Work study SAM calculations enforce a minimum 3-second vacuum dwell per garment. QC checks for cool, bone-dry touch before clearing trollies.

### 4. Boiler Pressure Drop Bottlenecks
- **What can go wrong:** If the factory boiler runs low on fuel and pressure drops from 4.5 Bar down to 2.5 Bar, steam becomes wet and cold. All 12 pressing stations grind to a halt.
- **How our system protects you:** Continuous pressure sensors in `/iron/boiler-telemetry` trigger an audible alarm if pressure drops below 3.8 Bar, alerting utility engineers before production stops.

### 5. Piece-Count Discrepancies at Packing Handover
- **What can go wrong:** Finishing logs claim 5,000 hoodies were pressed, but the packing floor only counts 4,970 in the trollies. Where did the missing 30 hoodies go?
- **How our system protects you:** Finishing logs are tied directly to order barcodes. Packing supervisors must scan and accept each incoming trolley lot, creating a locked custody timestamp.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/iron` | Main dashboard to track daily pressed pieces, boiler PSI, and table matrix | Finishing Supervisor |
| **2** | `/iron/tables` | Manages 12 vacuum buck tables, operator allocations, and Teflon shoes | Floor Supervisor |
| **3** | `/iron/boiler-telemetry` | Monitors live boiler steam pressure (4.5 Bar) and condensate drain traps | Boiler Engineer |
| **4** | `/iron/finish-qc` | Audits garments under 1,000-lux lights for zero thermal shine and water spots | QC Auditor |
| **5** | `/iron/wages` | Calculates piece-rate payroll (Rs 3.50/pc) and operator SAM efficiency | Payroll Clerk |
| **6** | `/iron/handover` | Verifies bone-dry finished garments and transfers custody to Packing | Handover Clerk |

*This document is written in clean, plain language with zero emojis so every pressing operator, boiler technician, and supervisor can follow it clearly.*
