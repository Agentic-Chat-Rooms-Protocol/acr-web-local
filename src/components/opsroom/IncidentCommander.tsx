import React, { useState } from 'react';
import { Flame, Play, RefreshCw } from 'lucide-react';
import { INCIDENT_PRESETS, type IncidentPreset } from './mock-data';
import { sound } from '../../utils/sound';

interface IncidentCommanderProps {
  selectedPreset: IncidentPreset;
  onSelectPreset: (preset: IncidentPreset) => void;
  onTriggerIncident: (customTitle?: string, customDesc?: string) => void;
  isRunning: boolean;
  onReset: () => void;
}

export const IncidentCommander: React.FC<IncidentCommanderProps> = ({
  selectedPreset,
  onSelectPreset,
  onTriggerIncident,
  isRunning,
  onReset,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleTrigger = () => {
    sound.playApprovalChime();
    if (isCustomMode && customPrompt.trim()) {
      onTriggerIncident(customPrompt.trim(), 'Custom user-triggered operational emergency');
    } else {
      onTriggerIncident();
    }
  };

  return (
    <section 
      aria-labelledby="commander-heading"
      className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-xl mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 id="commander-heading" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Operational Incident Commander
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a mission-critical failure scenario or simulate custom telemetry spikes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { sound.playTick(); setIsCustomMode(!isCustomMode); }}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            {isCustomMode ? 'Use Presets' : 'Custom Prompt'}
          </button>

          <button
            onClick={() => { sound.playTick(); onReset(); }}
            disabled={isRunning}
            aria-label="Reset war room state"
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Preset Buttons or Custom Input */}
      {!isCustomMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5" role="radiogroup" aria-label="Incident Presets">
          {INCIDENT_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => { sound.playTick(); onSelectPreset(preset); }}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-cyan-400/80 bg-gradient-to-b from-cyan-950/40 to-slate-900 shadow-lg shadow-cyan-500/15'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                    preset.severity === 'P0' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    preset.severity === 'P1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {preset.severity} INCIDENT
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{preset.category}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-5 space-y-2">
          <label htmlFor="custom-incident-input" className="block text-xs font-semibold text-slate-300">
            Prompt Custom Incident Scenario:
          </label>
          <div className="flex gap-2">
            <input
              id="custom-incident-input"
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. AWS US-East-1 S3 503 error spike triggering downstream order ingestion halt..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Trigger CTA & Telemetry Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedPreset.telemetry.map((t, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/60 border border-white/5 text-[11px]">
              <span className="text-slate-400">{t.name}:</span>
              <span className="font-mono font-bold text-white">{t.value} {t.unit}</span>
              <span className="text-[10px] text-red-400 font-bold">({t.zScore > 0 ? `+${t.zScore}σ` : `${t.zScore}σ`})</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleTrigger}
          disabled={isRunning}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Deliberation Active...' : 'Simulate Autonomous Incident Response'}</span>
        </button>
      </div>
    </section>
  );
};
