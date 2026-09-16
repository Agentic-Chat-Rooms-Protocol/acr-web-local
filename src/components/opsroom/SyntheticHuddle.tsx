import React from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';
import type { HuddleSession } from './types';
import { sound } from '../../utils/sound';

interface SyntheticHuddleProps {
  huddle?: HuddleSession;
  onSynthesizeBrief: () => void;
}

export const SyntheticHuddle: React.FC<SyntheticHuddleProps> = ({
  huddle,
  onSynthesizeBrief,
}) => {
  return (
    <section 
      aria-labelledby="huddle-heading"
      className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-xl mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" aria-hidden="true" />
            <h3 id="huddle-heading" className="text-sm sm:text-base font-bold text-white">
              Synthetic Multi-Agent Huddle Room
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 font-mono">
              Live Audio Fabric
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Beyond Slack AI Huddle notes: Autonomous agents debate hypotheses in real time, with instant executive synthesis.
          </p>
        </div>

        <button
          onClick={() => { sound.playApprovalChime(); onSynthesizeBrief(); }}
          disabled={!huddle || huddle.lines.length === 0}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
          Synthesize Executive Brief
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transcript Conversation */}
        <div className="lg:col-span-2 space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {!huddle || huddle.lines.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Huddle in standby. Starts automatically during incident deliberation.
            </div>
          ) : (
            huddle.lines.map((line, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-start gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 text-xs font-bold">
                  {line.speakerName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{line.speakerName}</span>
                    {/* Audio Equalizer bars */}
                    <div className="flex items-end gap-0.5 h-3" aria-hidden="true">
                      {line.audioFrequencyData?.slice(0, 8).map((val, bIdx) => (
                        <span 
                          key={bIdx}
                          className="w-1 bg-purple-400 rounded-t"
                          style={{ height: `${Math.max(20, val * 100)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{line.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Executive Brief Box */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              Board-Level Executive Brief
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {huddle?.executiveBrief || 'Awaiting huddle synthesis. Audio notes and action items will sync directly into the Ops Canvas.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 text-[10px] text-purple-400 flex items-center justify-between font-mono">
            <span>Automated Canvas Sync</span>
            <span>Ed25519 Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
};
