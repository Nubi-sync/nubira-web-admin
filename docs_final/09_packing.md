# Division 09 • Ready Goods & Export Packing Master Guide
### Zigza MES Garment Platform • Division 09 (Step 9 of 11)
**Where to find it in the app:** `/ready-goods`  
**Target Audience:** Packing In-Charge, Tagging & Folding Operators, Carton Packers, AQL Quality Auditors, and Export Logistics Coordinators  
**Document File:** `docs_final/09_packing.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 08 (Steam Ironing Floor), garments were pressed crisp, smooth, and wrinkle-free.

Now comes the final manufacturing transformation:
- **Clothes must be prepared for the store shelf**: We attach buyer price tags, barcode stickers, and fold each garment cleanly.
- **Each garment is sealed in an individual clear polybag** with a silica gel pack to protect it from dust, ocean humidity, and sea-freight dampness.
- **We pack garments into strong cardboard master cartons** (usually 20 to 25 pieces per carton) and print unique carton barcodes.
- **The Ultimate Quality Gate (AQL 2.5)**: Before any carton is allowed onto export trucks, certified quality auditors open random boxes and inspect garments under international military-standard sampling rules (ANSI/ASQ Z1.4).

In an apparel factory, **Division 09 (Ready Goods & Export Packing)** is the **final packaging, compliance gate, and export fortress**.

```
+-----------------------------------------------------------------------------+
|                           THE SIMPLE BIG PICTURE                            |
|                                                                             |
|   [ 08. Steam Ironing ] sends: 5,000 Crisp, Pressed Hoodies                 |
|   [ 02. Merchandising ] sends: Buyer Barcode Hangtags & Packing Ratio Specs |
|               |                                                             |
|               v                                                             |
|   +---------------------------------------------------------+               |
|   | 09. READY GOODS & EXPORT PACKING                        |               |
|   | 1. Tagging & Folding   ---> Attach Kimble price hangtags|               |
|   |                             & fold around folding boards|               |
|   | 2. Individual Polybag  ---> Seal in clear polybag with   |               |
|   |                             airhole & silica gel pack   |               |
|   | 3. Master Carton Pack  ---> Pack 25 hoodies per carton  |               |
|   |                             (Solid size or Assorted)    |               |
|   | 4. Weight & CBM Check  ---> Weigh on digital scale      |               |
|   |                             (Gross 18.25 kg, 0.072 CBM) |               |
|   | 5. AQL 2.5 Level II    ---> Random statistical quality  |               |
|   |                             audit; 0 critical defects   |               |
|   +---------------------------------------------------------+               |
|               |                                                             |
|               v (All 200 cartons sealed, barcoded, and AQL approved)        |
|   [ 11. Central Store & Export Godown ]                                     |
|   Cartons are stacked in Export Bays 3–5, ready to be loaded into 40-foot    |
|   sea shipping containers for ocean voyage to retail stores worldwide!      |
+-----------------------------------------------------------------------------+
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are plain-English explanations of words used on the packing floor every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **Ready Goods** | Garments that are 100% sewn, washed, ironed, and ready to be sold in retail stores. | A finished black hoodie with price tags attached, folded cleanly in its plastic wrapper. |
| **Hangtag (Price Tag)** | The branded cardboard tag hanging on a garment showing the brand name, style code, barcode, and retail price. | The white Zara tag hanging from the armpit showing `Rs 1,990 / $39.90`. |
| **Kimble Tag Gun** | A small hand-held gun with a hollow needle that shoots plastic fasteners through tags and clothing seams. | Clicking the trigger shoots a tiny transparent plastic pin through the neck seam to hold the tag without making holes in the cloth. |
| **Polybag** | A transparent plastic protective envelope that wraps each individual garment. | Has micro-perforated airholes and a printed legal warning: "Warning: Keep away from babies to prevent suffocation." |
| **Silica Gel Pack** | A tiny white paper sachet filled with moisture-absorbing mineral beads placed inside polybags. | Sucks up humidity so clothes never smell musty or get damp inside shipping containers crossing the ocean. |
| **Master Carton** | A heavy-duty 5-ply corrugated brown cardboard shipping box that holds 20 to 30 polybagged garments. | The large shipping box with printed shipping marks and barcode `CTN-2026-00124-M`. |
| **Solid vs Assorted Pack** | How sizes are packed into master cartons. | **Solid**: 25 Mediums in one box. **Assorted**: 2 XS, 5 S, 10 M, 5 L, 3 XL in one mixed box. |
| **AQL (Acceptable Quality Limit)** | The international statistical sampling formula (ANSI/ASQ Z1.4) used worldwide by retail buyers to accept or reject shipments. | An inspector checks 200 random hoodies out of 5,000. If 4 or fewer have minor flaws, the shipment passes. If 5 have flaws, the whole shipment is failed! |
| **Gross Weight vs Tare Weight** | Measuring shipping weight on digital scales. | **Gross Weight**: Total weight of box + clothes (18.25 kg). **Tare Weight**: Weight of empty cardboard box alone (0.85 kg). |
| **Volumetric CBM** | Cubic Meters. The physical 3D box volume of a carton: $(L \times W \times H) / 1,000,000$. | A $60\text{cm} \times 40\text{cm} \times 30\text{cm}$ carton has a volume of `0.072 CBM`. A 40-foot sea container holds roughly 68 CBM! |
| **Packing List** | The official legal shipping document listing every carton number, gross weight, net weight, CBM, and exact garments inside. | Customs officers inspect the packing list at the seaport before clearing containers onto ships. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us walk through every page in Division 09 and explain **what is on screen, why it is there, and how it works**.

