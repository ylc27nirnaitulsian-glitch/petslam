import React from 'react';
import {
  Swords,
  Heart,
  Camera,
  Gavel,
  Tv,
  PawPrint,
  ShoppingBag,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  Activity,
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
  | 'leaderboard';

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
  onOpenDiagnostics,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const { isOverlayActive, toggleOverlay } = usePetCompanion();

  const navItems = [
    { id: 'arena' as const, label: 'Arena', icon: Swords, badge: '60 FPS' },
    { id: 'ranked' as const, label: '1v1 Ranked', icon: Swords, badge: '20 TICK' },
    { id: 'leaderboard' as const, label: 'Hall of Fame', icon: Trophy, badge: 'CLOUT' },
    { id: 'sanctuary' as const, label: 'Sanctuary', icon: Heart, badge: null },
    { id: 'genetics' as const, label: 'Breeding Lab', icon: Dna, badge: 'GEN-2' },
    { id: 'pass' as const, label: 'Slam Pass', icon: Crown, badge: 'TIERS' },
    { id: 'quests' as const, label: 'Daily Quests', icon: Target, badge: '3 NEW' },
    { id: 'studio' as const, label: 'AI Studio', icon: Camera, badge: 'AI' },
    { id: 'auctions' as const, label: 'Auctions', icon: Gavel, badge: 'LIVE' },
    { id: 'extension' as const, label: 'Buddy Hub', icon: Tv, badge: 'NEW' },
    { id: 'beasts' as const, label: 'Squad Deck', icon: PawPrint, badge: null },
    { id: 'market' as const, label: 'Armory Shop', icon: ShoppingBag, badge: null },
    { id: 'multiplayer' as const, label: 'Multiplayer', icon: Users, badge: null },
  ];

  const handleSelect = (id: MainNavId) => {
    sound.playClick();
    onTabChange(id);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[88px] xl:w-[230px] h-full bg-white/95 dark:bg-[#090D17]/98 backdrop-blur-xl border-r border-slate-200 dark:border-white/20 select-none z-30 shrink-0 transition-all duration-300 shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start px-3 xl:px-5 border-b border-slate-200 dark:border-white/15 gap-3 bg-slate-100/80 dark:bg-slate-950/60">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#CCFF00] to-emerald-400 p-0.5 shadow-[0_0_18px_rgba(204,255,0,0.45)] shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <Swords className="w-5 h-5 text-[#CCFF00]" />
          </div>
        </div>
        <div className="hidden xl:flex flex-col leading-none">
          <span className="font-display font-black text-xl tracking-wider text-slate-900 dark:text-white uppercase flex items-center gap-1.5 drop-shadow-xs">
            PET SLAM
            <span className="text-xs font-mono font-black bg-[#CCFF00] text-black px-1.5 py-0.5 rounded-sm shadow-xs">2.0</span>
          </span>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest mt-0.5">
            Command Center
          </span>
        </div>
      </div>

      {/* Primary Navigation Rail */}
      <nav className="flex-1 overflow-y-auto py-3.5 px-2 xl:px-3 space-y-2 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full group relative flex items-center justify-center xl:justify-start gap-3.5 px-2.5 xl:px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#CCFF00]/25 via-[#CCFF00]/15 to-transparent text-slate-950 dark:text-white border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent'
              }`}
              title={item.label}
            >
              {/* Active neon spine indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#CCFF00] rounded-r-full shadow-[0_0_12px_#CCFF00]" />
              )}

              <div
                className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'bg-slate-200/80 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/15 text-slate-800 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`hidden xl:inline text-sm font-display uppercase tracking-wider font-extrabold truncate ${
                  isActive ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`hidden xl:inline ml-auto text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                    item.badge === 'LIVE'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-400/60 animate-pulse'
                      : item.badge === 'AI'
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-200 border border-cyan-400/60'
                      : 'bg-[#CCFF00]/30 text-lime-700 dark:text-[#CCFF00] border border-[#CCFF00]/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Controls */}
      <div className="p-2.5 xl:p-3 border-t border-slate-200 dark:border-white/20 space-y-1.5 bg-slate-50/95 dark:bg-[#070A12]/95">
        {/* Live Buddy Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            toggleOverlay();
          }}
          className={`w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-mono font-bold transition-all border ${
            isOverlayActive
              ? 'bg-cyan-100 dark:bg-cyan-950/90 border-2 border-cyan-500 dark:border-cyan-400 text-cyan-900 dark:text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/15'
          }`}
          title={isOverlayActive ? 'Companion Roaming Screen (Click to Dock)' : 'Summon Desktop Buddy on Screen'}
        >
          <span className="text-sm">🐾</span>
          <span className="hidden xl:inline text-xs font-black">
            {isOverlayActive ? 'Buddy Live 🟢' : 'Summon Buddy'}
          </span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer text-xs font-mono font-semibold transition-colors border border-transparent hover:border-slate-300 dark:hover:border-white/10"
          title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="hidden xl:inline text-xs font-medium">
            {soundEnabled ? 'Audio Live' : 'Muted'}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer text-xs font-mono font-semibold transition-colors border border-transparent hover:border-slate-300 dark:hover:border-white/10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          )}
          <span className="hidden xl:inline text-xs font-medium">
            {isFullscreen ? 'Windowed' : 'Fullscreen'}
          </span>
        </button>

        {/* System Diagnostics & Telemetry Modal */}
        {onOpenDiagnostics && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenDiagnostics();
            }}
            className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/35 text-purple-900 dark:text-purple-200 hover:text-purple-950 dark:hover:text-white cursor-pointer text-xs font-mono font-bold transition-all border border-purple-300 dark:border-purple-400/40 active:scale-95 shadow-xs"
            title="System Diagnostics & Cloud Status (Ctrl+Shift+D)"
          >
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-300 shrink-0" />
            <span className="hidden xl:inline text-xs font-black">
              Diagnostics
            </span>
          </button>
        )}

        {/* Showcase Drawer Button */}
        <button
          onClick={onOpenInfoDrawer}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white cursor-pointer text-xs font-mono font-bold transition-all border border-slate-300 dark:border-white/20 shadow-xs"
          title="Project Specs & Info Drawer"
        >
          <Info className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
          <span className="hidden xl:inline text-xs font-black text-slate-900 dark:text-white">
            Specs & Guide
          </span>
        </button>
      </div>
    </aside>
  );
};
