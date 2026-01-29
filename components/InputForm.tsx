
import React, { useState, useMemo } from 'react';
import { UserInputs, UnitSystem, Gender, ActivityLevel, Goal } from '../types';
import { ACTIVITY_DESCRIPTIONS } from '../constants';
import { HudCard } from './ui/HudCard';
import { BodyModel } from './ui/BodyModel';

interface InputFormProps {
  onCalculate: (inputs: UserInputs) => void;
  isCalculating: boolean;
  initialInputs: UserInputs | null;
}

const PhysiqueHero = ({ bf, gender }: { bf: number; gender: Gender }) => {
  const label = useMemo(() => {
    if (bf < 9) return 'Stage Lean (5-8%)';
    if (bf < 13) return 'Athletic (9-12%)';
    if (bf < 16) return 'Fitness (13-15%)';
    if (bf < 21) return 'Defined (16-20%)';
    if (bf < 26) return 'Average (20-25%)';
    if (bf < 31) return 'Soft (26-30%)';
    return 'Heavy (30-40%+)';
  }, [bf]);

  return (
    <div className="relative w-full h-80 mx-auto overflow-hidden rounded-[2rem] border border-zinc-900 bg-black shadow-inner group">
      <div className="scanner-line"></div>
      <div className="absolute inset-0 glitch-overlay z-20"></div>
      
      {/* Dynamic Body Model */}
      <BodyModel bf={bf} gender={gender} />

      <div className="absolute top-4 left-4 z-30 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FC4C02] animate-pulse"></div>
            <span className="text-[8px] font-mono font-bold uppercase text-white/50 tracking-[0.2em]">LIVE BIOMETRICS: {bf}% BF</span>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold uppercase text-[#FC4C02] tracking-[0.2em]">Morphology Status</span>
          <span className="text-3xl font-robust text-white uppercase italic leading-none">{label}</span>
        </div>
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-white/40 uppercase">
          REF: PHY-MOD-{gender.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const IntensitySafetyMeter = ({ goal, rate, weight }: { goal: 'cut' | 'bulk'; rate: number; weight: number }) => {
  const pct = (rate / weight) * 100;
  
  const status = useMemo(() => {
    if (goal === 'cut') {
      if (pct < 0.6) return { label: 'Sustainable', color: 'text-green-500', bar: 'bg-green-500', width: '33%' };
      if (pct < 1.1) return { label: 'Performance', color: 'text-yellow-500', bar: 'bg-yellow-500', width: '66%' };
      return { label: 'Extreme / Risk', color: 'text-red-500', bar: 'bg-red-500', width: '100%' };
    } else {
      if (pct < 0.26) return { label: 'Lean Bulk', color: 'text-green-500', bar: 'bg-green-500', width: '33%' };
      if (pct < 0.51) return { label: 'Standard', color: 'text-yellow-500', bar: 'bg-yellow-500', width: '66%' };
      return { label: 'Aggressive', color: 'text-red-500', bar: 'bg-red-500', width: '100%' };
    }
  }, [goal, pct]);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status.bar} animate-pulse`}></div>
          <span className={`text-[9px] font-black font-mono uppercase tracking-widest ${status.color}`}>
            Safety Index: {status.label}
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 uppercase">
          {pct.toFixed(2)}% BW/WK
        </span>
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex">
        <div className={`h-full transition-all duration-500 ease-out ${status.bar}`} style={{ width: status.width }}></div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, unit, onChange, min, max, step, subLabel }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-mono text-zinc-500 uppercase">{label}</label>
        {subLabel && <span className="text-[8px] font-mono text-[#FC4C02] uppercase tracking-wider">{subLabel}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          onWheel={(e) => e.currentTarget.blur()}
          className="w-24 text-2xl font-robust bg-transparent outline-none text-white text-right" 
        />
        <span className="text-sm font-robust text-[#FC4C02]">{unit}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full" />
  </div>
);

const InputForm: React.FC<InputFormProps> = ({ onCalculate, isCalculating, initialInputs }) => {
  const [name, setName] = useState(initialInputs?.name || '');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialInputs?.unitSystem || 'imperial');
  const [gender, setGender] = useState<Gender>(initialInputs?.gender || 'male');
  const [weight, setWeight] = useState(initialInputs?.weight.toString() || (unitSystem === 'metric' ? '75' : '165'));
  const [bodyFat, setBodyFat] = useState(initialInputs?.bodyFat.toString() || '15');
  const [age, setAge] = useState(initialInputs?.age?.toString() || '25');
  const [height, setHeight] = useState(initialInputs?.height?.toString() || (unitSystem === 'metric' ? '175' : '69'));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialInputs?.activityLevel || 'sedentary');
  const [goal, setGoal] = useState<Goal>(initialInputs?.goal || 'recomp');
  const [targetWeight, setTargetWeight] = useState(initialInputs?.targetWeight?.toString() || '');
  const [weeklyRate, setWeeklyRate] = useState<number>(initialInputs?.weeklyRate || (goal === 'bulk' ? 0.2 : 0.5));

  const bfValue = parseFloat(bodyFat) || 0;
  const weightVal = parseFloat(weight) || 0;
  const heightVal = parseFloat(height) || 0;
  const ageVal = parseInt(age) || 0;
  const targetWeightVal = parseFloat(targetWeight) || 0;

  const weightLimits = unitSystem === 'metric' ? { min: 30, max: 250, step: 0.5 } : { min: 65, max: 550, step: 1 };
  const heightLimits = unitSystem === 'metric' ? { min: 100, max: 250, step: 1 } : { min: 40, max: 100, step: 0.5 };
  const targetLimits = useMemo(() => 
    goal === 'cut' ? { min: weightLimits.min, max: weightVal, step: weightLimits.step } : { min: weightVal, max: weightLimits.max, step: weightLimits.step }
  , [goal, weightVal, weightLimits]);

  const heightSubLabel = useMemo(() => {
    if (unitSystem === 'metric') return null;
    const feet = Math.floor(heightVal / 12);
    const inches = Math.round(heightVal % 12);
    return `Anatomical Translation: ${feet}' ${inches}"`;
  }, [heightVal, unitSystem]);

  const liveDuration = useMemo(() => {
    if (goal === 'recomp' || !targetWeightVal || !weeklyRate || weightVal === targetWeightVal) return null;
    const diff = Math.abs(weightVal - targetWeightVal);
    const weeks = diff / weeklyRate;
    return { months: (weeks / 4.345).toFixed(1), weeks: Math.ceil(weeks) };
  }, [weightVal, targetWeightVal, weeklyRate, goal]);

  const isValid = name.trim().length > 0 && weight !== '' && bodyFat !== '' && weightVal > 0 && heightVal > 0 && ageVal > 0;

  const handleUnitToggle = (u: UnitSystem) => {
    if (u === unitSystem) return;
    setUnitSystem(u);
    const weightFactor = u === 'imperial' ? 2.20462 : (1 / 2.20462);
    const heightFactor = u === 'imperial' ? (1 / 2.54) : 2.54;
    
    setWeight((weightVal * weightFactor).toFixed(1));
    setHeight((heightVal * heightFactor).toFixed(1));
    if (targetWeightVal) setTargetWeight((targetWeightVal * weightFactor).toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onCalculate({
      name: name.trim(), 
      unitSystem, 
      gender, 
      weight: weightVal, 
      bodyFat: bfValue, 
      age: ageVal,
      height: heightVal,
      activityLevel, 
      goal,
      targetWeight: (goal !== 'recomp') ? targetWeightVal : undefined,
      weeklyRate: (goal !== 'recomp') ? weeklyRate : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
          {['imperial', 'metric'].map((u) => (
            <button key={u} type="button" onClick={() => handleUnitToggle(u as UnitSystem)} className={`px-6 py-2 text-[10px] font-black rounded-full transition-all uppercase tracking-[0.1em] ${unitSystem === u ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>{u}</button>
          ))}
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="IDENTIFY OPERATOR" className="bg-transparent border-b border-zinc-800 focus:border-[#FC4C02] py-2 text-sm font-mono font-bold uppercase tracking-widest outline-none text-white text-right" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <HudCard label="Biometric Baseline" module="Module 01">
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} type="button" onClick={() => setGender(g as Gender)} className={`flex-1 py-3 rounded-lg font-black border uppercase tracking-widest text-[10px] transition-all ${gender === g ? 'bg-white text-black border-white' : 'bg-transparent border-zinc-800 text-zinc-600'}`}>{g}</button>
              ))}
            </div>
            <PhysiqueHero bf={bfValue} gender={gender} />
            <InputGroup label="Estimated Body Fat" unit="%" value={bodyFat} onChange={setBodyFat} min={5} max={99} step={0.5} />
          </HudCard>

          <HudCard label="Anatomical Profile" variant="muted">
            <div className="space-y-10">
              <InputGroup label={`Current Load (${unitSystem === 'metric' ? 'KG' : 'LB'})`} unit={unitSystem === 'metric' ? 'KG' : 'LB'} value={weight} onChange={setWeight} {...weightLimits} />
              <InputGroup 
                label={`Stature (${unitSystem === 'metric' ? 'CM' : 'TOTAL INCHES'})`} 
                unit={unitSystem === 'metric' ? 'CM' : 'IN'} 
                value={height} 
                onChange={setHeight} 
                subLabel={heightSubLabel}
                {...heightLimits} 
              />
              <InputGroup label="Chronological Age" unit="YRS" value={age} onChange={setAge} min={15} max={100} step={1} />
            </div>
          </HudCard>
        </div>

        <div className="space-y-8">
          <HudCard label="Primary Objective" module="Module 02">
            <div className="grid grid-cols-3 gap-2">
              {['cut', 'recomp', 'bulk'].map((g) => (
                <button key={g} type="button" onClick={() => { setGoal(g as Goal); setWeeklyRate(g === 'bulk' ? 0.2 : 0.5); }} className={`py-4 rounded-xl text-[10px] font-black border uppercase tracking-widest transition-all ${goal === g ? 'bg-[#FC4C02] text-white border-[#FC4C02] shadow-[0_0_15px_rgba(252,76,2,0.3)]' : 'bg-transparent border-zinc-800 text-zinc-600'}`}>{g}</button>
              ))}
            </div>

            {goal !== 'recomp' && (
              <div className="space-y-8 pt-4">
                <InputGroup label="Target Threshold" unit={unitSystem === 'metric' ? 'KG' : 'LB'} value={targetWeight} onChange={setTargetWeight} {...targetLimits} />
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                    <span>Intensity Level</span>
                    <span className="text-[#FC4C02] font-bold">{weeklyRate} {unitSystem}/wk</span>
                  </div>
                  <input type="range" min={goal === 'cut' ? 0.1 : 0.05} max={goal === 'cut' ? 1.5 : 1.0} step="0.05" value={weeklyRate} onChange={(e) => setWeeklyRate(parseFloat(e.target.value))} className="w-full" />
                  <IntensitySafetyMeter goal={goal as 'cut' | 'bulk'} rate={weeklyRate} weight={weightVal} />
                </div>

                {liveDuration && (
                  <div className="bg-zinc-900/80 border-l-2 border-[#FC4C02] p-4 rounded-r-lg animate-pulse">
                    <div className="text-[8px] font-mono text-zinc-600 uppercase mb-1">MISSION DURATION ESTIMATE</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-robust text-white uppercase italic">{liveDuration.months} MONTHS</span>
                      <span className="text-[10px] font-mono text-[#FC4C02] uppercase">({liveDuration.weeks} WEEKS)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </HudCard>

          <HudCard label="Activity Multiplier" variant="muted">
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className="w-full bg-transparent border border-zinc-800 rounded-lg p-3 font-mono text-[10px] text-white uppercase outline-none focus:border-[#FC4C02]">
                {Object.keys(ACTIVITY_DESCRIPTIONS).map((level) => (<option key={level} value={level} className="bg-black">{level.replace('_', ' ').toUpperCase()}</option>))}
            </select>
          </HudCard>

          <button type="submit" disabled={!isValid || isCalculating} className={`w-full py-6 rounded-full text-xl font-robust tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${!isValid || isCalculating ? 'bg-zinc-900 text-zinc-700' : 'bg-[#FC4C02] text-white shadow-[0_0_30px_rgba(252,76,2,0.2)] hover:shadow-[0_0_50px_rgba(252,76,2,0.4)] active:scale-[0.98]'}`}>
            {isCalculating ? 'INITIALIZING...' : 'COMPILE BLUEPRINT'} <i className="fa-solid fa-bolt-lightning"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputForm;
