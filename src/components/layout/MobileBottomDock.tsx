import React from 'react';
import { Swords, Heart, Camera, Gavel, PawPrint, Compass } from 'lucide-react';
import { sound } from '../../utils/audio';
import { MainNavId } from './DesktopNavRail';

interface MobileBottomDockProps {
  currentTab: MainNavId;
  onTabChange: (tab: MainNavId) => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'arena' as const, label: 'Arena', icon: Swords },
    { id: 'sanctuary' as const, label: 'Sanctuary', icon: Heart },
    { id: 'radar' as const, label: 'Map', icon: Compass },
    { id: 'studio' as const, label: 'Studio', icon: Camera },
    { id: 'auctions' as const, label: 'Auctions', icon: Gavel },
    { id: 'beasts' as const, label: 'Squad', icon: PawPrint },
  ];

  const handleSelect = (tab: MainNavId) => {
    sound.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/95 dark:bg-[#080C16]/98 backdrop-blur-2xl border-t border-slate-200 dark:border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] select-none px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-between transition-colors duration-300">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] px-0.5 py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isActive ? 'text-slate-900 dark:text-[#CCFF00]' : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {/* Active Pill Glow */}
            {isActive && (
              <div className="absolute -top-1 w-6 sm:w-8 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_10px_#CCFF00]" />
            )}

            <div
              className={`p-0.5 rounded-lg transition-transform duration-200 ${
                isActive ? 'scale-110 text-emerald-600 dark:text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <span
              className={`text-[9px] sm:text-[10px] font-mono uppercase leading-tight mt-0.5 truncate w-full text-center ${
                isActive ? 'text-slate-900 dark:text-white font-black tracking-wider' : 'text-slate-600 dark:text-slate-300 font-bold'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
