import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Zap,
  Shield,
  Heart,
  Palette,
  Eye,
  Award,
  ChevronRight,
  Flame,
  Crown,
  CreditCard,
  Coins,
  Smile,
  Sliders,
  Check,
} from 'lucide-react';
import { ProceduralPetCanvas } from './ProceduralPetCanvas';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { createDodoCheckout } from '../../../services/dodo';
import { trackClarityEvent } from '../../../utils/clarity';
import { useGame } from '../../../context/GameContext';
import {
  CompanionPet,
  PetSpecies,
  PetCategory,
  PetCustomPalette,
  PetCustomFeatures,
} from '../../../types/pet';
import { Animal } from '../../../data/animals';
import { animalImages } from '../../../assets/images';
import { sound } from '../../../utils/audio';
import { triggerVictoryExplosion } from '../../../utils/confetti';

interface PetAvatarPhotoStudioModalProps {
  onClose: () => void;
}

// Built-in high quality sample photos so the user can test the avatar feature with 1 click!
const SAMPLE_PET_PHOTOS = [
  {
    id: 'sample_retriever',
    label: 'Golden Retriever',
    name: 'Max',
    image:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    category: 'dog' as PetCategory,
    species: 'retriever' as PetSpecies,
    fallbackPalette: {
      primary: '#F59E0B',
      secondary: '#D97706',
      belly: '#FEF3C7',
      ear: '#D97706',
      eye: '#451A03',
      nose: '#1C1917',
    },
  },
  {
    id: 'sample_calico',
    label: 'Calico Cat',
    name: 'Luna',
    image:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    category: 'cat' as PetCategory,
    species: 'calico' as PetSpecies,
    fallbackPalette: {
      primary: '#F8FAFC',
      secondary: '#EA580C',
      belly: '#FFFFFF',
      ear: '#FDA4AF',
      eye: '#059669',
      nose: '#FB7185',
    },
  },
  {
    id: 'sample_bulldog',
    label: 'French Bulldog',
    name: 'Rocky',
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    category: 'dog' as PetCategory,
    species: 'bulldog' as PetSpecies,
    fallbackPalette: {
      primary: '#94A3B8',
      secondary: '#64748B',
      belly: '#E2E8F0',
      ear: '#F472B6',
      eye: '#1E293B',
      nose: '#0F172A',
    },
  },
  {
    id: 'sample_husky',
    label: 'Arctic Husky',
    name: 'Ghost',
    image:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80',
    category: 'dog' as PetCategory,
    species: 'husky' as PetSpecies,
    fallbackPalette: {
      primary: '#334155',
      secondary: '#1E293B',
      belly: '#F8FAFC',
      ear: '#CBD5E1',
      eye: '#38BDF8',
      nose: '#0F172A',
    },
  },
];

