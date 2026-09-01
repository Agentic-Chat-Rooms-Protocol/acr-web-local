import React, { useState, useEffect } from 'react';
import {
  X,
  Terminal,
  Copy,
  Check,
  Server,
  Zap,
} from 'lucide-react';

interface ConnectMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCloudSandbox?: () => void;
}

export const ConnectMcpModal: React.FC<ConnectMcpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'claude' | 'antigravity' | 'cursor'>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        acr: {
          command: "acr-mcp-server",
          args: [],
          env: {
            ACR_DAEMON_URL: "http://localhost:20443"
          }
        }
      }
    },
    null,
    2
  );

  const antigravityConfig = JSON.stringify(
    {
      mcpServers: {
        "acr-mesh": {
          command: "acr-mcp-server",
          args: [],
          env: {
            ACR_DAEMON_URL: "http://localhost:20443"
          }
        }
      }
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        "acr-local": {
          url: "http://localhost:20443/mcp"
        }
      }
    },
    null,
    2
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connect Model Context Protocol (MCP)"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-[#090b14] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Terminal className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Connect Local MCP Agent</h2>
                <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Local Workstation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect Claude Desktop, Antigravity, or Cursor directly to your local ACR Core Daemon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Connect MCP dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-white/[0.06] bg-black/30 gap-2">
          <button
            onClick={() => setActiveTab('claude')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'claude'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span>Claude Desktop</span>
          </button>

          <button
            onClick={() => setActiveTab('antigravity')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'antigravity'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Google Antigravity</span>
          </button>

          <button
            onClick={() => setActiveTab('cursor')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'cursor'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Cursor IDE</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          {activeTab === 'claude' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Claude Desktop (<code className="text-cyan-300 font-mono-code">claude_desktop_config.json</code>)</span>
                <button
                  onClick={() => copyToClipboard(claudeConfig, 'claude')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey === 'claude' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'claude' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono-code text-cyan-200/90 overflow-x-auto">
                {claudeConfig}
              </pre>
            </div>
          )}

          {activeTab === 'antigravity' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Google Antigravity (<code className="text-indigo-300 font-mono-code">antigravity_config.json</code>)</span>
                <button
                  onClick={() => copyToClipboard(antigravityConfig, 'antigravity')}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedKey === 'antigravity' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'antigravity' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono-code text-indigo-200/90 overflow-x-auto">
                {antigravityConfig}
              </pre>
            </div>
          )}

          {activeTab === 'cursor' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Cursor IDE (<code className="text-emerald-300 font-mono-code">mcp.json</code>)</span>
                <button
                  onClick={() => copyToClipboard(cursorConfig, 'cursor')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  {copiedKey === 'cursor' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'cursor' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono-code text-emerald-200/90 overflow-x-auto">
                {cursorConfig}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Daemon URL: <span className="font-mono-code text-cyan-300">http://localhost:20443</span></span>
            </div>
            <span className="text-[10px] font-mono-code text-slate-500">100% Local / Zero Cloud</span>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-black/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Open Source Local Workstation Edition</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
