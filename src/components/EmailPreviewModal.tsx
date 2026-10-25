import React, { useState } from 'react';
import { X, Mail, Check, Copy, Shield, Award, Zap, Send, ExternalLink, Terminal } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  voucherId?: string;
  resendStatus?: { sent: boolean; message: string };
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  email = 'applicant@example.com',
  voucherId = 'ps_genesis_alpha',
  resendStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText(voucherId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl border border-white/10 bg-[#12141A] text-white shadow-2xl my-8">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#14161E]">
          <div className="flex items-center gap-2.5">
            <Mail className="h-5 w-5 text-[#CCFF00]" />
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Waitlist Confirmation Email Preview
              </h3>
              <p className="text-[11px] text-neutral-400">
                Official Genesis Alpha Welcome Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
            aria-label="Close email preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email Header Envelope Meta */}
        <div className="border-b border-white/10 bg-[#0E1015] px-6 py-3.5 space-y-1.5 text-xs font-mono text-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-neutral-500">From: </span>
              <span className="text-white">PET SLAM Alpha Desk &lt;onboarding@resend.dev&gt;</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Provider: <span className="text-[#CCFF00]">Resend API</span>
            </div>
          </div>
          <div>
            <span className="text-neutral-500">To: </span>
            <span className="text-[#CCFF00] font-bold">{email}</span>
          </div>
          <div>
            <span className="text-neutral-500">Subject: </span>
            <span className="text-white font-semibold">
              Application Received: 10,000 Credits & Exclusive Alpha Access Granted!
            </span>
          </div>
        </div>

        {/* Formatted Email Content Box */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto bg-[#0F1015]">
          {/* Email Brand Hero */}
          <div className="border border-white/10 bg-[#14161E] p-6 text-center">
            <span className="font-display text-3xl font-black uppercase tracking-wider text-white">
              PET<span className="text-[#CCFF00]"> SLAM</span>
            </span>
            <div className="mt-2 text-xs font-mono font-bold uppercase tracking-widest text-[#CCFF00]">
              ALPHA CANDIDATE VOUCHER · OFFICIALLY GRANTED
            </div>
          </div>

          {/* Salutation & Body Copy */}
          <div className="space-y-4 text-sm leading-relaxed text-neutral-200">
            <p className="font-semibold text-white">
              Hey {email.split('@')[0]},
            </p>
            <p>
              We have officially received your application for the <strong>PET SLAM</strong> waitlist! Your candidate spot is locked into our genesis database registry.
            </p>
            <p>
              Because you are entering during the genesis recruitment window, you have been granted an exclusive starter package upon platform rollout:
            </p>
          </div>

          {/* 3 Perks Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Perk 1: 10000 Credits */}
            <div className="border border-[#CCFF00]/40 bg-[#CCFF00]/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#CCFF00] mb-1">
                  <Zap className="h-4 w-4" />
                  <span>10,000 Credits</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                  Automatically credited to your account for beast marketplace acquisition, auction bidding, and attribute training.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[11px] text-[#CCFF00] font-bold">
                GUARANTEED ALLOCATION
              </div>
            </div>

            {/* Perk 2: Founder Beast Badge */}
            <div className="border border-amber-500/40 bg-amber-500/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Award className="h-4 w-4" />
                  <span>Founder Badge</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                  Permanent genesis insignia affixed to your competitor profile, arena card, and global leaderboard ranking.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[11px] text-amber-400 font-bold">
                GENESIS EXCLUSIVE
              </div>
            </div>

            {/* Perk 3: Closed Alpha Testing */}
            <div className="border border-cyan-500/40 bg-cyan-500/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  <Shield className="h-4 w-4" />
                  <span>Alpha Testing</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                  Priority invitation wave to playtest the real-time PvP battle arena, weekly player auctions, and IRL proximity matchmaking.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[11px] text-cyan-400 font-bold">
                PRIORITY WAVE 1
              </div>
            </div>
          </div>

          {/* Voucher Code Box */}
          <div className="border border-white/10 bg-black/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Official Registration Voucher
              </span>
              <span className="font-mono text-base font-bold text-white tracking-widest">
                {voucherId}
              </span>
            </div>

            <button
              onClick={handleCopyVoucher}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider border border-white/10 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#CCFF00]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Closing text */}
          <div className="text-xs text-neutral-300 leading-relaxed space-y-2 border-t border-white/10 pt-4">
            <p>
              We're building something distinct where raw animal biology meets high-stakes esports. You'll be among the very first through the arena gates.
            </p>
            <p className="text-neutral-400">
              Stay sharp. The arena is coming.
            </p>
            <div className="pt-2 font-display text-base font-bold text-white uppercase">
              – Team PET SLAM
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 px-6 py-4 bg-[#14161E] text-xs text-neutral-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00]" />
            <span>
              {resendStatus?.sent
                ? 'Email delivered via Resend API'
                : 'Email templating verified. Delivery triggers automatically when RESEND_API_KEY is configured.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-bold text-xs uppercase px-5 py-2 tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
