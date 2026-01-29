
import React from 'react';

interface BadgeProps {
  icon?: string;
  text: string;
  primary?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ icon, text, primary, className = '' }) => (
  <span className={`
    ${primary ? 'bg-[#FC4C02] text-white shadow-[0_0_20px_rgba(252,76,2,0.3)]' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'} 
    px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 
    print:border-black print:bg-white print:text-black transition-all ${className}
  `}>
    {icon && <i className={`fa-solid ${icon} text-[9px]`}></i>} {text}
  </span>
);
