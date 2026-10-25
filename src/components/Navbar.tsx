import React, { useState } from 'react';
import { Menu, X, FileCode } from 'lucide-react';

interface NavbarProps {
  onOpenWaitlist: () => void;
  currentPage?: 'landing' | 'system-details';
  onNavigate?: (page: 'landing' | 'system-details', href?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWaitlist,
  currentPage = 'landing',
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works', targetPage: 'landing' as const },
    { label: 'Marketplace', href: '#marketplace', targetPage: 'landing' as const },
    { label: 'Evolution', href: '#evolution', targetPage: 'landing' as const },
    { label: 'Battle Arena', href: '#arena', targetPage: 'landing' as const },
    { label: 'Auctions', href: '#auctions', targetPage: 'landing' as const },
    { label: 'IRL Mode', href: '#irl-mode', targetPage: 'landing' as const },
    {
      label: 'System Required Details',
      href: '#system-required-details',
      targetPage: 'system-details' as const,
      isSpecial: true,
    },
  ];

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(link.targetPage, link.href);
    } else {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('landing', '#');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0C10]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={handleBrandClick}
          className="font-display text-2xl font-black uppercase tracking-wider text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
        >
          PET<span className="text-[#CCFF00]"> SLAM</span>
        </a>

        {/* Zone 2: Single-line concise nav links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => {
            const isSystemPageLink = link.targetPage === 'system-details';
            const isActive = isSystemPageLink
              ? currentPage === 'system-details'
              : false;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 py-1 ${
                  isActive
                    ? 'text-[#CCFF00] font-bold border-b-2 border-[#CCFF00]'
                    : isSystemPageLink
                    ? 'text-cyan-400 hover:text-[#CCFF00] font-semibold px-2 py-0.5 border border-cyan-400/30 hover:border-[#CCFF00]/60 bg-cyan-950/20'
                    : 'text-neutral-300 hover:text-[#CCFF00]'
                }`}
              >
                {isSystemPageLink && <FileCode className="h-3.5 w-3.5 shrink-0" />}
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Medium-screen compact fallback if not xl */}
        <nav className="hidden lg:flex xl:hidden items-center gap-4 text-xs font-medium text-neutral-300">
          {navLinks.map((link) => {
            const isSystemPageLink = link.targetPage === 'system-details';
            const isActive = isSystemPageLink
              ? currentPage === 'system-details'
              : false;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={`whitespace-nowrap shrink-0 transition-all flex items-center gap-1 py-1 ${
                  isActive
                    ? 'text-[#CCFF00] font-bold'
                    : isSystemPageLink
                    ? 'text-cyan-400 font-semibold hover:text-[#CCFF00]'
                    : 'text-neutral-300 hover:text-[#CCFF00]'
                }`}
              >
                {isSystemPageLink && <FileCode className="h-3 w-3" />}
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenWaitlist}
            className="hidden sm:inline-flex items-center justify-center rounded-none bg-[#CCFF00] px-5 py-2.5 font-display text-sm font-bold tracking-wider text-black uppercase transition-all duration-200 hover:bg-[#b8e600] active:scale-[0.98] shadow-[0_0_20px_rgba(204,255,0,0.25)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Join The Waitlist
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0F1117] px-6 py-6 shadow-2xl">
          <div className="flex flex-col gap-3 text-base font-medium text-neutral-300">
            {navLinks.map((link) => {
              const isSystemPageLink = link.targetPage === 'system-details';
              const isActive = isSystemPageLink && currentPage === 'system-details';

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={`py-2 transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'text-[#CCFF00] font-bold'
                      : isSystemPageLink
                      ? 'text-cyan-400 font-semibold'
                      : 'hover:text-[#CCFF00]'
                  }`}
                >
                  {isSystemPageLink && <FileCode className="h-4 w-4 text-[#CCFF00]" />}
                  <span>{link.label}</span>
                  {isSystemPageLink && (
                    <span className="ml-auto text-[10px] font-mono uppercase bg-[#CCFF00]/10 text-[#CCFF00] px-1.5 py-0.5 border border-[#CCFF00]/30">
                      Page
                    </span>
                  )}
                </a>
              );
            })}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWaitlist();
                }}
                className="w-full rounded-none bg-[#CCFF00] py-3 text-center font-display text-sm font-bold uppercase tracking-wider text-black cursor-pointer"
              >
                Join The Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
