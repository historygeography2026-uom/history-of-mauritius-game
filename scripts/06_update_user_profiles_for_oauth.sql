-- Update user profiles table to handle OAuth users who may not have phone numbers
-- Ensure full_name has a default value for OAuth users
ALTER TABLE public.user_profiles 
ALTER COLUMN full_name SET DEFAULT 'User';

-- Drop NOT NULL constraint on full_name if it exists (for OAuth compatibility)
ALTER TABLE public.user_profiles 
ALTER COLUMN full_name DROP NOT NULL;

-- Add avatar_url column if not exists (for OAuth profile pictures)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the trigger function to handle OAuth users with avatar support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone_number, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
