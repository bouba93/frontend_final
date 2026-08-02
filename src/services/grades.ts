import { api } from '../config/api';

const cachedSchoolId = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('kharandi_cached_profile') || '{}');
    return String(profile.school_id || profile.school?.id || '');
  } catch { return ''; }
};

/** Aucune route GET notes n'a été fournie : l'écran reste vide jusqu'à son ajout. */
export const getGrades = async () => [];
export const createGrade = async (payload: any) => {
  const { data } = await api.post('/ecole/grades', payload);
  return data?.data || data;
};
export const getStudents = async () => {
  const schoolId = cachedSchoolId();
  if (!schoolId) return [];
  const { data } = await api.get(`/ecole/schools/${encodeURIComponent(schoolId)}/students`);
  const value = data?.data || data || [];
  return Array.isArray(value) ? value : value?.items || value?.results || [];
};
