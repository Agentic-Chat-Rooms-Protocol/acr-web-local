import React, { useState, useEffect } from 'react';
import { Search, Terminal, ChevronRight, Volume2, VolumeX, Radio, Flame, Menu, X, GitBranch, ShieldAlert, Layers } from 'lucide-react';
import { sound } from '../utils/sound';
import { AcrLogo } from './AcrLogo';

interface NavbarProps {
  onOpenCommand: () => void;
  onNavigate: (sectionId: string) => void;
  onLaunchApp?: () => void;
  onOpenConnectMcp?: () => void;
  onOpenMetaMcp?: () => void;
  onOpenSettings?: () => void;
  onOpenOpsRoomPage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommand,
  onNavigate,
  onLaunchApp,
  onOpenConnectMcp,
  onOpenMetaMcp,
  onOpenSettings,
  onOpenOpsRoomPage,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    if (id === 'opsroom' && onOpenOpsRoomPage) {
      onOpenOpsRoomPage();
    } else {
      onNavigate(id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pointer-events-none">
      <div
        className={`mx-auto flex flex-nowrap items-center justify-between pointer-events-auto transform-gpu will-change-[max-width,transform] transition-[max-width,height,padding,margin,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? 'mt-3 h-14 max-w-6xl xl:max-w-7xl rounded-full border border-white/[0.14] bg-[#07080e]/92 px-4 sm:px-6 backdrop-blur-2xl shadow-[0_22px_55px_rgba(0,0,0,0.92),0_0_26px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.14)]'
            : 'h-16 max-w-7xl border-b border-white/[0.07] bg-[#050508]/85 px-4 sm:px-6 lg:px-8 backdrop-blur-xl'
        }`}
      >
        {/* Brand Group - Zero Wrap */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/50 px-3 py-1 text-[11px] font-mono-code text-slate-300 shrink-0 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="whitespace-nowrap">Mesh: 99.99% (0.38ms)</span>
          </div>
        </div>

        {/* Navigation Links - Strict Single-Line with Generous Gap */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs font-medium text-slate-300 shrink-0 whitespace-nowrap">
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
            Safe Diffs
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
            onClick={() => {
              sound.playTick();
              if (onOpenMetaMcp) onOpenMetaMcp();
            }}
            className="transition-colors hover:text-cyan-300 text-cyan-400 font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <span>Meta-MCP</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>
          <button
            onClick={() => handleNavClick('governance')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Governance
          </button>
          <button
            onClick={() => handleNavClick('opsroom')}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">OpsRoom</span>
            <span className="rounded-full bg-gradient-to-r from-amber-500/25 to-cyan-500/25 border border-amber-400/60 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.2 uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">
              NEW
            </span>
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
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          {/* Advanced Settings Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playTick();
                onOpenSettings();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/30 transition-all cursor-pointer shrink-0"
              title="Advanced Settings & Port Mappings (Shift+S)"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}

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
              className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-cyan-400/60 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 px-3 py-1.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Launch App</span>
            </button>
          )}

          {/* Connect MCP Deploy CTA */}
          <button
            onClick={() => {
              sound.playTick();
              if (onOpenConnectMcp) {
                onOpenConnectMcp();
              } else {
                handleNavClick('sdk');
              }
            }}
            className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-transparent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:border-cyan-400 hover:shadow-cyan-500/20 active:scale-98 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Connect MCP</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => {
              sound.playTick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer shrink-0 ml-1"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-cyan-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 mx-auto max-w-lg rounded-3xl border border-white/[0.12] bg-[#07080e]/95 p-4 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            {/* Prominent OpsRoom Button at Top of Mobile Menu */}
            <button
              onClick={() => handleNavClick('opsroom')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-cyan-500/20 border border-amber-400/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>ACR OpsRoom</span>
                    <span className="rounded bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.2 uppercase">NEW</span>
                  </div>
                  <div className="text-[11px] text-slate-300">Autonomous War Room &amp; BFT Quorum</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleNavClick('simulator')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] text-left cursor-pointer"
              >
                <Radio className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold">Live Rooms</div>
                  <div className="text-[10px] text-slate-400">Multi-agent floor</div>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('diff-viewer')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] text-left cursor-pointer"
              >
                <GitBranch className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold">Safe Diffs</div>
                  <div className="text-[10px] text-slate-400">AST code review</div>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('governance')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] text-left cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold">Governance</div>
                  <div className="text-[10px] text-slate-400">Zero-trust ballots</div>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('architecture')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] text-left cursor-pointer"
              >
                <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold">Architecture</div>
                  <div className="text-[10px] text-slate-400">Protocol blueprint</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
