import React, { useState, useEffect } from 'react';
import { Gavel, Clock, ArrowUpRight, Check, AlertCircle } from 'lucide-react';
import { animalImages } from '../assets/images';

interface AuctionsSectionProps {
  onJoinWaitlist: () => void;
}

export const AuctionsSection: React.FC<AuctionsSectionProps> = ({ onJoinWaitlist }) => {
  // Live ticking countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 42,
  });

  const [currentBid, setCurrentBid] = useState(48500);
  const [bidCount, setBidCount] = useState(27);
  const [simulatedBidInput, setSimulatedBidInput] = useState(49000);
  const [bidFeedback, setBidFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (simulatedBidInput <= currentBid) {
      setBidFeedback(`Bid must be higher than current valuation (${currentBid.toLocaleString()} Credits).`);
      return;
    }
    setCurrentBid(simulatedBidInput);
    setBidCount((prev) => prev + 1);
    setBidFeedback(`Sandbox bid of ${simulatedBidInput.toLocaleString()} Credits placed successfully!`);
    setSimulatedBidInput(simulatedBidInput + 500);
  };

  const auctionSteps = [
    {
      step: '01',
      title: 'Eligible Beast Listed',
      desc: 'Owner sets reserve pricing and chooses weekly auction slot duration.',
    },
    {
      step: '02',
      title: 'Live Player Bidding',
      desc: 'Verified participants place competitive bids backed by in-app credits.',
    },
    {
      step: '03',
      title: 'Final Hammer Close',
      desc: 'The highest valid bid secures the animal when the auction timer expires.',
    },
    {
      step: '04',
      title: 'Smart Settlement',
      desc: 'Ownership transfers immediately to the winning bidder’s stable registry.',
    },
    {
      step: '05',
      title: 'Credit Distribution',
      desc: 'Seller receives settled in-app credits minus standard arena exchange fee.',
    },
  ];

  return (
    <section id="auctions" className="relative border-b border-white/5 bg-[#0F1015] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#CCFF00]">
            <span>Player Marketplace Economy</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">Weekly Scheduled Events</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            YOUR ANIMAL. YOUR VALUE. YOUR NEXT MOVE.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-400">
            A vibrant decentralized animal exchange. Weekly high-profile auctions allow players to monetize developed champions and acquire rare genetic lines through transparent credit bidding.
          </p>
        </div>

        {/* 5-Step Auction Flow Strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {auctionSteps.map((st) => (
            <div key={st.step} className="border border-white/10 bg-[#14161E] p-5">
              <span className="font-display text-2xl font-black text-[#CCFF00]">
                {st.step}
              </span>
              <h4 className="mt-2 font-display text-lg font-bold uppercase text-white">
                {st.title}
              </h4>
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Live Feature Showcase Card */}
        <div className="mt-12 border border-white/10 bg-[#12141A] p-6 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Beast Auction Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-black border border-white/10">
                <img
                  src={animalImages.africanLion}
                  alt="African Lion Sultan on auction"
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-black/30" />

                {/* Live Hammer Tag */}
                <div className="absolute top-4 left-4 bg-[#CCFF00] text-black px-3 py-1 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5" />
                  <span>Marquee Lot #082</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#CCFF00] block">
                    Panthera leo · Apex Tier
                  </span>
                  <div className="font-display text-3xl font-black uppercase text-white">
                    Sultan · Level 16 Male Lion
                  </div>
                </div>
              </div>
            </div>

            {/* Live Auction Terminal Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              {/* Top Countdown */}
              <div className="border border-white/10 bg-[#161822] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>Auction Closing Countdown</span>
                  </span>
                  <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-white tracking-widest">
                    {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Total Activity</span>
                  <span className="font-mono text-lg font-bold text-[#CCFF00]">
                    {bidCount} Active Bids
                  </span>
                </div>
              </div>

              {/* Current High Bid Box */}
              <div className="border border-white/10 bg-black/40 p-5">
                <span className="text-xs text-neutral-400 uppercase block tracking-wider">
                  Highest Valid Standing Bid
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-white">
                    {currentBid.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-neutral-400 uppercase">In-App Credits</span>
                </div>
                <div className="mt-2 text-xs text-neutral-300">
                  Leading bidder: <span className="text-white font-mono font-semibold">Valeria_Khan (#7721)</span> · Bid verified by consensus
                </div>
              </div>

              {/* Sandbox Bid Form */}
              <div>
                <form onSubmit={handlePlaceBid} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    value={simulatedBidInput}
                    onChange={(e) => setSimulatedBidInput(Number(e.target.value))}
                    step={100}
                    min={currentBid + 100}
                    className="flex-1 bg-black/60 border border-white/15 px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-[#CCFF00]"
                  />
                  <button
                    type="submit"
                    className="bg-[#CCFF00] hover:bg-[#b8e600] text-black px-6 py-3 font-display font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                  >
                    Place Demo Bid
                  </button>
                </form>

                {bidFeedback && (
                  <p className="mt-2 text-xs text-[#CCFF00] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    <span>{bidFeedback}</span>
                  </p>
                )}
              </div>

              {/* Sandbox Disclaimer */}
              <div className="pt-2 text-[11px] text-neutral-400 border-t border-white/5 flex items-center justify-between">
                <span>*Illustrative demonstration using in-game test credits. No real currency transactions.</span>
                <button
                  type="button"
                  onClick={onJoinWaitlist}
                  className="text-xs text-[#CCFF00] hover:underline font-semibold uppercase tracking-wider"
                >
                  Join Waitlist For Access →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
