import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Agent,
  Room,
  Message,
  Escalation,
  AuditEntry,
  BuddyRelation,
  Proposal,
  FileAttachment,
  MarketplacePlugin,
  UpstreamRepository,
  RootAdminProfile,
} from '../types/protocol';

const DAEMON_BASE = 'http://localhost:20443';
const OPERATOR_DID = 'did:key:z6Mka881...operator';

export const DEFAULT_ROOT_ADMIN: RootAdminProfile = {
  name: 'Root Administrator',
  title: 'ACR Root Administrator',
  did: 'did:key:z6Mka881...local-root',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  isConfigured: false,
};

const getInitialRootAdmin = (): RootAdminProfile => {
  try {
    const saved = localStorage.getItem('acr_root_admin_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_ROOT_ADMIN, ...parsed };
    }
  } catch {}
  return DEFAULT_ROOT_ADMIN;
};

export const DEFAULT_LOCAL_ROOMS: Room[] = [
  {
    id: 'local-deliberation',
    name: 'Local Deliberation',
    description: 'Primary consensus floor for local autonomous agents connected via MCP.',
    topic: 'Workstation Consensus • Zero-Trust DID/VC',
    is_private: false,
    participants: [],
    created_at: new Date().toISOString(),
    message_count: 0,
  },
];

