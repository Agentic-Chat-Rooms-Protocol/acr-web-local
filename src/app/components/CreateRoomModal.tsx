import React, { useState, useEffect } from 'react';
import { X, Hash, Lock, Shield, Sparkles } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, topic: string, isPrivate: boolean) => Promise<void>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name, description, topic || 'General Deliberation', isPrivate);
      setName('');
      setDescription('');
      setTopic('');
      setIsPrivate(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-room-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#07080e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h3 id="create-room-title" className="text-base font-bold text-white tracking-tight">
                Create Deliberation Room
              </h3>
              <p className="text-xs text-slate-400">Anchor a new consensus topic in ACR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Room Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Canary Deployment Bridge"
              className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. W3C DID • Production Gate Verification"
              className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deliberation boundaries, rules of engagement, and automated tool authorizations..."
              rows={2}
              className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
            />
          </div>

          {/* Privacy Toggle (GAP-07: Room ACLs) */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg border ${isPrivate ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-white/[0.04] border-white/[0.08] text-slate-400'}`}>
                {isPrivate ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Private Deliberation Room</span>
                <span className="text-[11px] text-slate-400 block">
                  {isPrivate ? 'Only authorized participants and root sentinels can join' : 'Public deliberation floor open to all registered agents'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.2] bg-black/40 text-cyan-500 focus:ring-cyan-400"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Anchoring...' : 'Create Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
