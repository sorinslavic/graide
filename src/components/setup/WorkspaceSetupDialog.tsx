/**
 * Unified Workspace Setup Dialog
 * Handles both Drive folder configuration and workspace initialization
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FolderOpen, Sheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { initializationService } from '@/services/initialization-service';
import { localDriveService } from '@/services/google/local-drive-service';

interface WorkspaceSetupDialogProps {
  open: boolean;
  initialFolderId?: string | null;
  onComplete: (folderId: string, spreadsheetId: string, organizedFolderId: string) => void;
  onError: (error: string) => void;
}

export default function WorkspaceSetupDialog({
  open,
  initialFolderId,
  onComplete,
  onError,
}: WorkspaceSetupDialogProps) {
  const { t } = useTranslation('setup');
  const [folderUrl, setFolderUrl] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [step, setStep] = useState<'input' | 'initializing' | 'complete'>('input');

  // Pre-fill folder URL if folderId exists
  useEffect(() => {
    if (initialFolderId) {
      setFolderId(initialFolderId);
      setFolderUrl(`https://drive.google.com/drive/folders/${initialFolderId}`);
    }
  }, [initialFolderId]);

  const handleSetup = async () => {
    setError('');

    // Validate input
    if (!folderUrl.trim()) {
      setError(t('workspace_setup.error_no_url'));
      return;
    }

    // Extract folder ID
    const extractedId = localDriveService.extractFolderIdFromShareLink(folderUrl);
    if (!extractedId) {
      setError(t('workspace_setup.error_invalid_url'));
      return;
    }

    setFolderId(extractedId);
    setStep('initializing');
    setIsInitializing(true);

    try {
      // Save folder ID first
      localStorage.setItem('graide_folder_id', extractedId);

      // Initialize workspace (creates spreadsheet + organized folder)
      const result = await initializationService.initialize(extractedId);

      if (!result.isInitialized || !result.spreadsheetId || !result.organizedFolderId) {
        throw new Error(result.error || 'Initialization failed');
      }

      setStep('complete');
      setTimeout(() => {
        onComplete(extractedId, result.spreadsheetId!, result.organizedFolderId!);
      }, 1500);
    } catch (err) {
      console.error('❌ Workspace setup failed:', err);
      setIsInitializing(false);
      setStep('input');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        {step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🚀 {t('workspace_setup.title')}
              </DialogTitle>
              <DialogDescription className="pt-4 space-y-4">
                <p className="text-sm text-gray-700">
                  {t('workspace_setup.description')}
                </p>

                {/* What will be created */}
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {t('workspace_setup.will_create')}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Sheet className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('workspace_setup.spreadsheet_name')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('workspace_setup.spreadsheet_desc')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FolderOpen className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('workspace_setup.folder_name')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('workspace_setup.folder_desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Folder URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="folder-url" className="text-sm font-medium">
                    {t('workspace_setup.folder_url_label')}
                  </Label>
                  <Input
                    id="folder-url"
                    type="text"
                    value={folderUrl}
                    onChange={(e) => {
                      setFolderUrl(e.target.value);
                      setError('');
                    }}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className={error ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    {t('workspace_setup.folder_url_help')}
                  </p>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={handleSetup}
                disabled={isInitializing || !folderUrl.trim()}
                className="w-full"
              >
                {t('workspace_setup.confirm_button')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'initializing' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('workspace_setup.initializing_title')}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm">
                      {t('workspace_setup.creating_spreadsheet')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm">
                      {t('workspace_setup.creating_folder')}
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                {t('workspace_setup.complete_title')}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {t('workspace_setup.spreadsheet_created')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {t('workspace_setup.folder_created')}
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
