import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Copy, User, Building, Sparkles } from 'lucide-react';
import type { RootAdminProfile } from '../../types/protocol';

interface RootAdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RootAdminProfile;
  onSave: (updates: Partial<RootAdminProfile>) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
];

export const RootAdminProfileModal: React.FC<RootAdminProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [copiedDid, setCopiedDid] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTitle(profile.title);
      setAvatar(profile.avatar);
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      title: title.trim() || 'ACR Root Administrator',
      avatar,
      isConfigured: true,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(profile.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="root-admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#090b16]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.15),inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(56,189,248,0.2)] space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 id="root-admin-modal-title" className="text-sm font-bold text-white tracking-tight">
                Configure ACR Root Administrator
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-code">
                Local Node Authority • W3C DID/VC Ed25519 Anchor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar and Info Row */}
          <div className="flex items-center gap-4 p-3 rounded-xl border border-white/[0.06] bg-black/40">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="Administrator Preview"
                className="h-14 w-14 rounded-xl object-cover border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[#090b16]" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-bold text-slate-200 truncate">
                {name || 'Root Administrator'}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono-code truncate">
                {title || 'ACR Root Administrator'}
              </div>
              <div className="text-[9px] text-slate-500 font-mono-code truncate flex items-center gap-1">
                <span>{profile.did}</span>
                <button
                  type="button"
                  onClick={handleCopyDid}
                  className="hover:text-cyan-300 cursor-pointer"
                  title="Copy DID"
                >
                  {copiedDid ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>Administrator Display Name / Handle</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Vance, Root Operator, Security Lead"
              className="w-full px-3 py-2 rounded-xl border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
            <p className="text-[10px] text-slate-500">
              This name labels your human escalation approvals, proposal creations, and room directives.
            </p>
          </div>

          {/* Title / Org Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-indigo-400" />
              <span>Authority Title / Organization</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ACR Root Administrator"
              className="w-full px-3 py-2 rounded-xl border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 font-mono-code"
            />
          </div>

          {/* Avatar Presets Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Choose Avatar Preset</span>
            </label>
            <div className="flex items-center gap-2.5">
              {AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(presetUrl)}
                  className={`relative p-0.5 rounded-xl transition-all cursor-pointer ${
                    avatar === presetUrl
                      ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'opacity-60 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  <img
                    src={presetUrl}
                    alt={`Preset ${idx + 1}`}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  {avatar === presetUrl && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[8px] text-black font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/[0.1] text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
            >
              {savedSuccess ? <Check className="h-3.5 w-3.5" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Root Identity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
