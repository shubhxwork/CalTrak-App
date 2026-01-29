import React, { useState, useEffect } from 'react';
import { BackendService, BackendSession, BackendAnalytics } from '../services/backendService';
import { AuthService } from '../services/authService';
import { HudCard } from './ui/HudCard';
import { MetricRow } from './ui/MetricRow';

interface DataPanelProps {
  onClose: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'worldwide' | 'sheets'>('worldwide');
  const [testingConnection, setTestingConnection] = useState(false);
  const [worldwideData, setWorldwideData] = useState<BackendSession[]>([]);
  const [worldwideAnalytics, setWorldwideAnalytics] = useState<BackendAnalytics | null>(null);
  const [loadingWorldwide, setLoadingWorldwide] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [exportStatus, setExportStatus] = useState<{type: 'success' | 'error', message: string, details?: string} | null>(null);

  useEffect(() => {
    // Load worldwide data on component mount
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

  const handleExportToSheets = async () => {
    setLoadingExport(true);
    setExportStatus(null);
    
    try {
      console.log('🚀 Starting worldwide data export to CSV...');
      
      // Get all worldwide data
      const [sessionsResponse, analytics] = await Promise.all([
        BackendService.getAllSessions(1, 1000), // Get more sessions for export
        BackendService.getAnalytics()
      ]);
      
      const sessions = sessionsResponse.sessions || [];
      
      if (sessions.length === 0) {
        setExportStatus({
          type: 'error',
          message: 'No worldwide data available to export',
          details: 'Make sure users have used the calculator and data is being saved to the backend.'
        });
        return;
      }

      // Create CSV headers
      const headers = [
        'Timestamp', 'Session ID', 'Name', 'Age', 'Gender', 'Weight', 'Height',
        'Body Fat %', 'Unit System', 'Activity Level', 'Goal', 'Target Weight',
        'Weekly Rate', 'Calories', 'Protein (g)', 'Protein %', 'Carbs (g)',
        'Carbs %', 'Fat (g)', 'Fat %', 'Fiber (g)', 'Water (L)', 'LBM',
        'BMR', 'TDEE', 'Formula Used', 'Expected Change', 'Safety Level',
        'Months to Target', 'Milestone Count', 'Country', 'City', 'Device', 'Browser'
      ];

      // Create CSV rows
      const rows = sessions.map(session => [
        new Date(session.createdAt).toISOString(),
        session.sessionId,
        session.inputs.name,
        session.inputs.age || '',
        session.inputs.gender,
        session.inputs.weight,
        session.inputs.height || '',
        session.inputs.bodyFat,
        session.inputs.unitSystem,
        session.inputs.activityLevel,
        session.inputs.goal,
        session.inputs.targetWeight || '',
        session.inputs.weeklyRate || '',
        session.results.calories,
        session.results.proteinG,
        session.results.proteinPct,
        session.results.carbsG,
        session.results.carbsPct,
        session.results.fatG,
        session.results.fatPct,
        session.results.fiberG,
        session.results.waterLiters,
        session.results.lbm,
        session.results.bmr,
        session.results.tdee,
        session.results.formulaUsed,
        session.results.expectedWeightChange,
        session.results.safetyLevel,
        session.results.monthsToTarget || '',
        session.results.milestones?.length || 0,
        session.metadata.country,
        session.metadata.city,
        session.metadata.device,
        session.metadata.browser
      ]);

      // Convert to CSV
      const csv = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `caltrak-worldwide-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportStatus({
        type: 'success',
        message: `Successfully exported ${sessions.length} worldwide users to CSV`,
        details: 'File downloaded! Import this CSV into Google Sheets to analyze your worldwide CalTrak data.'
      });

      console.log('✅ Worldwide data export completed:', sessions.length, 'sessions');

    } catch (error) {
      console.error('❌ Export failed:', error);
      setExportStatus({
        type: 'error',
        message: 'Export failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred during export'
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const success = await BackendService.testConnection();
      alert(success ? 'Backend connection successful!' : 'Backend connection failed. Check console for details.');
    } catch (error) {
      alert('Connection test failed: ' + error);
    }
    setTestingConnection(false);
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
            { key: 'sheets', label: 'Export to Sheets', icon: 'fa-table' }
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

          {activeView === 'sheets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-robust italic text-white uppercase">📊 Export Worldwide Data to Google Sheets</h3>
                <button
                  onClick={handleExportToSheets}
                  disabled={loadingExport}
                  className="px-6 py-3 bg-[#0F9D58] text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-[#0F9D58]/80 transition-colors disabled:opacity-50"
                >
                  <i className={`fa-solid ${loadingExport ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
                  {loadingExport ? 'Exporting...' : 'Export to Sheets'}
                </button>
              </div>

              <HudCard label="Worldwide Data Export">
                <div className="space-y-6">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="text-lg font-robust italic text-white mb-3">Export Summary</h4>
                    {worldwideAnalytics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">Total Users:</span>
                          <span className="text-white ml-2 font-bold">{worldwideAnalytics.totalSessions}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Unique Users:</span>
                          <span className="text-white ml-2 font-bold">{worldwideAnalytics.uniqueUsers}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Countries:</span>
                          <span className="text-white ml-2 font-bold">{Object.keys(worldwideAnalytics.countryDistribution || {}).length}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Goals:</span>
                          <span className="text-white ml-2 font-bold">{Object.keys(worldwideAnalytics.goalDistribution || {}).length}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="text-lg font-robust italic text-white mb-3">Export Options</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-zinc-900 rounded border-l-4 border-[#0F9D58]">
                        <div>
                          <h5 className="text-white font-bold">📊 Complete Dataset</h5>
                          <p className="text-zinc-400 text-sm">All worldwide user data with full calculations and demographics</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[#0F9D58] font-bold">CSV Format</div>
                          <div className="text-zinc-500 text-xs">Ready for Sheets import</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-900 rounded border-l-4 border-blue-500">
                        <div>
                          <h5 className="text-white font-bold">📈 Analytics Summary</h5>
                          <p className="text-zinc-400 text-sm">Goal distribution, demographics, and trends overview</p>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-400 font-bold">Included</div>
                          <div className="text-zinc-500 text-xs">With main export</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="text-lg font-robust italic text-white mb-3">How It Works</h4>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>1. Click "Export to Sheets" to download worldwide data as CSV</p>
                      <p>2. Open Google Sheets and create a new spreadsheet</p>
                      <p>3. Go to File → Import → Upload → Select the downloaded CSV</p>
                      <p>4. Choose "Replace spreadsheet" and click "Import data"</p>
                      <p>5. Your worldwide CalTrak data is now in Google Sheets!</p>
                    </div>
                    <div className="mt-4 p-3 bg-zinc-900 rounded border-l-4 border-[#FC4C02]">
                      <p className="text-xs text-zinc-400">
                        💡 <strong>Pro Tip:</strong> Set up automatic refresh by re-exporting periodically to keep your Sheets data current with new worldwide users.
                      </p>
                    </div>
                  </div>

                  {exportStatus && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      exportStatus.type === 'success' 
                        ? 'bg-green-900/20 border-green-500 text-green-400' 
                        : 'bg-red-900/20 border-red-500 text-red-400'
                    }`}>
                      <div className="flex items-center">
                        <i className={`fa-solid ${exportStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                        <span className="font-bold">{exportStatus.message}</span>
                      </div>
                      {exportStatus.details && (
                        <p className="text-sm mt-1 opacity-80">{exportStatus.details}</p>
                      )}
                    </div>
                  )}
                </div>
              </HudCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};