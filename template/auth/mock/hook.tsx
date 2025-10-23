import { AuthContextType, SendOTPResult, AuthResult, LogoutResult, SignUpResult } from '../types';
import { mockAuthService } from './service';
import { useMockAuthContext } from './context';
import { useState, useEffect, useCallback } from 'react';

export function useMockAuth(): AuthContextType {
  const context = useMockAuthContext();
  
  const sendOTP = useCallback(async (email: string): Promise<SendOTPResult> => {
    context.setOperationLoading(true);
    try {
      const result = await mockAuthService.sendOTP(email);
      return result;
    } catch (error: any) {
      console.warn('[Template:useMockAuth] sendOTP exception:', error);
      return { 
        error: error.message || 'Failed to send verification code' 
      };
    } finally {
      context.setOperationLoading(false);
    }
  }, [context]);

  const verifyOTPAndLogin = useCallback(async (email: string, otp: string, options?: { password?: string }): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await mockAuthService.verifyOTPAndLogin(email, otp, options);
      return result;
    } catch (error: any) {
      console.warn('[Template:useMockAuth] verifyOTPAndLogin exception:', error);
      return { 
        error: error.message || 'Login failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  }, [context]);

  const signUpWithPassword = useCallback(async (email: string, password: string, metadata?: Record<string, any>): Promise<SignUpResult> => {
    context.setOperationLoading(true);
    try {
      const result = await mockAuthService.signUpWithPassword(email, password, metadata || {});
      return result;
    } catch (error: any) {
      console.warn('[Template:useMockAuth] signUpWithPassword exception:', error);
      return { 
        error: error.message || 'Registration failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  }, [context]);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await mockAuthService.signInWithPassword(email, password);
      return result;
    } catch (error: any) {
      console.warn('[Template:useMockAuth] signInWithPassword exception:', error);
      return { 
        error: error.message || 'Login failed',
        user: null 
      };
    } finally {
      context.setOperationLoading(false);
    }
  }, [context]);

  const logout = useCallback(async (): Promise<LogoutResult> => {
    context.setOperationLoading(true);
    try {
      const result = await mockAuthService.logout();
      
      if (!result) {
        console.warn('[Template:useMockAuth] Invalid logout result format:', result);
        return { error: 'Invalid logout response' };
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown logout error';
      console.warn('[Template:useMockAuth] Logout hook exception:', errorMessage);
      return { error: errorMessage };
    } finally {
      context.setOperationLoading(false);
    }
  }, [context]);

  const refreshSession = useCallback(async () => {
    try {
      await mockAuthService.refreshSession();
    } catch (error) {
      console.warn('[Template:useMockAuth] Refresh session error:', error);
    }
  }, []);

  return {
    user: context.user,
    loading: context.loading,
    operationLoading: context.operationLoading,
    initialized: context.initialized,
    setOperationLoading: context.setOperationLoading,
    sendOTP,
    verifyOTPAndLogin,
    signUpWithPassword,
    signInWithPassword,
    logout,
    refreshSession,
  };
}

// Development Helper Hook - for debugging Mock data
export function useMockAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const refreshDebugInfo = useCallback(async () => {
    const info = await mockAuthService.getMockDebugInfo();
    setDebugInfo(info);
  }, []);
  
  const clearAllData = useCallback(async () => {
    await mockAuthService.clearAllMockData();
    await refreshDebugInfo();
  }, [refreshDebugInfo]);
  
  useEffect(() => {
    refreshDebugInfo();
  }, [refreshDebugInfo]);
  
  return {
    debugInfo,
    refreshDebugInfo,
    clearAllData,
  };
}
