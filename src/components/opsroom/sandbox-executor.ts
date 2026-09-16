import type { ExecutionPlan, ExecutionStep } from './types';

export interface SandboxExecutionResult {
  allSucceeded: boolean;
  executedSteps: ExecutionStep[];
  outputLog: string[];
  executionDurationMs: number;
}

export class SandboxExecutor {
  /**
   * Execute an Atlas 2.0 Execution Plan inside simulated ToolHive micro-sandboxes.
   */
  public async executePlan(
    plan: ExecutionPlan,
    humanApproved: boolean
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const outputLog: string[] = [];
    const executedSteps: ExecutionStep[] = [];

    outputLog.push(`[ToolHive] Initializing isolated micro-container environment...`);
    outputLog.push(`[ToolHive] Enforcing isolation profile: 'workspace-scoped', egress-allowlist locked.`);

    for (const step of plan.steps) {
      step.status = 'running';
      outputLog.push(`[ToolHive] Running step ${step.stepId}: ${step.serverName}/${step.toolName}...`);

      // Artificial small pause for UI realism
      await new Promise((r) => setTimeout(r, 350));

      // Security check: High risk requires HITL approval
      if (step.toolName.includes('drop') || step.toolName.includes('truncate') || step.toolName.includes('isolate')) {
        if (!humanApproved) {
          step.status = 'failed';
          outputLog.push(`[Security] Step ${step.stepId} requires Human-in-the-Loop dual consent. Execution paused.`);
          return {
            allSucceeded: false,
            executedSteps,
            outputLog,
            executionDurationMs: Date.now() - startTime,
          };
        }
      }

      step.status = 'completed';
      outputLog.push(`[ToolHive] Step ${step.stepId} completed with code 0 (no egress leaks).`);
      executedSteps.push(step);
    }

    outputLog.push(`[ToolHive] All ${plan.steps.length} execution DAG steps successfully committed.`);

    return {
      allSucceeded: true,
      executedSteps,
      outputLog,
      executionDurationMs: Date.now() - startTime,
    };
  }
}
