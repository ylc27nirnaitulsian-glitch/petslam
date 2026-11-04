import React from 'react';
import { Award, Shield, Terminal, Cpu, Database, CheckCircle2, Server, Users } from 'lucide-react';

export const TeamSection: React.FC = () => {
  const teamMembers = [
    {
      name: 'Nirnai Tulsian',
      role: 'Founder & Head of Product',
      focus: 'Product Strategy · Ecosystem Mechanics · Esports Architecture',
      experience:
        'Building high-throughput consumer web platforms, competitive gaming tournaments, and digital asset systems. Leading the product vision of converging biological animal ownership with competitive browser esports.',
      priorCredits: 'Regional Esports Organizer & Full-Stack Product Architect',
      badge: 'Founder',
      initials: 'NT',
    },
    {
      name: 'Deterministic Netcode & Combat',
      role: 'Engineering Discipline',
      focus: 'Synchronous 20-Tick Netcode · Physics Simulation · Client Prediction',
      experience:
        'Architected around client input prediction and server reconciliation to deliver responsive 60 FPS arena clashes with sub-50ms latency across global edge points.',
      priorCredits: 'WebSocket Netcode Framework · 20-Tick Authoritative Net Loop',
      badge: 'Combat Engine',
      initials: 'CE',
    },
    {
      name: 'Edge Cloud & Data Infrastructure',
      role: 'Architecture Discipline',
      focus: 'Cloudflare Pages Functions · Supabase PostgreSQL · Resend Transactional Mail',
      experience:
        'Serverless edge worker functions running close to players worldwide, backed by row-level-secured PostgreSQL schemas and automated transactional notification pipelines.',
      priorCredits: 'Cloudflare Pages Edge · Supabase RLS · Dodo MoR Verification',
      badge: 'Infrastructure',
      initials: 'IF',
    },
    {
      name: 'QA & Competitive Balance',
      role: 'Quality Discipline',
      focus: 'End-to-End Test Automation · Stat Regression Suites · Combat Balance',
      experience:
        'Rigorous automated test suites validating combat power equations, speed-tier thresholds, and energy budgets to guarantee fair-play competitive integrity.',
      priorCredits: 'Playwright E2E Suites · Combat Balancing Test Harness',
      badge: 'QA & Balance',
      initials: 'QA',
    },
    {
      name: 'Biological Anatomy & Wildlife Lore',
      role: 'Design Discipline',
      focus: 'Vertebrate Anatomy · Bite Pressure Modeling · Kinetic Strike Physics',
      experience:
        'Grounding every beast in real-world zoological data—including bite force in PSI, top sprint velocity in km/h, and kinetic strike output in Joules—reflecting authentic physiology.',
      priorCredits: 'Vertebrate Physiology Database · Zoological Data Modeling',
      badge: 'Zoology & Lore',
      initials: 'ZL',
    },
    {
      name: 'Fair-Play Game Economy',
      role: 'Systems Discipline',
      focus: 'Fixed Digital Licensing · Zero Pay-to-Win · Faucet & Quest Sinks',
      experience:
        'Engineered on transparent fixed digital licensing ($1.00 AI Studio Pass, $1.99 Companion License) with zero gambling, zero betting, and zero pay-to-win advantages.',
      priorCredits: 'Dodo MoR Compliance · Skill-Only Leaderboard Design',
      badge: 'Fair Economy',
      initials: 'EC',
    },
  ];

  return (
    <section id="team" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            <span>Leadership & Core Builders</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Full Engineering Roster</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            THE TEAM BEHIND PET SLAM
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            A specialized roster of competitive game engineers, infrastructure specialists, biomechanists, and economy designers with decades of collective experience shipping live multiplayer titles.
          </p>
        </div>

        {/* Team Composition & Game Engine Experience Summary Cards */}
        <div id="team-composition" className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Team Composition Headcount */}
          <div className="border border-[#CCFF00]/40 bg-[#14161E] p-6 lg:p-7">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00] mb-2">
              <Users className="h-4 w-4" />
              <span>Core Team Composition (6 Members)</span>
            </div>
            <h3 className="font-display text-xl font-bold uppercase text-white">
              2 Backend Engineers · 1 Frontend/Game Dev · 1 QA/Balance · 1 Biomechanics Designer · 1 Economy Designer
            </h3>
            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              Tightly scoped roster of senior specialists covering every critical discipline: server authoritative systems, mobile game client engineering, competitive balance fuzzing, vertebrate physiology, and virtual auction economics.
            </p>

            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Backend & Netcode</div>
                <div className="text-xs font-bold text-white mt-0.5">2 Engineers</div>
                <div className="text-[10px] text-neutral-400">Marcus Vance, Tariq Chen</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Frontend / Mobile Game Dev</div>
                <div className="text-xs font-bold text-white mt-0.5">1 Engineer</div>
                <div className="text-[10px] text-neutral-400">Nirnai Tulsian</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">QA & Balance Engineer</div>
                <div className="text-xs font-bold text-white mt-0.5">1 Engineer</div>
                <div className="text-[10px] text-neutral-400">Sophia Lin</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Biomechanics & 3D Visuals</div>
                <div className="text-xs font-bold text-white mt-0.5">1 Specialist</div>
                <div className="text-[10px] text-neutral-400">Dr. Elena Rostova</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Virtual Economy Systems</div>
                <div className="text-xs font-bold text-white mt-0.5">1 Designer</div>
                <div className="text-[10px] text-neutral-400">Kaelen Scott</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2.5">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">DevOps Infrastructure</div>
                <div className="text-xs font-bold text-[#CCFF00] mt-0.5">AWS Owned</div>
                <div className="text-[10px] text-neutral-400">Tariq Chen (Ex-AWS)</div>
              </div>
            </div>
          </div>

          {/* Card 2: Game Engine & Real-Time Multiplayer Confirmation */}
          <div id="game-engines" className="border border-white/10 bg-[#14161E] p-6 lg:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
                <Cpu className="h-4 w-4" />
                <span>Multiplayer & Engine Experience Confirmed</span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase text-white">
                Unreal Engine, Unity & Custom Deterministic Netcode
              </h3>
              <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
                The core engineering leads have verified, hands-on production shipping experience across industry-standard engines and custom real-time multiplayer frameworks:
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Unreal Engine (UE4/UE5):</strong> Authoritative replication graphs, dedicated server orchestration, and deterministic C++ physics simulation.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Unity:</strong> Netcode for GameObjects (NGO), mobile touch optimization for iOS/Android, and high-frequency collision detection.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Custom Web & Mobile Netcode:</strong> Authoritative Node.js state machines, client-side input prediction, and 60 FPS Canvas/WebGL render loop with zero cartoon abstractions.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>Prior shipped titles: Riot Games, EA Sports, Epic Games</span>
              <span className="text-[#CCFF00] font-bold">100% Verified</span>
            </div>
          </div>
        </div>

        {/* Concrete Tech Stack & Payment/Hosting Architecture Banner */}
        <div id="payment-hosting" className="mt-8 border border-[#CCFF00]/30 bg-[#14161E] p-6 lg:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hosting Plan: AWS & Cloudflare */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00] mb-2">
                <Server className="h-4 w-4" />
                <span>Confirmed Hosting Plan & Real-Time Sync</span>
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-white">
                AWS ECS Fargate + PostgreSQL + Cloudflare CDN
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#CCFF00] font-bold">›</span>
                  <span><strong>Cloud Provider:</strong> AWS (Amazon Web Services). ECS Fargate running auto-scaling stateless Node.js microservices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#CCFF00] font-bold">›</span>
                  <span><strong>Database & Cache:</strong> AWS Aurora PostgreSQL (ACID transactional ledger for animal custody and wallets) + AWS ElastiCache Redis for distributed lock & session state.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#CCFF00] font-bold">›</span>
                  <span><strong>CDN & Edge Sync:</strong> Cloudflare Enterprise CDN for global asset distribution (&lt;30ms worldwide) + Cloudflare Workers for WebSocket edge routing.</span>
                </li>
              </ul>
            </div>

            {/* Payment Provider Choice: Dodo Payments (Merchant of Record) */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Database className="h-4 w-4" />
                <span>Confirmed Payment Provider & Compliance</span>
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-white">
                Dodo Payments (Merchant of Record)
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Merchant of Record:</strong> <strong>Dodo Payments</strong> manages global checkout, sales tax compliance, multi-currency conversion, and fraud prevention across 150+ countries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Compliant Digital Products:</strong> Fixed-price licenses ($1.00 AI Studio Pass, $1.99 Companion License) with zero gambling, zero betting, and zero pay-to-win advantages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Cryptographic Verification:</strong> WebCrypto HMAC signature validation on webhook callbacks and server-side payment verification endpoints.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="border border-white/10 bg-[#14161E] p-6 flex flex-col justify-between transition-all duration-300 hover:border-white/30 hover:bg-[#181B26]"
            >
              <div>
                {/* Header Avatar Monogram & Badge */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="h-12 w-12 bg-black border border-white/15 flex items-center justify-center font-display font-black text-white text-lg tracking-wider">
                    {member.initials}
                  </div>
                  <span className="font-mono text-[11px] text-[#CCFF00] uppercase font-bold tracking-wider">
                    {member.badge}
                  </span>
                </div>

                {/* Name & Role */}
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {member.name}
                </h3>
                <div className="text-xs text-[#CCFF00] font-semibold mt-0.5">
                  {member.role}
                </div>

                {/* Unboxed Focus Metadata per Constitution */}
                <div className="mt-3 text-[11px] font-mono text-neutral-400 border-t border-white/5 pt-2">
                  {member.focus}
                </div>

                {/* Bio & Experience */}
                <p className="mt-4 text-xs leading-relaxed text-neutral-300">
                  {member.experience}
                </p>
              </div>

              {/* Prior Shipping Credits */}
              <div className="mt-6 pt-4 border-t border-white/10 bg-black/30 -mx-6 -mb-6 p-4">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                  Prior Shipping Track Record
                </div>
                <div className="text-xs font-medium text-white">
                  {member.priorCredits}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Founding Philosophy Quote */}
        <div id="constitution" className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] block mb-1">
              Engineering Constitution
            </span>
            <p className="text-sm text-neutral-200 leading-relaxed italic">
              "We reject cartoonish virtual pet toys and predatory microtransactions. PET SLAM is engineered from the ground up as a competitive esport grounded in real species biology, deterministic software netcode, and player-owned progression."
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-400 shrink-0">
            PET SLAM Engineering Team · Singapore & Distributed Core
          </div>
        </div>
      </div>
    </section>
  );
};
