# Division 02 • Merchandising & Sourcing Desk Master Guide
### Zigza MES Garment Platform • Division 02 (Step 2 of 11)
**Where to find it in the app:** `/merchandising`  
**Target Audience:** Merchandisers, Sourcing Officers, Factory Owners, and Account Managers  
**Document File:** `docs_final/02_merchandising.md`

---

## 1. Simple Summary: What Does This Division Do?

In Division 01 (Design Studio), we made the **recipe book** (the Tech-Pack) for a garment.

Now, someone has to actually run the business:
- **How much money** will the buyer pay us for each piece?
- **How many meters of cloth** and how many buttons do we need to buy?
- **Which supplier** should we order yarn and zippers from?
- **What is our delivery deadline** so the ship does not leave without our cargo?

In an apparel factory, **Division 02 (Merchandising & Sourcing Desk)** is the **commercial brain and money engine**. Merchandisers take the approved design, negotiate the price with the buyer, buy all raw materials, track the production calendar, and make sure the factory earns a healthy profit.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE SIMPLE BIG PICTURE                           │
│                                                                             │
│   [ 01. Design Studio ] gives approved Tech-Pack & Cloth Specs              │
│               │                                                             │
│               ▼                                                             │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │ 02. MERCHANDISING & SOURCING DESK                       │               │
│   │ 1. Books Buyer Contract  ---> "Order PO-ZIG-8901:       │               │
│   │                                5,000 Hoodies @ Rs 750"  │               │
│   │ 2. Calculates BOM Cost   ---> "Cloth=Rs 357, Sewing=145,│               │
│   │                                Profit=Rs 80 per piece"  │               │
│   │ 3. Buys Raw Materials    ---> "Order 4,250 kg French    │               │
│   │                                Terry cloth from mill"   │               │
│   │ 4. Tracks Calendar (T&A) ---> "Cutting starts Sept 26,  │               │
│   │                                Ship leaves Oct 28"      │               │
│   └─────────────────────────────────────────────────────────┘               │
│               │                                                             │
│               ├──────────────────────────────┐                              │
│               ▼                              ▼                              │
│   [ 11. Central Store ]              [ 03. Cutting Floor ]                  │
│   Receives truck delivery of cloth   Gets the green light to spread fabric  │
│   and inspects rolls.                and cut 5,000 garments!                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Easy Dictionary (No Confusing Jargon!)

Here are simple explanations of terms merchandisers use every day:

| Word / Term | What it actually means | Everyday Example |
|---|---|---|
| **PO (Purchase Order)** | The official legal order slip sent by the buyer. | "Zara sends PO-ZIG-8901 asking for 5,000 black hoodies." |
| **FOB Price** | Free On Board. The price per shirt the buyer pays us at the seaport. | If FOB is Rs 750 and we make 5,000 pieces, our total revenue is Rs 37,50,000. |
| **BOM (Bill of Materials)** | The complete shopping list of every item needed to make 1 shirt. | Cloth + Neck Label + Wash Care Tag + Zipper + Drawcord + Polybag. |
| **Consumption** | How much cloth or thread is needed to sew exactly 1 garment. | If 1 hoodie needs 0.85 kg of cloth, the consumption is 0.85 kg/pc. |
| **CM (Cut & Make)** | The labor wage cost to cut the cloth and sew it into a garment. | Tailors get paid Rs 145 per hoodie for cutting, stitching, and checking. |
| **Cost Variance** | The difference between what we planned to spend vs what we actually spent. | We planned Rs 350 for cloth, but mill price went up to Rs 370. That extra Rs 20 is the variance! |
| **T&A (Time & Action)** | The master factory countdown calendar. | Like a flight schedule: Fabric arrives Sept 20 -> Cut Sept 26 -> Sew Oct 10 -> Ship Oct 28. |
| **Lab Dip** | A small 4-inch cloth sample dyed with color chemicals sent to the buyer. | Buyer checks under special lights: "Yes, this is the exact shade of Lemon Yellow we wanted!" |
| **PR (Purchase Requisition)** | An internal buying request sent to the store or vendor. | "Please buy 5,000 metal eyelets from YKK." |
| **Ex-Factory Date** | The strict deadline date when cartons must leave the factory gate on trucks. | If late, the factory has to pay expensive air freight! |
| **CBM** | Cubic Meters. The physical box volume of export cartons inside a shipping container. | A standard 40-foot sea container holds about 68 CBM of cartons. |

