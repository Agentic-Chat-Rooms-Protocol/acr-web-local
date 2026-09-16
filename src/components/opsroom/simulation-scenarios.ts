import type { AgentSquad, ToolCallProposal } from './types';
import type { IncidentPreset } from './mock-data';

export interface ScenarioTurnData {
  agentRoleIndex: number;
  reasoning: string;
  proposedHypothesis: string;
  proposedActions: ToolCallProposal[];
  confidence: number;
  spokenLine: string;
}

export interface ScenarioConfig {
  summary: string;
  turns: ScenarioTurnData[];
  affectedNodes: string[];
  expectedLatencyRecoveryMs: number;
  expectedTrafficImpactPercent: number;
}

export function getScenarioForPreset(
  preset: IncidentPreset,
  _squad: AgentSquad,
  customTitle?: string,
  customDesc?: string
): ScenarioConfig {
  if (customTitle && customDesc && (!preset || preset.id === 'custom')) {
    return {
      summary: `Mitigation Plan: ${customTitle}`,
      affectedNodes: ['custom-cluster-node'],
      expectedLatencyRecoveryMs: -1500,
      expectedTrafficImpactPercent: 0,
      turns: [
        {
          agentRoleIndex: 1, // SRE
          reasoning: `Emergency custom telemetry divergence analyzed. Identified critical bottleneck in runtime pipeline for: "${customTitle}". Recommending immediate traffic throttling and container isolation.`,
          proposedHypothesis: 'Dynamic Runtime Bottleneck',
          proposedActions: [
            {
              toolName: 'isolate_target_workload',
              serverName: 'acr-sre-mcp',
              parameters: { target: 'custom-workload', graceSec: 5 },
              isDryRun: true,
              riskLevel: 'medium',
            },
          ],
          confidence: 0.93,
          spokenLine: `Dynamic anomaly confirmed for ${customTitle}. Initiating isolation dry-run.`,
        },
        {
          agentRoleIndex: 2, // SecOps
          reasoning: `Zero-Trust validation on emergency request "${customTitle}". Egress boundaries locked down. Authorizing ToolHive micro-container execution.`,
          proposedHypothesis: 'Egress Boundary Enforced',
          proposedActions: [],
          confidence: 0.97,
          spokenLine: 'Zero-trust perimeter intact. Security invariants verified.',
        },
        {
          agentRoleIndex: 0, // Atlas Orchestrator
          reasoning: `Atlas 2.0 Goal Decomposition complete for custom incident. Synthesized mitigation DAG with automated rollback step. Initiating Byzantine Quorum ballot.`,
          proposedHypothesis: 'Dynamic DAG Compiled',
          proposedActions: [
            {
              toolName: 'rebalance_workload_mesh',
              serverName: 'acr-mesh-mcp',
              parameters: { target: 'healthy-pool' },
              isDryRun: true,
              riskLevel: 'low',
            },
          ],
          confidence: 0.96,
          spokenLine: 'Goal decomposition complete. Requesting 67% Byzantine Quorum vote.',
        },
      ],
    };
  }

  switch (preset.id) {
    case 'preset-egress-anomaly':
      return {
        summary: 'Quarantine compromised worker pod, revoke leaked Auth Vault token, and shift egress traffic to verified mesh gateway.',
        affectedNodes: ['worker-pod-88', 'auth-vault-proxy'],
        expectedLatencyRecoveryMs: -45,
        expectedTrafficImpactPercent: 0,
        turns: [
          {
            agentRoleIndex: 2, // SecOps
            reasoning: 'Auth Vault Ingress anomaly verified: 37 unauthorized token mismatches on port 20445. Outbound network spike (4,850 MB/s) to unlisted IP 198.51.100.44 detected from worker-pod-88. Immediate quarantine required.',
            proposedHypothesis: 'Compromised Worker Pod Token Leaked',
            proposedActions: [
              {
                toolName: 'quarantine_pod',
                serverName: 'acr-secops-mcp',
                parameters: { podName: 'worker-pod-88', namespace: 'mesh-workers' },
                isDryRun: true,
                riskLevel: 'high',
              },
              {
                toolName: 'revoke_vault_token',
                serverName: 'acr-auth-vault-mcp',
                parameters: { tokenId: 'vault-tok-9921', cascadeRevoke: true },
                isDryRun: true,
                riskLevel: 'medium',
              },
            ],
            confidence: 0.98,
            spokenLine: 'Critical security anomaly. Egress spike to unlisted IP detected. Pod quarantine and token revocation required.',
          },
          {
            agentRoleIndex: 1, // SRE
            reasoning: 'SRE capacity analysis complete: Draining worker-pod-88 will shift 8% traffic load to standby pool pool-green-02. Zero SLA degradation projected.',
            proposedHypothesis: 'Traffic Absorption Feasible',
            proposedActions: [
              {
                toolName: 'shift_traffic_mesh',
                serverName: 'acr-mesh-mcp',
                parameters: { sourcePod: 'worker-pod-88', targetPool: 'pool-green-02' },
                isDryRun: true,
                riskLevel: 'low',
              },
            ],
            confidence: 0.95,
            spokenLine: 'Standby pool pool-green-02 has 40% headroom. Ready to absorb drain.',
          },
          {
            agentRoleIndex: 0, // Atlas
            reasoning: 'Atlas 2.0 compiled 3-step security containment DAG: quarantine pod -> revoke token -> shift mesh traffic. Rollback DAG generated in case of cascade. Initiating Byzantine Quorum.',
            proposedHypothesis: 'Security Containment DAG Synthesized',
            proposedActions: [],
            confidence: 0.97,
            spokenLine: 'Containment DAG compiled with rollback checkpoints. Ready for quorum ballot.',
          },
        ],
      };

    case 'preset-ingress-oom':
      return {
        summary: 'Patch Traefik memory allocation ceiling (+1.5 GiB) and scale deployment replicas from 4 to 12.',
        affectedNodes: ['ingress-traefik-prod'],
        expectedLatencyRecoveryMs: -4020,
        expectedTrafficImpactPercent: 0,
        turns: [
          {
            agentRoleIndex: 1, // SRE
            reasoning: 'Traefik ingress memory ceiling exhaustion confirmed. Pod restart rate at 18 events/10m. Latency p99 degraded to 4,200ms with 14.8% 503 errors. Recommending vertical heap boost and horizontal replica scaling.',
            proposedHypothesis: 'Payload Reassembly Buffer OOM',
            proposedActions: [
              {
                toolName: 'patch_deployment_resources',
                serverName: 'acr-k8s-mcp',
                parameters: { deployment: 'traefik-ingress', memoryLimit: '2048Mi', memoryRequest: '1024Mi' },
                isDryRun: true,
                riskLevel: 'medium',
              },
              {
                toolName: 'scale_ingress_replicas',
                serverName: 'acr-k8s-mcp',
                parameters: { deployment: 'traefik-ingress', replicas: 12 },
                isDryRun: true,
                riskLevel: 'low',
              },
            ],
            confidence: 0.96,
            spokenLine: 'Ingress memory ceiling reached. Latency spiking to 4.2 seconds. Need immediate heap increase and horizontal scale-out.',
          },
          {
            agentRoleIndex: 3, // DataOps
            reasoning: 'DataOps stream queue analysis: Traefik reassembly buffers are congested due to large JSON MCP batch calls. Replica scale-out to 12 will reduce per-pod queue depth by 66%.',
            proposedHypothesis: 'Queue Congestion Mitigated via Fanout',
            proposedActions: [],
            confidence: 0.94,
            spokenLine: 'Queue fanout verified. Backend services have sufficient bandwidth for 12 replicas.',
          },
          {
            agentRoleIndex: 0, // Atlas
            reasoning: 'Atlas 2.0 DAG compiled: Resource patch -> Replica scale-out. Preflight dry-run confirms zero node scheduling affinity violations. Initiating Byzantine Quorum.',
            proposedHypothesis: 'Scale-out Mitigation DAG Ready',
            proposedActions: [],
            confidence: 0.98,
            spokenLine: 'Scale-out mitigation plan verified. Opening Byzantine Quorum voting.',
          },
        ],
      };

    case 'preset-postgres-split-brain':
    default:
      return {
        summary: 'Isolate lagging follower db-replica-03 and route read traffic to healthy secondary replica read-replica-01.',
        affectedNodes: ['db-replica-03'],
        expectedLatencyRecoveryMs: -8200,
        expectedTrafficImpactPercent: 0,
        turns: [
          {
            agentRoleIndex: 1, // SRE
            reasoning: `Telemetry divergence verified: Replication lag on db-replica-03 reached 8,420ms (6.8σ above baseline). Primary WAL sender buffer saturated at 98.4%. Recommending isolated replica drain and route shift.`,
            proposedHypothesis: 'Primary Replication Lag Spike',
            proposedActions: [
              {
                toolName: 'isolate_failing_node',
                serverName: 'acr-sre-mcp',
                parameters: { targetNode: 'db-replica-03', drainGraceSec: 5 },
                isDryRun: true,
                riskLevel: 'medium',
              },
            ],
            confidence: 0.94,
            spokenLine: 'Replication lag matches WAL saturation signature. Node isolation required before transaction queue blocks.',
          },
          {
            agentRoleIndex: 2, // SecOps
            reasoning: 'Zero-Trust boundary check complete. No unauthorized token ingress found. Authorizing ToolHive micro-container with egress allowlist locked.',
            proposedHypothesis: 'Safe ToolHive Sandboxing',
            proposedActions: [],
            confidence: 0.96,
            spokenLine: 'Zero-trust egress allowlist verified. Proceeding to quorum vote.',
          },
          {
            agentRoleIndex: 0, // Atlas
            reasoning: 'Atlas 2.0 Goal Decomposition complete. Generated 2-step mitigation DAG with automated rollback step: isolate_failing_node -> activate_secondary_route. Initiating Byzantine Quorum ballot.',
            proposedHypothesis: 'DAG Mitigation Plan Compiled',
            proposedActions: [
              {
                toolName: 'activate_secondary_route',
                serverName: 'acr-mesh-mcp',
                parameters: { targetRoute: 'read-replica-01' },
                isDryRun: true,
                riskLevel: 'low',
              },
            ],
            confidence: 0.98,
            spokenLine: 'Mitigation DAG compiled with automatic rollback. Opening 67% Byzantine Quorum voting.',
          },
        ],
      };
  }
}
