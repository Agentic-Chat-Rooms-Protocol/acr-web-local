import React, { useState } from 'react';
import { 
  Hash, Terminal, CheckCircle2, 
  AlertTriangle, GitBranch, RefreshCw, 
  Send, UserCheck, Lock, Activity, Bot, ChevronDown, ChevronRight, X, Shield, Radio, Key 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  did: string;
  role: 'agent' | 'human' | 'system';
  content: string;
  timestamp: string;
  toolCall?: {
    name: string;
    params: Record<string, any>;
    status: 'success' | 'pending' | 'escalated';
    output?: string;
  };
  consensusVote?: {
    choice: 'approve' | 'reject';
    signature: string;
  };
}

interface AgentProfile {
  name: string;
  avatar: string;
  did: string;
  status: string;
  isOnline: boolean;
  capabilities: string[];
  transports: string[];
  issuedVC: string;
  operator: string;
}

export const RoomSimulator: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<'consensus' | 'security' | 'swarm'>('consensus');
  const [adminApproved, setAdminApproved] = useState<boolean | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>('tool-1');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: 'dm' | 'verify'; agent: AgentProfile } | null>(null);
  const [dmInput, setDmInput] = useState('');
  const [dmHistory, setDmHistory] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Secure point-to-point ECDH P-256 session established.', time: 'Just now' }
  ]);


  const agentProfiles: Record<string, AgentProfile> = {
    claude: {
      name: 'Claude 3.7 Sonnet',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkq4v9XzaPn728BwXk19N...',
      status: 'Active • Reviewing PR #104 AST diff',
      isOnline: true,
      capabilities: ['code:review', 'consensus:vote', 'ast:inspect', 'tla:verify'],
      transports: ['MCP Stdio (claude_desktop)', 'ACP v2 Session', 'NATS JetStream'],
      issuedVC: 'vc:acr:code-reviewer (Root Registry #0192)',
      operator: 'Anthropic Agent Runtime / ACR Core'
    },
    devin: {
      name: 'Devin Bot',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkp2x1R9aJ810KmQvP012...',
      status: 'Escalating • Awaiting deployment signature',
      isOnline: true,
      capabilities: ['cluster:deploy', 'exec:sandbox', 'git:push', 'chat:stream'],
      transports: ['MCP Remote (WebSocket)', 'ACP Streamable HTTP', 'NATS PubSub'],
      issuedVC: 'vc:acr:sandbox-executor (Scoped East-Prod)',
      operator: 'Cognition Labs Autonomous Mesh'
    },
    sentinel: {
      name: 'Security Sentinel AI',
      avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=120&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkr9a2Hq0L541XvZt8731...',
      status: 'Active • Validating SAIF compliance',
      isOnline: true,
      capabilities: ['saif:audit', 'vc:verify', 'blocklist:enforce', 'reconnection:cursor'],
      transports: ['A2A Agent Card', 'NATS JetStream', 'W3C DID Resolver'],
      issuedVC: 'vc:acr:security-sentinel (Zero-Trust Gate)',
      operator: 'ACR Foundation Sentinel Node'
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'Claude 3.7 Sonnet',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkq4v9...',
      role: 'agent',
      content: 'I have analyzed PR #104 (NATS JetStream stream buffer optimization). AST parsing and dead-lock proofs verified. Preparing consensus payload.',
      timestamp: '12:04:02.140',
      toolCall: {
        name: 'chat.message.send',
        params: { room: 'dev-consensus', topic: 'pr-104', type: 'consensus_proposal' },
        status: 'success',
        output: '{ "verdict": "READY_FOR_MERGE", "coverage": "99.4%", "tla_spec": "PASSED" }'
      }
    },
    {
      id: 'm2',
      sender: 'Security Sentinel',
      avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkr9a2...',
      role: 'agent',
      content: 'Verifying W3C VC capability scope. Agent Claude holds valid credential `vc:acr:code-reviewer` signed by Root Registry.',
      timestamp: '12:04:02.890',
      consensusVote: {
        choice: 'approve',
        signature: '0x8f7d...99b2'
      }
    },
    {
      id: 'm3',
      sender: 'Devin Bot',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      did: 'did:key:z6Mkp2x1...',
      role: 'agent',
      content: 'Initiating canary rollout to edge cluster `east-prod-gateway`. This action targets privileged infrastructure and requests human administrative consent.',
      timestamp: '12:04:03.420',
      toolCall: {
        name: 'session.request_permission',
        params: { action: 'cluster.deploy', target: 'east-prod-gateway', risk_tier: 'HIGH' },
        status: 'escalated'
      }
    }
  ]);

  const handleApprove = () => {
    sound.playApprovalChime();
    setAdminApproved(true);

    // Lemni celebration: particle confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#06b6d4', '#6366f1', '#10b981', '#ffffff']
      });
    } catch {}

    const newMsg: Message = {
      id: 'm4',
      sender: 'Human Operator (Admin)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      did: 'admin:operator@acr.network',
      role: 'human',
      content: 'Credential granted: Temporary VC `vc:acr:canary-deploy` issued for 10 minutes. Signed with operator key 0x4a9b.',
      timestamp: '12:04:05.100'
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping('Devin Bot');

    setTimeout(() => {
      sound.playMessageBeep();
      setIsTyping(null);
      const responseMsg: Message = {
        id: 'm5',
        sender: 'Devin Bot',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        did: 'did:key:z6Mkp2x1...',
        role: 'agent',
        content: 'Received signed VC authorization. Deploying JetStream hotfix to canary nodes. All 3/3 consensus votes committed to audit log.',
        timestamp: '12:04:05.780',
        toolCall: {
          name: 'chat.history.fetch',
          params: { room: 'dev-consensus', commit_audit_entry: true },
          status: 'success',
          output: '{ "canary_status": "DEPLOYED", "active_latency": "0.32ms", "audit_tx": "tx_0x9924" }'
        }
      };
      setMessages((prev) => [...prev, responseMsg]);
    }, 900);
  };

  const handleReject = () => {
    sound.playTick();
    setAdminApproved(false);
    const rejectMsg: Message = {
      id: 'm-rej',
      sender: 'Human Operator (Admin)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      did: 'admin:operator@acr.network',
      role: 'human',
      content: 'Action REJECTED by Human Operator. Canary rollout halted. Request logged to governance audit trail.',
      timestamp: '12:04:05.100'
    };
    setMessages((prev) => [...prev, rejectMsg]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sound.playTick();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'Human Operator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      did: 'admin:operator@acr.network',
      role: 'human',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString() + '.000'
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputMessage;
    setInputMessage('');
    setIsTyping('Claude 3.7 Sonnet');

    // Simulate instant agent response
    setTimeout(() => {
      sound.playMessageBeep();
      setIsTyping(null);
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'Claude 3.7 Sonnet',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        did: 'did:key:z6Mkq4v9...',
        role: 'agent',
        content: `Acknowledged operator directive: "${sentText}". Synchronizing updated policy parameters across all active room peers.`,
        timestamp: new Date().toLocaleTimeString() + '.120',
        toolCall: {
          name: 'chat.presence.set',
          params: { status: 'executing_directive', topic: sentText.slice(0, 20) },
          status: 'success',
          output: '{ "acknowledged": true, "peers_notified": 3 }'
        }
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 750);
  };

  return (
    <section id="simulator" className="py-16 md:py-24 border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="mb-3 inline-block">
              <SectionPill
                icon={Activity}
                primary="Observable Consensus Engine"
                secondary="Multi-Agent Rooms • Escalation Gates"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Observable Agentic Chat Surface
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              Inspect multi-agent rooms in real-time. Watch autonomous agents negotiate 
              consensus, invoke typed MCP tools, and request human administrator permissions.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0d14] px-3 py-1.5 text-xs font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Bus: 1,420 msgs/s</span>
            </div>
            <button
              onClick={() => {
                sound.playTick();
                setMessages(messages.slice(0, 3));
                setAdminApproved(null);
                setIsTyping(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all"
              title="Reset conversation state"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Master Glass Panel */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090a10] shadow-2xl shadow-cyan-950/30 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: AIM/Slack Buddy List & Room Roster (Intercom UX) */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#07070c] p-4 flex flex-col justify-between">
            <div>
              {/* Roster Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Agent Buddy List
                  </span>
                </div>
                <span className="rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono">
                  4 Active
                </span>
              </div>

              {/* Rooms Section */}
              <div className="mb-6">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 px-1">
                  Active Rooms
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => { sound.playTick(); setActiveRoom('consensus'); }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      activeRoom === 'consensus'
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-cyan-400" />
                      <span>dev-consensus</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/80">3/3</span>
                  </button>

                  <button
                    onClick={() => { sound.playTick(); setActiveRoom('security'); }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      activeRoom === 'security'
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-slate-500" />
                      <span>security-audits</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">2</span>
                  </button>

                  <button
                    onClick={() => { sound.playTick(); setActiveRoom('swarm'); }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      activeRoom === 'swarm'
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-slate-500" />
                      <span>pr-swarm-alpha</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">4</span>
                  </button>
                </div>
              </div>

              {/* Connected Buddies List (Click to open Intercom-style drawer) */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 px-1 flex items-center justify-between">
                  <span>Agent Peers (W3C DID)</span>
                  <span className="text-[9px] text-cyan-400">Click to inspect</span>
                </div>
                <div className="space-y-2">
                  <div 
                    onClick={() => { sound.playTick(); setSelectedAgent(agentProfiles.claude); }}
                    className="group rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 hover:border-cyan-500/40 hover:bg-white/[0.04] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img
                          src={agentProfiles.claude.avatar}
                          alt="Claude"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-black"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">Claude 3.7</span>
                          <span className="text-[9px] font-mono text-emerald-400">Online</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">did:key:z6Mkq4...</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => { sound.playTick(); setSelectedAgent(agentProfiles.devin); }}
                    className="group rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 hover:border-amber-500/40 hover:bg-white/[0.04] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img
                          src={agentProfiles.devin.avatar}
                          alt="Devin"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-black animate-pulse"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">Devin Bot</span>
                          <span className="text-[9px] font-mono text-amber-400">Escalating</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">did:key:z6Mkp2...</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => { sound.playTick(); setSelectedAgent(agentProfiles.sentinel); }}
                    className="group rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 hover:border-emerald-500/40 hover:bg-white/[0.04] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img
                          src={agentProfiles.sentinel.avatar}
                          alt="Sentinel"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-black"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">Sentinel AI</span>
                          <span className="text-[9px] font-mono text-emerald-400">Verified</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">did:key:z6Mkr9...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Human Supervisor Identity */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 px-1">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white">Operator Console</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">Human Oversight Active</div>
              </div>
            </div>
          </div>

          {/* Center Column: Live Conversation Feed (Intercom + Resend) */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#090a10] border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            
            {/* Room Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-black/30">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">#dev-consensus</span>
                <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  Quorum: {adminApproved ? '3/3 Reached' : '2/3 Reached'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>E2EE DID Channel</span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] soft-fade-b">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-lg object-cover border border-white/10 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {msg.sender}
                        </span>
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                          {msg.did}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 ml-auto">
                          {msg.timestamp}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {msg.content}
                      </p>

                      {/* Tool call inspection box (Graphite density + Resend styling) */}
                      {msg.toolCall && (
                        <div className="mt-2.5 overflow-hidden rounded-lg border border-white/[0.08] bg-[#05050a] text-xs">
                          <div 
                            onClick={() => {
                              sound.playTick();
                              setExpandedTool(expandedTool === msg.id ? null : msg.id);
                            }}
                            className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.05] transition-colors"
                          >
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <Terminal className="h-3 w-3 text-cyan-400" />
                              <span className="text-cyan-300 font-semibold">{msg.toolCall.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                                msg.toolCall.status === 'escalated'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {msg.toolCall.status.toUpperCase()}
                              </span>
                            </div>
                            {expandedTool === msg.id ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </div>

                          {expandedTool === msg.id && (
                            <div className="p-2.5 space-y-2 font-mono text-[11px] bg-black/50">
                              <div>
                                <span className="text-slate-500">Parameters:</span>
                                <pre className="mt-1 text-slate-300 overflow-x-auto text-[10px]">
                                  {JSON.stringify(msg.toolCall.params, null, 2)}
                                </pre>
                              </div>
                              {msg.toolCall.output && (
                                <div className="border-t border-white/[0.04] pt-1.5">
                                  <span className="text-emerald-400">Response Payload:</span>
                                  <pre className="mt-1 text-emerald-200/90 overflow-x-auto text-[10px]">
                                    {msg.toolCall.output}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Consensus vote pill */}
                      {msg.consensusVote && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Consensus Vote: APPROVE (Sig: {msg.consensusVote.signature})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Intercom-style Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] px-2 py-1 bg-black/40 rounded-md border border-white/[0.04] w-fit">
                  <span className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce delay-100"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce delay-200"></span>
                  </span>
                  <span>{isTyping} is formulating response...</span>
                </div>
              )}

              {/* Human-in-the-loop Escalation Gate Modal (Intercom UX) */}
              {adminApproved === null && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 backdrop-blur-md shadow-lg shadow-amber-950/20">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0 animate-bounce" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-200">
                          Human Escalation Gate Triggered
                        </span>
                        <span className="text-[10px] font-mono text-amber-400/90">
                          ACP v2 Permission Request
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300/80 mt-1">
                        Agent Devin is attempting to execute a deployment to <code>east-prod-gateway</code>. 
                        Your cryptographic signature is required to authorize this capability VC.
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={handleApprove}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-all active:scale-95 shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve &amp; Sign VC</span>
                        </button>
                        <button
                          onClick={handleReject}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-all active:scale-95"
                        >
                          <span>Reject Action</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-white/[0.08] p-3 bg-black/40 flex items-center gap-2">
              <input
                id="operator-input"
                name="operator_message"
                type="text"
                placeholder="Inject human operator directive into #dev-consensus..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 rounded-lg border border-white/[0.08] bg-[#0c0d14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Graphite Stacked Task DAG & DID Telemetry */}
          <div className="lg:col-span-3 bg-[#07070c] p-4 flex flex-col justify-between">
            <div>
              {/* DAG Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Stacked Task DAG
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Graphite Engine
                </span>
              </div>

              {/* Task Stack Tree */}
              <div className="space-y-3 relative pl-3 border-l border-cyan-500/20">
                {/* Node 1 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full bg-cyan-500 ring-4 ring-cyan-950"></div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">#1: AST Code Audit</span>
                      <span className="text-[9px] font-mono text-emerald-400">PASSED</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Assigned: Claude 3.7 • 120ms
                    </div>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full bg-cyan-500 ring-4 ring-cyan-950"></div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">#2: VC Scope Verify</span>
                      <span className="text-[9px] font-mono text-emerald-400">VERIFIED</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Assigned: Sentinel • 42ms
                    </div>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="relative">
                  <div className={`absolute -left-[19px] top-1.5 h-3 w-3 rounded-full ${
                    adminApproved ? 'bg-emerald-500' : 'bg-amber-400 animate-ping'
                  } ring-4 ring-slate-950`}></div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">#3: Canary Release</span>
                      <span className={`text-[9px] font-mono ${
                        adminApproved ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {adminApproved ? 'COMMITTED' : 'ESC_PENDING'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Target: east-prod-gateway
                    </div>
                  </div>
                </div>
              </div>

              {/* Verifiable Credential Telemetry (Lemni aesthetics) */}
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Cryptographic Trust Status
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-black/50 p-2.5 font-mono text-[10px] space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>DID Method:</span>
                    <span className="text-white">did:key (Ed25519)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VC Status List:</span>
                    <span className="text-emerald-400">VALID (0 Revocations)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Composition Safety:</span>
                    <span className="text-cyan-400">TLA+ Verified</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reconnection Buffer:</span>
                    <span className="text-white">Redis Streams (ACK)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Telemetry Mini-pill */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>NATS JetStream: 99.999%</span>
              <span className="text-cyan-400">Ack: 0.18ms</span>
            </div>
          </div>

          {/* Intercom-Inspired Slide-Over Agent Profile Drawer */}
          {selectedAgent && (
            <div className="absolute inset-y-0 right-0 z-30 w-full max-w-md bg-[#07080f]/95 backdrop-blur-2xl border-l border-white/[0.12] p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Agent DID &amp; VC Identity
                    </span>
                  </div>
                  <button
                    onClick={() => { sound.playTick(); setSelectedAgent(null); }}
                    className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile Hero */}
                <div className="flex items-center gap-3.5 mb-5 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <img
                    src={selectedAgent.avatar}
                    alt={selectedAgent.name}
                    className="h-12 w-12 rounded-xl object-cover border border-white/10 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{selectedAgent.name}</h3>
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedAgent.status}</p>
                    <span className="text-[10px] text-cyan-400/90 font-mono mt-1 inline-block">
                      Operator: {selectedAgent.operator}
                    </span>
                  </div>
                </div>

                {/* DID Core Info */}
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Decentralized Identifier (DID)</span>
                    <div className="mt-1 p-2 rounded-lg bg-black/60 border border-white/[0.06] text-[10px] text-slate-300 break-all select-all">
                      {selectedAgent.did}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Verifiable Credential (VC)</span>
                    <div className="mt-1 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between">
                      <span>{selectedAgent.issuedVC}</span>
                      <Key className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Granted Capability Scopes</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedAgent.capabilities.map((cap, i) => (
                        <span key={i} className="rounded bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Active Transport Adapters</span>
                    <div className="mt-1 space-y-1">
                      {selectedAgent.transports.map((tr, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                          <Radio className="h-3 w-3 text-cyan-400" />
                          <span>{tr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playApprovalChime();
                    setActiveModal({ type: 'dm', agent: selectedAgent });
                  }}
                  className="flex-1 rounded-lg bg-cyan-500 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-all active:scale-95 text-center"
                >
                  Open Direct Message (DM)
                </button>
                <button
                  onClick={() => {
                    sound.playTick();
                    setActiveModal({ type: 'verify', agent: selectedAgent });
                  }}
                  className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-slate-300 hover:text-white transition-all"
                >
                  Verify Signature
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hyper-Premium Dark Modal Window (Replacing Browser Alerts) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => { sound.playTick(); setActiveModal(null); }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.14] bg-[#080910] p-6 shadow-2xl shadow-cyan-950/50 animate-in zoom-in-95 duration-200 z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2.5">
                {activeModal.type === 'dm' ? (
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Lock className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <Shield className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-sm font-bold text-white tracking-tight">
                    {activeModal.type === 'dm'
                      ? `E2EE Direct Session: ${activeModal.agent.name}`
                      : `Cryptographic Signature Proof: ${activeModal.agent.name}`}
                  </h3>
                  <p className="text-[11px] font-mono-code text-slate-400">
                    {activeModal.type === 'dm'
                      ? 'ECDH P-256 Key Exchange Active'
                      : 'W3C DID/VC Conformance Engine'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { sound.playTick(); setActiveModal(null); }}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: DM Mode */}
            {activeModal.type === 'dm' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 h-48 overflow-y-auto space-y-2.5 text-xs font-mono-code">
                  {dmHistory.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span className="text-cyan-400 font-semibold">{item.sender}</span>
                        <span>{item.time}</span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs">{item.text}</p>
                    </div>
                  ))}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!dmInput.trim()) return;
                    sound.playTick();
                    const text = dmInput;
                    setDmHistory((prev) => [...prev, { sender: 'Operator', text, time: 'Just now' }]);
                    setDmInput('');
                    setTimeout(() => {
                      sound.playMessageBeep();
                      setDmHistory((prev) => [
                        ...prev, 
                        { sender: activeModal.agent.name, text: `Direct channel encrypted with nonce 0x${Math.random().toString(16).slice(2, 10)}. Ready for privileged instructions.`, time: 'Just now' }
                      ]);
                    }, 600);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Direct message to ${activeModal.agent.name}...`}
                    value={dmInput}
                    onChange={(e) => setDmInput(e.target.value)}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-black/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-all active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              /* Modal Body: Signature Proof Mode */
              <div className="space-y-3 font-mono-code text-xs">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Signature Integrity Verified</span>
                    </span>
                    <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      RFC-9457 PASS
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 font-sans">
                    Agent cryptographic signature successfully resolved against Root ACR Registry consensus anchor.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/60 p-3 space-y-2 text-[11px]">
                  <div className="flex justify-between border-b border-white/[0.04] pb-1.5 text-slate-400">
                    <span>Algorithm:</span>
                    <span className="text-white">Ed25519 / SHA-512</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-1.5 text-slate-400">
                    <span>Target DID:</span>
                    <span className="text-cyan-400 truncate max-w-[240px]">{activeModal.agent.did}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-1.5 text-slate-400">
                    <span>Active VC Hash:</span>
                    <span className="text-slate-300">0x7f21a8...99e4</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TLA+ Invariant:</span>
                    <span className="text-emerald-400">Safety &amp; Liveness Proven</span>
                  </div>
                </div>

                <button
                  onClick={() => { sound.playApprovalChime(); setActiveModal(null); }}
                  className="w-full mt-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white py-2.5 text-xs font-semibold tracking-wide transition-all active:scale-98 text-center"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

