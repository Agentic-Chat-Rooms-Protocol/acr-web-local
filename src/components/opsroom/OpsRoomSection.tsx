import React, { useState, useCallback, useRef } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  DollarSign, 
  Terminal, 
  Cpu, 
  Maximize2
} from 'lucide-react';
import { MeshGradient } from '@paper-design/shaders-react';
import { SectionPill } from '../SectionPill';
import { AtlasVisualizer } from './AtlasVisualizer';
import { BattlecardSection } from './BattlecardSection';
import { RoiCalculator } from './RoiCalculator';
import { WcagInspector } from './WcagInspector';
import { IncidentCommander } from './IncidentCommander';
import { DeliberationFeed } from './DeliberationFeed';
import { ConsensusBallotBox } from './ConsensusBallotBox';
import { OpsCanvasView } from './OpsCanvasView';
import { SyntheticHuddle } from './SyntheticHuddle';
import { INCIDENT_PRESETS, DEFAULT_SQUAD_AGENTS, type IncidentPreset } from './mock-data';
import type { 
  OpsIncident, 
  ConsensusBallot, 
  AgentSquad 
} from './types';
import { Atlas2Engine } from './atlas-engine';
import { ByzantineConsensusEngine } from './consensus';
import { HuddleManager } from './huddle-manager';
import { SandboxExecutor } from './sandbox-executor';
import { CryptographicAuditLedger } from './audit-ledger';
import { getScenarioForPreset } from './simulation-scenarios';
import { sound } from '../../utils/sound';

interface OpsRoomSectionProps {
  id?: string;
  onOpenModal?: () => void;
  onOpenDedicatedPage?: () => void;
}

