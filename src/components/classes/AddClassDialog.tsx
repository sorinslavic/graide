/**
 * Add Class Dialog - Single-screen form
 * Row 1: Subject | Row 2: School Year + Grade + Class Name | Row 3: Students textarea
 * Smart roster reuse: if year+grade+className exists for another subject, prompt to reuse
 */

import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Sparkles, Users } from 'lucide-react';
import { PREDEFINED_SUBJECTS, DEFAULT_SUBJECT, getSubjectName } from '@/constants/subjects';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { toast } from 'sonner';

interface AddClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClassDialog({ open, onClose, onSuccess }: AddClassDialogProps) {
  const { t, i18n } = useTranslation('classes');
  const currentLang = i18n.language as 'ro' | 'en';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const defaultSchoolYear = currentMonth >= 8
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;

  const [subject, setSubject] = useState(getSubjectName(DEFAULT_SUBJECT, currentLang));
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear);
  const [gradeLevel, setGradeLevel] = useState(5);
  const [className, setClassName] = useState('');
  const [studentText, setStudentText] = useState('');
  const [loading, setLoading] = useState(false);

  // Roster reuse
  const [existingStudents, setExistingStudents] = useState<string[]>([]);
  const [reuseAnswer, setReuseAnswer] = useState<'yes' | 'no' | null>(null);
  const reuseCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSubject(getSubjectName(DEFAULT_SUBJECT, currentLang));
      setIsCustomSubject(false);
      setSchoolYear(defaultSchoolYear);
      setGradeLevel(5);
      setClassName('');
      setStudentText('');
      setExistingStudents([]);
      setReuseAnswer(null);
    }
  }, [open]);

  // Debounced roster check when year/grade/class changes
  useEffect(() => {
    if (reuseCheckRef.current) clearTimeout(reuseCheckRef.current);
    setExistingStudents([]);
    setReuseAnswer(null);

    const trimmed = className.trim();
    if (!trimmed || !schoolYear) return;

    reuseCheckRef.current = setTimeout(async () => {
      try {
        const students = await localSheetsService.getStudents();
        const found = students.filter(
          s => s.class_name === trimmed && s.school_year === schoolYear
        );
        if (found.length > 0) {
          setExistingStudents(found.map(s => s.name));
        }
      } catch {
        // non-blocking
      }
    }, 400);

    return () => {
      if (reuseCheckRef.current) clearTimeout(reuseCheckRef.current);
    };
  }, [schoolYear, gradeLevel, className]);

  // When user picks "yes", fill textarea; "no" clears it
  useEffect(() => {
    if (reuseAnswer === 'yes') {
      setStudentText(existingStudents.join('\n'));
    } else if (reuseAnswer === 'no') {
      setStudentText('');
    }
  }, [reuseAnswer]);

  const handleSubjectChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomSubject(true);
      setSubject('');
    } else {
      setIsCustomSubject(false);
      setSubject(value);
    }
  };

  const parsedStudents = studentText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const isValid =
    subject.trim().length > 0 &&
    schoolYear.trim().length > 0 &&
    className.trim().length > 0 &&
    parsedStudents.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setLoading(true);

      await localSheetsService.createClass({
        subject: subject.trim(),
        class_name: className.trim(),
        grade_level: gradeLevel,
        school_year: schoolYear,
      });

      // Only write new student rows when not reusing existing ones
      if (reuseAnswer !== 'yes') {
        for (const studentName of parsedStudents) {
          await localSheetsService.createStudent({
            class_name: className.trim(),
            school_year: schoolYear,
            name: studentName,
          });
        }
      }

      toast.success(t('wizard.success', {
        defaultValue: 'Class created successfully!',
        subject: subject.trim(),
        className: className.trim(),
      }));

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error(t('wizard.error', { defaultValue: 'Failed to create class. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const showReusePrompt = existingStudents.length > 0 && reuseAnswer === null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t('wizard.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Row 1: Subject */}
          <div className="space-y-1.5">
            <Label>{t('wizard.subject_label')}</Label>
            {!isCustomSubject ? (
              <Select value={subject} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('wizard.subject_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_SUBJECTS.map((s) => (
                    <SelectItem key={s.id} value={s[currentLang]}>
                      {s[currentLang]}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-purple-600 font-medium">
                    + {t('wizard.custom_subject_label')}
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('wizard.custom_subject_placeholder')}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsCustomSubject(false); setSubject(getSubjectName(DEFAULT_SUBJECT, currentLang)); }}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          {/* Row 2: Year + Grade + Class Name inline */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>{t('wizard.year_label')}</Label>
              <Select value={schoolYear} onValueChange={setSchoolYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`${currentYear - 2}-${currentYear - 1}`}>{currentYear - 2}-{currentYear - 1}</SelectItem>
                  <SelectItem value={`${currentYear - 1}-${currentYear}`}>{currentYear - 1}-{currentYear}</SelectItem>
                  <SelectItem value={`${currentYear}-${currentYear + 1}`}>{currentYear}-{currentYear + 1}</SelectItem>
                  <SelectItem value={`${currentYear + 1}-${currentYear + 2}`}>{currentYear + 1}-{currentYear + 2}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('wizard.grade_level_label')}</Label>
              <Select
                value={gradeLevel.toString()}
                onValueChange={(v) => setGradeLevel(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('wizard.class_name_label')}</Label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value.toUpperCase())}
                placeholder={t('wizard.class_name_placeholder')}
                className="font-semibold"
              />
            </div>
          </div>

          {/* Row 3: Roster reuse prompt or textarea */}
          {showReusePrompt ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  {t('form.reuse_banner', {
                    defaultValue: '{{count}} students already exist for {{className}} ({{year}}). Reuse this roster?',
                    count: existingStudents.length,
                    className: className.trim(),
                    year: schoolYear,
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setReuseAnswer('yes')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('form.reuse_yes', { defaultValue: 'Yes, reuse' })}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReuseAnswer('no')}
                >
                  {t('form.reuse_no', { defaultValue: 'No, start fresh' })}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="students">{t('wizard.bulk_input_label')}</Label>
                {parsedStudents.length > 0 && (
                  <span className="text-xs text-purple-600 font-medium">
                    {parsedStudents.length} {parsedStudents.length === 1 ? 'student' : 'students'}
                  </span>
                )}
              </div>
              <textarea
                id="students"
                className="w-full min-h-[180px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
                placeholder={t('wizard.bulk_input_placeholder')}
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
              />
              <p className="text-xs text-gray-500">{t('wizard.bulk_input_help')}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t('wizard.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading || showReusePrompt}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('wizard.creating', { defaultValue: 'Creating...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('wizard.create')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
