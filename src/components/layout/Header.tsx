/**
 * Header Component
 * Displays app branding, language switcher, and account menu
 */

import { useAuth } from '@/hooks/use-auth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import AccountMenu from '@/components/layout/AccountMenu';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            gr<span className="text-blue-600">AI</span>de
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <AccountMenu />
          </div>
        )}
      </div>
    </header>
  );
}
