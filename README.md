# Zigza MES / NubiSync Web Admin

## Executive Overview

Zigza MES (NubiSync Web Admin) is an enterprise Manufacturing Execution System (MES) and administrative control center engineered for apparel, garment manufacturing, and textile production units. It bridges the physical factory floor with administrative operations by managing end-to-end garment production lifecycles: article cataloging, multi-stage production orders, cutting and stitching allotments, pre-loading counting audits, delivery challan manifests, and dispatch logistics.

The application is built on Next.js 16 (App Router), React 19, TypeScript, and Supabase (PostgreSQL with Row Level Security), styled using a bespoke design system with strict typographical hierarchy and responsive layouts.

---

## Business Logic & Manufacturing Domains

### 1. Master Article Cataloging
- **Article Styles & SKUs**: Centralized ledger of factory designs, style numbers (`art_no`), descriptions, fabric specifications, color palettes, and size matrices.
- **Production History**: Tracks lifetime piece output, historical floor allocations, and delivery records aggregated by article style.

### 2. Production Orders & Stage Tracking
- **Order Lifecycle**: Tracks buyer manufacturing orders from initiation through Cutting, Stitching/Sewing, Finishing, Quality Assurance (QA), and Packaging.
- **Line Allocations**: Work order routing to specific factory floor lines and designated floor supervisors.
- **Piece Reconciliation**: Continuous tracking of planned quantity vs. actual cut, stitched, and finished garment units.

### 3. Dispatch, Logistics & Challan Management
- **Pre-Loading Counting Audits**: Floor managers verify carton counts and piece counts immediately prior to loading into transport vehicles.
- **Delivery Challans**: Generation of multi-article delivery manifests containing consignee/buyer details, destination godowns, vehicle registration numbers, and driver contact info.
- **Gate Pass Generation**: Print-ready, standardized invoices and gate-out passes for logistics dispatch and transport security clearance.
- **Reconciliation Engine**: Automated matching algorithm that compares physical piece counting against delivery challans to flag discrepancy mismatches (`MATCHED`, `DISCREPANCY`, `PENDING`).

### 4. Workforce & Supervisor Directory
- **Role-Based Access Control**: Department-level privileges for Factory Administrators, Production Line Supervisors, Dispatch Officers, and Cutting Masters.
- **Account Governance**: Profile lifecycle management, status auditing (Active vs. Inactive), credential provisioning, and root administration security boundaries.

### 5. Floor Displays & Factory Analytics
- **Live Kiosk / TV View**: Dedicated full-screen, high-contrast dashboard display for factory floor TVs and monitor stations, providing real-time production velocity and active line statuses.
- **KPI Metrics**: Aggregate throughput, active order count, delivery volume, lifetime output, and floor discrepancy rates.

---

## Infrastructure & Technical Architecture

```
[ Browser / Mobile Client ]
             │
             ▼
[ Next.js 16 App Router (Edge Middleware / Route Handlers) ]
  ├── Server Components (Data Streaming & SSR)
  ├── Server Actions ("use server" Transactional Mutations)
  └── Client Components (Zustand / Optimistic UI / Lucide)
             │
             ▼
[ Supabase Backend Ecosystem ]
  ├── PostgreSQL 15+ (Relational Schema & Constraints)
  ├── Row Level Security (RLS Multi-Tenant Policies)
  ├── Supabase Auth (SSR Cookie-Based Session Tokens)
  └── Realtime Subscriptions & Storage
```

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (App Router) | Hybrid Server/Client rendering, Server Actions, Route Handlers |
| **Runtime & UI** | React 19, React DOM | Core component library, concurrent transitions, optimistic UI |
| **Language** | TypeScript 5 | Strict static typing across models, props, and database interfaces |
| **Database & Auth** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL database, RLS security, JWT cookie session persistence |
| **Styling** | Tailwind CSS v4, Vanilla CSS variables | Bespoke executive UI, high contrast, zero-clutter tokens |
| **State Management** | Zustand, TanStack React Query | Lightweight client state, server cache synchronization |
| **Icons & Vectors** | Lucide React | Clean, monochrome vector iconography |
| **Export Engines** | SheetJS (`xlsx`) | Client-side CSV and Excel tabular data exports |

