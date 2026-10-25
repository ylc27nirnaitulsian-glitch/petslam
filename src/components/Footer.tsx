import React, { useState } from 'react';
import { X, ShieldCheck, Mail, FileText } from 'lucide-react';

interface FooterProps {
  onJoinWaitlist: () => void;
  onNavigate?: (page: 'landing' | 'system-details', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onJoinWaitlist, onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const handleLinkClick = (page: 'landing' | 'system-details', id: string) => {
    if (onNavigate) {
      onNavigate(page, id);
    } else {
      const el = document.querySelector(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="border-t border-white/5 bg-[#08090C] text-neutral-400 text-xs">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="font-display text-2xl font-black uppercase tracking-wider text-white"
            >
              PET<span className="text-[#CCFF00]"> SLAM</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-300">
              Where real animal ownership meets competitive esports gaming. Collect, condition, and command apex beasts in sanctioned arena competition.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
              <span>© {new Date().getFullYear()} PET SLAM Gaming Ltd.</span>
              <span>·</span>
              <span>All rights reserved.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <div className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Ecosystem
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#marketplace')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#evolution')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Evolution System
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#arena')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Battle Arena
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('system-details', '#mvp-scope')}
                  className="hover:text-[#CCFF00] transition-colors cursor-pointer text-left"
                >
                  System Required Details (MVP Scope)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Community & Team
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleLinkClick('system-details', '#team')}
                  className="hover:text-[#CCFF00] transition-colors cursor-pointer text-left"
                >
                  Founding Team & Constitution
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#auctions')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Weekly Auctions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#leaderboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Global Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('landing', '#irl-mode')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  IRL Mode (Future Feature)
                </button>
              </li>
              <li>
                <button
                  onClick={onJoinWaitlist}
                  className="text-[#CCFF00] hover:underline font-bold cursor-pointer"
                >
                  Join Waitlist
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Integrity & Legal
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Animal Imagery Notice */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4">
          <p>
            Authentic wildlife and domestic species imagery. PET SLAM advocates for wildlife conservation and responsible ethical domestic animal ownership.
          </p>
          <div className="font-mono text-neutral-300">
            Genesis Version 1.0 · Beta Queue Open
          </div>
        </div>
      </div>

      {/* Legal & Contact Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg border border-white/10 bg-[#12141A] p-6 text-white shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {activeModal === 'privacy' && (
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white mb-3">
                  Privacy Policy
                </h3>
                <div className="space-y-3 text-xs text-neutral-300 leading-relaxed max-h-80 overflow-y-auto pr-2">
                  <p>
                    <strong>1. Information Collection:</strong> PET SLAM collects subscriber email addresses exclusively for waitlist verification, alpha dispatch credentials, and platform rollout updates.
                  </p>
                  <p>
                    <strong>2. IRL Mode Proximity:</strong> Future location-based mechanics are strictly opt-in and utilize fuzzy geographic sectors. Exact real-time user GPS coordinates are never broadcast or sold to third parties.
                  </p>
                  <p>
                    <strong>3. Data Security:</strong> Information is stored in encrypted, isolated environments. You may unsubscribe or request data deletion at any time by contacting our privacy compliance desk.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white mb-3">
                  Terms of Service
                </h3>
                <div className="space-y-3 text-xs text-neutral-300 leading-relaxed max-h-80 overflow-y-auto pr-2">
                  <p>
                    <strong>1. Platform Nature:</strong> PET SLAM is currently in pre-release preview. Features showcased—including the Animal Marketplace, Arena Clashes, and Auctions—represent interactive design specifications.
                  </p>
                  <p>
                    <strong>2. Virtual In-Game Assets:</strong> Animal attributes, levels, and credit balances within sandbox simulations carry no real-money cash value.
                  </p>
                  <p>
                    <strong>3. Fair Play Protocol:</strong> Automated botting, exploit abuse, and unsanctioned matchmaking collusion are strictly prohibited in all competitive rankings.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'contact' && (
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white mb-3">
                  Contact & Inquiries
                </h3>
                <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                  <p>
                    For press, investor relations, and partnership inquiries regarding the PET SLAM competitive gaming ecosystem:
                  </p>
                  <div className="p-4 bg-black/50 border border-white/10 font-mono text-xs space-y-1.5 text-white">
                    <div>Direct: <span className="text-[#CCFF00]">contact@petslam.gg</span></div>
                    <div>Waitlist Helpdesk: <span className="text-[#CCFF00]">support@petslam.gg</span></div>
                    <div>Arena Headquarters: Singapore & Global Distributed Circuit</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-display font-bold uppercase text-xs px-5 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
