import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GameTopBar } from '../game/GameTopBar';
import { DesktopNavRail, MainNavId } from './DesktopNavRail';
import { DesktopTelemetryDock } from './DesktopTelemetryDock';
import { MobileBottomDock } from './MobileBottomDock';
import { HeroLandingDrawer } from './HeroLandingDrawer';
import { FloatingPetOverlay } from '../game/pet/FloatingPetOverlay';

// Screens & Modals
import { ArenaScreen } from '../game/screens/ArenaScreen';
import { PetSanctuaryScreen } from '../game/screens/PetSanctuaryScreen';
import { BeastsScreen } from '../game/screens/BeastsScreen';
import { MarketScreen } from '../game/screens/MarketScreen';
import { ProfileScreen } from '../game/screens/ProfileScreen';
import { PetAvatarPhotoStudioModal } from '../game/pet/PetAvatarPhotoStudioModal';
import { PetAuctionHouseModal } from '../game/pet/PetAuctionHouseModal';
import { ExtensionExporterModal } from '../game/pet/ExtensionExporterModal';
import { FriendsHubModal } from '../game/FriendsHubModal';
import { VipPassesModal } from '../game/VipPassesModal';
import { RotateCw, Smartphone } from 'lucide-react';

interface DualOrientationShellProps {
  onReturnToTitle?: () => void;
  onOpenSystemDetails?: () => void;
}

export const DualOrientationShell: React.FC<DualOrientationShellProps> = ({
  onReturnToTitle,
  onOpenSystemDetails,
}) => {
  const { soundEnabled, toggleSound } = useGame();

  const [currentTab, setCurrentTab] = useState<MainNavId>('arena');
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
  const [showVipStore, setShowVipStore] = useState<boolean>(false);

  // Dedicated Modal States
  const [studioModalOpen, setStudioModalOpen] = useState<boolean>(false);
  const [auctionsModalOpen, setAuctionsModalOpen] = useState<boolean>(false);
  const [buddyModalOpen, setBuddyModalOpen] = useState<boolean>(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState<boolean>(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Mobile Orientation Detection
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Route tab selections
  const handleNavSelect = (tab: MainNavId) => {
    if (tab === 'studio') {
      setStudioModalOpen(true);
      return;
    }
    if (tab === 'auctions') {
      setAuctionsModalOpen(true);
      return;
    }
    if (tab === 'extension') {
      setBuddyModalOpen(true);
      return;
    }
    if (tab === 'multiplayer') {
      setFriendsModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#07090E] text-white flex overflow-hidden select-none">
      {/* 1. Left Glassmorphic Rail (Desktop min-width: 1024px) */}
      <DesktopNavRail
        currentTab={currentTab}
        onTabChange={handleNavSelect}
        onOpenInfoDrawer={() => setShowInfoDrawer(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 2. Center Primary Viewport (Zero Page Scroll on Desktop, Safe Area on Mobile) */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#0B0E17]">
        {/* Universal Top Bar */}
        <GameTopBar
          onOpenSystemDetails={onOpenSystemDetails || (() => setShowInfoDrawer(true))}
          onReturnToTitle={onReturnToTitle}
        />

        {/* Mobile Orientation Suggestion Banner in Arena */}
        {currentTab === 'arena' && isPortrait && (
          <div className="lg:hidden bg-gradient-to-r from-cyan-950/90 via-black to-cyan-950/90 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 text-cyan-300 text-[11px]">
              <Smartphone className="w-3.5 h-3.5 animate-bounce" />
              <span>Tip: Rotate to Landscape for Wide Arena</span>
            </div>
            <button
              onClick={handleToggleFullscreen}
              className="px-2 py-0.5 rounded bg-cyan-400 text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Fullscreen</span>
            </button>
          </div>
        )}

        {/* Active Screen Frame */}
        <div className="flex-1 overflow-y-auto relative pb-[70px] lg:pb-0 scrollbar-thin">
          {currentTab === 'arena' && <ArenaScreen />}
          {currentTab === 'sanctuary' && (
            <PetSanctuaryScreen onGoToArena={() => setCurrentTab('arena')} />
          )}
          {currentTab === 'beasts' && <BeastsScreen />}
          {currentTab === 'market' && <MarketScreen />}
        </div>
      </main>

      {/* 3. Right Telemetry & Social Dock (Desktop min-width: 1280px) */}
      <DesktopTelemetryDock
        onOpenAuctions={() => setAuctionsModalOpen(true)}
        onOpenBuddyHub={() => setBuddyModalOpen(true)}
        onOpenVipStore={() => setShowVipStore(true)}
        onOpenStudio={() => setStudioModalOpen(true)}
      />

      {/* 4. Mobile Bottom Navigation Dock (< 1024px) */}
      <MobileBottomDock currentTab={currentTab} onTabChange={handleNavSelect} />

      {/* 5. Modals & Hubs */}
      {studioModalOpen && (
        <PetAvatarPhotoStudioModal onClose={() => setStudioModalOpen(false)} />
      )}
      {auctionsModalOpen && (
        <PetAuctionHouseModal onClose={() => setAuctionsModalOpen(false)} />
      )}
      {buddyModalOpen && (
        <ExtensionExporterModal onClose={() => setBuddyModalOpen(false)} />
      )}
      {friendsModalOpen && (
        <FriendsHubModal
          onClose={() => setFriendsModalOpen(false)}
          onChallengeFriend={() => setFriendsModalOpen(false)}
        />
      )}
      {showVipStore && (
        <VipPassesModal isOpen={showVipStore} onClose={() => setShowVipStore(false)} />
      )}

      {/* 6. High-Converting Hero/Landing Drawer */}
      <HeroLandingDrawer
        isOpen={showInfoDrawer}
        onClose={() => setShowInfoDrawer(false)}
        onEnterArena={() => {
          setCurrentTab('arena');
          setShowInfoDrawer(false);
        }}
      />

      {/* 7. Screen Companion Pet Overlay */}
      <FloatingPetOverlay />
    </div>
  );
};
