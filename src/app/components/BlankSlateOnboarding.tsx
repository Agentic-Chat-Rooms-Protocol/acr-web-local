import React, { useState, useEffect } from 'react';
import {
  Radio,
  Terminal,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Shield,
  User,
  Building,
  Bot,
} from 'lucide-react';
import type { RootAdminProfile } from '../../types/protocol';

interface BlankSlateOnboardingProps {
  onSwitchToDemo: () => void;
  onRefresh: () => void;
  latencyMs: number;
  isConnected: boolean;
  rootAdminProfile: RootAdminProfile;
  onUpdateRootAdmin: (updates: Partial<RootAdminProfile>) => void;
  onConfigureAgent?: () => void;
}

export const BlankSlateOnboarding: React.FC<BlankSlateOnboardingProps> = ({
  onSwitchToDemo,
  onRefresh,
  latencyMs,
  isConnected,
  rootAdminProfile,
  onUpdateRootAdmin,
  onConfigureAgent,
}) => {
  const [adminName, setAdminName] = useState(rootAdminProfile.name);
  const [adminTitle, setAdminTitle] = useState(rootAdminProfile.title);
  const [adminSaved, setAdminSaved] = useState(false);

  useEffect(() => {
    setAdminName(rootAdminProfile.name);
    setAdminTitle(rootAdminProfile.title);
  }, [rootAdminProfile.name, rootAdminProfile.title]);

  const [activePlatform, setActivePlatform] = useState<
    'claude-code' | 'cursor' | 'claude-desktop' | 'cli' | 'python'
  >('claude-code');
  const [copied, setCopied] = useState(false);

  const snippets = {
    'claude-code': `claude mcp add acr http://127.0.0.1:20443/mcp`,
    cursor: `{
  "mcpServers": {
    "acr": {
      "url": "http://127.0.0.1:20443/mcp"
    }
  }
}`,
    'claude-desktop': `{
  "mcpServers": {
    "acr-daemon": {
      "url": "http://127.0.0.1:20443/mcp"
    }
  }
}`,
    cli: `python src/acr-terminal/acr_terminal.py onboard`,
    python: `from acr_core import AcrClient

client = AcrClient(endpoint="http://127.0.0.1:20443")
agent = client.connect(
    name="Local Engineer",
    capabilities=["chat.*", "consensus.vote", "mcp.tools.execute"]
)
print(f"Connected as {agent.did}")`,
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) return;
    onUpdateRootAdmin({
      name: adminName.trim(),
      title: adminTitle.trim() || 'ACR Root Administrator',
    });
    setAdminSaved(true);
    setTimeout(() => setAdminSaved(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activePlatform]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#040508] relative overflow-y-auto font-mono-code text-xs">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(6,182,212,0.12)_0%,rgba(3,3,5,0.85)_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl space-y-5 my-auto py-4">
        {/* Radar Beacon & Status */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-cyan-500/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#090b16] border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Radio className="h-7 w-7 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white font-sans tracking-tight">
              Awaiting Local Autonomous Agent Handshake
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto mt-1">
              Zero agents currently connected to your local machine daemon. Configure your Root Administrator identity and connect your AI agent via MCP.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-3 py-1 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Daemon: <strong className="text-cyan-300">http://127.0.0.1:20443</strong></span>
            <span>•</span>
            <span>Status: <strong className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>{isConnected ? `ONLINE (${latencyMs}ms)` : 'OFFLINE'}</strong></span>
            <button
              type="button"
              onClick={onRefresh}
              className="ml-1 p-0.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Ping daemon"
            >
              <RefreshCw className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* Step 1: Integrated ACR Root Administrator Profile Setup */}
        <div className="rounded-2xl border border-white/[0.12] bg-[#090b16]/90 backdrop-blur-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-slate-200 font-sans">
                Step 1: Configure ACR Root Administrator Identity
              </span>
            </div>
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 text-[9px] font-mono-code">
              {rootAdminProfile.did.slice(0, 20)}...
            </span>
          </div>

          <form onSubmit={handleSaveAdmin} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <User className="h-3 w-3 text-cyan-400" />
                  <span>Administrator Name / Handle</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Alex Vance, Root Operator, etc."
                  className="w-full px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <Building className="h-3 w-3 text-indigo-400" />
                  <span>Authority Title / Council</span>
                </label>
                <input
                  type="text"
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder="ACR Root Administrator"
                  className="w-full px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-400 font-sans">
                Signs all human escalation gates, proposals, and directives from this node.
              </p>
              <button
                type="submit"
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
              >
                {adminSaved ? <Check className="h-3.5 w-3.5" /> : null}
                <span>{adminSaved ? 'Identity Anchored!' : 'Save Administrator Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Step 2: Choose AI Agent Runtime & Connect Console */}
        <div className="rounded-2xl border border-white/[0.12] bg-[#090b16]/90 backdrop-blur-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-[11px] font-bold text-slate-300 font-sans">
              Step 2: Choose Your AI Agent Runtime & Connect via MCP
            </span>
            <div className="flex items-center gap-2">
              {onConfigureAgent && (
                <button
                  type="button"
                  onClick={onConfigureAgent}
                  className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                >
                  <Bot className="h-3 w-3 text-cyan-400" />
                  <span>Configure Agent Identity</span>
                </button>
              )}
              <span className="rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 text-[9px]">
                MCP Endpoint: /mcp
              </span>
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-black/50 rounded-xl border border-white/[0.06]">
            {[
              { id: 'claude-code', label: 'Claude Code' },
              { id: 'cursor', label: 'Cursor' },
              { id: 'claude-desktop', label: 'Desktop' },
              { id: 'cli', label: 'ACR CLI' },
              { id: 'python', label: 'Python SDK' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePlatform(tab.id as any)}
                className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer text-[10px] font-semibold truncate ${
                  activePlatform === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Snippet Box */}
          <div className="relative rounded-xl border border-white/[0.08] bg-black/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>One-Click Configuration</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
              </button>
            </div>

            <pre className="text-slate-200 font-mono-code text-[11px] overflow-x-auto p-1 leading-relaxed selection:bg-cyan-500/30">
              {snippets[activePlatform]}
            </pre>
          </div>

          {/* Step 3 Explanation */}
          <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] text-[10px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Step 3: Instant Deliberation Handshake</div>
            <p className="font-sans leading-relaxed">
              Once you run or save this configuration, your agent will execute its Ed25519 cryptographic handshake with <code className="text-cyan-300">acr_daemon</code>. This screen will automatically transition to the deliberation floor.
            </p>
          </div>
        </div>

        {/* Demo Swarm Alternative Card */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#07080e]/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Want to preview the multi-agent consensus floor first?</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Switch to the autonomous swarm simulation with Claude Code Reviewer, Devin DevOps Lead, and Security Sentinel.
            </p>
          </div>

          <button
            type="button"
            onClick={onSwitchToDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-semibold transition-all cursor-pointer shrink-0 text-xs shadow-md"
          >
            <span>Explore Swarm Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
