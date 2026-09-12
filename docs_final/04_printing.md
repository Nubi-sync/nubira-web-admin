# Division 04 • Screen & Digital Printing Unit Master Guide
### Zigza MES Garment Platform • Division 04 (Step 4 of 11)
**Where to find it in the app:** `/printing`  
**Target Audience:** Print Masters, Screen Technicians, Ink Kitchen Chemists, Table Operators, Curing QC Inspectors, and Floor Managers  
**Document File:** `docs_final/04_printing.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 03 (Cutting Floor), we chopped fabric rolls into shaped garment parts (front bodies, back bodies, sleeves, and hoods) and tied them into 25-piece bundles with QR barcodes.

Now, many garments need pictures, brand logos, or artwork printed on them:
- **We print on flat cut panels before they are sewn together.** Why? Because printing a flat piece of cloth on a table is 10 times faster, sharper, and cleaner than trying to print on an already-sewn, bulky hoodie with zippers and seams!
- **We prepare the screens and mix ink formulas** to match the buyer's exact Pantone colors.
- **We bake the ink in a high-temperature heat tunnel (160 degrees Celsius)** so the print will never crack, peel, or wash out in a washing machine.

In an apparel factory, **Division 04 (Screen & Digital Printing Unit)** is the **surface art and color laboratory**.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 03. Cutting Floor ] sends: 200 bundles of Front Body Panels (5,000 pcs) |
|   [ 01. Design Studio ] sends: Vector graphic artwork & Pantone color codes |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 04. SCREEN & DIGITAL PRINTING UNIT                      |               |
|   | 1. Ink Kitchen         ---> Mix pigments to match exact |               |
|   |                             Pantone colors with scales  |               |
|   | 2. Screen Preparation  ---> Burn stencils on mesh screens|               |
|   |                             with UV light exposure      |               |
|   | 3. Strike-Off Test     ---> Print 1 sample piece and    |               |
|   |                             get buyer Golden Approval   |               |
|   | 4. Bulk Table Printing ---> Conveyor tables & squeegees |               |
|   |                             press ink through screens   |               |
|   | 5. 160°C Curing Tunnel ---> Bake ink for 120 seconds to |               |
|   |                             lock colors into the cotton |               |
|   | 6. Wash & Rub QC       ---> Check for crocking/peeling  |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               v (All 5,000 printed panels verified zero-defect)             |
|   [ 06. Stitching & Sewing Floor ]                                          |
|   Tailors sew the printed front panels to backs, sleeves, and hoods to      |
|   complete the finished hoodies!                                            |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used in the printing unit every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Cut Panel Printing** | Printing graphics on flat fabric pieces before they are sewn into clothes. | Printing the front chest of a hoodie while it is still just a flat piece of black cloth on a wooden pallet. |
| **Screen (Silk Screen)** | A light aluminum frame stretched tight with fine nylon mesh fabric, used like a stencil. | Like holding a paper stencil over paper and spraying paint, but made with precision mesh. |
| **Mesh Count** | How many tiny threads are woven per inch of screen mesh. Higher numbers mean finer details. | `110 mesh` for thick white ink; `230 mesh` or `305 mesh` for razor-sharp micro-lettering. |
| **Squeegee** | A rubber blade held in a metal handle used to push ink across the screen. | Like a window cleaner's squeegee, but made of stiff industrial rubber that forces ink through mesh pores. |
| **Strike-Off** | A single trial sample printed on scrap cloth to show the buyer before printing 5,000 shirts. | "The buyer inspected the strike-off swatch under daylight lamps and signed it: Approved for Bulk." |
| **Pantone (PMS)** | The worldwide universal color number system. | Instead of saying "navy blue", we say `Pantone 19-4052 TCX` so the mill, buyer, and factory use the exact same color. |
| **Delta E (dE)** | The mathematical color difference score measured by an optical spectrophotometer scanner. | If Delta E is under 1.0, the human eye cannot see any color difference. It is an exact color match! |
| **Plastisol Ink** | Thick PVC-based oil ink that sits on top of the fabric with bright, vivid colors. Needs heat to dry. | The durable, rubbery print you feel on gym t-shirts and sports jerseys. |
| **Water-Based Ink** | Eco-friendly ink that sinks directly into cotton fibers. It feels completely soft with zero plastic feel. | The super-soft vintage graphic print on luxury fashion hoodies. |
| **Curing Tunnel (Oven)** | A long heated conveyor belt oven that bakes printed cloth at 160 degrees Celsius for 2 minutes. | If ink is not baked properly, it will wash away in the buyer's home laundry machine! |
| **Wash Fastness** | Testing if ink stays bright and does not fade or bleed after 5 machine wash cycles. | We wash a test panel in detergent at 60 degrees C. If no color runs, it passes AATCC standard. |
| **Rub Crocking** | Rubbing a white dry and wet cloth against the print 10 times to make sure color does not rub off. | If a white t-shirt turns blue when rubbing against a printed jacket, that is bad crocking! |
| **Registration** | Lining up multiple color screens perfectly so colors do not overlap or leave ugly white gaps. | If red and black print 1 millimeter off-center, the cartoon eyes look blurry or crooked! |
| **DTG (Direct to Garment)** | An industrial inkjet printer that sprays colors directly onto cloth without using screens. | Like an office paper printer, but for clothes. Great for complex photographic prints and short orders. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us tour every page in Division 04 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Printing Floor Cockpit (`/printing`)

This is the central control screen where the Print Department Head watches active printing tables, daily panel output, ink approvals, and curing temperatures.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 04 * Printing] |
+-----------------------------------------------------------------------------------------+
| Screen & Digital Printing Floor                               [ Curing Tunnel: 160°C OK ]|
| Conveyor screen printing, industrial Kornit DTG queues, strike-offs, and curing ovens   |
|         [ Strike-Off Approvals ] [ Screen Stencils ] [ Ink Kitchen ] [ + Table Runs ]   |
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE TABLE LOTS   | PANELS PRINTED TODAY| STRIKE-OFF PASS RATE| SCREEN STENCILS READY |
| 6 Active Runs       | 4,250 Pcs           | 100% Passed         | 24 / 28 Screens       |
| 8 Conveyor tables   | 4,300 planned (1.1%)| Delta E <= 0.85 avg | 120-305 mesh ready    |
+---------------------+---------------------+---------------------+-----------------------+
| CONTINUOUS SPREADING TABLE & DTG MACHINE MATRIX                                         |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
| | STATION 01      | | STATION 02      | | STATION 03      | | STATION 04      |        |
| | [ RUNNING ]     | | [ COMPLETED ]   | | [ RUNNING ]     | | [ SETUP ]       |        |
| | 60m Conveyor 01 | | 60m Conveyor 02 | | Kornit DTG 01   | | Manual Table 03 |        |
| | Job: PRN-031    | | Job: PRN-030    | | Job: PRN-029    | | Job: Setup Run  |        |
| | 1,800/2,000 pcs | | 1,500/1,500 pcs | | 450/500 pcs     | | Installing mesh |        |
| | Tunnel: 161°C   | | Tunnel: 160°C   | | Heat Press: 165°| | Waiting for ink |        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
+-----------------------------------------------------------------------------------------+
| LIVE PRODUCTION RUNS TABLE                                                              |
| Run Code  | PO Number   | Style & Design     | Machine Type| Panels Done | Reject| Status  |
| PRN-031   | PO-ZIG-8901 | ART-HD-8821 Hoodie | Conveyor 01 | 1,800/2,000 | 18 pcs| PRINTING|
| PRN-030   | PO-ZIG-8901 | ART-HD-8821 Hoodie | Conveyor 02 | 1,500/1,500 | 12 pcs| CMPLT   |
| PRN-029   | PO-ZIG-8899 | Vintage Tee Graphic| Kornit DTG  | 450/500 pcs | 4 pcs | PRINTING|
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Printing KPI Cards (What are they & Why are they here?)

1. **Active Table Lots (`6 Active Runs`)**:
   - **What it shows:** Number of printing tables or digital printers actively running production right now.
   - **Why it is here:** Ensures all printing stations are working and no expensive printing tables sit empty.
2. **Panels Printed Today (`4,250 Pcs`)**:
   - **What it shows:** Total garment panels printed and sent through the drying tunnel today.
   - **Why it is here:** Compares actual output against the planned factory target (e.g. 4,300 pcs) with a low scrap rate (1.1%).
3. **Strike-Off Pass Rate (`100% Passed • Delta E <= 0.85`)**:
   - **What it shows:** How accurately our ink colors match the buyer's requested Pantone standards.
   - **Why it is here:** An optical reading of Delta E under 1.0 guarantees the buyer will not reject the batch for wrong color shade.
4. **Screen Stencils Ready (`24 / 28 Screens`)**:
   - **What it shows:** How many exposed and washed screens are dry, inspected, and waiting on racks for tomorrow's jobs.
   - **Why it is here:** Prevents printing table operators from waiting around with no screens ready.

---

#### Box 2: Machine & Conveyor Table Matrix
Apparel printing is done on long 60-meter conveyor tables or automated carousel machines:
- **Station Type**: 60-meter Continuous Table, 12-Color Carousel Octopus, or Kornit High-Speed Industrial DTG.
- **Live Status Badges**:
  - `[RUNNING]`: Operators are spreading cut panels and pulling squeegees.
  - `[SETUP]`: Technicians are clamping screens and setting registration lasers.
  - `[COMPLETED]`: All panels for this work order have been printed and dried.
- **Continuous Oven Temperature Probe**: Shows real-time heat in the drying tunnel (e.g. `161°C`). If temperature drops below 155°C, the system triggers a warning so ink doesn't exit under-baked!

---

#### Box 3: Live Production Runs Table
Tracks each production lot running through the print shop:
- **Run Code (e.g. `PRN-2026-031`)**: The tracking number for this printing run.
- **PO Number & Style**: Links directly to the buyer purchase order from Merchandising.
- **Machine Assigned**: Table 01, Table 02, or DTG Machine.
- **Progress Counter**: Shows completed panels vs total target (e.g. `1,800 / 2,000 pcs`).
- **Rejection Counter**: Number of panels spoiled by pinholes, smudges, or lint (e.g. `18 pcs`).

---

### SCREEN 2: Strike-Off Golden Swatch Desk (`/printing/strike-offs`)

Before printing thousands of panels, the print shop must print 1 test piece on real fabric and get signed approval. This is the **Strike-Off Gate**.

```
+-----------------------------------------------------------------------------------------+
| [<- Printing Floor]                                             [ + Submit Strike-Off ] |
+-----------------------------------------------------------------------------------------+
| Printing Strike-Off Approvals & Pantone Color Swatches                                  |
| Search: [ Search design, style, PO...         ] Filter: [ All Statuses v ]              |
+-----------------------------------------------------------------------------------------+
| SWATCH CODE | PO NUMBER   | DESIGN NAME       | TECHNIQUE   | PANTONE CODES| STATUS     |
+-------------+-------------+-------------------+-------------+--------------+------------+
| STR-0142    | PO-ZIG-8901 | Zara Chest Arch   | Water-Based | 19-4052 TCX  | APPROVED   |
| STR-0143    | PO-ZIG-8901 | Zara Back Motto   | High-Density| 11-0601 TCX  | PENDING    |
| STR-0141    | PO-ZIG-8898 | Urban Wave Icon   | Puff Ink    | 16-1546 TCX  | REJECTED   |
+-----------------------------------------------------------------------------------------+
```

#### The "Submit Strike-Off" Modal:
When the print master submits a sample test, this form records the technical recipe:

```
+------------------------------------------------------------------------+
| SUBMIT NEW PRINTING STRIKE-OFF                                   [ X ] |
+------------------------------------------------------------------------+
| Buyer Order (PO):      [ PO-ZIG-8901 - ZARA GLOBAL                   v ]|
| Print Design Name:     [ Front Chest Arch Logo                        ]|
| Print Technique:       [ WATER_BASED                                 v ]|
| Pantone Target Codes:  [ 19-4052 TCX (Classic Navy), 11-0601 (White)  ]|
| Mesh Count Used:       [ 160 Mesh per inch                            ]|
| Squeegee Hardness:     [ 75 Shore A (Medium Stiff)                    ]|
| Spectro Delta E Reading:[ 0.62 (Excellent Match)                      ]|
| Strike-Off Swatch Photo:[ Upload photo of printed cloth swatch        ]|
| Curing Oven Test:      [ 160°C for 120 seconds                        ]|
| Initial Approval:      [ Awaiting Buyer / Tech-Pack Sign-Off         v ]|
|                                         [ Cancel ] [ Save & Log Swatch]|
+------------------------------------------------------------------------+
```

#### Why is the Strike-Off Gate Strict?
- If you print 5,000 black hoodies with the wrong shade of navy blue, the buyer will reject the entire Rs 37,50,000 shipment!
- By locking the database with `buyer_approved = true`, the software physically **blocks bulk printing runs from starting** until the Golden Strike-Off is signed and verified.

---

### SCREEN 3: Screen Mesh Stencil Library (`/printing/screens`)

A screen is the stencil that transfers ink to cloth. This screen manages the inventory of aluminum screen frames, mesh tensions, and chemical emulsion coatings.

```
+-----------------------------------------------------------------------------------------+
| [<- Printing Floor]                                             [ + Create New Screen ] |
+-----------------------------------------------------------------------------------------+
| Screen Stencil Inventory, Mesh Tension & Chemical Exposure                              |
+---------------------+---------------------+---------------------+-----------------------+
| SCREENS IN SERVICE  | READY FOR PRINT     | IN EXPOSURE / WASH  | NEED RECLAIMING       |
| 36 Screens          | 24 Ready            | 4 In Prep           | 8 To Reclaim          |
+---------------------+---------------------+---------------------+-----------------------+
| SCREEN STENCIL INVENTORY                                                                |
| Screen ID  | Design Name        | Color Layer| Mesh Count | Tension N/cm | Screen Status|
| SCR-0381   | Zara Front Arch 01 | Navy Base  | 160 Mesh   | 24 N/cm (OK) | READY_FOR_PRN|
| SCR-0382   | Zara Front Arch 02 | White Text | 200 Mesh   | 22 N/cm (OK) | READY_FOR_PRN|
| SCR-0383   | Zara Front Arch 03 | Gold Star  | 230 Mesh   | 21 N/cm (OK) | IN_USE_TBL_01|
| SCR-0370   | Old Job Complete   | Reclaim Me | 120 Mesh   | 16 N/cm (Low)| TO_RECLAIM   |
+-----------------------------------------------------------------------------------------+
```

#### What is Screen Mesh Tension (N/cm)?
- Like a musical drum, the mesh screen must be stretched tight on its aluminum frame.
- We measure tightness with a mechanical tension meter in **Newtons per centimeter (N/cm)**.
- **Standard**: Screen mesh must have at least **20 to 25 N/cm** of tension.
- If tension drops below 16 N/cm, the screen sags like a loose trampoline. When the squeegee pushes down, the print smears and lines look blurry!

---

### SCREEN 4: Ink Kitchen & Pantone Color Formulation (`/printing/ink-kitchen`)

The Ink Kitchen is the chemistry lab of the print shop. Operators mix raw pigment colors into base paste using high-precision digital scales.

```
+-----------------------------------------------------------------------------------------+
| [<- Printing Floor]                                             [ + Mix New Ink Batch ] |
+-----------------------------------------------------------------------------------------+
| Ink Kitchen Formulation, Pantone Recipes & Viscosity Testing                            |
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE INK RECIPES  | TOTAL INK IN STOCK  | ECO-PASSPORT PASS   | AVERAGE VISCOSITY     |
| 18 Recipes          | 340 kg Ready Paste  | 100% Oeko-Tex Safe  | 35,000 cps (Optimal)  |
+---------------------+---------------------+---------------------+-----------------------+
| INK COLOR RECIPES TABLE                                                                 |
| Recipe Code| Color Name     | Base Chemistry | Pigment Formula Breakdown    | Target PMS|
| REC-NAV-01 | Classic Navy   | Water-Based    | 85% Clear Base + 12% Blue +  | 19-4052   |
|            |                | Discharge      | 2.5% Black + 0.5% Violet     | TCX       |
| REC-WHT-02 | Ultra Opaque   | Low-Bleed      | 70% White Paste + 25% TiO2 + | 11-0601   |
|            | Snow White     | Plastisol      | 5% Soft Hand Reducer         | TCX       |
+-----------------------------------------------------------------------------------------+
```

#### How the Ink Kitchen Protects Fabric Quality:
1. **Oeko-Tex Standard 100 & Eco-Passport**:
   - International buyers strictly ban toxic heavy metals (lead, cadmium) and phthalates.
   - All inks mixed in the kitchen must use certified eco-friendly pigment concentrates.
2. **Ink Viscosity Check**:
   - Viscosity is how thick or runny the ink is (measured in centipoise cps).
   - If ink is too thick (like cold peanut butter), it clogs the screen mesh.
   - If ink is too thin (like water), it bleeds across the cotton threads and looks messy.

---

### SCREEN 5: Production Table Runs & Bundle Intake (`/printing/table-runs`)

This screen is where cut bundles from Division 03 are received, printed on tables, and checked piece-by-piece.

```
+-----------------------------------------------------------------------------------------+
| [<- Printing Floor]                                             [ + Start Table Run ]   |
+-----------------------------------------------------------------------------------------+
| Production Table Runs & Cut Bundle Reconciliation                                       |
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE RUNS         | INPUT PANELS        | PASSED PANELS       | REJECTED PANELS       |
| 4 Runs              | 5,000 Panels        | 4,942 Panels        | 58 Panels (1.16%)     |
+---------------------+---------------------+---------------------+-----------------------+
| RUN BUNDLE DETAILS MODAL / CARD                                                         |
| Run: PRN-2026-031 • Style: ART-HD-8821 Hoodie • Station: Conveyor Table 01              |
+-----------------------------------------------------------------------------------------+
| BUNDLE BARCODE   | SIZE | RECEIVED PCS | PASSED PCS | REJECTED PCS | DEFECT TYPE        |
+------------------+------+--------------+------------+--------------+--------------------+
| BND-0842-M-001   | M    | 25 pcs       | 25 pcs     | 0 pcs        | [ Clean Pass ]     |
| BND-0842-M-002   | M    | 25 pcs       | 24 pcs     | 1 pc         | INK_SMUDGE         |
| BND-0842-M-003   | M    | 25 pcs       | 23 pcs     | 2 pcs        | PINHOLE_DEFECT     |
+------------------+------+--------------+------------+--------------+--------------------+
| TOTALS           |      | 75 Panels    | 72 Passed  | 3 Rejected   | Reconciliation: OK |
+-----------------------------------------------------------------------------------------+
```

#### The Automatic Piece-Count Reconciliation Rule:
Look at the numbers for `BND-0842-M-002`:
- Received: `25 pieces`
- Passed: `24 pieces`
- Rejected: `1 piece`
- Formula: $\text{Passed} (24) + \text{Rejected} (1) = \text{Received} (25)$.
- The database enforces:
  ```sql
  reconciliation_valid BOOLEAN GENERATED ALWAYS AS (received_pieces = passed_pieces + rejected_pieces) STORED
  ```
- If an operator tries to enter 24 passed and 0 rejected, the computer rejects the entry: *"Missing 1 piece! You received 25 panels from Cutting, where is the missing panel?"* No panel can vanish without being accounted for!

---

### SCREEN 6: Curing Tunnel Telemetry & Quality Assurance (`/printing/curing-qc`)

After ink is applied, the panels ride a conveyor belt through the long infrared heat tunnel oven. This screen monitors temperature probes and wash-test audits.

```
+-----------------------------------------------------------------------------------------+
| [<- Printing Floor]                                             [ + Log Oven Probe ]    |
+-----------------------------------------------------------------------------------------+
| Curing Tunnel Temperature Telemetry & Wash Fastness QC                                  |
+---------------------+---------------------+---------------------+-----------------------+
| TUNNEL 01 CHAMBER 1 | TUNNEL 01 CHAMBER 2 | DWELL TIME          | AATCC WASH SCORE      |
| 160.5°C (Locked)    | 162.0°C (Locked)    | 120 Seconds         | 4.5 / 5.0 (Passed)    |
+---------------------+---------------------+---------------------+-----------------------+
| HOURLY OVEN TEMPERATURE AUDIT LOGS                                                      |
| Time Stamp| Tunnel ID | Probe 1 Temp| Probe 2 Temp| Dwell Time | Speed m/min | Status   |
| 02:00 PM  | TUNNEL-01 | 161.2°C     | 162.5°C     | 122 sec    | 2.5 m/min   | OPTIMAL  |
| 01:00 PM  | TUNNEL-01 | 160.8°C     | 161.9°C     | 120 sec    | 2.5 m/min   | OPTIMAL  |
| 12:00 PM  | TUNNEL-01 | 152.0°C     | 154.2°C     | 120 sec    | 2.5 m/min   | UNDER_CUR|
+-----------------------------------------------------------------------------------------+
```

#### Why is 160°C for 120 Seconds Mandatory?
- In plastisol and water-based inks, the chemical polymers and resin binders must cross-link under heat.
- If the oven is only 140°C, the print *looks* dry on the outside, but inside the ink is still raw paste.
- The first time a customer washes the hoodie, the entire graphic flakes off like dried mud!
- If an hourly temperature check drops below **158°C**, the system marks the run with an **Under-Cure Quarantine Alert** and holds that batch until panels are re-cured through the tunnel.

---

## 4. The Complete Story of Order PO-ZIG-8901 in Printing

Let us follow how the front panels for **5,000 Heavyweight French Terry Hoodies** are printed:

```
1. CUT FRONT PANELS ARRIVE FROM CUTTING (Day 2 - 03:00 PM)
   Cutting Floor dispatches 200 bundles of Front Body Panels (25 pcs each).
   Supervisor scans incoming QR barcodes into /printing/table-runs.
       |
       v
