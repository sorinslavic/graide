/**
 * Setup Wizard Component
 * First-time setup for Google Drive folder configuration
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';

interface SetupWizardProps {
  onComplete: (folderId: string) => void;
  onSkip?: () => void;
}

export default function SetupWizard({ onComplete, onSkip }: SetupWizardProps) {
  const { t } = useTranslation('setup');
  const [folderLink, setFolderLink] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Extract folder ID from Google Drive share link
   * Formats:
   * - https://drive.google.com/drive/folders/1abc...xyz
   * - https://drive.google.com/drive/folders/1abc...xyz?usp=sharing
   */
  const extractFolderId = (link: string): string | null => {
    try {
      const patterns = [
        /\/folders\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/,
      ];

      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Validate input
    if (!folderLink.trim()) {
      setError(t('folder_setup.validation.required'));
      setIsValidating(false);
      return;
    }

    // Extract folder ID
    const folderId = extractFolderId(folderLink);
    if (!folderId) {
      setError(t('folder_setup.validation.invalid'));
      setIsValidating(false);
      return;
    }

    // Simulate validation delay (in real implementation, would check Drive API access)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem('graide_folder_id', folderId);

    setIsValidating(false);
    onComplete(folderId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
          <FolderOpen className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.title')}
        </h2>
        <p className="text-gray-600">{t('wizard.subtitle')}</p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          {t('folder_setup.title')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('folder_setup.intro')}
        </p>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {t('folder_setup.instructions.title')}
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>{t('folder_setup.instructions.step1')}</li>
            <li>{t('folder_setup.instructions.step2')}</li>
            <li>{t('folder_setup.instructions.step3')}</li>
            <li>{t('folder_setup.instructions.step4')}</li>
          </ol>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="folderLink"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('folder_setup.input_label')}
          </label>
          <input
            type="text"
            id="folderLink"
            value={folderLink}
            onChange={(e) => {
              setFolderLink(e.target.value);
              setError('');
            }}
            placeholder={t('folder_setup.input_placeholder')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isValidating}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('folder_setup.help_text')}
          </p>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isValidating}
          >
            {isValidating ? (
              <>{t('status.checking_folder')}</>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('buttons.continue', { ns: 'common' })}
              </>
            )}
          </Button>
          {onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isValidating}
            >
              {t('wizard.skip_link')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
