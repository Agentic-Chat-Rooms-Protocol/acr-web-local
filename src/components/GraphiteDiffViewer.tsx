import React, { useState, useEffect } from 'react';
import {
  GitBranch, GitPullRequest, CheckCircle2, ShieldCheck,
  FileCode, Check, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import { sound } from '../utils/sound';
import { SectionPill } from './SectionPill';

const DAEMON_URL = (import.meta as any).env?.VITE_ACR_DAEMON_URL || 'http://localhost:20443';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiffLine {
  line_num: number;
  type: 'context' | 'add' | 'del';
  code: string;
}

interface AstDiffHunk {
  kind: string;
  name: string;
  old_start: number;
  old_end: number;
  new_start: number;
  new_end: number;
  old_lines: DiffLine[];
  new_lines: DiffLine[];
}

interface FileDiff {
  path: string;
  old_path?: string;
  added: number;
  removed: number;
  hunks: AstDiffHunk[];
}

interface PRDiffResponse {
  pr_number: number;
  files: FileDiff[];
}

interface StackLayer {
  index: number;
  pr_number: number;
  branch: string;
  title: string;
  status: string;
  verdicts: Array<{ agent_did: string; decision: string }>;
}

interface Stack {
  id: string;
  repo: string;
  base: string;
  layers: StackLayer[];
  status: string;
}

interface StacksResponse {
  repo: string;
  stacks: Stack[];
}

interface Verdict {
  agent_did: string;
  decision: string;
  sig: string;
  timestamp: string;
}

interface ConsensusEnvelope {
  stack_id: string;
  repo: string;
  pr_ids: number[];
  commit_sha: string;
  verdicts: Verdict[];
  quorum: string;
  timestamp: string;
}

// ─── Built-in Default Demo Fallback Data ─────────────────────────────────────

const DEFAULT_DEMO_STACK: Stack = {
  id: 'stack-vc-gate-082',
  repo: 'ACR/acr-core',
  base: 'main',
  status: 'open',
  layers: [
    {
      index: 0,
      pr_number: 104,
      branch: 'agent/claude-vc-gate',
      title: 'Zero-Trust VC Capability Gate',
      status: 'open',
      verdicts: [
        { agent_did: 'did:key:z6Mkq5Xv...claude', decision: 'APPROVE' },
        { agent_did: 'did:key:z6Mkp2x1...devin', decision: 'APPROVE' },
        { agent_did: 'did:key:z6Mkr9a4...sentinel', decision: 'APPROVE' }
      ]
    },
    {
      index: 1,
      pr_number: 105,
      branch: 'agent/devin-jetstream-quorum',
      title: 'NATS JetStream Raft Quorum Buffer',
      status: 'open',
      verdicts: [
        { agent_did: 'did:key:z6Mkq5Xv...claude', decision: 'APPROVE' }
      ]
    },
    {
      index: 2,
      pr_number: 106,
      branch: 'agent/sentinel-dissent-record',
      title: 'Cryptographic Dissent Merkle Ledger',
      status: 'open',
      verdicts: []
    }
  ]
};

const DEFAULT_DEMO_DIFF: PRDiffResponse = {
  pr_number: 104,
  files: [
    {
      path: 'pkg/gateway/hub.go',
      added: 24,
      removed: 8,
      hunks: [
        {
          kind: 'FunctionChanged',
          name: 'Hub.FanoutMessage',
          old_start: 142,
          old_end: 149,
          new_start: 142,
          new_end: 151,
          old_lines: [
            { line_num: 142, type: 'context', code: 'func (h *Hub) FanoutMessage(ctx context.Context, msg *Message) error {' },
            { line_num: 143, type: 'context', code: '\t// Verify agent DID challenge before bus ingress' },
            { line_num: 144, type: 'del', code: '\tif err := h.legacyAuthCheck(msg.AgentDID); err != nil {' },
            { line_num: 145, type: 'del', code: '\t\treturn ErrUnauthorized' },
            { line_num: 146, type: 'del', code: '\t}' },
          ],
          new_lines: [
            { line_num: 142, type: 'context', code: 'func (h *Hub) FanoutMessage(ctx context.Context, msg *Message) error {' },
            { line_num: 143, type: 'context', code: '\t// Verify agent DID challenge before bus ingress' },
            { line_num: 144, type: 'add', code: '\tif !h.vcVerifier.ValidateCapability(msg.AgentDID, msg.RequiredScope) {' },
            { line_num: 145, type: 'add', code: '\t\th.governance.RecordDissent(msg.AgentDID, "CAPABILITY_DENIED")' },
            { line_num: 146, type: 'add', code: '\t\treturn ErrVCCapabilityScopeExceeded' },
            { line_num: 147, type: 'add', code: '\t}' },
          ]
        },
        {
          kind: 'FunctionAdded',
          name: 'Hub.VerifyCapabilityProof',
          old_start: 0,
          old_end: 0,
          new_start: 178,
          new_end: 186,
          old_lines: [],
          new_lines: [
            { line_num: 178, type: 'add', code: 'func (h *Hub) VerifyCapabilityProof(proof *CapabilityProof) (bool, error) {' },
            { line_num: 179, type: 'add', code: '\tdigest := sha256.Sum256(proof.CanonicalPayload())' },
            { line_num: 180, type: 'add', code: '\treturn ed25519.Verify(proof.PublicKey, digest[:], proof.Signature), nil' },
            { line_num: 181, type: 'add', code: '}' },
          ]
        }
      ]
    },
    {
      path: 'pkg/store/kv_store.go',
      added: 8,
      removed: 3,
      hunks: [
        {
          kind: 'StructChanged',
          name: 'RedisRoster',
          old_start: 58,
          old_end: 62,
          new_start: 58,
          new_end: 63,
          old_lines: [
            { line_num: 58, type: 'context', code: 'type RedisRoster struct {' },
            { line_num: 59, type: 'del', code: '\tmu sync.Mutex // legacy single-host locking' },
            { line_num: 60, type: 'context', code: '}' },
          ],
          new_lines: [
            { line_num: 58, type: 'context', code: 'type RedisRoster struct {' },
            { line_num: 59, type: 'add', code: '\tcluster *redis.ClusterClient // distributed pub/sub buddy roster' },
            { line_num: 60, type: 'context', code: '}' },
          ]
        }
      ]
    },
    {
      path: 'pkg/identity/vc_auth.go',
      added: 6,
      removed: 1,
      hunks: [
        {
          kind: 'ImportAdded',
          name: 'golang.org/x/crypto/ed25519',
          old_start: 4,
          old_end: 8,
          new_start: 4,
          new_end: 9,
          old_lines: [
            { line_num: 4, type: 'context', code: 'import (' },
            { line_num: 5, type: 'context', code: '\t"crypto/sha256"' },
            { line_num: 6, type: 'context', code: ')' },
          ],
          new_lines: [
            { line_num: 4, type: 'context', code: 'import (' },
            { line_num: 5, type: 'context', code: '\t"crypto/sha256"' },
            { line_num: 6, type: 'add', code: '\t"golang.org/x/crypto/ed25519"' },
            { line_num: 7, type: 'context', code: ')' },
          ]
        }
      ]
    }
  ]
};

const DEFAULT_DEMO_CONSENSUS: ConsensusEnvelope = {
  stack_id: 'stack-vc-gate-082',
  repo: 'ACR/acr-core',
  pr_ids: [104, 105, 106],
  commit_sha: 'a3f9b1c84e2098d7f',
  quorum: '3/3',
  timestamp: '2026-09-01T11:00:00Z',
  verdicts: [
    {
      agent_did: 'did:key:z6Mkq5Xv...claude',
      decision: 'APPROVE',
      sig: 'MEUCIQDbK819xZ4w...Ed25519',
      timestamp: '2026-09-01T10:58:12Z'
    },
    {
      agent_did: 'did:key:z6Mkp2x1...devin',
      decision: 'APPROVE',
      sig: 'MEQCIA4k28aL9mN...Ed25519',
      timestamp: '2026-09-01T10:59:04Z'
    },
    {
      agent_did: 'did:key:z6Mkr9a4...sentinel',
      decision: 'APPROVE',
      sig: 'MEQCIB9vN2k8x31...Ed25519',
      timestamp: '2026-09-01T11:00:00Z'
    }
  ]
};

// ─── Kind Badge ───────────────────────────────────────────────────────────────

const kindColor: Record<string, string> = {
  FunctionChanged: 'text-amber-300 border-amber-500/30 bg-amber-950/30',
  FunctionAdded:   'text-emerald-300 border-emerald-500/30 bg-emerald-950/30',
  FunctionRemoved: 'text-red-300 border-red-500/30 bg-red-950/30',
  StructChanged:   'text-violet-300 border-violet-500/30 bg-violet-950/30',
  ImportAdded:     'text-cyan-300 border-cyan-500/30 bg-cyan-950/30',
  ImportRemoved:   'text-orange-300 border-orange-500/30 bg-orange-950/30',
  TextOnly:        'text-slate-400 border-slate-500/20 bg-slate-900/20',
};

const KindBadge: React.FC<{ kind: string; name: string }> = ({ kind, name }) => (
  <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-mono font-semibold ${kindColor[kind] ?? kindColor.TextOnly}`}>
    {kind}{name ? `: ${name}` : ''}
  </span>
);

// ─── Hunk Diff Renderer ───────────────────────────────────────────────────────

const HunkRow: React.FC<{ hunk: AstDiffHunk; mode: 'split' | 'unified' }> = ({ hunk, mode }) => {
  const allOld = hunk.old_lines ?? [];
  const allNew = hunk.new_lines ?? [];

  if (mode === 'unified') {
    const unified = [...allOld.map(l => ({ ...l, side: 'old' as const })), ...allNew.filter(l => l.type !== 'context').map(l => ({ ...l, side: 'new' as const }))];
    return (
      <div className="mb-2">
        <div className="px-3 py-1">
          <KindBadge kind={hunk.kind} name={hunk.name} />
        </div>
        {unified.map((line, i) => (
          <div key={i} className={`flex items-start px-3 py-0.5 text-[11px] font-mono ${
            line.type === 'add' ? 'bg-emerald-950/30 text-emerald-200' :
            line.type === 'del' ? 'bg-red-950/30 text-red-200' : 'text-slate-400'
          }`}>
            <span className="w-8 select-none text-slate-600 text-right pr-2">{line.line_num || ''}</span>
            <span className="select-none pr-2 font-bold opacity-70">
              {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
            </span>
            <span className="truncate">{line.code}</span>
          </div>
        ))}
      </div>
    );
  }

  // Split mode — pair old/new lines by index
  const max = Math.max(allOld.length, allNew.length);
  const rows = Array.from({ length: max }, (_, i) => ({
    old: allOld[i] ?? null,
    new: allNew[i] ?? null,
  }));

  return (
    <div className="mb-2">
      <div className="px-3 py-1">
        <KindBadge kind={hunk.kind} name={hunk.name} />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 text-[11px] font-mono hover:bg-white/[0.02]">
          <div className={`flex items-start px-2 py-0.5 border-r border-white/[0.05] ${
            row.old?.type === 'del' ? 'bg-red-950/25 text-red-200' : 'text-slate-400'
          }`}>
            <span className="w-8 select-none text-slate-600 text-right pr-2">{row.old?.line_num || ''}</span>
            <span className="select-none pr-2 font-bold opacity-70">{row.old?.type === 'del' ? '-' : ' '}</span>
            <span className="truncate">{row.old?.code ?? ''}</span>
          </div>
          <div className={`flex items-start px-2 py-0.5 ${
            row.new?.type === 'add' ? 'bg-emerald-950/25 text-emerald-200' : 'text-slate-400'
          }`}>
            <span className="w-8 select-none text-slate-600 text-right pr-2">{row.new?.line_num || ''}</span>
            <span className="select-none pr-2 font-bold opacity-70">{row.new?.type === 'add' ? '+' : ' '}</span>
            <span className="truncate">{row.new?.code ?? ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Stack Graph ──────────────────────────────────────────────────────────────

const StackGraph: React.FC<{ stack: Stack | null; selectedPR: number | null; onSelect: (pr: number) => void }> = ({ stack, selectedPR, onSelect }) => {
  if (!stack) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap font-mono text-xs">
      {stack.layers.map((layer, i) => (
        <React.Fragment key={layer.pr_number}>
          <button
            onClick={() => { sound.playTick(); onSelect(layer.pr_number); }}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              selectedPR === layer.pr_number
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold'
                : 'bg-[#0c0d14] text-slate-300 border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
          >
            #{layer.pr_number}
            {layer.status === 'merged' && <span className="ml-1 text-emerald-400">✓</span>}
          </button>
          {i < stack.layers.length - 1 && (
            <ChevronRight className="h-3 w-3 text-slate-600" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Consensus Proof Panel ────────────────────────────────────────────────────

const ConsensusProofPanel: React.FC<{ envelope: ConsensusEnvelope | null }> = ({ envelope }) => {
  if (!envelope) return null;
  const approvals = envelope.verdicts.filter(v => v.decision === 'APPROVE');
  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold text-white">Consensus Proof</span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded px-1.5 py-0.5">
          Quorum {envelope.quorum}
        </span>
      </div>
      {approvals.map((v, i) => (
        <div key={i} className="text-[10px] font-mono bg-[#0c0d14] border border-white/[0.04] rounded p-2">
          <div className="text-slate-400 truncate">{v.agent_did}</div>
          <div className="text-emerald-400 mt-0.5">✓ {v.decision}</div>
          <div className="text-slate-600 mt-0.5 truncate">{v.sig.slice(0, 24)}…</div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const GraphiteDiffViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [diffData, setDiffData] = useState<PRDiffResponse>(DEFAULT_DEMO_DIFF);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [stacks, setStacks] = useState<Stack[]>([DEFAULT_DEMO_STACK]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(DEFAULT_DEMO_STACK);
  const [selectedPR, setSelectedPR] = useState<number | null>(104);
  const [consensus] = useState<ConsensusEnvelope | null>(DEFAULT_DEMO_CONSENSUS);
  const [loading, setLoading] = useState(false);
  const [daemonOnline, setDaemonOnline] = useState(false);

  // Fetch stacks and initial diff on mount if daemon is accessible
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [stacksRes, diffRes] = await Promise.all([
          fetch(`${DAEMON_URL}/api/v1/stacks?repo=ACR/acr-core`),
          fetch(`${DAEMON_URL}/api/v1/review/diff?pr=104`),
        ]);
        if (stacksRes.ok && isMounted) {
          const s: StacksResponse = await stacksRes.json();
          if (s.stacks && s.stacks.length > 0) {
            setStacks(s.stacks);
            setSelectedStack(s.stacks[0]);
            setSelectedPR(s.stacks[0].layers?.[0]?.pr_number ?? 104);
          }
          setDaemonOnline(true);
        }
        if (diffRes.ok && isMounted) {
          const d: PRDiffResponse = await diffRes.json();
          if (d.files && d.files.length > 0) {
            setDiffData(d);
          }
        }
      } catch {
        // Local daemon is offline; default demo data remains active
        if (isMounted) {
          setDaemonOnline(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const selectedFile = diffData?.files?.[selectedFileIdx] ?? diffData?.files?.[0];
  const totalAdded = diffData?.files?.reduce((acc, f) => acc + f.added, 0) ?? 38;
  const totalRemoved = diffData?.files?.reduce((acc, f) => acc + f.removed, 0) ?? 12;
  const approvalCount = stacks.reduce((acc, s) => acc + s.layers.reduce((a, l) => a + l.verdicts.filter(v => v.decision === 'APPROVE').length, 0), 0);

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

          <div className="flex items-center gap-2 font-mono-code text-xs">
            <div className={`rounded-lg border px-3 py-1.5 flex items-center gap-1.5 font-medium ${
              daemonOnline
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
            }`}>
              {daemonOnline ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{daemonOnline ? 'Daemon Live' : 'Demo Mode'}</span>
            </div>
            {approvalCount > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Quorum {approvalCount}/{approvalCount} Passed</span>
              </div>
            )}
            {selectedStack && (
              <StackGraph
                stack={selectedStack}
                selectedPR={selectedPR}
                onSelect={pr => { setSelectedPR(pr); }}
              />
            )}
          </div>
        </div>

        {/* Review Window */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#090a10] shadow-2xl overflow-hidden">

          {/* PR Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-black/40 px-4 py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {selectedPR ? `PR #${selectedPR}: Zero-Trust VC Capability Gate` : 'PR #104: Zero-Trust VC Capability Gate'}
                  </span>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono">
                    Open • Consensus Ready
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Base: <code className="text-slate-200">main</code> ← Head: <code className="text-cyan-300">agent/claude-vc-gate</code> (
                  <span className="text-red-400 font-semibold font-mono">+{totalAdded}</span>{' '}
                  <span className="text-emerald-400 font-semibold font-mono">-{totalRemoved}</span>)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading && <RefreshCw className="h-3.5 w-3.5 text-slate-500 animate-spin" />}
              <div className="flex rounded-lg border border-white/[0.08] bg-[#0c0d14] p-0.5 text-xs font-mono">
                <button
                  onClick={() => { sound.playTick(); setViewMode('split'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Split Diff
                </button>
                <button
                  onClick={() => { sound.playTick(); setViewMode('unified'); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${viewMode === 'unified' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Unified
                </button>
              </div>
            </div>
          </div>

          {/* Body: File Tree + Diff Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">

            {/* Left sidebar: file list + agent verdict + consensus */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#07070c] p-3 space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1">
                Changed Files ({diffData?.files?.length ?? 0})
              </div>

              {(diffData?.files ?? []).map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => { sound.playTick(); setSelectedFileIdx(idx); }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                    selectedFileIdx === idx
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 shrink-0">+{file.added} -{file.removed}</span>
                </button>
              ))}

              {/* Agent Review Verdict Box */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] p-2 bg-[#0c0d14] rounded-lg border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-white">Claude 5.0 Verdict</span>
                </div>
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  "Replaced ad-hoc DID checks with capability-scoped VC validation.
                  Prevents unauthorized message relay across rooms.
                  TLA+ composition invariant satisfies safety lemma."
                </p>
              </div>

              <ConsensusProofPanel envelope={consensus} />
            </div>

            {/* Right: AST-annotated diff */}
            <div className="lg:col-span-9 bg-[#050508] overflow-x-auto">
              {selectedFile ? (
                <div className="divide-y divide-white/[0.03] min-w-[600px]">
                  {(selectedFile.hunks ?? []).map((hunk, i) => (
                    <HunkRow key={i} hunk={hunk} mode={viewMode} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
                  {loading ? 'Loading diff…' : 'No diff data'}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] bg-black/40 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>Diff Engine: AST Parser (go/ast v2)</span>
              <span>
                {consensus?.verdicts?.[0]?.sig
                  ? `Ed25519 Signed: ${consensus.verdicts[0].sig.slice(0, 16)}…`
                  : 'Awaiting consensus signatures…'}
              </span>
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
