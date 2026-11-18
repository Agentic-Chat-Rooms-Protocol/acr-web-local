import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Key, Cpu, Clock, X } from 'lucide-react';
import type { Escalation } from '../../types/protocol';

interface EscalationGateDialogProps {
  escalation: Escalation | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const EscalationGateDialog: React.FC<EscalationGateDialogProps> = ({
  escalation,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!escalation) return null;

  const isPending = escalation.status === 'pending';

  const requestedTimestamp = escalation.requested_at || escalation.created_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-fadeIn motion-reduce:animate-none">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#EF4444]/35 bg-[#0D0D11] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#D4D4D8]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Risk Badge */}
        <div className="flex items-start gap-3.5 mb-5 pr-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/35 text-[#EF4444] shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Human Escalation Authorization Gate
              </h3>
              <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-[10px] font-bold font-mono-code text-[#EF4444] border border-[#EF4444]/35">
                {escalation.risk_level}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Privileged local action requires cryptographic operator sign-off.
            </p>
          </div>
        </div>

        {/* Escalation Meta Card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#000000]/60 p-4 space-y-3 font-mono-code text-xs mb-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#FF8C42]" />
              Requesting Agent:
            </span>
            <span className="font-semibold text-white">{escalation.agent_name}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-[#FF8C42]" />
              Agent DID:
            </span>
            <span className="text-[#FF8C42] text-[11px] truncate max-w-[240px]">
              {escalation.agent_did}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-[#A1A1AA]">Target Operation:</span>
            <span className="text-[#F59E0B] font-bold">{escalation.action}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-[#A1A1AA]">Target Envelope:</span>
            <span className="text-[#D4D4D8]">{escalation.target}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#A1A1AA]" />
              Requested At:
            </span>
            <span className="text-[#A1A1AA] text-[11px]">
              {requestedTimestamp ? new Date(requestedTimestamp).toLocaleTimeString() : 'Pending'}
            </span>
          </div>
        </div>

        {/* Action Signature Verification notice */}
        <div className="rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/25 p-3 text-[11px] text-[#D4D4D8] mb-6 flex items-start gap-2.5">
          <Key className="h-4 w-4 text-[#FF8C42] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">W3C DID Cryptographic Binding:</span>
            <div className="text-[10px] text-[#A1A1AA] mt-0.5">
              Signing produces an Ed25519-detached signature appended as an immutable block to the TLA+ state hash chain.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-white/[0.14] px-4 py-2 text-xs font-medium text-[#D4D4D8] hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Dismiss
          </button>

          {isPending ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onReject(escalation.id);
                  onClose();
                }}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/15 px-4 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject &amp; Abort</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApprove(escalation.id);
                  onClose();
                }}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-[#FF5500] hover:bg-[#FF8C42] px-4 py-2 text-xs font-bold text-black transition-all active:scale-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve &amp; Sign (Ed25519)</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#A1A1AA]">
              <span>Status:</span>
              <span className={escalation.status === 'approved' ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                {escalation.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
