import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import { GameTopBar } from '../game/GameTopBar';
import { DesktopNavRail, MainNavId } from './DesktopNavRail';
import { DesktopTelemetryDock } from './DesktopTelemetryDock';
import { MobileBottomDock } from './MobileBottomDock';
import { HeroLandingDrawer } from './HeroLandingDrawer';
import { FloatingPetOverlay } from '../game/pet/FloatingPetOverlay';
import { sound } from '../../utils/audio';
import { triggerVictoryExplosion } from '../../utils/confetti';

// Screens & Modals
import { ArenaScreen } from '../game/screens/ArenaScreen';
import { PetSanctuaryScreen } from '../game/screens/PetSanctuaryScreen';
import { BeastsScreen } from '../game/screens/BeastsScreen';
import { MarketScreen } from '../game/screens/MarketScreen';
import { ProfileScreen } from '../game/screens/ProfileScreen';
import { PetAvatarPhotoStudioModal } from '../game/pet/PetAvatarPhotoStudioModal';
import { PetAuctionHouseModal } from '../game/pet/PetAuctionHouseModal';
import { ExtensionExporterModal } from '../game/pet/ExtensionExporterModal';
import { FriendsHubModal, Friend } from '../game/FriendsHubModal';
import { FriendPartyLobbyModal } from '../game/FriendPartyLobbyModal';
import { friendNetwork, FriendLobbyItem, FriendRequestItem } from '../../services/friendNetworkService';
import { ReportBugModal } from '../modals/ReportBugModal';
import { VipPassesModal } from '../game/VipPassesModal';
import { SystemDiagnosticsModal } from '../diagnostic/SystemDiagnosticsModal';
import { RankedMatchmakingModal } from '../game/RankedMatchmakingModal';
import { BreedingLabModal } from '../game/pet/BreedingLabModal';
import { SlamBattlePassModal } from '../game/liveops/SlamBattlePassModal';
import { DailyQuestsDrawer } from '../game/liveops/DailyQuestsDrawer';
import { LeaderboardModal } from '../Leaderboards/LeaderboardModal';
import { PetWorldMapView } from '../game/pet/PetWorldMapView';
import { RotateCw, Smartphone, Sparkles } from 'lucide-react';

interface DualOrientationShellProps {
  onReturnToTitle?: () => void;
  onOpenSystemDetails?: () => void;
}

