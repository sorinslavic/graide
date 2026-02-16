/**
 * Authentication hook
 * Provides auth state and methods to components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleAuthService } from '@/services/auth/google-auth-service';
import { UserInfo } from '@/services/auth/auth-service';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string, userInfo: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user info on mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await googleAuthService.getUserInfo();
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to load user info:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const login = async (credential: string, userInfo: UserInfo) => {
    await googleAuthService.login(credential, userInfo);
    setUser(userInfo);
  };

  const logout = async () => {
    await googleAuthService.logout();
    setUser(null);
  };

  const getToken = async () => {
    return googleAuthService.getToken();
  };

  const value = {
    user,
    isAuthenticated: googleAuthService.isAuthenticated(),
    isLoading,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
