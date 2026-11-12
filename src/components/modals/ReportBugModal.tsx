import React, { useState } from 'react';
import {
  X,
  Bug,
  Send,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { triggerSuccessHaptic } from '../../utils/haptics';
import {
  TARGET_BUG_EMAIL,
  getClientDiagnostics,
  submitBugReport,
  buildBugMailtoUrl,
} from '../../services/bugReportService';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?:
    | 'multiplayer'
    | 'matchmaking'
    | 'combat'
    | 'graphics'
    | 'audio'
    | 'account'
    | 'other';
}

export const ReportBugModal: React.FC<ReportBugModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'multiplayer',
}) => {
  const { trainerName, playerTag } = useGame();

  const [category, setCategory] = useState<
    'multiplayer' | 'matchmaking' | 'combat' | 'graphics' | 'audio' | 'account' | 'other'
  >(defaultCategory);
  const [severity, setSeverity] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [contactEmail, setContactEmail] = useState('');
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

  const diagnostics = getClientDiagnostics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    sound.playClick();
    setIsSubmitting(true);

    try {
      const result = await submitBugReport({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim(),
        playerTag,
        trainerName,
        reporterEmail: contactEmail.trim(),
        diagnostics: includeTelemetry ? diagnostics : undefined,
      });

      setSubmitResult(result);
      if (result.success) {
        sound.playVictory();
        triggerSuccessHaptic();
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.message || 'Failed to submit bug report. You can still email directly.',
        mailtoUrl: buildBugMailtoUrl({
          title,
          category,
          severity,
          description,
          stepsToReproduce,
          playerTag,
          trainerName,
          reporterEmail: contactEmail,
          diagnostics,
        }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#151C28] border border-[#2A364F] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B0F17] border-b border-[#2A364F] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E2738] border border-[#2A364F] flex items-center justify-center text-[#F59E0B] shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-[#F8FAFC] uppercase tracking-wider">
                  Raise a Bug Report
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40">
                  Developer Direct
                </span>
              </div>
              <p className="text-xs font-mono text-[#CBD5E1]">
                Dispatches straight to lead developer:{' '}
                <span className="text-[#F59E0B] font-bold">{TARGET_BUG_EMAIL}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E2738] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[#F8FAFC]">
          {submitResult ? (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-[#10B981]/20 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] text-3xl shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-[#F8FAFC] uppercase tracking-wider">
                  Bug Report Received!
                </h4>
                {submitResult.reportId && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#1E2738] text-[#F59E0B] border border-[#2A364F] font-mono text-xs font-bold">
                    ID: {submitResult.reportId}
                  </span>
                )}
                <p className="text-sm font-mono text-[#CBD5E1] mt-2 max-w-md mx-auto">
                  {submitResult.message}
                </p>
              </div>

              <div className="bg-[#0B0F17] border border-[#2A364F] rounded-2xl p-4 max-w-md w-full text-xs font-mono text-left space-y-2">
                <div className="text-[#CBD5E1] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#F59E0B]" />
                  <span>Developer Inbox:</span>
                  <span className="text-[#F8FAFC] font-bold">{TARGET_BUG_EMAIL}</span>
                </div>
                <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                  Thank you for helping us polish PET SLAM during this early alpha stage! We will investigate and patch this issue promptly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {submitResult.mailtoUrl && (
                  <a
                    href={submitResult.mailtoUrl}
                    className="px-4 py-2.5 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#F8FAFC] font-display font-bold text-xs uppercase flex items-center gap-2 border border-[#2A364F] transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Open in Email App</span>
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-display font-black text-xs uppercase transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  Report Another Issue
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] border border-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] font-display font-bold text-xs uppercase transition-all cursor-pointer"
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
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Bug Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:border-[#F59E0B] focus:outline-hidden transition-colors"
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
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:border-[#F59E0B] focus:outline-hidden transition-colors"
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
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                  Bug Title / Short Summary *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Friend request sent but not received on other device"
                  className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-slate-500 focus:border-[#F59E0B] focus:outline-hidden transition-colors"
                />
              </div>

              {/* Bug Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, what you expected, and any error message you saw..."
                  className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-slate-500 focus:border-[#F59E0B] focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                  Steps to Reproduce (Optional)
                </label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Open Friends modal -> 2. Enter tag #SLAM-1234 -> 3. Click Send..."
                  className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-slate-500 focus:border-[#F59E0B] focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Contact Email & Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Your Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@domain.com (for follow-up)"
                    className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] placeholder-slate-500 focus:border-[#F59E0B] focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Your Player Identity
                  </label>
                  <div className="bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3 py-2 text-xs font-mono text-[#CBD5E1] flex items-center justify-between">
                    <span>{trainerName || 'Trainer'}</span>
                    <span className="text-[#F59E0B] font-bold">{playerTag}</span>
                  </div>
                </div>
              </div>

              {/* Diagnostics Toggle */}
              <div className="bg-[#0B0F17] border border-[#2A364F] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={includeTelemetry}
                      onChange={(e) => setIncludeTelemetry(e.target.checked)}
                      className="rounded bg-[#1E2738] border-[#2A364F] text-[#F59E0B] focus:ring-0"
                    />
                    <span className="text-[#CBD5E1]">
                      Auto-attach diagnostic telemetry (OS, Browser, Screen resolution)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTelemetryDetails((prev) => !prev)}
                    className="text-xs font-mono text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showTelemetryDetails ? 'Hide' : 'Preview'}</span>
                    {showTelemetryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showTelemetryDetails && (
                  <pre className="text-[10px] font-mono bg-[#151C28] text-[#F59E0B] border border-[#2A364F] p-2.5 rounded-lg overflow-x-auto max-h-24">
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
                  className="w-full sm:w-auto text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors py-2"
                  title="Open draft in your local email app directly"
                >
                  <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Or dispatch via Mail App</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#2A364F] font-display font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-[#1E2738] disabled:text-[#94A3B8] text-[#0B0F17] font-display font-black text-xs uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0B0F17] border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#0B0F17]" />
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
