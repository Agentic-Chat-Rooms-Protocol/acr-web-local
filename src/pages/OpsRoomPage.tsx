import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  DollarSign, 
  Terminal, 
  Cpu, 
  Maximize2, 
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { MeshGradient } from '@paper-design/shaders-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SectionPill } from '../components/SectionPill';
import { AtlasVisualizer } from '../components/opsroom/AtlasVisualizer';
import { BattlecardSection } from '../components/opsroom/BattlecardSection';
import { RoiCalculator } from '../components/opsroom/RoiCalculator';
import { WcagInspector } from '../components/opsroom/WcagInspector';
import { IncidentCommander } from '../components/opsroom/IncidentCommander';
import { DeliberationFeed } from '../components/opsroom/DeliberationFeed';
import { ConsensusBallotBox } from '../components/opsroom/ConsensusBallotBox';
import { OpsCanvasView } from '../components/opsroom/OpsCanvasView';
import { SyntheticHuddle } from '../components/opsroom/SyntheticHuddle';
import { OpsRoomModal } from '../components/opsroom/OpsRoomModal';
import { INCIDENT_PRESETS, DEFAULT_SQUAD_AGENTS, type IncidentPreset } from '../components/opsroom/mock-data';
import type { 
  OpsIncident, 
  ConsensusBallot, 
  AgentSquad 
} from '../components/opsroom/types';
import { Atlas2Engine } from '../components/opsroom/atlas-engine';
import { ByzantineConsensusEngine } from '../components/opsroom/consensus';
import { HuddleManager } from '../components/opsroom/huddle-manager';
import { SandboxExecutor } from '../components/opsroom/sandbox-executor';
import { CryptographicAuditLedger } from '../components/opsroom/audit-ledger';
import { getScenarioForPreset } from '../components/opsroom/simulation-scenarios';
import { sound } from '../utils/sound';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

gsap.registerPlugin(useGSAP);

interface OpsRoomPageProps {
  onBackToShowcase: () => void;
  onLaunchApp?: () => void;
  onNavigate?: (sectionId: string) => void;
  onOpenCommand?: () => void;
  onOpenConnectMcp?: () => void;
  onOpenMetaMcp?: () => void;
  onOpenSettings?: () => void;
}

