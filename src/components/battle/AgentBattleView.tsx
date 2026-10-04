import React, { useState } from 'react';

export interface BattleCandidate {
  id: string;
  name: string;
  model: string;
  promptStrategy: string;
  harness: string;
  latencyMs: number;
  spendUsd: number;
  tokens: number;
  coveragePct: number;
  paretoRank: number;
  paretoStatus: 'NON_DOMINATED' | 'DOMINATED' | 'COST_OPTIMAL';
  outputContent: string;
  votes: number;
  wilsonLowerBound: number;
}

interface AgentBattleViewProps {
  onVote?: (candidateId: string) => void;
  onPrune?: (candidateId: string) => void;
  className?: string;
}

const DEFAULT_CANDIDATE_A: BattleCandidate = {
  id: 'cand-a',
  name: 'Agent Did-01',
  model: 'Claude-3.7-Sonnet',
  promptStrategy: 'ReAct + Honest Scoring',
  harness: 'Multi-Way ANOVA DoE',
  latencyMs: 184,
  spendUsd: 0.0024,
  tokens: 418,
  coveragePct: 99.2,
  paretoRank: 1,
  paretoStatus: 'NON_DOMINATED',
  outputContent: `// Strategic Deliberation Proposal: Fail-Closed Gate Enforcement
export async function enforceQuorumGate(ballots: Ballot[]): Promise<GateVerdict> {
  const supermajority = ballots.filter(b => b.confidence >= 0.67);
  if (supermajority.length / ballots.length < 0.67) {
    return { verdict: 'PARK_AWAITING_APPROVAL', rationale: 'Quorum below threshold' };
  }
  return { verdict: 'APPROVE', rationale: 'Supermajority verified without dissent' };
}`,
  votes: 14,
  wilsonLowerBound: 0.824,
};

const DEFAULT_CANDIDATE_B: BattleCandidate = {
  id: 'cand-b',
  name: 'Agent Did-02',
  model: 'DeepSeek-R1',
  promptStrategy: 'Plan-and-Solve + Tooling Guard',
  harness: 'Darwin Loop Mid-Tier',
  latencyMs: 312,
  spendUsd: 0.0011,
  tokens: 526,
  coveragePct: 96.8,
  paretoRank: 1,
  paretoStatus: 'COST_OPTIMAL',
  outputContent: `// Cost-Optimized Quorum Gate Implementation
export async function enforceQuorumGate(ballots: Ballot[]): Promise<GateVerdict> {
  let approves = 0;
  for (const b of ballots) {
    if (b.verdict === 'REJECT') return { verdict: 'VETO_HALT' };
    if (b.verdict === 'APPROVE') approves++;
  }
  return approves >= Math.ceil(ballots.length * 0.67)
    ? { verdict: 'APPROVE' }
    : { verdict: 'PARK_AWAITING_APPROVAL' };
}`,
  votes: 9,
  wilsonLowerBound: 0.672,
};

