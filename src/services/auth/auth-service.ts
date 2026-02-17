/**
 * Authentication service interface
 * Implementations: GoogleAuthService (OAuth 2.0)
 */

export interface AuthService {
  /**
   * Store credentials after successful OAuth flow
   */
  login(credential: string, userInfo: UserInfo, keepSignedIn?: boolean): Promise<void>;

  /**
   * Logout and clear credentials
   */
  logout(): Promise<void>;

  /**
   * Get current access token
   */
  getToken(): Promise<string | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get user info
   */
  getUserInfo(): Promise<UserInfo | null>;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
