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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] select-none px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[46px] px-1 py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isActive ? 'text-[#CCFF00]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {/* Active Pill Glow */}
            {isActive && (
              <div className="absolute -top-1.5 w-6 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]" />
            )}

            <div
              className={`p-1 rounded-lg transition-transform duration-200 ${
                isActive ? 'scale-115 text-[#CCFF00]' : 'text-neutral-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span
              className={`text-[9px] font-mono font-bold tracking-tight uppercase leading-none mt-0.5 ${
                isActive ? 'text-white' : 'text-neutral-400'
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
