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
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { Animal, ANIMALS_DATA } from '../../../data/animals';
import { sound } from '../../../utils/audio';
import { usePetCompanion } from '../../../context/PetCompanionContext';

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

  // Match State
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleOver, setBattleOver] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);

  // Active Combatants
  const [currentActiveFighter, setCurrentActiveFighter] = useState<Animal>(activeBeast);
  useEffect(() => {
    setCurrentActiveFighter(activeBeast);
  }, [activeBeast]);

  // Battle HP & Stats
  const [playerHp, setPlayerHp] = useState<number>(1000);
  const [maxPlayerHp, setMaxPlayerHp] = useState<number>(1000);
  const [opponentHp, setOpponentHp] = useState<number>(1000);
  const [maxOpponentHp, setMaxOpponentHp] = useState<number>(1000);

  // Clash Royale Elixir System (0 to 10 Elixir, regenerating over time)
  const [elixir, setElixir] = useState<number>(4);
  const [opponentElixir, setOpponentElixir] = useState<number>(4);

  // Shields & Buffs
  const [isPlayerShielded, setIsPlayerShielded] = useState<boolean>(false);
  const [isOpponentShielded, setIsOpponentShielded] = useState<boolean>(false);

  // Visual Combat Animations ('idle' | 'clash_forward' | 'hit' | 'slam')
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'clash' | 'hit' | 'slam'>('idle');
  const [opponentAnim, setOpponentAnim] = useState<'idle' | 'clash' | 'hit' | 'slam'>('idle');
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [opponentIntent, setOpponentIntent] = useState<string>('Charging Elixir...');

  // 4-Pet Battle Deck
  const playerDeck = battleDeckIds
    .map((id) => ownedBeasts.find((b) => b.id === id))
    .filter((b): b is Animal => !!b);

  const safeDeck = playerDeck.length > 0 ? playerDeck : ownedBeasts.slice(0, 4);

  // Helper to spawn floating damage numbers
  const addPopup = (text: string, type: DamagePopup['type'], x: number, y: number) => {
    const id = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // Start Ranked Matchmaking Queue
  const handleStartMatchmaking = () => {
    sound.playClick();
    setIsMatchmaking(true);
    setMatchCountdown(3);

    // Pick a random opponent from dogs & cats
    const randomOpp = eligibleChallengers[Math.floor(Math.random() * eligibleChallengers.length)];
    const randomNames = [
      'Trainer Axel',
      'Champion Maya',
      'Kenji & Hachi',
      'Sarah Prowler',
      'Leo Apex',
      'Master Vance',
    ];
    setSelectedOpponent(randomOpp);
    setOpponentTrainer(randomNames[Math.floor(Math.random() * randomNames.length)]);

    const timer = setInterval(() => {
      setMatchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startClashMatch(randomOpp);
          return 0;
        }
        sound.playBell();
        return prev - 1;
      });
    }, 900);
  };

  // Initialize and launch match
  const startClashMatch = (opp: Animal) => {
    setIsMatchmaking(false);
    setInBattle(true);
    setBattleOver(false);
    setBattleResult(null);

    const pHp = Math.round(currentActiveFighter.health || 1000);
    const oHp = Math.round(opp.health || 1000);
    setPlayerHp(pHp);
    setMaxPlayerHp(pHp);
    setOpponentHp(oHp);
    setMaxOpponentHp(oHp);

    setElixir(5);
    setOpponentElixir(5);
    setIsPlayerShielded(false);
    setIsOpponentShielded(false);
    setOpponentIntent('⚡ Preparing Pounce...');
    sound.playBattleStart();
  };

  // Real-time Elixir Generation Loop (Clash Royale Style)
  useEffect(() => {
    if (!inBattle || battleOver) return;

    const interval = setInterval(() => {
      setElixir((prev) => Math.min(10, Number((prev + 0.35).toFixed(1))));
      setOpponentElixir((prev) => Math.min(10, Number((prev + 0.32).toFixed(1))));
    }, 450);

    return () => clearInterval(interval);
  }, [inBattle, battleOver]);

  // AI Opponent Tactical Loop
  useEffect(() => {
    if (!inBattle || battleOver) return;

    const aiInterval = setInterval(() => {
      if (battleOver) return;

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
    setTimeout(() => {
      let finalDamage = rawDmg;
      if (isPlayerShielded) {
        finalDamage = Math.round(rawDmg * 0.4); // 60% shield absorption
        setIsPlayerShielded(false);
        addPopup('BLOCKED 60%!', 'block', 120, 340);
        sound.playBlock();
      } else {
        sound.playImpact();
      }

      setPlayerHp((prev) => {
        const next = Math.max(0, prev - finalDamage);
        if (next === 0) handleMatchConclusion(false);
        return next;
      });

      addPopup(`-${finalDamage}`, 'player', 140, 360);
      setPlayerAnim('hit');

      if (isUlt) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }

      setTimeout(() => {
        setOpponentAnim('idle');
        setPlayerAnim('idle');
      }, 400);
    }, 350);
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
      addPopup('SHIELD READY!', 'block', 140, 350);
      return;
    }

    // Offensive moves clash forward
    setPlayerAnim(cardType === 'slam' ? 'slam' : 'clash');
    sound.playAttack();

    setTimeout(() => {
      let baseDamage = currentActiveFighter.damage;
      let multiplier = 1;
      let isCrit = false;

      if (cardType === 'pounce') multiplier = 0.8;
      if (cardType === 'bark') multiplier = 0.95;
      if (cardType === 'bite') multiplier = 1.35;
      if (cardType === 'slam') {
        multiplier = 2.1;
        isCrit = true;
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
      }

      let totalDmg = Math.round(baseDamage * multiplier);

      if (isOpponentShielded) {
        totalDmg = Math.round(totalDmg * 0.4);
        setIsOpponentShielded(false);
        addPopup('SHIELD DEFLECTED!', 'block', 180, 160);
        sound.playBlock();
      } else {
        sound.playImpact();
      }

      setOpponentHp((prev) => {
        const next = Math.max(0, prev - totalDmg);
        if (next === 0) handleMatchConclusion(true);
        return next;
      });

      addPopup(
        isCrit ? `💥 CRIT -${totalDmg}` : `-${totalDmg}`,
        isCrit ? 'crit' : 'opponent',
        180,
        140
      );

      setOpponentAnim('hit');

      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 400);
    }, 300);
  };

  // Tag-In Swap to another Dog/Cat from 4-Pet Squad
  const handleTagIn = (beast: Animal) => {
    if (beast.id === currentActiveFighter.id || !inBattle || battleOver) return;

    sound.playCardPlay();
    setCurrentActiveFighter(beast);
    selectActiveBeast(beast.id);

    // Tag-In landing impact (deals instant 75 damage)
    setPlayerAnim('clash');
    setTimeout(() => {
      sound.playImpact();
      setOpponentHp((prev) => {
        const next = Math.max(0, prev - 75);
        if (next === 0) handleMatchConclusion(true);
        return next;
      });
      addPopup('TAG IMPACT -75!', 'crit', 180, 160);
      setOpponentAnim('hit');
      setTimeout(() => {
        setPlayerAnim('idle');
        setOpponentAnim('idle');
      }, 350);
    }, 250);
  };

  // Match Finished
  const handleMatchConclusion = (won: boolean) => {
    setBattleOver(true);
    setBattleResult(won ? 'victory' : 'defeat');

    if (won) {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }

    recordMatchResult(won, selectedOpponent, 3);
  };

  const playerHpPct = Math.max(0, Math.min(100, (playerHp / maxPlayerHp) * 100));
  const oppHpPct = Math.max(0, Math.min(100, (opponentHp / maxOpponentHp) * 100));

  return (
    <div
      className={`flex flex-col h-full bg-[#080B12] text-white select-none overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* =========================================================================
          VIEW 1: ARENA LOBBY (Clash Royale Style Deck & Queue)
         ========================================================================= */}
      {!inBattle && (
        <div className="flex-1 flex flex-col p-3.5 sm:p-5 overflow-y-auto space-y-3 max-w-lg mx-auto w-full pb-28 overscroll-contain">
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
              Pet Clash Arena
            </h2>
            <p className="text-[10px] sm:text-[11px] text-neutral-300 font-mono mt-0.5">
              Real 1v1 Pet Duels · Real Dog & Cat Breeds · Skill-Based Clash
            </p>
          </div>

          {/* Active Champion Showcase */}
          <div className="py-2 flex flex-col items-center">
            <div className="relative group">
              <div className="w-44 h-52 sm:w-52 sm:h-60 rounded-3xl overflow-hidden border-3 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.25)] bg-black relative">
                <img
                  src={currentActiveFighter.image}
                  alt={currentActiveFighter.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 rounded-full border border-white/20 text-[10px] font-mono font-bold text-[#CCFF00]">
                  LVL {currentActiveFighter.level || 10}
                </div>

                <div className="absolute top-2.5 right-2.5 bg-purple-500/80 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase text-white">
                  {currentActiveFighter.category}
                </div>

                <div className="absolute bottom-2.5 inset-x-3 text-center">
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider truncate">
                    {currentActiveFighter.name}
                  </h3>
                  <div className="text-[10px] sm:text-[11px] text-[#CCFF00] font-mono font-bold">
                    {currentActiveFighter.species} · {currentActiveFighter.combatArchetype}
                  </div>
                </div>
              </div>
            </div>

            {/* Combat Specs Pills */}
            <div className="flex items-center gap-3 mt-3 text-xs font-mono">
              <span className="bg-red-500/15 text-red-300 border border-red-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>{currentActiveFighter.health} HP</span>
              </span>
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentActiveFighter.damage} DMG</span>
              </span>
              <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
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
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/15 aspect-square mb-1">
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
              className="w-full py-4 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 mt-2"
            >
              {isMatchmaking ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Matching Opponent... ({matchCountdown}s)</span>
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 text-black" />
                  <span>Battle Clash (Ranked 1v1)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE CLASH ROYALE COMBAT FIELD
         ========================================================================= */}
      {inBattle && (
        <div className="flex-1 flex flex-col justify-between p-3 relative max-w-md mx-auto w-full overflow-hidden">
          {/* Floating Damage Numbers */}
          {damagePopups.map((p) => (
            <div
              key={p.id}
              className={`absolute pointer-events-none font-display font-black text-base z-50 animate-out fade-out slide-out-to-top-8 duration-1000 ${
                p.type === 'crit'
                  ? 'text-[#CCFF00] text-xl drop-shadow-[0_2px_8px_rgba(204,255,0,0.8)]'
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

          {/* TOP ARENA: OPPONENT FIELD */}
          <div className="bg-[#121624]/90 border border-red-500/30 rounded-3xl p-3 shadow-lg relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500 shadow-md bg-black transition-transform duration-200 ${
                  opponentAnim === 'clash'
                    ? 'scale-115 translate-y-4'
                    : opponentAnim === 'hit'
                    ? 'opacity-60 -translate-y-2'
                    : ''
                }`}
              >
                <img
                  src={selectedOpponent.image}
                  alt={selectedOpponent.name}
                  className="w-full h-full object-cover object-center aspect-square"
                />
                {isOpponentShielded && (
                  <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-300 animate-pulse" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm text-white uppercase">
                    {selectedOpponent.name}
                  </span>
                  <span className="text-[9px] bg-red-500/20 text-red-300 font-mono px-1.5 py-0.2 rounded">
                    {selectedOpponent.breed}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{opponentTrainer}</div>

                {/* Opponent HP Bar */}
                <div className="w-36 sm:w-44 h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/10 mt-1 relative">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${oppHpPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white drop-shadow">
                    {opponentHp} / {maxOpponentHp} HP
                  </span>
                </div>
              </div>
            </div>

            {/* Opponent Live Intent */}
            <div className="text-right">
              <span className="text-[9px] font-mono text-neutral-400 block uppercase">Opponent Move</span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {opponentIntent}
              </span>
            </div>
          </div>

          {/* CENTRAL CLASH RIVER / IMPACT ZONE */}
          <div className="my-auto py-4 relative flex flex-col items-center justify-center">
            {/* Energy River line */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00e5ff]" />
            <div className="w-12 h-12 rounded-full bg-black border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.5)] flex items-center justify-center text-xs font-black text-[#CCFF00] my-[-24px] z-10">
              VS
            </div>
          </div>

          {/* BOTTOM ARENA: PLAYER CHAMPION FIELD */}
          <div className="bg-[#121624]/90 border border-cyan-500/30 rounded-3xl p-3 shadow-lg relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-md bg-black transition-transform duration-200 ${
                  playerAnim === 'clash'
                    ? 'scale-115 -translate-y-4'
                    : playerAnim === 'slam'
                    ? 'scale-125 -translate-y-6'
                    : playerAnim === 'hit'
                    ? 'opacity-60 translate-y-2'
                    : ''
                }`}
              >
                <img
                  src={currentActiveFighter.image}
                  alt={currentActiveFighter.name}
                  className="w-full h-full object-cover object-center aspect-square"
                />
                {isPlayerShielded && (
                  <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-300 animate-pulse" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm text-white uppercase">
                    {currentActiveFighter.name}
                  </span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.2 rounded">
                    {currentActiveFighter.breed}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  {trainerName} · Lead Champion
                </div>

                {/* Player HP Bar */}
                <div className="w-36 sm:w-44 h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/10 mt-1 relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${playerHpPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white drop-shadow">
                    {playerHp} / {maxPlayerHp} HP
                  </span>
                </div>
              </div>
            </div>

            {/* Squad Tag-In Drawer */}
            <div className="flex items-center gap-1.5">
              {safeDeck.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleTagIn(b)}
                  title={`Tag in ${b.name} (Impact: 75 DMG)`}
                  className={`w-9 h-9 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    b.id === currentActiveFighter.id
                      ? 'border-[#CCFF00] ring-1 ring-[#CCFF00]'
                      : 'border-white/20 hover:border-white/50 opacity-60'
                  }`}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    className="w-full h-full object-cover object-center aspect-square"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ELIXIR GAUGE BAR (1 TO 10 ELIXIR) */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>CLASH ELIXIR</span>
              </span>
              <span className="font-black text-[#CCFF00]">{Math.floor(elixir)} / 10 ⚡</span>
            </div>

            <div className="h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 p-0.5 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full rounded-sm transition-all duration-200 ${
                    i < Math.floor(elixir)
                      ? 'bg-gradient-to-r from-cyan-400 to-[#CCFF00] shadow-[0_0_8px_#ccff00]'
                      : 'bg-neutral-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CLASH ACTION CARDS HAND (Clash Royale Style Dock) */}
          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {/* Card 1: Quick Pounce (2 Elixir) */}
            <button
              onClick={() => handlePlayCard('pounce')}
              disabled={elixir < 2}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                elixir >= 2
                  ? 'bg-[#151D30] hover:bg-[#1C2640] border-cyan-400 text-white shadow-md active:scale-95'
                  : 'bg-neutral-900 border-white/10 text-neutral-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-cyan-400">2 ⚡</span>
              <span className="text-xs">🐾</span>
              <span className="text-[9px] font-bold uppercase truncate">Pounce</span>
            </button>

            {/* Card 2: Sonic Bark / Hiss (3 Elixir) */}
            <button
              onClick={() => handlePlayCard('bark')}
              disabled={elixir < 3}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                elixir >= 3
                  ? 'bg-[#151D30] hover:bg-[#1C2640] border-amber-400 text-white shadow-md active:scale-95'
                  : 'bg-neutral-900 border-white/10 text-neutral-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-amber-400">3 ⚡</span>
              <span className="text-xs">📢</span>
              <span className="text-[9px] font-bold uppercase truncate">Bark</span>
            </button>

            {/* Card 3: Iron Guard (2 Elixir) */}
            <button
              onClick={() => handlePlayCard('shield')}
              disabled={elixir < 2}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                elixir >= 2
                  ? 'bg-[#151D30] hover:bg-[#1C2640] border-blue-400 text-white shadow-md active:scale-95'
                  : 'bg-neutral-900 border-white/10 text-neutral-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-blue-400">2 ⚡</span>
              <span className="text-xs">🛡️</span>
              <span className="text-[9px] font-bold uppercase truncate">Guard</span>
            </button>

            {/* Card 4: Fierce Bite / Claw (4 Elixir) */}
            <button
              onClick={() => handlePlayCard('bite')}
              disabled={elixir < 4}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                elixir >= 4
                  ? 'bg-[#151D30] hover:bg-[#1C2640] border-red-400 text-white shadow-md active:scale-95'
                  : 'bg-neutral-900 border-white/10 text-neutral-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-red-400">4 ⚡</span>
              <span className="text-xs">💥</span>
              <span className="text-[9px] font-bold uppercase truncate">Bite</span>
            </button>

            {/* Card 5: PET SLAM OVERDRIVE (6 Elixir) */}
            <button
              onClick={() => handlePlayCard('slam')}
              disabled={elixir < 6}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                elixir >= 6
                  ? 'bg-gradient-to-b from-[#CCFF00] to-amber-500 border-white text-black shadow-[0_0_15px_rgba(204,255,0,0.6)] active:scale-95'
                  : 'bg-neutral-900 border-white/10 text-neutral-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-black">6 ⚡</span>
              <span className="text-xs">⚡</span>
              <span className="text-[9px] font-black uppercase truncate">SLAM</span>
            </button>
          </div>

          {/* =========================================================================
              MATCH RESULT MODAL OVERLAY (Victory / Defeat)
             ========================================================================= */}
          {battleOver && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#121728] border-2 border-white/20 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                    battleResult === 'victory'
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_30px_rgba(204,255,0,0.6)]'
                      : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                  }`}
                >
                  {battleResult === 'victory' ? (
                    <Trophy className="w-8 h-8" />
                  ) : (
                    <Swords className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h2
                    className={`font-display font-black text-2xl uppercase tracking-wider ${
                      battleResult === 'victory' ? 'text-[#CCFF00]' : 'text-red-400'
                    }`}
                  >
                    {battleResult === 'victory' ? 'VICTORY SLAM!' : 'DEFEATED'}
                  </h2>
                  <p className="text-xs text-neutral-300 font-mono mt-1">
                    {battleResult === 'victory'
                      ? 'Flawless clash victory! Ranking trophies awarded.'
                      : 'Close battle! Train your dog or cat and strike back.'}
                  </p>
                </div>

                {battleResult === 'victory' && (
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-around font-mono text-xs font-bold">
                    <span className="text-[#CCFF00]">+30 🏆 Trophies</span>
                    <span className="text-amber-300">+450 🪙 Coins</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      startClashMatch(selectedOpponent);
                    }}
                    className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
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
    </div>
  );
};
