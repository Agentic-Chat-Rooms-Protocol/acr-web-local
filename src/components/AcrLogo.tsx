import React from 'react';

interface AcrLogoProps {
  className?: string;
  size?: number;
  variant?: 'alt' | 'nexus';
}

export const AcrLogo: React.FC<AcrLogoProps> = ({ className = 'h-7 w-7', size, variant = 'alt' }) => {
  if (variant === 'nexus') {
    return (
      <svg
        viewBox="0 0 1086.95 924.65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-all duration-300 group-hover:scale-105`}
        style={size ? { width: size, height: size } : undefined}
        aria-label="Agentic Chat Rooms Official Logo"
        role="img"
      >
        <defs>
          <linearGradient id="acr-nexus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="acr-nexus-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          fill="url(#acr-nexus-grad)"
          filter="url(#acr-nexus-glow)"
          d="M543.44,701.22c3.1-4.76,5.94-8.94,8.61-13.23,36.06-57.86,72.07-115.74,108.14-173.6,19.59-31.43,38.6-63.24,59.03-94.11,33.62-50.82,80.98-81.64,140.85-93.04,7.26-1.38,14.69-1.91,22.03-2.83,1.7-.21,3.4-.42,5.57-.69-31.47-20.9-30.31-55.9-12.04-75.55,19.61-21.1,51.95-21.51,71.47-1.12,17.79,18.59,22.51,55.96-12.24,76.38,12.97,2.64,27.19,4.33,40.65,8.49,59.04,18.25,95.25,57.96,107.95,118.48,2.37,11.32,3.17,23.14,3.27,34.74.36,41.73.2,83.46.06,125.2-.06,17.94-7.29,32.38-22.14,42.76-8.5,5.94-18.02,8.42-28.31,8.41-25.95-.02-51.89.07-77.84.07-56.97,0-113.94-.04-170.91-.06-2.55,0-5.11,0-8.34,0,.94-1.89,1.44-3.12,2.12-4.24,20.85-34.04,41.67-68.1,62.63-102.08,5.02-8.14,12.77-11.73,22.24-11.73,28.83-.01,57.66,0,86.49-.03,2.17,0,4.41-.12,6.51-.62,4.09-.99,6.63-4.12,6.64-8.29.05-21,.53-42.02-.16-63-.84-25.52-22.99-49.23-49.05-52.16-35.28-3.97-62.38,10.73-81.34,39.85-19.76,30.34-38.27,61.49-57.46,92.2-24.72,39.54-49.6,78.98-74.35,118.5-20.82,33.25-41.46,66.62-62.33,99.84-31.67,50.42-63.46,100.75-95.21,151.12-.71,1.12-1.54,2.17-2.7,3.79-5.08-7.91-9.93-15.3-14.63-22.8-47.54-75.78-95.09-151.54-142.55-227.36-32.1-51.29-64-102.7-96.11-153.98-14.7-23.49-29.28-47.07-44.67-70.11-13.64-20.43-50.86-40.35-84.51-28.77-24,8.26-40.4,30.22-40.63,55.8-.16,18.12-.05,36.24,0,54.36.02,8.09,3.71,11.68,11.94,11.68,28.83.01,57.66.18,86.48-.13,11.29-.12,19.53,4.24,25.34,13.72,20.79,33.92,41.6,67.82,62.39,101.73.41.67.67,1.43,1.15,2.49-1.41.09-2.45.22-3.49.22-84.29,0-168.58-.03-252.87,0-17.47,0-31.34-6.97-41.55-21.09-5.4-7.47-9.11-15.73-9.18-25.11-.2-29.1-.29-58.2-.3-87.3-.01-17.98-.39-35.99.39-53.94,2.96-68.53,45.72-123.16,111.44-142.74,7.07-2.11,14.37-3.55,21.65-4.79,7.12-1.21,14.35-1.78,22.19-2.7-17.06-10.88-26.99-25.6-26.18-45.96.56-13.99,6.55-25.65,17.25-34.72,21.61-18.33,53.83-14.72,70.72,8,16.41,22.07,13.29,53.97-18.3,72.72,2.16.2,3.56.34,4.97.45,68.18,5.57,122.29,36.44,160.53,92.81,27.86,41.06,53.2,83.83,79.57,125.9,20.54,32.77,40.93,65.65,61.4,98.47,11.54,18.51,23.11,37,34.69,55.49.79,1.26,1.73,2.43,3.03,4.23Z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 group-hover:scale-105`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Agentic Chat Rooms Official Logo"
      role="img"
    >
      <defs>
        {/* Dynamic Luminous Cyan to Indigo & Emerald Brand Scale */}
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

      {/* Inner Negative Space Sculpting */}
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
