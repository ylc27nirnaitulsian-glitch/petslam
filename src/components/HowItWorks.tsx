import React from 'react';
import { Compass, Layers, Dumbbell, Swords } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Animal',
      icon: Compass,
      description:
        'Explore an authentic global roster across domestic and wildlife species—from elite working dogs like German Shepherds and Rottweilers to raw apex predators like lions, tigers, and wolves. Every species carries genuine anatomical strengths, instinctive behaviors, and distinct attribute baselines.',
      highlight: 'Diverse real-world biological archetypes',
    },
    {
      num: '02',
      title: 'Build Your Collection',
      icon: Layers,
      description:
        'Acquire high-potential animals through direct marketplace sales or bid in competitive weekly live player auctions. Expand your personal stable, cross-specialize across combat weight classes, and secure rare generational bloodlines.',
      highlight: 'Player-to-player verified ownership',
    },
    {
      num: '03',
      title: 'Train And Upgrade',
      icon: Dumbbell,
      description:
        'Condition your animals with nutritional feeding schedules, physical stamina drills, agility courses, and tactical discipline training. Level up core stats—strength, reflex velocity, and endurance—while unlocking battle maneuvers without pay-to-win stat skewing.',
      highlight: 'Merit-driven progression mechanics',
    },
    {
      num: '04',
      title: 'Enter The Arena',
      icon: Swords,
      description:
        'Deploy your beast into competitive ranked matchmaking. Challenge global players in sanctioned bouts where tactical stance selection, training depth, and attribute synergy decide the victor. Win bouts, collect seasonal bounties, and climb the global leaderboard.',
      highlight: 'Pure esports competitive glory',
    },
  ];

  return (
    <section id="how-it-works" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            Core Ecosystem Loop
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            HOW PET SLAM WORKS
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            A comprehensive competitive cycle designed for serious collectors and esports competitors.
            Four defined stages transform wild potential into championship legacy.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="group relative flex flex-col justify-between border border-white/10 bg-[#14161E] p-8 transition-all duration-300 hover:border-[#CCFF00]/40 hover:bg-[#181B26]"
              >
                <div>
                  {/* Step Top Bar: Editorial Index & Icon */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <span className="font-display text-3xl font-black text-[#CCFF00]/90">
                      {step.num}
                    </span>
                    <div className="p-2.5 bg-white/5 text-[#CCFF00] border border-white/10 group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-8 pt-4 border-t border-white/5">
                  <span className="text-xs font-medium text-neutral-400">
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
