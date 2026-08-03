import { api } from '../config/api';

const cachedSchoolId = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('kharandi_cached_profile') || '{}');
    return String(profile.school_id || profile.school?.id || '');
  } catch { return ''; }
};

/** Aucune route GET notes n'a été fournie : l'écran reste vide jusqu'à son ajout. */
export const getGrades = async () => [];
export interface GradeInput {
  student_id: number | string;
  subject_id: number | string;
  value: number;
  trimester: string;
}
export const createGrade = async (payload: GradeInput) => {
  const body = {
    student_id: Number(payload.student_id),
    subject_id: Number(payload.subject_id),
    value: Number(payload.value),
    trimester: payload.trimester,
  };
  if (![body.student_id, body.subject_id].every(Number.isInteger)) throw new Error('Les identifiants élève et matière sont invalides.');
  const { data } = await api.post('/ecole/grades', body);
  return data?.data || data;
};
export const getStudents = async () => {
  const schoolId = cachedSchoolId();
  if (!schoolId) return [];
  const { data } = await api.get(`/ecole/schools/${encodeURIComponent(schoolId)}/students`);
  const value = data?.data || data || [];
  return Array.isArray(value) ? value : value?.items || value?.results || [];
};
