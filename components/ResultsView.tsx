
import React, { useState, useEffect, useMemo } from 'react';
import { CalculationResults, UserInputs, DietaryPreference } from '../types';
import { FOOD_RECOMMENDATIONS, MacroFood } from '../constants';
import { HudCard } from './ui/HudCard';
import { Badge } from './ui/Badge';
import { MetricRow } from './ui/MetricRow';

interface ResultsViewProps {
  results: CalculationResults;
  inputs: UserInputs;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, inputs, onReset }) => {
  const [macros, setMacros] = useState({ p: results.proteinPct, c: results.carbsPct, f: results.fatPct });
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('non-veg');
  const [displayCals, setDisplayCals] = useState(0);

  useEffect(() => {
    setMacros({ p: results.proteinPct, c: results.carbsPct, f: results.fatPct });
    let start = 0;
    const timer = setInterval(() => {
      start += (results.calories / 60);
      if (start >= results.calories) { setDisplayCals(results.calories); clearInterval(timer); }
      else { setDisplayCals(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [results]);

  const weightKg = inputs.unitSystem === 'imperial' ? inputs.weight * 0.453592 : inputs.weight;
  const macroValues = useMemo(() => {
    const pG = (results.calories * (macros.p / 100)) / 4;
    const fG = (results.calories * (macros.f / 100)) / 9;
    const cG = (results.calories * (macros.c / 100)) / 4;
    return { p: Math.round(pG), f: Math.round(fG), c: Math.round(cG), pPerKg: (pG / weightKg).toFixed(1) };
  }, [macros, results.calories, weightKg]);

  const adjustMacro = (key: 'p' | 'c' | 'f', value: number) => {
    const diff = value - macros[key];
    const otherKeys = (['p', 'c', 'f'] as const).filter(k => k !== key);
    setMacros(prev => {
      const updated = { ...prev, [key]: value };
      updated[otherKeys[0]] = Math.max(0, prev[otherKeys[0]] - diff / 2);
      updated[otherKeys[1]] = Math.max(0, 100 - updated[key] - updated[otherKeys[0]]);
      return updated;
    });
  };

  const getSafetyColor = () => {
    if (results.safetyLevel === 'CRITICAL') return 'text-red-500 border-red-500/40 bg-red-500/10';
    if (results.safetyLevel === 'CAUTION') return 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10';
    return 'text-green-500 border-green-500/40 bg-green-500/10';
  };

  const currentRecommendations = FOOD_RECOMMENDATIONS[dietaryPreference];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 print:space-y-6">
      <header className="text-center relative py-12">
        <div className="absolute inset-0 scanner-line no-print"></div>
        <div className={`mx-auto w-fit px-8 py-3 rounded-2xl border mb-6 transition-all ${getSafetyColor()}`}>
          <span className="text-[12px] font-black uppercase tracking-[0.3em] font-mono">SYSTEM INTEGRITY: {results.safetyLevel}</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-robust italic text-white uppercase tracking-tighter">{inputs.name}</h2>
        <div className="mt-8">
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Daily Energy Budget</span>
          <div className="flex items-start justify-center gap-2 md:gap-4">
            <div className="text-8xl md:text-9xl font-robust italic leading-none text-white tabular-nums">
              {displayCals.toLocaleString()}
            </div>
            <span className="text-2xl md:text-3xl text-[#FC4C02] font-robust italic mt-2 md:mt-4">KCAL</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Badge icon="fa-bolt" text={results.expectedWeightChange} primary />
          <Badge icon="fa-dna" text={results.formulaUsed} />
        </div>
      </header>

      {results.milestones.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.milestones.map((m, i) => (
            <HudCard key={i} className="bg-zinc-900/40" headerRight={<i className={`fa-solid ${m.icon} text-[#FC4C02] text-xs`}></i>}>
              <div className="bg-[#FC4C02]/10 border border-[#FC4C02]/30 px-3 py-1 rounded-sm w-fit mb-4">
                <span className="text-[9px] font-mono text-[#FC4C02] font-black uppercase tracking-widest">WEEKS: {m.weeks}</span>
              </div>
              <h4 className="text-xl font-robust italic text-white uppercase mb-2">{m.label}</h4>
              <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">{m.description}</p>
            </HudCard>
          ))}
        </section>
      )}

      {results.monthsToTarget && (
        <HudCard className="p-8 md:p-12 relative overflow-hidden" label="MISSION DURATION REQUIRED">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-1">
                  <div className="text-5xl md:text-8xl font-robust italic text-white leading-none">{results.monthsToTarget.split(' / ')[0]}</div>
                  <div className="text-[10px] md:text-sm font-mono text-[#FC4C02] uppercase font-black tracking-widest">ESTIMATED TIME TO TARGET</div>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-right">
                  <div className="text-[8px] font-mono text-zinc-600 uppercase">Start</div>
                  <div className="text-xl md:text-2xl font-robust text-zinc-400 italic">{inputs.weight} {inputs.unitSystem === 'metric' ? 'KG' : 'LB'}</div>
                </div>
                <i className="fa-solid fa-arrow-right text-[#FC4C02] text-xs animate-pulse"></i>
                <div className="text-left">
                  <div className="text-[8px] font-mono text-zinc-600 uppercase">Objective</div>
                  <div className="text-xl md:text-2xl font-robust text-white italic">{inputs.targetWeight} {inputs.unitSystem === 'metric' ? 'KG' : 'LB'}</div>
                </div>
              </div>
           </div>
        </HudCard>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <HudCard label="Biometric Matrix">
          <div className="space-y-4">
            <MetricRow label="Lean Mass" value={`${results.lbm} ${inputs.unitSystem === 'metric' ? 'KG' : 'LB'}`} />
            <MetricRow label="Basal Rate" value={`${results.bmr} KCAL`} />
            <MetricRow label="TDEE" value={`${results.tdee} KCAL`} />
            <MetricRow label="Intensity" value={results.expectedWeightChange} highlight />
          </div>
        </HudCard>
        <HudCard label="Dietary Optimization" className="flex flex-col justify-center items-center">
          <div className="flex bg-zinc-900/40 p-1 rounded-full border border-zinc-800 no-print mb-4">
            {(['veg', 'non-veg'] as DietaryPreference[]).map((d) => (
              <button key={d} onClick={() => setDietaryPreference(d)} className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${dietaryPreference === d ? 'bg-white text-black' : 'text-zinc-600'}`}>{d}</button>
            ))}
          </div>
          <div className="text-center">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Protocol Type</span>
            <div className="text-2xl font-robust italic text-white uppercase">{dietaryPreference === 'veg' ? 'Plant Based' : 'Omnivore'}</div>
          </div>
        </HudCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-2">
        <MacroControl label="Protein" grams={macroValues.p} pct={macros.p} sub={`${macroValues.pPerKg}g/kg`} color="accent-[#FC4C02]" onChange={v => adjustMacro('p', v)} />
        <MacroControl label="Carbohydrates" grams={macroValues.c} pct={macros.c} sub="Glycogen Fuel" color="accent-white" onChange={v => adjustMacro('c', v)} />
        <MacroControl label="Fats" grams={macroValues.f} pct={macros.f} sub="Hormonal Support" color="accent-zinc-500" onChange={v => adjustMacro('f', v)} />
      </section>

      {/* Fuel Source Suggestions Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-px flex-1 bg-zinc-900"></div>
          <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em]">Fuel Source Optimization</span>
          <div className="h-px flex-1 bg-zinc-900"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FoodCategoryCard 
            title="High Bioavailability Protein" 
            foods={currentRecommendations.protein} 
            icon="fa-egg" 
            color="text-[#FC4C02]"
          />
          <FoodCategoryCard 
            title="Performance Carbohydrates" 
            foods={currentRecommendations.carbs} 
            icon="fa-bowl-rice" 
            color="text-white"
          />
          <FoodCategoryCard 
            title="Essential Lipid Profile" 
            foods={currentRecommendations.fats} 
            icon="fa-droplet" 
            color="text-zinc-400"
          />
        </div>
      </section>

      <footer className="flex flex-col md:flex-row gap-4 pt-10 no-print">
        <button onClick={() => window.print()} className="flex-1 py-6 bg-white text-black rounded-full font-black text-[12px] uppercase tracking-widest shadow-2xl hover:bg-zinc-200 transition-all"><i className="fa-solid fa-file-pdf mr-2"></i> EXPORT DOSSIER</button>
        <button onClick={onReset} className="flex-1 py-6 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full font-black text-[12px] uppercase tracking-widest hover:text-white transition-all"><i className="fa-solid fa-rotate-left mr-2"></i> RE-IDENTIFY</button>
      </footer>
    </div>
  );
};

const MacroControl = ({ label, grams, pct, sub, color, onChange }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <label className="text-[10px] font-mono text-zinc-500 uppercase">{label}</label>
        <div className="text-7xl font-robust italic text-white leading-none">{grams}<span className="text-xl text-[#FC4C02] ml-1">G</span></div>
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-[10px] font-mono font-bold text-zinc-400 mb-1">{pct}%</span>
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">{sub}</span>
      </div>
    </div>
    <input type="range" min="10" max="70" value={pct} onChange={e => onChange(parseInt(e.target.value))} className={`w-full no-print ${color}`} />
  </div>
);

const FoodCategoryCard = ({ title, foods, icon, color }: { title: string, foods: MacroFood[], icon: string, color: string }) => (
  <HudCard className="p-5" headerRight={<i className={`fa-solid ${icon} ${color} text-xs`}></i>}>
    <h5 className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-4">{title}</h5>
    <div className="space-y-4">
      {foods.map((food, idx) => (
        <div key={idx} className="group cursor-default">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-black text-white uppercase italic group-hover:text-[#FC4C02] transition-colors">{food.name}</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">
            {food.macros}
          </div>
        </div>
      ))}
    </div>
  </HudCard>
);

export default ResultsView;