---

## 3. Screen-by-Screen & Box-by-Box Guide

Let us look at every page in Division 02 and explain **what is there, why it is there, and how it works**.

---

### SCREEN 1: Main Commercial Cockpit (`/merchandising`)

This is the homepage where the Head Merchandiser watches all buyer contracts and revenue.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [<- Workspace Hub]                                       [ Division 02 • Merchandising] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Merchandising & Sourcing Desk                                                           │
│ Real-time buyer PO contracts, BOM costing variance, critical path T&A, logistics        │
│                                      [ + Book New PO ] [ Sourcing PR ] [ Container BL ] │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────┤
│ TOTAL BOOKED PCS  │ TOTAL FOB REVENUE │ T&A ON-TRACK RATE │ LOGISTICS STAGING           │
│ 24,000 Pcs        │ Rs 1,80,00,000    │ 91.7%             │ 3 Containers                │
│ Across 4 Buyers   │ Net Planned FOB   │ 11 of 12 On Time  │ 2,450 Cartons in Bay 3-5    │
├───────────────────┴───────────────────┴───────────────────┴─────────────────────────────┤
│ BRAND FILTER: [ All Orders ] [ Zara Global ] [ Ollypop Kids ] [ H&M Basics ]            │
│ STYLE SEARCH: [ All Buyer Styles (4 styles) ▼ ]            SYNC DATA: [ Refresh ]       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ LIVE PRODUCTION ORDERS TABLE                                                            │
│ PO Number    │ Brand       │ Style Ref   │ Total Qty │ Unit FOB │ Total Val   │ Status  │
│ PO-ZIG-8901  │ Zara Global │ ART-HD-8821 │ 5,000 pcs │ Rs 750   │ Rs 37,50,000│ IN PROD │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Box 1: The 4 Commercial KPI Cards (What are they & Why are they here?)

1. **Total Booked Volume (`24,000 Pcs`)**:
   - **What it shows:** Total number of garments contracted across all buyers.
   - **Why it is here:** Factory owners can see if the factory has enough orders to keep machines running for the next 3 months.
2. **Total FOB Revenue (`Rs 1,80,00,000`)**:
   - **What it shows:** Total expected cash payment from buyers once goods ship.
   - **Why it is here:** Helps management plan cash flow, worker payroll, and mill payments.
3. **T&A On-Track Rate (`91.7%`)**:
   - **What it shows:** The health score of production deadlines. If 11 out of 12 milestones are on schedule, score is 91.7%.
   - **Why it is here:** Warns the manager early if a style is running late before it causes an emergency.
4. **Logistics Staging (`3 Containers • 2,450 Cartons`)**:
   - **What it shows:** Finished cartons currently sitting in the warehouse export bays waiting for sea container stuffing.
   - **Why it is here:** Prevents warehouse congestion and tracks pending dispatches.

---

#### Box 2: Filter & Search Bar
- **Brand Selector Pills**: Click `Zara Global` or `H&M Basics` to see only that buyer's orders.
- **Searchable Style Dropdown**: Quickly find a specific style code (like `ART-HD-8821`) without scrolling through pages.
- **Sync Button**: Pulls the freshest order data directly from the central database.

---

#### Box 3: Live Production Orders Table
Every row represents a confirmed buyer contract:
- **PO Number (e.g. `PO-ZIG-8901`)**: The official order number.
- **Buyer Brand (e.g. `Zara Global`)**: The retail client.
- **Style Ref & Name**: Links back to the Tech-Pack from Division 01.
- **Total Qty (e.g. `5,000 pcs`)**: Number of pieces ordered.
- **Unit FOB (e.g. `Rs 750.00`)**: Selling price per garment.
- **Total Value (e.g. `Rs 37,50,000`)**: Total contract value.
- **Status Badges**:
  - `[BOOKED]`: Order confirmed; waiting for cloth and trims.
  - `[IN_PRODUCTION]`: Cloth is currently being cut or sewn on the floor.
  - `[DISPATCHED]`: Goods have left the factory in trucks or containers.
  - `[CLOSED]`: Buyer has received goods and paid the bill.

---

### SCREEN 2: The "Book New PO" Order Modal (`CreateOrderModal.tsx`)

When the merchandiser clicks the dark purple button **`+ Book New PO`**, a 2-step window opens up to enter the contract.

