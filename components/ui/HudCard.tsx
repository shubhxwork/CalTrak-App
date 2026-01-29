
import React from 'react';

interface HudCardProps {
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  label?: string;
  module?: string;
  variant?: 'default' | 'muted';
}

export const HudCard: React.FC<HudCardProps> = ({ 
  children, 
  className = '', 
  label, 
  module, 
  headerRight,
  variant = 'default'
}) => (
  <div className={`
    hud-border p-6 rounded-2xl space-y-6 transition-all duration-300
    ${variant === 'muted' ? 'bg-zinc-900/30' : 'bg-zinc-900/50'}
    ${className}
  `}>
    {(label || module || headerRight) && (
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col gap-0.5">
          {label && <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>}
          {module && <span className="text-[10px] font-mono text-[#FC4C02] uppercase tracking-[0.2em] italic font-bold">{module}</span>}
        </div>
        {headerRight}
      </div>
    )}
    {children}
  </div>
);
