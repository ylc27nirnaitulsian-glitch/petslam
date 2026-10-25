import React, { useState, useEffect } from 'react';
import { Animal } from '../../data/animals';
import { animalImages } from '../../assets/images';
import { Swords, Flame, Zap, Shield, Crown } from 'lucide-react';

export interface CombatUnit {
  id: string;
  name: string;
  species: string;
  image: string;
  level: number;
  maxHp: number;
  currentHp: number;
  isPlayerSide: boolean;
  lane: 'left' | 'right' | 'center';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  baseX: number;
  baseY: number;
  isAttacking: boolean;
  isHit: boolean;
  isDeploying: boolean;
}

interface ClashArenaBattlefieldProps {
  playerBeast: Animal;
  opponentBeast: Animal;
  is2v2: boolean;
  allyBeast?: Animal | null;
  opponentAlly?: Animal | null;
  playerHpPercent: number;
  opponentHpPercent: number;
  allyHpPercent?: number;
  opponentAllyHpPercent?: number;
  targetedOpponentIndex: 0 | 1;
  onSelectTarget: (index: 0 | 1) => void;
  combatActionNonce: number; // increments on each attack
  lastAttackType: 'jab' | 'maul' | 'takedown' | 'roar' | 'slam' | null;
  lastAttackerSide: 'player' | 'opponent' | 'ally' | 'opponentAlly' | null;
  onTapArena?: () => void;
}