2. INK KITCHEN MIXES PANTONE NAVY & WHITE (Day 2 - 03:30 PM)
   Chemists prepare 40 kg of Water-Based Discharge Navy (Pantone 19-4052 TCX).
   Formulation recipe REC-NAV-01 is weighed on digital scales.
       |
       v
3. SCREEN STENCIL PREPARATION (Day 2 - 04:15 PM)
   Screen technicians coat two 160-mesh aluminum frames with photo-emulsion.
   Exposed under UV light and washed with pressure water spray.
   Tension measured: 23 N/cm (Tight & Ready).
       |
       v
4. GOLDEN STRIKE-OFF APPROVAL (Day 2 - 05:00 PM)
   Technician prints 1 sample panel on Table 01.
   Spectrophotometer reads Delta E = 0.62.
   Buyer approves swatch via mobile portal. Status flips to [ APPROVED ].
       |
       v
5. BULK TABLE RUN ON 60-METER CONVEYOR 01 (Day 3 - 08:00 AM)
   Operators lay 80 cut panels along the heated table pallets.
   Automatic squeegee carriage strokes Navy ink across all screens.
   Flash cure unit dries the first coat in 4 seconds.
   Second screen passes White accent lettering.
       |
       v
6. 160°C CURING TUNNEL TUNNEL-01 (Day 3 - 09:00 AM)
   Panels enter the infrared heat tunnel conveyor belt.
   Bake for 120 seconds at 161°C. Ink cross-links permanently into cotton.
       |
       v
