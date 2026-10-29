import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { usePetCompanion, SPECIES_CONFIG } from '../../../context/PetCompanionContext';
import {
  PetAnimationState,
  BERRIES,
  WildPetEncounter,
} from '../../../types/pet';
import {
  Heart,
  Utensils,
  Sparkles,
  RotateCcw,
  Camera,
  Mic,
  MicOff,
  Gavel,
  Compass,
  Moon,
  Sun,
  Coffee,
  Bath,
  Tv,
  Layers,
  Sparkle,
  Smile,
  Droplets,
  Flame,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { voiceMimic } from '../../../utils/voiceMimic';
import { ProceduralPetCanvas } from '../pet/ProceduralPetCanvas';
import { mapBeastToSpecies, getPetPhoto, getRarityBadgeClasses } from '../../../utils/petVisuals';
import { ExtensionExporterModal } from '../pet/ExtensionExporterModal';
import { WildPetCatchModal } from '../pet/WildPetCatchModal';
import { PetAuctionHouseModal } from '../pet/PetAuctionHouseModal';
import { PetAvatarPhotoStudioModal } from '../pet/PetAvatarPhotoStudioModal';
import { PetWorldMapView } from '../pet/PetWorldMapView';
import { triggerConfetti } from '../../../utils/confetti';

interface PetSanctuaryScreenProps {
  onGoToArena?: () => void;
}

interface DraggableCareTool {
  id: string;
  name: string;
  type: 'food' | 'sponge' | 'milk' | 'treat';
  emoji: string;
  label: string;
  bgClass: string;
  borderClass: string;
}

const CARE_TOOLS: DraggableCareTool[] = [
  {
    id: 'steak',
    name: 'Prime Steak',
    type: 'food',
    emoji: '🥩',
    label: 'Steak',
    bgClass: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300',
    borderClass: 'border-rose-400/40',
  },
  {
    id: 'kibble',
    name: 'Kibble Feast',
    type: 'food',
    emoji: '🥣',
    label: 'Kibble',
    bgClass: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300',
    borderClass: 'border-amber-400/40',
  },
  {
    id: 'berry',
    name: 'Oran Berry',
    type: 'treat',
    emoji: '🫐',
    label: 'Berries',
    bgClass: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
    borderClass: 'border-blue-400/40',
  },
  {
    id: 'milk',
    name: 'Milk Bowl',
    type: 'milk',
    emoji: '🥛',
    label: 'Milk',
    bgClass: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300',
    borderClass: 'border-cyan-400/40',
  },
  {
    id: 'sponge',
    name: 'Soapy Sponge',
    type: 'sponge',
    emoji: '🧽',
    label: 'Sponge',
    bgClass: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300',
    borderClass: 'border-emerald-400/40',
  },
];

export const PetSanctuaryScreen: React.FC<PetSanctuaryScreenProps> = ({ onGoToArena }) => {
  const { activeBeast, ownedBeasts, selectActiveBeast } = useGame();
  const {
    feedPet,
    strokePet,
    isOverlayActive,
    toggleOverlay,
    wildEncounters,
    refreshWildSpawns,
  } = usePetCompanion();

  // Avatar Display Mode: 'cute' (Animated Talking Tom Buddy) vs 'card' (Realistic Photo Card)
  const [displayMode, setDisplayMode] = useState<'cute' | 'card'>('cute');

  // Animation & Visual State
  const [animState, setAnimState] = useState<PetAnimationState>('idle');
  const [talkingVolume, setTalkingVolume] = useState<number>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [roomLighting, setRoomLighting] = useState<'day' | 'night'>('day');
  const [heartsCount, setHeartsCount] = useState<number>(4);
  const [hungerLevel, setHungerLevel] = useState<number>(85);
  const [cleanlinessLevel, setCleanlinessLevel] = useState<number>(90);
  const [pettingHearts, setPettingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bubbleParticles, setBubbleParticles] = useState<
    { id: number; x: number; y: number; size: number }[]
  >([]);

  // Drag & Drop Physics State
  const [activeDragTool, setActiveDragTool] = useState<DraggableCareTool | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringPetStage, setIsHoveringPetStage] = useState(false);
  const petStageRef = useRef<HTMLDivElement | null>(null);

  // Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showPhotoStudioModal, setShowPhotoStudioModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);

  // Status & Speech
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    `Hi Trainer! I'm ${activeBeast.name}! Drag treats or the soapy sponge onto me, or tap below!`
  );

  // Keep speech in sync when pet changes
  useEffect(() => {
    setSpeechBubbleText(
      `Ready to train, Trainer! I'm ${activeBeast.name} (${activeBeast.breed || activeBeast.species})!`
    );
  }, [activeBeast.id, activeBeast.name, activeBeast.breed, activeBeast.species]);

  const showSpeech = (text: string, duration = 3000) => {
    setSpeechBubbleText(text);
    setTimeout(() => setSpeechBubbleText(null), duration);
  };

  // Trigger floating heart particles
  const spawnHearts = (x?: number, y?: number) => {
    const id = Date.now() + Math.random();
    const spawnX = x !== undefined ? x : window.innerWidth / 2;
    const spawnY = y !== undefined ? y : window.innerHeight / 2;
    setPettingHearts((prev) => [...prev, { id, x: spawnX, y: spawnY }]);
    setTimeout(() => {
      setPettingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1400);
  };

  // Trigger floating bubble particles for bath / scrubbing
  const spawnBubblesAt = (relXPercent: number, relYPercent: number, count = 4) => {
    const newBubbles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      x: Math.max(10, Math.min(90, relXPercent + (Math.random() - 0.5) * 15)),
      y: Math.max(10, Math.min(90, relYPercent + (Math.random() - 0.5) * 15)),
      size: 10 + Math.random() * 16,
    }));
    setBubbleParticles((prev) => [...prev, ...newBubbles]);
    setTimeout(() => {
      setBubbleParticles((prev) => prev.filter((b) => !newBubbles.some((nb) => nb.id === b.id)));
    }, 1800);
  };

  // Interactive Care: Petting (Stroke) - Silent visual feedback
  const handlePetTheBeast = (e: React.MouseEvent) => {
    setAnimState('pet');
    spawnHearts(e.clientX, e.clientY);
    strokePet();
    setHeartsCount((prev) => Math.min(5, prev + 1));
    showSpeech(`*Purrrrr!* You give the best pets! ❤️`);
    setTimeout(() => setAnimState('idle'), 1600);
  };

  // Interactive Care: Feeding - Silent visual feedback
  const handleFeedKibble = (treatName = 'kibble', bonus = 20) => {
    setAnimState('eat');
    setHungerLevel((prev) => Math.min(100, prev + bonus));
    feedPet(BERRIES[0]);
    spawnHearts();
    showSpeech(`*Nom nom nom!* Loved that ${treatName}! Hunger -${bonus}%! 😋`);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  // Interactive Care: Bubble Bath - Silent visual feedback
  const handleBubbleBath = () => {
    setAnimState('bath');
    spawnBubblesAt(50, 50, 10);
    setCleanlinessLevel(100);
    showSpeech(`Splish splash! Squeaky clean bubble bath! 🧼✨`);
    setTimeout(() => setAnimState('idle'), 2400);
  };

  // Interactive Care: Milk / Water Bowl - Silent visual feedback
  const handlePourMilk = () => {
    setAnimState('drink_milk');
    setHungerLevel((prev) => Math.min(100, prev + 15));
    showSpeech(`*Slurp slurp* Fresh cold milk! Satiety +15! 🥛`);
    setTimeout(() => setAnimState('idle'), 2200);
  };

  // Interactive Care: Prank / Playful
  const handlePlayfulToot = () => {
    setAnimState('fart');
    showSpeech(`Oops! Excuse me! Hehehe! 💨😹`);
    setTimeout(() => setAnimState('idle'), 1800);
  };

  // Interactive Care: Pet Tricks & Acrobatics
  const handlePerformTrick = (trick: PetAnimationState) => {
    setAnimState(trick);
    const trickMessages: Record<string, string> = {
      backflip: `🤸 Look at that somersault backflip! High agility!`,
      zoomies: `⚡ ZOOMIES! Running at supersonic speed!`,
      rollover: `🔄 Belly up! Rolling over playfully!`,
      dance: `💃 Tapping paws to the rhythm! Let's dance!`,
      beg: `🐾 Sitting up and waving paws! So cute!`,
      spin: `💫 360-degree whirlwind spin! Whoosh!`,
    };
    showSpeech(trickMessages[trick] || `Ta-da! Amazing trick! ✨`, 3200);
    setTimeout(() => {
      setAnimState('idle');
    }, 3200);
  };

  // --- DRAGGABLE TOOLS TOUCH & POINTER PHYSICS ---
  const handleToolPointerDown = (tool: DraggableCareTool, e: React.PointerEvent) => {
    e.preventDefault();
    sound.playClick();
    setActiveDragTool(tool);
    setDragPointerPos({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (tool.type === 'food' || tool.type === 'treat' || tool.type === 'milk') {
      showSpeech(`Drag ${tool.name} into ${activeBeast.name}'s mouth!`);
    } else if (tool.type === 'sponge') {
      showSpeech(`Rub the soapy sponge all over ${activeBeast.name}! 🧽`);
    }
  };

  const handleGlobalPointerMove = (e: React.PointerEvent) => {
    if (!activeDragTool) return;
    setDragPointerPos({ x: e.clientX, y: e.clientY });

    // Check if pointer is over the pet stage
    if (petStageRef.current) {
      const rect = petStageRef.current.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      setIsHoveringPetStage(isInside);

      if (isInside && activeDragTool.type === 'sponge') {
        // Scrubbing physics: spawn dynamic bubbles as sponge is dragged across pet
        const relX = ((e.clientX - rect.left) / rect.width) * 100;
        const relY = ((e.clientY - rect.top) / rect.height) * 100;
        if (Math.random() < 0.4) {
          spawnBubblesAt(relX, relY, 2);
          setCleanlinessLevel((prev) => Math.min(100, prev + 2));
        }
      }
    }
  };

  const handleGlobalPointerUp = (e: React.PointerEvent) => {
    if (!activeDragTool) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasHovering = isHoveringPetStage;
    const tool = activeDragTool;
    setActiveDragTool(null);
    setDragPointerPos(null);
    setIsHoveringPetStage(false);

    // If dropped inside pet stage, execute targeted drop reaction
    if (wasHovering) {
      if (tool.type === 'food' || tool.type === 'treat') {
        handleFeedKibble(tool.name, tool.id === 'steak' ? 30 : 20);
        triggerConfetti();
      } else if (tool.type === 'milk') {
        handlePourMilk();
      } else if (tool.type === 'sponge') {
        setAnimState('bath');
        setCleanlinessLevel(100);
        showSpeech(`✨ Super clean! ${activeBeast.name} is squeaky clean and sparkling!`);
        setTimeout(() => setAnimState('idle'), 2000);
      }
    } else {
      // Direct click fallback (if released without dragging far)
      if (tool.type === 'food' || tool.type === 'treat') {
        handleFeedKibble(tool.name, 20);
      } else if (tool.type === 'milk') {
        handlePourMilk();
      } else if (tool.type === 'sponge') {
        handleBubbleBath();
      }
    }
  };

  // Talking Tom Voice Mimic (Repeater)
  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      showSpeech('Repeating what you said! 📢');
      setAnimState('talk');

      await voiceMimic.stopAndRepeat(
        (amp) => setTalkingVolume(amp),
        () => {
          setTalkingVolume(0);
          setAnimState('idle');
          showSpeech(`Hehe! That was hilarious!`);
        }
      );
    } else {
      const res = await voiceMimic.startListening(() => {});
      if (res.success) {
        setIsRecordingVoice(true);
        showSpeech('Listening... Speak now into your mic! 🎙️');
      } else {
        showSpeech(`Mic unavailable, speaking preset!`);
        setAnimState('talk');
        voiceMimic.speakPresetPhrase(
          `Hello Trainer! I am ${activeBeast.name}! Ready to clash in the arena!`,
          (amp) => setTalkingVolume(amp),
          () => {
            setTalkingVolume(0);
            setAnimState('idle');
          }
        );
      }
    }
  };

  const handleToggleRoomLights = () => {
    sound.playClick();
    if (roomLighting === 'day') {
      setRoomLighting('night');
      setAnimState('sleep');
      showSpeech(`Goodnight Trainer... Zzz 😴🌙`);
    } else {
      setRoomLighting('day');
      setAnimState('idle');
      showSpeech(`Good morning! Ready for battle! ☀️`);
    }
  };

  const speciesKey = mapBeastToSpecies(activeBeast.breed || activeBeast.species);

  return (
    <div
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      className={`h-full w-full flex flex-col justify-between overflow-hidden p-2 sm:p-2.5 transition-colors duration-500 select-none ${
        roomLighting === 'night' ? 'bg-[#05070D]' : 'bg-[#080B12]'
      } text-white`}
    >
      {/* Active Floating Dragged Tool Physics Ghost */}
      {activeDragTool && dragPointerPos && (
        <div
          className="fixed pointer-events-none z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 border border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.6)] backdrop-blur-md transform -translate-x-1/2 -translate-y-1/2 scale-125 transition-transform"
          style={{ left: `${dragPointerPos.x}px`, top: `${dragPointerPos.y}px` }}
        >
          <span className="text-2xl animate-bounce">{activeDragTool.emoji}</span>
          <span className="text-xs font-mono font-bold text-[#CCFF00]">
            {isHoveringPetStage ? 'Drop to Apply!' : activeDragTool.name}
          </span>
        </div>
      )}

      {/* Floating Petting Hearts Animation */}
      {pettingHearts.map((h) => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-50 text-xl animate-bounce"
          style={{ left: `${h.x}px`, top: `${h.y - 30}px` }}
        >
          ❤️
        </div>
      ))}

      {/* Floating Bath Bubbles Animation */}
      {bubbleParticles.map((b) => (
        <div
          key={b.id}
          className="absolute pointer-events-none z-40 rounded-full bg-cyan-300/30 border border-cyan-200/60 backdrop-blur-xs animate-ping"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
          }}
        />
      ))}

      {/* SECTION 1: COMPACT TOP BAR */}
      <div className="shrink-0 bg-gradient-to-b from-[#141C2E] to-[#0D121F] border border-white/10 rounded-2xl px-2.5 py-1.5 flex items-center justify-between gap-1 shadow-sm">
        {/* Active Pet Identity */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#CCFF00] shrink-0 bg-black shadow-xs">
            <img
              src={getPetPhoto(activeBeast)}
              alt={activeBeast.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-display font-black text-xs text-white uppercase truncate">
                {activeBeast.name}
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] px-1 py-0.2 rounded">
                LVL {activeBeast.level}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#CCFF00] truncate block">
              {activeBeast.breed || activeBeast.species}
            </span>
          </div>
        </div>

        {/* Center: Pet Condition Indicators (Hunger & Cleanliness) */}
        <div className="hidden sm:flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3 h-3 text-amber-400" />
            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${hungerLevel}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-amber-300">{hungerLevel}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                style={{ width: `${cleanlinessLevel}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-300">{cleanlinessLevel}%</span>
          </div>
        </div>

        {/* Cute Buddy vs Photo Card Switcher */}
        <div className="flex items-center bg-black/60 border border-white/15 rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setDisplayMode('cute')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              displayMode === 'cute'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Interactive Animated Talking Tom Buddy"
          >
            🐾 Buddy
          </button>
          <button
            onClick={() => setDisplayMode('card')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              displayMode === 'card'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Authentic Champion Breed Card"
          >
            📷 Card
          </button>
        </div>

        {/* Right Tools (Photo Studio, Auction, Map Radar, Day/Night) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowPhotoStudioModal(true)}
            className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 transition-colors cursor-pointer"
            title="AI Pet Photo Studio & Card Creator"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAuctionModal(true)}
            className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 transition-colors cursor-pointer"
            title="Live Auction House Floor"
          >
            <Gavel className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowWorldMap(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 transition-colors cursor-pointer text-xs font-mono font-bold shadow-xs"
            title="Real-Time GPS Pet Radar"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Radar</span>
          </button>
          <button
            onClick={handleToggleRoomLights}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              roomLighting === 'night'
                ? 'bg-neutral-800 text-yellow-300 border-yellow-500/30'
                : 'bg-yellow-400 text-black border-yellow-300'
            }`}
            title="Toggle Day / Night"
          >
            {roomLighting === 'night' ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: LIVING STAGE WITH DRAG & DROP TARGET RECEPTOR */}
      <div
        ref={petStageRef}
        className={`flex-1 flex flex-col items-center justify-center relative min-h-0 my-1 overflow-hidden rounded-2xl transition-all duration-300 ${
          isHoveringPetStage
            ? 'ring-2 ring-[#CCFF00] bg-[#CCFF00]/5 scale-[1.01]'
            : 'border border-transparent'
        }`}
      >
        {/* Ambient Stage Lighting Background */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            roomLighting === 'night'
              ? 'bg-[radial-gradient(ellipse_at_center,#1e1b4b_0%,#05070D_80%)] opacity-80'
              : 'bg-[radial-gradient(ellipse_at_center,#1e293b_0%,#080B12_80%)] opacity-70'
          }`}
        />

        {/* Speech Bubble (Floating above pet) */}
        {speechBubbleText && (
          <div className="relative z-20 mb-1 px-3 py-1 rounded-xl bg-black/90 backdrop-blur-md text-[#CCFF00] text-[11px] font-mono font-bold shadow-lg animate-in fade-in zoom-in-95 max-w-[320px] text-center border border-[#CCFF00]/50">
            {speechBubbleText}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/90 rotate-45 border-r border-b border-[#CCFF00]/50" />
          </div>
        )}

        {/* Hover Target Indicator */}
        {isHoveringPetStage && (
          <div className="absolute top-2 z-30 px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black font-mono font-bold text-[10px] animate-pulse">
            🎯 Release to Care for {activeBeast.name}!
          </div>
        )}

        {/* THE LIVING PET AVATAR DISPLAY */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {displayMode === 'cute' ? (
            /* 🐾 CUTE PROCEDURAL ANIMATED BUDDY */
            <div
              className="relative cursor-pointer flex flex-col items-center group"
              onClick={handlePetTheBeast}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const tricks: PetAnimationState[] = ['backflip', 'zoomies', 'rollover', 'dance', 'beg', 'spin'];
                const picked = tricks[Math.floor(Math.random() * tricks.length)];
                handlePerformTrick(picked);
              }}
              title="Tap to pet · Double-click to perform trick! 🤸"
            >
              {/* Pedestal Glow Shadow */}
              <div
                className={`absolute -bottom-2 inset-x-2 h-6 rounded-full blur-md transition-colors ${
                  isHoveringPetStage ? 'bg-[#CCFF00]/40 scale-125' : 'bg-[#CCFF00]/15'
                }`}
              />

              <ProceduralPetCanvas
                species={speciesKey}
                stage={2}
                animationState={animState}
                talkingVolume={talkingVolume}
                width={190}
                height={175}
                interactive={true}
                onStroke={() => {
                  showSpeech(`*Purrrrr!* Keep petting! ❤️`);
                }}
                onPokeHead={() => {
                  showSpeech(`Ouch! Dizzy stars! ⭐😵`);
                }}
                onTickleBelly={() => {
                  showSpeech(`*Tee-hee-hee!* That tickles! 😸`);
                }}
                renderMode="cute"
              />

              <div className="flex items-center gap-1 text-[10px] mt-0.5 text-pink-400 font-bold">
                {'❤️'.repeat(heartsCount)}
                <span className="text-neutral-400 text-[9px] font-mono ml-1">
                  (Drag treats or sponge onto pet · Tap to tickle)
                </span>
              </div>
            </div>
          ) : (
            /* 📷 REALISTIC HIGH-RES BREED CARD */
            <div
              className="relative cursor-pointer group"
              onClick={handlePetTheBeast}
              title="Tap to inspect"
            >
              <div className="relative w-40 h-48 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.25)] bg-black transition-transform group-hover:scale-102">
                <img
                  src={getPetPhoto(activeBeast)}
                  alt={activeBeast.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/20 text-[9px] font-mono font-bold text-[#CCFF00]">
                  LVL {activeBeast.level}
                </div>

                <div className="absolute top-2 right-2">
                  <span className={getRarityBadgeClasses(activeBeast.rarity)}>
                    {activeBeast.rarity}
                  </span>
                </div>

                <div className="absolute bottom-2 inset-x-2 text-center">
                  <span className="font-display font-black text-sm text-white uppercase truncate block">
                    {activeBeast.name}
                  </span>
                  <span className="text-[10px] text-[#CCFF00] font-mono font-bold truncate block">
                    {activeBeast.breed || activeBeast.species}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: TACTILE DRAGGABLE CARE TRAY & VOICE DOCK */}
      <div className="shrink-0 w-full space-y-1.5 my-1">
        {/* Tray Label */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
          <span className="flex items-center gap-1 font-bold text-neutral-300">
            <span>✨ Tactile Care Tray</span>
            <span className="text-[9px] text-[#CCFF00] font-normal">(Drag onto pet or tap)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px]">Satiety: {hungerLevel}%</span>
            <span>·</span>
            <span className="text-[9px]">Clean: {cleanlinessLevel}%</span>
          </div>
        </div>

        {/* Care Tools Grid */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {CARE_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onPointerDown={(e) => handleToolPointerDown(tool, e)}
              className={`h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-grab active:cursor-grabbing active:scale-95 shadow-xs ${tool.bgClass} ${tool.borderClass}`}
              title={`Drag ${tool.name} onto pet or click to use`}
            >
              <span className="text-base leading-none select-none">{tool.emoji}</span>
              <span className="text-[9px] font-mono font-bold leading-none mt-0.5 truncate max-w-full">
                {tool.label}
              </span>
            </button>
          ))}

          {/* Talking Tom Voice Mimic */}
          <button
            onClick={handleToggleVoiceRecord}
            className={`h-11 rounded-xl border border-purple-400/40 flex flex-col items-center justify-center p-1 transition-all cursor-pointer active:scale-95 shadow-xs ${
              isRecordingVoice
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-purple-600/30 hover:bg-purple-600/40 text-purple-200'
            }`}
            title="Record voice to repeat in chipmunk pitch"
          >
            {isRecordingVoice ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-purple-300" />
            )}
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">
              {isRecordingVoice ? 'Echoing' : 'Mimic'}
            </span>
          </button>
        </div>

        {/* Interactive Tricks & Acrobatics Row */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1 pt-1">
          <span className="flex items-center gap-1 font-bold text-[#CCFF00]">
            <span>🤸 Pet Tricks & Acrobatics</span>
            <span className="text-[9px] text-neutral-400 font-normal">(Tap trick or double-click buddy)</span>
          </span>
        </div>

        {/* Tricks Grid */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          <button
            onClick={() => handlePerformTrick('backflip')}
            className="h-9 rounded-xl border border-yellow-400/30 bg-yellow-400/10 hover:bg-yellow-400 hover:text-black text-yellow-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Perform Backflip"
          >
            <span className="text-sm leading-none">🤸</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Flip</span>
          </button>
          <button
            onClick={() => handlePerformTrick('zoomies')}
            className="h-9 rounded-xl border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black text-cyan-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Zoomies Sprint"
          >
            <span className="text-sm leading-none">⚡</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Zoom</span>
          </button>
          <button
            onClick={() => handlePerformTrick('rollover')}
            className="h-9 rounded-xl border border-pink-400/30 bg-pink-400/10 hover:bg-pink-400 hover:text-black text-pink-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Roll Over"
          >
            <span className="text-sm leading-none">🔄</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Roll</span>
          </button>
          <button
            onClick={() => handlePerformTrick('dance')}
            className="h-9 rounded-xl border border-purple-400/30 bg-purple-400/10 hover:bg-purple-400 hover:text-black text-purple-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Dance"
          >
            <span className="text-sm leading-none">💃</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Dance</span>
          </button>
          <button
            onClick={() => handlePerformTrick('beg')}
            className="h-9 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400 hover:text-black text-amber-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Beg & Paw Wave"
          >
            <span className="text-sm leading-none">🐾</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Beg</span>
          </button>
          <button
            onClick={() => handlePerformTrick('spin')}
            className="h-9 rounded-xl border border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400 hover:text-black text-emerald-300 flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="360 Spin"
          >
            <span className="text-sm leading-none">💫</span>
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5">Spin</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: COMPACT COMPANION KENNEL */}
      <div className="shrink-0 bg-[#0E131F] border border-white/10 rounded-2xl p-1.5 space-y-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-display font-black uppercase text-white">
            <Layers className="w-3 h-3 text-[#CCFF00]" />
            <span>Companion Kennel ({ownedBeasts.length})</span>
          </div>

          <button
            onClick={toggleOverlay}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
              isOverlayActive
                ? 'bg-[#CCFF00] text-black shadow'
                : 'bg-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Desktop Screen Buddy"
          >
            <Tv className="w-3 h-3" />
            <span>{isOverlayActive ? 'Buddy ON ✓' : 'Buddy OFF'}</span>
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {ownedBeasts.map((beast) => {
            const isActive = beast.id === activeBeast.id;
            return (
              <div
                key={beast.id}
                onClick={() => {
                  sound.playVictory();
                  selectActiveBeast(beast.id);
                  showSpeech(`Switched active buddy to ${beast.name}!`);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#182030] border-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.25)]'
                    : 'bg-[#121622] border-white/10 hover:border-white/20 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                  <img
                    src={getPetPhoto(beast)}
                    alt={beast.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="leading-tight pr-1">
                  <div className="font-display font-black text-[10px] text-white uppercase truncate max-w-[80px]">
                    {beast.name}
                  </div>
                  <div className="text-[8px] font-mono text-[#CCFF00] truncate max-w-[80px]">
                    {beast.breed || beast.species}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODALS */}
      {showPhotoStudioModal && (
        <PetAvatarPhotoStudioModal onClose={() => setShowPhotoStudioModal(false)} />
      )}
      {showAuctionModal && <PetAuctionHouseModal onClose={() => setShowAuctionModal(false)} />}
      {showExtensionModal && (
        <ExtensionExporterModal onClose={() => setShowExtensionModal(false)} />
      )}
      {showWorldMap && <PetWorldMapView onClose={() => setShowWorldMap(false)} />}
    </div>
  );
};
