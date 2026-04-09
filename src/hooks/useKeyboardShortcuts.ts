import { useEffect } from 'react';

/**
 * useKeyboardShortcuts — Custom Hook
 *
 * Registers global keyboard shortcuts. Previously this useEffect lived
 * directly in App.tsx, mixing keyboard handling with render logic.
 *
 * SRP: Only manages keyboard event listeners.
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey || e.metaKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.key,
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
