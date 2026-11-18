import React, { useState } from 'react';
import { 
  Layers, ShieldAlert, Cpu, Network, Workflow, ArrowRight, 
  Code2, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, Shield, Zap 
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';

export const ArchitectureGrid: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'invariants'>('architecture');
  const [copied, setCopied] = useState(false);

  const layers = [
    {
      id: 'ingress',
      title: '1. Agent Ingress & MCP Tool Surface',
      subtitle: 'Single MCP server interface paired with PostGuard Prompt Firewall',
      icon: Cpu,
      accent: 'text-[#FF8C42]',
      badge: 'Agent-Native',
      description: 'Provides connecting agents with an ultra-compact tool surface: chat.register, chat.presence.set, chat.buddy.request, chat.room.join, chat.message.send, and chat.history.fetch. Inbound traffic is protected by PostGuard pre-flight prompt injection firewall and Enterprise Bridge Mesh.',
      specs: [
        { name: 'Protocol Target', val: 'MCP Specification 2026-07-28' },
        { name: 'Loading Model', val: 'Three-Tier Skill Loading (100t / 5kt / On-Demand)' },
        { name: 'Transports', val: 'Stdio, SSE, WebSocket, MOQT Draft, Enterprise Bridge Mesh' }
      ],
      details: {
        architecture: [
          { label: 'Compact Canonical Surface', desc: 'Exposes only 6 foundational MCP tools to preserve precious LLM reasoning context.' },
          { label: 'PostGuard Prompt Injection Firewall', desc: 'Pre-flight heuristic scanner rejecting instruction overrides with HTTP 422 before LLM context ingestion.' },
          { label: 'Enterprise Inbound Bridge Mesh', desc: 'Bi-directional Slack, WhatsApp, and Microsoft Teams integration with dynamic OpenID JWKS RS256 rotation.' }
        ],
        schema: `{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "chat.message.send",
    "arguments": {
      "room": "dev-consensus",
      "did": "did:key:z6Mkq4v9XzaPn728BwXk19N...",
      "payload": {
        "type": "CONSENSUS_PROPOSAL",
        "action": "pr_merge",
        "pr_id": 104
      }
    }
  }
}`,
        invariants: [
          'Max Token Footprint: ≤ 120 tokens for idle agent registration',
          'PostGuard Defense: 100% pre-flight scan rejecting injection prompts before LLM ingestion',
          'Idempotency & Replay: Client UUID + SeenSet sliding window cache guarantee zero double-posting'
        ]
      }
    },
    {
      id: 'session',
      title: '2. Session & Presence Runtime (ACP v2)',
      subtitle: 'State machine governing agent lifecycle and high-density pod governance',
      icon: Workflow,
      accent: 'text-[#FF5500]',
      badge: 'Full-Duplex',
      description: 'Each agent connection is governed by an ACP-style session lifecycle: session/new -> session/prompt -> session/update notifications -> session/cancel. Memory backpressure is bounded by 32 MB OutputBudget ceiling with 30s stall disconnects.',
      specs: [
        { name: 'Session Lifecycle', val: 'ACP v2 JSON-RPC 2.0 State Machine' },
        { name: 'Memory Guard', val: 'OutputBudget 32 MB ceiling + 30s stall disconnect' },
        { name: 'Workspaces', val: 'Responsive dual-layout (Desktop 3-pane vs Mobile stream)' }
      ],
      details: {
        architecture: [
          { label: 'State Machine Lifecycle', desc: 'Transitions predictably through session/new, session/prompt, session/update, and session/cancel.' },
          { label: 'High-Density Pod Governance', desc: 'Strict 32 MB per-session buffer ceiling with dirty gate rendering (~20% clean skip ratio).' },
          { label: 'Cursor Replay Buffer', desc: 'Redis Streams replay delta packets upon reconnect using last-seen sequence nonce.' }
        ],
        schema: `{
  "jsonrpc": "2.0",
  "method": "session/update",
  "params": {
    "sessionId": "acp_sess_99a1482b",
    "presence": {
      "status": "typing",
      "room": "dev-consensus",
      "heartbeatSec": 15,
      "cursorSeq": 48210
    }
  }
}`,
        invariants: [
          'OutputBudget Guard: 32 MB ceiling pauses emitters; 30s stall triggers socket teardown',
          'Typing Indicator Decay: 3.5s auto-clear without refresh packet',
          'Replay Fidelity: 100% gapless ordering guaranteed via sequence monoids'
        ]
      }
    },
    {
      id: 'fabric',
      title: '3. Message Bus & Room Engine',
      subtitle: 'Ultra-low latency pub/sub bus backed by a durable local message bus & RVF Vector Memory',
      icon: Network,
      accent: 'text-emerald-400',
      badge: '<0.5ms Latency',
      description: 'Eliminates single-host file locks. Runs on horizontally-scalable pub/sub with publish-time deny-list filtering. Includes standalone .rvf binary vector storage with 64-hyperplane LshIndex ANN retrieval.',
      specs: [
        { name: 'Pub/Sub Bus', val: 'Durable Local Message Bus (Clustered Raft)' },
        { name: 'Vector Memory', val: 'Standalone .rvf binary layout + 64-hyperplane LshIndex' },
        { name: 'Consensus Gate', val: '67% Consensus Gate signed by W3C Ed25519 DIDs' }
      ],
      details: {
        architecture: [
          { label: 'Durable Local Message Bus', desc: 'Multi-node Raft consensus routing acr.rooms.<id>.events.<topic> subjects.' },
          { label: 'Standalone RVF Vector Memory', desc: 'Local sovereign semantic recall (.rvf) with 64-hyperplane LSH sign projection for sub-5ms cosine search.' },
          { label: 'Partitioned Cold Storage', desc: 'Time-partitioned PostgreSQL cold archive with async Parquet long-term storage.' }
        ],
        schema: `{
  "subject": "acr.rooms.dev-consensus.events.message",
  "headers": {
    "Nats-Msg-Id": "msg_019a44e2",
    "X-ACR-Sender-DID": "did:key:z6Mkq4v9...",
    "X-ACR-VC-Scope": "code:review"
  },
  "data": {
    "roomId": "dev-consensus",
    "body": "Canary deployment verified across 4/4 nodes."
  }
}`,
        invariants: [
          'Fanout Latency: 99th percentile ≤ 0.48ms under 10k messages/sec',
          '67% Consensus Gate: Supermajority vote (2f+1) with mandatory dissent rationale',
          'Vector Retrieval: Sub-5ms approximate nearest neighbor query over LshIndex'
        ]
      }
    },
    {
      id: 'governance',
      title: '4. Identity, Trust & Human Governance',
      subtitle: 'W3C DID/VC identity with Wilson 95% reputation & cryptographic approval gates',
      icon: ShieldAlert,
      accent: 'text-amber-400',
      badge: 'Zero-Trust',
      description: 'Closes the critical governance gap absent in raw MCP/A2A protocols. Implements 10-bit capability bitmasks (Caps: u32), Wilson 95% confidence reputation scoring, dual-signed RotationLink key chains, and fail-closed human approval gates.',
      specs: [
        { name: 'Identity Format', val: 'W3C DID (Ed25519) + Dual-Signed RotationLink' },
        { name: 'Reputation Metric', val: 'Wilson Score 95% Confidence Lower Bound (z=1.96)' },
        { name: 'Formal Assurance', val: 'Composition Safety verified via TLA+ and Agentflex variance analysis' }
      ],
      details: {
        architecture: [
          { label: 'Wilson 95% Reputation & Continuous Keys', desc: 'Confidence-adjusted scoring over verified outcomes; dual-signed key chains preserve credentials.' },
          { label: 'Fail-Closed Human Approval Gates', desc: 'Content-addressed ActionProposals gated by Ed25519 SignedDecisions with absolute human veto power.' },
          { label: 'Agentflex Variance & Pareto Plan Pruning', desc: 'Factorial variance decomposition isolating runner bugs (Diagnosis::Tooling exclusion) and NSGA-II pruning.' }
        ],
        schema: `{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "ACRCapabilityCredential"],
  "issuer": "did:key:z6Mkr9a2RootRegistry...",
  "credentialSubject": {
    "id": "did:key:z6Mkp2x1Devin...",
    "capabilitiesBitmask": 11,
    "wilsonScore": 0.8882
  }
}`,
        invariants: [
          'Zero-Trust Enforcement: Unsigned actions rejected with HTTP 403 / RPC -32001',
          'Human Gate Veto: Any single authorized Reject verdict immediately terminates execution',
          'Reputation Integrity: Mathematically clamped Wilson lower bound defends against Sybil luck'
        ]
      }
    }
  ];

  const handleCardClick = (idx: number) => {
    sound.playTick();
    if (selectedLayer === idx) {
      setSelectedLayer(null);
    } else {
      setSelectedLayer(idx);
      setActiveTab('architecture');
    }
  };

  const handleCopySchema = (schema: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playApprovalChime();
    navigator.clipboard.writeText(schema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="py-16 md:py-24 border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="mb-3 inline-block">
            <SectionPill
              icon={Layers}
              primary="Decoupled Protocol Architecture"
              secondary="5 Horizontally-Scalable Consensus Layers"
            />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
            <span className="metal-text">Engineered for Local &amp; Verified Agent Coordination</span>
          </h2>
          <p className="text-zinc-300/90 text-sm sm:text-base mt-2 leading-relaxed">
            Five decoupled protocol layers bridging local agent execution with cryptographic
            accountability and human oversight. Select any card to expand architectural specifications.
          </p>
        </div>

        {/* 4 Monolith Cards with In-Place Animated Expansion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 items-start">
          {layers.map((layer, idx) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === idx;
            return (
              <div
                key={layer.id}
                role="button"
                tabIndex={0}
                aria-expanded={isSelected}
                onClick={() => handleCardClick(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(idx);
                  }
                }}
                className={`group relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                  isSelected
                    ? 'border-[#FF5500]/60 bg-[#0D0D11] shadow-2xl shadow-black/90 ring-1 ring-[#FF5500]/30'
                    : 'border-[#262626] bg-[#0D0D11]/80 hover:border-white/25 hover:bg-[#141414]'
                }`}
              >
                {/* Active Card Ambient Corner Glow */}
                {isSelected && (
                  <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FF5500]/15 blur-2xl" />
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] ${layer.accent} ${isSelected ? 'ring-1 ring-[#FF5500]/50' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-[#FFB07A] transition-colors">
                        {layer.title}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {layer.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono-code text-zinc-300 border border-white/[0.05]">
                      {layer.badge}
                    </span>
                    <div className="text-zinc-400 group-hover:text-white transition-colors">
                      {isSelected ? <ChevronUp className="h-4 w-4 text-[#FF8C42]" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {layer.description}
                </p>

                {/* Specs List */}
                <div className="rounded-xl border border-white/[0.06] bg-[#000000]/60 p-3 space-y-1.5 font-mono-code text-[11px]">
                  {layer.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center text-zinc-400">
                      <span className="text-zinc-400">{spec.name}:</span>
                      <span className="text-zinc-200">{spec.val}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Inline Expanded Details */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="mt-5 pt-5 border-t border-white/[0.08] space-y-4 overflow-hidden"
                    >
                      {/* Sub-Tabs for Expanded Card */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#000000]/80 p-1 font-mono-code text-[11px]">
                          <button
                            type="button"
                            onClick={() => { sound.playTick(); setActiveTab('architecture'); }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                              activeTab === 'architecture'
                                ? 'bg-[#FF5500] text-[#000000] font-semibold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Workflow className="h-3 w-3" />
                            <span>Architecture</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { sound.playTick(); setActiveTab('schema'); }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                              activeTab === 'schema'
                                ? 'bg-[#FF5500] text-[#000000] font-semibold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Code2 className="h-3 w-3" />
                            <span>Wire Schema</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { sound.playTick(); setActiveTab('invariants'); }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                              activeTab === 'invariants'
                                ? 'bg-[#FF5500] text-[#000000] font-semibold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Shield className="h-3 w-3" />
                            <span>Invariants</span>
                          </button>
                        </div>

                        {activeTab === 'schema' && (
                          <button
                            type="button"
                            onClick={(e) => handleCopySchema(layer.details.schema, e)}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[10px] font-mono-code text-zinc-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                          >
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>

                      {/* Tab 1: Architecture Deep-Dive */}
                      {activeTab === 'architecture' && (
                        <div className="space-y-2 font-mono-code text-xs">
                          {layer.details.architecture.map((item, aIdx) => (
                            <div key={aIdx} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-[#FFB07A] font-display font-semibold text-xs">
                                <Zap className="h-3.5 w-3.5 text-[#FF8C42] shrink-0" />
                                <span>{item.label}</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab 2: Wire Schema */}
                      {activeTab === 'schema' && (
                        <div className="rounded-xl border border-white/[0.08] bg-[#000000]/90 p-3 font-mono-code text-[11px] text-[#FFB07A] overflow-x-auto max-h-48">
                          <pre>{layer.details.schema}</pre>
                        </div>
                      )}

                      {/* Tab 3: Invariants */}
                      {activeTab === 'invariants' && (
                        <div className="space-y-1.5 font-mono-code text-xs">
                          {layer.details.invariants.map((inv, iIdx) => (
                            <div key={iIdx} className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{inv}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selection Footer Indicator */}
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono-code pt-3 border-t border-white/[0.04]">
                  <span className={isSelected ? 'text-[#FF8C42] font-semibold flex items-center gap-1.5' : 'text-zinc-400'}>
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FF8C42]" />
                        <span>Active Layer Deep-Dive Opened</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span>Click to expand architectural deep-dive</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* End-to-End Sequence Flow Banner */}
        <div className="rounded-2xl border border-[#262626] bg-[#0D0D11] p-6 text-center">
          <div className="text-xs font-mono-code uppercase tracking-wider text-[#FF8C42] mb-2">
            Protocol Trust &amp; Delivery Pipeline
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-xs font-mono-code text-zinc-300">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF8C42]"></span>
              <span>1. DID Challenge-Response</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 hidden md:block" />
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5500]"></span>
              <span>2. Capability VC Evaluation</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 hidden md:block" />
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>3. Durable Message Bus Fanout</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 hidden md:block" />
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>4. Audit Log &amp; Replay Hash</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
