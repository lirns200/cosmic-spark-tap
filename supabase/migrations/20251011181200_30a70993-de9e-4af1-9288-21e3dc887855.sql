-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_username text NOT NULL,
  stars bigint DEFAULT 0 NOT NULL,
  energy integer DEFAULT 1000 NOT NULL,
  max_energy integer DEFAULT 1000 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  clicks_per_tap integer DEFAULT 1 NOT NULL,
  streak_days integer DEFAULT 0 NOT NULL,
  last_login_date date,
  daily_clicks integer DEFAULT 0 NOT NULL,
  total_clicks bigint DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create leaderboard table for daily competition
CREATE TABLE IF NOT EXISTS public.daily_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clicks_count bigint DEFAULT 0 NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create click history table
CREATE TABLE IF NOT EXISTS public.click_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clicks_count integer NOT NULL,
  stars_earned integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Daily leaderboard policies (everyone can view, users can update own)
CREATE POLICY "Everyone can view leaderboard"
  ON public.daily_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entry"
  ON public.daily_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON public.daily_leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Click history policies
CREATE POLICY "Users can view own clicks"
  ON public.click_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks"
  ON public.click_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, telegram_username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'telegram_username', 'Player' || substring(NEW.id::text from 1 for 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to regenerate energy
CREATE OR REPLACE FUNCTION public.regenerate_energy(user_id uuid)
RETURNS void AS $$
DECLARE
  current_energy integer;
  max_energy integer;
  last_update timestamptz;
  energy_to_add integer;
BEGIN
  SELECT energy, max_energy, updated_at INTO current_energy, max_energy, last_update
  FROM public.profiles
  WHERE id = user_id;
  
  IF current_energy < max_energy THEN
    -- Regenerate 1 energy per second
    energy_to_add := LEAST(
      max_energy - current_energy,
      EXTRACT(EPOCH FROM (now() - last_update))::integer
    );
    
    UPDATE public.profiles
    SET energy = LEAST(energy + energy_to_add, max_energy),
        updated_at = now()
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;