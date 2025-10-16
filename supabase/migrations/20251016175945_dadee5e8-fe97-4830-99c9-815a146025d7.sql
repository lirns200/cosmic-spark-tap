-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_leaderboard;

-- Add index for better performance on leaderboard queries
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date_clicks ON public.daily_leaderboard(date, clicks_count DESC);

-- Add index for referral codes lookup
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- Add index for profiles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_username ON public.profiles(telegram_username);

-- Fix referral system - prevent self-referrals properly
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS no_self_referral;
ALTER TABLE public.referrals ADD CONSTRAINT no_self_referral CHECK (referrer_id != referred_id);

-- Update profiles table to add telegram_id for proper auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id bigint UNIQUE;

-- Create or replace function to handle new user with telegram_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  telegram_username TEXT;
  telegram_id_val BIGINT;
  is_admin BOOLEAN;
BEGIN
  -- Get username and telegram_id from metadata
  telegram_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'Player' || substring(NEW.id::text from 1 for 8)
  );
  
  -- Get telegram_id from metadata
  telegram_id_val := (NEW.raw_user_meta_data->>'telegram_id')::bigint;
  
  -- Create profile with telegram_id
  INSERT INTO public.profiles (id, telegram_username, telegram_id)
  VALUES (NEW.id, telegram_username, telegram_id_val)
  ON CONFLICT (id) DO NOTHING;
  
  -- Check if user is admin
  is_admin := (telegram_username = 'L1r_No');
  
  -- Create user role
  IF is_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;