/**
 * Subject constants and definitions
 * Romanian middle school subjects with i18n support
 */

export const PREDEFINED_SUBJECTS = [
  { id: 'math', ro: 'Matematică', en: 'Mathematics' },
  { id: 'romanian', ro: 'Limba și Literatura Română', en: 'Romanian Language and Literature' },
  { id: 'english', ro: 'Limba Engleză', en: 'English Language' },
  { id: 'history', ro: 'Istorie', en: 'History' },
  { id: 'geography', ro: 'Geografie', en: 'Geography' },
  { id: 'biology', ro: 'Biologie', en: 'Biology' },
  { id: 'physics', ro: 'Fizică', en: 'Physics' },
  { id: 'chemistry', ro: 'Chimie', en: 'Chemistry' },
  { id: 'physical-education', ro: 'Educație Fizică', en: 'Physical Education' },
  { id: 'technology', ro: 'Educație Tehnologică', en: 'Technological Education' },
  { id: 'music', ro: 'Muzică', en: 'Music' },
  { id: 'arts', ro: 'Arte Vizuale', en: 'Visual Arts' },
] as const;

export const DEFAULT_SUBJECT = 'math';

/**
 * Get subject name by ID and language
 */
export function getSubjectName(subjectId: string, language: 'ro' | 'en'): string {
  const subject = PREDEFINED_SUBJECTS.find(s => s.id === subjectId);
  return subject ? subject[language] : subjectId;
}

/**
 * Check if subject is predefined
 */
export function isPredefinedSubject(subjectName: string): boolean {
  return PREDEFINED_SUBJECTS.some(
    s => s.ro === subjectName || s.en === subjectName
  );
}
