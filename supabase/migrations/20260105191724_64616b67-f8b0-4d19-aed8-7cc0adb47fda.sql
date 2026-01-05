-- Add social media URLs and image to credentials table
ALTER TABLE public.credentials
ADD COLUMN image_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN instagram_url TEXT,
ADD COLUMN github_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN google_url TEXT,
ADD COLUMN facebook_url TEXT,
ADD COLUMN youtube_url TEXT;

-- Create storage bucket for credential images
INSERT INTO storage.buckets (id, name, public) VALUES ('credential-images', 'credential-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload credential images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'credential-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update credential images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'credential-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete credential images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'credential-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to credential images
CREATE POLICY "Credential images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'credential-images');