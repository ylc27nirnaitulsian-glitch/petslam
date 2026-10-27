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
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Animal, ANIMALS_DATA } from '../../../data/animals';
import { animalImages } from '../../../assets/images';
import { sound } from '../../../utils/audio';
import { getRarityBadgeClasses, mapBeastToSpecies, getPetPhoto } from '../../../utils/petVisuals';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { ProceduralPetCanvas } from '../pet/ProceduralPetCanvas';
import { FriendsVoiceRoomModal } from '../FriendsVoiceRoomModal';
import { PetBattleSceneCanvas, BattleAction, ArenaTheme } from '../arena/PetBattleSceneCanvas';
import { triggerVictoryExplosion } from '../../../utils/confetti';

interface DamagePopup {
  id: number;
  text: string;
  type: 'player' | 'opponent' | 'crit' | 'block';
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
    credits,
    addCredits,
    trainerName,
    playerLevel,
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
  const [voiceRoomOpen, setVoiceRoomOpen] = useState<boolean>(false);
  const [arenaTheme, setArenaTheme] = useState<ArenaTheme>('stadium');
  const [currentCanvasAction, setCurrentCanvasAction] = useState<BattleAction | null>(null);

  // Match State
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleOver, setBattleOver] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [battleTimerSec, setBattleTimerSec] = useState<number>(180);

  // Active Combatants
  const [currentActiveFighter, setCurrentActiveFighter] = useState<Animal>(activeBeast);
  useEffect(() => {
    setCurrentActiveFighter(activeBeast);
  }, [activeBeast]);

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
  const handleStartMatchmaking = () => {
    sound.playClick();
    setIsMatchmaking(true);
    setMatchCountdown(3);

    // Pick opponents from dogs & cats
    const randomOpp1 = eligibleChallengers[Math.floor(Math.random() * eligibleChallengers.length)];
    const randomOpp2 =
      eligibleChallengers.find((b) => b.id !== randomOpp1.id) || eligibleChallengers[0];
    const allyFighter =
      safeDeck.find((b) => b.id !== currentActiveFighter.id) || eligibleChallengers[2];

    const randomNames = [
      'Trainer Axel',
      'Champion Maya',
      'Kenji & Hachi',
      'Sarah Prowler',
      'Leo Apex',
      'Master Vance',
    ];
    setSelectedOpponent(randomOpp1);
    setOpponentAlly(randomOpp2);
    setPlayerAlly(allyFighter);
    setOpponentTrainer(randomNames[Math.floor(Math.random() * randomNames.length)]);

    const timer = setInterval(() => {
      setMatchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startSlamMatch(randomOpp1, randomOpp2, allyFighter);
          return 0;
        }
        sound.playBell();
        return prev - 1;
      });
    }, 900);
  };

  // Initialize and launch match
  const startSlamMatch = (opp: Animal, oppAlly?: Animal, ally?: Animal) => {
    setIsMatchmaking(false);
    setInBattle(true);
    setBattleOver(false);
    setBattleResult(null);
    setBattleTimerSec(180);

    const pHp = Math.round(currentActiveFighter.health || 1000);
    const oHp = Math.round(opp.health || 1000);
    setPlayerHp(pHp);
    setMaxPlayerHp(pHp);
    setGhostPlayerHp(pHp);
    setOpponentHp(oHp);
    setMaxOpponentHp(oHp);
    setGhostOpponentHp(oHp);

    if (battleMode === '2v2') {
      const aPet = ally || playerAlly;
      const oaPet = oppAlly || opponentAlly;
      const aHp = Math.round(aPet.health || 850);
      const oaHp = Math.round(oaPet.health || 850);
      setPlayerAlly(aPet);
      setOpponentAlly(oaPet);
      setPlayerAllyHp(aHp);
      setMaxPlayerAllyHp(aHp);
      setOpponentAllyHp(oaHp);
      setMaxOpponentAllyHp(oaHp);
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
  useEffect(() => {
    if (!inBattle || battleOver) return;

    // Double elixir during the last 60 seconds!
    const isDoubleElixir = battleTimerSec <= 60;
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
      setOpponentElixir((prev) => Math.min(10, Number((prev + 0.32).toFixed(1))));
    }, intervalRate);

    return () => clearInterval(interval);
  }, [inBattle, battleOver, battleTimerSec, hasAnnouncedOverdrive]);

  // AI Opponent Tactical Loop
  useEffect(() => {
    if (!inBattle || battleOver || isPracticeDrill) return;

    const aiInterval = setInterval(() => {
      if (battleOver || isPracticeDrill) return;

      const aiRoll = Math.random();

      if (opponentElixir >= 6 && aiRoll < 0.28) {
        // AI Ultimate SLAM
        setOpponentElixir((prev) => Math.max(0, prev - 6));
        setOpponentIntent('🔥 PET SLAM OVERDRIVE!');
        executeOpponentAttack(
          Math.round(selectedOpponent.damage * 1.6),
          'CLASH SLAM!',
          true
        );
      } else if (opponentElixir >= 4 && aiRoll < 0.55) {
        // AI Heavy Strike
        setOpponentElixir((prev) => Math.max(0, prev - 4));
        setOpponentIntent('🐾 Ripping Claw Strike');
        executeOpponentAttack(Math.round(selectedOpponent.damage * 1.15), 'Fierce Bite');
      } else if (opponentElixir >= 2 && !isOpponentShielded && aiRoll < 0.75) {
        // AI Guard
        setOpponentElixir((prev) => Math.max(0, prev - 2));
        setIsOpponentShielded(true);
        setOpponentIntent('🛡️ Iron Guard Active');
        sound.playBlock();
      } else if (opponentElixir >= 2) {
        // AI Quick Pounce
        setOpponentElixir((prev) => Math.max(0, prev - 2));
        setOpponentIntent('⚡ Quick Jab Strike');
        executeOpponentAttack(Math.round(selectedOpponent.damage * 0.75), 'Quick Pounce');
      }
    }, 2800);

    return () => clearInterval(aiInterval);
  }, [inBattle, battleOver, opponentElixir, isOpponentShielded, selectedOpponent]);

  // Execute Opponent Attack against Player
  const executeOpponentAttack = (rawDmg: number, moveName: string, isUlt = false) => {
    setOpponentAnim('clash');
    setLastCombatLog(`⚠️ ${selectedOpponent.name} launches ${moveName}!`);

    const finalDamage = Math.round(isPlayerShielded ? rawDmg * 0.4 : rawDmg);
    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'opponent',
      type: isUlt ? 'slam' : 'bite',
      damage: finalDamage,
      isCrit: isUlt,
      isBlocked: isPlayerShielded,
    });

    setTimeout(() => {
      if (isPlayerShielded) {
        setIsPlayerShielded(false);
        addPopup('BLOCKED 60%!', 'block', 140, 220);
        sound.playBlock();
      } else {
        sound.playImpact();
        setComboCount(0);
        setComboLabel('');
      }

      setPlayerHp((prev) => {
        const next = Math.max(0, prev - finalDamage);
        setTimeout(() => setGhostPlayerHp(next), 350);
        if (next === 0) handleMatchConclusion(false);
        return next;
      });

      setPlayerAnim('hit');

      setTimeout(() => {
        setOpponentAnim('idle');
        setPlayerAnim('idle');
      }, 400);
    }, isUlt ? 550 : 320);
  };

  // Player Plays an Action Card
  const handlePlayCard = (cardType: 'pounce' | 'bark' | 'shield' | 'bite' | 'slam') => {
    if (!inBattle || battleOver) return;

    const costs = { pounce: 2, bark: 3, shield: 2, bite: 4, slam: 6 };
    const cost = costs[cardType];

    if (elixir < cost) {
      sound.playClick();
      return;
    }

    setElixir((prev) => Math.max(0, Number((prev - cost).toFixed(1))));

    if (cardType === 'shield') {
      setIsPlayerShielded(true);
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

    if (cardType === 'pounce') multiplier = 0.8;
    if (cardType === 'bark') multiplier = 0.95;
    if (cardType === 'bite') multiplier = 1.35;
    if (cardType === 'slam') {
      multiplier = 2.1;
      isCrit = true;
    }

    let totalDmg = Math.round(baseDamage * multiplier);
    if (isOpponentShielded) {
      totalDmg = Math.round(totalDmg * 0.4);
    }

    // Trigger Canvas 60 FPS Combat Action Sequence
    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'player',
      type: cardType,
      damage: totalDmg,
      isCrit,
      isBlocked: isOpponentShielded,
    });

    setTimeout(() => {
      if (isOpponentShielded) {
        setIsOpponentShielded(false);
        addPopup('SHIELD DEFLECTED!', 'block', 170, 80);
        sound.playBlock();
      } else {
        sound.playImpact();
      }

      setOpponentHp((prev) => {
        const next = Math.max(0, prev - totalDmg);
        setTimeout(() => setGhostOpponentHp(next), 350);
        if (next === 0) handleMatchConclusion(true);
        return next;
      });

      setOpponentAnim('hit');

      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 400);
    }, cardType === 'slam' ? 550 : 320);
  };

  // Tag-In Swap to another Dog/Cat from 4-Pet Squad
  const handleTagIn = (beast: Animal) => {
    if (beast.id === currentActiveFighter.id || !inBattle || battleOver) return;

    sound.playCardPlay();
    setCurrentActiveFighter(beast);
    selectActiveBeast(beast.id);
    setLastCombatLog(`🔁 Tag-in! ${beast.name} enters with 75 DMG slam!`);

    setCurrentCanvasAction({
      id: Date.now(),
      attacker: 'player',
      type: 'slam',
      damage: 75,
      isCrit: true,
      isBlocked: false,
    });

    // Tag-In landing impact (deals instant 75 damage)
    setPlayerAnim('slam');
    setTimeout(() => {
      sound.playImpact();
      setOpponentHp((prev) => {
        const next = Math.max(0, prev - 75);
        setTimeout(() => setGhostOpponentHp(next), 350);
        if (next === 0) handleMatchConclusion(true);
        return next;
      });
      addPopup('TAG IMPACT -75!', 'crit', 170, 80);
      setOpponentAnim('hit');
      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 350);

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
    if (!inBattle || battleOver) return;
    sound.playClick();
    handleMatchConclusion(false);
  };

  // Match Finished
  const handleMatchConclusion = (won: boolean) => {
    setBattleOver(true);
    setBattleResult(won ? 'victory' : 'defeat');
    setAnnouncerText(won ? '🏆 K.O.! VICTORY!' : '💀 K.O.! DEFEATED');
    setAnnouncerPulse(true);

    if (won) {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }

    recordMatchResult(won, selectedOpponent, 3);
  };

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
      className={`flex flex-col h-full bg-[#080B12] text-white select-none overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* =========================================================================
          VIEW 1: ARENA LOBBY (Pet Slam 1v1 Queue)
         ========================================================================= */}
      {!inBattle && (
        <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-y-auto space-y-3 max-w-lg mx-auto w-full pb-28 overscroll-contain">
          {/* Header Stadium Banner */}
          <div className="bg-gradient-to-r from-[#131B2D] via-[#1A2640] to-[#131B2D] border border-white/10 rounded-2xl p-3.5 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Colosseum League</span>
              </span>
              <span className="text-[#CCFF00] font-black">{trophies} 🏆 Trophies</span>
            </div>

            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-white">
              Pet Slam Arena
            </h2>
            <p className="text-[10px] sm:text-[11px] text-neutral-300 font-mono mt-0.5">
              Real-Time 1v1 Pet Duels · Purebred Canines & Felines · 60 FPS Animated Combat
            </p>
          </div>

          {/* Interactive Combat Practice Drill Banner (Auto-prompted for 1st-time visitors, replayable anytime) */}
          {showTutorialPrompt ? (
            <div className="bg-gradient-to-r from-amber-950/70 via-[#151F35] to-amber-950/70 border-2 border-[#CCFF00]/60 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(204,255,0,0.2)] relative overflow-hidden animate-in fade-in">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black font-black flex items-center justify-center text-lg shadow shrink-0">
                    🥋
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-xs uppercase text-white tracking-wider">
                        Interactive Combat Practice Drill
                      </span>
                      <span className="text-[8px] font-mono bg-[#CCFF00] text-black px-1.5 py-0.2 rounded font-bold">
                        +250 CR
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-neutral-300 font-mono mt-0.5 leading-snug">
                      Master Pounce [1], Iron Guard [3], Overdrive [SPACE], and Tag-Ins in 30 seconds!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSkipTutorial}
                  className="text-neutral-400 hover:text-white text-[10px] font-mono underline cursor-pointer shrink-0"
                  title="Skip practice tutorial"
                >
                  Skip
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={startPracticeDrill}
                  className="flex-1 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow active:scale-95 transition-transform"
                >
                  Start 30s Practice Drill 🥋
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <span>🥋</span>
                <span>Dojo Practice Complete</span>
              </span>
              <button
                onClick={startPracticeDrill}
                className="text-[#CCFF00] hover:underline font-bold text-[11px] cursor-pointer"
              >
                Replay 30s Drill ↺
              </button>
            </div>
          )}

          {/* 1v1 vs 2v2 Mode Switcher */}
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-2xl max-w-xs mx-auto w-full shadow-md">
            <button
              onClick={() => {
                sound.playClick();
                setBattleMode('1v1');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                battleMode === '1v1'
                  ? 'bg-[#CCFF00] text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ⚔️ 1v1 Ranked
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setBattleMode('2v2');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                battleMode === '2v2'
                  ? 'bg-[#CCFF00] text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              👥 2v2 Tag Team
            </button>
          </div>

          {/* Active Champion or 2v2 Tag Team Showcase */}
          <div className="py-2 flex flex-col items-center">
            {battleMode === '2v2' ? (
              <div className="flex items-center justify-center gap-3">
                {/* Lead Fighter Card */}
                <div className="relative group flex flex-col items-center">
                  <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.25)] bg-black relative">
                    <img
                      src={currentActiveFighter.image}
                      alt={currentActiveFighter.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.2 rounded-full border border-white/20 text-[9px] font-mono font-bold text-[#CCFF00]">
                      LEAD
                    </div>
                    <div className="absolute bottom-1.5 inset-x-1.5 text-center">
                      <div className="font-display font-black text-xs text-white uppercase truncate">
                        {currentActiveFighter.name}
                      </div>
                      <div className="text-[8px] text-[#CCFF00] font-mono truncate">
                        {currentActiveFighter.breed}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="font-display font-black text-lg text-amber-400 tracking-wider">
                  +
                </div>

                {/* Ally Partner Card */}
                <div className="relative group flex flex-col items-center">
                  <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.25)] bg-black relative">
                    <img
                      src={playerAlly.image}
                      alt={playerAlly.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.2 rounded-full border border-white/20 text-[9px] font-mono font-bold text-cyan-300">
                      PARTNER
                    </div>
                    <div className="absolute bottom-1.5 inset-x-1.5 text-center">
                      <div className="font-display font-black text-xs text-white uppercase truncate">
                        {playerAlly.name}
                      </div>
                      <div className="text-[8px] text-cyan-300 font-mono truncate">
                        {playerAlly.breed}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single 1v1 Champion Card */
              <div className="relative group">
                <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-3xl overflow-hidden border-3 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.25)] bg-black relative">
                  <img
                    src={currentActiveFighter.image}
                    alt={currentActiveFighter.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 rounded-full border border-white/20 text-[10px] font-mono font-bold text-[#CCFF00]">
                    LVL {currentActiveFighter.level || 10}
                  </div>

                  <div className={`absolute top-2.5 right-2.5 ${getRarityBadgeClasses(currentActiveFighter.rarity)}`}>
                    {currentActiveFighter.rarity}
                  </div>

                  <div className="absolute bottom-2.5 inset-x-3 text-center">
                    <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider truncate">
                      {currentActiveFighter.name}
                    </h3>
                    <div className="text-[10px] text-[#CCFF00] font-mono font-bold">
                      {currentActiveFighter.breed} · {currentActiveFighter.combatArchetype}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Combat Specs Pills */}
            <div className="flex items-center gap-2.5 mt-2.5 text-xs font-mono">
              <span className="bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-xl font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>{currentActiveFighter.health} HP</span>
              </span>
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-xl font-bold flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentActiveFighter.damage} DMG</span>
              </span>
              <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-xl font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentActiveFighter.topSpeedKmh} KM/H</span>
              </span>
            </div>
          </div>

          {/* 4-Pet Battle Squad Drawer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="font-bold text-white uppercase">Your 4-Pet Battle Squad</span>
              <span>Tap pet to set Lead</span>
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
                    className={`p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                      isSelected
                        ? 'bg-[#CCFF00]/15 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)] scale-102'
                        : 'bg-[#121622] border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/15 aspect-square mb-1">
                      <img
                        src={petFighter.image}
                        alt={petFighter.name}
                        className="w-full h-full object-cover object-center aspect-square"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate w-full">
                      {petFighter.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#CCFF00]">
                      LV.{petFighter.level || 10}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Big Action Battle Launch Button */}
            <button
              onClick={handleStartMatchmaking}
              disabled={isMatchmaking}
              className="w-full py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 mt-1"
            >
              {isMatchmaking ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Matching Opponent... ({matchCountdown}s)</span>
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 text-black" />
                  <span>
                    {battleMode === '2v2'
                      ? 'Enter Arena (2v2 Tag Team)'
                      : 'Enter Arena (Ranked 1v1 Slam)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE 60 FPS PET SLAM BATTLE ARENA (ANIMATED & IMMERSIVE)
         ========================================================================= */}
      {inBattle && (
        <div
          className={`flex-1 flex flex-col justify-between p-2 sm:p-2.5 relative max-w-lg mx-auto w-full h-full overflow-hidden select-none ${
            screenShake ? 'animate-arenaShake' : ''
          }`}
        >
          {/* Floating Damage Numbers */}
          {damagePopups.map((p) => (
            <div
              key={p.id}
              className={`absolute pointer-events-none font-display font-black text-sm sm:text-base z-50 animate-out fade-out slide-out-to-top-8 duration-1000 ${
                p.type === 'crit'
                  ? 'text-[#CCFF00] text-lg sm:text-xl drop-shadow-[0_2px_10px_rgba(204,255,0,0.9)]'
                  : p.type === 'block'
                  ? 'text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,229,255,0.8)]'
                  : p.type === 'player'
                  ? 'text-red-400'
                  : 'text-amber-300'
              }`}
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.text}
            </div>
          ))}

          {/* 0. DOJO PRACTICE DRILL PROGRESS BAR */}
          {isPracticeDrill && (
            <div className="bg-gradient-to-r from-[#121A2E] via-[#1A2642] to-[#121A2E] border-2 border-[#CCFF00]/50 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-mono shadow-md">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <span className="text-[#CCFF00] font-black flex items-center gap-1">
                  <span>🥋</span>
                  <span>DOJO DRILL:</span>
                </span>
                <span className={practiceStep === 1 ? 'text-[#CCFF00] font-black underline' : (practiceStep && practiceStep > 1) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {(practiceStep && practiceStep > 1) ? '✓ 1.Pounce' : '1.Pounce'}
                </span>
                <span className="text-neutral-600">›</span>
                <span className={practiceStep === 2 ? 'text-[#CCFF00] font-black underline' : (practiceStep && practiceStep > 2) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {(practiceStep && practiceStep > 2) ? '✓ 2.Guard' : '2.Guard'}
                </span>
                <span className="text-neutral-600">›</span>
                <span className={practiceStep === 3 ? 'text-[#CCFF00] font-black underline' : (practiceStep && practiceStep > 3) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {(practiceStep && practiceStep > 3) ? '✓ 3.SLAM' : '3.SLAM'}
                </span>
                <span className="text-neutral-600">›</span>
                <span className={practiceStep === 4 ? 'text-[#CCFF00] font-black underline' : 'text-neutral-500'}>
                  4.Tag-In
                </span>
              </div>
              <button
                onClick={handleSkipTutorial}
                className="text-neutral-400 hover:text-white text-[10px] underline cursor-pointer shrink-0"
              >
                Skip Drill ✕
              </button>
            </div>
          )}

          {/* 1. MATCH STATUS & ARENA THEME SELECTOR BAR */}
          <div className="flex items-center justify-between bg-[#101524] border border-white/10 rounded-xl px-2.5 py-1 shrink-0 shadow-sm gap-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-black bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{battleMode === '2v2' ? '2v2 TAG TEAM' : 'SLAM 1v1'}</span>
              </span>
            </div>

            {/* Switchable Arena Aesthetic Themes */}
            <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-lg border border-white/10 shrink-0">
              {(
                [
                  { id: 'stadium', label: 'Stadium', icon: '🏟️' },
                  { id: 'cyber', label: 'Cyber', icon: '⚡' },
                  { id: 'dojo', label: 'Dojo', icon: '🏮' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setArenaTheme(t.id);
                  }}
                  title={`Switch to ${t.label} Arena`}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    arenaTheme === t.id
                      ? 'bg-[#CCFF00] text-black shadow-xs font-black'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs font-black shrink-0">
              <Timer className={`w-3.5 h-3.5 ${battleTimerSec <= 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              <span className={battleTimerSec <= 60 ? 'text-red-400 animate-pulse' : 'text-amber-300'}>
                {formatTimer(battleTimerSec)}
              </span>
              {battleTimerSec <= 60 && (
                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase font-bold animate-bounce hidden sm:inline">
                  2X
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setVoiceRoomOpen(true)}
                className="flex items-center gap-1 text-[10px] font-mono font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                title="Party Voice Chat"
              >
                <Radio className="w-3 h-3 text-purple-300" />
                <span className="hidden sm:inline">Voice</span>
              </button>

              <button
                onClick={handleForfeit}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-neutral-400 hover:text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                title="Surrender Match"
              >
                <Flag className="w-3 h-3" />
                <span className="hidden sm:inline">Forfeit</span>
              </button>
            </div>
          </div>

          {/* 2. OPPONENT HUD BAR (Dual-layer HP Bar with 2v2 Tag Partner support) */}
          <div className="bg-[#121828]/95 border border-red-500/30 rounded-xl px-2.5 py-1.5 shadow shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-500 bg-black shrink-0 shadow-xs">
                <img
                  src={getPetPhoto(selectedOpponent)}
                  alt={selectedOpponent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-display font-black text-xs text-white uppercase truncate">
                    {selectedOpponent.name}
                  </span>
                  <span className="text-[8px] bg-red-500/20 text-red-300 font-mono px-1 rounded uppercase">
                    {selectedOpponent.breed}
                  </span>
                </div>
                {/* Esports Parallelogram Skewed HP Bar with Delayed Damage Drain Trail */}
                <div className="relative -skew-x-12 overflow-hidden bg-neutral-950 border border-red-500/40 h-2.5 sm:h-3.5 w-28 sm:w-44 rounded-xs mt-1 shadow-inner">
                  {/* Delayed gold/white damage drain trail */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 to-yellow-100 transition-all duration-700 ease-out opacity-85"
                    style={{ width: `${(ghostOpponentHp / maxOpponentHp) * 100}%` }}
                  />
                  {/* Real-time active HP */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                    style={{ width: `${(opponentHp / maxOpponentHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2v2 Opponent Partner Mini HUD */}
            {battleMode === '2v2' && (
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 shrink-0">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-400 bg-black shrink-0 shadow-xs">
                  <img
                    src={getPetPhoto(opponentAlly)}
                    alt={opponentAlly.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-[9px] font-bold text-amber-300 truncate max-w-[65px]">
                    {opponentAlly.name}
                  </div>
                  <div className="w-14 sm:w-20 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 mt-0.5">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${(opponentAllyHp / maxOpponentAllyHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-right shrink-0">
              <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block truncate max-w-[110px]">
                {opponentIntent}
              </span>
              <span className="text-[8px] font-mono text-neutral-400 tabular-nums">
                {opponentHp} / {maxOpponentHp} HP
              </span>
            </div>
          </div>

          {/* 3. 60 FPS HTML5 CANVAS BATTLE ARENA STAGE (Supports 1v1 and 2v2) */}
          <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-white/15 shadow-[0_0_35px_rgba(0,0,0,0.9)] my-1 min-h-[240px] max-h-[350px] flex items-center justify-center bg-black">
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
              className="w-full h-full absolute inset-0"
            />

            {/* Esports Broadcast Announcer Callout Banner */}
            {announcerText && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-95 duration-200">
                <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-black/90 via-[#10172A]/95 to-black/90 border-2 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.5)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#CCFF00] animate-spin" />
                  <span className="font-display font-black text-xs sm:text-sm text-[#CCFF00] tracking-widest uppercase italic">
                    {announcerText}
                  </span>
                </div>
              </div>
            )}

            {/* Real-time Combo Counter Badge */}
            {comboCount >= 2 && (
              <div className="absolute bottom-3 right-3 z-20 pointer-events-none animate-bounce">
                <div className="px-2.5 py-1 rounded-lg bg-black/85 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5">
                  <span className="font-display font-black text-xs text-amber-300 italic tracking-wider">
                    {comboLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Live Combat Announcement Ticker Banner */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-[#CCFF00]/40 shadow-[0_0_15px_rgba(204,255,0,0.25)] flex items-center gap-1.5 z-20 pointer-events-none max-w-[85%]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping shrink-0" />
              <span className="font-display font-black text-[10px] sm:text-[11px] text-[#CCFF00] tracking-wider uppercase truncate">
                {lastCombatLog || 'PET SLAM LIVE ARENA'}
              </span>
            </div>

            {/* Theme Overlay Watermark Pill */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-neutral-400 pointer-events-none uppercase">
              {arenaTheme} ARENA · {battleMode === '2v2' ? '2v2 TAG TEAM' : '60 FPS'}
            </div>
          </div>

          {/* 4. PLAYER HUD & SQUAD SWITCHER BAR (with 2v2 Co-op Ally support) */}
          <div className="bg-[#121828]/95 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 shadow shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-400 bg-black shrink-0 shadow-xs">
                <img
                  src={getPetPhoto(currentActiveFighter)}
                  alt={currentActiveFighter.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-display font-black text-xs text-white uppercase truncate">
                    {currentActiveFighter.name}
                  </span>
                  <span className="text-[8px] bg-cyan-500/20 text-cyan-300 font-mono px-1 rounded uppercase">
                    {currentActiveFighter.breed}
                  </span>
                </div>
                {/* Esports Parallelogram Skewed HP Bar with Delayed Damage Drain Trail */}
                <div className="relative -skew-x-12 overflow-hidden bg-neutral-950 border border-cyan-400/40 h-2.5 sm:h-3.5 w-28 sm:w-44 rounded-xs mt-1 shadow-inner">
                  {/* Delayed gold/white damage drain trail */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 to-yellow-100 transition-all duration-700 ease-out opacity-85"
                    style={{ width: `${(ghostPlayerHp / maxPlayerHp) * 100}%` }}
                  />
                  {/* Real-time active HP */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#CCFF00] transition-all duration-150 shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                    style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2v2 Player Ally Mini HUD */}
            {battleMode === '2v2' && (
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 shrink-0">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-400 bg-black shrink-0 shadow-xs">
                  <img
                    src={getPetPhoto(playerAlly)}
                    alt={playerAlly.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-[9px] font-bold text-cyan-300 truncate max-w-[65px]">
                    {playerAlly.name}
                  </div>
                  <div className="w-14 sm:w-20 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 mt-0.5">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${(playerAllyHp / maxPlayerAllyHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Squad Tag-In Drawer with Desktop Hotkey Hints [Q/W/E/R] */}
            <div className="flex items-center gap-1 shrink-0">
              {safeDeck.map((b, idx) => {
                const hotkeyLetters = ['Q', 'W', 'E', 'R'];
                const letter = hotkeyLetters[idx];
                const isKeyActive = pressedHotkey === letter?.toLowerCase();
                return (
                  <button
                    key={b.id}
                    onClick={() => handleTagIn(b)}
                    title={`[${letter}] Tag in ${b.name} (Instant 75 DMG slam)`}
                    className={`w-7 h-7 rounded-lg overflow-hidden border cursor-pointer transition-all relative active:scale-95 ${
                      b.id === currentActiveFighter.id
                        ? 'border-[#CCFF00] ring-1 ring-[#CCFF00]'
                        : isPracticeDrill && practiceStep === 4
                        ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_12px_#00E5FF] animate-pulse scale-105'
                        : isKeyActive
                        ? 'border-cyan-400 ring-2 ring-cyan-400 scale-95'
                        : 'border-white/20 hover:border-white/50 opacity-60'
                    }`}
                  >
                    <img
                      src={getPetPhoto(b)}
                      alt={b.name}
                      className="w-full h-full object-cover aspect-square"
                    />
                    {letter && (
                      <span className="absolute bottom-0 right-0 px-0.5 bg-black/80 text-[7px] font-mono font-bold text-[#CCFF00] rounded-tl leading-none">
                        {letter}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SLAM ENERGY GAUGE BAR (1 TO 10 ENERGY) */}
          <div className="space-y-1 shrink-0 bg-black/60 p-2 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-mono leading-none">
              <span className="text-cyan-300 font-extrabold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SLAM ENERGY</span>
              </span>
              <span className="font-black text-[#CCFF00] text-sm">{Math.floor(elixir)} / 10 ⚡</span>
            </div>

            <div className="h-3 bg-neutral-950 rounded-full overflow-hidden border border-white/20 p-0.5 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full rounded-xs transition-all duration-200 ${
                    i < Math.floor(elixir)
                      ? 'bg-gradient-to-r from-cyan-400 to-[#CCFF00] shadow-[0_0_8px_#ccff00]'
                      : 'bg-neutral-800/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 6. SLAM ACTION MOVES DOCK (With Desktop Hotkeys [1-4, SPACE] & Mobile Thumb Arc) */}
          <div className="grid grid-cols-5 gap-1.5 shrink-0">
            {/* Card 1: Quick Pounce (2 Energy / Hotkey [1]) */}
            <button
              onClick={() => handlePlayCard('pounce')}
              disabled={elixir < 2}
              className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer h-14 sm:h-16 relative shadow-md ${
                isPracticeDrill && practiceStep === 1
                  ? 'bg-cyan-500/40 border-[#CCFF00] ring-4 ring-[#CCFF00] shadow-[0_0_25px_#CCFF00] scale-105 animate-pulse text-white'
                  : elixir >= 2
                  ? pressedHotkey === '1'
                    ? 'bg-cyan-500/40 border-cyan-300 ring-2 ring-cyan-400 scale-95 text-white'
                    : 'bg-[#121A2C] hover:bg-[#1A253E] border-cyan-400 text-white shadow active:scale-95'
                  : 'bg-neutral-950 border-white/10 text-neutral-500 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-black text-cyan-300">2 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/80 border border-cyan-400/60 text-cyan-300 font-black hidden sm:inline">
                  [1]
                </span>
              </div>
              <span className="text-base">🐾</span>
              <span className="text-xs font-black uppercase tracking-wider truncate text-white">Pounce</span>
            </button>

            {/* Card 2: Sonic Bark / Hiss (3 Energy / Hotkey [2]) */}
            <button
              onClick={() => handlePlayCard('bark')}
              disabled={elixir < 3}
              className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer h-14 sm:h-16 relative shadow-md ${
                elixir >= 3
                  ? pressedHotkey === '2'
                    ? 'bg-amber-500/40 border-amber-300 ring-2 ring-amber-400 scale-95 text-white'
                    : 'bg-[#121A2C] hover:bg-[#1A253E] border-amber-400 text-white shadow active:scale-95'
                  : 'bg-neutral-950 border-white/10 text-neutral-500 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-black text-amber-300">3 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/80 border border-amber-400/60 text-amber-300 font-black hidden sm:inline">
                  [2]
                </span>
              </div>
              <span className="text-base">📢</span>
              <span className="text-xs font-black uppercase tracking-wider truncate text-white">Bark</span>
            </button>

            {/* Card 3: Iron Guard (2 Energy / Hotkey [3]) */}
            <button
              onClick={() => handlePlayCard('shield')}
              disabled={elixir < 2}
              className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer h-14 sm:h-16 relative shadow-md ${
                isPracticeDrill && practiceStep === 2
                  ? 'bg-blue-600/50 border-blue-300 ring-4 ring-blue-400 shadow-[0_0_25px_#38BDF8] scale-105 animate-pulse text-white'
                  : elixir >= 2
                  ? pressedHotkey === '3'
                    ? 'bg-blue-500/40 border-blue-300 ring-2 ring-blue-400 scale-95 text-white'
                    : 'bg-[#121A2C] hover:bg-[#1A253E] border-blue-400 text-white shadow active:scale-95'
                  : 'bg-neutral-950 border-white/10 text-neutral-500 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-black text-blue-300">2 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/80 border border-blue-400/60 text-blue-300 font-black hidden sm:inline">
                  [3]
                </span>
              </div>
              <span className="text-base">🛡️</span>
              <span className="text-xs font-black uppercase tracking-wider truncate text-white">Guard</span>
            </button>

            {/* Card 4: Fierce Bite (4 Energy / Hotkey [4]) */}
            <button
              onClick={() => handlePlayCard('bite')}
              disabled={elixir < 4}
              className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer h-14 sm:h-16 relative shadow-md ${
                elixir >= 4
                  ? pressedHotkey === '4'
                    ? 'bg-red-500/40 border-red-300 ring-2 ring-red-400 scale-95 text-white'
                    : 'bg-[#121A2C] hover:bg-[#1A253E] border-red-400 text-white shadow active:scale-95'
                  : 'bg-neutral-950 border-white/10 text-neutral-500 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-black text-rose-300">4 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/80 border border-red-400/60 text-rose-300 font-black hidden sm:inline">
                  [4]
                </span>
              </div>
              <span className="text-base">💥</span>
              <span className="text-xs font-black uppercase tracking-wider truncate text-white">Bite</span>
            </button>

            {/* Card 5: PET SLAM / DUO SLAM OVERDRIVE (6 Energy / Hotkey [SPACE]) */}
            <button
              onClick={() => handlePlayCard('slam')}
              disabled={elixir < 6}
              className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer h-14 sm:h-16 relative shadow-xl ${
                isPracticeDrill && practiceStep === 3
                  ? 'bg-[#CCFF00] border-white ring-4 ring-[#CCFF00] shadow-[0_0_30px_#CCFF00] scale-105 animate-bounce text-black'
                  : elixir >= 6
                  ? pressedHotkey === 'space'
                    ? 'bg-[#CCFF00] border-white ring-4 ring-[#CCFF00] scale-95 text-black'
                    : 'bg-gradient-to-b from-[#CCFF00] via-yellow-300 to-amber-500 border-white text-black shadow-[0_0_20px_rgba(204,255,0,0.85)] active:scale-95 animate-pulse'
                  : 'bg-neutral-950 border-white/10 text-neutral-500 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-mono font-black text-black">6 ⚡</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black text-[#CCFF00] font-black hidden sm:inline">
                  [SPC]
                </span>
              </div>
              <span className="text-base">⚡</span>
              <span className="text-xs font-black uppercase tracking-wider truncate text-black drop-shadow-xs">
                {battleMode === '2v2' ? 'DUO SLAM' : 'SLAM'}
              </span>
            </button>
          </div>

          {/* =========================================================================
              DOJO PRACTICE DRILL COMPLETION MODAL (+250 SLAM CREDITS)
             ========================================================================= */}
          {practiceCompleted && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#101626] border-2 border-[#CCFF00] rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black text-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(204,255,0,0.6)]">
                  🥋
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#CCFF00] uppercase tracking-wider">
                    Dojo Drill Mastered!
                  </h2>
                  <p className="text-[11px] text-neutral-300 font-mono mt-1">
                    You've mastered Pounce strikes, Shield deflection, SLAM Overdrive, and Squad tag-ins!
                  </p>
                </div>
                <div className="p-3 bg-black/50 rounded-2xl border border-[#CCFF00]/40 font-mono text-sm font-bold text-[#CCFF00]">
                  🎉 +250 Slam Credits Awarded!
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPracticeDrill(false);
                    setPracticeCompleted(false);
                    setInBattle(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95"
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
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#121728] border-2 border-white/20 rounded-3xl p-5 sm:p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                    battleResult === 'victory'
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_30px_rgba(204,255,0,0.6)]'
                      : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                  }`}
                >
                  {battleResult === 'victory' ? (
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <Swords className="w-7 h-7 sm:w-8 sm:h-8" />
                  )}
                </div>

                <div>
                  <h2
                    className={`font-display font-black text-xl sm:text-2xl uppercase tracking-wider ${
                      battleResult === 'victory' ? 'text-[#CCFF00]' : 'text-red-400'
                    }`}
                  >
                    {battleResult === 'victory' ? 'VICTORY SLAM!' : 'DEFEATED'}
                  </h2>
                  <p className="text-[11px] text-neutral-300 font-mono mt-1">
                    {battleResult === 'victory'
                      ? 'Flawless arena victory! Ranking trophies awarded.'
                      : 'Close battle! Train your dog or cat and strike back.'}
                  </p>
                </div>

                {battleResult === 'victory' && (
                  <div className="p-2.5 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-around font-mono text-xs font-bold">
                    <span className="text-[#CCFF00]">+30 🏆 Trophies</span>
                    <span className="text-amber-300">+450 🪙 Coins</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      startSlamMatch(selectedOpponent);
                    }}
                    className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-98 transition-transform"
                  >
                    Rematch Duel
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setInBattle(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    Return to Arena Lobby
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multiplayer Voice Room Modal */}
      {voiceRoomOpen && (
        <FriendsVoiceRoomModal
          onClose={() => setVoiceRoomOpen(false)}
        />
      )}
    </div>
  );
};
