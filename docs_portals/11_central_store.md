# 11 • Central Store & Raw Material Godown Specification
### Zigza MES Garment Manufacturing Platform • Simplified Operator & System Guide
**Route Prefix**: `/store` | **Division Order**: 11 of 11 | **Theme**: `#3A3564` (Indigo Night) & `#FAF7F0` (Cream Silk)

---

## 1. Quick Reference: The Two Most Important Questions Answered

### Question 1: Where does Merchandising send their materials, and in which tab of Store does Store receive it?

* **Where Merchandising creates the request**:
  Merchandising works in **Module 02 (Merchandising Desk)**. When they confirm a buyer order, they create:
  1. **Trim & Sourcing Requisitions (PR)** at `/merchandising/sourcing` (for sewing threads, buttons, zippers, labels, and polybags).
  2. **Fabric Purchase Orders** at `/merchandising/orders` (for raw knit/woven fabric rolls from mills).

* **Which tab in Store receives this delivery**:
  **Side Nav Tab 4: "Truck Inward Gate (GRN)"** (`/store/truck-inwards`).

* **What happens when the supplier truck arrives**:
  1. The storekeeper opens **"Truck Inward Gate (GRN)"** (`/store/truck-inwards`).
  2. Click the button: **"Record Truck Inward"**.
  3. Select the **PO Reference** (this links directly to Merchandising's purchase order) and the Supplier name.
  4. Enter the vehicle number, gross weight from the weighbridge, and verify the physical items against the supplier delivery challan.
  5. Click **"Save Gate Inward & Issue GRN"**.

* **Where do the items automatically go after receiving**:
  * **Raw Fabric Rolls** automatically move to **Side Nav Tab 2: "Fabric Godown & 4-Point QC"** (`/store/fabric-godown`).
  * **Trims, Threads, Zippers & Labels** automatically move to **Side Nav Tab 3: "Trims & Accessories Whse"** (`/store/trims-warehouse`).

---

### Question 2: From which side nav clicking will the Store send its material to Stitching or Cutting or any other module?

* **The exact Side Nav button to click**:
  **Side Nav Tab 5: "Material Issues to Floor"** (`/store/material-issues`).

* **Step-by-step instructions to issue materials**:
  1. Click **"Material Issues to Floor"** on the left side navigation rail.
  2. Click the top-right button: **"Issue Material to Floor"**.
  3. In the modal popup, locate the dropdown **"Destination Shop Floor"**:
     * **To send Fabric to Cutting**: Select **"Division 03 • Cutting Floor (Fabric Rolls)"**. The receiver auto-fills to Cutting Supervisor, and units set to meters.
     * **To send Trims to Stitching**: Select **"Division 06 • Stitching Lines (Trims BOM)"**. The receiver auto-fills to Sewing Supervisor, and units set to sets/pieces.
  4. Fill in the **Order ID**, **Article No**, and **Buyer Name**.
  5. Enter or scan the **Material Barcodes** (comma-separated roll barcodes or trim package codes).
  6. Enter the **Quantity Issued** and brief notes.
  7. Click **"Issue Material Challan"**.

* **What happens immediately**:
  * A formal Material Delivery Challan (`CHL-FLR-YYYY-XXX`) is created.
  * Store inventory is immediately deducted in real time.
  * The Cutting Floor (`/cutting`) or Sewing Floor (`/stitching-sewing`) receives the goods on their floor dashboard.

---

## 2. High-Level Godown Material Flowchart

```
[ MERCHANDISING (Module 02) ]
• Sourcing Requisitions (PR)
• Fabric Mill Purchase Orders
              │
              ▼ (Delivery Trucks Arrive at Factory Gate)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 11. CENTRAL STORE & GODOWN                                                  │
│                                                                             │
│  [ Tab 4: Truck Inward Gate (GRN) ]                                         │
│  • Receive lorry delivery, enter weighbridge slip, generate GRN             │
│              │                                                              │
│              ├───────────────────────────────┐                              │
│              ▼                               ▼                              │
│  [ Tab 2: Fabric Godown ]       [ Tab 3: Trims Warehouse ]                  │
│  • Raw fabric rolls in Bay 1-2  • Sewing threads, buttons, zippers in bins   │
│  • 4-Point ASTM fabric QC       • Re-Order Level (ROL) traffic lights       │
│              │                               │                              │
│              └───────────────┬───────────────┘                              │
│                              ▼                                              │
│  [ Tab 5: Material Issues to Floor ] <--- CLICK HERE TO SEND OUT            │
│  • Choose Destination: Cutting Floor OR Sewing Floor                        │
│  • Scan barcodes, verify quantities, print Issue Challan                    │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ 03. CUTTING FLOOR ]                 [ 06. SEWING FLOOR ]
 • Receives Fabric Rolls               • Receives Thread & Trims BOM
 • Spreading & Lay planning            • Assembly line sewing
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
 [ 09. READY GOODS & EXPORT PACKING FLOOR ]
 • Final ironed garments polybagged, packed into master cartons, AQL 2.5 passed
                               │
                               ▼ (Carton Pallet Handover)
┌─────────────────────────────────────────────────────────────────────────────┐
│  [ Tab 6: Finished Goods Bay 3-5 ]                                          │
│  • Store holds finished export cartons awaiting container stuffing          │
│  • Verify shipping container seal number and gate pass                      │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
 [ OVERSEAS CONTAINER TRUCKS / PORT LOGISTICS ]
```

---

## 3. Side Navigation Guide: Which Page Does What

The Central Store side navigation contains 8 clear pages:

```
[ Central Store & Godown Operations ]
  ├── 01. Store Dashboard             -> /store
  ├── 02. Fabric Godown & 4-Point QC  -> /store/fabric-godown
  ├── 03. Trims & Accessories Whse    -> /store/trims-warehouse
  ├── 04. Truck Inward Gate (GRN)     -> /store/truck-inwards
  ├── 05. Material Issues to Floor    -> /store/material-issues
  ├── 06. Finished Export Bay 3-5     -> /store/finished-godown
  ├── 07. Zigza AI Copilot            -> /store/zigza-ai
  └── 08. Central Store Profile       -> /store/profile
```

### Page 1: Store Dashboard (`/store`)
* **What is it?** The master home screen of the warehouse.
* **What does the operator see?**
  1. Total fabric rolls in stock (rolls and metric tons).
  2. Total finished export garments in Bay 3-5 (pieces and cartons).
  3. Total challans issued today to factory floors.
  4. Overall barcode inventory accuracy score.
* **What does the operator click here?**
  Quick navigation cards to jump directly to Truck Inward, Fabric Godown, Trims Warehouse, or Material Issues.

### Page 2: Fabric Godown & 4-Point QC (`/store/fabric-godown`)
* **What is it?** The storage yard for raw knit and woven fabric rolls (Bay 1 and Bay 2).
* **What does the operator do here?**
  * View all rolls grouped by Shade (Shade A, Shade B, Shade C).
  * Filter rolls by Status (`PENDING_INSPECTION`, `PASSED`, `REJECTED`).
  * Check roll gross weight, net meterage, and physical rack location (e.g. `BAY_1_RACK_02`).
  * **Action Button**: Click **"Inspect Fabric Roll"** on any roll to log the ASTM D5430 4-Point inspection:
    * Width and GSM measurements.
    * Defect penalty points (must be $\le 28$ points per 100 sq yards to pass).
    * Set inspection verdict to `PASS_FOR_CUTTING` or `REJECT_RETURN_TO_MILL`.

### Page 3: Trims & Accessories Warehouse (`/store/trims-warehouse`)
* **What is it?** The bin storage room for sewing threads, zippers, buttons, labels, and polybags.
* **What does the operator do here?**
  * Check stock quantities for every item code.
  * Check exact shelf bin locations (e.g. `BIN-TH-04`, `BIN-ZP-02`).
  * View Re-Order Level (ROL) warning badges: items that are running low and need re-ordering from suppliers.
  * **Action Button**: Click **"Stock Adjustment"** to reconcile physical cycle count differences.

### Page 4: Truck Inward Gate (GRN) (`/store/truck-inwards`)
* **What is it?** The gatehouse check-in desk where all incoming delivery trucks from fabric mills and trim vendors are recorded.
* **What does the operator do here?**
  * **This is where Merchandising's orders are received!**
  * Every incoming truck must have an electronic Goods Received Note (GRN) before goods are unloaded into the warehouse.
  * **Action Button**: Click **"Record Truck Inward"**:
    * Enter truck number, driver contact, supplier name, and Merchandising PO number.
    * Record gross weight and tare weight from the weighbridge scale.
    * Add delivery line items, record any supplier shortages or defects, and attach delivery notes.
    * On submission, an official GRN number (`GRN-YYYY-XXXXXX`) is generated.

### Page 5: Material Issues to Floor (`/store/material-issues`)
* **What is it?** The central dispatch desk where materials leave the store and enter the factory floor.
* **What does the operator do here?**
  * **This is where materials are sent to Cutting and Stitching!**
  * Tracks all material issue challans (`CHL-FLR-...`), showing whether they are `IN_TRANSIT_TO_FLOOR` or `ACCEPTED_BY_FLOOR`.
  * **Action Button**: Click **"Issue Material to Floor"**:
    * Choose Destination: Cutting Floor or Sewing Floor.
    * Pick Order and Article.
    * Scan barcodes of rolls or trim packs.
    * Issue delivery challan.

### Page 6: Finished Goods Bay 3-5 (`/store/finished-godown`)
* **What is it?** The export staging area where completed cartons from Division 09 (Ready Goods & Packing) wait for shipping container loading.
* **What does the operator do here?**
  * View pallets stacked in Bay 3, Bay 4, and Bay 5.
  * Check buyer name, style, carton count, and AQL 2.5 pass seal number.
  * **Action Button**: Click **"Authorise Container Stuffing"**:
    * Enter container number and seal number.
    * Verify carton tally against buyer packing list.
    * Mark pallet as `STUFFED_IN_CONTAINER` and generate container gate pass.

### Page 7: Zigza AI Copilot (`/store/zigza-ai`)
* **What is it?** The conversational assistant for godown stock queries.
* **What does the operator do here?**
  * Type questions in plain language, such as:
    * *"Which fabric rolls in Bay 1 have not moved for over 60 days?"*
    * *"Which sewing thread colors have stock below reorder level?"*
    * *"Show all challans issued to Cutting this morning."*

### Page 8: Central Store Profile (`/store/profile`)
* **What is it?** The storekeeper user account and godown equipment configuration.
* **What does the operator do here?**
  * Check supervisor login credentials and assigned warehouse zone.
  * View weighbridge calibration status.
  * Access system sign-out.

---

## 4. Standard Operating Procedures (SOP) for Operators

### SOP 1: When a Delivery Truck Arrives with Goods Ordered by Merchandising
1. Ask the driver for the Mill / Supplier Delivery Challan.
2. Click **"Truck Inward Gate (GRN)"** (`/store/truck-inwards`) on the left side nav.
3. Click **"Record Truck Inward"**.
4. In the form:
   * Vehicle Number: Enter truck registration (e.g. `DL-01-AB-1234`).
   * Supplier Name: Select the fabric mill or trims vendor.
   * PO Reference: Select the matching buyer PO created by Merchandising.
   * Item Category: Select `RAW_FABRIC_ROLL` or `TRIMS`.
   * Add each item: item name, challan quantity, received quantity.
5. Click **"Save Gate Inward & Issue GRN"**.
6. The system generates `GRN-YYYY-XXXXXX`. The driver signs the printed slip, and the warehouse workers unload the goods into the appropriate rack.

---

### SOP 2: When the Cutting Floor Requests Fabric
1. The Cutting Floor supervisor requests fabric rolls for an active lay plan.
2. Click **"Material Issues to Floor"** (`/store/material-issues`) on the left side nav.
3. Click **"Issue Material to Floor"**.
4. In the form:
   * Destination Shop Floor: Select **"Division 03 • Cutting Floor (Fabric Rolls)"**.
   * Order ID / Article No: Enter the production order.
   * Barcodes: Scan or type the barcodes of the fabric rolls being sent (e.g. `ROL-8901, ROL-8902`).
   * Quantity: Enter total meters being issued.
5. Click **"Issue Material Challan"**.
6. Hand the physical rolls and delivery challan to the Cutting floor forklift/trolley operator.

---

### SOP 3: When the Sewing Floor Requests Thread & Trims
1. The Sewing Floor supervisor requests trims (thread cones, zippers, buttons, labels) for an active line setup.
2. Click **"Material Issues to Floor"** (`/store/material-issues`) on the left side nav.
3. Click **"Issue Material to Floor"**.
4. In the form:
   * Destination Shop Floor: Select **"Division 06 • Stitching Lines (Trims BOM)"**.
   * Order ID / Article No: Enter the production order.
   * Barcodes: Scan or type the trim package barcodes.
   * Quantity: Enter total sets/pieces being issued.
5. Click **"Issue Material Challan"**.
6. Hand the trim packages and challan to the Sewing floor lineman.

---

### SOP 4: When Export Containers Arrive for Overseas Dispatch
1. The shipping forwarder truck arrives at the factory loading dock.
2. Click **"Finished Export Bay 3-5"** (`/store/finished-godown`) on the left side nav.
3. Filter by Buyer and Order Number to verify all pallets have status `STAGED_IN_BAY` with verified AQL 2.5 pass seals.
4. Click **"Authorise Container Stuffing"**.
5. Enter the shipping container number, bolt seal number, and driver details.
6. Verify carton counts during loading.
7. Click **"Confirm Stuffing & Issue Port Gate Pass"**. The pallets move to `STUFFED_IN_CONTAINER` and export records update.

---

## 5. Technical Data Contract Summary

| Direction | Event | Store URL | Database Table | Critical Data Fields |
| :--- | :--- | :--- | :--- | :--- |
| **Inward** | Truck Gate Entry (GRN) | `/store/truck-inwards` | `truck_inwards`, `truck_inward_items` | `grn_no`, `party_name`, `truck_no`, `line_items`, `gross_weight` |
| **Inward** | Fabric Roll Receipt | `/store/fabric-godown` | `store_fabric_rolls` | `roll_barcode`, `shade_group`, `gross_weight_kg`, `net_meterage` |
| **Inward** | Trim Stock Inward | `/store/trims-warehouse` | `accessories` | `item_name`, `quantity`, `unit`, `party_name`, `action: IN` |
| **Outward** | Issue to Cutting | `/store/material-issues` | `store_transactions`, `store_fabric_rolls` | `destination: CUTTING_FLOOR`, `scannedBarcodes`, `quantityIssued` |
| **Outward** | Issue to Sewing | `/store/material-issues` | `allotment_materials`, `accessories` | `destination: SEWING_FLOOR`, `admin_issued: true`, `action: OUT` |
| **Export** | Container Loading | `/store/finished-godown` | `store_transactions` | `palletId`, `containerNumber`, `cartonCount`, `totalPcs` |
