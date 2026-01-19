-- Fix permissions for lookup tables (V2 - Explicit GRANTs)
-- Run this in Supabase SQL Editor

-- 1. Grant USAGE on public schema to ensure roles can access it
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant SELECT on specific tables to anon and authenticated roles
-- This is often the missing step when RLS is enabled but roles have no basic access
GRANT SELECT ON TABLE public.venue_categories TO anon, authenticated;
GRANT SELECT ON TABLE public.regions TO anon, authenticated;
GRANT SELECT ON TABLE public.cities TO anon, authenticated;
GRANT SELECT ON TABLE public.countries TO anon, authenticated;

-- 3. Ensure RLS is enabled
ALTER TABLE public.venue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- 4. Re-create policies (DROP first to avoid conflicts)
-- Venue Categories
DROP POLICY IF EXISTS "Public read access" ON public.venue_categories;
CREATE POLICY "Public read access" ON public.venue_categories FOR SELECT USING (true);

-- Regions
DROP POLICY IF EXISTS "Public read access" ON public.regions;
CREATE POLICY "Public read access" ON public.regions FOR SELECT USING (true);

-- Cities
DROP POLICY IF EXISTS "Public read access" ON public.cities;
CREATE POLICY "Public read access" ON public.cities FOR SELECT USING (true);

-- Countries
DROP POLICY IF EXISTS "Public read access" ON public.countries;
CREATE POLICY "Public read access" ON public.countries FOR SELECT USING (true);

-- Venues (Ensure insert is allowed for authenticated users)
GRANT ALL ON TABLE public.venues TO authenticated;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.venues;
CREATE POLICY "Enable insert for authenticated users" ON public.venues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read access for all users" ON public.venues;
CREATE POLICY "Enable read access for all users" ON public.venues
    FOR SELECT USING (true);
