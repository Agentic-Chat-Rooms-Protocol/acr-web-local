import React, { useState, useRef } from 'react';
import { Layers, ShieldCheck, AlertCircle, CheckCircle2, Cpu, Lock, Sparkles, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { sound } from '../../utils/sound';

export const AtlasVisualizer: React.FC = () => {
  const [selectedArch, setSelectedArch] = useState<'atlas2' | 'atlas1'>('atlas2');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from('.atlas-card', {
      opacity: 0,
      y: 18,
      stagger: 0.06,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, { scope: containerRef, dependencies: [selectedArch] });

  const atlas2Phases = [
    {
      step: 'Phase 1',
      title: 'Telemetry Sensing',
      subtitle: 'Z-Score & IQR Anomaly Evaluation',
      detail: 'Continuous statistical sensing of replication lags, buffer spikes, and error spikes across edge nodes. Flags statistically significant deviations (>3.0σ).',
      tag: 'Statistical Ingestion',
      icon: Cpu,
    },
    {
      step: 'Phase 2',
      title: 'Ambient Grounding',
      subtitle: 'System Logs, Git Diffs, MCP Catalog',
      detail: 'Retrieves contextual artifacts, recent commit hashes, AST diffs, and live MCP server schemas to construct a grounded knowledge graph.',
      tag: 'Zero-Hallucination Grounding',
      icon: Terminal,
    },
    {
      step: 'Phase 3',
      title: 'Squad Deliberation',
      subtitle: 'Parallel Cross-Agent Critique & DAG',
      detail: 'Heterogeneous agents (SRE, SecOps, DataOps, FinOps) critique hypotheses in parallel. Atlas decomposes goals into a dependency-directed DAG.',
      tag: 'Goal-Directed DAG',
      icon: Layers,
    },
    {
      step: 'Phase 4',
      title: 'Byzantine Quorum',
      subtitle: '67% Ed25519 Weighted Consensus',
      detail: 'M-of-N quorum where each vote is cryptographically signed with W3C Ed25519 DIDs. Auto-escalates to Human Dual Consent on high-risk actions.',
      tag: 'Fault-Tolerant Consensus',
      icon: Lock,
    },
    {
      step: 'Phase 5',
      title: 'Sandbox Execution',
      subtitle: 'ToolHive Micro-Container Containment',
      detail: 'All remediation actions execute inside isolated micro-containers with locked egress allowlists, workspace scope, and automatic rollback DAGs.',
      tag: 'ToolHive Zero-Trust',
      icon: ShieldCheck,
    },
    {
      step: 'Phase 6',
      title: 'Merkle Audit Proof',
      subtitle: 'Tamper-Proof Audit & Live Canvas',
      detail: 'Cryptographic Merkle tree computes an immutable digest of all turns, votes, and container logs. Exportable to SOC2 & ISO27001 audit standards.',
      tag: 'Cryptographic Ledger',
      icon: CheckCircle2,
    },
  ];

  return (
    <section 
      ref={containerRef}
      aria-labelledby="atlas-viz-heading"
      className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
    >
      {/* Radiant ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 id="atlas-viz-heading" className="text-lg font-bold text-white tracking-tight">
                Atlas 2.0 Reasoning &amp; Deliberation Architecture
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare Salesforce Atlas 1.0 single-agent prompt-chaining vs ACR Atlas 2.0 Goal-Directed DAG.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => { sound.playTick(); setSelectedArch('atlas2'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedArch === 'atlas2'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ACR Atlas 2.0 (The Evolution)
          </button>
          <button
            onClick={() => { sound.playTick(); setSelectedArch('atlas1'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedArch === 'atlas1'
                ? 'bg-gradient-to-r from-amber-400 to-red-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Salesforce Atlas 1.0 (Flawed)
          </button>
        </div>
      </div>

      {selectedArch === 'atlas2' ? (
        <div>
          {/* 6-Phase Interactive Step Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 mb-6">
            {atlas2Phases.map((phase, idx) => {
              const Icon = phase.icon;
              const isSelected = activePhaseIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { sound.playTick(); setActivePhaseIndex(idx); }}
                  className={`atlas-card text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {phase.step}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-xs font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors">
                    {phase.title}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {phase.subtitle}
                  </p>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Phase Deep Dive Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/70 to-indigo-950/30 border border-cyan-500/30 text-xs text-slate-300 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300">
                  <Sparkles className="w-3 h-3" />
                  {atlas2Phases[activePhaseIndex].tag}
                </span>
                <span className="font-bold text-white text-sm">
                  {atlas2Phases[activePhaseIndex].title} Deep-Dive
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Phase {activePhaseIndex + 1} of 6
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {atlas2Phases[activePhaseIndex].detail}
            </p>
          </div>

          {/* Architectural Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-emerald-400 text-xs block mb-0.5">
                Atlas 2.0 Invariant Guarantee: Zero Unverified Writes
              </span>
              Every database, cloud infrastructure, or CRM mutation requires an explicit mathematical proof of consensus (67% supermajority), preflight dry-run simulation, and ToolHive micro-container isolation.
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Salesforce Atlas 1.0 Flawed Sequential Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <div className="atlas-card p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Step 1</span>
              <h4 className="text-xs font-bold text-white mt-1.5">Static Topic Selection</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Matches user prompt against rigid predefined topics. Zero dynamic goal graph synthesis.
              </p>
            </div>

            <div className="atlas-card p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Step 2</span>
              <h4 className="text-xs font-bold text-white mt-1.5">Single LLM Prompt Chaining</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                One isolated LLM hallucinates steps sequentially without peer agent critique or validation.
              </p>
            </div>

            <div className="atlas-card p-4 rounded-2xl bg-red-950/20 border border-red-500/40">
              <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">Step 3 (Vulnerable)</span>
              <h4 className="text-xs font-bold text-white mt-1.5">Direct CRM Mutation</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Directly writes records without sandbox containment, rollbacks, or quorum approval.
              </p>
            </div>

            <div className="atlas-card p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">Step 4</span>
              <h4 className="text-xs font-bold text-white mt-1.5">Passive Slack Text Post</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Dumps flat text output into a thread, billing an exorbitant $2.00 per conversation tax.
              </p>
            </div>
          </div>

          {/* Atlas 1.0 Vulnerability Warning */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-start gap-3 text-xs text-slate-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-red-400 text-xs block mb-0.5">
                Salesforce Atlas 1.0 Fragility: Single Point of Cognitive Failure
              </span>
              If the single LLM misinterprets the incident context or hallucinates an SQL query, corruption cascades directly into enterprise records without any sandboxed preflight dry-run or consensus veto.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
