# FloatingNavDock Component

A sleek, futuristic floating navigation dock with glassmorphism design specifically optimized for mobile devices in dark-themed applications.

## Features

- **Mobile-First Design**: Optimized specifically for mobile devices and touch interfaces
- **Glassmorphism Design**: Semi-transparent background with backdrop blur effect
- **Floating Pill Shape**: Centered at bottom with rounded corners
- **Active State Indicator**: Vibrant orange (#ff4d00) background with glow effect
- **Smooth Animations**: 300ms transitions and elastic bounce entrance animation
- **Touch-Optimized**: Proper touch targets and mobile-friendly interactions
- **Safe Area Support**: Handles mobile device notches and home indicators
- **Accessibility**: Proper focus states and keyboard navigation support

## Usage

This component is designed to be used alongside a desktop navigation, showing only on mobile devices:

```tsx
import { FloatingNavDock } from './components/ui/FloatingNavDock';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    // Handle navigation logic here
  };

  return (
    <div>
      {/* Your app content */}
      
      {/* Mobile Navigation - Floating Glass Dock */}
      <div className="block md:hidden">
        <FloatingNavDock
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Desktop Navigation - Your existing navigation */}
      <nav className="hidden md:flex">
        {/* Desktop navigation items */}
      </nav>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeSection` | `string` | `'home'` | Currently active navigation section |
| `onNavigate` | `(sectionId: string) => void` | `undefined` | Callback fired when navigation item is clicked |
| `className` | `string` | `''` | Additional CSS classes to apply |

## Navigation Items

The component includes three predefined navigation items:

1. **HOME** - Home icon (Lucide React `Home`)
2. **BLUEPRINT** - Dumbbell icon (Lucide React `Dumbbell`) 
3. **INSIGHTS** - Zap icon (Lucide React `Zap`)

## Styling

The component uses:
- **Background**: `bg-white/5` with `backdrop-blur-[10px]`
- **Border**: `border-white/10`
- **Active State**: `bg-[#ff4d00]` with glow shadow
- **Hover Effects**: Subtle scale and opacity transitions
- **Mobile-Optimized**: Icons only, no text labels for clean mobile experience
- **Touch Targets**: Optimized button sizes for mobile touch interaction

## Responsive Behavior

- **Mobile Only**: Component is designed to be used with `block md:hidden` classes
- **Desktop**: Should be paired with a separate desktop navigation using `hidden md:flex`
- **Touch Optimized**: Button sizes and spacing optimized for mobile touch targets
- **Safe Areas**: Proper handling of mobile device safe areas and notches

## Dependencies

- React 18+
- Tailwind CSS
- Lucide React icons

## Browser Support

- Modern browsers with backdrop-filter support
- Graceful degradation for older browsers
- Mobile Safari safe area support

## Customization

To customize the navigation items, modify the `navItems` array in the component:

```tsx
const navItems: NavItem[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'blueprint', label: 'BLUEPRINT', icon: Dumbbell },
  { id: 'insights', label: 'INSIGHTS', icon: Zap },
  // Add more items as needed
];
```

## Animation Details

- **Entrance**: Slides up from bottom with elastic bounce effect
- **Duration**: 800ms with cubic-bezier easing
- **Stagger**: Each navigation item animates with 100ms delay
- **Hover**: Scale and glow effects on interaction
- **Active**: Persistent glow and scale for current section