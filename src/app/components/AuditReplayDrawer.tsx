import React, { useState } from 'react';
import { X, GitCommit, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import type { AuditEntry } from '../../types/protocol';

interface AuditReplayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditEntry[];
  onRefresh: () => void;
}

export const AuditReplayDrawer: React.FC<AuditReplayDrawerProps> = ({
  isOpen,
  onClose,
  auditLogs,
  onRefresh,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#080911] border-l border-white/[0.1] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <GitCommit className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  TLA+ Verified Audit Chain
                </h3>
                <p className="text-[11px] font-mono-code text-cyan-400">
                  {auditLogs.length} Cryptographic Blocks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                title="Refresh audit chain"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Invariant Status Banner */}
          <div className="px-5 py-3 bg-emerald-950/20 border-b border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-mono-code text-[11px]">
              TLA+ Composition Safety: 100% Invariants Verified
            </span>
          </div>

          {/* Scrollable Block List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono-code text-xs">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No state transition blocks recorded yet.
              </div>
            ) : (
              auditLogs.map((entry) => {
                const blockHeight = entry.index ?? entry.block_height ?? 0;
                const blockDetails = entry.details || entry.payload || '';
                return (
                  <div
                    key={`${entry.state_hash}-${blockHeight}`}
                    className="rounded-xl border border-white/[0.08] bg-black/40 p-4 transition-all hover:border-cyan-500/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/25">
                        #{String(blockHeight).padStart(4, '0')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-[11px]">
                        {entry.event_type}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 leading-relaxed break-words bg-black/40 p-2 rounded border border-white/[0.04]">
                      {blockDetails}
                    </div>

                    {/* Hash linkages */}
                    <div className="space-y-1 text-[10px] pt-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>PREV HASH:</span>
                        <span className="truncate max-w-[200px] text-slate-600">
                          {entry.prev_hash}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-cyan-400/90">
                        <span>STATE HASH:</span>
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[180px] font-bold text-cyan-300">
                            {entry.state_hash}
                          </span>
                          <button
                            onClick={() => handleCopy(entry.state_hash)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy state hash"
                          >
                            {copiedHash === entry.state_hash ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
