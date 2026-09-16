# 01 • Design Studio & Tech-Pack Enterprise Architecture Specification
### Zigza MES Garment Manufacturing Platform • Division Specification Document
**Route Prefix**: `/design` | **Division Order**: 01 of 11 | **Design System**: `#3A3564` (Deep Indigo) & `#FAF7F0` (Cream Silk)

---

## 1. Executive Summary & Industry Scope

The **Design & Tech-Pack Studio** is the digital inception gate of the Zigza MES garment platform. It orchestrates the entire creative and technical development lifecycle:
1. **Design Brief Allocation & Creative Direction**: Provisional Head (PH) allocates structured briefs to assigned designers.
2. **Multi-Concept & Colorway Submission**: Designers submit high-fidelity artwork decks with multiple concepts, front/back vector mockups, and colorway palettes across Web and Mobile App portals.
3. **Dual-Tier Review & Gatekeeper Approval**:
   - **Tier 1 (Provisional Head)**: Creative review (`SUBMITTED` $\rightarrow$ `PH_APPROVED` or `PH_REJECTED`).
   - **Tier 2 (Super Admin Executive Approval)**: Strategic drop approval (`PH_APPROVED` $\rightarrow$ `SA_APPROVED` [Greenlit], `SA_SAVED_FOR_LATER` [Seasonal Archive], or `PH_REJECTED` [Revisions]).
4. **Technical Package (Tech-Pack) Generation**: Industrializing greenlit designs into factory blueprints containing CAD vectors, Point of Measure (POM) grading tables, Stitches Per Inch (SPI), seam classifications (ISO 4915), and Bill of Materials (BOM).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      01. DESIGN & TECH-PACK STUDIO                          │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Industry Standards:            │ ASTM D6961 / ISO 8559 Garment Sizing       │
│ Upstream Inward Entity:        │ Brand Creative Brief / Market Trend Board  │
│ Downstream Outward Entity:     │ 02. Merchandising (Costing/PO) & 03. Cut   │
│ Review Hierarchy:              │ Designer -> Provisional Head -> Super Admin│
│ Target Sample Approval Cycle:  │ ≤ 3.5 Days (Target: 95% First-Time-Right)  │
│ Measurement Tolerance Limits:  │ ± 0.5 cm (Chest/Length) | ± 0.25 cm (Neck) │
│ Grading Engine Support:        │ Fully Normalized: Alpha, Numeric, Kids, +  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. End-to-End Three-Role Workflow Architecture

The Design Studio enforces a strict separation of concerns across three distinct user roles:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROLE 1: PROVISIONAL HEAD (PH)                        │
│                         Desk URL: `/design` (Web)                           │
│  1. Creates Design Brief with Garment Type, Category, Target Scope (# of    │
│     Designs, Max Colors, Required Color Palette Swatches, & Instructions).   │
│  2. Assigns Brief to specific Designer from registered team.                │
│  3. Status changes to `ALLOCATED`.                                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ROLE 2: FASHION DESIGNER                              │
│              Desk URL: `/design/designer` (Web) / Mobile App                 │
│  1. Receives allocated Brief on Assigned Dashboard.                         │
│  2. Builds Multi-Concept Deck (`Design #1`, `Design #2`, etc.).             │
│  3. Adds Colorways per concept with Color Name, Front Artwork, Back Artwork,│
│     and design annotations.                                                 │
│  4. Submits deck to Provisional Head (Status $\rightarrow$ `SUBMITTED`).    │
│  5. Tracks status in dedicated `History` view (`/design/history` / Mobile). │
│  6. If rejected (`PH_REJECTED`), a "Redo / Revise" action re-activates the   │
│     brief for iterative resubmission.                                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ROLE 1: PROVISIONAL HEAD REVIEW STAGE                     │
│  1. PH inspects full submitted deck in 10/10 Review Modal.                  │
│  2. Decision Gate:                                                          │
│     - `Request Revisions` -> Status `PH_REJECTED` (returned with feedback)  │
│     - `Approve & Forward` -> Status `PH_APPROVED` (escalated to Admin)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROLE 3: SUPER ADMIN (SA)                            │
│                 Desk URL: `/design/sa-approvals` (Web)                      │
│  Executive Decision Gate:                                                   │
│  1. `SA_APPROVED` (Greenlit): Ready for Tech-Pack generation and bulk run.  │
│  2. `SA_SAVED_FOR_LATER`: Stored in Seasonal Archive (can be revived).      │
│  3. `PH_REJECTED`: Returned to Designer/PH with executive notes.            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TECHNICAL INDUSTRIALIZATION (TECH-PACK)                    │
│                      Desk URL: `/design/tech-packs`                         │
│  1. Converts greenlit concepts into formal industrial Tech-Packs.           │
│  2. Defines Size Grading, SPI, Seam Classes, Shrinkage Allowances & BOM.    │
│  3. Handshake dispatched downstream to Merchandising (02) & Cutting (03).   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Inward & Outward Handshake Specifications

