
import React from 'react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    aria-label={label}
    className={`
      flex flex-col items-center gap-1.5 transition-all duration-300 
      ${active ? 'text-[#FC4C02] scale-110' : 'text-zinc-600 hover:text-zinc-400'}
    `}
  >
    <i className={`fa-solid ${icon} text-lg`}></i>
    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);