---

## Authentication & Session Flow

Session security is powered by Supabase SSR with HttpOnly cookie persistence:

1. **Authentication Handshake**: User submits credentials through the Staff Portal (`/login`).
2. **Session Cookie Storage**: Supabase SSR sets cryptographically secure cookies (`sb-[ref]-auth-token`) with strict pathing and 24-hour expiration defaults.
3. **Edge Middleware Guard (`src/middleware.ts` & `src/utils/supabase/middleware.ts`)**:
   - Inspects incoming requests to protected routes (`/dashboard`, `/production-orders`, `/dispatch`, `/employees`, `/profile`).
   - Automatically refreshes expired JWT tokens using refresh tokens.
   - Redirects unauthenticated requests to `/login`.
4. **Server Component Context (`src/utils/supabase/server.ts`)**:
   - Provides server-side client instances with direct access to user session data via Next.js `cookies()` headers.

---

## Database Schema & Entity Relationships

The PostgreSQL database maintains strict relational integrity across core manufacturing entities:

```
┌─────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│    articles     │──────<│ production_order_items │>──────│   production_orders    │
└─────────────────┘       └────────────────────────┘       └────────────────────────┘
         │                                                             │
         │                                                             │
         ▼                                                             ▼
┌────────────────────────┐                                 ┌────────────────────────┐
│ delivery_challan_items │>────────────────────────────────│   delivery_challans    │
└────────────────────────┘                                 └────────────────────────┘
         ▲                                                             │
         │                                                             │
         └───────────────────┌──────────────────┐                      │
                             │ counting_audits  │<─────────────────────┘
                             └──────────────────┘
```

### Core Entities

- **`articles`**: Master style definitions (`id`, `art_no`, `description`, `fabric`, `created_at`).
- **`production_orders`**: Top-level manufacturing orders (`id`, `order_no`, `buyer_name`, `status`, `target_date`, `total_qty`).
- **`production_order_items`**: Line item breakdowns per order (`id`, `order_id`, `article_id`, `color`, `size`, `quantity`, `cut_qty`, `stitched_qty`).
- **`floor_allotments`**: Specific daily tasks allocated to production lines and supervisors.
- **`delivery_challans`**: Official dispatch manifests (`id`, `challan_no`, `buyer_name`, `destination`, `vehicle_no`, `driver_phone`, `status`, `created_at`).
- **`delivery_challan_items`**: Garment lines attached to a challan (`id`, `challan_id`, `article_id`, `color`, `size`, `quantity`).
- **`counting_audits`**: Pre-loading physical counting logs (`id`, `article_id`, `color`, `size`, `counted_qty`, `carton_count`, `supervisor_id`, `created_at`).
- **`employees` / `profiles`**: Administrative and operational user accounts with department and role metadata.

---

## Directory Structure & Code Organization

