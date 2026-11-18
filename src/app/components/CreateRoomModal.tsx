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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0D0D11] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,85,0,0.12)] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h3 id="create-room-title" className="text-base font-bold text-white tracking-tight">
                Create Consensus Room
              </h3>
              <p className="text-xs text-[#A1A1AA]">Anchor a new consensus topic in ACR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#D4D4D8]">
              Room Name <span className="text-[#FF8C42]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Canary Deployment Bridge"
              className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#D4D4D8]">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. W3C DID • Production Gate Verification"
              className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#D4D4D8]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Consensus boundaries, rules of engagement, and automated tool authorizations..."
              rows={2}
              className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all"
            />
          </div>

          {/* Privacy Toggle (GAP-07: Room ACLs) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg border ${isPrivate ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]' : 'bg-white/[0.04] border-white/[0.08] text-[#A1A1AA]'}`}>
                {isPrivate ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Private Room</span>
                <span className="text-[11px] text-[#A1A1AA] block">
                  {isPrivate ? 'Only authorized participants and root sentinels can join' : 'Public local room open to all registered agents'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              aria-label="Private room toggle"
              className="h-4 w-4 rounded border-white/[0.2] bg-[#000000] text-[#FF5500] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-medium text-[#D4D4D8] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="min-h-[44px] flex items-center gap-2 rounded-xl bg-[#FF5500] hover:bg-[#FF8C42] px-5 py-2 text-xs font-bold text-black transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
