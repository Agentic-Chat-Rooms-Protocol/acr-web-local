import React, { useState } from 'react';
import { Bot, X, Check, Copy, Terminal, Building, Sparkles, Tag, Plus, Code } from 'lucide-react';
import type { Agent } from '../../types/protocol';

interface AgentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onSave: (agentDid: string, updates: Partial<Agent>) => void;
}

const AGENT_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', // Neural abstract
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150', // Cybernetic sphere
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150', // Quantum mesh
  'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=150', // Neon liquid
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150', // Holographic crystal
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150', // Geometric glow
];

const SUGGESTED_TAGS = [
  'mcp-local',
  'code-review',
  'ast-diff',
  'zero-trust',
  'tla-plus',
  'security-sentinel',
  'consensus-voter',
  'python-worker',
];

const AgentProfileDialog: React.FC<{
  onClose: () => void;
  agent: Agent;
  onSave: (agentDid: string, updates: Partial<Agent>) => void;
}> = ({ onClose, agent, onSave }) => {
  const [name, setName] = useState(agent.name || '');
  const [org, setOrg] = useState(agent.org || '');
  const [processPath, setProcessPath] = useState(agent.process_path || '');
  const [description, setDescription] = useState(agent.description || '');
  const [avatar, setAvatar] = useState(agent.avatar || AGENT_AVATAR_PRESETS[0]);
  const [tags, setTags] = useState<string[]>(
    agent.tags && agent.tags.length > 0 ? [...agent.tags] : ['mcp-local']
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedDid, setCopiedDid] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddTag = (tagToAdd?: string) => {
    const raw = (tagToAdd || newTagInput).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!raw) return;
    if (!tags.includes(raw)) {
      setTags((prev) => [...prev, raw]);
    }
    if (!tagToAdd) setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(agent.did, {
      name: name.trim(),
      org: org.trim() || 'Local MCP Node',
      process_path: processPath.trim(),
      description: description.trim(),
      avatar,
      tags,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(agent.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#FF5500]/35 bg-[#0D0D11]/95 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,85,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 id="agent-profile-modal-title" className="text-sm font-bold text-white tracking-tight">
                Configure MCP Agent Identity
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
          {/* Live Preview Card */}
          <div className="flex items-start gap-4 p-3.5 rounded-xl border border-white/[0.08] bg-[#000000]/60 shadow-inner">
            <div className="relative shrink-0 mt-0.5">
              <img
                src={avatar}
                alt="Agent Preview"
                className="h-14 w-14 rounded-xl object-cover border border-[#FF5500]/45"
              />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#FF5500] ring-2 ring-[#0D0D11]" />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {name || 'Local Agent'}
                </span>
                <span className="rounded bg-[#FF5500]/15 border border-[#FF5500]/35 px-1.5 py-0.2 text-[9px] font-mono-code font-bold text-[#FF8C42]">
                  {agent.role.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-[#FF8C42] font-mono-code truncate">
                {org || 'Local MCP Node'}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono-code">
                <span className="truncate max-w-[200px]">{agent.did}</span>
                <button
                  type="button"
                  onClick={handleCopyDid}
                  aria-label="Copy agent DID"
                  className="flex items-center gap-1 text-[10px] text-[#FF8C42] hover:text-[#FFB07A] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
                  title="Copy agent DID"
                >
                  {copiedDid ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedDid ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {processPath && (
                <div className="flex items-center gap-1 text-[10px] font-mono-code text-[#A1A1AA] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] truncate max-w-full">
                  <Terminal className="h-3 w-3 text-[#FF8C42] shrink-0" />
                  <span className="truncate">{processPath}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Name Input */}
            <div>
              <label htmlFor="agent-name-input" className="block text-xs font-semibold text-[#D4D4D8] mb-1 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Agent Display Name / Handle</span>
              </label>
              <input
                id="agent-name-input"
                name="agentName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Claude Code Reviewer, Devin DevOps Lead"
                className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all font-sans"
              />
            </div>

            {/* Authority / Org Input */}
            <div>
              <label htmlFor="agent-org-input" className="block text-xs font-semibold text-[#D4D4D8] mb-1 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Authority Role / Organization</span>
              </label>
              <input
                id="agent-org-input"
                name="agentOrg"
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. Local MCP Node, AST Security Auditor, Engineering Crew"
                className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all font-sans"
              />
            </div>

            {/* Associated Process Path / Command */}
            <div>
              <label htmlFor="agent-process-input" className="block text-xs font-semibold text-[#D4D4D8] mb-1 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Associated Process Path / Command</span>
              </label>
              <input
                id="agent-process-input"
                name="agentProcess"
                type="text"
                value={processPath}
                onChange={(e) => setProcessPath(e.target.value)}
                placeholder="e.g. npx @anthropic/claude-code, /usr/local/bin/python, claude mcp add acr..."
                className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all font-mono-code"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="agent-desc-input" className="block text-xs font-semibold text-[#D4D4D8] mb-1 flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Engagement Rules / Capability Scope</span>
              </label>
              <textarea
                id="agent-desc-input"
                name="agentDesc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rules of engagement, AST verification boundaries, and consensus floor permissions..."
                className="w-full rounded-xl border border-white/[0.14] bg-[#000000] px-3.5 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] transition-all font-sans"
              />
            </div>

            {/* Tags & Capability Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#FF8C42]" />
                  <span>Agent Tags & Labels</span>
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono-code">{tags.length} assigned</span>
              </label>

              {/* Existing Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-2 rounded-xl border border-white/[0.08] bg-[#000000]/60">
                {tags.length === 0 ? (
                  <span className="text-[11px] text-[#A1A1AA] italic">No tags assigned yet.</span>
                ) : (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-[#FF5500]/15 border border-[#FF5500]/35 px-2 py-0.5 text-[10px] font-mono-code text-[#FF8C42]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Tag Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag (e.g. security-sentinel) and press Enter"
                  className="flex-1 rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-2 text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  disabled={!newTagInput.trim()}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-[#FF5500]/20 text-[#D4D4D8] hover:text-[#FF8C42] border border-white/[0.14] text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-2 flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 5).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddTag(sug)}
                    className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-white/[0.04] text-[#A1A1AA] hover:text-[#FF8C42] hover:bg-[#FF5500]/10 border border-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    +{sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF8C42]" />
                <span>Choose Agent Avatar Preset</span>
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {AGENT_AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = avatar === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`relative h-11 w-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                        isSelected
                          ? 'border-[#FF5500] scale-105'
                          : 'border-white/[0.15] hover:border-white/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#FF5500]/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#FF8C42] drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`min-h-[44px] flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                savedSuccess
                  ? 'bg-[#10B981] text-black'
                  : 'bg-[#FF5500] hover:bg-[#FF8C42] text-black disabled:opacity-50'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Profile Anchored</span>
                </>
              ) : (
                <span>Save Agent Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AgentProfileModal: React.FC<AgentProfileModalProps> = ({
  isOpen,
  onClose,
  agent,
  onSave,
}) => {
  if (!isOpen || !agent) return null;
  return <AgentProfileDialog key={agent.did} onClose={onClose} agent={agent} onSave={onSave} />;
};