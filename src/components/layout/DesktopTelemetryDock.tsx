import React from 'react';
import {
  Shield,
  Zap,
  Home,
  Tv,
  ChevronRight,
  Download,
  PawPrint,
  Target,
  Swords,
  Users,
  Compass,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { Animal } from '../../data/animals';
import { getPetPhoto } from '../../utils/petVisuals';
import { sound } from '../../utils/audio';

interface DesktopTelemetryDockProps {
  onOpenAuctions: () => void;
  onOpenBuddyHub: () => void;
  onOpenStudio: () => void;
  onOpenRanked?: () => void;
  onOpenBreeding?: () => void;
  onOpenPass?: () => void;
  onOpenQuests?: () => void;
}

export const DesktopTelemetryDock: React.FC<DesktopTelemetryDockProps> = ({
  onOpenAuctions,
  onOpenBuddyHub,
  onOpenRanked,
  onOpenQuests,
}) => {
  const {
    ownedBeasts,
    battleDeckIds,
    activeBeast,
    selectActiveBeast,
  } = useGame();

  const { isOverlayActive, toggleOverlay, pet } = usePetCompanion();

  // Active squad beasts resolved from deck IDs
  const battleDeck: Animal[] = battleDeckIds
    .map((id) => ownedBeasts.find((b) => b.id === id))
    .filter((b): b is Animal => Boolean(b));

  // Simulated live sanctuary adoption ticker
  const liveTickers = [
    { pet: 'Cyber Bengal Cat', bid: '1,850 CR', time: '2m left', rare: 'EPIC' },
    { pet: 'Apex Husky Alpha', bid: '2,500 CR', time: '5m left', rare: 'LEGENDARY' },
    { pet: 'Titan Rottweiler', bid: '950 CR', time: '12m left', rare: 'RARE' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[320px] xl:w-[350px] h-full bg-white dark:bg-[#151C28] border-l border-slate-200 dark:border-[#2A364F] select-none z-30 shrink-0 p-4 space-y-3.5 overflow-y-auto scrollbar-thin text-slate-900 dark:text-[#F8FAFC]">
      {/* Dock Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A364F] pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="font-display font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC]">
            Live Squad & Telemetry
          </span>
        </div>
        <span className="text-xs font-mono text-[#10B981] font-bold bg-[#10B981]/15 border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          60 FPS
        </span>
      </div>

      {/* 1. PET EXTENSION & LIVE BUDDY BRIDGE */}
      <div className="bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-[#F59E0B]" />
            Pet Extension & Buddy Bridge
          </span>
          <button
            onClick={onOpenBuddyHub}
            className="text-xs font-mono font-bold text-[#F59E0B] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Hub <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-[#151C28] border border-[#2A364F] rounded-xl p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#F8FAFC] truncate">
                {pet.name} ({pet.species})
              </div>
              <div className="text-xs font-mono text-[#CBD5E1]">
                {isOverlayActive ? '🟢 Roaming Screen' : '⚪ Asleep in Kennel'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              toggleOverlay();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              isOverlayActive
                ? 'bg-[#10B981] text-[#0B0F17]'
                : 'bg-[#1E2738] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC]'
            }`}
          >
            {isOverlayActive ? 'Dock' : 'Summon'}
          </button>
        </div>

        {/* Primary CTA: Download Chrome Extension ZIP */}
        <button
          onClick={onOpenBuddyHub}
          className="w-full py-2.5 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Download className="w-4 h-4 text-[#0B0F17]" />
          <span>Export Pet Extension (ZIP)</span>
        </button>
      </div>

      {/* 2. SANCTUARY PET ADOPTION SHELTER (LIVE TICKER) */}
      <div className="bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
            <Home className="w-4 h-4 text-[#10B981]" />
            Pet Adoption Shelter
          </span>
          <button
            onClick={onOpenAuctions}
            className="text-xs font-mono font-bold text-[#F59E0B] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Enter <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {liveTickers.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#151C28] border border-[#2A364F] text-xs font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="font-bold text-[#F8FAFC] truncate max-w-[130px]">{item.pet}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#F59E0B] font-bold tabular-nums">{item.bid}</span>
                <span className="text-xs text-[#CBD5E1]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenAuctions}
          className="w-full py-2 px-3 rounded-xl bg-[#151C28] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC] font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Browse Adoption Shelter</span>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </button>
      </div>

      {/* 3. ACTIVE SQUAD DECK (TAG-IN SELECTION) */}
      <div className="bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            Active Squad Deck ({battleDeck.length}/4)
          </span>
          <span className="text-xs font-mono text-[#10B981] font-bold">Tag-In Active</span>
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
                className={`relative flex items-center gap-2 p-2 rounded-xl text-left border cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-[#151C28] border-2 border-[#F59E0B]'
                    : 'bg-[#151C28] border-[#2A364F] hover:border-[#3E4F6F]'
                }`}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#0B0F17] shrink-0 border border-[#2A364F]">
                  <img src={photo} alt={beast.name} className="w-full h-full object-cover" />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#F59E0B]/30 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-display font-bold uppercase text-[#F8FAFC] truncate">
                    {beast.name}
                  </div>
                  <div className="text-xs font-mono text-[#F59E0B] font-bold tabular-nums">
                    CP {cp}
                  </div>
                </div>

                <span className="absolute top-1 right-1 text-[9px] font-mono text-[#CBD5E1] font-bold">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DAILY QUESTS & QUICK CHALLENGES */}
      <div className="bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 space-y-2.5 shrink-0">
        <button
          onClick={onOpenQuests}
          className="w-full text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#F59E0B]" />
              Daily Challenges
            </span>
            <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/40 px-2 py-0.5 rounded-full">
              3 ACTIVE
            </span>
          </div>
          <div className="text-xs font-mono text-[#CBD5E1] mt-1 group-hover:text-[#F8FAFC]">
            Complete arena battles to earn XP & tokens
          </div>
        </button>

        <button
          onClick={onOpenQuests}
          className="w-full py-2 px-3 rounded-xl bg-[#151C28] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC] font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Open Mission Log</span>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </button>
      </div>

      {/* 5. MULTIPLAYER ROSTER & 1V1 QUEUE */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={onOpenRanked}
          className="p-3 rounded-xl bg-[#1E2738] border border-[#2A364F] hover:border-[#F59E0B] text-left transition-all cursor-pointer active:scale-95 group"
        >
          <div className="text-xs font-mono text-[#F59E0B] font-bold flex items-center justify-between">
            <span>NETCODE</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] uppercase mt-0.5 group-hover:text-[#F59E0B]">
            1v1 Ranked
          </div>
          <div className="text-xs font-mono text-[#CBD5E1]">Quick Queue</div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            window.dispatchEvent(new CustomEvent('petslam:open-friends'));
          }}
          className="p-3 rounded-xl bg-[#1E2738] border border-[#2A364F] hover:border-[#F59E0B] text-left transition-all cursor-pointer active:scale-95 group"
        >
          <div className="text-xs font-mono text-[#F59E0B] font-bold flex items-center justify-between">
            <span>SOCIAL</span>
            <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] uppercase mt-0.5 group-hover:text-[#F59E0B]">
            Friends Party
          </div>
          <div className="text-xs font-mono text-[#CBD5E1]">Lobby Invites</div>
        </button>
      </div>
    </aside>
  );
};