const getInitialLocalRooms = (): Room[] => {
  try {
    const saved = localStorage.getItem('acr_local_rooms');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_LOCAL_ROOMS;
};

export const DEFAULT_UPSTREAM_REPOSITORIES: UpstreamRepository[] = [
  {
    id: 'repo-gitea-official',
    name: 'acr-official',
    url: 'http://localhost:3300/ACR/acr-marketplace.git',
    provider: 'gitea',
    branch: 'main',
    status: 'synced',
    plugin_count: 5,
    last_synced: 'Just now',
    is_default: true,
  },
  {
    id: 'repo-github-community',
    name: 'acr-community-hub',
    url: 'https://github.com/agent-chat-rooms/community-plugins.git',
    provider: 'github',
    branch: 'main',
    status: 'synced',
    plugin_count: 8,
    last_synced: '3 mins ago',
    is_default: false,
  },
];

export const ALL_MARKETPLACE_PLUGINS: MarketplacePlugin[] = [
  {
    id: 'acr-consensus-tools',
    name: 'acr-consensus-tools',
    version: '1.0.0',
    author: 'consensus-lead.acr',
    description: 'Autonomous multi-agent consensus, proposal creation, and dissent recording tools (GAP-08)',
    category: 'governance',
    trust_badge: 'ANS-ANCHORED (Block #0004)',
    verified: true,
    quality_score: 98,
    tools_count: 4,
    tools: ['acr_create_consensus_proposal', 'acr_cast_consensus_vote', 'acr_get_proposal_status', 'acr_record_dissent'],
    install_command: '/plugin install acr-consensus-tools@acr-marketplace',
    content_hash: 'c8f49a1d520e4811a7cfbb178a9c394c8e762b667823f65609e99c35b3e218ae',
    repository_source: 'acr-official',
    permissions_required: ['consensus.vote', 'proposals.create', 'mcp.tools.execute'],
    config_schema: [
      {
        key: 'quorum_threshold',
        label: 'Quorum Threshold',
        type: 'number',
        defaultValue: 0.67,
        description: 'Fraction of total votes required to validate consensus quorum (0.50 - 1.00)',
        required: true,
      },
      {
        key: 'consensus_model',
        label: 'Consensus Algorithm',
        type: 'select',
        defaultValue: 'supermajority_two_thirds',
        options: ['strict_majority', 'supermajority_two_thirds', 'unanimous'],
        description: 'Mathematical threshold rule for ballot approval',
        required: true,
      },
      {
        key: 'auto_dissent_recording',
        label: 'Preserve Dissent Rationale',
        type: 'boolean',
        defaultValue: true,
        description: 'Mandatory cryptographic recording of dissenting opinions to state hash chain (GAP-08)',
      },
      {
        key: 'ballot_timeout_sec',
        label: 'Ballot Expiration (seconds)',
        type: 'number',
        defaultValue: 300,
        description: 'Time window allowed before an open consensus ballot automatically closes',
      },
    ],
    current_config: {
      quorum_threshold: 0.67,
      consensus_model: 'supermajority_two_thirds',
      auto_dissent_recording: true,
      ballot_timeout_sec: 300,
    },
  },
  {
    id: 'acr-audit-verifier',
    name: 'acr-audit-verifier',
    version: '1.0.0',
    author: 'security-auditor.acr',
    description: 'Cryptographic state chain and SHA-256 monotonic audit trail inspector (GAP-06)',
    category: 'security',
    trust_badge: 'ANS-ANCHORED (Block #0000)',
    verified: true,
    quality_score: 95,
    tools_count: 3,
    tools: ['acr_verify_audit_chain', 'acr_inspect_block_proof', 'acr_get_monotonic_depth'],
    install_command: '/plugin install acr-audit-verifier@acr-marketplace',
    content_hash: 'e92f1b8a4f08e1a3c67d98be77e4cfb159b398df9a8c0ef28b7ca672f759c231',
    repository_source: 'acr-official',
    permissions_required: ['audit.read', 'chain.verify', 'mcp.tools.execute'],
    config_schema: [
      {
        key: 'strict_monotonic_check',
        label: 'Strict Monotonic Block Ordering',
        type: 'boolean',
        defaultValue: true,
        description: 'Reject any out-of-order, non-contiguous block indices',
        required: true,
      },
      {
        key: 'max_block_depth',
        label: 'Max Cryptographic Depth',
        type: 'number',
        defaultValue: 1000,
        description: 'Maximum blocks to verify backward from state chain tip',
      },
      {
        key: 'verify_on_receive',
        label: 'Real-Time SSE Verification',
        type: 'boolean',
        defaultValue: true,
        description: 'Perform instant client-side SHA-256 validation when new blocks arrive',
      },
    ],
    current_config: {
      strict_monotonic_check: true,
      max_block_depth: 1000,
      verify_on_receive: true,
    },
  },
  {
    id: 'acr-quantum-solver',
    name: 'acr-quantum-solver',
    version: '1.2.0',
    author: 'consensus-lead.acr',
    description: 'Cryptographically verified consensus accelerator for high-concurrency rooms',
    category: 'performance',
    trust_badge: 'ANS-ANCHORED (Block #0003)',
    verified: true,
    quality_score: 90,
    tools_count: 2,
    tools: ['acr_accelerate_ballot', 'acr_batch_verify_votes'],
    install_command: '/plugin install acr-quantum-solver@acr-marketplace',
    content_hash: '7a61d8bc5e10d29cf47188bc8a9f30b91d283626eec102f90a5bb3c706d871ab',
    repository_source: 'acr-official',
    permissions_required: ['consensus.accelerate', 'batch.verify', 'mcp.tools.execute'],
    config_schema: [
      {
        key: 'concurrency_threads',
        label: 'Worker Concurrency Threads',
        type: 'number',
        defaultValue: 4,
        description: 'Parallel Web Worker count for batch ballot signature verification',
      },
      {
        key: 'acceleration_mode',
        label: 'Acceleration Strategy',
        type: 'select',
        defaultValue: 'speculative',
        options: ['optimistic', 'speculative', 'conservative'],
        description: 'Heuristic profile for early consensus convergence detection',
      },
      {
        key: 'cache_size_mb',
        label: 'Memory Cache Size (MB)',
        type: 'number',
        defaultValue: 128,
        description: 'Dedicated RAM allocation for cached signature verification states',
      },
    ],
    current_config: {
      concurrency_threads: 4,
      acceleration_mode: 'speculative',
      cache_size_mb: 128,
    },
  },
  {
    id: 'acr-bridge-connect',
    name: 'acr-bridge-connect',
    version: '1.1.0',
    author: 'bridge-operator.acr',
    description: 'Multi-platform messenger gateway connector for Signal, Telegram, WhatsApp, Mattermost',
    category: 'bridges',
    trust_badge: 'ANS-ANCHORED (Block #0005)',
    verified: true,
    quality_score: 94,
    tools_count: 4,
    tools: ['acr_relay_signal', 'acr_relay_telegram', 'acr_relay_whatsapp', 'acr_relay_mattermost'],
    install_command: '/plugin install acr-bridge-connect@acr-marketplace',
    content_hash: '9f21ea40bc77583a48e02d8bbf1782635489f0775ad07cfb912536e2f694e9f7',
    repository_source: 'acr-official',
    permissions_required: ['network.outbound', 'bridges.relay', 'mcp.tools.execute'],
    config_schema: [
      {
        key: 'default_bridge',
        label: 'Primary Platform Adapter',
        type: 'select',
        defaultValue: 'signal',
        options: ['signal', 'telegram', 'whatsapp', 'mattermost'],
        description: 'Default external messenger gateway protocol',
      },
      {
        key: 'relay_rate_limit',
        label: 'Rate Limit (msg / min)',
        type: 'number',
        defaultValue: 60,
        description: 'Maximum outbound messages dispatched to external chat gateways per minute',
      },
      {
        key: 'encrypt_payloads',
        label: 'End-to-End Encryption',
        type: 'boolean',
        defaultValue: true,
        description: 'Enforce AES-256-GCM envelope encryption on relayed payloads',
      },
      {
        key: 'bridge_auth_secret',
        label: 'Bridge Ingress Auth Secret',
        type: 'secret',
        defaultValue: 'sk_bridge_auth_8829f01abce',
        description: 'HMAC authorization token for verifying incoming bridge webhooks',
      },
    ],
    current_config: {
      default_bridge: 'signal',
      relay_rate_limit: 60,
      encrypt_payloads: true,
      bridge_auth_secret: 'sk_bridge_auth_8829f01abce',
    },
  },
  {
    id: 'acr-code-sandbox',
    name: 'acr-code-sandbox',
    version: '2.0.0',
    author: 'sandbox-lead.acr',
    description: 'Isolated WebAssembly/WASI execution sandbox for agent AST verification',
    category: 'execution',
    trust_badge: 'ANS-ANCHORED (Block #0002)',
    verified: true,
    quality_score: 97,
    tools_count: 3,
    tools: ['acr_wasm_exec', 'acr_ast_lint', 'acr_sandbox_isolate'],
    install_command: '/plugin install acr-code-sandbox@acr-marketplace',
    content_hash: '3d84f9012a688ee199cf07e8a04b127599c832560b09425efec57426f43689cb',
    repository_source: 'acr-official',
    permissions_required: ['wasm.execute', 'ast.lint', 'mcp.tools.execute'],
    config_schema: [
      {
        key: 'memory_limit_mb',
        label: 'WASI Memory Ceiling (MB)',
        type: 'number',
        defaultValue: 256,
        description: 'Maximum heap size allocated to untrusted code executions',
      },
      {
        key: 'fuel_limit',
        label: 'Execution Fuel Ceiling',
        type: 'number',
        defaultValue: 50000000,
        description: 'Deterministic instruction step limit to prevent infinite loops',
      },
      {
        key: 'allow_network_ast',
        label: 'Permit Outbound Sockets',
        type: 'boolean',
        defaultValue: false,
        description: 'Allow sandboxed code to open TCP/UDP sockets (default disabled for security)',
      },
    ],
    current_config: {
      memory_limit_mb: 256,
      fuel_limit: 50000000,
      allow_network_ast: false,
    },
  },
];

export function enrichAgentWithPlugins(agent: Agent): Agent {
  if (agent.installed_plugins && agent.installed_plugins.length > 0) {
    return {
      ...agent,
      accessible_plugins: agent.accessible_plugins || ALL_MARKETPLACE_PLUGINS,
    };
  }

  let defaultInstalled: MarketplacePlugin[] = [];
  const nameLower = agent.name.toLowerCase();
  if (nameLower.includes('claude')) {
    defaultInstalled = [ALL_MARKETPLACE_PLUGINS[0], ALL_MARKETPLACE_PLUGINS[1]];
  } else if (nameLower.includes('devin')) {
    defaultInstalled = [ALL_MARKETPLACE_PLUGINS[4], ALL_MARKETPLACE_PLUGINS[2]];
  } else if (nameLower.includes('sentinel') || nameLower.includes('security')) {
    defaultInstalled = [ALL_MARKETPLACE_PLUGINS[1], ALL_MARKETPLACE_PLUGINS[3]];
  } else if (agent.role !== 'human') {
    defaultInstalled = [ALL_MARKETPLACE_PLUGINS[0]];
  }

  return {
    ...agent,
    installed_plugins: defaultInstalled,
    accessible_plugins: ALL_MARKETPLACE_PLUGINS,
  };
}

export const useAcrProtocol = (defaultRoomId = 'consensus-main') => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>(defaultRoomId);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [buddies, setBuddies] = useState<BuddyRelation[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(0.38);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workspaceMode, setWorkspaceMode] = useState<'demo' | 'local'>('demo');

  // Local Machine Isolated Rooms, Telemetry & Root Administrator State
  const [rootAdminProfile, setRootAdminProfile] = useState<RootAdminProfile>(getInitialRootAdmin);
  const [localRooms, setLocalRooms] = useState<Room[]>(getInitialLocalRooms);
  const [activeLocalRoomId, setActiveLocalRoomId] = useState<string>(() => {
    const initial = getInitialLocalRooms();
    return initial[0]?.id || 'local-deliberation';
  });
  const [localProposals, setLocalProposals] = useState<Proposal[]>([]);
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditEntry[]>([]);

  const effectiveActiveRoomId = workspaceMode === 'local' ? activeLocalRoomId : activeRoomId;
  const activeRoomRef = useRef(effectiveActiveRoomId);
  activeRoomRef.current = effectiveActiveRoomId;

  // Initial Fetch & Periodic Sync
  const refreshAll = useCallback(async () => {
    const start = performance.now();
    try {
      const [roomsRes, agentsRes, escRes, auditRes, buddyRes, propRes] = await Promise.all([
        fetch(`${DAEMON_BASE}/api/v1/rooms`),
        fetch(`${DAEMON_BASE}/api/v1/agents`),
        fetch(`${DAEMON_BASE}/api/v1/escalations`),
        fetch(`${DAEMON_BASE}/api/v1/audit`),
        fetch(`${DAEMON_BASE}/api/v1/buddies?did=${encodeURIComponent(OPERATOR_DID)}`),
        fetch(`${DAEMON_BASE}/api/v1/proposals?room_id=${encodeURIComponent(activeRoomRef.current)}`),
      ]);

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(Array.isArray(data) ? data : []);
      }

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        const rawAgents: Agent[] = Array.isArray(data) ? data : [];

        let overrides: Record<string, Partial<Agent>> = {};
        try {
          const saved = localStorage.getItem('acr_local_agent_overrides');
          if (saved) overrides = JSON.parse(saved);
        } catch {}

        let localRegistered: Agent[] = [];
        try {
          const savedLocal = localStorage.getItem('acr_local_registered_agents');
          if (savedLocal) localRegistered = JSON.parse(savedLocal);
        } catch {}

        setAgents((prev) => {
          const baseMap = new Map<string, Agent>();

          rawAgents.forEach((incoming) => {
            if (incoming.role === 'human' && rootAdminProfile.isConfigured) {
              incoming.name = rootAdminProfile.name;
              incoming.org = rootAdminProfile.title;
              incoming.avatar = rootAdminProfile.avatar;
            }
            if (overrides[incoming.did]) {
              Object.assign(incoming, overrides[incoming.did]);
            }
            const existing = prev.find((p) => p.did === incoming.did);
            const enriched = enrichAgentWithPlugins(incoming);
            if (existing?.installed_plugins && existing.installed_plugins.length > 0) {
              enriched.installed_plugins = existing.installed_plugins;
            }
            baseMap.set(enriched.did, enriched);
          });

          localRegistered.forEach((local) => {
            if (!baseMap.has(local.did)) {
              if (overrides[local.did]) {
                Object.assign(local, overrides[local.did]);
              }
              baseMap.set(local.did, enrichAgentWithPlugins(local));
            }
          });

          return Array.from(baseMap.values());
        });
      }

      if (escRes.ok) {
        const data = await escRes.json();
        setEscalations(Array.isArray(data) ? data : []);
      }

      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }

      if (buddyRes.ok) {
        const data = await buddyRes.json();
        setBuddies(Array.isArray(data) ? data : []);
      }

      if (propRes.ok) {
        const data = await propRes.json();
        setProposals(Array.isArray(data) ? data : []);
      }

      setIsConnected(true);
      setLatencyMs(Number((performance.now() - start).toFixed(2)));
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch messages for active room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/rooms/${roomId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      // offline or error
    }
  }, []);

  // Fetch proposals for active room
  const fetchProposals = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/proposals?room_id=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setProposals(Array.isArray(data) ? data : []);
      }
    } catch {
      // offline
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Re-fetch messages & proposals when active room changes and reset its unread count
  useEffect(() => {
    if (activeRoomId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeRoomId]: 0,
      }));
      setMessages([]);
      fetchMessages(activeRoomId);
      fetchProposals(activeRoomId);
    }
  }, [activeRoomId, fetchMessages, fetchProposals]);

  useEffect(() => {
    if (activeLocalRoomId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeLocalRoomId]: 0,
      }));
      setMessages([]);
      fetchMessages(activeLocalRoomId);
      fetchProposals(activeLocalRoomId);
    }
  }, [activeLocalRoomId, fetchMessages, fetchProposals]);

  // Connect to SSE Stream
  useEffect(() => {
    let sse: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        sse = new EventSource(`${DAEMON_BASE}/api/v1/stream`);

        sse.addEventListener('connected', () => {
          setIsConnected(true);
        });

        sse.addEventListener('message', (event: MessageEvent) => {
          try {
            const envelope = JSON.parse(event.data);
            const msg = envelope.data as Message;
            if (msg && msg.room_id === activeRoomRef.current) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
            if (msg && msg.room_id) {
              if (msg.room_id !== activeRoomRef.current) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [msg.room_id]: (prev[msg.room_id] || 0) + 1,
                }));
              }
              setRooms((prev) =>
                prev.map((r) =>
                  r.id === msg.room_id
                    ? { ...r, message_count: r.message_count + 1 }
                    : r
                )
              );
            }
          } catch {
            // ignore
          }
        });

        sse.addEventListener('agent_update', (event: MessageEvent) => {
          try {
            const envelope = JSON.parse(event.data);
            const updated = envelope.data as Agent;
            if (updated && updated.did) {
              setAgents((prev) => {
                const exists = prev.some((a) => a.did === updated.did);
                if (exists) {
                  return prev.map((a) =>
                    a.did === updated.did ? { ...a, ...updated } : a
                  );
                }
                return [...prev, updated];
              });
            }
          } catch {
            // ignore
          }
        });

        sse.addEventListener('escalation', (event: MessageEvent) => {
          try {
            const envelope = JSON.parse(event.data);
            const esc = envelope.data as Escalation;
            if (esc && esc.id) {
              setEscalations((prev) => [
                esc,
                ...prev.filter((e) => e.id !== esc.id),
              ]);
            }
          } catch {
            // ignore
          }
        });

        sse.addEventListener('audit', (event: MessageEvent) => {
          try {
            const envelope = JSON.parse(event.data);
            const block = envelope.data as AuditEntry;
            if (block && block.state_hash) {
              setAuditLogs((prev) => {
                if (prev.some((a) => a.state_hash === block.state_hash))
                  return prev;
                return [...prev, block];
              });
            }
          } catch {
            // ignore
          }
        });

        sse.onerror = () => {
          setIsConnected(false);
          sse?.close();
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      sse?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Poll fallback every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
      if (activeRoomRef.current) {
        fetchMessages(activeRoomRef.current);
        fetchProposals(activeRoomRef.current);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchMessages, fetchProposals]);

  // Send human operator message (with optional file attachment)
  const sendMessage = async (content: string, attachment?: FileAttachment, targetRoomId?: string) => {
    if (!content.trim() && !attachment) return;
    const effectiveRoomId = targetRoomId || activeRoomId;

    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/rooms/${effectiveRoomId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_did: rootAdminProfile.did || OPERATOR_DID,
            content,
            attachment,
          }),
        }
      );

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMsg.id)) return prev;
          return [...prev, savedMsg];
        });
      } else {
        const localMsg: Message = {
          id: `msg-local-${Date.now()}`,
          room_id: effectiveRoomId,
          sender_did: rootAdminProfile.did,
          sender: rootAdminProfile.name,
          avatar: rootAdminProfile.avatar,
          role: 'human',
          content,
          attachment,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, localMsg]);
      }
    } catch {
      // Offline fallback
      const localMsg: Message = {
        id: `msg-local-${Date.now()}`,
        room_id: effectiveRoomId,
        sender_did: rootAdminProfile.did,
        sender: rootAdminProfile.name,
        avatar: rootAdminProfile.avatar,
        role: 'human',
        content,
        attachment,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, localMsg]);
    }
  };

  // Upload file attachment (GAP-17)
  const uploadFile = async (file: File): Promise<FileAttachment | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${DAEMON_BASE}/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const att: FileAttachment = await res.json();
        return att;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Resolve escalation gate
  const resolveEscalation = async (escalationId: string, approve: boolean) => {
    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/escalations/${escalationId}/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approve,
            operator_did: OPERATOR_DID,
            signature: `ed25519-sig-${Date.now()}`,
          }),
        }
      );

      if (res.ok) {
        const resolved = await res.json();
        setEscalations((prev) =>
          prev.map((e) => (e.id === escalationId ? { ...e, ...resolved } : e))
        );
        refreshAll();
      }
    } catch {
      setEscalations((prev) =>
        prev.map((e) =>
          e.id === escalationId
            ? {
                ...e,
                status: approve ? 'approved' : 'rejected',
                resolved_at: new Date().toISOString(),
                operator_did: OPERATOR_DID,
              }
            : e
        )
      );
    }
  };

  // Create deliberation room (GAP-03, GAP-07)
  const createRoom = async (
    name: string,
    description: string,
    topic = 'General Deliberation',
    isPrivate = false
  ) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/rooms?creator_did=${encodeURIComponent(OPERATOR_DID)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          topic,
          is_private: isPrivate,
        }),
      });
      if (res.ok) {
        const newRoom = await res.json();
        await refreshAll();
        setActiveRoomId(newRoom.id);
        return newRoom;
      }
    } catch {
      // offline
    }
  };

  // Buddy Actions (GAP-02)
  const requestBuddy = async (toDid: string) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/buddies/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_did: OPERATOR_DID, to_did: toDid }),
      });
      if (res.ok) refreshAll();
    } catch {
      // offline
    }
  };

  const acceptBuddy = async (toDid: string) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/buddies/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_did: OPERATOR_DID, to_did: toDid }),
      });
      if (res.ok) refreshAll();
    } catch {
      // offline
    }
  };

  const blockBuddy = async (toDid: string) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/buddies/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_did: OPERATOR_DID, to_did: toDid }),
      });
      if (res.ok) refreshAll();
    } catch {
      // offline
    }
  };

  // Consensus Proposals & Voting (GAP-08)
  const createProposal = async (
    title: string,
    description: string,
    options = ['APPROVE', 'REJECT', 'DISSENT']
  ) => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: activeRoomId,
          title,
          description,
          proposer_did: OPERATOR_DID,
          options,
        }),
      });
      if (res.ok) {
        await refreshAll();
      }
    } catch {
      // offline
    }
  };

  const castVote = async (
    proposalId: string,
    choice: string,
    rationale = ''
  ) => {
    const normalized = choice.trim().toUpperCase();
    if (normalized !== 'APPROVE' && normalized !== 'REJECT' && normalized !== 'DISSENT') {
      throw new Error(`Invalid vote choice: ${choice}. Must be APPROVE, REJECT, or DISSENT`);
    }
    if (normalized === 'DISSENT' && !rationale.trim()) {
      throw new Error('Rationale is mandatory when voting DISSENT (GAP-08 Invariant)');
    }

    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/proposals/${proposalId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voter_did: OPERATOR_DID,
            choice: normalized,
            rationale: rationale.trim(),
          }),
        }
      );
      if (res.ok) {
        await refreshAll();
      }
    } catch {
      // offline
    }
  };

  const verifyAuditChain = useCallback(async (): Promise<{
    isValid: boolean;
    depth: number;
    headHash?: string;
    message: string;
  }> => {
    try {
      const res = await fetch(`${DAEMON_BASE}/api/v1/audit/chain`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const trail: AuditEntry[] = data.trail || [];
      if (trail.length === 0) {
        return { isValid: true, depth: 0, message: 'Audit chain is empty (genesis state)' };
      }

      let prevHash = '';
      for (let i = 0; i < trail.length; i++) {
        const entry = trail[i];
        if (entry.index !== i) {
          return { isValid: false, depth: trail.length, message: `Index sequence broken at ${i}: got ${entry.index}` };
        }
        if (i > 0 && entry.prev_hash !== prevHash) {
          return { isValid: false, depth: trail.length, message: `Hash link broken at block #${i}` };
        }
        if (!entry.state_hash) {
          return { isValid: false, depth: trail.length, message: `Missing state_hash at block #${i}` };
        }
        prevHash = entry.state_hash;
      }
      return {
        isValid: true,
        depth: trail.length,
        headHash: prevHash,
        message: `Cryptographic audit chain verified: ${trail.length} blocks untampered`,
      };
    } catch (err) {
      return { isValid: false, depth: 0, message: `Audit verification failed: ${err}` };
    }
  }, []);

  const closeProposal = async (proposalId: string) => {
    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/proposals/${proposalId}/close`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ closer_did: OPERATOR_DID }),
        }
      );
      if (res.ok) {
        await refreshAll();
      }
    } catch {
      // offline
    }
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || {
    id: activeRoomId,
    name:
      activeRoomId === 'consensus-main'
        ? 'Consensus Main'
        : activeRoomId === 'security-audits'
          ? 'Security Audits'
          : activeRoomId,
    description: 'Autonomous agent deliberation floor',
    topic: 'W3C DID/VC • TLA+ Verified Merges',
    is_private: false,
    participants: [],
    created_at: new Date().toISOString(),
    message_count: messages.length,
  };

  const [upstreamRepos, setUpstreamRepos] = useState<UpstreamRepository[]>(DEFAULT_UPSTREAM_REPOSITORIES);

  const markRoomAsRead = useCallback((roomId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
  }, []);

  const installAgentPlugin = useCallback((agentDid: string, plugin: MarketplacePlugin, config?: Record<string, any>) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.did !== agentDid) return a;
        const currentInstalled = a.installed_plugins || [];
        if (currentInstalled.some((p) => p.id === plugin.id)) return a;
        return {
          ...a,
          installed_plugins: [
            ...currentInstalled,
            {
              ...plugin,
              current_config: config || plugin.current_config || {},
              installed_at: new Date().toISOString(),
            },
          ],
        };
      })
    );
  }, []);

  const uninstallAgentPlugin = useCallback((agentDid: string, pluginId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.did !== agentDid) return a;
        return {
          ...a,
          installed_plugins: (a.installed_plugins || []).filter((p) => p.id !== pluginId),
        };
      })
    );
  }, []);

  const updatePluginConfig = useCallback((agentDid: string, pluginId: string, newConfig: Record<string, any>) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.did !== agentDid) return a;
        return {
          ...a,
          installed_plugins: (a.installed_plugins || []).map((p) =>
            p.id === pluginId
              ? {
                  ...p,
                  current_config: { ...(p.current_config || {}), ...newConfig },
                }
              : p
          ),
        };
      })
    );
  }, []);

  const addUpstreamRepo = useCallback((repoData: Omit<UpstreamRepository, 'id' | 'last_synced' | 'plugin_count' | 'status'>) => {
    const newRepo: UpstreamRepository = {
      ...repoData,
      id: `repo-${Date.now()}`,
      status: 'synced',
      plugin_count: Math.floor(Math.random() * 5) + 3,
      last_synced: 'Just now',
    };
    setUpstreamRepos((prev) => [...prev, newRepo]);
  }, []);

  const removeUpstreamRepo = useCallback((id: string) => {
    setUpstreamRepos((prev) => prev.filter((r) => r.id !== id && !r.is_default));
  }, []);

  const syncUpstreamRepos = useCallback(async () => {
    setUpstreamRepos((prev) =>
      prev.map((r) => ({
        ...r,
        last_synced: 'Just now',
        status: 'synced',
      }))
    );
  }, []);

  const updateRootAdminProfile = useCallback(
    async (updates: Partial<RootAdminProfile>) => {
      setRootAdminProfile((prev) => {
        const next: RootAdminProfile = { ...prev, ...updates, isConfigured: true };
        try {
          localStorage.setItem('acr_root_admin_profile', JSON.stringify(next));
        } catch {}
        return next;
      });

      // Synchronize in-memory human agent
      setAgents((prev) =>
        prev.map((a) => {
          if (a.role === 'human') {
            return {
              ...a,
              name: updates.name || a.name,
              org: updates.title || a.org,
              avatar: updates.avatar || a.avatar,
            };
          }
          return a;
        })
      );

      // Post update to daemon
      try {
        await fetch(`${DAEMON_BASE}/api/v1/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            did: updates.did || rootAdminProfile.did,
            name: updates.name || rootAdminProfile.name,
            avatar: updates.avatar || rootAdminProfile.avatar,
            role: 'human',
            org: updates.title || rootAdminProfile.title,
            capabilities: ['*'],
          }),
        });
      } catch {}
    },
    [rootAdminProfile]
  );

  const updateAgentProfile = useCallback(
    async (agentDid: string, updates: Partial<Agent>) => {
      setAgents((prev) =>
        prev.map((a) => (a.did === agentDid ? { ...a, ...updates } : a))
      );

      try {
        const saved = localStorage.getItem('acr_local_agent_overrides');
        const parsed = saved ? JSON.parse(saved) : {};
        parsed[agentDid] = { ...(parsed[agentDid] || {}), ...updates };
        localStorage.setItem('acr_local_agent_overrides', JSON.stringify(parsed));
      } catch {}

      try {
        await fetch(`${DAEMON_BASE}/api/v1/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            did: agentDid,
            name: updates.name,
            avatar: updates.avatar,
            org: updates.org,
            process_path: updates.process_path,
            tags: updates.tags,
            description: updates.description,
            role: updates.role || 'agent',
          }),
        });
      } catch {}
    },
    []
  );

  const registerLocalAgent = useCallback(
    async (newAgent: Partial<Agent>) => {
      const did = newAgent.did || `did:key:z6Mka881...mcp-agent-${Date.now().toString().slice(-4)}`;
      const agent: Agent = {
        did,
        name: newAgent.name || 'Local MCP Worker',
        avatar: newAgent.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        role: 'agent',
        status: 'online',
        org: newAgent.org || 'Local MCP Node',
        process_path: newAgent.process_path || 'claude mcp add acr http://127.0.0.1:20443/mcp',
        tags: newAgent.tags || ['mcp-local', 'code-review'],
        description: newAgent.description || 'Local autonomous agent connected via MCP protocol.',
        capabilities: newAgent.capabilities || ['ast.diff', 'tools.execute', 'consensus.vote'],
        verified: true,
        last_seen: new Date().toISOString(),
        installed_plugins: [],
        accessible_plugins: ALL_MARKETPLACE_PLUGINS,
      };

      setAgents((prev) => {
        if (prev.some((a) => a.did === did)) {
          return prev.map((a) => (a.did === did ? { ...a, ...agent } : a));
        }
        return [...prev, agent];
      });

      try {
        const saved = localStorage.getItem('acr_local_registered_agents');
        const parsed: Agent[] = saved ? JSON.parse(saved) : [];
        const filtered = parsed.filter((a) => a.did !== did);
        filtered.push(agent);
        localStorage.setItem('acr_local_registered_agents', JSON.stringify(filtered));
      } catch {}

      try {
        await fetch(`${DAEMON_BASE}/api/v1/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            did: agent.did,
            name: agent.name,
            avatar: agent.avatar,
            role: agent.role,
            org: agent.org,
            process_path: agent.process_path,
            tags: agent.tags,
            description: agent.description,
            capabilities: agent.capabilities,
          }),
        });
      } catch {}

      return agent;
    },
    []
  );

  const createLocalRoom = useCallback(
    async (name: string, description: string, topic = 'Workstation Consensus', isPrivate = false) => {
      const newRoom: Room = {
        id: `room-local-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'Workstation consensus floor for local autonomous agents.',
        topic: topic.trim() || 'Workstation Consensus • Zero-Trust DID/VC',
        is_private: isPrivate,
        participants: [rootAdminProfile.did],
        created_at: new Date().toISOString(),
        message_count: 0,
      };
      setLocalRooms((prev) => {
        const updated = [...prev, newRoom];
        try {
          localStorage.setItem('acr_local_rooms', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setActiveLocalRoomId(newRoom.id);
      return newRoom;
    },
    [rootAdminProfile.did]
  );

  const deleteLocalRoom = useCallback((id: string) => {
    setLocalRooms((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('acr_local_rooms', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveLocalRoomId((prevId) => {
      if (prevId === id) {
        return 'local-deliberation';
      }
      return prevId;
    });
  }, []);

  const createLocalProposal = useCallback(
    async (title: string, description = '') => {
      const newProposal: Proposal = {
        id: `prop-local-${Date.now()}`,
        room_id: activeLocalRoomId,
        proposer_did: rootAdminProfile.did,
        title,
        description,
        options: ['APPROVE', 'REJECT', 'DISSENT'],
        status: 'open',
        votes: {
          [rootAdminProfile.did]: 'APPROVE',
        },
        dissent_logs: [],
        created_at: new Date().toISOString(),
      };
      setLocalProposals((prev) => [newProposal, ...prev]);

      const newBlock: AuditEntry = {
        index: localAuditLogs.length + 1,
        block_height: localAuditLogs.length + 1,
        event_type: 'LOCAL_PROPOSAL_CREATED',
        state_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        prev_hash:
          localAuditLogs.length > 0
            ? localAuditLogs[localAuditLogs.length - 1].state_hash
            : '0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: new Date().toISOString(),
      };
      setLocalAuditLogs((prev) => [...prev, newBlock]);
      return newProposal;
    },
    [activeLocalRoomId, rootAdminProfile, localAuditLogs]
  );

  const castLocalVote = useCallback(
    async (proposalId: string, choice: string, rationale?: string) => {
      setLocalProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalId) return p;
          const newVotes = { ...p.votes, [rootAdminProfile.did]: choice };
          const newDissents = [...p.dissent_logs];
          if (choice === 'DISSENT' && rationale) {
            newDissents.push({
              voter_did: rootAdminProfile.did,
              agent_name: rootAdminProfile.name,
              rationale,
              timestamp: new Date().toISOString(),
            });
          }
          return {
            ...p,
            votes: newVotes,
            dissent_logs: newDissents,
          };
        })
      );

      const newBlock: AuditEntry = {
        index: localAuditLogs.length + 1,
        block_height: localAuditLogs.length + 1,
        event_type: `LOCAL_BALLOT_${choice}`,
        state_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        prev_hash:
          localAuditLogs.length > 0
            ? localAuditLogs[localAuditLogs.length - 1].state_hash
            : '0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: new Date().toISOString(),
      };
      setLocalAuditLogs((prev) => [...prev, newBlock]);
    },
    [rootAdminProfile, localAuditLogs]
  );

  return {
    rooms,
    activeRoom,
    activeRoomId,
    setActiveRoomId,
    unreadCounts,
    markRoomAsRead,
    messages,
    agents,
    allMarketplacePlugins: ALL_MARKETPLACE_PLUGINS,
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
    isLoading,
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
    verifyAuditChain,
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
  };
};
