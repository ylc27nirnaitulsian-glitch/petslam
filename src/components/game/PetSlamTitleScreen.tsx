import React, { useState, useEffect } from 'react';
import {
  Swords,
  Play,
  HelpCircle,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Trophy,
  ChevronRight,
  Lock,
  PawPrint,
  Heart,
  Zap,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { animalImages } from '../../assets/images';
import { sound } from '../../utils/audio';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { PetSlamIntroSplash } from './PetSlamIntroSplash';
import {
  signInWithGoogleIdToken,
  GOOGLE_CLIENT_ID,
  isSupabaseConfigured,
} from '../../services/supabaseClient';

interface PetSlamTitleScreenProps {
  onEnterGame: () => void;
  onOpenSystemDetails: () => void;
}

export const PetSlamTitleScreen: React.FC<PetSlamTitleScreenProps> = ({
  onEnterGame,
}) => {
  const { trainerName, setTrainerName, activeBeast, soundEnabled, toggleSound, connectedAccount, loginAccount } = useGame();
  const { pet } = usePetCompanion();
  const [guideOpen, setGuideOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showIntroSplash, setShowIntroSplash] = useState(false);
  const [glowPulse, setGlowPulse] = useState(true);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const titleGoogleBtnRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const setupTitleGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && titleGoogleBtnRef.current && !connectedAccount.isLoggedIn) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              if (response.credential) {
                sound.playLevelUp();
                const res = await signInWithGoogleIdToken(response.credential);
                if (!res.error) {
                  sound.playBattleStart();
                  try {
                    localStorage.setItem('petslam_has_entered_game', 'true');
                    localStorage.setItem('petslam_remember_me', 'true');
                  } catch {}
                  onEnterGame();
                } else {
                  setAuthOpen(true);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          google.accounts.id.renderButton(titleGoogleBtnRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 280,
          });
          setGsiLoaded(true);
          return;
        } catch (e) {
          console.warn('GIS Title Screen render error:', e);
        }
      }

      if (attempts < 15) {
        attempts++;
        timeoutId = setTimeout(setupTitleGsi, 200);
      }
    };

    if (!connectedAccount.isLoggedIn) {
      setupTitleGsi();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [connectedAccount.isLoggedIn]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlowPulse((prev) => !prev);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    try {
      localStorage.setItem('petslam_has_entered_game', 'true');
    } catch {}
    sound.playVictory();
    onEnterGame();
  };

  const handleGuestPlayDirect = () => {
    sound.playVictory();
    if (!connectedAccount.isLoggedIn) {
      loginAccount('Guest', 'trainer.guest@petslam.app', trainerName || 'Trainer');
    }
    try {
      localStorage.setItem('petslam_has_entered_game', 'true');
    } catch {}
    onEnterGame();
  };

  const handleGoogleSignInDirect = () => {
    sound.playClick();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt();
      } catch {}
    }
    setAuthOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0F17] text-[#F8FAFC] flex flex-col justify-between overflow-hidden select-none">
      {/* Background Arena Image with Atmospheric Colosseum Darkness */}
      <div className="absolute inset-0 z-0">
        <img
          src={animalImages.arenaColosseum}
          alt="PET SLAM Championship Arena"
          className="w-full h-full object-cover opacity-25 scale-105 filter brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/80 to-[#0B0F17]/95" />
      </div>

      {/* Clean Top Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-full overflow-hidden border-b border-[#2A364F]/50 bg-[#0B0F17]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#151C28] border border-[#2A364F] flex items-center justify-center">
            <Swords className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-[#F8FAFC]">
            PET SLAM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#151C28] hover:bg-[#1E2738] border border-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>

          {/* Account Login Option (Google Hub) */}
          <button
            onClick={() => {
              sound.playClick();
              setAuthOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#151C28] hover:bg-[#1E2738] border border-[#2A364F] text-[#F8FAFC] transition-colors duration-150 cursor-pointer text-sm font-medium"
          >
            <User className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span className="truncate">{connectedAccount.isLoggedIn ? trainerName : 'Account Login'}</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center my-auto w-full max-w-full overflow-hidden">
        {/* Consolidated Hero Headline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151C28] border border-[#2A364F] text-sm font-medium text-[#CBD5E1] mb-4">
          <Swords className="w-4 h-4 text-[#F59E0B]" />
          <span>Real-Time Animal Combat Arena</span>
        </div>

        <div className="relative flex flex-col items-center">
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl uppercase tracking-tight text-[#F8FAFC]">
            PET <span className="text-[#F59E0B]">SLAM</span>
          </h1>
          <p className="mt-2 text-base sm:text-lg text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
            Turn your pet into an arena fighter. 60 FPS combat battles in your browser.
          </p>
        </div>

        {/* Consolidated Clean Active Champion Card */}
        <div className="mt-6 w-full max-w-sm bg-[#151C28] border border-[#2A364F] rounded-2xl p-4 flex items-center gap-4 text-left shadow-none transition-colors">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#2A364F] shrink-0 bg-[#0B0F17]">
            <img
              src={activeBeast.image}
              alt={activeBeast.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                Active Champion
              </span>
              <span className="text-xs font-medium text-[#94A3B8]">
                Lv. {activeBeast.level || 8}
              </span>
            </div>
            <div className="font-display font-bold text-lg text-[#F8FAFC] truncate">
              {activeBeast.name}
            </div>
            <div className="text-sm text-[#CBD5E1] truncate">
              {activeBeast.species}
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 text-sm font-semibold tabular-nums">
              <span className="text-[#10B981] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {activeBeast.health} HP
              </span>
              <span className="text-[#2A364F]">|</span>
              <span className="text-[#F43F5E] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> {activeBeast.damage} DMG
              </span>
              <span className="text-[#2A364F]">|</span>
              <span className="text-[#CBD5E1] font-normal flex items-center gap-1">
                <PawPrint className="w-3.5 h-3.5 text-[#F59E0B]" /> {pet.name}
              </span>
            </div>
          </div>
        </div>

        {/* Starting Action & Authentication Portal (Phase 1 Debloat) */}
        <div className="mt-6 w-full max-w-sm flex flex-col gap-3">
          {connectedAccount.isLoggedIn ? (
            <>
              {/* Authenticated Player Badge */}
              <div className="bg-[#151C28] border border-[#2A364F] rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[#94A3B8] text-sm">Logged in:</span>
                  <span className="font-bold text-[#F8FAFC] truncate">{trainerName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthOpen(true);
                  }}
                  className="text-xs text-[#F59E0B] hover:underline font-medium cursor-pointer ml-2 shrink-0"
                >
                  Switch
                </button>
              </div>

              {/* Direct Play Button */}
              <button
                onClick={handleStart}
                className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-lg text-[#0B0F17] bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#F8FAFC]"
              >
                <Play className="w-5 h-5 fill-[#0B0F17]" />
                <span>Enter Arena</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              {/* Primary CTA: Quick Play (Guest) */}
              <button
                type="button"
                onClick={handleGuestPlayDirect}
                className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-lg text-[#0B0F17] bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#F8FAFC]"
              >
                <Zap className="w-5 h-5 fill-[#0B0F17]" />
                <span>Quick Play (Guest)</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Secondary CTA: Sign in with Google */}
              <div className="w-full flex flex-col items-center justify-center">
                <div ref={titleGoogleBtnRef} className="flex justify-center min-h-[44px]" />
                {!gsiLoaded && (
                  <button
                    type="button"
                    onClick={handleGoogleSignInDirect}
                    className="w-full py-3 px-4 rounded-xl bg-[#151C28] hover:bg-[#1E2738] active:scale-[0.98] text-[#F8FAFC] border border-[#2A364F] font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition duration-150 cursor-pointer"
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

              {/* Custom Login ID / Password is hidden for MVP debloat */}
            </>
          )}

          {/* Clean Trainer Guide Button (Intro FX toggle removed) */}
          <div className="pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setGuideOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl font-display font-medium text-sm text-[#CBD5E1] hover:text-[#F8FAFC] bg-[#151C28] hover:bg-[#1E2738] border border-[#2A364F] transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
              <span>Trainer Guide</span>
            </button>
          </div>

          {/* Legal Terms & Policies with Accessible Contrast */}
          <div className="flex items-center justify-center gap-3 pt-2 text-sm text-[#94A3B8]">
            <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8FAFC] transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8FAFC] transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="/fair-play.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8FAFC] transition-colors">
              Fair Play
            </a>
          </div>
        </div>
      </main>

      {/* Cinematic Intro Animation Overlay */}
      {showIntroSplash && (
        <PetSlamIntroSplash onComplete={() => setShowIntroSplash(false)} />
      )}

      {/* Account Login Modal */}
      {authOpen && (
        <AccountAuthModal
          currentTrainerName={trainerName}
          onUpdateTrainerName={setTrainerName}
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={onEnterGame}
        />
      )}

      {/* Trainer Guide Modal */}
      <GameGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};
