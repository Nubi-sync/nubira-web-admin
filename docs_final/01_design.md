# Division 01 • Design Studio & Tech-Pack Master Guide
### Zigza MES Garment Platform • Division 01 (Step 1 of 11)
**Where to find it in the app:** `/design`  
**Target Audience:** Factory Managers, Provisional Heads, Fashion Designers, Super Admins, Pattern Masters, and Developers  
**Document File:** `docs_final/01_design.md`

---

## 1. Simple Summary: What Does This Division Do?

Imagine you want to bake a cake for 5,000 people. You cannot just tell the kitchen "make a nice chocolate cake." You need:
1. **The Creative Vision**: What kind of cake, which frosting colors, and what toppings?
2. **The Recipe & Blueprint**: Exact ingredient gram weights, baking temperatures, and step-by-step photos.
3. **The Executive OK**: The bakery owner saying "Yes, this recipe is greenlit for tomorrow's bulk order."

In a modern garment manufacturing facility, **Division 01 (Design Studio)** handles that entire journey from raw creative sketch to the industrialized factory recipe book we call a **Tech-Pack** (Technical Package).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE COMPLETE BIG PICTURE                         │
│                                                                             │
│   [ 1. PROVISIONAL HEAD ]                                                   │
│   Creates brief: "Make 3 T-Shirt designs, Black & White, NBA Style"        │
│               │                                                             │
│               ▼ (Allocated)                                                 │
│   [ 2. FASHION DESIGNER (Web & App) ]                                       │
│   Draws vector art, adds colorways (Front & Back), and submits deck!        │
│               │                                                             │
│               ▼ (Submitted)                                                 │
│   [ 3. PROVISIONAL HEAD REVIEW ]                                            │
│   Inspects artwork in 10/10 Review Modal -> Clicks "Approve & Forward"      │
│               │                                                             │
│               ▼ (PH Approved)                                               │
│   [ 4. SUPER ADMIN EXECUTIVE REVIEW ]                                       │
│   Decides: "Greenlight for Tech-Pack" vs "Save for Later Archive"           │
│               │                                                             │
│               ▼ (SA Greenlit)                                               │
│   [ 5. TECH-PACK CREATION ]                                                 │
│   Calculates Size Grading (XS-3XL), sets SPI=12, Seam=ISO 504, adds BOM!   │
│               │                                                             │
│               ▼                                                             │
│   [ 02. Merchandising ] receives the recipe to buy cloth and plan cost!     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Three-Role Hierarchy & Separation of Concerns

Our Design Studio has a crystal-clear separation of roles so nobody gets confused:

| Role | Primary Screen | Main Responsibilities | What They Do NOT Worry About |
| :--- | :--- | :--- | :--- |
| **Provisional Head (PH)** | `/design` | Creates design briefs, allocates them to designers, reviews submitted artwork decks, and approves/rejects creative quality. | Does NOT worry about seasonal archiving ("Save for Later" is done by Super Admin). |
| **Fashion Designer** | `/design/designer` & Mobile App | Views assigned briefs, uploads Multi-Concept artwork decks with Front & Back views for each colorway, submits to PH, and tracks revisions in History (`/design/history`). | Does NOT manage briefs for other designers or approve factory tech packs. |
| **Super Admin (SA)** | `/design/sa-approvals` | Executive gatekeeper who reviews PH-approved concepts and decides whether to **Greenlight** for immediate Tech-Pack production or **Save for Later** in the Seasonal Archive. | Does NOT handle day-to-day designer allocation or creative drawing. |

---

## 3. Easy Dictionary (Garment & Tech Terms Explained)

