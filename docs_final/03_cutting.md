# Division 03 • Cutting & Lay Floor Master Guide
### Zigza MES Garment Platform • Division 03 (Step 3 of 11)
**Where to find it in the app:** `/cutting`  
**Target Audience:** Cutting Masters, Spreading Operators, Bundle Clerks, Quality Auditors, and Floor Supervisors  
**Document File:** `docs_final/03_cutting.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 01 (Design Studio), we made the design blueprints.  
In Division 02 (Merchandising), we bought the fabric rolls and booked the buyer order.

Now comes the moment of physical creation:
- **Cloth arrives in heavy rolls** from the warehouse.
- **We cannot sew rolls of cloth.** A hoodie needs front bodies, back bodies, sleeves, hoods, cuffs, and pockets.
- **We must cut the flat cloth** into exact paper-pattern shapes.

In a garment factory, **Division 03 (Cutting & Lay Floor)** is the **physical birthplace of every single garment**. 

Here is why this floor is so special:
> **The Zero Ghost Piece Law**: You cannot sew a piece that was never cut! Every single hoodie, t-shirt, or pant that exists in our software starts its life right here as a numbered bundle ticket with a QR barcode.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 02. Merchandising ] sends order: "Cut 5,000 Hoodies for PO-ZIG-8901"     |
|   [ 11. Central Store ] sends: 4,250 kg of Black French Terry rolls         |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 03. CUTTING & LAY FLOOR                                 |               |
|   | 1. Fabric Relaxation  ---> Let cloth rest for 24 hours  |               |
|   |                            so it will not shrink later  |               |
|   | 2. CAD Marker Design  ---> Fit pattern puzzle pieces to |               |
|   |                            waste minimum cloth (>86%)   |               |
|   | 3. Spreading on Table ---> Lay 80 plies of cloth flat   |               |
|   | 4. Cutting Execution  ---> Vacuum table locks cloth,    |               |
|   |                            sharp knife cuts shapes      |               |
|   | 5. Panel QC Check     ---> Check notches and edges      |               |
|   | 6. Bundle QR Tagging  ---> Tie 25 sleeves together with |               |
|   |                            a unique scannable barcode   |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               +----------------------+----------------------+               |
|               | (If screen print)    | (If chest embroider) | (Plain sew)   |
|               v                      v                      v               |
|     [ 04. Printing Unit ]  [ 05. Embroidery ]      [ 06. Stitching Floor ]  |
|     Prints front panels    Stitches logos          Tailors sew all panels   |
|                                                    into completed hoodies   |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used on the cutting floor every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Ply (Plies)** | A single flat sheet or layer of fabric laid down on the long cutting table. | If you spread 80 layers of cloth on top of each other, that is 80 plies. One knife cut cuts 80 sleeves at once! |
| **Lay (Lay Sheet)** | The entire stack of fabric plies spread on the table, plus the paperwork tracking it. | Lay sheet `LAY-2026-0842` has 80 plies, 5.4 meters long, on Table 01. |
| **Marker** | A long paper sheet printed with all the garment pattern pieces arranged tightly like a puzzle. | The cutter places the marker on top of the fabric stack so the knife knows exactly where to cut. |
| **Marker Efficiency** | The percentage of fabric actually used for garment pieces versus what gets thrown away as scrap. | If 88% of the cloth becomes hoodie panels and 12% is scrap corners, efficiency is 88%. Higher is better! |
| **Bundle** | A small tied stack of matching cut panels (usually 20 to 30 pieces) with a paper barcode ticket. | A bundle of 25 Front Panels for Size M in Jet Black. |
| **Bundle Barcode / QR** | A unique sticker or paper tag attached to every bundle. | `BND-0842-M-001`. When scanned, the computer knows who cut it, who sewed it, and which table it came from. |
| **Shade Grouping** | Sorting fabric rolls so slightly lighter or darker rolls are never mixed together. | If Roll 1 is dark black and Roll 2 is slightly greyish black, we never cut them in the same shirt, or the left sleeve won't match the body! |
| **Notch** | A tiny 2-millimeter snip on the edge of the cut cloth. | Tailors line up notches like puzzle notches to sew seams straight. |
| **Ply Deflection** | When the top layer of cloth is cut perfectly, but the bottom layer under the heavy stack shifts and is cut crooked. | Our vacuum tables suck the cloth down tight so the knife cuts top and bottom plies with 0-millimeter error. |
| **Fabric Relaxation** | Unrolling tight knit cloth and letting it rest flat on racks for 24 hours before cutting. | Knit cloth is stretched tight on rolls. If you cut it immediately, it shrinks like a rubber band and shirts turn out too small! |
| **End-Bit / Remnant** | The short leftover piece of cloth at the very end of a roll (under 1.5 meters) that is too short for a full lay. | We save end-bits on a special rack to cut small parts like pocket bags or neck ribbing. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 03 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Cutting Floor Cockpit (`/cutting`)

This is the control tower where the Cutting Floor Manager sees all cutting tables, active lays, and bundle handovers in real time.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 03 * Cutting ] |
+-----------------------------------------------------------------------------------------+
| Cutting & Lay Floor                                           [ Vacuum Table Sync Active ]|
| Automated spreading plies, CAD marker efficiency, CNC knife, and QR bundle dispatch     |
|                      [ Lay Sheets ] [ Bundle QR ] [ Markers ] [ Panel QC ] [ End-Bits ] |
+---------------------+---------------------+---------------------+-----------------------+
| COMPLETED CUT VOLUME| CAD MARKER YIELD    | ACTIVE QR BUNDLES   | USABLE END-BITS       |
| 14,800 pcs          | 88.4%               | 42 in transit       | 124.5 m               |
| From completed lays | Target >86.0%       | 120 total generated | 18 remnants in rack   |
+---------------------+---------------------+---------------------+-----------------------+
| CUTTING TABLES & VACUUM STATIONS                                                        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
| | TABLE 01        | | TABLE 02        | | TABLE 03        | | TABLE 04        |        |
| | [ SPREADING ]   | | [ CUTTING ]     | | [ IDLE ]        | | [ MAINTENANCE ] |        |
| | Main Gerber CNC | | Lectra Vector   | | Manual Table 3  | | East Spreader   |        |
| | 12m x 72" Bed   | | 10m x 68" Bed   | | 8m x 60" Bed    | | 12m x 72" Bed   |        |
| | Job: LAY-0842   | | Job: LAY-0841   | | No active lay   | | Blade servicing |        |
| | 80 plies/800pcs | | 60 plies/600pcs | | Click to assign | | Ready in 1 hour |        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
+---------------------------------------------------+-------------------------------------+
| ACTIVE LAY SHEETS QUEUE                           | DEPARTMENT HANDOVER PIPELINE        |
| Lay Ref   | Style & Fabric   | Plies/Pcs| Status  | Bundle #   | Size | Target | Status |
| LAY-0842  | Hoodie Heavy FT  | 80/800   | SPREAD  | BND-0842-M1| M-25 | 06-SEW | IN_TRN |
| LAY-0841  | Jogger Fleece    | 60/600   | CUTTING | BND-0842-S1| S-25 | 05-EMB | BANDED |
| LAY-0840  | Crewneck Terry   | 100/1000 | COMPLT  | BND-0841-L1| L-25 | 04-PRN | GENRTI |
+---------------------------------------------------+-------------------------------------+
```

