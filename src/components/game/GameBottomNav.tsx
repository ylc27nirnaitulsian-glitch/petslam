import { Swords, PawPrint, ShoppingBag, Shield, User, Heart } from 'lucide-react';
import { sound } from '../../utils/audio';

export type GameTab = 'arena' | 'buddy' | 'beasts' | 'market' | 'armory' | 'profile';

interface GameBottomNavProps {
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
}

export const GameBottomNav: React.FC<GameBottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: GameTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'arena', label: 'Arena', icon: Swords },
    { id: 'buddy', label: 'Buddy', icon: Heart },
    { id: 'beasts', label: 'Beasts', icon: PawPrint },
    { id: 'market', label: 'Market', icon: ShoppingBag },
    { id: 'armory', label: 'Armory', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleSelect = (tab: GameTab) => {
    sound.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-[#0D111A]/95 backdrop-blur-md border-t border-white/10 shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[46px] min-h-[44px] py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-[#CCFF00] font-bold'
                : 'text-neutral-400 hover:text-white active:scale-95'
            }`}
          >
            {/* Active Top Bar */}
            {isActive && (
              <div className="absolute -top-1.5 w-6 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]" />
            )}

            <div
              className={`flex items-center justify-center w-6 h-6 transition-transform duration-200 ${
                isActive ? 'scale-110 text-[#CCFF00]' : 'text-neutral-500'
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <span
              className={`text-[10px] font-display uppercase tracking-wider font-bold mt-0.5 transition-colors ${
                isActive ? 'text-[#CCFF00]' : 'text-neutral-400'
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
