-- ==============================================================================
-- NubiSync Migration: Division 07 (Washing) & Division 08 (Ironing) Floor Schema
-- Multi-Tenant Data Isolation & Cloud Persistence
--
-- Instructions:
-- Execute this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query).
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. DIVISION 07: INDUSTRIAL WASHING FLOOR
-- -----------------------------------------------------------------------------

-- 1.1 Washing Floor Workers
CREATE TABLE IF NOT EXISTS public.washing_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_user_id UUID,
    worker_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    worker_email TEXT,
    roles JSONB DEFAULT '["WASH_MASTER"]'::jsonb,
    role TEXT DEFAULT 'WASH_MASTER',
    assigned_machine TEXT DEFAULT 'Washer 01 (Tumbler 600kg)',
    shift TEXT DEFAULT 'MORNING',
    status TEXT DEFAULT 'ACTIVE',
    company_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Washing Task Allocations (Spreadsheet Matrix)
CREATE TABLE IF NOT EXISTS public.washing_task_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_ref TEXT NOT NULL,
    buyer_id UUID,
    buyer_name TEXT DEFAULT 'Direct Buyer',
    article_number TEXT NOT NULL,
    article_name TEXT,
    worker_id UUID REFERENCES public.washing_workers(id) ON DELETE SET NULL,
    worker_name TEXT NOT NULL,
    worker_phone TEXT,
    table_number TEXT DEFAULT 'Washer 01 (Tumbler 600kg)',
    machine_number TEXT,
    pieces_to_wash INTEGER NOT NULL DEFAULT 0,
    completed_pieces INTEGER NOT NULL DEFAULT 0,
    alloted_hours NUMERIC(4,2) DEFAULT 4.0,
    due_time TIMESTAMPTZ,
    wash_recipe TEXT DEFAULT 'Bio-Enzyme Wash 55°C',
    notes TEXT,
    status TEXT DEFAULT 'ASSIGNED',
    company_name TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. DIVISION 08: STEAM IRONING & FINISHING FLOOR
-- -----------------------------------------------------------------------------

-- 2.1 Steam Ironing Pressers & Operators
CREATE TABLE IF NOT EXISTS public.iron_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_user_id UUID,
    worker_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    worker_email TEXT,
    roles JSONB DEFAULT '["FINISHING_PRESSER"]'::jsonb,
    role TEXT DEFAULT 'FINISHING_PRESSER',
    assigned_table TEXT DEFAULT 'Steam Table 01 (Vacuum)',
    shift TEXT DEFAULT 'SHIFT_1',
    status TEXT DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    company_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Steam Ironing Task Allocations (Spreadsheet Matrix)
CREATE TABLE IF NOT EXISTS public.iron_task_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_ref TEXT NOT NULL,
    cutting_allocation_id UUID,
    buyer_id UUID,
    buyer_name TEXT DEFAULT 'Direct Buyer',
    article_number TEXT NOT NULL,
    article_name TEXT,
    worker_id UUID REFERENCES public.iron_workers(id) ON DELETE SET NULL,
    worker_name TEXT NOT NULL,
    worker_phone TEXT,
    machine_table TEXT DEFAULT 'Steam Table 01 (Vacuum)',
    table_number TEXT,
    pieces_to_press INTEGER NOT NULL DEFAULT 0,
    completed_pieces INTEGER NOT NULL DEFAULT 0,
    alloted_hours NUMERIC(4,2) DEFAULT 4.0,
    shift TEXT DEFAULT 'SHIFT_1',
    iron_temp_c INTEGER DEFAULT 150,
    due_time TIMESTAMPTZ,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    company_name TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. MULTI-TENANT PERFORMANCE & SECURITY INDEXES
-- -----------------------------------------------------------------------------

-- Washing Floor Indexes
CREATE INDEX IF NOT EXISTS idx_washing_workers_company ON public.washing_workers(company_name);
CREATE INDEX IF NOT EXISTS idx_washing_workers_phone ON public.washing_workers(phone_number);
CREATE INDEX IF NOT EXISTS idx_washing_allocations_company ON public.washing_task_allocations(company_name);
CREATE INDEX IF NOT EXISTS idx_washing_allocations_task_ref ON public.washing_task_allocations(task_ref);
CREATE INDEX IF NOT EXISTS idx_washing_allocations_worker ON public.washing_task_allocations(worker_id);

-- Steam Ironing Floor Indexes
CREATE INDEX IF NOT EXISTS idx_iron_workers_company ON public.iron_workers(company_name);
CREATE INDEX IF NOT EXISTS idx_iron_workers_phone ON public.iron_workers(phone_number);
CREATE INDEX IF NOT EXISTS idx_iron_allocations_company ON public.iron_task_allocations(company_name);
CREATE INDEX IF NOT EXISTS idx_iron_allocations_task_ref ON public.iron_task_allocations(task_ref);
CREATE INDEX IF NOT EXISTS idx_iron_allocations_worker ON public.iron_task_allocations(worker_id);

-- Ensure company_name column exists on existing legacy tables if present
ALTER TABLE IF EXISTS public.washing_batches ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS public.washing_recipes ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS public.iron_tables ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS public.iron_production_logs ADD COLUMN IF NOT EXISTS company_name TEXT;

CREATE INDEX IF NOT EXISTS idx_washing_batches_company ON public.washing_batches(company_name);
CREATE INDEX IF NOT EXISTS idx_iron_tables_company ON public.iron_tables(company_name);
CREATE INDEX IF NOT EXISTS idx_iron_production_logs_company ON public.iron_production_logs(company_name);
