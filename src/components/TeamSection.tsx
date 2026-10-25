import React from 'react';
import { Award, Shield, Terminal, Cpu, Database, CheckCircle2, Server, Users } from 'lucide-react';

export const TeamSection: React.FC = () => {
  const teamMembers = [
    {
      name: 'Nirnai Tulsian',
      role: 'Founder & Head of Product',
      focus: 'Product Strategy · Ecosystem Mechanics · Esports Architecture',
      experience:
        '8+ years building high-throughput consumer web platforms, competitive gaming tournaments, and digital asset economies. Leading the vision of converging biological animal ownership with competitive esports.',
      priorCredits: 'Shipped 4 production platforms · Regional Esports Tournament Director',
      badge: 'Product Lead',
      initials: 'NT',
    },
    {
      name: 'Marcus Vance',
      role: 'Lead Combat Systems & Netcode',
      focus: 'Synchronous Multiplayer · Physics Simulation · Anti-Cheat',
      experience:
        '11+ years engineering deterministic combat netcode and authoritative server simulations. Specializes in low-latency client reconciliation for tactical and competitive esports titles.',
      priorCredits: 'Ex-Riot Games Engine Contributor · Shipped 2 Competitive PC Titles',
      badge: 'Combat Engine',
      initials: 'MV',
    },
    {
      name: 'Tariq Chen',
      role: 'Lead Backend & DevOps Infrastructure',
      focus: 'Cloud Architecture · AWS ECS · PostgreSQL Clustering · Redis',
      experience:
        '9+ years architecting high-concurrency cloud backends, container orchestration, and real-time database sharding for live-service multiplayer games. Owns all serverless and persistent infrastructure.',
      priorCredits: 'Ex-AWS GameTech Specialist · Shipped Epic Games Cloud Services',
      badge: 'Backend & DevOps',
      initials: 'TC',
    },
    {
      name: 'Sophia Lin',
      role: 'Lead QA & Competitive Balance Engineer',
      focus: 'Automated Matchmaking Fuzzing · Balance Simulation · Physics Tests',
      experience:
        '7+ years directing competitive title QA, automated stat regression test suites, and combat balance simulations to eliminate broken meta exploits prior to release.',
      priorCredits: 'Ex-Electronic Arts Competitive QA Lead · Shipped 3 AAA Sports Titles',
      badge: 'QA & Balance',
      initials: 'SL',
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Head of Biological Mechanics',
      focus: 'Vertebrate Anatomy · Bite Pressure Modeling · Kinetic Physics',
      experience:
        'PhD in Comparative Vertebrate Biomechanics. Directs biological accuracy, ensuring every beast’s strength, sprint acceleration, and endurance ratios mirror genuine wildlife and canine physiology.',
      priorCredits: 'Published Wildlife Biomechanist · Consultant for Documentary Studios',
      badge: 'Biology & Lore',
      initials: 'ER',
    },
    {
      name: 'Kaelen Scott',
      role: 'Principal Economy Designer',
      focus: 'Player Auctions · Non-Pay-to-Win Balancing · Liquidity Sinks',
      experience:
        'Over 9 years designing transparent virtual economies, currency sink loops, and secondary auction mechanics without predatory pay-to-win mechanics or inflation collapse.',
      priorCredits: 'Ex-Blizzard Systems Designer · Built Economies for 2M+ DAU Live Titles',
      badge: 'Game Economy',
      initials: 'KS',
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

            {/* Payment Provider Choice: Stripe & RevenueCat */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Database className="h-4 w-4" />
                <span>Confirmed Payment Providers & Integration Health</span>
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-white">
                Stripe (Web) & RevenueCat (Mobile In-App Purchases)
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-neutral-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Web Browser Client:</strong> <strong>Stripe</strong> (Stripe Checkout & Billing API) for direct credit purchases, cosmetic pack checkouts, and signed webhook delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Mobile Client (iOS & Android):</strong> <strong>RevenueCat</strong> integrating Apple StoreKit 2 and Google Play Billing with unified server receipt validation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span><strong>Zero Integration Blockers:</strong> Standardized REST + WebSocket APIs, pre-tested sandbox keys, and automated GitHub Actions CI/CD to eliminate launch friction.</span>
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
