import React, { useState, useEffect } from 'react';
import { ProcessMilestoneThread, type ProcessMilestone } from '../chat/ProcessMilestoneThread';
import { AgentBattleView } from '../battle/AgentBattleView';
import { AgentDraftsQueue } from '../inbox/AgentDraftsQueue';

export type WorkspaceTab = 'CHANNELS' | 'DELIBERATION' | 'INSPECTOR';

export interface ChannelItem {
  id: string;
  name: string;
  unreadCount: number;
  isPrivate?: boolean;
}

export interface ActiveAgentItem {
  did: string;
  name: string;
  role: string;
  status: 'ONLINE' | 'RUNNING' | 'PARKED';
  tier: 'Low' | 'Mid' | 'High';
}

const DEFAULT_CHANNELS: ChannelItem[] = [
  { id: 'deliberation-main', name: 'deliberation-main', unreadCount: 0 },
  { id: 'byzantine-quorum', name: 'byzantine-quorum', unreadCount: 2 },
  { id: 'vcs-pull-requests', name: 'vcs-pull-requests', unreadCount: 1 },
  { id: 'security-gates', name: 'security-gates', unreadCount: 3, isPrivate: true },
  { id: 'incident-war-room', name: 'incident-war-room', unreadCount: 0 },
];

const DEFAULT_AGENTS: ActiveAgentItem[] = [
  { did: 'did:key:agent-sre-01', name: 'Agent SRE Reliability', role: 'SRE Squad', status: 'ONLINE', tier: 'High' },
  { did: 'did:key:agent-sec-02', name: 'Agent SecOps Guard', role: 'SecOps Zero-Trust', status: 'RUNNING', tier: 'High' },
  { did: 'did:key:agent-vcs-03', name: 'Agent Collab Engine', role: 'VCS Integration', status: 'PARKED', tier: 'Mid' },
];

const SAMPLE_MILESTONE: ProcessMilestone = {
  id: 'ms-01',
  milestoneNumber: 1,
  title: 'Architectural Deliberation & Pareto Plan Selection',
  status: 'COMPLETED',
  timestamp: '2026-10-04T02:15:00Z',
  authorDid: 'did:key:commander-ops',
  summary: 'Deliberation concluded with supermajority quorum (>67%). Pruned dominated configurations on Pareto frontier.',
  steps: [
    {
      id: 'step-1-1',
      stepNumber: '1.1',
      title: 'Execute Factorial Grid Evaluation (DoE ANOVA)',
      agentDid: 'did:key:agent-sre-01',
      status: 'PASS',
      latencyMs: 142,
      costUsd: 0.0018,
      notes: 'Excluded tooling false-fails',
    },
    {
      id: 'step-1-2',
      stepNumber: '1.2',
      title: 'Calculate Accuracy-vs-Cost Pareto Frontier',
      agentDid: 'did:key:agent-sre-01',
      status: 'PASS',
      latencyMs: 38,
      costUsd: 0.0004,
      notes: 'Rank 1 non-dominated set confirmed',
    },
    {
      id: 'step-1-3',
      stepNumber: '1.3',
      title: 'Collect Cryptographic Ed25519 Quorum Ballots',
      agentDid: 'did:key:agent-sec-02',
      status: 'PASS',
      latencyMs: 88,
      costUsd: 0.0008,
      hashHex: '8f01b4c9e210a4d5',
    },
  ],
};

const SAMPLE_ACTIVE_MILESTONE: ProcessMilestone = {
  id: 'ms-02',
  milestoneNumber: 2,
  title: 'Multi-Repo VCS Cross-Collab via GitHub & Jujutsu',
  status: 'IN_PROGRESS',
  timestamp: '2026-10-04T02:40:00Z',
  authorDid: 'did:key:agent-vcs-03',
  summary: 'Executing PR authoring, commit describe, and fail-closed human approval gating across repository mesh.',
  steps: [
    {
      id: 'step-2-1',
      stepNumber: '2.1',
      title: 'Inspect Working Copy via JujutsuAdapter (jj diff)',
      agentDid: 'did:key:agent-vcs-03',
      status: 'PASS',
      latencyMs: 24,
      notes: 'Zero token leakage in memory',
    },
    {
      id: 'step-2-2',
      stepNumber: '2.2',
      title: 'Prepare ActionProposal for GitHub Pull Request #104',
      agentDid: 'did:key:agent-vcs-03',
      status: 'PARKED',
      latencyMs: 12,
      notes: 'Parked in Human Approval Gate',
    },
  ],
};

