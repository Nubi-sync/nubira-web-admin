# Division 07 • Industrial Washing & Wet Processing Master Guide
### Zigza MES Garment Platform • Division 07 (Step 7 of 11)
**Where to find it in the app:** `/washing`  
**Target Audience:** Washing Masters, Laundry Chemists, Machine Operators, Hydro & Tumbler Crews, and Environmental QC Inspectors  
**Document File:** `docs_final/07_washing.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 06 (Stitching Floor), tailors completed sewing all panels together into full garments.

However, brand-new sewn garments from the sewing floor are often **stiff, rough, dusty, and prone to future shrinking**:
- **Raw cotton has tiny loose fibers (fuzz)** that cause ugly pilling balls after you wear it.
- **Garments must be washed in large industrial laundry drums** with special biological enzymes and silicon softeners to make them baby-soft, smooth, and pre-shrunk.
- **We spin out the water in high-speed centrifugal extractors and dry them in heated tumblers** until the fabric contains less than 6% moisture.

In an apparel factory, **Division 07 (Industrial Washing & Wet Processing)** is the **softness, hand-feel, and pre-shrinkage refinery**.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 06. Stitching Floor ] sends: 5,000 Sewn Hoodies for PO-ZIG-8901         |
|   [ 02. Merchandising   ] sends: Approved Wash Spec: Bio-Enzyme Softener    |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 07. INDUSTRIAL WASHING & WET PROCESSING                 |               |
|   | 1. Recipe Dosing       ---> Mix bio-enzymes & silicon   |               |
|   |                             softener at 1:10 water ratio|               |
|   | 2. Belly Washer Drum   ---> Wash 600kg batch at 55°C to |               |
|   |                             dissolve surface cotton fuzz|               |
|   | 3. Hydro-Extraction    ---> Spin at 1,200 RPM to remove |               |
|   |                             70% of soaked water         |               |
|   | 4. Tumbler Drying      ---> Dry at 80°C until moisture  |               |
|   |                             drops below 6.0%            |               |
|   | 5. Shrinkage & QC Gate ---> Measure length, width, and  |               |
|   |                             seam spirality (AATCC 135)  |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               v (All 5,000 garments clean, ultra-soft, and pre-shrunk)      |
|   [ 08. Steam Ironing Floor ]                                               |
|   Operators steam-press hoodies on vacuum tables to remove drying wrinkles  |
|   and give them a sharp retail finish!                                      |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used in industrial garment laundries every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Wet Processing** | Any factory operation that dips garments into water, chemicals, or dyes. | Washing, bleaching, dyeing, and chemical softening. |
| **Bio-Enzyme Wash** | Using natural microscopic biological enzymes (cellulase) to eat away tiny loose cotton fuzz. | Makes cotton look clean, bright, and prevents fuzzy pilling balls from forming. |
| **Silicon Softener Wash** | Adding microscopic silicone oils to the rinse bath that coat cotton fibers. | Gives luxury hoodies that silky-smooth, buttery "cashmere-like" hand feel. |
| **Stone Wash** | Washing denim jeans or fleece with real porous volcanic pumice stones. | The stones rub against seams to create a rugged vintage, faded look. |
| **Liquor Ratio (M:L)** | The ratio of dry garment weight (Material) to water volume (Liquor). | `1:10 ratio` means for every 1 kg of dry hoodies, we add 10 Liters of hot water into the washer drum. |
| **Belly Washer** | A giant horizontal stainless-steel washing machine that holds 600 kg of clothes. | Like a giant front-loading laundry drum, but as large as a minivan! |
| **Hydro-Extractor** | A high-speed spinning metal basket that spins wet clothes to fling out water like a salad spinner. | Spins at 1,200 RPM for 8 minutes to remove 70% of water so clothes dry twice as fast! |
| **Tumbler Dryer** | A giant industrial gas-heated tumble dryer that circulates hot air (80°C) through tumbling clothes. | Softens cotton loops and bakes out residual moisture. |
| **Residual Moisture %** | How much dampness or water is still trapped inside the cotton fibers after drying. | Must stay under `6.0%`. If garments feel damp (e.g. 12%), they can grow mold or mildew inside plastic shipping bags! |
| **Post-Wash Shrinkage** | How much a garment shrinks in length and width after its first full industrial wash. | A 70cm hoodie shrinks to 69.2cm (-1.1% shrinkage). Industry standard must stay under `1.5%`. |
| **Spirality (Seam Twist)** | When a side seam twists forward across the belly after washing instead of hanging straight down. | Caused by twisted yarn torque. If side seams twist more than 2 degrees, the garment is rejected! |
| **ETP (Effluent Treatment Plant)** | The factory's on-site wastewater recycling plant that neutralizes chemicals before draining. | We test water pH (must be between 6.5 and 8.0) so no harmful chemicals enter city rivers. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 07 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Washing Plant Cockpit (`/washing`)

This is the control room where the Laundry Plant Manager monitors running washing drums, daily wet-load tonnage, chemical liquor ratios, and shrinkage alerts.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 07 * Washing ] |
+-----------------------------------------------------------------------------------------+
| Industrial Washing & Wet Processing                           [ Effluent ETP: pH 7.2 OK]|
| Enzyme bio-polishing, silicon softening, 1:10 liquor ratio, and zero-shrinkage controls |
|         [ Machine Runs ] [ Wash Recipes ] [ Liquor Audit ] [ Shrinkage QC ] [ Handover ]|
+---------------------+---------------------+---------------------+-----------------------+
| ACTIVE TUMBLERS     | DAILY WASH VOLUME   | LIQUOR RATIO (M:L)  | RESIDUAL SHRINKAGE    |
| 4 / 6 Running       | 3,850 Pcs           | 1 : 10.1            | < 1.15% Length & Width|
| 600kg Belly Washers | 4,250 kg Wet Load   | Eco Target 1:10.0   | AATCC 135 Verified    |
+---------------------+---------------------+---------------------+-----------------------+
| LIVE MACHINE FLOOR MATRIX (WASHERS * HYDROS * TUMBLERS)                                 |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
| | WASHER 01 (600kg| | WASHER 02 (600kg| | HYDRO 01 (300kg)| | TUMBLER 01      |        |
| | [ RUNNING ]     | | [ RUNNING ]     | | [ RUNNING ]     | | [ DRYING ]      |        |
| | Batch: WSH-112  | | Batch: WSH-113  | | Batch: WSH-111  | | Batch: WSH-110  |        |
| | Temp: 55°C      | | Temp: 55°C      | | Speed: 1,200 RPM| | Temp: 80°C      |        |
| | Time: 22m left  | | Time: 45m left  | | Time: 3m left   | | Moisture: 5.4%  |        |
| +-----------------+ +-----------------+ +-----------------+ +-----------------+        |
+-----------------------------------------------------------------------------------------+
| ACTIVE WASH BATCHES QUEUE                                                               |
| Batch ID    | PO Number   | Style & Fabric     | Garments | Stage       | Residual Moist|
| WSH-BAT-112 | PO-ZIG-8901 | ART-HD-8821 Hoodie | 800 pcs  | WASHING     | 100% (Wet)    |
| WSH-BAT-111 | PO-ZIG-8901 | ART-HD-8821 Hoodie | 800 pcs  | HYDRO_SPIN  | 35% (Damp)    |
| WSH-BAT-110 | PO-ZIG-8901 | ART-HD-8821 Hoodie | 800 pcs  | QC_AUDIT    | 5.4% (Passed) |
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Laundry KPI Cards (What are they & Why are they here?)

1. **Active Tumblers (`4 / 6 Running`)**:
   - **What it shows:** How many 600kg industrial washing machines are turning right now.
   - **Why it is here:** High-capacity laundry machines consume substantial electricity and steam boiler energy. Maximizing drum loads keeps operating costs low.
2. **Daily Wash Volume (`3,850 Pcs • 4,250 kg`)**:
   - **What it shows:** Total weight and piece count processed through the laundry today.
   - **Why it is here:** Ensures washing output matches sewing floor production so unwashed garments do not pile up in laundry carts.
3. **Liquor Ratio (`1 : 10.1 • Target 1:10.0`)**:
   - **What it shows:** Water consumption efficiency.
   - **Why it is here:** If an operator accidentally fills a 1:20 ratio, the factory wastes thousands of liters of clean water and dilutes chemical potency!
4. **Residual Shrinkage (`< 1.15% • AATCC 135 Pass`)**:
   - **What it shows:** Average fabric shrinkage after drying.
   - **Why it is here:** Ensures garments stay strictly within buyer specifications ($\le 1.5\%$) so hoodies don't become too tight or too short.

---

#### Box 2: Machine Floor Matrix
Displays every machine on the laundry floor:
- **Horizontal Belly Washers**: Wash garments with water, enzymes, and softeners.
- **Centrifugal Hydro-Extractors**: Spin out water using high g-force centrifugal spin.
- **Gas/Steam Tumbler Dryers**: Dry clothes with heated air and moisture sensor cutoffs.
- **Status Badges**: `[RUNNING]`, `[HYDRO_SPIN]`, `[DRYING]`, `[IDLE]`, or `[MAINTENANCE]`.

---

### SCREEN 2: Chemical Wash Recipe Master (`/washing/recipes`)

Garment washing requires exact chemistry. This screen stores certified chemical recipes so operators never guess chemical quantities.

```
+-----------------------------------------------------------------------------------------+
| [<- Washing Plant]                                              [ + Create New Recipe ] |
+-----------------------------------------------------------------------------------------+
| Standard Industrial Washing Recipes & Chemical Dosing                                   |
+---------------------+---------------------+---------------------+-----------------------+
| RECIPE CODE | WASH TYPE          | TEMP   | CYCLE TIME| LIQUOR RATIO | TARGET PH| STATUS    |
| WSH-BIO-01  | Bio-Enzyme Softener| 55°C   | 45 Mins   | 1:10         | 6.2 - 6.5| ACTIVE    |
| WSH-SIL-02  | Silicon Peach Touch| 40°C   | 30 Mins   | 1:8          | 6.0 - 6.5| ACTIVE    |
| WSH-STN-03  | Vintage Stone Wash | 60°C   | 60 Mins   | 1:12         | 5.5 - 6.0| ACTIVE    |
+-----------------------------------------------------------------------------------------+
```

#### The Dosing Formula Inside Recipe `WSH-BIO-01`:
For an 800-piece batch of Heavyweight French Terry Hoodies (approx. 680 kg dry weight):
1. **Water Volume Calculation**:
   $$\text{Water Volume} = \text{Dry Weight (680 kg)} \times \text{Liquor Ratio (10)} = \mathbf{6,800\text{ Liters of Water}}$$
2. **Chemical Dosing Breakdown**:
   - **Bio-Cellulase Enzyme (`1.5 g/L`)**: $(6,800 \times 1.5) / 1,000 = \mathbf{10.2\text{ kg}}$ (Eats surface fuzz).
   - **Acetic Acid Buffer (`0.8 g/L`)**: $(6,800 \times 0.8) / 1,000 = \mathbf{5.44\text{ kg}}$ (Controls pH at 6.2).
   - **Micro-Emulsion Silicon (`2.0 g/L`)**: $(6,800 \times 2.0) / 1,000 = \mathbf{13.6\text{ kg}}$ (Gives buttery softness).

---

### SCREEN 3: Machine Runs & Batch Execution (`/washing/machine-runs`)

This screen tracks the physical movement of clothes through the **3-Stage Wet Pipeline**:

```
+-----------------------------------------------------------------------------------------+
| [<- Washing Plant]                                                [ + Load New Batch ]  |
+-----------------------------------------------------------------------------------------+
| 3-STAGE INDUSTRIAL WET PIPELINE EXECUTION                                               |
+-----------------------------------------------------------------------------------------+
| STAGE 1: BELLY WASHER       STAGE 2: HYDRO-EXTRACTOR      STAGE 3: TUMBLER DRYER        |
| [ 45 Minutes @ 55°C ]   ->  [ 8 Minutes @ 1,200 RPM ]  -> [ 35 Minutes @ 80°C ]         |
| Hot water, enzyme wash,     Spins out 70% of soaked       Hot air tumble bakes cotton   |
| rinse, & silicon bath.      water. Damp load exit.        to <= 6.0% moisture target.   |
+-----------------------------------------------------------------------------------------+
| BATCH RUN MONITOR:                                                                      |
| Batch ID: WSH-BAT-112 • Order: PO-ZIG-8901 (Zara Hoodie) • Machine: Belly Washer 01    |
| Input Dry Weight: 680.0 kg (800 Hoodies) • Operator: K. Selvan • Status: [ WASHING ]   |
| Stage Progression: [ Step 1: Drain & Neutralize ] -> [ Step 2: Move to Hydro Basket ]   |
+-----------------------------------------------------------------------------------------+
```

---

### SCREEN 4: Post-Wash Shrinkage & Spirality Gate (`/washing/shrinkage-qc`)

After garments are dried, QC auditors pull random test samples from the batch and measure them on calibration tables to check dimensions under international standards (AATCC 135 / ISO 6330).

```
+------------------------------------------------------------------------+
| POST-WASH SHRINKAGE & SPIRALITY AUDIT                            [ X ] |
+------------------------------------------------------------------------+
| Batch Number:          [ WSH-BAT-110 • ART-HD-8821 Hoodie            ] |
| Specimen Size Audited: [ Size Medium (M)                             ] |
+------------------------------------------------------------------------+
| LENGTH MEASUREMENTS:                                                   |
| Pre-Wash Length:       [ 72.00 cm ]    Post-Wash Length: [ 71.20 cm ]  |
| Length Shrinkage:      -1.11% (Allowed Tolerance: <= 1.50%)   [ PASS ] |
+------------------------------------------------------------------------+
| WIDTH MEASUREMENTS (CHEST WIDTH):                                      |
| Pre-Wash Chest Width:  [ 58.00 cm ]    Post-Wash Width:  [ 57.45 cm ]  |
| Width Shrinkage:       -0.95% (Allowed Tolerance: <= 1.50%)   [ PASS ] |
+------------------------------------------------------------------------+
| SPIRALITY & SEAM TWIST:                                                |
| Side Seam Twist Angle: [ 0.45 Degrees ] (Allowed: <= 2.00 Deg) [ PASS ] |
+------------------------------------------------------------------------+
| OVERALL VERDICT:       [ PASS_TO_IRONING_FLOOR                       v]|
|                                          [ Cancel ] [ Submit QC Verdict]|
+------------------------------------------------------------------------+
```

#### What is the Auto-Escalation Protocol?
- If a fabric batch shrinks by more than **2.5%** (e.g. Length shrinks -3.8%), the system triggers a **High-Shrinkage Auto-Escalation Banner**.
- An automatic alert is sent back to **Division 03 (Cutting Floor CAD Station)**:
  > *"Warning: Lot-402 French Terry shrinkage is running high at -3.8%. Automatically expanding CAD marker pattern lengths by +2.0 cm to compensate on future cutting lays!"*
- This intelligent feedback loop ensures the factory never cuts thousands of garments that shrink too small!

---

### SCREEN 5: Custody Handover to Steam Ironing (`/washing/handover`)

Before wet laundry carts leave the wash plant, inspectors test residual dampness using an electronic probe.

```
+-----------------------------------------------------------------------------------------+
| [<- Washing Plant]                                                                      |
+-----------------------------------------------------------------------------------------+
| Wet Processing to Steam Ironing Floor Custody Transfer                                  |
+---------------------+---------------------+---------------------+-----------------------+
| DRIED BATCHES READY | AVG MOISTURE SCORE  | AIR-FLOW DRY TIME   | CUSTODY HANDOVERS     |
| 5 Batches           | 5.3% (Optimal)      | 34.2 Minutes        | 4,000 Pcs Cleared     |
+---------------------+---------------------+---------------------+-----------------------+
| HANDOVER VERIFICATION TABLE                                                             |
| Batch ID    | Style Ref   | Quantity| Residual Moisture | QC Verdict   | Action         |
| WSH-BAT-110 | ART-HD-8821 | 800 pcs | 5.2% (Bone Dry)   | [ VERIFIED ] | [ Handover -> ]|
| WSH-BAT-109 | ART-HD-8821 | 800 pcs | 5.4% (Bone Dry)   | [ VERIFIED ] | [ Handover -> ]|
| WSH-BAT-108 | ART-HD-8821 | 800 pcs | 8.8% (Damp Hold)  | [ RE-TUMBLE] | [ Dry 10m More]|
+-----------------------------------------------------------------------------------------+
```

- **The Moisture Gate ($\le 6.0\%$)**:
  - Batches 110 and 109 have 5.2% and 5.4% moisture. They are approved for ironing.
  - Batch 108 has 8.8% moisture (feels damp). The computer locks the handover button and displays: `[ RE-TUMBLE ]`. Garments must be dried for 10 more minutes until fully dry!

---

## 4. The Complete Story of Order PO-ZIG-8901 in Washing

Let us follow how **5,000 Heavyweight French Terry Hoodies** are washed:

```
1. 5,000 SEWN HOODIES ARRIVE FROM STITCHING (Day 4 - 05:30 PM)
   Division 06 (Stitching Floor) transfers 5,000 sewn hoodies in clean polybags.
   Washing supervisor groups them into 6 batches of 800 to 850 pieces.
       |
       v
