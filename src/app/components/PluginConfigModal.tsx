import React, { useState } from 'react';
import { Sliders, X, Check, Save, RotateCcw, Shield, Eye, EyeOff } from 'lucide-react';
import type { MarketplacePlugin, Agent } from '../../types/protocol';

interface PluginConfigModalProps {
  plugin: MarketplacePlugin;
  agent: Agent;
  onClose: () => void;
  onSave: (newConfig: Record<string, any>) => void;
}

export const PluginConfigModal: React.FC<PluginConfigModalProps> = ({
  plugin,
  agent,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(() => {
    return { ...(plugin.current_config || {}) };
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const defaults: Record<string, any> = {};
    plugin.config_schema?.forEach((field) => {
      defaults[field.key] = field.defaultValue;
    });
    setConfig(defaults);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plugin-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in motion-reduce:animate-none"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#FF5500]/35 bg-[#0D0D11] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/35 text-[#FF8C42]">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 id="plugin-config-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>{plugin.name}</span>
                <span className="text-[#FF8C42] text-[10px] font-mono-code">v{plugin.version}</span>
              </h3>
              <p className="text-[10px] text-[#A1A1AA] font-sans">
                Installed on <strong className="text-[#FF8C42]">{agent.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status / Anchor Banner */}
        <div className="p-2.5 rounded-xl bg-[#000000]/60 border border-white/[0.08] flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-[#10B981]">
            <Shield className="h-3.5 w-3.5" />
            <span>{plugin.trust_badge}</span>
          </span>
          <span className="text-[#A1A1AA]">Repository: {plugin.repository_source || 'acr-official'}</span>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="space-y-3">
            {(!plugin.config_schema || plugin.config_schema.length === 0) ? (
              <div className="p-6 text-center text-[#A1A1AA]">
                No configurable parameters defined for this plugin.
              </div>
            ) : (
              plugin.config_schema.map((field) => {
                const val = config[field.key] !== undefined ? config[field.key] : field.defaultValue;
                const isSecret = field.type === 'secret';
                const isRevealed = showSecrets[field.key];

                return (
                  <div
                    key={field.key}
                    className="p-3 rounded-xl border border-white/[0.08] bg-[#000000]/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`config-field-${field.key}`}
                        className="text-[11px] font-bold text-white font-sans"
                      >
                        {field.label}
                      </label>
                      <span className="text-[9px] font-mono-code text-[#FF8C42]">
                        {field.key}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#A1A1AA] font-sans leading-relaxed">
                      {field.description}
                    </p>

                    {/* Field input types */}
                    {field.type === 'boolean' ? (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          id={`config-field-${field.key}`}
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
                        id={`config-field-${field.key}`}
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
                        id={`config-field-${field.key}`}
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                        className="w-full mt-1 rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                      />
                    ) : (
                      <div className="relative mt-1">
                        <input
                          id={`config-field-${field.key}`}
                          type={isSecret && !isRevealed ? 'password' : 'text'}
                          value={val}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-white/[0.14] bg-[#000000] px-3 py-1.5 pr-9 text-xs text-white focus:border-[#FF5500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] font-mono-code"
                        />
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleSecret(field.key)}
                            className="absolute right-2 top-2 text-[#A1A1AA] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded"
                            aria-label={isRevealed ? 'Mask secret' : 'Reveal secret'}
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-3 py-1.5 rounded-lg border border-white/[0.14] text-[#D4D4D8] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="min-h-[44px] flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF8C42] text-black font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
