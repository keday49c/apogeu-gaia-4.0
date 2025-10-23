import { AuthUser, SendOTPOptions, SignUpResult, AuthResult, LogoutResult } from '../types';
import { safeSupabaseOperation, getSharedSupabaseClient } from '../../core/client';
import { configManager } from '../../core/config';
import { Platform } from 'react-native';
import { User } from '@supabase/supabase-js';

// Visibility change listener related variables
let lastVisibilityChange = 0;
let visibilityListener: (() => void) | null = null;

// Operation state tracking to prevent deadlock
let isUpdatingUser = false;

const TIMEOUT_CONFIG = {
  AUTH_OPERATIONS: 10000,
  DATA_QUERIES: 8000,  
  SESSION_REFRESH: 5000,
  USER_UPDATE: 15000,
};

// Utility function to add timeout to any Promise with proper cleanup
const withTimeout = async <T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  operation: string = 'Operation'
): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timeout after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const isAuthError = (error: any): boolean => {
  if (error instanceof Error && error.message?.includes('timeout')) return false;
  return error.status === 401 || 
         error.status === 403 || 
         error.message?.includes('invalid_token') ||
         error.message?.includes('Invalid credentials');
};

// Visibility monitoring logic - used to optimize auth event handling
const setupVisibilityMonitoring = () => {
  if (visibilityListener || Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  visibilityListener = () => {
    lastVisibilityChange = Date.now();
  };

  document.addEventListener('visibilitychange', visibilityListener);
};

export const isVisibilityTriggeredAuthEvent = (event: string): boolean => {
  if (event !== 'SIGNED_IN') return false;

  const timeSinceVisibilityChange = Date.now() - lastVisibilityChange;
  return timeSinceVisibilityChange < 1000; // Event triggered within 1 second of visibility change
};

export const getLastVisibilityChange = (): number => lastVisibilityChange;

// Enhanced event filtering to prevent deadlock
export const shouldIgnoreAuthEvent = (event: string): boolean => {
  if (event === 'USER_UPDATED' && isUpdatingUser) {
    return true;
  }
  
  if (isVisibilityTriggeredAuthEvent(event)) {
    return true;
  }
  
  return false;
};

const mapSupabaseUserToAuthUser = (user: User, profile?: any): AuthUser => {
  const username = profile?.username || (user.email ? user.email.split('@')[0] : `user_${user.id.slice(0, 8)}`);
  return {
    id: user.id,
    email: user.email || '',
    username: username,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    ...(profile || {}),
  };
};

export class AuthService {
  constructor() {
    setupVisibilityMonitoring();
  }

  private get supabase() {
    return getSharedSupabaseClient();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: getUserData, error: getUserError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.getUser(),
          TIMEOUT_CONFIG.DATA_QUERIES,
          'GetUser'
        );
      });

      if (getUserError || !getUserData?.user) {
        console.error('[Template:AuthService] Error getting user from Supabase or user not found:', getUserError?.message || 'No user data');
        return null;
      }
      const supabaseUser = getUserData.user;

      const authConfig = configManager.getModuleConfig('auth');
      const profileTableName = authConfig?.profileTableName || 'user_profiles';

      try {
        const { data: profileData, error: profileError } = await safeSupabaseOperation(async (client) => {
          return await withTimeout(
            client
              .from(profileTableName)
              .select('*')
              .eq('id', supabaseUser.id)
              .single(),
            TIMEOUT_CONFIG.DATA_QUERIES,
            'ProfileQuery'
          );
        });

        if (profileError) {
          console.warn(`[Template:AuthService] Profile query failed for user ${supabaseUser.id}:`, profileError.message);
          if (profileError.message.includes('PGRST116')) {
            console.warn(`[Template:AuthService] Profile table '${profileTableName}' not found. Using user data only.`);
          } else if (profileError.message.includes('PGRST301')) {
            console.warn(`[Template:AuthService] User profile not found in '${profileTableName}'. Using user data only.`);
          }
          return mapSupabaseUserToAuthUser(supabaseUser);
        }
        
        return mapSupabaseUserToAuthUser(supabaseUser, profileData);

      } catch (profileCatchError: any) {
        console.error(`[Template:AuthService] Unexpected error during profile fetch for user ${supabaseUser.id}:`, profileCatchError);
        return mapSupabaseUserToAuthUser(supabaseUser);
      }

    } catch (error: any) {
      console.error('[Template:AuthService] Error in getCurrentUser:', error);
      if (error.message?.includes('timeout') || isAuthError(error)) {
        try {
          const { data: sessionData, error: sessionError } = await safeSupabaseOperation(async (client) => {
            return client.auth.getSession();
          });
          
          if (sessionError) {
            console.warn('[Template:AuthService] Fallback getSession also failed:', sessionError.message);
            return null;
          }
          if (sessionData?.session?.user) {
            return mapSupabaseUserToAuthUser(sessionData.session.user);
          }
        } catch (sessionCatchError) {
          console.warn('[Template:AuthService] Session fallback unexpected error:', sessionCatchError);
        }
      }
      return null;
    }
  }

  async sendOTP(email: string, options: SendOTPOptions = {}): Promise<SendOTPResult> {
    try {
      const { shouldCreateUser = true, emailRedirectTo } = options;
      
      const { error } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser,
              emailRedirectTo,
            }
          }),
          TIMEOUT_CONFIG.AUTH_OPERATIONS,
          'SendOTP'
        );
      });
      
      if (error) {
        if (error.message.includes('timeout')) {
          return { error: 'Network is slow, please retry', errorType: 'timeout' };
        }
        return { error: error.message, errorType: 'business' };
      }
      
      return {};
    } catch (error: any) {
      console.error('[Template:AuthService] SendOTP system exception:', error);
      if (error.message?.includes('timeout')) {
        return { error: 'Network connection timeout, please check network and retry', errorType: 'timeout' };
      }
      return { error: error.message || 'Failed to send verification code', errorType: 'network' };
    }
  }

  async verifyOTPAndLogin(email: string, otp: string, options?: { password?: string }): Promise<AuthResult> {
    try {
      const { data: verifyData, error: verifyError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.verifyOtp({
            email,
            token: otp,
            type: 'email'
          }),
          TIMEOUT_CONFIG.AUTH_OPERATIONS,
          'VerifyOTP'
        );
      });

      if (verifyError) {
        if (verifyError.message.includes('Database error saving new user')) {
          console.warn('[Template:AuthService] Database trigger missing, auth function available but user profile creation failed');
          console.warn('[Template:AuthService] Please refer to SDK documentation to set up user_profiles table and triggers');
        }
        if (verifyError.message.includes('timeout')) {
          return { error: 'Verification timeout, please retry', user: null, errorType: 'timeout' };
        }
        return { error: verifyError.message, user: null, errorType: 'business' };
      }

      if (verifyData?.user) {
        if (options?.password) {
          try {
            isUpdatingUser = true;
            const { error: updateError } = await withTimeout(
              this.supabase.auth.updateUser({ password: options.password }),
              TIMEOUT_CONFIG.USER_UPDATE,
              'UpdateUser'
            );
            if (updateError) {
              console.warn('[Template:AuthService] User update failed after OTP verification:', updateError.message);
            }
          } catch (updateError) {
            console.error('[Template:AuthService] Unexpected error during user update after OTP verification:', updateError);
          } finally {
            setTimeout(() => { isUpdatingUser = false; }, 2000);
          }
        }
        const authUser = await this.getCurrentUser();
        return { user: authUser, error: null };
      }
      return { user: null, error: 'User not found after OTP verification' };
    } catch (error: any) {
      console.error('[Template:AuthService] verifyOTPAndLogin system exception:', error);
      if (error.message?.includes('timeout')) {
        return { error: 'Network connection timeout, please check network and retry', user: null, errorType: 'timeout' };
      }
      return { error: error.message || 'Failed to verify OTP and login', user: null, errorType: 'network' };
    }
  }

  async signUpWithPassword(email: string, password: string, metadata?: Record<string, any>): Promise<SignUpResult> {
    try {
      const { data: signUpData, error: signUpError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          }),
          TIMEOUT_CONFIG.AUTH_OPERATIONS,
          'SignUpWithPassword'
        );
      });

      if (signUpError) {
        if (signUpError.message.includes('timeout')) {
          return { error: 'Network is slow, please retry', user: null, errorType: 'timeout' };
        }
        return { error: signUpError.message, user: null, errorType: 'business' };
      }

      if (signUpData?.user) {
        const authUser = await this.getCurrentUser();
        return { user: authUser, error: null };
      }
      return { user: null, error: 'User not created during sign up' };
    } catch (error: any) {
      console.error('[Template:AuthService] signUpWithPassword system exception:', error);
      if (error.message?.includes('timeout')) {
        return { error: 'Network connection timeout, please check network and retry', user: null, errorType: 'timeout' };
      }
      return { error: error.message || 'Registration failed', user: null, errorType: 'network' };
    }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const { data: signInData, error: signInError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.signInWithPassword({
            email,
            password,
          }),
          TIMEOUT_CONFIG.AUTH_OPERATIONS,
          'SignInWithPassword'
        );
      });

      if (signInError) {
        if (signInError.message.includes('timeout')) {
          return { error: 'Network is slow, please retry', user: null, errorType: 'timeout' };
        }
        return { error: signInError.message, user: null, errorType: 'business' };
      }

      if (signInData?.user) {
        const authUser = await this.getCurrentUser();
        return { user: authUser, error: null };
      }
      return { user: null, error: 'User not found during sign in' };
    } catch (error: any) {
      console.error('[Template:AuthService] signInWithPassword system exception:', error);
      if (error.message?.includes('timeout')) {
        return { error: 'Network connection timeout, please check network and retry', user: null, errorType: 'timeout' };
      }
      return { error: error.message || 'Login failed', user: null, errorType: 'network' };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      const { error: logoutError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.signOut(),
          TIMEOUT_CONFIG.AUTH_OPERATIONS,
          'Logout'
        );
      });

      if (logoutError) {
        if (logoutError.message.includes('timeout')) {
          return { error: 'Network is slow, please retry', errorType: 'timeout' };
        }
        return { error: logoutError.message, errorType: 'business' };
      }
      return {};
    } catch (error: any) {
      console.error('[Template:AuthService] Logout system exception:', error);
      if (error.message?.includes('timeout')) {
        return { error: 'Network connection timeout, please check network and retry', errorType: 'timeout' };
      }
      return { error: error.message || 'Failed to logout', errorType: 'network' };
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const { error: refreshError } = await safeSupabaseOperation(async (client) => {
        return await withTimeout(
          client.auth.refreshSession(),
          TIMEOUT_CONFIG.SESSION_REFRESH,
          'RefreshSession'
        );
      });
      if (refreshError) {
        console.warn('[Template:AuthService] Refresh session error:', refreshError.message);
      }
    } catch (error) {
      console.warn('[Template:AuthService] Refresh session unexpected error:', error);
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): { unsubscribe: () => void } {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (shouldIgnoreAuthEvent(event)) {
        return;
      }

      if (session?.user) {
        const authUser = await this.getCurrentUser();
        callback(authUser);
      } else {
        callback(null);
      }
    });

    return { unsubscribe: () => subscription?.unsubscribe() };
  }
}

export const authService = new AuthService();

