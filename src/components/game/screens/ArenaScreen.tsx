import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Trophy,
  Crown,
  Sparkles,
  Users,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Heart,
  Volume2,
  AlertTriangle,
  Radio,
  Play,
  Check,
  Flag,
  Timer,
  PawPrint,
  Coins,
  Target,
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Animal, ANIMALS_DATA } from '../../../data/animals';
import { animalImages } from '../../../assets/images';
import { sound } from '../../../utils/audio';
import { getRarityBadgeClasses, mapBeastToSpecies, getPetPhoto } from '../../../utils/petVisuals';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { ProceduralPetCanvas } from '../pet/ProceduralPetCanvas';
import { PetBattleSceneCanvas, BattleAction, ArenaTheme } from '../arena/PetBattleSceneCanvas';
import { GladiatorVictoryCardModal } from '../arena/GladiatorVictoryCardModal';
import { OfflineDefenseModal } from '../arena/OfflineDefenseModal';
import { ghostDefenseService, OfflineDefenseReport } from '../../../services/ghostDefenseService';
import { triggerVictoryExplosion } from '../../../utils/confetti';
import { triggerHeavyImpactHaptic, triggerSuccessHaptic } from '../../../utils/haptics';
import {
  multiplayerBattleSync,
  BattlePlayerAction,
  BattleOpponentAction,
  BattleSyncState,
  BattleConclusion,
} from '../../../services/multiplayerBattleSync';

interface DamagePopup {
  id: number;
  text: string;
  type: 'player' | 'opponent' | 'crit' | 'block' | 'parry';
  x: number;
  y: number;
}

