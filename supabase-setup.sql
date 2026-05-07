-- Create profiles table for user info
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_name TEXT,
  student_id TEXT,
  year_group INTEGER CHECK (year_group >= 7 AND year_group <= 13),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backfill for existing databases that were created before student fields.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Applications table
-- ============================================================
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  club_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, club_id)
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own applications
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses RLS automatically; no INSERT policy needed for anon users.

-- ============================================================
-- Clubs table (persistent source of truth for club metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  summary TEXT,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  meeting_day TEXT NOT NULL,
  meeting_time TEXT NOT NULL,
  location TEXT NOT NULL,
  year_group TEXT NOT NULL,
  year_group_min INTEGER NOT NULL DEFAULT 7,
  year_group_max INTEGER NOT NULL DEFAULT 13,
  photo_folder TEXT,
  leaders JSONB NOT NULL DEFAULT '[]'::jsonb,
  teachers JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact TEXT NOT NULL DEFAULT '',
  special_conditions TEXT,
  application_questions_raw TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  roles TEXT[] NOT NULL DEFAULT '{}',
  accepting BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT NOT NULL DEFAULT '',
  images TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clubs" ON clubs
  FOR SELECT USING (TRUE);

-- Keep updated_at current on writes
CREATE OR REPLACE FUNCTION public.touch_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clubs_touch_updated_at ON clubs;
CREATE TRIGGER clubs_touch_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION public.touch_clubs_updated_at();