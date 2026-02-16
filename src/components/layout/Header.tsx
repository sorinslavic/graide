/**
 * Header Component
 * Displays user info, language switcher, and logout button
 */

import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            gr<span className="text-blue-600">AI</span>de
          </h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('buttons.logout')}</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
