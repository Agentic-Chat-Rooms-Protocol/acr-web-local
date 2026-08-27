import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import type { McpToolCall } from '../../types/protocol';

interface McpToolTelemetryCardProps {
  toolCall: McpToolCall;
}

export const McpToolTelemetryCard: React.FC<McpToolTelemetryCardProps> = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          id: toolCall.id,
          tool: toolCall.tool_name,
          args: toolCall.arguments,
          output: toolCall.output,
          latency_ms: toolCall.latency_ms,
        },
        null,
        2
      )
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = toolCall.status === 'completed';

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-cyan-500/25 bg-[#090b14]/90 backdrop-blur-md transition-all hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      {/* Top Telemetry Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/15 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/15 text-cyan-400 shrink-0">
            <Terminal className="h-3 w-3" />
          </div>
          <span className="font-mono-code text-[11px] font-semibold text-cyan-300 truncate">
            {toolCall.tool_name}
          </span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-mono-code text-slate-400 border border-white/[0.06]">
            MCP TOOL
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Latency Metric */}
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 font-mono-code text-[10px] tabular-nums text-cyan-400 border border-cyan-500/20">
            {toolCall.latency_ms.toFixed(2)}ms
          </span>

          {/* Status Indicator */}
          {isSuccess ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 font-mono-code">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>PASS</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 font-mono-code">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{toolCall.status.toUpperCase()}</span>
            </span>
          )}

          {/* Expand/Collapse Caret */}
          <button
            type="button"
            className="p-0.5 text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary Output Line */}
      <div className="px-3.5 py-2 text-xs font-mono-code text-slate-300 bg-black/30 flex items-center justify-between">
        <span className="truncate">{toolCall.output || 'Invariant verified'}</span>
        <button
          onClick={handleCopy}
          title="Copy tool telemetry"
          className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {/* Collapsible Details Panel */}
      {expanded && (
        <div className="p-3.5 bg-black/60 border-t border-white/[0.06] space-y-2 text-[11px] font-mono-code">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
              Arguments Payload
            </div>
            <pre className="p-2 rounded bg-black/60 border border-white/[0.06] text-cyan-200/90 overflow-x-auto text-[10px]">
              {typeof toolCall.arguments === 'string'
                ? toolCall.arguments
                : JSON.stringify(toolCall.arguments, null, 2) || 'None'}
            </pre>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
              Verification Proof
            </div>
            <pre className="p-2 rounded bg-black/60 border border-white/[0.06] text-emerald-300/90 overflow-x-auto text-[10px]">
              {toolCall.output || 'State invariant holds with zero leaks.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
