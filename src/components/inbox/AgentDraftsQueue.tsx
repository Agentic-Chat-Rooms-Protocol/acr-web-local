import React, { useState } from 'react';

export type DraftType = 'CODE_PR' | 'APPROVAL_GATE' | 'PLAYBOOK' | 'CONSENSUS_BALLOT';
export type DraftStatus = 'PENDING' | 'APPROVED' | 'VETOED';

export interface AgentDraftItem {
  id: string;
  blake3Hash: string;
  type: DraftType;
  title: string;
  proposingAgentDid: string;
  targetRepoOrRoom: string;
  createdAt: string;
  summary: string;
  diffPreview?: string;
  status: DraftStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface AgentDraftsQueueProps {
  isOpen?: boolean;
  onClose?: () => void;
  onApprove?: (draft: AgentDraftItem) => void;
  onVeto?: (draft: AgentDraftItem) => void;
  className?: string;
}

const INITIAL_DRAFTS: AgentDraftItem[] = [
  {
    id: 'draft-pr-104',
    blake3Hash: '3b8f1a92e4c01d7890abcdef1234567890abcdef1234567890abcdef12345678',
    type: 'CODE_PR',
    title: 'Cross-Repo Jujutsu & GitHub Deliberation Adapters',
    proposingAgentDid: 'did:key:z6Mkq3UfK84bB65YQ5M1r7A9C',
    targetRepoOrRoom: 'acr-opsroom',
    createdAt: '2026-10-04T02:45:10Z',
    summary: 'Implements zero-token-leakage GitHub and Jujutsu CLI runners with mockable CommandRunner abstraction.',
    diffPreview: '--- a/packages/core/src/index.ts\n+++ b/packages/core/src/index.ts\n@@ -20,3 +20,4 @@\n export * from "./pods/pod_controller.js";\n+export * from "./collab/index.js";\n',
    status: 'PENDING',
    riskLevel: 'LOW',
  },
  {
    id: 'draft-gate-082',
    blake3Hash: '7c92b4fa01e33887192837465546372819203948576152433425162738495061',
    type: 'APPROVAL_GATE',
    title: 'Production Failover: Scale SRE Standby Replica',
    proposingAgentDid: 'did:key:z6Mks7LpQ41dZ99NR8T3v2B5X',
    targetRepoOrRoom: '#incident-war-room',
    createdAt: '2026-10-04T02:50:22Z',
    summary: 'Elevates standby database replica to active primary following Byzantine telemetry consensus.',
    status: 'PENDING',
    riskLevel: 'HIGH',
  },
  {
    id: 'draft-pb-401',
    blake3Hash: 'a108c909e8f7a6b5c4d3e2f10987654321fedcba0987654321fedcba09876543',
    type: 'PLAYBOOK',
    title: 'DAG Playbook: Zero-Trust Egress Audit & PII Scrub',
    proposingAgentDid: 'did:key:z6Mkh1NqW38eF44RT6Y2u8C7V',
    targetRepoOrRoom: 'acr-bridge',
    createdAt: '2026-10-04T02:55:01Z',
    summary: 'Runs 3-stage validation pipeline: regex redaction, dynamic JWKS validation, and replay cache check.',
    status: 'PENDING',
    riskLevel: 'MEDIUM',
  },
];

export const AgentDraftsQueue: React.FC<AgentDraftsQueueProps> = ({
  isOpen = true,
  onClose,
  onApprove,
  onVeto,
  className = '',
}) => {
  const [drafts, setDrafts] = useState<AgentDraftItem[]>(INITIAL_DRAFTS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | DraftType>('ALL');
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);

  const handleApprove = (draft: AgentDraftItem) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draft.id ? { ...d, status: 'APPROVED' } : d))
    );
    onApprove?.(draft);
  };

  const handleVeto = (draft: AgentDraftItem) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draft.id ? { ...d, status: 'VETOED' } : d))
    );
    onVeto?.(draft);
  };

  const filteredDrafts = drafts.filter((d) =>
    activeFilter === 'ALL' ? true : d.type === activeFilter
  );

  const pendingCount = drafts.filter((d) => d.status === 'PENDING').length;

  const getRiskBadge = (risk: AgentDraftItem['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            [RISK: LOW]
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950 text-amber-300 border border-amber-800">
            [RISK: MED]
          </span>
        );
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-950 text-rose-300 border border-rose-800">
            [RISK: HIGH]
          </span>
        );
    }
  };

  const getStatusBadge = (status: DraftStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-600">
            [PENDING REVIEW]
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600">
            [APPROVED & SIGNED]
          </span>
        );
      case 'VETOED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-600">
            [VETOED & HALTED]
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`flex flex-col h-full bg-neutral-900 border-l border-neutral-750 text-neutral-100 ${className}`}
      aria-label="Agent Drafts Review Queue"
      role="complementary"
    >
      {/* Header */}
      <div className="p-4 bg-neutral-850 border-b border-neutral-750 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Agent Drafts Queue
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-800 text-sky-400 border border-sky-500/40">
              [{pendingCount} PENDING]
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1 font-mono">
            Cryptographic Human Approval Gate Checkpoints
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close review queue drawer"
          >
            [CLOSE]
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto"
        role="tablist"
        aria-label="Draft filters"
      >
        {(['ALL', 'CODE_PR', 'APPROVAL_GATE', 'PLAYBOOK'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              activeFilter === filter
                ? 'bg-neutral-750 text-white font-semibold border border-neutral-600'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            [{filter}]
          </button>
        ))}
      </div>

      {/* Draft Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredDrafts.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-400">
            [No drafts matching current filter]
          </div>
        ) : (
          filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className="p-3.5 rounded-lg border border-neutral-750 bg-neutral-850/90 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                  [{draft.type}]
                </span>
                <div className="flex items-center gap-1.5">
                  {getRiskBadge(draft.riskLevel)}
                  {getStatusBadge(draft.status)}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white leading-snug">
                {draft.title}
              </h3>

              <p className="text-xs text-neutral-200 mt-1.5 leading-relaxed">
                {draft.summary}
              </p>

              <div className="mt-2.5 p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
                <div className="truncate">
                  <span className="text-neutral-400">Target:</span> {draft.targetRepoOrRoom}
                </div>
                <div className="truncate">
                  <span className="text-neutral-400">Actor:</span> {draft.proposingAgentDid}
                </div>
                <div className="truncate">
                  <span className="text-neutral-400">BLAKE3:</span> {draft.blake3Hash.slice(0, 16)}...
                </div>
              </div>

              {draft.diffPreview && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDiffId(expandedDiffId === draft.id ? null : draft.id)
                    }
                    className="text-xs font-mono text-sky-400 hover:text-sky-300 hover:underline focus:outline-none"
                  >
                    {expandedDiffId === draft.id ? '[HIDE DIFF]' : '[INSPECT DIFF]'}
                  </button>
                  {expandedDiffId === draft.id && (
                    <pre className="mt-2 p-2 rounded bg-black/80 border border-neutral-800 font-mono text-[11px] text-neutral-200 overflow-x-auto whitespace-pre">
                      {draft.diffPreview}
                    </pre>
                  )}
                </div>
              )}

              {draft.status === 'PENDING' && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleVeto(draft)}
                    className="px-3 py-1 text-xs font-mono font-semibold rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    [VETO REJECT]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(draft)}
                    className="px-3 py-1 text-xs font-mono font-semibold rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    [APPROVE & SIGN]
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
