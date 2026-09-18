import { CheckCircle, XCircle, UserCheck, ShieldCheck, Play, Loader2 } from 'lucide-react';
import type { ConsensusBallot, QuorumEvaluation, IncidentStatus } from './types';
import { sound } from '../../utils/sound';

interface ConsensusBallotBoxProps {
  ballots: ConsensusBallot[];
  quorum?: QuorumEvaluation;
  humanApproved: boolean;
  onToggleHumanApproval: () => void;
  onExecutePlan: () => void;
  isExecuting: boolean;
  onToggleBallotDecision?: (ballotId: string) => void;
  incidentStatus?: IncidentStatus;
}

export const ConsensusBallotBox: React.FC<ConsensusBallotBoxProps> = ({
  ballots,
  quorum,
  humanApproved,
  onToggleHumanApproval,
  onExecutePlan,
  isExecuting,
  onToggleBallotDecision,
  incidentStatus,
}) => {
  const approvalPercent = quorum ? Math.round(quorum.weightedApprovalRatio * 100) : 0;
  const thresholdPercent = quorum ? Math.round(quorum.weightedQuorumTarget * 100) : 67;
  const isQuorumMet = quorum ? quorum.thresholdReached : false;
  const isEscalated = quorum?.status === 'escalated_human';

  return (
    <section 
      aria-labelledby="consensus-heading"
      className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col h-full"
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div>
          <h3 id="consensus-heading" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Byzantine Quorum Consensus Box
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Guarantees 2/3 supermajority agreement across signed W3C Ed25519 DIDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border uppercase font-bold tracking-wider ${
            isQuorumMet ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20' :
            isEscalated ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' :
            'bg-slate-900 text-slate-400 border-white/10'
          }`}>
            {quorum ? quorum.status.replace('_', ' ') : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Quorum Progress Meter */}
      <div className="mb-5 p-4 rounded-2xl bg-slate-900/70 border border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Weighted Quorum Ratio</span>
          <span className="font-mono font-bold text-white">
            {approvalPercent}% <span className="text-slate-500 font-normal">/ {thresholdPercent}% Target</span>
          </span>
        </div>

        <div 
          className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden relative shadow-inner" 
          role="progressbar" 
          aria-valuenow={approvalPercent} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              isQuorumMet ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, approvalPercent)}%` }}
          />
          {/* 67% threshold marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${thresholdPercent}%` }}
            title={`Threshold: ${thresholdPercent}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>{ballots.length} Cryptographic Ballots</span>
          <span className={isQuorumMet ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {isQuorumMet ? '✓ 67% Byzantine Quorum Achieved' : 'Awaiting Supermajority'}
          </span>
        </div>
      </div>

      {/* Ballots Tally List */}
      <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 mb-4 pr-1">
        {ballots.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No ballots submitted yet. Waiting for squad deliberation turns...
          </div>
        ) : (
          ballots.map((b) => (
            <div 
              key={b.ballotId}
              className="p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {b.decision === 'approve' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{b.did.split(':').pop()?.slice(0, 14)}...</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                      wt: {b.weight.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {b.justification}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-cyan-300">
                  {(b.confidenceScore * 100).toFixed(0)}% conf
                </span>
                {onToggleBallotDecision && (
                  <button
                    onClick={() => { sound.playTick(); onToggleBallotDecision(b.ballotId); }}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    title="Toggle Ballot for Simulation"
                  >
                    Flip
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Human-in-the-Loop Dual Consent & Execution */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={humanApproved}
            onChange={() => { sound.playTick(); onToggleHumanApproval(); }}
            className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-950 cursor-pointer accent-cyan-400"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Human-in-the-Loop Dual Consent Confirmed
          </span>
        </label>

        <button
          onClick={() => { sound.playApprovalChime(); onExecutePlan(); }}
          disabled={!isQuorumMet || isExecuting || incidentStatus === 'resolved'}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
            incidentStatus === 'resolved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
              : isExecuting
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 animate-pulse'
              : isQuorumMet 
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 hover:shadow-cyan-500/25 active:scale-98'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          {incidentStatus === 'resolved' ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Mitigation Plan Executed &amp; Verified</span>
            </>
          ) : incidentStatus === 'verifying' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Verifying Telemetry &amp; Action Items...</span>
            </>
          ) : isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Executing Inside ToolHive Sandbox...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Authorize &amp; Execute Sandboxed Mitigation Plan</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
