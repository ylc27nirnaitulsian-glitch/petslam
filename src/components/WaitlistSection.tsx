import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Database,
  Send,
  Zap,
  Award,
  Shield,
  Eye,
} from 'lucide-react';
import { EmailPreviewModal } from './EmailPreviewModal';
import { submitWaitlist, getWaitlistStats } from '../services/waitlist';

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    entry?: {
      id: string;
      email: string;
      created_at: string;
      signup_status: string;
      perks?: { credits: number; founder_badge: boolean; alpha_access: boolean };
    };
    totalSignups?: number;
    emailStatus?: { sent: boolean; message: string; template?: any };
    perksAwarded?: { credits: number; founderBadge: string; alphaTesting: string };
    mode?: string;
  } | null>(null);

  const [backendStats, setBackendStats] = useState<{
    totalSignups: number;
    provider?: string;
  } | null>(null);

  // Fetch live stats from backend or Supabase
  const fetchStatus = async () => {
    try {
      const stats = await getWaitlistStats();
      setBackendStats({ totalSignups: stats.totalSignups, provider: stats.provider });
    } catch {
      // stats optional
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await submitWaitlist(trimmed);

      if (result.success) {
        setSuccessData(result);
        setEmail('');
        fetchStatus();
      } else if (result.duplicate) {
        setErrorMessage(result.message || 'This email address is already on the PET SLAM waitlist.');
      } else {
        setErrorMessage(result.error || 'Unable to register at this moment. Please check your connection and retry.');
      }
    } catch {
      setErrorMessage('Network error: Unable to contact the registration server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="relative border-b border-white/5 bg-[#0B0C10] py-20 lg:py-28 overflow-hidden">
      {/* Ambient glow highlight */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#CCFF00]/5 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="border border-white/10 bg-[#12141A] p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00] mb-3">
              <span>Priority Genesis Cohort</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>10,000 Credits Grant Active</span>
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              THE ARENA IS CALLING.
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-neutral-300">
              Launching free playable alpha access directly to competitive gaming communities on Discord (Smogon VGC, TFT Competitive) and Reddit, with Genesis Founder cosmetic packs available at launch. Reserve your place now for guaranteed starter credits and Founder status.
            </p>
          </div>

          {/* Guaranteed Genesis Perks Callout Banner */}
          <div className="mt-8 border border-[#CCFF00]/30 bg-[#161922] p-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-2">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00]" />
                <span>Guaranteed Early Applicant Privileges</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#CCFF00] hover:underline font-mono uppercase tracking-wider font-semibold cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview Confirmation Email</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#CCFF00] mb-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>10,000 Credits</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Automatic credit grant deposited for beast marketplace buying, bidding, and stat training.
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-400 mb-1">
                  <Award className="h-3.5 w-3.5" />
                  <span>Founder Badge</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Permanent genesis insignia displayed across your arena card and global ranking.
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-cyan-400 mb-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Free Playable Alpha Wave 1</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Priority invite wave to access single-player training, diet conditioning, and local combat sandbox.
                </p>
              </div>
            </div>
          </div>

          {/* Real Form or Success State */}
          <div className="mt-8 max-w-xl mx-auto">
            {successData ? (
              <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-8 text-center transition-all">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#CCFF00] text-black">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-black uppercase tracking-wide text-white">
                  YOU'RE IN. WELCOME TO PET SLAM.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  Your application has been received and verified. 10,000 Arena Credits and your Founder Beast Badge have been assigned to your registration voucher.
                </p>

                {/* Entry Receipt Details */}
                {successData.entry && (
                  <div className="mt-6 border border-white/10 bg-black/60 p-4 text-xs font-mono text-left space-y-2 text-neutral-300">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Application Voucher:</span>
                      <span className="text-white font-bold">{successData.entry.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Account Email:</span>
                      <span className="text-[#CCFF00]">{successData.entry.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Granted Credits:</span>
                      <span className="text-[#CCFF00] font-bold">10,000 Arena Credits</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Cosmetic Honor:</span>
                      <span className="text-amber-400 font-bold">Founder Beast Badge</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Feature Testing:</span>
                      <span className="text-cyan-400 font-bold">Priority Closed Alpha</span>
                    </div>
                  </div>
                )}

                {/* Transactional Email Dispatch Note */}
                <div className="mt-4 p-3 bg-white/5 border border-white/5 text-[11px] text-neutral-400 text-left">
                  {successData.emailStatus?.sent ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Send className="h-3.5 w-3.5" />
                      <span>{successData.emailStatus.message}</span>
                    </div>
                  ) : (
                    <div className="text-neutral-400 space-y-1">
                      <span className="text-neutral-300 font-medium block">Confirmation Dispatch Status:</span>
                      <span>
                        {successData.emailStatus?.message ||
                          'Application safely stored in database. Transactional email triggers automatically once RESEND_API_KEY is configured.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Buttons: Inspect Email & Register Another */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="flex-1 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-bold text-xs uppercase py-3 tracking-wider transition-colors cursor-pointer"
                  >
                    Inspect Confirmation Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuccessData(null)}
                    className="bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase px-5 py-3 tracking-wider border border-white/10 transition-colors cursor-pointer"
                  >
                    Register Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={loading}
                      required
                      aria-label="Email address for waitlist"
                      className="w-full bg-black/60 border border-white/15 py-4 pl-12 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-[#CCFF00] px-8 py-4 font-display text-base font-bold uppercase tracking-wider text-black transition-all hover:bg-[#b8e600] active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-[0_0_25px_rgba(204,255,0,0.25)] whitespace-nowrap shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>Join The Waitlist</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/30 text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Subtext info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 pt-2 gap-2">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>Instant database record · 10,000 Credits locked to voucher</span>
                  </span>
                  {backendStats && (
                    <span className="font-mono text-neutral-300">
                      <strong className="text-white">{backendStats.totalSignups}</strong> verified collectors on waitlist
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Email Preview Inspector Modal */}
      <EmailPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        email={successData?.entry?.email || email || 'candidate@petslam.gg'}
        voucherId={successData?.entry?.id || 'ps_genesis_alpha'}
        resendStatus={successData?.emailStatus}
      />
    </section>
  );
};
