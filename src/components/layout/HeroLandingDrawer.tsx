import React from 'react';
import { X, Swords, Heart, Camera, Tv, ArrowRight, ShieldCheck } from 'lucide-react';
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
      <div className="w-full max-w-xl bg-[#0B0F17] border-l border-[#2A364F] h-full overflow-y-auto p-5 sm:p-7 text-[#F8FAFC] flex flex-col justify-between shadow-2xl animate-slideLeft">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#2A364F]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="font-display font-black text-lg tracking-wider text-[#F8FAFC] uppercase">
                PET SLAM 2.0 Showcase & Guide
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#2A364F] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Banner */}
          <div className="mt-5 p-5 rounded-2xl bg-[#151C28] border border-[#2A364F] relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#F59E0B] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30 inline-block mb-2">
                Tactical Animal Battling & Companion
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F8FAFC] leading-tight">
                Own Your Beast. <br />
                <span className="text-[#F59E0B]">Rule the Arena.</span>
              </h2>
              <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                PET SLAM bridges pet care, real-world pet photo avatars, competitive 60 FPS combat battles, and an exportable desktop buddy companion.
              </p>

              <button
                onClick={() => {
                  sound.playVictory();
                  onClose();
                  onEnterArena();
                }}
                className="mt-4 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <span>Launch Ranked Arena Battle</span>
                <ArrowRight className="w-4 h-4 text-[#0B0F17]" />
              </button>
            </div>
          </div>

          {/* Feature Highlights Bento */}
          <div className="mt-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Core Systems
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#151C28] border border-[#2A364F]">
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs font-display uppercase">
                  <Swords className="w-4 h-4" />
                  <span>60 FPS Combat Engine</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] mt-1 leading-snug">
                  Procedural physics fighting, hit-stop impacts, combo counters, and 3 distinct arena themes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#151C28] border border-[#2A364F]">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-xs font-display uppercase">
                  <Camera className="w-4 h-4" />
                  <span>AI Pet Photo Studio</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] mt-1 leading-snug">
                  Upload photos of your real dog or cat; Gemini extracts coat colors & generates an arena fighter.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#151C28] border border-[#2A364F]">
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs font-display uppercase">
                  <Heart className="w-4 h-4" />
                  <span>Sanctuary Pet Adoption</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] mt-1 leading-snug">
                  Adopt or re-home companion pets with 100% free earned in-game Slam Berries and Credits.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#151C28] border border-[#2A364F]">
                <div className="flex items-center gap-2 text-[#F43F5E] font-bold text-xs font-display uppercase">
                  <Tv className="w-4 h-4" />
                  <span>Chrome Extension Companion</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] mt-1 leading-snug">
                  Export your active pet as a desktop buddy with battery charging reactions & voice mimicry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[#2A364F] mt-6 flex items-center justify-between text-xs text-[#94A3B8] font-mono">
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span>petslam.app · Verified SSL</span>
          </div>
          <span>v2.0 Command Center</span>
        </div>
      </div>
    </div>
  );
};