```
nubira-web-admin/
├── public/                     # Static assets, line-art illustrations, logos
├── src/
│   ├── app/                    # Next.js App Router root
│   │   ├── (marketing)/        # Public-facing legal and informational pages
│   │   │   ├── privacy/        # Privacy policy
│   │   │   ├── security/       # Security standards
│   │   │   └── terms/          # Terms of service
│   │   ├── api/                # API route handlers
│   │   ├── auth/               # Auth callback endpoints
│   │   ├── allotments/         # Floor cutting & stitching allotments
│   │   ├── articles/           # Master article registry
│   │   ├── components/         # Landing page & shared page components
│   │   ├── dashboard/          # Executive KPI views & overview charts
│   │   ├── dispatch/           # Dispatch Hub, counting audits, delivery challans
│   │   ├── employees/          # Staff & supervisor management
│   │   ├── inventory/          # Fabric & trims inventory tracking
│   │   ├── login/              # Staff portal login screen
│   │   ├── production-orders/  # Production order management & stage trackers
│   │   ├── profile/            # Company profile & admin account security
│   │   ├── reports/            # Production analytics & data exports
│   │   ├── zigza-ai/           # Floor assistant & AI query interface
│   │   ├── globals.css         # Global Tailwind & design system token definitions
│   │   ├── layout.tsx          # Root HTML layout with font imports & metadata
│   │   ├── middleware.ts       # Route security & session verification
│   │   ├── not-found.tsx       # Custom 404 page
│   │   ├── page.tsx            # Root landing / marketing page
│   │   ├── robots.ts           # Search engine indexing configuration
│   │   └── sitemap.ts          # XML sitemap generator
│   │
│   ├── components/             # Reusable UI component library
│   │   ├── chat/               # AI floor assistant interface
│   │   ├── layout/             # Sidebar, top navigation, AdminShell, TV topbar
│   │   └── ui/                 # CustomSelect, SubtleDialog, ConfirmDialog, buttons, cards
│   │
│   ├── context/                # React context providers
│   ├── lib/                    # Utilities, Axios instances, formatting helpers
│   ├── store/                  # Zustand client stores
│   └── utils/
│       └── supabase/           # Supabase client, server, admin, and middleware helpers
│
├── package.json                # Project dependencies and script declarations
├── postcss.config.mjs          # PostCSS configuration for Tailwind v4
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Design System & UI Specifications

The UI adheres strictly to the Zigza Minimal Executive design language:

### Color Palette
- **Primary Brand Purple (`#3A3564`)**: Used on primary action buttons, active navigation indicators, and key operational headers.
- **Ivory Accent (`#FAF7F0`)**: Used on subtle secondary buttons, active badges, and metric card icon containers.
- **Dark Ink (`#14140F` / `#0F172A`)**: High-contrast body and title typography.
- **Subtle Borders (`border-black/10` / `border-slate-200`)**: Crisp boundaries without heavy drop-shadows.

### Typography Hierarchy
- **Heading Font**: Plus Jakarta Sans (`var(--font-heading)`) for executive titles, brand names, and page headers.
- **Body Font**: Inter / Geist for legible data reading across dense tables.
- **Monospace Font**: JetBrains Mono for SKUs, challan numbers, dates, and quantitative values.

### Interaction Patterns
- **Zero Raw Emojis**: Replaced entirely with monochrome Lucide vector icons and semantic status dots (Emerald for Active/Matched, Amber for In Progress, Rose for Discrepancy).
- **Custom Select Dropdowns (`CustomSelect.tsx`)**: Unified keyboard-accessible dropdown popovers replacing inconsistent browser-native select elements.
- **In-App Subtle Dialogs (`SubtleDialog.tsx`)**: Minimalist modal popups for confirmations, success notices, and error diagnostics instead of default browser `alert()` and `confirm()` dialogs.

---

## Environment Configuration

Create a `.env.local` file in the `nubira-web-admin` root with the following keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional Service Role (Server-side admin operations only)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Metadata
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started & Local Development

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nubira-web-admin.git
cd nubira-web-admin

# Install project dependencies
npm install
```

### Running Locally

```bash
# Start the local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Quality Checks

```bash
# Run static type checking across all TS/TSX files
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server locally
npm run start
```

---

## Production Deployment Guidelines

1. **Vercel / Node.js Host**: Deploy as a standard Next.js application. Ensure environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are assigned in the project settings.
2. **Database Migrations**: Apply all database schema migrations to the target Supabase project before deploying the web bundle.
3. **Cookie Domain & Security**: Ensure SSL/TLS is active in production (`https://`) so session cookies are transmitted with secure flags.

---

## License & Intellectual Property

Proprietary software. All rights reserved by Zigza / NubiSync.
Proudly Made in India.
