import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SupabaseConfig } from './types'; // Assuming SupabaseConfig is defined here for module config

// Define a generic Database type for now, replace with actual Supabase generated types if available
type Database = any; 

class SupabaseManager {
  private static instance: SupabaseClient<Database> | null = null;
  private static creating: boolean = false;
  private static creationCount: number = 0;

  static getClient(): SupabaseClient<Database> {
    if (this.instance) {
      return this.instance;
    }

    if (this.creating) {
      // This can happen during hot reloading in development. Wait for the existing creation.
      console.warn('[Template:Client] Supabase client is already being created. Returning existing instance if available, or waiting.');
      // In a real-world scenario, you might want a more robust waiting mechanism
      // For now, we'll throw an error if no instance is available yet to prevent infinite loops.
      if (!this.instance) {
        throw new Error('[Template:Client] Supabase client is being created, please wait or check for multiple initializations.');
      }
      return this.instance;
    }

    this.creating = true;
    this.creationCount++;
    
    try {
      console.log(`[Template:Client] Creating Supabase client instance #${this.creationCount}`);
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        const errorMsg = 'Supabase environment variables missing. Please check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file';
        console.error(`[Template:Client] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      if (this.creationCount > 1) {
        console.warn('[Template:Client] ⚠️ Multiple client creation detected! This may indicate a development environment hot reload or architecture issue.');
      }
      
      this.instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: this.createStorageAdapter(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      
      console.log('[Template:Client] Supabase client created successfully');
      return this.instance;
      
    } finally {
      this.creating = false;
    }
  }

  private static createStorageAdapter = () => {
    if (Platform.OS === 'web') {
      return {
        getItem: async (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
          }
          return null;
        },
        setItem: async (key: string, value: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: async (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        },
      };
    } else {
      // For React Native, AsyncStorage is typically used
      return AsyncStorage;
    }
  }
}

export const getSharedSupabaseClient = (): SupabaseClient<Database> => {
  return SupabaseManager.getClient();
};

// Added a generic error type for better error handling
interface SupabaseOperationResult<T> {
  data: T | null;
  error: Error | null;
}

export const safeSupabaseOperation = async <T>(
  operation: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any | null }>,
  requiresAuth: boolean = false // Add a flag if an operation specifically requires an authenticated user
): Promise<SupabaseOperationResult<T>> => {
  try {
    const client = getSharedSupabaseClient();
    // Potentially add a check for authenticated user if requiresAuth is true
    // if (requiresAuth && !client.auth.session()) { 
    //   return { data: null, error: new Error("Authentication required") };
    // }

    const { data, error } = await operation(client);
    if (error) {
      console.error('[Template:safeSupabaseOperation] Supabase operation failed:', error);
      return { data: null, error: new Error(error.message || 'Unknown Supabase error') };
    }
    return { data, error: null };
  } catch (e: any) {
    console.error('[Template:safeSupabaseOperation] Unexpected error during Supabase operation:', e);
    return { data: null, error: new Error(e.message || 'An unexpected error occurred') };
  }
};