export const OpsRoomSection: React.FC<OpsRoomSectionProps> = ({ 
  id = 'opsroom', 
  onOpenModal,
  onOpenDedicatedPage,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'battlecard' | 'atlas' | 'roi' | 'wcag'>('simulator');
  const [selectedPreset, setSelectedPreset] = useState<IncidentPreset>(INCIDENT_PRESETS[0]);

  const handleTabSwitch = (tab: typeof activeTab) => {
    sound.playTick();
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const contentEl = document.getElementById('opsroom-section-tab-content');
      if (contentEl) {
        const navOffset = 110;
        const rect = contentEl.getBoundingClientRect();
        if (rect.top > 250 || rect.top < 0) {
          const scrollTarget = window.pageYOffset + rect.top - navOffset;
          window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
        }
      }
    });
  };

  const isExecutingRef = useRef(false);

  const defaultSquad: AgentSquad = {
    id: 'squad-core',
    name: 'Core Incident Response Squad',
    specialization: 'High-Availability Database & Infrastructure',
    agents: DEFAULT_SQUAD_AGENTS,
    consensusThreshold: 0.67,
  };

  const [currentIncident, setCurrentIncident] = useState<OpsIncident>(() => {
    const inc = Atlas2Engine.createIncident(
      INCIDENT_PRESETS[0].title,
      INCIDENT_PRESETS[0].description,
      defaultSquad
    );
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    const scenario = getScenarioForPreset(INCIDENT_PRESETS[0], defaultSquad);
    for (const turnData of scenario.turns) {
      const agent = defaultSquad.agents[turnData.agentRoleIndex] || defaultSquad.agents[0];
      HuddleManager.addSpokenLine(huddle, agent, turnData.spokenLine);
    }
    inc.huddle = huddle;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);
    return inc;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Reset incident
  const handleReset = useCallback((overridePreset?: IncidentPreset) => {
    const targetPreset = overridePreset || selectedPreset;
    const inc = Atlas2Engine.createIncident(targetPreset.title, targetPreset.description, defaultSquad);
    inc.severity = targetPreset.severity;
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    const scenario = getScenarioForPreset(targetPreset, defaultSquad);
    for (const turnData of scenario.turns) {
      const agent = defaultSquad.agents[turnData.agentRoleIndex] || defaultSquad.agents[0];
      HuddleManager.addSpokenLine(huddle, agent, turnData.spokenLine);
    }
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

    // Step 1: Deliberation phase
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

    // Step 2: Quorum Voting
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

  // Toggle single ballot decision
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

  return (
    <section 
      id={id}
      aria-label="ACR OpsRoom Autonomous War Room Showcase"
      className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Hyper-Premium Background Mesh with Slack Aubergine + Cyan Shimmer and CSS fallback */}
      <div className="absolute inset-0 -z-10 rounded-[40px] overflow-hidden pointer-events-none opacity-45 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/60 via-slate-950 to-[#030305]">
        <MeshGradient
          colors={['#4a154b', '#07080e', '#032d42', '#1b0a2a']}
          speed={0.03}
          distortion={0.35}
          swirl={0.25}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Decorative top slit light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-[1px]" />

      {/* Hero Billboard Header (Elevating Salesforce Agentforce & Slack Aesthetic) */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <div className="mb-4 inline-block">
          <SectionPill
            icon={Flame}
            primary="ACR OpsRoom ⚡ Autonomous War Room"
            secondary="Beyond Salesforce Agentforce & Slack AI"
          />
        </div>

        <h2 className="font-display text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.12] mb-5">
          <span className="metal-text inline-block">Autonomous Ops Deliberation</span>
          <br />
          <span className="text-gradient-cyan-indigo">
            With 67% Byzantine Fault-Tolerant Consensus
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Where Salesforce charges <strong className="text-red-400">$2.00 per conversation</strong> for fragile single-prompt hallucinations and unverified CRM writes, ACR OpsRoom delivers multi-agent goal-directed DAG planning, Ed25519 cryptographic ballots, and ToolHive micro-sandboxing.
        </p>

        {/* 4 Quadrant Strategic Metric Badges (Slack Palette Elevation) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left mb-10 max-w-4xl mx-auto">
          {/* Quadrant 1: Imperial Cyan (Atlas 2.0) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Cognitive Engine</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-white text-sm">Atlas 2.0 Dynamic DAG</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Goal state machine + rollbacks</div>
          </div>

          {/* Quadrant 2: Lush Green (Quorum Consensus) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">BFT Consensus</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-white text-sm">67% Weighted Quorum</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Signed by W3C Ed25519 DIDs</div>
          </div>

          {/* Quadrant 3: Radiant Amber (Zero-Trust Sandbox) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Process Isolation</span>
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-white text-sm">ToolHive Sandboxing</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Egress allowlist &amp; readonly-fs</div>
          </div>

          {/* Quadrant 4: Passion Purple (Zero Tax) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Vendor Freedom</span>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-white text-sm">$0 Conversation Tax</div>
            <div className="text-[11px] text-slate-400 mt-0.5">100% Free Open-Source (Apache-2)</div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onOpenDedicatedPage && (
            <button
              onClick={() => { sound.playApprovalChime(); onOpenDedicatedPage(); }}
              className="px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-102 transition-all cursor-pointer active:scale-98"
            >
              <Flame className="w-4 h-4 text-slate-950" />
              <span>Dedicated OpsRoom Page ↗</span>
            </button>
          )}

          {onOpenModal && (
            <button
              onClick={() => { sound.playApprovalChime(); onOpenModal(); }}
              className="px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer active:scale-98"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Fullscreen War Room Modal</span>
            </button>
          )}

          <button
            onClick={() => handleTabSwitch('simulator')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Live War Room Simulator
          </button>

          <button
            onClick={() => handleTabSwitch('battlecard')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'battlecard'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Master Battlecard (vs Agentforce)
          </button>

          <button
            onClick={() => handleTabSwitch('atlas')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'atlas'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Atlas 2.0 Architecture
          </button>

          <button
            onClick={() => handleTabSwitch('roi')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'roi'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Enterprise ROI Calculator
          </button>

          <button
            onClick={() => handleTabSwitch('wcag')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'wcag'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            WCAG 2.2 AAA Audit
          </button>
        </div>
      </div>

      {/* Dynamic Tab Content Display */}
      <div id="opsroom-section-tab-content" className="mt-8 transition-all scroll-mt-28">
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

        {activeTab === 'wcag' && <WcagInspector />}
      </div>
    </section>
  );
};
