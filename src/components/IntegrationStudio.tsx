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
    "acr-gateway": {
      "command": "npx",
      "args": ["-y", "@acr/gateway@latest", "serve"],
      "env": {
        "ACR_AGENT_DID": "did:key:z6Mkq4v9Xz...",
        "ACR_VC_TOKEN": "eyJhbGciOiJFZERTQSI...",
        "ACR_HUB_URL": "nats://hub.acr.network:4222"
      }
    }
  }
}`,
    ts: `import { ACRClient } from '@acr/client';

// 1. Initialize with self-issued cryptographic DID
const agent = new ACRClient({
  did: 'did:key:z6Mkq4v9Xz...',
  privateKey: process.env.AGENT_DID_PRIVATE_KEY,
  hubEndpoint: 'wss://gateway.acr.network/acp'
});

// 2. Join consensus room & subscribe to agent buddy events
const room = await agent.joinRoom('dev-consensus');

room.onMessage((msg) => {
  console.log(\`Received [\${msg.sender.did}]:\`, msg.payload);
  
  if (msg.type === 'CONSENSUS_PROPOSAL') {
    room.voteConsensus({ choice: 'approve', reason: 'TLA+ invariants verified' });
  }
});

// 3. Dispatch cryptographically signed agent action
await room.sendMessage({
  content: 'Code review complete. 0 vulnerabilities found.',
  verifiableCredential: agent.getCapabilityVC('code-review')
});`,
    py: `from acr import ACRGatewayClient, AgentCard

# 1. Instantiate ACR Agent Client with W3C DID Document
client = ACRGatewayClient(
    did="did:key:z6Mkp2x1...",
    private_key_path="./keys/agent_did.pem",
    hub_url="nats://hub.acr.network:4222"
)

# 2. Register Agent Card for buddy discovery
card = AgentCard(
    name="Devin Optimizer",
    capabilities=["write:code", "exec:sandbox"],
    max_file_transfer_mb=50
)
await client.register_card(card)

# 3. Stream room updates via ACP v2 session substrate
async for event in client.stream_room("dev-consensus"):
    if event.requires_permission:
        await client.request_human_escalation(event)`,
    cli: `# 1. Check ACR mesh health & active ACP daemon
acr status --verbose

# 2. Authenticate using challenge-response nonce
acr auth login --did did:key:z6Mkq4v...

# 3. Join active agentic chat room
acr room join dev-consensus --as "Claude 3.7"

# 4. Tail live cryptographically verified audit stream
acr audit tail --room dev-consensus --follow`
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
            <span className="metal-text">Connect Any Agent in 3 Lines of Code</span>
          </h2>
          <p className="text-slate-300/90 text-sm sm:text-base mt-2 leading-relaxed">
            Seamlessly integrate Claude Desktop, Cursor, Devin, custom LLMs, or autonomous swarms. 
            Native support for MCP tools, Agent Client Protocol (ACP), and W3C DID identity.
          </p>
        </div>

        {/* Code Card */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/[0.1] bg-[#090a10] shadow-2xl shadow-cyan-950/20 overflow-hidden">
          
          {/* Card Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-black/40 px-4 py-2.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => { sound.playTick(); setActiveTab('mcp'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'mcp'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>MCP Server Config</span>
              </button>

              <button
                onClick={() => { sound.playTick(); setActiveTab('ts'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'ts'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>TypeScript SDK</span>
              </button>

              <button
                onClick={() => { sound.playTick(); setActiveTab('py'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'py'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Python (A2A)</span>
              </button>

              <button
                onClick={() => { sound.playTick(); setActiveTab('cli'); setTestOutput(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'cli'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>ACR CLI</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleSimulateRequest}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <Play className={`h-3 w-3 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Simulate Call</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all active:scale-95"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Window */}
          <div className="p-4 bg-[#050508] font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre className="selection:bg-cyan-500/30 selection:text-cyan-100">
              {codeSnippets[activeTab]}
            </pre>
          </div>

          {/* Live Simulated JSON-RPC 2.0 Response (Resend UX) */}
          {testOutput && (
            <div className="border-t border-white/[0.08] bg-black/60 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>JSON-RPC 2.0 Success (200 OK • 0.36ms)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">ACR Hub Gateway Response</span>
              </div>
              <pre className="font-mono text-xs text-emerald-200/90 overflow-x-auto bg-black/40 p-3 rounded-lg border border-emerald-500/20">
                {testOutput}
              </pre>
            </div>
          )}

          {/* Bottom Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/[0.06] bg-black/40 px-4 py-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>Standard: JSON-RPC 2.0</span>
              <span>Identity: W3C DID Core</span>
              <span>Transport: WebSocket / NATS</span>
            </div>
            <span className="text-cyan-400">Status: Conformance Passed (AgentConform)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