export const PetAvatarPhotoStudioModal: React.FC<PetAvatarPhotoStudioModalProps> = ({ onClose }) => {
  const { addCustomAvatarPet } = usePetCompanion();
  const { hasAvatarStudioPass, unlockPass, registerCustomFighter, credits } = useGame();

  const [activeTab, setActiveTab] = useState<'photo' | 'builder'>('photo');

  // Photo Scan State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [petNameInput, setPetNameInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analyzedAvatar, setAnalyzedAvatar] = useState<{
    name: string;
    title: string;
    category: PetCategory;
    species: PetSpecies;
    breedName: string;
    palette: PetCustomPalette;
    features: PetCustomFeatures;
    personalityTraits: string[];
    quirk: string;
    signatureMove: { name: string; description: string };
    stats: { attack: number; defense: number; agility: number; stamina: number; cp: number };
    battleBuff: { name: string; description: string; effectType: any; potency: number };
  } | null>(null);

  const [activePalette, setActivePalette] = useState<PetCustomPalette | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [hasUsedFreeCustomPet, setHasUsedFreeCustomPet] = useState<boolean>(() => {
    try {
      return localStorage.getItem('petslam_used_free_custom_pet') === 'true';
    } catch {
      return false;
    }
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3D Tilt Cyber Holo-Foil Card State
  const [cardTilt, setCardTilt] = useState<{
    rotateX: number;
    rotateY: number;
    glareX: number;
    glareY: number;
  }>({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
    setCardTilt({ rotateX, rotateY, glareX: px, glareY: py });
  };

  const handleCardPointerLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  // Manual Builder State
  const [builderCategory, setBuilderCategory] = useState<PetCategory>('dog');
  const [builderSpecies, setBuilderSpecies] = useState<PetSpecies>('shiba');
  const [builderName, setBuilderName] = useState<string>('Rex');
  const [builderBreed, setBuilderBreed] = useState<string>('Shiba Champion');
  const [builderEarType, setBuilderEarType] = useState<'pointed' | 'floppy' | 'round'>('pointed');
  const [builderHasWhiskers, setBuilderHasWhiskers] = useState<boolean>(true);
  const [builderEyePatch, setBuilderEyePatch] = useState<boolean>(false);
  const [builderFluffyTail, setBuilderFluffyTail] = useState<boolean>(true);
  const [builderCollarColor, setBuilderCollarColor] = useState<string>('#CCFF00');
  const [builderMoveName, setBuilderMoveName] = useState<string>('Thunder Pounce');
  const [builderMoveDesc, setBuilderMoveDesc] = useState<string>('Leaps with electrifying speed, shocking targets!');
  const [builderPalette, setBuilderPalette] = useState<PetCustomPalette>({
    primary: '#E07A5F',
    secondary: '#3D405B',
    belly: '#F4F1DE',
    ear: '#F2CC8F',
    eye: '#2A9D8F',
    nose: '#1E1E24',
  });
  const [activeColorSlot, setActiveColorSlot] = useState<keyof PetCustomPalette>('primary');

  // Handle Photo Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setAnalyzedAvatar(null);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: (typeof SAMPLE_PET_PHOTOS)[0]) => {
    sound.playClick();
    setPetNameInput(sample.name);
    setAnalyzedAvatar(null);
    setIsSaved(false);

    try {
      const res = await fetch(sample.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      setImagePreview(sample.image);
    }
  };

  // Run AI Photo Scanner
  const handleAnalyzePhoto = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    sound.playClick();
    setAnalysisStep('Scanning pet contours & coat colors...');

    try {
      const timer1 = setTimeout(() => {
        setAnalysisStep('Detecting breed traits & facial structure...');
      }, 800);

      const timer2 = setTimeout(() => {
        setAnalysisStep('Synthesizing color palette & arena moveset...');
      }, 1500);

      const response = await fetch('/api/pet/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          userGivenName: petNameInput,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (data.success && data.avatar) {
        setAnalyzedAvatar(data.avatar);
        setActivePalette(data.avatar.palette);
        sound.playVictory();
      } else {
        throw new Error(data.error || 'Failed to analyze pet');
      }
    } catch {
      // High-quality deterministic fallback
      const detectedName = petNameInput.trim() || 'Champion';
      const fallback = {
        name: detectedName,
        title: 'The Couch Champion',
        category: 'dog' as PetCategory,
        species: 'retriever' as PetSpecies,
        breedName: 'Golden Pedigree',
        palette: {
          primary: '#F59E0B',
          secondary: '#D97706',
          belly: '#FEF3C7',
          ear: '#D97706',
          eye: '#451A03',
          nose: '#1C1917',
        },
        features: {
          earType: 'floppy' as const,
          hasWhiskers: false,
          eyePatch: true,
          collarColor: '#CCFF00',
          fluffyTail: true,
        },
        personalityTraits: ['Loyal Vanguard', 'Zoomies Sprinter', 'Heart Thief'],
        quirk: 'Chases laser pointers and protects the sofa with fierce dedication.',
        signatureMove: {
          name: `${detectedName}'s Hyper Pounce`,
          description: 'A dazzling burst dash that deals 220 kinetic damage and stuns targets.',
        },
        stats: { attack: 72, defense: 68, agility: 75, stamina: 70, cp: 520 },
        battleBuff: {
          name: 'Guardian Aura',
          description: '+20% Critical Strike Multiplier from pure companion love.',
          effectType: 'crit_chance' as const,
          potency: 20,
        },
      };
      setAnalyzedAvatar(fallback);
      setActivePalette(fallback.palette);
      sound.playLevelUp();
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Save pet to kennel AND register as playable fighter in Arena!
  const handleSaveToKennelAndArena = () => {
    // If user hasn't unlocked pass and has already used free starter creation, prompt pass
    if (!hasAvatarStudioPass && hasUsedFreeCustomPet) {
      setShowPassModal(true);
      return;
    }

    // Grant first starter pet completely free!
    if (!hasAvatarStudioPass && !hasUsedFreeCustomPet) {
      try {
        localStorage.setItem('petslam_used_free_custom_pet', 'true');
        setHasUsedFreeCustomPet(true);
      } catch {}
    }

    finalizeSave();
  };

  const finalizeSave = () => {
    sound.playVictory();
    triggerVictoryExplosion();

    let newPet: CompanionPet;

    if (activeTab === 'photo' && analyzedAvatar) {
      newPet = {
        id: `custom_${Date.now()}`,
        species: analyzedAvatar.species,
        category: analyzedAvatar.category,
        name: analyzedAvatar.name,
        title: analyzedAvatar.title,
        stage: 1,
        level: 10,
        exp: 0,
        maxExp: 100,
        affectionHearts: 4,
        affectionPoints: 100,
        hunger: 95,
        happiness: 100,
        energy: 100,
        mood: 'excited',
        stats: analyzedAvatar.stats,
        battleBuff: analyzedAvatar.battleBuff,
        createdAt: Date.now(),
        lastFedAt: Date.now(),
        lastPettedAt: Date.now(),
        totalPats: 5,
        totalBerriesEaten: 3,
        caughtAt: 'Personal Photo Studio',
        isFavorite: true,
        customPalette: activePalette || analyzedAvatar.palette,
        customFeatures: analyzedAvatar.features,
        avatarImageUrl: imagePreview || undefined,
        breedName: analyzedAvatar.breedName,
        personalityTraits: analyzedAvatar.personalityTraits,
        quirk: analyzedAvatar.quirk,
        isCustomAvatar: true,
      };
    } else {
      // Manual Builder Pet
      newPet = {
        id: `custom_${Date.now()}`,
        species: builderSpecies,
        category: builderCategory,
        name: builderName.trim() || 'Champion',
        title: 'Bred for Glory',
        stage: 1,
        level: 10,
        exp: 0,
        maxExp: 100,
        affectionHearts: 4,
        affectionPoints: 100,
        hunger: 95,
        happiness: 100,
        energy: 100,
        mood: 'battle_ready',
        stats: { attack: 75, defense: 70, agility: 80, stamina: 72, cp: 540 },
        battleBuff: {
          name: 'Combat Surge',
          description: '+15% Energy regeneration rate in Arena.',
          effectType: 'elixir_rate',
          potency: 15,
        },
        createdAt: Date.now(),
        lastFedAt: Date.now(),
        lastPettedAt: Date.now(),
        totalPats: 5,
        totalBerriesEaten: 3,
        caughtAt: 'Custom DNA Lab',
        isFavorite: true,
        customPalette: builderPalette,
        customFeatures: {
          earType: builderEarType,
          hasWhiskers: builderHasWhiskers,
          eyePatch: builderEyePatch,
          collarColor: builderCollarColor,
          fluffyTail: builderFluffyTail,
          signatureMove: {
            name: builderMoveName,
            description: builderMoveDesc,
          },
        },
        breedName: builderBreed,
        personalityTraits: ['Arena Fighter', 'Loyal Companion', 'Apex Instinct'],
        quirk: 'Ready for action day and night!',
        isCustomAvatar: true,
      };
    }

    // 1. Add to Companion Sanctuary
    addCustomAvatarPet(newPet);

    // 2. Register into GameContext as a Playable Arena Fighter
    const customFighter: Animal = {
      id: `fighter_${newPet.id}`,
      name: newPet.name,
      species: newPet.breedName || (newPet.category === 'cat' ? 'Domestic Feline' : 'Loyal Canine'),
      breed: newPet.breedName || (newPet.category === 'cat' ? 'Domestic Feline' : 'Loyal Canine'),
      scientificName: newPet.category === 'cat' ? 'Felis catus' : 'Canis lupus familiaris',
      category: newPet.category === 'cat' ? 'Felines' : 'Canines',
      rarity: 'Legendary',
      level: 10,
      health: 1100,
      damage: 195,
      speed: 86,
      weightKg: 28,
      biteForcePsi: 245,
      topSpeedKmh: 48,
      strikeJoules: 690,
      elixirCost: 3,
      strength: 86,
      endurance: 88,
      agility: 86,
      biteForce: 245,
      image: newPet.avatarImageUrl || animalImages.realBengalCat,
      fallbackImage: newPet.avatarImageUrl || animalImages.realBengalCat,
      acquisitionStatus: 'Available',
      currentPriceCredits: 12000,
      combatArchetype: 'Precision Striker',
      description: `Custom Champion Avatar created from personal pet photo. ${newPet.quirk || ''}`,
      signatureAbility: `${newPet.customFeatures?.signatureMove?.name || 'Cosmic Pounce'}: Devastating burst strike powered by trainer loyalty.`,
    };

    registerCustomFighter(customFighter);
    setIsSaved(true);

    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#12192A] via-[#101726] to-[#0A0D16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Personal Pet Avatar & Fighter Studio</span>
                <span className="text-[10px] bg-[#CCFF00] text-black px-2 py-0.5 rounded-full font-black font-mono">
                  $0.99 PASS
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Turn your real dog or cat's photo into an animated companion & fight with them in the Arena!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Photo Scanner vs Custom DNA Builder */}
        <div className="px-4 pt-3 pb-1 border-b border-white/10 bg-[#0E1322] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('photo')}
            className={`py-2 px-3.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>AI Photo Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`py-2 px-3.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom DNA Builder (Manual)</span>
          </button>

          <div className="ml-auto flex items-center gap-1 text-[11px] font-mono">
            {hasAvatarStudioPass ? (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                ✓ Pass Active
              </span>
            ) : !hasUsedFreeCustomPet ? (
              <span className="bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                ✨ Free Pass Available
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                $0.99 Pass
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeTab === 'photo' ? (
            /* =========================================================================
                TAB 1: PHOTO SCANNER
               ========================================================================= */
            !analyzedAvatar ? (
              <div className="space-y-4">
                {/* Pet Name Input */}
                <div className="bg-[#121724] border border-white/10 p-3 rounded-2xl">
                  <label className="block text-xs font-mono font-bold text-neutral-300 mb-1">
                    Your Pet's Real Name:
                  </label>
                  <input
                    type="text"
                    value={petNameInput}
                    onChange={(e) => setPetNameInput(e.target.value)}
                    placeholder="e.g. Charlie, Milo, Bella, Bruno, Max..."
                    className="w-full bg-[#070A10] border border-white/15 focus:border-[#CCFF00] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-bold outline-none"
                  />
                </div>

                {/* Upload Drop Zone / Preview */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    imagePreview
                      ? 'border-[#CCFF00]/60 bg-black/40'
                      : 'border-white/20 hover:border-[#CCFF00]/50 bg-[#0E1320] hover:bg-[#121828]'
                  }`}
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-52 h-52 aspect-square rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.3)] group">
                        <img
                          src={imagePreview}
                          alt="Your Pet"
                          className="w-full h-full object-cover object-center aspect-square"
                        />

                        {/* CYBER SCANNER HUD OVERLAY */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* 4 Corner Targeting Brackets */}
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                          {/* Sweeping Laser Scanline */}
                          <div
                            className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] transition-all duration-700 ${
                              isAnalyzing
                                ? 'animate-bounce opacity-100 top-1/2'
                                : 'opacity-40 top-1/4'
                            }`}
                          />

                          {/* Center Biometric Reticle */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-ping" />
                          </div>

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[8px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/40">
                            {isAnalyzing ? '⚡ AI SCANNING...' : 'SCANNER LOCKED ✓'}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-[8px] font-mono text-neutral-300 px-2 py-0.5 rounded border border-white/10">
                            TARGET: {petNameInput ? petNameInput.toUpperCase() : 'PET SPECIES'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono">
                        <RefreshCw className="w-3.5 h-3.5" /> Tap to choose a different photo
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-14 h-14 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] mb-1">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-bold text-white">Click or Drag to Upload Pet Photo</div>
                      <div className="text-xs text-neutral-400 max-w-sm">
                        Upload your real dog or cat photo. Our procedural engine extracts coat palettes, eyes, and markings!
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-Click Samples */}
                <div>
                  <div className="text-[11px] font-mono font-bold text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Or test with a sample pet photo:</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_PET_PHOTOS.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="group bg-[#121724] hover:bg-[#182133] border border-white/10 hover:border-[#CCFF00]/50 p-2 rounded-xl cursor-pointer transition-all flex items-center gap-2.5"
                      >
                        <img
                          src={sample.image}
                          alt={sample.label}
                          className="w-10 h-10 rounded-lg object-cover border border-white/15 group-hover:scale-105 transition-transform"
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate">{sample.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{sample.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAnalyzePhoto}
                  disabled={!imagePreview || isAnalyzing}
                  className="w-full bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.35)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>{analysisStep || 'Synthesizing Avatar...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Synthesize Personal Pet Avatar & Combat Moveset</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* CYBER HOLO-FOIL 3D TILT TRADING CARD REVEAL */
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div
                    onPointerMove={handleCardPointerMove}
                    onPointerLeave={handleCardPointerLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="relative w-full max-w-sm rounded-3xl overflow-hidden p-1 shadow-[0_0_40px_rgba(204,255,0,0.25)] border-2 border-[#CCFF00] bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#050811] cursor-pointer group select-none"
                  >
                    {/* Dynamic Iridescent Holo-Foil Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 mix-blend-color-dodge opacity-60"
                      style={{
                        background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255,255,255,0.85) 0%, rgba(204,255,0,0.5) 25%, rgba(6,182,212,0.6) 50%, rgba(217,70,239,0.5) 75%, transparent 100%)`,
                      }}
                    />

                    {/* Shiny Holo Sheen Diagonal Reflection */}
                    <div
                      className="absolute inset-0 pointer-events-none z-30 opacity-40 mix-blend-screen"
                      style={{
                        background: `linear-gradient(${115 + cardTilt.rotateY * 2}deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(204,255,0,0.6) 50%, rgba(6,182,212,0.4) 55%, transparent 80%)`,
                      }}
                    />

                    {/* Card Content Container */}
                    <div className="relative z-20 rounded-[22px] bg-[#090D18]/90 backdrop-blur-md p-4 flex flex-col items-center text-white border border-white/10">
                      {/* Card Top Stamp Header */}
                      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <span className="text-[10px] font-mono font-black text-[#CCFF00] tracking-widest flex items-center gap-1">
                          <span>✦</span>
                          <span>CYBER HOLO-FOIL EDITION</span>
                          <span>✦</span>
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                          HOLO MINT ✓
                        </span>
                      </div>

                      {/* Card Visual Hero: Dual View Uploaded Photo + Procedural Game Avatar */}
                      <div className="w-full grid grid-cols-2 gap-2 mb-3">
                        {/* Uploaded Photo */}
                        <div className="relative aspect-square rounded-xl overflow-hidden border border-white/20 bg-black">
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt={analyzedAvatar.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-neutral-300">
                            Real Pet Photo
                          </div>
                        </div>

                        {/* Live Procedural Game Avatar */}
                        <div className="relative aspect-square rounded-xl overflow-hidden border border-[#CCFF00]/40 bg-gradient-to-b from-[#141C2E] to-black flex items-center justify-center">
                          <ProceduralPetCanvas
                            species={analyzedAvatar.species}
                            stage={1}
                            width={130}
                            height={130}
                            interactive={true}
                            customPalette={activePalette || analyzedAvatar.palette}
                            customFeatures={analyzedAvatar.features}
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[8px] font-mono font-bold text-[#CCFF00]">
                            Live Avatar
                          </div>
                        </div>
                      </div>

                      {/* Pet Identity & Title */}
                      <div className="text-center mb-3">
                        <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                          {analyzedAvatar.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-bold text-[#CCFF00]">
                            {analyzedAvatar.breedName}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-xs font-mono text-cyan-300">
                            {analyzedAvatar.title}
                          </span>
                        </div>
                      </div>

                      {/* Stat Radar Hex Badges */}
                      <div className="w-full grid grid-cols-4 gap-1.5 mb-3 text-center font-mono">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
                          <div className="text-[9px] text-neutral-400">ATK</div>
                          <div className="text-xs font-black text-rose-400">
                            {analyzedAvatar.stats.attack}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
                          <div className="text-[9px] text-neutral-400">DEF</div>
                          <div className="text-xs font-black text-blue-400">
                            {analyzedAvatar.stats.defense}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
                          <div className="text-[9px] text-neutral-400">AGI</div>
                          <div className="text-xs font-black text-emerald-400">
                            {analyzedAvatar.stats.agility}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-1.5">
                          <div className="text-[9px] text-neutral-400">STA</div>
                          <div className="text-xs font-black text-amber-400">
                            {analyzedAvatar.stats.stamina}
                          </div>
                        </div>
                      </div>

                      {/* Signature Move & CP Banner */}
                      <div className="w-full bg-[#CCFF00]/10 border border-[#CCFF00]/40 rounded-xl p-2 mb-1 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-[#CCFF00]" />
                          <div>
                            <div className="font-bold text-white uppercase text-[11px]">
                              {analyzedAvatar.signatureMove.name}
                            </div>
                            <div className="text-[9px] text-neutral-400 line-clamp-1">
                              {analyzedAvatar.signatureMove.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-neutral-400 uppercase">Power</div>
                          <div className="text-sm font-black text-[#CCFF00]">
                            CP {analyzedAvatar.stats.cp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Colors */}
                {activePalette && (
                  <div className="bg-[#121724] border border-white/10 p-3 rounded-2xl space-y-2">
                    <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Extracted Fur & Features Palette (Tap to fine-tune):</span>
                      </div>
                      <span className="text-[10px] text-[#CCFF00] font-mono">6 Swatches</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px] font-mono">
                      {[
                        { key: 'primary', label: 'Main Fur', color: activePalette.primary },
                        { key: 'secondary', label: 'Accent', color: activePalette.secondary },
                        { key: 'belly', label: 'Belly', color: activePalette.belly },
                        { key: 'ear', label: 'Inner Ear', color: activePalette.ear },
                        { key: 'eye', label: 'Eyes', color: activePalette.eye },
                        { key: 'nose', label: 'Nose', color: activePalette.nose },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="bg-[#090C14] border border-white/10 p-1.5 rounded-lg flex flex-col items-center gap-1 cursor-pointer hover:border-white/30"
                        >
                          <div
                            className="w-7 h-7 rounded-full border border-white/30 shadow-inner relative overflow-hidden"
                            style={{ backgroundColor: item.color }}
                          >
                            <input
                              type="color"
                              value={item.color}
                              onChange={(e) => {
                                const newColor = e.target.value;
                                setActivePalette((prev) =>
                                  prev ? { ...prev, [item.key]: newColor } : null
                                );
                              }}
                              className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                            />
                          </div>
                          <span className="text-neutral-400 text-[9px]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save and Deploy Button */}
                <button
                  onClick={handleSaveToKennelAndArena}
                  disabled={isSaved}
                  className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-black" />
                      <span>Activated! {analyzedAvatar.name} is in your Sanctuary & Arena Roster!</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-black" />
                      <span>Mint Holo Card & Deploy {analyzedAvatar.name} to Battle Arena!</span>
                    </>
                  )}
                </button>
              </div>
            )
          ) : (
            /* =========================================================================
                TAB 2: CUSTOM DNA BUILDER (MANUAL CUSTOMIZATION)
               ========================================================================= */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Customizer Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 mb-1">
                      Pet Name:
                    </label>
                    <input
                      type="text"
                      value={builderName}
                      onChange={(e) => setBuilderName(e.target.value)}
                      className="w-full bg-[#070A10] border border-white/15 focus:border-[#CCFF00] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 mb-1">
                      Species & Category:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setBuilderCategory('dog');
                          setBuilderSpecies('shiba');
                          setBuilderBreed('Shiba Champion');
                          setBuilderEarType('pointed');
                          setBuilderHasWhiskers(false);
                          setBuilderPalette({
                            primary: '#D97706',
                            secondary: '#B45309',
                            belly: '#FEF3C7',
                            ear: '#FEF3C7',
                            eye: '#292524',
                            nose: '#0F172A',
                          });
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          builderCategory === 'dog'
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-black shadow-md'
                            : 'bg-[#121824] text-neutral-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">🐶</span>
                        <span>Canine Dog</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setBuilderCategory('cat');
                          setBuilderSpecies('tabby');
                          setBuilderBreed('Tabby Sovereign');
                          setBuilderEarType('pointed');
                          setBuilderHasWhiskers(true);
                          setBuilderPalette({
                            primary: '#F59E0B',
                            secondary: '#9A3412',
                            belly: '#FEF3C7',
                            ear: '#F472B6',
                            eye: '#10B981',
                            nose: '#F472B6',
                          });
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          builderCategory === 'cat'
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-black shadow-md'
                            : 'bg-[#121824] text-neutral-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">🐱</span>
                        <span>Feline Cat</span>
                      </button>
                    </div>
                  </div>

                  {/* Breed Selector */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-neutral-300 mb-1">
                      Breed / Morph:
                    </label>
                    <select
                      value={builderSpecies}
                      onChange={(e) => {
                        const sp = e.target.value as PetSpecies;
                        setBuilderSpecies(sp);
                        const names: Record<string, string> = {
                          shiba: 'Shiba Inu',
                          retriever: 'Golden Retriever',
                          husky: 'Siberian Husky',
                          bulldog: 'French Bulldog',
                          tabby: 'Orange Tabby',
                          calico: 'Calico Cat',
                          siamese: 'Siamese Cat',
                          blackcat: 'Shadow Panther Cat',
                        };
                        setBuilderBreed(names[sp] || 'Pedigree');
                      }}
                      className="w-full bg-[#070A10] border border-white/15 focus:border-[#CCFF00] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none cursor-pointer"
                    >
                      {builderCategory === 'dog' ? (
                        <>
                          <option value="shiba">Shiba Inu</option>
                          <option value="retriever">Golden Retriever</option>
                          <option value="husky">Arctic Husky</option>
                          <option value="bulldog">French Bulldog</option>
                        </>
                      ) : (
                        <>
                          <option value="tabby">Orange Tabby</option>
                          <option value="calico">Calico Cat</option>
                          <option value="siamese">Siamese Cat</option>
                          <option value="blackcat">Shadow Black Cat</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Ear & Accessory Toggles */}
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setBuilderEarType('pointed')}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        builderEarType === 'pointed' ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Pointed
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderEarType('floppy')}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        builderEarType === 'floppy' ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Floppy
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderEarType('round')}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        builderEarType === 'round' ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Round
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderEyePatch((p) => !p)}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        builderEyePatch ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Patch: {builderEyePatch ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Signature Move */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-amber-400 mb-1">
                      Signature Combat Move:
                    </label>
                    <input
                      type="text"
                      value={builderMoveName}
                      onChange={(e) => setBuilderMoveName(e.target.value)}
                      placeholder="e.g. Thunder Bite, Shadow Slash..."
                      className="w-full bg-[#070A10] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Right: Live Interactive Avatar Preview */}
                <div className="bg-[#0E1320] border border-[#CCFF00]/40 rounded-3xl p-4 flex flex-col items-center justify-between shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                  <span className="text-[10px] font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Canvas Synthesis</span>
                  </span>

                  <div className="w-48 h-48 bg-[radial-gradient(circle,#1e293b_0%,#07090e_80%)] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden my-2">
                    <ProceduralPetCanvas
                      species={builderSpecies}
                      stage={1}
                      width={180}
                      height={180}
                      interactive={true}
                      customPalette={builderPalette}
                      customFeatures={{
                        isCat: builderCategory === 'cat',
                        earType: builderEarType,
                        hasWhiskers: builderHasWhiskers,
                        eyePatch: builderEyePatch,
                        collarColor: builderCollarColor,
                        fluffyTail: builderFluffyTail,
                      }}
                    />
                  </div>

                  <div className="w-full text-center">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      {builderName}
                    </h3>
                    <div className="text-[11px] font-mono text-[#CCFF00] font-bold">
                      {builderBreed} · Arena Ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Palette Choosers */}
              <div className="bg-[#121724] border border-white/10 p-3 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Coat DNA Presets & Custom Swatches:</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#CCFF00]">1-Click Presets</span>
                </div>

                {/* Instant DNA Style Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    {
                      name: 'Cyber Gold',
                      palette: { primary: '#F59E0B', secondary: '#D97706', belly: '#FEF3C7', ear: '#D97706', eye: '#00F0FF', nose: '#1C1917' },
                      bg: 'from-amber-500 to-amber-700',
                    },
                    {
                      name: 'Neon Synth',
                      palette: { primary: '#00F0FF', secondary: '#0284C7', belly: '#E0F2FE', ear: '#FF007A', eye: '#39FF14', nose: '#0B0F19' },
                      bg: 'from-cyan-400 to-fuchsia-600',
                    },
                    {
                      name: 'Midnight',
                      palette: { primary: '#1E293B', secondary: '#0F172A', belly: '#334155', ear: '#475569', eye: '#F59E0B', nose: '#020617' },
                      bg: 'from-slate-700 to-slate-900',
                    },
                    {
                      name: 'Toxic Venom',
                      palette: { primary: '#84CC16', secondary: '#4D7C0F', belly: '#ECFCCB', ear: '#65A30D', eye: '#D946EF', nose: '#14532D' },
                      bg: 'from-lime-500 to-emerald-800',
                    },
                    {
                      name: 'Arctic Frost',
                      palette: { primary: '#E2E8F0', secondary: '#94A3B8', belly: '#FFFFFF', ear: '#CBD5E1', eye: '#0284C7', nose: '#0F172A' },
                      bg: 'from-sky-200 to-blue-400',
                    },
                    {
                      name: 'Crimson Flame',
                      palette: { primary: '#DC2626', secondary: '#991B1B', belly: '#FEE2E2', ear: '#B91C1C', eye: '#FBBF24', nose: '#450A0A' },
                      bg: 'from-red-500 to-rose-800',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setBuilderPalette(preset.palette);
                      }}
                      className="group relative p-1.5 rounded-xl border border-white/10 hover:border-[#CCFF00] bg-[#0A0E18] text-center cursor-pointer transition-all hover:scale-102"
                    >
                      <div className={`w-full h-3.5 rounded-md bg-gradient-to-r ${preset.bg} mb-1`} />
                      <span className="text-[9px] font-mono font-bold text-neutral-300 group-hover:text-white truncate block">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 6 Color Feature Slots */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px] font-mono">
                  {[
                    { key: 'primary' as const, label: 'Main Fur', color: builderPalette.primary },
                    { key: 'secondary' as const, label: 'Accent', color: builderPalette.secondary },
                    { key: 'belly' as const, label: 'Belly', color: builderPalette.belly },
                    { key: 'ear' as const, label: 'Inner Ear', color: builderPalette.ear },
                    { key: 'eye' as const, label: 'Eyes', color: builderPalette.eye },
                    { key: 'nose' as const, label: 'Nose', color: builderPalette.nose },
                  ].map((item) => {
                    const isSelected = activeColorSlot === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setActiveColorSlot(item.key);
                        }}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#1A2234] border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.35)] scale-102'
                            : 'bg-[#090C14] border-white/10 hover:border-white/30 text-neutral-400'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/40 shadow-inner relative flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                        </div>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#CCFF00]' : 'text-neutral-300'}`}>
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase">
                          {item.color}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 1-Click Interactive Color Palette Swatches */}
                <div className="p-3 bg-[#0A0E18] rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300">
                      Tap Swatch to Paint <strong className="text-[#CCFF00] uppercase font-bold">{activeColorSlot}</strong>:
                    </span>
                    <label className="flex items-center gap-1 text-[11px] text-cyan-300 hover:underline cursor-pointer">
                      <span>Custom 🎨</span>
                      <input
                        type="color"
                        value={builderPalette[activeColorSlot]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuilderPalette((prev) => ({ ...prev, [activeColorSlot]: val }));
                        }}
                        className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { hex: '#D97706', name: 'Golden Tan' },
                      { hex: '#F59E0B', name: 'Honey Amber' },
                      { hex: '#EA580C', name: 'Ginger Orange' },
                      { hex: '#78350F', name: 'Chocolate Brown' },
                      { hex: '#1E293B', name: 'Charcoal Slate' },
                      { hex: '#0F172A', name: 'Midnight Black' },
                      { hex: '#F8FAFC', name: 'Snow White' },
                      { hex: '#FEF3C7', name: 'Siamese Cream' },
                      { hex: '#F472B6', name: 'Petal Pink' },
                      { hex: '#00F0FF', name: 'Neon Cyan' },
                      { hex: '#CCFF00', name: 'Cyber Lime' },
                      { hex: '#A855F7', name: 'Lavender Purple' },
                      { hex: '#DC2626', name: 'Crimson Flame' },
                      { hex: '#38BDF8', name: 'Arctic Blue' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setBuilderPalette((prev) => ({ ...prev, [activeColorSlot]: swatch.hex }));
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-white/20 hover:border-[#CCFF00] hover:scale-110 transition-all cursor-pointer shadow-md flex items-center justify-center"
                        style={{ backgroundColor: swatch.hex }}
                        title={`${swatch.name} (${swatch.hex})`}
                      >
                        {builderPalette[activeColorSlot].toLowerCase() === swatch.hex.toLowerCase() && (
                          <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mint & Deploy Button */}
              <button
                onClick={handleSaveToKennelAndArena}
                disabled={isSaved}
                className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-black" />
                    <span>Created! {builderName} is now in your Sanctuary & Arena Roster!</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-black" />
                    <span>Create Custom Pet & Deploy to Battle Arena!</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Pass Purchase Trigger Modal */}
        {showPassModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#121728] border border-[#CCFF00]/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-white">
                Custom Pet DNA Pass
              </h3>
              <p className="text-xs text-neutral-300">
                Turn your real pet photo into an animated avatar & playable battle fighter!
              </p>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 text-xs font-mono font-bold text-[#CCFF00]">
                $0.99 USD or 1,000 Slam Credits
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={async () => {
                    try {
                      trackClarityEvent('avatar_pass_dodo_click');
                      const checkout = await createDodoCheckout({ passType: 'avatar' });
                      if (checkout.simulated) {
                        unlockPass('avatar', false);
                        setShowPassModal(false);
                        finalizeSave();
                      } else if (checkout.checkoutUrl) {
                        window.location.href = checkout.checkoutUrl;
                      }
                    } catch (e: any) {
                      alert(e?.message || 'Failed to connect to Dodo Payments');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs uppercase cursor-pointer"
                >
                  Pay $0.99 (Dodo)
                </button>
                <button
                  onClick={() => {
                    const res = unlockPass('avatar', true);
                    if (res.success) {
                      setShowPassModal(false);
                      finalizeSave();
                    } else {
                      alert(res.message);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer border border-white/15"
                >
                  1,000 Credits
                </button>
              </div>

              <button
                onClick={() => setShowPassModal(false)}
                className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