---

### SCREEN 1: Main Ready Goods Packing Cockpit (`/ready-goods`)

This is the control center where the Packing Manager monitors packed cartons, daily piece counts, active AQL quality audits, and storage bay locations.

```
+-----------------------------------------------------------------------------------------+
| [<- Workspace Hub]                                            [ Division 09 * Packing ] |
+-----------------------------------------------------------------------------------------+
| Ready Goods & Export Carton Packing                           [ ISO 2859-1 * AQL 2.5 ]  |
| AQL 2.5 Normal Level II statistical inspection, barcode hangtag scan, and carton sealing|
|        [ AQL 2.5 Station ] [ Pack Carton ] [ Carton Weight ] [ Handover to Store ]      |
+---------------------+---------------------+---------------------+-----------------------+
| PACKED CARTONS TODAY| GARMENTS PACKED     | AQL FIRST-PASS RATE | WAREHOUSE STAGING     |
| 168 Cartons         | 4,200 Pcs           | 98.8% Passed        | 160 Cartons in Bay 03 |
| Target: 200 Cartons | 5,000 Total Target  | 1 Minor Defect Found| Ready for Sea Freight |
+---------------------+---------------------+---------------------+-----------------------+
| MASTER EXPORT CARTON INVENTORY & AUDIT STATUS TABLE                                     |
| Filter: [ All Status v ] [ Solid Size v ]     Search: [ Search carton #, PO, buyer... ] |
+-----------------------------------------------------------------------------------------+
| CARTON BARCODE | ORDER PO    | STYLE / BUYER     | PACKING TYPE | PCS | WEIGHT | STATUS   |
| CTN-00124-M    | PO-ZIG-8901 | ART-HD-8821 Zara  | Solid (M)    | 25  | 18.25kg| AQL_PASS |
| CTN-00125-M    | PO-ZIG-8901 | ART-HD-8821 Zara  | Solid (M)    | 25  | 18.20kg| AQL_PASS |
| CTN-00126-L    | PO-ZIG-8901 | ART-HD-8821 Zara  | Solid (L)    | 25  | 19.10kg| PACKED   |
| CTN-00127-L    | PO-ZIG-8901 | ART-HD-8821 Zara  | Solid (L)    | 25  | 19.15kg| AQL_FAIL |
+-----------------------------------------------------------------------------------------+
| ACTION BUTTONS PER ROW:                                                                 |
| [ View Packing Slip ]   [ Print Carton QR Label ]   [ AQL Audit ]   [ Transfer to Store]|
+-----------------------------------------------------------------------------------------+
```

#### Box 1: The 4 Packing KPI Cards (What are they & Why are they here?)

1. **Packed Cartons Today (`168 Cartons • Target 200`)**:
   - **What it shows:** Total master export cartons filled, taped, and labeled today.
   - **Why it is here:** Packing supervisors monitor box output against container loading schedules so trucks aren't left waiting.
2. **Garments Packed (`4,200 Pcs / 5,000 Target`)**:
   - **What it shows:** Total physical garments sealed inside master cartons.
   - **Why it is here:** Compares packed pieces against the total order quantity booked in Merchandising.
