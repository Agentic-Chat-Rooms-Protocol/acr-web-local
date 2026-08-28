import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, ChevronLeft, ChevronRight, Play, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Proposal } from '../../types/protocol';

interface GovernanceBallotCarouselProps {
  openProposals: Proposal[];
  onSelectProposal: (proposalId: string) => void;
}

export const GovernanceBallotCarousel: React.FC<GovernanceBallotCarouselProps> = ({
  openProposals,
  onSelectProposal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = openProposals.length;

  // Keep index within bounds if list shrinks
  useEffect(() => {
    if (currentIndex >= count && count > 0) {
      setCurrentIndex(count - 1);
    }
  }, [count, currentIndex]);

  // Auto-cycle timer
  useEffect(() => {
    if (count <= 1 || !isAutoPlay || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isAutoPlay, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  if (count === 0) {
    return (
      <div className="p-3.5 rounded-xl border border-white/[0.06] bg-black/20 text-center text-[10px] text-slate-500 font-mono-code">
        No active consensus ballots
      </div>
    );
  }

  const prop = openProposals[currentIndex] || openProposals[0];
  const voteEntries = prop.votes ? Object.entries(prop.votes) : [];
  const approveVotes = voteEntries.filter(([_, choice]) => choice === 'APPROVE').length;
  const dissentVotes = (prop.dissent_logs?.length || 0) + voteEntries.filter(([_, choice]) => choice === 'DISSENT').length;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Open Consensus Ballots"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="relative rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2.5 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.08)]"
    >
      {/* Carousel Controls Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Vote className="h-3.5 w-3.5 text-amber-400" />
          <span className="rounded bg-amber-400/20 border border-amber-400/30 text-amber-300 px-1.5 py-0.2 text-[9px] font-mono-code font-bold">
            OPEN BALLOT
          </span>
          {count > 1 && (
            <span className="text-[10px] font-mono-code text-slate-400">
              {currentIndex + 1} of {count}
            </span>
          )}
        </div>

        {count > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              aria-label={isAutoPlay ? 'Pause ballot rotation' : 'Resume ballot rotation'}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isAutoPlay ? 'Pause auto-cycle' : 'Play auto-cycle'}
            >
              {isAutoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous ballot"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next ballot"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Animated Proposal Card View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={prop.id}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="space-y-2"
        >
          <div>
            <h4 className="text-xs font-bold text-white truncate font-sans">{prop.title}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5 font-sans">
              {prop.description}
            </p>
          </div>

          {/* Voting breakdown stats */}
          <div className="flex items-center justify-between text-[10px] font-mono-code pt-1 border-t border-white/[0.06]">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{approveVotes} Approve</span>
            </span>
            {dissentVotes > 0 && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{dissentVotes} Dissent</span>
              </span>
            )}
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={() => onSelectProposal(prop.id)}
            className="w-full text-center text-xs font-bold text-amber-300 hover:text-amber-200 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            Cast Ballot / Review Rationale
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Bullet Indicators for multiple ballots */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {openProposals.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to ballot ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