```
┌────────────────────────────────────────────────────────────────────────┐
│ BOOK NEW PRODUCTION ORDER (PO)                                   [ X ] │
│ Step 1 of 2: Commercial Contract Details                               │
├────────────────────────────────────────────────────────────────────────┤
│ Buyer PO Number:     [ PO-ZIG-8901                 ]                   │
│ Buyer Brand:         [ Zara Global               ▼ ]                   │
│ Style Reference:     [ ART-HD-8821                 ] (from Tech-Pack)  │
│ Style Description:   [ Heavy Vintage Terry Hoodie  ]                   │
│ Currency & FOB Price:[ INR (Rs) ▼ ]  Price: [ 750.00                   │
│ Total Order Qty:     [ 5000                        ]                   │
│ Target Ex-Factory:   [ 2026-10-28                  ]                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                      [ Next Step -> ]  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 2: Color & Size Breakdown Matrix

In real life, buyers do not just buy "5,000 hoodies." They buy specific sizes and colors. Step 2 forces the user to fill out the matrix:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 2 of 2: Color & Size Matrix Allocation                            │
│ Target Order Qty: 5,000 pcs  |  Allocated: 5,000 pcs  |  Delta: 0 pcs  │
├──────────────┬──────┬──────┬──────┬──────┬──────┬──────────────────────┤
│ Color Name   │ XS   │ S    │ M    │ L    │ XL   │ Row Total            │
├──────────────┼──────┼──────┼──────┼──────┼──────┼──────────────────────┤
│ Jet Black    │ 500  │ 1000 │ 1000 │ 500  │ 0    │ 3,000 pcs            │
│ Vintage Grey │ 300  │ 700  │ 700  │ 300  │ 0    │ 2,000 pcs            │
├──────────────┼──────┼──────┼──────┼──────┼──────┼──────────────────────┤
│ Column Sum   │ 800  │ 1700 │ 1700 │ 800  │ 0    │ Total: 5,000 pcs ✅  │
└──────────────┴──────┴──────┴──────┴──────┴──────┴──────────────────────┤
│                                                    [ Save Order ]      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Why does the system do this?
- Notice the **Delta: 0 pcs**!
- If the merchandiser types numbers that add up to 4,950 pcs instead of 5,000 pcs, the screen turns **amber** and says: *"50 pieces missing!"*
- The computer **blocks saving** until the math is 100% exact. This prevents costly factory shortages where tailors stitch the wrong quantity!

---

### SCREEN 3: BOM Costing & Profit Margin Engine (`/merchandising/costing`)

This screen shows **where every single rupee goes** and whether the factory will make a profit or a loss.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 💰 BOM Costing & Pre/Post-Costing Ledger                                [ + New BOM ]   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Filter: [ All Styles ] [ On-Target (Variance <= 2%) ] [ Variance Alerts (> 2%) ]        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Style: ART-HD-8821 • PO-ZIG-8901 • French Terry Hoodie                                  │
│ Buyer FOB Selling Price: Rs 750.00 per piece                                            │
│                                                                                         │
│ COST BREAKDOWN PER GARMENT:                                                             │
│ • Fabric Cost:          0.85 kg French Terry @ Rs 420/kg      = Rs 357.00               │
│ • Trims & Accessories:  Drawcord, eyelets, neck label, polybag= Rs  48.00               │
│ • Sewing Labor (CM):    Factory cutting & stitching wage      = Rs 145.00               │
│ • Embellishments:       Chest Embroidery + Back Screen Print  = Rs  85.00               │
│ • Washing & Finishing:  Bio-enzyme softening + Steam Ironing  = Rs  35.00               │
│ ─────────────────────────────────────────────────────────────────────────               │
│ TOTAL FACTORY COST PER PIECE:                                 = Rs 670.00               │
│                                                                                         │
│ NET PROFIT MARGIN:                                                                      │
│ Selling Price (Rs 750) - Factory Cost (Rs 670) = Rs 80.00 PROFIT PER PIECE (10.67%)    │
│ Total Order Profit on 5,000 pcs = Rs 4,00,000                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### What is the Cost Variance Alert?
- When we planned the order, we budgeted Rs 357 for cloth.
- But if the fabric mill charges Rs 375 due to raw cotton price hikes, our profit shrinks!
- If costs go up by more than **2%**, the system marks the style with a **Red Variance Alert** so the merchandiser can immediately talk to the mill or negotiate with the buyer before the factory loses money.

---

### SCREEN 4: Sourcing Requisitions & Purchase Orders (`/merchandising/sourcing`)

You cannot sew a hoodie without cloth and trims. This screen creates the shopping orders for mills and vendors.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📦 Raw Material Sourcing & Purchase Requisitions (PR)                   [ + Create PR ] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Filter: [ All Items ] [ Fabric ] [ Trims ] [ Thread ] [ Pending ] [ Received ]          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ REQUISITIONS FOR PO-ZIG-8901 (5,000 HOODIES):                                           │
│ 1. Fabric: French Terry 380 GSM (Jet Black)                                             │
│    • Quantity Needed: 4,250 kg • Supplier: Vardhman Textiles • Status: [ INWARD_OK ]   │
│                                                                                         │
│ 2. Trims: 100% Cotton Braided Drawcords (Black 120cm)                                   │
│    • Quantity Needed: 5,100 pcs • Supplier: YKK India • Status: [ INWARD_OK ]           │
│                                                                                         │
│ 3. Thread: Poly-Wrap Core Spun 40s/2 (Black)                                            │
│    • Quantity Needed: 120 Cones • Supplier: Coats India • Status: [ ORDERED ]           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Why is there a 2% extra buffer?
- Notice we need 5,000 hoodies, but we ordered **5,100 drawcords**.
- In garment factories, 1% to 2% of trims get damaged, dropped, or wasted during sewing. Merchandisers always order a small extra safety buffer so sewing lines never stop because of 5 missing cords!

---

### SCREEN 5: Time & Action (T&A) Calendar (`/merchandising/tna-calendar`)

A garment order is like a relay race. If runner #1 is late, the whole race is lost.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 Critical Path Time & Action (T&A) Calendar                                           │
│ Order: PO-ZIG-8901 (5,000 Hoodies) • Ex-Factory Deadline: 28-Oct-2026                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ MILESTONE               │ PLANNED DATE │ ACTUAL DATE  │ DELAY  │ STATUS                 │
├─────────────────────────┼──────────────┼──────────────┼────────┼────────────────────────┤
│ 1. Lab Dip Approval     │ 10-Sep-2026  │ 10-Sep-2026  │ 0 Days │ [ COMPLETED ]          │
│ 2. Fabric Inward        │ 18-Sep-2026  │ 19-Sep-2026  │ +1 Day │ [ COMPLETED ]          │
│ 3. Size Set Sample Cut  │ 22-Sep-2026  │ 22-Sep-2026  │ 0 Days │ [ COMPLETED ]          │
│ 4. Bulk Fabric Cut      │ 26-Sep-2026  │ 26-Sep-2026  │ 0 Days │ [ ON SCHEDULE ]        │
│ 5. Sewing Floor Loading │ 02-Oct-2026  │ Pending      │ 0 Days │ [ ON SCHEDULE ]        │
│ 6. Industrial Washing   │ 16-Oct-2026  │ Pending      │ 0 Days │ [ ON SCHEDULE ]        │
│ 7. Final AQL 2.5 Audit  │ 24-Oct-2026  │ Pending      │ 0 Days │ [ ON SCHEDULE ]        │
│ 8. Ex-Factory Gate Pass │ 28-Oct-2026  │ Pending      │ 0 Days │ [ ON SCHEDULE ]        │
└─────────────────────────┴──────────────┴──────────────┴────────┴────────────────────────┘
```

