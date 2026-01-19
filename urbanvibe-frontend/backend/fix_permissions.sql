-- Fix permissions for lookup tables
-- Run this in Supabase SQL Editor

-- 1. Venue Categories
ALTER TABLE public.venue_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.venue_categories;
CREATE POLICY "Enable read access for all users" ON public.venue_categories
    FOR SELECT USING (true);

-- 2. Countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.countries;
CREATE POLICY "Enable read access for all users" ON public.countries
    FOR SELECT USING (true);

-- 3. Regions
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.regions;
CREATE POLICY "Enable read access for all users" ON public.regions
    FOR SELECT USING (true);

-- 4. Cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cities;
CREATE POLICY "Enable read access for all users" ON public.cities
    FOR SELECT USING (true);

-- 5. Venues (Ensure insert is allowed for authenticated users)
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.venues;
CREATE POLICY "Enable insert for authenticated users" ON public.venues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read access for all users" ON public.venues;
CREATE POLICY "Enable read access for all users" ON public.venues
    FOR SELECT USING (true);
