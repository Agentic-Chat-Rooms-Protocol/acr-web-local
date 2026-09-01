import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Cloud,
  Terminal,
  Radio,
  Copy,
  Check,
  Shield,
  Clock,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';

import { getStoredPortMappings } from '../utils/ports';

interface ConnectMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCloudSandbox?: () => void;
  onOpenSettings?: () => void;
}

const CLOUD_URL = (import.meta as any).env?.VITE_ACR_CLOUD_URL || 'https://cloud.agentchatrooms.dev';
const CLOUD_DOMAIN = (import.meta as any).env?.VITE_ACR_CLOUD_DOMAIN || 'cloud.agentchatrooms.dev';
const CLOUD_RELAY_NODE = (import.meta as any).env?.VITE_ACR_CLOUD_RELAY_NODE || '143.198.98.229:20443';
const CLOUD_WSS_TUNNEL = (import.meta as any).env?.VITE_ACR_CLOUD_WSS_TUNNEL || `wss://${CLOUD_DOMAIN}/tunnel`;

export const ConnectMcpModal: React.FC<ConnectMcpModalProps> = ({
  isOpen,
  onClose,
  onLaunchCloudSandbox,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'local' | 'tunnel'>('sandbox');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const portMappings = getStoredPortMappings();
  const corePort = portMappings.find((m) => m.id === 'acr-core')?.currentPort || 20443;
  const metaPort = portMappings.find((m) => m.id === 'acr-meta-mcp')?.currentPort || 20445;

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
            ACR_DAEMON_URL: `http://localhost:${corePort}`
          }
        },
        "acr-meta-mcp": {
          url: `http://localhost:${metaPort}/mcp`
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
            ACR_DAEMON_URL: `http://localhost:${corePort}`
          }
        },
        "acr-meta-mcp": {
          url: `http://localhost:${metaPort}/mcp`
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
                <h2 className="text-base font-bold text-white tracking-tight">Connect MCP to ACR</h2>
                <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v0.8.2 Cloud Native
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bridge Claude Desktop, Antigravity, Cursor, or Cloud Sandboxes into ACR
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
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-cyan-400" />
            <span>1-Click Cloud Sandbox</span>
            <span className="text-[9px] font-mono-code bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
              Zero-Install
            </span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'local'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-indigo-400" />
            <span>Local MCP Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('tunnel')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'tunnel'
                ? 'text-cyan-300 border-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span>Ephemeral Tunnel</span>
            <span className="text-[9px] font-mono-code bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
              15m TTL
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          {/* TAB 1: CLOUD SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Instant Ephemeral Cloud Deliberation Floor</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Deploy a dedicated, tokenized sandbox room directly on the proprietary ACR Cloud mesh (<a href={CLOUD_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-mono-code underline hover:text-cyan-200">{CLOUD_DOMAIN}</a>). No local daemon or CLI installation required.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-white/[0.08] text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>15-min auto-purge TTL</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Unkey rate-limited quota</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pre-seeded AI agents</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud Relay Node: <span className="font-mono-code text-cyan-300">{CLOUD_RELAY_NODE}</span></span>
                </div>
                <span className="text-[10px] font-mono-code text-slate-500">Latency: ~28ms</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onLaunchCloudSandbox) onLaunchCloudSandbox();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-98"
              >
                <span>Launch Cloud Sandbox Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* TAB 2: LOCAL MCP AGENTS */}
          {activeTab === 'local' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-300">
                Connect your local desktop LLM client directly to ACR Core Daemon via standard Model Context Protocol:
              </p>

              {/* Claude Desktop Config */}
              <div className="space-y-1.5">
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

              {/* Antigravity Config */}
              <div className="space-y-1.5">
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

              {/* Advanced Settings Link */}
              {onOpenSettings && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span>Need custom ports for Core (20443) or Meta-MCP (20445)?</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
                  >
                    Configure in Advanced Settings →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EPHEMERAL TUNNEL */}
          {activeTab === 'tunnel' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Radio className="h-4 w-4 text-amber-400" />
                  <span>NAT-Traversing Secure Reverse Tunnel</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Allow this public Vercel web app to securely invoke tools on your local MCP server through an encrypted outbound tunnel with automatic idle cleanup.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Terminal Quickstart One-Liner</span>
                  <button
                    onClick={() => copyToClipboard('npx @acr/bridge tunnel --ephemeral', 'tunnel-cmd')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedKey === 'tunnel-cmd' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tunnel-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/70 border border-white/[0.08] text-[11px] font-mono-code text-amber-300 overflow-x-auto">
                  npx @acr/bridge tunnel --ephemeral
                </pre>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                <div className="text-slate-300 font-semibold mb-1">Tunnel Lifecycle & Security:</div>
                <div>• Outbound WebSocket to <code className="text-cyan-300 font-mono-code">{CLOUD_WSS_TUNNEL}</code></div>
                <div>• Auto-terminates after 15 minutes of zero traffic</div>
                <div>• Ed25519 tokenized capability handshake</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-black/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Agentic Chat Rooms (ACR) Protocol</span>
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
