import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Copy, User, Building, Sparkles, Globe } from 'lucide-react';
import type { RootAdminProfile } from '../../types/protocol';
import { daemonFetch } from '../../utils/daemonAuth';

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

const RootAdminProfileDialog: React.FC<Omit<RootAdminProfileModalProps, 'isOpen'>> = ({
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [copiedDid, setCopiedDid] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [enableCors, setEnableCors] = useState(true);
  const [enablePna, setEnablePna] = useState(true);

  useEffect(() => {
    let active = true;
    daemonFetch('/api/v1/config/security')
      .then((res) => res.json())
      .then((data) => {
        if (active && data && typeof data.enable_cors === 'boolean') {
          setEnableCors(data.enable_cors);
          setEnablePna(data.enable_pna);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleToggleCors = async (enabled: boolean) => {
    setEnableCors(enabled);
    try {
      await daemonFetch('/api/v1/config/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_cors: enabled }),
      });
    } catch {}
  };

  const handleTogglePna = async (enabled: boolean) => {
    setEnablePna(enabled);
    try {
      await daemonFetch('/api/v1/config/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_pna: enabled }),
      });
    } catch {}
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#FF5500]/35 bg-[#0D0D11]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,85,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 id="root-admin-modal-title" className="text-sm font-bold text-white tracking-tight">
                Configure ACR Root Administrator
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono-code">
                Local Node Authority • W3C DID/VC Ed25519 Anchor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar and Info Row */}
          <div className="flex items-center gap-4 p-3 rounded-xl border border-white/[0.08] bg-[#000000]/60">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="Administrator Preview"
                className="h-14 w-14 rounded-xl object-cover border-2 border-[#FF5500]/45"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#10B981] ring-2 ring-[#0D0D11]" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-bold text-[#FFFFFF] truncate">
                {name || 'Root Administrator'}
              </div>
              <div className="text-[10px] text-[#FF8C42] font-mono-code truncate">
                {title || 'ACR Root Administrator'}
              </div>
              <div className="text-[9px] text-[#A1A1AA] font-mono-code truncate flex items-center gap-1">
                <span>{profile.did}</span>
                <button
                  type="button"
                  onClick={handleCopyDid}
                  className="hover:text-[#FF8C42] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
                  title="Copy DID"
                  aria-label="Copy DID"
                >
                  {copiedDid ? <Check className="h-2.5 w-2.5 text-[#10B981]" /> : <Copy className="h-2.5 w-2.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#FF8C42]" />
              <span>Administrator Display Name / Handle</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Vance, Root Operator, Security Lead"
              className="w-full px-3 py-2 rounded-xl border border-white/[0.14] bg-[#000000] text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            />
            <p className="text-[10px] text-[#A1A1AA]">
              This name labels your human escalation approvals, proposal creations, and room directives.
            </p>
          </div>

          {/* Title / Org Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-[#FF8C42]" />
              <span>Authority Title / Organization</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ACR Root Administrator"
              className="w-full px-3 py-2 rounded-xl border border-white/[0.14] bg-[#000000] text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
            />
          </div>

          {/* Avatar Presets Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FF8C42]" />
              <span>Choose Avatar Preset</span>
            </label>
            <div className="flex items-center gap-2.5">
              {AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(presetUrl)}
                  className={`relative p-0.5 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                    avatar === presetUrl
                      ? 'ring-2 ring-[#FF5500] scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={presetUrl}
                    alt={`Preset ${idx + 1}`}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  {avatar === presetUrl && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF5500] text-black">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Network & Security Policy (PNA / CORS) */}
          <div className="space-y-2 p-3.5 rounded-xl border border-white/[0.08] bg-[#000000]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4D4D8]">
                <Globe className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Network & Private Access (PNA / CORS)</span>
              </div>
              <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/30">
                Daemon Config
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA]">
              Configure browser network discovery and cross-origin invocation policies for the local daemon.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* PNA Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <div>
                  <div className="text-[11px] font-semibold text-white">Private Network (PNA)</div>
                  <div className="text-[9px] text-[#A1A1AA]">Allow 127.0.0.1 discovery</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePna(!enablePna)}
                  className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                    enablePna ? 'bg-[#FF5500] justify-end' : 'bg-[#262626] justify-start'
                  }`}
                  aria-label="Toggle Private Network Access"
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow-md transform transition-transform motion-reduce:transition-none" />
                </button>
              </div>

              {/* CORS Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <div>
                  <div className="text-[11px] font-semibold text-white">CORS Policy</div>
                  <div className="text-[9px] text-[#A1A1AA]">Allow local browser fetch</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleCors(!enableCors)}
                  className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                    enableCors ? 'bg-[#FF5500] justify-end' : 'bg-[#262626] justify-start'
                  }`}
                  aria-label="Toggle CORS"
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow-md transform transition-transform motion-reduce:transition-none" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-white/[0.14] text-xs font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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

export const RootAdminProfileModal: React.FC<RootAdminProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  if (!isOpen) return null;
  return <RootAdminProfileDialog key={profile.did} onClose={onClose} profile={profile} onSave={onSave} />;
};
