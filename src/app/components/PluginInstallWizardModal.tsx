import React, { useState } from 'react';
import { Sparkles, X, Check, Shield, ArrowRight, ArrowLeft, Lock, Sliders, CheckCircle2 } from 'lucide-react';
import type { MarketplacePlugin, Agent } from '../../types/protocol';

interface PluginInstallWizardModalProps {
  plugin: MarketplacePlugin;
  agent: Agent;
  onClose: () => void;
  onConfirmInstall: (config: Record<string, any>) => void;
}

export const PluginInstallWizardModal: React.FC<PluginInstallWizardModalProps> = ({
  plugin,
  agent,
  onClose,
  onConfirmInstall,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    plugin.config_schema?.forEach((field) => {
      initial[field.key] = field.defaultValue;
    });
    return initial;
  });
  const [isInstalling, setIsInstalling] = useState(false);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleFinish = () => {
    setIsInstalling(true);
    setTimeout(() => {
      onConfirmInstall(config);
      setIsInstalling(false);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plugin-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-teal-500/40 bg-[#090b16] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 id="plugin-wizard-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>Install Plugin: {plugin.name}</span>
                <span className="text-teal-400 text-[10px] font-mono-code">v{plugin.version}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Target Agent: <strong className="text-cyan-300">{agent.name}</strong> ({agent.org})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close installation wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          {[
            { num: 1, label: '1. Scopes & Trust' },
            { num: 2, label: '2. Configuration' },
            { num: 3, label: '3. Anchor & Install' },
          ].map((s) => (
            <div
              key={s.num}
              className={`px-3 py-1.5 rounded-xl border text-center transition-all ${
                currentStep === s.num
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold shadow-[0_0_12px_rgba(20,184,166,0.2)]'
                  : currentStep > s.num
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-black/30 border-white/[0.06] text-slate-500'
              }`}
            >
              <div className="text-[10px] truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Scopes & Trust */}
        {currentStep === 1 && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-3 rounded-xl border border-white/[0.08] bg-black/40 space-y-2">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Plugin Overview</div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {plugin.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.04]">
                <span>Author: <strong className="text-slate-200">{plugin.author}</strong></span>
                <span>Quality Benchmark: <strong className="text-emerald-400">{plugin.quality_score}/100</strong></span>
              </div>
            </div>

            {/* ANS Trust Badge */}
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 text-emerald-300">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verified ANS Identity Anchor: {plugin.trust_badge}</span>
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold font-mono-code">
                PASS
              </span>
            </div>

            {/* Required Capability Scopes */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>Requested Capability Scopes</span>
              </div>
              <div className="space-y-1.5">
                {(plugin.permissions_required || ['mcp.tools.execute']).map((perm) => (
                  <div
                    key={perm}
                    className="p-2 rounded-lg bg-black/50 border border-white/[0.06] flex items-center justify-between text-[10px]"
                  >
                    <span className="text-cyan-300 font-mono-code">{perm}</span>
                    <span className="text-slate-400">Granted to {agent.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Exported */}
            {plugin.tools && plugin.tools.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  Exported MCP Tool Primitives ({plugin.tools.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plugin.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[9px] text-indigo-300 font-mono-code"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[10px] text-slate-400 flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <span>Configure runtime parameters before activating this plugin on the agent.</span>
            </div>

            {(!plugin.config_schema || plugin.config_schema.length === 0) ? (
              <div className="p-8 text-center text-slate-500">
                This plugin does not require custom parameter tuning.
              </div>
            ) : (
              plugin.config_schema.map((field) => {
                const val = config[field.key] !== undefined ? config[field.key] : field.defaultValue;

                return (
                  <div
                    key={field.key}
                    className="p-3 rounded-xl border border-white/[0.06] bg-black/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`install-field-${field.key}`}
                        className="text-[11px] font-bold text-slate-200 font-sans"
                      >
                        {field.label}
                      </label>
                      <span className="text-[9px] font-mono-code text-teal-400">{field.key}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      {field.description}
                    </p>

                    {field.type === 'boolean' ? (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          id={`install-field-${field.key}`}
                          onClick={() => handleChange(field.key, !val)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            val ? 'bg-teal-500' : 'bg-slate-700'
                          }`}
                          role="switch"
                          aria-checked={Boolean(val)}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              val ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[10px] font-semibold text-slate-300">
                          {val ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={`install-field-${field.key}`}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full mt-1 rounded-lg border border-white/[0.1] bg-black/60 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        id={`install-field-${field.key}`}
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                        className="w-full mt-1 rounded-lg border border-white/[0.1] bg-black/60 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
                      />
                    ) : (
                      <input
                        id={`install-field-${field.key}`}
                        type={field.type === 'secret' ? 'password' : 'text'}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full mt-1 rounded-lg border border-white/[0.1] bg-black/60 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none font-mono-code"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Step 3: Anchor & Install */}
        {currentStep === 3 && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-teal-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-sans">Ready to Cryptographically Anchor</h4>
              <p className="text-[11px] text-slate-300 font-sans">
                {plugin.name} v{plugin.version} will be anchored to DID <strong className="text-cyan-300 break-all">{agent.did}</strong>
              </p>
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Summary of Deployment</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] space-y-2 font-mono-code">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plugin ID:</span>
                  <span className="text-white">{plugin.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Content SHA-256:</span>
                  <span className="text-cyan-400">{plugin.content_hash?.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repository Provider:</span>
                  <span className="text-teal-300">{plugin.repository_source || 'acr-official'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Configured Parameters:</span>
                  <span className="text-indigo-300">{Object.keys(config).length} active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isInstalling}
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isInstalling ? 'Anchoring...' : 'Confirm & Anchor'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
