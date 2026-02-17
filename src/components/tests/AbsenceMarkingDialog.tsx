/**
 * Absence Marking Dialog
 * Shows student roster per class for a test; teacher checks absent students.
 * Updates Submission.status between 'new' ↔ 'absent'.
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserX } from 'lucide-react';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { Test, Submission, Student, Class } from '@/types';
import { toast } from 'sonner';

interface AbsenceMarkingDialogProps {
  test: Test;
  classMap: Map<string, Class>;
  open: boolean;
  onClose: () => void;
  /** Called after saving so the parent can refresh submission counts */
  onSaved: () => void;
}

export default function AbsenceMarkingDialog({
  test,
  classMap,
  open,
  onClose,
  onSaved,
}: AbsenceMarkingDialogProps) {
  const { t } = useTranslation('tests');

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local absent-set: submissionId → true/false
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    Promise.all([
      localSheetsService.getSubmissions({ testId: test.id }),
      localSheetsService.getStudents(),
    ])
      .then(([subs, studs]) => {
        setSubmissions(subs);
        setStudents(studs);
        // Initialise absent set from current status
        setAbsentIds(new Set(subs.filter((s) => s.status === 'absent').map((s) => s.id)));
      })
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoading(false));
  }, [open, test.id]);

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>();
    students.forEach((s) => m.set(s.id, s));
    return m;
  }, [students]);

  // Group submissions by class_id
  const byClass = useMemo(() => {
    const groups = new Map<string, Submission[]>();
    for (const sub of submissions) {
      if (!groups.has(sub.class_id)) groups.set(sub.class_id, []);
      groups.get(sub.class_id)!.push(sub);
    }
    return groups;
  }, [submissions]);

  const classIds = test.class_ids.split(',').map((s) => s.trim()).filter(Boolean);

  const toggleAbsent = (submissionId: string) => {
    setAbsentIds((prev) => {
      const next = new Set(prev);
      if (next.has(submissionId)) next.delete(submissionId);
      else next.add(submissionId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Determine which submissions changed
      const toMakeAbsent = submissions.filter(
        (s) => absentIds.has(s.id) && s.status !== 'absent'
      );
      const toMakePresent = submissions.filter(
        (s) => !absentIds.has(s.id) && s.status === 'absent'
      );

      await Promise.all([
        ...toMakeAbsent.map((s) =>
          localSheetsService.updateSubmission(s.id, { status: 'absent' })
        ),
        ...toMakePresent.map((s) =>
          localSheetsService.updateSubmission(s.id, { status: 'new' })
        ),
      ]);

      const totalChanged = toMakeAbsent.length + toMakePresent.length;
      if (totalChanged > 0) {
        toast.success(
          t('absences.saved', {
            defaultValue: '{{count}} student(s) updated',
            count: totalChanged,
          })
        );
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save absences:', error);
      toast.error(t('absences.save_error', { defaultValue: 'Failed to save absences.' }));
    } finally {
      setSaving(false);
    }
  };

  const absentCount = absentIds.size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-orange-500" />
            {t('absences.title', { defaultValue: 'Mark Absences' })}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1 font-normal">{test.name}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            {t('absences.no_submissions', {
              defaultValue: 'No submissions found. Students may not have been assigned yet.',
            })}
          </div>
        ) : (
          <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {classIds.map((classId) => {
              const cls = classMap.get(classId);
              const classSubs = byClass.get(classId) ?? [];
              if (classSubs.length === 0) return null;

              const classAbsentCount = classSubs.filter((s) => absentIds.has(s.id)).length;

              return (
                <div key={classId}>
                  {/* Class header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {cls ? `${cls.subject} · ${cls.class_name}` : classId}
                    </span>
                    {classAbsentCount > 0 && (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {classAbsentCount} absent
                      </span>
                    )}
                  </div>

                  {/* Student rows */}
                  <div className="space-y-1 rounded-xl border border-gray-100 overflow-hidden">
                    {classSubs.map((sub, idx) => {
                      const student = studentMap.get(sub.student_id);
                      const isAbsent = absentIds.has(sub.id);

                      return (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${
                            isAbsent
                              ? 'bg-orange-50 hover:bg-orange-100'
                              : idx % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50/50 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAbsent}
                            onChange={() => toggleAbsent(sub.id)}
                            className="w-4 h-4 rounded text-orange-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm flex-1 ${
                              isAbsent ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {student?.name ?? `Student ${sub.student_id.slice(-6)}`}
                          </span>
                          {isAbsent && (
                            <span className="text-xs text-orange-500 font-medium">
                              {t('submission_status.absent')}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2">
          {absentCount > 0 && (
            <span className="text-sm text-orange-600 font-medium mr-auto">
              {absentCount} {absentCount === 1 ? 'student' : 'students'} absent
            </span>
          )}
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('form.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('absences.saving', { defaultValue: 'Saving...' })}
              </>
            ) : (
              t('absences.save', { defaultValue: 'Save Absences' })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
