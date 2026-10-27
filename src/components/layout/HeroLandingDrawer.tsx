import React from 'react';
import { X, Sparkles, Swords, Heart, Camera, Gavel, Tv, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/audio';

interface HeroLandingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterArena: () => void;
}

export const HeroLandingDrawer: React.FC<HeroLandingDrawerProps> = ({
  isOpen,
  onClose,
  onEnterArena,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#0C101A] border-l border-white/15 h-full overflow-y-auto p-5 sm:p-7 text-white flex flex-col justify-between shadow-2xl animate-slideLeft">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
              <span className="font-display font-black text-lg tracking-wider text-white uppercase">
                PET SLAM 2.0 Showcase & Guide
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Banner */}
          <div className="mt-5 p-5 rounded-3xl bg-gradient-to-br from-[#121828] via-[#0E1320] to-[#080B12] border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#CCFF00]/10 border border-[#CCFF00]/30 inline-block mb-2">
                Esports Animal Battling & Companion
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight">
                Own Your Beast. <br />
                <span className="text-[#CCFF00]">Rule the Arena.</span>
              </h2>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                PET SLAM bridges Tamagotchi-style pet care, real-world pet photo avatars, competitive 60 FPS combat battles, and an exportable desktop buddy companion.
              </p>

              <button
                onClick={() => {
                  sound.playVictory();
                  onClose();
                  onEnterArena();
                }}
                className="mt-4 px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#CCFF00]/20"
              >
                <span>Launch Ranked Arena Battle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feature Highlights Bento */}
          <div className="mt-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Core Systems
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs font-display uppercase">
                  <Swords className="w-4 h-4" />
                  <span>60 FPS Combat Engine</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Procedural physics fighting, hit-stop impacts, combo counters, and 3 distinct arena themes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-display uppercase">
                  <Camera className="w-4 h-4" />
                  <span>AI Pet Photo Studio</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Upload photos of your real dog or cat; Gemini extracts coat colors & generates an arena fighter.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-display uppercase">
                  <Gavel className="w-4 h-4" />
                  <span>Live Pet Auctions</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Bid and buyout pedigree pets with credits or USD via official Dodo Payments gateway.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs font-display uppercase">
                  <Tv className="w-4 h-4" />
                  <span>Chrome Extension Companion</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Export your active pet as a desktop buddy with battery charging reactions & voice mimicry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>petslam.app · Verified SSL</span>
          </div>
          <span>v2.0 Command Center</span>
        </div>
      </div>
    </div>
  );
};
