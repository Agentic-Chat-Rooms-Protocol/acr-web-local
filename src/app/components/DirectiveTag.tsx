import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SlashCommandDef } from './slashCommands';

interface DirectiveTagProps {
  command: SlashCommandDef;
  onRemove: () => void;
}

export const DirectiveTag: React.FC<DirectiveTagProps> = ({ command, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = command.icon;

  const categoryStyles = {
    governance:
      'bg-[#FF5500]/15 border-[#FF5500]/35 text-[#FF8C42] hover:bg-[#FF5500]/25',
    mcp:
      'bg-[#141414] border-white/[0.14] text-[#D4D4D8] hover:bg-white/[0.08]',
    diagnostics:
      'bg-[#38BDF8]/15 border-[#38BDF8]/35 text-[#38BDF8] hover:bg-[#38BDF8]/25',
    workflow:
      'bg-[#10B981]/15 border-[#10B981]/35 text-[#10B981] hover:bg-[#10B981]/25',
  }[command.category];

  return (
    <div
      className="relative inline-flex items-center group animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
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
          className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/20 text-current/80 hover:text-white transition-colors cursor-pointer ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
        >
          <X className="h-3 w-3" />
        </button>
      </span>

      {/* Floating Tooltip */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-50 bg-[#141414] text-[#D4D4D8] text-[10px] font-sans font-medium px-2 py-0.5 rounded-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.8)] whitespace-nowrap pointer-events-none animate-in fade-in duration-100 motion-reduce:animate-none"
        >
          Remove /{command.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414]" />
        </div>
      )}
    </div>
  );
};
