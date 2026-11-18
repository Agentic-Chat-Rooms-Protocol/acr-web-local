import React, { useState, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sliders,
  Server,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Download,
  Terminal,
  Activity,
  Sparkles,
  RotateCcw,
  Cpu,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import {
  getStoredDaemonToken,
  isDaemonTokenPersisted,
  setStoredDaemonToken,
} from '../utils/daemonAuth';
import {
  type ServicePortMapping,
  getStoredPortMappings,
  saveStoredPortMappings,
  resetStoredPortMappings,
  validatePortMappings,
  checkPortHealth,
  generateEnvExport,
  generateJsonExport,
  generateMcpClientConfig,
} from '../utils/ports';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPortsChanged?: (ports: ServicePortMapping[]) => void;
}

const AdvancedSettingsDialog: React.FC<{
  onClose: () => void;
  onPortsChanged?: (ports: ServicePortMapping[]) => void;
}> = ({ onClose, onPortsChanged }) => {
  const [activeTab, setActiveTab] = useState<'ports' | 'export' | 'diagnostics'>('ports');
  const [mappings, setMappings] = useState<ServicePortMapping[]>(() => getStoredPortMappings());
  const [apiToken, setApiToken] = useState<string>(() => getStoredDaemonToken());
  const [persistToken, setPersistToken] = useState<boolean>(() => isDaemonTokenPersisted());
  const [showToken, setShowToken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>({
    isOpen: true,
    onClose,
  });

  const errors = useMemo(() => {
    const valErrors = validatePortMappings(mappings);
    const errMap: Record<string, string> = {};
    for (const e of valErrors) {
      errMap[e.serviceId] = e.message;
    }
    return errMap;
  }, [mappings]);

  const handlePortChange = (id: string, newPortStr: string) => {
    const newPort = parseInt(newPortStr, 10);
    const updated = mappings.map((m) => (m.id === id ? { ...m, currentPort: isNaN(newPort) ? 0 : newPort } : m));
    setMappings(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      sound.playError();
      return;
    }
    saveStoredPortMappings(mappings);
    setStoredDaemonToken(apiToken, persistToken);
    setIsSaved(true);
    sound.playSuccess();
    if (onPortsChanged) {
      onPortsChanged(mappings);
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetService = (id: string) => {
    sound.playTick();
    const updated = mappings.map((m) => (m.id === id ? { ...m, currentPort: m.defaultPort } : m));
    setMappings(updated);
    setIsSaved(false);
  };

  const handleResetAll = () => {
    sound.playTick();
    const defaults = resetStoredPortMappings();
    setMappings(defaults);
    setIsSaved(true);
    sound.playSuccess();
    if (onPortsChanged) {
      onPortsChanged(defaults);
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClearToken = () => {
    sound.playTick();
    setApiToken('');
    setStoredDaemonToken('', false);
    setPersistToken(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestService = async (m: ServicePortMapping) => {
    sound.playTick();
    setTestingId(m.id);
    const res = await checkPortHealth(m);
    setMappings((prev) =>
      prev.map((item) =>
        item.id === m.id
          ? {
              ...item,
              status: res.status,
              latencyMs: res.latencyMs,
            }
          : item
      )
    );
    setTestingId(null);
    if (res.status === 'online') {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const handleTestAll = async () => {
    sound.playTick();
    setIsTestingAll(true);
    const updated = [...mappings];
    for (let i = 0; i < updated.length; i++) {
      const res = await checkPortHealth(updated[i]);
      updated[i] = {
        ...updated[i],
        status: res.status,
        latencyMs: res.latencyMs,
      };
      setMappings([...updated]);
    }
    setIsTestingAll(false);
    sound.playSuccess();
  };

  const copyToClipboard = (text: string, format: string) => {
    sound.playTick();
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isCustomized = mappings.some((m) => m.currentPort !== m.defaultPort) || apiToken.trim().length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-2xl animate-in motion-reduce:animate-none fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#262626] bg-[#0D0D11] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(255,85,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#000000]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/40 shadow-[0_0_20px_rgba(255,85,0,0.22)]">
              <Sliders className="h-5 w-5 text-[#FF8C42]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id={titleId} className="text-lg font-display font-semibold tracking-tight text-white">
                  Advanced Settings, Ports &amp; ACR_API_TOKEN
                </h2>
                {isCustomized ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-mono-code font-medium text-amber-300">
                    Custom Config
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-mono-code font-medium text-emerald-300">
                    Factory Defaults
                  </span>
                )}
              </div>
              <p id={descId} className="text-xs text-zinc-400">
                Configure 127.0.0.1 workstation port bindings, Bearer ACR_API_TOKEN auth, and .env/JSON exports.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            aria-label="Close Settings Modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 border-b border-white/[0.08] bg-[#000000]/90 shrink-0">
          <div className="flex items-center gap-2 py-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setActiveTab('ports');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                activeTab === 'ports'
                  ? 'bg-[#FF5500]/20 text-[#FFB07A] border border-[#FF5500]/45 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              Service Port Matrix
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setActiveTab('export');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                activeTab === 'export'
                  ? 'bg-[#FF5500]/20 text-[#FFB07A] border border-[#FF5500]/45 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Manifest &amp; .env Exports
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setActiveTab('diagnostics');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                activeTab === 'diagnostics'
                  ? 'bg-[#FF5500]/20 text-[#FFB07A] border border-[#FF5500]/45 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Live Mesh Diagnostics
            </button>
          </div>

          <div className="flex items-center gap-2 py-2 sm:py-0">
            <button
              type="button"
              onClick={handleTestAll}
              disabled={isTestingAll}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono-code text-zinc-300 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <RefreshCw className={`h-3 w-3 ${isTestingAll ? 'animate-spin motion-reduce:animate-none text-[#FF8C42]' : ''}`} />
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SERVICE PORT MATRIX + ACR_API_TOKEN */}
          {activeTab === 'ports' && (
            <div className="space-y-4">
              {/* ACR_API_TOKEN Bearer Auth Panel */}
              <div className="rounded-2xl border border-[#FF5500]/30 bg-[#000000]/70 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#FF8C42]" />
                    <span className="text-xs font-mono-code uppercase tracking-wider font-semibold text-white">
                      Local Daemon Authentication (ACR_API_TOKEN)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-zinc-400">
                    Sent as Authorization: Bearer &lt;token&gt; to 127.0.0.1
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={apiToken}
                      onChange={(e) => {
                        setApiToken(e.target.value);
                        setIsSaved(false);
                      }}
                      placeholder="Optional local ACR_API_TOKEN (e.g. acr_local_dev_token)"
                      aria-label="Local ACR_API_TOKEN"
                      className="w-full rounded-xl border border-white/[0.15] bg-[#0D0D11] pl-3 pr-9 py-2 text-xs font-mono-code text-white placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((prev) => !prev)}
                      aria-label={showToken ? 'Hide API token' : 'Show API token'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    >
                      {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {apiToken && (
                    <button
                      type="button"
                      onClick={handleClearToken}
                      className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-950/20 text-xs font-mono-code text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                    >
                      Clear Token
                    </button>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={persistToken}
                    onChange={(e) => {
                      setPersistToken(e.target.checked);
                      setIsSaved(false);
                    }}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-[#0D0D11] accent-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  />
                  <span>Remember ACR_API_TOKEN in localStorage across restarts (default: sessionStorage only)</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono-code uppercase tracking-wider text-zinc-400">
                  Configured Port Bindings (5 Local Services)
                </span>
                <span className="text-xs text-zinc-400">Unprivileged user range: 1024 - 65535</span>
              </div>

              <div className="space-y-3">
                {mappings.map((m) => {
                  const hasErr = !!errors[m.id];
                  const isModified = m.currentPort !== m.defaultPort;

                  return (
                    <div
                      key={m.id}
                      className={`relative rounded-2xl border p-4 transition-all duration-200 ${
                        hasErr
                          ? 'border-red-500/60 bg-red-950/15 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                          : isModified
                          ? 'border-[#FF5500]/45 bg-[#FF5500]/5 shadow-[0_0_20px_rgba(255,85,0,0.08)]'
                          : 'border-[#262626] bg-[#000000]/50 hover:border-white/[0.18]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-semibold text-white tracking-tight">{m.name}</span>
                            <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono-code text-zinc-300">
                              {m.protocol.toUpperCase()}
                            </span>
                            <span className="rounded border border-[#FF5500]/30 bg-[#FF5500]/10 px-1.5 py-0.5 text-[10px] font-mono-code text-[#FFB07A]">
                              ${'{' + m.envVar + '}'}
                            </span>
                            {isModified && (
                              <span className="rounded-full border border-amber-500/30 bg-amber-950/30 px-1.5 py-0.5 text-[9px] font-mono-code text-amber-300">
                                Default: {m.defaultPort}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 max-w-xl">{m.description}</p>
                        </div>

                        {/* Port Input & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Live Status Indicator */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] bg-[#000000]/80 text-[11px] font-mono-code">
                            {testingId === m.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin motion-reduce:animate-none text-[#FF8C42]" />
                            ) : m.status === 'online' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                <span className="text-emerald-400">ONLINE</span>
                                {m.latencyMs && <span className="text-zinc-400 text-[10px]">({m.latencyMs}ms)</span>}
                              </>
                            ) : m.status === 'offline' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
                                <span className="text-red-400">OFFLINE</span>
                              </>
                            ) : (
                              <>
                                <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                                <span className="text-zinc-400">UNTESTED</span>
                              </>
                            )}
                          </div>

                          {/* Port Number Input */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono-code text-zinc-400">:</span>
                            <input
                              type="number"
                              min="1024"
                              max="65535"
                              value={m.currentPort === 0 ? '' : m.currentPort}
                              onChange={(e) => handlePortChange(m.id, e.target.value)}
                              aria-label={`Port for ${m.name}`}
                              className={`w-24 rounded-xl border bg-[#000000] px-3 py-1.5 text-center font-mono-code text-sm text-white transition-all focus-visible:outline-none ${
                                hasErr
                                  ? 'border-red-500 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400/50'
                                  : 'border-white/[0.15] focus-visible:border-[#FF5500] focus-visible:ring-2 focus-visible:ring-[#FF5500]'
                              }`}
                            />
                          </div>

                          {/* Test Button */}
                          <button
                            type="button"
                            onClick={() => handleTestService(m)}
                            disabled={testingId === m.id}
                            title="Ping port"
                            aria-label={`Ping port for ${m.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-[#FFB07A] hover:border-[#FF5500]/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Button */}
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleResetService(m.id)}
                              title="Reset to default port"
                              aria-label={`Reset port for ${m.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Error Message Pill */}
                      {hasErr && (
                        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-1 text-xs text-red-300">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors[m.id]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANIFEST & EXPORTS */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* .env Export Box */}
              <div className="rounded-2xl border border-[#262626] bg-[#000000]/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#FF8C42]" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      Standard .env File Export
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateEnvExport(mappings, apiToken), 'env')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-[#FFB07A] bg-[#FF5500]/15 border border-[#FF5500]/35 hover:bg-[#FF5500]/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedFormat === 'env' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'env' ? 'Copied .env' : 'Copy .env'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#000000] border border-white/[0.06] text-xs font-mono-code text-[#FFB07A] overflow-x-auto">
                  {generateEnvExport(mappings, apiToken)}
                </pre>
              </div>

              {/* JSON Manifest Export Box */}
              <div className="rounded-2xl border border-[#262626] bg-[#000000]/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#FF5500]" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      Daemon Configuration (~/.acr/ports.json)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateJsonExport(mappings), 'json')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-[#FFB07A] bg-[#FF5500]/15 border border-[#FF5500]/35 hover:bg-[#FF5500]/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedFormat === 'json' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'json' ? 'Copied JSON' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#000000] border border-white/[0.06] text-xs font-mono-code text-zinc-200 overflow-x-auto">
                  {generateJsonExport(mappings)}
                </pre>
              </div>

              {/* MCP Client Config Export */}
              <div className="rounded-2xl border border-[#262626] bg-[#000000]/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      MCP Client Integration (Claude / Cursor / VSCode)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateMcpClientConfig(mappings, apiToken), 'mcp')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    {copiedFormat === 'mcp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'mcp' ? 'Copied Config' : 'Copy MCP Config'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#000000] border border-white/[0.06] text-xs font-mono-code text-emerald-200/90 overflow-x-auto">
                  {generateMcpClientConfig(mappings, apiToken)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MESH DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#262626] bg-[#000000]/60 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Local Workstation Topology &amp; PNA Status</h3>
                    <p className="text-xs text-zinc-400">
                      Private Network Access (PNA) headers and CORS loopback engine status.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono-code text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none"></span>
                    PNA Engine: Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-[#000000]/80 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-zinc-400">PNA Header</span>
                    <p className="text-xs font-mono-code text-[#FFB07A]">Access-Control-Allow-Private-Network: true</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#000000]/80 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-zinc-400">Loopback Resolution</span>
                    <p className="text-xs font-mono-code text-[#FFB07A]">127.0.0.1 / localhost</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#000000]/80 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-zinc-400">CLI Config Target</span>
                    <p className="text-xs font-mono-code text-[#FFB07A]">~/.acr/ports.json</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#000000] p-4 text-xs font-mono-code text-zinc-300 space-y-2">
                  <div className="flex items-center gap-2 text-[#FF8C42] font-bold">
                    <Terminal className="h-4 w-4" />
                    <span>CLI Quick Commands</span>
                  </div>
                  <p className="text-zinc-400">
                    Inspect and alter port bindings directly from your local terminal:
                  </p>
                  <div className="space-y-1 text-[#FFB07A]">
                    <p>• acr ports list</p>
                    <p>• acr ports set acr-core 20499</p>
                    <p>• acr ports reset</p>
                    <p>• acr ports test</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#000000]/80 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              Reset All to Defaults
            </button>
            {isSaved && (
              <span className="flex items-center gap-1 text-xs font-mono-code text-emerald-400 animate-in motion-reduce:animate-none fade-in">
                <Check className="h-3.5 w-3.5" />
                Settings Saved &amp; Applied!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={hasErrors}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase font-mono-code text-[#000000] bg-[#FF5500] hover:bg-[#FF6600] shadow-[0_0_20px_rgba(255,85,0,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <Check className="h-3.5 w-3.5 text-[#000000]" />
              Save &amp; Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  onPortsChanged,
}) => {
  if (!isOpen || typeof document === 'undefined') return null;
  return <AdvancedSettingsDialog onClose={onClose} onPortsChanged={onPortsChanged} />;
};
