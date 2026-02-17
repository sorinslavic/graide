/**
 * Login page - Google OAuth authentication
 */

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { getOAuthClient } from '@/services/auth/google-oauth-client';
import { Sheet as SheetsIcon, HardDrive, User, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // Already logged in — skip the login page
  if (authLoading) return null; // wait for auth state to resolve
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const benefits = t('login.benefits', { returnObjects: true }) as string[];

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const oauthClient = getOAuthClient();
      const tokenResponse = await oauthClient.requestToken();
      const userInfo = await oauthClient.getUserInfo(tokenResponse.access_token);
      await login(tokenResponse.access_token, {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      }, keepSignedIn);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert(t('errors.login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Left panel — gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500" />

        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15),transparent_60%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white">
            Gr<span className="text-white/70">AI</span>de
          </h1>
          <p className="text-white/70 text-lg font-medium mt-1">{t('login.tagline_sub')}</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight whitespace-pre-line">
              {t('login.tagline')}
            </h2>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white/90 mt-0.5 shrink-0" />
                <span className="text-white/90 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10">
          <div className="flex gap-3">
            <div className="h-1 w-16 bg-white/60 rounded-full" />
            <div className="h-1 w-8 bg-white/30 rounded-full" />
            <div className="h-1 w-4 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-cream-50">
        {/* Mobile logo (only shown < lg) */}
        <div className="lg:hidden mb-10 text-center">
          <Logo size="xl" showTagline />
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-navy-800">{t('login.welcome_heading')}</h1>
              <p className="text-navy-500 text-sm mt-1">{t('login.welcome_sub')}</p>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              size="lg"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm flex items-center justify-center gap-3"
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
                  {t('login.sign_in_button')}
                </>
              )}
            </Button>

            {/* Keep me signed in */}
            <div className="mt-4 flex justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
                />
                <span className="text-sm text-navy-600">{t('login.keep_signed_in')}</span>
              </label>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100" />

            {/* Permissions */}
            <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">
              {t('login.permissions_section')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <SheetsIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-700">{t('login.permissions.sheets.title')}</p>
                  <p className="text-xs text-navy-400">{t('login.permissions.sheets.description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <HardDrive className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-700">{t('login.permissions.drive.title')}</p>
                  <p className="text-xs text-navy-400">{t('login.permissions.drive.description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-700">{t('login.permissions.profile.title')}</p>
                  <p className="text-xs text-navy-400">{t('login.permissions.profile.description')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-4 flex items-start gap-2 px-2">
            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
            <p className="text-xs text-navy-500">
              {t('login.privacy_short')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
