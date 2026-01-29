import React, { useState, useEffect } from 'react';
import { DataService, UserSession } from '../services/dataService';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { BackendService, BackendSession, BackendAnalytics } from '../services/backendService';
import { AuthService } from '../services/authService';
import { HudCard } from './ui/HudCard';
import { MetricRow } from './ui/MetricRow';

interface DataPanelProps {
  onClose: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeView, setActiveView] = useState<'worldwide' | 'analytics' | 'sessions' | 'export' | 'sheets'>('worldwide');
  const [sheetsConfig, setSheetsConfig] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [worldwideData, setWorldwideData] = useState<BackendSession[]>([]);
  const [worldwideAnalytics, setWorldwideAnalytics] = useState<BackendAnalytics | null>(null);
  const [loadingWorldwide, setLoadingWorldwide] = useState(false);

  useEffect(() => {
    setSessions(DataService.getUserSessions());
    setAnalytics(DataService.getUserAnalytics());
    setSheetsConfig((window as any).CalTrakSheets?.getConfig());
    
    // Load worldwide data
    loadWorldwideData();
  }, []);

  const loadWorldwideData = async () => {
    setLoadingWorldwide(true);
    try {
      const [sessionsResponse, analytics] = await Promise.all([
        BackendService.getAllSessions(1, 50),
        BackendService.getAnalytics()
      ]);
      setWorldwideData(sessionsResponse.sessions || []);
      setWorldwideAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load worldwide data:', error);
    }
    setLoadingWorldwide(false);
  };

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

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const success = await GoogleSheetsService.testConnection();
      alert(success ? 'Connection test sent! Check your Google Sheet.' : 'Connection test failed. Check console for details.');
    } catch (error) {
      alert('Connection test failed: ' + error);
    }
    setTestingConnection(false);
  };

  const handleUpdateSheetsUrl = () => {
    const url = prompt('Enter your Google Apps Script web app URL:', sheetsConfig?.scriptUrl || '');
    if (url) {
      GoogleSheetsService.updateConfig(url, true);
      setSheetsConfig((window as any).CalTrakSheets?.getConfig());
      alert('Google Sheets URL updated! Test the connection to verify it works.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-robust italic text-white uppercase">Admin Dashboard</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Data Analytics & Configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            {AuthService.isAuthenticated() && (
              <div className="text-right mr-4">
                <p className="text-xs text-green-400">✅ Authenticated</p>
                <p className="text-[10px] text-zinc-500">
                  Session: {AuthService.getSessionTimeRemaining()}min remaining
                </p>
              </div>
            )}
            <button
              onClick={() => {
                AuthService.logout();
                onClose();
              }}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded text-xs transition-colors"
              title="Logout"
            >
              <i className="fa-solid fa-sign-out-alt mr-1"></i>
              Logout
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-times text-white text-sm"></i>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-zinc-800">
          {[
            { key: 'worldwide', label: 'Worldwide Data', icon: 'fa-globe' },
            { key: 'analytics', label: 'Local Analytics', icon: 'fa-chart-line' },
            { key: 'sessions', label: 'Local Sessions', icon: 'fa-list' },
            { key: 'sheets', label: 'Google Sheets', icon: 'fa-table' },
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
          {activeView === 'worldwide' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-robust italic text-white uppercase">🌍 Worldwide User Data</h3>
                <button
                  onClick={loadWorldwideData}
                  disabled={loadingWorldwide}
                  className="px-4 py-2 bg-[#FC4C02] text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#FC4C02]/80 transition-colors disabled:opacity-50"
                >
                  <i className={`fa-solid ${loadingWorldwide ? 'fa-spinner fa-spin' : 'fa-refresh'} mr-2`}></i>
                  Refresh
                </button>
              </div>

              {worldwideAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <HudCard label="Global Statistics">
                    <div className="space-y-4">
                      <MetricRow label="Total Users Worldwide" value={worldwideAnalytics.totalSessions.toString()} highlight />
                      <MetricRow label="Unique Users" value={worldwideAnalytics.uniqueUsers.toString()} />
                      <MetricRow label="Last 24 Hours" value={worldwideAnalytics.sessionsLast24h.toString()} />
                    </div>
                  </HudCard>
                  
                  <HudCard label="Popular Goals">
                    <div className="space-y-2">
                      {Object.entries(worldwideAnalytics.goalDistribution).map(([goal, count]) => (
                        <div key={goal} className="flex justify-between text-sm">
                          <span className="text-zinc-400 capitalize">{goal}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </HudCard>
                  
                  <HudCard label="Demographics">
                    <div className="space-y-4">
                      <MetricRow label="Most Common Country" value={worldwideAnalytics.mostCommonCountry || 'Unknown'} />
                      <MetricRow label="Avg Weight" value={`${worldwideAnalytics.averageWeight.toFixed(1)} kg`} />
                      <MetricRow label="Avg Body Fat" value={`${worldwideAnalytics.averageBodyFat.toFixed(1)}%`} />
                    </div>
                  </HudCard>
                  
                  <HudCard label="Activity">
                    <div className="space-y-4">
                      <MetricRow label="Last 7 Days" value={worldwideAnalytics.sessionsLast7days.toString()} />
                      <MetricRow label="Most Popular Goal" value={worldwideAnalytics.mostCommonGoal || 'N/A'} highlight />
                    </div>
                  </HudCard>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-robust italic text-white">Recent Worldwide Sessions</h4>
                  <button
                    onClick={() => BackendService.exportCSV()}
                    className="px-4 py-2 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-colors"
                  >
                    <i className="fa-solid fa-download mr-2"></i>
                    Export All Data
                  </button>
                </div>

                {worldwideData.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {worldwideData.slice(-20).reverse().map((session, index) => (
                      <HudCard key={session.sessionId} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-robust italic text-white">{session.inputs.name}</h4>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">
                              {new Date(session.createdAt).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-600">
                              📍 {session.metadata.country} • {session.metadata.ip}
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fa-solid fa-globe text-4xl text-zinc-600 mb-4"></i>
                    <p className="text-zinc-500 font-mono text-sm">
                      {loadingWorldwide ? 'Loading worldwide data...' : 'No worldwide data available yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {activeView === 'sheets' && (
            <div className="space-y-6">
              <HudCard label="Google Sheets Integration">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <h4 className="text-lg font-robust italic text-white mb-1">Status</h4>
                      <p className="text-sm text-zinc-400">
                        {sheetsConfig?.enabled && sheetsConfig?.scriptUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' 
                          ? '✅ Configured and Active' 
                          : '⚠️ Not Configured'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleUpdateSheetsUrl}
                        className="px-4 py-2 bg-[#FC4C02] text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#FC4C02]/80 transition-colors"
                      >
                        <i className="fa-solid fa-cog mr-2"></i>
                        Configure
                      </button>
                      <button 
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="px-4 py-2 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <i className={`fa-solid ${testingConnection ? 'fa-spinner fa-spin' : 'fa-plug'} mr-2`}></i>
                        Test
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="text-lg font-robust italic text-white mb-3">Setup Instructions</h4>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>1. Create a Google Sheet for your data</p>
                      <p>2. Set up Google Apps Script with the provided code</p>
                      <p>3. Deploy as web app with "Anyone" access</p>
                      <p>4. Configure the web app URL using the button above</p>
                      <p>5. Test the connection to verify it works</p>
                    </div>
                    <div className="mt-4 p-3 bg-zinc-900 rounded border-l-4 border-[#FC4C02]">
                      <p className="text-xs text-zinc-400">
                        📖 See <code>GOOGLE_SHEETS_SETUP.md</code> for detailed instructions
                      </p>
                    </div>
                  </div>

                  {sheetsConfig?.scriptUrl && sheetsConfig.scriptUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' && (
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="text-lg font-robust italic text-white mb-2">Current Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-zinc-500">URL:</span>
                          <span className="text-zinc-300 ml-2 font-mono text-xs break-all">
                            {sheetsConfig.scriptUrl}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Status:</span>
                          <span className={`ml-2 ${sheetsConfig.enabled ? 'text-green-400' : 'text-red-400'}`}>
                            {sheetsConfig.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="text-lg font-robust italic text-white mb-3">Debug Information</h4>
                    <button
                      onClick={() => {
                        const debugInfo = (window as any).CalTrakSheets?.getDebugInfo();
                        if (debugInfo) {
                          alert(`Last Status: ${debugInfo.status}\nTime: ${debugInfo.lastSent || debugInfo.lastError}\nSession: ${debugInfo.sessionId}\nUser: ${debugInfo.userName || 'N/A'}\nError: ${debugInfo.error || 'None'}`);
                        } else {
                          alert('No debug information available. Try using the calculator first.');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-blue-700 transition-colors mr-2"
                    >
                      <i className="fa-solid fa-bug mr-2"></i>
                      Show Debug Info
                    </button>
                    <button
                      onClick={() => {
                        (window as any).CalTrakSheets?.clearDebugInfo();
                        alert('Debug information cleared.');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-2"></i>
                      Clear Debug
                    </button>
                  </div>
                </div>
              </HudCard>
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