import React, { useState, useEffect } from 'react';
import { DataService, UserSession } from '../services/dataService';
import { HudCard } from './ui/HudCard';
import { MetricRow } from './ui/MetricRow';

interface DataPanelProps {
  onClose: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeView, setActiveView] = useState<'analytics' | 'sessions' | 'export'>('analytics');

  useEffect(() => {
    setSessions(DataService.getUserSessions());
    setAnalytics(DataService.getUserAnalytics());
  }, []);

  const handleExport = () => {
    const data = DataService.exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caltrak-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all user data? This cannot be undone.')) {
      DataService.clearUserData();
      setSessions([]);
      setAnalytics(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-robust italic text-white uppercase">Data Analytics</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Developer Panel</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-times text-white text-sm"></i>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-zinc-800">
          {[
            { key: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
            { key: 'sessions', label: 'Sessions', icon: 'fa-list' },
            { key: 'export', label: 'Export', icon: 'fa-download' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                activeView === tab.key 
                  ? 'bg-[#FC4C02] text-black font-black' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'analytics' && (
            <div className="space-y-6">
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <HudCard label="Usage Statistics">
                    <div className="space-y-4">
                      <MetricRow label="Total Sessions" value={analytics.totalSessions.toString()} />
                      <MetricRow label="Unique Users" value={analytics.uniqueUsers.toString()} />
                      <MetricRow label="Most Common Goal" value={analytics.mostCommonGoal || 'N/A'} highlight />
                    </div>
                  </HudCard>
                  
                  <HudCard label="User Averages">
                    <div className="space-y-4">
                      <MetricRow label="Avg Weight" value={`${analytics.averageWeight.toFixed(1)} kg`} />
                      <MetricRow label="Avg Body Fat" value={`${analytics.averageBodyFat.toFixed(1)}%`} />
                      <MetricRow label="Weight Trend" value={analytics.weightTrend} highlight />
                    </div>
                  </HudCard>
                  
                  <HudCard label="Timeline">
                    <div className="space-y-4">
                      <MetricRow label="First Session" value={new Date(analytics.firstSession).toLocaleDateString()} />
                      <MetricRow label="Last Session" value={new Date(analytics.lastSession).toLocaleDateString()} />
                      <MetricRow label="Body Fat Trend" value={analytics.bodyFatTrend} highlight />
                    </div>
                  </HudCard>
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fa-solid fa-chart-line text-4xl text-zinc-600 mb-4"></i>
                  <p className="text-zinc-500 font-mono text-sm">No data available yet</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'sessions' && (
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.slice().reverse().map((session, index) => (
                  <HudCard key={session.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-robust italic text-white">{session.inputs.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">
                          {new Date(session.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-robust italic text-[#FC4C02]">
                          {session.results.calories} KCAL
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">
                          {session.inputs.goal}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500">Weight:</span>
                        <span className="text-white ml-2">{session.inputs.weight} {session.inputs.unitSystem === 'metric' ? 'kg' : 'lb'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Body Fat:</span>
                        <span className="text-white ml-2">{session.inputs.bodyFat}%</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Activity:</span>
                        <span className="text-white ml-2">{session.inputs.activityLevel}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">BMR:</span>
                        <span className="text-white ml-2">{session.results.bmr} kcal</span>
                      </div>
                    </div>
                  </HudCard>
                ))
              ) : (
                <div className="text-center py-12">
                  <i className="fa-solid fa-list text-4xl text-zinc-600 mb-4"></i>
                  <p className="text-zinc-500 font-mono text-sm">No sessions recorded yet</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'export' && (
            <div className="space-y-6">
              <HudCard label="Data Management">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-robust italic text-white mb-2">Export Data</h4>
                    <p className="text-sm text-zinc-400 mb-4">
                      Download all user data as JSON file for backup or analysis.
                    </p>
                    <button 
                      onClick={handleExport}
                      className="px-6 py-3 bg-[#FC4C02] text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#FC4C02]/80 transition-colors"
                    >
                      <i className="fa-solid fa-download mr-2"></i>
                      Export JSON
                    </button>
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-6">
                    <h4 className="text-lg font-robust italic text-red-400 mb-2">Clear Data</h4>
                    <p className="text-sm text-zinc-400 mb-4">
                      Permanently delete all stored user data. This action cannot be undone.
                    </p>
                    <button 
                      onClick={handleClearData}
                      className="px-6 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-2"></i>
                      Clear All Data
                    </button>
                  </div>
                </div>
              </HudCard>

              <HudCard label="Developer Console Access">
                <div className="bg-zinc-800 p-4 rounded-lg font-mono text-sm">
                  <p className="text-zinc-400 mb-2">Access data programmatically via browser console:</p>
                  <div className="space-y-1 text-[#FC4C02]">
                    <div>window.CalTrakData.analytics()</div>
                    <div>window.CalTrakData.sessions()</div>
                    <div>window.CalTrakData.export()</div>
                    <div>window.CalTrakData.clear()</div>
                  </div>
                </div>
              </HudCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};