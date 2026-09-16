/**
 * ACR OpsRoom - Canonical Types & Data Models
 * The Cryptographic, Byzantine-Fault-Tolerant War Room for Autonomous Enterprise AI.
 * Beyond Salesforce Agentforce & Slack AI.
 */

export type OpsSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type IncidentStatus = 
  | 'detecting'
  | 'deliberating'
  | 'awaiting_quorum'
  | 'executing'
  | 'verifying'
  | 'resolved'
  | 'mitigated'
  | 'escalated_human'
  | 'aborted';

export interface TelemetryMetric {
  metricName: string;
  value: number;
  unit: string;
  baselineMean: number;
  baselineStd: number;
  zScore: number;
  iqrLower?: number;
  iqrUpper?: number;
  isAnomaly: boolean;
  timestamp: number;
}

export type AgentRole = 
  | 'atlas_orchestrator'
  | 'sre_reliability'
  | 'secops_guardian'
  | 'dataops_engineer'
  | 'finops_overseer'
  | 'compliance_auditor';

export interface AgentProfile {
  id: string;
  did: string;
  role: AgentRole;
  name: string;
  capabilities: string[];
  voteWeight: number;
  publicKey: string;
  status: 'idle' | 'deliberating' | 'voting' | 'executing';
}

export interface AgentSquad {
  id: string;
  name: string;
  specialization: string;
  agents: AgentProfile[];
  consensusThreshold: number; // e.g. 0.67 for 2/3 Byzantine fault tolerance
}

export type DeliberationPhase = 
  | 'detect'
  | 'ground'
  | 'deliberate'
  | 'quorum'
  | 'execute'
  | 'verify'
  | 'completed'
  | 'vetoed';

export interface ToolCallProposal {
  toolName: string;
  serverName: string;
  parameters: Record<string, unknown>;
  isDryRun: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeliberationTurn {
  id: string;
  turnIndex: number;
  agentId: string;
  role: AgentRole;
  agentName: string;
  phase: DeliberationPhase;
  reasoning: string;
  proposedHypothesis?: string;
  proposedActions: ToolCallProposal[];
  confidence: number; // 0.0 - 1.0
  timestamp: number;
  signature: string; // Ed25519 signature of payload
}

export type VoteDecision = 'approve' | 'reject' | 'abstain';

export interface ConsensusBallot {
  ballotId: string;
  incidentId: string;
  agentId: string;
  did: string;
  role: AgentRole;
  decision: VoteDecision;
  confidenceScore: number; // 0.0 - 1.0
  weight: number;
  signedAt: number;
  signature: string; // Ed25519 signature
  justification: string;
}

export interface QuorumEvaluation {
  incidentId: string;
  thresholdReached: boolean;
  weightedApprovalRatio: number;
  weightedQuorumTarget: number; // typically 0.67
  totalWeightedVotes: number;
  approvalsWeight: number;
  rejectionsWeight: number;
  abstentionsWeight: number;
  byzantineAnomaliesDetected: string[];
  status: 'approved' | 'rejected' | 'escalated_human';
  evaluatedAt: number;
}

export interface ActionItem {
  id: string;
  title: string;
  assignedToRole: AgentRole;
  status: 'todo' | 'in_progress' | 'verified' | 'failed' | 'rolled_back';
  priority: 'p0' | 'p1' | 'p2';
  executionHash?: string;
}

export interface OpsCanvas {
  id: string;
  incidentId: string;
  title: string;
  version: number;
  status: IncidentStatus;
  summaryMarkdown: string;
  actionItems: ActionItem[];
  liveFields: {
    serviceName: string;
    affectedCluster: string;
    trafficImpactPercent: number;
    errorRateSpike: number;
    estimatedCostDriftUsd: number;
    activeQuorumRatio: number;
    mcpSandboxIsolation: 'workspace-scoped' | 'readonly-fs' | 'egress-allowlist' | 'no-network';
  };
  auditMerkleRoot: string;
  lastUpdated: number;
}

export interface ExecutionStep {
  stepId: string;
  toolName: string;
  serverName: string;
  parameters: Record<string, unknown>;
  dependencies: string[]; // stepIds that must complete before this step
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  rollbackStep?: ExecutionStep;
}

export interface ExecutionPlan {
  planId: string;
  incidentId: string;
  summary: string;
  steps: ExecutionStep[];
  preflightDryRunSuccess: boolean;
  simulatedStateDiff: Record<string, unknown>;
  generatedAt: number;
}

export interface HuddleSpeakerLine {
  speakerId: string;
  speakerName: string;
  role: AgentRole;
  text: string;
  timestamp: number;
  audioFrequencyData?: number[]; // simulated waveform amplitudes for audio rendering
}

export interface HuddleSession {
  huddleId: string;
  incidentId: string;
  activeAgents: AgentProfile[];
  lines: HuddleSpeakerLine[];
  executiveBrief?: string;
  startedAt: number;
  isStreaming: boolean;
}

export interface AuditCertificate {
  certificateId: string;
  incidentId: string;
  merkleRoot: string;
  timestamp: number;
  standard: 'SOC2-TypeII' | 'ISO27001-A.12.1' | 'FedRAMP-Moderate';
  signatures: {
    orchestratorDid: string;
    auditorDid: string;
    timestamp: number;
  };
  invariantsVerified: string[];
}

export interface OpsIncident {
  id: string;
  title: string;
  description: string;
  severity: OpsSeverity;
  status: IncidentStatus;
  createdAt: number;
  resolvedAt?: number;
  telemetry: TelemetryMetric[];
  squad: AgentSquad;
  deliberationTurns: DeliberationTurn[];
  executionPlan?: ExecutionPlan;
  ballots: ConsensusBallot[];
  quorum?: QuorumEvaluation;
  canvas: OpsCanvas;
  huddle?: HuddleSession;
}
