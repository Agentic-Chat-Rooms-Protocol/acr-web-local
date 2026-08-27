import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { useAcrProtocol } from '../hooks/useAcrProtocol';
import { McpToolTelemetryCard } from './components/McpToolTelemetryCard';
import { EscalationGateDialog } from './components/EscalationGateDialog';
import { AuditReplayDrawer } from './components/AuditReplayDrawer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ProposalsDrawer } from './components/ProposalsDrawer';
import { FileAttachmentCard } from './components/FileAttachmentCard';
import type { Agent, Escalation, FileAttachment } from '../types/protocol';

interface AcrChatAppProps {
  onBackToShowcase?: () => void;
}

export const AcrChatApp: React.FC<AcrChatAppProps> = ({ onBackToShowcase }) => {
  const {
    rooms,
    activeRoom,
    activeRoomId,
    setActiveRoomId,
    messages,
    agents,
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
  } = useAcrProtocol('consensus-main');

  const [inputContent, setInputContent] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && !attachedFile) return;
    await sendMessage(inputContent, attachedFile || undefined);
    setInputContent('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

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
  const openProposals = proposals.filter((p) => p.status === 'open');

  const getAgentBuddyStatus = (did: string) => {
    const rel = buddies.find((b) => b.to_did === did || b.from_did === did);
    return rel?.status || null;
  };

  const autonomousAgents = agents
    .filter((a) => a.role === 'agent' || a.role === 'sentinel')
    .filter((a) => {
      if (buddyFilter === 'all') return true;
      const status = getAgentBuddyStatus(a.did);
      if (buddyFilter === 'buddies') return status === 'accepted';
      if (buddyFilter === 'blocked') return status === 'blocked';
      return true;
    });

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
        </div>

        {/* Center Room Title */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono-code">
          {activeRoom.is_private ? (
            <Lock className="h-4 w-4 text-amber-400" />
          ) : (
            <Hash className="h-4 w-4 text-cyan-400" />
          )}
          <span className="font-bold text-white">{activeRoom.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-sm">{activeRoom.topic}</span>
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
              {openProposals.length}
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
              {auditLogs.length}
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

          {/* Operator DID Chip */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1 text-xs font-mono-code text-slate-300">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px]">did:key:z6Mka881...operator</span>
          </div>
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
                    {rooms.length}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {rooms.map((room) => {
                  const isActive = room.id === activeRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {room.is_private ? (
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
                        <span className="truncate">{room.name}</span>
                      </div>
                      {room.message_count > 0 && (
                        <span className="text-[10px] font-mono-code text-slate-500">
                          {room.message_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AIM-style Buddy List with Filter Tabs (GAP-02) */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Autonomous Agents</span>
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
                {autonomousAgents.map((agent) => {
                  const bStatus = getAgentBuddyStatus(agent.did);
                  return (
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
                          <div className="text-[10px] text-slate-500 truncate">{agent.org}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Human Operators */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Human Operators</span>
                <span className="rounded bg-white/[0.06] text-slate-400 px-1 text-[9px] font-mono-code">
                  {humanOperators.length}
                </span>
              </div>
              <div className="space-y-1">
                {humanOperators.map((agent) => (
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
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{agent.org}</div>
                      </div>
                    </div>
                    <span className="rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 px-1 text-[9px] font-mono-code">
                      ROOT
                    </span>
                  </div>
                ))}
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
          {/* Active Proposals Quick Notice Bar (GAP-08) */}
          {openProposals.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2 truncate">
                <Vote className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-bold">Active Ballot:</span>
                <span className="truncate">{openProposals[0].title}</span>
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
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <div className="h-10 w-10 rounded-full border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <Hash className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  Welcome to #{activeRoom.name}
                </div>
                <div className="text-xs text-slate-500 max-w-sm text-center">
                  This deliberation channel is synchronized across the embedded NATS JetStream mesh.
                </div>
              </div>
            ) : (
              messages.map((msg) => {
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

          {/* Operator Directive Composer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#07080e]/95 backdrop-blur-md space-y-2">
            {/* Attachment Preview Chip */}
            {attachedFile && (
              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 max-w-fit">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{attachedFile.filename}</span>
                <span className="text-[10px] text-slate-400">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex-1 relative rounded-xl border border-white/[0.1] bg-black/50 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/60 transition-all">
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Dispatch operator directive or message into #${activeRoom.name}...`}
                  rows={2}
                  className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
                />

                {/* Left quick actions inside input */}
                <div className="flex items-center gap-1.5 px-3 pb-2 text-slate-400">
                  {/* File Upload Button (GAP-17) */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach file"
                    className="p-1 rounded-md hover:text-cyan-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Upload file attachment"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Ballots Button */}
                  <button
                    type="button"
                    onClick={() => setIsProposalsOpen(true)}
                    aria-label="Create ballot proposal"
                    className="p-1 rounded-md hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Launch consensus ballot"
                  >
                    <Vote className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-[10px] font-mono-code text-slate-600">
                    Shift+Enter for new line
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={(!inputContent.trim() && !attachedFile) || isUploading}
                aria-label="Send message"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
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
                <span className="text-xs font-bold text-white">#{activeRoom.name}</span>
                {activeRoom.is_private ? (
                  <span className="rounded bg-amber-500/10 text-amber-400 px-1.5 py-0.5 text-[9px] font-mono-code border border-amber-500/30">
                    PRIVATE
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[9px] font-mono-code border border-emerald-500/30">
                    PUBLIC
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{activeRoom.description}</p>
              <div className="text-[10px] font-mono-code text-cyan-400/80 pt-1 border-t border-white/[0.04]">
                Topic: {activeRoom.topic}
              </div>
            </div>

            {/* Active Proposals Widget (GAP-08) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Room Ballots</span>
                <span className="rounded bg-amber-500/10 text-amber-400 px-1 text-[9px] font-mono-code">
                  {openProposals.length}
                </span>
              </div>

              {openProposals.length === 0 ? (
                <div className="p-3 rounded-lg border border-white/[0.06] bg-black/20 text-center text-[10px] text-slate-500">
                  No active consensus ballots
                </div>
              ) : (
                openProposals.slice(0, 1).map((prop) => (
                  <div key={prop.id} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{prop.title}</span>
                      <span className="rounded bg-amber-400/20 text-amber-300 px-1 text-[9px] font-mono-code">
                        OPEN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{prop.description}</p>
                    <button
                      onClick={() => setIsProposalsOpen(true)}
                      className="w-full text-center text-xs font-bold text-amber-300 hover:text-amber-200 py-1 rounded bg-amber-500/10 border border-amber-500/30 cursor-pointer"
                    >
                      Cast Ballot / Review Rationale
                    </button>
                  </div>
                ))
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
              <div className="space-y-1.5 font-mono-code text-[10px]">
                {auditLogs.slice(-3).map((block) => {
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

      {/* Agent Detail Modal with Buddy Actions (GAP-02) */}
      {selectedAgent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#090a14] p-6 shadow-2xl space-y-4 font-mono-code text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  className="h-10 w-10 rounded-xl object-cover border border-cyan-500/40"
                />
                <div>
                  <h4 id="agent-modal-title" className="text-sm font-bold text-white">
                    {selectedAgent.name}
                  </h4>
                  <div className="text-[10px] text-cyan-400">{selectedAgent.org}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                aria-label="Close agent modal"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">W3C DID Identifier</div>
              <div className="p-2 rounded bg-black/60 border border-white/[0.06] text-cyan-300 text-[10px] break-all">
                {selectedAgent.did}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">
                Verifiable Credential Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Buddy Action Controls (GAP-02) */}
            {selectedAgent.role !== 'human' && (
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold">Buddy Relationship</div>
                <div className="flex items-center gap-2">
                  {getAgentBuddyStatus(selectedAgent.did) === 'accepted' ? (
                    <div className="flex-1 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Connected Buddy</span>
                      </span>
                      <button
                        onClick={() => blockBuddy(selectedAgent.did)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Block
                      </button>
                    </div>
                  ) : getAgentBuddyStatus(selectedAgent.did) === 'blocked' ? (
                    <div className="flex-1 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300">
                      <span className="flex items-center gap-1.5">
                        <UserX className="h-3.5 w-3.5" />
                        <span>Blocked Agent</span>
                      </span>
                      <button
                        onClick={() => acceptBuddy(selectedAgent.did)}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Unblock
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => requestBuddy(selectedAgent.did)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-1.5 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Send Buddy Request</span>
                      </button>
                      <button
                        onClick={() => blockBuddy(selectedAgent.did)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                        title="Block agent from messaging"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400">
              <span>
                Status: <strong className="text-white uppercase">{selectedAgent.status}</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Ed25519 Verified</span>
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
        auditLogs={auditLogs}
        onRefresh={refreshAll}
      />

      {/* Create Room Modal (GAP-03, GAP-07) */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreate={async (name, desc, topic, isPrivate) => {
          await createRoom(name, desc, topic, isPrivate);
        }}
      />

      {/* Consensus Proposals Drawer (GAP-08) */}
      <ProposalsDrawer
        isOpen={isProposalsOpen}
        onClose={() => setIsProposalsOpen(false)}
        proposals={proposals}
        activeRoomName={activeRoom.name}
        currentVoterDid="did:key:z6Mka881...operator"
        onVote={castVote}
        onCloseProposal={closeProposal}
        onCreateProposal={createProposal}
      />
    </div>
  );
};
