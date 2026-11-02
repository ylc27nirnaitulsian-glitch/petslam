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
-- DATA-2 FIX: Public profiles only viewable by authenticated user themselves for sensitive data.
-- Non-sensitive public data is exposed via the public.public_profiles view.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- DATA-3 FIX: Allow users to update only safe profile fields (e.g. trainer_name, avatar_url, active_beast_id).
-- In-game currency (credits), ranking (trophies), and progression (player_level) are locked against client tampering.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DATA-3 Trigger: Enforce that client cannot update credits, trophies, or level directly
CREATE OR REPLACE FUNCTION public.protect_profile_progression()
RETURNS trigger AS $$
BEGIN
    IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
        IF NEW.credits <> OLD.credits THEN
            RAISE EXCEPTION 'Cannot modify credits directly from client.';
        END IF;
        IF NEW.trophies <> OLD.trophies THEN
            RAISE EXCEPTION 'Cannot modify trophies directly from client.';
        END IF;
        IF NEW.player_level <> OLD.player_level THEN
            RAISE EXCEPTION 'Cannot modify player_level directly from client.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_progression ON public.profiles;
CREATE TRIGGER trg_protect_profile_progression
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_progression();

-- DATA-2 Public Safe View: Exposes only non-sensitive leaderboard & matchmaking data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id,
    username,
    trainer_name,
    player_tag,
    trophies,
    player_level,
    active_beast_id,
    avatar_url,
    created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Helper RPC to securely resolve username to email for sign-in without exposing entire table
CREATE OR REPLACE FUNCTION public.get_auth_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
    found_email TEXT;
BEGIN
    SELECT email INTO found_email
    FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username)
    LIMIT 1;
    RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.get_auth_email_by_username(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.get_auth_email_by_username(TEXT) TO anon, authenticated;

-- 6. Purchases & Entitlements Table (PAY-3)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_id TEXT UNIQUE NOT NULL,
    pass_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    status TEXT NOT NULL,
    customer_email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own purchases" ON public.purchases;
CREATE POLICY "Users can read own purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = user_id);

-- 7. Trigger to Automatically Create Profile on Signup
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
