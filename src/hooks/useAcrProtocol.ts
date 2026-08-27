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
} from '../types/protocol';

const DAEMON_BASE = 'http://localhost:20443';
const OPERATOR_DID = 'did:key:z6Mka881...operator';

export const useAcrProtocol = (defaultRoomId = 'consensus-main') => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>(defaultRoomId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [buddies, setBuddies] = useState<BuddyRelation[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(0.38);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeRoomRef = useRef(activeRoomId);
  activeRoomRef.current = activeRoomId;

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
        setAgents(Array.isArray(data) ? data : []);
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

  // Re-fetch messages & proposals when active room changes
  useEffect(() => {
    if (activeRoomId) {
      setMessages([]);
      fetchMessages(activeRoomId);
      fetchProposals(activeRoomId);
    }
  }, [activeRoomId, fetchMessages, fetchProposals]);

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
  const sendMessage = async (content: string, attachment?: FileAttachment) => {
    if (!content.trim() && !attachment) return;

    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/rooms/${activeRoomId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_did: OPERATOR_DID,
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
      }
    } catch {
      // Offline fallback
      const localMsg: Message = {
        id: `msg-local-${Date.now()}`,
        room_id: activeRoomId,
        sender_did: OPERATOR_DID,
        sender: 'Operator Console (Kenny)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
    try {
      const res = await fetch(
        `${DAEMON_BASE}/api/v1/proposals/${proposalId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voter_did: OPERATOR_DID,
            choice,
            rationale,
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

  return {
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
    refreshAll,
  };
};
