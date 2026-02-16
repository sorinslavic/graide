/**
 * Dashboard page - Overview of classes, tests, and recent activity
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import WorkspaceSetupDialog from '@/components/setup/WorkspaceSetupDialog';
import GoogleAPITester from '@/components/dev/GoogleAPITester';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Check if workspace needs setup (folder OR spreadsheet missing)
  useEffect(() => {
    const storedFolderId = localStorage.getItem('graide_folder_id');
    const spreadsheetId = localStorage.getItem('graide_spreadsheet_id');

    if (!storedFolderId || !spreadsheetId) {
      // Either folder or spreadsheet missing - show unified setup dialog
      setFolderId(storedFolderId);
      setShowSetup(true);
    } else {
      setFolderId(storedFolderId);
      setShowSetup(false);
    }
  }, []);

  const handleSetupComplete = (
    newFolderId: string,
    spreadsheetId: string,
    organizedFolderId: string
  ) => {
    console.log('✅ Workspace setup complete:', {
      folderId: newFolderId,
      spreadsheetId,
      organizedFolderId,
    });
    setFolderId(newFolderId);
    setShowSetup(false);
    toast.success(t('workspace_setup.success', { defaultValue: 'Workspace created successfully!' }));
  };

  const handleSetupError = (error: string) => {
    console.error('❌ Workspace setup error:', error);
    toast.error(
      t('workspace_setup.error', {
        defaultValue: 'Failed to create workspace. Please try again.',
      })
    );
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Unified Workspace Setup Dialog */}
      {showSetup && (
        <WorkspaceSetupDialog
          open={showSetup}
          initialFolderId={folderId}
          onComplete={handleSetupComplete}
          onError={handleSetupError}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-navy-700">
            {t('welcome.greeting', { name: user?.name?.split(' ')[0] || 'Teacher' })} 👋
          </h2>
          <p className="text-navy-500 mt-1">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/inbox')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-cream-200 hover:border-navy-200 text-left"
          >
            <div className="text-3xl mb-3">📥</div>
            <h3 className="text-lg font-semibold mb-2">
              {t('cards.inbox.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('cards.inbox.description')}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {t('cards.inbox.status')}
            </p>
          </button>

          <button
            onClick={() => navigate('/classes')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-cream-200 hover:border-navy-200 text-left"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2 text-navy-700">
              {t('cards.classes.title')}
            </h3>
            <p className="text-navy-500 text-sm">
              {t('cards.classes.description')}
            </p>
            <p className="text-xs text-coral-600 mt-2 font-medium">
              ✅ {t('cards.classes.status')}
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-cream-200 hover:border-navy-200 text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-navy-700">
              {t('cards.analytics.title')}
            </h3>
            <p className="text-navy-500 text-sm">
              {t('cards.analytics.description')}
            </p>
            <p className="text-xs text-navy-400 mt-2">
              {t('cards.analytics.status')}
            </p>
          </button>
        </div>

        {/* Phase Complete Banner */}
        <div className="mt-8 p-6 bg-navy-50 border border-navy-200 rounded-lg">
          <h3 className="text-lg font-semibold text-navy-700 mb-2">
            {t('phase_complete.title')}
          </h3>
          <p className="text-navy-600 text-sm">
            {t('phase_complete.message')}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-navy-600">
            <li>✅ {t('phase_complete.features.oauth')}</li>
            <li>✅ {t('phase_complete.features.routes')}</li>
            <li>✅ {t('phase_complete.features.profile')}</li>
            <li>✅ {t('phase_complete.features.logout')}</li>
          </ul>
        </div>

        {/* Google API Tester (Dev Tool - Hidden by default) */}
        {showDevTools && (
          <div className="mt-8">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Developer Tools - For testing and troubleshooting only
              </p>
            </div>
            <GoogleAPITester />
          </div>
        )}

        {/* Dev Tools Toggle (Hidden) */}
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600"
          title="Toggle dev tools"
        >
          {showDevTools ? '🔧 Hide Dev Tools' : '🔧 Show Dev Tools'}
        </button>
      </main>
    </div>
  );
}
