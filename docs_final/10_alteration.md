# Division 10 • Alteration & Quality Recovery Clinic Master Guide
### Zigza MES Garment Platform • Division 10 (Step 10 of 11)
**Where to find it in the app:** `/alter`  
**Target Audience:** Alteration In-Charge, Expert Mending Tailors, Spot Cleaning Operators, Secondary QC Auditors, and Plant Managers  
**Document File:** `docs_final/10_alteration.md`

---

## 1. Simple Summary: What Does This Division Do?

In garment manufacturing, even the best factories make mistakes:
- A sewing machine needle skips 3 stitches over a thick seam.
- A mechanic drops a spot of dark lubricating oil on a white hoodie.
- An operator sews a hood collar 1 centimeter crooked.

In a bad factory, rejected clothes are thrown in the trash or hidden under tables, costing the factory thousands of dollars.

In our factory, **Division 10 (Alteration & Quality Recovery Clinic)** is the **factory's emergency hospital**.  
Instead of throwing garments away, highly skilled "surgeons" (master alteration tailors and spot-cleaning chemists) carefully diagnose, clean, unpick, and re-stitch imperfect clothes until they look brand new and 100% perfect!

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 06. Stitching QC ] sends: 45 Rejected Hoodies (Skipped seams, oil drops)|
|   [ 08. Ironing / 09. Packing ] sends: Defective garments found in audits   |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 10. ALTERATION & QUALITY RECOVERY CLINIC                |               |
|   | 1. Defect Intake Triage ---> Log ticket & link to the   |               |
|   |                              original tailor who sewed it|              |
|   | 2. Spot Cleaning Desk  ---> Use ultrasonic spray gun to |               |
|   |                              dissolve oil stains        |               |
|   | 3. Master Mending Tailor---> Carefully unpick bad stitch|               |
|   |                              and re-sew clean seam      |               |
|   | 4. Secondary QC Gate   ---> 100% re-inspection by a    |               |
|   |                              certified senior auditor   |               |
|   | 5. Scrap Ledger        ---> If truly unfixable, record  |               |
|   |                              monetary loss in database  |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               +-----------------------------+                               |
|               | (Repaired & Passed 95%+)    | (Condemned Unfixable <5%)     |
|               v                             v                               |
|     [ 08. Steam Ironing ]         [ Scrap Financial Ledger ]                |
|     or [ 09. Packing Floor ]      Officially written off with manager       |
|     Re-joins main production!     approval; sold to yarn recyclers.         |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used in the alteration clinic every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Alteration Clinic** | The dedicated repair room where rejected garments are fixed. | Like a hospital triage ward for sick garments! |
| **Rework (Mending)** | The action of fixing a manufacturing mistake so the garment becomes first-quality. | Unpicking a crooked pocket seam and re-sewing it perfectly straight. |
| **Triage** | Sorting incoming rejected clothes by how hard or easy they are to fix. | Easy: Snip a thread. Medium: Wash out an oil stain. Hard: Replace a cut sleeve panel. |
| **Seam Ripper (Unpicker)** | A tiny handheld tool with a sharp hook blade used to cut and pull out thread stitches without cutting the fabric. | Like a surgical knife for tailors that unpicks bad stitches in 30 seconds. |
| **Spot Cleaning Gun** | A high-pressure electric spray gun that blasts a fine mist of solvent chemical to dissolve grease and oil stains. | Blasts a drop of sewing machine oil right out of the cotton fibers without leaving a ring stain. |
| **Vacuum Spotting Table** | A table with a built-in air exhaust and suction arm used during spot cleaning. | Sucks the cleaning chemical fumes away so the worker doesn't breathe in fumes and the cloth dries instantly. |
| **Pareto 80/20 Rule** | The mathematical principle that 80% of factory defects come from just 20% of machine or human causes. | If 80% of our defects are skipped stitches on Line 02, fixing one loose needle bar solves 80% of our quality problems! |
| **Secondary QC Gate** | The strict rule that a repaired garment cannot leave the clinic without a fresh inspection sign-off. | A repair tailor cannot approve their own work! A senior QC inspector must inspect and sign the green tag. |
| **Condemned Scrap** | A garment damaged so badly (e.g. fabric sliced by a cutter blade) that it is impossible to repair. | The garment is recorded as dead loss, stamped SCRAP, and sent to textile recycling. |
| **Recovery Rate %** | The percentage of rejected garments successfully repaired and saved. | If 100 defective hoodies enter the clinic and 95 are repaired and sold, the recovery rate is `95.0%`! |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 10 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Quality Recovery Clinic Cockpit (`/alter`)

