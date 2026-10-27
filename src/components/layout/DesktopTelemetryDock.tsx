import React from 'react';
import {
  Shield,
  Zap,
  Gavel,
  Tv,
  Sparkles,
  Crown,
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { Animal } from '../../data/animals';
import { getPetPhoto } from '../../utils/petVisuals';
import { sound } from '../../utils/audio';

interface DesktopTelemetryDockProps {
  onOpenAuctions: () => void;
  onOpenBuddyHub: () => void;
  onOpenVipStore: () => void;
  onOpenStudio: () => void;
}

export const DesktopTelemetryDock: React.FC<DesktopTelemetryDockProps> = ({
  onOpenAuctions,
  onOpenBuddyHub,
  onOpenVipStore,
  onOpenStudio,
}) => {
  const {
    ownedBeasts,
    battleDeckIds,
    activeBeast,
    selectActiveBeast,
    hasAuctionPass,
    hasAvatarStudioPass,
    hasExtensionPass,
  } = useGame();

  const { isOverlayActive, toggleOverlay, pet } = usePetCompanion();

  // Active squad beasts resolved from deck IDs
  const battleDeck: Animal[] = battleDeckIds
    .map((id) => ownedBeasts.find((b) => b.id === id))
    .filter((b): b is Animal => Boolean(b));

  // Simulated live auctions ticker
  const liveTickers = [
    { pet: 'Cyber Bengal Cat', bid: '1,850 CR', time: '2m left', rare: 'EPIC' },
    { pet: 'Apex Husky Alpha', bid: '$2.99 Buyout', time: '5m left', rare: 'LEGENDARY' },
    { pet: 'Titan Rottweiler', bid: '950 CR', time: '12m left', rare: 'RARE' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-[300px] h-full bg-[#0A0D14]/90 backdrop-blur-xl border-l border-white/10 select-none z-30 shrink-0 p-3.5 space-y-3.5 overflow-y-auto scrollbar-thin text-white">
      {/* Dock Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="font-display font-black text-xs uppercase tracking-wider text-white">
            Combat Telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          60 FPS LIVE
        </span>
      </div>

      {/* 1. Active Battle Deck (Squad Roster) */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#CCFF00]" />
            Active Squad Deck (4)
          </span>
          <span className="text-[10px] font-mono text-[#CCFF00]">Tag-In Ready</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {battleDeck.slice(0, 4).map((beast: Animal, idx: number) => {
            const isActive = activeBeast?.id === beast.id;
            const photo = getPetPhoto(beast);
            const cp = Math.round((beast.health || 800) * 0.8 + (beast.damage || 150) * 2.5);

            return (
              <button
                key={beast.id}
                onClick={() => {
                  sound.playClick();
                  selectActiveBeast(beast.id);
                }}
                className={`relative flex items-center gap-2 p-2 rounded-xl text-left border cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#CCFF00]/15 to-transparent border-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.25)]'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10">
                  <img src={photo} alt={beast.name} className="w-full h-full object-cover" />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#CCFF00]/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-display font-black uppercase text-white truncate">
                    {beast.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#CCFF00] font-bold">
                    CP {cp}
                  </div>
                </div>

                <span className="absolute top-1 right-1 text-[8px] font-mono text-neutral-500">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Desktop Companion Sync Status */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            Companion Buddy Bridge
          </span>
          <button
            onClick={onOpenBuddyHub}
            className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Hub <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {pet.name} ({pet.species})
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                {isOverlayActive ? '🟢 Roaming Screen' : '⚪ Asleep in Kennel'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              toggleOverlay();
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
              isOverlayActive
                ? 'bg-cyan-500 text-black shadow-xs font-black'
                : 'bg-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            {isOverlayActive ? 'Dock' : 'Summon'}
          </button>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            toggleOverlay();
          }}
          className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            isOverlayActive
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
              : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>🐾</span>
          <span>{isOverlayActive ? 'Buddy Roaming Active 🟢' : 'Preview Desktop Buddy on Screen'}</span>
        </button>
      </div>

      {/* 3. Live Auction House Ticker */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            Live Auction Stream
          </span>
          <button
            onClick={onOpenAuctions}
            className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Enter <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5">
          {liveTickers.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-[11px]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-white truncate max-w-[110px]">{item.pet}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-amber-300 font-bold">{item.bid}</span>
                <span className="text-[9px] font-mono text-neutral-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. VIP Genesis Store Promotion */}
      <div className="mt-auto pt-2">
        <button
          onClick={onOpenVipStore}
          className="w-full relative overflow-hidden group p-3 rounded-2xl bg-gradient-to-r from-fuchsia-600/20 via-pink-600/20 to-purple-600/20 border border-fuchsia-500/40 hover:border-fuchsia-400 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-fuchsia-500 text-white shadow-xs">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-display font-black text-xs uppercase text-white tracking-wider flex items-center gap-1">
                  Genesis VIP Passes
                  <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                </div>
                <div className="text-[10px] font-mono text-neutral-300">
                  Dodo Payments · Cards & Apple Pay
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-fuchsia-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </aside>
  );
};
