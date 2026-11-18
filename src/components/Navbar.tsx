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
      setIsScrolled(window.scrollY > 28);
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
        className={`mx-auto flex flex-nowrap items-center justify-between pointer-events-auto transform-gpu transition-[max-width,height,padding,margin,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? 'mt-3 h-14 max-w-6xl xl:max-w-7xl rounded-full border border-white/[0.14] bg-[#0D0D11]/92 px-4 sm:px-6 backdrop-blur-2xl shadow-[0_22px_55px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.14)]'
            : 'h-16 max-w-7xl border-b border-white/[0.08] bg-[#050508]/85 px-4 sm:px-6 lg:px-8 backdrop-blur-xl'
        }`}
      >
        {/* Brand Group */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playTick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded-lg"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <AcrLogo className={`transition-all duration-300 ${isScrolled ? 'h-7 w-7' : 'h-8 w-8'}`} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
              </span>
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-display font-bold tracking-tight text-white group-hover:text-[#FF8C42] transition-colors text-base">
                  ACR
                </span>
                <span className="rounded border border-[#FF5500]/30 bg-[#FF5500]/10 px-1.5 py-0.5 text-[9px] font-mono-code uppercase tracking-[0.14em] text-[#FF8C42] font-semibold whitespace-nowrap">
                  Local
                </span>
              </div>
              {!isScrolled && (
                <span className="text-[10px] font-mono-code text-[#A1A1AA] whitespace-nowrap">
                  v1.1.0 • 127.0.0.1
                </span>
              )}
            </div>
          </a>

          <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/50 px-3 py-1 text-[11px] font-mono-code text-[#D4D4D8] shrink-0 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
            <span className="whitespace-nowrap">Local Mesh: 127.0.0.1:20443</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs font-medium text-[#D4D4D8] shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => handleNavClick('simulator')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            Live Rooms
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('diff-viewer')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            Safe Diffs
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('architecture')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('sdk')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            MCP &amp; SDK
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              if (onOpenMetaMcp) onOpenMetaMcp();
            }}
            className="min-h-[44px] px-1 transition-colors hover:text-white text-[#FF8C42] font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            <span>Meta-MCP</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5500]" />
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('governance')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            Governance
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('opsroom')}
            className="min-h-[44px] px-1 transition-colors hover:text-white cursor-pointer whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            <Flame className="h-3.5 w-3.5 text-[#FF5500]" aria-hidden="true" />
            <span className="font-semibold text-white">OpsRoom</span>
          </button>
          <a
            href="https://github.com/Agentic-Chat-Rooms-Protocol/acr-web-local"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] items-center gap-1 text-[#A1A1AA] transition-colors hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            <span>GitHub</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </nav>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onOpenSettings();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.1] bg-[#0D0D11] text-[#A1A1AA] hover:text-white hover:border-[#FF5500]/50 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              title="Advanced Settings, Ports & ACR_API_TOKEN (Shift+S)"
              aria-label="Open Advanced Settings"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={toggleAudio}
            className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
              audioEnabled
                ? 'border-[#FF5500]/50 bg-[#FF5500]/15 text-[#FF8C42]'
                : 'border-white/[0.1] bg-[#0D0D11] text-[#A1A1AA] hover:text-white'
            }`}
            title={audioEnabled ? 'Sound cues enabled (click to mute)' : 'Enable sound cues'}
            aria-label={audioEnabled ? 'Mute sound cues' : 'Enable sound cues'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onOpenCommand();
            }}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0D0D11] px-2.5 py-1.5 text-xs text-[#D4D4D8] transition-all hover:border-[#FF5500]/40 hover:text-white cursor-pointer shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            title="Search Protocol (Ctrl+K / Ctrl+Shift+G)"
            aria-label="Search Protocol (Command K)"
          >
            <Search className="h-3.5 w-3.5 text-[#A1A1AA]" aria-hidden="true" />
            <span className="hidden sm:inline text-[11px] whitespace-nowrap">Search</span>
            <kbd className="rounded border border-white/[0.12] bg-white/[0.05] px-1 py-0.5 text-[10px] font-mono-code text-[#A1A1AA] whitespace-nowrap">
              Ctrl+K
            </kbd>
          </button>

          {onLaunchApp && (
            <button
              type="button"
              onClick={() => {
                sound.playApprovalChime();
                onLaunchApp();
              }}
              className="relative inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF6600] px-3.5 py-2 text-xs font-bold text-black transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Launch App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              if (onOpenConnectMcp) {
                onOpenConnectMcp();
              } else {
                handleNavClick('sdk');
              }
            }}
            className="relative hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#FF5500]/40 bg-[#0D0D11] px-3 py-2 text-xs font-semibold text-white transition-all hover:border-[#FF5500] hover:bg-[#18181B] active:scale-98 cursor-pointer shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <Terminal className="h-3.5 w-3.5 text-[#FF5500]" aria-hidden="true" />
            <span className="whitespace-nowrap">Connect MCP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="flex lg:hidden h-11 w-11 items-center justify-center rounded-lg border border-white/[0.1] bg-[#0D0D11] text-[#D4D4D8] hover:text-white hover:border-[#FF5500]/40 transition-all cursor-pointer shrink-0 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-[#FF5500]" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 mx-auto max-w-lg rounded-2xl border border-white/[0.12] bg-[#0D0D11]/95 p-4 shadow-2xl backdrop-blur-2xl lg:hidden">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('opsroom')}
              className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/40 text-left transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FF5500]/20 text-[#FF8C42]">
                  <Flame className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">ACR OpsRoom</div>
                  <div className="text-[11px] text-[#D4D4D8]">67% Consensus Gate &amp; Atlas 2.0 Dynamic DAG</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#FF8C42] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleNavClick('simulator')}
                className="flex min-h-[44px] items-center gap-2 p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs text-[#D4D4D8] hover:text-white text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <Radio className="h-4 w-4 text-[#FF8C42] shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold">Live Rooms</div>
                  <div className="text-[10px] text-[#A1A1AA]">Multi-agent floor</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('diff-viewer')}
                className="flex min-h-[44px] items-center gap-2 p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs text-[#D4D4D8] hover:text-white text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <GitBranch className="h-4 w-4 text-[#10B981] shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold">Safe Diffs</div>
                  <div className="text-[10px] text-[#A1A1AA]">AST code review</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('architecture')}
                className="flex min-h-[44px] items-center gap-2 p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs text-[#D4D4D8] hover:text-white text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <Layers className="h-4 w-4 text-[#FF5500] shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold">Architecture</div>
                  <div className="text-[10px] text-[#A1A1AA]">Local 4-layer stack</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('governance')}
                className="flex min-h-[44px] items-center gap-2 p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs text-[#D4D4D8] hover:text-white text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <ShieldAlert className="h-4 w-4 text-[#F59E0B] shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold">Governance</div>
                  <div className="text-[10px] text-[#A1A1AA]">Audit &amp; DIDs</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
