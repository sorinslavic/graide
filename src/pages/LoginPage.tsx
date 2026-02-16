/**
 * Login page - Google OAuth authentication
 */

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { jwtDecode } from 'jwt-decode';
import { Sheet as SheetsIcon, HardDrive, User, Shield } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

interface GoogleJWTPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation('auth');

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }

      // Decode the JWT to get user info
      const decoded = jwtDecode<GoogleJWTPayload>(credentialResponse.credential);

      const userInfo = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      // Store auth credentials
      await login(credentialResponse.credential, userInfo);

      console.log('✅ Login successful:', userInfo.email);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('❌ Google OAuth error');
    alert('Login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          {/* App Branding */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              gr<span className="text-blue-600">AI</span>de
            </h1>
            <p className="text-gray-600 text-lg">{t('login.title')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('login.subtitle')}</p>
          </div>

          {/* Google Login Button */}
          <div className="mt-8 flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          {/* Permissions Explanation */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              {t('login.permissions_title')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('login.permissions_intro')}
            </p>

            <div className="space-y-4">
              {/* Google Sheets Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <SheetsIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('login.permissions.sheets.title')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('login.permissions.sheets.description')}
                  </p>
                </div>
              </div>

              {/* Google Drive Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('login.permissions.drive.title')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('login.permissions.drive.description')}
                  </p>
                </div>
              </div>

              {/* Profile Permission */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('login.permissions.profile.title')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('login.permissions.profile.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>🔒 {t('login.privacy_note')}</strong>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>{t('login.terms')}</p>
            <p className="mt-2">{t('login.storage_note')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
