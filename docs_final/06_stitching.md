# Division 06 • Stitching & Sewing Floor Master Guide
### Zigza MES Garment Platform • Division 06 (Step 6 of 11)
**Where to find it in the app:** `/stitching-sewing` (or `/stitching-sewing/supervisor-desk`)  
**Target Audience:** Sewing Floor Supervisors, Linemen, Tailors, Mending Helpers, QC Inspectors, and Plant Managers  
**Document File:** `docs_final/06_stitching.md`

---

## 1. Simple Summary: What Does This Division Do?

In earlier divisions, we cut the cloth into flat shapes (Division 03), printed graphics on the front panels (Division 04), and embroidered logos on the hoods (Division 05).

Now comes the moment where flat pieces of cloth become **real clothes you can wear**:
- **Tailors sit at sewing lines** with high-speed industrial sewing machines (overlock, single-needle, flatlock).
- **They sew all the pieces together in order**: front body joins back body at the shoulders, sleeves are attached, side seams are closed, the kangaroo pocket is stitched, the embroidered hood is joined to the collar, and ribbing cuffs are attached.
- **Every piece is checked for quality** before it leaves the sewing floor.

In an apparel factory, **Division 06 (Stitching & Sewing Floor)** is the **sacred backbone and engine room of manufacturing**. It employs the most workers, generates the daily piece-rate wages, and turns flat cloth into real garments.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 03. Cutting Floor ] sends: Plain Backs, Sleeves, Cuffs, & Pockets       |
|   [ 04. Printing Unit ] sends: Printed Front Body Panels                    |
|   [ 05. Embroidery    ] sends: 3D Embroidered Outer Hood Panels             |
|   [ 11. Central Store ] sends: Spools of Black Thread, Drawcords, & Labels  |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 06. STITCHING & SEWING FLOOR BENCHMARK                  |               |
|   | 1. Lineman Allotment   ---> Lineman issues 25-piece     |               |
|   |                             bundles to sewing lines     |               |
|   | 2. Tailor Assembly     ---> Tailors sew panels together |               |
|   |                             (Earn Rs 24.50 per hoodie)  |               |
|   | 3. Mending Desk        ---> Helpers trim loose threads  |               |
|   |                             and verify exact piece count|               |
|   | 4. Inline & Endline QC ---> 100% inspection for skipped |               |
|   |                             stitches and open seams     |               |
|   | 5. Zero Dispute Wage   ---> Tailor gets paid only for   |               |
|   |                             verified passed garments    |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               +-----------------------------+                               |
|               | (Passed clean garments)     | (Defects needing repair)      |
|               v                             v                               |
|     [ 07. Industrial Washing ]    [ 10. Alteration Clinic ]                 |
|     or [ 08. Steam Ironing ]      Expert alteration tailors unpick broken   |
|     For wash softening & pressing seams and re-stitch clean replacement     |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used on the sewing floor every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Lineman (Line Supervisor)** | The floor leader in charge of 1 sewing line of 20 to 30 tailors. | "Lineman Murugan manages Sewing Line 04 and makes sure all 25 tailors have work to sew." |
| **Allotment** | The official factory job card giving a specific number of garments to a sewing line. | "Allotment #402 gives 500 black hoodies to Lineman Murugan to finish before 05:00 PM." |
| **Piece-Rate Wage** | Paying a tailor a fixed amount of money for every single completed garment they sew. | If the piece rate is `Rs 24.50` and a tailor sews 30 hoodies today, they take home `Rs 735.00` in wages! |
| **Zero Wage Dispute Guarantee** | The computer rule that prevents arguments between tailors and managers about money. | A tailor gets paid only for garments that **pass Endline QC**. If 2 pieces have broken seams, they aren't paid until those 2 are fixed! |
| **Mending Desk** | The intermediate inspection table where helpers trim loose thread ends and count garments. | Helpers snip hanging threads with small scissors and count the bundle before handing it to QC. |
| **Inline QC** | An inspector walking up and down the sewing line checking tailors while they are actively sewing. | If a machine needle is skipping stitches on sleeve hems, Inline QC stops the machine before 50 shirts get ruined! |
| **Endline QC** | The final checkpoint at the very end of the sewing line where 100% of finished garments are examined. | The inspector checks all seams, pulls the zipper, measures the chest width, and checks under bright lights. |
| **Alteration (Rework)** | A garment with a small mistake (like a crooked stitch) sent to be repaired instead of thrown away. | An alteration tailor carefully removes the crooked stitch with a seam-ripper and re-sews it straight. |
| **Challan** | The legal internal transport document that accompanies fabric and garments inside the factory. | `Challan CHN-8821` lists 5,000 cut pieces transferred from Cutting to Sewing. |
| **Article (Art No)** | The style code of the garment being made. | `ART-HD-8821` is the article code for the Zara Heavyweight French Terry Hoodie. |
| **DHU (Defects per Hundred Units)** | The standard percentage score measuring sewing quality. | If an inspector checks 100 hoodies and finds 3 defects, the DHU score is `3.0%`. Factory standard must stay under `3.5%`! |
| **SAM (Standard Allowed Minutes)** | The exact number of minutes an average tailor takes to sew 1 complete garment. | If a hoodie has a SAM of `18.5 minutes`, a line of 20 tailors can sew roughly 520 hoodies in an 8-hour shift. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us tour the key screens in Division 06 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Multi-Station Supervisor Desk (`/stitching-sewing/supervisor-desk`)

