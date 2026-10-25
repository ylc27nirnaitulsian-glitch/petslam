import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Shield,
  Check,
  Flame,
  Award,
  Coins,
  CreditCard,
  Gavel,
  Camera,
  Tv,
  Zap,
  BatteryCharging,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';

interface VipPassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPass?: 'auction' | 'avatar' | 'extension' | 'bundle';
}

export const VipPassesModal: React.FC<VipPassesModalProps> = ({
  isOpen,
  onClose,
  defaultPass = 'bundle',
}) => {
  const {
    credits,
    hasAuctionPass,
    hasAvatarStudioPass,
    hasExtensionPass,
    unlockPass,
  } = useGame();

  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'credits'>('usd');
  const [selectedPass, setSelectedPass] = useState<'auction' | 'avatar' | 'extension' | 'bundle'>(defaultPass);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const passes = [
    {
      id: 'auction' as const,
      title: 'Auction House VIP License',
      priceUsd: '$1.99',
      creditsCost: 1500,
      icon: Gavel,
      color: 'amber',
      accentBorder: 'border-amber-400',
      badge: 'Trading Hub',
      isOwned: hasAuctionPass,
      features: [
        'Place live bids on rare pedigree cats & dogs',
        'List your trained sanctuary pets for global auction',
        'Set custom starting bids & instant buyout valuations',
        'Zero commission trading fee rebate',
      ],
    },
    {
      id: 'avatar' as const,
      title: 'Custom Pet DNA Avatar Pass',
      priceUsd: '$0.99',
      creditsCost: 1000,
      icon: Camera,
      color: 'cyan',
      accentBorder: 'border-cyan-400',
      badge: 'Personal Pet',
      isOwned: hasAvatarStudioPass,
      features: [
        'Turn your real dog or cat photo into a 2D avatar',
        'Extract coat colors, ears, and personality traits',
        'Deploy your real pet directly into the Battle Arena',
        'Custom signature move & battle stats generator',
      ],
    },
    {
      id: 'extension' as const,
      title: 'Browser Extension Lifetime Pass',
      priceUsd: '$1.99',
      creditsCost: 1500,
      icon: Tv,
      color: 'lime',
      accentBorder: 'border-[#CCFF00]',
      badge: 'Desktop Companion',
      isOwned: hasExtensionPass,
      features: [
        'Screen-roaming companion on bottom & sidebars',
        'Laptop battery & charging detector alerts ⚡',
        'Posture, hydration & 20-20-20 screen reminders 💧',
        'Talking Tom voice mimic & poke interactions',
        'Full Chrome Extension (Manifest V3) ZIP download',
      ],
    },
    {
      id: 'bundle' as const,
      title: 'All-Access Genesis VIP Bundle',
      priceUsd: '$4.99',
      creditsCost: 4000,
      icon: CrownIcon,
      color: 'fuchsia',
      accentBorder: 'border-fuchsia-400',
      badge: 'BEST VALUE · 40% OFF',
      isOwned: hasAuctionPass && hasAvatarStudioPass && hasExtensionPass,
      features: [
        'Instant unlock for Auction License ($2.99 value)',
        'Instant unlock for Custom Avatar Pass ($0.99 value)',
        'Instant unlock for Browser Extension Lifetime ($1.99 value)',
        '+5,000 Bonus Slam Credits credited instantly',
        'Exclusive Genesis Gold Call-Sign arena emblem',
      ],
    },
  ];

  const handlePurchase = (passId: 'auction' | 'avatar' | 'extension' | 'bundle') => {
    setIsProcessing(true);
    sound.playClick();

    setTimeout(() => {
      const res = unlockPass(passId, paymentMethod === 'credits');
      setIsProcessing(false);

      if (res.success) {
        sound.playVictory();
        setSuccessToast(res.message);
        setTimeout(() => {
          setSuccessToast(null);
        }, 3000);
      } else {
        sound.playClick();
        alert(res.message);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-[#0E121C] border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          <span>VIP Licenses & Upgrades</span>
        </div>

        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
          Pet Slam VIP Passes
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
          Unlock the global live Auction House, transform your real pet into an arena fighter, or unleash the desktop browser extension.
        </p>

        {/* Currency Switcher: USD or Credits */}
        <div className="mt-4 p-1 rounded-2xl bg-[#141A28] border border-white/10 grid grid-cols-2 gap-1">
          <button
            onClick={() => setPaymentMethod('usd')}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMethod === 'usd'
                ? 'bg-gradient-to-r from-[#CCFF00] to-emerald-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Direct Payment (USD)</span>
          </button>

          <button
            onClick={() => setPaymentMethod('credits')}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMethod === 'credits'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Pay with Credits ({credits.toLocaleString()})</span>
          </button>
        </div>

        {/* Pass Cards */}
        <div className="mt-4 space-y-3">
          {passes.map((pass) => {
            const Icon = pass.icon;
            const isSelected = selectedPass === pass.id;

            return (
              <div
                key={pass.id}
                onClick={() => setSelectedPass(pass.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  pass.isOwned
                    ? 'bg-[#101724]/60 border-emerald-500/40 opacity-85'
                    : isSelected
                    ? `bg-[#161F32] ${pass.accentBorder} ring-2 ring-white/20 shadow-lg`
                    : 'bg-[#121824] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        pass.color === 'amber'
                          ? 'bg-amber-500/20 text-amber-400'
                          : pass.color === 'cyan'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : pass.color === 'lime'
                          ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                          : 'bg-fuchsia-500/20 text-fuchsia-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                          {pass.title}
                        </h3>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            pass.color === 'fuchsia'
                              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                              : 'bg-white/10 text-neutral-300'
                          }`}
                        >
                          {pass.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-display font-black text-white">
                          {paymentMethod === 'usd' ? pass.priceUsd : `${pass.creditsCost.toLocaleString()} Credits`}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {paymentMethod === 'usd' ? `or ${pass.creditsCost.toLocaleString()} Credits` : `(${pass.priceUsd})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {pass.isOwned ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-black flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>UNLOCKED</span>
                    </span>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pass.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wide shadow-md transition-all shrink-0 cursor-pointer ${
                        pass.color === 'fuchsia'
                          ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:brightness-110 text-white'
                          : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black'
                      }`}
                    >
                      {isProcessing ? 'Unlocking...' : 'Unlock Now'}
                    </button>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-2.5 pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-neutral-300 font-sans">
                  {pass.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#CCFF00] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>🔒 Simulated Instant Settlement</span>
          <span>Google Pay · Cards · In-Game</span>
        </div>
      </div>
    </div>
  );
};

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
