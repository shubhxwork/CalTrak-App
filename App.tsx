/**
 * App.tsx — Application Shell
 *
 * BEFORE: 200+ lines with useState, business logic, inline handlers,
 *         direct service calls, and a 100-line About modal.
 *
 * AFTER:  Pure composition. No business logic. No direct service calls.
 *         All state comes from the store. All logic lives in hooks/controllers.
 *
 * SRP: App only composes pages and global chrome (header, nav, modals).
 */

import React, { useMemo } from 'react';
import { useAppStore }           from './src/store/appStore';
import { useCalculation }        from './src/hooks/useCalculation';
import { useAdminAccess }        from './src/hooks/useAdminAccess';
import { useKeyboardShortcuts }  from './src/hooks/useKeyboardShortcuts';

import InputForm   from './components/InputForm';
import ResultsView from './components/ResultsView';
import Dashboard   from './components/Dashboard';
import { Insights }    from './components/Insights';
import { DataPanel }   from './components/DataPanel';
import { AdminLogin }  from './components/AdminLogin';
import { Logo }        from './components/ui/Logo';
import { NavButton }   from './components/ui/NavButton';
import { FloatingNavDock } from './components/ui/FloatingNavDock';
import { AboutModal }  from './components/AboutModal';

const App: React.FC = () => {
  const {
    activeTab, setActiveTab,
    inputs, results, isCalculating,
    showDataPanel, closeDataPanel,
    showAdminLogin, closeAdminLogin,
    showAboutUs, openAboutUs, closeAboutUs,
    clearSession,
  } = useAppStore();

  const { calculate }                  = useCalculation();
  const { requestAccess, onLoginSuccess } = useAdminAccess();

  // Keyboard shortcuts — no inline useEffect in the render body
  const shortcuts = useMemo(() => ({
    'mod+shift+D': requestAccess,
    'mod+shift+A': openAboutUs,
  }), [requestAccess, openAboutUs]);
  useKeyboardShortcuts(shortcuts);

  // ── Page routing ────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return results
          ? <ResultsView results={results} inputs={inputs!} onReset={clearSession} />
          : <Dashboard onStart={() => setActiveTab('blueprint')} />;
      case 'blueprint':
        return <InputForm onCalculate={calculate} isCalculating={isCalculating} initialInputs={inputs} />;
      case 'insights':
        return <Insights results={results} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-0 md:pb-24 font-sans selection:bg-[#FC4C02]/40">

      {/* Bio-Scan Overlay */}
      {isCalculating && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-64 h-64 relative mb-8">
            <div className="absolute inset-0 border-2 border-[#FC4C02]/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border border-[#FC4C02]/40 rounded-full animate-pulse"></div>
            <Logo className="absolute inset-0 m-auto w-32 h-32 animate-pulse" />
            <div className="scanner-line !h-full !bg-gradient-to-b !from-transparent !via-[#FC4C02] !to-transparent opacity-50"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-robust italic tracking-widest text-white uppercase animate-pulse">Analyzing Biometrics</h3>
            <p className="text-[10px] font-mono text-[#FC4C02] uppercase tracking-[0.4em]">Compiling Metabolic Baseline...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between no-print">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95 transform cursor-pointer focus:outline-none"
        >
          <Logo className="w-9 h-9" />
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">CalTrak</h1>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pointer-events-none">
            {activeTab} module
          </div>
          <button
            onClick={openAboutUs}
            className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full text-xs font-mono uppercase tracking-widest transition-all"
            title="About CalTrak (Cmd+Shift+A)"
          >
            <i className="fa-solid fa-info-circle mr-1"></i>About
          </button>
          <button
            onClick={requestAccess}
            className="w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors opacity-30 hover:opacity-100"
            title="Admin Panel (Cmd+Shift+D)"
          >
            <i className="fa-solid fa-chart-line text-xs text-zinc-400"></i>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 pt-6">
        <div className="max-w-md mx-auto lg:max-w-none">
          {renderContent()}
        </div>
      </main>

      {/* Mobile nav */}
      <div className="block md:hidden">
        <FloatingNavDock activeSection={activeTab} onNavigate={(id) => setActiveTab(id as any)} />
      </div>

      {/* Desktop nav */}
      <nav
        role="navigation"
        className="hidden md:flex fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-zinc-900 px-8 py-4 justify-between items-center no-print z-50 shadow-2xl"
      >
        <NavButton active={activeTab === 'home'}      onClick={() => setActiveTab('home')}      icon="fa-house"    label="Home"      />
        <NavButton active={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')} icon="fa-pen-ruler" label="Blueprint" />
        <NavButton active={activeTab === 'insights'}  onClick={() => setActiveTab('insights')}  icon="fa-bolt"     label="Insights"  />
      </nav>

      {/* Modals */}
      {showDataPanel  && <DataPanel  onClose={closeDataPanel} />}
      {showAdminLogin && <AdminLogin onLogin={onLoginSuccess} onCancel={closeAdminLogin} />}
      {showAboutUs    && <AboutModal onClose={closeAboutUs} />}
    </div>
  );
};

export default App;
