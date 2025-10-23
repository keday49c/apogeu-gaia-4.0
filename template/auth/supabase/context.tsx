import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { AuthUser } from '../types';
import { authService } from './service';

interface AuthContextState {
  user: AuthUser | null;
  loading: boolean;
  operationLoading: boolean;
  initialized: boolean;
}

interface AuthContextActions {
  setOperationLoading: (loading: boolean) => void;
  // Add other actions here if needed, e.g., login, logout, register
}

type AuthContextType = AuthContextState & AuthContextActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthContextState>({
    user: null,
    loading: true,
    operationLoading: false,
    initialized: false,
  });

  const updateState = useCallback((updates: Partial<AuthContextState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      return newState;
    });
  }, []);

  const setOperationLoading = useCallback((loading: boolean) => {
    updateState({ operationLoading: loading });
  }, [updateState]);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (isMounted) {
          updateState({ 
            user: currentUser, 
            loading: false, 
            initialized: true 
          });
        }

        authSubscription = authService.onAuthStateChange((authUser) => {
          if (isMounted) {
            updateState({ user: authUser });
          }
        });

      } catch (error) {
        console.warn('[Template:AuthProvider] Auth initialization failed:', error);
        if (isMounted) {
          updateState({ 
            user: null, 
            loading: false, 
            initialized: true 
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    };
  }, [updateState]); // Added updateState to dependency array

  const contextValue = useMemo(() => ({
    ...state,
    setOperationLoading,
  }), [state, setOperationLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuthContext Hook - internal use
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}
