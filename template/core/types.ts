// Supabase configuration
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Auth module configuration
export interface AuthConfig {
  enabled?: boolean;
  profileTableName?: string;
  autoCreateProfile?: boolean;
}

// Future module configuration interfaces
export interface PaymentsConfig {
  enabled?: boolean;
  stripePublishableKey?: string;
}

export interface StorageConfig {
  enabled?: boolean;
  defaultBucket?: string;
}

// Main configuration interface
export interface OnSpaceConfig {
  supabase?: SupabaseConfig;
  auth: AuthConfig | false;
  payments: PaymentsConfig | false;
  storage: StorageConfig | false;
}

// Runtime state
export interface SDKState {
  initialized: boolean;
  enabledModules: string[];
  config: OnSpaceConfig;
}

// Error type
export interface OnSpaceError {
  code: string;
  message: string;
  module?: string;
  details?: any;
}

