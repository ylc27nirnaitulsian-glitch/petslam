import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Shield,
  Sparkles,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';
import {
  isSupabaseConfigured,
  registerPlayerWithSupabase,
  signInPlayerWithSupabase,
  resetPasswordWithSupabase,
  signInWithGoogleIdToken,
  GOOGLE_CLIENT_ID,
} from '../../services/supabaseClient';

interface AccountAuthModalProps {
  currentTrainerName: string;
  onUpdateTrainerName: (name: string) => void;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  currentTrainerName,
  onUpdateTrainerName,
  onClose,
  onAuthSuccess,
}) => {
  const { loginAccount, connectedAccount, logoutAccount, trainerName } = useGame();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showSwitchAccount, setShowSwitchAccount] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>(currentTrainerName !== 'Trainer' ? currentTrainerName : '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_remember_me') !== 'false';
    } catch {
      return true;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gsiLoaded, setGsiLoaded] = useState<boolean>(false);

  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Native In-App Google Sign-In directly on petslam.app
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const setupGoogleGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              if (response.credential) {
                setIsSubmitting(true);
                sound.playLevelUp();
                const res = await signInWithGoogleIdToken(response.credential);
                if (res.error) {
                  setErrorMessage(`Google authentication error: ${res.error}`);
                  setIsSubmitting(false);
                } else {
                  setSuccessMessage('Successfully signed in with Google! Entering Arena...');
                  sound.playBattleStart();
                  try {
                    localStorage.setItem('petslam_has_entered_game', 'true');
                    localStorage.setItem('petslam_remember_me', 'true');
                  } catch {}
                  setTimeout(() => {
                    onAuthSuccess?.();
                    onClose();
                  }, 500);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
          setGsiLoaded(true);
          return;
        } catch (e) {
          console.warn('GIS render error:', e);
        }
      }

      if (attempts < 15) {
        attempts++;
        timeoutId = setTimeout(setupGoogleGsi, 200);
      }
    };

    setupGoogleGsi();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTab]);

  // Google Sign In Handler (Native in-app on petslam.app)
  const handleGoogleSignIn = async () => {
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);

    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            console.log('GSI prompt status:', notification.getNotDisplayedReason?.());
          }
        });
        return;
      } catch (err: any) {
        console.warn('GIS prompt error:', err);
      }
    }

    setErrorMessage(
      'Google Sign-In is connecting directly to petslam.app. If the prompt does not appear, please ensure popups are enabled or log in with ID & Password below.'
    );
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    if (isSupabaseConfigured) {
      const res = await signInPlayerWithSupabase(email, password);
      setIsSubmitting(false);

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      const verifiedName = res.profile?.trainer_name || res.user?.user_metadata?.username || email.split('@')[0];
      try {
        localStorage.setItem('petslam_remember_me', rememberMe ? 'true' : 'false');
        if (rememberMe) localStorage.setItem('petslam_has_entered_game', 'true');
      } catch {}
      loginAccount('Supabase', res.user?.email || email, verifiedName, res.profile?.avatar_url, res.user?.id);
      onUpdateTrainerName(verifiedName);
      sound.playLevelUp();
      setSuccessMessage(`Welcome back, Trainer ${verifiedName}! Cloud sync active.`);

      setTimeout(() => {
        onAuthSuccess?.();
        onClose();
      }, 1200);
    } else {
      // Local fallback / sandbox mode
      setTimeout(() => {
        setIsSubmitting(false);
        const demoName = email.includes('@') ? email.split('@')[0] : email;
        loginAccount('Local-Sandbox', email.includes('@') ? email : `${email}@petslam.app`, demoName);
        onUpdateTrainerName(demoName);
        sound.playLevelUp();
        setSuccessMessage(`Signed in as ${demoName}! (Running in sandbox mode - configure .env for live Supabase DB).`);

        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1200);
      }, 600);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password || !username.trim()) {
      setErrorMessage('Please fill in username, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    if (isSupabaseConfigured) {
      const res = await registerPlayerWithSupabase(email, password, username);
      setIsSubmitting(false);

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      sound.playLevelUp();
      setSuccessMessage(
        'Account created! A verification link has been sent to your email via Resend. Check your inbox to confirm your account.'
      );

      // Auto login if session exists (if email confirmation is turned off or immediate)
      if (res.session) {
        try {
          localStorage.setItem('petslam_remember_me', rememberMe ? 'true' : 'false');
          if (rememberMe) localStorage.setItem('petslam_has_entered_game', 'true');
        } catch {}
        loginAccount('Supabase', res.user?.email || email, username, undefined, res.user?.id);
        onUpdateTrainerName(username);
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1800);
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        loginAccount('Local-Sandbox', email, username);
        onUpdateTrainerName(username);
        sound.playLevelUp();
        setSuccessMessage(`Account registered for ${username}! (Sandbox preview mode).`);

        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1500);
      }, 600);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    if (isSupabaseConfigured) {
      const res = await resetPasswordWithSupabase(email);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        sound.playVictory();
        setSuccessMessage('Password recovery email sent via Resend! Check your inbox.');
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        sound.playVictory();
        setSuccessMessage('Password reset request simulated. Set up Supabase + Resend for live email delivery.');
      }, 600);
    }
  };

  // Quick Guest Mode Bypass
  const handleGuestPlay = () => {
    sound.playClick();
    if (!connectedAccount.isLoggedIn) {
      loginAccount('Guest', 'trainer.guest@petslam.app', trainerName || 'Trainer');
    }
    try {
      localStorage.setItem('petslam_has_entered_game', 'true');
    } catch {}
    onClose();
    onAuthSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#151C28] border border-[#2A364F] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#1E2738] border-b border-[#2A364F] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B] flex items-center justify-center shadow">
              <Shield className="w-5 h-5 text-[#0B0F17] font-bold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base uppercase tracking-wider text-[#F8FAFC]">
                Player Authentication
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                Quick Play or Google Sign-In
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#151C28] hover:bg-[#2A364F] flex items-center justify-center text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Active Logged In Card */}
          {connectedAccount.isLoggedIn && !showSwitchAccount ? (
            <div className="space-y-4">
              <div className="bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-xl shrink-0">
                  <User className="w-6 h-6 text-[#10B981]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-[#F8FAFC] text-base truncate">
                      {trainerName}
                    </span>
                    <span className="text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/30 font-bold">
                      AUTHENTICATED
                    </span>
                  </div>
                  <div className="text-sm text-[#CBD5E1] truncate">{connectedAccount.email}</div>
                  <div className="text-xs text-[#94A3B8] mt-1">
                    Provider: {connectedAccount.provider} · Cloud Synced
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSwitchAccount(true)}
                  className="w-full py-2.5 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC] font-bold text-sm transition-colors duration-150 cursor-pointer"
                >
                  Switch Account
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      logoutAccount();
                      onUpdateTrainerName('Trainer');
                      setShowSwitchAccount(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#F43F5E]/15 hover:bg-[#F43F5E]/25 border border-[#F43F5E]/40 text-[#F43F5E] font-bold text-sm transition-colors duration-150 cursor-pointer"
                  >
                    Log Out
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onClose();
                      onAuthSuccess?.();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#F59E0B] text-[#0B0F17] font-bold text-sm transition hover:bg-[#D97706] cursor-pointer"
                  >
                    Enter Arena
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Alert / Notification Feedback */}
              {errorMessage && (
                <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{successMessage}</div>
                </div>
              )}

              {/* Primary Option: Quick Play (Guest) */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGuestPlay}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] text-[#0B0F17] font-display font-bold text-base flex items-center justify-center gap-2 transition duration-150 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-5 h-5 fill-[#0B0F17]" />
                  <span>Quick Play (Guest)</span>
                </button>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#2A364F]"></div>
                  <span className="flex-shrink mx-3 text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Or Sign In
                  </span>
                  <div className="flex-grow border-t border-[#2A364F]"></div>
                </div>

                {/* Secondary Option: Native In-App Google Sign-In */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div ref={googleBtnContainerRef} className="flex justify-center min-h-[44px]" />

                  {!gsiLoaded && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] active:scale-[0.99] text-[#F8FAFC] font-bold text-sm flex items-center justify-center gap-3 transition duration-150 cursor-pointer border border-[#2A364F] disabled:opacity-60"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>
              </div>

              {/* FEATURE FLAG: Custom Auth Form on hold for MVP de-bloat */}
              {/* Only Quick Play (Guest) and Google Sign In are active */}

              {/* Legal Terms & Privacy Disclosures */}
              <div className="pt-3 text-[13px] text-center text-[#94A3B8] leading-relaxed border-t border-[#2A364F]">
                By entering the arena, you agree to PET SLAM's{' '}
                <a
                  href="/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F59E0B] hover:underline font-semibold"
                >
                  Terms
                </a>
                ,{' '}
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F59E0B] hover:underline font-semibold"
                >
                  Privacy
                </a>
                , and{' '}
                <a
                  href="/fair-play.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#CBD5E1] hover:underline font-semibold"
                >
                  Fair Play Rules
                </a>
                .
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
