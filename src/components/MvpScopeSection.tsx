import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Users,
  Target,
  Sparkles,
  Laptop,
  MessageSquare,
  Gamepad2,
  Award,
  Zap,
  TrendingUp,
  BarChart3,
  Flame,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface MvpScopeSectionProps {
  onJoinWaitlist: () => void;
}

export const MvpScopeSection: React.FC<MvpScopeSectionProps> = ({ onJoinWaitlist }) => {
  const [activeWeekTab, setActiveWeekTab] = useState<'all' | 'w1-2' | 'w3-4' | 'w5-6' | 'w7-8'>('all');

  const week8Features = [
    {
      title: 'Animal Marketplace UI & Genesis Minting',
      category: 'Core Economy',
      detail: 'Browse authenticated biological dossiers, filter by species, and acquire initial digital beasts with allocated starter credits.',
      status: 'Genesis Launch (Week 8)',
      icon: Sparkles,
    },
    {
      title: 'Single-Player Training & Evolution Engine',
      category: 'Progression Mechanics',
      detail: 'Condition digital beasts through daily caloric feeding plans, stamina sprint drills, agility courses, and attribute leveling from Level 1 to 10.',
      status: 'Genesis Launch (Week 8)',
      icon: Zap,
    },
    {
      title: 'Personal Stable & Roster Inventory',
      category: 'Asset Custody',
      detail: 'Manage multi-beast kennels, inspect live biometric stat matrices, and configure custom signature loadouts.',
      status: 'Genesis Launch (Week 8)',
      icon: ShieldCheck,
    },
    {
      title: 'Combat Stance Sandbox & Stat Auditing',
      category: 'Combat Simulator',
      detail: 'Local offline attribute clashing sandbox to stress-test speed, bite force, and endurance curves prior to ranked multiplayer.',
      status: 'Genesis Launch (Week 8)',
      icon: Gamepad2,
    },
  ];

  const postLaunchFeatures = [
    {
      title: 'Real-Time PvP Arena Multiplayer',
      category: 'Competitive Circuit',
      target: 'Week 14 (Season 01 Kickoff)',
      detail: 'Synchronous netcode matchmaking, referee round scoring, and active combat stance duels against global competitors.',
      rationale: 'Deferred to allow player base to train and condition their starter beasts to competitive baseline levels, and complete netcode load stress tests.',
    },
    {
      title: 'Live Weekly Player Auctions',
      category: 'Player Marketplace',
      target: 'Week 16 (Secondary Exchange)',
      detail: 'Consensus-backed credit bidding for high-tier trained beasts between authenticated trainers.',
      rationale: 'Requires sufficient active trained beasts in circulation to establish balanced liquidity and fair market pricing.',
    },
    {
      title: 'Sanctioned Global Esports Leaderboard',
      category: 'Esports Rankings',
      target: 'Week 14 (Launches with PvP)',
      detail: 'Weekly, Monthly, and All-Time championship divisions with seasonal rating points and cosmetic rewards.',
      rationale: 'Calibrated specifically to ranked PvP bout outcomes; cannot activate without live matchmaking.',
    },
    {
      title: 'IRL Proximity Radar Matchmaking',
      category: 'Location Mechanics',
      target: 'Post-Launch Phase 2',
      detail: 'Opt-in fuzzy geographic radar to discover nearby trainers, issue mutual challenges, and trigger physical meetups.',
      rationale: 'Requires extensive privacy audits, location fuzzing compliance, and regional density testing. Not required for core MVP software loop to function.',
    },
  ];

  const targetCommunities = [
    {
      name: 'Smogon VGC Discord & Forums',
      channel: 'Discord & Forum Strategy Hubs',
      scale: '~120k Active Members',
      profile: 'Competitive creature collection, EV/IV min-maxers, and turn-based battle strategists.',
      outreachAngle: 'Demonstrate deep biological stat calculations, breed-accurate bite pressure, and tactical stance preparation.',
      tag: 'Primary Seed Target',
    },
    {
      name: 'Teamfight Tactics (TFT) Competitive',
      channel: 'Discord Strategy & Theorycrafting',
      scale: '~85k Active Members',
      profile: 'Auto-battler aficionados, positioning perfectionists, and meta analysts.',
      outreachAngle: 'Highlight training conditioning, synergy between agility and endurance, and zero-RNG combat sandbox tests.',
      tag: 'Secondary Seed Target',
    },
    {
      name: 'Auto-Chess & Tactical Battlers Hub',
      channel: 'Discord Communities',
      scale: '~60k Active Members',
      profile: 'Enthusiasts of deterministic auto-combat, roster preparation, and strategic pacing.',
      outreachAngle: 'Present deterministic combat telemetry logs and real-time attribute clashing without cartoon abstractions.',
      tag: 'Tactical Audience',
    },
    {
      name: 'r/CompetitiveGaming & r/webgaming',
      channel: 'Targeted Reddit Discussions',
      scale: '~350k Subscribers',
      profile: 'Discerning esports purists and early-adopter browser game enthusiasts seeking fresh competitive loops.',
      outreachAngle: 'Publish transparent devlogs, architectural blueprints, and interactive playable browser alpha access.',
      tag: 'Broad Esports Seed',
    },
  ];

  const outreachPhases = [
    {
      id: 'w1-2',
      phase: 'Weeks 1–2',
      title: 'Community Seeding & Dev Logs',
      focus: 'Seeding Credibility in Target Discord Channels',
      color: 'text-[#CCFF00]',
      borderColor: 'border-[#CCFF00]/40',
      bgColor: 'bg-[#CCFF00]/5',
      bullets: [
        'Initiate direct dialogue with server moderators and theorycrafters in Smogon VGC and TFT Competitive Discords.',
        'Release raw, unedited gameplay clips demonstrating authentic canine/wildlife bite-force physics and sprint acceleration mechanics.',
        'Distribute 250 exclusive VIP Alpha Testing Vouchers granting early Founder insignia to trusted community leaders.',
      ],
      funnelState: '250 Community Influencers Engaged',
    },
    {
      id: 'w3-4',
      phase: 'Weeks 3–4',
      title: 'Free Playable Alpha Access Giveaways',
      focus: 'First-Customer Path: Free Playable Alpha First',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-400/40',
      bgColor: 'bg-cyan-400/5',
      bullets: [
        'Open 100% free single-player training and local combat sandbox access to the first 1,500 testers from the 4 named communities.',
        'Zero upfront paywall: establish player retention and prove the core training loop before any monetisation triggers.',
        'Host community conditioning leaderboards scoring the highest training conditioning gains on starter Grey Wolves and German Shepherds.',
      ],
      funnelState: '1,500 Active Community Playtesters',
    },
    {
      id: 'w5-6',
      phase: 'Weeks 5–6',
      title: 'Genesis Founder Cosmetic Pack Pre-Orders',
      focus: 'Monetisation Trigger: $19.99 Cosmetic Vanity Packs',
      color: 'text-amber-400',
      borderColor: 'border-amber-400/40',
      bgColor: 'bg-amber-400/5',
      bullets: [
        'Introduce the Genesis Founder Cosmetic Pack ($19.99 / 2,500 credits): dark-carbon tactical harness skins, gilded coat crests, and custom stable livery.',
        'Strict zero pay-to-win pledge: cosmetics offer exactly 0% stat advantage, maintaining absolute competitive purity.',
        'Offer early-bird reservation to active alpha participants with an exclusive founder livery crest for their personal stable.',
      ],
      funnelState: '250 Pre-Order Commitments ($5k)',
    },
    {
      id: 'w7-8',
      phase: 'Weeks 7–8',
      title: 'Genesis Deployment & Milestone Target',
      focus: 'Week 8 Genesis Launch: 500 Paying Users / $10k Revenue',
      color: 'text-[#CCFF00]',
      borderColor: 'border-[#CCFF00]',
      bgColor: 'bg-[#CCFF00]/10',
      bullets: [
        'Deploy the full Week 8 Genesis Build: Marketplace UI, single-player training routines, and personal kennel custody.',
        'Expand active registered player base to 5,000 alpha trainers across the 4 partner communities.',
        'Commercial Conversion Target: Convert 10% of active players into 500 paying Founder pack adopters ($10,000 gross revenue).',
      ],
      funnelState: '5,000 Users · 500 Paying Customers ($10k)',
    },
  ];

  return (
    <section id="mvp-scope" className="relative border-b border-white/5 bg-[#0B0C10] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            <span>Production Timeline & Scope Definition</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Engineering Cadence</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            MVP SCOPE: WEEK 8 LAUNCH VS. ROADMAP
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            We prioritize rock-solid mechanical integrity over bloated launches. Our Week 8 Genesis Release focuses exclusively on core digital animal ownership, single-player training, and the marketplace UI, with real-time PvP combat arriving in Season 1 once players have seasoned their champions.
          </p>
        </div>

        {/* 100% Digital Experience Confirmation Banner */}
        <div className="mt-10 border border-[#CCFF00]/40 bg-[#CCFF00]/5 p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="p-2.5 bg-[#CCFF00] text-black shrink-0">
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                <span>100% Software Value Delivery Confirmation</span>
              </div>
              <h3 className="mt-1 font-display text-xl font-bold uppercase text-white">
                Digital-Only Software Loop · Zero Physical Animal Involvement
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                The Week 8 MVP delivers core player value <strong>entirely through digital software</strong>: digital animal ownership, virtual nutritional conditioning, and simulated attribute clashing. There is <strong>no physical animal custody, no live veterinary dependency, and no real-world meetup required</strong>.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#CCFF00]">
                <Check className="h-4 w-4" />
                <span>IRL Mode is explicitly a deferred post-launch feature and is NOT required for the Week 8 MVP to function.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prioritized MVP Features by Phase (Weeks 1 to 8) */}
        <div id="phased-roadmap" className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                <Layers className="h-4 w-4" />
                <span>MVP Features in Priority Order · Estimated Weeks Per Phase</span>
              </div>
              <h3 className="mt-1 font-display text-2xl font-black uppercase text-white">
                4-Phase Engineering Sprint (Weeks 1–8)
              </h3>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Weekly Cadence: Strict Definition of Done
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Phase 1 */}
            <div className="border border-[#CCFF00]/40 bg-[#161822] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-[#CCFF00] text-black font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    Priority 1
                  </span>
                  <span className="font-mono text-xs text-[#CCFF00] font-bold">
                    Weeks 1–3
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold uppercase text-white leading-tight">
                  Phase 1: Auth, Roster & 1v1 Combat Engine
                </h4>
                <div className="text-[11px] font-mono text-neutral-400 mt-1 mb-3">
                  Core Tactical Foundation
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#CCFF00] font-bold">›</span>
                    <span>Guest & trainer profile authentication state</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#CCFF00] font-bold">›</span>
                    <span>Digital beast roster with biological dossiers</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#CCFF00] font-bold">›</span>
                    <span>Playable 1v1 real-time combat engine (strikes, ability, ultimate, active guard & dodge)</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#CCFF00]">
                Status: Complete & Interactive
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border border-cyan-400/30 bg-[#161822] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-cyan-400 text-black font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    Priority 2
                  </span>
                  <span className="font-mono text-xs text-cyan-400 font-bold">
                    Weeks 4–5
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold uppercase text-white leading-tight">
                  Phase 2: Training Gym & Conditioning Engine
                </h4>
                <div className="text-[11px] font-mono text-neutral-400 mt-1 mb-3">
                  Daily Player Retention Loop
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span>Single-player conditioning routines (caloric nutrition, endurance drills)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span>Stat leveling progression (Strength, Speed, Bite Force, Agility)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">›</span>
                    <span>Multi-beast personal kennel custody</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-cyan-400">
                Status: Operational in Sandbox
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border border-amber-400/30 bg-[#161822] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-amber-400 text-black font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    Priority 3
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    Weeks 6–7
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold uppercase text-white leading-tight">
                  Phase 3: Marketplace UI & Tactical Armory
                </h4>
                <div className="text-[11px] font-mono text-neutral-400 mt-1 mb-3">
                  Digital Asset Economy
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">›</span>
                    <span>Direct biological marketplace UI with species filtering</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">›</span>
                    <span>Tactical armory with 4 equipment slots (Collar, Armor, Paws, Serum)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">›</span>
                    <span>Wallet & starter credit distribution (10k credits grant)</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-amber-400">
                Status: Integrated with UI
              </div>
            </div>

            {/* Phase 4 */}
            <div className="border border-purple-400/30 bg-[#161822] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-purple-400 text-black font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    Priority 4
                  </span>
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    Week 8
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold uppercase text-white leading-tight">
                  Phase 4: Genesis Launch & Monetisation
                </h4>
                <div className="text-[11px] font-mono text-neutral-400 mt-1 mb-3">
                  Go-To-Market Trigger
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">›</span>
                    <span>Genesis Founder Cosmetic Pack launch ($19.99 / 2,500 credits, non-P2W)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">›</span>
                    <span>Combat sandbox stress testing & client reconciliation auditing</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">›</span>
                    <span>Esports outreach target: 500 paying users / $10k initial revenue</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-purple-400">
                Status: Genesis Target Milestones
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Comparison Layout: Week 8 vs Post-Launch */}
        <div id="deferred-features" className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Column 1: Week 8 Genesis MVP (In-Scope) */}
          <div className="border border-[#CCFF00]/30 bg-[#12141A] p-6 lg:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                  <Calendar className="h-4 w-4" />
                  <span>Phase 01 · Week 8 Genesis Launch</span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-black uppercase text-white">
                  Genesis Core MVP (In Scope)
                </h3>
              </div>
              <span className="bg-[#CCFF00] text-black font-display font-bold text-xs uppercase px-3 py-1 tracking-wider">
                Active Sprint
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Everything required to acquire, house, feed, and condition your first beast. Every player receives their 10,000 starter credits on day one.
            </p>

            <div className="space-y-4">
              {week8Features.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="border border-white/5 bg-[#161822] p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-display text-base font-bold uppercase text-white flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-[#CCFF00]" />
                        <span>{item.title}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#CCFF00] font-semibold shrink-0">
                        Week 8
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                      {item.category}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Check className="h-4 w-4 text-[#CCFF00]" />
                <span>Single-player training + marketplace UI active in Week 8</span>
              </span>
            </div>
          </div>

          {/* Column 2: Deferred Features (Post-Launch Roadmap) */}
          <div className="border border-white/10 bg-[#12141A] p-6 lg:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Phase 02 & Beyond · Competitive Rollout</span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-black uppercase text-white">
                  Deferred Post-Launch Roadmap
                </h3>
              </div>
              <span className="bg-white/10 text-neutral-300 font-display font-bold text-xs uppercase px-3 py-1 tracking-wider border border-white/10">
                Post-Launch
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Features intentionally held for subsequent rollout to safeguard competitive balance, network latency, and economy liquidity.
            </p>

            <div className="space-y-4">
              {postLaunchFeatures.map((item, index) => (
                <div key={index} className="border border-white/5 bg-[#161822] p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-display text-base font-bold uppercase text-white">
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] text-amber-400 font-semibold shrink-0">
                      {item.target}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                    {item.category}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {item.detail}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400 italic">
                    Why deferred: {item.rationale}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span className="text-neutral-400">
                All roadmap updates tested with priority Alpha waitlist cohorts first.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: Dedicated Go-To-Market & 8-Week Outreach Sequence */}
        <div id="gtm-sequence" className="mt-16 border border-[#CCFF00]/30 bg-[#12141A] p-6 lg:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                <TrendingUp className="h-4 w-4" />
                <span>Go-To-Market & Commercial Strategy</span>
              </div>
              <h3 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase text-white">
                8-WEEK AUDIENCE ACQUISITION & MONETISATION ROADMAP
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
                A concrete, phased outreach plan designed to acquire our first 5,000 players and 500 paying customers ($10,000 revenue) by partnering directly with established competitive gaming hubs.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-neutral-400">First-Customer Path:</span>
              <span className="bg-[#CCFF00] text-black font-mono font-bold text-xs uppercase px-3 py-1">
                Free Alpha First → Cosmetics
              </span>
            </div>
          </div>

          {/* First Customer Path Rationale Banner */}
          <div className="border border-white/10 bg-black/40 p-5 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#CCFF00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-display text-sm font-bold uppercase tracking-wide text-white block">
                    Strategic First-Customer Execution: Free Playable Alpha Before Any Monetisation
                  </span>
                  <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                    Competitive esports players reject games that demand upfront payment without proven mechanics. We launch a <strong>100% free playable single-player alpha</strong> to competitive Discord communities in Weeks 3–4. Once players experience the biological training depth and gameplay loop, we introduce <strong>optional Genesis Founder cosmetic packs ($19.99)</strong> with zero stat advantages in Weeks 5–8.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Named Target Communities Grid */}
          <div id="target-communities" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                <MessageSquare className="h-4 w-4 text-[#CCFF00]" />
                <span>4 Primary Target Communities (Week 1–2 Channel Outreach)</span>
              </div>
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                Audience: ~615,000 Total Reach
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {targetCommunities.map((comm, idx) => (
                <div
                  key={idx}
                  className="border border-white/10 bg-[#161822] p-5 flex flex-col justify-between hover:border-[#CCFF00]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#CCFF00] font-bold">
                        {comm.tag}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {comm.scale}
                      </span>
                    </div>

                    <h4 className="font-display text-lg font-bold uppercase text-white leading-tight">
                      {comm.name}
                    </h4>
                    <div className="text-[11px] font-mono text-neutral-400 mb-2">
                      {comm.channel}
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                      {comm.profile}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400">
                    <strong className="text-neutral-200">Angle:</strong> {comm.outreachAngle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8-Week Sequential Timeline Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                <Calendar className="h-4 w-4 text-[#CCFF00]" />
                <span>Concrete 8-Week Timeline & Outreach Milestones</span>
              </div>
              <div className="flex items-center gap-1">
                {(['all', 'w1-2', 'w3-4', 'w5-6', 'w7-8'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveWeekTab(tab)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold uppercase transition-colors cursor-pointer ${
                      activeWeekTab === tab
                        ? 'bg-[#CCFF00] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab === 'all' ? 'View All' : tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {outreachPhases
                .filter((phase) => activeWeekTab === 'all' || activeWeekTab === phase.id)
                .map((phase) => (
                  <div
                    key={phase.id}
                    className={`border ${phase.borderColor} ${phase.bgColor} p-5 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${phase.color}`}>
                          {phase.phase}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          Milestone
                        </span>
                      </div>

                      <h4 className="font-display text-lg font-black uppercase text-white leading-tight mb-1">
                        {phase.title}
                      </h4>

                      <div className="text-[11px] font-mono text-neutral-400 mb-3 pb-2 border-b border-white/10">
                        {phase.focus}
                      </div>

                      <ul className="space-y-2 mb-4">
                        {phase.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-neutral-300 leading-relaxed flex items-start gap-1.5">
                            <span className={`${phase.color} font-bold`}>›</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">
                        Target Funnel Stage
                      </div>
                      <div className="font-mono text-xs font-bold text-white">
                        {phase.funnelState}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Conversion Funnel & Commercial Economics Summary */}
          <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-white/5 bg-[#161822] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-white mb-2">
                <Users className="h-4 w-4 text-[#CCFF00]" />
                <span>1. Community Top-of-Funnel</span>
              </div>
              <div className="font-display text-2xl font-black text-white mb-1">
                5,000 Alpha Signups
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Generated across Smogon VGC, TFT Competitive, Auto-Chess hubs, and <code>r/CompetitiveGaming</code> via free playable alpha access.
              </p>
            </div>

            <div className="border border-white/5 bg-[#161822] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-white mb-2">
                <Flame className="h-4 w-4 text-cyan-400" />
                <span>2. Active Conditioning Cohort</span>
              </div>
              <div className="font-display text-2xl font-black text-cyan-400 mb-1">
                1,500 Active Weekly Trainers
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Engaged daily in single-player feeding, agility sprint drills, and local sandbox stat clashing with starter beasts.
              </p>
            </div>

            <div className="border border-white/5 bg-[#161822] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-white mb-2">
                <DollarSign className="h-4 w-4 text-[#CCFF00]" />
                <span>3. Week 8 Commercial Target</span>
              </div>
              <div className="font-display text-2xl font-black text-[#CCFF00] mb-1">
                500 Paying Users · $10,000
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                10% conversion of engaged players purchasing the $19.99 Genesis Founder Cosmetic Pack. Strictly zero pay-to-win mechanics.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Strip */}
        <div className="mt-12 border border-white/10 bg-[#14161E] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-display text-lg font-bold uppercase text-white block">
              Want priority testing access to the Week 8 Genesis Build?
            </span>
            <span className="text-xs text-neutral-400">
              Join the waitlist to receive your guaranteed 10,000 credits voucher and Wave 1 free alpha access.
            </span>
          </div>

          <button
            onClick={onJoinWaitlist}
            className="inline-flex items-center justify-center gap-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black px-6 py-3 font-display font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <span>Lock In Week 8 Alpha Access</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
