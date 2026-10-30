import React, { useState } from 'react';
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
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>(currentTrainerName !== 'Trainer' ? currentTrainerName : '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    onClose();
    onAuthSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#141926] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CCFF00] to-emerald-500 flex items-center justify-center shadow">
              <Shield className="w-5 h-5 text-black font-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Player Authentication
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {isSupabaseConfigured ? '🟢 Supabase Cloud DB Connected' : '🟡 Supabase Sandbox Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        {!connectedAccount.isLoggedIn && (
          <div className="flex border-b border-white/10 bg-[#0a0d14]">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'text-[#CCFF00] border-b-2 border-[#CCFF00] bg-white/5'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'text-[#CCFF00] border-b-2 border-[#CCFF00] bg-white/5'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setActiveTab('forgot');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'forgot'
                  ? 'text-[#CCFF00] border-b-2 border-[#CCFF00] bg-white/5'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Active Logged In Card */}
          {connectedAccount.isLoggedIn ? (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                  🐾
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-white text-base truncate">
                      {trainerName}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      AUTHENTICATED
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 font-mono truncate">{connectedAccount.email}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Provider: {connectedAccount.provider} · Cloud Synced
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    logoutAccount();
                    onUpdateTrainerName('Trainer');
                    setSuccessMessage('Logged out successfully.');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs transition cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs transition hover:brightness-110 cursor-pointer"
                >
                  Return to Game
                </button>
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

              {/* SIGN IN FORM */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trainer@petslam.app or Trainer_01"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono uppercase text-neutral-300 font-bold">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[10px] text-[#CCFF00] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black font-display text-sm uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Verifying Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Arena</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                      Trainer Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. ShadowK9"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                      Email Address (For Resend Verification)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="player@domain.com"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                        Confirm
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black font-display text-sm uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Account & Send Verification</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Enter the email registered to your account. We will dispatch a secure password reset link powered by <strong className="text-white">Resend</strong>.
                  </p>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1 font-bold">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="player@domain.com"
                        required
                        className="w-full bg-[#131824] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-display text-sm uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending Link...' : 'Send Recovery Email'}
                  </button>
                </form>
              )}

              {/* Guest Play & Setup Helper */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleGuestPlay}
                  className="text-neutral-400 hover:text-white transition cursor-pointer underline text-[11px]"
                >
                  Continue as Guest / Demo Play
                </button>
                <span className="text-[10px] font-mono text-neutral-500">
                  Resend SMTP Verification Ready
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
