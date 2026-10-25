import React from 'react';
import {
  ArrowLeft,
  FileCode,
  Server,
  Users,
  ShieldAlert,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  Terminal,
  ExternalLink,
  Cpu,
  Calendar,
} from 'lucide-react';
import { MvpScopeSection } from './MvpScopeSection';
import { TeamSection } from './TeamSection';

interface SystemRequiredDetailsPageProps {
  onBackToLanding: () => void;
  onJoinWaitlist: () => void;
}

export const SystemRequiredDetailsPage: React.FC<SystemRequiredDetailsPageProps> = ({
  onBackToLanding,
  onJoinWaitlist,
}) => {
  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-neutral-100 flex flex-col">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="sticky top-[69px] z-40 border-b border-white/10 bg-[#0F1117]/95 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="group inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-[#CCFF00] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Main Game</span>
            </button>
            <span className="text-neutral-600 hidden sm:inline" aria-hidden="true">/</span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#CCFF00] font-semibold uppercase">
              <FileCode className="h-3.5 w-3.5" />
              <span>System Required Details</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onJoinWaitlist}
              className="bg-[#CCFF00] text-black font-display text-xs font-bold uppercase px-3.5 py-1.5 hover:bg-[#b8e600] transition-colors tracking-wider shrink-0 cursor-pointer"
            >
              Join Alpha Queue
            </button>
          </div>
        </div>
      </div>

      {/* Page Title & Overview Hero */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#141622] via-[#0E1017] to-[#0B0C10] px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#CCFF00] mb-3">
            <Terminal className="h-4 w-4" />
            <span>Architecture, Scope & Constitution</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Production Specification</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl">
            SYSTEM REQUIRED DETAILS
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-3xl leading-relaxed">
            Comprehensive production documentation detailing the Week 8 Genesis MVP scope, software-only operational loop, 8-week go-to-market outreach sequence, named esports target communities, production tech stack (Node.js + PostgreSQL on AWS ECS), full engineering roster, and engineering constitution.
          </p>

          {/* Quick Sub-Navigation Anchor Chips */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
              Direct Specification Sections:
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => scrollToAnchor('phased-roadmap')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-[#CCFF00]" />
                <span>Prioritized MVP Phases (1–4)</span>
              </button>
              <button
                onClick={() => scrollToAnchor('deferred-features')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>Post-Launch Deferrals & Rationales</span>
              </button>
              <button
                onClick={() => scrollToAnchor('gtm-sequence')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <span>8-Week Go-To-Market Sequence</span>
              </button>
              <button
                onClick={() => scrollToAnchor('target-communities')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Target className="h-3.5 w-3.5 text-amber-400" />
                <span>4 Target Esports Communities</span>
              </button>
              <button
                onClick={() => scrollToAnchor('team-composition')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-purple-400" />
                <span>Team Composition (6 Members)</span>
              </button>
              <button
                onClick={() => scrollToAnchor('game-engines')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Engine Experience (Unreal, Unity, Custom)</span>
              </button>
              <button
                onClick={() => scrollToAnchor('payment-hosting')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Server className="h-3.5 w-3.5 text-[#CCFF00]" />
                <span>Payment (Stripe/RevenueCat) & AWS Hosting</span>
              </button>
              <button
                onClick={() => scrollToAnchor('constitution')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#CCFF00]/50 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-[#CCFF00]" />
                <span>Engineering Constitution</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: MvpScopeSection + TeamSection */}
      <div className="flex-1">
        {/* 1. Complete MVP Scope, 8-Week GTM, Target Communities, Software Loop */}
        <MvpScopeSection onJoinWaitlist={onJoinWaitlist} />

        {/* 2. Concrete Tech Stack, Engineering Roster & Engineering Constitution */}
        <TeamSection />

        {/* Page Footer Navigation Callout */}
        <div className="border-t border-white/10 bg-[#0E1017] py-14 px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#CCFF00] font-bold mb-2">
              System Specification Complete
            </div>
            <h3 className="font-display text-3xl font-black uppercase text-white">
              READY TO EXPLORE THE ARENA?
            </h3>
            <p className="mt-3 text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Return to the main PET SLAM portal to test interactive marketplace previews, review animal biological dossiers, and reserve your Genesis priority waitlist slot.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onBackToLanding}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-display text-sm font-bold uppercase px-6 py-3 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Main Landing Page</span>
              </button>
              <button
                onClick={onJoinWaitlist}
                className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-display text-sm font-bold uppercase px-6 py-3 hover:bg-[#b8e600] transition-colors cursor-pointer"
              >
                <span>Join The Genesis Waitlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
