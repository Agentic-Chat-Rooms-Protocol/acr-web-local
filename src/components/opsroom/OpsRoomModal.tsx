import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Flame } from 'lucide-react';
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

interface OpsRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SQUAD: AgentSquad = {
  id: 'squad-core',
  name: 'Core Incident Response Squad',
  specialization: 'High-Availability Database & Infrastructure',
  agents: DEFAULT_SQUAD_AGENTS,
  consensusThreshold: 0.67,
};

export const OpsRoomModal: React.FC<OpsRoomModalProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<IncidentPreset>(INCIDENT_PRESETS[0]);
  const isExecutingRef = useRef(false);

  const [currentIncident, setCurrentIncident] = useState<OpsIncident>(() => {
    const inc = Atlas2Engine.createIncident(
      INCIDENT_PRESETS[0].title,
      INCIDENT_PRESETS[0].description,
      DEFAULT_SQUAD
    );
    const huddle = HuddleManager.startHuddle(inc.id, DEFAULT_SQUAD.agents);
    const scenario = getScenarioForPreset(INCIDENT_PRESETS[0], DEFAULT_SQUAD);
    for (const turnData of scenario.turns) {
      const agent = DEFAULT_SQUAD.agents[turnData.agentRoleIndex] || DEFAULT_SQUAD.agents[0];
      HuddleManager.addSpokenLine(huddle, agent, turnData.spokenLine);
    }
    inc.huddle = huddle;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);
    return inc;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset incident
  const handleReset = useCallback((overridePreset?: IncidentPreset) => {
    const targetPreset = overridePreset || selectedPreset;
    const inc = Atlas2Engine.createIncident(targetPreset.title, targetPreset.description, DEFAULT_SQUAD);
    inc.severity = targetPreset.severity;
    const huddle = HuddleManager.startHuddle(inc.id, DEFAULT_SQUAD.agents);
    const scenario = getScenarioForPreset(targetPreset, DEFAULT_SQUAD);
    for (const turnData of scenario.turns) {
      const agent = DEFAULT_SQUAD.agents[turnData.agentRoleIndex] || DEFAULT_SQUAD.agents[0];
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

  // Trigger Coordinated Incident Simulation
  const handleTriggerIncident = useCallback(async (customTitle?: string, customDesc?: string) => {
    setIsRunning(true);
    const title = customTitle || selectedPreset.title;
    const desc = customDesc || selectedPreset.description;

    const inc = Atlas2Engine.createIncident(title, desc, DEFAULT_SQUAD);
    inc.severity = selectedPreset.severity;

    // Start synthetic huddle
    const huddle = HuddleManager.startHuddle(inc.id, DEFAULT_SQUAD.agents);
    inc.huddle = huddle;
    setCurrentIncident({ ...inc });

    // Step 1: Deliberation phase
    Atlas2Engine.transitionPhase(inc, 'deliberating');
    setCurrentIncident({ ...inc });
    await new Promise((r) => setTimeout(r, 400));

    // Dynamic scenario turns from simulation engine
    const scenario = getScenarioForPreset(selectedPreset, DEFAULT_SQUAD, customTitle, customDesc);
    for (const turnData of scenario.turns) {
      const agent = DEFAULT_SQUAD.agents[turnData.agentRoleIndex] || DEFAULT_SQUAD.agents[0];
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

    // Step 2: Consensus Gate Voting
    Atlas2Engine.transitionPhase(inc, 'awaiting_quorum');
    const plan = Atlas2Engine.compileExecutionPlan(inc, scenario.summary, {
      affectedNodes: scenario.affectedNodes,
      expectedLatencyRecoveryMs: scenario.expectedLatencyRecoveryMs,
      expectedTrafficImpactPercent: scenario.expectedTrafficImpactPercent,
    });
    Atlas2Engine.simulateDryRun(plan);

    const ballots: ConsensusBallot[] = [
      ByzantineConsensusEngine.signBallot(inc.id, DEFAULT_SQUAD.agents[0], 'approve', 0.98, 'Atlas 2.0 execution plan validated'),
      ByzantineConsensusEngine.signBallot(inc.id, DEFAULT_SQUAD.agents[1], 'approve', 0.94, 'Telemetry thresholds satisfied'),
      ByzantineConsensusEngine.signBallot(inc.id, DEFAULT_SQUAD.agents[2], 'approve', 0.96, 'Zero-trust containment verified'),
      ByzantineConsensusEngine.signBallot(inc.id, DEFAULT_SQUAD.agents[3], 'approve', 0.91, 'Schema integrity preserved'),
      ByzantineConsensusEngine.signBallot(inc.id, DEFAULT_SQUAD.agents[4], 'approve', 0.89, 'FinOps cost ceiling honored'),
    ];
    inc.ballots = ballots;

    const quorumEval = ByzantineConsensusEngine.evaluateQuorum(inc.id, DEFAULT_SQUAD, ballots);
    inc.quorumEval = quorumEval;
    inc.canvas.liveFields.activeQuorumRatio = quorumEval.weightedApprovalRatio;
    HuddleManager.synthesizeAndSyncToCanvas(huddle, inc.canvas);

    sound.playApprovalChime();
    setCurrentIncident({ ...inc });
    setIsRunning(false);
  }, [selectedPreset]);

  // Execute sandboxed plan
  const handleExecutePlan = useCallback(async () => {
    if (!currentIncident.executionPlan || isExecutingRef.current) return;

    const working = structuredClone(currentIncident);
    isExecutingRef.current = true;
    setIsExecuting(true);
    setHumanApproved(true);
    try {
      Atlas2Engine.transitionPhase(working, 'executing');
      setCurrentIncident(structuredClone(working));

      const executor = new SandboxExecutor();
      const result = await executor.executePlan(working.executionPlan!, true);

      if (result.allSucceeded) {
        Atlas2Engine.transitionPhase(working, 'verifying');
        setCurrentIncident(structuredClone(working));
        await new Promise((r) => setTimeout(r, 400));

        Atlas2Engine.transitionPhase(working, 'resolved');
        working.resolvedAt = Date.now();
        working.canvas.liveFields.trafficImpactPercent = 0;
        working.canvas.liveFields.errorRateSpike = 0.01;

        for (const item of working.canvas.actionItems) {
          item.status = 'verified';
        }
        sound.playSuccess();
      } else {
        Atlas2Engine.transitionPhase(working, 'escalated_human');
        sound.playAlert();
      }
    } catch (err) {
      console.error('Failed executing sandboxed mitigation plan:', err);
      try {
        Atlas2Engine.transitionPhase(working, 'escalated_human');
      } catch {}
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
      setCurrentIncident(structuredClone(working));
    }
  }, [currentIncident]);

  // Toggle single ballot decision with cryptographic re-signing
  const handleToggleBallotDecision = (ballotId: string) => {
    const working = structuredClone(currentIncident);
    const ballot = working.ballots.find((b) => b.ballotId === ballotId);
    if (!ballot) return;

    const agent = DEFAULT_SQUAD.agents.find((a) => a.id === ballot.agentId);
    const newDecision = ballot.decision === 'approve' ? 'reject' : 'approve';
    if (agent) {
      ByzantineConsensusEngine.reSignBallot(ballot, agent, newDecision);
    } else {
      ballot.decision = newDecision;
    }

    const newQuorum = ByzantineConsensusEngine.evaluateQuorum(
      working.id,
      DEFAULT_SQUAD,
      working.ballots
    );
    working.quorumEval = newQuorum;
    working.canvas.liveFields.activeQuorumRatio = newQuorum.weightedApprovalRatio;
    setCurrentIncident(working);
  };

  // Export SOC2 Audit Certificate
  const handleExportCertificate = () => {
    const ledger = new CryptographicAuditLedger(currentIncident.id);
    ledger.recordBlock(currentIncident.id, 'DELIBERATION_TURN', { count: currentIncident.deliberationTurns.length });
    ledger.recordBlock(currentIncident.id, 'QUORUM_EVALUATION', { quorumEval: currentIncident.quorumEval });
    const cert = ledger.generateComplianceCertificate(currentIncident.id);

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acr-opsroom-audit-${currentIncident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/85 backdrop-blur-2xl overflow-y-auto animate-fadeIn motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opsroom-modal-title"
    >
      <div className="relative w-full max-w-7xl max-h-[92vh] overflow-y-auto bg-[#0D0D11] border border-[#FF5500]/35 rounded-3xl shadow-[0_0_80px_rgba(255,85,0,0.16)] p-6 sm:p-8 flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Flame className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="opsroom-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ACR OpsRoom Live War Room
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/35">
                  Atlas 2.0 • 67% Consensus Gate
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Signed incident deliberation, 67% consensus gate, and ToolHive Micro-Sandboxing execution.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sound.playTick(); onClose(); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white border border-white/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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
              quorumEval={currentIncident.quorumEval}
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
                const updated = structuredClone(currentIncident);
                if (updated.huddle) {
                  HuddleManager.synthesizeAndSyncToCanvas(updated.huddle, updated.canvas);
                  setCurrentIncident(updated);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
