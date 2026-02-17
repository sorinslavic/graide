/**
 * Classes Page - Manage subject-class combinations
 * Shows empty state or list of classes with add/edit/delete functionality
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users, BookOpen, Trash2, Sparkles, GraduationCap } from 'lucide-react';
import Header from '@/components/layout/Header';
import AddClassDialog from '@/components/classes/AddClassDialog';
import { Button } from '@/components/ui/button';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { Class, Student } from '@/types';
import { toast } from 'sonner';

export default function ClassesPage() {
  const { t } = useTranslation('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData] = await Promise.all([
        localSheetsService.getClasses(),
        localSheetsService.getStudents(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error(t('load_error', { defaultValue: 'Failed to load classes' }));
    } finally {
      setLoading(false);
    }
  };

  const getStudentCount = (className: string, schoolYear: string) => {
    return students.filter(s => s.class_name === className && s.school_year === schoolYear).length;
  };

  const handleDeleteClass = async (classId: string, subject: string, className: string) => {
    if (confirm(t('delete_confirm.message', { subject, className }))) {
      try {
        await localSheetsService.deleteClass(classId);
        toast.success(t('delete_success', { defaultValue: 'Class deleted successfully' }));
        loadData();
      } catch (error) {
        console.error('Failed to delete class:', error);
        toast.error(t('delete_error', { defaultValue: 'Failed to delete class' }));
      }
    }
  };

  // Group classes by school year
  const classesByYear = classes.reduce((acc, cls) => {
    if (!acc[cls.school_year]) {
      acc[cls.school_year] = [];
    }
    acc[cls.school_year].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  const sortedYears = Object.keys(classesByYear).sort().reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  // Empty State
  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Empty State Card */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

              {/* Content */}
              <div className="relative z-10 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-white" />
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
                  onClick={() => setShowAddDialog(true)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t('empty_state.cta')}
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('how_it_works.step1.title', { defaultValue: 'Choose Subject' })}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('how_it_works.step1.desc', { defaultValue: 'Select from 12 predefined subjects or add your own' })}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('how_it_works.step2.title', { defaultValue: 'Name Your Class' })}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('how_it_works.step2.desc', { defaultValue: 'Use familiar names like 5A, 7B, 8C' })}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('how_it_works.step3.title', { defaultValue: 'Add Students' })}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('how_it_works.step3.desc', { defaultValue: 'Paste student names - quick and easy' })}
                </p>
              </div>
            </div>
          </div>
        </main>

        <AddClassDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={loadData}
        />
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">{t('page_title')}</h1>
            <p className="text-navy-500 mt-1">
              {t('page_subtitle', {
                defaultValue: '{{count}} classes',
                count: classes.length
              })}
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('add_class_button')}
          </Button>
        </div>

        {/* Classes by Year */}
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="text-xl font-semibold text-navy-700 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                  {year.split('-')[0].slice(-2)}
                </span>
                {t('school_year_label', { defaultValue: 'School Year' })} {year}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesByYear[year].map((cls) => {
                  const studentCount = getStudentCount(cls.class_name, cls.school_year);

                  return (
                    <div
                      key={cls.id}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Gradient Top Border */}
                      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {cls.subject}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
                                {cls.class_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t('class_card.grade', { level: cls.grade_level })}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteClass(cls.id, cls.subject, cls.class_name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            {studentCount > 0
                              ? t(`class_card.students_count${studentCount === 1 ? '' : '_plural'}`, { count: studentCount })
                              : t('class_card.no_students', { defaultValue: 'No students yet' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <AddClassDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
