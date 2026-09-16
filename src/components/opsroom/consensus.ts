import type { 
  ConsensusBallot, 
  QuorumEvaluation, 
  AgentProfile, 
  AgentSquad, 
  VoteDecision 
} from './types';
import { signPayloadEd25519, verifySignature } from './crypto-browser';

export class ByzantineConsensusEngine {
  public static DEFAULT_QUORUM_TARGET = 0.67; // 2/3 Byzantine Fault Tolerance threshold

  /**
   * Cast and cryptographically sign a ballot on behalf of an agent
   */
  public static signBallot(
    incidentId: string,
    agent: AgentProfile,
    decision: VoteDecision,
    confidenceScore: number,
    justification: string
  ): ConsensusBallot {
    const ballotId = `ballot-${incidentId}-${agent.id}-${Date.now()}`;
    const signedAt = Date.now();

    const payload = `${ballotId}:${incidentId}:${agent.did}:${decision}:${confidenceScore}:${agent.voteWeight}:${signedAt}`;
    const signature = signPayloadEd25519(payload, agent.publicKey);

    return {
      ballotId,
      incidentId,
      agentId: agent.id,
      did: agent.did,
      role: agent.role,
      decision,
      confidenceScore,
      weight: agent.voteWeight,
      signedAt,
      signature,
      justification,
    };
  }

  /**
   * Verify an Ed25519 ballot's cryptographic signature
   */
  public static verifyBallot(ballot: ConsensusBallot, agent: AgentProfile): boolean {
    const payload = `${ballot.ballotId}:${ballot.incidentId}:${ballot.did}:${ballot.decision}:${ballot.confidenceScore}:${ballot.weight}:${ballot.signedAt}`;
    return verifySignature(payload, ballot.signature, agent.publicKey);
  }

  /**
   * Mathematically evaluate Byzantine Quorum across squad ballots
   */
  public static evaluateQuorum(
    incidentId: string,
    squad: AgentSquad,
    ballots: ConsensusBallot[]
  ): QuorumEvaluation {
    const anomalies: string[] = [];
    let approvalsWeight = 0;
    let rejectionsWeight = 0;
    let abstentionsWeight = 0;

    const agentMap = new Map<string, AgentProfile>();
    for (const ag of squad.agents) {
      agentMap.set(ag.id, ag);
    }

    for (const ballot of ballots) {
      const agent = agentMap.get(ballot.agentId);
      if (!agent) {
        anomalies.push(`Ballot cast by unlisted agent: ${ballot.agentId}`);
        continue;
      }

      // Check signature integrity
      if (!this.verifyBallot(ballot, agent)) {
        anomalies.push(`Cryptographic signature failure on ballot ${ballot.ballotId} from ${ballot.agentId}`);
        continue;
      }

      // Byzantine confidence check (0.0 to 1.0)
      if (ballot.confidenceScore < 0 || ballot.confidenceScore > 1.0) {
        anomalies.push(`Out-of-bounds confidence score ${ballot.confidenceScore} from ${ballot.agentId}`);
        continue;
      }

      const weightedScore = ballot.weight * ballot.confidenceScore;

      if (ballot.decision === 'approve') {
        approvalsWeight += weightedScore;
      } else if (ballot.decision === 'reject') {
        rejectionsWeight += weightedScore;
      } else {
        abstentionsWeight += ballot.weight;
      }
    }

    const decisiveTotal = approvalsWeight + rejectionsWeight;
    const approvalRatio = decisiveTotal > 0 ? approvalsWeight / decisiveTotal : 0;
    const thresholdReached = approvalRatio >= squad.consensusThreshold && anomalies.length === 0;

    let status: 'approved' | 'rejected' | 'escalated_human' = 'rejected';
    if (anomalies.length > 0) {
      status = 'escalated_human';
    } else if (thresholdReached) {
      status = 'approved';
    } else if (decisiveTotal > 0) {
      status = 'rejected';
    }

    return {
      incidentId,
      thresholdReached,
      weightedApprovalRatio: approvalRatio,
      weightedQuorumTarget: squad.consensusThreshold,
      totalWeightedVotes: decisiveTotal + abstentionsWeight,
      approvalsWeight,
      rejectionsWeight,
      abstentionsWeight,
      byzantineAnomaliesDetected: anomalies,
      status,
      evaluatedAt: Date.now(),
    };
  }
}
