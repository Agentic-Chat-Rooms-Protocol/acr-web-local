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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in motion-reduce:animate-none"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#FF5500]/35 bg-[#0D0D11] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 id="plugin-wizard-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>Install Plugin: {plugin.name}</span>
                <span className="text-[#FF8C42] text-[10px] font-mono-code">v{plugin.version}</span>
              </h3>
              <p className="text-[10px] text-[#A1A1AA] font-sans">
                Target Agent: <strong className="text-[#FF8C42]">{agent.name}</strong> ({agent.org})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close installation wizard"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
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
                  ? 'bg-[#FF5500]/20 border-[#FF5500]/45 text-[#FF8C42] font-bold'
                  : currentStep > s.num
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    : 'bg-[#000000]/50 border-white/[0.08] text-[#A1A1AA]'
              }`}
            >
              <div className="text-[10px] truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Scopes & Trust */}
        {currentStep === 1 && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-3 rounded-xl border border-white/[0.08] bg-[#000000]/50 space-y-2">
              <div className="text-[10px] uppercase text-[#A1A1AA] font-bold">Plugin Overview</div>
              <p className="text-[#D4D4D8] text-[11px] font-sans leading-relaxed">
                {plugin.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] pt-2 border-t border-white/[0.06]">
                <span>Author: <strong className="text-white">{plugin.author}</strong></span>
                <span>Quality Benchmark: <strong className="text-[#10B981]">{plugin.quality_score}/100</strong></span>
              </div>
            </div>

            {/* ANS Trust Badge */}
            <div className="p-3 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Shield className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Verified ANS Identity Anchor: {plugin.trust_badge}</span>
              </div>
              <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-[#10B981] font-bold font-mono-code">
                PASS
              </span>
            </div>

            {/* Required Capability Scopes */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase text-[#A1A1AA] font-bold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-[#FF8C42]" />
                <span>Requested Capability Scopes</span>
              </div>
              <div className="space-y-1.5">
                {(plugin.permissions_required || ['mcp.tools.execute']).map((perm) => (
                  <div
                    key={perm}
                    className="p-2 rounded-lg bg-[#000000]/60 border border-white/[0.08] flex items-center justify-between text-[10px]"
                  >
                    <span className="text-[#FF8C42] font-mono-code">{perm}</span>
                    <span className="text-[#A1A1AA]">Granted to {agent.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Exported */}
            {plugin.tools && plugin.tools.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase text-[#A1A1AA] font-bold">
                  Exported MCP Tool Primitives ({plugin.tools.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plugin.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-[#141414] border border-white/[0.12] px-2 py-0.5 text-[9px] text-[#D4D4D8] font-mono-code"
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
            <div className="p-2.5 rounded-xl bg-[#000000]/50 border border-white/[0.08] text-[10px] text-[#D4D4D8] flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-[#FF8C42] shrink-0" />
              <span>Configure runtime parameters before activating this plugin on the agent.</span>
            </div>

            {(!plugin.config_schema || plugin.config_schema.length === 0) ? (
              <div className="p-8 text-center text-[#A1A1AA]">
                This plugin does not require custom parameter tuning.
              </div>
            ) : (
              plugin.config_schema.map((field) => {
                const val = config[field.key] !== undefined ? config[field.key] : field.defaultValue;

                return (
                  <div
                    key={field.key}
                    className="p-3 rounded-xl border border-white/[0.08] bg-[#000000]/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`install-field-${field.key}`}
                        className="text-[11px] font-bold text-white font-sans"
                      >
                        {field.label}
                      </label>
                      <span className="text-[9px] font-mono-code text-[#FF8C42]">{field.key}</span>
                    </div>

                    <p className="text-[10px] text-[#A1A1AA] font-sans leading-relaxed">
                      {field.description}
                    </p>

                    {field.type === 'boolean' ? (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          id={`install-field-${field.key}`}
                          onClick={() => handleChange(field.key, !val)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                            val ? 'bg-[#FF5500]' : 'bg-[#262626]'
                          }`}
                          role="switch"
                          aria-checked={Boolean(val)}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out motion-reduce:transition-none ${
                              val ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[10px] font-semibold text-[#D4D4D8]">
                          {val ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={`install-field-${field.key}`}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full mt-1 rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
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
                        className="w-full mt-1 rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                      />
                    ) : (
                      <input
                        id={`install-field-${field.key}`}
                        type={field.type === 'secret' ? 'password' : 'text'}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full mt-1 rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
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
            <div className="p-4 rounded-xl border border-[#FF5500]/35 bg-[#FF5500]/10 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#FF8C42] mx-auto" />
              <h4 className="text-sm font-bold text-white font-sans">Ready to Cryptographically Anchor</h4>
              <p className="text-[11px] text-[#D4D4D8] font-sans">
                {plugin.name} v{plugin.version} will be anchored to DID <strong className="text-[#FF8C42] break-all">{agent.did}</strong>
              </p>
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="text-[10px] uppercase text-[#A1A1AA] font-bold">Summary of Deployment</div>
              <div className="p-3 rounded-xl bg-[#000000]/60 border border-white/[0.08] space-y-2 font-mono-code">
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Plugin ID:</span>
                  <span className="text-white">{plugin.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Content SHA-256:</span>
                  <span className="text-[#FF8C42]">{plugin.content_hash?.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Repository Provider:</span>
                  <span className="text-[#10B981]">{plugin.repository_source || 'acr-official'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Configured Parameters:</span>
                  <span className="text-[#D4D4D8]">{Object.keys(config).length} active</span>
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
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-3 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isInstalling}
              onClick={handleFinish}
              className="min-h-[44px] flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
