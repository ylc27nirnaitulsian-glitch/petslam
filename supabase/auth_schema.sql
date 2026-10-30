-- ==============================================================================
-- PET SLAM: Player Authentication & Database Schema for Supabase
-- Run this script inside your Supabase Project:
-- SQL Editor -> New query -> Paste and click "Run"
-- ==============================================================================

-- 1. Create Public Profiles Table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE NOT NULL,
    trainer_name TEXT NOT NULL,
    player_tag TEXT UNIQUE NOT NULL,
    trophies INTEGER DEFAULT 0 NOT NULL,
    credits INTEGER DEFAULT 1000 NOT NULL,
    player_level INTEGER DEFAULT 1 NOT NULL,
    active_beast_id TEXT DEFAULT 'beast-canine-01' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for Rapid Search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_name ON public.profiles (trainer_name);
CREATE INDEX IF NOT EXISTS idx_profiles_trophies ON public.profiles (trophies DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone authenticated or public to read profiles (needed for leaderboards and duel match-ups)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update only their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Trigger to Automatically Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    raw_username TEXT;
    clean_username TEXT;
    generated_tag TEXT;
BEGIN
    -- Extract username from user metadata or fallback to email prefix
    raw_username := COALESCE(
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );
    clean_username := regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g');
    IF clean_username = '' THEN
        clean_username := 'Trainer_' || floor(random() * 9000 + 1000)::text;
    END IF;
    generated_tag := '#' || floor(random() * 9000 + 1000)::text;

    INSERT INTO public.profiles (
        id,
        email,
        username,
        trainer_name,
        player_tag,
        trophies,
        credits,
        player_level,
        active_beast_id,
        avatar_url
    )
    VALUES (
        new.id,
        new.email,
        clean_username,
        clean_username,
        generated_tag,
        0,
        1000,
        1,
        'beast-canine-01',
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
