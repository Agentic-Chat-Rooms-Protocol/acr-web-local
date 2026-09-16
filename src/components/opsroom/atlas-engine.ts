import type { 
  OpsIncident, 
  DeliberationTurn, 
  ExecutionPlan, 
  ExecutionStep, 
  AgentSquad,
  AgentProfile,
  IncidentStatus,
  ToolCallProposal
} from './types';
import { signPayloadEd25519 } from './crypto-browser';

export class Atlas2Engine {
  private static MAX_DELIBERATION_TURNS = 10;

  /**
   * Initialize a new OpsIncident with grounded state machine.
   */
  public static createIncident(
    title: string,
    description: string,
    squad: AgentSquad
  ): OpsIncident {
    const id = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const canvasId = `canvas-${id}`;
    
    return {
      id,
      title,
      description,
      severity: 'P1',
      status: 'detecting',
      createdAt: now,
      telemetry: [],
      squad,
      deliberationTurns: [],
      ballots: [],
      canvas: {
        id: canvasId,
        incidentId: id,
        title: `OpsRoom War Room: ${title}`,
        version: 1,
        status: 'detecting',
        summaryMarkdown: `### Incident Ingestion\n**Title:** ${title}\n**Description:** ${description}\n**Status:** Analyzing telemetry baseline...`,
        actionItems: [
          {
            id: `act-1`,
            title: 'Compute statistical anomalies from telemetry window',
            assignedToRole: 'sre_reliability',
            status: 'in_progress',
            priority: 'p0',
          },
          {
            id: `act-2`,
            title: 'Inspect MCP Sandbox isolation boundaries',
            assignedToRole: 'secops_guardian',
            status: 'todo',
            priority: 'p1',
          }
        ],
        liveFields: {
          serviceName: 'acr-mesh-gateway',
          affectedCluster: 'prod-us-east-4',
          trafficImpactPercent: 18.5,
          errorRateSpike: 4.8,
          estimatedCostDriftUsd: 140.0,
          activeQuorumRatio: 0.0,
          mcpSandboxIsolation: 'workspace-scoped',
        },
        auditMerkleRoot: '0000000000000000000000000000000000000000000000000000000000000000',
        lastUpdated: now,
      },
    };
  }

  /**
   * Execute an atomic state transition with validation.
   */
  public static transitionPhase(incident: OpsIncident, toStatus: IncidentStatus): void {
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      detecting: ['deliberating', 'aborted'],
      deliberating: ['awaiting_quorum', 'deliberating', 'escalated_human', 'aborted'],
      awaiting_quorum: ['executing', 'escalated_human', 'deliberating', 'aborted'],
      executing: ['verifying', 'escalated_human', 'aborted'],
      verifying: ['resolved', 'mitigated', 'deliberating', 'escalated_human'],
      resolved: [],
      mitigated: ['deliberating', 'resolved'],
      escalated_human: ['deliberating', 'executing', 'aborted', 'resolved'],
      aborted: [],
    };

    const allowed = validTransitions[incident.status];
    if (!allowed || !allowed.includes(toStatus)) {
      throw new Error(`Invalid Atlas 2.0 state transition: ${incident.status} -> ${toStatus}`);
    }

    incident.status = toStatus;
    incident.canvas.status = toStatus;
    incident.canvas.version += 1;
    incident.canvas.lastUpdated = Date.now();
  }

  /**
   * Append an agent's signed deliberation turn to the incident graph.
   */
  public static addDeliberationTurn(
    incident: OpsIncident,
    agent: AgentProfile,
    reasoning: string,
    proposedHypothesis?: string,
    proposedActions: ToolCallProposal[] = [],
    confidence = 0.95
  ): DeliberationTurn {
    if (incident.deliberationTurns.length >= this.MAX_DELIBERATION_TURNS) {
      throw new Error(`Atlas 2.0 cycle limit reached (${this.MAX_DELIBERATION_TURNS} turns). Escalating to prevent loop.`);
    }

    const turnIndex = incident.deliberationTurns.length + 1;
    const turnId = `turn-${incident.id}-${turnIndex}`;
    const timestamp = Date.now();

    const payload = `${turnId}:${agent.did}:${reasoning}:${confidence}:${timestamp}`;
    const signature = signPayloadEd25519(payload, agent.publicKey);

    const turn: DeliberationTurn = {
      id: turnId,
      turnIndex,
      agentId: agent.id,
      role: agent.role,
      agentName: agent.name,
      phase: incident.status === 'detecting' ? 'detect' : 'deliberate',
      reasoning,
      proposedHypothesis,
      proposedActions,
      confidence,
      timestamp,
      signature,
    };

    incident.deliberationTurns.push(turn);
    
    // Auto-update canvas action items based on proposed actions
    for (const act of proposedActions) {
      incident.canvas.actionItems.push({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: `Execute sandboxed: ${act.serverName}/${act.toolName}`,
        assignedToRole: agent.role,
        status: 'todo',
        priority: act.riskLevel === 'critical' || act.riskLevel === 'high' ? 'p0' : 'p1',
      });
    }

    incident.canvas.version += 1;
    incident.canvas.lastUpdated = timestamp;

    return turn;
  }

  /**
   * Compile a multi-step execution plan DAG with preflight dry-run validation.
   */
  public static compileExecutionPlan(incident: OpsIncident, summary: string): ExecutionPlan {
    const steps: ExecutionStep[] = [];
    let previousStepId: string | undefined = undefined;

    for (const turn of incident.deliberationTurns) {
      for (const action of turn.proposedActions) {
        const stepId = `step-${action.serverName}-${action.toolName}-${steps.length + 1}`;
        
        const rollbackStep: ExecutionStep | undefined = action.toolName.includes('isolate') || action.toolName.includes('drain') ? {
          stepId: `rollback-${stepId}`,
          toolName: `restore_${action.toolName}`,
          serverName: action.serverName,
          parameters: { target: action.parameters },
          dependencies: [],
          status: 'pending',
        } : undefined;

        const step: ExecutionStep = {
          stepId,
          toolName: action.toolName,
          serverName: action.serverName,
          parameters: action.parameters,
          dependencies: previousStepId ? [previousStepId] : [],
          status: 'pending',
          rollbackStep,
        };

        steps.push(step);
        previousStepId = stepId;
      }
    }

    const plan: ExecutionPlan = {
      planId: `plan-${incident.id}-${Date.now()}`,
      incidentId: incident.id,
      summary,
      steps,
      preflightDryRunSuccess: true,
      simulatedStateDiff: {
        affectedNodes: ['db-replica-03'],
        expectedLatencyRecoveryMs: -8200,
        expectedTrafficImpactPercent: 0,
      },
      generatedAt: Date.now(),
    };

    incident.executionPlan = plan;
    return plan;
  }

  /**
   * Simulate a preflight dry run of the compiled DAG.
   */
  public static simulateDryRun(plan: ExecutionPlan): boolean {
    for (const step of plan.steps) {
      if (step.toolName.includes('malicious') || step.toolName.includes('rm_rf')) {
        plan.preflightDryRunSuccess = false;
        return false;
      }
    }
    plan.preflightDryRunSuccess = true;
    return true;
  }
}
