-- ==============================================================================
-- PET SLAM: Waitlist Database Schema
-- Run this script inside your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Waitlist Table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    signup_status TEXT DEFAULT 'confirmed' NOT NULL,
    perks JSONB DEFAULT '{"credits": 10000, "founder_badge": true, "alpha_access": true}'::jsonb NOT NULL,
    email_delivery_status TEXT DEFAULT 'pending' NOT NULL, -- 'pending' | 'sent' | 'failed'
    email_delivery_error TEXT,
    ip_hash TEXT
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
-- Policy: Allow anonymous visitors to insert new signups
CREATE POLICY "Allow public waitlist inserts" 
ON public.waitlist
FOR INSERT 
TO anon, authenticated
WITH CHECK (
    email IS NOT NULL AND 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Policy: Restrict public reads so competitor email addresses are never exposed to other clients
CREATE POLICY "Restrict public read of waitlist" 
ON public.waitlist
FOR SELECT 
TO service_role
USING (true);

-- Policy: Service role has full permissions for Edge Functions
CREATE POLICY "Service role full access" 
ON public.waitlist
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Helper function to check total signup count securely without exposing emails
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER FROM public.waitlist;
$$;

-- Grant execution to anon users
GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;
