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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0b0c16] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(244,63,94,0.15)] text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Risk Badge */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Human Escalation Authorization Gate
              </h3>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold font-mono-code text-rose-300 border border-rose-500/30">
                {escalation.risk_level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Privileged autonomous action requires cryptographic operator sign-off.
            </p>
          </div>
        </div>

        {/* Escalation Meta Card */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-3 font-mono-code text-xs mb-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Requesting Agent:
            </span>
            <span className="font-semibold text-white">{escalation.agent_name}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-indigo-400" />
              Agent DID:
            </span>
            <span className="text-cyan-300 text-[11px] truncate max-w-[240px]">
              {escalation.agent_did}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-slate-400">Target Operation:</span>
            <span className="text-amber-300 font-bold">{escalation.action}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-slate-400">Target Envelope:</span>
            <span className="text-slate-200">{escalation.target}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Requested At:
            </span>
            <span className="text-slate-400 text-[11px]">
              {new Date(escalation.requested_at || escalation.created_at || Date.now()).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Action Signature Verification notice */}
        <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-3 text-[11px] text-indigo-200 mb-6 flex items-start gap-2.5">
          <Key className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-100">W3C DID Cryptographic Binding:</span>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">
              Signing produces an Ed25519-detached signature appended as an immutable block to the TLA+ state hash chain.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
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
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors"
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
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-98"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve &amp; Sign (Ed25519)</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
              <span>Status:</span>
              <span className={escalation.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}>
                {escalation.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
