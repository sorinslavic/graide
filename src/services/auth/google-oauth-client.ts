/**
 * Google OAuth Client
 * Implements proper OAuth 2.0 flow with Drive and Sheets scopes
 */

// Required OAuth scopes
const REQUIRED_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/spreadsheets', // Sheets read/write
  'https://www.googleapis.com/auth/drive', // Drive read/write (needed for photos)
];

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class GoogleOAuthClient {
  private clientId: string;
  private redirectUri: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.redirectUri = window.location.origin + '/oauth/callback';
  }

  /**
   * Initialize Google Identity Services
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services script if not already loaded
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Request OAuth token with proper scopes
   */
  async requestToken(): Promise<TokenResponse> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      // Use Google Identity Services Token Client
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: REQUIRED_SCOPES.join(' '),
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          console.log('✅ OAuth token received with scopes:', response.scope);
          resolve({
            access_token: response.access_token,
            expires_in: response.expires_in,
            scope: response.scope,
            token_type: response.token_type || 'Bearer',
          });
        },
      });

      // Request token (opens OAuth consent popup)
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Get user info from access token
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(accessToken: string): Promise<void> {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
    });
  }
}

// Export singleton
let oauthClient: GoogleOAuthClient | null = null;

export function getOAuthClient(): GoogleOAuthClient {
  if (!oauthClient) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
    }
    oauthClient = new GoogleOAuthClient(clientId);
  }
  return oauthClient;
}
