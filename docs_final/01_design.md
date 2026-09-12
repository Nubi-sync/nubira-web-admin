# Division 01 • Design Studio & Tech-Pack Master Guide
### Zigza MES Garment Platform • Division 01 (Step 1 of 11)
**Where to find it in the app:** `/design`  
**Target Audience:** Factory Managers, Designers, Pattern Masters, New Starters, and Clients  
**Document File:** `docs_final/01_design.md`

---

## 1. Simple Summary: What Does This Division Do?

Imagine you want to bake a cake for 5,000 people. You cannot just tell the kitchen "make a nice chocolate cake." You need a **recipe book** with exact ingredients, exact gram weights, baking temperatures, and step-by-step pictures.

In a garment factory, **Division 01 (Design Studio)** creates that exact "recipe book" for clothes. We call this recipe book a **Tech-Pack** (Technical Package).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE SIMPLE BIG PICTURE                           │
│                                                                             │
│   [ Buyer's Idea / Sketch ]                                                 │
│               │                                                             │
│               ▼                                                             │
│   ┌──────────────────────────┐                                              │
│   │ 01. DESIGN STUDIO        │                                              │
│   │ - Writes the Tech-Pack   │ ---> "Make a 380 GSM Hoodie, Base Size M"   │
│   │ - Tests the Cloth Shrink │ ---> "Cloth shrinks 3.5% in warm wash"       │
│   │ - Sizes for Everyone     │ ---> "Chest: S=50cm, M=53cm, L=56cm"         │
│   │ - Makes 1 Sample & Tests │ ---> "Tape measure check: passed!"          │
│   │ - Gets Buyer 'Golden OK' │ ---> "Approved! Ready to make 5,000 pieces"  │
│   └──────────────────────────┘                                              │
│               │                                                             │
│               ▼                                                             │
│   [ 02. Merchandising ] receives the recipe to buy cloth and plan cost!     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Before looking at the screens, here are simple explanations of terms used in the garment factory:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Tech-Pack** | The complete "blueprint / recipe" of a garment. | Like building plans for a house before you lay bricks. |
| **GSM** | Grams per Square Meter. Tells you how **thick or heavy** the cloth is. | 160 GSM = light summer T-shirt.<br>380 GSM = thick, heavy winter hoodie. |
| **POM (Point of Measure)** | The exact spot where we put the measuring tape. | "Chest width: 1 inch below the armpit." |
| **Grading** | Making the same shirt bigger or smaller for different body sizes. | If size M is 53 cm wide, size L is 56 cm, and size XL is 59 cm. |
| **Tolerance (+/-)** | The tiny margin of error allowed. | If target length is 70 cm with +/- 0.5 cm tolerance, anything between 69.5 cm and 70.5 cm is accepted. |
| **Shrinkage** | How much the cloth shrinks when washed and dried with hot air. | If cloth shrinks 3.5%, we must cut it 3.5% longer so the final washed hoodie isn't too short! |
| **Proto Sample** | The very first test piece sewn by one tailor to see if the design looks good. | Like a rough draft of a drawing. |
| **PPS (Pre-Production Sample)** | The final perfect sample piece sent to the buyer. | Once the buyer signs this with a "Golden Seal," the factory is allowed to start bulk production. |
| **SPI** | Stitches Per Inch. How many tiny stitch dots are in 1 inch of sewing. | 12 SPI = strong, neat stitching. |
| **Seam Class (ISO)** | The sewing machine stitch style. | Overlock (cleans the cloth edge so threads don't fray out). Flatlock (flat athletic gym seams). |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us look at every page and understand **every single box and button**.

---

### SCREEN 1: The Main Studio Dashboard (`/design`)

This is the homepage of the Design Studio.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [<- Workspace Hub]                                            [ Division 01 • Design ]  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Design & Tech-Pack Studio                                                               │
│ CAD sampling approvals, spec sheets, grading tolerances, and sample tracking            │
│                                                [ Master Catalog ] [ + Create Tech-Pack ]│
├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────┤
│ ACTIVE SPECS      │ SAMPLE FIT        │ GRADING MATRIX    │ PPS READINESS               │
│ 4 Specs           │ 2 Pending         │ 28 Points         │ 25.0%                       │
│ 1 Approved Bulk   │ 2 of 4 Golden OK  │ Graded for Adult  │ 1 of 4 ready for cutting    │
├───────────────────┴───────────────────┴───────────────────┴─────────────────────────────┤
│ ACTIVE QUEUE TABLE                                                     [ Search... ]    │
│ [ All Queue ] [ Approved Bulk ] [ PPS Review ] [ Sample Dev ] [ Revise Fit ] [ Draft ]  │
│─────────────────────────────────────────────────────────────────────────────────────────│
│ Style Ref     │ Brand   │ Silhouette  │ Base Size │ PPS Status  │ Flow     │ Cut Date   │
│ ART-HD-8821   │ OLLYPOP │ Hoodie      │ M         │ PPS REVIEW  │ Emb First│ 26-Sep-2026│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Box 1: The 4 Top Metric Cards (What are they & Why are they here?)

1. **Active Tech-Packs (`4 Specs`)**:
   - **What it shows:** How many clothing styles are currently being designed.
   - **Why it is here:** Tells the factory how much new work is coming.
2. **Sample Fit Approvals (`2 Pending`)**:
   - **What it shows:** How many sample pieces are waiting for the buyer's approval.
   - **Why it is here:** If this number is high, tailors are sitting waiting for buyer feedback.
3. **Size Grading Matrix (`28 Points`)**:
   - **What it shows:** Total measurement spots (POMs) saved in the system across chest, waist, neck, sleeve, etc.
   - **Why it is here:** Makes sure we did not forget any important measurement.
4. **PPS Readiness (`25.0%`)**:
   - **What it shows:** The percentage of styles that have received the final Golden Seal.
   - **Why it is here:** This is the green light. If this says 0%, the cutting floor is not allowed to cut any fabric!

---

#### Box 2: The Active Queue Table (The List of Clothes)

Every row is a clothing style. Here is what each column tells you:

- **Style Ref (e.g. `ART-HD-8821`)**: The unique ID code for this hoodie. Every machine and worker will use this code.
- **Buyer / Brand (e.g. `OLLYPOP` or `ZARA`)**: Who we are making this for.
- **Garment Silhouette (e.g. `Hoodie • 380 GSM`)**: What type of clothing it is and how thick the cloth is.
- **Base Size (e.g. `M`)**: The middle size we use to make the first sample.
- **PPS Status (Color Badges)**:
  - `[DRAFT]`: Designer is still typing details.
  - `[SAMPLE DEV]`: Sample tailor is stitching the first test piece.
  - `[PPS REVIEW]`: Sample sent to buyer; waiting for buyer to say yes.
  - `[APPROVED BULK]`: Buyer loved it and gave the Golden Seal! Ready to cut 5,000 pieces!
  - `[REVISE FIT]`: Sample was too tight or too loose; pattern master must fix the size.
- **Embellishment Flow**:
  - `Plain Cut`: Normal garment (no print, no embroidery).
  - `Embroidery First`: We must embroider the chest *before* we print or stitch!
  - `Print First`: We must screen print the fabric *before* we embroider!
- **Target Cut Date**: The deadline when fabric cutting must begin.

---

### SCREEN 2: The "Create Tech-Pack" Popup Modal

When you click the dark purple button **`+ Create Tech-Pack`**, a clean 2-step window opens up:

```
┌────────────────────────────────────────────────────────────────────────┐
│ CREATE NEW TECH-PACK                                             [ X ] │
│ Step 1 of 2: Creative & Silhouette Definition                          │
├────────────────────────────────────────────────────────────────────────┤
│ Style Number:      [ ART-HD-8821                 ]                     │
│ Style Name:        [ Heavy French Terry Hoodie   ]                     │
│ Brand:             [ OLLYPOP                   ▼ ]                     │
│ Category:          [ Hoodie                    ▼ ]                     │
│ Fabric Name:       [ 100% Cotton 3-End Terry     ]                     │
│ Fabric Weight:     [ 380 GSM                     ]                     │
│ Size Scale:        [ Adult Unisex (XS to 3XL)  ▼ ]  Base: [ M ]        │
├────────────────────────────────────────────────────────────────────────┤
│                                                      [ Next Step -> ]  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Why are these boxes here?
- **Style Number**: Every garment needs a unique name badge so nobody mixes up two different hoodies.
- **Fabric & GSM**: Tells the store room which roll of cloth to prepare.
- **Size Scale**: Picks the sizes we will sell (Adult XS–3XL, Kids 2T–14, or Waist sizes 28–42).
- **Step 2 (Stitching Rules)**:
  - **SPI (Stitches per inch)**: Sets the machine needle speed (standard is 12 stitches per inch).
  - **Seam Type**: Picks the stitch style (e.g. Overlock to prevent fraying).
  - **Embellishment Flow**: Picks whether the pieces go to embroidery or printing first.

---

### SCREEN 3: Dynamic Size Grading Matrix (`/design/grading-matrix`)

This screen makes sure the hoodie fits **everyone**—from extra small to triple extra large!

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Dynamic Size Grading Matrix                                             [ + Add POM ]   │
│ Calibrated measurement rules across XS, S, M, L, XL, 2XL, 3XL                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Active Sizing Scale:  [ Adult Unisex Alpha (XS-3XL) ] [ Kids ] [ Numeric ] [ Plus Size ]│
├──────────────┬──────────────────┬───────────┬──────┬──────┬──────┬──────┬──────┬────────┤
│ Code         │ Measure Spot     │ Tolerance │ XS   │ S    │ M*   │ L    │ XL   │ 2XL    │
├──────────────┼──────────────────┼───────────┼──────┼──────┼──────┼──────┼──────┼────────┤
│ POM_CHEST    │ Chest (1" below) │ +/-0.5 cm │ 48.0 │ 50.5 │ 53.0 │ 55.5 │ 58.0 │ 60.5   │
│ POM_LENGTH   │ Body Length      │ +/-0.5 cm │ 68.0 │ 70.0 │ 72.0 │ 74.0 │ 76.0 │ 78.0   │
│ POM_SLEEVE   │ Sleeve Length    │ +/-0.5 cm │ 83.0 │ 85.0 │ 87.0 │ 89.0 │ 91.0 │ 93.0   │
│ POM_SWEEP    │ Bottom Hem       │ +/-0.5 cm │ 42.0 │ 44.5 │ 47.0 │ 49.5 │ 52.0 │ 54.5   │
└──────────────┴──────────────────┴───────────┴──────┴──────┴──────┴──────┴──────┴────────┘
  * M is the Base Size. All other sizes auto-calculate with the Grade Step (+2.5 cm)!
```

#### How this works:
1. You only type the measurement for **Size M** (e.g. Chest = 53 cm).
2. You type the **Grade Step** (e.g. +2.5 cm).
3. The computer automatically calculates all other sizes!
   - Size Small = 53.0 - 2.5 = 50.5 cm
   - Size Large = 53.0 + 2.5 = 55.5 cm
   - Size XL = 55.5 + 2.5 = 58.0 cm
4. Nobody has to do manual math on a calculator, so zero mistakes happen!

---

### SCREEN 4: Fabric & Trims Library (`/design/materials-library`)

Before sewing 5,000 pieces, you must test the cloth in a washing machine.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Fabric & Materials Physics Library                                      [ + Add New ]   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ [ All ] [ Fabric ] [ Trims ] [ Thread ] [ Packaging ]                     [ Search... ] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ French Terry 380 GSM Heavy Fleece (Code: MAT-FTERRY-380-CHARC)                          │
│ Composition: 100% Combed Cotton, Loopback Knit                                          │
│ Supplier Mill: Vardhman Textiles Ltd • Lead Time: 14 Days                               │
│                                                                                         │
│ WASH SHRINKAGE TEST RESULTS:                                                            │
│ ┌─────────────────────────┬─────────────────────────┬─────────────────────────────────┐ │
│ │ Length Shrinkage: -3.5% │ Width Shrinkage: -1.5%  │ Fabric Twist (Spirality): 1.2%  │ │
│ └─────────────────────────┴─────────────────────────┴─────────────────────────────────┘ │
│ Needle Pairing: Ball Point 80/12 SES (Prevents fabric holes when stitching)             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Why is Shrinkage testing so important?
If you wash pure cotton in hot water, it shrinks!
- In our test, this fabric shrunk **3.5% in length**.
- If we cut a 70 cm hoodie, after washing it would become 67.5 cm (too short!).
- Because the Design Studio records this -3.5% shrinkage here, the **Cutting Floor CAD** computer automatically stretches the cutting pattern by +3.5%. When the customer washes it at home, it shrinks to the **exact perfect size**!

---

### SCREEN 5: Sample Approvals & PPS Quality Clinic (`/design/sample-approvals`)

This is where the QC inspector checks the physical prototype with a measuring tape before the buyer approves it.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Sample Approvals & Golden Seal Clinic                                   [ + New Audit ] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Stages: [ All ] [ Proto 1 ] [ Proto 2 ] [ Size Set ] [ PPS (Golden Seal) ]              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Style: ART-HD-8821 • Vintage Charcoal Hoodie • Buyer: Urban Outfitters                  │
│ Stage: PPS (Pre-Production Sample)                                                      │
│                                                                                         │
│ MEASUREMENT AUDIT RESULTS:                                                              │
│ • Chest:   Target = 53.0 cm  |  Measured = 53.2 cm  |  Diff = +0.2 cm  [ WITHIN SPEC ]  │
│ • Length:  Target = 72.0 cm  |  Measured = 72.1 cm  |  Diff = +0.1 cm  [ WITHIN SPEC ]  │
│ • Sleeve:  Target = 87.0 cm  |  Measured = 87.0 cm  |  Diff =  0.0 cm  [ PERFECT ]      │
│                                                                                         │
│ Maximum Allowed Error: +/- 0.5 cm                                                       │
│ Status: APPROVED • GOLDEN SEAL SIGNED BY BUYER QA (London Office)                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### How the tolerance gate protects the factory:
- If a sample tailor made the chest 54.0 cm (which is 1.0 cm too big, and more than our allowed +/- 0.5 cm limit), the screen turns **RED** with an `OUT OF TOLERANCE` warning.
- The computer **blocks** the approval so nobody accidentally approves a bad garment!

---

## 4. The Complete Story of a Hoodie (From Start to Finish)

Let us follow one real hoodie style: **Style ART-HD-8821**.

```
1. IDEA FROM BUYER
   Buyer sends picture: "We want a dark grey vintage heavy hoodie."
       │
       ▼
2. TECH-PACK CREATED (Day 1)
   Designer opens Zigza MES -> Types "ART-HD-8821", 380 GSM Cotton, Size M base.
       │
       ▼
3. SIZES CALCULATED (Day 2)
   Pattern master opens Grading Matrix -> Sets Chest 53cm for M -> System auto-creates XS to 3XL.
       │
       ▼
4. CLOTH TESTED IN LAB (Day 4)
   A piece of cloth is washed -> It shrinks 3.5% in length -> Saved in Materials Library.
       │
       ▼
5. SAMPLE ROOM SEWS 1 PIECE (Day 7)
   Tailor sews one Medium hoodie. Inspector measures with tape:
   Target = 53.0cm, Actual = 53.2cm. Difference is only 0.2cm (Allowed is 0.5cm).
   It passes!
       │
       ▼
6. BUYER GIVES GOLDEN SEAL (Day 10)
   Buyer tries it on a live fit model in London -> "We love it! Make 5,000 pieces."
   Inspector clicks "APPROVED" in Zigza MES.
       │
       ▼
7. HANDED OVER TO MERCHANDISING! (Day 11)
   Merchandising automatically receives the approved Tech-Pack and starts bulk production.
```

---

## 5. What Does Merchandising (Division 02) Receive?

Once the Design Studio stamps the Tech-Pack as **`APPROVED_BULK`**, the Merchandising division automatically receives an exact digital package:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DATA PACKAGE SENT TO MERCHANDISING (DIV 02)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Style Number:        ART-HD-8821                                         │
│ 2. Status:              APPROVED_BULK (Golden Seal Passed)                  │
│ 3. Fabric Specification:100% Combed Cotton French Terry, 380 GSM            │
│ 4. Consumption Rate:    0.85 kg cloth needed per hoodie                     │
│ 5. Embellishment Plan:  EMBROIDERY FIRST, THEN PRINT                        │
│ 6. Seam & Stitches:     ISO 504 Overlock, 12 SPI                            │
│ 7. Size Scale:          XS, S, M, L, XL, 2XL, 3XL (Full Measurement Chart)  │
│ 8. Target Cut Date:     26-Sep-2026                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why Merchandising needs this:
1. **To buy cloth**: If 1 hoodie needs 0.85 kg, for 5,000 hoodies they must buy:
   $$5,000 \times 0.85\text{ kg} = 4,250\text{ kg of French Terry cloth}$$
2. **To budget cost**: Because the Tech-Pack says `EMBROIDERY FIRST, THEN PRINT`, the merchandiser knows they have to pay for both embroidery stitches and screen printing.
3. **To plan the calendar**: They know the factory must start cutting on **26-Sep-2026**.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 4 simple things to know about where logic could fail if workers are not careful:

### 1. New Measurements Saved Only on That Computer (Local Storage)
- **What happens:** Right now, if a pattern master adds a new custom measurement point on their computer in the Grading Matrix, it saves in their browser (`localStorage`), but doesn't always sync to the central Supabase database.
- **Why it matters:** If another manager opens the page on another laptop, they might not see that new measurement.
- **How to avoid:** Always make sure the backend database saves every new POM row into `design_poms`.

### 2. Double-Clicking Status Updates
- **What happens:** When the buyer signs off on a sample, a database trigger automatically changes the status to `APPROVED_BULK`. But the webpage button also tries to change it at the same time.
- **Why it matters:** If internet is slow, the webpage might say "Approved" before the database has finished saving.
- **How to avoid:** Always wait 1 second for the server to confirm before refreshing.

### 3. Typing an Unknown Brand Name
- **What happens:** If someone types a brand name that isn't registered in the database, the database can show an error saying `Foreign Key Violation`.
- **How to avoid:** Always pick the brand from the dropdown list rather than typing random names.

### 4. CAD Vector File Uploads
- **What happens:** Right now, designers have to type a link URL for their CAD drawings (`cad_front_url`).
- **Why it matters:** Designers want to drag-and-drop their actual `.pdf` or `.ai` files directly from their desktop.
- **How to avoid:** We can connect a Supabase Storage bucket so designers can drag and drop pictures directly.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/design` | Main dashboard to see all styles and readiness | Head of Design |
| **2** | `Create Tech-Pack` | Creates the master recipe for a new garment | Technical Designer |
| **3** | `/design/grading-matrix` | Auto-calculates all sizes from XS to 3XL | Pattern Master |
| **4** | `/design/materials-library`| Records cloth weight and wash shrinkage % | Fabric Lab Technician |
| **5** | `/design/sample-approvals`| Checks physical sample with tape measure | Quality Inspector & Buyer |
| **6** | `/merchandising` | Takes the approved recipe and buys bulk cloth | Merchandiser |

*This document is written in clean, plain language with zero emojis so any factory member can follow it clearly.*
