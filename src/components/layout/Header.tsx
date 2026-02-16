/**
 * Header Component
 * Displays app branding, language switcher, and account menu
 */

import { useAuth } from '@/hooks/use-auth';
import Logo from '@/components/common/Logo';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import AccountMenu from '@/components/layout/AccountMenu';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Logo size="md" />

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
