
import React, { useMemo } from 'react';
import { Gender } from '../../types';

interface BodyModelProps {
  bf: number;
  gender: Gender;
}

export const BodyModel: React.FC<BodyModelProps> = ({ bf, gender }) => {
  // Advanced morphology factors based on the 7-stage reference image
  const factors = useMemo(() => {
    // n is 0.0 at 5% BF, 1.0 at 40% BF
    const n = Math.max(0, Math.min(1, (bf - 5) / 35));
    
    return {
      n,
      // Protrusion starts accelerating after 20%
      bellyProtrusion: Math.pow(n, 1.8),
      // Muscle definition is sharpest at 5%, mostly gone by 18%
      definition: Math.max(0, 1 - (bf - 5) / 15),
      // Chest transforms from "Plateau" to "Rounded"
      chestDrop: Math.max(0, (bf - 22) / 18),
      // Limbs thicken linearly with BF
      limbGirth: 0.8 + (n * 0.6)
    };
  }, [bf]);

  // Scaled dimensions for the 100x160 SVG canvas
  const shoulderWidth = gender === 'male' ? 36 : 32;
  // At 5%, waist is ~60% of shoulders. At 40%, waist is ~130% of shoulders.
  const waistWidth = (shoulderWidth * 0.65) + (factors.bellyProtrusion * 45);
  const hipWidth = (gender === 'female' ? 30 : 24) + (factors.n * 20);
  const neckWidth = 9 + (factors.n * 6);
  const limbWidth = 7 * factors.limbGirth;

  // Path Anchor Points
  const yNeck = 22;
  const yChest = 48;
  const yWaist = 88;
  const yHips = 118;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-12 bg-[radial-gradient(circle_at_center,_rgba(252,76,2,0.03)_0%,_transparent_80%)]">
      {/* Bio-HUD Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>
      
      <svg viewBox="0 0 100 160" className="h-full w-auto drop-shadow-[0_0_20px_rgba(252,76,2,0.2)] transition-all duration-700 ease-in-out overflow-visible">
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#151515" />
            <stop offset="100%" stopColor="#080808" />
          </linearGradient>
          
          <radialGradient id="torsoHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FC4C02" stopOpacity={0.05 + factors.n * 0.15} />
            <stop offset="100%" stopColor="#FC4C02" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="transition-all duration-700">
          {/* Main Torso Morpher */}
          <path
            d={`
              M 50 ${12 + factors.n * 4}
              L ${50 - neckWidth/2} ${yNeck}
              C ${50 - shoulderWidth/2} ${yNeck + 5}, ${50 - shoulderWidth/2} ${yChest - 10}, ${50 - (shoulderWidth - 2)/2} ${yChest}
              C ${50 - (shoulderWidth - 2)/2} ${yChest + 15}, ${50 - waistWidth/2} ${yWaist - 15}, ${50 - waistWidth/2} ${yWaist}
              C ${50 - waistWidth/2} ${yWaist + 15}, ${50 - hipWidth/2} ${yHips - 5}, ${50 - hipWidth/2} ${yHips}
              L ${50 + hipWidth/2} ${yHips}
              C ${50 + hipWidth/2} ${yHips - 5}, ${50 + waistWidth/2} ${yWaist + 15}, ${50 + waistWidth/2} ${yWaist}
              C ${50 + waistWidth/2} ${yWaist - 15}, ${50 + (shoulderWidth - 2)/2} ${yChest + 15}, ${50 + (shoulderWidth - 2)/2} ${yChest}
              C ${50 + (shoulderWidth - 2)/2} ${yChest - 10}, ${50 + shoulderWidth/2} ${yNeck + 5}, ${50 + neckWidth/2} ${yNeck}
              Z
            `}
            fill="url(#skinGrad)"
            stroke="#FC4C02"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Subcutaneous Adipose Highlight */}
          <ellipse cx="50" cy={yWaist} rx={waistWidth/2.2} ry={waistWidth/3} fill="url(#torsoHighlight)" />

          {/* Anatomical Definition (Abs/Chest) - Fades with BF */}
          <g opacity={factors.definition} stroke="rgba(252, 76, 2, 0.4)" strokeWidth="0.5" fill="none">
            <path d="M 40 45 Q 50 42 60 45" /> {/* Pectoral line */}
            <path d="M 45 65 H 55" opacity="0.5" /> {/* Ab row 1 */}
            <path d="M 45 73 H 55" opacity="0.5" /> {/* Ab row 2 */}
            <path d="M 45 81 H 55" opacity="0.5" /> {/* Ab row 3 */}
            <line x1="50" y1="60" x2="50" y2="90" strokeOpacity="0.2" /> {/* Linea Alba */}
          </g>

          {/* Adipose Softness Detail (Folds) - Appears at 25%+ */}
          <g opacity={Math.max(0, (bf - 24) / 16)} stroke="rgba(252, 76, 2, 0.2)" fill="none" strokeWidth="0.5">
             <path d={`M ${50 - waistWidth/4} 95 Q 50 98 ${50 + waistWidth/4} 95`} />
             <path d={`M ${50 - waistWidth/3} 108 Q 50 112 ${50 + waistWidth/3} 108`} />
          </g>

          {/* Head */}
          <ellipse cx="50" cy="12" rx={7 + factors.n * 2} ry="9" fill="#080808" stroke="#FC4C02" strokeWidth="1" />

          {/* Limbs */}
          <g opacity="0.8">
            {/* Arms */}
            <path d={`M ${50 - (shoulderWidth - 2)/2} 35 L ${50 - shoulderWidth/2 - 5} 95`} stroke="#FC4C02" strokeWidth={limbWidth} strokeLinecap="round" />
            <path d={`M ${50 + (shoulderWidth - 2)/2} 35 L ${50 + shoulderWidth/2 + 5} 95`} stroke="#FC4C02" strokeWidth={limbWidth} strokeLinecap="round" />
            {/* Legs */}
            <path d={`M ${50 - hipWidth/4} 118 L ${50 - hipWidth/3.5} 155`} stroke="#FC4C02" strokeWidth={limbWidth + 1} strokeLinecap="round" />
            <path d={`M ${50 + hipWidth/4} 118 L ${50 + hipWidth/3.5} 155`} stroke="#FC4C02" strokeWidth={limbWidth + 1} strokeLinecap="round" />
          </g>
        </g>

        {/* HUD Data Tags - Fixed positioning to avoid clash */}
        <g className="font-mono text-[3px] fill-zinc-500 uppercase tracking-tighter select-none">
          <text x="2" y="24">Structural Ref</text>
          <text x="2" y="28" className="fill-[#FC4C02] font-bold">PHYSIQUE.OS v4.2</text>
          
          <line x1="85" y1={yWaist} x2="98" y2={yWaist} stroke="#FC4C02" strokeWidth="0.2" strokeDasharray="1 1" />
          <text x="82" y={yWaist - 2} textAnchor="end">Mass Zone</text>
        </g>
      </svg>
    </div>
  );
};
