
import React from 'react';

interface LogoProps {
  className?: string;
}

/**
 * CalTrak "Precision Trace" Logo
 * Designed for High-Performance Nutrition HUD.
 * Minimalist, geometric, and aggressive.
 */
export const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} overflow-visible`} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* High-Octane CalTrak Gradient */}
      <linearGradient id="logo-trace-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC700" />
        <stop offset="45%" stopColor="#FC4C02" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      
      {/* HUD Scanner Glow */}
      <filter id="trace-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Vector Mask for the inner cut-out */}
      <mask id="logo-mask">
        <rect width="100" height="100" fill="white" />
        <path d="M 42 42 H 58 V 58 H 42 Z" fill="black" />
      </mask>
    </defs>

    {/* Italicized Technical Monogram */}
    <g transform="skewX(-15) translate(10, 0)" filter="url(#trace-glow)">
      
      {/* Main 'C' Path - The Boundary */}
      <path 
        d="M 60 15 
           H 20 
           V 85 
           H 60 
           V 68 
           H 35 
           V 32 
           H 60 
           Z" 
        fill="url(#logo-trace-grad)" 
      />

      {/* Main 'T' Path - The Tracker (Interlocked) */}
      <path 
        d="M 45 42 
           H 85 
           V 58 
           H 73 
           V 85 
           H 57 
           V 58 
           H 45 
           Z" 
        fill="white" 
      />

      {/* Secondary accent line suggesting "Tracking" */}
      <rect x="73" y="15" width="12" height="6" fill="#FC4C02" opacity="0.6" />
      <rect x="73" y="25" width="12" height="3" fill="#FC4C02" opacity="0.3" />
    </g>

    {/* Micro-HUD Peripheral Brackets */}
    <g stroke="#FC4C02" strokeWidth="1.5" fill="none" opacity="0.4">
      <path d="M 15 10 H 5 V 20" /> {/* Top Left */}
      <path d="M 85 10 H 95 V 20" /> {/* Top Right */}
      <path d="M 15 90 H 5 V 80" /> {/* Bottom Left */}
      <path d="M 85 90 H 95 V 80" /> {/* Bottom Right */}
    </g>

    {/* Optical Sensor Point */}
    <circle cx="90" cy="50" r="1.5" fill="#FC4C02" className="animate-pulse" />
  </svg>
);