#### Box 1: The 4 Operational KPI Cards (What are they & Why are they here?)

1. **Completed Cut Volume (`14,800 pcs`)**:
   - **What it shows:** Total number of garment pieces cut and ready this week.
   - **Why it is here:** The manager checks if the cutting floor is producing enough pieces each day to keep the stitching lines running without stopping.
2. **CAD Marker Yield (`88.4%`)**:
   - **What it shows:** The average fabric utilization score across all markers.
   - **Why it is here:** Fabric makes up more than 50% of the cost of a shirt. If this drops below 86%, the factory is losing money on cloth scrap!
3. **Active QR Bundles (`42 in transit`)**:
   - **What it shows:** Bundles that have been cut and banded, but have not yet been scanned and received by Sewing or Printing.
   - **Why it is here:** Prevents cut bundles from getting lost or left sitting on carts in factory aisles.
4. **Usable End-Bits (`124.5 m`)**:
   - **What it shows:** Total meters of leftover fabric remnants stored in the recut salvage rack.
   - **Why it is here:** Reminds cutters to use short fabric rolls for pockets, hoods, and test cuts before opening a fresh roll.

---

#### Box 2: Cutting Tables Real-Time Grid
Every factory has several cutting tables. In our app, each card represents a physical table:
- **Table Number & Machine Model**: Table 01 (Gerber CNC automatic cutter), Table 02 (Lectra Vector cutter), Table 03 (Manual round knife table).
- **Dimensions**: Bed length in meters (e.g. 12 meters) and width in inches (e.g. 72 inches).
- **Live Status Badges**:
  - `[IDLE]`: The table is clean and empty, waiting for fabric.
  - `[SPREADING]`: Operators are unrolling and laying down plies of cloth.
  - `[CUTTING]`: The automated vacuum knife is running and slicing panels.
  - `[MAINTENANCE]`: Table is stopped for blade sharpening or vacuum pump service.
