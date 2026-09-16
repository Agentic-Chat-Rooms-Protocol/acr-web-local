import React from 'react';
import { Layout, CheckSquare, Download, Activity } from 'lucide-react';
import type { OpsCanvas, ExecutionPlan } from './types';
import { sound } from '../../utils/sound';

interface OpsCanvasViewProps {
  canvas: OpsCanvas;
  executionPlan?: ExecutionPlan;
  onExportCertificate: () => void;
}

export const OpsCanvasView: React.FC<OpsCanvasViewProps> = ({
  canvas,
  executionPlan,
  onExportCertificate,
}) => {
  return (
    <section 
      aria-labelledby="canvas-heading"
      className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-xl mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 id="canvas-heading" className="text-sm sm:text-base font-bold text-white">
              Live Collaborative Ops Canvas
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
              v{canvas.version} · {canvas.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Reinventing Slack Canvas: Real-time telemetry binding, state machine progression &amp; Merkle integrity.
          </p>
        </div>

        <button
          onClick={() => { sound.playTick(); onExportCertificate(); }}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer active:scale-98"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          Export SOC2 Audit Cert
        </button>
      </div>

      {/* Live Telemetry KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium">Traffic Impact</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {canvas.liveFields.trafficImpactPercent.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">cluster: {canvas.liveFields.affectedCluster}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium">Error Rate Spike</span>
          <div className={`text-lg font-bold mt-0.5 ${canvas.liveFields.errorRateSpike > 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
            +{canvas.liveFields.errorRateSpike.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">service: {canvas.liveFields.serviceName}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium">Estimated Cost Drift</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            ${canvas.liveFields.estimatedCostDriftUsd.toFixed(0)}/hr
          </div>
          <span className="text-[10px] text-slate-500 font-mono">FinOps guardrails</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium">MCP Sandbox Isolation</span>
          <div className="text-sm font-mono font-bold text-cyan-300 mt-1 truncate">
            {canvas.liveFields.mcpSandboxIsolation}
          </div>
          <span className="text-[10px] text-emerald-400">acr-meta-mcp :20445</span>
        </div>
      </div>

      {/* Main Two Columns: Action Items & Execution DAG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Action Items List */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Active Action Items ({canvas.actionItems.length})
          </h4>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {canvas.actionItems.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'verified' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' :
                    item.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className="text-slate-200 font-medium truncate">{item.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {item.assignedToRole.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    item.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300' :
                    item.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atlas 2.0 Execution Plan DAG */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            Atlas 2.0 Mitigation Execution DAG
          </h4>

          {!executionPlan || executionPlan.steps.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Execution plan compiling in background. Waiting for squad consensus...
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {executionPlan.steps.map((step, sIdx) => (
                <div 
                  key={step.stepId}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                      Step {sIdx + 1}:
                    </span>
                    <span className="font-mono text-slate-200 truncate">
                      {step.serverName}/{step.toolName}()
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.rollbackStep && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30">
                        Rollback DAG
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      step.status === 'running' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
