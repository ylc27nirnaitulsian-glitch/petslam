import React, { useState, useEffect, useRef } from 'react';
import { WildPetEncounter, CompanionPet, BerryItem, BERRIES } from '../../../types/pet';
import { ProceduralPetCanvas } from './ProceduralPetCanvas';
import { sound } from '../../../utils/audio';
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Award,
  ChevronRight,
  Compass,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface WildPetCatchModalProps {
  encounter: WildPetEncounter;
  onClose: () => void;
  onCaught: (pet: CompanionPet) => void;
}

export const WildPetCatchModal: React.FC<WildPetCatchModalProps> = ({
  encounter,
  onClose,
  onCaught,
}) => {
  const [selectedBerry, setSelectedBerry] = useState<BerryItem | null>(null);
  const [berryApplied, setBerryApplied] = useState(false);
  const [ringRadius, setRingRadius] = useState(60);
  const [ballState, setBallState] = useState<'ready' | 'thrown' | 'shaking' | 'caught' | 'escaped'>(
    'ready'
  );
  const [shakeCount, setShakeCount] = useState(0);
  const [throwQuality, setThrowQuality] = useState<string | null>(null);
  const [caughtResultPet, setCaughtResultPet] = useState<CompanionPet | null>(null);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0, scale: 1 });
  const [isAiming, setIsAiming] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Contracting target catch ring loop
  useEffect(() => {
    if (ballState !== 'ready') return;
    const interval = setInterval(() => {
      setRingRadius((prev) => {
        if (prev <= 24) return 60;
        return prev - 1.5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [ballState]);

  // Throw Pokeball handler
  const handleBallPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (ballState !== 'ready') return;
    setIsAiming(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBallPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAiming || !dragStartRef.current) return;
    const dy = e.clientY - dragStartRef.current.y;
    const dx = e.clientX - dragStartRef.current.x;
    if (dy < 0) {
      // Pulling / aiming upwards
      setBallPos({ x: dx * 0.4, y: dy * 0.6, scale: Math.max(0.7, 1 + dy * 0.001) });
    }
  };

  const handleBallPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAiming || !dragStartRef.current) return;
    setIsAiming(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = null;

    // Minimum flick threshold to throw
    if (dy < -40) {
      executeThrow();
    } else {
      // Reset position
      setBallPos({ x: 0, y: 0, scale: 1 });
    }
  };

  const executeThrow = () => {
    setBallState('thrown');
    sound.playPokeBallThrow();

    // Determine throw bonus based on contracting ring size
    let quality = 'NICE THROW!';
    let bonus = 1.15;
    if (ringRadius < 32) {
      quality = 'EXCELLENT THROW!';
      bonus = 1.75;
    } else if (ringRadius < 45) {
      quality = 'GREAT THROW!';
      bonus = 1.4;
    }
    setThrowQuality(quality);

    // Animate ball flying toward pet
    setBallPos({ x: 0, y: -220, scale: 0.35 });

    setTimeout(() => {
      // Ball hits pet
      setBallState('shaking');
      sound.playPokeBallShake();
      setShakeCount(1);

      // Shake 1
      setTimeout(() => {
        sound.playPokeBallShake();
        setShakeCount(2);

        // Shake 2
        setTimeout(() => {
          sound.playPokeBallShake();
          setShakeCount(3);

          // Final catch calculation
          const berryMult = selectedBerry?.catchBonus || 1.0;
          const catchRate = Math.min(0.95, encounter.baseCatchRate * bonus * berryMult);
          const roll = Math.random();

          setTimeout(() => {
            if (roll <= catchRate) {
              // GOTCHA!
              sound.playPokeBallCatch();
              setBallState('caught');

              const caught: CompanionPet = {
                id: `pet_caught_${encounter.species}_${Date.now()}`,
                species: encounter.species,
                category: encounter.category,
                name: encounter.name.replace('Wild ', ''),
                title: encounter.title,
                stage: 1,
                level: encounter.level,
                exp: 0,
                maxExp: 100,
                affectionHearts: 1,
                affectionPoints: 20,
                hunger: 75,
                happiness: 90,
                energy: 90,
                mood: 'happy',
                stats: { ...encounter.stats },
                battleBuff: {
                  name: 'Wild Instinct',
                  description: '+14% Critical Chance & Arena Speed',
                  effectType: 'crit_chance',
                  potency: 14,
                },
                createdAt: Date.now(),
                lastFedAt: Date.now(),
                lastPettedAt: Date.now(),
                totalPats: 0,
                totalBerriesEaten: selectedBerry ? 1 : 0,
                caughtAt: 'Wild Radar Grasslands',
              };

              setCaughtResultPet(caught);
              onCaught(caught);
            } else {
              // Broke free
              sound.playLightHit();
              setBallState('escaped');
              setBallPos({ x: 0, y: 0, scale: 1 });
              setTimeout(() => {
                setBallState('ready');
                setShakeCount(0);
                setThrowQuality(null);
              }, 1200);
            }
          }, 600);
        }, 650);
      }, 650);
    }, 450);
  };

  const handleApplyBerry = (b: BerryItem) => {
    if (berryApplied || ballState !== 'ready') return;
    sound.playEat();
    setSelectedBerry(b);
    setBerryApplied(true);
  };

  const ringColor =
    encounter.rarity === 'common'
      ? '#22C55E'
      : encounter.rarity === 'rare'
      ? '#F59E0B'
      : '#EF4444';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0F172A] via-[#0B0E17] to-[#05070B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[640px] text-white">
        {/* Top Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              <Compass className="w-3.5 h-3.5 animate-spin" />
            </span>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Wild Encounter
              </div>
              <div className="text-[10px] text-neutral-400">
                {encounter.distanceMeters}m away in the wild
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wild Pet Stats Badge */}
        <div className="px-4 py-2 flex items-center justify-between bg-[#151D30]/60 border-b border-white/5 text-xs font-mono">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{encounter.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                  encounter.category === 'cat'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {encounter.category}
              </span>
            </div>
            <div className="text-[11px] text-[#CCFF00] font-bold">CP {encounter.cp}</div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase text-neutral-400">Base Catch Rate</div>
            <div className="text-xs font-bold text-emerald-400">
              {Math.round(encounter.baseCatchRate * 100)}%
            </div>
          </div>
        </div>

        {/* Catch Arena Stage */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
          {/* Nature meadow background vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e293b70_0%,transparent_75%)] pointer-events-none" />

          {/* Grass bushes & ambient particles */}
          <div className="absolute bottom-16 inset-x-0 h-24 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none" />

          {/* Wild Pet Canvas */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Target Catch Ring */}
            {ballState === 'ready' && (
              <div
                className="absolute pointer-events-none rounded-full transition-all duration-75 flex items-center justify-center"
                style={{
                  width: ringRadius * 2,
                  height: ringRadius * 2,
                  border: `3px solid ${ringColor}`,
                  boxShadow: `0 0 16px ${ringColor}60`,
                }}
              />
            )}

            {/* Throw Quality Text */}
            {throwQuality && (
              <div className="absolute -top-10 text-xs font-black tracking-widest text-[#CCFF00] font-mono animate-bounce drop-shadow-[0_2px_8px_rgba(204,255,0,0.8)]">
                {throwQuality}
              </div>
            )}

            {/* Pet rendered or Ball shaking */}
            {ballState !== 'shaking' && ballState !== 'caught' ? (
              <ProceduralPetCanvas
                species={encounter.species}
                stage={1}
                width={170}
                height={170}
                animationState={ballState === 'escaped' ? 'dizzy' : 'idle'}
                interactive={false}
              />
            ) : (
              /* Shaking Ball */
              <div className="relative py-8 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-full border-2 border-black flex flex-col overflow-hidden shadow-2xl ${
                    shakeCount > 0 ? 'animate-[spin_0.3s_ease-in-out_infinite]' : ''
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, #EF4444 0%, #EF4444 50%, #FFFFFF 50%, #FFFFFF 100%)',
                  }}
                >
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-black -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-mono text-neutral-400">
                  {shakeCount === 1 && 'Wobble...'}
                  {shakeCount === 2 && 'Wobble... Wobble...'}
                  {shakeCount === 3 && 'Click!'}
                </div>
              </div>
            )}
          </div>

          {/* Caught Success Overlay */}
          {ballState === 'caught' && caughtResultPet && (
            <div className="absolute inset-0 z-20 bg-black/90 p-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="text-3xl mb-1">🎉</div>
              <div className="text-base font-black uppercase text-[#CCFF00] tracking-wider mb-0.5">
                Gotcha!
              </div>
              <div className="text-xs text-neutral-300 font-bold mb-3">
                {encounter.name} was successfully caught!
              </div>

              {/* Pet Card */}
              <div className="w-full bg-[#121824] border border-[#CCFF00]/30 rounded-2xl p-3 mb-4 text-left font-mono">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white">{caughtResultPet.name}</span>
                  <span className="text-[#CCFF00] font-black">CP {caughtResultPet.stats.cp}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
                  <div>
                    ATK: <span className="text-white">{caughtResultPet.stats.attack}</span>
                  </div>
                  <div>
                    DEF: <span className="text-white">{caughtResultPet.stats.defense}</span>
                  </div>
                  <div>
                    AGI: <span className="text-white">{caughtResultPet.stats.agility}</span>
                  </div>
                  <div>
                    STA: <span className="text-white">{caughtResultPet.stats.stamina}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg active:scale-95"
              >
                Send to Sanctuary & Kennel
              </button>
            </div>
          )}
        </div>

        {/* Bottom Interactive Throwing & Berry Tray */}
        {ballState !== 'caught' && (
          <div className="p-3 bg-black/60 border-t border-white/10 flex flex-col items-center">
            {/* Berry Selector */}
            <div className="w-full flex items-center justify-center gap-2 mb-3">
              {BERRIES.slice(0, 3).map((berry) => (
                <button
                  key={berry.id}
                  onClick={() => handleApplyBerry(berry)}
                  disabled={berryApplied || ballState !== 'ready'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedBerry?.id === berry.id
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  <span>{berry.icon}</span>
                  <span>{berry.name.split(' ')[0]}</span>
                  {selectedBerry?.id === berry.id && <span>✓</span>}
                </button>
              ))}
            </div>

            {/* Draggable Pokeball */}
            <div className="relative flex flex-col items-center">
              <div
                onPointerDown={handleBallPointerDown}
                onPointerMove={handleBallPointerMove}
                onPointerUp={handleBallPointerUp}
                onPointerCancel={handleBallPointerUp}
                style={{
                  transform: `translate(${ballPos.x}px, ${ballPos.y}px) scale(${ballPos.scale})`,
                  transition: isAiming ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className={`w-14 h-14 rounded-full border-2 border-black flex flex-col overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing touch-none select-none ${
                  ballState === 'ready' ? 'hover:scale-105 active:scale-95' : 'pointer-events-none'
                }`}
              >
                {/* Red top */}
                <div className="flex-1 bg-red-600 border-b border-black flex items-end justify-center">
                  <div className="w-8 h-1 bg-red-400/50 rounded-full mb-1" />
                </div>
                {/* White bottom */}
                <div className="flex-1 bg-white" />
                {/* Center latch */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                </div>
              </div>

              <div className="mt-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                {isAiming ? 'Flick Upwards to Throw!' : 'Swipe Up to Catch Pet'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
