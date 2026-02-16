/**
 * Dashboard page - Overview of classes, tests, and recent activity
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import SetupWizard from '@/components/setup/SetupWizard';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Check if folder is configured
  useEffect(() => {
    const storedFolderId = localStorage.getItem('graide_folder_id');
    if (storedFolderId) {
      setFolderId(storedFolderId);
    } else {
      setShowSetup(true);
    }
  }, []);

  const handleSetupComplete = (newFolderId: string) => {
    setFolderId(newFolderId);
    setShowSetup(false);
  };

  const handleSetupSkip = () => {
    setShowSetup(false);
  };

  // Show setup wizard if folder not configured
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <SetupWizard
            onComplete={handleSetupComplete}
            onSkip={handleSetupSkip}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Setup Prompt (if skipped) */}
        {!folderId && (
          <div className="mb-6 p-4 bg-coral-50 border border-coral-200 rounded-lg flex items-start gap-3">
            <div className="text-coral-600 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-coral-900">
                {t('setup_prompt.title')}
              </h3>
              <p className="text-sm text-coral-800 mt-1">
                {t('setup_prompt.message')}
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="mt-2 text-sm font-medium text-coral-700 underline hover:no-underline"
              >
                {t('setup_prompt.cta')}
              </button>
            </div>
          </div>
        )}

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
      </main>
    </div>
  );
}
