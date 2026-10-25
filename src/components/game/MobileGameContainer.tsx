import React, { useState } from 'react';
import { ArrowLeft, FileCode, Maximize2, Minimize2, Smartphone, Monitor } from 'lucide-react';
import { GameTopBar } from './GameTopBar';
import { GameBottomNav, GameTab } from './GameBottomNav';
import { ArenaScreen } from './screens/ArenaScreen';
import { BeastsScreen } from './screens/BeastsScreen';
import { PetSanctuaryScreen } from './screens/PetSanctuaryScreen';
import { MarketScreen } from './screens/MarketScreen';
import { ArmoryScreen } from './screens/ArmoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FloatingPetOverlay } from './pet/FloatingPetOverlay';
import { SystemRequiredDetailsPage } from '../SystemRequiredDetailsPage';
import { AlphaQueueModal } from './AlphaQueueModal';

interface MobileGameContainerProps {
  onReturnToTitle?: () => void;
}

export const MobileGameContainer: React.FC<MobileGameContainerProps> = ({ onReturnToTitle }) => {
  const [currentTab, setCurrentTab] = useState<GameTab>('arena');
  const [showSystemDetails, setShowSystemDetails] = useState<boolean>(false);
  const [showAlphaQueue, setShowAlphaQueue] = useState<boolean>(false);
  const [isWideView, setIsWideView] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen w-full bg-[#07090E] text-white flex flex-col items-center justify-center overflow-x-hidden select-none">
      {/* Ambient Colosseum Stadium Lights in Background (Desktop) */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden md:block">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b60_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Desktop Viewport Width Toggle Pill */}
      <div className="hidden md:flex fixed top-3 right-4 z-50 items-center gap-1.5 bg-[#141A28]/90 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md shadow-xl text-xs font-mono">
        <span className="text-neutral-400 text-[11px]">Display:</span>
        <button
          onClick={() => setIsWideView(false)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer transition-all ${
            !isWideView ? 'bg-[#CCFF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span>Mobile</span>
        </button>
        <button
          onClick={() => setIsWideView(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer transition-all ${
            isWideView ? 'bg-[#CCFF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Monitor className="w-3 h-3" />
          <span>Wide Arena</span>
        </button>
      </div>

      {/* Main Smartphone / Game Frame */}
      <div className={`relative z-10 w-full flex flex-col h-[100dvh] md:h-[min(94vh,890px)] ${
        isWideView ? 'md:max-w-3xl' : 'md:max-w-[440px]'
      } md:my-auto md:rounded-[36px] md:border-4 md:border-[#1E293B] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] bg-[#0B0E17] overflow-hidden transition-all duration-300`}>
        {showSystemDetails ? (
          /* System Required Details View */
          <div className="flex-1 flex flex-col h-full bg-[#0B0C10] overflow-y-auto">
            <div className="sticky top-0 z-40 bg-[#12141A] border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setShowSystemDetails(false)}
                className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#CCFF00] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Game</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
                <FileCode className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>System Required Details</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SystemRequiredDetailsPage
                onBackToLanding={() => setShowSystemDetails(false)}
                onJoinWaitlist={() => setShowAlphaQueue(true)}
              />
            </div>
          </div>
        ) : (
          /* Standard 5-Screen Mobile Game Experience */
          <>
            {/* Top Bar with Wallet & Status */}
            <GameTopBar
              onOpenSystemDetails={() => setShowSystemDetails(true)}
              onReturnToTitle={onReturnToTitle}
            />

            {/* Active Screen Display */}
            <main className="flex-1 overflow-hidden relative">
              {currentTab === 'arena' && <ArenaScreen />}
              {currentTab === 'buddy' && (
                <PetSanctuaryScreen onGoToArena={() => setCurrentTab('arena')} />
              )}
              {currentTab === 'beasts' && <BeastsScreen />}
              {currentTab === 'market' && <MarketScreen />}
              {currentTab === 'armory' && <ArmoryScreen />}
              {currentTab === 'profile' && (
                <ProfileScreen onOpenSystemDetails={() => setShowSystemDetails(true)} />
              )}
            </main>

            {/* Floating Desktop Screen Overlay Companion (roams on screen) */}
            {currentTab !== 'buddy' && (
              <FloatingPetOverlay onOpenSanctuary={() => setCurrentTab('buddy')} />
            )}

            {/* Fixed Bottom Navigation (Arena, Buddy, Beasts, Market, Armory, Profile) */}
            <GameBottomNav
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          </>
        )}
      </div>

      <AlphaQueueModal
        isOpen={showAlphaQueue}
        onClose={() => setShowAlphaQueue(false)}
      />
    </div>
  );
};
