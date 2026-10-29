import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { useGame } from '../../../context/GameContext';
import { ProceduralPetCanvas } from './ProceduralPetCanvas';
import { PetAnimationState } from '../../../types/pet';
import {
  Heart,
  Utensils,
  Dumbbell,
  Sparkles,
  X,
  ChevronUp,
  Eye,
  EyeOff,
  Home,
  Zap,
  Mic,
  Bath,
  Smile,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { voiceMimic } from '../../../utils/voiceMimic';
import { mapBeastToSpecies } from '../../../utils/petVisuals';
import { kokoroTTS } from '../../../utils/kokoroTTS';

interface FloatingPetOverlayProps {
  onOpenSanctuary?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const FloatingPetOverlay: React.FC<FloatingPetOverlayProps> = ({
  onOpenSanctuary,
}) => {
  const { activeBeast } = useGame();
  const { pet, isOverlayActive, toggleOverlay, feedPet, strokePet, availableBerries } =
    usePetCompanion();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const mobileInit = window.innerWidth < 768;
      return {
        x: mobileInit ? Math.max(10, window.innerWidth - 170) : Math.max(20, window.innerWidth - 240),
        y: mobileInit ? Math.max(50, window.innerHeight - 130) : Math.max(30, window.innerHeight - 270),
      };
    }
    return { x: 100, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [animState, setAnimState] = useState<PetAnimationState>('idle');
  const [talkingVolume, setTalkingVolume] = useState<number>(0);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [petScaleMode, setPetScaleMode] = useState<'normal' | 'large'>('normal');

  // Keep pet inside screen bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setPosition((prev) => {
        const petW = isMinimized ? 150 : (mobile ? 130 : (petScaleMode === 'large' ? 200 : 160));
        const petH = isMinimized ? 50 : (mobile ? 130 : (petScaleMode === 'large' ? 200 : 160));
        return {
          x: Math.max(10, Math.min(window.innerWidth - petW - 10, prev.x)),
          y: Math.max(10, Math.min(window.innerHeight - petH - (mobile ? 75 : 10), prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [petScaleMode, isMinimized]);

  // Laptop Battery & Charging Detector
  const [isCharging, setIsCharging] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  // Screen Time & Reminders
  const [screenSeconds, setScreenSeconds] = useState(0);

  // Kokoro Local TTS State
  const [ttsEnabled, setTtsEnabled] = useState(() => kokoroTTS.getIsEnabled());

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 20,
    vx: 0,
    vy: 0,
    lastTime: 0,
    isAirborne: false,
  });

  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showSpeech = useCallback((text: string, duration = 3500) => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    setSpeechBubble(text);
    // Silent speech bubble without loud TTS audio interruptions
    speechTimerRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, duration);
  }, []);

  // 1. Laptop Battery & Charging Detector API (Silent State Tracking)
  useEffect(() => {
    let batteryObj: any = null;

    const handleBatteryUpdate = () => {
      if (!batteryObj) return;
      const charging = batteryObj.charging;
      const level = Math.round(batteryObj.level * 100);
      setIsCharging(charging);
      setBatteryLevel(level);
      // No sound effects or voice announcements on charging
    };

    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        handleBatteryUpdate();
        battery.addEventListener('chargingchange', handleBatteryUpdate);
        battery.addEventListener('levelchange', handleBatteryUpdate);
      }).catch(() => {});
    }

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener?.('chargingchange', handleBatteryUpdate);
        batteryObj.removeEventListener?.('levelchange', handleBatteryUpdate);
      }
    };
  }, []);

  // 2. Screen-Time Activity & Posture Reminders (Silent Visual Reminders)
  useEffect(() => {
    const timer = setInterval(() => {
      setScreenSeconds((prev) => {
        const next = prev + 1;
        // Trigger visual reminder every 15 minutes (900 seconds)
        if (next % 900 === 0) {
          triggerHealthReminder();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerHealthReminder = () => {
    const reminders = [
      '💧 Hydration Check! Take a sip of water, human!',
      '🧘 Posture Check! Unhunch your back and stretch!',
      '👀 20-20-20 Rule! Rest your eyes on something 20 feet away!',
      '🏃 Time for a quick stretch! Roll your shoulders!',
    ];
    const picked = reminders[Math.floor(Math.random() * reminders.length)];
    setAnimState('celebrate');
    showSpeech(picked, 5000);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  // 3. Autonomous Roaming AI with Playful Tricks
  useEffect(() => {
    if (!isOverlayActive || isMinimized || isDragging) return;

    const roamInterval = setInterval(() => {
      if (isDragging || showRadialMenu) return;

      const roll = Math.random();
      if (roll < 0.35) {
        // Subtle drift around current floating coordinate (±30px)
        const moveDistX = (Math.random() - 0.5) * 40;
        const moveDistY = (Math.random() - 0.5) * 30;
        setAnimState('walk');
        setPosition((prev) => {
          const petW = petScaleMode === 'large' ? 200 : 160;
          const petH = petScaleMode === 'large' ? 200 : 160;
          const nextX = Math.max(15, Math.min(window.innerWidth - petW - 15, prev.x + moveDistX));
          const nextY = Math.max(15, Math.min(window.innerHeight - petH - 15, prev.y + moveDistY));
          return { x: nextX, y: nextY };
        });

        setTimeout(() => {
          setAnimState('idle');
        }, 1800);
      } else if (roll < 0.65) {
        // Playful spontaneous animated trick!
        const tricks: PetAnimationState[] = ['backflip', 'dance', 'beg', 'spin', 'zoomies', 'rollover'];
        const chosenTrick = tricks[Math.floor(Math.random() * tricks.length)];
        setAnimState(chosenTrick);
        setTimeout(() => setAnimState('idle'), 3200);
      } else if (roll < 0.85) {
        setAnimState('celebrate');
        showSpeech(`*happy ${pet.name} chirp* ❤️`, 2000);
        setTimeout(() => setAnimState('idle'), 1500);
      } else if (pet.hunger < 50) {
        setAnimState('idle');
        showSpeech(`I'm getting hungry! Feed me a treat! 🍓`, 3000);
      }
    }, 10000);

    return () => clearInterval(roamInterval);
  }, [isOverlayActive, isMinimized, isDragging, showRadialMenu, pet.name, pet.hunger, showSpeech, petScaleMode]);

  // Handle Dragging anywhere on screen freely
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setAnimState('drag');
    dragRef.current.startX = e.clientX - position.x;
    dragRef.current.startY = e.clientY - position.y;
    dragRef.current.lastTime = performance.now();
    dragRef.current.vx = 0;
    dragRef.current.vy = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const petW = petScaleMode === 'large' ? 200 : 160;
    const petH = petScaleMode === 'large' ? 200 : 160;

    const newX = Math.max(10, Math.min(window.innerWidth - petW - 10, e.clientX - dragRef.current.startX));
    const newY = Math.max(10, Math.min(window.innerHeight - petH - 10, e.clientY - dragRef.current.startY));

    const now = performance.now();
    const dt = Math.max((now - dragRef.current.lastTime) / 1000, 0.001);
    dragRef.current.vx = (newX - position.x) / dt;
    dragRef.current.vy = (newY - position.y) / dt;
    dragRef.current.lastTime = now;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const moveDist = Math.hypot(dragRef.current.vx, dragRef.current.vy);
    // If it was just a click (low movement), toggle radial menu
    if (moveDist < 40) {
      setShowRadialMenu((prev) => !prev);
      setAnimState('idle');
      return;
    }

    // Free hover: pet remains gracefully hovering right where placed (silent)
    setAnimState('celebrate');
    setTimeout(() => setAnimState('idle'), 800);
  };

  // Playful Animated Tricks
  const handlePerformTrick = (trick: PetAnimationState) => {
    setAnimState(trick);
    const quotes: Record<string, string> = {
      backflip: '🤸 Backflip! Ta-da!',
      zoomies: '⚡ ZOOMIES! Super fast!',
      rollover: '🔄 Roll over! Belly rub time!',
      dance: '💃 Dance party groove! 🎵',
      beg: '🐾 Paw wave! High five!',
      spin: '💫 360 Spin! Wheee!',
    };
    if (quotes[trick]) {
      showSpeech(quotes[trick], 2500);
    }
    setTimeout(() => setAnimState('idle'), 3200);
  };

  // Silent Tactile Pet Reactions
  const handlePokeHead = () => {
    setAnimState('dizzy');
    showSpeech(`Ouch! My head is spinning! ⭐`);
    setTimeout(() => setAnimState('idle'), 2200);
  };

  const handleTickleBelly = () => {
    setAnimState('laugh');
    showSpeech(`Hahaha! That tickles so much! ❤️`);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  const handleBath = () => {
    setAnimState('bath');
    showSpeech(`Squeaky clean! Pop the bubbles! 🧼✨`);
    setTimeout(() => setAnimState('idle'), 2600);
  };

  const isChimera = Boolean(pet.isChimera || pet.customFeatures?.isChimera);

  const handleBark = () => {
    setAnimState('celebrate');
    showSpeech(`Woof woof! Arf! 🐶🐾`, 2200);
    setTimeout(() => setAnimState('idle'), 1500);
  };

  const handleMeow = () => {
    setAnimState('celebrate');
    showSpeech(`Meow meow! Purrrr~ 🐱✨`, 2200);
    setTimeout(() => setAnimState('idle'), 1500);
  };

  const handleVoiceMimic = async () => {
    showSpeech(`Listening... Say something! 🎙️`);
    const res = await voiceMimic.startListening();
    if (res.success) {
      setTimeout(async () => {
        showSpeech(`Repeating back! 📢`);
        setAnimState('talk');
        await voiceMimic.stopAndRepeat(
          (amp) => setTalkingVolume(amp),
          () => {
            setTalkingVolume(0);
            setAnimState('idle');
          }
        );
      }, 3000);
    } else {
      voiceMimic.speakPresetPhrase(
        `I am ${pet.name}! Your on-screen browser buddy!`,
        (amp) => setTalkingVolume(amp),
        () => {
          setTalkingVolume(0);
          setAnimState('idle');
        }
      );
    }
  };

  if (!isOverlayActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className={`select-none font-sans ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Speech Bubble */}
      {speechBubble && !isMinimized && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md text-[#CCFF00] border border-[#CCFF00]/40 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 z-50">
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 border-r border-b border-[#CCFF00]/40" />
        </div>
      )}

      {/* Radial Menu & Tricks Hub */}
      {showRadialMenu && !isMinimized && (
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-64 h-36 pointer-events-auto z-40 animate-in fade-in zoom-in-90">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Top: Feed Treat (Silent) */}
            <button
              onClick={() => {
                const b = availableBerries[0];
                if (b) {
                  feedPet(b);
                  setAnimState('eat');
                  showSpeech(`*Nom nom* Loved that ${b.name}! 🍓`);
                  setTimeout(() => setAnimState('idle'), 2000);
                }
                setShowRadialMenu(false);
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-400 text-black p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Feed Treat"
            >
              <Utensils className="w-4 h-4" />
            </button>

            {/* Top-Left: Backflip Trick */}
            <button
              onClick={() => {
                handlePerformTrick('backflip');
                setShowRadialMenu(false);
              }}
              className="absolute top-2 left-6 bg-yellow-400 hover:bg-yellow-300 text-black p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: Backflip 🤸"
            >
              🤸
            </button>

            {/* Top-Right: Dance Trick */}
            <button
              onClick={() => {
                handlePerformTrick('dance');
                setShowRadialMenu(false);
              }}
              className="absolute top-2 right-6 bg-purple-500 hover:bg-purple-400 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: Dance 💃"
            >
              💃
            </button>

            {/* Far Left: Roll Over */}
            <button
              onClick={() => {
                handlePerformTrick('rollover');
                setShowRadialMenu(false);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-pink-500 hover:bg-pink-400 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: Roll Over 🔄"
            >
              🔄
            </button>

            {/* Far Right: Zoomies */}
            <button
              onClick={() => {
                handlePerformTrick('zoomies');
                setShowRadialMenu(false);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-lime-400 hover:bg-lime-300 text-black p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: Zoomies ⚡"
            >
              ⚡
            </button>

            {/* Bottom-Left: Beg / Paw Wave */}
            <button
              onClick={() => {
                handlePerformTrick('beg');
                setShowRadialMenu(false);
              }}
              className="absolute bottom-2 left-6 bg-rose-500 hover:bg-rose-400 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: Paw Wave 🐾"
            >
              🐾
            </button>

            {/* Bottom-Right: 360 Spin */}
            <button
              onClick={() => {
                handlePerformTrick('spin');
                setShowRadialMenu(false);
              }}
              className="absolute bottom-2 right-6 bg-cyan-400 hover:bg-cyan-300 text-black p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Trick: 360 Spin 💫"
            >
              💫
            </button>

            {/* Bottom Center: Bath */}
            <button
              onClick={() => {
                handleBath();
                setShowRadialMenu(false);
              }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Bubble Bath"
            >
              <Bath className="w-3.5 h-3.5" />
            </button>

            {/* Center: Open Sanctuary */}
            <button
              onClick={() => {
                setShowRadialMenu(false);
                onOpenSanctuary?.();
              }}
              className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold p-3 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Open Sanctuary"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pet Canvas Container */}
      {isMinimized ? (
        <button
          onClick={() => {
            sound.playClick();
            setIsMinimized(false);
          }}
          className="bg-black/95 hover:bg-[#1E293B] border-2 border-[#CCFF00] text-white px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.35)] flex items-center gap-2 cursor-pointer text-xs font-mono font-bold active:scale-95 transition-all"
          title="Click to Expand Screen Buddy"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-[#CCFF00] font-black">{activeBeast.name}</span>
          <span className="text-neutral-300 font-normal">(Expand)</span>
          <ChevronUp className="w-3.5 h-3.5 text-[#CCFF00]" />
        </button>
      ) : (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={(e) => {
            e.stopPropagation();
            const tricks: PetAnimationState[] = ['backflip', 'zoomies', 'rollover', 'dance', 'beg', 'spin'];
            const picked = tricks[Math.floor(Math.random() * tricks.length)];
            handlePerformTrick(picked);
          }}
          className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          {/* Status Badge */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 backdrop-blur-sm text-xs font-mono px-2.5 py-1 rounded-full border border-white/15 text-neutral-300 flex items-center gap-1.5 mb-1 pointer-events-none shadow-lg">
            <span className="text-[#CCFF00] font-black">{activeBeast.name}</span>
            <span className="text-neutral-400">· Drag anywhere · Double-click for trick 🐾</span>
          </div>

          {/* Cute Animated Screen Companion Buddy (Bigger Size: 160px or 200px) */}
          <div className={`relative group/canvas flex flex-col items-center ${!isDragging ? 'animate-hover-float' : ''}`}>
            {/* Ambient Base Shadow */}
            <div className="absolute bottom-1 inset-x-3 h-5 bg-black/60 rounded-full blur-md pointer-events-none" />

            <ProceduralPetCanvas
              species={mapBeastToSpecies(activeBeast.breed || activeBeast.species)}
              stage={pet.stage || 2}
              animationState={animState}
              talkingVolume={talkingVolume}
              width={isMobile ? 130 : petScaleMode === 'large' ? 200 : 160}
              height={isMobile ? 130 : petScaleMode === 'large' ? 200 : 160}
              interactive={false}
              renderMode="cute"
            />
          </div>

          {/* Mini Control Dock on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 mt-1 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-xl">
            {/* Quick Interactive Tricks */}
            <div className="flex items-center gap-1 border-r border-white/15 pr-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('backflip');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00]/20 hover:bg-[#CCFF00] hover:text-black text-[#CCFF00] border border-[#CCFF00]/40 transition-colors cursor-pointer"
                title="Backflip"
              >
                🤸 Flip
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('zoomies');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 hover:bg-cyan-400 hover:text-black text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
                title="Zoomies"
              >
                ⚡ Zoom
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('dance');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 hover:bg-purple-400 hover:text-black text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                title="Dance"
              >
                💃 Dance
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('rollover');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 hover:bg-pink-400 hover:text-black text-pink-300 border border-pink-500/30 transition-colors cursor-pointer"
                title="Roll Over"
              >
                🔄 Roll
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('beg');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                title="Beg / Paw Wave"
              >
                🐾 Beg
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerformTrick('spin');
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                title="360 Spin"
              >
                💫 Spin
              </button>
            </div>
            {/* Context-Aware Voice Triggers */}
            {(pet.category === 'dog' || isChimera) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBark();
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Bark"
              >
                <span>Bark 🐶</span>
              </button>
            )}

            {(pet.category === 'cat' || isChimera) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMeow();
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 hover:bg-pink-400 hover:text-black text-pink-300 border border-pink-500/30 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Meow"
              >
                <span>Meow 🐱</span>
              </button>
            )}

            {/* Kokoro Local TTS Voice Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                const nowEnabled = kokoroTTS.toggle();
                setTtsEnabled(nowEnabled);
                if (nowEnabled) {
                  showSpeech('Kokoro Voice Active! 🗣️');
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                ttsEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/10 text-neutral-400 border border-white/10'
              }`}
              title={ttsEnabled ? 'Kokoro Neural TTS: ON (Click to Mute)' : 'Kokoro Neural TTS: OFF (Click to Enable)'}
            >
              {ttsEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
              <span>TTS</span>
            </button>

            {/* Size Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setPetScaleMode((prev) => (prev === 'normal' ? 'large' : 'normal'));
                showSpeech(petScaleMode === 'normal' ? 'Grown to Giant Size! 🐾' : 'Back to Normal Size.');
              }}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 hover:bg-[#CCFF00] hover:text-black text-neutral-300 transition-colors cursor-pointer"
              title="Toggle Pet Size (160px / 200px)"
            >
              {petScaleMode === 'large' ? '200px (XL)' : '160px'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setIsMinimized(true);
                setShowRadialMenu(false);
                setSpeechBubble(null);
              }}
              className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              title="Minimize Companion"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSanctuary?.();
              }}
              className="text-[#CCFF00] hover:underline px-2 py-0.5 font-bold text-xs cursor-pointer"
            >
              Sanctuary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
