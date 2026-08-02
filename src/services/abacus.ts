import { api } from '../config/api';

export interface AbacusLevel {
  id: string | number;
  code: string;
  name: string;
  description?: string;
  order?: number;
  unlocked?: boolean;
  stars?: number;
  current_streak?: number;
}

const unwrap = (data: any) => data?.data || data;

export async function getAbacusLevels(): Promise<AbacusLevel[]> {
  const { data } = await api.get('/abacus/levels');
  const value = unwrap(data);
  return Array.isArray(value) ? value : value?.items || value?.results || [];
}

export async function getAbacusSkills(levelId: string | number) {
  const { data } = await api.get(`/abacus/levels/${encodeURIComponent(levelId)}/skills`);
  return unwrap(data) || [];
}

export async function startAbacusSession(payload: { level_id: string | number; mode?: string }) {
  const { data } = await api.post('/abacus/sessions/start', payload);
  return unwrap(data);
}

export async function answerAbacusSession(sessionId: string | number, answer: number) {
  const { data } = await api.post(`/abacus/sessions/${encodeURIComponent(sessionId)}/answer`, { answer });
  return unwrap(data);
}

export async function finishAbacusSession(sessionId: string | number) {
  const { data } = await api.post(`/abacus/sessions/${encodeURIComponent(sessionId)}/finish`);
  return unwrap(data);
}
