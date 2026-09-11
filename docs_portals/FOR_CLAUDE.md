# Master Architecture & Peer Review Brief: 11 Operating Divisions
### Zigza MES Garment Manufacturing Platform • System Integration Document
**Target Reviewer**: Claude (Senior Systems & MES Architect) | **Workspace**: `nubira-web-admin`

---

## 1. Executive Context & Mission

We have authored an exhaustive, industry-standard architectural blueprint for the **Zigza MES Garment Manufacturing Platform**, comprising **11 synchronized operating divisions** documented in this folder (`docs_portals/`):

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ZIGZA MES END-TO-END MANUFACTURING PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
 [ 01. Design ] ──➔ [ 02. Merch ] ──➔ [ 11. Central Store ] ──➔ [ 03. Cutting Floor ]
                                                                        │
                         ┌──────────────────────────────────────────────┴──────────┐
                         ▼                                                         ▼
               [ 04. Printing Unit ]                                     [ 05. Embroidery Floor ]
                         │                                                         │
                         └──────────────────────┬──────────────────────────────────┘
                                                ▼
                                   [ 06. STITCHING & SEWING ] ◄── (Master Benchmark)
                                                │
                         ┌──────────────────────┴──────────────────────────┐
                         ▼                                                 ▼
             [ 07. Industrial Washing ]                         [ 10. Alteration Clinic ]
                         │                                                 ▲
                         ▼                                                 │ (Defect Loop)
              [ 08. Steam Ironing ] ───────────────────────────────────────┘
                         │
                         ▼
             [ 09. Ready Goods & Packing ] ──➔ [ 11. Central Store Bay 3–5 ] ──➔ [ Export ]
```

---

## 2. STRICT NON-NEGOTIABLE BENCHMARK DIRECTIVE

> [!CAUTION]
> ### CRITICAL INSTRUCTION FOR CLAUDE:
> **DO NOT MODIFY, ALTER, OR REFACTOR THE STITCHING & SEWING PORTAL OR ITS SPECIFICATION (`06_stitching_sewing.md`).**
> 
> * **Why**: The Stitching & Sewing portal (`src/app/stitching-sewing/`) is the live, battle-tested operational benchmark of the factory. It is 100% active in code, tested, and approved by production floor managers.
> * **Your Mandate**: Use `06_stitching_sewing.md` strictly as your **Architectural Benchmark & Design North Star** to evaluate, enhance, and harmonize the other 10 divisions.

---

## 3. High-Level Summary of the 11 Portal Specifications

| File | Division Name | Route Prefix | Core Industry Responsibility | Upstream Handshake In | Downstream Handshake Out |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`01_design_studio.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/01_design_studio.md) | **Design & Tech-Pack Studio** | `/design` | CAD sketches, size grading (XS–2XL), BOM specs, PPS fit approvals. | Buyer Creative Concepts | 02. Merch (BOM) & 03. Cut (DXF) |
| [`02_merchandising_sourcing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/02_merchandising_sourcing.md) | **Merchandising & Sourcing Desk** | `/merchandising` | Buyer PO bookings, BOM costing sheets, T&A calendar, trim procurement. | 01. Design Tech-Packs | 11. Store (PRs) & 06. Sewing (Orders) |
| [`03_cutting_floor.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/03_cutting_floor.md) | **Cutting & Lay Floor** | `/cutting` | Fabric relaxation, marker efficiency (>86%), auto-cutting, QR bundle tickets. | 11. Store (Fabric) & 01. Design | 04. Print, 05. Embroider, 06. Sew |
| [`04_printing_unit.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/04_printing_unit.md) | **Screen & Digital Printing** | `/printing` | Mesh screen preparation, ink kitchen recipes, DTG, 160°C tunnel curing. | 03. Cutting (Panels) & 01. Design | 06. Sewing (Cured Panels) |
| [`05_embroidery_unit.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/05_embroidery_unit.md) | **Multi-Head Embroidery Floor** | `/embroidery` | DST file digitizing, 20-head machines, stitch billing, thread tensioning. | 03. Cutting (Panels) & 01. Design | 06. Sewing (Embroidered Panels) |
| [`06_stitching_sewing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/06_stitching_sewing.md) | **Stitching & Sewing Floor** | `/stitching-sewing` | **MASTER BENCHMARK**: Progressive lines, lineman piece-rates, 3-stage QC, Challans. | 03. Cut, 04. Print, 05. Embroider | 07. Wash, 08. Iron, 10. Alter, 09. RG |
| [`07_industrial_washing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/07_industrial_washing.md) | **Industrial Washing & Wet Processing**| `/washing` | 600kg tumblers, bio-polishing, enzyme softening, liquor ratios (1:5), shrinkage QC. | 06. Stitching (Garment Lots) | 08. Steam Ironing & Finishing |
| [`08_steam_ironing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/08_steam_ironing.md) | **Ironing & Steam Pressing Floor** | `/iron` | Boiler steam (4.5 Bar), vacuum buck tables, teflon anti-shine shoes, piece rates. | 07. Wash / 06. Raw Sewing | 09. Ready Goods & Packing |
| [`09_ready_goods_packing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/09_ready_goods_packing.md) | **Ready Goods & Export Packing** | `/ready-goods` | AQL 2.5 normal sampling, EAN-13 barcodes, polybagging, ratio carton manifests. | 08. Steam Ironing & 11. Store | 11. Store Godown / Export Container |
| [`10_alteration_rework.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/10_alteration_rework.md) | **Alteration & Quality Rework Clinic** | `/alter` | Pareto root-cause triage, master mending, chemical spot cleaning, secondary AQL. | 06. Sew, 08. Iron, 09. AQL Rejects | Re-injected to 08. Iron & 09. Pack |
| [`11_central_store.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/11_central_store.md) | **Central Store & Raw Material Godown**| `/store` | Truck gate inwarding (GRN), ASTM 4-point fabric inspection, trim bins, export bay. | Fabric Mills, Trims, 09. Ready Goods | 03. Cut, 06. Sew, Container Stuffing |

