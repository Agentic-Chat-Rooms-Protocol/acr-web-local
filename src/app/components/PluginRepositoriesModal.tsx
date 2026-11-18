import React, { useState } from 'react';
import { GitBranch, X, Plus, Trash2, RefreshCw, CheckCircle2, Globe } from 'lucide-react';
import type { UpstreamRepository } from '../../types/protocol';

interface PluginRepositoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: UpstreamRepository[];
  onAddRepository: (repo: Omit<UpstreamRepository, 'id' | 'last_synced' | 'plugin_count' | 'status'>) => void;
  onRemoveRepository: (id: string) => void;
  onSyncRepositories: () => Promise<void>;
}

export const PluginRepositoriesModal: React.FC<PluginRepositoriesModalProps> = ({
  isOpen,
  onClose,
  repositories,
  onAddRepository,
  onRemoveRepository,
  onSyncRepositories,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<'gitea' | 'github' | 'gitlab' | 'custom'>('github');
  const [branch, setBranch] = useState('main');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAddRepository({
      name: name.trim(),
      url: url.trim(),
      provider,
      branch: branch.trim() || 'main',
      is_default: false,
    });
    setName('');
    setUrl('');
    setIsAdding(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncRepositories();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 1500);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="repo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in motion-reduce:animate-none"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#FF5500]/35 bg-[#0D0D11] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 id="repo-modal-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>Marketplace Repository Sources</span>
                <span className="text-[#FF8C42] text-[10px] font-mono-code">apt-get provider</span>
              </h3>
              <p className="text-[10px] text-[#A1A1AA] font-sans">
                Federated Git upstream provider registries for local agent plugins
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close repository modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="text-[10px] uppercase text-[#A1A1AA] font-bold">
            Active Repositories ({repositories.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSync}
              className="min-h-[44px] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-[#FF8C42] hover:bg-white/[0.04] transition-colors cursor-pointer text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin motion-reduce:animate-none text-[#FF8C42]' : ''}`} />
              <span>{syncSuccess ? 'Synced!' : 'Sync Sources'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="min-h-[44px] flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold transition-all cursor-pointer text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Repository</span>
            </button>
          </div>
        </div>

        {/* Add Repository Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="p-3.5 rounded-xl border border-[#FF5500]/35 bg-[#FF5500]/10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF8C42] font-sans">Add Upstream Git Repository</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] text-[#D4D4D8] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded px-1"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#D4D4D8] block mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acr-enterprise"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.14] bg-[#000000] text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#D4D4D8] block mb-1">Provider Type</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.14] bg-[#000000] text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  <option value="github">GitHub</option>
                  <option value="gitea">Gitea</option>
                  <option value="gitlab">GitLab</option>
                  <option value="custom">Custom Git Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] text-[#D4D4D8] block mb-1">Clone / Registry Git URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/org/marketplace.git"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.14] bg-[#000000] text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#D4D4D8] block mb-1">Default Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.14] bg-[#000000] text-xs text-white placeholder:text-[#A1A1AA] focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[44px] w-full py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Anchor Upstream Repository
            </button>
          </form>
        )}

        {/* Repositories List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="p-3 rounded-xl border border-white/[0.08] bg-[#000000]/50 hover:border-[#FF5500]/35 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#FF8C42]" />
                  <span className="font-bold text-white font-sans text-xs">{repo.name}</span>
                  <span className="rounded bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF8C42] px-1.5 py-0.5 text-[8px] uppercase">
                    {repo.provider}
                  </span>
                  {repo.is_default && (
                    <span className="rounded bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 text-[8px] font-bold">
                      CANONICAL
                    </span>
                  )}
                </div>

                {!repo.is_default && (
                  <button
                    type="button"
                    onClick={() => onRemoveRepository(repo.id)}
                    aria-label={`Remove repository ${repo.name}`}
                    className="p-1 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    title="Remove upstream repository"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="p-1.5 rounded bg-[#141414] border border-white/[0.06] text-[10px] text-[#D4D4D8] font-mono-code truncate">
                {repo.url}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] pt-1 border-t border-white/[0.06]">
                <span className="flex items-center gap-1 text-[#10B981]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Synced ({repo.plugin_count} plugins indexed)</span>
                </span>
                <span>Branch: <strong className="text-[#D4D4D8]">{repo.branch}</strong> • {repo.last_synced}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] text-[10px] text-[#A1A1AA] flex items-center justify-between shrink-0">
          <span>Source of Truth: Federated Git Upstreams</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