export const ArenaScreen: React.FC = () => {
  const {
    activeBeast,
    ownedBeasts,
    battleDeckIds,
    selectActiveBeast,
    recordMatchResult,
    trophies,
    addTrophies,
    credits,
    addCredits,
    trainerName,
    playerTag,
    playerLevel,
    equippedGear,
  } = useGame();
  const { pet } = usePetCompanion();

  // Filter only canine and feline challengers
  const eligibleChallengers = ANIMALS_DATA.filter(
    (b) => b.id !== activeBeast.id && (b.category === 'Canines' || b.category === 'Felines')
  );

  const [selectedOpponent, setSelectedOpponent] = useState<Animal>(
    eligibleChallengers[0] || ANIMALS_DATA[1]
  );
  const [opponentTrainer, setOpponentTrainer] = useState<string>('Trainer Axel');
  const [arenaTheme, setArenaTheme] = useState<ArenaTheme>('stadium');
  const [currentCanvasAction, setCurrentCanvasAction] = useState<BattleAction | null>(null);

  // Match State
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);
  const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleOver, setBattleOver] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [battleTimerSec, setBattleTimerSec] = useState<number>(180);

  // Active Combatants
  const [currentActiveFighter, setCurrentActiveFighter] = useState<Animal>(activeBeast);
  useEffect(() => {
    if (!inBattle) {
      setCurrentActiveFighter(activeBeast);
    }
  }, [activeBeast, inBattle]);

  useEffect(() => {
    const handleBeastChanged = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.id && !inBattle) {
        const found =
          ownedBeasts.find((b) => b.id === detail.id) ||
          ANIMALS_DATA.find((a) => a.id === detail.id);
        if (found) {
          setCurrentActiveFighter(found);
        }
      }
    };
    window.addEventListener('petslam:beast-changed', handleBeastChanged);
    return () => window.removeEventListener('petslam:beast-changed', handleBeastChanged);
  }, [ownedBeasts, inBattle]);

  // Battle HP & Stats
  const [playerHp, setPlayerHp] = useState<number>(1000);
  const [maxPlayerHp, setMaxPlayerHp] = useState<number>(1000);
  const [ghostPlayerHp, setGhostPlayerHp] = useState<number>(1000);
  const [opponentHp, setOpponentHp] = useState<number>(1000);
  const [maxOpponentHp, setMaxOpponentHp] = useState<number>(1000);
  const [ghostOpponentHp, setGhostOpponentHp] = useState<number>(1000);

  // Clash Royale Elixir System (0 to 10 Elixir, regenerating over time)
  const [elixir, setElixir] = useState<number>(4);
  const [opponentElixir, setOpponentElixir] = useState<number>(4);

  // Shields & Buffs
  const [isPlayerShielded, setIsPlayerShielded] = useState<boolean>(false);
  const [isOpponentShielded, setIsOpponentShielded] = useState<boolean>(false);

  // Visual Combat Animations ('idle' | 'clash' | 'hit' | 'slam')
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'clash' | 'hit' | 'slam'>('idle');
  const [opponentAnim, setOpponentAnim] = useState<'idle' | 'clash' | 'hit' | 'slam'>('idle');
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [opponentIntent, setOpponentIntent] = useState<string>('Charging Elixir...');
  const [lastCombatLog, setLastCombatLog] = useState<string>('⚔️ Clash Commenced!');
  const [activeSlashFx, setActiveSlashFx] = useState<{
    target: 'player' | 'opponent';
    type: 'claw' | 'slam' | 'sonic';
    id: number;
  } | null>(null);

  // 4-Pet Battle Deck
  const playerDeck = battleDeckIds
    .map((id) => ownedBeasts.find((b) => b.id === id))
    .filter((b): b is Animal => !!b);

  const safeDeck = playerDeck.length > 0 ? playerDeck : ownedBeasts.slice(0, 4);

  // 1v1 vs 2v2 Multiplayer Mode State
  const [battleMode, setBattleMode] = useState<'1v1' | '2v2'>('1v1');
  const [playerAlly, setPlayerAlly] = useState<Animal>(
    safeDeck[1] || eligibleChallengers[1] || ANIMALS_DATA[2]
  );
  const [opponentAlly, setOpponentAlly] = useState<Animal>(
    eligibleChallengers[1] || ANIMALS_DATA[3]
  );
  const [playerAllyHp, setPlayerAllyHp] = useState<number>(850);
  const [maxPlayerAllyHp, setMaxPlayerAllyHp] = useState<number>(850);
  const [opponentAllyHp, setOpponentAllyHp] = useState<number>(850);
  const [maxOpponentAllyHp, setMaxOpponentAllyHp] = useState<number>(850);

  // Esports Combo Counter & Announcer State
  const [comboCount, setComboCount] = useState<number>(0);
  const [comboLabel, setComboLabel] = useState<string>('');
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [announcerText, setAnnouncerText] = useState<string>('ROUND 1 — FIGHT!');
  const [announcerPulse, setAnnouncerPulse] = useState<boolean>(true);
  const [hasAnnouncedOverdrive, setHasAnnouncedOverdrive] = useState<boolean>(false);

  // Desktop Keyboard Hotkey Press State (for active visual feedback)
  const [pressedHotkey, setPressedHotkey] = useState<string | null>(null);

  // Synchronous combat state refs to prevent timer teardowns and stale closures
  const opponentElixirRef = useRef<number>(opponentElixir);
  opponentElixirRef.current = opponentElixir;

  const isOpponentShieldedRef = useRef<boolean>(isOpponentShielded);
  isOpponentShieldedRef.current = isOpponentShielded;

  const isPlayerShieldedRef = useRef<boolean>(isPlayerShielded);
  isPlayerShieldedRef.current = isPlayerShielded;

  const selectedOpponentRef = useRef<Animal>(selectedOpponent);
  selectedOpponentRef.current = selectedOpponent;

  const playerHpRef = useRef<number>(playerHp);
  playerHpRef.current = playerHp;

  const opponentHpRef = useRef<number>(opponentHp);
  opponentHpRef.current = opponentHp;

  const battleModeRef = useRef<'1v1' | '2v2'>(battleMode);
  battleModeRef.current = battleMode;

  const opponentAllyRef = useRef<Animal>(opponentAlly);
  opponentAllyRef.current = opponentAlly;

  const opponentAllyHpRef = useRef<number>(opponentAllyHp);
  opponentAllyHpRef.current = opponentAllyHp;

  const playerAllyHpRef = useRef<number>(playerAllyHp);
  playerAllyHpRef.current = playerAllyHp;

  // Active Parry & Counter Mechanics
  const [isParryWindowActive, setIsParryWindowActive] = useState<boolean>(false);
  const parryWindowActiveRef = useRef<boolean>(false);
  const isParriedRef = useRef<boolean>(false);
  const incomingOpponentAttackRef = useRef<{
    rawDmg: number;
    moveName: string;
    isUlt: boolean;
    targetWho: 'host' | 'partner';
    targetTag: string;
  } | null>(null);

  // Synchronous Match Conclusion Guard (prevents post-death race conditions)
  const battleOverRef = useRef<boolean>(false);

  // Gladiator Victory Card & Battle Match Stats
  const [matchParryCount, setMatchParryCount] = useState<number>(0);
  const [showVictoryCardModal, setShowVictoryCardModal] = useState<boolean>(false);

  // Offline Defense Meta & Sanctuary Raids
  const [offlineReport, setOfflineReport] = useState<OfflineDefenseReport | null>(null);

  useEffect(() => {
    const report = ghostDefenseService.checkOfflineDefenseRewards(currentActiveFighter);
    if (report) {
      setOfflineReport(report);
    }
  }, [currentActiveFighter]);

  const handleClaimOfflineReport = () => {
    if (!offlineReport) return;
    addTrophies(offlineReport.trophiesGained);
    addCredits(offlineReport.creditsGained);
    setOfflineReport(null);
  };

  // Real-time Multiplayer Party Battle State (2v2 Co-Op & 1v1 Friendly Duel)
  const [isMultiplayerBattle, setIsMultiplayerBattle] = useState<boolean>(false);
  const [isBattleHost, setIsBattleHost] = useState<boolean>(false);
  const [partyRoomCode, setPartyRoomCode] = useState<string | null>(null);
  const [partnerPlayer, setPartnerPlayer] = useState<any | null>(null);
  const [isPartySynced, setIsPartySynced] = useState<boolean>(false);

  const isMultiplayerBattleRef = useRef<boolean>(false);
  isMultiplayerBattleRef.current = isMultiplayerBattle;

  const isBattleHostRef = useRef<boolean>(false);
  isBattleHostRef.current = isBattleHost;

  const partnerPlayerRef = useRef<any | null>(null);
  partnerPlayerRef.current = partnerPlayer;

  // Cleanup multiplayer battle sync on component unmount
  useEffect(() => {
    return () => {
      multiplayerBattleSync.leaveBattle();
    };
  }, []);

  // 30-Second Interactive Combat Practice Drill State
  const [showTutorialPrompt, setShowTutorialPrompt] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('petslam_tutorial_completed') !== 'true';
  });
  const [isPracticeDrill, setIsPracticeDrill] = useState<boolean>(false);
  const [practiceStep, setPracticeStep] = useState<1 | 2 | 3 | 4 | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);

  // Start 30-Second Interactive Practice Drill
  const startPracticeDrill = () => {
    sound.playClick();
    setIsPracticeDrill(true);
    setPracticeStep(1);
    setPracticeCompleted(false);

    const baseDog = ANIMALS_DATA.find((b) => b.breed.toLowerCase().includes('shiba')) || ANIMALS_DATA[0];
    const senseiPet: Animal = {
      ...baseDog,
      id: 'sensei_shiba',
      name: 'Master Sensei Shib',
      health: 1500,
      damage: 40,
    };

    setSelectedOpponent(senseiPet);
    setOpponentTrainer('Master Sensei Shib');
    startSlamMatch(senseiPet);

    setLastCombatLog('🥋 DOJO STEP 1/4: Tap Quick Pounce [1] to strike!');
    setAnnouncerText('🥋 DOJO: STEP 1/4');
    setAnnouncerPulse(true);
  };

  const handleSkipTutorial = () => {
    sound.playClick();
    localStorage.setItem('petslam_tutorial_completed', 'true');
    setShowTutorialPrompt(false);
    if (isPracticeDrill) {
      setIsPracticeDrill(false);
      setInBattle(false);
    }
  };

  // Helper to spawn floating damage numbers
  const addPopup = (text: string, type: DamagePopup['type'], x: number, y: number) => {
    const id = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // Start Ranked Matchmaking Queue (Supports 1v1 and 2v2 Tag Team)
  const handleStartMatchmaking = (instant = false) => {
    sound.playClick();
    if (matchmakingTimerRef.current) {
      clearInterval(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    // Pick real asynchronous ghost defense build from community roster
    const ghost = ghostDefenseService.pickGhostOpponent(trophies, playerTag);
    const randomOpp1 = ghost.pet;
    const randomOpp2 =
      eligibleChallengers.find((b) => b.id !== randomOpp1.id) || eligibleChallengers[0];
    const allyFighter =
      safeDeck.find((b) => b.id !== currentActiveFighter.id) || eligibleChallengers[2];

    setSelectedOpponent(randomOpp1);
    setOpponentAlly(randomOpp2);
    setPlayerAlly(allyFighter);
    setOpponentTrainer(`${ghost.trainerName} ${ghost.playerTag}`);

    if (instant) {
      setIsMatchmaking(false);
      startSlamMatch(randomOpp1, randomOpp2, allyFighter);
      return;
    }

    setIsMatchmaking(true);
    setMatchCountdown(3);

    matchmakingTimerRef.current = setInterval(() => {
      setMatchCountdown((prev) => {
        if (prev <= 1) {
          if (matchmakingTimerRef.current) {
            clearInterval(matchmakingTimerRef.current);
            matchmakingTimerRef.current = null;
          }
          startSlamMatch(randomOpp1, randomOpp2, allyFighter);
          return 0;
        }
        sound.playBell();
        return prev - 1;
      });
    }, 900);
  };

  const handleCancelMatchmaking = () => {
    sound.playClick();
    if (matchmakingTimerRef.current) {
      clearInterval(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }
    setIsMatchmaking(false);
    setMatchCountdown(3);
  };

  useEffect(() => {
    return () => {
      if (matchmakingTimerRef.current) {
        clearInterval(matchmakingTimerRef.current);
        matchmakingTimerRef.current = null;
      }
    };
  }, []);

  // Initialize and launch match
  const startSlamMatch = (opp: Animal, oppAlly?: Animal, ally?: Animal) => {
    battleOverRef.current = false;
    setIsMatchmaking(false);
    setInBattle(true);
    setBattleOver(false);
    setBattleResult(null);
    setBattleTimerSec(180);
    setMatchParryCount(0);
    setShowVictoryCardModal(false);

    const pHp = Math.round(currentActiveFighter.health || 1000);
    const pDmg = Math.round(currentActiveFighter.damage || 200);

    // Dynamic competitive scaling: opponents possess 1.25x HP and 1.12x DMG
    // to provide an authentic esports challenge where players must time parries and defend!
    const breedHpRatio = (opp.health || 1000) / 1000;
    const breedDmgRatio = (opp.damage || 200) / 200;
    const oHp = Math.round(pHp * 1.25 * Math.max(0.95, Math.min(1.20, breedHpRatio)));
    const oDmg = Math.round(pDmg * 1.12 * Math.max(0.95, Math.min(1.20, breedDmgRatio)));

    const balancedOpp: Animal = {
      ...opp,
      health: oHp,
      damage: oDmg,
    };
    setSelectedOpponent(balancedOpp);
    selectedOpponentRef.current = balancedOpp;

    setPlayerHp(pHp);
    setMaxPlayerHp(pHp);
    setGhostPlayerHp(pHp);
    playerHpRef.current = pHp;

    setOpponentHp(oHp);
    setMaxOpponentHp(oHp);
    setGhostOpponentHp(oHp);
    opponentHpRef.current = oHp;

    if (battleMode === '2v2') {
      const aPet = ally || playerAlly;
      const oaPet = oppAlly || opponentAlly;
      const aHp = Math.round(aPet.health || 850);
      const oaHp = Math.round(oaPet.health || (pHp * 0.85));
      setPlayerAlly(aPet);
      setOpponentAlly(oaPet);
      opponentAllyRef.current = oaPet;
      setPlayerAllyHp(aHp);
      setMaxPlayerAllyHp(aHp);
      playerAllyHpRef.current = aHp;
      setOpponentAllyHp(oaHp);
      setMaxOpponentAllyHp(oaHp);
      opponentAllyHpRef.current = oaHp;
    }

    setElixir(5);
    setOpponentElixir(5);
    setIsPlayerShielded(false);
    setIsOpponentShielded(false);
    setOpponentIntent(battleMode === '2v2' ? '👥 Tag Team Syncing...' : '⚡ Preparing Pounce...');
    setLastCombatLog(
      battleMode === '2v2'
        ? `👥 2v2 Tag Team Commenced! ${currentActiveFighter.name} & ${(ally || playerAlly).name} vs ${opp.name} & ${(oppAlly || opponentAlly).name}!`
        : `⚔️ Battle Commenced! ${currentActiveFighter.name} vs ${opp.name}`
    );
    setActiveSlashFx(null);
    sound.playBattleStart();

    // Reset Esports Combo & Announcer Callout
    setComboCount(0);
    setComboLabel('');
    setHasAnnouncedOverdrive(false);
    setAnnouncerText('ROUND 1 — FIGHT!');
    setAnnouncerPulse(true);
    setTimeout(() => setAnnouncerPulse(false), 2400);
  };

  // Real-Time Multiplayer Network Handlers
  const handleReceivedPlayerAction = (action: BattlePlayerAction) => {
    if (action.senderTag.toUpperCase() === (playerTag || '').toUpperCase()) return;

    if (battleModeRef.current === '2v2') {
      // In 2v2: Partner executed an action against the opponents!
      setOpponentHp(action.newOpponentHp);
      opponentHpRef.current = action.newOpponentHp;
      setTimeout(() => setGhostOpponentHp(action.newOpponentHp), 350);

      if (action.newOpponentAllyHp !== undefined) {
        setOpponentAllyHp(action.newOpponentAllyHp);
        opponentAllyHpRef.current = action.newOpponentAllyHp;
      }

      if (action.cardType === 'shield') {
        sound.playBlock();
        addPopup('PARTNER GUARD!', 'block', 100, 240);
        setLastCombatLog(`🛡️ [Partner] ${action.senderName} raised Iron Guard!`);
        return;
      }

      setCurrentCanvasAction({
        id: Date.now(),
        attacker: 'player',
        type: action.cardType === 'tag' ? 'slam' : action.cardType,
        damage: action.damage,
        isCrit: action.isCrit,
        isBlocked: action.isBlocked,
      });

      sound.playImpact();
      setOpponentAnim('hit');
      addPopup(
        `PARTNER -${action.damage}!`,
        action.isCrit ? 'crit' : 'player',
        170 + Math.floor(Math.random() * 20 - 10),
        80 + Math.floor(Math.random() * 20 - 10)
      );
      setLastCombatLog(`🤝 [Partner] ${action.senderName}: ${action.log}`);

      setTimeout(() => {
        setOpponentAnim('idle');
      }, 400);

      if (action.newOpponentHp <= 0 && (!action.newOpponentAllyHp || action.newOpponentAllyHp <= 0)) {
        handleMatchConclusion(true);
      }
    } else {
      // In 1v1 Friendly Duel: Friend attacked you!
      const finalDmg = action.damage;
      const isBlocked = isPlayerShieldedRef.current;
      setCurrentCanvasAction({
        id: Date.now(),
        attacker: 'opponent',
        type: action.cardType === 'tag' ? 'slam' : action.cardType,
        damage: finalDmg,
        isCrit: action.isCrit,
        isBlocked,
      });

      if (isBlocked) {
        setIsPlayerShielded(false);
        isPlayerShieldedRef.current = false;
        sound.playBlock();
        addPopup('BLOCKED 60%!', 'block', 140, 220);
      } else {
        sound.playImpact();
      }

      setPlayerHp((prev) => {
        const next = Math.max(0, prev - finalDmg);
        playerHpRef.current = next;
        setTimeout(() => setGhostPlayerHp(next), 350);
        if (next === 0) handleMatchConclusion(false);
        return next;
      });

      setPlayerAnim('hit');
      setLastCombatLog(`⚔️ ${action.senderName} attacked you with ${action.cardType.toUpperCase()} (-${finalDmg} DMG)!`);

      setTimeout(() => {
        setPlayerAnim('idle');
      }, 400);
    }
  };

  const handleReceivedOpponentAction = (action: BattleOpponentAction) => {
    // Only non-host (guest) executes authoritative AI attacks broadcast by host
    if (isBattleHostRef.current) return;

    const isMeTarget = action.targetTag.toUpperCase() === (playerTag || '').toUpperCase();

    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'opponent',
      type: action.isUlt ? 'slam' : 'bite',
      damage: action.damage,
      isCrit: action.isUlt,
      isBlocked: action.isBlocked,
    });

    if (isMeTarget) {
      setPlayerHp(action.newPartnerHp);
      playerHpRef.current = action.newPartnerHp;
      setTimeout(() => setGhostPlayerHp(action.newPartnerHp), 350);

      setPlayerAnim('hit');
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 350);
      sound.playImpact();
      addPopup(`-${action.damage}!`, 'opponent', 140, 220);

      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 400);

      if (action.newPartnerHp <= 0 && action.newHostHp <= 0) {
        handleMatchConclusion(false);
      }
    } else {
      setPlayerAllyHp(action.newHostHp);
      playerAllyHpRef.current = action.newHostHp;

      sound.playImpact();
      addPopup(`ALLY -${action.damage}!`, 'opponent', 100, 240);

      setTimeout(() => {
        setOpponentAnim('idle');
      }, 400);

      if (action.newPartnerHp <= 0 && action.newHostHp <= 0) {
        handleMatchConclusion(false);
      }
    }

    setLastCombatLog(action.log);
  };

  const handleReceivedSyncState = (state: BattleSyncState) => {
    if (isBattleHostRef.current) return;
    setBattleTimerSec(state.timerSec);
    setOpponentHp(state.opponentHp);
    opponentHpRef.current = state.opponentHp;
    setOpponentAllyHp(state.opponentAllyHp);
    opponentAllyHpRef.current = state.opponentAllyHp;
    setPlayerAllyHp(state.hostHp);
    playerAllyHpRef.current = state.hostHp;
    setIsPartySynced(true);
  };

  const handleReceivedBattleConclusion = (conclusion: BattleConclusion) => {
    handleMatchConclusion(conclusion.won, true);
  };

  // Periodic State Sync Heartbeat from Host
  useEffect(() => {
    if (!inBattle || battleOver || !isMultiplayerBattle || !isBattleHost) return;

    const syncInterval = setInterval(() => {
      multiplayerBattleSync.sendSyncState({
        timerSec: battleTimerSec,
        opponentHp: opponentHpRef.current,
        opponentAllyHp: opponentAllyHpRef.current,
        hostHp: playerHpRef.current,
        partnerHp: playerAllyHpRef.current,
      });
    }, 2000);

    return () => clearInterval(syncInterval);
  }, [inBattle, battleOver, isMultiplayerBattle, isBattleHost, battleTimerSec]);

  // Listen for Battle Launch Requests (from Friend Party Lobby, Ranked Queue, or External triggers)
  useEffect(() => {
    const handleStartBattle = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      const mode: '1v1' | '2v2' = detail.mode === 'duel' || detail.mode === '1v1' ? '1v1' : '2v2';
      const partner = detail.partner;
      const roomCode = detail.roomCode;
      const isHost = detail.isHost ?? true;
      const customOpponents = detail.opponents as Animal[] | undefined;

      setBattleMode(mode);

      // Setup Real-time Multiplayer Party Battle Sync
      if (roomCode && partner) {
        setIsMultiplayerBattle(true);
        isMultiplayerBattleRef.current = true;
        setIsBattleHost(isHost);
        isBattleHostRef.current = isHost;
        setPartyRoomCode(roomCode);
        setPartnerPlayer(partner);
        partnerPlayerRef.current = partner;

        multiplayerBattleSync.initBattle(roomCode, playerTag, isHost, {
          onPlayerAction: (action) => handleReceivedPlayerAction(action),
          onOpponentAction: (action) => handleReceivedOpponentAction(action),
          onSyncState: (state) => handleReceivedSyncState(state),
          onBattleConclusion: (conclusion) => handleReceivedBattleConclusion(conclusion),
          onTacticalChat: (chat) => {
            setLastCombatLog(`💬 ${chat.senderName}: "${chat.phrase}"`);
            addPopup(chat.phrase, 'crit', 170, 120);
          },
        });
      } else {
        setIsMultiplayerBattle(false);
        isMultiplayerBattleRef.current = false;
        setIsBattleHost(true);
        isBattleHostRef.current = true;
        setPartyRoomCode(null);
        setPartnerPlayer(null);
        partnerPlayerRef.current = null;
      }

      // Determine Opponents: Use customOpponents from host so both screens have 100% IDENTICAL opponents!
      let randomOpp1: Animal;
      let randomOpp2: Animal;

      if (customOpponents && customOpponents.length >= 2) {
        randomOpp1 = customOpponents[0];
        randomOpp2 = customOpponents[1];
      } else if (customOpponents && customOpponents.length === 1) {
        randomOpp1 = customOpponents[0];
        randomOpp2 = eligibleChallengers.find((b) => b.id !== randomOpp1.id) || eligibleChallengers[0] || ANIMALS_DATA[2];
      } else {
        randomOpp1 = eligibleChallengers[Math.floor(Math.random() * eligibleChallengers.length)] || ANIMALS_DATA[1];
        randomOpp2 = eligibleChallengers.find((b) => b.id !== randomOpp1.id) || eligibleChallengers[0] || ANIMALS_DATA[2];
      }

      if (mode === '1v1') {
        if (partner) {
          const partnerPet = partner.beast || partner;
          const friendFighter: Animal = {
            ...randomOpp1,
            ...partnerPet,
            id: `friend_${partner.tag}`,
            name: partner.beastName || partnerPet.name || `${partner.name}'s Companion`,
            breed: partner.beastBreed || partnerPet.breed || 'Companion',
            image: partner.beastImage || partnerPet.image || randomOpp1.image,
            fallbackImage: partnerPet.fallbackImage || randomOpp1.fallbackImage,
            description: `Trained by ${partner.name} (${partner.tag}) for high-stakes friendly exhibition sparring.`,
            health: partnerPet.health || 1100,
            damage: partnerPet.damage || 210,
          };
          setSelectedOpponent(friendFighter);
          setOpponentTrainer(`${partner.name} (${partner.tag})`);
          setAnnouncerText(`⚔️ 1v1 FRIENDLY DUEL VS ${partner.name.toUpperCase()}!`);
          startSlamMatch(friendFighter);
        } else {
          setSelectedOpponent(randomOpp1);
          setOpponentTrainer('Trainer Axel (Bot)');
          setAnnouncerText('⚔️ 1v1 SPARRING DUEL — FIGHT!');
          startSlamMatch(randomOpp1);
        }
      } else {
        // 2v2 Tag Team Co-Op
        let allyFighter: Animal;
        if (partner) {
          const partnerPet = partner.beast || partner;
          allyFighter = {
            ...(safeDeck[1] || randomOpp2),
            ...partnerPet,
            id: `partner_${partner.tag}`,
            name: partner.beastName || partnerPet.name || `${partner.name}'s Partner`,
            breed: partner.beastBreed || partnerPet.breed || 'Companion',
            category: partnerPet.category || 'Canines',
            rarity: partnerPet.rarity || 'Epic',
            image: partner.beastImage || partnerPet.image || (safeDeck[1] ? safeDeck[1].image : randomOpp2.image),
            description: `Allied partner fighting alongside you from ${partner.tag}.`,
            health: partnerPet.health || 1050,
            damage: partnerPet.damage || 200,
          };
          setPlayerAlly(allyFighter);
          setAnnouncerText(`👥 2v2 TAG TEAM WITH ${partner.name.toUpperCase()}!`);
        } else {
          allyFighter = safeDeck.find((b) => b.id !== currentActiveFighter.id) || eligibleChallengers[2] || randomOpp2;
          setPlayerAlly(allyFighter);
          setAnnouncerText('👥 2v2 TAG TEAM (VS BOTS) — FIGHT!');
        }

        setSelectedOpponent(randomOpp1);
        setOpponentAlly(randomOpp2);
        setOpponentTrainer(
          customOpponents
            ? `Rival Duo: ${randomOpp1.name} & ${randomOpp2.name}`
            : 'Rival Duo: Master Vance & Maya'
        );
        startSlamMatch(randomOpp1, randomOpp2, allyFighter);
      }
    };

    const handleStartRankedQueue = () => {
      handleStartMatchmaking();
    };

    window.addEventListener('petslam:start-battle', handleStartBattle);
    window.addEventListener('petslam:start-ranked-queue', handleStartRankedQueue);

    return () => {
      window.removeEventListener('petslam:start-battle', handleStartBattle);
      window.removeEventListener('petslam:start-ranked-queue', handleStartRankedQueue);
    };
  }, [eligibleChallengers, safeDeck, currentActiveFighter]);

  // Match Countdown Timer (180s)
  useEffect(() => {
    if (!inBattle || battleOver) return;

    const interval = setInterval(() => {
      setBattleTimerSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Sudden death tie breaker: higher remaining HP % wins!
          const pPct = playerHp / maxPlayerHp;
          const oPct = opponentHp / maxOpponentHp;
          handleMatchConclusion(pPct >= oPct);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [inBattle, battleOver, playerHp, maxPlayerHp, opponentHp, maxOpponentHp]);

  // Real-time Elixir Generation Loop (Clash Royale Style)
  const isDoubleElixir = battleTimerSec <= 60;
  useEffect(() => {
    if (!inBattle || battleOver) return;

    // Double elixir during the last 60 seconds!
    const intervalRate = isDoubleElixir ? 250 : 450;

    const interval = setInterval(() => {
      setElixir((prev) => {
        const next = Math.min(10, Number((prev + 0.35).toFixed(1)));
        if (prev < 6 && next >= 6 && !hasAnnouncedOverdrive) {
          setHasAnnouncedOverdrive(true);
          setAnnouncerText('⚡ OVERDRIVE READY!');
          setAnnouncerPulse(true);
          setTimeout(() => setAnnouncerPulse(false), 2000);
        }
        return next;
      });
      setOpponentElixir((prev) => {
        const next = Math.min(10, Number((prev + 0.35).toFixed(1)));
        opponentElixirRef.current = next;
        return next;
      });
    }, intervalRate);

    return () => clearInterval(interval);
  }, [inBattle, battleOver, isDoubleElixir, hasAnnouncedOverdrive]);

  // AI Opponent Tactical Loop: Aggressive, competitive Grandmaster decision engine
  useEffect(() => {
    if (!inBattle || battleOver || isPracticeDrill) return;

    // Fast competitive cadence: 520ms normal, 340ms in double elixir
    const aiIntervalMs = isDoubleElixir ? 340 : 520;

    const aiInterval = setInterval(() => {
      if (battleOver || battleOverRef.current || playerHpRef.current <= 0 || isPracticeDrill) return;

      // In multiplayer battle with a friend, ONLY the HOST runs the enemy AI loop!
      if (isMultiplayerBattleRef.current && !isBattleHostRef.current) return;

      const curElixir = opponentElixirRef.current;
      const opp = selectedOpponentRef.current;
      const isPlayerShieldedNow = isPlayerShieldedRef.current;
      const isOppShieldedNow = isOpponentShieldedRef.current;
      const currentOppHp = opponentHpRef.current;
      const curPlayerHp = playerHpRef.current;

      // 2v2 Tag-Team: if lead opponent is critical (< 32% HP) and ally is healthy, tactical tag out!
      if (
        battleModeRef.current === '2v2' &&
        currentOppHp < maxOpponentHp * 0.32 &&
        opponentAllyHpRef.current > maxOpponentAllyHp * 0.35 &&
        Math.random() < 0.70
      ) {
        const currentLead = selectedOpponentRef.current;
        const partner = opponentAllyRef.current;
        setSelectedOpponent(partner);
        selectedOpponentRef.current = partner;
        setOpponentAlly(currentLead);
        opponentAllyRef.current = currentLead;

        const currentHp = opponentHpRef.current;
        const partnerHp = opponentAllyHpRef.current;
        setOpponentHp(partnerHp);
        opponentHpRef.current = partnerHp;
        setOpponentAllyHp(currentHp);
        opponentAllyHpRef.current = currentHp;

        setLastCombatLog(`🔁 Strategic Tag-in! ${partner.name} rushes to the frontline!`);
        sound.playCardPlay();
        return;
      }

      if (curElixir < 2) {
        setOpponentIntent('⚡ Charging Elixir...');
        return;
      }

      const aiRoll = Math.random();

      // STRATEGY A: LETHAL FINISHER (If player is under 38% HP, bot goes for the kill!)
      if (curPlayerHp < maxPlayerHp * 0.38 && !isPlayerShieldedNow) {
        if (curElixir >= 6) {
          const nextElixir = Math.max(0, Number((curElixir - 6).toFixed(1)));
          opponentElixirRef.current = nextElixir;
          setOpponentElixir(nextElixir);
          setOpponentIntent('🔥 LETHAL PET SLAM OVERDRIVE!');
          executeOpponentAttack(Math.round(opp.damage * 2.2), 'LETHAL OVERDRIVE!', true);
          return;
        }
        if (curElixir >= 4) {
          const nextElixir = Math.max(0, Number((curElixir - 4).toFixed(1)));
          opponentElixirRef.current = nextElixir;
          setOpponentElixir(nextElixir);
          setOpponentIntent('🐾 Lethal Bite Finisher!');
          executeOpponentAttack(Math.round(opp.damage * 1.45), 'Lethal Bite');
          return;
        }
      }

      // STRATEGY B: DEFENSIVE IRON GUARD (If bot HP < 60% and unshielded, or player has high energy)
      if (curElixir >= 2 && !isOppShieldedNow) {
        const shouldShield = (currentOppHp < maxOpponentHp * 0.60 && aiRoll < 0.65) || (elixir >= 6 && aiRoll < 0.60);
        if (shouldShield) {
          const nextElixir = Math.max(0, Number((curElixir - 2).toFixed(1)));
          opponentElixirRef.current = nextElixir;
          setOpponentElixir(nextElixir);
          setIsOpponentShielded(true);
          isOpponentShieldedRef.current = true;
          setOpponentIntent('🛡️ Iron Guard Active');
          sound.playBlock();
          setTimeout(() => {
            if (isOpponentShieldedRef.current) {
              setIsOpponentShielded(false);
              isOpponentShieldedRef.current = false;
            }
          }, 2400);
          return;
        }
      }

      // STRATEGY C: HEAVY BURST ULTIMATE (costs 6 elixir)
      if (curElixir >= 6 && (!isPlayerShieldedNow || curElixir >= 9)) {
        const nextElixir = Math.max(0, Number((curElixir - 6).toFixed(1)));
        opponentElixirRef.current = nextElixir;
        setOpponentElixir(nextElixir);
        setOpponentIntent('🔥 PET SLAM OVERDRIVE!');
        executeOpponentAttack(Math.round(opp.damage * 2.1), 'PET SLAM OVERDRIVE!', true);
        return;
      }

      // STRATEGY D: PUNISHING FIERCE BITE (costs 4 elixir)
      if (curElixir >= 4 && (!isPlayerShieldedNow || curElixir >= 7)) {
        const nextElixir = Math.max(0, Number((curElixir - 4).toFixed(1)));
        opponentElixirRef.current = nextElixir;
        setOpponentElixir(nextElixir);
        setOpponentIntent('🐾 Fierce Bite Strike');
        executeOpponentAttack(Math.round(opp.damage * 1.4), 'Fierce Bite');
        return;
      }

      // STRATEGY E: SONIC SHOCKWAVE / ROAR (costs 3 elixir)
      if (curElixir >= 3 && aiRoll < 0.75) {
        const nextElixir = Math.max(0, Number((curElixir - 3).toFixed(1)));
        opponentElixirRef.current = nextElixir;
        setOpponentElixir(nextElixir);
        setOpponentIntent('📢 Sonic Shockwave');
        executeOpponentAttack(Math.round(opp.damage * 1.1), 'Sonic Roar');
        return;
      }

      // STRATEGY F: RAPID POUNCE STRIKE (costs 2 elixir)
      if (curElixir >= 2) {
        const nextElixir = Math.max(0, Number((curElixir - 2).toFixed(1)));
        opponentElixirRef.current = nextElixir;
        setOpponentElixir(nextElixir);
        setOpponentIntent('⚡ Quick Pounce Strike');
        executeOpponentAttack(Math.round(opp.damage * 0.9), 'Quick Pounce');
        return;
      }
    }, aiIntervalMs);

    return () => clearInterval(aiInterval);
  }, [inBattle, battleOver, isPracticeDrill, isDoubleElixir, maxOpponentHp, maxOpponentAllyHp, maxPlayerHp, elixir]);

  // Execute Opponent Attack against Player or Partner
  const executeOpponentAttack = (rawDmg: number, moveName: string, isUlt = false) => {
    let targetWho: 'host' | 'partner' = 'host';
    let targetTag = playerTag;

    if (isMultiplayerBattleRef.current && battleModeRef.current === '2v2' && partnerPlayerRef.current) {
      // In 2v2 multiplayer, randomly target either host or partner
      const targetPartner = Math.random() < 0.5;
      targetWho = targetPartner ? 'partner' : 'host';
      targetTag = targetPartner ? partnerPlayerRef.current.tag : playerTag;
    }

    setOpponentAnim(isUlt ? 'slam' : 'clash');
    setLastCombatLog(`⚠️ ${selectedOpponentRef.current.name} launches ${moveName}!`);

    // Open active parry window for 360ms (500ms for ult)
    if (targetWho === 'host') {
      parryWindowActiveRef.current = true;
      setIsParryWindowActive(true);
      isParriedRef.current = false;
      incomingOpponentAttackRef.current = { rawDmg, moveName, isUlt, targetWho, targetTag };
    }

    const isBlocked = targetWho === 'host' ? isPlayerShieldedRef.current : false;
    const finalDamage = Math.round(isBlocked ? rawDmg * 0.4 : rawDmg);
    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'opponent',
      type: isUlt ? 'slam' : 'bite',
      damage: finalDamage,
      isCrit: isUlt,
      isBlocked: isBlocked,
    });

    const impactDelay = isUlt ? 550 : 340;

    setTimeout(() => {
      // Close active parry window
      parryWindowActiveRef.current = false;
      setIsParryWindowActive(false);

      // If attack was parried by player during the telegraph window:
      if (isParriedRef.current) {
        isParriedRef.current = false;
        incomingOpponentAttackRef.current = null;
        return;
      }

      incomingOpponentAttackRef.current = null;
      let nextHostHp = playerHpRef.current;
      let nextPartnerHp = playerAllyHpRef.current;

      if (targetWho === 'host') {
        if (isPlayerShieldedRef.current) {
          setIsPlayerShielded(false);
          isPlayerShieldedRef.current = false;
          addPopup('BLOCKED 60%!', 'block', 140, 220);
          sound.playBlock();
        } else {
          sound.playImpact();
          setComboCount(0);
          setComboLabel('');
        }

        nextHostHp = Math.max(0, playerHpRef.current - finalDamage);
        setPlayerHp(nextHostHp);
        playerHpRef.current = nextHostHp;
        setTimeout(() => setGhostPlayerHp(nextHostHp), 350);
        setPlayerAnim('hit');
      } else {
        // Target was partner
        sound.playImpact();
        nextPartnerHp = Math.max(0, playerAllyHpRef.current - finalDamage);
        setPlayerAllyHp(nextPartnerHp);
        playerAllyHpRef.current = nextPartnerHp;
        addPopup(`PARTNER -${finalDamage}!`, 'opponent', 100, 240);
      }

      setTimeout(() => {
        setOpponentAnim('idle');
        setPlayerAnim('idle');
      }, 400);

      // Broadcast to guest so guest's screen stays in exact lockstep!
      if (isMultiplayerBattleRef.current && isBattleHostRef.current) {
        multiplayerBattleSync.sendOpponentAction({
          attacker: 'opponent',
          target: targetWho,
          targetTag,
          moveName,
          damage: finalDamage,
          isUlt,
          newHostHp: nextHostHp,
          newPartnerHp: nextPartnerHp,
          isBlocked,
          log: `⚠️ ${selectedOpponentRef.current.name} hit ${
            targetWho === 'host' ? (trainerName || 'Host') : (partnerPlayerRef.current?.name || 'Partner')
          } with ${moveName} (-${finalDamage} DMG)!`,
        });
      }

      if (nextHostHp === 0 && (battleModeRef.current !== '2v2' || nextPartnerHp === 0)) {
        battleOverRef.current = true;
        handleMatchConclusion(false);
      }
    }, impactDelay);
  };

  // Player Plays an Action Card
  const handlePlayCard = (cardType: 'pounce' | 'bark' | 'shield' | 'bite' | 'slam') => {
    if (!inBattle || battleOver || battleOverRef.current || playerHpRef.current <= 0) return;

    const costs = { pounce: 2, bark: 3, shield: 2, bite: 4, slam: 6 };
    const cost = costs[cardType];

    if (elixir < cost) {
      sound.playClick();
      return;
    }

    // Immediately consume elixir for the executed card action
    setElixir((prev) => Math.max(0, Number((prev - cost).toFixed(1))));

    if (cardType === 'shield') {
      // ⚡ ACTIVE PERFECT PARRY (Timing window deflection + riposte)
      if (parryWindowActiveRef.current && incomingOpponentAttackRef.current?.targetWho === 'host') {
        const incoming = incomingOpponentAttackRef.current;
        isParriedRef.current = true;
        parryWindowActiveRef.current = false;
        setIsParryWindowActive(false);

        // Tactile Haptic feedback on mobile devices
        triggerHeavyImpactHaptic();

        // Visceral Metallic Parry Clank
        sound.playParry();
        setMatchParryCount((prev) => prev + 1);

        // Energy Surge: Full refund of the 2 shield cost + 1 bonus Elixir surge!
        setElixir((prev) => Math.min(10, Number((prev + cost + 1).toFixed(1))));

        // Counter Riposte Damage (65% of attack or 75 base DMG)
        const counterDmg = Math.round(incoming.rawDmg * 0.65) || 75;

        // Apply counter damage to opponent
        setOpponentHp((prev) => {
          if (battleOverRef.current || playerHpRef.current <= 0) return prev;
          const next = Math.max(0, prev - counterDmg);
          opponentHpRef.current = next;
          setTimeout(() => setGhostOpponentHp(next), 350);
          if (next === 0 && (battleModeRef.current !== '2v2' || opponentAllyHpRef.current === 0)) {
            if (!battleOverRef.current && playerHpRef.current > 0) {
              battleOverRef.current = true;
              handleMatchConclusion(true);
            }
          }
          return next;
        });

        addPopup('⚡ PERFECT PARRY! +1 ENERGY', 'parry', 135, 190);
        addPopup(`💥 RIPOSTE -${counterDmg}!`, 'crit', 170, 80);
        setLastCombatLog(
          `⚡ ${currentActiveFighter.name} PERFECT PARRIED ${incoming.moveName} & riposted for ${counterDmg} DMG! (+1 Energy)`
        );
        setOpponentAnim('hit');
        setTimeout(() => setOpponentAnim('idle'), 400);

        setCurrentCanvasAction({
          id: Date.now(),
          attacker: 'opponent',
          type: incoming.isUlt ? 'slam' : 'bite',
          damage: 0,
          isCrit: false,
          isBlocked: false,
          isParried: true,
          counterDamage: counterDmg,
        });

        if (isMultiplayerBattleRef.current) {
          multiplayerBattleSync.sendPlayerAction({
            senderTag: playerTag,
            senderName: trainerName || 'Trainer',
            cardType: 'shield',
            target: 'opponent',
            damage: counterDmg,
            isCrit: true,
            isBlocked: false,
            isParried: true,
            counterDamage: counterDmg,
            newOpponentHp: opponentHpRef.current,
            newOpponentAllyHp: opponentAllyHpRef.current,
            log: `⚡ ${currentActiveFighter.name} performed a PERFECT PARRY on ${incoming.moveName}!`,
          });
        }

        if (isPracticeDrill && practiceStep === 2) {
          setTimeout(() => {
            setPracticeStep(3);
            sound.playBell();
            setElixir(6);
            setLastCombatLog('🥋 DOJO STEP 3/4: Energy Maxed! Unleash PET SLAM Overdrive [SPACE]!');
            setAnnouncerText('🥋 DOJO: STEP 3/4');
            setAnnouncerPulse(true);
          }, 600);
        }

        return;
      }

      // Normal passive Iron Guard
      setIsPlayerShielded(true);
      isPlayerShieldedRef.current = true;
      sound.playCardPlay();
      addPopup('SHIELD READY!', 'block', 140, 220);
      setLastCombatLog(`🛡️ ${currentActiveFighter.name} raised Iron Guard!`);
      setCurrentCanvasAction({
        id: Date.now(),
        attacker: 'player',
        type: 'shield',
        damage: 0,
        isCrit: false,
        isBlocked: false,
      });

      if (isMultiplayerBattleRef.current) {
        multiplayerBattleSync.sendPlayerAction({
          senderTag: playerTag,
          senderName: trainerName || 'Trainer',
          cardType: 'shield',
          target: 'opponent',
          damage: 0,
          isCrit: false,
          isBlocked: false,
          newOpponentHp: opponentHpRef.current,
          newOpponentAllyHp: opponentAllyHpRef.current,
          log: `${currentActiveFighter.name} raised Iron Guard!`,
        });
      }

      if (isPracticeDrill && practiceStep === 2) {
        setTimeout(() => {
          setPracticeStep(3);
          sound.playBell();
          setElixir(6); // Maximize energy immediately for Overdrive!
          setLastCombatLog('🥋 DOJO STEP 3/4: Energy Maxed! Unleash PET SLAM Overdrive [SPACE]!');
          setAnnouncerText('🥋 DOJO: STEP 3/4');
          setAnnouncerPulse(true);
        }, 600);
      }
      return;
    }

    // Offensive moves
    setPlayerAnim(cardType === 'slam' ? 'slam' : 'clash');
    const moveNames = {
      pounce: 'Quick Pounce',
      bark: 'Sonic Roar',
      bite: 'Fierce Bite',
      slam: '🌟 PET SLAM OVERDRIVE',
    };
    setLastCombatLog(`⚡ ${currentActiveFighter.name} used ${moveNames[cardType]}!`);
    sound.playAttack();

    // 30-Second Practice Drill Step Verification
    if (isPracticeDrill) {
      if (practiceStep === 1 && cardType === 'pounce') {
        setTimeout(() => {
          setPracticeStep(2);
          sound.playBell();
          setLastCombatLog('🥋 DOJO STEP 2/4: Sensei prepares strike! Raise Iron Guard [3]!');
          setAnnouncerText('🥋 DOJO: STEP 2/4');
          setAnnouncerPulse(true);
          setOpponentIntent('⚠️ Sensei preparing strike...');
          setTimeout(() => {
            if (isPracticeDrill) {
              executeOpponentAttack(40, 'Sparring Strike');
            }
          }, 800);
        }, 600);
      } else if (practiceStep === 3 && cardType === 'slam') {
        setTimeout(() => {
          setPracticeStep(4);
          sound.playBell();
          setLastCombatLog('🥋 DOJO STEP 4/4: Final Step! Tag in a teammate [Q/W/E/R] for 75 landing DMG!');
          setAnnouncerText('🥋 DOJO: STEP 4/4');
          setAnnouncerPulse(true);
        }, 700);
      }
    }

    // Esports Combo Counter Update
    setComboCount((prev) => {
      const next = prev + 1;
      if (next === 2) setComboLabel('🔥 2x COMBO!');
      else if (next === 3) setComboLabel('⚡ 3x SUPER EFFECTIVE!');
      else if (next >= 4) setComboLabel(`💥 ${next}x UNSTOPPABLE!`);
      return next;
    });
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboCount(0);
      setComboLabel('');
    }, 3500);

    // Announcer Callout Trigger
    if (cardType === 'slam') {
      setAnnouncerText('💥 PET SLAM OVERDRIVE!');
      setAnnouncerPulse(true);
      setTimeout(() => setAnnouncerPulse(false), 2200);
    } else if (cardType === 'bite') {
      setAnnouncerText('🐾 FIERCE BITE STRIKE!');
      setAnnouncerPulse(true);
      setTimeout(() => setAnnouncerPulse(false), 1800);
    }

    let baseDamage = currentActiveFighter.damage;
    let multiplier = 1;
    let isCrit = false;

    if (cardType === 'pounce') multiplier = 0.52;
    if (cardType === 'bark') multiplier = 0.68;
    if (cardType === 'bite') multiplier = 0.95;
    if (cardType === 'slam') {
      multiplier = 1.40;
      isCrit = true;
    }

    const isBlocked = isOpponentShieldedRef.current;
    let totalDmg = Math.round(baseDamage * multiplier);
    if (isBlocked) {
      totalDmg = Math.round(totalDmg * 0.4);
    }

    // Trigger Canvas 60 FPS Combat Action Sequence
    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'player',
      type: cardType,
      damage: totalDmg,
      isCrit,
      isBlocked: isBlocked,
    });

    setTimeout(() => {
      if (battleOverRef.current || playerHpRef.current <= 0) return;

      if (isOpponentShieldedRef.current) {
        setIsOpponentShielded(false);
        isOpponentShieldedRef.current = false;
        addPopup('SHIELD DEFLECTED!', 'block', 170, 80);
        sound.playBlock();
      } else {
        sound.playImpact();
      }

      let nextOppHp = 0;
      setOpponentHp((prev) => {
        if (battleOverRef.current || playerHpRef.current <= 0) return prev;
        const next = Math.max(0, prev - totalDmg);
        nextOppHp = next;
        opponentHpRef.current = next;
        setTimeout(() => setGhostOpponentHp(next), 350);

        if (next === 0 && battleModeRef.current === '2v2' && opponentAllyHpRef.current > 0) {
          // In 2v2: Enemy lead knocked out, enemy partner tags in!
          const currentLead = selectedOpponentRef.current;
          const partner = opponentAllyRef.current;
          setSelectedOpponent(partner);
          selectedOpponentRef.current = partner;
          setOpponentAlly(currentLead);
          opponentAllyRef.current = currentLead;
          const partnerHp = opponentAllyHpRef.current;
          setOpponentHp(partnerHp);
          opponentHpRef.current = partnerHp;
          setOpponentAllyHp(0);
          opponentAllyHpRef.current = 0;
          setLastCombatLog(`💥 Lead K.O.! Rival Ally ${partner.name} enters!`);
          nextOppHp = partnerHp;
        } else if (next === 0 && (battleModeRef.current !== '2v2' || opponentAllyHpRef.current === 0)) {
          if (!battleOverRef.current && playerHpRef.current > 0) {
            battleOverRef.current = true;
            handleMatchConclusion(true);
          }
        }
        return next;
      });

      setOpponentAnim('hit');

      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 400);

      // Broadcast move to partner so both screens match in real-time!
      if (isMultiplayerBattleRef.current) {
        multiplayerBattleSync.sendPlayerAction({
          senderTag: playerTag,
          senderName: trainerName || 'Trainer',
          cardType,
          target: 'opponent',
          damage: totalDmg,
          isCrit,
          isBlocked,
          newOpponentHp: nextOppHp,
          newOpponentAllyHp: opponentAllyHpRef.current,
          log: `${currentActiveFighter.name} used ${moveNames[cardType]} (-${totalDmg} DMG)!`,
        });
      }
    }, cardType === 'slam' ? 550 : 320);
  };

  // Tag-In Swap to another Dog/Cat from 4-Pet Squad
  const handleTagIn = (beast: Animal) => {
    if (beast.id === currentActiveFighter.id || !inBattle || battleOver || battleOverRef.current || playerHpRef.current <= 0) return;

    sound.playCardPlay();
    setCurrentActiveFighter(beast);
    selectActiveBeast(beast.id);
    setLastCombatLog(`🔁 Tag-in! ${beast.name} enters with 45 DMG slam!`);

    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'player',
      type: 'slam',
      damage: 45,
      isCrit: true,
      isBlocked: false,
    });

    // Tag-In landing impact (deals instant 45 damage)
    setPlayerAnim('slam');
    setTimeout(() => {
      if (battleOverRef.current || playerHpRef.current <= 0) return;
      sound.playImpact();
      let nextOppHp = 0;
      setOpponentHp((prev) => {
        if (battleOverRef.current || playerHpRef.current <= 0) return prev;
        const next = Math.max(0, prev - 45);
        nextOppHp = next;
        opponentHpRef.current = next;
        setTimeout(() => setGhostOpponentHp(next), 350);
        if (next === 0 && (battleModeRef.current !== '2v2' || opponentAllyHpRef.current === 0)) {
          if (!battleOverRef.current && playerHpRef.current > 0) {
            battleOverRef.current = true;
            handleMatchConclusion(true);
          }
        }
        return next;
      });
      addPopup('TAG IMPACT -45!', 'crit', 170, 80);
      setOpponentAnim('hit');
      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 350);

      // If multiplayer battle, broadcast tag action!
      if (isMultiplayerBattleRef.current) {
        multiplayerBattleSync.sendPlayerAction({
          senderTag: playerTag,
          senderName: trainerName || 'Trainer',
          cardType: 'tag',
          target: 'opponent',
          damage: 45,
          isCrit: true,
          isBlocked: false,
          newOpponentHp: nextOppHp,
          newOpponentAllyHp: opponentAllyHpRef.current,
          log: `Tag-in! ${beast.name} enters with 45 DMG slam!`,
        });
      }

      // Complete 30-Second Practice Drill
      if (isPracticeDrill && practiceStep === 4) {
        setTimeout(() => {
          setPracticeCompleted(true);
          sound.playVictory();
          triggerVictoryExplosion();
          addCredits(250);
          localStorage.setItem('petslam_tutorial_completed', 'true');
          setShowTutorialPrompt(false);
        }, 500);
      }
    }, 250);
  };

  // Forfeit Battle
  const handleForfeit = () => {
    if (!inBattle || battleOver || battleOverRef.current) return;
    battleOverRef.current = true;
    sound.playClick();
    handleMatchConclusion(false);
  };

  // Match Finished
  const handleMatchConclusion = (won: boolean, fromRemote = false) => {
    if (battleOverRef.current && battleOver) return;
    battleOverRef.current = true;
    setBattleOver(true);
    setBattleResult(won ? 'victory' : 'defeat');
    setAnnouncerText(won ? '🏆 K.O.! VICTORY!' : '💀 K.O.! DEFEATED');
    setAnnouncerPulse(true);

    // Visceral K.O. Impact Boom & Haptic Crunch
    sound.playKO();
    triggerHeavyImpactHaptic();

    if (won) {
      setTimeout(() => {
        sound.playVictory();
        triggerVictoryExplosion();
        triggerSuccessHaptic();
      }, 400);
    } else {
      setTimeout(() => {
        sound.playDefeat();
      }, 400);
    }

    recordMatchResult(won, selectedOpponent, 3);

    // Save defense snapshot to asynchronous ghost meta roster
    ghostDefenseService.recordPlayerDefense(currentActiveFighter, trainerName, playerTag, trophies);

    // If in multiplayer battle, broadcast conclusion so both screens finish at the exact same moment!
    if (isMultiplayerBattleRef.current && !fromRemote) {
      multiplayerBattleSync.sendBattleConclusion({
        won,
        reason: 'ko',
        senderTag: playerTag,
      });
    }
  };

  // Low-HP Tension Heartbeat Loop (<25% HP)
  useEffect(() => {
    if (!inBattle || battleOver) return;
    const isLow = playerHp > 0 && playerHp <= maxPlayerHp * 0.25;
    if (!isLow) return;

    sound.playHeartbeat();
    const interval = setInterval(() => {
      sound.playHeartbeat();
    }, 1350);
    return () => clearInterval(interval);
  }, [inBattle, battleOver, playerHp, maxPlayerHp]);

  // Desktop Hotkey Listener ([1] Pounce, [2] Bark, [3] Guard, [4] Bite, [SPACE] SLAM, [Q/W/E/R] Tag-in)
  useEffect(() => {
    if (!inBattle || battleOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === '1') {
        e.preventDefault();
        setPressedHotkey('1');
        handlePlayCard('pounce');
      } else if (key === '2') {
        e.preventDefault();
        setPressedHotkey('2');
        handlePlayCard('bark');
      } else if (key === '3') {
        e.preventDefault();
        setPressedHotkey('3');
        handlePlayCard('shield');
      } else if (key === '4') {
        e.preventDefault();
        setPressedHotkey('4');
        handlePlayCard('bite');
      } else if (e.code === 'Space' || key === ' ') {
        e.preventDefault();
        setPressedHotkey('space');
        handlePlayCard('slam');
      } else if (key === 'q') {
        e.preventDefault();
        setPressedHotkey('q');
        if (safeDeck[0]) handleTagIn(safeDeck[0]);
      } else if (key === 'w') {
        e.preventDefault();
        setPressedHotkey('w');
        if (safeDeck[1]) handleTagIn(safeDeck[1]);
      } else if (key === 'e') {
        e.preventDefault();
        setPressedHotkey('e');
        if (safeDeck[2]) handleTagIn(safeDeck[2]);
      } else if (key === 'r') {
        e.preventDefault();
        setPressedHotkey('r');
        if (safeDeck[3]) handleTagIn(safeDeck[3]);
      }
    };

    const handleKeyUp = () => {
      setPressedHotkey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inBattle, battleOver, elixir, safeDeck, currentActiveFighter, isOpponentShielded, isPlayerShielded]);

  const playerHpPct = Math.max(0, Math.min(100, (playerHp / maxPlayerHp) * 100));
  const oppHpPct = Math.max(0, Math.min(100, (opponentHp / maxOpponentHp) * 100));

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#0B0F17] text-[#F8FAFC] select-none overflow-hidden transition-colors duration-150 ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* =========================================================================
          VIEW 1: ARENA LOBBY (Pet Slam 1v1 Queue)
         ========================================================================= */}
      {!inBattle && (
        <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-y-auto space-y-4 max-w-lg mx-auto w-full pb-28 overscroll-contain">
          {/* Header Stadium Banner */}
          <div className="shrink-0 bg-[#151C28] border border-[#2A364F] rounded-2xl p-4 sm:p-5 shadow-sm text-center relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#CBD5E1] mb-2">
              <span className="flex items-center gap-1.5 text-[#F8FAFC] font-bold">
                <Crown className="w-4 h-4 text-[#F59E0B]" />
                <span>Colosseum League</span>
              </span>
              <span className="flex items-center gap-1 text-[#F59E0B] font-bold tabular-nums">
                <Trophy className="w-4 h-4" />
                <span>{trophies} Trophies</span>
              </span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-[#F8FAFC]">
              Pet Slam Arena
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1] font-medium mt-1">
              Real-Time 1v1 Pet Duels · Purebred Canines & Felines
            </p>
          </div>

          {/* Interactive Combat Practice Drill Banner */}
          {showTutorialPrompt ? (
            <div className="shrink-0 bg-[#1E2738] border border-[#2A364F] rounded-2xl p-4 shadow-sm relative overflow-hidden animate-in fade-in transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#0B0F17] font-bold flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base uppercase text-[#F8FAFC] tracking-wider">
                        Combat Practice Drill
                      </span>
                      <span className="text-xs font-mono bg-[#151C28] border border-[#2A364F] text-[#F59E0B] px-2 py-0.5 rounded font-bold tabular-nums">
                        +250 CR
                      </span>
                    </div>
                    <p className="text-sm text-[#CBD5E1] mt-0.5 leading-snug">
                      Master Pounce [1], Iron Guard [3], Overdrive [SPACE], and Tag-Ins in 30 seconds.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSkipTutorial}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-mono underline cursor-pointer shrink-0"
                  title="Skip practice tutorial"
                >
                  Skip
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2A364F] flex items-center gap-2">
                <button
                  onClick={startPracticeDrill}
                  className="flex-1 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-bold text-sm uppercase tracking-wider cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-[#0B0F17]" />
                  <span>Start 30s Practice Drill</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151C28] border border-[#2A364F] text-sm font-mono">
              <span className="text-[#CBD5E1] flex items-center gap-2 font-medium">
                <Target className="w-4 h-4 text-[#F59E0B]" />
                <span>Combat Training Complete</span>
              </span>
              <button
                onClick={startPracticeDrill}
                className="text-[#F59E0B] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Drill</span>
              </button>
            </div>
          )}

          {/* 1v1 vs 2v2 Mode Switcher */}
          <div className="flex items-center p-1 bg-[#151C28] border border-[#2A364F] rounded-2xl max-w-xs mx-auto w-full shadow-sm">
            <button
              onClick={() => {
                sound.playClick();
                setBattleMode('1v1');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                battleMode === '1v1'
                  ? 'bg-[#F59E0B] text-[#0B0F17] shadow-sm'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>1v1 Ranked</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setBattleMode('2v2');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                battleMode === '2v2'
                  ? 'bg-[#F59E0B] text-[#0B0F17] shadow-sm'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2v2 Tag Team</span>
            </button>
          </div>

          {/* Active Champion or 2v2 Tag Team Showcase */}
          <div className="py-2 flex flex-col items-center">
            {battleMode === '2v2' ? (
              <>
                <div className="flex items-center justify-center gap-3">
                  {/* Lead Fighter Card */}
                  <div className="relative group flex flex-col items-center">
                    <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border border-[#2A364F] bg-[#151C28] relative">
                      <img
                        src={currentActiveFighter.image}
                        alt={currentActiveFighter.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 bg-[#0B0F17]/90 px-2 py-0.5 rounded-full border border-[#2A364F] text-[11px] font-mono font-bold text-[#F59E0B]">
                        LEAD
                      </div>
                      <div className="absolute bottom-2 inset-x-2 text-center">
                        <div className="font-display font-bold text-sm text-[#F8FAFC] uppercase truncate">
                          {currentActiveFighter.name}
                        </div>
                        <div className="text-xs text-[#CBD5E1] font-medium truncate">
                          {currentActiveFighter.breed}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="font-display font-black text-xl text-[#F59E0B] tracking-wider">
                    +
                  </div>

                  {/* Ally Partner Card */}
                  <div className="relative group flex flex-col items-center">
                    <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border border-[#2A364F] bg-[#151C28] relative">
                      <img
                        src={getPetPhoto(playerAlly)}
                        alt={playerAlly.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 bg-[#0B0F17]/90 px-2 py-0.5 rounded-full border border-[#2A364F] text-[11px] font-mono font-bold text-[#CBD5E1]">
                        {isMultiplayerBattle ? 'FRIEND' : 'PARTNER'}
                      </div>
                      {playerAlly.rarity && (
                        <div className="absolute top-2 right-2 bg-[#0B0F17]/90 px-2 py-0.5 rounded-full border border-[#2A364F] text-[10px] font-mono font-bold text-[#F59E0B] uppercase">
                          {playerAlly.rarity}
                        </div>
                      )}
                      <div className="absolute bottom-2 inset-x-2 text-center">
                        <div className="font-display font-bold text-sm text-[#F8FAFC] uppercase truncate">
                          {playerAlly.name}
                        </div>
                        <div className="text-xs text-[#CBD5E1] font-medium truncate flex items-center justify-center gap-1">
                          <PawPrint className="w-3 h-3 text-[#F59E0B]" />
                          <span>{playerAlly.breed || 'Companion'}</span>
                        </div>
                        {partnerPlayer?.name && (
                          <div className="text-xs text-[#94A3B8] font-mono truncate">
                            {partnerPlayer.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Play With A Friend Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    window.dispatchEvent(new CustomEvent('petslam:open-friends'));
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#F8FAFC] border border-[#2A364F] text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all duration-150"
                  title="Invite an online friend to partner with you in 2v2 Tag Team"
                >
                  <Users className="w-4 h-4 text-[#F59E0B]" />
                  <span>Play With a Friend (Invite Partner)</span>
                </button>
              </>
            ) : (
              /* Single 1v1 Champion Card */
              <div className="relative group">
                <div className="w-44 h-52 sm:w-52 sm:h-60 rounded-3xl overflow-hidden border border-[#2A364F] group-hover:border-[#F59E0B]/50 bg-[#151C28] relative shadow-md transition-all duration-200">
                  <img
                    src={currentActiveFighter.image}
                    alt={currentActiveFighter.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/30 to-transparent" />

                  <div className="absolute top-3 left-3 bg-[#0B0F17]/90 px-2.5 py-0.5 rounded-full border border-[#2A364F] text-xs font-mono font-bold text-[#F59E0B] tabular-nums">
                    LVL {currentActiveFighter.level || 10}
                  </div>

                  <div className={`absolute top-3 right-3 ${getRarityBadgeClasses(currentActiveFighter.rarity)} text-xs font-mono font-bold`}>
                    {currentActiveFighter.rarity}
                  </div>

                  <div className="absolute bottom-3 inset-x-3 text-center">
                    <h3 className="font-display font-black text-lg sm:text-xl text-[#F8FAFC] uppercase tracking-wider truncate">
                      {currentActiveFighter.name}
                    </h3>
                    <div className="text-xs text-[#CBD5E1] font-medium mt-0.5">
                      {currentActiveFighter.breed} · {currentActiveFighter.combatArchetype}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Combat Specs Pills */}
            <div className="flex items-center gap-2.5 mt-3 text-sm font-mono">
              <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 tabular-nums">
                <Heart className="w-4 h-4 text-[#10B981]" />
                <span>{currentActiveFighter.health} HP</span>
              </span>
              <span className="bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/40 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 tabular-nums">
                <Swords className="w-4 h-4 text-[#F43F5E]" />
                <span>{currentActiveFighter.damage} DMG</span>
              </span>
              <span className="bg-sky-500/15 text-sky-300 border border-sky-500/40 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 tabular-nums">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>{currentActiveFighter.topSpeedKmh} KM/H</span>
              </span>
            </div>
          </div>

          {/* 4-Pet Battle Squad Drawer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#CBD5E1]">
              <span className="font-bold text-[#F8FAFC] uppercase">Your 4-Pet Battle Squad</span>
              <span className="text-[#94A3B8]">Tap pet to set Lead</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {safeDeck.map((petFighter) => {
                const isSelected = petFighter.id === currentActiveFighter.id;
                return (
                  <div
                    key={petFighter.id}
                    onClick={() => {
                      sound.playClick();
                      setCurrentActiveFighter(petFighter);
                      selectActiveBeast(petFighter.id);
                    }}
                    className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                      isSelected
                        ? 'bg-[#1E2738] border-2 border-[#F59E0B] shadow-sm'
                        : 'bg-[#151C28] border-[#2A364F] hover:border-[#F59E0B]/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-[#2A364F] aspect-square mb-1">
                      <img
                        src={petFighter.image}
                        alt={petFighter.name}
                        className="w-full h-full object-cover object-center aspect-square"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#F8FAFC] truncate w-full">
                      {petFighter.name}
                    </span>
                    <span className="text-xs font-mono text-[#F59E0B] font-bold tabular-nums">
                      LV.{petFighter.level || 10}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Big Action Battle Launch Button & Cancel Matchmaking Controls */}
            {isMatchmaking ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
                <button
                  disabled
                  className="flex-1 w-full py-3.5 rounded-xl bg-[#F59E0B] text-[#0B0F17] font-display font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-wait"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[#0B0F17] border-t-transparent animate-spin" />
                  <span className="tabular-nums">Matching Opponent... ({matchCountdown}s)</span>
                </button>
                <button
                  onClick={handleCancelMatchmaking}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] text-white font-display font-bold text-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  title="Cancel Matchmaking Search"
                >
                  <span>Cancel [✕]</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-2 w-full">
                <button
                  onClick={() => handleStartMatchmaking(false)}
                  className="w-full py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-bold text-base uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-98"
                >
                  <Swords className="w-5 h-5 text-[#0B0F17]" />
                  <span>Find Live Match ({battleMode === '2v2' ? '2v2 Ranked' : '1v1 Ranked'})</span>
                </button>

                <button
                  onClick={() => handleStartMatchmaking(true)}
                  className="w-full py-3 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#F8FAFC] border border-[#2A364F] font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-98"
                >
                  <span>
                    {battleMode === '2v2'
                      ? 'Solo 2v2 Tag Team with Bots (vs CPU)'
                      : 'Solo 1v1 Ranked with Bot (vs CPU)'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE 60 FPS PET SLAM BATTLE ARENA (ANIMATED & IMMERSIVE)
         ========================================================================= */}
      {inBattle && (
        <div
          className={`flex-1 flex flex-col justify-between p-1.5 sm:p-2.5 relative max-w-lg mx-auto w-full h-full min-h-0 overflow-y-auto sm:overflow-hidden select-none pb-20 sm:pb-2.5 ${
            screenShake ? 'animate-arenaShake' : ''
          }`}
        >
          {/* Floating Damage Numbers */}
          {damagePopups.map((p) => (
            <div
              key={p.id}
              className={`absolute pointer-events-none font-display font-black text-sm sm:text-base z-50 animate-out fade-out slide-out-to-top-8 duration-1000 ${
                p.type === 'parry'
                  ? 'text-[#FDE047] text-lg sm:text-2xl font-black drop-shadow-[0_0_16px_rgba(245,158,11,0.9)] scale-110 tracking-wider'
                  : p.type === 'crit'
                  ? 'text-[#F59E0B] text-lg sm:text-xl font-black drop-shadow-md'
                  : p.type === 'block'
                  ? 'text-[#38BDF8] drop-shadow-md'
                  : p.type === 'player'
                  ? 'text-[#F43F5E]'
                  : 'text-[#F59E0B]'
              }`}
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.text}
            </div>
          ))}

          {/* 0. DOJO PRACTICE DRILL PROGRESS BAR */}
          {isPracticeDrill && (
            <div className="bg-[#151C28] border border-[#2A364F] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-mono shadow-sm">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <span className="text-[#F59E0B] font-bold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>DOJO DRILL:</span>
                </span>
                <span className={practiceStep === 1 ? 'text-[#F59E0B] font-bold underline' : (practiceStep && practiceStep > 1) ? 'text-[#10B981] font-bold' : 'text-[#94A3B8]'}>
                  {(practiceStep && practiceStep > 1) ? '✓ 1.Pounce' : '1.Pounce'}
                </span>
                <span className="text-[#94A3B8]">›</span>
                <span className={practiceStep === 2 ? 'text-[#F59E0B] font-bold underline' : (practiceStep && practiceStep > 2) ? 'text-[#10B981] font-bold' : 'text-[#94A3B8]'}>
                  {(practiceStep && practiceStep > 2) ? '✓ 2.Guard' : '2.Guard'}
                </span>
                <span className="text-[#94A3B8]">›</span>
                <span className={practiceStep === 3 ? 'text-[#F59E0B] font-bold underline' : (practiceStep && practiceStep > 3) ? 'text-[#10B981] font-bold' : 'text-[#94A3B8]'}>
                  {(practiceStep && practiceStep > 3) ? '✓ 3.SLAM' : '3.SLAM'}
                </span>
                <span className="text-[#94A3B8]">›</span>
                <span className={practiceStep === 4 ? 'text-[#F59E0B] font-bold underline' : 'text-[#94A3B8]'}>
                  4.Tag-In
                </span>
              </div>
              <button
                onClick={handleSkipTutorial}
                className="text-[#94A3B8] hover:text-[#F8FAFC] text-xs underline cursor-pointer shrink-0"
              >
                Skip Drill ✕
              </button>
            </div>
          )}

          {/* 1. MATCH STATUS & ARENA THEME SELECTOR BAR */}
          <div className="flex items-center justify-between bg-[#151C28] border border-[#2A364F] rounded-xl px-3 py-1.5 shrink-0 shadow-sm gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40 px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-ping" />
                <span>{battleMode === '2v2' ? '2v2 TAG TEAM' : 'SLAM 1v1'}</span>
              </span>
            </div>

            {/* Switchable Arena Aesthetic Themes */}
            <div className="flex items-center gap-1 bg-[#0B0F17] px-2 py-0.5 rounded-lg border border-[#2A364F] shrink-0">
              {(
                [
                  { id: 'stadium', label: 'Stadium' },
                  { id: 'cyber', label: 'Cyber' },
                  { id: 'dojo', label: 'Dojo' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setArenaTheme(t.id);
                  }}
                  title={`Switch to ${t.label} Arena`}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    arenaTheme === t.id
                      ? 'bg-[#F59E0B] text-[#0B0F17]'
                      : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738]'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-sm font-bold shrink-0">
              <Timer className={`w-4 h-4 ${battleTimerSec <= 60 ? 'text-[#F43F5E] animate-pulse' : 'text-[#F59E0B]'}`} />
              <span className={`tabular-nums ${battleTimerSec <= 60 ? 'text-[#F43F5E] animate-pulse' : 'text-[#F59E0B]'}`}>
                {formatTimer(battleTimerSec)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleForfeit}
                className="flex items-center gap-1 text-xs font-mono font-bold text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 px-2 py-1 rounded transition-colors cursor-pointer"
                title="Surrender Match"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Forfeit</span>
              </button>
            </div>
          </div>

          {/* 2. OPPONENT HUD BAR */}
          <div className="bg-[#151C28] border border-[#2A364F] rounded-xl px-3 py-2 shadow-sm shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#2A364F] bg-black shrink-0">
                <img
                  src={getPetPhoto(selectedOpponent)}
                  alt={selectedOpponent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-display font-bold text-sm text-[#F8FAFC] uppercase truncate">
                    {selectedOpponent.name}
                  </span>
                  <span className="text-xs bg-[#1E2738] text-[#CBD5E1] border border-[#2A364F] font-mono px-1.5 py-0.5 rounded uppercase">
                    {selectedOpponent.breed}
                  </span>
                </div>
                {/* Parallelogram Skewed HP Bar */}
                <div className="relative -skew-x-12 overflow-hidden bg-[#0B0F17] border border-[#2A364F] h-3 w-32 sm:w-48 rounded-xs mt-1 shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#F59E0B]/50 transition-all duration-700 ease-out"
                    style={{ width: `${(ghostOpponentHp / maxOpponentHp) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#F43F5E] transition-all duration-150"
                    style={{ width: `${(opponentHp / maxOpponentHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#1E2738] px-2 py-0.5 rounded border border-[#2A364F] block truncate max-w-[120px]">
                {opponentIntent}
              </span>
              <span className="text-xs font-mono text-[#CBD5E1] tabular-nums mt-0.5 block">
                {opponentHp} / {maxOpponentHp} HP
              </span>
            </div>
          </div>

          {/* 3. 60 FPS HTML5 CANVAS BATTLE ARENA STAGE (Supports 1v1 and 2v2) */}
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#2A364F] shadow-lg my-1 min-h-[160px] sm:min-h-[240px] max-h-[280px] sm:max-h-[350px] flex items-center justify-center bg-[#0B0F17]">
            {/* The 60 FPS Pet Canvas Game Engine */}
            <PetBattleSceneCanvas
              playerPet={currentActiveFighter}
              opponentPet={selectedOpponent}
              playerHp={playerHp}
              maxPlayerHp={maxPlayerHp}
              opponentHp={opponentHp}
              maxOpponentHp={maxOpponentHp}
              isPlayerShielded={isPlayerShielded}
              isOpponentShielded={isOpponentShielded}
              arenaTheme={arenaTheme}
              currentAction={currentCanvasAction}
              onActionComplete={() => setCurrentCanvasAction(null)}
              battleMode={battleMode}
              playerAllyPet={playerAlly}
              opponentAllyPet={opponentAlly}
              playerAllyHp={playerAllyHp}
              maxPlayerAllyHp={maxPlayerAllyHp}
              opponentAllyHp={opponentAllyHp}
              maxOpponentAllyHp={maxOpponentAllyHp}
              playerGear={{
                collar: !!equippedGear?.collar,
                armor: !!equippedGear?.armor,
                paws: !!equippedGear?.paws,
              }}
              opponentGear={{
                collar: selectedOpponent.rarity !== 'Common',
                paws: (selectedOpponent.level || 1) >= 3,
                armor: (selectedOpponent.level || 1) >= 6 || selectedOpponent.rarity === 'Legendary',
              }}
              playerHasCrown={(currentActiveFighter.level || 1) >= 8 || trophies >= 1200}
              opponentHasCrown={(selectedOpponent.level || 1) >= 8}
              className="w-full h-full absolute inset-0"
            />

            {/* Esports Broadcast Announcer Callout Banner */}
            {announcerText && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-95 duration-200">
                <div className="px-4 py-1.5 rounded-xl bg-[#0B0F17]/95 border border-[#F59E0B] shadow-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B] animate-spin" />
                  <span className="font-display font-black text-sm text-[#F59E0B] tracking-wider uppercase">
                    {announcerText}
                  </span>
                </div>
              </div>
            )}

            {/* Real-time Combo Counter Badge */}
            {comboCount >= 2 && (
              <div className="absolute bottom-3 right-3 z-20 pointer-events-none animate-bounce">
                <div className="px-2.5 py-1 rounded-lg bg-[#0B0F17]/90 border border-[#F59E0B] shadow-md flex items-center gap-1.5">
                  <span className="font-display font-black text-xs text-[#F59E0B] italic tracking-wider">
                    {comboLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Live Combat Announcement Ticker Banner */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0B0F17]/90 backdrop-blur-md border border-[#2A364F] flex items-center gap-1.5 z-20 pointer-events-none max-w-[85%]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping shrink-0" />
              <span className="font-display font-bold text-xs text-[#F8FAFC] tracking-wider uppercase truncate">
                {lastCombatLog || 'PET SLAM LIVE ARENA'}
              </span>
            </div>

            {/* Theme Overlay Watermark Pill */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#0B0F17]/80 border border-[#2A364F] text-xs font-mono text-[#94A3B8] pointer-events-none uppercase">
              {arenaTheme} ARENA · {battleMode === '2v2' ? '2v2 TAG TEAM' : '60 FPS'}
            </div>
          </div>

          {/* 4. PLAYER HUD & SQUAD SWITCHER BAR (with 2v2 Co-op Ally support) */}
          <div className="bg-[#151C28] border border-[#2A364F] rounded-xl px-3 py-2 shadow-sm shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#2A364F] bg-black shrink-0">
                <img
                  src={getPetPhoto(currentActiveFighter)}
                  alt={currentActiveFighter.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-display font-bold text-sm text-[#F8FAFC] uppercase truncate">
                    {currentActiveFighter.name}
                  </span>
                  <span className="text-xs bg-[#1E2738] text-[#CBD5E1] border border-[#2A364F] font-mono px-1.5 py-0.5 rounded uppercase">
                    {currentActiveFighter.breed}
                  </span>
                </div>
                {/* Parallelogram Skewed HP Bar */}
                <div className="relative -skew-x-12 overflow-hidden bg-[#0B0F17] border border-[#2A364F] h-3 w-32 sm:w-48 rounded-xs mt-1 shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#F59E0B]/50 transition-all duration-700 ease-out"
                    style={{ width: `${(ghostPlayerHp / maxPlayerHp) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#10B981] transition-all duration-150"
                    style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2v2 Player Ally Mini HUD */}
            {battleMode === '2v2' && (
              <div className="flex items-center gap-1.5 border-l border-[#2A364F] pl-2 shrink-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2A364F] bg-black shrink-0">
                  <img
                    src={getPetPhoto(playerAlly)}
                    alt={playerAlly.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-[#CBD5E1] truncate max-w-[85px]">
                    {playerAlly.name}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono truncate max-w-[85px] flex items-center gap-0.5">
                    <PawPrint className="w-2.5 h-2.5 text-[#F59E0B]" />
                    <span>{playerAlly.breed || 'Companion'}</span>
                  </div>
                  <div className="w-16 sm:w-20 h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-[#2A364F] mt-0.5">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all"
                      style={{ width: `${(playerAllyHp / maxPlayerAllyHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Squad Tag-In Drawer with Desktop Hotkey Hints [Q/W/E/R] */}
            <div className="flex items-center gap-1.5 shrink-0">
              {safeDeck.map((b, idx) => {
                const hotkeyLetters = ['Q', 'W', 'E', 'R'];
                const letter = hotkeyLetters[idx];
                const isKeyActive = pressedHotkey === letter?.toLowerCase();
                return (
                  <button
                    key={b.id}
                    onClick={() => handleTagIn(b)}
                    title={`[${letter}] Tag in ${b.name}`}
                    className={`w-8 h-8 rounded-lg overflow-hidden border cursor-pointer transition-all relative active:scale-95 ${
                      b.id === currentActiveFighter.id
                        ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]'
                        : isPracticeDrill && practiceStep === 4
                        ? 'border-[#F59E0B] ring-2 ring-[#F59E0B] animate-pulse scale-105'
                        : isKeyActive
                        ? 'border-[#F59E0B] scale-95'
                        : 'border-[#2A364F] hover:border-[#F8FAFC] opacity-70'
                    }`}
                  >
                    <img
                      src={getPetPhoto(b)}
                      alt={b.name}
                      className="w-full h-full object-cover aspect-square"
                    />
                    {letter && (
                      <span className="absolute bottom-0 right-0 px-0.5 bg-black/80 text-[8px] font-mono font-bold text-[#F59E0B] rounded-tl leading-none">
                        {letter}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SLAM ENERGY GAUGE BAR (1 TO 10 ENERGY) */}
          <div className="space-y-1 shrink-0 bg-[#151C28] p-2.5 rounded-xl border border-[#2A364F]">
            <div className="flex items-center justify-between text-xs font-mono leading-none">
              <span className="text-[#CBD5E1] font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>SLAM ENERGY</span>
              </span>
              <span className="font-bold text-[#F59E0B] text-sm tabular-nums">{Math.floor(elixir)} / 10 ⚡</span>
            </div>

            <div className="h-3 bg-[#0B0F17] rounded-full overflow-hidden border border-[#2A364F] p-0.5 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full rounded-xs transition-all duration-150 ${
                    i < Math.floor(elixir)
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#1E2738]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 6. SLAM ACTION MOVES DOCK */}
          <div className="grid grid-cols-5 gap-1.5 shrink-0">
            {/* Card 1: Quick Pounce (2 Energy / Hotkey [1]) */}
            <button
              onClick={() => handlePlayCard('pounce')}
              disabled={elixir < 2}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer h-16 sm:h-20 relative ${
                elixir >= 2
                  ? 'bg-[#1E2738] hover:bg-[#2A364F] border-[#2A364F] text-[#F8FAFC] active:scale-95'
                  : 'bg-[#0B0F17] border-[#2A364F]/50 text-[#94A3B8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-bold text-[#CBD5E1] tabular-nums">2 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#0B0F17] border border-[#2A364F] text-[#94A3B8] font-bold hidden sm:inline">
                  [1]
                </span>
              </div>
              <PawPrint className="w-5 h-5 text-[#CBD5E1] my-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider truncate text-[#F8FAFC]">Pounce</span>
            </button>

            {/* Card 2: Sonic Bark (3 Energy / Hotkey [2]) */}
            <button
              onClick={() => handlePlayCard('bark')}
              disabled={elixir < 3}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer h-16 sm:h-20 relative ${
                elixir >= 3
                  ? 'bg-[#1E2738] hover:bg-[#2A364F] border-[#2A364F] text-[#F8FAFC] active:scale-95'
                  : 'bg-[#0B0F17] border-[#2A364F]/50 text-[#94A3B8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-bold text-[#CBD5E1] tabular-nums">3 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#0B0F17] border border-[#2A364F] text-[#94A3B8] font-bold hidden sm:inline">
                  [2]
                </span>
              </div>
              <Volume2 className="w-5 h-5 text-[#CBD5E1] my-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider truncate text-[#F8FAFC]">Bark</span>
            </button>

            {/* Card 3: Iron Guard / Parry (2 Energy / Hotkey [3]) */}
            <button
              onClick={() => handlePlayCard('shield')}
              disabled={elixir < 2}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer h-16 sm:h-20 relative ${
                isParryWindowActive
                  ? 'bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border-[#FDE047] text-[#FDE047] shadow-[0_0_18px_rgba(245,158,11,0.7)] animate-pulse scale-105 active:scale-95 z-10'
                  : elixir >= 2
                  ? 'bg-[#1E2738] hover:bg-[#2A364F] border-[#2A364F] text-[#F8FAFC] active:scale-95'
                  : 'bg-[#0B0F17] border-[#2A364F]/50 text-[#94A3B8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span
                  className={`text-xs font-mono font-bold tabular-nums ${
                    isParryWindowActive ? 'text-[#FDE047]' : 'text-[#CBD5E1]'
                  }`}
                >
                  {isParryWindowActive ? '⚡ FREE' : '2 ⚡'}
                </span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#0B0F17] border border-[#2A364F] text-[#94A3B8] font-bold hidden sm:inline">
                  [3]
                </span>
              </div>
              <Shield
                className={`w-5 h-5 my-0.5 ${
                  isParryWindowActive ? 'text-[#FDE047] animate-bounce' : 'text-[#CBD5E1]'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider truncate ${
                  isParryWindowActive ? 'text-[#FDE047] font-black' : 'text-[#F8FAFC]'
                }`}
              >
                {isParryWindowActive ? '⚡ PARRY!' : 'Guard'}
              </span>
            </button>

            {/* Card 4: Fierce Bite (4 Energy / Hotkey [4]) */}
            <button
              onClick={() => handlePlayCard('bite')}
              disabled={elixir < 4}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer h-16 sm:h-20 relative ${
                elixir >= 4
                  ? 'bg-[#1E2738] hover:bg-[#2A364F] border-[#2A364F] text-[#F8FAFC] active:scale-95'
                  : 'bg-[#0B0F17] border-[#2A364F]/50 text-[#94A3B8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-bold text-[#CBD5E1] tabular-nums">4 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#0B0F17] border border-[#2A364F] text-[#94A3B8] font-bold hidden sm:inline">
                  [4]
                </span>
              </div>
              <Flame className="w-5 h-5 text-[#F43F5E] my-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider truncate text-[#F8FAFC]">Bite</span>
            </button>

            {/* Card 5: PET SLAM OVERDRIVE (6 Energy / Hotkey [SPACE]) */}
            <button
              onClick={() => handlePlayCard('slam')}
              disabled={elixir < 6}
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer h-16 sm:h-20 relative shadow-md ${
                elixir >= 6
                  ? 'bg-[#F59E0B] hover:bg-[#D97706] border-[#F59E0B] text-[#0B0F17] active:scale-95 font-bold'
                  : 'bg-[#0B0F17] border-[#2A364F]/50 text-[#94A3B8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span
                  className={`text-xs font-mono font-bold tabular-nums ${
                    elixir >= 6 ? 'text-[#0B0F17]' : 'text-[#94A3B8]'
                  }`}
                >
                  6 ⚡
                </span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#0B0F17] border border-[#2A364F] text-[#CBD5E1] font-bold hidden sm:inline">
                  [SPC]
                </span>
              </div>
              <Zap
                className={`w-5 h-5 my-0.5 ${
                  elixir >= 6 ? 'text-[#0B0F17] fill-[#0B0F17]' : 'text-[#94A3B8]'
                }`}
              />
              <span
                className={`text-xs font-black uppercase tracking-wider truncate ${
                  elixir >= 6 ? 'text-[#0B0F17]' : 'text-[#94A3B8]'
                }`}
              >
                {battleMode === '2v2' ? 'DUO SLAM' : 'SLAM'}
              </span>
            </button>
          </div>

          {/* =========================================================================
              DOJO PRACTICE DRILL COMPLETION MODAL
             ========================================================================= */}
          {practiceCompleted && (
            <div className="absolute inset-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#151C28] border border-[#2A364F] rounded-3xl p-6 text-center max-w-xs w-full shadow-xl space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F59E0B] text-[#0B0F17] flex items-center justify-center mx-auto shadow-md">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#F8FAFC] uppercase tracking-wider">
                    Drill Mastered!
                  </h2>
                  <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
                    You've mastered Pounce strikes, Shield deflection, SLAM Overdrive, and Squad tag-ins!
                  </p>
                </div>
                <div className="p-3 bg-[#0B0F17] rounded-xl border border-[#2A364F] font-mono text-sm font-bold text-[#F59E0B] tabular-nums">
                  +250 Slam Credits Awarded!
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPracticeDrill(false);
                    setPracticeCompleted(false);
                    setInBattle(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-bold text-sm uppercase tracking-wider cursor-pointer shadow-md active:scale-95"
                >
                  Enter Colosseum Arena
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              MATCH RESULT MODAL OVERLAY (Victory / Defeat)
             ========================================================================= */}
          {battleOver && (
            <div className="absolute inset-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#151C28] border border-[#2A364F] rounded-3xl p-6 text-center max-w-xs w-full shadow-xl space-y-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                    battleResult === 'victory'
                      ? 'bg-[#F59E0B] text-[#0B0F17]'
                      : 'bg-[#F43F5E] text-white'
                  }`}
                >
                  {battleResult === 'victory' ? (
                    <Trophy className="w-7 h-7" />
                  ) : (
                    <Swords className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h2
                    className={`font-display font-black text-xl uppercase tracking-wider ${
                      battleResult === 'victory' ? 'text-[#F59E0B]' : 'text-[#F43F5E]'
                    }`}
                  >
                    {battleResult === 'victory' ? 'VICTORY SLAM!' : 'DEFEATED'}
                  </h2>
                  <p className="text-xs text-[#CBD5E1] mt-1">
                    {battleResult === 'victory'
                      ? 'Flawless arena victory! Ranking trophies awarded.'
                      : 'Close battle! Train your companion and strike back.'}
                  </p>
                </div>

                {battleResult === 'victory' && (
                  <>
                    <div className="p-3 bg-[#0B0F17] rounded-xl border border-[#2A364F] flex items-center justify-around font-mono text-sm font-bold tabular-nums">
                      <span className="text-[#F59E0B] flex items-center gap-1.5">
                        <Trophy className="w-4 h-4" />
                        <span>+30 Trophies</span>
                      </span>
                      <span className="text-[#CBD5E1] flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-[#F59E0B]" />
                        <span>+450 Coins</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playLevelUp();
                        setShowVictoryCardModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B]/20 via-[#FDE047]/30 to-[#F59E0B]/20 hover:from-[#F59E0B]/30 hover:to-[#F59E0B]/30 border border-[#FDE047]/60 text-[#FDE047] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                    >
                      <Trophy className="w-4 h-4 text-[#FDE047]" />
                      <span>🏆 Share Gladiator Victory Card</span>
                    </button>
                  </>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      startSlamMatch(selectedOpponent);
                    }}
                    className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-bold text-sm uppercase tracking-wider cursor-pointer shadow-md active:scale-98 transition-transform"
                  >
                    Rematch Duel
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setInBattle(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC] font-mono text-xs font-bold cursor-pointer"
                  >
                    Return to Arena Lobby
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4:5 Vertical Gladiator Victory Card Modal */}
      {showVictoryCardModal && (
        <GladiatorVictoryCardModal
          playerPet={currentActiveFighter}
          trainerName={trainerName || 'Trainer'}
          opponentPet={selectedOpponent}
          matchDurationSec={180 - battleTimerSec}
          playerHp={playerHp}
          maxPlayerHp={maxPlayerHp}
          parryCount={matchParryCount}
          trophiesEarned={30}
          onClose={() => setShowVictoryCardModal(false)}
        />
      )}

      {/* Offline Sanctuary Defense Rewards Modal */}
      {offlineReport && (
        <OfflineDefenseModal
          report={offlineReport}
          onClaim={handleClaimOfflineReport}
        />
      )}
    </div>
  );
};
