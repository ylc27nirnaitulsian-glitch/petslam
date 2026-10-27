import React, { useState } from 'react';
import {
  Coins,
  X,
  Sparkles,
  Zap,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Award,
  Swords,
  Target,
  Compass,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { triggerVictoryExplosion } from '../../utils/confetti';
import { createDodoCheckout } from '../../services/dodo';
import { trackClarityEvent } from '../../utils/clarity';

interface TokenRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArena?: () => void;
  onOpenQuests?: () => void;
  onOpenRadar?: () => void;
}

interface TokenPack {
  id: string;
  name: string;
  coins: number;
  bonus: string;
  priceUsd: string;
  priceCents: number;
  badge?: string;
  popular?: boolean;
  iconBg: string;
}

const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'pack_starter',
    name: 'Pouch of Coins',
    coins: 5000,
    bonus: '+500 Bonus',
    priceUsd: '$0.99',
    priceCents: 99,
    iconBg: 'from-amber-500/20 to-yellow-500/10',
  },
  {
    id: 'pack_champion',
    name: 'Chest of Coins',
    coins: 25000,
    bonus: '+5,000 Bonus (5x Value)',
    priceUsd: '$2.99',
    priceCents: 299,
    badge: 'MOST POPULAR',
    popular: true,
    iconBg: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    id: 'pack_legend',
    name: 'Vault of Champions',
    coins: 100000,
    bonus: '+30,000 Bonus (20x Value)',
    priceUsd: '$7.99',
    priceCents: 799,
    badge: 'BEST VALUE',
    iconBg: 'from-emerald-500/20 to-[#CCFF00]/15',
  },
];

export const TokenRefillModal: React.FC<TokenRefillModalProps> = ({
  isOpen,
  onClose,
  onOpenArena,
  onOpenQuests,
  onOpenRadar,
}) => {
  const { credits, addCredits } = useGame();
  const [processingPackId, setProcessingPackId] = useState<string | null>(null);
  const [faucetClaimed, setFaucetClaimed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const lastClaim = localStorage.getItem('petslam_faucet_last_claim');
    if (!lastClaim) return false;
    // Allow claim every 24 hours
    return Date.now() - parseInt(lastClaim, 10) < 24 * 60 * 60 * 1000;
  });
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimDailyFaucet = () => {
    sound.playVictory();
    triggerVictoryExplosion();
    addCredits(500);
    localStorage.setItem('petslam_faucet_last_claim', Date.now().toString());
    setFaucetClaimed(true);
    setPurchaseToast('🎉 +500 Free Daily Tokens Claimed!');
    trackClarityEvent('claim_daily_faucet', { amount: 500 });
    setTimeout(() => setPurchaseToast(null), 4000);
  };

  const handlePurchasePack = async (pack: TokenPack) => {
    setProcessingPackId(pack.id);
    sound.playClick();
    trackClarityEvent('initiate_token_checkout', { packId: pack.id, price: pack.priceUsd });

    try {
      const checkoutResult = await createDodoCheckout({
        productId: pack.id,
        productName: `PET SLAM - ${pack.name} (${pack.coins.toLocaleString()} Coins)`,
        amountCents: pack.priceCents,
        returnUrl: `${window.location.origin}/?payment_success=true&pack=${pack.id}`,
      });

      if (checkoutResult.checkoutUrl && !checkoutResult.sandbox) {
        // Redirect to live Dodo Checkout page
        window.location.href = checkoutResult.checkoutUrl;
      } else {
        // Instant Sandbox / Local verification grant
        addCredits(pack.coins);
        sound.playVictory();
        triggerVictoryExplosion();
        setPurchaseToast(`🎉 +${pack.coins.toLocaleString()} Coins Added to your Balance!`);
        trackClarityEvent('token_pack_granted_sandbox', { packId: pack.id, coins: pack.coins });
        setTimeout(() => setPurchaseToast(null), 4500);
      }
    } catch (err) {
      console.warn('Checkout fallback triggered:', err);
      // Fallback sandbox fulfillment
      addCredits(pack.coins);
      sound.playVictory();
      triggerVictoryExplosion();
      setPurchaseToast(`🎉 Sandbox Grant: +${pack.coins.toLocaleString()} Coins added!`);
      setTimeout(() => setPurchaseToast(null), 4500);
    } finally {
      setProcessingPackId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Toast */}
        {purchaseToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-200 pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-mono font-black text-xs sm:text-sm shadow-xl border border-white/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <span>{purchaseToast}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-white flex items-center gap-2">
                <span>Slam Tokens Hub</span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Instant Refill
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Current Balance:{' '}
                <span className="text-amber-400 font-black">{credits.toLocaleString()} Coins</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 scrollbar-thin">
          {/* Daily Free Faucet Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-display font-bold uppercase text-white flex items-center gap-1.5">
                  <span>Daily Free Faucet</span>
                  <span className="text-[9px] font-mono font-bold bg-[#CCFF00] text-black px-1.5 py-0.2 rounded-sm">
                    FREE
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 font-mono">
                  Claim +500 free Slam Coins every 24 hours to keep your companion energized.
                </p>
              </div>
            </div>

            <button
              onClick={handleClaimDailyFaucet}
              disabled={faucetClaimed}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all shrink-0 cursor-pointer shadow-md ${
                faucetClaimed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black active:scale-95 shadow-[0_0_12px_rgba(204,255,0,0.4)]'
              }`}
            >
              {faucetClaimed ? 'Claimed Today ✓' : 'Claim +500 🪙'}
            </button>
          </div>

          {/* Dodo Payments Instant Token Bundles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Token Packs (Dodo Payments)</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TOKEN_PACKS.map((pack) => {
                const isProcessing = processingPackId === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`relative rounded-2xl border p-3.5 flex flex-col justify-between transition-all bg-slate-950/60 ${
                      pack.popular
                        ? 'border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {pack.badge}
                      </span>
                    )}

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-display font-black text-sm text-white truncate">
                          {pack.coins.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-300">
                        {pack.name}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        {pack.bonus}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchasePack(pack)}
                      disabled={isProcessing}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        pack.popular
                          ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black active:scale-95'
                          : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <span>Buy {pack.priceUsd}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-Game Free Ways to Earn Tokens */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Earn Free Tokens In-Game</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenArena?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                  <Swords className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>PvP Arena Wins</span>
                    <span className="text-amber-400 font-mono">+1,800 - 2,600 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Battle trainer opponents in live combat
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenQuests?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>Daily Directives</span>
                    <span className="text-amber-400 font-mono">+3,000 - 12,000 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Complete 3 daily trainer mission quests
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenRadar?.();
                }}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-emerald-400/40 transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>World Map Catches</span>
                    <span className="text-amber-400 font-mono">+450 🪙 / catch</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Track & capture wild purebreds on GPS radar
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] flex items-center justify-between">
                    <span>Buddy Interactions</span>
                    <span className="text-amber-400 font-mono">+35 - 50 🪙</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Feed berries and play catch with your screen companion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Secure Dodo Payments Integration</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
