/**
 * Google OAuth Authentication Service Implementation
 * Handles OAuth flow, token storage, and user info
 */

import { AuthService, UserInfo } from './auth-service';

const TOKEN_KEY = 'google_oauth_token';
const USER_INFO_KEY = 'google_user_info';

export class GoogleAuthService implements AuthService {
  /**
   * Store OAuth credentials after successful login
   */
  async login(credential: string, userInfo: UserInfo): Promise<void> {
    try {
      // Store the credential token
      localStorage.setItem(TOKEN_KEY, credential);

      // Store user info
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

      console.log('✅ User logged in:', userInfo.email);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error('Failed to store authentication credentials');
    }
  }

  /**
   * Clear all authentication data
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw new Error('Failed to clear authentication credentials');
    }
  }

  /**
   * Get the current OAuth token
   */
  async getToken(): Promise<string | null> {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return token !== null && token.length > 0;
  }

  /**
   * Get stored user information
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoStr = localStorage.getItem(USER_INFO_KEY);
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
