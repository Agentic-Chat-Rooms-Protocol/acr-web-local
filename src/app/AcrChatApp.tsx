import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Hash,
  Send,
  Shield,
  ShieldAlert,
  GitCommit,
  ArrowLeft,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Lock,
  Plus,
  Paperclip,
  Vote,
  UserPlus,
  UserCheck,
  UserX,
  X,
  FileText,
  Package,
  Sparkles,
  Code,
  Check,
  Search,
  Sliders,
  Trash2,
  GitBranch,
  Laptop,
  Settings,
  Terminal,
} from 'lucide-react';
import { useAcrProtocol } from '../hooks/useAcrProtocol';
import { McpToolTelemetryCard } from './components/McpToolTelemetryCard';
import { EscalationGateDialog } from './components/EscalationGateDialog';
import { AuditReplayDrawer } from './components/AuditReplayDrawer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ProposalsDrawer } from './components/ProposalsDrawer';
import { FileAttachmentCard } from './components/FileAttachmentCard';
import { GovernanceBallotCarousel } from './components/GovernanceBallotCarousel';
import { PluginConfigModal } from './components/PluginConfigModal';
import { PluginInstallWizardModal } from './components/PluginInstallWizardModal';
import { PluginRepositoriesModal } from './components/PluginRepositoriesModal';
import { BlankSlateOnboarding } from './components/BlankSlateOnboarding';
import { RootAdminProfileModal } from './components/RootAdminProfileModal';
import { AgentProfileModal } from './components/AgentProfileModal';
import { SlashCommandMenu, SLASH_COMMANDS, type SlashCommandDef } from './components/SlashCommandMenu';
import { DirectiveTag } from './components/DirectiveTag';
import type { Agent, Escalation, FileAttachment, MarketplacePlugin } from '../types/protocol';

interface AcrChatAppProps {
  onBackToShowcase?: () => void;
}

