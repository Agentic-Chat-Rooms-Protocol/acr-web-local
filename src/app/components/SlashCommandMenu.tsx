import React, { useEffect, useRef } from 'react';
import {
  Vote,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  GitCommit,
  Radio,
  Package,
  Shield,
  UserCheck,
  Clock,
  Globe,
  Lightbulb,
  HelpCircle,
  Trash2,
  FileText,
  Command,
} from 'lucide-react';

export interface SlashCommandDef {
  id: string;
  name: string;
  argsHint?: string;
  description: string;
  category: 'governance' | 'mcp' | 'diagnostics' | 'workflow';
  icon: React.ComponentType<{ className?: string }>;
  takesArgs?: boolean;
}

export const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    id: 'ballots',
    name: 'ballots',
    description: 'Open Consensus Ballots drawer to review active voting cycles.',
    category: 'governance',
    icon: Vote,
  },
  {
    id: 'vote',
    name: 'vote',
    argsHint: '[choice: approve|reject|dissent]',
    description: 'Cast zero-trust cryptographic ballot on active proposal.',
    category: 'governance',
    icon: CheckCircle2,
    takesArgs: true,
  },
  {
    id: 'propose',
    name: 'propose',
    argsHint: '[title & terms]',
    description: 'Draft and broadcast a new consensus proposal ballot.',
    category: 'governance',
    icon: Sparkles,
    takesArgs: true,
  },
  {
    id: 'dissent',
    name: 'dissent',
    argsHint: '[rationale]',
    description: 'Register formal cryptographic dissent rationale into the audit log.',
    category: 'governance',
    icon: ShieldAlert,
    takesArgs: true,
  },
  {
    id: 'audit',
    name: 'audit',
    description: 'Inspect cryptographic state chain, hash proofs, and block headers.',
    category: 'diagnostics',
    icon: GitCommit,
  },
  {
    id: 'status',
    name: 'status',
    description: 'Inspect node health, W3C DID signature proofs, and mesh latency.',
    category: 'diagnostics',
    icon: Radio,
  },
  {
    id: 'plugins',
    name: 'plugins',
    description: 'Browse, install, and configure federated MCP plugins & repos.',
    category: 'mcp',
    icon: Package,
  },
  {
    id: 'agent',
    name: 'agent',
    description: 'Configure connected MCP autonomous agents and capability scopes.',
    category: 'mcp',
    icon: Shield,
  },
  {
    id: 'buddy',
    name: 'buddy',
    description: 'Inspect agent buddy trust relationships and peer capability scopes.',
    category: 'mcp',
    icon: UserCheck,
  },
  {
    id: 'goal',
    name: 'goal',
    argsHint: '[objective]',
    description: 'Run multi-agent deliberation until specified goal is completely finished.',
    category: 'workflow',
    icon: Sparkles,
    takesArgs: true,
  },
  {
    id: 'schedule',
    name: 'schedule',
    argsHint: '[interval or timer]',
    description: 'Anchor recurring consensus heartbeat or one-time timer.',
    category: 'workflow',
    icon: Clock,
    takesArgs: true,
  },
  {
    id: 'browser',
    name: 'browser',
    argsHint: '[task or url]',
    description: 'Invoke browser verification subagent for live web inspection.',
    category: 'workflow',
    icon: Globe,
    takesArgs: true,
  },
  {
    id: 'learn',
    name: 'learn',
    argsHint: '[rule or invariant]',
    description: 'Reflect on consensus merges to capture reusable protocol rules.',
    category: 'workflow',
    icon: Lightbulb,
    takesArgs: true,
  },
  {
    id: 'btw',
    name: 'btw',
    argsHint: '[question]',
    description: 'Ask a quick question without interrupting the main consensus stream.',
    category: 'workflow',
    icon: HelpCircle,
    takesArgs: true,
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'Clear active deliberation room message feed.',
    category: 'diagnostics',
    icon: Trash2,
  },
  {
    id: 'help',
    name: 'help',
    description: 'List all available ACR slash directives and zero-trust commands.',
    category: 'diagnostics',
    icon: FileText,
  },
];

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
      className="absolute bottom-full left-0 right-0 mb-2 z-40 max-h-72 flex flex-col rounded-2xl border border-cyan-500/40 bg-[#090b14] shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_35px_rgba(6,182,212,0.2),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(56,189,248,0.2)] overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.08] bg-black/60 text-[10px] font-mono-code text-slate-400 select-none">
        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <Command className="h-3 w-3" />
          <span>Slash Commands</span>
          <span className="text-slate-500 font-normal">({filteredCommands.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
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
            governance: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
            mcp: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
            diagnostics: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
            workflow: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
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
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
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
                      <span className="text-[10px] font-mono-code text-cyan-400/80 truncate">
                        {cmd.argsHint}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
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
                  <span className="text-[9px] font-mono-code text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 hidden sm:inline">
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