---

## 4. The Complete Story of Order PO-ZIG-8901

Let us follow how an order moves through Merchandising:

```
1. DESIGN TECH-PACK APPROVED (Day 1)
   Design Studio finishes Tech-Pack ART-HD-8821. Golden Seal awarded.
       │
       ▼
2. MERCHANDISER NEGOTIATES & BOOKS PO (Day 2)
   Zara agrees to buy 5,000 pieces @ Rs 750. Merchandiser enters PO-ZIG-8901.
   Enters color breakdown: 3,000 Jet Black, 2,000 Vintage Grey.
       │
       ▼
3. BOM COSTING LOCKED (Day 3)
   Merchandiser calculates costs: Fabric=Rs 357, Sewing=Rs 145, Trims=Rs 48,
   Washing=Rs 35, Embellishments=Rs 85. Total Cost = Rs 670. Profit = Rs 80/pc.
       │
       ▼
4. SOURCING PURCHASES MATERIALS (Day 4)
   Purchase orders sent:
   - 4,250 kg French Terry ordered from Vardhman Mill.
   - 5,100 drawcords ordered from YKK.
       │
       ▼
5. TRUCKS ARRIVE AT CENTRAL STORE (Day 12)
   Vardhman truck arrives. Central Store (Division 11) scans roll barcodes and
   checks quality under 4-point ASTM inspection. Status flips to [ INWARD_OK ].
       │
       ▼
6. HANDOVER TO CUTTING FLOOR! (Day 14)
   Merchandiser clicks "Release to Production".
   Division 03 (Cutting Floor) receives the green light to spread fabric and cut!
```

