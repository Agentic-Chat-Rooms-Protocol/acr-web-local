import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SlashCommandDef } from './SlashCommandMenu';

interface DirectiveTagProps {
  command: SlashCommandDef;
  onRemove: () => void;
}

export const DirectiveTag: React.FC<DirectiveTagProps> = ({ command, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = command.icon;

  const categoryStyles = {
    governance:
      'bg-amber-500/15 border-amber-500/35 text-amber-200 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    mcp:
      'bg-indigo-500/15 border-indigo-500/35 text-indigo-200 hover:bg-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
    diagnostics:
      'bg-cyan-500/15 border-cyan-500/35 text-cyan-200 hover:bg-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    workflow:
      'bg-emerald-500/15 border-emerald-500/35 text-emerald-200 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  }[command.category];

  return (
    <div
      className="relative inline-flex items-center group animate-in fade-in zoom-in-95 duration-150"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tag Body */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-code font-semibold border transition-all select-none ${categoryStyles}`}
      >
        <span className="flex h-4 w-4 items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span>/{command.name}</span>
        {command.argsHint && (
          <span className="text-[10px] opacity-70 font-normal hidden sm:inline">
            {command.argsHint}
          </span>
        )}

        {/* Remove 'X' Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove /${command.name}`}
          className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/20 text-current/80 hover:text-white transition-colors cursor-pointer ml-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </span>

      {/* Floating Tooltip */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-50 bg-[#0c0e18] text-slate-200 text-[10px] font-sans font-medium px-2 py-0.5 rounded-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.8)] whitespace-nowrap pointer-events-none animate-in fade-in duration-100"
        >
          Remove /{command.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0c0e18]" />
        </div>
      )}
    </div>
  );
};
