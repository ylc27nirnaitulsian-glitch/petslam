import React, { useState } from 'react';
import {
  X,
  Bug,
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGame } from '../../context/GameContext';
import {
  submitBugReport,
  getClientDiagnostics,
  buildBugMailtoUrl,
  BugReportPayload,
  TARGET_BUG_EMAIL,
} from '../../services/bugReportService';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: BugReportPayload['category'];
}

export const ReportBugModal: React.FC<ReportBugModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'multiplayer',
}) => {
  const { playerTag, trainerName, connectedAccount, activeBeast } = useGame();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BugReportPayload['category']>(defaultCategory);
  const [severity, setSeverity] = useState<BugReportPayload['severity']>('normal');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [contactEmail, setContactEmail] = useState(connectedAccount.email || '');
  const [includeTelemetry, setIncludeTelemetry] = useState(true);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    reportId?: string;
    mailtoUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const diagnostics = getClientDiagnostics({
    playerTag,
    trainerName,
    activeBeast: activeBeast?.name,
    beastLevel: activeBeast?.level,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    sound.playClick();

    const payload: BugReportPayload = {
      title: title.trim(),
      category,
      severity,
      description: description.trim(),
      stepsToReproduce: stepsToReproduce.trim() || undefined,
      playerTag,
      trainerName,
      reporterEmail: contactEmail.trim() || undefined,
      diagnostics: includeTelemetry ? diagnostics : undefined,
    };

    try {
      const res = await submitBugReport(payload);
      sound.playLevelUp();
      setSubmitResult({
        success: res.success,
        message: res.message,
        reportId: res.reportId,
        mailtoUrl: res.mailtoUrl,
      });
    } catch (err: any) {
      sound.playDefeat();
      setSubmitResult({
        success: false,
        message: err.message || 'Failed to submit bug report.',
        mailtoUrl: buildBugMailtoUrl(payload),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitResult(null);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-[#CCFF00]/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(204,255,0,0.3)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950/80 border-b border-white/10 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Raise a Bug Report
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40">
                  Developer Direct
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Dispatches straight to lead developer:{' '}
                <span className="text-[#CCFF00] font-bold">{TARGET_BUG_EMAIL}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-100">
          {submitResult ? (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-white uppercase tracking-wider">
                  Bug Report Received!
                </h4>
                {submitResult.reportId && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[#CCFF00] font-mono text-xs font-bold">
                    ID: {submitResult.reportId}
                  </span>
                )}
                <p className="text-sm font-mono text-neutral-300 mt-2 max-w-md mx-auto">
                  {submitResult.message}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 max-w-md w-full text-xs font-mono text-left space-y-2">
                <div className="text-neutral-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#CCFF00]" />
                  <span>Developer Inbox:</span>
                  <span className="text-white font-bold">{TARGET_BUG_EMAIL}</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Thank you for helping us polish PET SLAM during this early alpha stage! We will investigate and patch this issue promptly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {submitResult.mailtoUrl && (
                  <a
                    href={submitResult.mailtoUrl}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Open in Email App</span>
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  Report Another Issue
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-neutral-200 font-display font-bold text-xs uppercase transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category & Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Bug Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#CCFF00] focus:outline-none transition-colors"
                  >
                    <option value="multiplayer">👥 Friend Requests / Multiplayer</option>
                    <option value="matchmaking">⚔️ Matchmaking & 1v1 / 2v2 Queue</option>
                    <option value="combat">💥 Combat / Arena Battles</option>
                    <option value="graphics">🎨 Graphics / Visual Glitches</option>
                    <option value="audio">🔊 Audio & Sound Effects</option>
                    <option value="account">💾 Account, Save & Progression</option>
                    <option value="other">⚡ Other / General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#CCFF00] focus:outline-none transition-colors"
                  >
                    <option value="low">🟢 Minor / Cosmetic</option>
                    <option value="normal">🟡 Normal / Feature Glitch</option>
                    <option value="high">🟠 High / Feature Broken</option>
                    <option value="critical">🔴 Critical / Game Freezes or Stuck</option>
                  </select>
                </div>
              </div>

              {/* Bug Title */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Bug Title / Short Summary *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Friend request sent but not received on other device"
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors"
                />
              </div>

              {/* Bug Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, what you expected, and any error message you saw..."
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Steps to Reproduce (Optional)
                </label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Open Friends modal -> 2. Enter tag #SLAM-1234 -> 3. Click Send..."
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Contact Email & Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Your Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@domain.com (for follow-up)"
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#CCFF00] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Your Player Identity
                  </label>
                  <div className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>{trainerName || 'Trainer'}</span>
                    <span className="text-[#CCFF00] font-bold">{playerTag}</span>
                  </div>
                </div>
              </div>

              {/* Diagnostics Toggle */}
              <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={includeTelemetry}
                      onChange={(e) => setIncludeTelemetry(e.target.checked)}
                      className="rounded bg-slate-900 border-white/30 text-[#CCFF00] focus:ring-0"
                    />
                    <span className="text-neutral-300">
                      Auto-attach diagnostic telemetry (OS, Browser, Screen resolution)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTelemetryDetails((prev) => !prev)}
                    className="text-xs font-mono text-[#CCFF00] hover:underline flex items-center gap-1"
                  >
                    <span>{showTelemetryDetails ? 'Hide' : 'Preview'}</span>
                    {showTelemetryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showTelemetryDetails && (
                  <pre className="text-[10px] font-mono bg-black/60 text-[#CCFF00] p-2.5 rounded-lg overflow-x-auto max-h-24">
                    {JSON.stringify(diagnostics, null, 2)}
                  </pre>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={buildBugMailtoUrl({
                    title: title || 'Bug Report',
                    category,
                    severity,
                    description: description || 'No description provided',
                    stepsToReproduce,
                    playerTag,
                    trainerName,
                    reporterEmail: contactEmail,
                    diagnostics,
                  })}
                  className="w-full sm:w-auto text-xs font-mono text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors py-2"
                  title="Open draft in your local email app directly"
                >
                  <Mail className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Or dispatch via Mail App</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-display font-bold text-xs uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-display font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-black" />
                        <span>Raise Bug to Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
