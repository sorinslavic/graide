/**
 * Account Menu Component
 * Dropdown showing user profile, workspace folder, and logout
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, FolderOpen, ChevronDown, ExternalLink } from 'lucide-react';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'setup']);
  const [folderId, setFolderId] = useState<string | null>(null);

  useEffect(() => {
    const storedFolderId = localStorage.getItem('graide_folder_id');
    setFolderId(storedFolderId);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getFolderUrl = () => {
    if (!folderId) return null;
    return `https://drive.google.com/drive/folders/${folderId}`;
  };

  const openFolder = () => {
    const url = getFolderUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Workspace Folder */}
        <DropdownMenuLabel className="font-normal">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{t('common:account.workspace')}</span>
            </div>
            {folderId ? (
              <button
                onClick={openFolder}
                className="w-full text-left px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 flex items-center justify-between group transition-colors"
                title={t('common:account.open_folder')}
              >
                <span className="truncate font-mono">
                  ...{folderId.slice(-12)}
                </span>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2" />
              </button>
            ) : (
              <p className="text-xs text-gray-500 italic px-2">
                {t('common:account.not_configured')}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('common:buttons.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
