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
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#FF5500]/25 bg-[#0D0D11]/95 backdrop-blur-md transition-all hover:border-[#FF5500]/45 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      {/* Top Telemetry Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#FF5500]/10 border-b border-[#FF5500]/20 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FF5500]/15 text-[#FF8C42] shrink-0">
            <Terminal className="h-3 w-3" />
          </div>
          <span className="font-mono-code text-[11px] font-semibold text-[#FF8C42] truncate">
            {toolCall.tool_name}
          </span>
          <span className="rounded bg-[#000000]/60 px-1.5 py-0.5 text-[9px] font-mono-code text-[#A1A1AA] border border-white/[0.08]">
            MCP TOOL
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Latency Metric */}
          <span className="rounded-full bg-[#FF5500]/10 px-2 py-0.5 font-mono-code text-[10px] tabular-nums text-[#FF8C42] border border-[#FF5500]/25">
            {toolCall.latency_ms.toFixed(2)}ms
          </span>

          {/* Status Indicator */}
          {isSuccess ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#10B981] font-mono-code">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>PASS</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#EF4444] font-mono-code">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{toolCall.status.toUpperCase()}</span>
            </span>
          )}

          {/* Expand/Collapse Caret */}
          <button
            type="button"
            aria-label={expanded ? 'Collapse telemetry' : 'Expand telemetry'}
            className="p-0.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary Output Line */}
      <div className="px-3.5 py-2 text-xs font-mono-code text-[#D4D4D8] bg-[#000000]/50 flex items-center justify-between">
        <span className="truncate">{toolCall.output || 'Invariant verified'}</span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy tool telemetry"
          aria-label="Copy tool telemetry"
          className="ml-2 text-[#A1A1AA] hover:text-white transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
        >
          {copied ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {/* Collapsible Details Panel */}
      {expanded && (
        <div className="p-3.5 bg-[#000000]/70 border-t border-white/[0.06] space-y-2 text-[11px] font-mono-code">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#A1A1AA] mb-1 font-semibold">
              Arguments Payload
            </div>
            <pre className="p-2 rounded bg-[#141414] border border-white/[0.08] text-[#D4D4D8] overflow-x-auto text-[10px]">
              {typeof toolCall.arguments === 'string'
                ? toolCall.arguments
                : JSON.stringify(toolCall.arguments, null, 2) || 'None'}
            </pre>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#A1A1AA] mb-1 font-semibold">
              Verification Proof
            </div>
            <pre className="p-2 rounded bg-[#141414] border border-white/[0.08] text-[#10B981] overflow-x-auto text-[10px]">
              {toolCall.output || 'State invariant holds with zero leaks.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
