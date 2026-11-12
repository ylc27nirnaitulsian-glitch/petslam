import React from 'react';
import {
  Swords,
  Heart,
  Camera,
  Home,
  Tv,
  PawPrint,
  ShoppingBag,
  Users,
  Compass,
  Maximize2,
  Minimize2,
  Info,
  Dna,
  Crown,
  Target,
  Trophy,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { usePetCompanion } from '../../context/PetCompanionContext';

export type MainNavId =
  | 'arena'
  | 'sanctuary'
  | 'studio'
  | 'auctions'
  | 'extension'
  | 'beasts'
  | 'market'
  | 'multiplayer'
  | 'ranked'
  | 'genetics'
  | 'pass'
  | 'quests'
  | 'leaderboard'
  | 'radar';

interface DesktopNavRailProps {
  currentTab: MainNavId;
  onTabChange: (tab: MainNavId) => void;
  onOpenInfoDrawer: () => void;
  onOpenDiagnostics?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const DesktopNavRail: React.FC<DesktopNavRailProps> = ({
  currentTab,
  onTabChange,
  onOpenInfoDrawer,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const { isOverlayActive, toggleOverlay } = usePetCompanion();

  // Equal tab split: 8 primary navigation items grouped into 3 tactical sections
  const navSections = [
    {
      title: 'Combat & Arena',
      items: [
        { id: 'arena' as const, label: 'Battle Arena', icon: Swords, badge: 'LIVE' },
        { id: 'ranked' as const, label: '1v1 Ranked', icon: Target, badge: 'PVP' },
        { id: 'leaderboard' as const, label: 'Top 10 Leaderboard', icon: Trophy, badge: 'TOP 10' },
      ],
    },
    {
      title: 'Progression & Lab',
      items: [
        { id: 'pass' as const, label: 'VIP Royal Pass', icon: Crown, badge: 'VIP' },
        { id: 'studio' as const, label: 'Pet Camera Studio', icon: Camera, badge: 'AI' },
        { id: 'genetics' as const, label: 'Breeding Lab', icon: Dna, badge: 'DNA' },
      ],
    },
    {
      title: 'Companions & World',
      items: [
        { id: 'sanctuary' as const, label: 'Pet Sanctuary', icon: Heart, badge: 'CARE' },
        { id: 'radar' as const, label: 'World Map Radar', icon: Compass, badge: 'MAP' },
      ],
    },
  ];

  const handleSelect = (id: MainNavId) => {
    sound.playClick();
    onTabChange(id);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[88px] xl:w-[275px] 2xl:w-[290px] h-full bg-[#151C28] border-r border-[#2A364F] select-none z-30 shrink-0 transition-all duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start px-3 xl:px-5 border-b border-[#2A364F] gap-3 bg-[#0B0F17] shrink-0">
        <div className="relative w-10 h-10 rounded-xl bg-[#1E2738] border border-[#2A364F] shrink-0 flex items-center justify-center">
          <Swords className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div className="hidden xl:flex flex-col leading-none min-w-0">
          <span className="font-display font-black text-xl tracking-wider text-[#F8FAFC] uppercase flex items-center gap-1.5 truncate">
            PET SLAM
            <span className="text-[10px] font-mono font-black bg-[#F59E0B] text-[#0B0F17] px-1.5 py-0.5 rounded-sm shrink-0">MVP</span>
          </span>
          <span className="text-xs font-mono text-[#94A3B8] font-bold uppercase tracking-widest mt-1 truncate">
            Tactical Battler
          </span>
        </div>
      </div>

      {/* Primary Navigation Rail (Balanced, Structured, No Void) */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 xl:px-3 space-y-4 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <div className="hidden xl:block px-3 pt-1 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full group relative flex items-center justify-center xl:justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1E2738] text-[#F8FAFC] border border-[#2A364F]'
                      : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738]/60 border border-transparent'
                  }`}
                  title={item.label}
                >
                  {/* Active amber indicator strip */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#F59E0B] rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-all duration-150 shrink-0 ${
                        isActive
                          ? 'bg-[#F59E0B] text-[#0B0F17]'
                          : 'bg-[#0B0F17] border border-[#2A364F] text-[#CBD5E1] group-hover:text-[#F8FAFC] group-hover:border-[#F59E0B]/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={`hidden xl:inline text-xs 2xl:text-sm font-display uppercase tracking-wider font-bold truncate ${
                        isActive ? 'text-[#F8FAFC]' : 'text-[#CBD5E1] group-hover:text-[#F8FAFC]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`hidden xl:inline-block shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        item.badge === 'VIP'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                          : item.badge === 'LIVE'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#0B0F17] border-[#2A364F] text-[#94A3B8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Utility Controls */}
      <div className="p-2.5 xl:p-3 border-t border-[#2A364F] space-y-2 bg-[#0B0F17] shrink-0">
        {/* Live Buddy Screen Companion Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            toggleOverlay();
          }}
          className={`w-full flex items-center justify-center xl:justify-start gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-mono font-bold transition-all border ${
            isOverlayActive
              ? 'bg-[#1E2738] border-[#10B981] text-[#10B981]'
              : 'bg-[#151C28] hover:bg-[#1E2738] border-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC]'
          }`}
          title={isOverlayActive ? 'Companion Roaming Screen (Click to Dock)' : 'Summon Screen Companion Buddy'}
        >
          <PawPrint className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span className="hidden xl:inline text-xs font-bold truncate">
            {isOverlayActive ? 'Buddy Live 🟢' : 'Summon Buddy'}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-3 py-2 rounded-xl text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738] cursor-pointer text-xs font-mono font-medium transition-colors border border-[#2A364F]"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
          ) : (
            <Maximize2 className="w-4 h-4 text-[#CBD5E1] shrink-0" />
          )}
          <span className="hidden xl:inline text-xs font-medium truncate">
            {isFullscreen ? 'Windowed' : 'Fullscreen'}
          </span>
        </button>

        {/* Specs & Trainer Guide */}
        <button
          onClick={onOpenInfoDrawer}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-3 py-2 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#F8FAFC] cursor-pointer text-xs font-mono font-bold transition-all border border-[#2A364F]"
          title="Project Specs & Trainer Guide"
        >
          <Info className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span className="hidden xl:inline text-xs font-bold text-[#F8FAFC] truncate">
            Trainer Guide
          </span>
        </button>
      </div>
    </aside>
  );
};