3. **AQL First-Pass Rate (`98.8% Passed • ISO 2859-1`)**:
   - **What it shows:** The health score of final quality audits.
   - **Why it is here:** AQL 2.5 is the international legal standard. A pass rate above 98% ensures buyers will accept the goods without penalty chargebacks.
4. **Warehouse Staging (`160 Cartons in Bay 03`)**:
   - **What it shows:** Inspected, sealed cartons stacked in central export godown racks awaiting container stuffing.
   - **Why it is here:** Tracks warehouse capacity and prevents floor clutter.

---

### SCREEN 2: Tagging, Folding & Individual Polybagging (`/ready-goods/tagging-polybag`)

This station is where workers take pressed garments, attach retail price tags, and seal them into clear polybags.

```
+-----------------------------------------------------------------------------------------+
| [<- Packing Floor]                                              [ + Scan & Verify Tag ] |
+-----------------------------------------------------------------------------------------+
| Garment Hangtag Verification, Folding & Polybag Sealing                                 |
+---------------------+---------------------+---------------------+-----------------------+
| TAG MATCHED TODAY   | FOLDING OUTPUT      | SILICA GEL INSERTED | SCAN MATCH RATE       |
| 4,200 Pcs           | 84 Pcs / Operator/Hr| 4,200 Sachets       | 100.0% Perfect Match  |
+---------------------+---------------------+---------------------+-----------------------+
| BARCODE HANGTAG VERIFICATION CHECK:                                                     |
| Garment Size Label: [ SIZE M (Medium)                     ]                             |
| Scanned EAN Barcode: [ 8434521098421                      ] -> [ MATCH CONFIRMED (OK) ] |
| Price Tag Verified: [ USD $39.90 / EUR €35.90             ]                             |
| Folding Board:      [ Adult Hoodie 12" x 10" Standard     ]                             |
| Polybag Spec:       [ 14" x 18" Transparent Self-Adhesive ]                             |
+-----------------------------------------------------------------------------------------+
```

#### Why Barcode Scan Verification is Mandatory:
- **The Factory Nightmare**: If a worker accidentally attaches a "Size Large" price tag to a "Size Small" hoodie, customers buy the wrong size at retail stores and return them.
- **How our app stops this**: The worker scans the sewn neck label, then scans the paper price tag. If the barcodes do not match, the screen flashes red and sounds an alert: *"Barcode mismatch! Do not pack!"*

---

### SCREEN 3: Master Carton Packing & Sealing (`/ready-goods/carton-packing`)

This screen records the packing of polybagged garments into heavy-duty corrugated cardboard master cartons.

```
+------------------------------------------------------------------------+
| PACK MASTER EXPORT CARTON                                        [ X ] |
+------------------------------------------------------------------------+
| Carton Barcode:        [ CTN-2026-00124-M                            ] |
| Order PO Number:       [ PO-ZIG-8901 - ZARA GLOBAL                   v]|
| Carton Sequence:       [ Carton 124 of 200 Cartons                   ] |
| Packing Specification: [ SOLID_SIZE_SOLID_COLOR                      v]|
| Garment Size Packed:   [ SIZE MEDIUM (M)                             v]|
| Total Pieces in Carton:[ 25 Pieces                                   ] |
+------------------------------------------------------------------------+
| BUNDLE BINDING (ZERO GHOST PIECE ROOT CHECK):                          |
| Scanned Cutting Bundle:[ BND-0842-M-005 (25 pieces from Cutting)    v] |
| Pieces Allocated:      [ 25 of 25 Pieces Linked                      ] |
| Status:                [ Cryptographic Bundle Binding Verified OK    ] |
+------------------------------------------------------------------------+
| CARTON DIMENSIONS & WEIGHT:                                            |
| Length: [ 60.0 cm ]  Width: [ 40.0 cm ]  Height: [ 30.0 cm ]           |
| Calculated Volume:     0.0720 CBM                                      |
| Measured Gross Weight: [ 18.25 kg ]  (Tare Box: 0.85 kg)               |
+------------------------------------------------------------------------+
|                                           [ Cancel ] [ Seal Carton ]   |
+------------------------------------------------------------------------+
```

