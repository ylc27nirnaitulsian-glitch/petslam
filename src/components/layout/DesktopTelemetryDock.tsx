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
    <aside className="hidden xl:flex flex-col w-[320px] h-full bg-[#090D17]/98 backdrop-blur-xl border-l border-white/20 select-none z-30 shrink-0 p-4 space-y-4 overflow-y-auto scrollbar-thin text-white shadow-2xl">
      {/* Dock Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
          <span className="font-display font-black text-sm uppercase tracking-wider text-white">
            Combat Telemetry
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-300 font-black bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-0.5 rounded-full shadow-xs">
          60 FPS LIVE
        </span>
      </div>

      {/* 1. Active Battle Deck (Squad Roster) */}
      <div className="bg-[#0E1424] border border-white/15 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#CCFF00]" />
            Active Squad Deck (4)
          </span>
          <span className="text-xs font-mono text-[#CCFF00] font-bold">Tag-In Ready</span>
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
                className={`relative flex items-center gap-2 p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#CCFF00]/25 to-transparent border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/20">
                  <img src={photo} alt={beast.name} className="w-full h-full object-cover" />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#CCFF00]/30 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#CCFF00]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-display font-black uppercase text-white truncate">
                    {beast.name}
                  </div>
                  <div className="text-xs font-mono text-[#CCFF00] font-black">
                    CP {cp}
                  </div>
                </div>

                <span className="absolute top-1 right-1 text-[9px] font-mono text-slate-400 font-bold">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Desktop Companion Sync Status */}
      <div className="bg-[#0E1424] border border-white/15 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-cyan-400" />
            Companion Buddy Bridge
          </span>
          <button
            onClick={onOpenBuddyHub}
            className="text-xs font-mono font-bold text-cyan-300 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Hub <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-black/60 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {pet.name} ({pet.species})
              </div>
              <div className="text-xs font-mono text-cyan-300 font-semibold">
                {isOverlayActive ? '🟢 Roaming Screen' : '⚪ Asleep in Kennel'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              toggleOverlay();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black cursor-pointer transition-all ${
              isOverlayActive
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
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
          className={`w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-sm ${
            isOverlayActive
              ? 'bg-cyan-950/80 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
          }`}
        >
          <span className="text-sm">🐾</span>
          <span>{isOverlayActive ? 'Buddy Roaming Active 🟢' : 'Preview Desktop Buddy on Screen'}</span>
        </button>
      </div>

      {/* 3. Live Auction House Ticker */}
      <div className="bg-[#0E1424] border border-white/15 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-amber-400" />
            Live Auction Stream
          </span>
          <button
            onClick={onOpenAuctions}
            className="text-xs font-mono font-bold text-amber-300 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Enter <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {liveTickers.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="font-bold text-white truncate max-w-[120px]">{item.pet}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-amber-300 font-black">{item.bid}</span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. VIP Genesis Store Promotion */}
      <div className="mt-auto pt-2">
        <button
          onClick={onOpenVipStore}
          className="w-full relative overflow-hidden group p-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600/30 via-pink-600/30 to-purple-600/30 border-2 border-fuchsia-400/60 hover:border-fuchsia-300 cursor-pointer shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-fuchsia-500 text-white shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-1">
                  Genesis VIP Passes
                  <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
                <div className="text-xs font-mono text-slate-200 font-medium">
                  Dodo Payments · Cards & Apple Pay
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-fuchsia-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </aside>
  );
};
