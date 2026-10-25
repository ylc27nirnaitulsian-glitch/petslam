import React, { useState } from 'react';
import { Radio, ShieldAlert, MapPin, Users, Send, Check, EyeOff } from 'lucide-react';

interface NearbyTrainer {
  id: string;
  name: string;
  distance: string;
  animalName: string;
  species: string;
  level: number;
  strength: number;
  status: 'Ready for Bout' | 'Sparring' | 'Cooldown';
  avatarInitials: string;
}

export const IrlModeSection: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<NearbyTrainer | null>(null);
  const [challengeSent, setChallengeSent] = useState<string | null>(null);

  const nearbyTrainers: NearbyTrainer[] = [
    {
      id: 'nt_1',
      name: 'Jordan_K9',
      distance: '~180m away',
      animalName: 'Kaiser Jr',
      species: 'German Shepherd',
      level: 11,
      strength: 81,
      status: 'Ready for Bout',
      avatarInitials: 'JK',
    },
    {
      id: 'nt_2',
      name: 'Maya_Apex',
      distance: '~340m away',
      animalName: 'Simba',
      species: 'African Lion',
      level: 14,
      strength: 92,
      status: 'Ready for Bout',
      avatarInitials: 'MA',
    },
    {
      id: 'nt_3',
      name: 'Devon_Claw',
      distance: '~510m away',
      animalName: 'Brutus',
      species: 'Rottweiler',
      level: 9,
      strength: 77,
      status: 'Cooldown',
      avatarInitials: 'DC',
    },
  ];

  const handleSendChallenge = (trainer: NearbyTrainer) => {
    setSelectedTrainer(trainer);
    setChallengeSent(`Proximity battle challenge dispatched to ${trainer.name}! In full release, both players must confirm the mutual handshake before the arena match triggers.`);
  };

  const irlProtocols = [
    {
      step: '01',
      title: 'Explicit Opt-In Only',
      text: 'IRL Mode is completely disabled by default. Active discovery only broadcasts when you explicitly toggle it on.',
    },
    {
      step: '02',
      title: 'Fuzzy Proximity Radar',
      text: 'Exact GPS coordinates are never stored or displayed to rivals. Only general randomized perimeter bands are shown.',
    },
    {
      step: '03',
      title: 'Dual-Handshake Consent',
      text: 'No surprise skirmishes. Both trainers must independently accept the challenge ticket before combat commences.',
    },
    {
      step: '04',
      title: 'Stealth & Safety Zones',
      text: 'Instant one-tap stealth cloaking, customizable safety bubbles around schools/residences, and permanent player blocking.',
    },
  ];

  return (
    <section id="irl-mode" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          {/* Prominent Roadmap Badge */}
          <div className="inline-flex items-center gap-2 border border-[#CCFF00]/40 bg-[#CCFF00]/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00] mb-4">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Future Feature · Roadmap Preview</span>
          </div>

          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            THE ARENA DOESN'T END AT YOUR SCREEN.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            What if your next opponent was just around the corner?
            Inspired by location-based discovery mechanics, IRL MODE will allow PET SLAM players to discover other players nearby and challenge their animals in the physical world.
          </p>
        </div>

        {/* Interactive Mock Proximity Scanner */}
        <div className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Radar Scope Mockup */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center p-6 bg-black/60 border border-white/10 overflow-hidden min-h-[380px]">
              {/* Radar Circles */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#CCFF00]/20 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-[#CCFF00]/15 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-[#CCFF00]/15 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-[#CCFF00]/30 flex items-center justify-center bg-[#CCFF00]/5">
                      {/* Center User Marker */}
                      <div className="h-4 w-4 bg-[#CCFF00] rounded-full shadow-[0_0_15px_#CCFF00]" />
                    </div>
                  </div>
                </div>

                {/* Radar Sweep Effect */}
                <div className="absolute inset-0 rounded-full border-t border-[#CCFF00]/60 animate-spin [animation-duration:6s]" />

                {/* Simulated Target 1 */}
                <button
                  onClick={() => handleSendChallenge(nearbyTrainers[0])}
                  className="absolute top-10 right-12 p-1.5 bg-[#14161E] border border-[#CCFF00] text-xs hover:scale-110 transition-transform cursor-pointer"
                  title="Jordan_K9 (German Shepherd)"
                >
                  <span className="font-mono text-[10px] text-[#CCFF00] font-bold">180m</span>
                </button>

                {/* Simulated Target 2 */}
                <button
                  onClick={() => handleSendChallenge(nearbyTrainers[1])}
                  className="absolute bottom-12 right-16 p-1.5 bg-[#14161E] border border-white/40 text-xs hover:scale-110 transition-transform cursor-pointer"
                  title="Maya_Apex (African Lion)"
                >
                  <span className="font-mono text-[10px] text-white font-bold">340m</span>
                </button>

                {/* Simulated Target 3 */}
                <button
                  onClick={() => handleSendChallenge(nearbyTrainers[2])}
                  className="absolute bottom-14 left-10 p-1.5 bg-[#14161E] border border-white/20 text-xs hover:scale-110 transition-transform cursor-pointer"
                  title="Devon_Claw (Rottweiler)"
                >
                  <span className="font-mono text-[10px] text-neutral-400 font-bold">510m</span>
                </button>
              </div>

              {/* Scope Footer Status */}
              <div className="mt-4 text-center">
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider block">
                  Simulated Radius: 800m Zone
                </span>
                <span className="text-[11px] text-[#CCFF00]">
                  3 Opponents Located in Approximate Vicinity
                </span>
              </div>
            </div>

            {/* Right: Nearby Opponents List & Challenge Card */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Discovered Nearby Beast Challengers
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Proximity: Active
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {nearbyTrainers.map((tr) => (
                    <div
                      key={tr.id}
                      className="border border-white/10 bg-[#161822] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/25 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-neutral-800 border border-white/10 flex items-center justify-center font-display font-bold text-white text-xs">
                          {tr.avatarInitials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-white text-base">
                              {tr.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#CCFF00]">
                              {tr.distance}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            {tr.animalName} ({tr.species}) · <span className="text-white font-mono font-medium">LVL {tr.level}</span> · <span className="text-neutral-400 font-mono">STR {tr.strength}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendChallenge(tr)}
                        disabled={tr.status === 'Cooldown'}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          tr.status === 'Cooldown'
                            ? 'bg-white/5 text-neutral-400 border border-white/5 cursor-not-allowed'
                            : 'bg-[#CCFF00] text-black hover:bg-[#b8e600]'
                        }`}
                      >
                        <Send className="h-3 w-3" />
                        <span>{tr.status === 'Cooldown' ? 'On Cooldown' : 'Send Challenge'}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {challengeSent && (
                  <div className="mt-4 p-4 border border-[#CCFF00]/40 bg-[#CCFF00]/10 text-xs text-neutral-200 flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#CCFF00] shrink-0 mt-0.5" />
                    <span>{challengeSent}</span>
                  </div>
                )}
              </div>

              {/* Privacy Notice Box */}
              <div className="border border-white/10 bg-black/40 p-4 text-xs text-neutral-300">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                  <ShieldAlert className="h-4 w-4 text-[#CCFF00]" />
                  <span>Privacy & Safety Safeguards (Future Protocol)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-300">
                  Zero raw GPS data exposure. All presence is hashed into approximate geo-fence cells. Features strict age-verification gating, parental boundary controls, and instant anonymous reporting.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Architectural Safeguards Grid */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {irlProtocols.map((p) => (
              <div key={p.step} className="p-4 bg-white/[0.02] border border-white/5">
                <span className="font-mono text-xs font-bold text-[#CCFF00]">
                  {p.step}
                </span>
                <h4 className="mt-1 font-display text-base font-bold uppercase text-white">
                  {p.title}
                </h4>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