```
[ BUYER / CREATIVE CONCEPT ]
            │
            ▼ (Inward: Silhouette, Season, Colorways)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 01. DESIGN & TECH-PACK STUDIO                                               │
│ • Creative Brief Allocation & Team Load Balancing                           │
│ • Concept Art & Colorway Deck Submissions (Front & Back CAD Vectors)        │
│ • PH Creative Approval & SA Strategic Greenlight Gate                       │
│ • Tech-Pack Parameterization (SPI, Seams, BOM, Dynamic Size Grading)        │
│ • Physical Sample Fit Verification (Proto -> Size Set -> Pre-Production)    │
└─────────────────────────────────────────────────────────────────────────────┘
      │                                       │
      ▼ (Handshake Payload A)                 ▼ (Handshake Payload B)
[ 02. MERCHANDISING & SOURCING ]        [ 03. CUTTING & LAY FLOOR ]
• Approved BOM Fabric Specs              • Approved Marker Specs
• Trims & Thread Consumption Matrix     • Grade Rule Files (DXF/AAMA)
• Target Garment Cost Benchmarks        • Approved Shrinkage Allowances
• Embellishment Sequence Flag           • Cut Notch & Placement Geometry
```

### Inward Data Inputs
| Input Field | Source | Format | Validation / Constraints |
| :--- | :--- | :--- | :--- |
| **`garment_type`** | Provisional Head | String | E.g. `T-Shirt`, `Hoodie`, `Jogger`, `Polo` |
| **`category`** | Provisional Head | String | E.g. `NBA`, `Streetwear`, `Athleisure`, `Casual` |
| **`target_designs`** / **`num_designs`** | Provisional Head | Number | 1 to 10 designs per brief |
| **`max_colors`** / **`chart_colors`** | Provisional Head | Number | 1 to 12 colors per design |
| **`target_colors`** | Provisional Head | Array of Strings | Valid color names (e.g. `['Black', 'White', 'Navy']`) |
| **`concepts`** | Fashion Designer | JSONB Array | Multi-concept deck with `colorways` (Front & Back URLs) |

### Outward Handshake Payloads (To Downstream Portals)
| Target Portal | Trigger Status | Key Data Transferred |
| :--- | :--- | :--- |
| **`02. Merchandising`** | `PPS_APPROVED` / `BULK_APPROVED` | Fabric composition, target GSM, consumption (kg/pc), trim breakdown, embellishment flow |
| **`03. Cutting Floor`** | `BULK_APPROVED` | Normalized POM grading tables, DXF CAD files, fabric wash shrinkage allowances |
| **`04. Printing / 05. Embroidery`** | Job Challan Creation | Strict sequence flag: `EMBROIDERY_FIRST_THEN_PRINT` vs `PRINT_FIRST_THEN_EMBROIDERY` |
| **`06. Stitching & Sewing`** | Production Release | Standard Stitches Per Inch (SPI), seam classification (ISO 4915 Class 401/504/607) |

