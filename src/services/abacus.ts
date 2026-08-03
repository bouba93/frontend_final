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

export interface AbacusSkill {
  id: string | number;
  name: string;
  description?: string;
  mode?: AbacusMode;
  unlocked?: boolean;
}

export type AbacusMode = 'GUIDED' | 'PRACTICE' | 'TIMED' | 'FLASH_ANZAN';

const unwrap = (data: any) => data?.data || data;

export async function getAbacusLevels(): Promise<AbacusLevel[]> {
  const { data } = await api.get('/abacus/levels');
  const value = unwrap(data);
  return Array.isArray(value) ? value : value?.items || value?.results || [];
}

export async function getAbacusSkills(levelId: string | number) {
  const { data } = await api.get(`/abacus/levels/${encodeURIComponent(levelId)}/skills`);
  const value = unwrap(data) || [];
  return (Array.isArray(value) ? value : value?.items || value?.results || []) as AbacusSkill[];
}

export async function startAbacusSession(payload: { skill_id: string | number; mode: AbacusMode }) {
  const { data } = await api.post('/abacus/sessions/start', payload);
  const session = unwrap(data) || {};
  const questions = Array.isArray(session.questions) ? session.questions : [];
  return {
    ...session,
    id: session.id ?? session.session_id,
    current_question: session.current_question ?? session.question ?? questions[0],
    total_questions: session.total_questions ?? questions.length,
    current_index: session.current_index ?? 1,
  };
}

export async function answerAbacusSession(
  sessionId: string | number,
  payload: { question_id: string | number; answer: string; response_time_ms: number },
) {
  const { data } = await api.post(`/abacus/sessions/${encodeURIComponent(sessionId)}/answer`, payload);
  return unwrap(data);
}

export async function finishAbacusSession(sessionId: string | number) {
  const { data } = await api.post(`/abacus/sessions/${encodeURIComponent(sessionId)}/finish`);
  return unwrap(data);
}
