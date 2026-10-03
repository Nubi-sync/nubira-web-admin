-- ============================================================================
-- Zigza MES Enterprise: Module Vendors Master Schema
-- Run this in your Supabase SQL Editor to support the 12 Factory Module Vendors
-- ============================================================================

-- 1. Create module_vendors table
CREATE TABLE IF NOT EXISTS public.module_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_route TEXT NOT NULL,
  module_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  tenant_company TEXT DEFAULT 'Nubira Creation',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_module_vendor_route_tenant UNIQUE (module_route, tenant_company)
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_module_vendors_route ON public.module_vendors (module_route);
CREATE INDEX IF NOT EXISTS idx_module_vendors_tenant ON public.module_vendors (tenant_company);
CREATE INDEX IF NOT EXISTS idx_module_vendors_phone ON public.module_vendors (phone);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.module_vendors ENABLE ROW LEVEL SECURITY;

-- 4. Permissive policies for authenticated factory staff & service role
DROP POLICY IF EXISTS "Allow authenticated users to read module_vendors" ON public.module_vendors;
CREATE POLICY "Allow authenticated users to read module_vendors"
  ON public.module_vendors
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert module_vendors" ON public.module_vendors;
CREATE POLICY "Allow authenticated users to insert module_vendors"
  ON public.module_vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update module_vendors" ON public.module_vendors;
CREATE POLICY "Allow authenticated users to update module_vendors"
  ON public.module_vendors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete module_vendors" ON public.module_vendors;
CREATE POLICY "Allow authenticated users to delete module_vendors"
  ON public.module_vendors
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Grant permissions to service_role and authenticated
GRANT ALL ON public.module_vendors TO authenticated;
GRANT ALL ON public.module_vendors TO service_role;
GRANT ALL ON public.module_vendors TO anon;
