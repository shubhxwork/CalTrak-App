import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { AuthService } from '../../services/authService';

/**
 * useAdminAccess — Custom Hook
 *
 * Encapsulates the "is authenticated? open panel : show login" logic
 * that was previously inline in App.tsx.
 *
 * SRP: Only handles admin access gating.
 */
export function useAdminAccess() {
  const { openDataPanel, openAdminLogin, closeAdminLogin } = useAppStore();

  const requestAccess = useCallback(() => {
    if (AuthService.isAuthenticated()) {
      openDataPanel();
    } else {
      openAdminLogin();
    }
  }, [openDataPanel, openAdminLogin]);

  const onLoginSuccess = useCallback(() => {
    closeAdminLogin();
    openDataPanel();
  }, [closeAdminLogin, openDataPanel]);

  return { requestAccess, onLoginSuccess };
}
