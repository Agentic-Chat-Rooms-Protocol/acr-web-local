import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Vote, X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProposalVotingCard } from './ProposalVotingCard';
import type { Proposal } from '../../types/protocol';

interface ProposalsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: Proposal[];
  activeRoomName: string;
  currentVoterDid: string;
  onVote: (proposalId: string, choice: string, rationale?: string) => Promise<void>;
  onCloseProposal: (proposalId: string) => Promise<void>;
  onCreateProposal: (title: string, description: string, options?: string[]) => Promise<void>;
}

export const ProposalsDrawer: React.FC<ProposalsDrawerProps> = ({
  isOpen,
  onClose,
  proposals,
  activeRoomName,
  currentVoterDid,
  onVote,
  onCloseProposal,
  onCreateProposal,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to determine latest activity timestamp (creation, votes, dissents)
  const getProposalActivityTime = (p: Proposal): number => {
    let latest = p.created_at ? new Date(p.created_at).getTime() : 0;
    if (p.closed_at) {
      const ct = new Date(p.closed_at).getTime();
      if (ct > latest) latest = ct;
    }
    if (p.dissent_logs && p.dissent_logs.length > 0) {
      for (const d of p.dissent_logs) {
        const dt = d.timestamp ? new Date(d.timestamp).getTime() : 0;
        if (dt > latest) latest = dt;
      }
    }
    if (p.votes) {
      latest += Object.keys(p.votes).length * 1000;
    }
    return latest;
  };

  const sortedOpenProposals = useMemo(() => {
    return proposals
      .filter((p) => p.status === 'open')
      .sort((a, b) => getProposalActivityTime(b) - getProposalActivityTime(a));
  }, [proposals]);

  const sortedClosedProposals = useMemo(() => {
    return proposals
      .filter((p) => p.status !== 'open')
      .sort((a, b) => getProposalActivityTime(b) - getProposalActivityTime(a));
  }, [proposals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateProposal(newTitle, newDesc);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposals-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-[#000000]/75 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D0D11] border-l border-white/[0.12] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6">
          {/* Top Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
                  <Vote className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="proposals-drawer-title" className="text-base font-bold text-white tracking-tight">
                    Consensus Ballots
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-mono-code">
                    #{activeRoomName} • Dissent Preservation Active
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close proposals drawer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create Proposal Trigger / Form */}
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl border border-[#FF5500]/35 bg-[#FF5500]/10 px-4 py-2.5 text-xs font-bold text-[#FF8C42] hover:bg-[#FF5500]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <Plus className="h-4 w-4" />
                <span>Launch New Consensus Proposal</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="rounded-xl border border-[#FF5500]/35 bg-[#FF5500]/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF8C42]">New CIP Ballot</span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-[10px] text-[#D4D4D8] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded px-1"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Proposal Title (e.g. CIP-104: AST Diff Invariant)"
                  className="w-full rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Rationale, capability boundaries, and voting terms..."
                  rows={2}
                  className="w-full rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isSubmitting}
                  className="min-h-[44px] w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#FF5500] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#FF8C42] transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Anchoring...' : 'Broadcast Ballot'}</span>
                </button>
              </form>
            )}

            {/* Active Proposals List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                <span>Active Proposals</span>
                <span className="rounded bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 text-[10px] font-mono-code font-bold">
                  {sortedOpenProposals.length}
                </span>
              </div>

              {sortedOpenProposals.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-[#000000]/50 p-6 text-center text-xs text-[#A1A1AA]">
                  No open proposals in this room.
                </div>
              ) : (
                sortedOpenProposals.map((prop) => (
                  <motion.div
                    key={prop.id}
                    layout={!prefersReducedMotion}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 35 }}
                  >
                    <ProposalVotingCard
                      proposal={prop}
                      currentVoterDid={currentVoterDid}
                      onVote={onVote}
                      onClose={onCloseProposal}
                    />
                  </motion.div>
                ))
              )}
            </div>

            {/* Resolved / Closed Proposals */}
            {sortedClosedProposals.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <span>Resolved Ballots</span>
                  <span className="rounded bg-white/[0.04] text-[#A1A1AA] px-1.5 py-0.5 text-[10px] font-mono-code">
                    {sortedClosedProposals.length}
                  </span>
                </div>

                {sortedClosedProposals.map((prop) => (
                  <motion.div
                    key={prop.id}
                    layout={!prefersReducedMotion}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 35 }}
                  >
                    <ProposalVotingCard
                      proposal={prop}
                      currentVoterDid={currentVoterDid}
                      onVote={onVote}
                      onClose={onCloseProposal}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-white/[0.06] text-[10px] font-mono-code text-[#A1A1AA] flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#FF8C42]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Cryptographic Dissent Invariant Holds</span>
            </span>
            <span>ACR v1.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