#### The Zero Ghost Piece Ceiling Trigger:
- In `ready_goods_carton_bundles`, the database links every carton back to its original cutting bundle from Division 03.
- **The Mathematical Lock**: You can never pack 5,050 pieces into cartons if only 5,000 pieces were cut! The database trigger blocks any attempt to pack more pieces than exist in `cutting_bundles`.

---

### SCREEN 4: Carton Digital Scale & CBM Calibration (`/ready-goods/carton-weight`)

Every sealed carton is placed onto an electronic digital floor scale linked to the computer via USB/RS-232 cable.

```
+-----------------------------------------------------------------------------------------+
| [<- Packing Floor]                                                [ Live Scale Synced ] |
+-----------------------------------------------------------------------------------------+
| Carton Digital Weight Calibration & Volumetric CBM Verification                         |
+---------------------+---------------------+---------------------+-----------------------+
| LIVE SCALE READING  | TOTAL SHIPMENT CBM  | TOTAL GROSS WEIGHT  | WEIGHT VARIANCE       |
| 18.25 kg            | 14.400 CBM          | 3,650.0 kg          | +/- 0.15 kg (Pass)    |
| Carton #124 on scale| 200 Cartons x 0.072 | Net Weight: 3,480kg | Tolerance: <= 0.30 kg |
+---------------------+---------------------+---------------------+-----------------------+
| HOW VOLUMETRIC CBM IS CALCULATED:                                                       |
| Carton Length = 60.0 cm, Width = 40.0 cm, Height = 30.0 cm                              |
| Formula: (60 x 40 x 30) / 1,000,000 = 0.0720 Cubic Meters (CBM) per carton             |
| Total 200 Cartons = 200 x 0.0720 = 14.400 CBM Total Shipment Volume                    |
| Standard 40ft High-Cube Sea Container Capacity = 68.0 CBM (Takes approx. 940 cartons!)  |
+-----------------------------------------------------------------------------------------+
```

#### Why Carton Weight Checking is a Secret Superpower:
- If Carton #124 should weigh 18.25 kg (25 hoodies), but the scale reads **17.50 kg**, the computer instantly knows **1 hoodie is missing** without even opening the box!
- If the scale reads **19.00 kg**, someone accidentally packed 26 hoodies! Digital scales catch missing or extra pieces instantly.

---

### SCREEN 5: ANSI/ASQ Z1.4 (AQL 2.5) Quality Inspection Station (`/ready-goods/aql-inspection`)

This is the ultimate compliance gate. Certified AQL inspectors randomly open sealed cartons and examine sample garments using the world's most trusted statistical quality standard (ANSI/ASQ Z1.4 Normal Level II Single Sampling).

```
+------------------------------------------------------------------------+
| ANSI/ASQ Z1.4 LEVEL II AQL 2.5 AUDIT MODAL                       [ X ] |
+------------------------------------------------------------------------+
| Order PO Number:       [ PO-ZIG-8901 - ZARA GLOBAL                   v]|
| Total Shipment Size:   [ 5,000 Garments (200 Master Cartons)         ] |
| Inspection Level:      [ NORMAL_LEVEL_II (General Inspection)        v]|
+------------------------------------------------------------------------+
| STATISTICAL SAMPLING PLAN (CALCULATED BY ENGINE):                      |
| Required Sample Size:  [ 200 Garments randomly pulled from cartons   ] |
| Critical Defect Limit: Max Allowed: 0  | Rejection: 1 Critical Defect  |
| Major Defect Limit:    Max Allowed: 10 | Rejection: 11 Major Defects   |
| Minor Defect Limit:    Max Allowed: 14 | Rejection: 15 Minor Defects   |
+------------------------------------------------------------------------+
| AUDIT DEFECT ENTRY:                                                    |
| Critical Defects Found:[ 0 Defects ] (Broken needles, blood, insect)  |
| Major Defects Found:   [ 1 Defect  ] (Open seam under armpit)          |
| Minor Defects Found:   [ 3 Defects ] (Untrimmed thread tails)          |
+------------------------------------------------------------------------+
| STATISTICAL VERDICT:   [ PASS - APPROVED FOR EXPORT CONTAINER LOAD   v]|
|                                          [ Cancel ] [ Lock & Sign AQL] |
+------------------------------------------------------------------------+
```

