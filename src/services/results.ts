import { api } from '../config/api';

export type ExamType = 'BAC' | 'BEPC_EG' | 'BEPC_FA' | 'CEE';

export async function importExamResults(file: File, examType: ExamType, year: number) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('La route Xano fournie accepte uniquement les fichiers CSV.');
  }
  const formData = new FormData();
  formData.append('csv_file', file);
  formData.append('exam_type', examType);
  formData.append('year', String(year));
  const { data } = await api.post('/results/import/', formData);
  return data?.data || data;
}
