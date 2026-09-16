import React, { useState, useCallback } from 'react';
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
import { sound } from '../../utils/sound';

interface OpsRoomSectionProps {
  id?: string;
  onOpenModal?: () => void;
}

export const OpsRoomSection: React.FC<OpsRoomSectionProps> = ({ id = 'opsroom', onOpenModal }) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'atlas' | 'battlecard' | 'roi' | 'wcag'>('simulator');
  const [selectedPreset, setSelectedPreset] = useState<IncidentPreset>(INCIDENT_PRESETS[0]);

  const defaultSquad: AgentSquad = {
    id: 'squad-core',
    name: 'Core Incident Response Squad',
    specialization: 'High-Availability Database & Infrastructure',
    agents: DEFAULT_SQUAD_AGENTS,
    consensusThreshold: 0.67,
  };

  const [currentIncident, setCurrentIncident] = useState<OpsIncident>(() => {
    return Atlas2Engine.createIncident(
      INCIDENT_PRESETS[0].title,
      INCIDENT_PRESETS[0].description,
      defaultSquad
    );
  });

  const [isRunning, setIsRunning] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Reset incident
  const handleReset = useCallback(() => {
    const inc = Atlas2Engine.createIncident(selectedPreset.title, selectedPreset.description, defaultSquad);
    inc.severity = selectedPreset.severity;
    setCurrentIncident(inc);
    setIsRunning(false);
    setHumanApproved(false);
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
    await new Promise((r) => setTimeout(r, 500));

    // Turn 1: SRE Guardian
    const sreAgent = defaultSquad.agents[1];
    Atlas2Engine.addDeliberationTurn(
      inc,
      sreAgent,
      `Telemetry divergence verified. Primary buffer degradation breached baseline by ${selectedPreset.telemetry[0].zScore.toFixed(1)}σ. Recommending isolated replica drain and route shift.`,
      'Primary Replication Lag Spike',
      [
        {
          toolName: 'isolate_failing_node',
          serverName: 'acr-sre-mcp',
          parameters: { targetNode: 'db-replica-03', drainGraceSec: 5 },
          isDryRun: true,
          riskLevel: 'medium',
        }
      ],
      0.94
    );
    HuddleManager.addSpokenLine(
      huddle,
      sreAgent,
      'Replication lag matches WAL saturation signature. Node isolation required before transaction queue blocks.'
    );
    sound.playTick();
    setCurrentIncident({ ...inc });
    await new Promise((r) => setTimeout(r, 500));

    // Turn 2: SecOps Guardian
    const secopsAgent = defaultSquad.agents[2];
    Atlas2Engine.addDeliberationTurn(
      inc,
      secopsAgent,
      'Zero-Trust boundary check complete. No unauthorized token ingress found. Authorizing ToolHive micro-container with egress allowlist locked.',
      'Safe ToolHive Sandboxing',
      [],
      0.96
    );
    HuddleManager.addSpokenLine(
      huddle,
      secopsAgent,
      'Zero-trust egress allowlist verified. Proceeding to quorum vote.'
    );
    sound.playTick();
    setCurrentIncident({ ...inc });
    await new Promise((r) => setTimeout(r, 500));

    // Turn 3: Atlas Orchestrator compiles DAG and triggers quorum
    const atlasAgent = defaultSquad.agents[0];
    Atlas2Engine.addDeliberationTurn(
      inc,
      atlasAgent,
      'Atlas 2.0 Goal Decomposition complete. Generated 2-step mitigation DAG with automated rollback step. Initiating Byzantine Quorum ballot.',
      'DAG Mitigation Plan Compiled',
      [
        {
          toolName: 'activate_secondary_route',
          serverName: 'acr-mesh-mcp',
          parameters: { targetRoute: 'read-replica-01' },
          isDryRun: true,
          riskLevel: 'low',
        }
      ],
      0.98
    );
    sound.playTick();
    setCurrentIncident({ ...inc });
    await new Promise((r) => setTimeout(r, 500));

    // Step 2: Quorum Voting
    Atlas2Engine.transitionPhase(inc, 'awaiting_quorum');
    const plan = Atlas2Engine.compileExecutionPlan(inc, 'Isolate failing replica and activate healthy secondary route');
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
    if (!currentIncident.executionPlan) return;

    setIsExecuting(true);
    Atlas2Engine.transitionPhase(currentIncident, 'executing');
    setCurrentIncident({ ...currentIncident });

    const executor = new SandboxExecutor();
    const result = await executor.executePlan(currentIncident.executionPlan, humanApproved);

    if (result.allSucceeded) {
      Atlas2Engine.transitionPhase(currentIncident, 'resolved');
      currentIncident.resolvedAt = Date.now();
      currentIncident.canvas.liveFields.trafficImpactPercent = 0;
      currentIncident.canvas.liveFields.errorRateSpike = 0.01;

      for (const item of currentIncident.canvas.actionItems) {
        item.status = 'verified';
      }
      sound.playSuccess();
    }

    setIsExecuting(false);
    setCurrentIncident({ ...currentIncident });
  }, [currentIncident, humanApproved]);

  // Toggle single ballot decision
  const handleToggleBallotDecision = (ballotId: string) => {
    const ballot = currentIncident.ballots.find((b) => b.ballotId === ballotId);
    if (!ballot) return;

    ballot.decision = ballot.decision === 'approve' ? 'reject' : 'approve';
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
      {/* Hyper-Premium Background Mesh with Slack Aubergine + Cyan Shimmer */}
      <div className="absolute inset-0 -z-10 rounded-[40px] overflow-hidden pointer-events-none opacity-45">
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
          {onOpenModal && (
            <button
              onClick={() => { sound.playApprovalChime(); onOpenModal(); }}
              className="px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer active:scale-98"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Launch Fullscreen War Room Modal</span>
            </button>
          )}

          <button
            onClick={() => { sound.playTick(); setActiveTab('simulator'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Live War Room Simulator
          </button>

          <button
            onClick={() => { sound.playTick(); setActiveTab('battlecard'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'battlecard'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Master Battlecard (vs Agentforce)
          </button>

          <button
            onClick={() => { sound.playTick(); setActiveTab('atlas'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'atlas'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Atlas 2.0 Architecture
          </button>

          <button
            onClick={() => { sound.playTick(); setActiveTab('roi'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'roi'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            Enterprise ROI Calculator
          </button>

          <button
            onClick={() => { sound.playTick(); setActiveTab('wcag'); }}
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
      <div className="mt-8 transition-all">
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <IncidentCommander
              selectedPreset={selectedPreset}
              onSelectPreset={(preset) => {
                setSelectedPreset(preset);
                handleReset();
              }}
              onTriggerIncident={handleTriggerIncident}
              isRunning={isRunning}
              onReset={handleReset}
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