export const ClashArenaBattlefield: React.FC<ClashArenaBattlefieldProps> = ({
  playerBeast,
  opponentBeast,
  is2v2,
  allyBeast,
  opponentAlly,
  playerHpPercent,
  opponentHpPercent,
  allyHpPercent = 100,
  opponentAllyHpPercent = 100,
  targetedOpponentIndex,
  onSelectTarget,
  combatActionNonce,
  lastAttackType,
  lastAttackerSide,
  onTapArena,
}) => {
  // Animation states for active units
  const [playerAttackAnim, setPlayerAttackAnim] = useState<boolean>(false);
  const [opponentAttackAnim, setOpponentAttackAnim] = useState<boolean>(false);
  const [allyAttackAnim, setAllyAttackAnim] = useState<boolean>(false);
  const [oppAllyAttackAnim, setOppAllyAttackAnim] = useState<boolean>(false);

  const [playerHitAnim, setPlayerHitAnim] = useState<boolean>(false);
  const [opponentHitAnim, setOpponentHitAnim] = useState<boolean>(false);
  const [allyHitAnim, setAllyHitAnim] = useState<boolean>(false);
  const [oppAllyHitAnim, setOppAllyHitAnim] = useState<boolean>(false);

  const [deployAnim, setDeployAnim] = useState<boolean>(false);
  const [clawSlashVfx, setClawSlashVfx] = useState<{ x: number; y: number } | null>(null);

  // Trigger attack animations whenever combatActionNonce changes
  useEffect(() => {
    if (combatActionNonce === 0) return;

    if (lastAttackerSide === 'player') {
      setPlayerAttackAnim(true);
      // Target gets hit
      setTimeout(() => {
        if (targetedOpponentIndex === 1 && is2v2) {
          setOppAllyHitAnim(true);
          setClawSlashVfx({ x: 70, y: 32 });
        } else {
          setOpponentHitAnim(true);
          setClawSlashVfx({ x: is2v2 ? 30 : 50, y: 32 });
        }
      }, 250);

      setTimeout(() => {
        setPlayerAttackAnim(false);
        setOpponentHitAnim(false);
        setOppAllyHitAnim(false);
        setClawSlashVfx(null);
      }, 650);
    } else if (lastAttackerSide === 'opponent') {
      setOpponentAttackAnim(true);
      setTimeout(() => {
        setPlayerHitAnim(true);
        setClawSlashVfx({ x: is2v2 ? 30 : 50, y: 68 });
      }, 250);

      setTimeout(() => {
        setOpponentAttackAnim(false);
        setPlayerHitAnim(false);
        setClawSlashVfx(null);
      }, 650);
    } else if (lastAttackerSide === 'ally') {
      setAllyAttackAnim(true);
      setTimeout(() => {
        if (targetedOpponentIndex === 1) {
          setOppAllyHitAnim(true);
          setClawSlashVfx({ x: 70, y: 32 });
        } else {
          setOpponentHitAnim(true);
          setClawSlashVfx({ x: 30, y: 32 });
        }
      }, 250);

      setTimeout(() => {
        setAllyAttackAnim(false);
        setOpponentHitAnim(false);
        setOppAllyHitAnim(false);
        setClawSlashVfx(null);
      }, 650);
    }
  }, [combatActionNonce, lastAttackerSide, targetedOpponentIndex, is2v2]);

  // Unit switch deploy animation whenever playerBeast changes
  useEffect(() => {
    setDeployAnim(true);
    const timer = setTimeout(() => setDeployAnim(false), 800);
    return () => clearTimeout(timer);
  }, [playerBeast.id]);

  // Left Lane X: 28%, Right Lane X: 72%, Center Lane X: 50%
  // Opponent Top Y: 32%, Player Bottom Y: 68%
  const playerX = is2v2 ? 28 : 50;
  const allyX = 72;
  const opponentX = is2v2 ? 28 : 50;
  const oppAllyX = 72;

  return (
    <div
      onClick={onTapArena}
      className="relative w-full h-full min-h-[360px] select-none overflow-hidden rounded-2xl border-2 border-amber-300 shadow-md bg-cover bg-center flex flex-col justify-between"
      style={{
        backgroundImage: `url(${animalImages.clashBattleArena})`,
      }}
    >
      {/* Subtle sunny vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-blue-500/10 pointer-events-none" />

      {/* Arena Lane Markers (Subtle bridges highlight) */}
      <div className="absolute top-[49%] inset-x-0 h-1 bg-cyan-400/30 blur-[1px] pointer-events-none" />

      {/* =========================================================================
          TOP OPPONENT HALF: RED TEAM BEASTS
         ========================================================================= */}
      {/* Opponent Beast 1 (Left Lane or Center) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectTarget(0);
        }}
        className={`absolute z-20 flex flex-col items-center transition-all duration-300 cursor-pointer ${
          opponentAttackAnim
            ? 'translate-y-24 scale-110 drop-shadow-[0_15px_15px_rgba(239,68,68,0.6)]'
            : opponentHitAnim
            ? '-translate-y-3 scale-95 brightness-150 animate-shake'
            : 'hover:scale-105'
        }`}
        style={{
          top: '28%',
          left: `${opponentX}%`,
          transform: `translate(-50%, -50%) ${
            opponentAttackAnim ? 'translateY(80px)' : opponentHitAnim ? 'translateY(-12px)' : ''
          }`,
        }}
      >
        {/* Floating Health Bar */}
        <div className="w-16 h-2 bg-neutral-900/90 rounded-full border border-white/60 p-0.5 shadow-sm mb-1">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${opponentHpPercent}%` }}
          />
        </div>

        {/* Target Reticle Indicator */}
        {targetedOpponentIndex === 0 && (
          <div className="absolute -top-6 text-xs font-mono font-bold text-red-500 bg-white/90 border border-red-400 px-1.5 py-0.2 rounded-full shadow-md animate-bounce flex items-center gap-1">
            <span>TARGET</span>
          </div>
        )}

        {/* Animal Unit Token */}
        <div className="relative">
          {/* Ground Shadow */}
          <div className="absolute -bottom-1 inset-x-2 h-3 bg-black/40 rounded-full blur-[2px]" />

          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-3 shadow-lg bg-black relative transition-all ${
              targetedOpponentIndex === 0
                ? 'border-red-500 ring-4 ring-red-400/50 scale-105'
                : 'border-red-400'
            }`}
          >
            <img
              src={opponentBeast.image}
              alt={opponentBeast.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = opponentBeast.fallbackImage;
              }}
            />
            {/* Red Team Banner Badge */}
            <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-mono font-bold text-[8px] text-center uppercase tracking-tight py-0.2">
              L{opponentBeast.level}
            </span>
          </div>
        </div>

        <span className="font-display font-black text-[11px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase mt-0.5 tracking-wide">
          {opponentBeast.name}
        </span>
      </div>

      {/* Opponent Beast 2 (Right Lane in 2v2) */}
      {is2v2 && opponentAlly && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectTarget(1);
          }}
          className={`absolute z-20 flex flex-col items-center transition-all duration-300 cursor-pointer ${
            oppAllyAttackAnim
              ? 'translate-y-24 scale-110 drop-shadow-[0_15px_15px_rgba(239,68,68,0.6)]'
              : oppAllyHitAnim
              ? '-translate-y-3 scale-95 brightness-150 animate-shake'
              : 'hover:scale-105'
          }`}
          style={{
            top: '28%',
            left: `${oppAllyX}%`,
            transform: `translate(-50%, -50%) ${
              oppAllyAttackAnim ? 'translateY(80px)' : oppAllyHitAnim ? 'translateY(-12px)' : ''
            }`,
          }}
        >
          {/* Floating Health Bar */}
          <div className="w-16 h-2 bg-neutral-900/90 rounded-full border border-white/60 p-0.5 shadow-sm mb-1">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${opponentAllyHpPercent}%` }}
            />
          </div>

          {/* Target Reticle Indicator */}
          {targetedOpponentIndex === 1 && (
            <div className="absolute -top-6 text-xs font-mono font-bold text-red-500 bg-white/90 border border-red-400 px-1.5 py-0.2 rounded-full shadow-md animate-bounce flex items-center gap-1">
              <span>TARGET</span>
            </div>
          )}

          {/* Animal Unit Token */}
          <div className="relative">
            <div className="absolute -bottom-1 inset-x-2 h-3 bg-black/40 rounded-full blur-[2px]" />
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-3 shadow-lg bg-black relative transition-all ${
                targetedOpponentIndex === 1
                  ? 'border-red-500 ring-4 ring-red-400/50 scale-105'
                  : 'border-red-400'
              }`}
            >
              <img
                src={opponentAlly.image}
                alt={opponentAlly.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = opponentAlly.fallbackImage;
                }}
              />
              <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-mono font-bold text-[8px] text-center uppercase tracking-tight py-0.2">
                L{opponentAlly.level}
              </span>
            </div>
          </div>

          <span className="font-display font-black text-[11px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase mt-0.5 tracking-wide">
            {opponentAlly.name}
          </span>
        </div>
      )}

      {/* =========================================================================
          CENTER RIVER & CLAW HIT VFX
         ========================================================================= */}
      {clawSlashVfx && (
        <div
          className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{ left: `${clawSlashVfx.x}%`, top: `${clawSlashVfx.y}%` }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-400/80 blur-xs border-4 border-white flex items-center justify-center shadow-[0_0_30px_#F59E0B]">
            <Swords className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM PLAYER HALF: BLUE TEAM BEASTS
         ========================================================================= */}
      {/* Player Beast (Left Lane or Center) */}
      <div
        className={`absolute z-20 flex flex-col items-center transition-all duration-300 ${
          playerAttackAnim
            ? '-translate-y-24 scale-110 drop-shadow-[0_15px_15px_rgba(37,99,235,0.6)]'
            : playerHitAnim
            ? 'translate-y-3 scale-95 brightness-150 animate-shake'
            : ''
        }`}
        style={{
          top: '70%',
          left: `${playerX}%`,
          transform: `translate(-50%, -50%) ${
            playerAttackAnim ? 'translateY(-80px)' : playerHitAnim ? 'translateY(12px)' : ''
          }`,
        }}
      >
        {/* Floating Health Bar */}
        <div className="w-16 h-2 bg-neutral-900/90 rounded-full border border-white/60 p-0.5 shadow-sm mb-1">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300"
            style={{ width: `${playerHpPercent}%` }}
          />
        </div>

        {/* Unit Token */}
        <div className="relative">
          {/* Deploy Impact Shockwave Ring */}
          {deployAnim && (
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping pointer-events-none" />
          )}

          <div className="absolute -bottom-1 inset-x-2 h-3 bg-black/40 rounded-full blur-[2px]" />
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-3 border-blue-500 shadow-xl bg-black relative ring-3 ring-blue-400/40">
            <img
              src={playerBeast.image}
              alt={playerBeast.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = playerBeast.fallbackImage;
              }}
            />
            {/* Blue Team Banner Badge */}
            <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white font-mono font-bold text-[8px] text-center uppercase tracking-tight py-0.2">
              L{playerBeast.level} (YOU)
            </span>
          </div>
        </div>

        <span className="font-display font-black text-[11px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase mt-0.5 tracking-wide">
          {playerBeast.name}
        </span>
      </div>

      {/* Ally Teammate Beast (Right Lane in 2v2) */}
      {is2v2 && allyBeast && (
        <div
          className={`absolute z-20 flex flex-col items-center transition-all duration-300 ${
            allyAttackAnim
              ? '-translate-y-24 scale-110 drop-shadow-[0_15px_15px_rgba(37,99,235,0.6)]'
              : allyHitAnim
              ? 'translate-y-3 scale-95 brightness-150 animate-shake'
              : ''
          }`}
          style={{
            top: '70%',
            left: `${allyX}%`,
            transform: `translate(-50%, -50%) ${
              allyAttackAnim ? 'translateY(-80px)' : allyHitAnim ? 'translateY(12px)' : ''
            }`,
          }}
        >
          {/* Floating Health Bar */}
          <div className="w-16 h-2 bg-neutral-900/90 rounded-full border border-white/60 p-0.5 shadow-sm mb-1">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${allyHpPercent}%` }}
            />
          </div>

          <div className="relative">
            <div className="absolute -bottom-1 inset-x-2 h-3 bg-black/40 rounded-full blur-[2px]" />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-3 border-cyan-500 shadow-xl bg-black relative ring-3 ring-cyan-400/40">
              <img
                src={allyBeast.image}
                alt={allyBeast.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = allyBeast.fallbackImage;
                }}
              />
              <span className="absolute bottom-0 inset-x-0 bg-cyan-600 text-white font-mono font-bold text-[8px] text-center uppercase tracking-tight py-0.2">
                L{allyBeast.level} (ALLY)
              </span>
            </div>
          </div>

          <span className="font-display font-black text-[11px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase mt-0.5 tracking-wide">
            {allyBeast.name}
          </span>
        </div>
      )}
    </div>
  );
};
