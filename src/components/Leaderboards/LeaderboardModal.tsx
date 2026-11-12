import React, { useState, useRef } from 'react';
import {
  Trophy,
  Crown,
  Flame,
  Swords,
  DollarSign,
  TrendingUp,
  X,
  Camera,
  Upload,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { trackClarityEvent } from '../../utils/clarity';
import { triggerVictoryExplosion } from '../../utils/confetti';
import { useGame } from '../../context/GameContext';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload?: () => void;
}

interface ArenaKingPlayer {
  rank: number;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  leadPet: string;
  breed: string;
  tier: 'Grandmaster' | 'Master' | 'Diamond' | 'Platinum';
  avatarUrl: string;
}

interface ChampionPetEntry {
  rank: number;
  petName: string;
  trainerName: string;
  cheers: number;
  photoUrl: string;
  featuredSince: string;
  isAiVerified: boolean;
}

const INITIAL_CHAMPION_HOLDERS: ChampionPetEntry[] = [
  {
    rank: 1,
    petName: 'Barnaby the Sovereign',
    trainerName: 'LordSterling',
    cheers: 420,
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80',
    featuredSince: '4h ago',
    isAiVerified: true,
  },
  {
    rank: 2,
    petName: 'Cleo Golden Empress',
    trainerName: 'CairoKing',
    cheers: 280,
    photoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=80',
    featuredSince: '7h ago',
    isAiVerified: true,
  },
  {
    rank: 3,
    petName: 'Diesel Mountain Dog',
    trainerName: 'ApexRuler',
    cheers: 195,
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80',
    featuredSince: '1d ago',
    isAiVerified: true,
  },
  {
    rank: 4,
    petName: 'Mochi Marshmallow',
    trainerName: 'SugarBytes',
    cheers: 120,
    photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format&fit=crop&q=80',
    featuredSince: '2d ago',
    isAiVerified: true,
  },
  {
    rank: 5,
    petName: 'Ghost Samurai Cat',
    trainerName: 'TokyoRonin',
    cheers: 85,
    photoUrl: 'https://images.unsplash.com/photo-1513360309081-36f20ca48f22?w=400&auto=format&fit=crop&q=80',
    featuredSince: '3d ago',
    isAiVerified: true,
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  const { trainerName } = useGame();
  const [activeTab, setActiveTab] = useState<'arena' | 'champions'>('champions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [holders, setHolders] = useState<ChampionPetEntry[]>(INITIAL_CHAMPION_HOLDERS);

  // Photo Upload & Direct Camera Snap State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [inputPetName, setInputPetName] = useState<string>('');
  const [inputTrainerName, setInputTrainerName] = useState<string>(trainerName || 'Champion Trainer');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Arena Kings (Skill / Elo)
  const arenaKings: ArenaKingPlayer[] = [
    {
      rank: 1,
      name: 'VortexSlammer',
      elo: 2840,
      wins: 142,
      losses: 18,
      leadPet: 'Apex Husky Alpha',
      breed: 'Siberian Husky',
      tier: 'Grandmaster',
      avatarUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=150&auto=format&fit=crop&q=80',
    },
    {
      rank: 2,
      name: 'CyberKagero',
      elo: 2715,
      wins: 128,
      losses: 24,
      leadPet: 'Bengal Shadow',
      breed: 'Bengal Cat',
      tier: 'Grandmaster',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
    },
    {
      rank: 3,
      name: 'DogeOverdrive',
      elo: 2650,
      wins: 119,
      losses: 31,
      leadPet: 'Titan Shiba',
      breed: 'Shiba Inu',
      tier: 'Master',
      avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
    },
    {
      rank: 4,
      name: 'NovaStrike',
      elo: 2540,
      wins: 104,
      losses: 29,
      leadPet: 'Iron Rottweiler',
      breed: 'Rottweiler',
      tier: 'Master',
      avatarUrl: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=150&auto=format&fit=crop&q=80',
    },
    {
      rank: 5,
      name: 'PixelPaws',
      elo: 2480,
      wins: 96,
      losses: 34,
      leadPet: 'Maine Coon Titan',
      breed: 'Maine Coon',
      tier: 'Diamond',
      avatarUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewPhoto(reader.result);
          sound.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenPhotoForm = () => {
    sound.playClick();
    setShowUploadForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitNewChampion = () => {
    if (!previewPhoto) {
      setToastMessage('⚠️ Please snap or select a photo of your pet first!');
      sound.playClick();
      return;
    }

    const petName = inputPetName.trim() || 'My Champion Pet';
    sound.playVictory();
    triggerVictoryExplosion();
    trackClarityEvent('champion_photo_submitted');

    const topCheers = holders[0]?.cheers || 420;
    const newEntry: ChampionPetEntry = {
      rank: 1,
      petName,
      trainerName: inputTrainerName.trim() || 'Trainer',
      cheers: topCheers + 1,
      photoUrl: previewPhoto,
      featuredSince: 'Just now',
      isAiVerified: true,
    };

    setHolders((prev) => {
      const filtered = prev.filter((p) => p.petName !== petName);
      const updated = [newEntry, ...filtered].map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
      return updated.slice(0, 10);
    });

    setToastMessage(`👑 ${petName} is now featured #1 in the Hall of Champions!`);
    setShowUploadForm(false);
    setPreviewPhoto(null);
    setInputPetName('');

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleCheerPet = (entry: ChampionPetEntry) => {
    sound.playVictory();
    triggerVictoryExplosion();
    setHolders((prev) => {
      const updated = prev.map((p) =>
        p.petName === entry.petName ? { ...p, cheers: p.cheers + 1 } : p
      );
      return updated.sort((a, b) => b.cheers - a.cheers).map((p, idx) => ({ ...p, rank: idx + 1 }));
    });
    setToastMessage(`✨ Cheered for ${entry.petName}! (+1 Fan Cheer)`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#151C28] border border-[#2A364F] rounded-3xl shadow-2xl overflow-hidden transition-colors duration-150">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#F59E0B] text-[#0B0F17] font-mono font-bold text-xs sm:text-sm rounded-xl shadow-xl border border-[#2A364F] animate-in slide-in-from-top-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B0F17]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A364F] bg-[#0B0F17]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1E2738] text-[#F59E0B] border border-[#2A364F]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-[#F8FAFC]">
                Hall of Fame
              </h2>
              <p className="text-xs font-mono text-[#CBD5E1]">
                Top 10 Pet Battlers & Verified Pet Champions
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#2A364F] transition-colors cursor-pointer"
            title="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex p-2 bg-[#0B0F17] border-b border-[#2A364F] gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('champions');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'champions'
                ? 'bg-[#F59E0B] text-[#0B0F17] shadow-sm'
                : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Hall of Champions</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('arena');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-[#F59E0B] text-[#0B0F17] shadow-sm'
                : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Top 10 Arena Kings</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {activeTab === 'arena' ? (
            /* TAB 1: THE ARENA KINGS */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#1E2738] border border-[#2A364F] flex items-center justify-between text-xs font-mono text-[#CBD5E1]">
                <span>Ranked strictly by Authoritative 20-Tick Netcode PvP Elo</span>
                <span className="font-bold text-[#F8FAFC]">Season 1 Active</span>
              </div>

              {arenaKings.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    player.rank === 1
                      ? 'bg-[#1E2738] border-[#F59E0B]/70 shadow-sm'
                      : 'bg-[#151C28] border-[#2A364F]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-base shrink-0 border ${
                        player.rank === 1
                          ? 'bg-[#F59E0B] text-[#0B0F17] border-[#F59E0B]'
                          : 'bg-[#0B0F17] text-[#CBD5E1] border-[#2A364F]'
                      }`}
                    >
                      {player.rank === 1 ? <Crown className="w-5 h-5 text-[#0B0F17]" /> : `#${player.rank}`}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#2A364F] shrink-0">
                      <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-display font-bold text-base sm:text-lg text-[#F8FAFC] truncate">
                          {player.name}
                        </span>
                        <span className="text-xs font-mono font-bold bg-[#1E2738] text-[#CBD5E1] border border-[#2A364F] px-2 py-0.5 rounded-full">
                          {player.tier}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#CBD5E1] mt-0.5">
                        Lead: {player.leadPet} ({player.breed})
                      </div>
                    </div>
                  </div>

                  {/* Elo & Record */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-lg sm:text-xl text-[#F59E0B] tabular-nums">
                      {player.elo} <span className="text-xs text-[#94A3B8]">ELO</span>
                    </div>
                    <div className="text-xs font-mono text-[#CBD5E1] mt-0.5 tabular-nums">
                      <span className="text-[#10B981] font-bold">{player.wins}W</span> /{' '}
                      <span className="text-[#F43F5E] font-bold">{player.losses}L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAB 2: HALL OF CHAMPIONS (FAIR PLAY COMMUNITY PETS) */
            <div className="space-y-4">
              {/* Header Action Banner with Instant Camera Trigger */}
              <div className="p-4 rounded-2xl bg-[#1E2738] border border-[#2A364F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F59E0B] text-[#0B0F17] flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-[#0B0F17]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg uppercase text-[#F8FAFC] tracking-wide">
                      Showcase Your Pet
                    </h3>
                    <p className="text-xs font-mono text-[#CBD5E1] mt-0.5">
                      Upload or snap your real pet to earn community fan cheers!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPhotoForm()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-bold uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>Showcase Pet Photo</span>
                </button>
              </div>

              {/* Inline Direct Upload & Camera Sheet */}
              {showUploadForm && (
                <div
                  ref={formRef}
                  className="p-5 rounded-2xl bg-[#1E2738] border border-[#F59E0B] shadow-2xl space-y-4 animate-in fade-in zoom-in-98 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                      <h4 className="font-display font-black text-base uppercase text-[#F8FAFC] tracking-wide">
                        Feature Your Companion
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="p-1.5 rounded-lg hover:bg-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                      aria-label="Close form"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Hidden native file and camera inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />

                  {/* Photo Preview & Capture Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {previewPhoto ? (
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#10B981] shadow-xl shrink-0 group">
                        <img
                          src={previewPhoto}
                          alt="Pet Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setPreviewPhoto(null)}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-[#10B981] text-[#0B0F17] text-xs font-bold font-mono text-center py-0.5 uppercase tracking-wider">
                          Ready
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-[#2A364F] bg-[#151C28] flex flex-col items-center justify-center text-[#F59E0B] p-2 text-center shrink-0">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs font-mono font-bold leading-tight text-[#CBD5E1]">
                          No Photo Selected
                        </span>
                      </div>
                    )}

                    {/* Capture Options */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
                        >
                          <Camera className="w-4 h-4 text-[#0B0F17]" />
                          <span>Snap Camera</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-xl bg-[#151C28] hover:bg-[#2A364F] text-[#F8FAFC] border border-[#2A364F] font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          <Upload className="w-4 h-4 text-[#CBD5E1]" />
                          <span>Upload File</span>
                        </button>
                      </div>

                      <p className="text-sm font-sans text-[#CBD5E1]">
                        Upload a photo of your pet companion. Verified pets earn exclusive cosmetic badges!
                      </p>
                    </div>
                  </div>

                  {/* Pet Name Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-sm font-sans font-bold text-[#CBD5E1] mb-1">
                        Pet Name:
                      </label>
                      <input
                        type="text"
                        value={inputPetName}
                        onChange={(e) => setInputPetName(e.target.value)}
                        placeholder="e.g. Barnaby The Great"
                        className="w-full px-3 py-2 rounded-xl border border-[#2A364F] bg-[#151C28] text-[#F8FAFC] font-sans text-base focus:outline-hidden focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-sans font-bold text-[#CBD5E1] mb-1">
                        Trainer Name:
                      </label>
                      <input
                        type="text"
                        value={inputTrainerName}
                        onChange={(e) => setInputTrainerName(e.target.value)}
                        placeholder="Your Trainer Name"
                        className="w-full px-3 py-2 rounded-xl border border-[#2A364F] bg-[#151C28] text-[#F8FAFC] font-sans text-base focus:outline-hidden focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitNewChampion}
                      className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-[#0B0F17]" />
                      <span>Feature Pet in Hall of Fame</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Spacious, Highly Legible Champion Pet Cards */}
              <div className="space-y-3.5">
                {holders.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border gap-4 shadow-sm transition-all ${
                      entry.rank === 1
                        ? 'bg-[#1E2738] border-2 border-[#F59E0B]'
                        : 'bg-[#151C28] border border-[#2A364F] hover:border-[#3E4F6F]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-xl shrink-0 border ${
                          entry.rank === 1
                            ? 'bg-[#F59E0B] text-[#0B0F17] border-[#F59E0B] shadow-md'
                            : 'bg-[#1E2738] text-[#F8FAFC] border-[#2A364F] tabular-nums'
                        }`}
                      >
                        {entry.rank === 1 ? (
                          <Crown className="w-6 h-6 text-[#0B0F17]" />
                        ) : (
                          `#${entry.rank}`
                        )}
                      </div>

                      {/* Raw Pet Photo */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#2A364F] shrink-0 bg-[#0B0F17] shadow-md overflow-hidden">
                        <img
                          src={entry.photoUrl}
                          alt={entry.petName}
                          className="w-full h-full object-cover"
                        />
                        {entry.isAiVerified && (
                          <div
                            className="absolute bottom-0 inset-x-0 bg-[#10B981] text-[#0B0F17] text-[11px] font-mono font-black text-center py-0.5 tracking-tight uppercase"
                            title="Verified real photograph by Gemini AI Bouncer"
                          >
                            ✓ REAL PET
                          </div>
                        )}
                      </div>

                      {/* Pet Information */}
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-black text-lg sm:text-xl text-[#F8FAFC] tracking-wide truncate">
                          {entry.petName}
                        </div>
                        <div className="text-sm font-sans text-[#CBD5E1] mt-1 leading-normal">
                          Trained by <span className="font-bold text-[#F8FAFC]">{entry.trainerName}</span> · Featured {entry.featuredSince}
                        </div>
                        <div className="text-base sm:text-lg font-mono font-black text-[#F59E0B] tabular-nums mt-1 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                          <span>{entry.cheers} Fan Cheers</span>
                        </div>
                      </div>
                    </div>

                    {/* Cheer Action Button */}
                    <button
                      onClick={() => handleCheerPet(entry)}
                      className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <Flame className="w-4 h-4 text-[#0B0F17] fill-[#0B0F17]" />
                      <span>Cheer Pet (+1)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A364F] bg-[#0B0F17] flex items-center justify-between text-sm font-sans text-[#CBD5E1]">
          <span>Protected by Google Identity & Dodo MoR Payments</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#151C28] hover:bg-[#2A364F] border border-[#2A364F] text-[#F8FAFC] font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};