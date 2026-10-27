import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Flame,
  Swords,
  DollarSign,
  TrendingUp,
  X,
  Camera,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { trackClarityEvent } from '../../utils/clarity';

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

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'outbid'>('arena');
  const [outbidToast, setOutbidToast] = useState<string | null>(null);

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

  // OutbidPet Real-Money Clout Leaderboard
  const outbidHolders: OutbidPetEntry[] = [
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

  const handleOutbidClick = (entry: OutbidPetEntry) => {
    sound.playClick();
    const nextBid = entry.currentBidUsd + 1.0;
    trackClarityEvent(`outbid_click_rank_${entry.rank}`);
    setOutbidToast(`⚡ Outbid Spot #${entry.rank} for $${nextBid.toFixed(2)} USD! Initializing Dodo Payments...`);
    setTimeout(() => {
      setOutbidToast(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
        
        {/* Toast Alert */}
        {outbidToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#CCFF00] text-black font-mono font-black text-xs sm:text-sm rounded-xl shadow-2xl border-2 border-black animate-in slide-in-from-top-4">
            {outbidToast}
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
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin">
          {activeTab === 'arena' ? (
            /* TAB 1: THE ARENA KINGS */
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                <span>Ranked strictly by Authoritative 20-Tick Netcode PvP Elo</span>
                <span className="font-bold text-slate-900 dark:text-white">Season 1 Active</span>
              </div>

              {arenaKings.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    player.rank === 1
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                      : player.rank === 2
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-500'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-base shrink-0 shadow-xs ${
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
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-white/20 shrink-0">
                      <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-display font-black text-base text-slate-900 dark:text-white truncate">
                          {player.name}
                        </span>
                        <span className="text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded">
                          {player.tier}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Lead: {player.leadPet} ({player.breed})
                      </div>
                    </div>
                  </div>

                  {/* Elo & Record */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-lg text-emerald-700 dark:text-[#CCFF00]">
                      {player.elo} <span className="text-xs text-slate-500">ELO</span>
                    </div>
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span className="text-emerald-600 font-bold">{player.wins}W</span> /{' '}
                      <span className="text-red-500 font-bold">{player.losses}L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAB 2: OUTBIDPET (REAL-MONEY CLOUT) */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-700 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Real-Money Clout Board: Hold a rank with your real unedited pet photo!</span>
                </div>
                {onOpenUpload && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenUpload();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black uppercase text-xs hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
                  >
                    Upload Pet Photo 📸
                  </button>
                )}
              </div>

              {outbidHolders.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 gap-3 shadow-xs hover:border-amber-400/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-display font-black text-lg text-slate-900 dark:text-white shrink-0 border border-slate-300 dark:border-white/10">
                      #{entry.rank}
                    </div>

                    {/* Raw Pet Photo */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/70 shrink-0 bg-black">
                      <img
                        src={entry.photoUrl}
                        alt={entry.petName}
                        className="w-full h-full object-cover"
                      />
                      {entry.isAiVerified && (
                        <div
                          className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-mono font-black text-center py-0.2"
                          title="Verified real photograph by Gemini AI Bouncer"
                        >
                          ✓ REAL PET
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-display font-black text-base text-slate-900 dark:text-white truncate">
                        {entry.petName}
                      </div>
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        Held by <span className="font-bold text-slate-900 dark:text-white">{entry.trainerName}</span> · {entry.heldSince}
                      </div>
                      <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        Current: ${entry.currentBidUsd.toFixed(2)} USD
                      </div>
                    </div>
                  </div>

                  {/* Outbid Action Button */}
                  <button
                    onClick={() => handleOutbidClick(entry)}
                    className="py-2.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <span>Outbid (+${(1.0).toFixed(2)})</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070A12] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Protected by Google Identity & Dodo MoR Payments</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};