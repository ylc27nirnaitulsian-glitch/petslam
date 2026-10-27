import React, { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Shield,
  Zap,
  Flame,
  Award,
  Crown,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { triggerVictoryExplosion } from '../../utils/confetti';
import { useGame } from '../../context/GameContext';
import { usePetCompanion } from '../../context/PetCompanionContext';
import {
  multiplayerNetcode,
  MatchFoundData,
  TickUpdateData,
  MatchFinishedData,
} from '../../services/multiplayerNetcode';
import { triggerHeavyImpactHaptic, triggerMediumImpactHaptic } from '../../utils/haptics';

interface RankedMatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RankedMatchmakingModal: React.FC<RankedMatchmakingModalProps> = ({ isOpen, onClose }) => {
  const { trainerName, playerTag, activeBeast, addCredits } = useGame();
  const { pet } = usePetCompanion();

  const [phase, setPhase] = useState<'idle' | 'queuing' | 'matched' | 'fighting' | 'finished'>('idle');
  const [latency, setLatency] = useState<number>(multiplayerNetcode.latencyMs || 25);
  const [countdown, setCountdown] = useState<number>(3);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [tickData, setTickData] = useState<TickUpdateData | null>(null);
  const [resultData, setResultData] = useState<MatchFinishedData | null>(null);
  const [combatLogs, setCombatLogs] = useState<Array<{ text: string; type: string }>>([]);

  const isPlayer1 = matchData?.p1.id === (playerTag || 'player_1');
  const myFighter = isPlayer1 ? matchData?.p1.fighter : matchData?.p2.fighter;
  const opponentFighter = isPlayer1 ? matchData?.p2.fighter : matchData?.p1.fighter;
  const opponentName = isPlayer1 ? matchData?.p2.name : matchData?.p1.name;

  const myHp = tickData ? (isPlayer1 ? tickData.p1.hp : tickData.p2.hp) : myFighter?.hp || 1000;
  const myMaxHp = myFighter?.maxHp || 1000;
  const myEnergy = tickData ? (isPlayer1 ? tickData.p1.energy : tickData.p2.energy) : 3;
  const myOverdrive = tickData ? (isPlayer1 ? tickData.p1.isOverdrive : tickData.p2.isOverdrive) : false;

  const oppHp = tickData ? (isPlayer1 ? tickData.p2.hp : tickData.p1.hp) : opponentFighter?.hp || 1000;
  const oppMaxHp = opponentFighter?.maxHp || 1000;
  const oppEnergy = tickData ? (isPlayer1 ? tickData.p2.energy : tickData.p1.energy) : 3;
  const oppOverdrive = tickData ? (isPlayer1 ? tickData.p2.isOverdrive : tickData.p1.isOverdrive) : false;

  useEffect(() => {
    if (!isOpen) {
      if (phase === 'fighting' || phase === 'queuing') {
        multiplayerNetcode.leaveRoom();
        multiplayerNetcode.cancelQueue();
      }
      setPhase('idle');
      return;
    }

    multiplayerNetcode.connect();

    const unsubscribe = multiplayerNetcode.subscribe((event, data) => {
      if (event === 'latency') {
        setLatency(data.latencyMs);
      } else if (event === 'queue_confirmed') {
        setPhase('queuing');
      } else if (event === 'match_found') {
        setMatchData(data);
        setPhase('matched');
        sound.playVictory();
      } else if (event === 'countdown_tick') {
        setCountdown(data);
        if (data <= 0) {
          setPhase('fighting');
        }
      } else if (event === 'tick_update') {
        setTickData(data);
        if (data.logs && data.logs.length > 0) {
          setCombatLogs((prev) => [...prev, ...data.logs].slice(-5));
        }
      } else if (event === 'match_finished') {
        setResultData(data);
        setPhase('finished');
        const won = (isPlayer1 && data.winnerId === data.p1Result.id) || (!isPlayer1 && data.winnerId === data.p2Result.id);
        if (won) {
          sound.playVictory();
          triggerVictoryExplosion();
          triggerHeavyImpactHaptic();
          addCredits(350);
        } else {
          sound.playDefeat();
          addCredits(100);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, phase, isPlayer1]);

  if (!isOpen) return null;

  const handleStartQueue = () => {
    sound.playClick();
    const effectivePet = pet || {
      id: activeBeast.id,
      name: activeBeast.name,
      species: activeBeast.species,
      level: activeBeast.level,
      health: activeBeast.health,
      damage: activeBeast.damage,
      defense: activeBeast.strength,
      speed: activeBeast.speed,
      cp: Math.round(activeBeast.health * 0.4 + activeBeast.damage * 1.5),
      image: activeBeast.image,
    };

    multiplayerNetcode.queueRanked({
      playerId: playerTag || 'player_1',
      playerName: trainerName || 'Trainer',
      rating: 1200,
      pet: effectivePet,
    });
  };

  const handleCancelQueue = () => {
    sound.playClick();
    multiplayerNetcode.cancelQueue();
    setPhase('idle');
  };

  const handleExecuteMove = (moveId: string) => {
    sound.playAttack();
    triggerMediumImpactHaptic();
    multiplayerNetcode.sendMove(moveId);
  };

  const handleExecuteOverdrive = () => {
    sound.playVictory();
    triggerHeavyImpactHaptic();
    multiplayerNetcode.sendOverdrive();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-2xl bg-[#080C16] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0C1222] via-[#090D18] to-[#06080E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Ranked 1v1 Live Multiplayer
                </h2>
                <span className="text-[10px] bg-cyan-400 text-black px-2 py-0.5 rounded-full font-black font-mono">
                  20 TICKS/SEC
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Authoritative Netcode · Strict ±150 CP Matchmaking · Real-Time Combat Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
              {multiplayerNetcode.isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{latency}ms</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400">Connecting...</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                if (phase === 'fighting') multiplayerNetcode.leaveRoom();
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* STATE 1: IDLE / READY TO QUEUE */}
          {phase === 'idle' && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.25)] animate-pulse">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-display font-black uppercase text-white tracking-wider">
                  Enter Ranked Arena Queue
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Queue with your active beast or companion avatar. The server pairs you with trainers within ±150 CP!
                </p>
              </div>

              {/* Player Fighter Card Preview */}
              <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-3 max-w-md mx-auto flex items-center gap-3 text-left">
                <img
                  src={pet?.avatarImageUrl || activeBeast.image}
                  alt="Beast"
                  className="w-14 h-14 rounded-xl object-cover border border-cyan-400/40 shrink-0"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white uppercase">{pet?.name || activeBeast.name}</div>
                  <div className="text-[10px] font-mono text-cyan-300">
                    Lv.{pet?.level || activeBeast.level} · {pet?.species || activeBeast.species}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-neutral-400">
                    <span>HP {pet?.stats?.stamina ? pet.stats.stamina * 15 : activeBeast.health}</span>
                    <span>·</span>
                    <span className="text-[#CCFF00] font-bold">
                      CP {pet?.stats?.cp || Math.round(activeBeast.health * 0.4 + activeBeast.damage * 1.5)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40 px-2 py-0.5 rounded-full">
                    READY ✓
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartQueue}
                className="w-full max-w-md mx-auto bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
              >
                <Swords className="w-4 h-4 text-black" />
                <span>Find Ranked Match (±150 CP)</span>
              </button>
            </div>
          )}

          {/* STATE 2: QUEUING / SEARCHING */}
          {phase === 'queuing' && (
            <div className="space-y-6 py-8 text-center">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-ping opacity-25" />
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-base font-display font-black uppercase text-white tracking-wider animate-pulse">
                  Searching for Ranked Opponent...
                </h3>
                <p className="text-xs font-mono text-cyan-300 mt-1">
                  Authoritative Netcode Filter: Band ±150 Combat Power
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Connecting across edge nodes · Ping: {latency}ms
                </p>
              </div>

              <button
                onClick={handleCancelQueue}
                className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-mono text-xs font-bold uppercase cursor-pointer border border-white/10"
              >
                Cancel Search
              </button>
            </div>
          )}

          {/* STATE 3: MATCH FOUND & COUNTDOWN */}
          {phase === 'matched' && matchData && (
            <div className="space-y-4 py-4 text-center animate-fadeIn">
              <div className="text-3xl font-display font-black text-cyan-300 animate-bounce">
                {countdown > 0 ? `STARTING IN ${countdown}...` : 'BATTLE ENGAGED!'}
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {/* Player 1 */}
                <div className="bg-[#0C1222] border-2 border-cyan-400/60 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase">You</div>
                  <div className="text-sm font-bold text-white truncate">{myFighter?.name}</div>
                  <div className="text-xs font-mono font-black text-[#CCFF00] mt-0.5">
                    CP {myFighter?.cp}
                  </div>
                </div>

                {/* Player 2 */}
                <div className="bg-[#0C1222] border-2 border-rose-500/60 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-mono font-bold text-rose-400 uppercase">Rival</div>
                  <div className="text-sm font-bold text-white truncate">{opponentFighter?.name}</div>
                  <div className="text-xs font-mono font-black text-rose-400 mt-0.5">
                    CP {opponentFighter?.cp}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: AUTHORITATIVE 20-TICK COMBAT ARENA */}
          {phase === 'fighting' && (
            <div className="space-y-4">
              {/* Dual Combatant Telemetry Bars */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left: You */}
                <div className={`p-3 rounded-2xl border transition-all ${myOverdrive ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-cyan-400/40 bg-[#0C1424]'}`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-white truncate">{myFighter?.name} (You)</span>
                    <span className="font-mono text-cyan-300">{Math.round(myHp)} HP</span>
                  </div>
                  {/* HP Bar */}
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5 mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-100"
                      style={{ width: `${Math.max(0, Math.min(100, (myHp / myMaxHp) * 100))}%` }}
                    />
                  </div>
                  {/* Energy Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>{myEnergy.toFixed(1)} / 10.0</span>
                    </span>
                    {myOverdrive && (
                      <span className="text-[9px] font-bold text-amber-300 animate-pulse">⚡ OVERDRIVE</span>
                    )}
                  </div>
                </div>

                {/* Right: Rival */}
                <div className={`p-3 rounded-2xl border transition-all ${oppOverdrive ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-rose-500/40 bg-[#160D1A]'}`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-white truncate">{opponentFighter?.name}</span>
                    <span className="font-mono text-rose-300">{Math.round(oppHp)} HP</span>
                  </div>
                  {/* HP Bar */}
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5 mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-100"
                      style={{ width: `${Math.max(0, Math.min(100, (oppHp / oppMaxHp) * 100))}%` }}
                    />
                  </div>
                  {/* Energy Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-rose-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-rose-400" />
                      <span>{oppEnergy.toFixed(1)} / 10.0</span>
                    </span>
                    {oppOverdrive && (
                      <span className="text-[9px] font-bold text-amber-300 animate-pulse">⚡ OVERDRIVE</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Combat Log Ticker */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-2.5 h-20 overflow-y-auto font-mono text-[11px] space-y-1">
                {combatLogs.length === 0 ? (
                  <div className="text-neutral-500 italic text-center py-4">Waiting for first strike...</div>
                ) : (
                  combatLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.type === 'crit'
                          ? 'text-amber-300 font-bold'
                          : log.type === 'overdrive'
                          ? 'text-fuchsia-300 font-bold'
                          : log.type === 'ko'
                          ? 'text-rose-400 font-black'
                          : 'text-neutral-200'
                      }
                    >
                      {log.text}
                    </div>
                  ))
                )}
              </div>

              {/* Authoritative Action Dock */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleExecuteMove('strike')}
                  disabled={myEnergy < 2}
                  className="p-2.5 rounded-xl border border-white/15 bg-[#0C1222] hover:bg-[#121A30] disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all cursor-pointer active:scale-95"
                >
                  <div className="text-[10px] font-mono font-bold text-cyan-300">2 ENERGY</div>
                  <div className="text-xs font-bold text-white uppercase mt-0.5">Strike</div>
                  <div className="text-[9px] text-neutral-400 font-mono">75 DMG</div>
                </button>

                <button
                  onClick={() => handleExecuteMove('pounce')}
                  disabled={myEnergy < 3}
                  className="p-2.5 rounded-xl border border-white/15 bg-[#0C1222] hover:bg-[#121A30] disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all cursor-pointer active:scale-95"
                >
                  <div className="text-[10px] font-mono font-bold text-cyan-300">3 ENERGY</div>
                  <div className="text-xs font-bold text-white uppercase mt-0.5">Pounce</div>
                  <div className="text-[9px] text-neutral-400 font-mono">130 DMG</div>
                </button>

                <button
                  onClick={() => handleExecuteMove('rend')}
                  disabled={myEnergy < 4}
                  className="p-2.5 rounded-xl border border-white/15 bg-[#0C1222] hover:bg-[#121A30] disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all cursor-pointer active:scale-95"
                >
                  <div className="text-[10px] font-mono font-bold text-cyan-300">4 ENERGY</div>
                  <div className="text-xs font-bold text-white uppercase mt-0.5">Fang Rend</div>
                  <div className="text-[9px] text-rose-300 font-mono">195 DMG</div>
                </button>

                <button
                  onClick={handleExecuteOverdrive}
                  disabled={myEnergy < 6 || myOverdrive}
                  className="p-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-black hover:from-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-center transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                >
                  <div className="text-[10px] font-mono font-bold text-amber-300">6 ENERGY</div>
                  <div className="text-xs font-black text-amber-200 uppercase mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Overdrive</span>
                  </div>
                  <div className="text-[9px] text-amber-300 font-mono">+50% DMG</div>
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: MATCH FINISHED / ELO REWARD SCREEN */}
          {phase === 'finished' && resultData && (
            <div className="space-y-4 py-4 text-center animate-fadeIn">
              {(isPlayer1 ? resultData.winnerId === resultData.p1Result.id : resultData.winnerId === resultData.p2Result.id) ? (
                <div>
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.4)] mb-2">
                    <Crown className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase text-white tracking-wider">
                    VICTORY!
                  </h3>
                  <p className="text-xs font-mono text-emerald-400 mt-0.5">
                    Opponent Defeated · Authoritative Win Confirmed
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.4)] mb-2">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase text-white tracking-wider">
                    DEFEATED
                  </h3>
                  <p className="text-xs font-mono text-rose-400 mt-0.5">
                    Your beast fought valiantly!
                  </p>
                </div>
              )}

              {/* Rewards Summary */}
              <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-4 max-w-sm mx-auto grid grid-cols-2 gap-2 font-mono text-center">
                <div className="p-2 bg-black/40 rounded-xl">
                  <div className="text-[10px] text-neutral-400">RATING</div>
                  <div className={`text-sm font-black ${(isPlayer1 ? resultData.winnerId === resultData.p1Result.id : resultData.winnerId === resultData.p2Result.id) ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(isPlayer1 ? resultData.winnerId === resultData.p1Result.id : resultData.winnerId === resultData.p2Result.id) ? '+25 ELO' : '-18 ELO'}
                  </div>
                </div>
                <div className="p-2 bg-black/40 rounded-xl">
                  <div className="text-[10px] text-neutral-400">CREDITS</div>
                  <div className="text-sm font-black text-[#CCFF00]">
                    +{(isPlayer1 ? resultData.winnerId === resultData.p1Result.id : resultData.winnerId === resultData.p2Result.id) ? 350 : 100}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setPhase('idle');
                }}
                className="py-2.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase font-mono cursor-pointer transition-all active:scale-95"
              >
                Play Another Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
