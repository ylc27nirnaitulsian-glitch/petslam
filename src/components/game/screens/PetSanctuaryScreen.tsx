import React, { useState, useEffect } from 'react';
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

interface PetSanctuaryScreenProps {
  onGoToArena?: () => void;
}

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
  const [pettingHearts, setPettingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bubbleParticles, setBubbleParticles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  // Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showPhotoStudioModal, setShowPhotoStudioModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);

  // Status & Speech
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    `Hi Trainer! I'm ${activeBeast.name}! Tap me to pet or use the buttons below!`
  );

  // Keep speech in sync when pet changes
  useEffect(() => {
    setSpeechBubbleText(`Ready to train, Trainer! I'm ${activeBeast.name} (${activeBeast.breed || activeBeast.species})!`);
  }, [activeBeast.id, activeBeast.name, activeBeast.breed, activeBeast.species]);

  const showSpeech = (text: string, duration = 3000) => {
    setSpeechBubbleText(text);
    setTimeout(() => setSpeechBubbleText(null), duration);
  };

  // Trigger floating heart particles
  const spawnHearts = (e?: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    setPettingHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setPettingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1400);
  };

  // Trigger floating bubble particles for bath
  const spawnBubbles = () => {
    const newBubbles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 35 + Math.random() * 35,
      size: 14 + Math.random() * 18,
    }));
    setBubbleParticles((prev) => [...prev, ...newBubbles]);
    setTimeout(() => {
      setBubbleParticles([]);
    }, 2400);
  };

  // Interactive Care: Petting (Stroke)
  const handlePetTheBeast = (e: React.MouseEvent) => {
    sound.playGiggle();
    setAnimState('pet');
    spawnHearts(e);
    strokePet();
    setHeartsCount((prev) => Math.min(5, prev + 1));
    showSpeech(`*Purrrrr!* You give the best pets! ❤️`);
    setTimeout(() => setAnimState('idle'), 1600);
  };

  // Interactive Care: Feeding
  const handleFeedKibble = () => {
    sound.playChew();
    setAnimState('eat');
    setHungerLevel((prev) => Math.min(100, prev + 20));
    feedPet(BERRIES[0]);
    showSpeech(`*Munch munch* Delicious gourmet kibble! Energy +20! 🥣`);
    setTimeout(() => setAnimState('idle'), 2000);
  };

  // Interactive Care: Bubble Bath
  const handleBubbleBath = () => {
    sound.playBubblePop();
    setAnimState('bath');
    spawnBubbles();
    showSpeech(`Splish splash! Squeaky clean bubble bath! 🧼✨`);
    setTimeout(() => setAnimState('idle'), 2400);
  };

  // Interactive Care: Milk / Water Bowl
  const handlePourMilk = () => {
    sound.playMilkSlurp();
    setAnimState('drink_milk');
    showSpeech(`*Slurp slurp* Fresh milk bowl! Satiety +15! 🥛`);
    setTimeout(() => setAnimState('idle'), 2200);
  };

  // Interactive Care: Prank / Playful Sound
  const handlePlayfulToot = () => {
    sound.playToot();
    setAnimState('fart');
    showSpeech(`Oops! Excuse me! Hehehe! 💨😹`);
    setTimeout(() => setAnimState('idle'), 1800);
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
      className={`h-full w-full flex flex-col justify-between overflow-hidden p-2 sm:p-2.5 transition-colors duration-500 select-none ${
        roomLighting === 'night' ? 'bg-[#05070D]' : 'bg-[#080B12]'
      } text-white`}
    >
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

      {/* SECTION 1: COMPACT TOP BAR (Single row, no wrapping, zero vertical bloat) */}
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

        {/* Center: Cute Buddy vs Photo Card Switcher */}
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
            title="Upload Photo to Create Custom Avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAuctionModal(true)}
            className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 transition-colors cursor-pointer"
            title="VIP Auction House ($1.99)"
          >
            <Gavel className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowWorldMap(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 transition-colors cursor-pointer text-xs font-mono font-bold shadow-xs"
            title="Real-Time GPS Pet Radar"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pet Radar</span>
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
            {roomLighting === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SECTION 2: LIVING STAGE (Fits gracefully in remaining space, ZERO scrollbar) */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 my-1 overflow-hidden">
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
          <div className="relative z-20 mb-1 px-3 py-1 rounded-xl bg-black/90 backdrop-blur-md text-[#CCFF00] text-[11px] font-mono font-bold shadow-lg animate-in fade-in zoom-in-95 max-w-[280px] text-center border border-[#CCFF00]/50">
            {speechBubbleText}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/90 rotate-45 border-r border-b border-[#CCFF00]/50" />
          </div>
        )}

        {/* THE LIVING PET AVATAR DISPLAY */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {displayMode === 'cute' ? (
            /* 🐾 CUTE PROCEDURAL ANIMATED BUDDY (Talking Tom physics, blinking, tail wagging, ear twitches) */
            <div
              className="relative cursor-pointer flex flex-col items-center group"
              onClick={handlePetTheBeast}
              title="Tap to pet & purr!"
            >
              {/* Pedestal Glow Shadow */}
              <div className="absolute -bottom-2 inset-x-2 h-6 bg-[#CCFF00]/15 rounded-full blur-md" />

              <ProceduralPetCanvas
                species={speciesKey}
                stage={2}
                animationState={animState}
                talkingVolume={talkingVolume}
                width={190}
                height={175}
                interactive={true}
                onStroke={() => {
                  sound.playGiggle();
                  showSpeech(`*Purrrrr!* Keep petting! ❤️`);
                }}
                onPokeHead={() => {
                  sound.playToot();
                  showSpeech(`Ouch! Dizzy stars! ⭐😵`);
                }}
                onTickleBelly={() => {
                  sound.playGiggle();
                  showSpeech(`*Tee-hee-hee!* That tickles! 😸`);
                }}
                renderMode="cute"
              />

              <div className="flex items-center gap-1 text-[10px] mt-0.5 text-pink-400 font-bold">
                {'❤️'.repeat(heartsCount)}
                <span className="text-neutral-400 text-[9px] font-mono ml-1">
                  (Tap to pet · Rub belly)
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

                {/* Level Pill */}
                <div className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/20 text-[9px] font-mono font-bold text-[#CCFF00]">
                  LVL {activeBeast.level}
                </div>

                {/* Rarity Pill */}
                <div className="absolute top-2 right-2">
                  <span className={getRarityBadgeClasses(activeBeast.rarity)}>
                    {activeBeast.rarity}
                  </span>
                </div>

                {/* Bottom Title */}
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

      {/* SECTION 3: TALKING TOM INTERACTION DOCK (5 buttons, 1 row, h-11, zero overlapping text) */}
      <div className="shrink-0 w-full grid grid-cols-5 gap-1 sm:gap-1.5 my-1">
        {/* 1. Feed Kibble */}
        <button
          onClick={handleFeedKibble}
          className="h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 shadow cursor-pointer transition-all"
          title="Feed gourmet bowl of kibble"
        >
          <Utensils className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-none">Feed</span>
        </button>

        {/* 2. Bubble Bath */}
        <button
          onClick={handleBubbleBath}
          className="h-11 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-95 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 shadow cursor-pointer transition-all"
          title="Wash with soap and bubbles"
        >
          <Bath className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-none">Shower</span>
        </button>

        {/* 3. Milk Bowl */}
        <button
          onClick={handlePourMilk}
          className="h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 shadow cursor-pointer transition-all"
          title="Pour fresh bowl of milk"
        >
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-none">Milk</span>
        </button>

        {/* 4. Funny Cartoon Prank */}
        <button
          onClick={handlePlayfulToot}
          className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 shadow cursor-pointer transition-all"
          title="Playful cartoon sound prank"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-none">Prank</span>
        </button>

        {/* 5. Talking Tom Voice Mimic */}
        <button
          onClick={handleToggleVoiceRecord}
          className={`h-11 rounded-xl active:scale-95 font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 shadow cursor-pointer transition-all ${
            isRecordingVoice
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
          title="Record speech to repeat in chipmunk voice"
        >
          {isRecordingVoice ? (
            <MicOff className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Mic className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="leading-none">{isRecordingVoice ? 'Echoing' : 'Talk'}</span>
        </button>
      </div>

      {/* SECTION 4: COMPACT COMPANION KENNEL & BROWSER BUDDY STRIP (Slim, perfectly proportioned) */}
      <div className="shrink-0 bg-[#0E131F] border border-white/10 rounded-2xl p-1.5 space-y-1">
        {/* Header row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-display font-black uppercase text-white">
            <Layers className="w-3 h-3 text-[#CCFF00]" />
            <span>Companion Kennel ({ownedBeasts.length})</span>
          </div>

          {/* Desktop Screen Buddy Extension Toggle */}
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

        {/* Horizontal Mini Cards Strip */}
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
      {showPhotoStudioModal && <PetAvatarPhotoStudioModal onClose={() => setShowPhotoStudioModal(false)} />}
      {showAuctionModal && <PetAuctionHouseModal onClose={() => setShowAuctionModal(false)} />}
      {showExtensionModal && <ExtensionExporterModal onClose={() => setShowExtensionModal(false)} />}
      {showWorldMap && <PetWorldMapView onClose={() => setShowWorldMap(false)} />}
    </div>
  );
};
