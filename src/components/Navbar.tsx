import React, { useState, useEffect } from 'react';
import { Search, Terminal, ChevronRight, Volume2, VolumeX, Radio } from 'lucide-react';
import { sound } from '../utils/sound';
import { AcrLogo } from './AcrLogo';

interface NavbarProps {
  onOpenCommand: () => void;
  onNavigate: (sectionId: string) => void;
  onLaunchApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommand, onNavigate, onLaunchApp }) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 28) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudio = () => {
    const isNowOn = sound.toggleSound();
    setAudioEnabled(isNowOn);
  };

  const handleNavClick = (id: string) => {
    sound.playTick();
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pointer-events-none">
      <div
        className={`mx-auto flex items-center justify-between pointer-events-auto transform-gpu will-change-[max-width,transform] transition-[max-width,height,padding,margin,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? 'mt-3 h-14 max-w-6xl xl:max-w-7xl rounded-full border border-white/[0.14] bg-[#07080e]/92 px-5 sm:px-7 backdrop-blur-2xl shadow-[0_22px_55px_rgba(0,0,0,0.92),0_0_26px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.14)]'
            : 'h-16 max-w-7xl border-b border-white/[0.07] bg-[#050508]/85 px-4 sm:px-6 lg:px-8 backdrop-blur-xl'
        }`}
      >
        {/* Brand Group - Zero Wrap */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playTick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <AcrLogo className={`text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-all duration-300 ${
                isScrolled ? 'h-7 w-7' : 'h-8 w-8'
              }`} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-display font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors text-base">
                  ACR
                </span>
                <span className="rounded border border-cyan-500/20 bg-cyan-950/40 px-1.5 py-0.5 text-[9px] font-mono-code uppercase tracking-[0.14em] text-cyan-300 font-semibold whitespace-nowrap">
                  Protocol
                </span>
              </div>
              {!isScrolled && (
                <span className="text-[10px] font-mono-code text-slate-400 transition-opacity duration-300 whitespace-nowrap">
                  v0.8.2-draft
                </span>
              )}
            </div>
          </a>

          {/* Network Health Chip - Strict Single-Line */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/50 px-3 py-1 text-[11px] font-mono-code text-slate-300 shrink-0 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="whitespace-nowrap">Mesh: 99.99% (0.38ms)</span>
          </div>
        </div>

        {/* Navigation Links - Strict Single-Line with Generous Gap */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8 text-xs font-medium text-slate-300 shrink-0 whitespace-nowrap">
          <button
            onClick={() => handleNavClick('simulator')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Live Rooms
          </button>
          <button
            onClick={() => handleNavClick('diff-viewer')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Graphite Diff
          </button>
          <button
            onClick={() => handleNavClick('architecture')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Architecture
          </button>
          <button
            onClick={() => handleNavClick('sdk')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            MCP &amp; SDK
          </button>
          <button
            onClick={() => handleNavClick('governance')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Governance
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 transition-colors hover:text-white whitespace-nowrap"
          >
            <span>GitHub</span>
            <ChevronRight className="h-3 w-3 text-slate-500" />
          </a>
        </nav>

        {/* Action Buttons Group - Strict Single-Line */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer shrink-0 ${
              audioEnabled
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title={audioEnabled ? 'Futuristic sound enabled (click to mute)' : 'Enable futuristic sound cues'}
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Graphite Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playTick();
              onOpenCommand();
            }}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:bg-slate-800/80 hover:text-slate-200 cursor-pointer shrink-0 whitespace-nowrap"
            title="Search Protocol (⌘K / Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline text-[11px] whitespace-nowrap">Search</span>
            <kbd className="rounded border border-white/[0.12] bg-white/[0.05] px-1 py-0.5 text-[10px] font-mono text-slate-400 whitespace-nowrap">
              ⌘K
            </kbd>
          </button>

          {/* Launch App Mode CTA */}
          {onLaunchApp && (
            <button
              onClick={() => {
                sound.playApprovalChime();
                onLaunchApp();
              }}
              className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-cyan-400/60 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 px-3.5 py-1.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Launch App</span>
            </button>
          )}

          {/* Connect MCP Deploy CTA */}
          <button
            onClick={() => handleNavClick('sdk')}
            className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-transparent px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:border-cyan-400 hover:shadow-cyan-500/20 active:scale-98 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Connect MCP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
