import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
    supabaseAnonKey &&
    !cleanUrl.includes('your-project-id') &&
    cleanUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
);

// Supabase client instance
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface PlayerProfile {
  id: string;
  email: string;
  username: string;
  trainer_name: string;
  player_tag: string;
  trophies: number;
  credits: number;
  player_level: number;
  active_beast_id: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Register a new player with Email, Password & Username
 */
export async function registerPlayerWithSupabase(
  email: string,
  pass: string,
  username: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: 'Supabase credentials are not configured in your .env file.',
    };
  }

  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '') || `Trainer_${Date.now().toString().slice(-4)}`;

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: pass,
    options: {
      data: {
        username: cleanUsername,
        trainer_name: cleanUsername,
      },
    },
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session };
}

/**
 * Sign in existing player with Email / Username & Password
 */
export async function signInPlayerWithSupabase(
  emailOrUsername: string,
  pass: string
): Promise<{ user: User | null; session: Session | null; profile?: PlayerProfile | null; error?: string }> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: 'Supabase credentials are not configured in your .env file.',
    };
  }

  let finalEmail = emailOrUsername.trim();

  // If user entered a username instead of email, resolve it from public.profiles
  if (!finalEmail.includes('@')) {
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', finalEmail)
      .maybeSingle();

    if (profileErr || !profileData?.email) {
      return {
        user: null,
        session: null,
        error: `Could not find an account with username "${finalEmail}". Please use your email.`,
      };
    }
    finalEmail = profileData.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: finalEmail,
    password: pass,
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  // Fetch full player profile
  let profile: PlayerProfile | null = null;
  if (data.user) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
    profile = userProfile as PlayerProfile | null;
  }

  return { user: data.user, session: data.session, profile };
}

/**
 * Send password reset email via Resend / Supabase Custom SMTP
 */
export async function resetPasswordWithSupabase(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase credentials are not configured in .env.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/#reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out current player
 */
export async function signOutPlayer(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Get current authenticated user and profile
 */
export async function getActivePlayerSession(): Promise<{
  session: Session | null;
  user: User | null;
  profile: PlayerProfile | null;
}> {
  if (!supabase) {
    return { session: null, user: null, profile: null };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { session: null, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  return {
    session,
    user: session.user,
    profile: (profile as PlayerProfile) || null,
  };
}
