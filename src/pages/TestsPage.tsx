/**
 * Tests Page - Create and manage tests, homework, projects, quizzes
 * Shows a timeline/calendar view of all assessments grouped by week
 */

import { useTranslation } from 'react-i18next';
import { ClipboardList, Plus, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function TestsPage() {
  const { t } = useTranslation('tests');

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          {/* Empty State Card */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

            <div className="relative z-10 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <ClipboardList className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                {t('empty_state.title')}
              </h2>
              <p className="text-xl text-white/90 mb-2">
                {t('empty_state.subtitle')}
              </p>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                {t('empty_state.description')}
              </p>

              <Button
                size="lg"
                className="bg-white text-violet-700 hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('empty_state.cta')}
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('how_it_works.step1.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('how_it_works.step1.desc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('how_it_works.step2.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('how_it_works.step2.desc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('how_it_works.step3.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('how_it_works.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
