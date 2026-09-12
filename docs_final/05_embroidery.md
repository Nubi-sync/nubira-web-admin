# Division 05 • Multi-Head Computerized Embroidery Floor Master Guide
### Zigza MES Garment Platform • Division 05 (Step 5 of 11)
**Where to find it in the app:** `/embroidery`  
**Target Audience:** Embroidery Masters, Punch Digitizers, Multi-Head Machine Operators, Thread Store Keepers, and QC Inspectors  
**Document File:** `docs_final/05_embroidery.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 03 (Cutting Floor), we chopped fabric into shaped pieces.  
In Division 04 (Printing Unit), we printed liquid ink graphics on front panels.

Now, some garments need **stitched thread artwork**:
- **Embroidery uses real colored threads** sewn directly into the cloth by high-speed needles.
- **We use giant computerized multi-head machines** (like Tajima or Barudan) with 12 to 24 sewing heads running at the same time. One machine stitches 20 identical logos simultaneously!
- **We sew on flat cut panels (like hood pieces or chest pockets) before the garment is assembled.** This keeps the cloth perfectly flat in clamping frames so stitches never wrinkle or distort.

In an apparel factory, **Division 05 (Multi-Head Embroidery Floor)** is the **thread craft and texture studio**.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 03. Cutting Floor ] sends: 200 bundles of Outer Hood Panels (5,000 pcs) |
|   [ 01. Design Studio ] sends: Tajima DST punch file & thread color codes   |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 05. MULTI-HEAD EMBROIDERY FLOOR                         |               |
|   | 1. DST Punch Library   ---> Load digital stitch program |               |
|   |                             (e.g. 7,500 stitches)       |               |
|   | 2. Thread Store Prep   ---> Mount Madeira polyester     |               |
|   |                             thread cones on needles     |               |
|   | 3. Hooping / Framing   ---> Clamp cloth flat with paper |               |
|   |                             stabilizer backing          |               |
|   | 4. 20-Head Machine Run ---> Run Tajima at 850 RPM;      |               |
|   |                             stitches 20 panels at once  |               |
|   | 5. Trimming & Backing  ---> Snip jump threads & peel    |               |
|   |                             excess paper backing        |               |
|   | 6. Embroidery QC       ---> Check for thread breaks,    |               |
|   |                             needle holes, & puckering   |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               v (All 5,000 embroidered panels verified zero-defect)         |
|   [ 06. Stitching & Sewing Floor ]                                          |
|   Tailors sew the embroidered hoods to bodies and sleeves to make completed |
|   finished hoodies!                                                         |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used on the embroidery floor every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Multi-Head Machine** | A giant sewing machine that has 12, 18, 20, or 24 individual needle heads connected together. | When the motor turns, all 20 needles stitch the exact same logo on 20 separate hoodie panels at the exact same second! |
| **DST / EMB File** | The digital computer file that tells the embroidery machine where to move its needles. | Like an MP3 file holds music, a Tajima `.DST` file holds the exact coordinates for 7,500 needle stitches. |
| **Stitch Count** | The total number of individual needle punches needed to sew one complete logo. | A small chest logo might have `4,500 stitches`; a large jacket back design might have `35,000 stitches`. |
| **RPM (Revolutions Per Minute)** | How fast the needle moves up and down each minute. | Our Tajima machines run at `850 RPM`—that means 850 needle stitches every single minute! |
| **Backing (Stabilizer)** | A stiff paper-like sheet placed underneath the fabric during stitching. | Knitted cotton is soft and stretchy. Without paper backing, the needle pulls the cloth into a wrinkled mess! |
| **Tearaway Backing** | Stiff paper backing that easily tears off by hand after embroidery is finished. | Used on stable woven fabrics like shirts and canvas caps. |
| **Cutaway Backing** | Soft, permanent non-woven backing that stays behind the stitches forever. Excess is trimmed with scissors. | Essential for stretchy knit hoodies so the logo doesn't distort after washing. |
| **3D Puff Embroidery** | Placing a soft dense foam sheet under the stitches so the thread stands up thick and raised. | The raised, 3D textured letters you see on premium baseball caps and luxury streetwear hoodies. |
| **Hooping (Framing)** | Clamping the fabric panel inside a round or rectangular plastic hoop to keep it tight like a drum. | If the cloth is loose in the hoop, the stitches look crooked and loose. |
| **Thread Breakage (TBI)** | When a needle thread snaps in the middle of a job, causing the machine head to halt. | If thread snaps more than 2.5 times per 100,000 stitches, the tension disc is too tight or the needle is blunt! |
| **Bobbin** | The small round metal spool of white thread underneath the machine table that locks each stitch. | Like a home sewing machine, every top needle stitch is locked underneath by bobbin thread. |
| **Birdnesting** | A messy ball or knot of tangled thread that forms underneath the fabric when tension fails. | Looks like a bird's nest of tangled string under the cloth. Must be snipped away carefully! |
| **Puckering** | Ugly wrinkles or gathers in the cloth surrounding the embroidery. | Happens if stitch density is too high or the backing paper is too weak. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 05 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Embroidery Floor Cockpit (`/embroidery`)

This is the homepage where the Embroidery Floor Manager watches active production lines, daily stitch totals, machine speeds, and thread break alerts in real time.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                          [ Division 05 * Embroidery] |
+-----------------------------------------------------------------------------------------+
| Multi-Head Embroidery Floor                                  [ 200 Heads Active * Live ]|
| Computerized 20-head Tajima/Barudan machines, DST punch files, and stitch billing       |
|            [ Machine Shifts ] [ DST Library ] [ Stitch Billing ] [ Thread Store ]       |
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE 20-HEAD LINES| DAILY STITCH TOTAL  | THREAD BREAK FREQ   | DST PUNCH LIBRARY     |
| 8 / 10 Lines        | 14.85M Stitches     | 0.02%               | 42 Approved Files     |
| 200 High-Speed Heads| 4,200 Panels Done   | 18 Breaks (<0.03% OK| Loaded across machines|
+---------------------+---------------------+---------------------+-----------------------+
| QUICK ACCESS PORTAL                                                                     |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
| | DST Punch Files | | 20-Head Machines| | Stitch Billing  | | Thread Store    |        |
| | Stitch counts & | | Active shift    | | Commercial rate | | Madeira cone    |        |
| | color stops     | | progression     | | calculations    | | inventory       |        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
+-----------------------------------------------------------------------------------------+
| MULTI-HEAD COMPUTERIZED MACHINE GRID (10 PRODUCTION LINES)                              |
| Search: [ Search machine, DST, operator...                    ] Filter: [ All Status v ]|
| Machine ID | Model & Heads   | Active Job  | Operator    | Speed   | Status    | Action |
| LINE-01    | Tajima 20-Head  | EMB-0842-HD | R. Kumar    | 850 RPM | RUNNING   | View   |
| LINE-02    | Tajima 20-Head  | EMB-0842-HD | S. Murugan  | 850 RPM | RUNNING   | View   |
| LINE-03    | Barudan 18-Head | EMB-0839-CP | V. Anand    | 800 RPM | THREAD_BRK| Fix    |
| LINE-04    | Tajima 12-Head  | Sample Run  | M. Master   | 750 RPM | SETUP     | Setup  |
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Operational KPI Cards (What are they & Why are they here?)

1. **Active 20-Head Lines (`8 / 10 Lines • 200 Heads`)**:
   - **What it shows:** How many multi-head embroidery machines are actively stitching right now.
   - **Why it is here:** Embroidery machines are very expensive industrial investments. The factory manager wants at least 80% of heads running around the clock.
2. **Daily Stitch Throughput (`14.85M Stitches • 4,200 Panels`)**:
   - **What it shows:** Total number of stitches completed across all machines today.
   - **Why it is here:** Embroidery output is measured in millions of stitches. 14.85 million stitches equals roughly 4,200 finished hoodie panels!
3. **Thread Break Frequency (`0.02% • 18 Breaks`)**:
   - **What it shows:** How often needles or threads snap during stitching.
   - **Why it is here:** Keeps machine efficiency high. If thread snaps constantly, operators spend all day re-threading needles instead of producing garments!
4. **DST Punch Library (`42 Approved Files`)**:
   - **What it shows:** Verified, buyer-approved embroidery stitch programs stored in the central factory network.
   - **Why it is here:** Ensures operators load the exact authorized stitch file directly into machine memory without thumb-drive errors.

---

#### Box 2: Machine Floor Real-Time Grid
Every row represents a physical multi-head embroidery machine on the floor:
- **Machine ID & Brand**: Line 01 (Tajima 20-Head), Line 03 (Barudan 18-Head), Line 04 (Tajima 12-Head).
- **Active Job Code**: Links back to the style and purchase order (e.g. `EMB-0842-HD`).
- **Operational Speed**: Current needle speed in revolutions per minute (e.g. `850 RPM`).
- **Live Status Badges**:
  - `[RUNNING]`: Machine is humming smoothly, stitching 20 panels simultaneously.
  - `[THREAD_BRK]`: Amber warning! Head #14 snapped a thread; machine paused until re-threaded.
  - `[SETUP]`: Operator is hooping new panels and changing thread cone colors.
  - `[IDLE]`: Job completed, waiting for next cut bundle from Cutting.

---

### SCREEN 2: DST Punch File Master Library (`/embroidery/punch-library`)

Before an embroidery machine can stitch a single millimeter, an embroidery digitizer ("puncher") converts the buyer's flat vector artwork into needle coordinates.

```
+-----------------------------------------------------------------------------------------+
| [<- Embroidery Floor]                                            [ + Upload Punch File ]|
+-----------------------------------------------------------------------------------------+
| Digitized Embroidery Punch Files & Stitch Profiles                                      |
| Search: [ Search punch code, style, brand...  ] Filter: [ All Techniques v ]            |
+-----------------------------------------------------------------------------------------+
| DESIGN CODE  | PO NUMBER   | DESIGN NAME       | STITCHES| COLORS | DIMENSIONS | TYPE   |
+--------------+-------------+-------------------+---------+--------+------------+--------+
| EMB-0842-HD  | PO-ZIG-8901 | Zara Outer Hood   | 7,500   | 2 Stops| 65 x 45 mm | 3D_PUFF|
| EMB-0842-CH  | PO-ZIG-8901 | Zara Chest Crest  | 12,400  | 3 Stops| 95 x 85 mm | FLAT   |
| EMB-0839-CP  | PO-ZIG-8898 | Urban Wave Cap    | 5,200   | 1 Stop | 50 x 30 mm | 3D_PUFF|
+-----------------------------------------------------------------------------------------+
```

#### The "Upload Punch File" Modal:
When the digitizer registers a newly punched `.DST` file, this form records the technical profile:

```
+------------------------------------------------------------------------+
| REGISTER NEW EMBROIDERY PUNCH FILE                               [ X ] |
+------------------------------------------------------------------------+
| Design Code:           [ EMB-ZIG-8901-HOOD-01                        ] |
| Purchase Order (PO):   [ PO-ZIG-8901 - ZARA GLOBAL                   v]|
| Garment Placement:     [ OUTER_HOOD_LEFT                             v]|
| DST File Upload:       [ Select .DST or .EMB binary vector file      ] |
| Total Stitch Count:    [ 7,500 Stitches                              ] |
| Color Change Stops:    [ 2 Stops (Navy Blue -> Snow White)           ] |
| Dimensions (mm):       [ Width: 65.0 mm       Height: 45.0 mm        ] |
| Backing Requirement:   [ CUTAWAY_2.5OZ (Knit Anti-Pucker)            v]|
| Recommended Needle:    [ DBxK5 SES Ballpoint Size 75/11 (Knits)      v]|
| Technique Type:        [ 3D_PUFF_EMBROIDERY                          v]|
|                                          [ Cancel ] [ Upload & Verify] |
+------------------------------------------------------------------------+
```

#### Why are DST Dimensions & Needle Specs Crucial?
- **Ballpoint Needles (SES 75/11)**: Sharp needles pierce and cut cotton yarns, causing holes after washing. Ballpoint needles push yarn threads aside gently without cutting them!
- **Cutaway 2.5oz Backing**: Because hoodies are knitted and stretchy, we specify 2.5-ounce cutaway stabilizer to stop the 7,500 stitches from collapsing inward.

---

### SCREEN 3: Machine Shifts & Production Runs (`/embroidery/machine-runs`)

This screen manages the active shift runs on the multi-head machines, tracking cycles, speed, and completed panels.

```
+-----------------------------------------------------------------------------------------+
| [<- Embroidery Floor]                                             [ + Start Shift Run ] |
+-----------------------------------------------------------------------------------------+
| Multi-Head Machine Shift Runs & Cycle Execution                                         |
+---------------------+---------------------+---------------------+-----------------------+
| RUN CODE: EMB-RUN-081 • Machine: Tajima 20-Head Line 01 • Design: EMB-0842-HD (7,500 st)|
| Operator: R. Kumar  • Shift: Day Shift (08:00 to 16:30) • Speed: 850 RPM                |
+-----------------------------------------------------------------------------------------+
| CYCLE RUN COUNTER:                                                                      |
| Total Target Panels:   500 Panels (20 Bundles of 25 pcs)                                |
| Machine Heads:         20 Heads (20 Panels per Cycle)                                   |
| Required Machine Cycles: 500 / 20 = 25 Frame Cycles                                     |
| Current Cycle:         Cycle 18 of 25 (360 Panels Completed)                            |
| Cycle Time:            12.5 Minutes per 20-Head Frame                                   |
+-----------------------------------------------------------------------------------------+
| BUNDLE PROGRESSION TABLE:                                                               |
| Bundle Barcode   | Size | Qty   | Cycle Run | Defective Panels | Status                |
| BND-0842-HD-001  | M    | 25 pcs| Cycle 1-2 | 0 Defective      | [ COMPLETED ]         |
| BND-0842-HD-002  | M    | 25 pcs| Cycle 2-3 | 1 Defective (Hole| [ COMPLETED ]         |
| BND-0842-HD-018  | M    | 25 pcs| Cycle 18  | In Progress      | [ RUNNING ]           |
+-----------------------------------------------------------------------------------------+
```

#### The Multi-Head Batch Multiplier Math:
- A 20-head machine holds **20 garment panels** in its metal frame at one time.
- Each cycle takes **12.5 minutes**:
  $$\text{Cycle Time} = \frac{7,500\text{ stitches}}{850\text{ RPM}} + (\text{2 color stops} \times 0.5\text{ min}) + \text{2 min framing} = 12.5\text{ minutes}$$
- In 12.5 minutes, the machine finishes **20 embroidered panels**!
- To finish 500 panels: $500 / 20 = \mathbf{25\text{ frame cycles}}$ (approx. 5.2 machine hours).

---

### SCREEN 4: Thread Store & Bobbin Inventory (`/embroidery/thread-store`)

Embroidery thread is not ordinary sewing thread. It is high-shine, high-strength trilobal polyester or rayon thread that will not snap at 850 RPM.

```
+-----------------------------------------------------------------------------------------+
| [<- Embroidery Floor]                                              [ + Inward Cones ]   |
+-----------------------------------------------------------------------------------------+
| Thread Cones Inventory, Shade Matching & Bobbins                                        |
+---------------------+---------------------+---------------------+-----------------------+
| THREAD CONES IN STOCK| ACTIVE COLORWAYS   | PRE-WOUND BOBBINS   | LOW STOCK WARNINGS    |
| 480 Cones (5,000m)  | 28 Pantone Shades   | 1,200 Bobbins (SizeL| 2 Colors Low          |
+---------------------+---------------------+---------------------+-----------------------+
| THREAD CONE INVENTORY TABLE                                                             |
| Shade Code | Brand & Material   | Thread Weight| Pantone Match | Cones Available| Status |
| MAD-1143   | Madeira Polyneon   | 40 Weight    | 19-4052 TCX   | 42 Cones (5km) | IN_STK |
| MAD-1001   | Madeira Polyneon   | 40 Weight    | 11-0601 TCX   | 38 Cones (5km) | IN_STK |
| ISA-0010   | Isacord Polyester  | 40 Weight    | 19-0000 Black | 65 Cones (5km) | IN_STK |
| BOB-L-WHT  | Coats Pre-Wound L  | Filament 70s | Under-Thread  | 1,200 Bobbins  | IN_STK |
+-----------------------------------------------------------------------------------------+
```

#### Why Do We Use Pre-Wound Bobbins?
- Traditional home tailors wind their own bobbins on a little wheel.
- In an industrial factory running 200 high-speed embroidery heads, winding bobbins by hand causes uneven thread tension and machine stoppages.
- We purchase **Size-L factory pre-wound bobbins** wound with magnetic core tension. They run 20,000 stitches without jamming!

---

### SCREEN 5: Commercial Stitch Billing Desk (`/embroidery/stitch-billing`)

In the apparel business, embroidery work is priced commercially **per 1,000 stitches**. This screen calculates exact wage earnings and job costs.

```
+-----------------------------------------------------------------------------------------+
| [<- Embroidery Floor]                                             [ + Generate Invoice ]|
+-----------------------------------------------------------------------------------------+
| Commercial Stitch Billing & Thread Cost Ledger                                          |
+---------------------+---------------------+---------------------+-----------------------+
| TOTAL BILLED STITCHES| BILLING RATE / 1K   | TOTAL JOB REVENUE   | THREAD CONSUMED (M)   |
| 37,500,000 Stitches | Rs 0.32 per 1k st   | Rs 12,000.00        | 187,500 Meters        |
| (5,000 pcs x 7.5k st| Factory Base Rate   | Net Job Value       | 37.5 Cones used       |
+---------------------+---------------------+---------------------+-----------------------+
| STITCH BILLING CALCULATION BREAKDOWN                                                    |
| PO Number:       PO-ZIG-8901 (Zara Global)                                              |
| Design:          EMB-0842-HD (Zara Hood Logo - 7,500 stitches)                         |
| Quantity:        5,000 Embroidered Hood Panels                                          |
| Total Stitches:  5,000 panels x 7,500 stitches = 37,500,000 Stitches                    |
| Commercial Rate: Rs 0.32 per 1,000 stitches                                            |
| Total Wage Cost: (37,500,000 / 1,000) x Rs 0.32 = Rs 12,000.00                         |
| Thread Cost:     37.5 Cones @ Rs 160/cone = Rs 6,000.00                                 |
| Stabilizer Cost: 5,000 sheets cutaway @ Rs 0.80 = Rs 4,000.00                           |
| Total Cost per Garment Hood: Rs 4.40 per hoodie                                         |
+-----------------------------------------------------------------------------------------+
```

---

### SCREEN 6: Embroidery Quality Control Gate (`/embroidery/embroidery-qc`)

Before bundles are cleared to move to the sewing floor, a QC auditor inspects the panels under bright daylight lamps.

```
+-----------------------------------------------------------------------------------------+
| [<- Embroidery Floor]                                             [ + Log QC Audit ]    |
+-----------------------------------------------------------------------------------------+
| Embroidery Quality Assurance & Thread Break Frequency (TBI)                             |
+---------------------+---------------------+---------------------+-----------------------+
| AUDIT PASS RATE     | AUDITED PANELS      | PUCKER DEFECTS      | RE-CUT REQUESTS       |
| 99.1%               | 1,200 Panels        | 6 Panels (Fixed)    | 5 Panels (Hoop Hole)  |
+---------------------+---------------------+---------------------+-----------------------+
| EMBROIDERY DEFECT AUDIT LOG                                                             |
| Audit ID  | Machine ID| Bundle Barcode  | Defect Found        | Severity| Verdict       |
| QC-EMB-101| LINE-01   | BND-0842-HD-001 | Zero Defect (Clean) | None    | [ PASS ]      |
| QC-EMB-102| LINE-01   | BND-0842-HD-002 | Needle Hole on Rib  | Major   | [ RE-CUT ]    |
| QC-EMB-103| LINE-03   | BND-0839-CP-004 | Loose Loop / Snag   | Minor   | [ REPAIRED ]  |
+-----------------------------------------------------------------------------------------+
```

#### The 4 Critical Checks in Embroidery QC:
1. **Fabric Puckering Check**:
   - The fabric around the logo must lay completely flat without wavy wrinkles or bunching.
2. **Birdnesting & Knot Inspection**:
   - Flip the panel over to check the back side. The bobbin thread should form a clean 1/3 white line down the center with no loose loops or thick tangled knots.
3. **Hoop Mark (Hoop Burn)**:
   - Clamping plastic hoops onto soft cotton fleece can leave an ugly bruised ring mark. If found, panels must be touched with a steam puff gun to restore the fabric pile.
4. **Needle Cut Holes**:
   - If a needle is burred or bent, it punches a tiny hole in the cotton jersey. Under tension, this hole turns into a tear. Panels with needle cuts are immediately marked `RE-CUT`.

---

## 4. The Complete Story of Order PO-ZIG-8901 in Embroidery

Let us follow how the outer hood panels for **5,000 Heavyweight French Terry Hoodies** are embroidered:

```
1. CUT HOOD PANELS ARRIVE FROM CUTTING (Day 2 - 03:30 PM)
   Division 03 (Cutting Floor) sends 200 bundles of Outer Hood Panels (25 pcs each).
   Supervisor scans bundle barcodes into Line 01 and Line 02.
       |
       v
2. PUNCH FILE LOADED OVER NETWORK (Day 2 - 04:00 PM)
   Tajima 20-Head machines download design EMB-0842-HD from the central server.
   Design specs: 7,500 stitches, 3D Puff satin lettering, 65mm x 45mm.
       |
       v
3. THREAD CONES MOUNTED (Day 2 - 04:30 PM)
   Technicians mount 40 cones of Madeira Polyneon:
   - Needle 01: Classic Navy (Pantone 19-4052 TCX).
   - Needle 02: Snow White (Pantone 11-0601 TCX).
   - Pre-wound bobbins checked on all 20 heads.
       |
       v
4. FRAMING WITH 2.5OZ CUTAWAY BACKING (Day 3 - 08:00 AM)
   Operators clamp each hood panel inside a 12cm round Tajima hoop.
   A sheet of 2.5oz cutaway stabilizer is clamped underneath.
   A 3mm sheet of high-density EVA puff foam is laid over the lettering area.
       |
       v
5. MULTI-HEAD 20-HEAD RUN AT 850 RPM (Day 3 - 08:15 AM)
   Line 01 and Line 02 run simultaneously (40 panels finished every 13 minutes).
   Sharp needles perforate the foam while thick satin stitches cover it completely.
   The 3D letters rise up 3 millimeters off the cloth!
       |
       v
6. TRIMMING, FOAM HEAT CLEANING & BACKING TEAR (Day 3 - 01:00 PM)
   Helpers pull away excess puff foam. A quick blast of a 120°C hot-air gun
   shrinks any micro-specks of foam cleanly into the stitches.
   Excess backing paper is trimmed neatly around the border with curved scissors.
       |
       v
7. QC AUDIT & PIECE RECONCILIATION (Day 3 - 04:30 PM)
   5,000 hood panels inspected:
   - 4,992 Panels Passed (Zero Defect, crisp 3D satin logo).
   - 8 Panels Rejected (needle cut holes during thread break).
   - Defect log automatically requests 8 re-cut hood panels from Division 03.
       |
       v
8. BUNDLE HANDOVER TO STITCHING (Day 3 - 05:30 PM)
   Passed panels are tied back into their 25-piece bundles with barcode tags.
   Status updated: [ DISPATCHED_TO_SEWING ].
   Handed over to Division 06 (Stitching Floor Line 04) to be sewn onto the hoodies!
```

---

## 5. What Do Downstream Divisions Receive?

When embroidered bundles leave Division 05, here is who receives what:

### A. What Division 06 (Stitching & Sewing Floor) Receives:
1. **The Finished 3D Embroidered Hood Panels**:
   - All 5,000 outer hood panels decorated with the crisp 3D Zara satin logo.
   - Cleanly trimmed, steam-pressed (no hoop marks), and tied into matching 25-piece bundles.
2. **The Barcode Handshake**:
   - When the sewing line supervisor scans barcode `BND-0842-HD-001`, the system confirms:
     - *"Embroidered hood panels received on Line 04. Ready for hood-to-body sewing assembly."*

### B. What Division 03 (Cutting Floor) Receives (Defect Loop):
1. **The Recut Requisition (`8 Panels`)**:
   - The QC audit logged 8 spoiled hood panels due to needle punch tears.
   - Division 03 gets an instant ticket to cut 8 replacement panels from the remnant rack (`ROL-FT-8821-A2`) so the order stays 100% complete!

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world factory hazards in computerized embroidery and how our system prevents them:

### 1. Fabric Puckering on Knitwear
- **What can go wrong:** Knitted French Terry cloth is stretchy. If an operator uses cheap tearaway paper or sets stitch density too tight, the fabric bunches up into ugly wavy wrinkles around the logo.
- **How our system protects you:** The Punch Library requires specifying `backing_type = CUTAWAY_2.5OZ` for all knit styles. The operator cannot start the shift without confirming cutaway stabilizer is mounted on the frames.

### 2. Needle Cut Holes in Cotton Jersey
- **What can go wrong:** Using a sharp wedge needle (designed for leather or denim) on cotton knitwear slices through the knit yarns. After 1 wash, the stitches rip out, leaving giant holes in the garment!
- **How our system protects you:** The system enforces `needle_type = DBxK5_SES_75_11` (Ballpoint needle). The rounded tip slides harmlessly between cotton fibers without slicing them.

### 3. Birdnesting Bobbin Jam Underneath
- **What can go wrong:** If top thread tension slips or the bobbin case has lint trapped inside, thread loops wildly underneath the panel into a giant tangled birdnest. If the operator pulls it violently, it rips the shirt!
- **How our system protects you:** Automatic optical thread sensors stop the machine within 2 stitches of a break, preventing thread build-up.

### 4. Hoop Burn Ring Marks
- **What can go wrong:** Clamping heavy metal hoops onto soft fleece crushes the cotton loops, leaving an ugly shiny ring that looks like a stain.
- **How our system protects you:** QC inspection checks for hoop marks. If found, panels are touched with a steam restoration gun before bundle dispatch.

### 5. DST Thread Sequence Mismatch
- **What can go wrong:** The punch file expects Needle 01 to be Navy Blue and Needle 02 to be White. If an operator mounts White on Needle 01, the colors stitch completely inverted!
- **How our system protects you:** The `/embroidery/machine-runs` screen displays a visual color-stop map showing exactly which thread cone number must be threaded onto each needle head.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/embroidery` | Control tower to track active 20-head lines, speeds, and thread breaks | Floor Supervisor |
| **2** | `/embroidery/punch-library` | Stores DST vector stitch files, dimensions, and needle specs | Punch Digitizer |
| **3** | `/embroidery/machine-runs` | Tracks 20-head batch frame cycles, RPM speeds, and bundle progress | Machine Operator |
| **4** | `/embroidery/thread-store` | Manages Madeira polyester cone stock, bobbins, and Pantone matches | Thread Storekeeper |
| **5** | `/embroidery/stitch-billing` | Calculates commercial stitch rates (Rs 0.32/1k) and job profitability | Costing Clerk |
| **6** | `/embroidery/embroidery-qc` | Audits puckering, needle holes, birdnesting, and thread break index | QC Inspector |

*This document is written in clean, plain language with zero emojis so every operator, technician, and floor supervisor can follow it clearly.*