#### What Triggers an Automatic Status Transition?
When the inspector clicks **`Lock & Sign AQL`**:
1. If **`PASS`**: The database trigger `update_carton_status_from_aql()` instantly updates carton status to **`AQL_AUDIT_PASSED`**. The export gate pass unlocks.
2. If **`FAIL`**: Carton status flips to **`QUARANTINED_AQL_FAILED`**. The computer locks the shipment, preventing any gate pass from being generated until 100% of the lot is unboxed and re-inspected!

---

### SCREEN 6: Custody Handover to Central Store Export Bays (`/ready-goods/handover`)

Once AQL passed, master cartons are loaded onto wooden pallets (e.g. 20 cartons per pallet), stretch-wrapped in plastic film, and transferred to Central Store Export Bays 3–5.

```
+-----------------------------------------------------------------------------------------+
| [<- Packing Floor]                                              [ + Print Gate Pass ]   |
+-----------------------------------------------------------------------------------------+
| Handover Custody Transfer to Central Store Export Bays                                  |
+---------------------+---------------------+---------------------+-----------------------+
| AUDITED CARTONS     | PALLETS READY       | DESTINATION BAY     | CONTAINER BOOKING     |
| 200 Cartons         | 10 Pallets (20/pal) | Central Store Bay 03| MSC Mediterranean     |
| 5,000 Pcs Cleared   | Shrink-wrapped OK   | Dry & Temperature OK| 40ft Sea Container    |
+---------------------+---------------------+---------------------+-----------------------+
| COMMERCIAL EXPORT PACKING LIST:                                                         |
| PO: PO-ZIG-8901 • Style: ART-HD-8821 Hoodie • Buyer: ZARA GLOBAL • Total CBM: 14.400   |
| Carton #001 to #032:   800 pcs Size XS • Gross Weight: 576.0 kg • Net: 548.8 kg         |
| Carton #033 to #100: 1,700 pcs Size S  • Gross Weight: 1,224.0 kg • Net: 1,166.2 kg     |
| Carton #101 to #168: 1,700 pcs Size M  • Gross Weight: 1,241.0 kg • Net: 1,183.2 kg     |
| Carton #169 to #200:   800 pcs Size L  • Gross Weight: 608.0 kg • Net: 580.8 kg         |
| TOTAL: 200 Cartons • 5,000 Hoodies • Gross: 3,649.0 kg • Net: 3,479.0 kg • CBM: 14.400  |
+-----------------------------------------------------------------------------------------+
```

---

## 4. The Complete Story of Order PO-ZIG-8901 in Ready Goods Packing

Let us follow how **5,000 Heavyweight French Terry Hoodies** are packed and readied for ocean shipping:

```
1. PRESSED HOODIES ARRIVE FROM IRONING (Day 5 - 06:30 PM)
   Division 08 (Steam Ironing) transfers 5,000 pressed, bone-dry hoodies in trollies.
   Packing supervisor verifies piece count and distributes them to 6 packing tables.
       |
       v
2. PRICE HANGTAG ATTACHMENT (Day 6 - 08:00 AM)
   Operators use Kimble fine-fabric tag guns to shoot plastic fasteners through the
   neck label seam, attaching Zara cardboard price tags ($39.90 USD).
   Workers scan the barcode on each tag to confirm size matching.
       |
       v
3. FOLDING & POLYBAGGING WITH SILICA GEL (Day 6 - 09:30 AM)
   Workers place each hoodie face down on a 12" x 10" folding board,
   tuck sleeves inward, fold bottom up, and slide into clear self-adhesive polybags.
   One 2-gram sachet of silica gel desiccant is placed inside each bag.
       |
       v
4. MASTER CARTON PACKING (Day 6 - 11:30 AM)
   Corrugated master cartons are assembled with heavy packaging tape.
   Workers pack 25 polybagged hoodies per carton (200 cartons total).
   Barcode sticker CTN-2026-00001 to CTN-2026-00200 applied to carton side.
       |
       v
5. DIGITAL SCALE & CBM CHECK (Day 6 - 02:00 PM)
   Every carton is placed on the digital scale:
   - Size M carton: Exactly 18.25 kg. Weight variance: +0.05 kg (Passed).
   - Carton dimensions: 60cm x 40cm x 30cm = 0.072 CBM.
       |
       v
6. ANSI/ASQ Z1.4 (AQL 2.5) STATISTICAL AUDIT (Day 6 - 03:30 PM)
   Certified AQL auditor pulls 200 random hoodies across 20 opened cartons:
   - 0 Critical defects.
   - 1 Major defect (minor loose seam thread). Allowed: up to 10.
   - 2 Minor defects (polybag airhole tear). Allowed: up to 14.
   - Auditor signs report: [ AQL_AUDIT_PASSED ].
       |
       v
7. PALLET STAGING & CONTAINER GATE PASS (Day 6 - 05:00 PM)
   Cartons stacked onto 10 wooden export pallets (20 cartons per pallet).
   Shrink-wrapped in heavy plastic film to prevent shifting.
   Transferred to Central Store Export Bay 03. Customs manifest printed!
```

