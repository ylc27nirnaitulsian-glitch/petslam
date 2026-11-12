import React from 'react';
import { Swords, Heart, Camera, Home, PawPrint, Compass } from 'lucide-react';
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
    { id: 'studio' as const, label: 'Pet Camera', icon: Camera },
    { id: 'leaderboard' as const, label: 'Top 10', icon: Trophy },
  ];

  const handleSelect = (tab: MainNavId) => {
    sound.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-[#151C28]/95 backdrop-blur-xl border-t border-[#2A364F] select-none px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around transition-colors duration-150">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[50px] px-2 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isActive ? 'text-[#F8FAFC]' : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
            }`}
          >
            {/* Active Top Amber Strip */}
            {isActive && (
              <div className="absolute -top-2 w-8 h-1 bg-[#F59E0B] rounded-full" />
            )}

            <div
              className={`p-1 rounded-lg transition-transform duration-150 ${
                isActive ? 'scale-110 text-[#F59E0B]' : 'text-[#CBD5E1]'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span
              className={`text-sm font-display uppercase leading-tight mt-0.5 truncate w-full text-center ${
                isActive ? 'text-[#F8FAFC] font-extrabold tracking-wider' : 'text-[#CBD5E1] font-semibold'
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
