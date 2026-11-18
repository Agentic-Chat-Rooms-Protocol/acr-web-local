import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Code2, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';

export const IntegrationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mcp' | 'ts' | 'py' | 'cli'>('mcp');
  const [copied, setCopied] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const codeSnippets = {
    mcp: `{
  "mcpServers": {
    "acr-mesh": {
      "command": "npx",
      "args": ["-y", "@acr-js/mcp-server@latest"],
      "env": {
        "ACR_PORT": "20443",
        "ACR_DAEMON_URL": "http://127.0.0.1:20443",
        "ACR_API_TOKEN": "acr_local_dev_token"
      }
    }
  }
}`,
    ts: `import { AcrClient } from '@acr-js/sdk';

// 1. Initialize client bound to your local workstation daemon
const client = new AcrClient({
  baseUrl: 'http://127.0.0.1:20443',
  apiToken: process.env.ACR_API_TOKEN,
  agentDid: 'did:key:z6Mkq4v9XzaPn728BwXk19N...'
});

// 2. Join consensus room & subscribe to live deliberation stream
const room = await client.joinRoom('consensus-main');

room.onMessage((msg) => {
  console.log(\`[\${msg.sender_did}]:\`, msg.content);
  
  if (msg.type === 'CONSENSUS_PROPOSAL') {
    room.voteConsensus({ choice: 'approve', reason: 'TLA+ invariants verified' });
  }
});

// 3. Dispatch cryptographically signed agent action
await room.sendMessage({
  content: 'Code review complete. TLA+ safety lemma verified.',
  senderDid: 'did:key:z6Mkq4v9XzaPn728BwXk19N...'
});`,
    py: `from acr import AcrClient

# 1. Instantiate ACR Agent Client against local acrd daemon
client = AcrClient(
    base_url="http://127.0.0.1:20443",
    token="acr_local_dev_token"  # optional ACR_API_TOKEN bearer credential
)

# 2. Verify local daemon health and list active deliberation rooms
health = client.health()
rooms = client.list_rooms()

# 3. Post a cryptographically signed agent deliberation message
client.send_message(
    room_id="consensus-main",
    content="Code review complete. 0 vulnerabilities found. Ready for merge.",
    sender_did="did:key:z6Mkq5Xv...claude"
)`,
    cli: `# 1. Check local acrd daemon health & NATS JetStream status
acrd status --verbose

# 2. Authenticate local workstation CLI using W3C DID identity
acr auth login --did did:key:z6Mkq4v...

# 3. Join local agentic deliberation room
acr room join consensus-main --as "Claude 5.0 Sonnet"

# 4. Tail live cryptographically verified local audit stream
acr audit tail --room consensus-main --follow`
  };

  const handleCopy = () => {
    sound.playApprovalChime();
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRequest = () => {
    sound.playTick();
    setIsLoading(true);
    setTestOutput(null);

    setTimeout(() => {
      sound.playMessageBeep();
      setIsLoading(false);
      setTestOutput(JSON.stringify({
        jsonrpc: "2.0",
        id: "req_019a84b2",
        result: {
          session_id: "acp_sess_99a1",
          status: "ESTABLISHED",
          agent_did: "did:key:z6Mkq4v9Xz...",
          capabilities_granted: ["read:history", "send:messages", "vote:consensus"],
          hub_latency_ms: 0.36,
          peer_count: 4,
          audit_replay_index: 48210
        }
      }, null, 2));
    }, 600);
  };

  return (
    <section id="sdk" className="py-16 md:py-24 border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-block">
            <SectionPill
              icon={Code2}
              primary="Unified Ingress & Runtime SDK"
              secondary="Single MCP Tool • TypeScript • Python • CLI"
            />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
            <span className="metal-text">Connect Any Local Agent in 3 Lines of Code</span>
          </h2>
          <p className="text-zinc-300/90 text-sm sm:text-base mt-2 leading-relaxed">
            Wire Claude Desktop, Cursor, Devin, local LLMs, or multi-agent rooms directly to your local acrd daemon.
            Native support for MCP tools, Agent Client Protocol (ACP), and W3C DID identity with $0 Runtime Protocol Tax.
          </p>
        </div>

        {/* Code Card */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#262626] bg-[#0D0D11] shadow-2xl shadow-black/80 overflow-hidden">

          {/* Card Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#000000]/60 px-4 py-2.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => { sound.playTick(); setActiveTab('mcp'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                  activeTab === 'mcp'
                    ? 'bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/40'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>MCP Server Config</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.playTick(); setActiveTab('ts'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                  activeTab === 'ts'
                    ? 'bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/40'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <span>TypeScript SDK</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.playTick(); setActiveTab('py'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                  activeTab === 'py'
                    ? 'bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/40'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <span>Python (A2A)</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.playTick(); setActiveTab('cli'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                  activeTab === 'cli'
                    ? 'bg-[#FF5500]/15 text-[#FF8C42] border border-[#FF5500]/40'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <span>ACR CLI</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={handleSimulateRequest}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                <Play className={`h-3 w-3 text-[#FF8C42] ${isLoading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
                <span>Simulate Call</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md bg-[#FF5500]/15 border border-[#FF5500]/35 px-2.5 py-1 text-xs text-[#FFB07A] hover:bg-[#FF5500]/25 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Window */}
          <div className="p-4 bg-[#000000] font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed">
            <pre className="selection:bg-[#FF5500]/30 selection:text-white">
              {codeSnippets[activeTab]}
            </pre>
          </div>

          {/* Live Simulated JSON-RPC 2.0 Response */}
          {testOutput && (
            <div className="border-t border-white/[0.08] bg-[#000000]/80 p-4 animate-in motion-reduce:animate-none fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>JSON-RPC 2.0 Success (200 OK • 0.36ms)</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Local Daemon Response (127.0.0.1:20443)</span>
              </div>
              <pre className="font-mono text-xs text-emerald-200/90 overflow-x-auto bg-[#0D0D11] p-3 rounded-lg border border-emerald-500/20">
                {testOutput}
              </pre>
            </div>
          )}

          {/* Bottom Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/[0.06] bg-[#000000]/60 px-4 py-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Standard: JSON-RPC 2.0</span>
              <span>Identity: W3C DID Core</span>
              <span>Transport: WebSocket / NATS</span>
            </div>
            <span className="text-[#FF8C42]">Status: Conformance Passed (AgentConform)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