2. CHEMICAL RECIPE LOADED (Day 5 - 08:00 AM)
   Master selects certified Recipe WSH-BIO-01:
   - 6,800 Liters of water at 55°C.
   - 10.2 kg Bio-Cellulase Enzyme (surface anti-pilling).
   - 13.6 kg Micro-Silicon Softener (silky hand-feel).
       |
       v
3. BELLY WASHER RUN (Day 5 - 08:30 AM to 09:15 AM)
   Washer 01 rotates forward and reverse for 45 minutes.
   Enzymes dissolve loose micro-fibers, making cotton loops smooth.
   Cold silicon rinse locks a soft buttery touch into the fabric.
       |
       v
4. CENTRIFUGAL HYDRO-EXTRACTION (Day 5 - 09:25 AM to 09:35 AM)
   Wet hoodies loaded into Hydro 01.
   Drum spins at 1,200 RPM for 8 minutes. 70% of soaked water is flung out!
       |
       v
5. GAS-FIRED TUMBLER DRYING (Day 5 - 09:45 AM to 10:25 AM)
   Tumbled in Tumbler 01 for 35 minutes at 80°C.
   Electronic moisture sensor beeps: Moisture = 5.3% (Bone Dry).
       |
       v
6. SHRINKAGE & SPIRALITY AUDIT (Day 5 - 10:45 AM)
   QC auditor measures 5 test specimens:
   - Length shrinkage: -1.1% (Within 1.5% limit).
   - Width shrinkage: -0.9% (Within 1.5% limit).
   - Seam spirality: 0.45° (Straight seams, zero twist).
   - Status: [ PASS_TO_IRONING_FLOOR ].
       |
       v