This is the control tower where the Quality Recovery Manager monitors garments in repair, daily salvage clearance rates, root causes, and scrap financial write-offs.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 10 * Clinic ]  |
+-----------------------------------------------------------------------------------------+
| Alteration & Quality Rework Clinic                            [ >= 95.0% Salvage SLA ]  |
| Defect root-cause diagnosis, seam restitching, vacuum spotting, and secondary QC gates  |
|          [ + Log Inward Defect ] [ Mending Floor ] [ Spot Cleaning ] [ Scrap Ledger ]   |
+---------------------+---------------------+---------------------+-----------------------+
| IN-QUEUE FOR REWORK | REPAIRED & CLEARED  | TOP DEFECT CAUSE    | RECOVERY RATE         |
| 14 Pieces           | 43 Pieces Today     | Skipped Stitches    | 95.6% Salvage         |
| Avg Cycle: 18 min/pc| 100% Secondary Pass | 34% of All Intakes  | True Scrap: 4.4%      |
+---------------------+---------------------+---------------------+-----------------------+
| PARETO 80/20 DEFECT ROOT CAUSE ANALYSIS (ASTM D3990)                                    |
| 1. SKIP_STITCH_HEM      [====================] 34% | Root: Line 02 loose needle bar     |
| 2. MACHINE_OIL_STAIN    [=============       ] 22% | Root: Over-lubricated looper       |
| 3. ASYMMETRIC_HOOD_COLLAR[==========          ] 18% | Root: Missing alignment notch      |
| 4. OPEN_SEAM_UNDERARM   [=======             ] 14% | Root: Weak looper thread tension   |
| 5. BROKEN_NEEDLE_PUNCH  [====                ]  8% | Root: Dull needle size 90/14       |
+-----------------------------------------------------------------------------------------+
| ACTIVE CLINIC REPAIR TICKETS TABLE                                                      |
| Ticket #   | Order PO    | Defect Category   | Origin Tailor| Station    | Status     |
| ALT-00412  | PO-ZIG-8901 | SKIP_STITCH_HEM   | Tailor #14   | Mending 01 | IN_REPAIR  |
| ALT-00413  | PO-ZIG-8901 | MACHINE_OIL_STAIN | Tailor #08   | Spot Gun 01| COMPLETED  |
| ALT-00414  | PO-ZIG-8901 | FABRIC_KNIFE_CUT  | Tailor #02   | Condemned  | SCRAP_LOSS |
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Clinic KPI Cards (What are they & Why are they here?)

1. **In-Queue for Rework (`14 Pieces • 18 min/pc`)**:
   - **What it shows:** Number of defective garments currently sitting on the repair clinic shelves.
   - **Why it is here:** Prevents repair bottlenecks. If garments sit in the clinic for days, orders will be short on their shipping day!
2. **Repaired & Cleared Today (`43 Pieces Today`)**:
   - **What it shows:** Total garments successfully cured, re-inspected by Secondary QC, and returned to production.
   - **Why it is here:** Tracks daily clinic output and turns rejected garments back into salable cash revenue.
3. **Top Defect Root Cause (`Skipped Stitches • 34%`)**:
   - **What it shows:** The number one defect type happening in the factory right now.
   - **Why it is here:** Warns the maintenance mechanic to immediately inspect Line 02 sewing machines to stop the problem at the source!
4. **Recovery Clearance Rate (`95.6% Salvage`)**:
   - **What it shows:** Percentage of defective garments saved versus scrapped.
   - **Why it is here:** Factory benchmark SLA requires at least 95% recovery. Less than 5% should ever end up as scrap.

---

#### Box 2: Pareto 80/20 Defect Analysis Panel
Shows the top recurring factory defects ranked from highest to lowest:
- Displays percentage bar, diagnosed machine root cause, and recommended mechanic fix.
- **Why this matters**: In a smart factory, the alteration clinic doesn't just fix clothes—it acts as an intelligence center that tells the sewing lines how to stop making mistakes!

---

### SCREEN 2: Defect Intake & Triage Desk (`/alter/defect-intake`)

When Endline QC rejects a garment, it is brought to the intake desk where a triage specialist logs the defect into the computer and pins a barcoded red tag onto the garment.

