import React, { useState } from 'react';
import {
  X,
  Swords,
  Shield,
  Zap,
  Dumbbell,
  ShoppingCart,
  Trophy,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPracticeDrill?: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({
  isOpen,
  onClose,
  onStartPracticeDrill,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'combat' | 'training' | 'armory' | 'market' | 'ranking'>('roadmap');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-[#0F1117] border border-[#CCFF00]/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(204,255,0,0.15)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg uppercase tracking-wide text-white">
                PET SLAM · Trainer's Guide
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-mono">
                Master the Colosseum: Combat, Training, Armory & Auctions
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto py-2.5 border-b border-white/5 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('roadmap');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🗺️ Progression Map</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('combat');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'combat'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1. Arena Combat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('training');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'training'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>2. Beast Gym</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('armory');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'armory'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>3. Armory</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('market');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'market'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>4. Marketplace</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ranking');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ranking'
                ? 'bg-[#CCFF00] text-black shadow-md font-black'
                : 'bg-[#151822] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>5. Ranking</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs text-neutral-300">
          {/* TAB 0: 5-PHASE PROGRESSION ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              {/* Interactive Combat Drill Callout Card */}
              {onStartPracticeDrill && (
                <div className="bg-gradient-to-r from-amber-500/20 via-[#18233C] to-amber-500/20 border-2 border-[#CCFF00] rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#CCFF00] font-black text-xs uppercase">
                      <span>🥋</span>
                      <span>30-Second Combat Practice Drill</span>
                      <span className="bg-[#CCFF00] text-black px-1.5 py-0.2 rounded font-mono text-[9px] font-bold">
                        +250 CR
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      Practice Pounce [1], Iron Guard [3], PET SLAM [SPACE], and Tag-In [Q] in a real-time dojo!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClose();
                      onStartPracticeDrill();
                    }}
                    className="py-2 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-md shrink-0 active:scale-95"
                  >
                    Launch Drill 🥋
                  </button>
                </div>
              )}

              {/* Visual Progression Map Header */}
              <div className="bg-[#141722] border border-white/10 rounded-2xl p-3">
                <h3 className="font-display font-black text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                  <span>The 5-Step PET SLAM Journey</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  From real-world photo scanner to desktop screen companion:
                </p>
              </div>

              {/* 5 Progression Steps */}
              <div className="space-y-2">
                <div className="bg-[#161822] border border-cyan-500/30 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                    📸 1
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-xs">
                      Scan Real Pet Photo (AI Studio)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Snap or upload a photo of your dog or cat. Gemini AI analyzes breed, coat colors, and assigns competitive Combat Power stats.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-pink-500/30 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 font-black text-xs flex items-center justify-center shrink-0">
                    🏡 2
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-xs">
                      Train in Sanctuary & Conditioning Gym
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Feed treats, wash your pet, stroke affection, and train at the Gym for permanent HP, Speed, and Jaw Bite Force upgrades.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-[#CCFF00]/40 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 text-[#CCFF00] font-black text-xs flex items-center justify-center shrink-0">
                    ⚔️ 3
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-xs">
                      Ranked Battles in Colosseum Arena (1v1 & 2v2)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Climb the global esports ladder! Use Clash-style Elixir timing, dodge attacks, block with Iron Guard, and trigger 60 FPS Overdrive Slams.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-amber-500/30 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                    ⚖️ 4
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-xs">
                      Sanctuary Pet Adoption Shelter
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Adopt or sponsor sanctuary pets using earned in-game credits, or re-home your trained champions into other trainers' kennels.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-purple-500/30 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                    🖥️ 5
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-xs">
                      Export Desktop Buddy (Chrome Extension)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Export your exact active pet into a packaged browser companion that roams across your screen with voice repeater & posture alerts!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-3">
              <div className="bg-[#141722] border border-[#CCFF00]/20 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#CCFF00] font-black uppercase text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Manual Interactive Combat (No Auto-Play!)</span>
                </div>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  You are in complete tactical command! Your beast only strikes when you tap an ability card. Choose your moves wisely based on your stamina and opponent telegraphs:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#161822] border border-white/10 rounded-xl p-3">
                  <div className="font-display font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>1. Quick Jab (15 STM · 0.75s)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Low stamina, instantaneous snap strike. Builds your combo counter and charges 12% Ultimate meter!
                  </p>
                </div>

                <div className="bg-[#161822] border border-white/10 rounded-xl p-3">
                  <div className="font-display font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>2. Heavy Maul (30 STM · 1.8s)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Heavy kinetic attack utilizing jaw force & muscle weight. High critical strike multiplier!
                  </p>
                </div>

                <div className="bg-[#161822] border border-white/10 rounded-xl p-3">
                  <div className="font-display font-bold text-[#CCFF00] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                    <span>3. Signature Ability (40 STM)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Unique to each beast (e.g. Tiger Ambush, Wolf Frost Rush, Lion Sovereign Roar). Devastating burst damage!
                  </p>
                </div>

                <div className="bg-[#161822] border border-amber-500/30 rounded-xl p-3">
                  <div className="font-display font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Apex Finisher (100% Ult)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Charges as you land attacks and dodge. Once at 100%, unleash for an epic screen-shaking finisher move!
                  </p>
                </div>
              </div>

              <div className="bg-[#141A22] border border-cyan-500/30 rounded-2xl p-3">
                <div className="font-display font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Defensive Mastery: Dodge & Lock Guard</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                  When you see the red warning banner <strong className="text-yellow-300">INCOMING STRIKE!</strong>, tap <strong>Evasion Dodge</strong> to completely nullify the attack, or toggle <strong>Lock Guard</strong> to absorb 75% of incoming damage!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-3">
              <div className="bg-[#141722] border border-[#CCFF00]/20 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#CCFF00] font-black uppercase text-xs">
                  <Dumbbell className="w-4 h-4" />
                  <span>Permanent Beast Stat Progression</span>
                </div>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  Take any owned beast into the Conditioning Gym to permanently upgrade their combat attributes. Each workout costs 15 Energy and 800 Credits.
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-[#161822] border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                    +HP
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-emerald-300 text-xs">
                      1. Caloric Feed & Nutrition
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Gives <strong>+2 Endurance</strong> and increases your maximum arena hit points, allowing your beast to survive extended bouts.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-cyan-500/20 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
                    +SPD
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-cyan-300 text-xs">
                      2. Sprint & Reflex Drills
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Gives <strong>+2 Agility & +1 Speed</strong>. Improves your evasion window and quick strike recovery speed.
                    </p>
                  </div>
                </div>

                <div className="bg-[#161822] border border-[#CCFF00]/20 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0 font-bold">
                    +PSI
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[#CCFF00] text-xs">
                      3. Bite-Force & Strength Rig
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Gives <strong>+2 Strength & +15 PSI Jaw Pressure</strong>. Multiplies damage dealt on both basic attacks and heavy mauls!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'armory' && (
            <div className="space-y-3">
              <div className="bg-[#141722] border border-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-cyan-300 font-black uppercase text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Tactical Loadout Slots</span>
                </div>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  Your active beast can equip up to 4 pieces of tactical hardware:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#161822] border border-white/5">
                  <div className="font-bold text-white uppercase text-[10px] text-amber-400">
                    Tactical Collar
                  </div>
                  <div className="text-neutral-400 mt-0.5">Adds tracking speed & reaction.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161822] border border-white/5">
                  <div className="font-bold text-white uppercase text-[10px] text-cyan-400">
                    Body Exo-Rig
                  </div>
                  <div className="text-neutral-400 mt-0.5">Provides flat armor to deflect damage.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161822] border border-white/5">
                  <div className="font-bold text-white uppercase text-[10px] text-emerald-400">
                    Paw Grip Sleeves
                  </div>
                  <div className="text-neutral-400 mt-0.5">Enhances lateral traction & sprint.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161822] border border-white/5">
                  <div className="font-bold text-white uppercase text-[10px] text-[#CCFF00]">
                    Bio-Stim Serum
                  </div>
                  <div className="text-neutral-400 mt-0.5">Gives adrenaline burst & stamina buffs.</div>
                </div>
              </div>

              <div className="p-3 bg-[#121620] rounded-xl border border-white/10 text-neutral-300 text-[11px]">
                💡 <strong>Tip:</strong> Procure gear in the Armory Store using battle credits, then tap <strong>Equip</strong> in the Loadout tab to apply the stats directly to your active beast.
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-3">
              <div className="bg-[#141722] border border-amber-500/20 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Direct Market & Community Adoption Shelter</span>
                </div>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  Expand your roster across authentic real-world canine & feline breeds:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-[#161822] rounded-xl border border-white/5">
                  <div className="font-bold text-white text-xs">Direct Sanctuary Adoption</div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Instant adoption of available pets (Bengal Cats, Huskies, Shiba Inus, Rottweilers) using earned battle credits.
                  </p>
                </div>

                <div className="p-3 bg-[#161822] rounded-xl border border-white/5">
                  <div className="font-bold text-emerald-300 text-xs">Community Adoption Shelter</div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Sponsor and adopt companion pets with 100% free earned in-game credits from community trainers and sanctuary shelters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-3">
              <div className="bg-[#141722] border border-[#CCFF00]/20 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-[#CCFF00] font-black uppercase text-xs">
                  <Trophy className="w-4 h-4" />
                  <span>Championship MMR & Achievements</span>
                </div>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  Every victory in Ranked Arena bouts awards +45 MMR rating and bonus credits. Defeats cost -25 MMR.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-center font-mono">
                <div className="p-2.5 rounded-xl bg-[#161822] border border-white/5">
                  <div className="text-amber-400 font-bold">1,000 - 1,200 MMR</div>
                  <div className="text-neutral-400 text-[10px]">Challenger League</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161822] border border-cyan-500/30">
                  <div className="text-cyan-300 font-bold">1,200 - 1,500 MMR</div>
                  <div className="text-neutral-400 text-[10px]">Apex Vanguard</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161822] border border-[#CCFF00]/40 col-span-2">
                  <div className="text-[#CCFF00] font-black text-xs">1,500+ MMR · Grandmaster Sovereign</div>
                  <div className="text-neutral-400 text-[10px]">Top 10 Global Leaderboard Contender</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-400">
            Have fun and conquer the ring!
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600] transition-colors cursor-pointer shadow-lg shadow-[#CCFF00]/20"
          >
            Got it, Let's Fight!
          </button>
        </div>
      </div>
    </div>
  );
};