---

## 4. Architectural Design Standard Enforced Across All Files

1. **Visual Simplicity with Dense Numerical Telemetry**:
   - Designed for shopfloor supervisors and plant heads (average age 30–45).
   - Minimal verbose text; heavy emphasis on visual tables, KPI blocks, formulas, and schema mappings.
2. **Unified Zigza Design System**:
   - Primary Brand Color: `#3A3564` (Deep Indigo Night)
   - Background Fill: `#FAF7F0` (Cream Silk)
   - Typography: Clean monospace metrics (`font-mono`) paired with bold modern display headings.
   - Clean micro-borders (`border border-black/10` or `border border-black/80`).
3. **Strict Zero Ghost Piece Guarantee**:
   - Every cut piece generated by `03. Cutting` is mathematically reconciled across `06. Sewing`, `07. Washing`, `08. Ironing`, `09. Packing`, or accounted for in `10. Alteration`.

---

## 5. Specific Review Questions for Claude

Please review the 11 markdown specifications and provide your architectural critique on the following points:

### 1. Data Contract & Schema Integrity
* Are the foreign key linkages across `merchandising_orders` $\rightarrow$ `cutting_lay_sheets` $\rightarrow$ `cutting_bundles` $\rightarrow$ `allotments` $\rightarrow$ `ready_goods_cartons` robust enough to prevent orphan records during partial shipment splits?
* Does the `design_measurement_specs` table in [`01_design_studio.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/01_design_studio.md) provide sufficient granularity for non-linear grading (e.g. plus-size or childrenswear grading curves)?

### 2. Embellishment Pipeline Handshake Optimization
* When cut panels require **both** Screen Printing (`04`) and Embroidery (`05`), what is the optimal sequence trigger to prevent panel loss or print damage during high-tension embroidery hooping?

### 3. Factory Shopfloor Tablet Usability
* Are the form fields specified across each document streamlined enough for rapid touch-screen entry by floor linemen and storekeepers in high-dust textile environments?
* Should any multi-field forms be split into 2-step stepper modals with QR barcode camera autofocus?

### 4. Edge Case Handling
* How should the system handle **fabric lot shrinkage variance > 3.0%** detected at `07. Washing` when half of the cut lots have already been sewn?
* What automated reversal mechanism should trigger if an **AQL 2.5 audit fails** on a sealed 200-carton export consignment?

---

> [!IMPORTANT]
> **REMINDER FOR REVIEW**: Remember to maintain the integrity of [`06_stitching_sewing.md`](file:///c:/Users/shaws/NubiSync/nubira-web-admin/docs_portals/06_stitching_sewing.md) as the immovable anchor reference. Frame all additions and suggestions around the remaining 10 divisions to seamlessly dock with Stitching & Sewing.
