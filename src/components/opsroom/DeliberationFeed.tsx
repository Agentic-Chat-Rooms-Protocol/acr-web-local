import { MessageSquare, Bot, Shield, Cpu, Database, DollarSign, Terminal } from 'lucide-react';
import type { DeliberationTurn, IncidentStatus, AgentRole } from './types';
import { truncateHash } from './crypto-browser';

interface DeliberationFeedProps {
  turns: DeliberationTurn[];
  activePhase: IncidentStatus;
}

export const DeliberationFeed: React.FC<DeliberationFeedProps> = ({
  turns,
  activePhase,
}) => {
  const getRoleIcon = (role: AgentRole) => {
    switch (role) {
      case 'atlas_orchestrator': return Cpu;
      case 'sre_reliability': return Bot;
      case 'secops_guardian': return Shield;
      case 'dataops_engineer': return Database;
      case 'finops_overseer': return DollarSign;
      default: return Terminal;
    }
  };

  const getRoleColor = (role: AgentRole) => {
    switch (role) {
      case 'atlas_orchestrator': return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
      case 'sre_reliability': return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'secops_guardian': return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'dataops_engineer': return 'text-blue-400 bg-blue-950/40 border-blue-500/30';
      case 'finops_overseer': return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-900 border-white/10';
    }
  };

  return (
    <section 
      aria-labelledby="feed-heading"
      className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col h-full"
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div>
          <h3 id="feed-heading" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Autonomous Deliberation Feed
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cross-agent critique and hypothesis validation turns.
          </p>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-semibold uppercase tracking-wider">
          Phase: {activePhase}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
        {turns.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">
            War room deliberation standing by. Click &quot;Simulate Autonomous Incident Response&quot; to begin.
          </div>
        ) : (
          turns.map((t) => {
            const Icon = getRoleIcon(t.role);
            const colorClass = getRoleColor(t.role);

            return (
              <div 
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-xl border ${colorClass}`}>
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-bold text-white block">{t.agentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Turn #{t.turnIndex}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20">
                    {(t.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                {t.proposedHypothesis && (
                  <div className="mb-2 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-medium text-slate-300">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Hypothesis:</span>
                    {t.proposedHypothesis}
                  </div>
                )}

                <p className="text-slate-300 leading-relaxed text-xs mb-2">
                  {t.reasoning}
                </p>

                {t.proposedActions.length > 0 && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/5">
                    {t.proposedActions.map((act, aIdx) => (
                      <div key={aIdx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono">
                        <span className="text-cyan-300">
                          {act.serverName}/{act.toolName}()
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          act.riskLevel === 'high' || act.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                          act.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {act.riskLevel} risk
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>sig: {truncateHash(t.signature, 10, 8)}</span>
                  <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
