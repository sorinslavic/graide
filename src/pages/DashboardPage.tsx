/**
 * Dashboard page - Overview of classes, tests, and recent activity
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Inbox, Users, BarChart3, Sparkles } from 'lucide-react';
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
    toast.success(t('setup:workspace_setup.success'));
  };

  const handleSetupError = (error: string) => {
    console.error('❌ Workspace setup error:', error);
    toast.error(t('setup:workspace_setup.error'));
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {/* Photo Inbox Card */}
          <button
            onClick={() => navigate('/inbox')}
            className="group relative p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Inbox className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {t('cards.inbox.title')}
              </h3>
              <p className="text-white/90 text-sm mb-3">
                {t('cards.inbox.description')}
              </p>
              <p className="text-xs text-white/70 font-medium">
                {t('cards.inbox.status')}
              </p>
            </div>
          </button>

          {/* Classes Card */}
          <button
            onClick={() => navigate('/classes')}
            className="group relative p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {t('cards.classes.title')}
              </h3>
              <p className="text-white/90 text-sm mb-3">
                {t('cards.classes.description')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-white font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <Sparkles className="h-3 w-3" />
                {t('cards.classes.status')}
              </div>
            </div>
          </button>

          {/* Analytics Card */}
          <button
            onClick={() => navigate('/analytics')}
            className="group relative p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {t('cards.analytics.title')}
              </h3>
              <p className="text-white/90 text-sm mb-3">
                {t('cards.analytics.description')}
              </p>
              <p className="text-xs text-white/70 font-medium">
                {t('cards.analytics.status')}
              </p>
            </div>
          </button>
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
