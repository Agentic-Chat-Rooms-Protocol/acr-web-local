import React, { useState, useEffect, useCallback } from 'react';
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

export const OpsRoomModal: React.FC<OpsRoomModalProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<IncidentPreset>(INCIDENT_PRESETS[0]);
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
  const handleReset = useCallback(() => {
    const inc = Atlas2Engine.createIncident(selectedPreset.title, selectedPreset.description, defaultSquad);
    inc.severity = selectedPreset.severity;
    const huddle = HuddleManager.startHuddle(inc.id, defaultSquad.agents);
    const scenario = getScenarioForPreset(selectedPreset, defaultSquad);
    for (const turnData of scenario.turns) {
      const agent = defaultSquad.agents[turnData.agentRoleIndex] || defaultSquad.agents[0];
      HuddleManager.addSpokenLine(huddle, agent, turnData.spokenLine);
    }
    inc.huddle = huddle;
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
    if (!currentIncident.executionPlan || isExecuting) return;

    setIsExecuting(true);
    try {
      Atlas2Engine.transitionPhase(currentIncident, 'executing');
      setCurrentIncident({ ...currentIncident });

      const executor = new SandboxExecutor();
      const result = await executor.executePlan(currentIncident.executionPlan, humanApproved);

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
      setIsExecuting(false);
      setCurrentIncident({ ...currentIncident });
    }
  }, [currentIncident, humanApproved, isExecuting]);

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opsroom-modal-title"
    >
      <div className="relative w-full max-w-7xl max-h-[92vh] overflow-y-auto bg-[#07080e] border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.2)] p-6 sm:p-8 flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300">
              <Flame className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="opsroom-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ACR OpsRoom Live War Room
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-400/30">
                  Atlas 2.0 • BFT Quorum
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic incident deliberation, Byzantine quorum consensus, and ToolHive sandboxed execution.
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playTick(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
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
      </div>
    </div>
  );
};