```
+------------------------------------------------------------------------+
| LOG NEW DEFECT INTAKE TICKET                                     [ X ] |
+------------------------------------------------------------------------+
| Ticket Number:         [ ALT-2026-00412                              ] |
| Order PO Number:       [ PO-ZIG-8901 - ZARA GLOBAL                   v]|
| Garment Barcode / Lot: [ BND-0842-M-002                              ] |
+------------------------------------------------------------------------+
| DEFECT DIAGNOSIS & ROOT-CAUSE TRACKING:                                |
| Defect Category:       [ SKIP_STITCH_SLEEVE_HEM                      v]|
| Defect Severity:       [ MAJOR (Visible to customer)                 v]|
| Originating Sewing Line:[ SEWING_LINE_02                              v]|
| Original Tailor ID:    [ EMP-402 - R. Ramanathan (Cuff Stitcher)     v]|
| Assigned Clinic Station:[ MENDING_STATION_01 (Overlock Restitch)      v]|
| Triage Notes:          [ 3 skipped stitches on left cuff bottom seam. ]|
+------------------------------------------------------------------------+
|                                          [ Cancel ] [ Create Ticket ]  |
+------------------------------------------------------------------------+
```

#### Why We Track the "Original Tailor ID":
- We do not track the tailor to punish them. We track them to **train them**!
- If Ramanathan has 15 skipped stitch tickets this week, the factory trainer sits with him for 20 minutes to adjust his machine pedal speed or needle angle. Knowledge stops defects!

---

### SCREEN 3: Master Mending Workstations (`/alter/repair-stations`)

This screen tracks the work of the master alteration tailors. These tailors are the most skilled tailors in the entire factory!

```
+-----------------------------------------------------------------------------------------+
| [<- Clinic Desk]                                                                        |
+-----------------------------------------------------------------------------------------+
| Master Mending Workstations & Specialized Machines                                     |
+---------------------+---------------------+---------------------+-----------------------+
| MENDING STATIONS    | ACTIVE REPAIRS      | AVG REPAIR TIME     | OPERATOR EFFICIENCY   |
| 4 Stations Online   | 8 Active Garments   | 14.2 Minutes        | 112% Salvage Target   |
+---------------------+---------------------+---------------------+-----------------------+
| WORKSTATION OPERATIONAL CONSOLE:                                                        |
| Station 01: [ M. Selvi - Master Tailor ] • Specialized Machine: Juki 4-Thread Overlock  |
| Active Ticket: ALT-00412 (Zara Hoodie) • Defect: Skip Stitch Cuff • Time Elapsed: 8 min |
| Steps: 1. Unpick old 4-thread chain -> 2. Trim yarn -> 3. Restitch cuff seam flat      |
| Action: [ Mark Repair Completed & Handover to Secondary QC -> ]                         |
+-----------------------------------------------------------------------------------------+
```

---

### SCREEN 4: Chemical Vacuum Spot Cleaning Desk (`/alter/spot-cleaning`)

Sewing machines use motor oil and grease. Occasionally, an oil drop lands on clean cloth. This screen manages the chemical degreasing station.

```
+-----------------------------------------------------------------------------------------+
| [<- Clinic Desk]                                                [ Safety Exhaust ON ]   |
+-----------------------------------------------------------------------------------------+
| Vacuum Spotting Table & Chemical Stain Removal                                          |
+---------------------+---------------------+---------------------+-----------------------+
| OIL SPOTS REMOVED   | AVG SPOT TIME       | SOLVENT USED        | HALO RING DEFECTS     |
| 10 Garments Today   | 3.5 Minutes / Spot  | Non-Toxic Pulvalin  | 0 Ring Stains (Pass)  |
+---------------------+---------------------+---------------------+-----------------------+
| HOW SPOT CLEANING WORKS:                                                                |
| 1. Garment placed on vacuum buck table arm with bottom exhaust motor running.           |
| 2. Operator points ultrasonic spray gun and blasts high-velocity solvent mist.          |
| 3. Solvent instantly dissolves the petroleum grease in 5 seconds.                       |
| 4. Operator flips gun to dry air trigger; vacuum suction dries spot with zero ring halo!|
+-----------------------------------------------------------------------------------------+
```

---

### SCREEN 5: The Secondary QC Clearance Gate (`/alter/secondary-qc`)

This is the non-negotiable security checkpoint. **No garment is ever allowed to leave Division 10 without being inspected by a fresh senior QC auditor.**

