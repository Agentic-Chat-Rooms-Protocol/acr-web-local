import React, { useState, useEffect, useId } from 'react';
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
} from 'lucide-react';
import { sound } from '../utils/sound';
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

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  onPortsChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'ports' | 'export' | 'diagnostics'>('ports');
  const [mappings, setMappings] = useState<ServicePortMapping[]>(getStoredPortMappings());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredPortMappings();
      setMappings(stored);
      validate(stored);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validate = (current: ServicePortMapping[]) => {
    const valErrors = validatePortMappings(current);
    const errMap: Record<string, string> = {};
    for (const e of valErrors) {
      errMap[e.serviceId] = e.message;
    }
    setErrors(errMap);
    return valErrors.length === 0;
  };

  const handlePortChange = (id: string, newPortStr: string) => {
    const newPort = parseInt(newPortStr, 10);
    const updated = mappings.map((m) => (m.id === id ? { ...m, currentPort: isNaN(newPort) ? 0 : newPort } : m));
    setMappings(updated);
    setIsSaved(false);
    validate(updated);
  };

  const handleSave = () => {
    if (!validate(mappings)) {
      sound.playError();
      return;
    }
    saveStoredPortMappings(mappings);
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
    validate(updated);
  };

  const handleResetAll = () => {
    sound.playTick();
    const defaults = resetStoredPortMappings();
    setMappings(defaults);
    setErrors({});
    setIsSaved(true);
    sound.playSuccess();
    if (onPortsChanged) {
      onPortsChanged(defaults);
    }
    setTimeout(() => setIsSaved(false), 2500);
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

  if (!isOpen) return null;

  const hasErrors = Object.keys(errors).length > 0;
  const isCustomized = mappings.some((m) => m.currentPort !== m.defaultPort);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/[0.12] bg-[#07080e] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(6,182,212,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Sliders className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id={titleId} className="text-lg font-display font-semibold tracking-tight text-white">
                  Advanced Settings &amp; Port Mapping
                </h2>
                {isCustomized ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-mono-code font-medium text-amber-300">
                    Custom Mappings
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-mono-code font-medium text-emerald-300">
                    Factory Defaults
                  </span>
                )}
              </div>
              <p id={descId} className="text-xs text-slate-400">
                Configure runtime ports, resolve collisions, and export dynamic network manifests across the ACR mesh.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            aria-label="Close Settings Modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-white/[0.08] bg-[#05060b] shrink-0">
          <div className="flex items-center gap-2 py-2.5">
            <button
              onClick={() => {
                sound.playTick();
                setActiveTab('ports');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'ports'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              Service Port Matrix
            </button>
            <button
              onClick={() => {
                sound.playTick();
                setActiveTab('export');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Manifest &amp; .env Exports
            </button>
            <button
              onClick={() => {
                sound.playTick();
                setActiveTab('diagnostics');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Live Mesh Diagnostics
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAll}
              disabled={isTestingAll}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono-code text-slate-300 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isTestingAll ? 'animate-spin text-cyan-400' : ''}`} />
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SERVICE PORT MATRIX */}
          {activeTab === 'ports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code uppercase tracking-wider text-slate-400">
                  Configured Port Bindings (5 Ecosystem Services)
                </span>
                <span className="text-xs text-slate-500">Unprivileged user range: 1024 - 65535</span>
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
                          ? 'border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                          : 'border-white/[0.08] bg-black/40 hover:border-white/[0.16]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-semibold text-white tracking-tight">{m.name}</span>
                            <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono-code text-slate-300">
                              {m.protocol.toUpperCase()}
                            </span>
                            <span className="rounded border border-cyan-500/20 bg-cyan-950/40 px-1.5 py-0.5 text-[10px] font-mono-code text-cyan-300">
                              ${'{' + m.envVar + '}'}
                            </span>
                            {isModified && (
                              <span className="rounded-full border border-amber-500/30 bg-amber-950/30 px-1.5 py-0.2 text-[9px] font-mono-code text-amber-300">
                                Default: {m.defaultPort}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 max-w-xl">{m.description}</p>
                        </div>

                        {/* Port Input & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Live Status Indicator */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] bg-black/60 text-[11px] font-mono-code">
                            {testingId === m.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                            ) : m.status === 'online' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                <span className="text-emerald-400">ONLINE</span>
                                {m.latencyMs && <span className="text-slate-500 text-[10px]">({m.latencyMs}ms)</span>}
                              </>
                            ) : m.status === 'offline' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
                                <span className="text-red-400">OFFLINE</span>
                              </>
                            ) : (
                              <>
                                <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                                <span className="text-slate-400">UNTESTED</span>
                              </>
                            )}
                          </div>

                          {/* Port Number Input */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono-code text-slate-400">:</span>
                            <input
                              type="number"
                              min="1024"
                              max="65535"
                              value={m.currentPort === 0 ? '' : m.currentPort}
                              onChange={(e) => handlePortChange(m.id, e.target.value)}
                              aria-label={`Port for ${m.name}`}
                              className={`w-24 rounded-xl border bg-black/80 px-3 py-1.5 text-center font-mono-code text-sm text-white focus:outline-none transition-all ${
                                hasErr
                                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                                  : 'border-white/[0.15] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                              }`}
                            />
                          </div>

                          {/* Test Button */}
                          <button
                            onClick={() => handleTestService(m)}
                            disabled={testingId === m.id}
                            title="Ping port"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Button */}
                          {isModified && (
                            <button
                              onClick={() => handleResetService(m.id)}
                              title="Reset to default port"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
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
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      Standard .env File Export
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateEnvExport(mappings), 'env')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors cursor-pointer"
                  >
                    {copiedFormat === 'env' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'env' ? 'Copied .env' : 'Copy .env'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#030408] border border-white/[0.06] text-xs font-mono-code text-cyan-200/90 overflow-x-auto">
                  {generateEnvExport(mappings)}
                </pre>
              </div>

              {/* JSON Manifest Export Box */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      Daemon Configuration (~/.acr/ports.json)
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateJsonExport(mappings), 'json')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition-colors cursor-pointer"
                  >
                    {copiedFormat === 'json' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'json' ? 'Copied JSON' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#030408] border border-white/[0.06] text-xs font-mono-code text-indigo-200/90 overflow-x-auto">
                  {generateJsonExport(mappings)}
                </pre>
              </div>

              {/* MCP Client Config Export */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-mono-code uppercase font-semibold text-white">
                      MCP Client Integration (Claude / Cursor / VSCode)
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateMcpClientConfig(mappings), 'mcp')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                  >
                    {copiedFormat === 'mcp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedFormat === 'mcp' ? 'Copied Config' : 'Copy MCP Config'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#030408] border border-white/[0.06] text-xs font-mono-code text-emerald-200/90 overflow-x-auto">
                  {generateMcpClientConfig(mappings)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MESH DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Local Workstation Topology &amp; PNA Status</h3>
                    <p className="text-xs text-slate-400">
                      Private Network Access (PNA) headers and CORS loopback engine status.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono-code text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    PNA Engine: Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-black/60 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-slate-400">PNA Header</span>
                    <p className="text-xs font-mono-code text-cyan-300">Access-Control-Allow-Private-Network: true</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/60 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-slate-400">Loopback Resolution</span>
                    <p className="text-xs font-mono-code text-cyan-300">127.0.0.1 / localhost</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/60 p-3 space-y-1">
                    <span className="text-[11px] font-mono-code text-slate-400">CLI Config Target</span>
                    <p className="text-xs font-mono-code text-cyan-300">~/.acr/ports.json</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#04050a] p-4 text-xs font-mono-code text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Terminal className="h-4 w-4" />
                    <span>CLI Quick Commands</span>
                  </div>
                  <p className="text-slate-400">
                    You can inspect and alter port bindings directly from your terminal:
                  </p>
                  <div className="space-y-1 text-cyan-200">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-black/70 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              Reset All to Defaults
            </button>
            {isSaved && (
              <span className="flex items-center gap-1 text-xs font-mono-code text-emerald-400 animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                Settings Saved &amp; Applied!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playTick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={hasErrors}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase font-mono-code text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Check className="h-3.5 w-3.5 text-black" />
              Save &amp; Apply Ports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