7. QC AUDIT & PIECE-COUNT RECONCILIATION (Day 3 - 04:00 PM)
   5,000 total panels printed:
   - 4,942 panels Passed (Zero Defect).
   - 58 panels Rejected (pinholes, ink smudges).
   - Defect log records: 58 panels sent for re-cut to Division 03.
       |
       v
8. BUNDLE HANDOVER TO STITCHING (Day 3 - 05:00 PM)
   Passed panels are re-banded into their original 25-piece bundles.
   Barcode status updated to [ DISPATCHED_TO_SEWING ].
   Handed over to Division 06 (Stitching Floor Line 04) for final garment assembly!
```

---

## 5. What Do Downstream Divisions Receive?

When printed bundles leave Division 04, here is who receives what:

### A. What Division 06 (Stitching & Sewing Floor) Receives:
1. **The Decorated Front Body Panels**:
   - All 5,000 front panels printed with the approved water-based Zara graphic.
   - Clean, fully cured, completely dry, and bundled in their original 25-piece sequence.
2. **The Bundle QR Custody Transfer**:
   - Stitching line supervisors scan barcode `BND-0842-M-001`.
   - The computer confirms: *"Printed front panels received on Line 04. Ready for front-to-back assembly."*

### B. What Division 03 (Cutting Floor) Receives (Defect Recut Loop):
1. **The Recut Requisition (`58 Panels`)**:
   - The printing defect log identified 58 rejected panels (e.g. 30 Size M, 28 Size L).
   - Division 03 receives an automatic ticket: *"Please cut 58 replacement Front Panels from Lot-402 end-bit remnants."*
   - Once cut, these 58 replacement panels are printed and merged into the order so the buyer gets their exact 5,000 garments without shortages!

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world factory hazards in printing and how our system prevents them:

### 1. The Under-Cured Ink Catastrophe
- **What can go wrong:** If the drying tunnel heating element blows a fuse and the temperature drops to 135°C, thousands of shirts get printed with uncured ink. They look fine in the factory, but when the retail buyer washes them, all the prints peel off, leading to a total shipment chargeback!
- **How our system protects you:** The telemetry engine requires hourly probe temperature logging in `/printing/curing-qc`. If temperature drops below 158°C, the system marks the run `OVEN_ALARM_HOLD` and warns the supervisor immediately.

### 2. Off-Registration Color Blurs
- **What can go wrong:** If a screen clamp is slightly loose or the screen has weak tension (under 16 N/cm), multi-color graphics shift. A 1-millimeter gap appears between colors, making the logo look doubled or blurry.
- **How our system protects you:** The screen management screen requires recording `mesh_tension_n_cm`. Any screen below 20 N/cm cannot be selected for multi-color production runs.

### 3. Dye Bleeding / Sublimation Migration on Polyester-Blends
- **What can go wrong:** When printing white ink onto dark polyester fleece, heated polyester dye gasses turn white ink into an ugly dirty pink!
- **How our system protects you:** The Ink Kitchen recipe specifies `Low-Bleed Barrier Carbon Base` for all polyester and poly-cotton blends.

### 4. Screen Pinholes
- **What can go wrong:** A tiny speck of dust on the screen exposure glass creates a microscopic hole in the stencil. During a long run, ink leaks through this hole, putting a random black dot on every single white chest panel.
- **How our system protects you:** Panel QC inspectors perform visual checks every 50 panels. If a repeating dot appears, the defect is logged as `PINHOLE`, and the screen is instantly retouched with screen blockout filler.

### 5. The Disappearing Panel Mystery (Ghost Deficit)
- **What can go wrong:** A print operator messes up 10 panels, gets scared of getting scolded, and throws them in the factory trash can without telling anyone. Later, the sewing line is short 10 pieces and cannot finish the order!
- **How our system protects you:** Database piece reconciliation: $\text{Received} = \text{Passed} + \text{Rejected}$. An operator cannot close a bundle run without logging every single panel. If 1 piece is missing, the system will not let the run finish until the piece is found or officially recorded as scrap!

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/printing` | Main dashboard to view active tables, daily pieces, and curing alarms | Print Department Head |
| **2** | `/printing/strike-offs` | Prints single test swatch and locks Pantone color approval | Print Master & Buyer |
| **3** | `/printing/screens` | Manages screen stencils, mesh tension (N/cm), and UV exposure | Screen Prep Tech |
| **4** | `/printing/ink-kitchen` | Weighs pigments on digital scales to mix exact Pantone ink recipes | Ink Chemist |
| **5** | `/printing/table-runs` | Production runs, squeegee table passes, and bundle reconciliation | Table Operator |
| **6** | `/printing/curing-qc` | 160°C oven heat logs, wash fastness, and rub crocking audits | QC Inspector |

*This document is written in clean, plain language with zero emojis so every technician and worker in the printing department can follow it clearly.*