export const OpsRoomPage: React.FC<OpsRoomPageProps> = ({
  onBackToShowcase,
  onLaunchApp,
  onNavigate,
  onOpenCommand,
  onOpenConnectMcp,
  onOpenMetaMcp,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'atlas' | 'battlecard' | 'roi' | 'huddle' | 'wcag'>('simulator');
  const [selectedPreset, setSelectedPreset] = useState<IncidentPreset>(INCIDENT_PRESETS[0]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const defaultSquad: AgentSquad = {
    id: 'squad-core',
    name: 'Core Incident Response Squad',
    specialization: 'High-Availability Database & Infrastructure',
    agents: DEFAULT_SQUAD_AGENTS,
    consensusThreshold: 0.67,
  };

  const isExecutingRef = useRef(false);

  const [currentIncident, setCurrentIncident] = useState<OpsIncident>(() => {
    const inc = Atlas2Engine.createIncident(
      INCIDENT_PRESETS[0].title,
      INCIDENT_PRESETS[0].description,
      defaultSquad
    );
    inc.severity = INCIDENT_PRESETS[0].severity;
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    const agentSre = defaultSquad.agents[1];
    const agentSec = defaultSquad.agents[2];
    const agentAtlas = defaultSquad.agents[0];
    HuddleManager.addSpokenLine(huddle, agentSre, 'Anomaly matches known replication stall signature. Node isolation recommended before WAL wrap.');
    HuddleManager.addSpokenLine(huddle, agentSec, 'SecOps confirmed egress allowlist locked. Ready for consensus ballot.');
    HuddleManager.addSpokenLine(huddle, agentAtlas, 'Goal decomposition complete. Requesting 67% Byzantine Quorum vote.');
    inc.huddle = huddle;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);
    return inc;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // GSAP Entrance Choreography
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.ops-badge', { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
      .fromTo('.ops-hero-title', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power4.out' }, '-=0.3')
      .fromTo('.ops-hero-desc', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.4')
      .fromTo('.ops-quadrant', { y: 20, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.08 }, '-=0.3')
      .fromTo('.ops-nav-pill', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 }, '-=0.2');
  }, { scope: containerRef });

  const toggleAudio = () => {
    const isNowOn = sound.toggleSound();
    setAudioEnabled(isNowOn);
  };

  // Reset incident state
  const handleReset = useCallback((overridePreset?: IncidentPreset) => {
    const targetPreset = overridePreset || selectedPreset;
    const inc = Atlas2Engine.createIncident(targetPreset.title, targetPreset.description, defaultSquad);
    inc.severity = targetPreset.severity;
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    const agentSre = defaultSquad.agents[1];
    const agentSec = defaultSquad.agents[2];
    const agentAtlas = defaultSquad.agents[0];
    HuddleManager.addSpokenLine(huddle, agentSre, 'Anomaly matches known replication stall signature. Node isolation recommended before WAL wrap.');
    HuddleManager.addSpokenLine(huddle, agentSec, 'SecOps confirmed egress allowlist locked. Ready for consensus ballot.');
    HuddleManager.addSpokenLine(huddle, agentAtlas, 'Goal decomposition complete. Requesting 67% Byzantine Quorum vote.');
    inc.huddle = huddle;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);
    setCurrentIncident(inc);
    setIsRunning(false);
    setHumanApproved(false);
    isExecutingRef.current = false;
    setIsExecuting(false);
  }, [selectedPreset]);

  // Trigger Autonomous Incident Simulation
  const handleTriggerIncident = useCallback(async (customTitle?: string, customDesc?: string) => {
    setIsRunning(true);
    const title = customTitle || selectedPreset.title;
    const desc = customDesc || selectedPreset.description;

    const inc = Atlas2Engine.createIncident(title, desc, defaultSquad);
    inc.severity = selectedPreset.severity;

    // Start synthetic huddle
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    inc.huddle = huddle;
    setCurrentIncident({ ...inc });

    // Deliberation phase
    Atlas2Engine.transitionPhase(inc, 'deliberating');
    setCurrentIncident({ ...inc });
    await new Promise((r) => setTimeout(r, 400));

    // Dynamic scenario turns from simulation engine
    const scenario = getScenarioForPreset(selectedPreset, defaultSquad, customTitle, customDesc);
    for (const turnData of scenario.turns) {
      const agent = defaultSquad.agents[turnData.agentRoleIndex] || defaultSquad.agents[0];
      Atlas2Engine.addDeliberationTurn(
        inc,
        agent,
        turnData.reasoning,
        turnData.proposedHypothesis,
        turnData.proposedActions,
        turnData.confidence
      );
      HuddleManager.addSpokenLine(huddle, agent, turnData.spokenLine);
      sound.playTick();
      setCurrentIncident({ ...inc });
      await new Promise((r) => setTimeout(r, 450));
    }

    // Quorum Voting phase
    Atlas2Engine.transitionPhase(inc, 'awaiting_quorum');
    const plan = Atlas2Engine.compileExecutionPlan(inc, scenario.summary, {
      affectedNodes: scenario.affectedNodes,
      expectedLatencyRecoveryMs: scenario.expectedLatencyRecoveryMs,
      expectedTrafficImpactPercent: scenario.expectedTrafficImpactPercent,
    });
    Atlas2Engine.simulateDryRun(plan);

    const ballots: ConsensusBallot[] = [
      ByzantineConsensusEngine.signBallot(inc.id, defaultSquad.agents[0], 'approve', 0.98, 'DAG execution plan validated'),
      ByzantineConsensusEngine.signBallot(inc.id, defaultSquad.agents[1], 'approve', 0.94, 'Telemetry thresholds satisfied'),
      ByzantineConsensusEngine.signBallot(inc.id, defaultSquad.agents[2], 'approve', 0.96, 'Zero-trust containment verified'),
      ByzantineConsensusEngine.signBallot(inc.id, defaultSquad.agents[3], 'approve', 0.91, 'Schema integrity preserved'),
      ByzantineConsensusEngine.signBallot(inc.id, defaultSquad.agents[4], 'approve', 0.89, 'FinOps cost ceiling honored'),
    ];
    inc.ballots = ballots;

    const quorum = ByzantineConsensusEngine.evaluateQuorum(inc.id, defaultSquad, ballots);
    inc.quorum = quorum;
    inc.canvas.liveFields.activeQuorumRatio = quorum.weightedApprovalRatio;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);

    sound.playApprovalChime();
    setCurrentIncident({ ...inc });
    setIsRunning(false);
  }, [selectedPreset]);

  // Execute sandboxed plan
  const handleExecutePlan = useCallback(async () => {
    if (!currentIncident.executionPlan || isExecutingRef.current) return;

    isExecutingRef.current = true;
    setIsExecuting(true);
    setHumanApproved(true);
    try {
      Atlas2Engine.transitionPhase(currentIncident, 'executing');
      setCurrentIncident({ ...currentIncident });

      const executor = new SandboxExecutor();
      const result = await executor.executePlan(currentIncident.executionPlan, true);

      if (result.allSucceeded) {
        Atlas2Engine.transitionPhase(currentIncident, 'verifying');
        setCurrentIncident({ ...currentIncident });
        await new Promise((r) => setTimeout(r, 400));

        Atlas2Engine.transitionPhase(currentIncident, 'resolved');
        currentIncident.resolvedAt = Date.now();
        currentIncident.canvas.liveFields.trafficImpactPercent = 0;
        currentIncident.canvas.liveFields.errorRateSpike = 0.01;

        for (const item of currentIncident.canvas.actionItems) {
          item.status = 'verified';
        }
        sound.playSuccess();
      } else {
        Atlas2Engine.transitionPhase(currentIncident, 'escalated_human');
        sound.playAlert();
      }
    } catch (err) {
      console.error('Failed executing sandboxed mitigation plan:', err);
      try {
        Atlas2Engine.transitionPhase(currentIncident, 'escalated_human');
      } catch {}
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
      setCurrentIncident({ ...currentIncident });
    }
  }, [currentIncident]);

  // Toggle single ballot decision with cryptographic re-signing
  const handleToggleBallotDecision = (ballotId: string) => {
    const ballot = currentIncident.ballots.find((b) => b.ballotId === ballotId);
    if (!ballot) return;

    const agent = defaultSquad.agents.find((a) => a.id === ballot.agentId);
    const newDecision = ballot.decision === 'approve' ? 'reject' : 'approve';
    if (agent) {
      ByzantineConsensusEngine.reSignBallot(ballot, agent, newDecision);
    } else {
      ballot.decision = newDecision;
    }

    const newQuorum = ByzantineConsensusEngine.evaluateQuorum(
      currentIncident.id,
      defaultSquad,
      currentIncident.ballots
    );
    currentIncident.quorum = newQuorum;
    currentIncident.canvas.liveFields.activeQuorumRatio = newQuorum.weightedApprovalRatio;
    setCurrentIncident({ ...currentIncident });
  };

  // Export SOC2 Audit Certificate
  const handleExportCertificate = () => {
    const ledger = new CryptographicAuditLedger(currentIncident.id);
    ledger.recordBlock(currentIncident.id, 'DELIBERATION_TURN', { count: currentIncident.deliberationTurns.length });
    ledger.recordBlock(currentIncident.id, 'QUORUM_EVALUATION', { quorum: currentIncident.quorum });
    const cert = ledger.generateComplianceCertificate(currentIncident.id);

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acr-opsroom-audit-${currentIncident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Scroll to section on demand
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#030305] text-slate-100 selection:bg-amber-500/20 selection:text-amber-200 font-sans">
      {/* Hyper-Premium Ambient Background with Slack Aubergine + Cyan Mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-[#030305]">
        <div className="absolute inset-0 opacity-40">
          <MeshGradient
            colors={['#4a154b', '#07080e', '#032d42', '#1b0a2a']}
            speed={0.025}
            distortion={0.35}
            swirl={0.25}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Matching Global Sticky Header Navigation */}
      <Navbar
        onOpenCommand={onOpenCommand || (() => {})}
        onNavigate={(sectionId) => {
          if (onNavigate) {
            onNavigate(sectionId);
          } else {
            onBackToShowcase();
          }
        }}
        onLaunchApp={onLaunchApp || (() => {})}
        onOpenConnectMcp={onOpenConnectMcp || (() => {})}
        onOpenMetaMcp={onOpenMetaMcp || (() => {})}
        onOpenSettings={onOpenSettings}
        onOpenOpsRoomPage={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Sleek Secondary OpsRoom Control & Breadcrumb Sub-Bar */}
      <div className="sticky top-14 sm:top-16 z-40 w-full border-b border-white/[0.08] bg-[#07080e]/92 px-4 sm:px-6 lg:px-8 py-2.5 backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 flex-wrap">
          {/* Breadcrumb / Back */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { sound.playTick(); onBackToShowcase(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-98"
              title="Return to ACR Protocol Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Showcase</span>
            </button>

            <div className="h-4 w-px bg-white/15" />

            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs text-white">ACR OpsRoom</span>
              <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 uppercase font-bold">
                BFT Quorum
              </span>
            </div>
          </div>

          {/* Quick Subnav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <button
              onClick={() => { sound.playTick(); setActiveTab('simulator'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Simulator
            </button>
            <button
              onClick={() => { sound.playTick(); setActiveTab('atlas'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'atlas'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Atlas 2.0 DAG
            </button>
            <button
              onClick={() => { sound.playTick(); setActiveTab('battlecard'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'battlecard'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              vs Agentforce
            </button>
            <button
              onClick={() => { sound.playTick(); setActiveTab('roi'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'roi'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              ROI Calculator
            </button>
            <button
              onClick={() => { sound.playTick(); setActiveTab('huddle'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'huddle'
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Synthetic Huddle
            </button>
            <button
              onClick={() => { sound.playTick(); setActiveTab('wcag'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'wcag'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              WCAG 2.2 AAA
            </button>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={audioEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={() => { sound.playApprovalChime(); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-200 hover:text-white transition-all cursor-pointer active:scale-98"
              title="Launch Fullscreen War Room HUD"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Fullscreen HUD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Dedicated Hero Billboard (Elevating Salesforce Agentforce & Slack Aesthetic) */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="ops-badge mb-4 inline-block">
            <SectionPill
              icon={Flame}
              primary="ACR OpsRoom ⚡ Autonomous War Room"
              secondary="Beyond Salesforce Agentforce & Slack AI"
            />
          </div>

          <h1 className="ops-hero-title font-display text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            <span>Autonomous Ops Deliberation</span>
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
              With 67% Byzantine Fault-Tolerant Consensus
            </span>
          </h1>

          <p className="ops-hero-desc text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Where Salesforce charges <strong className="text-red-400 font-bold">$2.00 per conversation</strong> for fragile single-prompt hallucinations and unverified CRM writes, ACR OpsRoom delivers multi-agent goal-directed DAG planning, Ed25519 cryptographic quorum ballots, and ToolHive micro-sandboxing — with <strong>$0 platform tax</strong>.
          </p>

          {/* 4 Strategic Metric Badges (Slack Palette Elevation) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left mb-10 max-w-4xl mx-auto">
            {/* Quadrant 1: Imperial Cyan (Atlas 2.0) */}
            <div className="ops-quadrant p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Cognitive Engine</span>
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-white text-sm">Atlas 2.0 Dynamic DAG</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Goal state machine + rollbacks</div>
            </div>

            {/* Quadrant 2: Lush Green (Quorum Consensus) */}
            <div className="ops-quadrant p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">BFT Consensus</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-white text-sm">67% Weighted Quorum</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Signed by W3C Ed25519 DIDs</div>
            </div>

            {/* Quadrant 3: Radiant Amber (Zero-Trust Sandbox) */}
            <div className="ops-quadrant p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Process Isolation</span>
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-white text-sm">ToolHive Sandboxing</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Egress allowlist &amp; readonly-fs</div>
            </div>

            {/* Quadrant 4: Passion Purple (Zero Tax) */}
            <div className="ops-quadrant p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Vendor Freedom</span>
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-white text-sm">$0 Conversation Tax</div>
              <div className="text-[11px] text-slate-400 mt-0.5">100% Free Open-Source (Apache-2)</div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => { sound.playTick(); setActiveTab('simulator'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>War Room Simulator</span>
            </button>

            <button
              onClick={() => { sound.playTick(); setActiveTab('atlas'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'atlas'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Atlas 2.0 DAG</span>
            </button>

            <button
              onClick={() => { sound.playTick(); setActiveTab('battlecard'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'battlecard'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Battlecard vs Agentforce</span>
            </button>

            <button
              onClick={() => { sound.playTick(); setActiveTab('roi'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'roi'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>ROI Calculator</span>
            </button>

            <button
              onClick={() => { sound.playTick(); setActiveTab('huddle'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'huddle'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Synthetic Huddle</span>
            </button>

            <button
              onClick={() => { sound.playTick(); setActiveTab('wcag'); }}
              className={`ops-nav-pill px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'wcag'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>WCAG 2.2 AAA Audit</span>
            </button>
          </div>
        </div>

        {/* Tab Displays */}
        <div className="mt-8 transition-all">
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <IncidentCommander
                selectedPreset={selectedPreset}
                onSelectPreset={(preset) => {
                  setSelectedPreset(preset);
                  handleReset(preset);
                }}
                onTriggerIncident={handleTriggerIncident}
                isRunning={isRunning}
                onReset={() => handleReset()}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeliberationFeed
                  turns={currentIncident.deliberationTurns}
                  activePhase={currentIncident.status}
                />

                <ConsensusBallotBox
                  ballots={currentIncident.ballots}
                  quorum={currentIncident.quorum}
                  humanApproved={humanApproved}
                  onToggleHumanApproval={() => setHumanApproved(!humanApproved)}
                  onExecutePlan={handleExecutePlan}
                  isExecuting={isExecuting}
                  onToggleBallotDecision={handleToggleBallotDecision}
                  incidentStatus={currentIncident.status}
                />
              </div>

              <OpsCanvasView
                canvas={currentIncident.canvas}
                executionPlan={currentIncident.executionPlan}
                onExportCertificate={handleExportCertificate}
              />

              <SyntheticHuddle
                huddle={currentIncident.huddle}
                onSynthesizeBrief={() => {
                  if (currentIncident.huddle) {
                    HuddleManager.synthesizeAndSyncToCanvas(currentIncident.huddle, currentIncident.canvas);
                    setCurrentIncident({ ...currentIncident });
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'atlas' && <AtlasVisualizer />}

          {activeTab === 'battlecard' && <BattlecardSection />}

          {activeTab === 'roi' && <RoiCalculator />}

          {activeTab === 'huddle' && (
            <div className="space-y-6">
              <SyntheticHuddle
                huddle={currentIncident.huddle}
                onSynthesizeBrief={() => {
                  if (currentIncident.huddle) {
                    HuddleManager.synthesizeAndSyncToCanvas(currentIncident.huddle, currentIncident.canvas);
                    setCurrentIncident({ ...currentIncident });
                  }
                }}
              />
              <OpsCanvasView
                canvas={currentIncident.canvas}
                executionPlan={currentIncident.executionPlan}
                onExportCertificate={handleExportCertificate}
              />
            </div>
          )}

          {activeTab === 'wcag' && <WcagInspector />}
        </div>
      </main>

      {/* Standalone Fullscreen War Room Modal */}
      <OpsRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Matching Global Footer */}
      <Footer />
    </div>
  );
};

export default OpsRoomPage;