---

## 4. Route Architecture & Side Navigation Matrix

```
[ Zigza Enterprise Root ]
  └── /modules                        -> Central Enterprise Portal Hub

[ Design Studio (Division 01) Routes ]
  ├── /design                         -> Provisional Head Primary Cockpit (Briefs & Review Queue)
  ├── /design/designer                -> Designer Creative Studio Desk
  ├── /design/history                 -> Designer Submissions & Revision History Tracker
  ├── /design/sa-approvals            -> Super Admin Strategic Greenlight & Archive Desk
  ├── /design/tech-packs              -> Tech-Pack Master Catalog & Specification Builder
  ├── /design/sample-approvals        -> Physical Sample Fit Quality Clinic (Proto/SizeSet/PPS)
  ├── /design/grading-matrix          -> Dynamic Size Grading Engine (Adult/Kids/Plus)
  ├── /design/materials-library       -> Fabric Physics, Shrinkage & Trims Library
  ├── /design/team                    -> Designer Team Roster & Allocation Management
  ├── /design/settings                -> Provisional Head Custom Categories & Garment Silhouettes
  └── /design/zigza-ai                -> CAD Vector & Pattern Intelligence Copilot (Admin/PH Only)
```

---

## 5. UI Architecture & Design System Guidelines

All components strictly adhere to [`design.md`](file:///d:/AndroidStudioProjects/Nubira_Creation/web_admin/docs_logic/design.md):

1. **Color Harmony**:
   - Primary Brand: Deep Indigo (`#3A3564`) for high-priority CTA buttons, active state pills, and brand badges.
   - Foundation Surface: Cream Silk (`#FAF7F0`) with crisp subtle borders (`border-black/10`).
   - Pure White Cards: `#FFFFFF` with `shadow-2xs` for readable content hierarchy.
   - Text Palette: Slate-900 for headings, Slate-600 for descriptions, Slate-400 for metadata/codes.
   - Zero Rainbow Text: Strictly prohibited; unified, professional color coding across web and mobile.

2. **Concept Review Modal Architecture (10/10 Polish)**:
   - **Concept Navigation Tabs**: Top selector for `Design #1`, `Design #2`, etc. with individual colorway badges.
   - **Colorway Grid**: Responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5`) with dedicated swatch circles.
   - **Artwork Thumbnails**: Side-by-side `aspect-square` containers with `object-contain` scaling on `#FAF7F0` backdrops, completely eliminating border clipping or image squishing.
   - **Interactive Lightbox**: Full-resolution modal viewer triggered by clicking any thumbnail.
   - **Role-Aware Action Footers**: Clean, unambiguous action triggers with zero confusing out-of-scope buttons.

---

## 6. Database Schema Blueprint (PostgreSQL / Supabase)

### 1. Design Briefs Master (`design_briefs`)
```sql
CREATE TABLE design_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ph_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_member_id UUID REFERENCES design_team_members(id) ON DELETE SET NULL,
  garment_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  num_designs INTEGER DEFAULT 1,
  target_designs INTEGER DEFAULT 1,
  chart_colors INTEGER DEFAULT 3,
  max_colors INTEGER DEFAULT 3,
  target_colors TEXT[] DEFAULT '{}',
  instructions TEXT,
  company_name VARCHAR(150) DEFAULT 'Nubira Creation',
  status VARCHAR(40) DEFAULT 'ALLOCATED', 
  -- Allowed statuses: ALLOCATED, SUBMITTED, PH_APPROVED, PH_REJECTED, SA_APPROVED, SA_SAVED_FOR_LATER, TECH_PACK_CREATED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Design Submissions Master (`design_submissions`)
```sql
CREATE TABLE design_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES design_briefs(id) ON DELETE CASCADE,
  designer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  designer_name VARCHAR(150),
  designer_phone VARCHAR(50),
  designer_notes TEXT,
  concepts JSONB DEFAULT '[]'::jsonb,
  -- JSON structure:
  -- [
  --   {
  --     "concept_number": 1,
  --     "title": "Design Concept #1",
  --     "notes": "Front chest bold vector",
  --     "colorways": [
  --       { "color_name": "Black", "photo_front": "https://...", "photo_back": "https://..." },
  --       { "color_name": "White", "photo_front": "https://...", "photo_back": "https://..." }
  --     ]
  --   }
  -- ]
  photo_url_1 TEXT,
  photo_url_2 TEXT,
  ph_verdict VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  ph_feedback TEXT,
  ph_reviewed_at TIMESTAMPTZ,
  sa_verdict VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, SAVED_FOR_LATER, REJECTED
  sa_notes TEXT,
  sa_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Tech-Pack Master (`design_tech_packs`)
```sql
CREATE TABLE design_tech_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_number VARCHAR(50) NOT NULL UNIQUE,
  brand_id UUID REFERENCES brands(id) ON DELETE RESTRICTED,
  category VARCHAR(50) NOT NULL,
  size_system VARCHAR(30) DEFAULT 'ALPHA_ADULT', -- ALPHA_ADULT, NUMERIC_WAIST, KIDS_AGE, PLUS_SIZE
  base_size VARCHAR(20) DEFAULT 'M',
  fabric_composition TEXT NOT NULL,
  target_gsm INTEGER NOT NULL,
  embellishment_sequence VARCHAR(40) DEFAULT 'NONE', -- NONE, EMBROIDERY_FIRST_THEN_PRINT, PRINT_FIRST_THEN_EMBROIDERY
  cad_front_url TEXT,
  cad_back_url TEXT,
  spi INTEGER DEFAULT 12,
  seam_class VARCHAR(50) DEFAULT 'ISO 4915 Class 504',
  status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, SAMPLE_DEV, PPS_SUBMITTED, PPS_APPROVED, BULK_APPROVED
  version INTEGER DEFAULT 1,
  design_submission_id UUID REFERENCES design_submissions(id) ON DELETE SET NULL,
  created_by_ph UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_sa BOOLEAN DEFAULT FALSE,
  sa_verdict VARCHAR(30) DEFAULT 'APPROVED',
  company_name VARCHAR(150) DEFAULT 'Nubira Creation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Design Team Members (`design_team_members`)
```sql
CREATE TABLE design_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ph_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  specialty VARCHAR(100) DEFAULT 'Garment Designer',
  status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
  company_name VARCHAR(150) DEFAULT 'Nubira Creation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Developer Onboarding & Troubleshooting FAQ

### Q1: Why is "Saved for Later" not visible on the Provisional Head desk?
**Answer**: "Saved for Later" (`SA_SAVED_FOR_LATER`) is an executive archiving mechanism used exclusively by the **Super Admin** on `/design/sa-approvals` to hold designs for future seasonal drops. The Provisional Head desk only tracks creative pipeline milestones (`In Review`, `PH Approved`, `Allocated`, `Revisions Needed`, `Tech-Pack Created`). In the PH view, any SA-archived design is mapped cleanly to **`PH Approved`** because the PH's creative review work is already complete.

### Q2: How does a Designer resubmit a rejected design?
**Answer**: In the Designer's **History Sidenav / Screen** (`/design/history` on web or History screen on mobile), any design with `Revisions Needed` (`PH_REJECTED`) displays a **Redo / Resubmit** button. Clicking this reopens the brief into the active work assignment queue, allowing the designer to adjust concepts, upload revised colorways, and resubmit to the Provisional Head.

### Q3: How do I delete test or seed tech packs in Supabase?
**Answer**: Run the following SQL query in the Supabase SQL editor:
```sql
DELETE FROM design_tech_packs WHERE style_number IN ('TP-2026-8801', 'TP-2026-8802');
```
The catalog UI delete button also cleans up both the local storage caches and database records synchronously.
