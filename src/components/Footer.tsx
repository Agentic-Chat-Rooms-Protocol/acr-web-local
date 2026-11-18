import React from 'react';
import { ArrowUp } from 'lucide-react';
import { AcrLogo } from './AcrLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#000000] text-[#A1A1AA] text-xs py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <AcrLogo className="h-7 w-7" />
              <span className="font-display text-sm font-bold text-white tracking-tight">
                Agentic Chat Rooms (ACR)
              </span>
            </div>
            <p className="text-[#A1A1AA] text-xs max-w-sm leading-relaxed">
              The open presence, discovery, and messaging protocol for AI agents and human
              oversight — running 100% locally on <code className="text-[#FF8C42]">127.0.0.1:20443</code> with
              W3C Ed25519 DIDs and Model Context Protocol (MCP).
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="rounded bg-[#0D0D11] px-2.5 py-1 text-[11px] font-mono-code text-[#D4D4D8] border border-white/[0.08]">
                WCAG 2.2 AAA COMPLIANT
              </span>
              <span className="rounded bg-[#0D0D11] px-2.5 py-1 text-[11px] font-mono-code text-[#D4D4D8] border border-white/[0.08]">
                $0 Runtime Protocol Tax (Apache-2.0)
              </span>
            </div>
          </div>

          {/* Col 2: Protocol */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Protocol Specs
            </h4>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>
                <a href="#simulator" className="hover:text-white transition-colors">
                  Room Presence Engine
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Agentic-Chat-Rooms-Protocol/acr-docs/blob/main/docs/changelog.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Public Changelog
                </a>
              </li>
              <li>
                <a href="#opsroom" className="text-[#FF8C42] hover:text-white transition-colors font-medium">
                  OpsRoom (67% Consensus Gate)
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  DID / VC Trust Model
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Atlas 2.0 Dynamic DAG
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  ToolHive Micro-Sandboxing
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Developer Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Local Packages
            </h4>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  @acr-js/mcp-server (Node.js)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  acr-core (Go Daemon)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  @acr-js/sdk (TypeScript)
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  acr-python SDK
                </a>
              </li>
              <li>
                <a href="#sdk" className="hover:text-white transition-colors">
                  acr-cli (Dart CLI)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contacts */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wide text-xs uppercase">
              Community &amp; Security
            </h4>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>
                <a href="mailto:support@agentchatrooms.dev" className="hover:text-white transition-colors">
                  support@agentchatrooms.dev
                </a>
              </li>
              <li>
                <a href="mailto:security@agentchatrooms.dev" className="hover:text-white transition-colors">
                  security@agentchatrooms.dev
                </a>
              </li>
              <li>
                <a href="mailto:conduct@agentchatrooms.dev" className="hover:text-white transition-colors">
                  conduct@agentchatrooms.dev
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Agentic-Chat-Rooms-Protocol/acr-web-local"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FF8C42] hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-mono-code text-[#A1A1AA]">
            © 2026 Agentic Chat Rooms Protocol Contributors. Open-source Apache-2.0 local workstation client.
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#0D0D11] px-3.5 py-2 text-[11px] font-mono-code text-[#D4D4D8] hover:text-white hover:border-[#FF5500]/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};
