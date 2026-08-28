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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-teal-500/30 bg-[#090b16] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 id="repo-modal-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>Marketplace Repository Sources</span>
                <span className="text-teal-400 text-[10px] font-mono-code">apt-get provider</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Federated Git upstream provider registries for autonomous agent plugins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close repository modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="text-[10px] uppercase text-slate-500 font-bold">
            Active Repositories ({repositories.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSync}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.1] text-slate-300 hover:text-cyan-300 hover:bg-white/[0.04] transition-colors cursor-pointer text-[10px]"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{syncSuccess ? 'Synced!' : 'Sync Sources'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold transition-all cursor-pointer text-[10px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Repository</span>
            </button>
          </div>
        </div>

        {/* Add Repository Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 font-sans">Add Upstream Git Repository</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acr-enterprise"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Provider Type</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.1] bg-black/60 text-xs text-white focus:outline-none focus:border-teal-400"
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
                <label className="text-[10px] text-slate-400 block mb-1">Clone / Registry Git URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/org/marketplace.git"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 font-mono-code"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Default Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 font-mono-code"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs transition-all cursor-pointer"
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
              className="p-3 rounded-xl border border-white/[0.08] bg-black/40 hover:border-teal-500/30 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-teal-400" />
                  <span className="font-bold text-white font-sans text-xs">{repo.name}</span>
                  <span className="rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 px-1.5 py-0.5 text-[8px] uppercase">
                    {repo.provider}
                  </span>
                  {repo.is_default && (
                    <span className="rounded bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 text-[8px] font-bold">
                      CANONICAL
                    </span>
                  )}
                </div>

                {!repo.is_default && (
                  <button
                    type="button"
                    onClick={() => onRemoveRepository(repo.id)}
                    aria-label={`Remove repository ${repo.name}`}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove upstream repository"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="p-1.5 rounded bg-black/50 border border-white/[0.04] text-[10px] text-slate-300 font-mono-code truncate">
                {repo.url}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/[0.04]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Synced ({repo.plugin_count} plugins indexed)</span>
                </span>
                <span>Branch: <strong className="text-slate-300">{repo.branch}</strong> • {repo.last_synced}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] text-[10px] text-slate-400 flex items-center justify-between shrink-0">
          <span>Source of Truth: Federated Git Upstreams</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
