import React, { useState } from 'react';
import { 
  GitBranch, GitPullRequest, CheckCircle2, ShieldCheck, 
  FileCode, Check 
} from 'lucide-react';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';


export const GraphiteDiffViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'hub.go' | 'kv_store.go' | 'auth.go'>('hub.go');
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const diffData = {
    'hub.go': [
      { lineOld: 142, lineNew: 142, type: 'context', oldCode: 'func (h *Hub) FanoutMessage(ctx context.Context, msg *Message) error {', newCode: 'func (h *Hub) FanoutMessage(ctx context.Context, msg *Message) error {' },
      { lineOld: 143, lineNew: 143, type: 'context', oldCode: '\t// Verify agent DID challenge before bus ingress', newCode: '\t// Verify agent DID challenge before bus ingress' },
      { lineOld: 144, lineNew: null, type: 'del', oldCode: '\tif err := h.legacyAuthCheck(msg.AgentDID); err != nil {', newCode: '' },
      { lineOld: 145, lineNew: null, type: 'del', oldCode: '\t\treturn ErrUnauthorized', newCode: '' },
      { lineOld: 146, lineNew: null, type: 'del', oldCode: '\t}', newCode: '' },
      { lineOld: null, lineNew: 144, type: 'add', oldCode: '', newCode: '\tif !h.vcVerifier.ValidateCapability(msg.AgentDID, msg.RequiredScope) {' },
      { lineOld: null, lineNew: 145, type: 'add', oldCode: '', newCode: '\t\th.governance.RecordDissent(msg.AgentDID, "CAPABILITY_DENIED")' },
      { lineOld: null, lineNew: 146, type: 'add', oldCode: '', newCode: '\t\treturn ErrVCCapabilityScopeExceeded' },
      { lineOld: null, lineNew: 147, type: 'add', oldCode: '', newCode: '\t}' },
      { lineOld: 147, lineNew: 148, type: 'context', oldCode: '\t// Commit to clustered NATS JetStream stream buffer', newCode: '\t// Commit to clustered NATS JetStream stream buffer' },
      { lineOld: 148, lineNew: 149, type: 'context', oldCode: '\treturn h.jetstream.PublishMsg(ctx, msg.ToWireFormat())', newCode: '\treturn h.jetstream.PublishMsg(ctx, msg.ToWireFormat())' },
      { lineOld: 149, lineNew: 150, type: 'context', oldCode: '}', newCode: '}' }
    ],
    'kv_store.go': [
      { lineOld: 58, lineNew: 58, type: 'context', oldCode: 'type RedisRoster struct {', newCode: 'type RedisRoster struct {' },
      { lineOld: 59, lineNew: null, type: 'del', oldCode: '\tmu sync.Mutex // legacy single-host locking', newCode: '' },
      { lineOld: null, lineNew: 59, type: 'add', oldCode: '', newCode: '\tcluster *redis.ClusterClient // distributed pub/sub buddy roster' },
      { lineOld: 60, lineNew: 60, type: 'context', oldCode: '}', newCode: '}' }
    ],
    'auth.go': [
      { lineOld: 89, lineNew: 89, type: 'context', oldCode: 'func VerifyDIDSignature(doc *DIDDocument, nonce []byte, sig []byte) bool {', newCode: 'func VerifyDIDSignature(doc *DIDDocument, nonce []byte, sig []byte) bool {' },
      { lineOld: 90, lineNew: 90, type: 'context', oldCode: '\t// Ed25519 cryptographic challenge check', newCode: '\t// Ed25519 cryptographic challenge check' },
      { lineOld: 91, lineNew: 91, type: 'context', oldCode: '\treturn ed25519.Verify(doc.PublicKey, nonce, sig)', newCode: '\treturn ed25519.Verify(doc.PublicKey, nonce, sig)' },
      { lineOld: 92, lineNew: 92, type: 'context', oldCode: '}', newCode: '}' }
    ]
  };

  return (
    <section id="diff-viewer" className="py-16 md:py-24 border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="mb-3 inline-block">
              <SectionPill
                icon={GitPullRequest}
                primary="Decentralized Code Governance"
                secondary="Stacked Agent PRs • TLA+ Verified Merges"
              />
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              <span className="metal-text">Protocol Pull Request Review</span>
            </h2>
            <p className="text-slate-300/90 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
              Inspect stacked agent pull requests, side-by-side AST line diffs, and 
              cryptographic consensus proofs across the ACR message bus codebase.
            </p>
          </div>

          {/* Graphite Stack Badges */}
          <div className="flex items-center gap-2 font-mono-code text-xs">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-emerald-300 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Quorum 3/3 Passed</span>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-[#0c0d14] px-3 py-1.5 text-slate-300">
              Stack: #104 ➔ #105 ➔ #106
            </div>
          </div>
        </div>

        {/* Diff Review Window */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#090a10] shadow-2xl overflow-hidden">
          
          {/* PR Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-black/40 px-4 py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">PR #104: Zero-Trust VC Capability Gate</span>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono">
                    Open • Consensus Ready
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Base: <code>main</code> ← Head: <code>agent/claude-vc-gate</code> (+38 -12)
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-white/[0.08] bg-[#0c0d14] p-0.5 text-xs font-mono">
                <button
                  onClick={() => { sound.playTick(); setViewMode('split'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split Diff
                </button>
                <button
                  onClick={() => { sound.playTick(); setViewMode('unified'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === 'unified' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unified
                </button>
              </div>
            </div>
          </div>

          {/* Split Body: File Tree + Diff Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            
            {/* File List (Left 3 cols) */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#07070c] p-3 space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1">
                Changed Files (3)
              </div>
              
              <button
                onClick={() => { sound.playTick(); setSelectedFile('hub.go'); }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                  selectedFile === 'hub.go'
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">05-message-bus/hub.go</span>
                </div>
                <span className="text-[10px] text-emerald-400 shrink-0">+4 -3</span>
              </button>

              <button
                onClick={() => { sound.playTick(); setSelectedFile('kv_store.go'); }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                  selectedFile === 'kv_store.go'
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">05-message-bus/kv_store.go</span>
                </div>
                <span className="text-[10px] text-emerald-400 shrink-0">+1 -1</span>
              </button>

              <button
                onClick={() => { sound.playTick(); setSelectedFile('auth.go'); }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                  selectedFile === 'auth.go'
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">03-did-vc/auth.go</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">0 -0</span>
              </button>

              {/* Agent Review Annotation Box */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] p-2 bg-[#0c0d14] rounded-lg border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-white">Claude 3.7 Verdict</span>
                </div>
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  "Replaced ad-hoc DID checks with capability-scoped VC validation. Prevents unauthorized message relay across rooms. TLA+ composition invariant satisfies safety lemma."
                </p>
              </div>
            </div>

            {/* Code Diff Display (Right 9 cols) */}
            <div className="lg:col-span-9 bg-[#050508] overflow-x-auto font-mono text-xs">
              {viewMode === 'split' ? (
                <div className="divide-y divide-white/[0.03] min-w-[650px]">
                  {diffData[selectedFile].map((line, idx) => (
                    <div key={idx} className="grid grid-cols-2 text-[11px] hover:bg-white/[0.02]">
                      {/* Left (Old) */}
                      <div className={`flex items-start px-2 py-0.5 border-r border-white/[0.05] ${
                        line.type === 'del' ? 'bg-red-950/25 text-red-200' : 'text-slate-400'
                      }`}>
                        <span className="w-8 select-none text-slate-600 text-right pr-2">
                          {line.lineOld || ''}
                        </span>
                        <span className="select-none pr-2 font-bold opacity-70">
                          {line.type === 'del' ? '-' : ' '}
                        </span>
                        <span className="truncate">{line.oldCode}</span>
                      </div>

                      {/* Right (New) */}
                      <div className={`flex items-start px-2 py-0.5 ${
                        line.type === 'add' ? 'bg-emerald-950/25 text-emerald-200' : 'text-slate-400'
                      }`}>
                        <span className="w-8 select-none text-slate-600 text-right pr-2">
                          {line.lineNew || ''}
                        </span>
                        <span className="select-none pr-2 font-bold opacity-70">
                          {line.type === 'add' ? '+' : ' '}
                        </span>
                        <span className="truncate">{line.newCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {diffData[selectedFile].map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start px-3 py-0.5 text-[11px] ${
                        line.type === 'add'
                          ? 'bg-emerald-950/30 text-emerald-200'
                          : line.type === 'del'
                          ? 'bg-red-950/30 text-red-200'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="w-8 select-none text-slate-600 text-right pr-2">
                        {line.lineOld || ''}
                      </span>
                      <span className="w-8 select-none text-slate-600 text-right pr-2">
                        {line.lineNew || ''}
                      </span>
                      <span className="select-none pr-2 font-bold">
                        {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                      </span>
                      <span className="truncate">
                        {line.type === 'add' ? line.newCode : line.oldCode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-white/[0.06] bg-black/40 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>Diff Engine: AST Parser v2</span>
              <span>Ed25519 Signed: 0x9924...af12</span>
            </div>
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Ready to Merge into main
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
