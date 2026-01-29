
import React from 'react';

interface MetricRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  subValue?: string;
}

export const MetricRow: React.FC<MetricRowProps> = ({ label, value, highlight, subValue }) => (
  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
    <div className="flex flex-col">
      <span className="text-zinc-500 font-black uppercase text-[9px] tracking-widest">{label}</span>
      {subValue && <span className="text-[7px] font-mono text-zinc-700 uppercase">{subValue}</span>}
    </div>
    <span className={`font-black text-sm uppercase italic tracking-tighter ${highlight ? 'text-[#FC4C02]' : 'text-white'}`}>
      {value}
    </span>
  </div>
);
