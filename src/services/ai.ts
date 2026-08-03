/**
 * services/ai.ts — Karamo AI (Qwen 2.5-VL via OpenRouter)
 */
import { api } from "../config/api";

export interface AIResponse {
  answer: string;
  conversation_id?: number;
}

const normalizeAIResponse = (data: any): AIResponse => {
  const payload = data?.data || data || {};
  return {
    answer: String(payload?.answer || payload?.reply || payload?.message || payload?.content || ''),
    conversation_id: payload?.conversation_id !== undefined
      ? Number(payload.conversation_id)
      : payload?.conversation?.id !== undefined
        ? Number(payload.conversation.id)
        : undefined,
  };
};

// ─── Chat texte ────────────────────────────────────────────────────────────
export async function askAI(
  message: string,
  conversationId?: number,
): Promise<AIResponse> {
  const { data } = await api.post("/ai/ask", {
    message,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  });
  return normalizeAIResponse(data);
}

// ─── Analyse d'image (photo devoir, schéma) ────────────────────────────────
export async function askAIImage(
  image: File,
  message = "Explique et corrige cet exercice scolaire.",
): Promise<AIResponse> {
  const fd = new FormData();
  fd.append("image", image);
  fd.append("message", message);
  const { data } = await api.post("/ai/ask-image", fd);
  return normalizeAIResponse(data);
}

// ─── Générer QCM ───────────────────────────────────────────────────────────
export async function generateQCM(params: {
  subject: string; level: string; topic: string;
  difficulty?: "FACILE" | "MOYEN" | "DIFFICILE";
}) {
  void params;
  throw new Error("La génération de QCM IA n'est pas encore exposée dans les routes Xano fournies.");
}

// ─── Soumettre QCM ─────────────────────────────────────────────────────────
export async function submitQCM(
  qcmId: string,
  answers: Record<string, number>
) {
  void qcmId; void answers;
  throw new Error("La soumission de QCM IA n'est pas encore exposée dans les routes Xano fournies.");
}

// ─── Statut Karamo ─────────────────────────────────────────────────────────
export async function getAIStatus() {
  return { available: true, source: 'xano', endpoints: ['ai/ask', 'ai/ask-image'] };
}