---

## 5. What Do Downstream Divisions Receive?

When packed cartons leave Division 09, here is who receives what:

### A. What Division 11 (Central Store & Export Bays) Receives:
1. **The 200 Sealed, Barcoded Master Cartons**:
   - Stacked neatly on 10 pallets in Export Bay 03.
   - Certified AQL 2.5 Passed, clean, dry, and moisture-protected.
2. **The Commercial Export Packing List**:
   - Complete manifest detailing carton numbers, gross weight (3,649.0 kg), net weight (3,479.0 kg), and total volume (14.400 CBM).
   - Ready for container stuffing and customs sea freight clearance!

### B. What Division 10 (Alteration Clinic) Receives (If AQL Fails):
- If an AQL audit ever fails, the defective garments are flagged with red repair tickets and sent to Division 10 for emergency correction.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 5 real-world export packing hazards and how our system prevents them:

### 1. Barcode Hangtag Mismatch (Size Small with Medium Tag)
- **What can go wrong:** An operator tags 100 Small hoodies with Medium price tags. When goods reach retail stores, inventory barcodes scan incorrectly at checkout registers, leading to massive buyer penalty chargebacks!
- **How our system protects you:** The Tagging screen features a mandatory two-point scan: scan the sewn neck tag barcode first, then scan the paper hangtag. If they don't match, the screen locks!

### 2. Missing Silica Gel in Ocean Shipping
- **What can go wrong:** If workers forget to insert silica gel sachets inside polybags, ocean humidity condenses inside the plastic during a 30-day sea voyage. Garments arrive at the overseas warehouse smelling moldy and sour!
- **How our system protects you:** AQL inspectors verify the presence of dry silica gel sachets in all 200 sampled polybags. Missing silica gel constitutes a Major defect.

### 3. Carton Weight Variance Warning
- **What can go wrong:** A packer forgets to put 2 hoodies into a box, packing only 23 instead of 25.
- **How our system protects you:** The `/ready-goods/carton-weight` screen compares measured gross weight against target weight. If variance exceeds $\pm 0.30\text{ kg}$, the system sounds an alarm: *"Weight deficit! Check box for missing garments before taping!"*

### 4. Overpacking Beyond Registered Cutting Bundles
- **What can go wrong:** Corrupt floor workers pack extra "ghost pieces" made from unauthorized fabric into export cartons for illegal export.
- **How our system protects you:** Database cryptographic join: `ready_goods_carton_bundles.bundle_id` must match a valid `cutting_bundles` record. The total pieces packed can never exceed the total pieces cut!

### 5. Packing Carton Tape Failure & Moisture Seepage
- **What can go wrong:** Cheap carton tape splits open during sea transit, allowing sea water and dust to penetrate cartons.
- **How our system protects you:** Packing specifications require 5-ply export-grade corrugated cartons sealed with H-pattern reinforced fiberglass tape.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/ready-goods` | Main control tower to monitor packed cartons, AQL pass rates, and bays | Packing Floor Manager |
| **2** | `/ready-goods/tagging-polybag` | Attaches Kimble price tags, folds around boards, and seals polybags | Tagging & Folding Crew |
| **3** | `/ready-goods/carton-packing` | Packs 25 garments per master carton with unique carton barcodes | Carton Packers |
| **4** | `/ready-goods/carton-weight` | Calibrates digital scale weight (kg) and calculates volumetric CBM | Weighing Operator |
| **5** | `/ready-goods/aql-inspection` | Conducts ANSI/ASQ Z1.4 Normal Level II statistical quality audits | Certified AQL Auditor |
| **6** | `/ready-goods/handover` | Generates commercial packing lists and stages pallets in export bays | Logistics Coordinator |

*This document is written in clean, plain language with zero emojis so every packing operator, tagger, and quality auditor can follow it clearly.*
