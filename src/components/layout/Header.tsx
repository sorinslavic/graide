/**
 * Header Component
 * Gradient navigation bar with app branding and page links
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Inbox, Users, BarChart3, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import AccountMenu from '@/components/layout/AccountMenu';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'classes', href: '/classes', icon: Users },
  { key: 'inbox', href: '/inbox', icon: Inbox },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
] as const;

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  const isActive = (href: string) =>
    href === '/dashboard'
      ? location.pathname === href
      : location.pathname.startsWith(href);

  return (
    <header className="relative overflow-hidden shrink-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500" />
      {/* Subtle depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_200%,rgba(255,255,255,0.12),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="shrink-0 group"
          >
            <h1 className="text-xl font-bold text-white group-hover:opacity-90 transition-opacity">
              Gr<span className="text-white/60">AI</span>de
            </h1>
          </button>

          {/* Nav items — desktop */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => navigate(href)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive(href)
                      ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(`navigation.${key}`)}
                </button>
              ))}
            </nav>
          )}

          {/* Right side */}
          {user && (
            <div className="flex items-center gap-2 ml-auto">
              <LanguageSwitcher onDark />
              <AccountMenu />
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {user && (
          <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
              <button
                key={key}
                onClick={() => navigate(href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive(href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(`navigation.${key}`)}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