7. HANDOVER TO STEAM IRONING (Day 5 - 11:30 AM)
   Clean, softened, pre-shrunk hoodies loaded onto rolling trollies.
   Barcode status updated: [ DISPATCHED_TO_IRONING ].
   Handed over to Division 08 (Steam Ironing Floor) for vacuum pressing!
```

---

## 5. What Do Downstream Divisions Receive?

When washed batches leave Division 07, here is who receives what:

### A. What Division 08 (Steam Ironing Floor) Receives:
1. **The Softened, Pre-Shrunk Garments**:
   - Clean, baby-soft hoodies with zero surface fuzz.
   - Guaranteed residual moisture under 6.0% (ready for hot steam pressing).
2. **The Wash Lot Handover Slip**:
   - Confirms verified piece count (e.g. 800 pcs) and that all shrinkage parameters passed AATCC standards.

### B. What Division 03 (Cutting Floor) Receives (Auto-Escalation Feedback):
- If shrinkage ever exceeds 2.5%, Cutting CAD engineers receive an automated alert with the exact measured shrinkage percentage so they can adjust marker dimensions for the next cutting lay.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world factory hazards in industrial washing and how our system prevents them:

### 1. The Over-Cooked Enzyme Disaster (Fabric Destruction)
- **What can go wrong:** If an operator forgets a batch inside the washer and enzymes run for 90 minutes instead of 45 minutes at high temperature, the enzymes eat away the structural cotton fibers! The cloth becomes thin and tears like wet paper towel when pulled!
- **How our system protects you:** The machine run screen has an automated countdown timer. When cycle time reaches 45 minutes, an audible siren sounds and auto-drain valves open to flush enzymes.

### 2. Mold & Mildew from Damp Garments
- **What can go wrong:** If workers rush and remove hoodies from dryers when moisture is still 12% (damp), and they are ironed and sealed in airtight polybags, mold and sour fungus grow inside the box during 30 days of ocean shipping!
- **How our system protects you:** The `/washing/handover` screen requires an electronic moisture probe reading $\le 6.0\%$. If moisture is above 6.0%, the system disables the handover button!

### 3. Excessive Tumble Shrinkage from Overheating
- **What can go wrong:** If tumbler heat runs at 110°C instead of 80°C, cotton fibers bake and shrink drastically, turning Medium hoodies into Extra-Small!
- **How our system protects you:** Tumbler temperature sensors are logged. Any run exceeding 85°C triggers a temperature cutoff alarm.

### 4. Seam Spirality (Torque Seam Twist)
- **What can go wrong:** As knit fabric tumbles, mechanical torque twists side seams across the front of the body.
- **How our system protects you:** QC audits measure spirality angle. If seam twist exceeds 2.0 degrees, the batch is held for steam frame alignment in Division 08.

### 5. Toxic Chemical Effluent Pollution
- **What can go wrong:** Draining acidic or chemical-heavy wash water directly into city sewers pollutes rivers and leads to factory shutdown by government pollution boards.
- **How our system protects you:** The `/washing/liquor-audit` screen logs ETP neutralization tests. Every drain batch must record a neutral pH between 6.5 and 8.0 before discharge authorization is logged.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/washing` | Main control room to monitor running drums, wet load, and ETP pH | Laundry Plant Manager |
| **2** | `/washing/recipes` | Stores chemical recipes (Bio-Enzyme, Silicon Softener) and dosing | Laundry Chemist |
| **3** | `/washing/machine-runs` | 3-stage pipeline: Belly Washer -> Hydro-Extractor -> Tumbler Dryer | Machine Operators |
| **4** | `/washing/liquor-audit` | Calculates water volume (1:10) and verifies effluent drain pH | ETP Technician |
| **5** | `/washing/shrinkage-qc` | Measures post-wash shrinkage and seam twist with auto-escalation | QC Auditor |
| **6** | `/washing/handover` | Tests residual moisture (<=6.0%) and clears batches for Steam Ironing | Handover Clerk |

*This document is written in clean, plain language with zero emojis so every washing master, chemical helper, and floor operator can follow it clearly.*