- **Click to Manage**: Clicking any table card opens a popup window where the supervisor can change its status or assign an operator.

---

#### Box 3: Active Lay Sheets Queue
This table shows what is happening on the cutting floor right now:
- **Lay Ref (e.g. `LAY-2026-0842`)**: The unique job number for this fabric stack.
- **Style & Fabric**: Style name and cloth type (e.g. `Heavyweight French Terry 380 GSM`).
- **Plies / Pieces**: Number of plies spread (e.g. 80 plies) and total pieces that will be cut (e.g. 800 pieces).
- **Status Badges**:
  - `[SPREADING]`: Fabric is being unrolled.
  - `[READY_FOR_CUT]`: Plies are checked and marker is clamped on top.
  - `[CUT_IN_PROGRESS]`: The cutter is actively cutting.
  - `[CUT_COMPLETED]`: All pieces are cut out.
  - `[BUNDLED]`: Pieces are sorted, tied, and tagged with QR barcodes.
- **Inspect Button**: Opens the full lay details drawer showing roll numbers, marker lengths, and ratio breakdowns.

---

#### Box 4: Department Handover Pipeline
Shows cut bundles moving out of the cutting room to their next destination:
- **Bundle Barcode (e.g. `BND-0842-M-001`)**: The serialized bundle tag.
- **Destination Badge**:
  - `[06 Sewing Floor]`: Plain panels going straight to stitching lines.
  - `[04 Screen Print]`: Front panels going to screen printing before sewing.
  - `[05 Embroidery]`: Chest panels going to embroidery machines.
- **Advance Step Button**: With one click, changes the bundle status from `GENERATED` -> `BANDED` -> `IN_TRANSIT` -> `HANDOVER_CONFIRMED`.

---

### SCREEN 2: Spreading & Lay Sheet Master (`/cutting/lay-sheets`)