export const DualOrientationShell: React.FC<DualOrientationShellProps> = ({
  onReturnToTitle,
  onOpenSystemDetails,
}) => {
  const { soundEnabled, toggleSound, addCredits, playerTag, trainerName } = useGame();
  const { pet } = usePetCompanion();

  const [currentTab, setCurrentTab] = useState<MainNavId>('arena');
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
  const [showVipStore, setShowVipStore] = useState<boolean>(false);
  const [companionToast, setCompanionToast] = useState<string | null>(null);

  // Dedicated Modal States
  const [studioModalOpen, setStudioModalOpen] = useState<boolean>(false);
  const [auctionsModalOpen, setAuctionsModalOpen] = useState<boolean>(false);
  const [buddyModalOpen, setBuddyModalOpen] = useState<boolean>(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState<boolean>(false);
  const [friendsModalTab, setFriendsModalTab] = useState<'friends' | 'requests' | 'chat' | 'add'>('friends');
  const [incomingFriendRequest, setIncomingFriendRequest] = useState<FriendRequestItem | null>(null);
  const [friendAcceptedNotice, setFriendAcceptedNotice] = useState<FriendRequestItem | null>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState<boolean>(false);
  const [bugReportCategory, setBugReportCategory] = useState<'multiplayer' | 'matchmaking' | 'combat' | 'graphics' | 'audio' | 'account' | 'other'>('multiplayer');

  const [activePartyLobby, setActivePartyLobby] = useState<{
    roomCode?: string;
    friend?: Friend | { name: string; tag: string; beastName?: string };
    isHost?: boolean;
  } | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<FriendLobbyItem | null>(null);
  const [rankedModalOpen, setRankedModalOpen] = useState<boolean>(false);
  const [breedingModalOpen, setBreedingModalOpen] = useState<boolean>(false);
  const [passModalOpen, setPassModalOpen] = useState<boolean>(false);
  const [questsDrawerOpen, setQuestsDrawerOpen] = useState<boolean>(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState<boolean>(false);
  const [radarModalOpen, setRadarModalOpen] = useState<boolean>(false);

  // Real-time Social Party Invite Listener & Global Friends Trigger
  useEffect(() => {
    if (!playerTag) return;
    const unsub = friendNetwork.init(playerTag, {
      onIncomingRequest: (req) => {
        sound.playMatchFound();
        setIncomingFriendRequest(req);
      },
      onRequestAccepted: (req) => {
        sound.playLevelUp();
        setFriendAcceptedNotice(req);
      },
      onLobbyInvite: (lobby) => {
        sound.playMatchFound();
        setIncomingInvite(lobby);
      },
    });

    const handleOpenFriends = (e?: any) => {
      if (e?.detail?.tab) setFriendsModalTab(e.detail.tab);
      setFriendsModalOpen(true);
    };
    const handleOpenRanked = () => setRankedModalOpen(true);
    const handleOpenBugReport = (e?: any) => {
      if (e?.detail?.category) setBugReportCategory(e.detail.category);
      setIsBugReportOpen(true);
    };

    window.addEventListener('petslam:open-friends', handleOpenFriends);
    window.addEventListener('petslam:open-ranked-matchmaking', handleOpenRanked);
    window.addEventListener('petslam:open-bug-report', handleOpenBugReport);

    return () => {
      unsub();
      window.removeEventListener('petslam:open-friends', handleOpenFriends);
      window.removeEventListener('petslam:open-ranked-matchmaking', handleOpenRanked);
      window.removeEventListener('petslam:open-bug-report', handleOpenBugReport);
    };
  }, [playerTag, trainerName]);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Development-only Hotkey Listener (Ctrl + Shift + D / Cmd + Shift + D)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDiagnosticsOpen((prev) => !prev);
        sound.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Chrome Extension Companion Bridge (postMessage Handshake)
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'PET_SLAM_EXTENSION_HANDSHAKE' ||
        event.data?.type === 'PET_SLAM_BUDDY_CONNECTED'
      ) {
        const hasClaimed = localStorage.getItem('petslam_extension_linked') === 'true';
        if (!hasClaimed) {
          localStorage.setItem('petslam_extension_linked', 'true');
          addCredits(500);
          sound.playVictory();
          triggerVictoryExplosion();
          setCompanionToast('🎉 Companion Linked! +500 Slam Credits Awarded!');
          setTimeout(() => setCompanionToast(null), 5000);
        } else {
          sound.playClick();
          setCompanionToast('✓ Desktop Companion Synced!');
          setTimeout(() => setCompanionToast(null), 3000);
        }

        window.postMessage(
          {
            type: 'PET_SLAM_COMPANION_ACK',
            version: '2.0',
            pet,
            timestamp: Date.now(),
          },
          '*'
        );
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, [addCredits, pet]);

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
    if (tab === 'ranked') {
      setRankedModalOpen(true);
      return;
    }
    if (tab === 'genetics') {
      setBreedingModalOpen(true);
      return;
    }
    if (tab === 'pass') {
      setPassModalOpen(true);
      return;
    }
    if (tab === 'quests') {
      setQuestsDrawerOpen(true);
      return;
    }
    if (tab === 'leaderboard') {
      setLeaderboardModalOpen(true);
      return;
    }
    if (tab === 'radar') {
      setRadarModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleOpenSanctuary = () => {
    sound.playClick();
    setCurrentTab('sanctuary');
    setRadarModalOpen(false);
    setStudioModalOpen(false);
    setAuctionsModalOpen(false);
    setBuddyModalOpen(false);
    setFriendsModalOpen(false);
    setRankedModalOpen(false);
    setBreedingModalOpen(false);
    setPassModalOpen(false);
    setQuestsDrawerOpen(false);
    setLeaderboardModalOpen(false);
    setShowInfoDrawer(false);
  };

  useEffect(() => {
    const handleCustomNavigate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.tab === 'sanctuary') {
        handleOpenSanctuary();
      } else if (detail?.tab) {
        handleNavSelect(detail.tab);
      }
    };
    window.addEventListener('petslam:navigate', handleCustomNavigate);
    return () => window.removeEventListener('petslam:navigate', handleCustomNavigate);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-100 dark:bg-[#07090E] text-slate-900 dark:text-white flex overflow-hidden select-none transition-colors duration-300">
      {/* Floating Extension Companion Linked Toast */}
      {companionToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 text-white font-mono font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(0,229,255,0.6)] border-2 border-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CCFF00] animate-spin" />
            <span>{companionToast}</span>
          </div>
        </div>
      )}

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
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-slate-50 dark:bg-[#0B0E17] transition-colors duration-300">
        {/* Universal Top Bar */}
        <GameTopBar
          onOpenSystemDetails={onOpenSystemDetails || (() => setShowInfoDrawer(true))}
          onReturnToTitle={onReturnToTitle}
          onStartPracticeDrill={() => setCurrentTab('arena')}
          onOpenQuests={() => setQuestsDrawerOpen(true)}
          onOpenLeaderboard={() => setLeaderboardModalOpen(true)}
          onOpenRadar={() => setRadarModalOpen(true)}
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
        onOpenRanked={() => setRankedModalOpen(true)}
        onOpenBreeding={() => setBreedingModalOpen(true)}
        onOpenPass={() => setPassModalOpen(true)}
        onOpenQuests={() => setQuestsDrawerOpen(true)}
      />

      {/* 4. Mobile Bottom Navigation Dock (< 1024px) */}
      <MobileBottomDock currentTab={currentTab} onTabChange={handleNavSelect} />

      {/* 5. Modals & Hubs */}
      {/* Real-time Incoming Battle / Party Invite Notification Banner */}
      {incomingFriendRequest && (
        <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-center animate-in slide-in-from-top duration-300">
          <div className="bg-[#121824] border-2 border-emerald-400 rounded-2xl p-4 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-between gap-4 max-w-lg w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-black animate-bounce shrink-0">
                🐾
              </div>
              <div>
                <div className="font-display font-black text-sm text-white uppercase">
                  Friend Request from {incomingFriendRequest.sender_name}
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  Tag: <span className="text-[#CCFF00] font-bold">{incomingFriendRequest.sender_tag}</span> · Beast: {incomingFriendRequest.sender_beast || 'Companion'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  sound.playLevelUp();
                  await friendNetwork.acceptFriendRequest(
                    incomingFriendRequest,
                    playerTag,
                    trainerName || 'Trainer'
                  );
                  setIncomingFriendRequest(null);
                  setCompanionToast(`Added ${incomingFriendRequest.sender_tag} to your Friends Roster!`);
                  setTimeout(() => setCompanionToast(null), 3500);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-display font-black text-xs uppercase cursor-pointer shadow active:scale-95 transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  setFriendsModalTab('requests');
                  setFriendsModalOpen(true);
                  setIncomingFriendRequest(null);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
              >
                View
              </button>
              <button
                onClick={() => setIncomingFriendRequest(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {friendAcceptedNotice && (
        <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-center animate-in slide-in-from-top duration-300">
          <div className="bg-[#121824] border-2 border-[#CCFF00] rounded-2xl p-4 shadow-[0_0_40px_rgba(204,255,0,0.4)] flex items-center justify-between gap-4 max-w-lg w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 border border-[#CCFF00]/50 flex items-center justify-center text-[#CCFF00] font-black shrink-0">
                🎉
              </div>
              <div>
                <div className="font-display font-black text-sm text-white uppercase">
                  Friend Request Accepted!
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  <span className="text-[#CCFF00] font-bold">
                    {friendAcceptedNotice.receiver_tag || friendAcceptedNotice.sender_tag}
                  </span>{' '}
                  is now on your Friends roster!
                </div>
              </div>
            </div>

            <button
              onClick={() => setFriendAcceptedNotice(null)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real-time Incoming Battle / Party Invite Notification Banner */}
      {incomingInvite && (
        <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-center animate-in slide-in-from-top duration-300">
          <div className="bg-[#121824] border-2 border-[#CCFF00] rounded-2xl p-4 shadow-[0_0_40px_rgba(204,255,0,0.4)] flex items-center justify-between gap-4 max-w-lg w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 border border-[#CCFF00]/50 flex items-center justify-center text-[#CCFF00] font-black animate-pulse">
                ⚔️
              </div>
              <div>
                <div className="font-display font-black text-sm text-white uppercase">
                  Battle Invite from {incomingInvite.host_name}
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  Tag: <span className="text-[#CCFF00] font-bold">{incomingInvite.host_tag}</span> · Mode: {incomingInvite.mode.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playBattleStart();
                  setActivePartyLobby({
                    roomCode: incomingInvite.room_code,
                    isHost: false,
                    friend: {
                      name: incomingInvite.host_name,
                      tag: incomingInvite.host_tag,
                      beastName: incomingInvite.host_beast?.name,
                    },
                  });
                  setIncomingInvite(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#d8ff33] text-black font-display font-black text-xs uppercase cursor-pointer shadow active:scale-95 transition-all"
              >
                Join Party
              </button>
              <button
                onClick={() => setIncomingInvite(null)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

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
          initialTab={friendsModalTab}
          onClose={() => setFriendsModalOpen(false)}
          onChallengeFriend={(friend) => {
            setFriendsModalOpen(false);
            setActivePartyLobby({ isHost: true, friend });
          }}
        />
      )}
      {activePartyLobby && (
        <FriendPartyLobbyModal
          initialRoomCode={activePartyLobby.roomCode}
          initialFriend={activePartyLobby.friend}
          isHost={activePartyLobby.isHost}
          onClose={() => setActivePartyLobby(null)}
          onLaunchBattle={(_mode) => {
            setActivePartyLobby(null);
            setRankedModalOpen(true);
          }}
        />
      )}
      {showVipStore && (
        <VipPassesModal isOpen={showVipStore} onClose={() => setShowVipStore(false)} />
      )}
      {isDiagnosticsOpen && (
        <SystemDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      )}
      {isBugReportOpen && (
        <ReportBugModal
          isOpen={isBugReportOpen}
          onClose={() => setIsBugReportOpen(false)}
          defaultCategory={bugReportCategory}
        />
      )}
      {rankedModalOpen && (
        <RankedMatchmakingModal
          isOpen={rankedModalOpen}
          onClose={() => setRankedModalOpen(false)}
        />
      )}
      {breedingModalOpen && (
        <BreedingLabModal
          isOpen={breedingModalOpen}
          onClose={() => setBreedingModalOpen(false)}
        />
      )}
      {passModalOpen && (
        <SlamBattlePassModal
          isOpen={passModalOpen}
          onClose={() => setPassModalOpen(false)}
        />
      )}
      {questsDrawerOpen && (
        <DailyQuestsDrawer
          isOpen={questsDrawerOpen}
          onClose={() => setQuestsDrawerOpen(false)}
          onOpenPass={() => setPassModalOpen(true)}
        />
      )}
      {leaderboardModalOpen && (
        <LeaderboardModal
          isOpen={leaderboardModalOpen}
          onClose={() => setLeaderboardModalOpen(false)}
          onOpenUpload={() => setStudioModalOpen(true)}
        />
      )}
      {radarModalOpen && (
        <PetWorldMapView onClose={() => setRadarModalOpen(false)} />
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
      <FloatingPetOverlay onOpenSanctuary={handleOpenSanctuary} />
    </div>
  );
};
