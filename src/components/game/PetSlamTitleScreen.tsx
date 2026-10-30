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
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { animalImages } from '../../assets/images';
import { sound } from '../../utils/audio';
import { GameGuideModal } from './GameGuideModal';
import { AccountAuthModal } from './AccountAuthModal';
import { PetSlamIntroSplash } from './PetSlamIntroSplash';
import { signInWithGoogle, isSupabaseConfigured } from '../../services/supabaseClient';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setGlowPulse((prev) => !prev);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (!connectedAccount.isLoggedIn) {
      sound.playClick();
      setAuthOpen(true);
      return;
    }
    sound.playVictory();
    onEnterGame();
  };

  const handleGoogleSignInDirect = async () => {
    sound.playClick();
    if (isSupabaseConfigured) {
      const res = await signInWithGoogle();
      if (res?.error) {
        // Show auth modal with the real error message so user knows Google OAuth needs setup
        setAuthOpen(true);
      }
      // If enabled in Supabase, browser automatically redirects to accounts.google.com
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080B11] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Arena Image with Atmospheric Colosseum Darkness */}
      <div className="absolute inset-0 z-0">
        <img
          src={animalImages.arenaColosseum}
          alt="PET SLAM Championship Arena"
          className="w-full h-full object-cover opacity-35 scale-105 filter brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/70 to-[#080B11]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b50_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Ambient Neon Glow Flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* Clean Top Bar (No random developer junk) */}
      <header className="relative z-20 w-full px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between max-w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]" />
          <span className="font-display font-black text-xs sm:text-sm tracking-wider text-white uppercase">
            PET SLAM ARENA
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-sm"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#CCFF00]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            )}
          </button>

          {/* Account Login Option (Google Hub) */}
          <button
            onClick={() => {
              sound.playClick();
              setAuthOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer text-[11px] sm:text-xs font-mono backdrop-blur-md shadow-sm font-bold truncate max-w-[150px] sm:max-w-none"
          >
            <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#CCFF00] shrink-0" />
            <span className="truncate">{connectedAccount.isLoggedIn ? trainerName : 'Account Login'}</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-3 sm:px-4 text-center my-auto w-full max-w-full overflow-hidden">
        {/* Championship Tag */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-white/10 border border-[#CCFF00]/40 text-[10px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-[#CCFF00] mb-2 sm:mb-3 shadow-[0_0_20px_rgba(204,255,0,0.2)] max-w-[94vw] text-center">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#CCFF00] animate-spin shrink-0" />
          <span className="truncate">REAL-TIME ANIMAL COMBAT ARENA</span>
        </div>

        {/* Epic Title Display */}
        <div className="relative flex flex-col items-center">
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            PET <span className="text-[#CCFF00] drop-shadow-[0_0_35px_rgba(204,255,0,0.7)]">SLAM</span>
          </h1>

          {/* Dynamic Laser Accent Bar */}
          <div className="relative w-40 sm:w-72 h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent my-1.5 sm:my-2 shadow-[0_0_15px_#CCFF00]">
            <div
              className={`absolute inset-0 bg-white transition-opacity duration-700 ${
                glowPulse ? 'opacity-100' : 'opacity-30'
              }`}
            />
          </div>
        </div>

        {/* Guaranteed Crisp Active Beast Showcase Card */}
        <div className="mt-4 sm:mt-6 w-full max-w-xs bg-gradient-to-b from-[#131926]/95 to-[#0E121B]/95 border-2 border-[#CCFF00]/40 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#CCFF00] shadow-md shrink-0 bg-black">
            <img
              src={activeBeast.image}
              alt={activeBeast.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]" />
          </div>

          <div className="text-left min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold block">
              Active Champion
            </span>
            <div className="font-display font-black text-base text-white truncate">
              {activeBeast.name}
            </div>
            <div className="text-xs text-neutral-400 font-mono truncate">
              {activeBeast.species} · Lv. {activeBeast.level || 8}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400">
              <span>{activeBeast.health} HP</span>
              <span className="text-neutral-600">|</span>
              <span>{activeBeast.damage} DMG</span>
            </div>
          </div>
        </div>

        {/* Interactive 2D Companion Status Chip */}
        <div className="mt-2.5 w-full max-w-xs bg-black/60 border border-[#CCFF00]/25 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <span>🐾</span>
            <span className="font-bold text-white">{pet.name}</span>
            <span className="text-[10px] text-neutral-400 font-mono">({pet.species})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#CCFF00]">
            <span>Buddy Active</span>
            <span className="text-pink-400">{'❤️'.repeat(pet.affectionHearts)}</span>
          </div>
        </div>

        {/* Starting Action & Authentication Portal */}
        <div className="mt-4 w-full max-w-xs flex flex-col gap-2.5">
          {connectedAccount.isLoggedIn ? (
            <>
              {/* Authenticated Player Badge */}
              <div className="bg-black/60 border border-[#CCFF00]/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="text-neutral-400 font-mono text-[11px]">Logged in:</span>
                  <span className="font-bold text-white truncate">{trainerName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthOpen(true);
                  }}
                  className="text-[10px] text-[#CCFF00] underline font-mono hover:text-white cursor-pointer ml-1 shrink-0"
                >
                  Switch
                </button>
              </div>

              {/* Direct Play Button */}
              <button
                onClick={handleStart}
                className="group relative w-full py-3.5 px-6 rounded-2xl font-display font-black text-lg uppercase tracking-wider text-black bg-gradient-to-r from-[#CCFF00] to-[#A3E600] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_35px_rgba(204,255,0,0.5)] flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                <Play className="w-5 h-5 fill-black" />
                <span>ENTER ARENA</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <>
              {/* Option 1: Prominent Sign in with Google */}
              <button
                type="button"
                onClick={handleGoogleSignInDirect}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-[0_4px_20px_rgba(255,255,255,0.2)] cursor-pointer border border-neutral-300"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Option 2: Arena ID & Password */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAuthOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#131926] hover:bg-[#1c2436] border border-[#CCFF00]/50 text-[#CCFF00] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.15)] active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Create Login ID / Password</span>
              </button>

              {/* Instant Guest / Preview */}
              <button
                type="button"
                onClick={handleStart}
                className="text-[11px] font-mono text-neutral-400 hover:text-white transition cursor-pointer underline text-center pt-0.5"
              >
                Continue as Guest / Enter Directly →
              </button>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setGuideOpen(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-neutral-300 bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Guide</span>
            </button>
            <button
              onClick={() => {
                setShowIntroSplash(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 border border-[#CCFF00]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Intro FX</span>
            </button>
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
