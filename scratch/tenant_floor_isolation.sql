-- ==============================================================================
-- NubiSync Multi-Tenant Data Isolation Migration
-- Run this script in your Supabase SQL Editor.
--
-- ARCHITECTURE RULE:
-- Every company provisioned via the admin portal operates with 100% isolated 
-- tenant individuality. No company has hardcoded special bypasses or default privileges.
-- ==============================================================================

-- 1. CUTTING FLOOR TABLES
-- Add tenant company_name column without hardcoded defaults
ALTER TABLE IF EXISTS cutting_orders 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS cutting_workers 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS cutting_task_allocations 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 2. PRINTING FLOOR TABLES
ALTER TABLE IF EXISTS printing_orders 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS printing_workers 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS printing_task_allocations 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 3. EMBROIDERY FLOOR TABLES
ALTER TABLE IF EXISTS embroidery_orders 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS embroidery_workers 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS embroidery_task_allocations 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 4. MERCHANDISING & BRAND TABLES
ALTER TABLE IF EXISTS merchandising_orders 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS brands 
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 5. PERFORMANCE INDEXES FOR TENANT-SCOPED QUERIES
CREATE INDEX IF NOT EXISTS idx_cutting_orders_company ON cutting_orders(company_name);
CREATE INDEX IF NOT EXISTS idx_cutting_workers_company ON cutting_workers(company_name);
CREATE INDEX IF NOT EXISTS idx_cutting_allocations_company ON cutting_task_allocations(company_name);

CREATE INDEX IF NOT EXISTS idx_printing_orders_company ON printing_orders(company_name);
CREATE INDEX IF NOT EXISTS idx_printing_workers_company ON printing_workers(company_name);
CREATE INDEX IF NOT EXISTS idx_printing_allocations_company ON printing_task_allocations(company_name);

CREATE INDEX IF NOT EXISTS idx_embroidery_orders_company ON embroidery_orders(company_name);
CREATE INDEX IF NOT EXISTS idx_embroidery_workers_company ON embroidery_workers(company_name);
CREATE INDEX IF NOT EXISTS idx_embroidery_allocations_company ON embroidery_task_allocations(company_name);

CREATE INDEX IF NOT EXISTS idx_merchandising_orders_company ON merchandising_orders(company_name);
CREATE INDEX IF NOT EXISTS idx_brands_company ON brands(company_name);

-- 6. ATTRIBUTE EXISTING ORPHANED ROWS (OPTIONAL CLEANUP)
-- If you have existing test records with NULL company_name created while testing
-- under "Demo Industries", you can attribute them directly to "Demo Industries" 
-- so other companies (e.g. "Ankit Industry") start with clean isolated tables.
--
-- UPDATE cutting_orders SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE cutting_workers SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE cutting_task_allocations SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE printing_orders SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE printing_workers SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE printing_task_allocations SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE embroidery_orders SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE embroidery_workers SET company_name = 'Demo Industries' WHERE company_name IS NULL;
-- UPDATE embroidery_task_allocations SET company_name = 'Demo Industries' WHERE company_name IS NULL;

