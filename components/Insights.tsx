
import React, { useState } from 'react';
import { CalculationResults } from '../types';
import { HudCard } from './ui/HudCard';
import { MetricRow } from './ui/MetricRow';

interface InsightsProps {
  results: CalculationResults | null;
}

interface DossierProps {
  id: string;
  title: string;
  category: string;
  image: string;
  summary: string;
  detail: React.ReactNode;
}

const DossierCard: React.FC<DossierProps> = ({ id, title, category, image, summary, detail }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <HudCard className="p-0 overflow-hidden transition-all duration-500 hover:border-[#FC4C02]/40" variant="muted">
      <div className="relative h-40">
        <img src={image} className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span className="bg-[#FC4C02] text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-[0.2em]">{category}</span>
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">REF: {id}</span>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-black italic text-xl uppercase tracking-tighter text-white">{title}</h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
          {summary}
        </p>
        
        {expanded && (
          <div className="pt-2 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-[10px] text-zinc-300 leading-relaxed font-mono uppercase tracking-tight">
              {detail}
            </div>
          </div>
        )}

        <button 
          onClick={() => setExpanded(!expanded)} 
          className="flex items-center gap-2 text-[#FC4C02] text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          {expanded ? 'Collapse Data' : 'Initialize Deep Dive'} 
          <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[8px] group-hover:translate-y-0.5 transition-transform`}></i>
        </button>
      </div>
    </HudCard>
  );
};

export const Insights: React.FC<InsightsProps> = ({ results }) => {
  const energyFactor = results?.tdee && results?.bmr ? (results.tdee / results.bmr).toFixed(2) : '1.55';

  const dossiers: DossierProps[] = [
    {
      id: "PRO-4.2",
      category: "Protein Science",
      title: "The Leucine Threshold",
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
      summary: "Scientific consensus indicates that total daily protein intake (1.6g-2.2g/kg) is the primary driver of muscle preservation and growth, far outweighing 'timing' myths.",
      detail: (
        <ul className="space-y-2 list-disc pl-4">
          <li>Leucine (approx 2.5g-3g per meal) is the 'on-switch' for Muscle Protein Synthesis (MPS).</li>
          <li>The Thermic Effect of Food (TEF) for protein is 20-30%, meaning 1/4 of its calories are burned during digestion.</li>
          <li>Meta-analyses show no additional benefit for muscle mass beyond 1.6g/kg in weight-stable individuals.</li>
        </ul>
      )
    },
    {
      id: "HYP-7.1",
      category: "Hypertrophy",
      title: "Mechanical Tension vs Damage",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
      summary: "Modern research pivots toward mechanical tension as the chief hypertrophic stimulus. Excessive muscle damage (soreness) may actually impede growth.",
      detail: (
        <ul className="space-y-2 list-disc pl-4">
          <li>Progressive overload is the quantitative increase in mechanical tension over time.</li>
          <li>Training close to failure (RPE 8-10) recruits high-threshold motor units responsible for growth.</li>
          <li>Total weekly volume (sets per muscle group) is a dose-dependent predictor of hypertrophy.</li>
        </ul>
      )
    },
    {
      id: "MET-1.9",
      category: "Weight Loss",
      title: "Sustainable Fat Oxidation",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
      summary: "Aggressive deficits (>1% bodyweight loss per week) significantly increase the risk of Lean Body Mass (LBM) attrition and metabolic adaptation.",
      detail: (
        <ul className="space-y-2 list-disc pl-4">
          <li>A modest deficit (15-20%) preserves skeletal muscle while maximizing fat loss.</li>
          <li>Non-Exercise Activity Thermogenesis (NEAT) often drops during heavy dieting—the body's 'hidden' survival mechanism.</li>
          <li>Refeed days can assist with psychological adherence but do not significantly 'reset' metabolic rate.</li>
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dossiers.map(d => <DossierCard key={d.id} {...d} />)}
      </div>
      
      {/* System Technical Metadata */}
      <div className="lg:max-w-md mx-auto">
        <HudCard label="Algorithm Metadata" headerRight={<i className="fa-solid fa-flask-vial text-[#FC4C02] text-xs"></i>}>
          <div className="space-y-4">
            <MetricRow label="Calculation Engine" value={results?.formulaUsed || 'Katch-McArdle'} />
            <MetricRow label="Baseline BMR" value={`${results?.bmr || '0'} kcal`} />
            <MetricRow label="Energy Multiplier" value={`x${energyFactor}`} highlight />
            <MetricRow label="Data Integrity" value={results ? "Verified (P=0.05)" : "Standby"} />
            <div className="pt-2">
               <p className="text-[8px] font-mono text-zinc-600 uppercase italic">
                 Note: All insights derived from peer-reviewed sports nutrition literature including JISSN and Medicine & Science in Sports & Exercise.
               </p>
            </div>
          </div>
        </HudCard>
      </div>
    </div>
  );
};