```
+------------------------------------------------------------------------+
| SECONDARY QC CLEARANCE RE-AUDIT MODAL                            [ X ] |
+------------------------------------------------------------------------+
| Ticket Number:         [ ALT-2026-00412 • ART-HD-8821 Zara Hoodie    ] |
| Repair Station:        [ Station 01 (M. Selvi)                       ] |
| Defect Repaired:       [ SKIP_STITCH_SLEEVE_HEM                      ] |
+------------------------------------------------------------------------+
| RE-AUDIT VERIFICATION:                                                 |
| 1. Visual Stitch Symmetry:       [ CHECKED & CLEAN (100% Straight)   ] |
| 2. Seam Pull & Strength Test:    [ CHECKED & PASS (No seam popping)  ] |
| 3. Zero Fabric Needle Holes:     [ CHECKED & PASS (Fabric undamaged) ] |
| 4. Color Thread Match:           [ CHECKED & PASS (Madeira Black 40s)] |
+------------------------------------------------------------------------+
| FINAL VERDICT:         [ SECONDARY_QC_PASSED - RELEASE TO FINISHING  v]|
| Certified Inspector:   [ EMP-109 - V. Anitha (Senior Quality Auditor)] |
| Inspector Digital Sign:[ CONFIRMED & STAMPED                         ] |
|                                          [ Cancel ] [ Authorize Pass ] |
+------------------------------------------------------------------------+
```

- When the auditor clicks **`Authorize Pass`**, the ticket status flips to **`SECONDARY_QC_PASSED`**.
- The garment barcode unlocks in the central database and is cleared to re-enter Division 08 (Steam Ironing) or Division 09 (Packing)!

---

### SCREEN 6: Condemned Scrap Financial Loss Ledger (`/alter/scrap-salvage`)

If a garment is truly unrecoverable (e.g. a worker accidentally sliced the fabric with scissors), it must be formally condemned. No piece can disappear without an executive financial record!

```
+-----------------------------------------------------------------------------------------+
| [<- Clinic Desk]                                                [ + Log Condemned Scrap]|
+-----------------------------------------------------------------------------------------+
| Condemned Garment Scrap Financial Loss Ledger                                           |
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL PIECES SCRAP  | FINANCIAL LOSS      | SCRAP RATE %        | SALVAGED TO RECYCLING |
| 2 Pieces Today      | Rs 1,340.00         | 0.04% of 5,000 Order| 1.70 kg Clean Cotton  |
+---------------------+---------------------+---------------------+-----------------------+
| SCRAP CONDEMNATION RECORD:                                                              |
| Ticket: ALT-00414 • PO: PO-ZIG-8901 • Style: ART-HD-8821 Hoodie • Size: Medium (M)      |
| Scrapped Pieces: 2 Hoodies                                                              |
| Scrap Reason: Unrecoverable 4cm fabric cut across front chest graphic caused by scissors.|
| Fabric Weight: 1.70 kg 380 GSM French Terry                                             |
| Financial Loss Calculation: 2 pcs x Rs 670.00 factory BOM cost = Rs 1,340.00 Loss       |
| Authorized By: Plant Operations Director • Scrap Tag #SCRAP-2026-081 Applied             |
+-----------------------------------------------------------------------------------------+
```

---

## 4. The Complete Story of Order PO-ZIG-8901 in the Alteration Clinic

Let us follow how **45 defective hoodies** are treated and cured in the clinic:

```
1. 45 REJECTED HOODIES ARRIVE FROM SEWING (Day 4 - 04:30 PM)
   Division 06 (Stitching Endline QC) rejects 45 hoodies out of 5,000:
   - 30 hoodies with skipped stitches at cuffs and waistbands.
   - 10 hoodies with machine needle oil spots.
   - 5 hoodies with asymmetric hood neck joins.
       |
       v
2. DEFECT INTAKE & TRIAGE (Day 4 - 04:45 PM)
   Clinic supervisor scans each hoodie and prints red barcoded hospital tags:
   ALT-00412 to ALT-00456. Root tailors and lines recorded.
       |
       v
3. STATION 1: SPOT CLEANING OIL REMOVAL (Day 4 - 05:00 PM to 05:40 PM)
   Operator takes the 10 oil-stained hoodies to the vacuum spotting table.
   Blasts Pulvalin solvent with the ultrasonic spray gun.
   All 10 oil spots dissolve completely in 4 minutes with zero water rings!
       |
       v
4. STATION 2: MASTER MENDING RE-STITCHING (Day 5 - 08:00 AM to 01:00 PM)
   Expert tailors tackle the remaining 35 hoodies:
   - 30 skipped cuff seams: Seams unpicked with seam-rippers and re-sewn cleanly.
   - 5 crooked hood collars: Collars unpicked and re-aligned with neck notches.
   - Tragic Discovery: 2 hoodies have deep 4cm fabric scissor slices that cannot be sewn.
       |
       v
5. SECONDARY QC RE-AUDIT (Day 5 - 01:30 PM)
   Senior QC Auditor V. Anitha inspects all 45 garments:
   - 43 Hoodies Passed 100% (Clean seams, zero stains, perfect measurements).
   - Status updated: [ SECONDARY_QC_PASSED ].
   - Released to Division 08 (Steam Ironing Floor) for pressing!
       |
       v
6. CONDEMNING 2 IRREPARABLE HOODIES (Day 5 - 02:00 PM)
   The 2 sliced hoodies cannot be saved:
   - Formally logged to /alter/scrap-salvage.
   - Financial loss recorded: Rs 1,340.00.
   - Replacement Requisition: Division 03 (Cutting) cuts 2 replacement bodies from end-bits!
       |
       v
7. ORDER FULL RECOVERY (Day 5 - 03:00 PM)
   Thanks to the clinic, 43 hoodies were saved from the trash!
   Recovery Rate: 43 / 45 = 95.6% Success!
```

