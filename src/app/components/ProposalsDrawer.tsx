import React, { useState } from 'react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const openProposals = proposals.filter((p) => p.status === 'open');
  const closedProposals = proposals.filter((p) => p.status !== 'open');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposals-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#07080e] border-l border-white/[0.12] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6">
          {/* Top Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Vote className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="proposals-drawer-title" className="text-base font-bold text-white tracking-tight">
                    Consensus Ballots
                  </h3>
                  <p className="text-xs text-slate-400 font-mono-code">
                    #{activeRoomName} • Dissent Preservation Active
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close proposals drawer"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create Proposal Trigger / Form */}
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Launch New Consensus Proposal</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">New CIP Ballot</span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
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
                  className="w-full rounded-lg border border-white/[0.1] bg-black/60 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Rationale, capability boundaries, and voting terms..."
                  rows={2}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/60 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Anchoring...' : 'Broadcast Ballot'}</span>
                </button>
              </form>
            )}

            {/* Active Proposals List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>Active Proposals</span>
                <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[10px] font-mono-code">
                  {openProposals.length}
                </span>
              </div>

              {openProposals.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-6 text-center text-xs text-slate-500">
                  No open proposals in this room.
                </div>
              ) : (
                openProposals.map((prop) => (
                  <ProposalVotingCard
                    key={prop.id}
                    proposal={prop}
                    currentVoterDid={currentVoterDid}
                    onVote={onVote}
                    onClose={onCloseProposal}
                  />
                ))
              )}
            </div>

            {/* Resolved / Closed Proposals */}
            {closedProposals.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Resolved Ballots</span>
                  <span className="rounded bg-white/[0.04] text-slate-400 px-1.5 py-0.5 text-[10px] font-mono-code">
                    {closedProposals.length}
                  </span>
                </div>

                {closedProposals.map((prop) => (
                  <ProposalVotingCard
                    key={prop.id}
                    proposal={prop}
                    currentVoterDid={currentVoterDid}
                    onVote={onVote}
                    onClose={onCloseProposal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-white/[0.06] text-[10px] font-mono-code text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-cyan-400/80">
              <CheckCircle2 className="h-3 w-3" />
              <span>Cryptographic Dissent Invariant Holds</span>
            </span>
            <span>ACR v0.8.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
