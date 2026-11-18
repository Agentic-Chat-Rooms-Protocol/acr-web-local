import React, { useEffect, useRef } from 'react';
import { Command } from 'lucide-react';
import { SLASH_COMMANDS, type SlashCommandDef } from './slashCommands';

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  onSelect: (command: SlashCommandDef) => void;
  onHoverIndex: (index: number) => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  query,
  selectedIndex,
  onSelect,
  onHoverIndex,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.name.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll<HTMLButtonElement>('[data-command-item]');
      const activeItem = items[selectedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Slash command autocomplete options"
      className="absolute bottom-full left-0 right-0 mb-2 z-40 max-h-72 flex flex-col rounded-2xl border border-[#FF5500]/40 bg-[#0D0D11] shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_35px_rgba(255,85,0,0.16)] overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-2 duration-150 motion-reduce:animate-none"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.08] bg-[#000000]/70 text-[10px] font-mono-code text-[#A1A1AA] select-none">
        <div className="flex items-center gap-1.5 text-[#FF8C42] font-semibold">
          <Command className="h-3 w-3" />
          <span>Slash Commands</span>
          <span className="text-[#A1A1AA] font-normal">({filteredCommands.length})</span>
        </div>
        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <span>↑↓ Navigate</span>
          <span>•</span>
          <span>↵ / Tab Select</span>
          <span>•</span>
          <span>Esc Dismiss</span>
        </div>
      </div>

      {/* Command List */}
      <div ref={listRef} className="overflow-y-auto p-1.5 space-y-0.5 max-h-60">
        {filteredCommands.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          const Icon = cmd.icon;

          const categoryColors = {
            governance: 'bg-[#FF5500]/15 text-[#FF8C42] border-[#FF5500]/30',
            mcp: 'bg-[#141414] text-[#D4D4D8] border-white/[0.14]',
            diagnostics: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
            workflow: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
          }[cmd.category];

          return (
            <button
              key={cmd.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-command-item
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => onHoverIndex(idx)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                isSelected
                  ? 'bg-[#FF5500]/15 border border-[#FF5500]/45 text-white'
                  : 'text-[#D4D4D8] hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[#FF5500]/25 border-[#FF5500] text-[#FF8C42]'
                      : 'bg-white/[0.04] border-white/[0.08] text-[#A1A1AA]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-code font-bold text-white tracking-tight">
                      /{cmd.name}
                    </span>
                    {cmd.argsHint && (
                      <span className="text-[10px] font-mono-code text-[#FF8C42] truncate">
                        {cmd.argsHint}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
                    {cmd.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span
                  className={`text-[9px] uppercase font-mono-code px-1.5 py-0.5 rounded border ${categoryColors}`}
                >
                  {cmd.category}
                </span>
                {isSelected && (
                  <span className="text-[9px] font-mono-code text-[#FF8C42] bg-[#FF5500]/10 px-1.5 py-0.5 rounded border border-[#FF5500]/30 hidden sm:inline">
                    Tab ↵
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
