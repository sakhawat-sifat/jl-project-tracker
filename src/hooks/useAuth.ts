import { useState, useEffect } from 'react';
import { AuthState, LoginCredentials, AdminUser } from '../types';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      const user = isAuthenticated ? await authService.getCurrentUser() : null;
      const timeRemaining = authService.getSessionTimeRemaining();

      setAuthState({
        isAuthenticated: !!user,
        user,
        loading: false
      });
      setSessionTimeRemaining(timeRemaining);
    };

    checkAuth();
  }, []);

  // Update session time remaining every minute
  useEffect(() => {
    if (authState.isAuthenticated) {
      const timer = setInterval(() => {
        const timeRemaining = authService.getSessionTimeRemaining();
        setSessionTimeRemaining(timeRemaining);

        // Auto-logout if session expired
        if (timeRemaining <= 0) {
          handleLogout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(timer);
    }
  }, [authState.isAuthenticated]);

  // Extend session on user activity
  useEffect(() => {
    if (authState.isAuthenticated) {
      const handleActivity = () => {
        authService.extendSession();
        setSessionTimeRemaining(authService.getSessionTimeRemaining());
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
      };
    }
  }, [authState.isAuthenticated]);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const user = await authService.login(credentials);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      });
      setSessionTimeRemaining(authService.getSessionTimeRemaining());
      // Redirect to summary tab after successful login
      window.location.hash = 'summary';
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    setSessionTimeRemaining(0);
    setLoginError(null);
    // Clear URL hash completely using replaceState
    window.history.replaceState(null, '', window.location.pathname);
  };

  return {
    ...authState,
    loginError,
    loginLoading,
    sessionTimeRemaining,
    login: handleLogin,
    logout: handleLogout
  };
};