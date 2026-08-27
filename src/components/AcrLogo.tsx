import React from 'react';

interface AcrLogoProps {
  className?: string;
  size?: number;
}

export const AcrLogo: React.FC<AcrLogoProps> = ({ className = 'h-7 w-7', size }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 group-hover:scale-105`}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Luminous Cyan to Indigo & Emerald Gradient */}
        <linearGradient id="acr-grad-primary" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="acr-grad-glow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
        </linearGradient>

        <filter id="acr-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Consensus Umbrella / Overhead Dynamic Arch */}
      <path
        d="M26 42 C32 26, 68 26, 74 42 C64 34, 36 34, 26 42 Z"
        fill="url(#acr-grad-primary)"
        filter="url(#acr-glow)"
      />

      {/* Interlocking Agentic Nexus Wings (A / Convergence Fold) */}
      <path
        d="M50 82 L20 48 C14 41, 19 33, 29 34 C35 34, 40 38, 44 44 L50 54 L56 44 C60 38, 65 34, 71 34 C81 33, 86 41, 80 48 L50 82 Z"
        fill="url(#acr-grad-primary)"
      />

      {/* Inner Negative Space Sculpting for Crisp Architectural Sharpness */}
      <path
        d="M50 72 L32 50 C29 46, 31 42, 36 42 C41 42, 45 46, 48 50 L50 53 L52 50 C55 46, 59 42, 64 42 C69 42, 71 46, 68 50 L50 72 Z"
        fill="#030305"
      />

      {/* Three Autonomous Agent Peer Nodes (Top, Left, Right) */}
      {/* Top Consensus Beacon */}
      <circle cx="50" cy="18" r="5" fill="#38bdf8" />
      <circle cx="50" cy="18" r="2.2" fill="#ffffff" />

      {/* Left Agent Peer Node */}
      <circle cx="23" cy="38" r="4.5" fill="#38bdf8" />
      <circle cx="23" cy="38" r="2" fill="#ffffff" />

      {/* Right Agent Peer Node */}
      <circle cx="77" cy="38" r="4.5" fill="#34d399" />
      <circle cx="77" cy="38" r="2" fill="#ffffff" />
    </svg>
  );
};
