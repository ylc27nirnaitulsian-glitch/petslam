import React, { useState, useEffect } from 'react';
import { usePetCompanion, SPECIES_CONFIG } from '../../../context/PetCompanionContext';
import { ProceduralPetCanvas } from '../pet/ProceduralPetCanvas';
import {
  PetAnimationState,
  PetSpecies,
  BERRIES,
  BerryItem,
  WildPetEncounter,
  CompanionPet,
} from '../../../types/pet';
import {
  Heart,
  Utensils,
  Dumbbell,
  Sparkles,
  Zap,
  Shield,
  Swords,
  Download,
  RotateCcw,
  Play,
  Award,
  Flame,
  ChevronRight,
  Smile,
  Edit2,
  Check,
  Mic,
  MicOff,
  Gavel,
  Compass,
  Moon,
  Sun,
  Volume2,
  Coffee,
  Bath,
  Wind,
  Tv,
  Camera,
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
  const {
    pet,
    kennelPets,
    feedPet,
    strokePet,
    trainPet,
    playFetch,
    evolvePet,
    switchSpecies,
    switchActivePet,
    renamePet,
    isOverlayActive,
    toggleOverlay,
    wildEncounters,
    refreshWildSpawns,
  } = usePetCompanion();

  const [animState, setAnimState] = useState<PetAnimationState>('idle');
  const [talkingVolume, setTalkingVolume] = useState<number>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [roomLighting, setRoomLighting] = useState<'day' | 'night'>('day');
  const [selectedBerry, setSelectedBerry] = useState<BerryItem>(BERRIES[0]);

  // Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showPhotoStudioModal, setShowPhotoStudioModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [activeWildCatch, setActiveWildCatch] = useState<WildPetEncounter | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    `Hi! I'm ${pet.name}! Poke my head or talk to me!`
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [workoutGauge, setWorkoutGauge] = useState(0);

  const triggerAnim = (anim: PetAnimationState, duration = 2200) => {
    setAnimState(anim);
    setTimeout(() => {
      setAnimState('idle');
    }, duration);
  };

  const showStatus = (msg: string, duration = 3000) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), duration);
  };

  const showSpeech = (text: string, duration = 3500) => {
    setSpeechBubbleText(text);
    setTimeout(() => setSpeechBubbleText(null), duration);
  };

  // Talking Tom Voice Mimic
  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice) {
      // Stop recording and repeat in cartoon voice!
      setIsRecordingVoice(false);
      showSpeech('Repeating what you said! 📢');
      setAnimState('talk');

      await voiceMimic.stopAndRepeat(
        (amp) => {
          setTalkingVolume(amp);
        },
        () => {
          setTalkingVolume(0);
          setAnimState('idle');
          showSpeech(`Hehe! That was hilarious!`);
        }
      );
    } else {
      // Start recording
      const res = await voiceMimic.startListening((vol) => {
        setMicVolumeLevel(vol);
      });

      if (res.success) {
        setIsRecordingVoice(true);
        showSpeech('Listening... Speak now! 🎙️');
      } else {
        // Fallback: speak funny chipmunk line!
        showSpeech(`Listening unavailable, so I'll speak for you!`);
        triggerAnim('talk', 3000);
        voiceMimic.speakPresetPhrase(
          `Hello! I'm ${pet.name}! I love running in Pet Slam! Feed me berries!`,
          (amp) => setTalkingVolume(amp),
          () => {
            setTalkingVolume(0);
            setAnimState('idle');
          }
        );
      }
    }
  };

  const handlePresetVoiceLine = (phrase: string) => {
    sound.playClick();
    showSpeech(phrase);
    triggerAnim('talk', Math.max(2000, phrase.length * 70));
    voiceMimic.speakPresetPhrase(
      phrase,
      (amp) => setTalkingVolume(amp),
      () => {
        setTalkingVolume(0);
        setAnimState('idle');
      }
    );
  };

  // Talking Tom Actions
  const handlePokeHead = () => {
    sound.playPoke();
    triggerAnim('dizzy', 2000);
    showSpeech(`Ouch! My head is spinning! ⭐`);
  };

  const handleTickleBelly = () => {
    sound.playGiggle();
    triggerAnim('laugh', 1800);
    showSpeech(`Hahaha! That tickles so much! ❤️`);
  };

  const handlePourMilk = () => {
    sound.playMilkSlurp();
    triggerAnim('drink_milk', 2600);
    showSpeech(`*Slurp slurp* Mmm, so refreshing! 🥛`);
  };

  const handleBubbleBath = () => {
    sound.playBubblePop();
    triggerAnim('bath', 2600);
    showSpeech(`Squeaky clean! Pop the bubbles! 🧼✨`);
  };

  const handleFunnyToot = () => {
    sound.playToot();
    triggerAnim('fart', 2200);
    showSpeech(`Oops! Excuse me! 💨🤭`);
  };

  const handleToggleRoomLights = () => {
    sound.playClick();
    if (roomLighting === 'day') {
      setRoomLighting('night');
      triggerAnim('sleep', 60000);
      showSpeech(`Goodnight... Zzz 😴🌙`);
    } else {
      setRoomLighting('day');
      triggerAnim('celebrate', 1500);
      showSpeech(`Good morning! Ready to play! ☀️`);
    }
  };

  const handleFeed = (berry: BerryItem) => {
    setSelectedBerry(berry);
    const result = feedPet(berry);
    triggerAnim('eat', 2200);
    showSpeech(`Yummy ${berry.name}! +${berry.hungerRestore} Hunger!`);
    showStatus(result.message);
  };

  const handleStroke = () => {
    const res = strokePet();
    triggerAnim('pet', 1800);
    showSpeech(`Purrrr! You give the best pets! 💕`);
  };

  const handleWorkoutTap = (stat: 'attack' | 'defense' | 'agility') => {
    setWorkoutGauge((prev) => Math.min(100, prev + 25));
    sound.playAttack();
    triggerAnim('celebrate', 1000);

    if (workoutGauge >= 75) {
      const res = trainPet(stat);
      setWorkoutGauge(0);
      showStatus(`🏋️ Gym Workout Complete! +2 ${stat.toUpperCase()} (+${res.expGained} EXP)`);
      sound.playLevelUp();
    }
  };

  const handleSaveRename = () => {
    renamePet(nameInput);
    setIsRenaming(false);
    sound.playClick();
  };

  // Breed lists
  const dogSpecies: { id: PetSpecies; label: string; breed: string }[] = [
    { id: 'shiba', label: 'Hachi', breed: 'Shiba Inu' },
    { id: 'retriever', label: 'Buddy', breed: 'Golden Retriever' },
    { id: 'husky', label: 'Ghost', breed: 'Arctic Husky' },
    { id: 'bulldog', label: 'Rocky', breed: 'French Bulldog' },
  ];

  const catSpecies: { id: PetSpecies; label: string; breed: string }[] = [
    { id: 'tabby', label: 'Ginger', breed: 'Orange Tabby' },
    { id: 'calico', label: 'Luna', breed: 'Calico Cat' },
    { id: 'siamese', label: 'Mochi', breed: 'Siamese Cat' },
    { id: 'blackcat', label: 'Midnight', breed: 'Shadow Black Cat' },
  ];

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto selection:bg-[#CCFF00] selection:text-black transition-colors duration-500 ${
        roomLighting === 'night' ? 'bg-[#04060A]' : 'bg-[#07090E]'
      } text-white`}
    >
      {/* Top Bar with Name, Hearts & Quick Tools */}
      <div className="relative bg-gradient-to-b from-[#141B2D] to-[#0A0E17] border-b border-white/10 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Pet Name & Breed Title */}
          <div className="flex items-center gap-2">
            {pet.avatarImageUrl ? (
              <div
                onClick={() => setShowPhotoStudioModal(true)}
                className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.4)] shrink-0 cursor-pointer group"
                title="Your Real Pet's Photo! Tap to edit or scan another pet."
              >
                <img
                  src={pet.avatarImageUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-mono text-[#CCFF00] font-bold">
                  Edit
                </div>
              </div>
            ) : (
              <span className="text-xl">
                {['tabby', 'calico', 'siamese', 'blackcat'].includes(pet.species) ? '🐱' : '🐶'}
              </span>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                {isRenaming ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-neutral-800 text-white px-2 py-0.5 rounded text-xs font-bold border border-[#CCFF00]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveRename}
                      className="p-1 bg-[#CCFF00] text-black rounded hover:bg-[#b8e600] cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-sm font-black uppercase tracking-wide text-white">
                      {pet.name}
                    </h1>
                    <button
                      onClick={() => {
                        setNameInput(pet.name);
                        setIsRenaming(true);
                      }}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
                  Lv.{pet.level}
                </span>
                {pet.isCustomAvatar && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold">
                    AI Avatar
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#CCFF00] font-mono font-bold">
                CP {pet.stats.cp} · {pet.breedName || pet.title}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons: Clone Pet, Radar, Auction, Extension, Overlay */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPhotoStudioModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse"
              title="Upload your own pet photo to create a personalized custom avatar!"
            >
              <Camera className="w-3 h-3" />
              <span>Clone My Pet</span>
            </button>

            <button
              onClick={() => {
                toggleOverlay();
                sound.playClick();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${
                isOverlayActive
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/10'
              }`}
              title="Summon or dismiss pet roaming inside this applet view"
            >
              <Tv className="w-3 h-3" />
              <span>{isOverlayActive ? 'In-App Float ON' : 'In-App Float OFF'}</span>
            </button>

            <button
              onClick={() => setShowAuctionModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold cursor-pointer"
            >
              <Gavel className="w-3 h-3" />
              <span>Auctions</span>
            </button>

            <button
              onClick={() => setShowExtensionModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#CCFF00]/15 hover:bg-[#CCFF00]/25 text-[#CCFF00] border border-[#CCFF00]/30 text-[10px] font-mono font-bold cursor-pointer"
              title="Get unified Chrome Extension that roams across ALL browser tabs (Google, YouTube, etc.)"
            >
              <Download className="w-3 h-3" />
              <span>All-Tabs Extension</span>
            </button>
          </div>
        </div>

        {/* AI Pet Photo Clone Studio Banner */}
        <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-[#1C1230] to-black border border-purple-500/40 flex items-center justify-between text-[11px] shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/25 border border-purple-500/50 flex items-center justify-center text-purple-300 text-sm">
              📸
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">Upload Your Pet Photo & Create Avatar</span>
                <span className="text-[9px] bg-purple-500/30 text-purple-300 font-mono font-bold px-1.5 rounded">
                  AI Powered
                </span>
              </div>
              <span className="text-neutral-300 text-[10px]">
                Upload any dog or cat photo — AI generates your personal animated game companion!
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowPhotoStudioModal(true)}
            className="px-2.5 py-1 rounded-lg bg-purple-400 hover:bg-purple-300 text-black font-black text-[10px] font-mono uppercase tracking-wide cursor-pointer shrink-0 active:scale-95 transition-all shadow-[0_0_12px_rgba(192,132,252,0.4)]"
          >
            Upload Photo
          </button>
        </div>

        {/* All Tabs Roaming Info Callout */}
        <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-blue-950/40 via-emerald-950/30 to-black border border-emerald-500/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-base">🌐</span>
            <div>
              <span className="font-bold text-white">Roam Across ALL Browser Tabs:</span>{' '}
              <span className="text-neutral-300">
                To have {pet.name} walk over Google, YouTube & every open tab, use our Chrome Extension.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowExtensionModal(true)}
            className="px-2 py-1 rounded-lg bg-[#CCFF00] text-black font-black text-[10px] font-mono uppercase tracking-wide cursor-pointer hover:bg-[#b8e600] shrink-0 active:scale-95 transition-all shadow-[0_0_10px_rgba(204,255,0,0.3)]"
          >
            Download Extension
          </button>
        </div>

        {/* Pokemon GO Catch Radar & Interactive GPS World Map */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-neutral-200">
              Wild Radar: {wildEncounters.length} Dogs & Cats Nearby
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
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 text-[10px]"
              title="Scan nearby area"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* TALKING TOM STAGE ROOM */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[340px] px-4 py-2 overflow-hidden select-none">
        {/* Room Lighting / Day vs Night Ambient Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            roomLighting === 'night'
              ? 'bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#09090b_80%)] opacity-100'
              : 'bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#090d16_70%)] opacity-90'
          }`}
        />

        {/* Ceiling Light Fixture with Pull Switch */}
        <button
          onClick={handleToggleRoomLights}
          className="absolute top-2 right-4 z-20 flex flex-col items-center cursor-pointer group"
          title="Toggle Day/Night Lamp"
        >
          <div className="w-0.5 h-6 bg-neutral-500" />
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

        {/* Speech Bubble */}
        {speechBubbleText && (
          <div className="relative z-20 mb-2 px-3.5 py-1.5 rounded-2xl bg-white text-black text-xs font-bold shadow-xl animate-in fade-in zoom-in-95 max-w-[280px] text-center">
            {speechBubbleText}
            {/* Speech triangle tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
          </div>
        )}

        {/* Center Pet Canvas with Touch Zones */}
        <div className="relative z-10 flex flex-col items-center">
          <ProceduralPetCanvas
            species={pet.species}
            stage={pet.stage}
            animationState={animState}
            mood={pet.mood}
            talkingVolume={talkingVolume}
            width={210}
            height={210}
            interactive={true}
            onStroke={handleStroke}
            onPokeHead={handlePokeHead}
            onTickleBelly={handleTickleBelly}
            customPalette={pet.customPalette}
            customFeatures={pet.customFeatures}
            avatarImageUrl={pet.avatarImageUrl}
          />

          <div className="text-[10px] font-mono text-neutral-400 mt-[-8px]">
            Tap head to poke · Rub belly to tickle · Stroke to pet
          </div>
        </div>

        {/* TALKING TOM ACTION BAR (Milk, Bath, Toot, Mic, Gym) */}
        <div className="relative z-20 mt-3 w-full max-w-sm flex items-center justify-between gap-1.5 px-2">
          {/* 1. Voice Mimic Mic Button */}
          <button
            onClick={handleToggleVoiceRecord}
            className={`flex-1 py-2 px-1 rounded-xl font-mono text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isRecordingVoice
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
            }`}
          >
            {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecordingVoice ? 'Repeat!' : 'Voice Mimic'}</span>
          </button>

          {/* 2. Pour Milk */}
          <button
            onClick={handlePourMilk}
            className="flex-1 py-2 px-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
          >
            <Coffee className="w-4 h-4" />
            <span>Milk</span>
          </button>

          {/* 3. Bubble Bath */}
          <button
            onClick={handleBubbleBath}
            className="flex-1 py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
          >
            <Bath className="w-4 h-4" />
            <span>Bath</span>
          </button>

          {/* 4. Funny Toot */}
          <button
            onClick={handleFunnyToot}
            className="flex-1 py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
          >
            <Wind className="w-4 h-4" />
            <span>Toot</span>
          </button>

          {/* 5. Ball Toy */}
          <button
            onClick={() => {
              playFetch();
              triggerAnim('fetch', 2000);
              showSpeech('Go get the ball! ⚽');
            }}
            className="flex-1 py-2 px-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
          >
            <Smile className="w-4 h-4" />
            <span>Ball</span>
          </button>
        </div>

        {/* Quick Voice Line Soundboard for instant testing */}
        <div className="relative z-20 mt-2 flex items-center gap-1 overflow-x-auto w-full max-w-sm px-2 text-[10px] font-mono">
          <span className="text-neutral-400 text-[9px] uppercase shrink-0">Phrases:</span>
          {[
            'Hello human! I love you!',
            'Feed me delicious berries!',
            'Woof! Pet Slam champion!',
            'Hahaha! Stop tickling me!',
          ].map((phrase, i) => (
            <button
              key={i}
              onClick={() => handlePresetVoiceLine(phrase)}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 whitespace-nowrap cursor-pointer shrink-0"
            >
              "{phrase.slice(0, 14)}..."
            </button>
          ))}
        </div>
      </div>

      {/* BERRY FEEDING & GYM TRAINING DRAWER */}
      <div className="p-4 bg-[#0A0D15] border-t border-white/10 space-y-4">
        {/* Status Message */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Berry & Gourmet Feeding Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Feed Berries & Gourmet Treats (Restores Hunger)</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Hunger: {pet.hunger}/100
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {BERRIES.map((berry) => (
              <button
                key={berry.id}
                onClick={() => handleFeed(berry)}
                className="p-2 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95"
              >
                <span className="text-xl mb-1">{berry.icon}</span>
                <span className="text-[10px] font-mono font-bold text-white truncate w-full text-center">
                  {berry.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono text-[#CCFF00]">+{berry.hungerRestore}</span>
              </button>
            ))}

            {/* Gourmet Steak */}
            <button
              onClick={() => {
                sound.playChew();
                pet.hunger = Math.min(100, pet.hunger + 45);
                triggerAnim('eat', 2200);
                showSpeech(`*CHOMP CHOMP* Delicious Wagyu Steak! 🥩 (+45 Hunger)`);
              }}
              className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500/50 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <span className="text-xl mb-1">🥩</span>
              <span className="text-[10px] font-mono font-bold text-white truncate w-full text-center">
                Steak
              </span>
              <span className="text-[9px] font-mono text-red-400">+45</span>
            </button>

            {/* Fresh Salmon */}
            <button
              onClick={() => {
                sound.playChew();
                pet.hunger = Math.min(100, pet.hunger + 35);
                triggerAnim('eat', 2200);
                showSpeech(`*Munch* Fresh Salmon! Cats & Dogs love it! 🐟 (+35 Hunger)`);
              }}
              className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <span className="text-xl mb-1">🐟</span>
              <span className="text-[10px] font-mono font-bold text-white truncate w-full text-center">
                Salmon
              </span>
              <span className="text-[9px] font-mono text-cyan-400">+35</span>
            </button>
          </div>
        </div>

        {/* WARDROBE & CLOTHES ACCESSORIES */}
        <div className="bg-[#101524] border border-white/10 p-3 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-300">
            <span className="flex items-center gap-1.5 text-white">
              <span>🎩</span>
              <span>Wardrobe & Clothes Accessories:</span>
            </span>
            <span className="text-[10px] text-[#CCFF00]">Live 2D Dressing</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Hats */}
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Hats & Headwear:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'none', label: 'None', icon: '❌' },
                  { id: 'crown', label: 'Crown', icon: '👑' },
                  { id: 'party', label: 'Party', icon: '🥳' },
                  { id: 'detective', label: 'Cap', icon: '🕵️' },
                ].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      sound.playClick();
                      pet.customFeatures = { ...pet.customFeatures, hat: h.id as any };
                      triggerAnim('celebrate', 1000);
                      showSpeech(`Look at my ${h.label}! ✨`);
                    }}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      pet.customFeatures?.hat === h.id || (!pet.customFeatures?.hat && h.id === 'none')
                        ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                        : 'border-white/10 hover:border-white/30 text-neutral-400'
                    }`}
                  >
                    <span className="text-sm block">{h.icon}</span>
                    <span className="text-[9px] block truncate">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Eyewear / Glasses */}
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Eyewear:</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'none', label: 'None', icon: '❌' },
                  { id: 'shades', label: 'Shades', icon: '🕶️' },
                  { id: 'vr', label: 'VR Visor', icon: '🥽' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      sound.playClick();
                      pet.customFeatures = { ...pet.customFeatures, glasses: g.id as any };
                      triggerAnim('celebrate', 1000);
                      showSpeech(`Swag level 100! 😎`);
                    }}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      pet.customFeatures?.glasses === g.id || (!pet.customFeatures?.glasses && g.id === 'none')
                        ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                        : 'border-white/10 hover:border-white/30 text-neutral-400'
                    }`}
                  >
                    <span className="text-sm block">{g.icon}</span>
                    <span className="text-[9px] block truncate">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BREED SELECTOR: Cats & Dogs & Custom Cloned Pets */}
        <div>
          <div className="text-xs font-mono font-bold uppercase text-neutral-300 mb-2 flex items-center justify-between">
            <span>Choose Pet Species & Breeds:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPhotoStudioModal(true)}
                className="text-[10px] text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
              >
                <Camera className="w-3 h-3" />
                <span>+ Scan Photo</span>
              </button>
              <span className="text-[10px] text-neutral-400">Kennel: {kennelPets.length} Pets</span>
            </div>
          </div>

          {/* Custom Cloned Avatar Pets Row (If any exist) */}
          {kennelPets.some((p) => p.isCustomAvatar) && (
            <div className="mb-2.5">
              <div className="text-[10px] font-mono text-purple-300 uppercase font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>📸</span>
                  <span>My Cloned Photo Avatars:</span>
                </span>
                <button
                  onClick={() => setShowPhotoStudioModal(true)}
                  className="text-[9px] text-[#CCFF00] hover:underline cursor-pointer"
                >
                  + Clone Another
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {kennelPets
                  .filter((p) => p.isCustomAvatar)
                  .map((customP) => (
                    <button
                      key={customP.id}
                      onClick={() => switchActivePet(customP.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        pet.id === customP.id
                          ? 'bg-purple-600/25 border-[#CCFF00] text-white shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                          : 'bg-[#101420] border-white/10 text-neutral-300 hover:border-white/30'
                      }`}
                    >
                      {customP.avatarImageUrl ? (
                        <img
                          src={customP.avatarImageUrl}
                          alt={customP.name}
                          className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <span className="text-lg">🐾</span>
                      )}
                      <div className="text-left overflow-hidden">
                        <div className="text-xs font-bold truncate text-white">{customP.name}</div>
                        <div className="text-[9px] text-[#CCFF00] font-mono truncate">
                          CP {customP.stats.cp} · {customP.breedName || 'Custom'}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Dogs Row */}
          <div className="mb-2">
            <div className="text-[10px] font-mono text-amber-400 uppercase font-bold mb-1">
              🐕 Dogs:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {dogSpecies.map((d) => (
                <button
                  key={d.id}
                  onClick={() => switchSpecies(d.id)}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    pet.species === d.id
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow'
                      : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{d.label}</div>
                  <div className="text-[9px] text-neutral-400 truncate">{d.breed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cats Row */}
          <div>
            <div className="text-[10px] font-mono text-purple-400 uppercase font-bold mb-1">
              🐈 Cats:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {catSpecies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => switchSpecies(c.id)}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    pet.species === c.id
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow'
                      : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{c.label}</div>
                  <div className="text-[9px] text-neutral-400 truncate">{c.breed}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gym Workout for Arena Battle Buffs */}
        <div className="p-3 bg-gradient-to-r from-[#111827] to-[#1F2937] rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Gym Workout (Tap to Train Stats)</span>
            </span>
            <span className="text-[10px] font-mono text-[#CCFF00]">
              Energy: {pet.energy}/100
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#CCFF00] transition-all duration-150"
              style={{ width: `${workoutGauge}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleWorkoutTap('attack')}
              className="py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-[10px] font-mono font-bold cursor-pointer"
            >
              +ATK ({pet.stats.attack})
            </button>
            <button
              onClick={() => handleWorkoutTap('defense')}
              className="py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl text-[10px] font-mono font-bold cursor-pointer"
            >
              +DEF ({pet.stats.defense})
            </button>
            <button
              onClick={() => handleWorkoutTap('agility')}
              className="py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-[10px] font-mono font-bold cursor-pointer"
            >
              +AGI ({pet.stats.agility})
            </button>
          </div>
        </div>

        {/* Active Arena Deck Synergy Banner */}
        <div className="p-3 rounded-2xl bg-black/50 border border-[#CCFF00]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-400">
              Active Battle Companion Synergy
            </div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>{pet.battleBuff.name}</span>
              <span className="text-[#CCFF00]">+{pet.battleBuff.potency}%</span>
            </div>
          </div>

          {onGoToArena && (
            <button
              onClick={onGoToArena}
              className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase text-xs rounded-xl cursor-pointer"
            >
              Battle Arena
            </button>
          )}
        </div>
      </div>

      {/* EXTENSION EXPORTER MODAL */}
      {showExtensionModal && (
        <ExtensionExporterModal onClose={() => setShowExtensionModal(false)} />
      )}

      {/* PET AUCTION HOUSE MODAL */}
      {showAuctionModal && (
        <PetAuctionHouseModal onClose={() => setShowAuctionModal(false)} />
      )}

      {/* WILD PET CATCH MODAL (POKEMON GO SYSTEM) */}
      {activeWildCatch && (
        <WildPetCatchModal
          encounter={activeWildCatch}
          onClose={() => setActiveWildCatch(null)}
          onCaught={(newPet) => {
            showSpeech(`🎉 You caught ${newPet.name}! Added to your Kennel!`);
          }}
        />
      )}

      {/* AI PET PHOTO AVATAR STUDIO MODAL */}
      {showPhotoStudioModal && (
        <PetAvatarPhotoStudioModal onClose={() => setShowPhotoStudioModal(false)} />
      )}

      {/* POKEMON GO INTERACTIVE RADAR WORLD MAP */}
      {showWorldMap && (
        <PetWorldMapView onClose={() => setShowWorldMap(false)} />
      )}
    </div>
  );
};
