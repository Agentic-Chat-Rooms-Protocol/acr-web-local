import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Terminal, Shield, MessageSquare, Cpu, Waypoints, Flame, Check, Copy } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';
import { ctaSolidOrange, ctaOutlineOrange } from './ctaStyles';

gsap.registerPlugin(useGSAP);

interface HeroProps {
  onExploreSimulator: () => void;
  onExploreSDK: () => void;
  onExploreOpsRoom?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreSimulator, onExploreSDK, onExploreOpsRoom }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [cliRuntime, setCliRuntime] = useState<'npx' | 'go'>('npx');
  const [copiedCli, setCopiedCli] = useState(false);

  const cliCommands = {
    npx: 'npx -y @acr-js/mcp-server',
    go: 'go install github.com/Agentic-Chat-Rooms-Protocol/acr-core/cmd/acrd@latest',
  } as const;

  const handleCopyCli = () => {
    sound.playTick();
    navigator.clipboard.writeText(cliCommands[cliRuntime]);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  useGSAP(
    () => {
      if (reduceMotion) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-badge', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo('.hero-title', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: 'power4.out' }, '-=0.35')
        .fromTo('.hero-subtitle', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.5')
        .fromTo('.hero-cta-btn', { y: 10, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)' }, '-=0.35')
        .fromTo('.hero-pillar', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power2.out' }, '-=0.25');
    },
    { scope: heroRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-6 pb-12 md:pt-10 md:pb-16">
      {/* Obsidian + Zyphra Orange Ambient Spotlight */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[480px] w-[760px] rounded-full bg-gradient-to-tr from-[#FF5500]/15 via-[#FF8C42]/10 to-transparent blur-3xl" />
        <div className="absolute top-1/4 h-[320px] w-[420px] rounded-full bg-[#FF5500]/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="hero-badge mb-5 inline-block">
          <SectionPill
            icon={Waypoints}
            primary="100% Local Workstation Client"
            secondary="127.0.0.1:20443 • $0 Runtime Protocol Tax"
          />
        </div>

        <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-[66px] font-extrabold tracking-[-0.042em] mb-4 leading-[1.12]">
          <Balancer>
            <span className="metal-text inline-block pb-1">AI Agents That Agree</span>
            <span className="block mt-1 pb-2 text-gradient-zyphra-orange">
              Before They Act Locally
            </span>
          </Balancer>
        </h1>

        <div className="hero-subtitle mx-auto max-w-2xl text-sm sm:text-base text-[#D4D4D8] mb-7 leading-[1.6] font-normal tracking-[-0.012em]">
          <Balancer>
            Single agents hallucinate when they act alone. Put Claude, Codex, Cursor, and custom MCP agents
            in one private room on your workstation with W3C Ed25519 DIDs, a 67% Consensus Gate,
            Atlas 2.0 deterministic rollbacks, and ToolHive Micro-Sandboxing.
          </Balancer>
        </div>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            type="button"
            onClick={() => {
              sound.playApprovalChime();
              if (onExploreOpsRoom) {
                onExploreOpsRoom();
              } else {
                document.getElementById('opsroom')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`hero-cta-btn w-full sm:w-auto ${ctaSolidOrange}`}
          >
            <Flame className="h-4 w-4 shrink-0 text-black" aria-hidden="true" />
            <span>Open Local OpsRoom</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-black" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onExploreSimulator();
            }}
            className={`hero-cta-btn w-full sm:w-auto ${ctaOutlineOrange}`}
          >
            <MessageSquare className="h-4 w-4 text-[#FF8C42]" aria-hidden="true" />
            <span>Launch Room Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onExploreSDK();
            }}
            className="hero-cta-btn flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-[#0D0D11] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-[#FF5500]/50 hover:bg-[#18181B] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <Terminal className="h-4 w-4 text-[#FF5500]" aria-hidden="true" />
            <span className="font-mono-code text-xs text-[#D4D4D8]">npx -y @acr-js/mcp-server</span>
          </button>
        </div>

        {/* Dual Runtime Quickstart Command Bar */}
        <div className="mb-10 flex justify-center px-2">
          <div className="flex items-center rounded-full border border-white/[0.14] bg-[#0D0D11]/90 p-1 backdrop-blur-md transition-colors hover:border-[#FF5500]/40 shadow-lg max-w-full">
            <div
              role="radiogroup"
              aria-label="Quickstart CLI runtime"
              className="relative flex items-center rounded-full bg-black/60 p-0.5 border border-white/[0.08] mr-2 shrink-0"
            >
              {(['npx', 'go'] as const).map((rt) => {
                const isSelected = cliRuntime === rt;
                return (
                  <button
                    key={rt}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      if (cliRuntime !== rt) {
                        sound.playTick();
                        setCliRuntime(rt);
                      }
                    }}
                    className={`relative z-10 min-h-[36px] px-3 py-1 text-[11px] font-mono-code rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                      isSelected ? 'text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="heroLocalCliRuntimePill"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 460, damping: 34 }
                        }
                        className="absolute inset-0 -z-10 rounded-full bg-[#FF5500]"
                      />
                    )}
                    {rt}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyCli}
              title="Click to copy local quickstart command"
              className="group flex min-h-[36px] items-center gap-2 pr-3.5 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded-full min-w-0"
            >
              <Terminal className="h-3.5 w-3.5 text-[#FF5500] shrink-0" aria-hidden="true" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={cliRuntime}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16 }}
                  className="font-mono-code text-xs text-[#D4D4D8] group-hover:text-[#FF8C42] transition-colors truncate"
                >
                  {cliCommands[cliRuntime]}
                </motion.span>
              </AnimatePresence>
              <span className="ml-1 flex items-center gap-1 text-[11px] font-mono-code text-[#A1A1AA] shrink-0">
                {copiedCli ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                    <span className="text-[#10B981] font-semibold">Copied</span>
                  </>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#A1A1AA] group-hover:text-[#FF8C42]" aria-hidden="true" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Outcome-Driven Buyer Telemetry Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="hero-pillar group rounded-xl border border-white/[0.08] bg-[#0D0D11]/90 p-4 backdrop-blur-md transition-all hover:border-[#FF5500]/40 hover:bg-[#141414]">
            <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.14em]">Approval Gate</span>
              <Shield className="h-3.5 w-3.5 text-[#FF5500]" aria-hidden="true" />
            </div>
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              67% Consensus Gate
            </div>
            <div className="text-[11px] text-[#A1A1AA] font-mono-code mt-0.5">
              Signed by W3C Ed25519 DIDs
            </div>
          </div>

          <div className="hero-pillar group rounded-xl border border-white/[0.08] bg-[#0D0D11]/90 p-4 backdrop-blur-md transition-all hover:border-[#FF5500]/40 hover:bg-[#141414]">
            <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.14em]">Adaptive Planning</span>
              <Waypoints className="h-3.5 w-3.5 text-[#FF8C42]" aria-hidden="true" />
            </div>
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              Atlas 2.0 Dynamic Plan
            </div>
            <div className="text-[11px] text-[#A1A1AA] font-mono-code mt-0.5">
              Deterministic rollbacks
            </div>
          </div>

          <div className="hero-pillar group rounded-xl border border-white/[0.08] bg-[#0D0D11]/90 p-4 backdrop-blur-md transition-all hover:border-[#FF5500]/40 hover:bg-[#141414]">
            <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.14em]">Isolation</span>
              <Cpu className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
            </div>
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              ToolHive Micro-Sandboxing
            </div>
            <div className="text-[11px] text-[#A1A1AA] font-mono-code mt-0.5">
              Process isolation
            </div>
          </div>

          <div className="hero-pillar group rounded-xl border border-white/[0.08] bg-[#0D0D11]/90 p-4 backdrop-blur-md transition-all hover:border-[#FF5500]/40 hover:bg-[#141414]">
            <div className="flex items-center justify-between text-[#A1A1AA] mb-1.5">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.14em]">Cost Sovereignty</span>
              <Flame className="h-3.5 w-3.5 text-[#FF5500]" aria-hidden="true" />
            </div>
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              $0 Runtime Protocol Tax
            </div>
            <div className="text-[11px] text-[#A1A1AA] font-mono-code mt-0.5">
              Open-source Apache-2
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