export const AcrChatApp: React.FC<AcrChatAppProps> = ({ onBackToShowcase }) => {
  const {
    rooms,
    activeRoom,
    activeRoomId,
    setActiveRoomId,
    unreadCounts,
    markRoomAsRead,
    messages,
    agents,
    allMarketplacePlugins,
    installAgentPlugin,
    uninstallAgentPlugin,
    updatePluginConfig,
    upstreamRepos,
    addUpstreamRepo,
    removeUpstreamRepo,
    syncUpstreamRepos,
    escalations,
    auditLogs,
    buddies,
    proposals,
    isConnected,
    latencyMs,
    sendMessage,
    uploadFile,
    resolveEscalation,
    createRoom,
    requestBuddy,
    acceptBuddy,
    blockBuddy,
    createProposal,
    castVote,
    closeProposal,
    refreshAll,
    rootAdminProfile,
    updateRootAdminProfile,
    localRooms,
    activeLocalRoomId,
    setActiveLocalRoomId,
    createLocalRoom,
    deleteLocalRoom,
    localProposals,
    localAuditLogs,
    createLocalProposal,
    castLocalVote,
    updateAgentProfile,
    registerLocalAgent,
    workspaceMode,
    setWorkspaceMode,
  } = useAcrProtocol('consensus-main');
  const [isRootAdminModalOpen, setIsRootAdminModalOpen] = useState(false);
  const [editingAgentProfile, setEditingAgentProfile] = useState<Agent | null>(null);
  const [configuringPlugin, setConfiguringPlugin] = useState<{ plugin: MarketplacePlugin; agent: Agent } | null>(null);
  const [installingPlugin, setInstallingPlugin] = useState<{ plugin: MarketplacePlugin; agent: Agent } | null>(null);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);

  const [inputContent, setInputContent] = useState('');
  const [activeDirectiveCommand, setActiveDirectiveCommand] = useState<SlashCommandDef | null>(null);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [selectedAgentDid, setSelectedAgentDid] = useState<string | null>(null);
  const selectedAgent = useMemo(
    () => agents.find((a) => a.did === selectedAgentDid) || null,
    [agents, selectedAgentDid]
  );
  const setSelectedAgent = (agent: Agent | null) => setSelectedAgentDid(agent ? agent.did : null);
  const [agentModalTab, setAgentModalTab] = useState<'capabilities' | 'plugins' | 'registry'>('capabilities');
  const [pluginSearchQuery, setPluginSearchQuery] = useState('');
  const [activeEscalation, setActiveEscalation] = useState<Escalation | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [buddyFilter, setBuddyFilter] = useState<'all' | 'buddies' | 'blocked'>('all');
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const att = await uploadFile(file);
      if (att) {
        setAttachedFile(att);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const pendingEscalations = escalations.filter((e) => e.status === 'pending');

  const displayedProposals = workspaceMode === 'local' ? localProposals : proposals;
  const displayedOpenProposals = useMemo(
    () =>
      workspaceMode === 'local'
        ? localProposals.filter((p) => p.status === 'open')
        : proposals.filter((p) => p.status === 'open'),
    [workspaceMode, localProposals, proposals]
  );

  const displayedAuditLogs = useMemo(() => {
    if (workspaceMode === 'local') {
      if (localAuditLogs.length === 0) {
        return [
          {
            index: 0,
            block_height: 0,
            event_type: 'LOCAL_GENESIS_STANDBY',
            state_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
            timestamp: new Date().toISOString(),
          },
        ];
      }
      return localAuditLogs;
    }
    return auditLogs;
  }, [workspaceMode, localAuditLogs, auditLogs]);

  const displayedRooms = useMemo(
    () => (workspaceMode === 'local' ? localRooms : rooms),
    [workspaceMode, localRooms, rooms]
  );

  const sortedRooms = useMemo(() => {
    return [...displayedRooms].sort((a, b) => a.name.localeCompare(b.name));
  }, [displayedRooms]);

  const displayedActiveRoomId = workspaceMode === 'local' ? activeLocalRoomId : activeRoomId;

  const setDisplayedActiveRoomId = useCallback(
    (id: string) => {
      if (workspaceMode === 'local') {
        setActiveLocalRoomId(id);
      } else {
        setActiveRoomId(id);
      }
    },
    [workspaceMode, setActiveLocalRoomId, setActiveRoomId]
  );

  const displayedActiveRoom = useMemo(() => {
    if (workspaceMode === 'local') {
      return (
        localRooms.find((r) => r.id === activeLocalRoomId) ||
        localRooms[0] || {
          id: 'local-deliberation',
          name: 'Local Deliberation',
          description: 'Primary consensus floor for local autonomous agents connected via MCP.',
          topic: 'Workstation Consensus • Zero-Trust DID/VC',
          is_private: false,
          participants: [],
          created_at: new Date().toISOString(),
          message_count: messages.length,
        }
      );
    }
    return activeRoom;
  }, [workspaceMode, localRooms, activeLocalRoomId, activeRoom, messages.length]);

  const displayedMessages = useMemo(() => {
    return messages.filter((m) => !m.room_id || m.room_id === displayedActiveRoom.id);
  }, [messages, displayedActiveRoom.id]);

  const getAgentBuddyStatus = (did: string) => {
    const rel = buddies.find((b) => b.to_did === did || b.from_did === did);
    return rel?.status || null;
  };

  const localConnectedAgents = useMemo(() => {
    return agents.filter((a) => a.role !== 'human' && (a.org === 'Local MCP Node' || a.did.includes('local-agent')));
  }, [agents]);

  const autonomousAgents = useMemo(() => {
    const pool = workspaceMode === 'local' ? localConnectedAgents : agents.filter((a) => a.role === 'agent' || a.role === 'sentinel');
    return pool.filter((a) => {
      if (buddyFilter === 'all') return true;
      const status = getAgentBuddyStatus(a.did);
      if (buddyFilter === 'buddies') return status === 'accepted';
      if (buddyFilter === 'blocked') return status === 'blocked';
      return true;
    });
  }, [workspaceMode, localConnectedAgents, agents, buddyFilter, buddies]);

  const sortedAutonomousAgents = useMemo(() => {
    return [...autonomousAgents].sort((a, b) => a.name.localeCompare(b.name));
  }, [autonomousAgents]);

  const humanOperators = agents.filter((a) => a.role === 'human');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'deliberating':
        return 'bg-cyan-400 animate-pulse';
      case 'away':
        return 'bg-amber-400';
      case 'escalated':
        return 'bg-rose-400';
      default:
        return 'bg-slate-500';
    }
  };

  const filteredSlashCommands = useMemo(() => {
    const q = slashQuery.toLowerCase().trim();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [slashQuery]);

  const handleSelectSlashCommand = useCallback((cmd: SlashCommandDef) => {
    setIsSlashMenuOpen(false);
    setActiveDirectiveCommand(cmd);

    // Strip the typed `/...` trigger part from inputContent
    setInputContent((prev) => {
      const slashIdx = prev.lastIndexOf('/');
      if (slashIdx !== -1) {
        return prev.slice(0, slashIdx).trim();
      }
      return '';
    });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 30);
  }, []);

  const executeSlashCommand = useCallback(
    async (cmd: SlashCommandDef, explicitArgs?: string) => {
      setIsSlashMenuOpen(false);
      setActiveDirectiveCommand(null);

      const args = explicitArgs || '';

      switch (cmd.id) {
        case 'ballots':
          setIsProposalsOpen(true);
          setInputContent('');
          break;

        case 'audit':
          setIsAuditOpen(true);
          setInputContent('');
          break;

        case 'plugins':
          setIsRepoModalOpen(true);
          setInputContent('');
          break;

        case 'agent':
          if (autonomousAgents.length > 0) {
            setEditingAgentProfile(autonomousAgents[0]);
          } else {
            const newAgent = await registerLocalAgent({ name: 'Local MCP Agent' });
            setEditingAgentProfile(newAgent);
          }
          setInputContent('');
          break;

        case 'buddy':
          setBuddyFilter((prev) => (prev === 'all' ? 'buddies' : 'all'));
          setInputContent('');
          break;

        case 'vote': {
          const choiceUpper = args.trim().toUpperCase();
          const targetProp = displayedOpenProposals[0];
          if (!targetProp) {
            setIsProposalsOpen(true);
            setInputContent('');
            break;
          }
          const validChoice = ['APPROVE', 'REJECT', 'DISSENT'].includes(choiceUpper)
            ? choiceUpper
            : 'APPROVE';
          if (workspaceMode === 'local') {
            await castLocalVote(targetProp.id, validChoice, validChoice === 'DISSENT' ? args : undefined);
          } else {
            await castVote(targetProp.id, validChoice, validChoice === 'DISSENT' ? args : undefined);
          }
          setInputContent('');
          break;
        }

        case 'propose': {
          const title = args.trim() || 'CIP: Operator Initiated Consensus Proposal';
          if (workspaceMode === 'local') {
            await createLocalProposal(title, 'Dispatched via operator /propose directive');
          } else {
            await createProposal(title, 'Dispatched via operator /propose directive');
          }
          setIsProposalsOpen(true);
          setInputContent('');
          break;
        }

        case 'dissent': {
          const targetProp = displayedOpenProposals[0];
          const rationale = args.trim() || 'Operator formal dissent registered via protocol directive.';
          if (targetProp) {
            if (workspaceMode === 'local') {
              await castLocalVote(targetProp.id, 'DISSENT', rationale);
            } else {
              await castVote(targetProp.id, 'DISSENT', rationale);
            }
          }
          setIsProposalsOpen(true);
          setInputContent('');
          break;
        }

        case 'status':
          await sendMessage(
            `[NODE STATUS AUDIT] • DID: ${rootAdminProfile.did} • Latency: ${latencyMs}ms • Consensus Mode: ${workspaceMode.toUpperCase()} • Open Ballots: ${displayedOpenProposals.length} • Audit Chain Height: #${displayedAuditLogs.length} • Online Agents: ${autonomousAgents.length}`,
            undefined,
            displayedActiveRoom.id
          );
          setInputContent('');
          break;

        case 'help':
          await sendMessage(
            `[ACR ZERO-TRUST DIRECTIVES]\n• /ballots — Open consensus ballots drawer\n• /vote [approve|reject|dissent] — Cast ballot on active proposal\n• /propose [title] — Broadcast new consensus proposal\n• /dissent [reason] — Anchor formal dissent rationale\n• /audit — Inspect cryptographic state chain\n• /plugins — Manage federated MCP plugins & repos\n• /agent — Configure autonomous agent profile & process path\n• /status — Inspect node health and Ed25519 signatures\n• /clear — Clear input feed`,
            undefined,
            displayedActiveRoom.id
          );
          setInputContent('');
          break;

        case 'clear':
          setInputContent('');
          break;

        default:
          await sendMessage(
            `[DIRECTIVE /${cmd.name.toUpperCase()}] ${args}`,
            undefined,
            displayedActiveRoom.id
          );
          setInputContent('');
          break;
      }
    },
    [
      displayedOpenProposals,
      workspaceMode,
      castLocalVote,
      castVote,
      createLocalProposal,
      createProposal,
      sendMessage,
      rootAdminProfile.did,
      latencyMs,
      displayedAuditLogs.length,
      autonomousAgents,
      registerLocalAgent,
      displayedActiveRoom.id,
    ]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputContent.trim();
    if (!trimmed && !attachedFile && !activeDirectiveCommand) return;

    if (activeDirectiveCommand) {
      const cmd = activeDirectiveCommand;
      setActiveDirectiveCommand(null);
      setInputContent('');
      setAttachedFile(null);
      setIsSlashMenuOpen(false);
      await executeSlashCommand(cmd, trimmed);
      return;
    }

    if (trimmed.startsWith('/') && !attachedFile) {
      const match = trimmed.slice(1).match(/^([a-zA-Z0-9-_]+)(?:\s+(.*))?$/);
      if (match) {
        const cmdName = match[1].toLowerCase();
        const cmdArgs = match[2] || '';
        const found = SLASH_COMMANDS.find((c) => c.name.toLowerCase() === cmdName);
        if (found) {
          await executeSlashCommand(found, cmdArgs);
          return;
        }
      }
    }

    await sendMessage(inputContent, attachedFile || undefined, displayedActiveRoom.id);
    setInputContent('');
    setAttachedFile(null);
    setIsSlashMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSlashMenuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (filteredSlashCommands.length > 0) {
          e.preventDefault();
          handleSelectSlashCommand(filteredSlashCommands[slashSelectedIndex] || filteredSlashCommands[0]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSlashMenuOpen(false);
        return;
      }
    }

    if (e.key === 'Backspace' && inputContent === '' && activeDirectiveCommand !== null) {
      e.preventDefault();
      setActiveDirectiveCommand(null);
      return;
    }

    if (e.key === 'Escape' && activeDirectiveCommand !== null) {
      e.preventDefault();
      setActiveDirectiveCommand(null);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div
      role="main"
      aria-label="Agentic Chat Room Application Floor"
      className="flex h-screen w-full flex-col bg-[#05060b] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* Top Application Navigation Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#07080e]/95 px-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          {onBackToShowcase && (
            <button
              onClick={onBackToShowcase}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Return to Marketing Showcase"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Showcase</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white font-mono-code">ACR</span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold font-mono-code text-cyan-300 border border-cyan-500/30">
                PROD v0.8.2
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-2.5 py-1 text-[11px] font-mono-code text-slate-300">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>Mesh: {isConnected ? '99.99%' : 'OFFLINE'}</span>
            <span className="text-cyan-400 font-semibold tabular-nums">({latencyMs}ms)</span>
          </div>

          {/* Workspace Pass-Through Mode Switcher */}
          <div className="flex items-center rounded-lg border border-white/[0.1] bg-black/60 p-0.5 text-[10px] font-mono-code">
            <button
              type="button"
              onClick={() => setWorkspaceMode('local')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                workspaceMode === 'local'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="h-3 w-3" />
              <span className="hidden sm:inline">Local Machine</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('demo')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                workspaceMode === 'demo'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">Swarm Demo</span>
            </button>
          </div>
        </div>

        {/* Center Room Title */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono-code">
          {displayedActiveRoom.is_private ? (
            <Lock className="h-4 w-4 text-amber-400" />
          ) : (
            <Hash className="h-4 w-4 text-cyan-400" />
          )}
          <span className="font-bold text-white">{displayedActiveRoom.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-sm">{displayedActiveRoom.topic}</span>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2.5">
          {/* Consensus Ballots Button (GAP-08) */}
          <button
            onClick={() => setIsProposalsOpen(true)}
            aria-label="Open consensus ballots"
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Vote className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ballots</span>
            <span className="rounded bg-amber-400/20 px-1 text-[10px] font-mono-code font-bold">
              {displayedOpenProposals.length}
            </span>
          </button>

          {/* Audit Chain Button */}
          <button
            onClick={() => setIsAuditOpen(true)}
            aria-label="Open audit chain replay drawer"
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <GitCommit className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Audit Chain</span>
            <span className="rounded bg-cyan-400/20 px-1 text-[10px] font-mono-code font-bold">
              {workspaceMode === 'local' ? (localAuditLogs.length > 0 ? localAuditLogs.length : 1) : auditLogs.length}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              soundEnabled
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                : 'border-white/[0.08] text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Operator Profile / DID Chip */}
          <button
            type="button"
            onClick={() => setIsRootAdminModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.08] hover:border-cyan-500/40 bg-black/40 px-2.5 py-1 text-xs font-mono-code text-slate-300 hover:text-white transition-all cursor-pointer group"
            title="Configure Root Administrator Profile"
          >
            <Shield className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[140px]">
              {workspaceMode === 'local' ? rootAdminProfile.name : 'Operator Console'}
            </span>
            <Settings className="h-3 w-3 text-slate-500 group-hover:text-cyan-300 transition-colors ml-0.5" />
          </button>
        </div>
      </header>

      {/* Main App Body: 3-Column Layout (Intercom + AIM + Slack Grounding) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Deliberation Rooms & AIM Buddy List */}
        <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-[#07080e]/70 backdrop-blur-md flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Rooms / Channels Section with Create Action (GAP-03) */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Deliberation Rooms</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsCreateRoomOpen(true)}
                    aria-label="Create new room"
                    className="p-0.5 rounded text-cyan-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    title="Create new room"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <span className="rounded bg-white/[0.06] px-1 text-[9px] text-slate-400 font-mono-code">
                    {displayedRooms.length}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {sortedRooms.map((room) => {
                  const isActive = room.id === displayedActiveRoomId;
                  const unread = workspaceMode === 'local' ? 0 : (unreadCounts[room.id] || 0);
                  return (
                    <motion.div
                      key={room.id}
                      layout
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="group/room relative flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDisplayedActiveRoomId(room.id);
                          markRoomAsRead(room.id);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                            : unread > 0
                              ? 'text-white font-bold bg-white/[0.06] border border-cyan-500/30'
                              : 'text-slate-300 font-medium hover:bg-white/[0.04] hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {unread > 0 ? (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                          ) : room.is_private ? (
                            <Lock
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            />
                          ) : (
                            <Hash
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-cyan-400' : 'text-slate-500'
                              }`}
                            />
                          )}
                          <span className={`truncate ${unread > 0 ? 'font-bold text-white' : ''}`}>
                            {room.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {unread > 0 ? (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="rounded-full bg-cyan-500/25 border border-cyan-400/50 px-1.5 py-0.5 text-[9px] font-mono-code font-bold text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            >
                              +{unread} new
                            </motion.span>
                          ) : room.message_count > 0 ? (
                            <span className="text-[10px] font-mono-code text-slate-500">
                              {room.message_count}
                            </span>
                          ) : null}
                        </div>
                      </button>

                      {workspaceMode === 'local' && room.id !== 'local-deliberation' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLocalRoom(room.id);
                          }}
                          className="opacity-0 group-hover/room:opacity-100 p-1 mr-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                          title={`Delete #${room.name}`}
                          aria-label={`Delete #${room.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AIM-style Buddy List with Filter Tabs (GAP-02) */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Autonomous Agents</span>
                  {workspaceMode === 'local' && (
                    <button
                      type="button"
                      onClick={async () => {
                        const newAgent = await registerLocalAgent({ name: 'Local MCP Worker', org: 'Local MCP Node' });
                        setEditingAgentProfile(newAgent);
                      }}
                      aria-label="Connect new local MCP agent"
                      title="Connect / Configure Local MCP Agent"
                      className="p-0.5 rounded text-cyan-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-md border border-white/[0.06]">
                  {(['all', 'buddies', 'blocked'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setBuddyFilter(tab)}
                      className={`px-1.5 py-0.5 text-[8px] font-mono-code uppercase rounded transition-colors ${
                        buddyFilter === tab
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                {sortedAutonomousAgents.length === 0 ? (
                  <div className="p-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-center space-y-2 my-1">
                    <p className="text-[11px] text-slate-400 font-sans">No local MCP agents connected</p>
                    <button
                      type="button"
                      onClick={async () => {
                        const newAgent = await registerLocalAgent({ name: 'Local MCP Worker', org: 'Local MCP Node' });
                        setEditingAgentProfile(newAgent);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-[10px] font-mono-code transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Configure MCP Agent</span>
                    </button>
                  </div>
                ) : (
                  sortedAutonomousAgents.map((agent) => {
                    const bStatus = getAgentBuddyStatus(agent.did);
                    return (
                      <motion.div
                        key={agent.did}
                        layout
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        onClick={() => {
                          setSelectedAgent(agent);
                          setAgentModalTab('capabilities');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="h-7 w-7 rounded-lg object-cover border border-white/[0.1]"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#07080e] ${getStatusColor(
                                agent.status
                              )}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                              {agent.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <span>{agent.org}</span>
                              {agent.installed_plugins && agent.installed_plugins.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-indigo-400 font-mono-code text-[8px]">
                                  • <Package className="h-2.5 w-2.5" />
                                  {agent.installed_plugins.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Settings gear for agent configuration */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAgentProfile(agent);
                            }}
                            aria-label={`Configure ${agent.name}`}
                            title={`Configure ${agent.name} profile, process path & tags`}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08] transition-all cursor-pointer"
                          >
                            <Settings className="h-3 w-3" />
                          </button>

                          {bStatus === 'accepted' && (
                            <span className="rounded bg-emerald-500/10 text-emerald-400 px-1 text-[8px] font-mono-code border border-emerald-500/20">
                              BUDDY
                            </span>
                          )}
                          {bStatus === 'blocked' && (
                            <span className="rounded bg-rose-500/10 text-rose-400 px-1 text-[8px] font-mono-code border border-rose-500/20">
                              BLOCKED
                            </span>
                          )}
                          <span className="text-[9px] uppercase font-mono-code text-slate-500">
                            {agent.status}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Human Operators */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Human Operators</span>
                <span className="rounded bg-white/[0.06] text-slate-400 px-1 text-[9px] font-mono-code">
                  {workspaceMode === 'local' ? 1 : humanOperators.length}
                </span>
              </div>
              <div className="space-y-1">
                {workspaceMode === 'local' ? (
                  <div
                    onClick={() => setIsRootAdminModalOpen(true)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group border border-transparent hover:border-cyan-500/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={rootAdminProfile.avatar}
                          alt={rootAdminProfile.name}
                          className="h-7 w-7 rounded-lg object-cover border border-cyan-500/30"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#07080e] bg-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-cyan-300 truncate group-hover:text-cyan-200 flex items-center gap-1">
                          <span>{rootAdminProfile.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{rootAdminProfile.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRootAdminModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                        title="Configure Root Administrator Identity"
                        aria-label="Configure Root Administrator Identity"
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                      <span className="rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 px-1 text-[9px] font-mono-code">
                        ROOT
                      </span>
                    </div>
                  </div>
                ) : (
                  humanOperators.map((agent) => (
                    <div
                      key={agent.did}
                      onClick={() => setSelectedAgent(agent)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-7 w-7 rounded-lg object-cover border border-cyan-500/30"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#07080e] bg-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-cyan-300 truncate">
                            {agent.name.includes('Kenny') ? 'Operator Console (Demo)' : agent.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{agent.org}</div>
                        </div>
                      </div>
                      <span className="rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 px-1 text-[9px] font-mono-code">
                        ROOT
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Protocol Status Footnote */}
          <div className="p-3 border-t border-white/[0.06] bg-black/30 text-[11px] font-mono-code text-slate-400 flex items-center justify-between">
            <span>Auth: W3C DID/VC</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Zero-Trust
            </span>
          </div>
        </aside>

        {/* Center Column: Live Consensus Message Feed */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#05060b] relative">
          {workspaceMode === 'local' && sortedAutonomousAgents.length === 0 ? (
            <BlankSlateOnboarding
              onSwitchToDemo={() => setWorkspaceMode('demo')}
              onRefresh={refreshAll}
              latencyMs={latencyMs}
              isConnected={isConnected}
              rootAdminProfile={rootAdminProfile}
              onUpdateRootAdmin={updateRootAdminProfile}
              onConfigureAgent={async () => {
                const newAgent = await registerLocalAgent({ name: 'Local MCP Agent', org: 'Local MCP Node' });
                setEditingAgentProfile(newAgent);
              }}
            />
          ) : (
            <>
              {/* Active Proposals Quick Notice Bar (GAP-08) */}
              {displayedOpenProposals.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2 truncate">
                <Vote className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-bold">Active Ballot:</span>
                <span className="truncate">{displayedOpenProposals[0].title}</span>
              </div>
              <button
                onClick={() => setIsProposalsOpen(true)}
                className="shrink-0 text-[11px] font-bold text-amber-400 hover:text-amber-200 underline cursor-pointer"
              >
                Review & Vote
              </button>
            </div>
          )}

          {/* Message Stream */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Room message feed"
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono-code text-xs"
          >
            {displayedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <div className="h-10 w-10 rounded-full border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <Hash className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  Welcome to #{displayedActiveRoom.name}
                </div>
                <div className="text-xs text-slate-500 max-w-sm text-center">
                  This deliberation channel is synchronized across the embedded NATS JetStream mesh.
                </div>
              </div>
            ) : (
              displayedMessages.map((msg) => {
                const isOperator = msg.role === 'human' || msg.sender_role === 'human';
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 group rounded-xl p-2 hover:bg-white/[0.02] transition-colors"
                  >
                    <img
                      src={
                        msg.avatar ||
                        msg.sender_avatar ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                      }
                      alt={msg.sender || msg.sender_name || 'Agent'}
                      className="h-8 w-8 rounded-lg object-cover border border-white/[0.1] shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isOperator ? 'text-cyan-300' : 'text-slate-200'
                          }`}
                        >
                          {msg.sender || msg.sender_name || 'Anonymous Agent'}
                        </span>

                        <span
                          className={`rounded px-1 text-[9px] font-bold uppercase ${
                            isOperator
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-white/[0.06] text-slate-400'
                          }`}
                        >
                          {msg.role || msg.sender_role || 'agent'}
                        </span>

                        <span className="text-[10px] text-slate-500 tabular-nums">{timeStr}</span>
                      </div>

                      {/* Message Content */}
                      <p className="text-slate-300 leading-relaxed break-words whitespace-pre-wrap font-sans text-xs">
                        {msg.content}
                      </p>

                      {/* File Attachment Card (GAP-17) */}
                      {msg.attachment && <FileAttachmentCard attachment={msg.attachment} />}

                      {/* Inline MCP Tool Telemetry */}
                      {msg.tool_call && <McpToolTelemetryCard toolCall={msg.tool_call} />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pending Escalations Banner */}
          {pendingEscalations.length > 0 && (
            <div className="bg-rose-500/10 border-t border-rose-500/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
                <span className="text-xs font-semibold text-rose-300">
                  {pendingEscalations.length} Pending Human Escalation Gate(s)
                </span>
              </div>
              <button
                onClick={() => setActiveEscalation(pendingEscalations[0])}
                className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all cursor-pointer"
              >
                Sign Off Gate #{pendingEscalations[0].id}
              </button>
            </div>
          )}

          {/* Hyper-Premium Integrated Operator Directive Composer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#07080e]/95 backdrop-blur-md">
            {/* Attachment Preview Chip */}
            {attachedFile && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 max-w-fit shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{attachedFile.filename}</span>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Relative wrapper for Slash Command Autocomplete popover */}
            <div className="relative">
              <SlashCommandMenu
                isOpen={isSlashMenuOpen}
                query={slashQuery}
                selectedIndex={slashSelectedIndex}
                onSelect={(cmd) => handleSelectSlashCommand(cmd)}
                onHoverIndex={(idx) => setSlashSelectedIndex(idx)}
              />

              {/* Unified Glass Console Box */}
              <form
                onSubmit={handleSend}
                className="relative rounded-2xl border border-white/[0.12] bg-[#0a0b16]/85 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(6,182,212,0.1)] focus-within:border-cyan-500/60 focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(6,182,212,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 overflow-hidden"
              >
                {/* Top Context & Quick Command Strip */}
                <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.06] bg-black/40 text-[10px] font-mono-code select-none">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                      #{displayedActiveRoom.name}
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-500 hidden sm:inline">Zero-Trust Ed25519 Directive</span>
                  </div>

                  {/* Quick Slash-Action Pills */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectSlashCommand(SLASH_COMMANDS.find((c) => c.id === 'vote')!)}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      /vote
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSlashCommand(SLASH_COMMANDS.find((c) => c.id === 'ballots')!)}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-white/[0.06] hover:border-amber-500/30 transition-all cursor-pointer"
                    >
                      /ballots
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSlashCommand(SLASH_COMMANDS.find((c) => c.id === 'audit')!)}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer hidden sm:inline"
                    >
                      /audit
                    </button>
                  </div>
                </div>

                {/* Active Directive Tag Chip */}
                {activeDirectiveCommand && (
                  <div className="flex flex-wrap items-center gap-2 px-3.5 pt-2.5 pb-0.5">
                    <DirectiveTag
                      command={activeDirectiveCommand}
                      onRemove={() => {
                        setActiveDirectiveCommand(null);
                        inputRef.current?.focus();
                      }}
                    />
                  </div>
                )}

                {/* Text Input Area */}
                <textarea
                  ref={inputRef}
                  id="directive-input"
                  name="directive"
                  aria-label={`Directive input for #${displayedActiveRoom.name}`}
                  value={inputContent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputContent(val);
                    const cursorPos = e.target.selectionStart ?? val.length;
                    const before = val.slice(0, cursorPos);
                    const slashIdx = before.lastIndexOf('/');
                    if (slashIdx !== -1 && (slashIdx === 0 || /\s/.test(before[slashIdx - 1]))) {
                      const q = before.slice(slashIdx + 1);
                      if (!/\s/.test(q)) {
                        setIsSlashMenuOpen(true);
                        setSlashQuery(q);
                        setSlashSelectedIndex(0);
                        return;
                      }
                    }
                    setIsSlashMenuOpen(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeDirectiveCommand
                      ? activeDirectiveCommand.argsHint
                        ? `Enter ${activeDirectiveCommand.argsHint}... (press Enter to dispatch /${activeDirectiveCommand.name})`
                        : `Press Enter or Send to execute /${activeDirectiveCommand.name} with directive...`
                      : `Dispatch operator directive or message into #${displayedActiveRoom.name}... (type / for command shortcuts)`
                  }
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans min-h-[48px] max-h-[160px] leading-relaxed"
                />

              {/* Bottom Integrated Toolbar */}
              <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 border-t border-white/[0.04]">
                {/* Left Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* File Upload Button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach file"
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Upload verifiable file attachment"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="text-[10px] font-medium hidden md:inline">Attach</span>
                  </button>
                  <input
                    id="file-upload-input"
                    name="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Code Snippet Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setInputContent((prev) => prev + '\n```\n\n```');
                    }}
                    aria-label="Insert code block"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Insert code snippet"
                  >
                    <Code className="h-4 w-4" />
                  </button>

                  {/* Ballot Launch Button */}
                  <button
                    type="button"
                    onClick={() => setIsProposalsOpen(true)}
                    aria-label="Launch consensus ballot"
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    title="Launch consensus proposal"
                  >
                    <Vote className="h-4 w-4" />
                    <span className="text-[10px] font-medium text-amber-400/90 hidden md:inline">Ballot</span>
                  </button>

                  {/* Marketplace Plugin Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setInputContent((prev) => (prev ? prev + ' /plugin ' : '/plugin '));
                    }}
                    aria-label="Invoke marketplace plugin"
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                    title="Invoke marketplace plugin"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[10px] font-medium text-indigo-400/90 hidden md:inline">Plugin</span>
                  </button>
                </div>

                {/* Right Integrated Group: Keyboard Hint + Send Button */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono-code text-slate-500 hidden sm:inline">
                    {inputContent.length > 0 ? `${inputContent.length} chars · ` : ''}↵ Send · Shift + ↵ New line
                  </span>

                  {/* Hyper-Premium Docked Send Button */}
                  <motion.button
                    type="submit"
                    whileHover={(!inputContent.trim() && !attachedFile) || isUploading ? {} : { scale: 1.04 }}
                    whileTap={(!inputContent.trim() && !attachedFile) || isUploading ? {} : { scale: 0.96 }}
                    disabled={(!inputContent.trim() && !attachedFile) || isUploading}
                    aria-label="Send directive"
                    className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-1.5 font-medium">
                      <span>Dispatch</span>
                      <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </motion.button>
                </div>
              </div>
            </form>
            </div>
          </div>
            </>
          )}
        </main>

        {/* Right Column: Governance Telemetry Panel */}
        <aside className="w-80 shrink-0 border-l border-white/[0.08] bg-[#07080e]/70 backdrop-blur-md hidden xl:flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Governance Telemetry
              </div>
              <div className="text-xs text-slate-500 font-mono-code">
                ACP v2 • Zero-Trust Capability Scopes
              </div>
            </div>

            {/* Room Details Card */}
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">#{displayedActiveRoom.name}</span>
                {displayedActiveRoom.is_private ? (
                  <span className="rounded bg-amber-500/10 text-amber-400 px-1.5 py-0.5 text-[9px] font-mono-code border border-amber-500/30">
                    PRIVATE
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[9px] font-mono-code border border-emerald-500/30">
                    {workspaceMode === 'local' ? 'LOCAL NODE' : 'PUBLIC'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{displayedActiveRoom.description}</p>
              <div className="text-[10px] font-mono-code text-cyan-400/80 pt-1 border-t border-white/[0.04]">
                Topic: {displayedActiveRoom.topic}
              </div>
            </div>

            {/* Active Proposals Widget with Accessible Smooth Carousel (GAP-08) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Room Ballots</span>
                <span className="rounded bg-amber-500/10 text-amber-400 px-1 text-[9px] font-mono-code font-bold">
                  {displayedOpenProposals.length} OPEN
                </span>
              </div>

              {workspaceMode === 'local' && displayedOpenProposals.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 text-center space-y-2">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                    <Vote className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200 font-sans">No Open Ballots</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Consensus ballots initiated by your connected local agents will stream here in real time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProposalsOpen(true)}
                    className="w-full py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 font-sans"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Launch Local Ballot</span>
                  </button>
                </div>
              ) : (
                <GovernanceBallotCarousel
                  openProposals={displayedOpenProposals}
                  onSelectProposal={() => setIsProposalsOpen(true)}
                />
              )}
            </div>

            {/* Cryptographic Audit Trail Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Cryptographic State Chain</span>
                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {workspaceMode === 'local' && localAuditLogs.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3 space-y-2 font-mono-code text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LOCAL LEDGER STANDBY
                    </span>
                    <span className="text-slate-500">PORT 20443</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/60 border border-white/[0.04] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">#0000</span>
                      <span className="text-slate-300">GENESIS_LOCAL</span>
                      <span className="text-slate-500">e3b0c442...</span>
                    </div>
                    <div className="text-[9px] text-slate-400 pt-1 border-t border-white/[0.04] font-sans">
                      Zero-Trust monotonic hash chain ready to anchor local agent execution proofs.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono-code text-[10px]">
                  {displayedAuditLogs.slice(-3).map((block) => {
                    const blockHeight = block.index ?? block.block_height ?? 0;
                    return (
                      <div
                        key={block.state_hash}
                        className="p-2 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between"
                      >
                        <span className="text-cyan-400 font-bold">
                          #{String(blockHeight).padStart(4, '0')}
                        </span>
                        <span className="text-slate-300 truncate max-w-[120px]">
                          {block.event_type}
                        </span>
                        <span className="text-slate-500 truncate max-w-[80px]">
                          {block.state_hash.slice(0, 8)}...
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Daemon Status Footer */}
          <div className="pt-4 border-t border-white/[0.06] text-[10px] font-mono-code text-slate-500 flex items-center justify-between">
            <span>Daemon: http://localhost:20443</span>
            <button onClick={refreshAll} className="text-cyan-400 hover:underline cursor-pointer">
              Sync
            </button>
          </div>
        </aside>
      </div>

      {/* Agent Detail Modal with Capabilities & Marketplace Plugin Registry */}
      {selectedAgent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#090b16] p-6 shadow-2xl space-y-4 font-mono-code text-xs max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedAgent.avatar}
                    alt={selectedAgent.name}
                    className="h-11 w-11 rounded-xl object-cover border border-cyan-500/40"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#090b16] ${getStatusColor(
                      selectedAgent.status
                    )}`}
                  />
                </div>
                <div>
                  <h4 id="agent-modal-title" className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                    <span>{selectedAgent.name}</span>
                    <span className="rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-1.5 py-0.5 text-[9px] font-mono-code">
                      {selectedAgent.role.toUpperCase()}
                    </span>
                  </h4>
                  <div className="text-[10px] text-cyan-400 font-sans">{selectedAgent.org}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAgentProfile(selectedAgent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  title="Configure Agent Identity, Process Path & Tags"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setSelectedAgent(null)}
                  aria-label="Close agent modal"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/[0.06] shrink-0">
              <button
                type="button"
                onClick={() => setAgentModalTab('capabilities')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  agentModalTab === 'capabilities'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span>Capabilities & VC</span>
              </button>

              <button
                type="button"
                onClick={() => setAgentModalTab('plugins')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  agentModalTab === 'plugins'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="h-3.5 w-3.5 text-indigo-400" />
                <span>Installed Plugins ({selectedAgent.installed_plugins?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setAgentModalTab('registry')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  agentModalTab === 'registry'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span>Marketplace Registry</span>
              </button>
            </div>

            {/* Scrollable Tab Content Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {agentModalTab === 'capabilities' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">W3C DID Identifier</div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.06] text-cyan-300 text-[10px] break-all leading-relaxed">
                      {selectedAgent.did}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">
                      Verifiable Credential Capabilities
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAgent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] text-cyan-300"
                        >
                          <Check className="h-3 w-3 text-cyan-400" />
                          <span>{cap}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedAgent.process_path && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Associated Process Path / Command</div>
                      <div className="p-2 rounded-xl bg-black/60 border border-white/[0.06] text-slate-300 font-mono-code text-[10px] flex items-center gap-2 truncate">
                        <Terminal className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{selectedAgent.process_path}</span>
                      </div>
                    </div>
                  )}

                  {selectedAgent.tags && selectedAgent.tags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Agent Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAgent.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono-code text-cyan-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buddy Action Controls (GAP-02) */}
                  {selectedAgent.role !== 'human' && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Buddy Relationship (GAP-02)</div>
                      <div className="flex items-center gap-2">
                        {getAgentBuddyStatus(selectedAgent.did) === 'accepted' ? (
                          <div className="flex-1 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="h-4 w-4 text-emerald-400" />
                              <span>Mutual Consent Buddy</span>
                            </span>
                            <button
                              onClick={() => blockBuddy(selectedAgent.did)}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                            >
                              Block Agent
                            </button>
                          </div>
                        ) : getAgentBuddyStatus(selectedAgent.did) === 'blocked' ? (
                          <div className="flex-1 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300">
                            <span className="flex items-center gap-1.5">
                              <UserX className="h-4 w-4 text-rose-400" />
                              <span>Blocked (GAP-02 Enforced)</span>
                            </span>
                            <button
                              onClick={() => acceptBuddy(selectedAgent.did)}
                              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                            >
                              Unblock
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => requestBuddy(selectedAgent.did)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer font-medium"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              <span>Send Buddy Request</span>
                            </button>
                            <button
                              onClick={() => blockBuddy(selectedAgent.did)}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                              title="Block agent from messaging"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {agentModalTab === 'plugins' && (
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase text-slate-500 font-bold flex items-center justify-between">
                    <span>Installed Marketplace Plugins</span>
                    <span className="text-indigo-400">
                      {selectedAgent.installed_plugins?.length || 0} active
                    </span>
                  </div>

                  {(!selectedAgent.installed_plugins || selectedAgent.installed_plugins.length === 0) ? (
                    <div className="p-6 rounded-xl border border-white/[0.06] bg-black/40 text-center space-y-2">
                      <Package className="h-8 w-8 text-slate-600 mx-auto" />
                      <div className="text-slate-400">No marketplace plugins installed on this agent</div>
                      <button
                        type="button"
                        onClick={() => setAgentModalTab('registry')}
                        className="text-cyan-400 underline hover:text-cyan-300 text-[11px] cursor-pointer"
                      >
                        Browse Marketplace Registry →
                      </button>
                    </div>
                  ) : (
                    selectedAgent.installed_plugins.map((plugin) => (
                      <div
                        key={plugin.id}
                        className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-sans">{plugin.name}</span>
                            <span className="rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 text-[9px]">
                              v{plugin.version}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfiguringPlugin({ plugin, agent: selectedAgent })}
                              aria-label={`Configure ${plugin.name}`}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/[0.1] bg-black/40 text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer text-[10px]"
                              title="Configure plugin parameters"
                            >
                              <Sliders className="h-3 w-3 text-cyan-400" />
                              <span>Configure</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Uninstall ${plugin.name} from ${selectedAgent.name}?`)) {
                                  uninstallAgentPlugin(selectedAgent.did, plugin.id);
                                }
                              }}
                              aria-label={`Uninstall ${plugin.name}`}
                              className="p-1 rounded-lg border border-white/[0.08] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Uninstall plugin from agent"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          {plugin.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-slate-400">
                          <span>Author: <strong className="text-slate-300">{plugin.author}</strong></span>
                          <span>Score: <strong className="text-emerald-400">{plugin.quality_score}/100</strong></span>
                        </div>

                        {plugin.tools && plugin.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {plugin.tools.map((tool) => (
                              <span
                                key={tool}
                                className="rounded bg-black/50 border border-white/[0.08] px-1.5 py-0.5 text-[8px] text-indigo-300 font-mono-code"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {agentModalTab === 'registry' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">
                      Federated Plugin Registry Access
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRepoModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        <GitBranch className="h-3 w-3" />
                        <span>Manage Repositories ({upstreamRepos.length})</span>
                      </button>
                      <span className="text-teal-400 text-[10px]">
                        {allMarketplacePlugins.length} available
                      </span>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      id="plugin-search-input"
                      name="plugin-search"
                      aria-label="Filter accessible marketplace plugins"
                      type="text"
                      value={pluginSearchQuery}
                      onChange={(e) => setPluginSearchQuery(e.target.value)}
                      placeholder="Filter accessible marketplace plugins..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.08] bg-black/50 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Registry List */}
                  <div className="space-y-2">
                    {allMarketplacePlugins
                      .filter((p) =>
                        p.name.toLowerCase().includes(pluginSearchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(pluginSearchQuery.toLowerCase())
                      )
                      .map((plugin) => {
                        const isInstalled = selectedAgent.installed_plugins?.some(
                          (p) => p.id === plugin.id
                        );
                        return (
                          <div
                            key={plugin.id}
                            className="p-3 rounded-xl border border-white/[0.08] bg-black/40 hover:border-teal-500/30 transition-colors space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white font-sans">{plugin.name}</span>
                                <span className="rounded bg-white/[0.08] text-slate-300 px-1.5 py-0.5 text-[9px]">
                                  v{plugin.version}
                                </span>
                              </div>

                              {isInstalled ? (
                                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 text-[9px] font-bold">
                                  <Check className="h-3 w-3" />
                                  Installed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setInstallingPlugin({ plugin, agent: selectedAgent })}
                                  className="flex items-center gap-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                  Install to Agent
                                </button>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                              {plugin.description}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-slate-400">
                              <span>Trust: <strong className="text-cyan-400">{plugin.trust_badge}</strong></span>
                              <span>Tools: <strong className="text-slate-300">{plugin.tools_count}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Status */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-[10px] text-slate-400 shrink-0">
              <span>
                Status: <strong className="text-white uppercase">{selectedAgent.status}</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Ed25519 & ANS Anchored</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Gate Dialog */}
      <EscalationGateDialog
        escalation={activeEscalation}
        onClose={() => setActiveEscalation(null)}
        onApprove={(id) => resolveEscalation(id, true)}
        onReject={(id) => resolveEscalation(id, false)}
      />

      {/* Audit Replay Drawer */}
      <AuditReplayDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditLogs={displayedAuditLogs}
        onRefresh={refreshAll}
      />

      {/* Create Room Modal (GAP-03, GAP-07) */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreate={async (name, desc, topic, isPrivate) => {
          if (workspaceMode === 'local') {
            await createLocalRoom(name, desc, topic, isPrivate);
          } else {
            await createRoom(name, desc, topic, isPrivate);
          }
        }}
      />

      {/* Consensus Proposals Drawer (GAP-08) */}
      <ProposalsDrawer
        isOpen={isProposalsOpen}
        onClose={() => setIsProposalsOpen(false)}
        proposals={displayedProposals}
        activeRoomName={displayedActiveRoom.name}
        currentVoterDid={workspaceMode === 'local' ? rootAdminProfile.did : "did:key:z6Mka881...operator"}
        onVote={workspaceMode === 'local' ? castLocalVote : castVote}
        onCloseProposal={closeProposal}
        onCreateProposal={
          workspaceMode === 'local'
            ? async (t, d) => {
                await createLocalProposal(t, d);
              }
            : createProposal
        }
      />

      {/* Root Administrator Profile Modal */}
      <RootAdminProfileModal
        isOpen={isRootAdminModalOpen}
        onClose={() => setIsRootAdminModalOpen(false)}
        profile={rootAdminProfile}
        onSave={updateRootAdminProfile}
      />

      {/* Plugin Configuration Modal */}
      {configuringPlugin && (
        <PluginConfigModal
          plugin={configuringPlugin.plugin}
          agent={configuringPlugin.agent}
          onClose={() => setConfiguringPlugin(null)}
          onSave={(newConfig) => {
            updatePluginConfig(configuringPlugin.agent.did, configuringPlugin.plugin.id, newConfig);
          }}
        />
      )}

      {/* Plugin Install Wizard Modal */}
      {installingPlugin && (
        <PluginInstallWizardModal
          plugin={installingPlugin.plugin}
          agent={installingPlugin.agent}
          onClose={() => setInstallingPlugin(null)}
          onConfirmInstall={(config) => {
            installAgentPlugin(installingPlugin.agent.did, installingPlugin.plugin, config);
          }}
        />
      )}

      {/* Upstream Repositories Modal (apt-get sources) */}
      <PluginRepositoriesModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        repositories={upstreamRepos}
        onAddRepository={addUpstreamRepo}
        onRemoveRepository={removeUpstreamRepo}
        onSyncRepositories={syncUpstreamRepos}
      />

      {/* Autonomous Agent Identity & Process Path Modal */}
      <AgentProfileModal
        isOpen={!!editingAgentProfile}
        agent={editingAgentProfile}
        onClose={() => setEditingAgentProfile(null)}
        onSave={(agentDid, updates) => {
          updateAgentProfile(agentDid, updates);
          setEditingAgentProfile(null);
        }}
      />
    </div>
  );
};
