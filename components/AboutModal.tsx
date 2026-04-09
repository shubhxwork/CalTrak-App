/**
 * AboutModal — Pure UI Component
 *
 * Extracted from App.tsx where it was an inline 100-line JSX block.
 * SRP: Only renders the About modal. No state, no logic.
 */
import React from 'react';

interface Props { onClose: () => void; }

export const AboutModal: React.FC<Props> = ({ onClose }) => (
  <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="bg-gradient-to-r from-[#FC4C02] to-[#FC4C02]/80 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-heart text-2xl text-white"></i>
        </div>
        <h2 className="text-2xl font-robust italic text-black uppercase mb-2">About CalTrak</h2>
        <p className="text-sm text-black/80">Precision Nutrition Calculator</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-robust italic text-white mb-3">Developed by RedWhisk</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            CalTrak is a precision nutrition calculator designed to provide accurate macro calculations
            and personalized nutrition guidance. Built with cutting-edge algorithms and a focus on user experience.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Features</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              ['fa-calculator',  'Advanced macro calculations'],
              ['fa-target',      'Goal-specific recommendations'],
              ['fa-chart-line',  'Progress tracking & milestones'],
              ['fa-utensils',    'Personalized food recommendations'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-3 text-sm text-zinc-300">
                <i className={`fa-solid ${icon} text-[#FC4C02] w-4`}></i>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-4">Follow us for updates</p>
          <a
            href="https://www.instagram.com/reddwhisk/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <i className="fa-brands fa-instagram text-lg"></i>
            @reddwhisk
          </a>
        </div>

        <div className="text-center pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 font-mono">CalTrak v2.0 • Built with ❤️ by RedWhisk</p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full font-black text-xs uppercase tracking-widest transition-all"
        >
          <i className="fa-solid fa-times mr-2"></i>Close
        </button>
      </div>
    </div>
  </div>
);