This page is where the Cutting Master plans the physical spreading of fabric before any knife touches the cloth.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                              [ + Create Lay Sheet ]  |
+-----------------------------------------------------------------------------------------+
| Master Lay Sheets & Spreading Records                                                   |
| Search: [ Search lay #, PO, style...          ] Filter: [ All Statuses v ]              |
+-----------------------------------------------------------------------------------------+
| LAY NUMBER  | PO NUMBER   | STYLE NAME        | TABLE    | PLIES | PIECES | STATUS      |
+-------------+-------------+-------------------+----------+-------+--------+-------------+
| LAY-0842    | PO-ZIG-8901 | French Terry HD   | Table 01 | 80    | 800    | SPREADING   |
| LAY-0841    | PO-ZIG-8901 | French Terry HD   | Table 02 | 80    | 800    | READY_TO_CUT|
| LAY-0840    | PO-ZIG-8900 | Basic Crew Sweat  | Table 01 | 100   | 1,000  | BUNDLED     |
+-----------------------------------------------------------------------------------------+
```

#### The "Create Lay Sheet" Modal (Step-by-Step)
When the cutting master clicks the purple **`+ Create Lay Sheet`** button, this form opens:

```
+------------------------------------------------------------------------+
| CREATE NEW LAY SHEET                                             [ X ] |
+------------------------------------------------------------------------+
| Lay Number:            [ LAY-2026-0843               ]                 |
| Production Order (PO): [ PO-ZIG-8901                 ]                 |
| Buyer Brand:           [ ZARA GLOBAL                 ]                 |
| Style Ref & Name:      [ ART-HD-8821 • French Terry Hoodie ]           |
| Cutting Table:         [ Table 01 - Main CNC Gerber  v ]               |
| Shell Fabric:          [ 100% Cotton French Terry 380 GSM ]            |
| Fabric Roll Barcodes:  [ ROL-FT-8821-A1, ROL-FT-8821-A2  ]             |
+------------------------------------------------------------------------+
| PLY & RATIO MATHEMATICS:                                               |
| Marker Length (meters): [ 5.40  ]    Total Plies to Spread: [ 80    ]  |
| Size Ratio Text:        [ XS:1, S:2, M:4, L:2, XL:1                 ]  |
|                                                                        |
| Calculated Sum of Ratio Units: 1 + 2 + 4 + 2 + 1 = 10 units            |
| Expected Cut Pieces: 80 plies x 10 units = 800 pieces                  |
| Total Fabric Consumed: 80 plies x 5.40m = 432.0 meters of cloth        |
+------------------------------------------------------------------------+
| Cutting Master:        [ R. Veerappan (Master Cutter)     ]            |
| Initial Status:        [ SPREADING                     v ]             |
|                                     [ Cancel ] [ Create & Start Lay ]  |
+------------------------------------------------------------------------+
```

#### How the Math Works Inside the Modal:
1. **The Ratio Multiplier**:
   - The cutting master enters the ratio: `XS:1, S:2, M:4, L:2, XL:1`.
   - The computer adds the ratio numbers together: 1 + 2 + 4 + 2 + 1 = 10 ratio units.
2. **Total Pieces Calculation**:
   - The master spreads 80 plies.
   - Total pieces produced = 80 plies x 10 units = **800 cut garments**!
   - Breakdown:
     - Size XS: 80 x 1 = 80 pieces
     - Size S: 80 x 2 = 160 pieces
     - Size M: 80 x 4 = 320 pieces
     - Size L: 80 x 2 = 160 pieces
     - Size XL: 80 x 1 = 80 pieces
3. **Total Cloth Used**:
   - Each ply is 5.40 meters long.
   - 80 plies x 5.40 m = **432.0 meters** of cloth unrolled from rolls `ROL-FT-8821-A1` and `ROL-FT-8821-A2`.

---

### SCREEN 3: Serialized QR Bundle Dispatch Desk (`/cutting/bundles`)

This is the most critical room on the cutting floor. Here, cut fabric stacks are separated into small bundles of 25 pieces, tied with cloth strips, and labeled with scannable QR stickers.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                              [ + Generate Bundles ]  |
+-----------------------------------------------------------------------------------------+
| Serialized Garment Bundles & QR Dispatch                                                |
| Filter: [ All Destinations v ] [ All Statuses v ]  Search: [ Scan or Type Barcode...  ] |
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL BUNDLES       | IN TRANSIT          | CONFIRMED RECEIVED  | TOTAL DISPATCHED PCS  |
| 160 Bundles         | 42 Bundles          | 118 Bundles         | 2,950 Pieces          |
+---------------------+---------------------+---------------------+-----------------------+
| BUNDLE TICKET CARD VIEW                                                                 |
| +-----------------------------------+ +-----------------------------------+             |
| | BND-0842-M-001                    | | BND-0842-M-002                    |             |
| | Style: ART-HD-8821 Hoodie         | | Style: ART-HD-8821 Hoodie         |             |
| | Size: M | Color: Jet Black        | | Size: M | Color: Jet Black        |             |
| | Quantity: 25 Pieces               | | Quantity: 25 Pieces               |             |
| | Plies: 1 to 25                    | | Plies: 26 to 50                   |             |
| | Route: [ 06 STITCHING FLOOR ]     | | Route: [ 06 STITCHING FLOOR ]     |             |
| | Status: [ HANDOVER_CONFIRMED ]    | | Status: [ IN_TRANSIT ]            |             |
| | QR: ZIGZA-BND-0842-M-001          | | QR: ZIGZA-BND-0842-M-002          |             |
| |           [ Print Ticket ]        | |   [ Advance Step -> ] [ Print ]   |             |
| +-----------------------------------+ +-----------------------------------+             |
+-----------------------------------------------------------------------------------------+
```

#### Why Do We Bundle in Groups of 25 Pieces?
- You cannot hand a tailor a giant stack of 800 sleeves! It is too heavy, panels will fall on the floor and get dirty, and parts will get mixed up.
- We tie panels into manageable bundles of **20 to 25 pieces**.
- **Every bundle has a Ply Range**:
  - Bundle 1 = Plies 1 to 25
  - Bundle 2 = Plies 26 to 50
  - Bundle 3 = Plies 51 to 75
  - Bundle 4 = Plies 76 to 80 (the final 5 pieces)
- **The Golden Rule of Sewing**: A tailor must sew Front Panel from Bundle 1 with Back Panel from Bundle 1! If you sew a Front from Ply 2 with a Back from Ply 78, the color shade might not match perfectly!

#### The Bundle Ticket Printout:
Clicking **`Print Ticket`** prints a sticky thermal barcode label (100mm x 50mm) that sticks directly onto the bundle ribbon:

```
+-----------------------------------------------------+
| ZIGZA MES  *  CUT COMPONENT BUNDLE TICKET           |
| Barcode: |||||||||||||||||||||||||||||||||||||||||  |
|          BND-0842-M-001                             |
+-----------------------------------------------------+
| PO Number:   PO-ZIG-8901      Brand: ZARA GLOBAL    |
| Style Ref:   ART-HD-8821      Color: JET BLACK      |
| Size:        MEDIUM (M)       Qty:   25 PIECES      |
| Ply Range:   Ply 01 to Ply 25                       |
| Lay Sheet:   LAY-2026-0842    Table: Table 01       |
| Route To:    DIVISION 06 * STITCHING FLOOR LINE 04  |
+-----------------------------------------------------+
```

---

### SCREEN 4: CAD Marker Efficiency Yield Desk (`/cutting/markers`)

Before spreading any cloth, the CAD pattern engineer creates the cutting marker on a computer. This screen tracks how tightly the pieces fit together.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                            [ Import Gerber CAD File ]|
+-----------------------------------------------------------------------------------------+
| CAD Marker Optimization & Fabric Yield Desk                                             |
+---------------------+---------------------+---------------------+-----------------------+
| AVERAGE MARKER YIELD| HIGHEST EFFICIENCY  | LOWEST EFFICIENCY   | TOTAL FABRIC SAVED    |
| 88.4%               | 91.2% (Pants)       | 84.1% (Hoodies)     | 412.0 Meters          |
+---------------------+---------------------+---------------------+-----------------------+
| MARKER REPOSITORIES                                                                     |
| Marker Code | Style Ref   | Fabric Width | Length | Ratio Units | Yield % | Action      |
| MKR-HD-01   | ART-HD-8821 | 62 inches    | 5.40 m | 10 garments | 88.2%   | [ Inspect ] |
| MKR-HD-02   | ART-HD-8821 | 60 inches    | 5.65 m | 10 garments | 85.9%   | [ Inspect ] |
| MKR-JG-01   | ART-JG-9002 | 64 inches    | 6.10 m | 12 garments | 90.4%   | [ Inspect ] |
+-----------------------------------------------------------------------------------------+
```

#### How the CAD Marker Yield Formula Works:
$$\text{Marker Efficiency \%} = \frac{\text{Actual Area of all Garment Pieces}}{\text{Total Rectangle Area of the Marker Paper}} \times 100$$

- **Example**:
  - Total marker rectangle area = 5.40 meters long x 1.57 meters wide = 8.478 square meters.
  - The hoodie pieces (bodies, sleeves, hoods) take up 7.478 square meters.
  - Efficiency = (7.478 / 8.478) x 100 = **88.2%**.
  - That means **88.2% of the cloth is used** and only 11.8% is scrap!
  - If an engineer arranges the pieces poorly and efficiency drops to 82%, the factory wastes an extra 30 meters of expensive French Terry cloth every single day!

---

### SCREEN 5: Cut Panel Quality Control Gate (`/cutting/panel-qc`)

Before bundles are allowed to leave the cutting floor, a Quality Control inspector audits samples from the top, middle, and bottom plies of the stack.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                              [ + Log New QC Audit ]  |
+-----------------------------------------------------------------------------------------+
| Cut Component Panel Quality Control                                                     |
+---------------------+---------------------+---------------------+-----------------------+
| AUDIT PASS RATE     | AUDITED BUNDLES     | RE-CUT PANELS       | REJECTED LAYS         |
| 98.2%               | 112 Bundles         | 2 Bundles           | 0 Lays                |
+---------------------+---------------------+---------------------+-----------------------+
| RECENT QUALITY AUDITS                                                                   |
| Audit ID  | Lay Ref   | Bundle Ref    | Notch Err | Deflection | Shade  | QC Verdict|
| QC-CT-401 | LAY-0842  | BND-0842-M-01 | 0.4 mm    | 0.8 mm     | MATCH  | [ PASS ]  |
| QC-CT-402 | LAY-0842  | BND-0842-M-04 | 0.6 mm    | 1.1 mm     | MATCH  | [ PASS ]  |
| QC-CT-403 | LAY-0839  | BND-0839-L-02 | 1.8 mm    | 2.4 mm     | SHADE_X| [ RE-CUT ]|
+-----------------------------------------------------------------------------------------+
```

#### The 4 Critical Checks in Panel QC:
1. **Notch Accuracy (Tolerance: under or equal to 1.0 mm)**:
   - Does the small cut mark on the sleeve match the pattern paper? If it is off by more than 1mm, the tailor will sew the sleeve twisted!
2. **Ply Deflection (Tolerance: under or equal to 1.5 mm)**:
   - The inspector compares the very top ply (Ply 1) against the very bottom ply (Ply 80).
   - If the bottom ply is more than 1.5mm larger or smaller than the top ply, the vacuum pressure on the table was too weak during cutting.
3. **Shade Continuity**:
   - The inspector compares the fabric color of Ply 1, Ply 40, and Ply 80 under standard light boxes (D65 daylight). All plies must match identical color tone.
4. **Template Match**:
   - The inspector places a rigid acrylic master template over the cut stack. The edges must align cleanly with no frayed threads or jagged corners.

---

### SCREEN 6: Fabric Relaxation & De-Tensioning Desk (`/cutting/fabric-relaxation`)

This screen manages the resting time for knit and Lycra fabrics before they are cut.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                              [ + Load Roll to Rest ] |
+-----------------------------------------------------------------------------------------+
| Fabric Roll Relaxation & Shrinkage Prevention Timers                                    |
+---------------------+---------------------+---------------------+-----------------------+
| ROLLS IN RESTING    | READY TO SPREAD     | AVG REST TIME       | SHAPED SHRINKAGE PASS |
| 14 Rolls            | 8 Rolls             | 24.2 Hours          | 100% (No shrinkage)   |
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE RELAXATION RACKS                                                                 |
| Roll Barcode   | Fabric Type          | Lot # | Rest Started | Timer Remaining | Status |
| ROL-FT-8821-A1 | French Terry 380 GSM | L-402 | Yesterday    | 00h 00m (Done!) | READY  |
| ROL-FT-8821-A2 | French Terry 380 GSM | L-402 | Yesterday    | 00h 00m (Done!) | READY  |
| ROL-FT-8821-A3 | French Terry 380 GSM | L-402 | 4 Hours ago  | 20h 15m left    | RESTING|
+-----------------------------------------------------------------------------------------+
```

#### Why Must Fabric "Rest" for 24 Hours?
- When knitting mills roll fabric into cylinders, heavy spinning machines pull the yarn tight under high tension.
- If you spread stretched cloth on a table and cut it immediately, the cut pieces relax later in the sewing room or washing machine and shrink like a rubber band!
- **The Factory Rule**: All knitted cloth must be unrolled onto loop racks and allowed to rest in an air-conditioned room for **24 hours** before cutting. When the countdown timer reaches `00h 00m`, the status changes from `RESTING` to `READY_TO_SPREAD`.

---

### SCREEN 7: End-Loss & Remnant Salvage Ledger (`/cutting/end-loss`)

Every time a 100-meter roll is spread, there is almost always a small piece left over at the end of the roll (e.g. 1.2 meters). This page tracks every centimeter so cloth is not stolen or wasted.

```
+-----------------------------------------------------------------------------------------+
| [<- Cutting Floor]                                              [ + Log End-Bit Scrap ] |
+-----------------------------------------------------------------------------------------+
| Remnant Fabric & End-Loss Conservation Ledger                                           |
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL END-BITS LOGGED| TOTAL REMNANT METERS| POCKETING SALVAGE   | SCRAP DISPOSAL        |
| 38 Pieces           | 124.5 m             | 82.0 m (Re-used!)   | 42.5 m (Recycled)     |
+---------------------+---------------------+---------------------+-----------------------+
| REMNANT INVENTORY TABLE                                                                 |
| Remnant ID | Roll Origin    | Fabric Type         | Length | Rack Bin | Disposition |
| REM-0201   | ROL-FT-8821-A1 | French Terry Black  | 1.35 m | RACK-B02 | POCKETING   |
| REM-0202   | ROL-FT-8821-A2 | French Terry Black  | 0.85 m | RACK-B02 | RE-CUT_PART |
| REM-0203   | ROL-SJ-1002-B1 | Single Jersey White | 0.40 m | BIN-DISP | SCRAP_WASTE |
+-----------------------------------------------------------------------------------------+
```

#### Where Do Leftover End-Bits Go?
1. **Pocketing & Small Parts Salvage**:
   - If the piece is between 0.8m and 1.5m, we store it in Rack B02. We use it to cut hoodie pocket linings, neck tape, or drawcord patches.
2. **Re-Cut Replacement**:
   - If a tailor damages a sleeve on Line 03, we pull an end-bit from the same dye lot to cut 1 replacement sleeve instead of opening a brand new 100-meter roll!
3. **Textile Recycling**:
   - Pieces smaller than 0.5m cannot be used. They are weighed, logged, and sold to certified yarn-recycling mills to make recycled cotton.

---

## 4. The Complete Story of Cutting Order PO-ZIG-8901

Let us follow how **5,000 Heavyweight French Terry Hoodies** are cut from start to finish:

```
1. FABRIC ARRIVES FROM STORE (Day 1 - 08:00 AM)
   Central Store (Division 11) sends 45 rolls of Black French Terry (4,250 kg).
   Dye lot is verified: LOT-402, Shade Group: SHADE_A.
       |
       v
2. FABRIC RESTS IN RELAXATION ROOM (Day 1 to Day 2 - 24 Hours)
   Spreading crew unrolls the fabric onto open carts.
   The relaxation timer runs for 24 hours to let cotton tension relax.
       |
       v
3. CAD MARKER LOADED (Day 2 - 09:00 AM)
   Pattern master selects Marker MKR-HD-01.
   Efficiency: 88.2%, Length: 5.40 meters, Ratio: XS:1, S:2, M:4, L:2, XL:1.
       |
       v
4. SPREADING 80 PLIES ON TABLE 01 (Day 2 - 10:30 AM)
   Automatic spreader travels back and forth along Table 01.
   Spreads exactly 80 plies (432 meters of cloth).
   Lay Sheet LAY-2026-0842 is created in the app.
       |
       v
5. VACUUM CLAMP & AUTOMATIC CNC CUTTING (Day 2 - 01:15 PM)
   Plastic seal film is laid over the 80-ply stack.
   Powerful vacuum pumps turn on, compressing the stack from 15cm down to 7cm!
   The Gerber CNC high-speed knife slices all panels in 38 minutes.
       |
       v
6. PANEL QC AUDIT (Day 2 - 02:00 PM)
   Inspector checks top, middle, and bottom plies.
   Notch error: 0.4mm (Pass). Ply deflection: 0.8mm (Pass).
   Audit QC-CT-401 verdict: [ PASS ].
       |
       v
7. QR BUNDLE GENERATION & BANDING (Day 2 - 02:30 PM)
   App generates 32 bundles of 25 pieces each (800 pieces total).
   Thermal printer prints barcodes: BND-0842-XS-001 to BND-0842-XL-004.
   Crew ties bundles with colored ribbons and sticks barcode tickets.
       |
       v
8. DISPATCH ROUTING (Day 2 - 03:00 PM)
   - Front Body Panels -> Dispatched to Division 04 (Screen Printing).
   - Chest Hood Panels -> Dispatched to Division 05 (Embroidery).
   - Plain Backs & Sleeves -> Dispatched directly to Division 06 (Stitching Floor).
```

---

## 5. What Do Downstream Divisions Receive?

When bundles leave the cutting room, three separate manufacturing floors receive them:

### A. What Division 04 (Printing Unit) Receives:
- **Which Parts:** Only the **Front Body Panels** that need the water-base chest graphic.
- **Data on Barcode:** Style `ART-HD-8821`, Color `Jet Black`, Size `M`, Qty `25 pcs`, Print Recipe `PRN-ZIG-088`.
- **Why only front panels?** Printing the front before the hoodie is sewn together is 10 times faster and prevents ink from smearing on sleeves!

### B. What Division 05 (Embroidery Floor) Receives:
- **Which Parts:** Only the **Outer Hood Panels** that need the buyer's 3D satin logo.
- **Data on Barcode:** Style `ART-HD-8821`, Embroidery Program `EMB-ZIG-441` (7,500 stitches).

### C. What Division 06 (Stitching & Sewing Floor) Receives:
- **Which Parts:** The plain components (Back bodies, Sleeves, Cuffs, Bottom Ribbing, and Kangaroo Pockets).
- **The Handshake:** When the sewing line supervisor scans bundle barcode `BND-0842-M-001`, the system confirms:
  - *"Bundle received on Line 04 at 03:15 PM. Ready for sewing assembly."*

### D. What Division 11 (Central Store) Receives:
- **Roll Consumption Ledger:** Central Store automatically sees that 432.0 meters were consumed from Rolls `ROL-FT-8821-A1` and `ROL-FT-8821-A2`.
- **End-Bit Return:** 1.35 meters of leftover fabric returned to Rack B02.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world factory pitfalls and how our system stops them:

### 1. The Shade Group Mixing Disaster
- **What can go wrong:** If a cutter accidentally spreads 40 plies of Roll A (dark black) and 40 plies of Roll B (reddish black) in the same lay, and bundles are cut together, tailors will sew mismatched sleeves on the bodies!
- **How our system protects you:** The Lay Sheet creation form validates every scanned roll against `store_fabric_rolls.shade_group`. If you try to mix `SHADE_A` with `SHADE_B`, the screen blocks the save button with an error: *"Cannot combine different shade groups on Table 01."*

### 2. Ply Deflection on Tall Lays
- **What can go wrong:** If a cutter tries to save time by spreading 150 plies instead of 80 plies, the fabric stack is too thick. As the knife cuts, the blade bends slightly, making bottom plies 4 millimeters larger than top plies!
- **How our system protects you:** The database has a strict check rule: `CHECK (total_plies BETWEEN 1 AND 120)`. The system physically rejects any lay sheet with more than 120 plies for heavy fleece fabrics.

### 3. The Ghost Piece Root Seed Failure
- **What can go wrong:** In sloppy factories, tailors find extra cut parts lying under tables with no labels and sew them into extra shirts. These "ghost shirts" cannot be tracked, don't have wash care tags, and get rejected at export customs.
- **How our system protects you:** In Zigza MES, no sewing line can book an operation without scanning a valid `cutting_bundles.bundle_barcode`. If a piece has no barcode, sewing machines will not record piece-rate wages for the tailor!

### 4. Cutting Lycra or Knits Without 24-Hour Relaxation
- **What can go wrong:** If a factory is running late and rushes fabric straight from the truck onto the cutting table without resting, the cut garments shrink 2 sizes smaller after their first wash!
- **How our system protects you:** The `/cutting/fabric-relaxation` timer must display `READY` before the roll barcode is unlocked for lay sheet selection.

### 5. Remnant Fabric Leakage & Theft
- **What can go wrong:** Workers cut off 2-meter ends of expensive fabric and sneak them out of the factory gate in their backpacks.
- **How our system protects you:** When a roll is closed, the system compares:
  $$\text{Original Roll Length} - (\text{Plies Spread} \times \text{Marker Length}) = \text{Calculated Remnant}$$
  If the operator does not log the matching remnant in `/cutting/end-loss`, the roll cannot be closed in the database!

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/cutting` | Main control tower to view tables, live lays, and bundle handovers | Cutting Floor Manager |
| **2** | `/cutting/fabric-relaxation` | 24-hour resting countdown to stop knit garments from shrinking | Spreading Crew |
| **3** | `/cutting/markers` | CAD marker puzzle layout to achieve >86% fabric utilization | Pattern / CAD Master |
| **4** | `/cutting/lay-sheets` | Spreading plies, cutting table assignment, and ratio math | Cutting Master |
| **5** | `/cutting/panel-qc` | Audits notch accuracy and ply deflection before sewing | QC Inspector |
| **6** | `/cutting/bundles` | Generates 25-piece bundle tickets with serialized QR codes | Bundle Clerk |
| **7** | `/cutting/end-loss` | Tracks leftover fabric remnants to stop theft and wastage | Store & Floor Auditor |

*This document is written in clean, plain language with zero emojis so every worker on the factory floor can understand it clearly.*
