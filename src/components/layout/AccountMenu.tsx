/**
 * Account Menu Component
 * Dropdown showing user profile, workspace folder, and logout
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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
import { LogOut, FolderOpen, ChevronDown, ExternalLink, RotateCcw, Sheet, Folder } from 'lucide-react';

interface ConfigState {
  folderId: string | null;
  spreadsheetId: string | null;
  organizedFolderId: string | null;
}

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'setup']);
  const [config, setConfig] = useState<ConfigState>({
    folderId: null,
    spreadsheetId: null,
    organizedFolderId: null,
  });

  const loadConfig = () => {
    setConfig({
      folderId: localStorage.getItem('graide_folder_id'),
      spreadsheetId: localStorage.getItem('graide_spreadsheet_id'),
      organizedFolderId: localStorage.getItem('graide_organized_folder_id'),
    });
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleResetConfig = () => {
    if (confirm('Are you sure you want to reset all workspace configuration? This will:\n\n• Clear folder ID\n• Clear spreadsheet ID\n• Clear organized folder ID\n\nYou will need to set up your workspace again.')) {
      localStorage.removeItem('graide_folder_id');
      localStorage.removeItem('graide_spreadsheet_id');
      localStorage.removeItem('graide_organized_folder_id');
      loadConfig();
      toast.success('Configuration reset successfully');
      // Reload the page to trigger setup wizard
      window.location.reload();
    }
  };

  const getFolderUrl = (folderId: string | null) => {
    if (!folderId) return null;
    return `https://drive.google.com/drive/folders/${folderId}`;
  };

  const getSpreadsheetUrl = (spreadsheetId: string | null) => {
    if (!spreadsheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  };

  const openFolder = (folderId: string | null) => {
    const url = getFolderUrl(folderId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const openSpreadsheet = () => {
    const url = getSpreadsheetUrl(config.spreadsheetId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto py-1.5 px-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full ring-2 ring-white/30"
            />
          ) : (
            <div className="h-8 w-8 rounded-full ring-2 ring-white/30 bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.[0]}
            </div>
          )}
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-white leading-none">{user.name}</p>
            <p className="text-xs text-white/60 mt-0.5">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-white/60" />
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

        {/* Workspace Configuration */}
        <DropdownMenuLabel className="font-normal">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{t('common:account.workspace', { defaultValue: 'Workspace Configuration' })}</span>
            </div>

            {/* Workspace Folder */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Folder className="h-3 w-3" />
                <span className="font-medium">Workspace Folder</span>
              </div>
              {config.folderId ? (
                <button
                  onClick={() => openFolder(config.folderId)}
                  className="w-full text-left px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 flex items-center justify-between group transition-colors"
                  title="Open workspace folder in Drive"
                >
                  <span className="truncate font-mono">
                    ...{config.folderId.slice(-12)}
                  </span>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2" />
                </button>
              ) : (
                <p className="text-xs text-gray-400 italic px-2">Not configured</p>
              )}
            </div>

            {/* Spreadsheet */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Sheet className="h-3 w-3" />
                <span className="font-medium">graide-data Spreadsheet</span>
              </div>
              {config.spreadsheetId ? (
                <button
                  onClick={openSpreadsheet}
                  className="w-full text-left px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 flex items-center justify-between group transition-colors"
                  title="Open graide-data spreadsheet"
                >
                  <span className="truncate font-mono">
                    ...{config.spreadsheetId.slice(-12)}
                  </span>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2" />
                </button>
              ) : (
                <p className="text-xs text-gray-400 italic px-2">Not created</p>
              )}
            </div>

            {/* Organized Folder */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <FolderOpen className="h-3 w-3" />
                <span className="font-medium">Organized Photos Folder</span>
              </div>
              {config.organizedFolderId ? (
                <button
                  onClick={() => openFolder(config.organizedFolderId)}
                  className="w-full text-left px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 flex items-center justify-between group transition-colors"
                  title="Open organized photos folder"
                >
                  <span className="truncate font-mono">
                    ...{config.organizedFolderId.slice(-12)}
                  </span>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2" />
                </button>
              ) : (
                <p className="text-xs text-gray-400 italic px-2">Not created</p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Reset Config */}
        <DropdownMenuItem
          onClick={handleResetConfig}
          className="cursor-pointer text-orange-600 focus:text-orange-600"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('common:buttons.reset_config', { defaultValue: 'Reset Configuration' })}
        </DropdownMenuItem>

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
