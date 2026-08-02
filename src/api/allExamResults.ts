import { loadCeeResults, type CeeResult } from './ceeResults.js';

export interface ExamResult extends CeeResult {
  exam: 'cee' | 'bepc' | 'bepc_fa' | 'bac';
}

let cachedResults: ExamResult[] | null = null;

export async function loadAllExamResults(): Promise<ExamResult[]> {
  if (cachedResults) return cachedResults;
  const cee = await loadCeeResults();
  cachedResults = cee.map(result => ({ ...result, exam: 'cee' as const }));
  return cachedResults;
}

export async function searchExamResults(
  query: string,
  exam = 'all',
  filter = 'all',
  limit = 50,
): Promise<ExamResult[]> {
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const results = await loadAllExamResults();

  return results
    .filter(result => exam === 'all' || result.exam === exam)
    .filter(result => {
      if (!normalizedQuery) return true;
      const searchableFields: Record<string, string> = {
        pv: result.pv,
        centre: result.centre,
        noms: result.noms,
      };
      const fields = filter === 'all'
        ? Object.values(searchableFields)
        : [searchableFields[filter] || ''];
      return fields.some(value => value.toLocaleLowerCase('fr').includes(normalizedQuery));
    })
    .slice(0, Math.max(1, Math.min(limit, 200)));
}
