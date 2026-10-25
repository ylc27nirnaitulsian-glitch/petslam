import React, { useState, useEffect } from 'react';
import { Sparkles, Swords, Zap } from 'lucide-react';

interface PetSlamIntroSplashProps {
  onComplete: () => void;
}

// Synthesize a high-production Supercell / Clash Royale style intro fanfare via Web Audio API
const playIntroFanfare = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Sub-bass cinematic boom
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 1.2);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.5);

    // 2. High-voltage energetic chords (Supercell / Pet Slam signature fanfare)
    const notes = [
      { freq: 261.63, time: now + 0.05, dur: 0.35 },  // C4
      { freq: 392.00, time: now + 0.22, dur: 0.40 },  // G4
      { freq: 523.25, time: now + 0.45, dur: 0.50 },  // C5
      { freq: 659.25, time: now + 0.65, dur: 0.85 },  // E5
      { freq: 783.99, time: now + 0.65, dur: 0.95 },  // G5
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.28, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur + 0.1);
    });

    // 3. Shimmer laser sparkle
    const sparkOsc = ctx.createOscillator();
    const sparkGain = ctx.createGain();
    sparkOsc.type = 'sine';
    sparkOsc.frequency.setValueAtTime(1200, now + 0.6);
    sparkOsc.frequency.exponentialRampToValueAtTime(3200, now + 1.1);
    sparkGain.gain.setValueAtTime(0.12, now + 0.6);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    sparkOsc.connect(sparkGain);
    sparkGain.connect(ctx.destination);
    sparkOsc.start(now + 0.6);
    sparkOsc.stop(now + 1.4);
  } catch (e) {
    // Audio autoplay might be blocked before first user click; handled safely
  }
};

export const PetSlamIntroSplash: React.FC<PetSlamIntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Attempt audio on load
    playIntroFanfare();

    // Progress bar animation
    const timer1 = setTimeout(() => setProgress(65), 300);
    const timer2 = setTimeout(() => setProgress(100), 900);

    // Auto transition after 2.1 seconds
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 450);
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    playIntroFanfare();
    setIsFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[999] bg-[#07090F] flex flex-col items-center justify-between p-6 select-none cursor-pointer overflow-hidden transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Radial Glow & Animated Energy Rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00]/15 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-cyan-500/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b40_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* Top Studio Header */}
      <div className="relative z-10 pt-4 flex items-center gap-2 text-neutral-400 font-mono text-[11px] tracking-widest uppercase animate-in fade-in duration-700">
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
        <span>PET SLAM ENTERTAINMENT</span>
      </div>

      {/* Center Hero Logo Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto animate-in zoom-in-75 duration-700">
        {/* Neon Paw Emblem */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
          {/* Pulsing Outer Shockwave Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#CCFF00]/40 animate-ping duration-1000" />
          <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse" />

          {/* Core Dark Orb */}
          <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-3xl bg-gradient-to-br from-[#121828] to-[#0A0D16] border-2 border-[#CCFF00] shadow-[0_0_50px_rgba(204,255,0,0.45)] flex items-center justify-center">
            {/* SVG Official Paw Emblem */}
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 text-[#CCFF00] drop-shadow-[0_0_12px_#ccff00]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 14c-2.2 0-4 1.3-4 3 0 1.2.9 2.2 2.3 2.7.5.2 1.1.3 1.7.3s1.2-.1 1.7-.3c1.4-.5 2.3-1.5 2.3-2.7 0-1.7-1.8-3-4-3zm-6-2.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5S9.9 9 8.5 9 6 10.1 6 11.5zm9 0c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5zm-8-5C7 7.9 8.1 9 9.5 9S12 7.9 12 6.5 10.9 4 9.5 4 7 5.1 7 6.5zm5 0c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5S15.9 4 14.5 4 12 5.1 12 6.5z" />
            </svg>

            {/* Cyan Lightning Bolts */}
            <Zap className="absolute -top-3 -right-2 w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_#00e5ff] animate-bounce" />
          </div>
        </div>

        {/* Big Game Title */}
        <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
          PET <span className="text-[#CCFF00] drop-shadow-[0_0_40px_rgba(204,255,0,0.8)]">SLAM</span>
        </h1>

        {/* Laser Accent Bar */}
        <div className="w-48 sm:w-64 h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent my-2 shadow-[0_0_20px_#CCFF00]" />

        <p className="font-mono text-xs sm:text-sm text-neutral-300 uppercase tracking-widest mt-1">
          Real Dog & Cat Esports · Colosseum 1v1 Arena
        </p>
      </div>

      {/* Bottom Loading Progress Bar & Tap to Skip */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-2 pb-4">
        <div className="w-full bg-[#121624] h-1.5 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-[#CCFF00] rounded-full transition-all duration-700 shadow-[0_0_10px_#ccff00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[10px] font-mono text-neutral-400">
          <span className="flex items-center gap-1 text-[#CCFF00]">
            <Sparkles className="w-3 h-3 text-[#CCFF00] animate-spin" />
            <span>INITIALIZING COMBAT ENGINE</span>
          </span>
          <span>{progress}%</span>
        </div>

        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-2">
          Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
