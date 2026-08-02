import { api } from '../config/api';
import { MOCK_SCHOLARSHIPS, MOCK_STUDY_ABROAD } from '../data/mockData';

const asList = (data: any): any[] => {
  const value = data?.data || data || [];
  return Array.isArray(value) ? value : value?.items || value?.results || [];
};

export const getNews = async () => {
  try { const { data } = await api.get('/content/news/'); return asList(data); }
  catch { return []; }
};

export const getSchoolRankings = async () => {
  try { const { data } = await api.get('/content/school-rankings/'); return asList(data); }
  catch { return []; }
};

/** Les six affiches fournies restent disponibles localement, sans route Xano supplémentaire. */
export const getStudyAbroad = async () => MOCK_STUDY_ABROAD;

export const getScholarships = async () => {
  try {
    const { data } = await api.get('/content/scholarships/');
    const list = asList(data);
    return list.length ? list : MOCK_SCHOLARSHIPS;
  } catch { return MOCK_SCHOLARSHIPS; }
};

export const getResults = async () => {
  try { const { data } = await api.get('/results/'); return asList(data); }
  catch { return []; }
};

export const searchOfficialResults = async (params: { q: string; exam?: string; year?: number; filter?: string; limit?: number }): Promise<any> => {
  const { exam, limit, filter, ...rest } = params;
  const { data } = await api.get('/results/', {
    params: {
      ...rest,
      exam_type: exam === 'BEPC' ? 'BEPC_EG' : exam,
      search_field: filter,
      page_size: limit,
    },
  });
  return asList(data);
};

export const getTutorAds = async () => [];
export const createTutorAd = async (payload: any) => {
  const { data } = await api.post('/content/tutor-ads', payload);
  return data?.data || data;
};
export const deleteTutorAd = async (_id: string) => {
  throw new Error("La suppression d'annonce répétiteur n'est pas encore disponible dans Xano.");
};

export const getNotifications = async () => {
  const { data } = await api.get('/content/notifications');
  return asList(data);
};
export const markAllRead = async () => undefined;
export const markOneRead = async (_id: string) => undefined;

const progressKey = (documentId: string) => `kharandi_reading_progress_${documentId}`;
export const getReadingProgress = async (documentId: string) => {
  try { return JSON.parse(localStorage.getItem(progressKey(documentId)) || '') || { progress: 0, is_read: false }; }
  catch { return { progress: 0, is_read: false }; }
};
export const saveReadingProgress = async (documentId: string, progress: number, isRead = false) => {
  const value = { progress, is_read: isRead };
  const { data } = await api.post(`/content/reading-progress/${encodeURIComponent(documentId)}/`, value);
  localStorage.setItem(progressKey(documentId), JSON.stringify(value));
  return data?.data || data || value;
};
