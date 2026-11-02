import React, { useState } from 'react';
import { X, Sparkles, Shield, Check, Flame, Award, Coins, CreditCard } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { createDodoCheckout } from '../../services/dodo';

interface FounderPackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FounderPackModal: React.FC<FounderPackModalProps> = ({ isOpen, onClose }) => {
  const { credits } = useGame();
  const [purchased, setPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'dodo' | 'credits'>('dodo');

  if (!isOpen) return null;

  const founderPerks = [
    { title: 'Obsidian Alpha Tiger Rig', desc: 'Matte black ballistic exo-chassis with electric lime optic visor' },
    { title: 'Golden Mane Lion Regalia', desc: 'Ceremonial gold-leaf tactical collar with pressure sensor harness' },
    { title: 'Ghost Frost Wolf Pelt', desc: 'Sub-zero thermal fur cloak with cyan luminescence' },
    { title: 'Apex Founder Call-Sign Badge', desc: 'Exclusive gold border and permanent Genesis verification symbol' },
  ];

  const handlePurchase = async () => {
    setIsProcessing(true);
    sound.playClick();
    try {
      const checkout = await createDodoCheckout({ passType: 'bundle' });
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      } else {
        sound.playVictory();
        setPurchased(true);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to initialize Dodo Payments checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#12141C] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!purchased ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Genesis Commercial Launch Offer</span>
            </div>

            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Genesis Founder Pack
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Week 8 exclusive cosmetic supporter collection. Zero pay-to-win stat advantages; 100% cosmetic prestige and colosseum styling.
            </p>

            <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Fixed Supporter Price</span>
                <div className="text-2xl font-display font-black text-amber-300">
                  $4.99 USD
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">One-Time License</span>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>100% Cosmetic</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-wider">
                Included Cosmetic Assets:
              </span>
              {founderPerks.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#161822] border border-white/5 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs uppercase text-white">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="mt-5 w-full py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-[#CCFF00] hover:brightness-110 text-black shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Connecting to Checkout...' : 'Unlock Founder Pack ($4.99 via Dodo)'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Transaction Successful
            </span>
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-1">
              Founder Perks Activated
            </h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Your Genesis skins and founder privileges are now equipped. Your profile badge is upgraded to <strong>Genesis Gold Founder</strong>.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg cursor-pointer"
            >
              Equip & Return to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
