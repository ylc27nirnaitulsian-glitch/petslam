import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Shield, Users, Trophy, Coins, MessageSquare, ArrowRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';

interface AlphaQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlphaQueueModal: React.FC<AlphaQueueModalProps> = ({ isOpen, onClose }) => {
  const { trainerName, setTrainerName } = useGame();
  const [handle, setHandle] = useState(trainerName);
  const [community, setCommunity] = useState('Smogon VGC');
  const [selectedStarter, setSelectedStarter] = useState('Bengal Tiger');
  const [claimed, setClaimed] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  if (!isOpen) return null;

  const communities = [
    { name: 'Smogon VGC', badge: 'Competitive Pokémon / VGC Hub' },
    { name: 'TFT Competitive', badge: 'Tactical Esports Discord' },
    { name: 'Auto-Chess Hubs', badge: 'Strategy & Synergy Guilds' },
    { name: 'r/CompetitiveGaming', badge: 'Reddit Esports Community' },
  ];

  const starters = [
    { name: 'Bengal Tiger', archetype: 'Predator / Ambush Burst', desc: 'Crushing bite force and lightning pounce strike' },
    { name: 'Timber Wolf', archetype: 'Pack Stalker / High Agility', desc: 'Superior stamina recovery and evasion dodge speed' },
    { name: 'African Lion', archetype: 'Apex Brawler / Dominance', desc: 'Territorial roar stun and heavy maul balance' },
    { name: 'Harpy Eagle', archetype: 'Aerial Recon / Precision', desc: 'High crit rate and razor talon dive attacks' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    sound.playVictory();
    const code = `SLAM-ALPHA-${Math.floor(1000 + Math.random() * 9000)}`;
    setVoucherCode(code);
    setClaimed(true);

    if (handle.trim() !== trainerName) {
      setTrainerName(handle.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#12141C] border border-[#CCFF00]/40 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!claimed ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Genesis Priority Access</span>
            </div>

            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Join Week 8 Alpha Queue
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Register for Wave 1 closed alpha testing. Guaranteed priority server access, 10,000 credit starter grant, and Genesis Founder badge.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Community Source */}
              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase block mb-1.5">
                  1. Target Esports Community / Discord
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {communities.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => {
                        setCommunity(c.name);
                        sound.playClick();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        community === c.name
                          ? 'border-[#CCFF00] bg-[#1A1E2A] text-white ring-1 ring-[#CCFF00]/40'
                          : 'border-white/10 bg-[#141620] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-display font-bold text-xs uppercase text-white truncate">
                        {c.name}
                      </div>
                      <div className="text-[9px] text-neutral-400 mt-0.5 truncate">
                        {c.badge}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call-Sign / Handle */}
              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase block mb-1.5">
                  2. Trainer Call-Sign / Discord Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. ApexTrainer#1337"
                  className="w-full bg-[#161822] border border-white/15 focus:border-[#CCFF00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  required
                />
              </div>

              {/* Preferred Starter Beast */}
              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase block mb-1.5">
                  3. Select Genesis Starter Animal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {starters.map((s) => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => {
                        setSelectedStarter(s.name);
                        sound.playClick();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedStarter === s.name
                          ? 'border-[#CCFF00] bg-[#1A1E2A] text-white ring-1 ring-[#CCFF00]/40'
                          : 'border-white/10 bg-[#141620] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-display font-bold text-xs uppercase text-white">
                        {s.name}
                      </div>
                      <div className="text-[9px] text-[#CCFF00] font-mono mt-0.5">
                        {s.archetype}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#CCFF00]/25 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Alpha Queue & Claim Rewards</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center mx-auto text-[#CCFF00] mb-4 shadow-[0_0_25px_rgba(204,255,0,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">
              Verification Confirmed
            </span>
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-1">
              Priority Alpha Slot Locked
            </h3>

            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Welcome aboard, <strong>{handle}</strong>! You have been queued into Wave 1 via the <strong>{community}</strong> esports partner pipeline with starter animal <strong>{selectedStarter}</strong>.
            </p>

            {/* Voucher Box */}
            <div className="mt-5 p-4 rounded-2xl bg-[#161924] border border-[#CCFF00]/40 text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                Genesis Founder Voucher
              </span>
              <div className="font-mono font-black text-xl text-[#CCFF00] tracking-widest mt-1">
                {voucherCode}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>+10,000 Credits Alpha Stipend Granted</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#CCFF00]/25 cursor-pointer"
            >
              Enter Championship Arena
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
