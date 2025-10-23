import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, SendOTPOptions, SignUpResult, AuthResult, LogoutResult } from '../types';

// Mock data storage keys
const MOCK_STORAGE_KEYS = {
  USERS: '@onspace_mock_users',
  CURRENT_SESSION: '@onspace_mock_session',
} as const;

// Mock user data structure
interface MockUser extends AuthUser {
  // Passwords are not stored in mock, but for consistency, we keep the type
}

// Mock session
interface MockSession {
  userId: string;
  token: string;
  expiresAt: number;
}

interface MockDebugInfo {
  users: MockUser[];
  currentSession: MockSession | null;
}

export class MockAuthService {
  
  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendOTP(email: string, options: SendOTPOptions = {}): Promise<SendOTPResult> {
    await this.simulateNetworkDelay(500);
    // In a mock environment, OTP is just a formality, no actual sending happens.
    // We can simulate success always.
    return {};
  }

  async signUpWithPassword(email: string, password: string, metadata: Record<string, any> = {}): Promise<SignUpResult> {
    await this.simulateNetworkDelay(800);
    
    let user = await this.findUserByEmail(email);
    if (user) {
      return { 
        error: 'User already registered',
        errorType: 'business'
      };
    }
    
    user = await this.createUser(email, metadata.username);
    await this.createSession(user.id);
    
    return { user };
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    await this.simulateNetworkDelay(600);
    
    const user = await this.findUserByEmail(email);
    if (!user) {
      return { 
        error: 'No account found with this email',
        user: null,
        errorType: 'business'
      };
    }
    
    await this.createSession(user.id);
    
    return { user };
  }

  async verifyOTPAndLogin(email: string, otp: string, options?: { password?: string; metadata?: Record<string, any> }): Promise<AuthResult> {
    await this.simulateNetworkDelay(800);
    
    let user = await this.findUserByEmail(email);
    if (!user) {
      const username = options?.metadata?.username || email.split('@')[0];
      user = await this.createUser(email, username);
    }
    
    if (options?.password) {
      console.log(`[Template:MockAuth] OTP+Password registration for ${email}, password would be set in real environment`);
    }
    
    if (options?.metadata) {
      console.log(`[Template:MockAuth] User metadata for ${email}:`, options.metadata);
    }
    
    await this.createSession(user.id);
    
    return { user };
  }

  async logout(): Promise<LogoutResult> {
    await this.simulateNetworkDelay(300);
    
    try {
      await AsyncStorage.removeItem(MOCK_STORAGE_KEYS.CURRENT_SESSION);
      return {};
    } catch (error: any) {
      console.error('[Template:MockAuthService] Error removing session from storage:', error);
      return { error: error.message || 'Failed to clear session', errorType: 'storage' };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const sessionData = await AsyncStorage.getItem(MOCK_STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionData) return null;
      
      const session: MockSession = JSON.parse(sessionData);
      
      if (session.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(MOCK_STORAGE_KEYS.CURRENT_SESSION);
        return null;
      }
      
      return await this.findUserById(session.userId);
    } catch (error: any) {
      console.error('[Template:MockAuthService] Error getting current user from storage:', error);
      return null;
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const sessionData = await AsyncStorage.getItem(MOCK_STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionData) return;
      
      const session: MockSession = JSON.parse(sessionData);
      
      session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Extend session by 24 hours
      await AsyncStorage.setItem(MOCK_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      console.warn('[Template:MockAuthService] Refresh session error:', error);
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): { unsubscribe: () => void } {
    let intervalId: NodeJS.Timeout;
    let lastUser: AuthUser | null = null;
    
    const checkAuthState = async () => {
      try {
        const currentUser = await this.getCurrentUser();
        // Deep compare objects to avoid unnecessary re-renders
        const userChanged = JSON.stringify(currentUser) !== JSON.stringify(lastUser);
        
        if (userChanged) {
          lastUser = currentUser;
          callback(currentUser);
        }
      } catch (error) {
        console.warn('[Template:MockAuthService] Error in auth state check:', error);
      }
    };
    
    checkAuthState();
    
    intervalId = setInterval(checkAuthState, 2000);
    
    return {
      unsubscribe: () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };
  }

  private async getUsers(): Promise<MockUser[]> {
    try {
      const usersData = await AsyncStorage.getItem(MOCK_STORAGE_KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('[Template:MockAuthService] Error getting users from storage:', error);
      return [];
    }
  }

  private async saveUsers(users: MockUser[]): Promise<void> {
    try {
      await AsyncStorage.setItem(MOCK_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('[Template:MockAuthService] Error saving users to storage:', error);
    }
  }

  private async findUserByEmail(email: string): Promise<AuthUser | null> {
    const users = await this.getUsers();
    const user = users.find(user => user.email === email);
    return user || null;
  }

  private async findUserById(id: string): Promise<AuthUser | null> {
    const users = await this.getUsers();
    const user = users.find(user => user.id === id);
    return user ? {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    } : null;
  }

  private async createUser(email: string, username?: string): Promise<AuthUser> {
    const users = await this.getUsers();
    
    const generateTestUUID = () => {
      const userCount = users.length;
      const incrementalId = userCount.toString().padStart(12, '0');
      return `00000000-0000-0000-0000-${incrementalId}`;
    };
    
    const newUser: MockUser = {
      id: generateTestUUID(),
      email,
      username: username || email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    users.push(newUser);
    await this.saveUsers(users);
    
    return newUser;
  }

  private async createSession(userId: string): Promise<void> {
    try {
      const session: MockSession = {
        userId,
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
      };
      
      await AsyncStorage.setItem(MOCK_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('[Template:MockAuthService] Error creating session in storage:', error);
    }
  }

  async clearAllMockData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(MOCK_STORAGE_KEYS.USERS),
        AsyncStorage.removeItem(MOCK_STORAGE_KEYS.CURRENT_SESSION),
      ]);
    } catch (error) {
      console.error('[Template:MockAuthService] Error clearing mock data:', error);
    }
  }

  async getMockDebugInfo(): Promise<MockDebugInfo> {
    try {
      const users = await this.getUsers();
      const sessionData = await AsyncStorage.getItem(MOCK_STORAGE_KEYS.CURRENT_SESSION);
      const currentSession = sessionData ? JSON.parse(sessionData) : null;
      
      return { users, currentSession };
    } catch (error: any) {
      console.error('[Template:MockAuthService] Error getting debug info:', error);
      return { users: [], currentSession: null };
    }
  }
}

export const mockAuthService = new MockAuthService();

