import React, { useEffect, useId, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

export const HyperBackground: React.FC = () => {
  const topoGradId = useId();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deepest Obsidian Void */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* 2. Fullscreen GPU WebGL Mesh Gradient */}
      <div className="absolute inset-0 opacity-25 mix-blend-screen filter blur-3xl">
        <MeshGradient
          colors={['#000000', '#0D0D11', '#18181B', '#050508']}
          speed={prefersReducedMotion ? 0 : 0.04}
          distortion={prefersReducedMotion ? 0 : 0.4}
          swirl={prefersReducedMotion ? 0 : 0.3}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* 3. Signature Anamorphic Top Light Slit & Volumetric Conic Ray */}
      <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#FF5500]/20 via-[#FF8C42]/10 to-transparent rounded-full blur-[90px] opacity-75" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[1px] bg-gradient-to-r from-transparent via-[#FF8C42]/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[25%] h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]" />

      {/* 4. Architectural Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, black 25%, transparent 85%)',
        }}
      />

      {/* 5. Procedural Network Topology Isolines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={topoGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5500" />
            <stop offset="50%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <path d="M-100,200 C300,100 600,400 1200,150 C1600,-50 1900,300 2400,200" fill="none" stroke={`url(#${topoGradId})`} strokeWidth="1.2" strokeDasharray="6 8" />
        <path d="M-100,350 C400,220 700,550 1300,280 C1700,80 2000,450 2500,320" fill="none" stroke={`url(#${topoGradId})`} strokeWidth="1" />
        <path d="M-100,520 C350,380 800,680 1400,420 C1800,220 2100,600 2500,480" fill="none" stroke={`url(#${topoGradId})`} strokeWidth="1.2" strokeDasharray="4 6" />
        <path d="M-100,700 C450,540 900,850 1500,580 C1900,380 2200,780 2600,620" fill="none" stroke={`url(#${topoGradId})`} strokeWidth="0.8" />
        <path d="M-100,880 C500,700 1000,980 1600,740 C2000,520 2300,920 2700,780" fill="none" stroke={`url(#${topoGradId})`} strokeWidth="1" strokeDasharray="8 12" />
      </svg>

      {/* 6. Interactive Cursor Spotlight */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: mousePos.x > -500
              ? `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 85, 0, 0.06), rgba(255, 140, 66, 0.03) 45%, transparent 80%)`
              : undefined,
          }}
        />
      )}

      {/* 7. Subtle Ambient Secondary Wells */}
      <div className="absolute top-[35%] -left-[150px] w-[500px] h-[500px] rounded-full bg-[#FF5500]/10 blur-[150px]" />
      <div className="absolute top-[65%] -right-[150px] w-[600px] h-[600px] rounded-full bg-[#FF8C42]/10 blur-[160px]" />
      <div className="absolute -bottom-[100px] left-1/3 w-[700px] h-[400px] rounded-full bg-emerald-950/15 blur-[160px]" />

      {/* 8. Fine Optical Dither & Film Grain Texture */}
      <div className="absolute inset-0 bg-grain opacity-50 mix-blend-overlay" />

      {/* 9. Vignette Frame */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0, 0, 0, 0.85) 100%)'
        }}
      />
    </div>
  );
};
