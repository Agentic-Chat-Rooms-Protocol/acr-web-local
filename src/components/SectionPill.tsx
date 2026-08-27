import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionPillProps {
  icon?: LucideIcon;
  primary: string;
  secondary?: string;
  className?: string;
  id?: string;
}

export const SectionPill: React.FC<SectionPillProps> = ({
  icon: Icon,
  primary,
  secondary,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`relative inline-flex items-center group select-none ${className}`}>
      {/* 1. Animated Rainbow God-Ray Glow Emanating from the Bottom */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.55, 0.85, 0.55],
          scaleX: [0.96, 1.06, 0.96],
          filter: ['blur(10px)', 'blur(13px)', 'blur(10px)'],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[92%] h-6 -z-10 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 100% 120% at 50% 0%, rgba(56, 189, 248, 0.6) 0%, rgba(129, 140, 248, 0.45) 28%, rgba(236, 72, 153, 0.35) 55%, rgba(245, 158, 11, 0.3) 75%, rgba(16, 185, 129, 0.4) 95%, transparent 100%)',
        }}
      />

      {/* Secondary Directional Downward God-Ray Cone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-[70%] h-5 -z-10 opacity-70 blur-md"
        style={{
          background:
            'linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 0%, rgba(147, 51, 234, 0.25) 50%, transparent 100%)',
        }}
      />

      {/* 2. Main 3D Edge-Refraction Pill Container */}
      <div className="relative inline-flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs font-mono-code overflow-hidden border border-white/[0.16] bg-gradient-to-b from-white/[0.09] via-[#090b14]/90 to-[#04050a]/95 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(56,189,248,0.25),0_8px_24px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:border-cyan-400/40">
        
        {/* Animated Traveling Aesthetic Shine Glint */}
        <motion.div
          aria-hidden="true"
          initial={{ x: '-120%' }}
          animate={{ x: '220%' }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            repeatDelay: 2.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent w-1/2"
        />

        {/* Left Icon with subtle cyan illumination */}
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
        )}

        {/* Primary Protocol Label */}
        <span className="font-semibold tracking-[0.07em] text-[11px] uppercase text-cyan-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {primary}
        </span>

        {/* Optional Secondary Feature Tag */}
        {secondary && (
          <>
            <span className="h-1 w-1 rounded-full bg-cyan-400/80 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
            <span className="text-slate-400 font-mono-code text-[11px] tracking-tight">
              {secondary}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
