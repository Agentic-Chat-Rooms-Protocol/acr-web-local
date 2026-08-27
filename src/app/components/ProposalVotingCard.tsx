import React, { useState } from 'react';
import {
  Vote,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageSquare,
} from 'lucide-react';
import type { Proposal } from '../../types/protocol';

interface ProposalVotingCardProps {
  proposal: Proposal;
  currentVoterDid: string;
  onVote: (proposalId: string, choice: string, rationale?: string) => Promise<void>;
  onClose: (proposalId: string) => Promise<void>;
}

export const ProposalVotingCard: React.FC<ProposalVotingCardProps> = ({
  proposal,
  currentVoterDid,
  onVote,
  onClose,
}) => {
  const [dissentRationale, setDissentRationale] = useState('');
  const [showDissentInput, setShowDissentInput] = useState(false);
  const [showDissentLogs, setShowDissentLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const votes = proposal.votes || {};
  const totalVotes = Object.keys(votes).length;

  let approveCount = 0;
  let rejectCount = 0;
  let dissentCount = 0;

  Object.values(votes).forEach((v) => {
    const val = v.toUpperCase();
    if (val === 'APPROVE' || val === 'YES') approveCount++;
    else if (val === 'REJECT' || val === 'NO') rejectCount++;
    else if (val === 'DISSENT') dissentCount++;
  });

  const approvePct = totalVotes > 0 ? (approveCount / totalVotes) * 100 : 0;
  const rejectPct = totalVotes > 0 ? (rejectCount / totalVotes) * 100 : 0;
  const dissentPct = totalVotes > 0 ? (dissentCount / totalVotes) * 100 : 0;

  const userVote = votes[currentVoterDid];
  const isOpen = proposal.status === 'open';

  const handleCastVote = async (choice: string, rationale?: string) => {
    setIsSubmitting(true);
    try {
      await onVote(proposal.id, choice, rationale);
      setShowDissentInput(false);
      setDissentRationale('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#07080e]/85 backdrop-blur-xl p-4 shadow-xl space-y-3 transition-all hover:border-cyan-500/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono-code font-bold text-cyan-400 border border-cyan-500/20">
              <Vote className="h-3 w-3" />
              {proposal.id}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : proposal.status === 'passed'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {proposal.status}
            </span>
          </div>
          <h4 className="text-xs font-bold text-white tracking-tight">{proposal.title}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">{proposal.description}</p>
        </div>

        {isOpen && (
          <button
            onClick={() => onClose(proposal.id)}
            className="shrink-0 flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-mono-code text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Tally consensus and finalize ballot"
          >
            <Lock className="h-2.5 w-2.5" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* Progress Tally Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-black/40 border border-white/[0.06] overflow-hidden flex">
          {approvePct > 0 && (
            <div
              style={{ width: `${approvePct}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Approve: ${approveCount} (${approvePct.toFixed(0)}%)`}
            />
          )}
          {rejectPct > 0 && (
            <div
              style={{ width: `${rejectPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
              title={`Reject: ${rejectCount} (${rejectPct.toFixed(0)}%)`}
            />
          )}
          {dissentPct > 0 && (
            <div
              style={{ width: `${dissentPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Dissent: ${dissentCount} (${dissentPct.toFixed(0)}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400 pt-0.5">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" /> Approve: {approveCount}
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <XCircle className="h-2.5 w-2.5" /> Reject: {rejectCount}
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-2.5 w-2.5" /> Dissent: {dissentCount}
          </span>
        </div>
      </div>

      {/* Action Buttons (when open) */}
      {isOpen && (
        <div className="pt-1">
          {userVote ? (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-mono-code text-cyan-300">
              <span className="text-slate-400">Your Ballot:</span>
              <span className="font-bold text-white">{userVote}</span>
              <span className="text-[10px] text-slate-500">(anchored into hash chain)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleCastVote('APPROVE')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Approve</span>
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleCastVote('REJECT')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="h-3 w-3" />
                <span>Reject</span>
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => setShowDissentInput(!showDissentInput)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Dissent...</span>
              </button>
            </div>
          )}

          {/* Dissent Rationale Popover (GAP-08) */}
          {showDissentInput && !userVote && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                <MessageSquare className="h-3 w-3" />
                <span>Preserve Dissenting Rationale (Immutable Audit Entry)</span>
              </div>
              <textarea
                value={dissentRationale}
                onChange={(e) => setDissentRationale(e.target.value)}
                placeholder="Explain architectural, security, or capability invariants breached by this proposal..."
                rows={2}
                className="w-full rounded-md border border-white/[0.1] bg-black/60 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDissentInput(false)}
                  className="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!dissentRationale.trim() || isSubmitting}
                  onClick={() => handleCastVote('DISSENT', dissentRationale)}
                  className="rounded bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Confirm & Anchor Dissent
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dissent Records Section (GAP-08) */}
      {proposal.dissent_logs && proposal.dissent_logs.length > 0 && (
        <div className="border-t border-white/[0.06] pt-2">
          <button
            onClick={() => setShowDissentLogs(!showDissentLogs)}
            className="flex items-center justify-between w-full text-[10px] font-mono-code text-amber-400/90 hover:text-amber-300"
          >
            <span>Recorded Dissents ({proposal.dissent_logs.length})</span>
            {showDissentLogs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showDissentLogs && (
            <div className="mt-2 space-y-2">
              {proposal.dissent_logs.map((d, i) => (
                <div key={i} className="rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-mono-code text-[9px] text-slate-400">
                    <span className="font-bold text-amber-300">{d.agent_name || d.voter_did}</span>
                    <span>{new Date(d.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 italic">"{d.rationale}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
