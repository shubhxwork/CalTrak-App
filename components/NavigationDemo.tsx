import React, { useState } from 'react';
import { FloatingNavDock } from './ui/FloatingNavDock';

export const NavigationDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    console.log(`Navigating to: ${sectionId}`);
    
    // Here you would typically handle navigation
    // For example, scrolling to a section or changing routes
    switch (sectionId) {
      case 'home':
        // Navigate to home section
        break;
      case 'blueprint':
        // Navigate to blueprint/calculator section
        break;
      case 'insights':
        // Navigate to insights/analytics section
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Demo Content */}
      <div className="p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Floating Navigation Demo
          </h1>
          <p className="text-zinc-400">
            Current active section: <span className="text-[#ff4d00] font-bold uppercase">{activeSection}</span>
          </p>
        </div>

        {/* Demo Sections */}
        <div className="space-y-12">
          <section id="home" className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-6xl font-bold text-white mb-4">HOME</h2>
              <p className="text-zinc-400 max-w-md">
                Welcome to CalTrak - your personal nutrition and fitness companion.
                Calculate your daily caloric needs with precision.
              </p>
            </div>
          </section>

          <section id="blueprint" className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-6xl font-bold text-white mb-4">BLUEPRINT</h2>
              <p className="text-zinc-400 max-w-md">
                Create your personalized nutrition blueprint based on your goals,
                activity level, and body composition.
              </p>
            </div>
          </section>

          <section id="insights" className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-6xl font-bold text-white mb-4">INSIGHTS</h2>
              <p className="text-zinc-400 max-w-md">
                Analyze your progress, track trends, and get intelligent
                recommendations for optimal results.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Navigation Dock */}
      <FloatingNavDock
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default NavigationDemo;