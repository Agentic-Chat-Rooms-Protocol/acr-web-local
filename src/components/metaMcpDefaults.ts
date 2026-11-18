export interface RegisteredServer {
  id: string;
  displayName: string;
  transport: 'stdio' | 'sse' | 'streamable_http';
  healthStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ERROR';
  enabled: boolean;
  quarantined: boolean;
  trustLevel: 'untrusted' | 'verified' | 'internal';
  sandboxProfile: string;
  manifestFingerprint?: string;
  toolCount: number;
}

export interface McpTool {
  name: string;
  originalName: string;
  serverId: string;
  description: string;
  sandboxProfile?: string;
  inputSchema: {
    type: string;
    properties?: Record<
      string,
      {
        type: string;
        description?: string;
        enum?: string[];
        default?: unknown;
      }
    >;
    required?: string[];
  };
  samplePayload?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  actorDid: string;
  serverId?: string;
  toolName?: string;
  status: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

export const DEFAULT_SERVERS: RegisteredServer[] = [
  {
    id: 'workspace-fs',
    displayName: 'Local Workstation FS Sandbox',
    transport: 'stdio',
    healthStatus: 'ONLINE',
    enabled: true,
    quarantined: false,
    trustLevel: 'internal',
    sandboxProfile: 'workspace-scoped',
    manifestFingerprint: '8910293810293810293810293810293810293810293810293810293810293810',
    toolCount: 2,
  },
  {
    id: 'git-forge',
    displayName: 'Local Git Forge Protocol Proxy',
    transport: 'streamable_http',
    healthStatus: 'ONLINE',
    enabled: true,
    quarantined: false,
    trustLevel: 'verified',
    sandboxProfile: 'egress-allowlist',
    manifestFingerprint: 'f3a9e218c50d4b99812604812304910293810293810293810293810293810293',
    toolCount: 2,
  },
  {
    id: 'github-bot',
    displayName: 'GitHub Repository Ops',
    transport: 'stdio',
    healthStatus: 'ONLINE',
    enabled: true,
    quarantined: false,
    trustLevel: 'untrusted',
    sandboxProfile: 'no-network',
    manifestFingerprint: '1029381029381029381029381029381029381029381029381029381029381029',
    toolCount: 1,
  },
];

export const DEFAULT_TOOLS: McpTool[] = [
  {
    name: 'workspace-fs__list_workspace_dir',
    originalName: 'list_workspace_dir',
    serverId: 'workspace-fs',
    description: 'List files and directories within strictly contained workspace boundary.',
    sandboxProfile: 'workspace-scoped',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path within workspace root' },
      },
    },
    samplePayload: {
      title: 'Protocol consensus test via Meta-MCP',
    },
  },
  {
    name: 'workspace-fs__read_workspace_file',
    originalName: 'read_workspace_file',
    serverId: 'workspace-fs',
    description: 'Read file safely with sandboxed path normalization & traversal guards.',
    sandboxProfile: 'workspace-scoped',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path to file' },
      },
      required: ['path'],
    },
    samplePayload: {
      path: 'package.json',
    },
  },
  {
    name: 'git-forge__create_issue',
    originalName: 'create_issue',
    serverId: 'git-forge',
    description: 'Create a new issue on target local Git forge repository under egress containment.',
    sandboxProfile: 'egress-allowlist',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the issue' },
        body: { type: 'string', description: 'Detailed markdown description' },
      },
      required: ['title'],
    },
    samplePayload: {
      title: 'Protocol consensus test via Meta-MCP',
      body: 'Verified under ToolHive Micro-Sandboxing policy',
    },
  },
  {
    name: 'git-forge__list_pull_requests',
    originalName: 'list_pull_requests',
    serverId: 'git-forge',
    description: 'List open pull requests with AST line diff summaries.',
    sandboxProfile: 'egress-allowlist',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          description: 'PR state filter (open, closed, merged)',
          enum: ['open', 'closed', 'merged'],
        },
      },
    },
    samplePayload: {
      state: 'open',
    },
  },
  {
    name: 'github-bot__sync_upstream',
    originalName: 'sync_upstream',
    serverId: 'github-bot',
    description: 'Trigger dry-run synchronization between upstream master and local mirrors.',
    sandboxProfile: 'no-network',
    inputSchema: {
      type: 'object',
      properties: {
        dryRun: { type: 'boolean', description: 'Simulation mode without modifying remotes' },
      },
    },
    samplePayload: {
      dryRun: true,
    },
  },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-18T14:15:30.120Z',
    eventType: 'TOOL_CALL',
    actorDid: 'did:key:z6MkhaXgBZDvotDkL5257faiz48Z8G282GQYDpxDEL5FT6mB',
    serverId: 'workspace-fs',
    toolName: 'workspace-fs__list_workspace_dir',
    status: 'SUCCESS',
    latencyMs: 0.28,
    details: { sandbox: 'ToolHive Micro-Sandbox', path: '.' },
  },
  {
    id: 'log-2',
    timestamp: '2026-11-18T14:14:02.842Z',
    eventType: 'POLICY_EVAL',
    actorDid: 'did:key:z6MkhaXgBZDvotDkL5257faiz48Z8G282GQYDpxDEL5FT6mB',
    serverId: 'git-forge',
    status: 'SUCCESS',
    latencyMs: 0.12,
    details: { allowlistMatched: true, egressDomain: '127.0.0.1' },
  },
  {
    id: 'log-3',
    timestamp: '2026-11-18T14:12:44.015Z',
    eventType: 'MANIFEST_COMPILE',
    actorDid: 'did:key:z6Mks7Lz8g...system',
    serverId: 'workspace-fs',
    status: 'SUCCESS',
    latencyMs: 1.45,
    details: { toolsExtracted: 2, sha256: '89102938...' },
  },
];

export const DEFAULT_IMPORT_SAMPLE = `{
  "mcpServers": {
    "local-python-kernel": {
      "command": "python",
      "args": ["-m", "mcp_server_py"],
      "env": {
        "CONTAINER_ISOLATION": "true"
      }
    },
    "local-forge-bridge": {
      "url": "http://127.0.0.1:20445/mcp",
      "transport": "sse",
      "authHeader": "Bearer vault:local_forge_token"
    }
  }
}`;
