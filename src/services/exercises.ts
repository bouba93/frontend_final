import { api } from '../config/api';

export interface ExerciseQuestion {
  id: string | number;
  prompt: string;
  choices: string[];
  image_url?: string;
}

export interface ExerciseAttempt {
  attempt_id: string;
  questions: ExerciseQuestion[];
  duration_seconds?: number;
}

export async function startExercise(payload: {
  exam: string;
  series?: string;
  year: number;
  subject: string;
  difficulty?: string;
}): Promise<ExerciseAttempt> {
  const { data } = await api.post('/exercises/start', payload);
  const result = data?.data || data;
  return {
    attempt_id: String(result.attempt_id || result.id),
    questions: (result.questions || []).map((q: any, index: number) => ({
      id: q.id ?? index,
      prompt: q.prompt || q.question || q.text,
      choices: q.choices || q.options || [],
      image_url: q.image_url,
    })),
    duration_seconds: result.duration_seconds,
  };
}

export async function submitExercise(attemptId: string, answers: Record<string, number>) {
  const { data } = await api.post(`/exercises/${encodeURIComponent(attemptId)}/submit`, { answers });
  return data?.data || data;
}
