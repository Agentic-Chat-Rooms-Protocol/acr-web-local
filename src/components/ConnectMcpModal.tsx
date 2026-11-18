import React, { useState, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Terminal,
  Copy,
  Check,
  Shield,
  ArrowRight,
  Server,
  Zap,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { getStoredPortMappings } from '../utils/ports';
import {
  getDaemonBaseUrl,
  getStoredDaemonToken,
  setStoredDaemonToken,
  isDaemonTokenPersisted,
  getDaemonAuthHeaders,
} from '../utils/daemonAuth';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { ctaSolidOrange } from './ctaStyles';

interface ConnectMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchLocalApp?: () => void;
  onOpenSettings?: () => void;
}

export const ConnectMcpModal: React.FC<ConnectMcpModalProps> = ({
  isOpen,
  onClose,
  onLaunchLocalApp,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'daemon'>('local');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState<string>(() => getStoredDaemonToken());
  const [showToken, setShowToken] = useState(false);
  const [persistToken, setPersistToken] = useState<boolean>(() => isDaemonTokenPersisted());
  const [tokenSaved, setTokenSaved] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'online' | 'unauthorized' | 'offline'>('idle');
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen || typeof document === 'undefined') return null;

  const portMappings = getStoredPortMappings();
  const corePort = portMappings.find((m) => m.id === 'acr-core')?.currentPort || 20443;
  const metaPort = portMappings.find((m) => m.id === 'acr-meta-mcp')?.currentPort || 20445;
  const daemonBase = getDaemonBaseUrl();
  const activeToken = getStoredDaemonToken();

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envBlock = activeToken
    ? {
        ACR_DAEMON_URL: `http://127.0.0.1:${corePort}`,
        ACR_API_TOKEN: activeToken,
      }
    : {
        ACR_DAEMON_URL: `http://127.0.0.1:${corePort}`,
      };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        acr: {
          command: 'npx',
          args: ['-y', '@acr-js/mcp-server'],
          env: envBlock,
        },
        'acr-meta-mcp': {
          url: `http://127.0.0.1:${metaPort}/mcp`,
        },
      },
    },
    null,
    2
  );

  const antigravityConfig = JSON.stringify(
    {
      mcpServers: {
        'acr-mesh': {
          command: 'acr-mcp-server',
          args: [],
          env: envBlock,
        },
        'acr-meta-mcp': {
          url: `http://127.0.0.1:${metaPort}/mcp`,
        },
      },
    },
    null,
    2
  );

  const handleSaveToken = () => {
    setStoredDaemonToken(tokenInput, persistToken);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const handleClearToken = () => {
    setTokenInput('');
    setStoredDaemonToken('', false);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const handleCheckHealth = async () => {
    setHealthStatus('checking');
    const started = performance.now();
    try {
      const res = await fetch(`${daemonBase}/api/v1/rooms`, {
        method: 'GET',
        headers: getDaemonAuthHeaders(),
      });
      setHealthLatency(Math.round((performance.now() - started) * 10) / 10);
      if (res.status === 401) {
        setHealthStatus('unauthorized');
      } else if (res.ok) {
        setHealthStatus('online');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.14] bg-[#0D0D11] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/40">
              <Terminal className="h-5 w-5 text-[#FF5500]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold text-white tracking-tight">
                  Connect Local MCP to ACR
                </h2>
                <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded-full bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/30">
                  100% Local • Zero Cloud
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Bridge Claude Desktop, Claude Code, Antigravity, or Cursor into your local acr-core daemon
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Connect MCP dialog"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-white/[0.08] bg-black/40 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
              activeTab === 'local'
                ? 'text-[#FF8C42] border-[#FF5500] bg-[#FF5500]/10'
                : 'text-[#A1A1AA] border-transparent hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-[#FF5500]" aria-hidden="true" />
            <span>Local MCP Agents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daemon')}
            className={`flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
              activeTab === 'daemon'
                ? 'text-[#FF8C42] border-[#FF5500] bg-[#FF5500]/10'
                : 'text-[#A1A1AA] border-transparent hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-[#FF8C42]" aria-hidden="true" />
            <span>Local Daemon &amp; ACR_API_TOKEN</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          {activeTab === 'local' && (
            <div className="space-y-4">
              <p className="text-xs text-[#D4D4D8]">
                Connect your local desktop or IDE agent directly to <code className="text-[#FF8C42]">http://127.0.0.1:{corePort}</code> via{' '}
                <code className="text-[#FF8C42]">@acr-js/mcp-server</code> or <code className="text-[#FF8C42]">acr-mcp-server</code>:
              </p>

              {/* Claude Desktop Config */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Claude Desktop / Cursor (<code className="text-[#FF8C42] font-mono-code">claude_desktop_config.json</code>)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(claudeConfig, 'claude')}
                    className="flex min-h-[36px] items-center gap-1 px-2 text-[11px] text-[#FF8C42] hover:text-white cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedKey === 'claude' ? <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{copiedKey === 'claude' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/80 border border-white/[0.08] text-[11px] font-mono-code text-[#D4D4D8] overflow-x-auto">
                  {claudeConfig}
                </pre>
              </div>

              {/* Antigravity / Go Binary Config */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Antigravity / Go Binary (<code className="text-[#FF8C42] font-mono-code">antigravity_config.json</code>)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(antigravityConfig, 'antigravity')}
                    className="flex min-h-[36px] items-center gap-1 px-2 text-[11px] text-[#FF8C42] hover:text-white cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedKey === 'antigravity' ? <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{copiedKey === 'antigravity' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/80 border border-white/[0.08] text-[11px] font-mono-code text-[#D4D4D8] overflow-x-auto">
                  {antigravityConfig}
                </pre>
              </div>

              {/* Advanced Settings Link */}
              {onOpenSettings && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-black/50 text-xs">
                  <div className="flex items-center gap-2 text-[#D4D4D8]">
                    <Zap className="h-4 w-4 text-[#FF5500]" aria-hidden="true" />
                    <span>Need custom ports for Core ({corePort}) or Meta-MCP ({metaPort})?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="min-h-[36px] px-2 text-[#FF8C42] hover:text-white font-semibold underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    Configure Ports →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'daemon' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-black/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#FF5500]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-white">Local Daemon Bearer Auth (ACR_API_TOKEN)</h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full border ${
                      activeToken
                        ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                        : 'bg-white/[0.05] border-white/[0.12] text-[#A1A1AA]'
                    }`}
                  >
                    {activeToken ? 'Bearer Token Active' : 'Unauthenticated Loopback'}
                  </span>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  If your local <code className="text-[#FF8C42]">acrd</code> daemon runs with <code className="text-[#FF8C42]">ACR_API_TOKEN</code> or{' '}
                  <code className="text-[#FF8C42]">-api-token</code>, enter the token below. It is sent as{' '}
                  <code className="text-[#FF8C42]">Authorization: Bearer &lt;token&gt;</code> to <code className="text-[#D4D4D8]">{daemonBase}</code>.
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Paste ACR_API_TOKEN for 127.0.0.1:20443..."
                      aria-label="ACR_API_TOKEN Bearer token"
                      className="w-full min-h-[44px] rounded-lg border border-white/[0.14] bg-[#000000] px-3 pr-10 text-xs font-mono-code text-white placeholder-[#71717A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((prev) => !prev)}
                      aria-label={showToken ? 'Hide token' : 'Show token'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-[#A1A1AA] hover:text-white cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    >
                      {showToken ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveToken}
                    className={ctaSolidOrange}
                  >
                    <span>{tokenSaved ? 'Saved' : 'Apply Token'}</span>
                  </button>
                  {activeToken && (
                    <button
                      type="button"
                      onClick={handleClearToken}
                      aria-label="Clear Bearer token"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/[0.12] bg-[#141414] text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs text-[#D4D4D8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={persistToken}
                    onChange={(e) => setPersistToken(e.target.checked)}
                    className="h-4 w-4 accent-[#FF5500]"
                  />
                  <span>Persist token across browser restarts (otherwise session-only)</span>
                </label>
              </div>

              {/* Endpoint Health Probe */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-black/50 text-xs">
                <div className="space-y-0.5">
                  <div className="text-white font-semibold">
                    Daemon Endpoint: <code className="text-[#FF8C42]">{daemonBase}</code>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] font-mono-code">
                    {healthStatus === 'idle' && 'Click Test Connection to verify loopback reachability and Bearer auth.'}
                    {healthStatus === 'checking' && 'Probing local acr-core daemon...'}
                    {healthStatus === 'online' && `Connected (${healthLatency ?? 0}ms), authenticated & ready`}
                    {healthStatus === 'unauthorized' && 'HTTP 401 Unauthorized, enter valid ACR_API_TOKEN above'}
                    {healthStatus === 'offline' && 'Daemon offline, start acrd -bind 127.0.0.1 -port 20443'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckHealth}
                  className="min-h-[44px] px-4 rounded-lg border border-white/[0.14] bg-[#141414] text-xs font-semibold text-white hover:border-[#FF5500]/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  Test Connection
                </button>
              </div>

              {/* Start Daemon One-Liner */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Start Local acr-core Daemon</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`acrd -bind 127.0.0.1 -port ${corePort}`, 'acrd-cmd')}
                    className="flex min-h-[36px] items-center gap-1 px-2 text-[11px] text-[#FF8C42] hover:text-white cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedKey === 'acrd-cmd' ? <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span>{copiedKey === 'acrd-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/80 border border-white/[0.08] text-[11px] font-mono-code text-[#FF8C42] overflow-x-auto">
                  {`acrd -bind 127.0.0.1 -port ${corePort}`}
                </pre>
              </div>

              {onLaunchLocalApp && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLaunchLocalApp();
                  }}
                  className={`w-full ${ctaSolidOrange}`}
                >
                  <span>Open Local Room Workspace</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-black/60 text-[11px] text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF5500]" />
            <span>Agentic Chat Rooms (ACR) • Local Workstation Client</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-1.5 rounded-lg border border-white/[0.12] bg-[#141414] hover:bg-[#1F1F1F] text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
