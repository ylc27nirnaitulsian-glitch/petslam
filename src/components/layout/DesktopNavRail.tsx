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
} from 'lucide-react';
import { sound } from '../../utils/audio';

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
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const DesktopNavRail: React.FC<DesktopNavRailProps> = ({
  currentTab,
  onTabChange,
  onOpenInfoDrawer,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
}) => {
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
    <aside className="hidden lg:flex flex-col w-[84px] xl:w-[220px] h-full bg-[#0A0D14]/90 backdrop-blur-xl border-r border-white/10 select-none z-30 shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start px-3 xl:px-5 border-b border-white/10 gap-2.5">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#CCFF00] to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(204,255,0,0.35)] shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
            <Swords className="w-5 h-5 text-[#CCFF00]" />
          </div>
        </div>
        <div className="hidden xl:flex flex-col leading-none">
          <span className="font-display font-black text-lg tracking-wider text-white uppercase flex items-center gap-1.5">
            PET SLAM
            <span className="text-[9px] font-mono font-bold bg-[#CCFF00] text-black px-1 rounded-sm">2.0</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
            Command Center
          </span>
        </div>
      </div>

      {/* Primary Navigation Rail */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 xl:px-3 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full group relative flex items-center justify-center xl:justify-start gap-3 px-2 xl:px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#CCFF00]/15 to-transparent text-[#CCFF00] border border-[#CCFF00]/40 shadow-[0_0_15px_rgba(204,255,0,0.12)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={item.label}
            >
              {/* Active neon spine indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#CCFF00] rounded-r-full shadow-[0_0_8px_#CCFF00]" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'bg-white/5 group-hover:bg-white/10 text-neutral-300 group-hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`hidden xl:inline text-xs font-display uppercase tracking-wider font-bold truncate ${
                  isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`hidden xl:inline ml-auto text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                    item.badge === 'LIVE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : item.badge === 'AI'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40'
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
      <div className="p-2 xl:p-3 border-t border-white/10 space-y-1 bg-[#090C12]/80">
        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2 xl:px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer text-xs font-mono transition-colors"
          title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#CCFF00]" />
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          )}
          <span className="hidden xl:inline text-[11px]">
            {soundEnabled ? 'Audio Live' : 'Muted'}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2 xl:px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer text-xs font-mono transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-neutral-400" />
          )}
          <span className="hidden xl:inline text-[11px]">
            {isFullscreen ? 'Windowed' : 'Fullscreen'}
          </span>
        </button>

        {/* Showcase Drawer Button */}
        <button
          onClick={onOpenInfoDrawer}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 px-2 xl:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer text-xs font-mono transition-all border border-white/5"
          title="Project Specs & Info Drawer"
        >
          <Info className="w-4 h-4 text-[#CCFF00]" />
          <span className="hidden xl:inline text-[11px] font-bold text-white">
            Specs & Guide
          </span>
        </button>
      </div>
    </aside>
  );
};