| Word / Term | What it actually means | Everyday Example |
| :--- | :--- | :--- |
| **Design Brief** | A structured creative task given to a designer. | "We need 3 graphic designs for a 380 GSM oversized hoodie in Black & Charcoal." |
| **Concept & Colorway** | A concept is an artwork theme (Design #1); colorways are the different shirt colors it will be printed on (e.g. Black with White print, White with Red print). | 1 Concept printed on 3 different t-shirt colors = 3 Colorways. |
| **Tech-Pack** | The complete industrial "blueprint / recipe" of a garment. | Like building plans for an architectural house before laying bricks. |
| **GSM** | Grams per Square Meter. Tells you how **thick or heavy** the cloth is. | 160 GSM = light summer T-shirt.<br>380 GSM = thick, heavy winter hoodie. |
| **POM (Point of Measure)** | The exact spot where we put the measuring tape. | "Chest width: 1 inch below the armpit." |
| **Grading** | Scaling the base pattern up or down for different body sizes. | If size M is 53 cm wide, size L is 56 cm, and size XL is 59 cm (+2.5 cm grade step). |
| **Tolerance (+/-)** | The tiny margin of error allowed by quality inspectors. | If target length is 70 cm with +/- 0.5 cm tolerance, anything between 69.5 cm and 70.5 cm is accepted. |
| **Shrinkage** | How much the cloth shrinks when washed and dried in hot air. | If cloth shrinks 3.5%, we cut it 3.5% longer so the final washed hoodie isn't too short! |
| **SPI** | Stitches Per Inch. How many tiny stitch dots are in 1 inch of sewing. | 12 SPI = strong, neat, durable stitching. |
| **Seam Class (ISO)** | The sewing machine stitch standard. | ISO 504 Overlock (cleans the cloth edge so threads don't fray out). |

---

## 4. Screen-by-Screen & Box-by-Box Guide

---

### SCREEN 1: Provisional Head Desk (`/design`)

The primary command center for the Provisional Head.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Design Studio / Workspaces / Provisional Head Desk                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Design & Tech-Pack Studio                                                               │
│ Creative pipeline, multi-concept studio deck, and tech-pack generation                  │
│                        [ Tech-Packs ] [ Team ] [ PH Settings ] [ + New Brief ]          │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────┤
│ STAGE 01          │ STAGE 02          │ STAGE 03          │ CATALOG                     │
│ Active Briefs     │ Pending PH Review │ Forwarded to SA   │ Tech-Packs Ready            │
│ 1                 │ 0                 │ 1                 │ 0                           │
├───────────────────┴───────────────────┴───────────────────┴─────────────────────────────┤
│ QUEUE TOOLBAR                                                          [ Search... ]    │
│ [ All Queue ] [ In Review ] [ PH Approved ] [ Allocated ] [ Revisions Needed ] [ Tech-Pack Created ] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Garment Silhouette      │ Designer        │ Scope & Mockups    │ Status       │ Actions │
│ T-Shirt (NBA Style)     │ hary (+91 ...)  │ 2/3 Designs (2 Col)│ PH APPROVED  │ [View >]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Elements on this Screen:
1. **4 Clean KPI Stat Cards**:
   - `STAGE 01 (Active Briefs)`: All briefs currently in allocation or active design.
   - `STAGE 02 (Pending PH Review)`: Briefs submitted by designers waiting for the PH's feedback.
   - `STAGE 03 (Forwarded to SA)`: Briefs approved by PH and currently awaiting Super Admin decision.
   - `CATALOG (Tech-Packs Ready)`: Total standardized industrial tech-packs generated.
2. **Filter Tabs**:
   - Clean, purposeful queue tabs: `All Queue`, `In Review`, `PH Approved`, `Allocated`, `Revisions Needed`, `Tech-Pack Created`.
   - **Note**: The confusing "Saved for Later" tab has been removed from PH desk because archiving is an SA internal decision. Any SA-archived brief displays cleanly as **`PH Approved`** for the Provisional Head.
3. **Queue Table Row**:
   - Displays Garment Silhouette, Assigned Designer, Scope Progress (e.g. `2/3 Designs`), Status Badge, and the clean **`View & Review >`** button.

---

### SCREEN 2: The 10/10 Concept Review Modal Form

When the Provisional Head or Super Admin clicks **`View & Review`**, this ultra-polished review modal opens:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [ PH APPROVED ]                                                  [ X ] │
│ T-Shirt (NBA Style)                                                    │
│ Brief ID: #578c3e52 • Designer: hary                                   │
├────────────────────────────────────────────────────────────────────────┤
│ REQUIRED TARGET:                              3 Designs x 2 Colors     │
│ [● Black] [○ White]                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ DESIGN CONCEPTS DECK                 Click any thumbnail to view full  │
│ [ Design #1 (2 Colors) ] [ Design #2 (0 Colors) ] [ Design #3 ]        │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Design Concept #1                                    2 Colorway(s) │ │
│ │                                                                    │ │
│ │ ┌─────────────────────────────┐  ┌─────────────────────────────┐   │ │
│ │ │ ● Black             2 Views │  │ ○ White             2 Views │   │ │
│ │ │ ┌──────────┐   ┌──────────┐ │  │ ┌──────────┐   ┌──────────┐ │   │ │
│ │ │ │  FRONT   │   │   BACK   │ │  │ │  FRONT   │   │   BACK   │ │   │ │
│ │ │ │ [Artwork]│   │ [Artwork]│ │  │ │ [Artwork]│   │ [Artwork]│ │   │ │
│ │ │ └──────────┘   └──────────┘ │  │ └──────────┘   └──────────┘ │   │ │
│ │ └─────────────────────────────┘  └─────────────────────────────┘   │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ [ Delete Brief ]                 [ Request Revisions ] [ Approve & SA ]│
└────────────────────────────────────────────────────────────────────────┘
```

#### Why this layout is 10/10:
- **Zero Border Clipping or Squishing**: Colorways use a responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`) with dedicated swatch circles and clean titles.
- **Side-by-Side Front & Back Views**: Uses `aspect-square` containers with `object-contain` scaling and soft cream backdrops (`#FAF7F0`) so artwork logos never get distorted or cropped.
- **Click to Zoom**: Clicking any thumbnail immediately opens a full-screen high-resolution lightbox viewer.
- **Concept Deck Switcher**: Tabs at the top let you effortlessly flip between `Design #1`, `Design #2`, and `Design #3`.

---

### SCREEN 3: Designer Creative Studio & History Tracker

- **Studio (`/design/designer`)**: Designer sees their assigned active briefs and can build concepts, upload front/back artwork vectors, pick colorways, and submit directly to the Provisional Head.
- **History Sidenav / Screen (`/design/history`)**:
  - Displays all past submitted work.
  - If status is `PH Approved` or `In Review`, shows a clean progress badge.
  - If status is `Revisions Needed` (`PH_REJECTED`), a **Redo / Revise** button allows the designer to reopen the brief, adjust the artwork based on PH feedback, and resubmit.

---

### SCREEN 4: Super Admin Strategic Approvals (`/design/sa-approvals`)

The executive drop decision center for the business owner:
- **`Greenlight for Tech-Pack (SA_APPROVED)`**: Approves the style for immediate mass-production planning and unlocks Tech-Pack generation.
- **`Save for Later Archive (SA_SAVED_FOR_LATER)`**: Archives the concept for future seasonal collections. Archived concepts can be revived at any time with a single click.
- **`Return for Revisions`**: Sends the brief back down to the Provisional Head and Designer with executive notes.

---

### SCREEN 5: Tech-Pack Master Catalog (`/design/tech-packs`)

The technical master registry for all industrialized garments.
- **Dual View**: Visual Gallery Cards vs Detailed Spec Table.
- **Tech-Pack Generator**: Converts greenlit submissions into complete factory tech-packs with SPI, seam classes, fabric GSM, and size grading.
- **Instant Deletion**: Clean delete action removing both local cache and database records.

---

## 5. Database Schema & Data Models

All data is securely persisted in PostgreSQL via Supabase:

### 1. `design_briefs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique brief identifier |
| `ph_user_id` | UUID (FK) | ID of the Provisional Head who created the brief |
| `designer_member_id` | UUID (FK) | Assigned designer team member |
| `garment_type` | VARCHAR | E.g. `T-Shirt`, `Hoodie`, `Jogger` |
| `category` | VARCHAR | E.g. `NBA`, `Streetwear`, `Casual` |
| `num_designs` / `target_designs`| INTEGER | Number of required design concepts (e.g. `3`) |
| `chart_colors` / `max_colors` | INTEGER | Maximum allowed colors per concept (e.g. `2`) |
| `target_colors` | TEXT[] | Required color palette array (e.g. `{'Black', 'White'}`) |
| `instructions` | TEXT | Specific guidelines and notes from Provisional Head |
| `status` | VARCHAR | `ALLOCATED`, `SUBMITTED`, `PH_APPROVED`, `PH_REJECTED`, `SA_APPROVED`, `SA_SAVED_FOR_LATER`, `TECH_PACK_CREATED` |

### 2. `design_submissions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique submission record |
| `brief_id` | UUID (FK) | Reference to the parent design brief |
| `concepts` | JSONB | Array of concepts containing concept number, title, notes, and colorways with `photo_front` and `photo_back` |
| `ph_verdict` | VARCHAR | `PENDING`, `APPROVED`, `REJECTED` |
| `ph_feedback` | TEXT | Feedback notes from Provisional Head |
| `sa_verdict` | VARCHAR | `PENDING`, `APPROVED`, `SAVED_FOR_LATER`, `REJECTED` |
| `sa_notes` | TEXT | Strategic decision notes from Super Admin |

### 3. `design_tech_packs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique tech-pack record |
| `style_number` | VARCHAR | Unique article style number (e.g. `TP-2026-8801`) |
| `brand_id` | UUID (FK) | Registered buyer/brand ID |
| `category` | VARCHAR | Silhouette category |
| `fabric_composition` | TEXT | E.g. `100% Combed Cotton French Terry` |
| `target_gsm` | INTEGER | Fabric weight (e.g. `380`) |
| `spi` | INTEGER | Stitches Per Inch (default `12`) |
| `seam_class` | VARCHAR | E.g. `ISO 4915 Class 504` |
| `status` | VARCHAR | `DRAFT`, `SAMPLE_DEV`, `PPS_SUBMITTED`, `PPS_APPROVED`, `BULK_APPROVED` |

---

## 6. Developer FAQ & SQL Reference

### How to clean test or dummy tech-packs in Supabase SQL Editor:
```sql
-- Delete specific test tech-packs by style number
DELETE FROM design_tech_packs 
WHERE style_number IN ('TP-2026-8801', 'TP-2026-8802');

-- Or reset all tech-packs to start completely clean:
-- DELETE FROM design_tech_packs;
```

### Why does Provisional Head see "PH Approved" when Admin saves for later?
Because the Provisional Head's creative review responsibility is complete once they approve the artwork. The "Saved for Later" status is an executive Super Admin archive tool. To keep the PH workspace clear and focused, the PH table simply displays `PH Approved`.

---
*Document updated in accordance with Zigza MES Design System rules (`#3A3564` / `#FAF7F0`), zero rainbow styling, and full multi-concept responsive architecture.*
