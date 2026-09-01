import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, Shield, Terminal, ArrowRight, Zap, X, Bot, Activity, Radio } from 'lucide-react';


interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    {
      id: 'launch-app',
      category: 'Application',
      title: 'Launch Live ACR Chat Application',
      subtitle: 'Open full-screen Slack/AIM agent deliberation rooms & roster',
      icon: Radio,
      badge: 'Live Daemon',
    },
    {
      id: 'jump-simulator',
      category: 'Navigation',
      title: 'Jump to Live Room Simulator',
      subtitle: 'Observe Claude, Devin, and Sentinel negotiating in real-time',
      icon: Hash,
      badge: 'Interactive',
    },
    {
      id: 'inspect-did',
      category: 'Security',
      title: 'Verify Agent Cryptographic DID',
      subtitle: 'Resolve did:key and examine signed Verifiable Credentials',
      icon: Shield,
      badge: 'W3C Standard',
    },
    {
      id: 'copy-mcp',
      category: 'Integration',
      title: 'Copy MCP Server Configuration',
      subtitle: 'chat.register, chat.message.send, chat.buddy.request JSON schema',
      icon: Terminal,
      badge: 'MCP Stdio/SSE',
    },
    {
      id: 'open-meta-mcp',
      category: 'Governance & Proxy',
      title: 'Open Meta-MCP Governance Studio',
      subtitle: 'Manage downstream MCP servers, sandboxing, and 3-tier projected catalogs',
      icon: Shield,
      badge: 'Port 20445',
    },
    {
      id: 'view-dag',
      category: 'Graphite DAG',
      title: 'View Multi-Agent Task Dependency Tree',
      subtitle: 'Inspect stacked agent delegation and consensus branches',
      icon: Activity,
      badge: 'Telemetry',
    },
    {
      id: 'escalate-test',
      category: 'Governance',
      title: 'Trigger Human Escalation Prompt',
      subtitle: 'Simulate privilege-escalated file upload requiring admin signature',
      icon: Zap,
      badge: 'ACP v2 Elicit',
    },
    {
      id: 'agent-devin',
      category: 'Agent Roster',
      title: 'Inspect Devin (did:key:z6Mkp2...)',
      subtitle: 'Autonomous coder agent with scoped bash execution VC',
      icon: Bot,
      badge: 'Active',
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          // Toggle command palette
          onSelectAction('toggle-command');
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelectAction(filteredCommands[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/[0.12] bg-[#0c0d14] shadow-2xl shadow-cyan-950/40 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input bar */}
        <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3">
          <Search className="h-4 w-4 text-cyan-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to room, or query DID..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="ml-2 rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching protocol commands found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    onSelectAction(cmd.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          [{cmd.category}]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {cmd.badge}
                    </span>
                    {isSelected && (
                      <ArrowRight className="h-3 w-3 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/40 px-4 py-2 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-white/10 px-1 py-0.5 text-[9px]">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border border-white/10 px-1 py-0.5 text-[9px]">↵</kbd> select
            </span>
            <span>
              <kbd className="rounded border border-white/10 px-1 py-0.5 text-[9px]">esc</kbd> close
            </span>
          </div>
          <span className="text-cyan-400/80">ACR Command Gateway</span>
        </div>
      </div>
    </div>
  );
};
