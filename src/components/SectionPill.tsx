import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionPillProps {
  icon?: LucideIcon;
  primary: string;
  secondary?: string;
  className?: string;
  id?: string;
}

const SHINE_INTRO_DELAY = 333;

export const SectionPill: React.FC<SectionPillProps> = ({
  icon: Icon,
  primary,
  secondary,
  className = '',
  id,
}) => {
  const pillRef = useRef<HTMLDivElement>(null);
  const inView = useInView(pillRef, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [shineRun, setShineRun] = useState(0);
  const introPlayed = useRef(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = window.setTimeout(() => {
      if (introPlayed.current) return;
      introPlayed.current = true;
      setShineRun((run) => run + 1);
    }, SHINE_INTRO_DELAY);
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion]);

  const replayShine = () => {
    if (reduceMotion) return;
    introPlayed.current = true;
    setShineRun((run) => run + 1);
  };

  return (
    <div
      id={id}
      ref={pillRef}
      onMouseEnter={replayShine}
      className={`relative inline-flex items-center group select-none ${className}`}
    >
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? { opacity: 0.6 }
            : {
                opacity: [0.55, 0.85, 0.55],
                scaleX: [0.96, 1.06, 0.96],
                filter: ['blur(10px)', 'blur(13px)', 'blur(10px)'],
              }
        }
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[92%] h-6 -z-10 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 100% 120% at 50% 0%, rgba(255, 85, 0, 0.5) 0%, rgba(255, 140, 66, 0.35) 35%, rgba(245, 158, 11, 0.2) 65%, transparent 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-[70%] h-5 -z-10 opacity-70 blur-md"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 85, 0, 0.35) 0%, rgba(224, 72, 0, 0.15) 50%, transparent 100%)',
        }}
      />

      <div className="relative inline-flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs font-mono-code overflow-hidden border border-white/[0.14] bg-gradient-to-b from-white/[0.08] via-[#0D0D11]/90 to-[#000000]/95 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,85,0,0.3),0_8px_24px_rgba(0,0,0,0.85)] transition-all duration-160 group-hover:border-[#FF5500]/50">
        {shineRun > 0 && !reduceMotion && (
          <motion.div
            key={shineRun}
            aria-hidden="true"
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{
              duration: 3.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent w-1/2"
          />
        )}

        {Icon && (
          <Icon className="h-3.5 w-3.5 text-[#FF5500] shrink-0 drop-shadow-sm" aria-hidden="true" />
        )}

        <span className="font-semibold tracking-[0.08em] text-[11px] uppercase text-[#FF8C42] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {primary}
        </span>

        {secondary && (
          <>
            <span className="h-1 w-1 rounded-full bg-[#FF5500]/80" aria-hidden="true" />
            <span className="text-[#D4D4D8] font-mono-code text-[11px] tracking-tight">
              {secondary}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
