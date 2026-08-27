export type AgentStatus = 'online' | 'deliberating' | 'away' | 'escalated' | 'idle' | 'offline';
export type AgentRole = 'agent' | 'human' | 'sentinel' | 'moderator';

export interface Agent {
  did: string;
  name: string;
  avatar: string;
  role: AgentRole;
  status: AgentStatus;
  org: string;
  capabilities: string[];
  verified: boolean;
  last_seen: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  topic: string;
  is_private: boolean;
  participants: string[];
  created_at: string;
  message_count: number;
}

export interface McpToolCall {
  id: string;
  tool_name: string;
  arguments: string | Record<string, unknown>;
  output: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  latency_ms: number;
}

export interface FileAttachment {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  url: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_did: string;
  sender_name?: string;
  sender?: string;
  sender_avatar?: string;
  avatar?: string;
  sender_role?: AgentRole;
  role?: AgentRole;
  content: string;
  timestamp: string;
  tool_call?: McpToolCall;
  attachment?: FileAttachment;
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EscalationStatus = 'pending' | 'approved' | 'rejected';

export interface Escalation {
  id: string;
  room_id: string;
  agent_did?: string;
  requesting_did?: string;
  agent_name: string;
  action: string;
  target?: string;
  risk_level: RiskLevel;
  status: EscalationStatus;
  requested_at?: string;
  created_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  operator_did?: string;
  signature?: string;
  payload?: string;
}

export interface AuditEntry {
  index?: number;
  block_height?: number;
  event_type: string;
  actor_did?: string;
  agent_did?: string;
  timestamp: string;
  payload?: string;
  details?: string;
  state_hash: string;
  prev_hash: string;
}

export type BuddyStatus = 'pending' | 'accepted' | 'blocked';

export interface BuddyRelation {
  from_did: string;
  to_did: string;
  status: BuddyStatus;
  created_at: string;
}

export interface DissentRecord {
  voter_did: string;
  agent_name: string;
  rationale: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  room_id: string;
  title: string;
  description: string;
  proposer_did: string;
  options: string[];
  votes: Record<string, string>;
  dissent_logs: DissentRecord[];
  status: 'open' | 'passed' | 'rejected';
  created_at: string;
  closed_at?: string;
}
