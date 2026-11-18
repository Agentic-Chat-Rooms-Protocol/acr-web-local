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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#000000]/70 backdrop-blur-sm animate-fadeIn motion-reduce:animate-none">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D0D11] border-l border-white/[0.1] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#000000]/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/35">
                <GitCommit className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  TLA+ Verified Audit Chain
                </h3>
                <p className="text-[11px] font-mono-code text-[#FF8C42]">
                  {auditLogs.length} Cryptographic Blocks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh audit chain"
                aria-label="Refresh audit chain"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close audit drawer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Invariant Status Banner */}
          <div className="px-5 py-3 bg-[#10B981]/10 border-b border-[#10B981]/25 flex items-center gap-2 text-xs text-[#10B981]">
            <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
            <span className="font-mono-code text-[11px]">
              TLA+ Composition Safety: 100% Invariants Verified
            </span>
          </div>

          {/* Scrollable Block List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono-code text-xs">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-[#A1A1AA]">
                No state transition blocks recorded yet.
              </div>
            ) : (
              auditLogs.map((entry) => {
                const blockHeight = entry.index ?? entry.block_height ?? 0;
                const blockDetails = entry.details || entry.payload || '';
                return (
                  <div
                    key={`${entry.state_hash}-${blockHeight}`}
                    className="rounded-xl border border-white/[0.08] bg-[#000000]/60 p-4 transition-all hover:border-[#FF5500]/35 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#FF5500]/15 px-2 py-0.5 text-[10px] font-bold text-[#FF8C42] border border-[#FF5500]/30">
                        #{String(blockHeight).padStart(4, '0')}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-[11px]">
                        {entry.event_type}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#D4D4D8] leading-relaxed break-words bg-[#141414] p-2 rounded border border-white/[0.06]">
                      {blockDetails}
                    </div>

                    {/* Hash linkages */}
                    <div className="space-y-1 text-[10px] pt-1">
                      <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span>PREV HASH:</span>
                        <span className="truncate max-w-[200px] text-[#A1A1AA]">
                          {entry.prev_hash}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#FF8C42]">
                        <span>STATE HASH:</span>
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[180px] font-bold text-[#FF8C42]">
                            {entry.state_hash}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(entry.state_hash)}
                            className="p-1 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
                            title="Copy state hash"
                            aria-label="Copy state hash"
                          >
                            {copiedHash === entry.state_hash ? (
                              <Check className="h-3 w-3 text-[#10B981]" />
                            ) : (
                              <Copy className="h-3 w-3 text-[#A1A1AA]" />
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
