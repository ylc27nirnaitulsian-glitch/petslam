import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { usePetCompanion, SPECIES_CONFIG } from '../../../context/PetCompanionContext';
import {
  PetAnimationState,
  BERRIES,
  BerryItem,
  WildPetEncounter,
} from '../../../types/pet';
import {
  Heart,
  Utensils,
  Sparkles,
  Zap,
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
  Check,
  Edit2,
  Swords,
  Layers,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { voiceMimic } from '../../../utils/voiceMimic';
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
  const [activeWildCatch, setActiveWildCatch] = useState<WildPetEncounter | null>(null);

  // Status & Speech
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    `Hi Trainer! I'm ${activeBeast.name}! Tap me to pet or use the buttons below!`
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(activeBeast.name);

  // Keep name input synced with activeBeast
  useEffect(() => {
    setNameInput(activeBeast.name);
    setSpeechBubbleText(`Ready to train, Trainer! I'm ${activeBeast.name} (${activeBeast.species})!`);
  }, [activeBeast.id, activeBeast.name, activeBeast.species]);

  const showSpeech = (text: string, duration = 3500) => {
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
    }, 1500);
  };

  // Trigger floating bubble particles for bath
  const spawnBubbles = () => {
    const newBubbles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 50,
      size: 14 + Math.random() * 22,
    }));
    setBubbleParticles((prev) => [...prev, ...newBubbles]);
    setTimeout(() => {
      setBubbleParticles([]);
    }, 2800);
  };

  // Interactive Care: Petting (Stroke)
  const handlePetTheBeast = (e: React.MouseEvent) => {
    sound.playGiggle();
    setAnimState('pet');
    spawnHearts(e);
    strokePet();
    setHeartsCount((prev) => Math.min(5, prev + 1));
    showSpeech(`*Purrrrr!* You give the best pets! ❤️`);
    setTimeout(() => setAnimState('idle'), 1800);
  };

  // Interactive Care: Feeding
  const handleFeedKibble = () => {
    sound.playChew();
    setAnimState('eat');
    setHungerLevel((prev) => Math.min(100, prev + 20));
    feedPet(BERRIES[0]);
    showSpeech(`*Munch munch* Delicious gourmet kibble! Energy +20! 🥣`);
    setTimeout(() => setAnimState('idle'), 2200);
  };

  // Interactive Care: Bubble Bath
  const handleBubbleBath = () => {
    sound.playBubblePop();
    setAnimState('bath');
    spawnBubbles();
    showSpeech(`Splish splash! Squeaky clean bubble bath! 🧼✨`);
    setTimeout(() => setAnimState('idle'), 2600);
  };

  // Interactive Care: Milk / Water Bowl
  const handlePourMilk = () => {
    sound.playMilkSlurp();
    setAnimState('drink_milk');
    showSpeech(`*Slurp slurp* Fresh milk bowl! Satiety +15! 🥛`);
    setTimeout(() => setAnimState('idle'), 2400);
  };

  // Interactive Care: Prank / Playful Sound
  const handlePlayfulToot = () => {
    sound.playToot();
    setAnimState('fart');
    showSpeech(`Oops! Excuse me! Hehehe! 💨😹`);
    setTimeout(() => setAnimState('idle'), 2000);
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
          `Hello Trainer Nirnai! I am ${activeBeast.name}! Let's clash in the arena!`,
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

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto selection:bg-[#CCFF00] selection:text-black transition-colors duration-500 pb-28 ${
        roomLighting === 'night' ? 'bg-[#05070D]' : 'bg-[#080B12]'
      } text-white select-none`}
    >
      {/* Floating Petting Hearts Animation */}
      {pettingHearts.map((h) => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-50 text-2xl animate-bounce"
          style={{ left: `${h.x}px`, top: `${h.y - 40}px` }}
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

      {/* TOP HEADER: Active Pet Specs & Quick Tools */}
      <div className="bg-gradient-to-b from-[#141C2E] to-[#0D121F] border-b border-white/10 px-3.5 sm:px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Active Pet Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)] shrink-0 bg-black">
              <img
                src={activeBeast.image}
                alt={activeBeast.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base uppercase text-white tracking-wide">
                  {activeBeast.name}
                </h1>
                <span className="text-[9px] font-mono font-bold bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] px-1.5 py-0.2 rounded-full uppercase">
                  {activeBeast.category}
                </span>
                <span className="text-[9px] font-mono bg-white/10 text-neutral-300 px-1.5 py-0.2 rounded-full">
                  LVL {activeBeast.level}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#CCFF00] font-bold">
                {activeBeast.species} · {activeBeast.combatArchetype}
              </p>
            </div>
          </div>

          {/* Quick Hub Actions */}
          <div className="flex items-center gap-1.5">
            {/* Clone / Photo Studio Button */}
            <button
              onClick={() => setShowPhotoStudioModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-[10px] font-mono font-bold cursor-pointer transition-all shadow-xs"
              title="Upload your personal pet photo to clone as avatar"
            >
              <Camera className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Upload Photo</span>
            </button>

            {/* Auction House */}
            <button
              onClick={() => setShowAuctionModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold cursor-pointer transition-all shadow-xs"
              title="VIP Auction House"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auctions</span>
            </button>

            {/* Browser Extension Exporter */}
            <button
              onClick={() => setShowExtensionModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold cursor-pointer transition-all shadow-xs"
              title="Browser Screen Buddy Extension"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Extension</span>
            </button>
          </div>
        </div>

        {/* Pokemon GO Wild Radar Pill */}
        <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-[#0B0E17] border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-neutral-200">
              Pokémon GO Radar: {wildEncounters.length} Wild Dogs & Cats Nearby
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setShowWorldMap(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open World Map</span>
            </button>
            <button
              onClick={refreshWildSpawns}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 text-[10px] cursor-pointer"
              title="Scan nearby area"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* LIVING PET SANCTUARY STAGE */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[360px] px-4 py-4 overflow-hidden">
        {/* Ambient Stage Lighting (Day / Night switchable) */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            roomLighting === 'night'
              ? 'bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#05070D_75%)] opacity-100'
              : 'bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#080B12_75%)] opacity-90'
          }`}
        />

        {/* Ceiling Lamp Toggle */}
        <button
          onClick={handleToggleRoomLights}
          className="absolute top-3 right-4 z-20 flex flex-col items-center cursor-pointer group"
          title="Toggle Day / Night Lamp"
        >
          <div className="w-0.5 h-5 bg-neutral-500" />
          <div
            className={`p-1.5 rounded-full border shadow-lg transition-colors ${
              roomLighting === 'night'
                ? 'bg-neutral-800 text-yellow-300 border-yellow-500/30'
                : 'bg-yellow-400 text-black border-yellow-300 shadow-yellow-400/50'
            }`}
          >
            {roomLighting === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Interactive Speech Bubble */}
        {speechBubbleText && (
          <div className="relative z-20 mb-3 px-4 py-2 rounded-2xl bg-white text-black text-xs font-bold shadow-2xl animate-in fade-in zoom-in-95 max-w-[320px] text-center border-2 border-[#CCFF00]">
            {speechBubbleText}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rotate-45 border-r-2 border-b-2 border-[#CCFF00]" />
          </div>
        )}

        {/* THE LIVING PET STANDEE / HOLOGRAPHIC SANCTUARY MODEL */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Plush Sanctuary Pedestal Floor with Lighting Shadow */}
          <div className="relative group cursor-pointer" onClick={handlePetTheBeast}>
            {/* Ambient Base Shadow */}
            <div className="absolute -bottom-4 inset-x-4 h-8 bg-black/70 rounded-full blur-md" />

            {/* Main Pet Portrait Card */}
            <div className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-3xl overflow-hidden border-3 border-[#CCFF00] shadow-[0_0_35px_rgba(204,255,0,0.3)] bg-black transition-transform duration-300 group-hover:scale-102 group-active:scale-98">
              <img
                src={activeBeast.image}
                alt={activeBeast.name}
                className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                  animState === 'eat'
                    ? 'animate-bounce'
                    : animState === 'pet'
                    ? 'scale-105'
                    : 'group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

              {/* Rarity & Level Badges */}
              <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 rounded-full border border-white/20 text-[10px] font-mono font-bold text-[#CCFF00]">
                LVL {activeBeast.level}
              </div>

              <div className="absolute top-2.5 right-2.5 bg-purple-500/80 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase text-white">
                {activeBeast.category}
              </div>

              {/* Bottom Pet Identification */}
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="font-display font-black text-lg text-white uppercase tracking-wider block truncate">
                  {activeBeast.name}
                </span>
                <span className="text-[11px] text-[#CCFF00] font-mono font-bold block truncate">
                  {activeBeast.species}
                </span>

                {/* Affection Hearts */}
                <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                  {'❤️'.repeat(heartsCount)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-400 mt-2 text-center">
            Tap pet to stroke & purr · Use action buttons below to feed & wash
          </div>
        </div>

        {/* TALKING TOM INTERACTION DOCK */}
        <div className="relative z-20 mt-4 w-full max-w-md grid grid-cols-5 gap-1.5 sm:gap-2 px-2">
          {/* 1. Feed Kibble */}
          <button
            onClick={handleFeedKibble}
            className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
            title="Feed Bowl of Kibble"
          >
            <Utensils className="w-4 h-4" />
            <span>Feed</span>
          </button>

          {/* 2. Bubble Bath */}
          <button
            onClick={handleBubbleBath}
            className="py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
            title="Soap Bubble Bath"
          >
            <Bath className="w-4 h-4" />
            <span>Shower</span>
          </button>

          {/* 3. Milk Bowl */}
          <button
            onClick={handlePourMilk}
            className="py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
            title="Pour Fresh Milk"
          >
            <Coffee className="w-4 h-4" />
            <span>Milk</span>
          </button>

          {/* 4. Funny Prank */}
          <button
            onClick={handlePlayfulToot}
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
            title="Playful Cartoon Prank"
          >
            <Sparkles className="w-4 h-4" />
            <span>Prank</span>
          </button>

          {/* 5. Talking Tom Voice Mimic */}
          <button
            onClick={handleToggleVoiceRecord}
            className={`py-2.5 rounded-xl font-display font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all ${
              isRecordingVoice
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
            title="Record speech to repeat in chipmunk voice"
          >
            {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecordingVoice ? 'Echoing' : 'Talk'}</span>
          </button>
        </div>
      </div>

      {/* MULTI-PET CAROUSEL: Switch between any owned Dogs & Cats */}
      <div className="px-3.5 sm:px-5 mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-display font-black uppercase text-white">
            <Layers className="w-4 h-4 text-[#CCFF00]" />
            <span>Your Pets & Companion Kennel ({ownedBeasts.length})</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Tap any pet to make Active Buddy
          </span>
        </div>

        {/* Horizontal Carousel of Owned Pets */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ownedBeasts.map((beast) => {
            const isActive = beast.id === activeBeast.id;
            return (
              <div
                key={beast.id}
                onClick={() => {
                  sound.playVictory();
                  selectActiveBeast(beast.id);
                  showSpeech(`Switched active buddy to ${beast.name} (${beast.species})!`);
                }}
                className={`flex items-center gap-2.5 p-2 rounded-2xl border cursor-pointer transition-all shrink-0 min-w-[150px] ${
                  isActive
                    ? 'bg-[#182030] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'bg-[#121622] border-white/10 hover:border-white/25 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-black shrink-0">
                  <img
                    src={beast.image}
                    alt={beast.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="font-display font-black text-xs text-white uppercase truncate">
                    {beast.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#CCFF00] truncate">
                    {beast.species}
                  </div>
                  <div className="text-[8px] font-mono text-neutral-400">
                    LVL {beast.level} {isActive ? '· ACTIVE' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Web Companion Toggle Banner */}
      <div className="mx-3.5 sm:mx-5 mt-3 p-3 rounded-2xl bg-[#121824] border border-cyan-400/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Screen Buddy Overlay</div>
            <div className="text-[10px] text-neutral-400 font-mono">
              Roam across your desktop screen with live battery detection
            </div>
          </div>
        </div>

        <button
          onClick={toggleOverlay}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            isOverlayActive
              ? 'bg-[#CCFF00] text-black shadow'
              : 'bg-white/10 text-neutral-300 hover:text-white'
          }`}
        >
          {isOverlayActive ? 'Active ON ✓' : 'Turn ON'}
        </button>
      </div>

      {/* MODALS */}
      {showPhotoStudioModal && <PetAvatarPhotoStudioModal onClose={() => setShowPhotoStudioModal(false)} />}
      {showAuctionModal && <PetAuctionHouseModal onClose={() => setShowAuctionModal(false)} />}
      {showExtensionModal && <ExtensionExporterModal onClose={() => setShowExtensionModal(false)} />}
      {showWorldMap && <PetWorldMapView onClose={() => setShowWorldMap(false)} />}
    </div>
  );
};
