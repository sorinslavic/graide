/**
 * Tests Page — timeline view of all assessments grouped by week/month
 * Active / Archived tabs | Create test button | Test cards with type-based gradients
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  Layers,
  Zap,
  Archive,
  Calendar,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import CreateTestDialog from '@/components/tests/CreateTestDialog';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { Test, Class, AssessmentType, TestStatus } from '@/types';
import { toast } from 'sonner';

// ── helpers ────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface TimelineGroup {
  label: string;
  labelKey?: string; // for i18n lookup
  tests: Test[];
}

function groupByTimeline(tests: Test[]): TimelineGroup[] {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const sorted = [...tests].sort(
    (a, b) => new Date(b.given_at).getTime() - new Date(a.given_at).getTime()
  );

  const thisWeek: Test[] = [];
  const lastWeek: Test[] = [];
  const byMonth: Record<string, Test[]> = {};

  for (const test of sorted) {
    const d = new Date(test.given_at);
    if (d >= thisWeekStart) {
      thisWeek.push(test);
    } else if (d >= lastWeekStart) {
      lastWeek.push(test);
    } else {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(test);
    }
  }

  const groups: TimelineGroup[] = [];
  if (thisWeek.length) groups.push({ labelKey: 'this_week', label: '', tests: thisWeek });
  if (lastWeek.length) groups.push({ labelKey: 'last_week', label: '', tests: lastWeek });

  for (const [key, monthTests] of Object.entries(byMonth).sort().reverse()) {
    const [year, month] = key.split('-');
    const label = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('ro-RO', {
      month: 'long',
      year: 'numeric',
    });
    groups.push({ label, tests: monthTests });
  }

  return groups;
}

// ── type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AssessmentType,
  { gradient: string; icon: React.ComponentType<{ className?: string }> }
> = {
  test: {
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    icon: ClipboardList,
  },
  homework: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    icon: BookOpen,
  },
  project: {
    gradient: 'from-emerald-500 via-teal-500 to-green-500',
    icon: Layers,
  },
  quiz: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    icon: Zap,
  },
};

const TYPE_BADGE: Record<AssessmentType, string> = {
  test: 'bg-violet-100 text-violet-700',
  homework: 'bg-blue-100 text-blue-700',
  project: 'bg-emerald-100 text-emerald-700',
  quiz: 'bg-orange-100 text-orange-700',
};

// ── TestCard ────────────────────────────────────────────────────────────────

interface TestCardProps {
  test: Test;
  classMap: Map<string, Class>;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}

function TestCard({ test, classMap, onArchive, onUnarchive }: TestCardProps) {
  const { t, i18n } = useTranslation('tests');
  const config = TYPE_CONFIG[test.type] ?? TYPE_CONFIG.test;
  const Icon = config.icon;

  const classNames = test.class_ids
    .split(',')
    .map((id) => {
      const cls = classMap.get(id.trim());
      return cls ? `${cls.subject} ${cls.class_name}` : id;
    })
    .filter(Boolean);

  const givenDate = new Date(test.given_at).toLocaleDateString(
    i18n.language === 'ro' ? 'ro-RO' : 'en-GB',
    { day: 'numeric', month: 'short' }
  );

  const deadlineDate =
    test.deadline !== test.given_at
      ? new Date(test.deadline).toLocaleDateString(
          i18n.language === 'ro' ? 'ro-RO' : 'en-GB',
          { day: 'numeric', month: 'short' }
        )
      : null;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient top stripe */}
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[test.type]}`}
              >
                {t(`types.${test.type}`)}
              </span>
              {test.status === 'archived' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {t('status.archived')}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 truncate">{test.name}</h3>

            {/* Class names */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {classNames.map((name) => (
                <span
                  key={name}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Actions menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() =>
                test.status === 'active' ? onArchive(test.id) : onUnarchive(test.id)
              }
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              title={test.status === 'active' ? t('actions.archive') : t('actions.unarchive')}
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {givenDate}
            {deadlineDate && ` → ${deadlineDate}`}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-700">{t(`grading.${test.grading_system}`)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TestsPage() {
  const { t } = useTranslation('tests');
  const [tests, setTests] = useState<Test[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TestStatus>('active');
  const [showCreate, setShowCreate] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsData, classesData] = await Promise.all([
        localSheetsService.getTests(),
        localSheetsService.getClasses(),
      ]);
      setTests(testsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const classMap = useMemo(() => {
    const map = new Map<string, Class>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const filteredTests = useMemo(
    () => tests.filter((t) => t.status === statusFilter),
    [tests, statusFilter]
  );

  const timelineGroups = useMemo(() => groupByTimeline(filteredTests), [filteredTests]);

  const handleArchive = async (id: string) => {
    try {
      await localSheetsService.updateTest(id, { status: 'archived' });
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'archived' } : t)));
    } catch {
      toast.error('Failed to archive test');
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await localSheetsService.updateTest(id, { status: 'active' });
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'active' } : t)));
    } catch {
      toast.error('Failed to restore test');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">{t('loading', { defaultValue: 'Loading...' })}</div>
          </div>
        </main>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (tests.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              <div className="relative z-10 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <ClipboardList className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">{t('empty_state.title')}</h2>
                <p className="text-xl text-white/90 mb-2">{t('empty_state.subtitle')}</p>
                <p className="text-white/80 mb-8 max-w-md mx-auto">{t('empty_state.description')}</p>
                <Button
                  size="lg"
                  onClick={() => setShowCreate(true)}
                  className="bg-white text-violet-700 hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('empty_state.cta')}
                </Button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, gradient: 'from-violet-500 to-purple-500', step: 'step1' },
                { icon: Users, gradient: 'from-purple-500 to-indigo-500', step: 'step2' },
                { icon: CheckCircle2, gradient: 'from-indigo-500 to-blue-500', step: 'step3' },
              ].map(({ icon: Icon, gradient, step }) => (
                <div key={step} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`how_it_works.${step}.title`)}</h3>
                  <p className="text-sm text-gray-600">{t(`how_it_works.${step}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <CreateTestDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={loadData}
        />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">{t('page_title')}</h1>
            <p className="text-navy-500 mt-1">
              {tests.filter((t) => t.status === 'active').length} active
              {tests.filter((t) => t.status === 'archived').length > 0 &&
                `, ${tests.filter((t) => t.status === 'archived').length} archived`}
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white border-0 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('add_test_button')}
          </Button>
        </div>

        {/* Active / Archived filter */}
        <div className="flex gap-2 mb-8">
          {(['active', 'archived'] as TestStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
              }`}
            >
              {t(`status.${s}`)}
              <span className="ml-2 text-xs opacity-70">
                {tests.filter((t) => t.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Timeline groups */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {statusFilter === 'archived'
              ? t('empty_archived', { defaultValue: 'No archived assessments.' })
              : t('empty_active', { defaultValue: 'No active assessments.' })}
          </div>
        ) : (
          <div className="space-y-10">
            {timelineGroups.map((group) => {
              const label = group.labelKey
                ? t(`timeline.${group.labelKey}`)
                : group.label;
              return (
                <div key={label}>
                  {/* Timeline label */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">{group.tests.length}</span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.tests.map((test) => (
                      <TestCard
                        key={test.id}
                        test={test}
                        classMap={classMap}
                        onArchive={handleArchive}
                        onUnarchive={handleUnarchive}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateTestDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
