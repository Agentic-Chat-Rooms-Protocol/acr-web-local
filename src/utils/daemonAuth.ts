import { getStoredPortMappings } from './ports';

export const DEFAULT_DAEMON_HOST = '127.0.0.1';
export const DEFAULT_DAEMON_PORT = 20443;
export const DEFAULT_META_MCP_PORT = 20445;

const TOKEN_SESSION_KEY = 'acr_api_token';
const TOKEN_PERSIST_KEY = 'acr_api_token_persisted';

export const DAEMON_TOKEN_CHANGED_EVENT = 'acr-daemon-token-changed';
export const DAEMON_PORTS_CHANGED_EVENT = 'acr-daemon-ports-changed';

export function getDaemonBaseUrl(): string {
  const envUrl = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_ACR_DAEMON_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  const mappings = getStoredPortMappings();
  const corePort = mappings.find((m) => m.id === 'acr-core')?.currentPort || DEFAULT_DAEMON_PORT;
  return `http://${DEFAULT_DAEMON_HOST}:${corePort}`;
}

export function getMetaMcpBaseUrl(): string {
  const envUrl = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_ACR_META_MCP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  const mappings = getStoredPortMappings();
  const metaPort = mappings.find((m) => m.id === 'acr-meta-mcp')?.currentPort || DEFAULT_META_MCP_PORT;
  return `http://${DEFAULT_DAEMON_HOST}:${metaPort}`;
}

export function getStoredDaemonToken(): string {
  if (typeof window !== 'undefined') {
    try {
      const sessionVal = window.sessionStorage.getItem(TOKEN_SESSION_KEY);
      if (sessionVal && sessionVal.trim()) {
        return sessionVal.trim();
      }
      const localVal = window.localStorage.getItem(TOKEN_PERSIST_KEY);
      if (localVal && localVal.trim()) {
        return localVal.trim();
      }
    } catch {
      // storage unavailable
    }
  }

  const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const envToken = envObj?.VITE_ACR_API_TOKEN || envObj?.ACR_API_TOKEN;
  return envToken ? envToken.trim() : '';
}

export function isDaemonTokenPersisted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.localStorage.getItem(TOKEN_PERSIST_KEY));
  } catch {
    return false;
  }
}

export function setStoredDaemonToken(token: string, persist = false): void {
  const trimmed = token.trim();
  if (typeof window !== 'undefined') {
    try {
      if (!trimmed) {
        window.sessionStorage.removeItem(TOKEN_SESSION_KEY);
        window.localStorage.removeItem(TOKEN_PERSIST_KEY);
      } else {
        window.sessionStorage.setItem(TOKEN_SESSION_KEY, trimmed);
        if (persist) {
          window.localStorage.setItem(TOKEN_PERSIST_KEY, trimmed);
        } else {
          window.localStorage.removeItem(TOKEN_PERSIST_KEY);
        }
      }
    } catch {
      // storage unavailable
    }
    window.dispatchEvent(new CustomEvent(DAEMON_TOKEN_CHANGED_EVENT, { detail: { hasToken: Boolean(trimmed) } }));
  }
}

export function getDaemonAuthHeaders(extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extra)) {
      for (const [key, value] of extra) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, extra);
    }
  }

  const token = getStoredDaemonToken();
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function daemonFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith('http://') || input.startsWith('https://')
    ? input
    : `${getDaemonBaseUrl()}${input.startsWith('/') ? '' : '/'}${input}`;

  return fetch(url, {
    ...init,
    headers: getDaemonAuthHeaders(init.headers),
  });
}
