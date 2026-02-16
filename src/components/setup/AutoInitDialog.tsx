/**
 * Auto-Initialization Dialog
 * Shows when graide-data spreadsheet needs to be created
 */

import { useState } from 'react';
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
import { Loader2, FolderOpen, Sheet, CheckCircle2 } from 'lucide-react';
import { initializationService } from '@/services/initialization-service';

interface AutoInitDialogProps {
  open: boolean;
  folderId: string;
  onComplete: (spreadsheetId: string, organizedFolderId: string) => void;
  onError: (error: string) => void;
}

export default function AutoInitDialog({
  open,
  folderId,
  onComplete,
  onError,
}: AutoInitDialogProps) {
  const { t } = useTranslation('setup');
  const [isInitializing, setIsInitializing] = useState(false);
  const [step, setStep] = useState<'confirm' | 'initializing' | 'complete'>('confirm');

  const handleInitialize = async () => {
    setStep('initializing');
    setIsInitializing(true);

    try {
      const result = await initializationService.initialize(folderId);

      if (!result.isInitialized || !result.spreadsheetId || !result.organizedFolderId) {
        throw new Error(result.error || 'Initialization failed');
      }

      setStep('complete');
      setTimeout(() => {
        onComplete(result.spreadsheetId!, result.organizedFolderId!);
      }, 1500);
    } catch (error) {
      console.error('❌ Auto-initialization failed:', error);
      setIsInitializing(false);
      setStep('confirm');
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🚀 {t('auto_init.title', { defaultValue: 'Set Up Your Workspace' })}
              </DialogTitle>
              <DialogDescription className="pt-4 space-y-3">
                <p>
                  {t('auto_init.description', {
                    defaultValue:
                      'To get started, grAIde needs to set up your workspace. This will create:',
                  })}
                </p>

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sheet className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">graide-data Spreadsheet</p>
                      <p className="text-sm text-gray-600">
                        {t('auto_init.spreadsheet_desc', {
                          defaultValue:
                            'Database for classes, students, tests, and grades (editable in Google Sheets)',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FolderOpen className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">organized/ Folder</p>
                      <p className="text-sm text-gray-600">
                        {t('auto_init.folder_desc', {
                          defaultValue:
                            'Where grAIde organizes photos by year/class/test (auto-sorted)',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {t('auto_init.note', {
                    defaultValue:
                      'These will be created in your Google Drive workspace folder. You can view and edit them at any time.',
                  })}
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="w-full"
              >
                {t('auto_init.confirm_button', { defaultValue: 'Create Workspace' })}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'initializing' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('auto_init.initializing_title', {
                  defaultValue: 'Setting up your workspace...',
                })}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm">
                      {t('auto_init.creating_spreadsheet', {
                        defaultValue: 'Creating graide-data spreadsheet...',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm">
                      {t('auto_init.creating_folder', {
                        defaultValue: 'Creating organized/ folder...',
                      })}
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
                {t('auto_init.complete_title', { defaultValue: 'Workspace Ready!' })}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {t('auto_init.spreadsheet_created', {
                        defaultValue: 'graide-data spreadsheet created',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {t('auto_init.folder_created', {
                        defaultValue: 'organized/ folder created',
                      })}
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
