-- Fix permissions for Storage Bucket 'venues-media' (V2 - Skip System Table Alter)
-- Run this in Supabase SQL Editor

-- 1. Create the bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venues-media', 'venues-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. (Skipped) Enable RLS on objects - usually enabled by default and restricted

-- 3. Policy: Allow Public Read Access (Download/View)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'venues-media' );

-- 4. Policy: Allow Authenticated Uploads (Insert)
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'venues-media' );

-- 5. Policy: Allow Owners to Update/Delete their own files
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'venues-media' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'venues-media' AND auth.uid() = owner );
