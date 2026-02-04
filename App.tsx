
import React, { useState, useEffect } from 'react';
import { UserInputs, CalculationResults } from './types';
import { calculateResults } from './services/calculationService';
import { DataService } from './services/dataService';
import { AuthService } from './services/authService';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import Dashboard from './components/Dashboard';
import { Insights } from './components/Insights';
import { DataPanel } from './components/DataPanel';
import { AdminLogin } from './components/AdminLogin';
import { Logo } from './components/ui/Logo';
import { NavButton } from './components/ui/NavButton';
import { FloatingNavDock } from './components/ui/FloatingNavDock';

type Tab = 'home' | 'blueprint' | 'insights';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);

  // Handle navigation from floating dock
  const handleNavigate = (sectionId: string) => {
    setActiveTab(sectionId as Tab);
  };

  // Keyboard shortcut to open data panel (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        handleDataPanelAccess();
      }
      // About Us shortcut (Ctrl/Cmd + Shift + A)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAboutUs(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCalculate = (newInputs: UserInputs) => {
    setIsCalculating(true);
    // Immersive scanning experience
    setTimeout(() => {
      setInputs(newInputs);
      const res = calculateResults(newInputs);
      setResults(res);
      
      // Save user data
      const savedSessionId = DataService.saveUserSession(newInputs, res);
      setSessionId(savedSessionId);
      
      setIsCalculating(false);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleReset = () => {
    setInputs(null);
    setResults(null);
    setSessionId(null);
    setActiveTab('blueprint');
  };

  const handleDataPanelAccess = () => {
    if (AuthService.isAuthenticated()) {
      setShowDataPanel(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    setShowDataPanel(true);
  };

  const handleAdminLoginCancel = () => {
    setShowAdminLogin(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return results ? (
          <ResultsView results={results} inputs={inputs!} onReset={handleReset} />
        ) : (
          <Dashboard onStart={() => setActiveTab('blueprint')} />
        );
      case 'blueprint':
        return (
          <InputForm 
            onCalculate={handleCalculate} 
            isCalculating={isCalculating} 
            initialInputs={inputs} 
          />
        );
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

      {/* Global Application Header */}
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
          {/* About Us Button */}
          <button
            onClick={() => setShowAboutUs(true)}
            className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full text-xs font-mono uppercase tracking-widest transition-all"
            title="About CalTrak (Cmd+Shift+A on Mac, Ctrl+Shift+A on Windows)"
          >
            <i className="fa-solid fa-info-circle mr-1"></i>
            About
          </button>
          {/* Developer Data Access Button */}
          <button
            onClick={handleDataPanelAccess}
            className="w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors opacity-30 hover:opacity-100"
            title="Admin Panel (Cmd+Shift+D on Mac, Ctrl+Shift+D on Windows)"
          >
            <i className="fa-solid fa-chart-line text-xs text-zinc-400"></i>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="max-w-6xl mx-auto px-6 pt-6">
        <div className="max-w-md mx-auto lg:max-w-none">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Navigation - Floating Glass Dock */}
      <div className="block md:hidden">
        <FloatingNavDock
          activeSection={activeTab}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Desktop Navigation - Original Dock */}
      <nav 
        role="navigation"
        className="hidden md:flex fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-zinc-900 px-8 py-4 justify-between items-center no-print z-50 shadow-2xl"
      >
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon="fa-house" 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'blueprint'} 
          onClick={() => setActiveTab('blueprint')} 
          icon="fa-pen-ruler" 
          label="Blueprint" 
        />
        <NavButton 
          active={activeTab === 'insights'} 
          onClick={() => setActiveTab('insights')} 
          icon="fa-bolt" 
          label="Insights" 
        />
      </nav>

      {/* Data Panel Modal */}
      {showDataPanel && (
        <DataPanel onClose={() => setShowDataPanel(false)} />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onCancel={handleAdminLoginCancel}
        />
      )}

      {/* About Us Modal */}
      {showAboutUs && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FC4C02] to-[#FC4C02]/80 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-heart text-2xl text-white"></i>
              </div>
              <h2 className="text-2xl font-robust italic text-black uppercase mb-2">About CalTrak</h2>
              <p className="text-sm text-black/80">Precision Nutrition Calculator</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-robust italic text-white mb-3">Developed by RedWhisk</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  CalTrak is a precision nutrition calculator designed to provide accurate macro calculations 
                  and personalized nutrition guidance. Built with cutting-edge algorithms and a focus on 
                  user experience.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Features</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <i className="fa-solid fa-calculator text-[#FC4C02] w-4"></i>
                    <span>Advanced macro calculations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <i className="fa-solid fa-target text-[#FC4C02] w-4"></i>
                    <span>Goal-specific recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <i className="fa-solid fa-chart-line text-[#FC4C02] w-4"></i>
                    <span>Progress tracking & milestones</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <i className="fa-solid fa-utensils text-[#FC4C02] w-4"></i>
                    <span>Personalized food recommendations</span>
                  </div>
                </div>
              </div>

              {/* Social */}
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

              {/* Version */}
              <div className="text-center pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-600 font-mono">
                  CalTrak v2.0 • Built with ❤️ by RedWhisk
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowAboutUs(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full font-black text-xs uppercase tracking-widest transition-all"
              >
                <i className="fa-solid fa-times mr-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
