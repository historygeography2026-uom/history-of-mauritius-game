-- Create storage bucket for question images
-- Run this in Supabase SQL Editor

-- Insert the bucket (this is done via Supabase Dashboard usually, but can be done via SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,  -- public bucket for easy access
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;

-- Create policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

-- Create policy to allow authenticated users to upload
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'question-images');

-- Create policy to allow authenticated users to update their uploads
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'question-images');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'question-images');

-- Note: You may also need to create the bucket via Supabase Dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Click "New bucket"
-- 3. Name it "question-images"
-- 4. Check "Public bucket" 
-- 5. Set file size limit to 5MB
-- 6. Set allowed MIME types to: image/jpeg, image/png, image/gif, image/webp
