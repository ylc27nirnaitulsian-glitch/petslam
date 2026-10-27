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
  | 'multiplayer';

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
    { id: 'sanctuary' as const, label: 'Sanctuary', icon: Heart, badge: null },
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
    <aside className="hidden lg:flex flex-col w-[88px] xl:w-[230px] h-full bg-[#090D17]/98 backdrop-blur-xl border-r border-white/20 select-none z-30 shrink-0 transition-all duration-300 shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start px-3 xl:px-5 border-b border-white/15 gap-3 bg-slate-950/60">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#CCFF00] to-emerald-400 p-0.5 shadow-[0_0_18px_rgba(204,255,0,0.45)] shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[#06080D] rounded-[10px] flex items-center justify-center">
            <Swords className="w-5 h-5 text-[#CCFF00]" />
          </div>
        </div>
        <div className="hidden xl:flex flex-col leading-none">
          <span className="font-display font-black text-xl tracking-wider text-white uppercase flex items-center gap-1.5 drop-shadow-sm">
            PET SLAM
            <span className="text-[10px] font-mono font-black bg-[#CCFF00] text-black px-1.5 py-0.5 rounded-sm shadow-xs">2.0</span>
          </span>
          <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-widest mt-0.5">
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
                  ? 'bg-gradient-to-r from-[#CCFF00]/20 via-[#CCFF00]/10 to-transparent text-white border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent'
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
                    : 'bg-white/10 group-hover:bg-white/15 text-slate-100 group-hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`hidden xl:inline text-sm font-display uppercase tracking-wider font-extrabold truncate ${
                  isActive ? 'text-white' : 'text-slate-100 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`hidden xl:inline ml-auto text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                    item.badge === 'LIVE'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60 animate-pulse'
                      : item.badge === 'AI'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
                      : 'bg-[#CCFF00]/30 text-[#CCFF00] border border-[#CCFF00]/60'
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
      <div className="p-2.5 xl:p-3 border-t border-white/20 space-y-1.5 bg-[#070A12]/95">
        {/* Live Buddy Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            toggleOverlay();
          }}
          className={`w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-mono font-bold transition-all border ${
            isOverlayActive
              ? 'bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-white/10 border-white/15 text-slate-200 hover:text-white hover:bg-white/15'
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
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer text-xs font-mono font-semibold transition-colors border border-transparent hover:border-white/10"
          title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#CCFF00]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="hidden xl:inline text-xs">
            {soundEnabled ? 'Audio Live' : 'Muted'}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer text-xs font-mono font-semibold transition-colors border border-transparent hover:border-white/10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-cyan-300" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-300" />
          )}
          <span className="hidden xl:inline text-xs">
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
            className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 hover:text-white cursor-pointer text-xs font-mono font-bold transition-all border border-purple-400/40 active:scale-95 shadow-sm"
            title="System Diagnostics & Cloud Status (Ctrl+Shift+D)"
          >
            <Activity className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="hidden xl:inline text-xs font-black">
              Diagnostics
            </span>
          </button>
        )}

        {/* Showcase Drawer Button */}
        <button
          onClick={onOpenInfoDrawer}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2.5 xl:px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer text-xs font-mono font-bold transition-all border border-white/20 shadow-sm"
          title="Project Specs & Info Drawer"
        >
          <Info className="w-4 h-4 text-[#CCFF00]" />
          <span className="hidden xl:inline text-xs font-black text-white">
            Specs & Guide
          </span>
        </button>
      </div>
    </aside>
  );
};
