/**
 * Create / Edit Test Dialog — single-screen form
 * Name | Type | Classes (multi-select) | Given date | Deadline | Grading system
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ClipboardList } from 'lucide-react';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { Class, AssessmentType, GradingSystem } from '@/types';
import { toast } from 'sonner';

interface CreateTestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS: { value: AssessmentType; labelKey: string }[] = [
  { value: 'test', labelKey: 'test' },
  { value: 'homework', labelKey: 'homework' },
  { value: 'project', labelKey: 'project' },
  { value: 'quiz', labelKey: 'quiz' },
];

const GRADING_OPTIONS: { value: GradingSystem; maxScore: number | null }[] = [
  { value: '1-10', maxScore: 10 },
  { value: '1-100', maxScore: 100 },
  { value: 'percentage', maxScore: 100 },
  { value: 'points', maxScore: null },
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function CreateTestDialog({ open, onClose, onSuccess }: CreateTestDialogProps) {
  const { t } = useTranslation('tests');

  const [name, setName] = useState('');
  const [type, setType] = useState<AssessmentType>('test');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [givenAt, setGivenAt] = useState(todayISO());
  const [deadline, setDeadline] = useState(todayISO());
  const [gradingSystem, setGradingSystem] = useState<GradingSystem>('1-10');
  const [maxScore, setMaxScore] = useState(10);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Load classes when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoadingClasses(true);
    localSheetsService
      .getClasses()
      .then(setClasses)
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoadingClasses(false));
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setName('');
      setType('test');
      setSelectedClassIds([]);
      setGivenAt(todayISO());
      setDeadline(todayISO());
      setGradingSystem('1-10');
      setMaxScore(10);
    }
  }, [open]);

  // Sync deadline to givenAt when type is 'test' or 'quiz'
  useEffect(() => {
    if (type === 'test' || type === 'quiz') {
      setDeadline(givenAt);
    }
  }, [type, givenAt]);

  // Sync max score to grading system
  useEffect(() => {
    const opt = GRADING_OPTIONS.find((o) => o.value === gradingSystem);
    if (opt?.maxScore !== null) setMaxScore(opt!.maxScore!);
  }, [gradingSystem]);

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const isValid =
    name.trim().length > 0 &&
    selectedClassIds.length > 0 &&
    givenAt.length > 0 &&
    deadline.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setLoading(true);

      const test = await localSheetsService.createTest({
        name: name.trim(),
        type,
        class_ids: selectedClassIds.join(','),
        given_at: givenAt,
        deadline,
        grading_system: gradingSystem,
        max_score: maxScore,
        status: 'active',
      });

      // Create submissions for every student in each selected class
      for (const classId of selectedClassIds) {
        await localSheetsService.bulkCreateSubmissions(test.id, classId);
      }

      toast.success(t('form.create_success', { defaultValue: 'Assessment created!' }));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create test:', error);
      toast.error(t('form.create_error', { defaultValue: 'Failed to create assessment.' }));
    } finally {
      setLoading(false);
    }
  };

  // Group classes by school year for display
  const classesByYear = classes.reduce((acc, cls) => {
    if (!acc[cls.school_year]) acc[cls.school_year] = [];
    acc[cls.school_year].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  const deadlineLocked = type === 'test' || type === 'quiz';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-violet-600" />
            {t('form.title_create')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Name */}
          <div className="space-y-1.5">
            <Label>{t('form.name_label')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.name_placeholder')}
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>{t('form.type_label')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                    type === opt.value
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                  }`}
                >
                  {t(`types.${opt.value}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Classes multi-select */}
          <div className="space-y-1.5">
            <Label>
              {t('form.classes_label')}
              {selectedClassIds.length > 0 && (
                <span className="ml-2 text-xs text-violet-600 font-medium">
                  {selectedClassIds.length} selected
                </span>
              )}
            </Label>
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                No classes yet — create classes first.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {Object.entries(classesByYear)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([year, yearClasses]) => (
                    <div key={year}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                        {year}
                      </div>
                      {yearClasses.map((cls) => {
                        const checked = selectedClassIds.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                              checked ? 'bg-violet-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleClass(cls.id)}
                              className="w-4 h-4 rounded text-violet-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {cls.subject}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {cls.class_name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Date row: Given at + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('form.given_at_label')}</Label>
              <Input
                type="date"
                value={givenAt}
                onChange={(e) => setGivenAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {t('form.deadline_label')}
                {deadlineLocked && (
                  <span className="ml-1 text-xs text-gray-400">(same day)</span>
                )}
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={deadlineLocked}
                className={deadlineLocked ? 'opacity-50' : ''}
              />
            </div>
          </div>

          {/* Grading row: System + Max score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('form.grading_system_label')}</Label>
              <Select
                value={gradingSystem}
                onValueChange={(v) => setGradingSystem(v as GradingSystem)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADING_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(`grading.${o.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('form.max_score_label')}</Label>
              <Input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                disabled={gradingSystem !== 'points'}
                className={gradingSystem !== 'points' ? 'opacity-50' : ''}
                min={1}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t('form.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('form.creating')}
              </>
            ) : (
              t('form.create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
