-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Venues Table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    legal_name TEXT,
    slogan TEXT,
    overview TEXT,
    category_id BIGINT, -- Foreign key to categories table if exists
    
    -- Media
    logo_url TEXT,
    cover_image_urls TEXT[] DEFAULT '{}',
    
    -- Location
    location GEOGRAPHY(POINT, 4326), -- PostGIS Geography type
    address_street TEXT,
    address_number TEXT,
    city TEXT,
    region_state TEXT,
    country_code VARCHAR(3) DEFAULT 'CL',
    directions_tip TEXT,
    
    -- Details
    price_tier SMALLINT CHECK (price_tier BETWEEN 1 AND 4),
    avg_price_min NUMERIC(10, 2),
    avg_price_max NUMERIC(10, 2),
    currency_code VARCHAR(3) DEFAULT 'CLP',
    
    -- JSONB Fields for flexibility
    opening_hours JSONB DEFAULT '{}'::jsonb,
    payment_methods JSONB DEFAULT '{"cash": true}'::jsonb,
    amenities JSONB DEFAULT '{}'::jsonb,
    
    -- Status & Metrics
    operational_status TEXT DEFAULT 'operational' CHECK (operational_status IN ('operational', 'closed', 'temporarily_closed')),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    trust_tier VARCHAR(20) DEFAULT 'standard',
    
    -- Counters (can be updated via triggers or backend logic)
    verified_visits_all_time INTEGER DEFAULT 0,
    verified_visits_monthly INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    -- Owner (Optional link to auth.users or profiles)
    owner_id UUID REFERENCES auth.users(id)
);

-- Create Index for Location Search
CREATE INDEX IF NOT EXISTS venues_location_idx ON public.venues USING GIST (location);

-- Create Index for Text Search
CREATE INDEX IF NOT EXISTS venues_name_idx ON public.venues USING GIN (to_tsvector('spanish', name));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Example)
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Venues are viewable by everyone" 
ON public.venues FOR SELECT 
USING (true);

-- Allow insert/update only to authenticated users (or specific roles)
CREATE POLICY "Authenticated users can insert venues" 
ON public.venues FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners can update their venues" 
ON public.venues FOR UPDATE 
USING (auth.uid() = owner_id);
