import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Hash, Shield, Terminal, ArrowRight, Zap, X, Bot, Activity, Radio, Flame } from 'lucide-react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';

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

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const modalRef = useAccessibleModal<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    initialFocusRef: inputRef,
  });

  const commands = [
    {
      id: 'jump-workspace',
      category: 'Workspace',
      title: '3-Pane Deliberation Workspace',
      subtitle: 'Responsive WCAG 2.2 AAA dual-layout, Agent Battle arena & drafts queue',
      icon: Terminal,
      badge: 'Dual-Layout',
    },
    {
      id: 'jump-opsroom',
      category: 'OpsRoom',
      title: 'ACR OpsRoom Enterprise War Room',
      subtitle: 'Atlas 2.0 Dynamic DAG & 67% Consensus Gate signed by W3C Ed25519 DIDs',
      icon: Flame,
      badge: 'War Room',
    },
    {
      id: 'simulate-incident',
      category: 'OpsRoom',
      title: 'Simulate War Room Incident Response',
      subtitle: 'Trigger multi-agent incident deliberation, 67% Consensus Gate & ToolHive sandbox',
      icon: Flame,
      badge: 'Interactive',
    },
    {
      id: 'view-battlecard',
      category: 'OpsRoom',
      title: 'Salesforce Agentforce vs OpsRoom Battlecard',
      subtitle: 'Compare $2/conv incumbent against ACR $0 Runtime Protocol Tax',
      icon: Shield,
      badge: 'Comparison',
    },
    {
      id: 'calc-roi',
      category: 'OpsRoom',
      title: 'Enterprise ROI Migration Calculator',
      subtitle: 'Calculate your annual infrastructure savings migrating from Salesforce Agentforce',
      icon: Zap,
      badge: 'ROI / TCO',
    },
    {
      id: 'launch-app',
      category: 'Application',
      title: 'Launch Live ACR Chat Application',
      subtitle: 'Open full-screen local workstation deliberation rooms & roster',
      icon: Radio,
      badge: 'Local Daemon',
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
      subtitle: 'Manage local downstream MCP servers, sandboxing, and 3-tier projected catalogs',
      icon: Shield,
      badge: 'Port 20445',
    },
    {
      id: 'open-settings',
      category: 'Network & Ports',
      title: 'Advanced Settings, Ports & ACR_API_TOKEN',
      subtitle: 'Configure runtime port bindings, Bearer token auth, and .env/JSON exports',
      icon: Zap,
      badge: 'Shift+S',
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
      subtitle: 'Local coder agent with scoped ToolHive execution VC',
      icon: Bot,
      badge: 'Active',
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const safeSelectedIndex =
    filteredCommands.length > 0 ? Math.min(selectedIndex, filteredCommands.length - 1) : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle hotkey: Cmd/Ctrl+K or Ctrl+Shift+G (or Cmd+Shift+G)
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      const isCtrlShiftG = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'g' || e.key === 'G');

      if (isCmdK || isCtrlShiftG) {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          onSelectAction('toggle-command');
        }
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[safeSelectedIndex]) {
          onSelectAction(filteredCommands[safeSelectedIndex].id);
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, safeSelectedIndex, handleClose, onSelectAction]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-[#000000]/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        data-testid="command-palette-dialog"
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#262626] bg-[#0D0D11] shadow-2xl shadow-black/90 animate-in motion-reduce:animate-none fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input bar */}
        <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3">
          <Search className="h-4 w-4 text-[#FF8C42] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Filter protocol commands"
            placeholder="Type a command, jump to room, or query DID..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close command palette"
            className="ml-2 rounded p-1 text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              No matching protocol commands found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === safeSelectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    onSelectAction(cmd.id);
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                    isSelected
                      ? 'bg-[#FF5500]/15 border border-[#FF5500]/35'
                      : 'border border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        isSelected
                          ? 'bg-[#FF5500]/20 text-[#FF8C42]'
                          : 'bg-white/[0.05] text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                          [{cmd.category}]
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                      {cmd.badge}
                    </span>
                    {isSelected && (
                      <ArrowRight className="h-3 w-3 text-[#FF8C42] animate-pulse motion-reduce:animate-none" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#000000]/60 px-4 py-2 text-[11px] font-mono text-zinc-400">
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
          <span className="text-[#FF8C42]">ACR Local Command Gateway</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