---

## 5. What Do Downstream Divisions Receive?

Once Merchandising completes its job, two divisions receive critical data:

### A. What Division 11 (Central Store) Receives:
1. **The Inward Purchase Requisition**: The store knows that a truck carrying `4,250 kg of 380 GSM French Terry` from Vardhman Textiles is arriving, and which warehouse rack (`RACK-A-01`) to store it in.
2. **The Trim Expected Delivery**: Box count for drawcords, eyelets, and polybags.

### B. What Division 03 (Cutting Floor) Receives:
1. **The Production Order Authorization**: Order `PO-ZIG-8901` is marked `IN_PRODUCTION`.
2. **The Exact Size & Ratio Breakdown**:
   - Total to cut: `800 XS`, `1,700 S`, `1,700 M`, `800 L`.
   - The cutting CAD master uses this exact ratio to lay out the paper marker with minimum fabric wastage!
3. **The Target Cut Date**: The cutting floor knows cutting must finish before `02-Oct-2026` so stitching lines do not sit idle.

---

## 6. Honest Audit: What Can Break or Needs Attention?

Here are 4 simple things to watch out for where logic or human mistakes can happen:

### 1. Color/Size Matrix Sum Mismatch
- **What happens:** In `CreateOrderModal.tsx`, if the merchandiser changes the Total Order Quantity from 5,000 to 6,000, but forgets to update the numbers in the table, the sum doesn't match.
- **Why it matters:** If the computer allowed this, the cutting floor wouldn't know which sizes make up that extra 1,000 pieces!
- **How it's protected:** The system checks `targetQty - currentMatrixSum === 0`. If not zero, it disables the save button and shows the exact difference in red.

### 2. Multi-Currency Exchange Rate Fluctuation
- **What happens:** An export order might be booked in US Dollars (`$9.00 USD`) or Euros, but the factory pays workers and Indian mills in Indian Rupees (`INR ₹`).
- **Why it matters:** If the dollar exchange rate drops, the factory's rupee profit can shrink without anyone realizing it.
- **How to avoid:** Always record the baseline exchange rate at the time of PO booking in the costing sheet.

### 3. Mill Fabric Delivery Delays
- **What happens:** If the fabric mill delivers cloth 5 days late, the T&A calendar milestone turns red (`DELAYED`).
- **Why it matters:** If cutting starts 5 days late, the stitching floor has nothing to sew, causing expensive line idle time.
- **How to avoid:** The T&A screen highlights delayed milestones in amber and sends an early alert to the merchandiser to expedite delivery.

### 4. Direct Database Foreign Key Link to Tech-Pack
- **What happens:** An order in `merchandising_orders` requires a valid `tech_pack_id`.
- **Why it matters:** If a merchandiser tries to book an order for a style that was never created or approved in Division 01, the database will block the insert.
- **How to avoid:** Always select a valid, approved Style Ref from Division 01.

---

## 7. Quick Summary Table

| Step | Page / Tool | Purpose | Who Uses It |
|---|---|---|---|
| **1** | `/merchandising` | Main commercial dashboard to see all orders and money | Head Merchandiser / Owner |
| **2** | `Book New PO` | Enters the buyer order, price, and color/size matrix | Commercial Merchandiser |
| **3** | `/merchandising/costing` | Calculates fabric consumption, costs, and profit % | Costing Specialist |
| **4** | `/merchandising/sourcing` | Creates purchase orders for fabric and trims | Sourcing Officer |
| **5** | `/merchandising/tna-calendar` | Master countdown calendar to prevent shipment delays | Production Planner |
| **6** | `/merchandising/shipments` | Container booking and export shipping manifests | Logistics Coordinator |

*This document is written in clean, plain language with zero emojis so any factory member can follow it clearly.*
