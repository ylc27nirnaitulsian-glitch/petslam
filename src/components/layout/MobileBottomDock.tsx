import React from 'react';
import { Swords, Heart, Camera, Gavel, Tv, PawPrint } from 'lucide-react';
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
    { id: 'studio' as const, label: 'AI Studio', icon: Camera },
    { id: 'auctions' as const, label: 'Auctions', icon: Gavel },
    { id: 'extension' as const, label: 'Buddy', icon: Tv },
    { id: 'beasts' as const, label: 'Squad', icon: PawPrint },
  ];

  const handleSelect = (tab: MainNavId) => {
    sound.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C16]/98 backdrop-blur-2xl border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] select-none px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[50px] px-1 py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isActive ? 'text-[#CCFF00]' : 'text-slate-300 hover:text-white'
            }`}
          >
            {/* Active Pill Glow */}
            {isActive && (
              <div className="absolute -top-2 w-8 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_10px_#CCFF00]" />
            )}

            <div
              className={`p-1 rounded-lg transition-transform duration-200 ${
                isActive ? 'scale-115 text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : 'text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span
              className={`text-xs font-mono uppercase leading-none mt-1 ${
                isActive ? 'text-white font-black tracking-wider' : 'text-slate-300 font-bold'
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
