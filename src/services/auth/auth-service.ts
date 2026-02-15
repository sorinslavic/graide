/**
 * Authentication service interface
 * Implementations: GoogleAuthService (OAuth 2.0)
 */

export interface AuthService {
  /**
   * Initiate login flow
   */
  login(): Promise<void>;

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
