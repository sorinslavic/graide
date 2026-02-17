/**
 * Google OAuth Authentication Service Implementation
 * Handles OAuth flow, token storage, and user info
 */

import { AuthService, UserInfo } from './auth-service';

const TOKEN_KEY = 'google_oauth_token';
const USER_INFO_KEY = 'google_user_info';

/** Thrown when a Google API call returns 401 — token expired or revoked. */
export class AuthExpiredError extends Error {
  constructor() {
    super('Google session expired. Please sign in again.');
    this.name = 'AuthExpiredError';
  }
}

// Reads a key from localStorage first, then sessionStorage
function readStorage(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

// Clears a key from both storages
function clearStorage(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export class GoogleAuthService implements AuthService {
  /**
   * Store OAuth credentials after successful login.
   * keepSignedIn=true → localStorage (persists across sessions)
   * keepSignedIn=false → sessionStorage (cleared on tab close)
   */
  async login(credential: string, userInfo: UserInfo, keepSignedIn = false): Promise<void> {
    try {
      // Clear any previous tokens from both storages before writing
      clearStorage(TOKEN_KEY);
      clearStorage(USER_INFO_KEY);

      const storage = keepSignedIn ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, credential);
      storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

      console.log('✅ User logged in:', userInfo.email, keepSignedIn ? '(persistent)' : '(session only)');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error('Failed to store authentication credentials');
    }
  }

  /**
   * Clear all authentication data from both storages
   */
  async logout(): Promise<void> {
    try {
      clearStorage(TOKEN_KEY);
      clearStorage(USER_INFO_KEY);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw new Error('Failed to clear authentication credentials');
    }
  }

  /**
   * Get the current OAuth token (checks both storages)
   */
  async getToken(): Promise<string | null> {
    return readStorage(TOKEN_KEY);
  }

  /**
   * Check if user is currently authenticated (checks both storages)
   */
  isAuthenticated(): boolean {
    const token = readStorage(TOKEN_KEY);
    return token !== null && token.length > 0;
  }

  /**
   * Get stored user information (checks both storages)
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoStr = readStorage(USER_INFO_KEY);
      if (!userInfoStr) {
        return null;
      }
      return JSON.parse(userInfoStr) as UserInfo;
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
