/**
 * Login page - Google OAuth authentication with proper scopes
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { getOAuthClient } from '@/services/auth/google-oauth-client';
import { Sheet as SheetsIcon, HardDrive, User, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Initiating OAuth flow...');

      const oauthClient = getOAuthClient();

      // Request OAuth token with proper scopes
      const tokenResponse = await oauthClient.requestToken();
      console.log('✅ Received access token with scopes:', tokenResponse.scope);

      // Get user info using the access token
      const userInfo = await oauthClient.getUserInfo(tokenResponse.access_token);
      console.log('✅ User info retrieved:', userInfo.email);

      // Store credentials
      await login(tokenResponse.access_token, {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });

      console.log('✅ Login successful');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Login failed. Please try again and grant all required permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-navy-50">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-xl shadow-xl border border-cream-200">
          {/* App Branding */}
          <div className="text-center">
            <Logo size="xl" showTagline />
            <p className="text-navy-600 text-lg mt-4">{t('login.title')}</p>
            <p className="text-sm text-navy-400 mt-2">{t('login.subtitle')}</p>
          </div>

          {/* Google Login Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              size="lg"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm flex items-center gap-3 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z" fill="#4285F4"/>
                      <path d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z" fill="#34A853"/>
                      <path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05"/>
                      <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z" fill="#EA4335"/>
                    </g>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>

          {/* Permissions Explanation */}
          <div className="mt-8 border-t border-cream-200 pt-6">
            <h3 className="text-sm font-semibold text-navy-700 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-coral-500" />
              {t('login.permissions_title')}
            </h3>
            <p className="text-sm text-navy-600 mb-4">
              {t('login.permissions_intro')}
            </p>

            <div className="space-y-4">
              {/* Google Sheets Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                    <SheetsIcon className="h-5 w-5 text-navy-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-700">
                    {t('login.permissions.sheets.title')}
                  </p>
                  <p className="text-xs text-navy-500">
                    {t('login.permissions.sheets.description')}
                  </p>
                </div>
              </div>

              {/* Google Drive Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-coral-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-700">
                    {t('login.permissions.drive.title')}
                  </p>
                  <p className="text-xs text-navy-500">
                    {t('login.permissions.drive.description')}
                  </p>
                </div>
              </div>

              {/* Profile Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-navy-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-700">
                    {t('login.permissions.profile.title')}
                  </p>
                  <p className="text-xs text-navy-500">
                    {t('login.permissions.profile.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-navy-50 border border-navy-200 rounded-lg">
            <p className="text-xs text-navy-700">
              <strong>🔒 {t('login.privacy_note')}</strong>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-navy-400">
            <p>{t('login.terms')}</p>
            <p className="mt-2">{t('login.storage_note')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
