import React from 'react';
import { Shield, Trophy, Coins, Check, Sparkles, Swords } from 'lucide-react';
import { OfflineDefenseReport } from '../../../services/ghostDefenseService';
import { sound } from '../../../utils/audio';

interface OfflineDefenseModalProps {
  report: OfflineDefenseReport;
  onClaim: () => void;
}

export const OfflineDefenseModal: React.FC<OfflineDefenseModalProps> = ({
  report,
  onClaim,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#151C28] border border-[#2A364F] rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl relative space-y-4">
        {/* Glowing Shield Icon */}
        <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/50 text-[#10B981] flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-8 h-8 text-[#10B981]" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFLINE DEFENSE META</span>
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-wider text-[#F8FAFC]">
            Sanctuary Defended!
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
            While you were away, rival trainers challenged your territory. Your champion{' '}
            <span className="font-bold text-[#F59E0B]">{report.defendingPetName}</span> stood firm!
          </p>
        </div>

        {/* Defense Results Box */}
        <div className="bg-[#0B0F17] rounded-2xl p-4 border border-[#2A364F] space-y-3 text-left">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#94A3B8]">Raids Repelled:</span>
            <span className="text-[#10B981] font-bold font-mono">
              ✓ {report.raidsDefended} Victory {report.raidsDefended > 1 ? 'Defenses' : 'Defense'}
            </span>
          </div>

          {report.raidsLost > 0 && (
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Defenses Breached:</span>
              <span className="text-[#F43F5E] font-bold font-mono">{report.raidsLost} Lost</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#2A364F]/50 flex items-center justify-between text-sm font-mono font-bold tabular-nums">
            <span className="text-[#F59E0B] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
              <span>+{report.trophiesGained} Trophies</span>
            </span>
            <span className="text-[#10B981] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#F59E0B]" />
              <span>+{report.creditsGained} Coins</span>
            </span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={() => {
            sound.playVictory();
            onClaim();
          }}
          className="w-full py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] active:scale-98 text-[#0B0F17] font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
        >
          <Check className="w-5 h-5" />
          <span>Claim Spoils & Continue</span>
        </button>
      </div>
    </div>
  );
};
