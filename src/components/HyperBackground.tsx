import React, { useEffect, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

export const HyperBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deepest Space Void */}
      <div className="absolute inset-0 bg-[#030305]" />

      {/* 2. Fullscreen Silky GPU WebGL Mesh Gradient (Lemni/Paper Shaders) */}
      <div className="absolute inset-0 opacity-25 mix-blend-screen filter blur-3xl">
        <MeshGradient
          colors={['#020617', '#082f49', '#1e1b4b', '#030712']}
          speed={0.04}
          distortion={0.4}
          swirl={0.3}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* 3. Resend Signature Anamorphic Top Light Slit & Volumetric Conic Ray */}
      <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-cyan-500/20 via-indigo-500/10 to-transparent rounded-full blur-[90px] opacity-75" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[25%] h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]" />

      {/* 4. Graphite Architectural Coordinate Grid with Corner Crosshairs */}
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

      {/* 5. Lemni Procedural Topology Isolines (Decentralized Network Topography) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="topo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M-100,200 C300,100 600,400 1200,150 C1600,-50 1900,300 2400,200" fill="none" stroke="url(#topo-grad)" strokeWidth="1.2" strokeDasharray="6 8" />
        <path d="M-100,350 C400,220 700,550 1300,280 C1700,80 2000,450 2500,320" fill="none" stroke="url(#topo-grad)" strokeWidth="1" />
        <path d="M-100,520 C350,380 800,680 1400,420 C1800,220 2100,600 2500,480" fill="none" stroke="url(#topo-grad)" strokeWidth="1.2" strokeDasharray="4 6" />
        <path d="M-100,700 C450,540 900,850 1500,580 C1900,380 2200,780 2600,620" fill="none" stroke="url(#topo-grad)" strokeWidth="0.8" />
        <path d="M-100,880 C500,700 1000,980 1600,740 C2000,520 2300,920 2700,780" fill="none" stroke="url(#topo-grad)" strokeWidth="1" strokeDasharray="8 12" />
      </svg>

      {/* 6. Resend Smooth Interactive Cursor Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: mousePos.x > -500 
            ? `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.06), rgba(99, 102, 241, 0.03) 45%, transparent 80%)`
            : undefined,
        }}
      />

      {/* 7. Subtle Ambient Secondary Color Wells */}
      <div className="absolute top-[35%] -left-[150px] w-[500px] h-[500px] rounded-full bg-cyan-950/20 blur-[150px]" />
      <div className="absolute top-[65%] -right-[150px] w-[600px] h-[600px] rounded-full bg-indigo-950/25 blur-[160px]" />
      <div className="absolute -bottom-[100px] left-1/3 w-[700px] h-[400px] rounded-full bg-emerald-950/15 blur-[160px]" />

      {/* 8. Fine Optical Dither & Film Grain Texture */}
      <div className="absolute inset-0 bg-grain opacity-50 mix-blend-overlay" />

      {/* 9. Cinematic Vignette Frame */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(3, 3, 5, 0.85) 100%)'
        }}
      />
    </div>
  );
};
