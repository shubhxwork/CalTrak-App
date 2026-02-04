import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, Zap } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface FloatingNavDockProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'blueprint', label: 'BLUEPRINT', icon: Dumbbell },
  { id: 'insights', label: 'INSIGHTS', icon: Zap },
];

export const FloatingNavDock: React.FC<FloatingNavDockProps> = ({
  activeSection = 'home',
  onNavigate,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Entrance animation delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        flex justify-center items-end
        pb-6 px-4
        pointer-events-none
        ${className}
      `}
      style={{
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
      }}
    >
      {/* Floating Navigation Dock */}
      <nav
        className={`
          relative
          flex items-center justify-center
          px-2 py-2
          
          /* Glassmorphism Effect */
          bg-white/5 backdrop-blur-[10px]
          border border-white/10
          
          /* Shape */
          rounded-full
          
          /* Shadow & Glow */
          shadow-2xl shadow-black/20
          
          /* Pointer Events */
          pointer-events-auto
          
          /* Animation */
          transition-all duration-500 ease-out
          ${isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-16 opacity-0 scale-95'
          }
          
          /* Hover Effect */
          hover:bg-white/8 hover:border-white/20
          hover:shadow-3xl hover:shadow-black/30
        `}
        style={{
          animation: isVisible ? 'slideUpBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : undefined
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                relative
                flex items-center justify-center
                px-3 py-3 mx-1
                
                /* Shape */
                rounded-full
                
                /* Transitions */
                transition-all duration-300 ease-out
                
                /* Base State */
                ${isActive 
                  ? `
                    bg-[#ff4d00] text-white
                    shadow-lg shadow-[#ff4d00]/30
                    scale-105
                  ` 
                  : `
                    text-white/70 hover:text-white
                    hover:bg-white/10
                    hover:scale-105
                  `
                }
                
                /* Focus States */
                focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/50
                
                /* Active Press Effect */
                active:scale-95
                
                /* Group for text animation */
                group
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Icon */}
              <Icon 
                size={20} 
                className={`
                  transition-all duration-300
                  ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                `}
              />
              
              {/* Text Label - Always hidden on mobile since this is mobile-only */}
              <span
                className={`
                  ml-2 text-xs font-bold uppercase tracking-wider
                  transition-all duration-300
                  
                  /* Always hidden since this is mobile-only component */
                  hidden
                  
                  /* Animation */
                  ${isActive 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-70 group-hover:opacity-100'
                  }
                `}
              >
                {item.label}
              </span>
              
              {/* Active Indicator Glow */}
              {isActive && (
                <div
                  className="
                    absolute inset-0 rounded-full
                    bg-[#ff4d00]/20 blur-md
                    animate-pulse
                    -z-10
                  "
                />
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Background Blur Enhancement */}
      <div
        className={`
          absolute inset-0 rounded-full
          bg-gradient-to-t from-black/10 to-transparent
          blur-xl opacity-50
          transition-opacity duration-500
          ${isVisible ? 'opacity-50' : 'opacity-0'}
          -z-10
        `}
      />
    </div>
  );
};

export default FloatingNavDock;