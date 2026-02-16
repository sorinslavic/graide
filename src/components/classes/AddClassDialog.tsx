/**
 * Add Class Dialog - Multi-step wizard
 * Steps: 1. Subject, 2. School Year, 3. Class Name, 4. Students
 */

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Users, BookOpen, Calendar } from 'lucide-react';
import { PREDEFINED_SUBJECTS, DEFAULT_SUBJECT, getSubjectName } from '@/constants/subjects';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { toast } from 'sonner';

interface AddClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

interface FormData {
  subject: string;
  isCustomSubject: boolean;
  schoolYear: string;
  className: string;
  gradeLevel: number;
  students: string[]; // Array of student names
}

export default function AddClassDialog({ open, onClose, onSuccess }: AddClassDialogProps) {
  const { t, i18n } = useTranslation('classes');
  const currentLang = i18n.language as 'ro' | 'en';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Default school year (Sept-Aug academic calendar)
  const defaultSchoolYear = currentMonth >= 8
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;

  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [existingStudents, setExistingStudents] = useState<string[]>([]);
  const [classExists, setClassExists] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    subject: getSubjectName(DEFAULT_SUBJECT, currentLang),
    isCustomSubject: false,
    schoolYear: defaultSchoolYear,
    className: '',
    gradeLevel: 5,
    students: [],
  });

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setFormData({
        subject: getSubjectName(DEFAULT_SUBJECT, currentLang),
        isCustomSubject: false,
        schoolYear: defaultSchoolYear,
        className: '',
        gradeLevel: 5,
        students: [],
      });
      setExistingStudents([]);
      setClassExists(false);
    }
  }, [open]);

  // Check if class exists when we reach step 4
  useEffect(() => {
    if (step === 4 && formData.className && formData.schoolYear) {
      checkExistingClass();
    }
  }, [step]);

  const checkExistingClass = async () => {
    try {
      setLoading(true);
      const students = await localSheetsService.getStudents();
      const existingForClass = students.filter(
        s => s.class_name === formData.className && s.school_year === formData.schoolYear
      );

      if (existingForClass.length > 0) {
        setClassExists(true);
        setExistingStudents(existingForClass.map(s => s.name));
        setFormData(prev => ({ ...prev, students: existingForClass.map(s => s.name) }));
      } else {
        setClassExists(false);
        setExistingStudents([]);
      }
    } catch (error) {
      console.error('Failed to check existing class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (value: string) => {
    if (value === 'custom') {
      setFormData(prev => ({ ...prev, isCustomSubject: true, subject: '' }));
    } else {
      setFormData(prev => ({ ...prev, isCustomSubject: false, subject: value }));
    }
  };

  const handleBulkStudentInput = (text: string) => {
    const names = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setFormData(prev => ({ ...prev, students: names }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.subject.trim().length > 0;
      case 2:
        return formData.schoolYear.trim().length > 0;
      case 3:
        return formData.className.trim().length > 0 && formData.gradeLevel >= 5 && formData.gradeLevel <= 8;
      case 4:
        return formData.students.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as WizardStep);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Create class
      await localSheetsService.createClass({
        subject: formData.subject,
        class_name: formData.className,
        grade_level: formData.gradeLevel,
        school_year: formData.schoolYear,
      });

      // Add students if they don't exist for this class_name + year
      if (!classExists) {
        for (const studentName of formData.students) {
          await localSheetsService.createStudent({
            class_name: formData.className,
            school_year: formData.schoolYear,
            name: studentName,
          });
        }
      }

      toast.success(t('wizard.success', {
        defaultValue: 'Class created successfully!',
        subject: formData.subject,
        className: formData.className,
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('wizard.step1_title')}</h3>
                <p className="text-sm text-gray-600">{t('wizard.step1_subtitle')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="subject">{t('wizard.subject_label')}</Label>
              {!formData.isCustomSubject ? (
                <Select value={formData.subject} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('wizard.subject_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_SUBJECTS.map((subject) => (
                      <SelectItem key={subject.id} value={subject[currentLang]}>
                        {subject[currentLang]}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-blue-600 font-medium">
                      + {t('wizard.custom_subject_label')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="custom-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={t('wizard.custom_subject_placeholder')}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubjectChange(getSubjectName(DEFAULT_SUBJECT, currentLang))}
                  >
                    ← {t('wizard.back_to_predefined', { defaultValue: 'Back to predefined subjects' })}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('wizard.step2_title')}</h3>
                <p className="text-sm text-gray-600">{t('wizard.step2_subtitle')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="schoolYear">{t('wizard.year_label')}</Label>
              <Select value={formData.schoolYear} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolYear: value }))}>
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('wizard.step3_title')}</h3>
                <p className="text-sm text-gray-600">{t('wizard.step3_subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">{t('wizard.class_name_label')}</Label>
                <Input
                  id="className"
                  value={formData.className}
                  onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value.toUpperCase() }))}
                  placeholder={t('wizard.class_name_placeholder')}
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeLevel">{t('wizard.grade_level_label')}</Label>
                <Select
                  value={formData.gradeLevel.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: parseInt(value) }))}
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
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('wizard.step4_title')}</h3>
                <p className="text-sm text-gray-600">{t('wizard.step4_subtitle')}</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : classExists ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    {t('wizard.existing_class_notice', {
                      className: formData.className,
                      year: formData.schoolYear
                    })}
                  </p>
                  <p className="text-sm font-semibold text-blue-700 mt-1">
                    {t('wizard.existing_students_count', { count: existingStudents.length })}
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-1">
                  {existingStudents.map((name, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-6 text-gray-400">{idx + 1}.</span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="students">{t('wizard.bulk_input_label')}</Label>
                <textarea
                  id="students"
                  className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={t('wizard.bulk_input_placeholder')}
                  value={formData.students.join('\n')}
                  onChange={(e) => handleBulkStudentInput(e.target.value)}
                />
                <p className="text-xs text-gray-500">{t('wizard.bulk_input_help')}</p>
                {formData.students.length > 0 && (
                  <p className="text-sm font-medium text-blue-600">
                    {formData.students.length} {formData.students.length === 1 ? 'student' : 'students'}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t('wizard.title')}
          </DialogTitle>
          <DialogDescription>
            {t('wizard.step_indicator', { defaultValue: `Step ${step} of 4`, step })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {renderStepContent()}
        </div>

        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="ghost" onClick={handlePrevious} disabled={loading}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('wizard.previous')}
            </Button>
          )}

          <div className="flex-1" />

          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed() || loading}>
              {t('wizard.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
