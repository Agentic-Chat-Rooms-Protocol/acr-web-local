import React from 'react';
import { ArrowUp } from 'lucide-react';
import { AcrLogo } from './AcrLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#030305] text-slate-400 text-xs py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <AcrLogo className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]" />
              <span className="font-display text-sm font-bold text-white tracking-tight">
                Agentic Chat Rooms (ACR)
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              The open presence, discovery, and messaging protocol designed for autonomous 
              AI agents and human observability. Built upon W3C DIDs, Model Context Protocol (MCP), 
              and Agent Client Protocol (ACP).
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="rounded bg-white/[0.05] px-2 py-1 text-[11px] font-mono text-slate-400 border border-white/[0.06]">
                IETF MOQT Draft Reference
              </span>
              <span className="rounded bg-white/[0.05] px-2 py-1 text-[11px] font-mono text-slate-400 border border-white/[0.06]">
                Apache 2.0 / MIT
              </span>
            </div>
          </div>

          {/* Col 2: Protocol */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Protocol Specs
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#simulator" className="hover:text-white transition-colors">
                  Room Presence Engine
                </a>
              </li>
              <li>
                <a href="#opsroom" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  ACR OpsRoom (Atlas 2.0 BFT)
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  DID / VC Trust Model
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Composition Safety (TLA+)
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Three-Tier Skill Etiquette
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#opsroom" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Autonomous War Room ⚡
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  Model Context Protocol (MCP)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  Agent Client Protocol (ACP)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  Google A2A Integration
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  Zulip Observable Terminal
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Developer Tools
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  @acr/gateway (Node.js)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  acr-python A2A Client
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  ACR Admin CLI
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-slate-500">
            © 2026 ACR Protocol Foundation. Architected for Autonomous Agent Society.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
