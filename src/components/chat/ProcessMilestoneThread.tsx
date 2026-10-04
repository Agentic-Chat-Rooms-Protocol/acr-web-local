import React, { useState } from 'react';

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PARKED' | 'FAILED';
export type StepStatus = 'PASS' | 'RUNNING' | 'FAIL' | 'PARKED';

export interface ProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  agentDid: string;
  status: StepStatus;
  latencyMs?: number;
  costUsd?: number;
  hashHex?: string;
  notes?: string;
}

export interface ProcessMilestone {
  id: string;
  milestoneNumber: number;
  title: string;
  status: MilestoneStatus;
  timestamp: string;
  authorDid: string;
  summary: string;
  steps: ProcessStep[];
}

interface ProcessMilestoneThreadProps {
  milestone: ProcessMilestone;
  onStepClick?: (step: ProcessStep) => void;
  className?: string;
}

export const ProcessMilestoneThread: React.FC<ProcessMilestoneThreadProps> = ({
  milestone,
  onStepClick,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const getMilestoneStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600">
            [COMPLETED]
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-500 animate-pulse">
            [IN_PROGRESS]
          </span>
        );
      case 'PARKED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-500">
            [PARKED ON GATE]
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-500">
            [FAILED]
          </span>
        );
    }
  };

  const getStepStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">
            [PASS]
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-600 animate-pulse">
            [RUNNING]
          </span>
        );
      case 'PARKED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-600">
            [PARKED]
          </span>
        );
      case 'FAIL':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-600">
            [FAIL]
          </span>
        );
    }
  };

  const completedSteps = milestone.steps.filter((s) => s.status === 'PASS').length;

  return (
    <article
      className={`rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 overflow-hidden shadow-md my-3 ${className}`}
      aria-label={`Milestone ${milestone.milestoneNumber}: ${milestone.title}`}
    >
      {/* Milestone Header */}
      <header className="p-4 bg-neutral-850 border-b border-neutral-750 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-neutral-800 text-amber-400 border border-amber-500/40 tracking-wider">
            [MILESTONE {milestone.milestoneNumber}]
          </span>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              {milestone.title}
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5 font-mono">
              Proposer: {milestone.authorDid} | {milestone.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {getMilestoneStatusBadge(milestone.status)}
          <span className="text-xs font-mono text-neutral-300 px-2 py-1 rounded bg-neutral-800 border border-neutral-700">
            {completedSteps}/{milestone.steps.length} STEPS
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-expanded={isExpanded}
            aria-controls={`milestone-steps-${milestone.id}`}
          >
            {isExpanded ? '[COLLAPSE]' : `[EXPAND (${milestone.steps.length})]`}
          </button>
        </div>
      </header>

      {/* Milestone Summary */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-sm text-neutral-200 leading-relaxed">
        {milestone.summary}
      </div>

      {/* Threaded Steps Sub-View */}
      {isExpanded && (
        <div
          id={`milestone-steps-${milestone.id}`}
          className="p-3 bg-neutral-950/70 divide-y divide-neutral-800/80"
          role="region"
          aria-label={`Steps for Milestone ${milestone.milestoneNumber}`}
        >
          {milestone.steps.map((step) => (
            <div
              key={step.id}
              onClick={() => onStepClick?.(step)}
              className="py-2.5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-neutral-850/60 rounded transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-3">
                <span className="text-neutral-500 font-mono text-xs select-none">|-</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                  [STEP {step.stepNumber}]
                </span>
                <div>
                  <span className="text-sm font-medium text-neutral-100 group-hover:text-sky-300 transition-colors">
                    {step.title}
                  </span>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Actor: {step.agentDid}</span>
                    {step.hashHex && <span>| Hash: {step.hashHex.slice(0, 12)}...</span>}
                    {step.notes && <span>| {step.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-6 md:pl-0 font-mono text-xs">
                {typeof step.latencyMs === 'number' && (
                  <span className="text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                    {step.latencyMs}ms
                  </span>
                )}
                {typeof step.costUsd === 'number' && (
                  <span className="text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                    ${step.costUsd.toFixed(4)}
                  </span>
                )}
                {getStepStatusBadge(step.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
