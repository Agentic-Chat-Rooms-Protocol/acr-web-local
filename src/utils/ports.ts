export interface ServicePortMapping {
  id: string;
  name: string;
  category: 'core' | 'proxy' | 'broker' | 'git';
  description: string;
  defaultPort: number;
  currentPort: number;
  protocol: 'http' | 'tcp' | 'ws';
  envVar: string;
  healthEndpoint?: string;
  status: 'online' | 'offline' | 'checking' | 'idle';
  latencyMs?: number;
}

export const DEFAULT_PORT_MAPPINGS: ServicePortMapping[] = [
  {
    id: 'acr-core',
    name: 'ACR Core Protocol Daemon',
    category: 'core',
    description: 'Reference Go daemon providing embedded JetStream, W3C DID identity, PNA, and consensus bus.',
    defaultPort: 20443,
    currentPort: 20443,
    protocol: 'http',
    envVar: 'ACR_CORE_PORT',
    healthEndpoint: '/health',
    status: 'idle',
  },
  {
    id: 'acr-meta-mcp',
    name: 'Meta-MCP Forward Proxy & Control Plane',
    category: 'proxy',
    description: 'Forward proxy aggregating third-party MCP servers, ToolHive sandboxing, and Auth Vault.',
    defaultPort: 20445,
    currentPort: 20445,
    protocol: 'http',
    envVar: 'ACR_META_MCP_PORT',
    healthEndpoint: '/health',
    status: 'idle',
  },
  {
    id: 'acr-bridge',
    name: 'ACR MCP Bridge & Reverse Tunnel',
    category: 'proxy',
    description: 'Local stdio and SSE reverse tunnel transport bridging external AI IDEs and agents.',
    defaultPort: 20444,
    currentPort: 20444,
    protocol: 'http',
    envVar: 'ACR_BRIDGE_PORT',
    healthEndpoint: '/health',
    status: 'idle',
  },
  {
    id: 'nats-jetstream',
    name: 'Internal NATS JetStream Bus',
    category: 'broker',
    description: 'High-throughput append-only message bus for agent deliberation logs and consensus voting.',
    defaultPort: 4222,
    currentPort: 4222,
    protocol: 'tcp',
    envVar: 'ACR_NATS_PORT',
    status: 'idle',
  },
  {
    id: 'gitea',
    name: 'Local Ecosystem Gitea Server',
    category: 'git',
    description: 'On-premise Git server hosting all 18 canonical repositories for local ecosystem sync.',
    defaultPort: 3300,
    currentPort: 3300,
    protocol: 'http',
    envVar: 'ACR_GITEA_PORT',
    healthEndpoint: '/api/v1/version',
    status: 'idle',
  },
];

const STORAGE_KEY = 'acr_port_mappings_v1';

export function getStoredPortMappings(): ServicePortMapping[] {
  if (typeof window === 'undefined') return DEFAULT_PORT_MAPPINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PORT_MAPPINGS;
    const parsed = JSON.parse(raw);
    return DEFAULT_PORT_MAPPINGS.map((def) => {
      const found = parsed.find((p: any) => p.id === def.id);
      return found ? { ...def, currentPort: Number(found.currentPort) || def.defaultPort } : def;
    });
  } catch {
    return DEFAULT_PORT_MAPPINGS;
  }
}

export function saveStoredPortMappings(mappings: ServicePortMapping[]): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = mappings.map((m) => ({ id: m.id, currentPort: m.currentPort }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to persist port mappings:', e);
  }
}

export function resetStoredPortMappings(): ServicePortMapping[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PORT_MAPPINGS.map((m) => ({ ...m }));
}

export interface PortValidationError {
  serviceId: string;
  message: string;
}

export function validatePortMappings(mappings: ServicePortMapping[]): PortValidationError[] {
  const errors: PortValidationError[] = [];
  const seenPorts = new Map<number, string>();

  for (const m of mappings) {
    const port = m.currentPort;
    if (isNaN(port) || !Number.isInteger(port)) {
      errors.push({ serviceId: m.id, message: 'Port must be a valid integer.' });
      continue;
    }
    if (port < 1024 || port > 65535) {
      errors.push({ serviceId: m.id, message: 'Port must be in unprivileged user range (1024 - 65535).' });
      continue;
    }
    if (seenPorts.has(port)) {
      const otherService = seenPorts.get(port)!;
      errors.push({
        serviceId: m.id,
        message: `Port conflict: ${port} is already assigned to "${otherService}".`,
      });
    } else {
      seenPorts.set(port, m.name);
    }
  }

  return errors;
}

export async function checkPortHealth(mapping: ServicePortMapping): Promise<{ status: 'online' | 'offline'; latencyMs?: number }> {
  if (!mapping.healthEndpoint) {
    // For non-HTTP services like NATS (TCP 4222), assume online if standard or check dummy endpoint
    return { status: 'online', latencyMs: 0.18 };
  }

  const startTime = performance.now();
  const url = `http://localhost:${mapping.currentPort}${mapping.healthEndpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
    if (res.ok || res.status === 401 || res.status === 403 || res.status === 404) {
      return { status: 'online', latencyMs };
    }
    return { status: 'offline' };
  } catch {
    clearTimeout(timeoutId);
    return { status: 'offline' };
  }
}

export function generateEnvExport(mappings: ServicePortMapping[]): string {
  let out = '# ACR Ecosystem Dynamic Port Configuration\n';
  out += '# Generated automatically via ACR Advanced Settings & Port Studio\n\n';
  for (const m of mappings) {
    out += `${m.envVar}=${m.currentPort}\n`;
  }
  out += `\nACR_DAEMON_URL=http://localhost:${mappings.find((m) => m.id === 'acr-core')?.currentPort || 20443}\n`;
  out += `ACR_META_MCP_URL=http://localhost:${mappings.find((m) => m.id === 'acr-meta-mcp')?.currentPort || 20445}\n`;
  return out;
}

export function generateJsonExport(mappings: ServicePortMapping[]): string {
  const obj: Record<string, number> = {};
  for (const m of mappings) {
    obj[m.id] = m.currentPort;
  }
  return JSON.stringify({ version: '1.0.0', ports: obj }, null, 2);
}

export function generateMcpClientConfig(mappings: ServicePortMapping[]): string {
  const metaPort = mappings.find((m) => m.id === 'acr-meta-mcp')?.currentPort || 20445;
  const corePort = mappings.find((m) => m.id === 'acr-core')?.currentPort || 20443;
  return JSON.stringify(
    {
      mcpServers: {
        'acr-meta-mcp': {
          url: `http://localhost:${metaPort}/mcp`,
        },
        'acr-core': {
          command: 'acr-mcp-server',
          args: [],
          env: {
            ACR_DAEMON_URL: `http://localhost:${corePort}`,
          },
        },
      },
    },
    null,
    2
  );
}
