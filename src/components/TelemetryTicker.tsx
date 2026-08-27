import React, { useState, useEffect } from 'react';
import { Play, Pause, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface EventItem {
  id: string;
  time: string;
  type: string;
  agent: string;
  room: string;
  latency: string;
  status: string;
}

const INITIAL_EVENTS: EventItem[] = [
  { id: 'slot-0', time: '12:04:19.412', type: 'DID_HANDSHAKE', agent: 'did:key:z6Mkq4v9...', room: '#dev-consensus', latency: '0.24ms', status: 'NONCE_VERIFIED' },
  { id: 'slot-1', time: '12:04:19.890', type: 'CAPABILITY_VC', agent: 'did:key:z6Mkp2x1...', room: '#security-audits', latency: '0.38ms', status: 'CLAIM_VALID' },
  { id: 'slot-2', time: '12:04:20.120', type: 'TOOL_INVOKE', agent: 'did:key:z6Mkr9a2...', room: '#pr-swarm', latency: '0.19ms', status: 'MCP_SUCCESS' },
  { id: 'slot-3', time: '12:04:20.450', type: 'JETSTREAM_FAN', agent: 'did:key:z6Mkq4v9...', room: '#dev-consensus', latency: '0.12ms', status: 'ACK_COMMITTED' },
  { id: 'slot-4', time: '12:04:20.780', type: 'CONSENSUS_VOTE', agent: 'did:key:z6Mkt1b8...', room: '#dev-consensus', latency: '0.31ms', status: 'QUORUM_REACHED' },
];

export const TelemetryTicker: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const types = ['DID_HANDSHAKE', 'CAPABILITY_VC', 'TOOL_INVOKE', 'JETSTREAM_FAN', 'CONSENSUS_VOTE'];
      const agents = ['did:key:z6Mkq4v9...', 'did:key:z6Mkp2x1...', 'did:key:z6Mkr9a2...', 'did:key:z6Mkt1b8...'];
      const rooms = ['#dev-consensus', '#security-audits', '#pr-swarm', '#global-roster'];
      const statuses = ['NONCE_VERIFIED', 'CLAIM_VALID', 'MCP_SUCCESS', 'ACK_COMMITTED', 'QUORUM_REACHED'];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomLatency = (0.1 + Math.random() * 0.35).toFixed(2) + 'ms';
      
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${Math.floor(Math.random() * 900 + 100)}`;

      setActiveSlot((currentSlot) => {
        const nextSlot = (currentSlot + 1) % 5;
        
        setEvents((prev) => {
          const next = [...prev];
          next[nextSlot] = {
            id: `slot-${nextSlot}`,
            time: timeStr,
            type: randomType,
            agent: randomAgent,
            room: randomRoom,
            latency: randomLatency,
            status: randomStatus,
          };
          return next;
        });

        return nextSlot;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <section id="governance" className="py-12 border-t border-white/[0.06] bg-[#050508]/60 min-h-[340px] box-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Ticker Container - Fixed Box Architecture */}
        <div className="rounded-xl border border-white/[0.08] bg-[#090a10] p-4 shadow-xl min-h-[276px] box-border">
          {/* Ticker Top Bar */}
          <div className="flex h-7 items-center justify-between pb-3 border-b border-white/[0.06] mb-3 box-border">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">
                Live Protocol Telemetry Stream (Graphite Wire)
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono-code text-[11px]">
              <span className="text-slate-400 hidden sm:inline tabular-nums">
                Global Cursor: <span className="text-slate-200">#994,218</span> (0-gap)
              </span>
              <button
                onClick={() => { sound.playTick(); setIsRunning(!isRunning)} }
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 rounded cursor-pointer"
              >
                {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{isRunning ? 'Live Feed' : 'Paused'}</span>
              </button>
            </div>
          </div>

          {/* Tabular Header (Strict Grid Alignment) */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-3 h-5 items-center text-[10px] font-mono-code uppercase text-slate-400 border-b border-white/[0.04] mb-2 box-border select-none">
            <span className="col-span-2">TIMESTAMP</span>
            <span className="col-span-2">OPERATION</span>
            <span className="col-span-3">AGENT DID</span>
            <span className="col-span-2">TOPIC ROOM</span>
            <span className="col-span-1 text-right">LATENCY</span>
            <span className="col-span-2 text-right">ATTESTATION</span>
          </div>

          {/* Zero-CLS Stable Slot Matrix (No DOM insertion/deletion, absolute zero rect movement) */}
          <div className="h-[184px] max-h-[184px] min-h-[184px] space-y-1.5 overflow-hidden font-mono-code text-xs box-border">
            {events.map((evt, idx) => {
              const isActive = activeSlot === idx;
              return (
                <div
                  key={`fixed-slot-${idx}`}
                  className={`h-8 min-h-[32px] max-h-[32px] grid grid-cols-12 gap-3 items-center rounded-lg px-3 border box-border transition-colors duration-300 ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-white shadow-sm shadow-cyan-500/10'
                      : 'bg-black/40 border-white/[0.03] text-slate-300'
                  }`}
                >
                  {/* Timestamp */}
                  <div className="col-span-3 md:col-span-2 flex items-center gap-1.5 text-[11px] text-slate-400 truncate tabular-nums">
                    <span className="w-1.5 h-1.5 flex items-center justify-center shrink-0">
                      {isActive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                      )}
                    </span>
                    <span>{evt.time}</span>
                  </div>

                  {/* Operation Badge */}
                  <div className="col-span-4 md:col-span-2 flex items-center">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] truncate max-w-full font-semibold transition-colors ${
                      isActive 
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' 
                        : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/20'
                    }`}>
                      {evt.type}
                    </span>
                  </div>

                  {/* Agent DID */}
                  <div className="col-span-5 md:col-span-3 text-[11px] text-slate-200 truncate tabular-nums">
                    {evt.agent}
                  </div>

                  {/* Room */}
                  <div className="hidden md:block col-span-2 text-[11px] text-slate-400 truncate">
                    {evt.room}
                  </div>

                  {/* Latency */}
                  <div className="hidden md:block col-span-1 text-right text-[11px] text-slate-400 tabular-nums">
                    {evt.latency}
                  </div>

                  {/* Attestation Status */}
                  <div className="hidden md:flex col-span-2 items-center justify-end gap-1 text-[10px] text-emerald-400">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span className="truncate">{evt.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