export interface ThreePaneWorkspaceProps {
  className?: string;
  initialChannel?: string;
}

export const ThreePaneWorkspace: React.FC<ThreePaneWorkspaceProps> = ({
  className = '',
  initialChannel = 'deliberation-main',
}) => {
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel);
  const [mobileTab, setMobileTab] = useState<WorkspaceTab>('DELIBERATION');
  const [centerMode, setCenterMode] = useState<'STREAM' | 'BATTLE'>('STREAM');
  const [directiveInput, setDirectiveInput] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleDispatch = () => {
    if (!directiveInput.trim()) return;
    setDirectiveInput('');
  };

  return (
    <div
      className={`w-full h-full min-h-[640px] bg-neutral-950 text-neutral-100 flex flex-col font-sans border border-neutral-750 rounded-xl overflow-hidden shadow-2xl ${className}`}
      role="application"
      aria-label="ACR 3-Pane Deliberation Workspace"
    >
      {/* Workspace Top Bar */}
      <header className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-750 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-neutral-800 text-sky-400 border border-sky-500/40">
            [ACR WORKSPACE]
          </span>
          <span className="text-sm font-semibold text-white tracking-wide">
            Agentic Chat Rooms War Room
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
            CAPS: 0x03FF [SYSOP]
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
            [MESH ONLINE]
          </span>
        </div>
      </header>

      {/* Mobile Tab Switcher (< 768px) */}
      {isMobile && (
        <nav
          className="flex bg-neutral-900 border-b border-neutral-750 text-xs font-mono"
          role="tablist"
          aria-label="Mobile workspace sections"
        >
          {(['CHANNELS', 'DELIBERATION', 'INSPECTOR'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mobileTab === tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-center font-medium transition-colors focus:outline-none ${
                mobileTab === tab
                  ? 'bg-neutral-800 text-sky-300 border-b-2 border-sky-400 font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              [{tab}]
            </button>
          ))}
        </nav>
      )}

      {/* Main 3-Pane Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1: Channels & Agents Sidebar */}
        <section
          className={`${
            isMobile && mobileTab !== 'CHANNELS' ? 'hidden' : 'flex'
          } w-full md:w-64 lg:w-72 flex-col bg-neutral-900 border-r border-neutral-750 shrink-0`}
          role="region"
          aria-label="Channels and Agents Navigation"
        >
          {/* Channels Section */}
          <div className="p-3 border-b border-neutral-750">
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Channels ({DEFAULT_CHANNELS.length})
            </h3>
            <div className="space-y-1">
              {DEFAULT_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChannel(ch.id);
                    if (isMobile) setMobileTab('DELIBERATION');
                  }}
                  className={`w-full px-2.5 py-1.5 rounded text-left text-xs font-mono transition-colors flex items-center justify-between ${
                    activeChannel === ch.id
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-600'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <span className="truncate"># {ch.name}</span>
                  {ch.unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-600">
                      {ch.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Roster Section */}
          <div className="flex-1 p-3 overflow-y-auto">
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Domain Pods & Agents
            </h3>
            <div className="space-y-2">
              {DEFAULT_AGENTS.map((agent) => (
                <div
                  key={agent.did}
                  className="p-2 rounded bg-neutral-850 border border-neutral-800 font-mono text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white truncate">{agent.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded ${
                        agent.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : agent.status === 'RUNNING'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      [{agent.status}]
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300 flex justify-between">
                    <span>{agent.role}</span>
                    <span className="text-neutral-400">Tier: {agent.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operator Status Footer */}
          <footer className="p-3 bg-neutral-950 border-t border-neutral-750 font-mono text-xs text-neutral-300">
            <div className="truncate">DID: did:key:z6Mkq4OpsRoomSysop</div>
            <div className="text-emerald-400 mt-0.5">[STATUS: OPERATOR AUTHD]</div>
          </footer>
        </section>

        {/* PANE 2: Central Deliberation Canvas */}
        <main
          className={`${
            isMobile && mobileTab !== 'DELIBERATION' ? 'hidden' : 'flex'
          } flex-1 flex-col bg-neutral-950 overflow-hidden`}
          role="main"
          aria-label="Central Deliberation Stream"
        >
          {/* Canvas Sub-Header & Controls */}
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  # {activeChannel}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-800 text-emerald-300 border border-emerald-700">
                  [QUORUM: 3/3 NODES]
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-300 mt-0.5">
                Goal DAG: Incident Triage -&gt; Pareto Pruning -&gt; Multi-Repo VCS PR
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCenterMode('STREAM')}
                className={`px-3 py-1.5 rounded transition-colors focus:outline-none ${
                  centerMode === 'STREAM'
                    ? 'bg-neutral-750 text-white font-bold border border-neutral-600'
                    : 'bg-neutral-850 text-neutral-300 hover:text-white'
                }`}
              >
                [STREAM VIEW]
              </button>
              <button
                type="button"
                onClick={() => setCenterMode('BATTLE')}
                className={`px-3 py-1.5 rounded transition-colors focus:outline-none ${
                  centerMode === 'BATTLE'
                    ? 'bg-neutral-750 text-white font-bold border border-neutral-600'
                    : 'bg-neutral-850 text-neutral-300 hover:text-white'
                }`}
              >
                [AGENT BATTLE ARENA]
              </button>
            </div>
          </div>

          {/* Canvas Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {centerMode === 'STREAM' ? (
              <>
                <ProcessMilestoneThread milestone={SAMPLE_MILESTONE} />
                <ProcessMilestoneThread milestone={SAMPLE_ACTIVE_MILESTONE} />
              </>
            ) : (
              <AgentBattleView />
            )}
          </div>

          {/* Bottom Operator Directive Input */}
          <div className="p-4 bg-neutral-900 border-t border-neutral-750">
            <div className="flex gap-2">
              <input
                type="text"
                value={directiveInput}
                onChange={(e) => setDirectiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDispatch()}
                placeholder="Type operator directive or slash command (/vote, /approve, /veto, /gate)..."
                className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Operator Directive Input"
              />
              <button
                type="button"
                onClick={handleDispatch}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 whitespace-nowrap"
              >
                [DISPATCH]
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] text-neutral-400">
              <button
                type="button"
                onClick={() => setDirectiveInput('/approve proposal-104')}
                className="hover:text-emerald-300 focus:outline-none"
              >
                [/approve]
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setDirectiveInput('/veto proposal-104 --rationale="safety"')}
                className="hover:text-rose-300 focus:outline-none"
              >
                [/veto]
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setDirectiveInput('/vote DISSENT --rationale="alternative needed"')}
                className="hover:text-amber-300 focus:outline-none"
              >
                [/vote]
              </button>
            </div>
          </div>
        </main>

        {/* PANE 3: Context & Agent Drafts Inspector */}
        <section
          className={`${
            isMobile && mobileTab !== 'INSPECTOR' ? 'hidden' : 'flex'
          } w-full md:w-80 lg:w-96 flex-col bg-neutral-900 border-l border-neutral-750 shrink-0`}
          role="region"
          aria-label="Context and Drafts Inspector"
        >
          {/* Agent Drafts Queue Component */}
          <AgentDraftsQueue className="flex-1" />

          {/* System Telemetry & Output Budget Status */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-750 font-mono text-xs text-neutral-300 space-y-1">
            <div className="flex justify-between">
              <span>OUTPUT BUDGET:</span>
              <span className="text-emerald-300">1.4 MB / 32 MB</span>
            </div>
            <div className="flex justify-between">
              <span>WILSON 95% BOUND:</span>
              <span className="text-white">0.941</span>
            </div>
            <div className="flex justify-between">
              <span>ANOVA ETA-SQUARED:</span>
              <span className="text-white">0.872 (High Effect)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