---

## 5. What Do Downstream Divisions Receive?

When garments leave Division 10, here is who receives what:

### A. What Division 08 (Steam Ironing Floor) Receives:
1. **The Cured, First-Quality Garments**:
   - 43 fully repaired, spot-cleaned, and secondary QC certified hoodies.
   - Green Secondary QC tags attached confirming zero defects.
   - Ironing operators press them to remove repair wrinkles and send them to Packing.

### B. What Division 02 (Merchandising Costing Desk) Receives:
1. **The Scrap Financial Write-Off Record**:
   - Exact financial loss record (e.g. `Rs 1,340.00`) logged against Order `PO-ZIG-8901`.
   - Merchandisers update the final order profitability ledger so true factory profits are known to the penny.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world alteration clinic hazards and how our system prevents them:

### 1. The Sneaky Return (Re-entering Packing Without Secondary QC)
- **What can go wrong:** A repair tailor finishes sewing a sleeve, wants to get rid of it quickly, and carries it straight to the packing room *without* showing it to a QC inspector. If the repair was sloppy, a defective garment ships to the buyer!
- **How our system protects you:** The database blocks any garment with an open alteration ticket from being scanned into a master carton. The carton packing screen will flash: *"Blocked! Ticket ALT-00412 requires Secondary QC sign-off!"*

### 2. Fabric Scissor Tears During Seam Unpicking
- **What can go wrong:** A careless tailor unpicks a seam too aggressively and cuts the cotton fabric with their seam-ripper blade, turning a minor stitch flaw into an unrepairable ruined garment!
- **How our system protects you:** Clinic tailors must use blunt-tip safety seam rippers. Secondary QC inspects the cloth weave around the repaired seam for cut yarns.

### 3. Chemical Solvent Halo Rings
- **What can go wrong:** An operator sprays spot-cleaning chemical onto dark cloth but doesn't dry it completely with the air gun. It leaves an ugly white ring watermark that cannot be washed out!
- **How our system protects you:** Spotting tables must keep their bottom vacuum suction motor running during the entire drying stroke.

### 4. Sweeping Scrap Under the Rug (Unreported Losses)
- **What can go wrong:** A worker accidentally ruins a hoodie, gets scared, and stuffs it into a trash bin so nobody finds out.
- **How our system protects you:** The **Zero Ghost Piece Root Seed**: The packing floor must account for all 5,000 garments. If 4,998 arrive, the system flags the missing 2 pieces immediately!

### 5. Ignoring Pareto Root-Cause Feedback
- **What can go wrong:** The clinic repairs 50 skipped stitches every day, but nobody tells the sewing floor. The sewing machine keeps ruining 50 more shirts every day!
- **How our system protects you:** The Pareto analysis automatically alerts the sewing line supervisor when the same defect repeats more than 5 times in a single shift.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/alter` | Main clinic dashboard to monitor in-queue repairs, salvage %, and Pareto | Recovery Manager |
| **2** | `/alter/defect-intake` | Logs red defect tickets, severity, and originating tailor ID | Intake Clerk |
| **3** | `/alter/repair-stations` | Workstations for master mending tailors to unpick and re-sew seams | Master Tailors |
| **4** | `/alter/spot-cleaning` | Ultrasonic spray guns and vacuum tables to remove machine oil stains | Spot Cleaning Tech |
| **5** | `/alter/secondary-qc` | The strict clearance gate; 100% re-inspection sign-off before release | Senior QC Inspector |
| **6** | `/alter/scrap-salvage` | Financial loss write-off ledger for unrecoverable condemned garments | Plant Director |

*This document is written in clean, plain language with zero emojis so every alteration tailor, spot cleaner, and quality auditor can follow it clearly.*