This is the central operating hub of the sewing floor. It contains **5 connected station tabs** that follow garments through their 5 physical stages on the factory floor.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 06 * Sewing ]  |
+-----------------------------------------------------------------------------------------+
| Sewing Floor Master Supervisor Desk                            [ Floor Status: LIVE ]   |
| Real-time 5-station control: Linemen, Mending Desk, Endline QC, Store Inward, & Dispatch|
+-----------------------------------------------------------------------------------------+
| 5 MASTER FLOOR STATIONS:                                                                |
| [ 1. LINEMAN DESK ] [ 2. MENDING DESK ] [ 3. QC DESK ] [ 4. STORE GODOWN ] [ 5. DISPATCH]|
+-----------------------------------------------------------------------------------------+
| STATION 1: LINEMAN SEWING ALLOTMENTS (Active Work on Sewing Lines)                      |
| Filter: [ All Linemen v ] [ High Priority v ]     Search: [ Search PO, Article, Line...]|
+-----------------------------------------------------------------------------------------+
| ALLOTMENT ID | ARTICLE REF   | LINEMAN   | TARGET | DONE | MENDING STATUS| QC STATUS    |
| ALT-0842     | ART-HD-8821   | R. Kumar  | 500 pcs| 320  | PENDING_STITCH| 312 Passed   |
| ALT-0841     | ART-HD-8821   | S. Murugan| 500 pcs| 500  | [ HANDOVER ->]| Ready for QC |
| ALT-0840     | ART-JG-9002   | V. Anand  | 400 pcs| 400  | IN_MENDING    | 394 Passed   |
+-----------------------------------------------------------------------------------------+
| ACTION BUTTONS PER ROW:                                                                 |
| [ Handover to Mending ]  [ Reassign Lineman ]  [ View Variants ]  [ Print Bundle Slip ] |
+-----------------------------------------------------------------------------------------+
```

#### The 5 Master Stations Explained:

#### Station 1: The Lineman Desk (`LINEMAN`)
- **What happens here:** Floor supervisors issue cut bundles to linemen (e.g. Line 01, Line 02). Tailors take pieces from bundles and stitch them together.
- **Lineman Reassignment:** If a lineman calls in sick, the supervisor can reassign an active allotment to another lineman with 1 click without losing a single piece of data!
- **Handover Button (`[ Handover to Mending ]`):** When tailors finish sewing a 25-piece bundle, the lineman clicks this button to transfer custody to the mending table.

---

#### Station 2: The Mending Desk (`MENDING`)
Before garments go to the strict QC inspectors, helpers at the mending table inspect them:
- **Thread Trimming:** Snip all loose thread tails left by sewing needles.
- **Piece Counting:** Count the physical garments. If the allotment says 25 pieces, there must be exactly 25 pieces in the basket!
- **The Count Verification Gate:** The helper types the physical count (e.g. `25`). If the count matches, the button **`[ Verify Count & Handover to QC ]`** unlocks.

---

#### Station 3: The Endline QC Desk (`QC`)
This is the strict quality inspection checkpoint. Every garment is inspected by certified QC auditors on a brightly lit inspection table.

```
+------------------------------------------------------------------------+
| ENDLINE QC INSPECTION MODAL                                      [ X ] |
+------------------------------------------------------------------------+
| Allotment:             [ ALT-0842 • ART-HD-8821 Hoodie               ] |
| Lineman:               [ R. Kumar (Line 01)                          ] |
| Total Pieces to Audit: [ 25 Pieces                                   ] |
+------------------------------------------------------------------------+
| AUDIT RESULTS ENTRY:                                                   |
| Passed Pieces (Zero Defect):  [ 23 Pieces ] ---> Goes to Finished Store|
| Rejected Pieces for Repair:   [  2 Pieces ] ---> Goes to Alteration    |
|                                                                        |
| Defect Classification:        [ SKIP_STITCH_SLEEVE_HEM               v]|
| Defect Severity:              [ MAJOR                                v]|
| Action / Disposition:         [ SEND_TO_ALTERATION_CLINIC            v]|
| Auditor Notes:                [ Needle skipped 3 stitches at left cuff]|
+------------------------------------------------------------------------+
|                                        [ Cancel ] [ Submit QC Verdict ]|
+------------------------------------------------------------------------+
```

- **Passed Pieces (`23`)**: These 23 pieces are approved and ready to be washed or packed.
- **Rejected Pieces (`2`)**: These 2 pieces are routed directly to Division 10 (Alteration Clinic) with a red tag explaining the exact defect.
- **The Tailor Wage Ledger:** The tailor is immediately credited for the **23 passed pieces** ($23 \times \text{Rs }24.50 = \text{Rs }563.50$). The 2 rejected pieces are held until repaired and re-inspected!

---

#### Station 4: The Store Godown (`STORE`)
After passing QC, finished garments are received into the internal finished-goods warehouse:
- **Bay Allocation:** Garments are placed in specific storage racks (e.g. `BAY-03-HOODIES`).
- **Trims Inventory:** Linemen also use this tab to request matching drawcords, neck labels, wash care tags, and polybags from the storekeeper.

---

#### Station 5: Dispatch & Gate Pass (`DISPATCH`)
When an entire order (e.g. 5,000 hoodies) is completed, inspected, and packed into master cartons:
- Generates the official **Factory Gate Pass**.
- Creates dispatch manifests for trucks heading to Industrial Washing (Division 07) or Steam Ironing (Division 08).

---

### SCREEN 2: Sewing Floor Executive TV Dashboard (`/stitching-sewing/dashboard`)

On the physical factory floor, giant 65-inch television screens hang from the ceiling above the sewing lines. This screen displays live real-time factory metrics so all tailors and managers know if they are hitting their daily goals.

```
+-----------------------------------------------------------------------------------------+
| ZIGZA MES  *  SEWING FLOOR LIVE BENCHMARK MONITOR                [ 03:45 PM * DAY SHIFT]|
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL SEWN TODAY    | DAILY TARGET        | ENDLINE PASS RATE   | FACTORY DHU QUALITY   |
| 3,850 Pieces        | 4,200 Pieces (91.6%)| 97.8% Passed        | 2.2% DHU (Benchmark OK|
| +410 pcs this hour  | 350 pcs remaining   | 85 pcs in alteration| Target <3.5% DHU      |
+---------------------+---------------------+---------------------+-----------------------+
| LIVE SEWING LINE LEADERBOARD (LINES 01 TO 08)                                           |
| Line #  | Lineman     | Article     | Target | Output | Efficiency | Quality | Status   |
| Line 01 | R. Kumar    | ART-HD-8821 | 500    | 480    | 96.0%      | 98.5%   | ON_TRACK |
| Line 02 | S. Murugan  | ART-HD-8821 | 500    | 495    | 99.0%      | 99.2%   | AHEAD    |
| Line 03 | V. Anand    | ART-JG-9002 | 450    | 410    | 91.1%      | 97.1%   | ON_TRACK |
| Line 04 | K. Selvam   | ART-CR-7710 | 450    | 360    | 80.0%      | 95.0%   | DELAYED  |
+-----------------------------------------------------------------------------------------+
```

#### Why Do Factories Love the TV Dashboard?
1. **Friendly Competition**: Sewing lines love seeing their line at the top of the leaderboard with green badges!
2. **Instant Bottleneck Alert**: If Line 04 drops to 80% efficiency, the plant manager sees it immediately and walks over to help fix the sewing machine before half the shift is lost.

---

### SCREEN 3: Floor Allotments & Job Cards (`/stitching-sewing/allotments`)

This page creates and manages the official work order tickets given to linemen.

```
+-----------------------------------------------------------------------------------------+
| [<- Sewing Desk]                                                [ + Create Allotment ]  |
+-----------------------------------------------------------------------------------------+
| Sewing Floor Work Order Allotments                                                      |
+-----------------------------------------------------------------------------------------+
| ALLOTMENT # | PO NUMBER   | ARTICLE CODE| COLOR & SIZE BREAKDOWN       | PIECE RATE     |
| ALT-0842    | PO-ZIG-8901 | ART-HD-8821 | Jet Black (XS:50, S:100, M:200, L:100, XL:50) | Rs 24.50 / pc  |
| ALT-0843    | PO-ZIG-8901 | ART-HD-8821 | Vintage Grey (S:150, M:250, L:100)           | Rs 24.50 / pc  |
+-----------------------------------------------------------------------------------------+
```

#### How Size-Specific Rates Work:
- Sewing an Extra-Small (XS) hoodie takes less cloth, but sewing a 3XL hoodie has giant seams that take longer to sew.
- In our software, managers can set standard rates (e.g. Rs 24.50) or **size-specific rates** (e.g. XS to L = Rs 24.50, XL to 3XL = Rs 26.00) to fairly pay tailors for extra fabric handling!

---

### SCREEN 4: Master Article Specifications (`/stitching-sewing/articles`)

Every garment style in the factory has an Article Record that stores technical sewing specifications:
- **Article Number (`ART-HD-8821`)**: The style code.
- **Description**: Heavyweight French Terry Hoodie 380 GSM.
- **SAM Value (`18.5 minutes`)**: The standard allowed minutes to sew 1 complete piece.
- **Operation Breakdown**:
  1. Front pocket attach (Overlock + Single Needle): 2.5 min
  2. Shoulder join (4-thread overlock): 1.0 min
  3. Sleeve attach (4-thread overlock): 2.5 min
  4. Side seam close (4-thread overlock): 2.0 min
  5. Hood assembly & eyelet insertion: 3.5 min
  6. Hood join to body collar: 3.0 min
  7. Bottom rib & sleeve cuff attach: 3.0 min
  8. Final thread inspection & trim: 1.0 min
  - **Total Assembly Time = 18.5 minutes per hoodie!**

---

## 4. The Complete Story of Order PO-ZIG-8901 in Stitching

Let us follow how **5,000 Heavyweight French Terry Hoodies** are assembled on the sewing floor:

```
1. ALL PARTS ARRIVE AT SEWING FLOOR (Day 3 - 05:30 PM)
   All cut and decorated components arrive at Sewing Line 01 and Line 02:
   - Plain back bodies, sleeves, and pockets from Division 03 (Cutting).
   - Screen-printed front body panels from Division 04 (Printing).
   - 3D embroidered outer hood panels from Division 05 (Embroidery).
   - Matching black drawcords, eyelets, and neck labels from Division 11 (Store).
       |
       v
2. LINEMAN RECEIVES ALLOTMENT ALT-0842 (Day 4 - 08:00 AM)
   Lineman Murugan scans bundle barcodes into the Line 01 terminal.
   Distributes 25-piece bundles to individual tailor workstations.
       |
       v
3. ASSEMBLY LINE STITCHING EXECUTION (Day 4 - 08:30 AM to 03:30 PM)
   The line operates like a flowing river:
   - Tailor 01 attaches kangaroo pockets to printed front bodies.
   - Tailors 02 & 03 join shoulders and attach sleeves.
   - Tailors 04 & 05 stitch side seams from wrist to waist.
   - Tailor 06 sews the embroidered hood with drawcord and metal eyelets.
   - Tailors 07 & 08 join the hood to the neck collar with soft cotton neck tape.
   - Tailor 09 attaches 2x2 rib cuffs and waistband.
       |
       v
4. MENDING DESK CHECKPOINT (Day 4 - 03:45 PM)
   Completed bundles are placed in mending baskets.
   Helpers snip loose thread ends and count garments.
   Helper enters: "Counted 25 pieces. All present."
   Status advances: [ HANDOVER_TO_QC ].
       |
       v
5. ENDLINE QC 100% AUDIT (Day 4 - 04:15 PM)
   Inspector examines all 25 hoodies under daylight lamps:
   - 24 Hoodies Passed (Clean seams, perfect measurements, zero skipped stitches).
   - 1 Hoodie Rejected (Skipped stitch at bottom hem over thick seam).
   - 24 Passed Hoodies route to Store Godown [ PASS_TO_STORE ].
   - 1 Rejected Hoodie routes to Division 10 (Alteration Clinic) for quick repair.
       |
       v
6. ZERO DISPUTE WAGE LEDGER UPDATE (Day 4 - 04:30 PM)
   Tailors on Line 01 receive credit for the 24 passed hoodies.
   Wage accrual: 24 pcs x Rs 24.50 = Rs 588.00 recorded in database.
       |
       v
7. CARTON BAGGING & DISPATCH HANDOVER (Day 4 - 05:00 PM)
   Passed hoodies are packed into clean polybags (10 pieces per bundle).
   Gate pass generated for transfer to Division 07 (Industrial Washing) for
   bio-enzyme softening wash!
```

---

## 5. What Do Downstream Divisions Receive?

When finished garments leave Division 06, two divisions receive them:

### A. What Division 07 (Industrial Washing Floor) Receives:
1. **The Assembled Garments**:
   - Fully sewn hoodies ready for commercial bio-wash, enzyme softening, or vintage stone-wash.
2. **The Wash Lot Challan**:
   - Lists exact piece count (e.g. 5,000 pcs), fabric type (380 GSM French Terry), and required chemical wash recipe (`WSH-BIO-04`).

*(Note: If an order does not need washing, the clean hoodies skip Division 07 and route straight to Division 08 for Steam Ironing!)*

### B. What Division 10 (Alteration Clinic) Receives:
1. **The Rework Garments**:
   - Any hoodie that failed Endline QC (e.g. 45 hoodies with open seams, skipped stitches, or loose labels).
2. **The Defect Tag**:
   - Every rejected garment has a red tag specifying: Allotment ID, Lineman Name, Defect Category, and exact location of the flaw so alteration tailors know what to fix in seconds!

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world sewing floor problems and how our system prevents them:

### 1. The Absentee Lineman Nightmare
- **What can go wrong:** In traditional factories, if Lineman Murugan falls sick and stays home, his paper job cards are locked in his desk. Nobody knows which tailors were sewing which bundles, and the entire sewing line sits idle!
- **How our system protects you:** The Supervisor Desk has a **`Reassign Lineman`** button. The plant manager selects the allotment, chooses Lineman Kumar as the replacement, and the entire line resumes work in 30 seconds with full audit history preserved.

### 2. The Uncounted Mending Black Hole
- **What can go wrong:** A tailor sews 23 hoodies instead of 25, claims they finished all 25, and pushes the bundle to QC. When QC finds 2 pieces missing, a giant shouting match breaks out about who lost the pieces!
- **How our system protects you:** The Mending Desk requires a mandatory physical count entry (`mending_total_counted`). If the helper does not count and verify all 25 pieces, the system will not let the bundle advance to QC!

### 3. Skipped Stitches on Heavy Fleece Seams
- **What can go wrong:** French Terry fleece is thick. Where 4 layers of cloth overlap at the underarm cross-seam, sewing needles can bend slightly, causing skipped stitches that pop open later.
- **How our system protects you:** Endline QC defect logs categorize defects by type (`SKIP_STITCH`, `OPEN_SEAM`, `PUCKERING`). If 3 skipped stitches appear on the same line, the app sends an alert to the line mechanic to adjust needle clearance.

### 4. Tailors Swapping Bundle Pieces (Shade Mismatch)
- **What can go wrong:** If Tailor A runs out of sleeves, they grab a sleeve from Tailor B's bundle (which was cut from a different fabric roll). When the hoodie is finished, one sleeve is a noticeably different shade of black!
- **How our system protects you:** Every bundle ticket has a printed **Ply Range** (e.g. `Plies 01 to 25`). Tailors are trained that all pieces assembled into a garment must share the same bundle serial number.

### 5. Piece-Rate Wage Discrepancies & Strikes
- **What can go wrong:** In manual factories, tailors write down their sewn pieces on paper notebooks. At the end of the month, tailors claim they sewed 1,200 pieces, but the factory only shipped 1,000 pieces. This leads to angry wage disputes and worker strikes!
- **How our system protects you:** The **Zero Wage Dispute Guarantee**:
  $$\text{Tailor Wage} = \sum (\text{QC Passed Pieces} \times \text{Piece Rate})$$
  Tailor wages are calculated automatically and exclusively from verified QC Passed records in `qc_logs`. No manual paper notebooks, zero ghost counts, 100% transparent pay!

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/stitching-sewing/dashboard` | Executive TV monitor showing live factory pieces, targets, and DHU % | Plant Manager / Owners |
| **2** | `/stitching-sewing/supervisor-desk` | 5-station control hub: Lineman, Mending, QC, Store, and Dispatch | Floor Supervisors |
| **3** | `/stitching-sewing/allotments` | Work order job cards, piece-rate pricing, and lineman assignments | Production Planner |
| **4** | `/stitching-sewing/articles` | Technical garment specs, SAM minutes, and operation breakdowns | Industrial Engineer |
| **5** | `/stitching-sewing/store` | Inward finished garments and manage thread/trim stocks | Storekeeper |
| **6** | `/stitching-sewing/dispatch` | Carton packing manifests, challans, and factory gate passes | Dispatch Clerk |

*This document is written in clean, plain language with zero emojis so every tailor, lineman, and supervisor on the factory floor can understand it clearly.*
