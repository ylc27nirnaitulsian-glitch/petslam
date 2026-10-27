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

interface OutbidPetEntry {
  rank: number;
  petName: string;
  trainerName: string;
  currentBidUsd: number;
  photoUrl: string;
  heldSince: string;
  isAiVerified: boolean;
}

const INITIAL_OUTBID_HOLDERS: OutbidPetEntry[] = [
  {
    rank: 1,
    petName: 'Barnaby the Sovereign',
    trainerName: 'LordSterling',
    currentBidUsd: 42.0,
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80',
    heldSince: '4h ago',
    isAiVerified: true,
  },
  {
    rank: 2,
    petName: 'Cleo Golden Empress',
    trainerName: 'CairoKing',
    currentBidUsd: 28.0,
    photoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=80',
    heldSince: '7h ago',
    isAiVerified: true,
  },
  {
    rank: 3,
    petName: 'Diesel Mountain Dog',
    trainerName: 'ApexRuler',
    currentBidUsd: 19.0,
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80',
    heldSince: '1d ago',
    isAiVerified: true,
  },
  {
    rank: 4,
    petName: 'Mochi Marshmallow',
    trainerName: 'SugarBytes',
    currentBidUsd: 12.0,
    photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format&fit=crop&q=80',
    heldSince: '2d ago',
    isAiVerified: true,
  },
  {
    rank: 5,
    petName: 'Ghost Samurai Cat',
    trainerName: 'TokyoRonin',
    currentBidUsd: 8.0,
    photoUrl: 'https://images.unsplash.com/photo-1513360309081-36f20ca48f22?w=400&auto=format&fit=crop&q=80',
    heldSince: '3d ago',
    isAiVerified: true,
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  const { trainerName } = useGame();
  const [activeTab, setActiveTab] = useState<'arena' | 'outbid'>('outbid');
  const [outbidToast, setOutbidToast] = useState<string | null>(null);
  const [holders, setHolders] = useState<OutbidPetEntry[]>(INITIAL_OUTBID_HOLDERS);

  // Photo Upload & Direct Camera Snap State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [inputPetName, setInputPetName] = useState<string>('');
  const [inputTrainerName, setInputTrainerName] = useState<string>(trainerName || 'Champion Trainer');
  const [inputBidUsd, setInputBidUsd] = useState<number>(43.0);

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

  const handleOpenPhotoForm = (suggestedBid?: number) => {
    sound.playClick();
    setShowUploadForm(true);
    if (suggestedBid) {
      setInputBidUsd(suggestedBid);
    } else {
      const topBid = holders[0]?.currentBidUsd || 42.0;
      setInputBidUsd(topBid + 1.0);
    }
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitNewOutbid = () => {
    if (!previewPhoto) {
      setOutbidToast('⚠️ Please snap or select a photo of your pet first!');
      sound.playClick();
      return;
    }

    const petName = inputPetName.trim() || 'My Crown Pet';
    sound.playVictory();
    triggerVictoryExplosion();
    trackClarityEvent('outbid_photo_submitted');

    const newBidAmount = Math.max(1, Number(inputBidUsd) || 43.0);
    const newEntry: OutbidPetEntry = {
      rank: 1,
      petName,
      trainerName: inputTrainerName.trim() || 'Trainer',
      currentBidUsd: newBidAmount,
      photoUrl: previewPhoto,
      heldSince: 'Just now',
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

    setOutbidToast(`👑 ${petName} is now Sovereign #1 on the Outbid Hall of Fame!`);
    setShowUploadForm(false);
    setPreviewPhoto(null);
    setInputPetName('');

    setTimeout(() => {
      setOutbidToast(null);
    }, 4500);
  };

  const handleOutbidClick = (entry: OutbidPetEntry) => {
    sound.playClick();
    const nextBid = entry.currentBidUsd + 1.0;
    handleOpenPhotoForm(nextBid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
        
        {/* Toast Alert */}
        {outbidToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#CCFF00] text-black font-mono font-black text-xs sm:text-sm rounded-xl shadow-2xl border-2 border-black animate-in slide-in-from-top-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span>{outbidToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090D17]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-400/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-slate-900 dark:text-white">
                Pet Slam Hall of Fame
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                PvP Elo Kings & Real-Money Clout Leaderboards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex p-2 bg-slate-100 dark:bg-[#070A12] border-b border-slate-200 dark:border-white/10 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('outbid');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'outbid'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>OutbidPet (Wealth Clout)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('arena');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-slate-900 text-white dark:bg-[#CCFF00] dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>The Arena Kings (Skill PvP)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {activeTab === 'arena' ? (
            /* TAB 1: THE ARENA KINGS */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                <span>Ranked strictly by Authoritative 20-Tick Netcode PvP Elo</span>
                <span className="font-bold text-slate-900 dark:text-white">Season 1 Active</span>
              </div>

              {arenaKings.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    player.rank === 1
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                      : player.rank === 2
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-500'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-base shrink-0 shadow-xs ${
                        player.rank === 1
                          ? 'bg-amber-400 text-black'
                          : player.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {player.rank === 1 ? '👑' : `#${player.rank}`}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 dark:border-white/20 shrink-0">
                      <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                          {player.name}
                        </span>
                        <span className="text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">
                          {player.tier}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Lead: {player.leadPet} ({player.breed})
                      </div>
                    </div>
                  </div>

                  {/* Elo & Record */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-lg sm:text-xl text-emerald-700 dark:text-[#CCFF00]">
                      {player.elo} <span className="text-xs text-slate-500">ELO</span>
                    </div>
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                      <span className="text-emerald-600 font-bold">{player.wins}W</span> /{' '}
                      <span className="text-red-500 font-bold">{player.losses}L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAB 2: OUTBIDPET (REAL-MONEY CLOUT) */
            <div className="space-y-4">
              {/* Header Action Banner with Instant Camera Trigger */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 border-2 border-amber-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-xl font-black shadow-md shrink-0">
                    👑
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base sm:text-lg uppercase text-slate-900 dark:text-white tracking-wide">
                      Hold The Clout Crown With Your Pet
                    </h3>
                    <p className="text-xs font-mono text-slate-600 dark:text-neutral-300 mt-0.5">
                      Upload or snap a photo of your pet to outbid the top spot!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPhotoForm()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-slate-900 text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black dark:hover:bg-[#b8e600] font-display font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add / Snap Pet Photo 📸</span>
                </button>
              </div>

              {/* Inline Direct Upload & Camera Sheet */}
              {showUploadForm && (
                <div
                  ref={formRef}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111726] border-2 border-amber-400 shadow-2xl space-y-4 animate-in fade-in zoom-in-98 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="font-display font-black text-base uppercase text-slate-900 dark:text-white tracking-wide">
                        Claim Your Outbid Hall of Fame Rank
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
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
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-xl shrink-0 group">
                        <img
                          src={previewPhoto}
                          alt="Pet Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setPreviewPhoto(null)}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-mono font-black text-center py-0.5">
                          ✓ PHOTO READY
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-amber-400/60 bg-amber-500/10 flex flex-col items-center justify-center text-amber-500 dark:text-amber-400 p-2 text-center shrink-0">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-mono font-bold leading-tight">
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
                          className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-transform"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Snap Camera 📷</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload File 📁</span>
                        </button>
                      </div>

                      <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                        Upload an unedited photo of your dog or cat. Gemini AI verifies real pets automatically!
                      </p>
                    </div>
                  </div>

                  {/* Pet Name & Bid Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pet Name:
                      </label>
                      <input
                        type="text"
                        value={inputPetName}
                        onChange={(e) => setInputPetName(e.target.value)}
                        placeholder="e.g. Barnaby The Great"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-black/50 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Outbid Amount ($ USD):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          step="1.00"
                          min="1"
                          value={inputBidUsd}
                          onChange={(e) => setInputBidUsd(parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-black/50 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitNewOutbid}
                      className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Crown className="w-4 h-4 text-black" />
                      <span>Submit Outbid & Claim #1 ($ {inputBidUsd.toFixed(2)})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Spacious, Highly Legible Outbid Pet Cards */}
              <div className="space-y-3.5">
                {holders.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border gap-4 shadow-sm transition-all ${
                      entry.rank === 1
                        ? 'bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-950/30 dark:to-black/50 border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-xl shrink-0 border ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border-slate-300 dark:border-white/10'
                        }`}
                      >
                        {entry.rank === 1 ? '👑' : `#${entry.rank}`}
                      </div>

                      {/* Raw Pet Photo */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shrink-0 bg-black shadow-md">
                        <img
                          src={entry.photoUrl}
                          alt={entry.petName}
                          className="w-full h-full object-cover"
                        />
                        {entry.isAiVerified && (
                          <div
                            className="absolute bottom-0 inset-x-0 bg-emerald-600/95 text-white text-[9px] font-mono font-black text-center py-0.5 tracking-tight"
                            title="Verified real photograph by Gemini AI Bouncer"
                          >
                            ✓ REAL PET
                          </div>
                        )}
                      </div>

                      {/* Pet Information with Generous Spacing & High-Contrast Typography */}
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-wide truncate">
                          {entry.petName}
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          Held by <span className="font-black text-slate-900 dark:text-white">{entry.trainerName}</span> · {entry.heldSince}
                        </div>
                        <div className="text-base sm:text-lg font-mono font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <span>${entry.currentBidUsd.toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Outbid Action Button */}
                    <button
                      onClick={() => handleOutbidClick(entry)}
                      className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <span>Outbid (+${(1.0).toFixed(2)})</span>
                      <ArrowUpRight className="w-4 h-4 text-black" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A12] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Protected by Google Identity & Dodo MoR Payments</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};