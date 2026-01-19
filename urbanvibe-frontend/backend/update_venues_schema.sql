-- Add is_founder column
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;

-- Add property_document_url column
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS property_document_url TEXT;

-- Comment on columns
COMMENT ON COLUMN public.venues.is_founder IS 'Indicates if this is a founder venue';
COMMENT ON COLUMN public.venues.property_document_url IS 'URL to the property ownership document';
