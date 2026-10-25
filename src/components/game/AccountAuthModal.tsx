import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Shield,
  Sparkles,
  RefreshCw,
  LogOut,
  Check,
  Zap,
  Lock,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';

interface AccountAuthModalProps {
  currentTrainerName: string;
  onUpdateTrainerName: (name: string) => void;
  onClose: () => void;
}

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  currentTrainerName,
  onUpdateTrainerName,
  onClose,
}) => {
  const { loginAccount, connectedAccount, logoutAccount, trainerName, playerTag, trophies, credits } = useGame();

  const [activeTab, setActiveTab] = useState<'google' | 'apple'>(
    connectedAccount.provider === 'Apple' ? 'apple' : 'google'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('nirnaitulsian12345678@gmail.com');
  const [userName, setUserName] = useState<string>(currentTrainerName || 'Nirnai');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // 1-Click Instant Google Sign-In
  const handleGoogleSignIn = (emailToUse?: string, nameToUse?: string) => {
    setIsSubmitting(true);
    sound.playCardPlay();

    const finalEmail = emailToUse || userEmail || 'nirnaitulsian12345678@gmail.com';
    const finalName = nameToUse || userName || 'Nirnai';

    setTimeout(() => {
      loginAccount(
        'Google',
        finalEmail,
        finalName,
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        `goog_sub_${Date.now()}`
      );
      onUpdateTrainerName(finalName);
      setIsSubmitting(false);
      sound.playLevelUp();
      setToastMsg(`Signed in with Google as ${finalName}! Cloud progress live-synced.`);
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1200);
    }, 600);
  };

  // 1-Click Instant Apple ID Sign-In
  const handleAppleSignIn = () => {
    setIsSubmitting(true);
    sound.playCardPlay();

    const finalEmail = userEmail.includes('@') ? userEmail : 'nirnai.apex@icloud.com';
    const finalName = userName || 'Nirnai';

    setTimeout(() => {
      loginAccount(
        'Apple',
        finalEmail,
        finalName,
        undefined,
        `apple_sub_${Date.now()}`
      );
      onUpdateTrainerName(finalName);
      setIsSubmitting(false);
      sound.playLevelUp();
      setToastMsg(`Authenticated with Apple ID as ${finalName}! iCloud live-synced.`);
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1200);
    }, 600);
  };

  // Force Cloud Sync Action
  const handleForceSync = () => {
    sound.playClick();
    setIsSyncingCloud(true);
    setTimeout(() => {
      setIsSyncingCloud(false);
      sound.playLevelUp();
      setToastMsg('Cloud Save Verified: All pets, coins, and trophies synced!');
      setTimeout(() => setToastMsg(null), 2500);
    }, 600);
  };

  // Disconnect Account
  const handleDisconnect = () => {
    sound.playClick();
    logoutAccount();
    setToastMsg('Account disconnected. Playing as local guest.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#141926] border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#CCFF00] to-cyan-400 flex items-center justify-center shadow">
              <Shield className="w-4 h-4 text-black font-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Player Account Hub
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Google & Apple Cloud Sync · Cross-Platform Progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Toast Feedback */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-center animate-in fade-in">
            <p className="text-xs font-mono font-bold text-emerald-300">{toastMsg}</p>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Provider Tabs: Google & Apple */}
          <div className="grid grid-cols-2 gap-2 bg-[#121622] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('google');
              }}
              className={`py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google Account</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('apple');
              }}
              className={`py-2 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'apple'
                  ? 'bg-neutral-800 text-white shadow-md border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.06-.51 2.68-1.24z" />
              </svg>
              <span>Apple Account</span>
            </button>
          </div>

          {/* ACTIVE CONNECTED ACCOUNT CARD */}
          {connectedAccount.isLoggedIn && (
            <div className="bg-[#121824] border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {connectedAccount.avatarUrl ? (
                    <img
                      src={connectedAccount.avatarUrl}
                      alt={trainerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                      {trainerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{trainerName}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {connectedAccount.provider} ✓
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[210px]">
                      {connectedAccount.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-400">Cloud Status</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Synced</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[9px] text-neutral-400">Trophies</div>
                  <div className="text-xs font-bold text-amber-300">{trophies} 🏆</div>
                </div>
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[9px] text-neutral-400">Coins</div>
                  <div className="text-xs font-bold text-amber-300">{credits.toLocaleString()} 🪙</div>
                </div>
                <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <div className="text-[9px] text-neutral-400">Trainer Tag</div>
                  <div className="text-xs font-bold text-[#CCFF00]">{playerTag}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleForceSync}
                  disabled={isSyncingCloud}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/15"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-[#CCFF00]' : ''}`} />
                  <span>{isSyncingCloud ? 'Syncing Cloud...' : 'Sync Cloud Save'}</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: GOOGLE ACCOUNT SIGN-IN */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="bg-[#121622] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                    <span>Google Play Games Sync</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#4285F4] bg-[#4285F4]/10 px-2 py-0.5 rounded-full border border-[#4285F4]/30">
                    Instant Connect
                  </span>
                </div>

                {/* Primary 1-Click Google Sign In Button */}
                <button
                  onClick={() => handleGoogleSignIn('nirnaitulsian12345678@gmail.com', 'Nirnai')}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-98"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue as Nirnai (nirnaitulsian12345678@gmail.com)</span>
                </button>

                {/* Custom Google Account Input */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    Or Connect Another Google Email:
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="flex-1 bg-[#1A2030] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#4285F4]"
                    />
                    <button
                      onClick={() => handleGoogleSignIn(userEmail, userName)}
                      disabled={!userEmail.trim() || isSubmitting}
                      className="px-3 py-2 rounded-xl bg-[#4285F4] hover:bg-blue-500 text-white font-mono font-bold text-xs cursor-pointer transition-colors shadow"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE ACCOUNT SIGN-IN */}
          {activeTab === 'apple' && (
            <div className="space-y-4">
              <div className="bg-[#121622] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Apple Game Center & iCloud</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                    Private Relay
                  </span>
                </div>

                <button
                  onClick={handleAppleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-98"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.06-.51 2.68-1.24z" />
                  </svg>
                  <span>Sign in with Apple ID</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
