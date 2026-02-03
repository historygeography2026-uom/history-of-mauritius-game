-- Additional policies for user_profiles to support public profile display
-- Allow public to view basic profile info (for leaderboard display)
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.user_profiles;

CREATE POLICY "Public can view basic profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

-- Create a profiles view for public leaderboard display (hides sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.user_profiles;

-- Grant select on the view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
