-- ============================================================================
-- Migration: User Login Activity & State-Level Geo Telemetry
-- Tracks 7-day hourly login matrix and isolated state-level geolocation
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_login_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'OWNER',
  company_name TEXT DEFAULT 'Nubira Creation',
  tenant_id TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  city TEXT DEFAULT 'Kolkata',
  state TEXT DEFAULT 'West Bengal',
  country TEXT DEFAULT 'India',
  device_type TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'Chrome',
  operating_system TEXT DEFAULT 'Windows',
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour_slot INTEGER NOT NULL DEFAULT EXTRACT(HOUR FROM now())::INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_login_activity_date 
  ON public.user_login_activity(login_date DESC, hour_slot);

CREATE INDEX IF NOT EXISTS idx_user_login_activity_user 
  ON public.user_login_activity(user_id, login_date);

CREATE INDEX IF NOT EXISTS idx_user_login_activity_tenant 
  ON public.user_login_activity(company_name, login_date);

ALTER TABLE public.user_login_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated insert into user_login_activity" ON public.user_login_activity;
CREATE POLICY "Allow authenticated insert into user_login_activity"
  ON public.user_login_activity
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read login activity" ON public.user_login_activity;
CREATE POLICY "Allow users to read login activity"
  ON public.user_login_activity
  FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);
