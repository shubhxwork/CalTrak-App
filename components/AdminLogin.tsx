import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { HudCard } from './ui/HudCard';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Small delay for better UX
    setTimeout(() => {
      const success = AuthService.authenticate(password);
      
      if (success) {
        onLogin();
      } else {
        setError('Invalid password. Access denied.');
        setPassword('');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <HudCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FC4C02]/10 border border-[#FC4C02]/30 flex items-center justify-center">
              <i className="fa-solid fa-lock text-2xl text-[#FC4C02]"></i>
            </div>
            <h2 className="text-2xl font-robust italic text-white uppercase mb-2">Admin Access</h2>
            <p className="text-sm text-zinc-400">Enter password to access developer features</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-[#FC4C02] focus:outline-none transition-colors"
                placeholder="Enter admin password"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg font-black text-xs uppercase tracking-widest hover:text-white hover:border-zinc-600 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#FC4C02] text-black rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#FC4C02]/80 transition-colors disabled:opacity-50"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-unlock mr-2"></i>
                    Access
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Security Notice</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                This area contains sensitive user data and configuration settings. 
                Access is restricted to authorized administrators only.
              </p>
            </div>
          </div>
        </HudCard>
      </div>
    </div>
  );
};