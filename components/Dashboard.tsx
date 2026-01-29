
import React from 'react';
import { Logo } from './ui/Logo';
import { HudCard } from './ui/HudCard';

interface DashboardProps {
  onStart: () => void;
}

const CapabilityCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="flex flex-col gap-3 p-4 border border-zinc-900 bg-zinc-900/20 rounded-xl hover:border-[#FC4C02]/30 transition-all group">
    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:bg-[#FC4C02]/10 transition-colors">
      <i className={`fa-solid ${icon} text-[#FC4C02]`}></i>
    </div>
    <h4 className="font-robust text-lg text-white uppercase italic tracking-wider leading-none">{title}</h4>
    <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">{desc}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center pt-4 md:pt-10 animate-in fade-in zoom-in-95 duration-1000 pb-12">
      
      {/* System Diagnostics Marquee */}
      <div className="w-full overflow-hidden whitespace-nowrap border-y border-zinc-900 py-2 mb-12 bg-black/40 backdrop-blur-sm">
        <div className="animate-marquee flex gap-12 items-center">
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              <span className="text-[9px] font-mono text-[#FC4C02] uppercase tracking-[0.3em] font-bold">
                <i className="fa-solid fa-microchip mr-2"></i> SYSTEM READY: MIFFLIN-ST JEOR 1.4.2
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                <i className="fa-solid fa-satellite-dish mr-2"></i> TELEMETRY SYNCED
              </span>
              <span className="text-[9px] font-mono text-[#FC4C02] uppercase tracking-[0.3em] font-bold">
                <i className="fa-solid fa-dna mr-2"></i> METABOLIC ENGINE: ONLINE
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                <i className="fa-solid fa-shield-halved mr-2"></i> INTEGRITY VERIFIED
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="relative group mb-12">
        <div className="absolute inset-0 bg-[#FC4C02]/20 blur-3xl rounded-full group-hover:bg-[#FC4C02]/40 transition-all duration-700 animate-pulse"></div>
        <div className="relative w-40 h-40 bg-zinc-900 rounded-[3rem] flex items-center justify-center border border-zinc-800 shadow-2xl overflow-hidden">
          <Logo className="w-24 h-24" />
          <div className="absolute inset-0 scanner-line"></div>
        </div>
      </div>

      <div className="relative mb-8 px-4 max-w-2xl">
        <h2 className="text-5xl md:text-7xl font-robust leading-[0.9] text-white uppercase italic tracking-tighter">
          High Performance<br/>
          <span className="text-[#FC4C02]">Body Engineering</span>
        </h2>
        <div className="mt-6 flex justify-center items-center gap-2 opacity-60">
          <div className="h-px w-8 bg-zinc-800"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">APP BY REDWHISK VERSION 1.0</span>
          <div className="h-px w-8 bg-zinc-800"></div>
        </div>
      </div>

      <p className="text-zinc-500 mb-14 px-8 leading-relaxed text-base max-w-lg font-medium italic">
        "Precision is the difference between a guess and a results. Stop playing with your nutrition. Architect it."
      </p>

      <button 
        onClick={onStart} 
        className="group relative bg-[#FC4C02] text-white px-16 py-6 rounded-full font-robust text-2xl shadow-2xl shadow-[#FC4C02]/30 transition-all active:scale-95 uppercase italic tracking-widest overflow-hidden hover:scale-105"
      >
        <span className="relative z-10 flex items-center gap-4">
          INITIALIZE BLUEPRINT 
          <i className="fa-solid fa-arrow-right-long text-lg group-hover:translate-x-2 transition-transform"></i>
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <div className="absolute inset-0 scanner-line opacity-30 group-hover:opacity-100"></div>
      </button>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
        <CapabilityCard 
          icon="fa-flask" 
          title="Metabolic Calc" 
          desc="Algorithm-driven BMR and TDEE based on lean mass preservation protocols."
        />
        <CapabilityCard 
          icon="fa-layer-group" 
          title="Macro Synthesis" 
          desc="Dynamic protein ceilings and lipid floors to optimize hormonal environment."
        />
        <CapabilityCard 
          icon="fa-person-running" 
          title="Phase Projections" 
          desc="Visual milestones for core definition and hypertrophy benchmarks."
        />
      </div>

      <HudCard className="mt-12 w-full text-left" label="Intelligence Briefing" variant="muted">
        <div className="flex items-center gap-3 text-[#FC4C02]">
          <i className="fa-solid fa-circle-check text-sm animate-pulse"></i>
          <h4 className="font-black text-white uppercase text-[10px] tracking-widest">Evidence-Based Validation</h4>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed font-mono uppercase">
          CALTRAK UTILIZES THE KATCH-MCARDLE FORMULA FOR INDIVIDUALS WITH ACCURATE BODY FAT DATA, ENSURING METABOLIC TARGETS ARE SCALED TO ACTIVE TISSUE MASS RATHER THAN TOTAL WEIGHT.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <i className="fa-solid fa-bolt text-[8px] text-[#FC4C02]"></i>
          </div>
          <span className="text-[8px] font-mono font-black uppercase text-zinc-600 tracking-widest">Calculations Validated by RedWhisk Research</span>
        </div>
      </HudCard>
    </div>
  );
};

export default Dashboard;