export const AgentBattleView: React.FC<AgentBattleViewProps> = ({
  onVote,
  onPrune,
  className = '',
}) => {
  const [candidateA, setCandidateA] = useState<BattleCandidate>(DEFAULT_CANDIDATE_A);
  const [candidateB, setCandidateB] = useState<BattleCandidate>(DEFAULT_CANDIDATE_B);
  const [selectedPrompt, setSelectedPrompt] = useState<string>(
    'Implement Byzantine Fault Recovery with fail-closed human veto gates under adversarial conditions.'
  );
  const [userVoted, setUserVoted] = useState<string | null>(null);

  const handleVote = (candidateId: string) => {
    if (userVoted) return;
    setUserVoted(candidateId);
    if (candidateId === candidateA.id) {
      setCandidateA((prev) => ({
        ...prev,
        votes: prev.votes + 1,
        wilsonLowerBound: Math.min(1.0, prev.wilsonLowerBound + 0.02),
      }));
    } else if (candidateId === candidateB.id) {
      setCandidateB((prev) => ({
        ...prev,
        votes: prev.votes + 1,
        wilsonLowerBound: Math.min(1.0, prev.wilsonLowerBound + 0.02),
      }));
    }
    onVote?.(candidateId);
  };

  const getParetoBadge = (status: BattleCandidate['paretoStatus']) => {
    switch (status) {
      case 'NON_DOMINATED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600">
            [NON-DOMINATED - RANK 1]
          </span>
        );
      case 'COST_OPTIMAL':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-600">
            [PARETO OPTIMAL - COST]
          </span>
        );
      case 'DOMINATED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-600">
            [DOMINATED - SUBOPTIMAL]
          </span>
        );
    }
  };

  return (
    <section
      className={`rounded-lg border border-neutral-750 bg-neutral-900 text-neutral-100 p-4 md:p-6 shadow-xl ${className}`}
      aria-label="Agent Battle Prompt Arena"
      role="region"
    >
      {/* Arena Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-750 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-800 text-amber-400 border border-amber-500/40">
              [PROMPT ARENA]
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              Agent Battle: Factorial Deliberation Showdown
            </h2>
          </div>
          <p className="text-xs text-neutral-300 font-mono mt-1">
            Blind side-by-side evaluation over ANOVA factors and Wilson 95% reputation bounds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-300 px-2.5 py-1 rounded bg-neutral-850 border border-neutral-750">
            TOTAL EVALS: {candidateA.votes + candidateB.votes}
          </span>
        </div>
      </div>

      {/* Benchmark Directive / Prompt */}
      <div className="my-4 p-3.5 rounded-lg bg-neutral-850 border border-neutral-750">
        <label
          htmlFor="arena-prompt"
          className="block text-xs font-mono font-semibold text-neutral-300 mb-1.5"
        >
          [ACTIVE BENCHMARK DIRECTIVE]
        </label>
        <textarea
          id="arena-prompt"
          rows={2}
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
          aria-label="Benchmark Directive Prompt"
        />
      </div>

      {/* Side-by-Side Candidates Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Candidate A Card */}
        <div className="rounded-lg border border-neutral-750 bg-neutral-850/80 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-750 pb-3 mb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">
                  [CANDIDATE A]
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {candidateA.model}
                </h3>
                <p className="text-xs font-mono text-neutral-300">
                  Strategy: {candidateA.promptStrategy}
                </p>
              </div>
              <div>{getParetoBadge(candidateA.paretoStatus)}</div>
            </div>

            {/* Candidate A Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">LATENCY</span>
                <span className="text-white font-semibold">{candidateA.latencyMs}ms</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">SPEND</span>
                <span className="text-white font-semibold">${candidateA.spendUsd.toFixed(4)}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">TOKENS</span>
                <span className="text-white font-semibold">{candidateA.tokens}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">COVERAGE</span>
                <span className="text-emerald-300 font-semibold">{candidateA.coveragePct}%</span>
              </div>
            </div>

            {/* Candidate A Output Preview */}
            <div className="rounded bg-black/90 border border-neutral-800 p-3 mb-4 overflow-x-auto">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                // Candidate A Generated Code Artifact
              </span>
              <pre className="text-xs font-mono text-neutral-200 whitespace-pre leading-relaxed">
                {candidateA.outputContent}
              </pre>
            </div>
          </div>

          {/* Voting Action */}
          <div className="pt-3 border-t border-neutral-750 flex items-center justify-between">
            <div className="text-xs font-mono text-neutral-300">
              Votes: <strong className="text-white">{candidateA.votes}</strong> | Wilson: <strong className="text-emerald-400">{candidateA.wilsonLowerBound.toFixed(3)}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleVote(candidateA.id)}
              disabled={Boolean(userVoted)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                userVoted === candidateA.id
                  ? 'bg-sky-600 text-white border border-sky-400'
                  : userVoted
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600'
              }`}
            >
              {userVoted === candidateA.id ? '[VOTED WINNER]' : '[VOTE AGENT A]'}
            </button>
          </div>
        </div>

        {/* Candidate B Card */}
        <div className="rounded-lg border border-neutral-750 bg-neutral-850/80 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-750 pb-3 mb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  [CANDIDATE B]
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {candidateB.model}
                </h3>
                <p className="text-xs font-mono text-neutral-300">
                  Strategy: {candidateB.promptStrategy}
                </p>
              </div>
              <div>{getParetoBadge(candidateB.paretoStatus)}</div>
            </div>

            {/* Candidate B Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">LATENCY</span>
                <span className="text-white font-semibold">{candidateB.latencyMs}ms</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">SPEND</span>
                <span className="text-white font-semibold">${candidateB.spendUsd.toFixed(4)}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">TOKENS</span>
                <span className="text-white font-semibold">{candidateB.tokens}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">COVERAGE</span>
                <span className="text-emerald-300 font-semibold">{candidateB.coveragePct}%</span>
              </div>
            </div>

            {/* Candidate B Output Preview */}
            <div className="rounded bg-black/90 border border-neutral-800 p-3 mb-4 overflow-x-auto">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                // Candidate B Generated Code Artifact
              </span>
              <pre className="text-xs font-mono text-neutral-200 whitespace-pre leading-relaxed">
                {candidateB.outputContent}
              </pre>
            </div>
          </div>

          {/* Voting Action */}
          <div className="pt-3 border-t border-neutral-750 flex items-center justify-between">
            <div className="text-xs font-mono text-neutral-300">
              Votes: <strong className="text-white">{candidateB.votes}</strong> | Wilson: <strong className="text-emerald-400">{candidateB.wilsonLowerBound.toFixed(3)}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleVote(candidateB.id)}
              disabled={Boolean(userVoted)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                userVoted === candidateB.id
                  ? 'bg-amber-600 text-white border border-amber-400'
                  : userVoted
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600'
              }`}
            >
              {userVoted === candidateB.id ? '[VOTED WINNER]' : '[VOTE AGENT B]'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Deliberation Actions */}
      <div className="mt-4 pt-4 border-t border-neutral-750 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setUserVoted(null);
            onPrune?.(candidateB.id);
          }}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          [PRUNE DOMINATED CANDIDATE]
        </button>
        <button
          type="button"
          onClick={() => setUserVoted('tie')}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          [DECLARE TIE]
        </button>
      </div>
    </section>
  );
};
