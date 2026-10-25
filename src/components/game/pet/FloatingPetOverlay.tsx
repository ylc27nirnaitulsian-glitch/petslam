import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePetCompanion } from '../../../context/PetCompanionContext';
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
  BatteryCharging,
  Bell,
  Mic,
  Bath,
  Smile,
  Coffee,
  Volume2,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { voiceMimic } from '../../../utils/voiceMimic';

interface FloatingPetOverlayProps {
  onOpenSanctuary?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const FloatingPetOverlay: React.FC<FloatingPetOverlayProps> = ({
  onOpenSanctuary,
}) => {
  const { pet, isOverlayActive, toggleOverlay, feedPet, strokePet, availableBerries } =
    usePetCompanion();

  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [animState, setAnimState] = useState<PetAnimationState>('idle');
  const [talkingVolume, setTalkingVolume] = useState<number>(0);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Laptop Battery & Charging Detector
  const [isCharging, setIsCharging] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  // Screen Time & Reminders
  const [screenSeconds, setScreenSeconds] = useState(0);

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
    speechTimerRef.current = setTimeout(() => {
      setSpeechBubble(null);
    }, duration);
  }, []);

  // 1. Laptop Battery & Charging Detector API
  useEffect(() => {
    let batteryObj: any = null;

    const handleBatteryUpdate = () => {
      if (!batteryObj) return;
      const charging = batteryObj.charging;
      const level = Math.round(batteryObj.level * 100);
      setIsCharging(charging);
      setBatteryLevel(level);

      if (charging) {
        sound.playLevelUp();
        setAnimState('celebrate');
        showSpeech(`⚡ Laptop plugged in! Supercharging energy! 🔋 (${level}%)`);
        setTimeout(() => setAnimState('idle'), 2500);
      }
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
  }, [showSpeech]);

  // 2. Screen-Time Activity & Posture Reminders
  useEffect(() => {
    const timer = setInterval(() => {
      setScreenSeconds((prev) => {
        const next = prev + 1;
        // Trigger reminder every 15 minutes (900 seconds)
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
    sound.playBell();
    setAnimState('celebrate');
    showSpeech(picked, 5000);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  // 3. Autonomous Roaming AI
  useEffect(() => {
    if (!isOverlayActive || isMinimized || isDragging) return;

    const roamInterval = setInterval(() => {
      if (isDragging || showRadialMenu) return;

      const roll = Math.random();
      if (roll < 0.35) {
        // Walk along bottom edge
        const moveDist = (Math.random() - 0.5) * 80;
        setAnimState('walk');
        setPosition((prev) => {
          const nextX = Math.max(10, Math.min(window.innerWidth - 150, prev.x + moveDist));
          return { ...prev, x: nextX };
        });

        setTimeout(() => {
          setAnimState('idle');
        }, 1800);
      } else if (roll < 0.55) {
        setAnimState('celebrate');
        showSpeech(`*happy ${pet.name} chirp* ❤️`, 2000);
        setTimeout(() => setAnimState('idle'), 1500);
      } else if (roll < 0.75 && pet.hunger < 50) {
        setAnimState('idle');
        showSpeech(`I'm getting hungry! Feed me a berry! 🍓`, 3000);
      }
    }, 10000);

    return () => clearInterval(roamInterval);
  }, [isOverlayActive, isMinimized, isDragging, showRadialMenu, pet.name, pet.hunger, showSpeech]);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (showRadialMenu) return;
    setIsDragging(true);
    setAnimState('drag');
    dragRef.current.startX = e.clientX - position.x;
    dragRef.current.startY = e.clientY - position.y;
    dragRef.current.lastTime = performance.now();
    dragRef.current.vx = 0;
    dragRef.current.vy = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max((now - dragRef.current.lastTime) / 1000, 0.001);

    const newX = e.clientX - dragRef.current.startX;
    const newY = e.clientY - dragRef.current.startY;

    dragRef.current.vx = (newX - position.x) / dt;
    dragRef.current.vy = (newY - position.y) / dt;
    dragRef.current.lastTime = now;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const moveDist = Math.hypot(dragRef.current.vx, dragRef.current.vy);
    if (moveDist < 60) {
      sound.playClick();
      setShowRadialMenu((prev) => !prev);
      setAnimState('idle');
      return;
    }

    // Fling physics
    dragRef.current.isAirborne = true;
    let currX = position.x;
    let currY = position.y;
    let vy = Math.min(dragRef.current.vy * 0.1, 400);
    const gravity = 1200;
    let lastT = performance.now();

    const floorY = 20;

    const physicsStep = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      vy -= gravity * dt;
      currY += vy * dt;

      if (currY <= floorY) {
        currY = floorY;
        dragRef.current.isAirborne = false;
        setPosition({ x: currX, y: currY });
        sound.playPoke();
        setAnimState('celebrate');
        setTimeout(() => setAnimState('idle'), 1000);
        return;
      }

      setPosition({ x: currX, y: currY });
      requestAnimationFrame(physicsStep);
    };

    requestAnimationFrame(physicsStep);
  };

  // Talking Tom Reactions
  const handlePokeHead = () => {
    sound.playPoke();
    setAnimState('dizzy');
    showSpeech(`Ouch! My head is spinning! ⭐`);
    setTimeout(() => setAnimState('idle'), 2200);
  };

  const handleTickleBelly = () => {
    sound.playGiggle();
    setAnimState('laugh');
    showSpeech(`Hahaha! That tickles so much! ❤️`);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  const handleBath = () => {
    sound.playBubblePop();
    setAnimState('bath');
    showSpeech(`Squeaky clean! Pop the bubbles! 🧼✨`);
    setTimeout(() => setAnimState('idle'), 2600);
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
        bottom: `${Math.max(10, position.y)}px`,
        right: `${Math.max(10, position.x)}px`,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className="select-none font-sans"
    >
      {/* Speech Bubble */}
      {speechBubble && !isMinimized && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md text-[#CCFF00] border border-[#CCFF00]/40 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 z-50">
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 border-r border-b border-[#CCFF00]/40" />
        </div>
      )}

      {/* Charging Aura Indicator */}
      {isCharging && !isMinimized && (
        <div className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20 blur-[6px] animate-pulse pointer-events-none z-0" />
      )}

      {/* Radial Menu */}
      {showRadialMenu && (
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-auto z-40 animate-in fade-in zoom-in-90">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Top: Feed Berry */}
            <button
              onClick={() => {
                const b = availableBerries[0];
                if (b) {
                  feedPet(b);
                  sound.playChew();
                  setAnimState('eat');
                  showSpeech(`Yummy ${b.name}! 🍓`);
                  setTimeout(() => setAnimState('idle'), 2000);
                }
                setShowRadialMenu(false);
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-400 text-black p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Feed Berry"
            >
              <Utensils className="w-4 h-4" />
            </button>

            {/* Left: Tickle Belly */}
            <button
              onClick={() => {
                handleTickleBelly();
                setShowRadialMenu(false);
              }}
              className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 bg-pink-500 hover:bg-pink-400 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Tickle Belly"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            {/* Right: Bubble Bath */}
            <button
              onClick={() => {
                handleBath();
                setShowRadialMenu(false);
              }}
              className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 bg-blue-500 hover:bg-blue-400 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Bubble Bath"
            >
              <Bath className="w-4 h-4" />
            </button>

            {/* Bottom Left: Voice Mimic */}
            <button
              onClick={() => {
                handleVoiceMimic();
                setShowRadialMenu(false);
              }}
              className="absolute bottom-2 left-6 bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Voice Mimic"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Bottom Right: Posture Check */}
            <button
              onClick={() => {
                triggerHealthReminder();
                setShowRadialMenu(false);
              }}
              className="absolute bottom-2 right-6 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Posture & Hydration Reminder"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Center: Open Sanctuary */}
            <button
              onClick={() => {
                sound.playClick();
                setShowRadialMenu(false);
                onOpenSanctuary?.();
              }}
              className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold p-2.5 rounded-full shadow-lg border border-white/20 active:scale-95 cursor-pointer flex items-center justify-center"
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
          className="bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#CCFF00]/50 text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer text-xs font-bold"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span>{pet.name} (Screen Buddy)</span>
          <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      ) : (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          {/* Status Badge */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 backdrop-blur-sm text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-neutral-300 flex items-center gap-1.5 mb-1 pointer-events-none">
            <span className="text-[#CCFF00] font-bold">{pet.name}</span>
            {isCharging && <span className="text-cyan-400 font-bold">⚡ CHARGING</span>}
            <span className="text-pink-400">{'❤️'.repeat(pet.affectionHearts)}</span>
          </div>

          {/* Procedural Canvas */}
          <ProceduralPetCanvas
            species={pet.species}
            stage={pet.stage}
            animationState={animState}
            mood={pet.mood}
            talkingVolume={talkingVolume}
            width={120}
            height={120}
            interactive={false}
            customPalette={pet.customPalette}
            customFeatures={pet.customFeatures}
            avatarImageUrl={pet.avatarImageUrl}
          />

          {/* Mini Control Dock on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCharging((prev) => !prev);
                sound.playClick();
                showSpeech(!isCharging ? '⚡ Laptop Plugged In! Charging! 🔋' : 'Unplugged from charger.');
              }}
              className={`p-1 rounded text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                isCharging ? 'text-cyan-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Toggle Laptop Charging Mode"
            >
              <BatteryCharging className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHealthReminder();
              }}
              className="text-neutral-400 hover:text-white p-1 rounded"
              title="Hydration & Posture Reminder"
            >
              <Bell className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="text-neutral-400 hover:text-white p-1 rounded"
              title="Minimize Companion"
            >
              <EyeOff className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSanctuary?.();
              }}
              className="text-[#CCFF00] hover:underline p-1 font-bold text-[10px] cursor-pointer"
            >
              Sanctuary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
