/**
 * services/ai.ts — Karamo AI (Qwen 2.5-VL via OpenRouter)
 */
import { api } from "../config/api";

// ─── Chat texte ────────────────────────────────────────────────────────────
export async function askAI(
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const { data } = await api.post("/ai/ask", { message, history });
  const payload = data?.data || data;
  return payload?.answer || payload?.reply || payload?.message || payload?.content || payload;
}

// ─── Analyse d'image (photo devoir, schéma) ────────────────────────────────
export async function askAIImage(
  imageOrUrl: File | string,
  question = "Explique et corrige ce document scolaire."
) {
  if (typeof imageOrUrl === "string") {
    const { data } = await api.post("/ai/ask-image", {
      image_url: imageOrUrl, question,
    });
    const payload = data?.data || data;
    return payload?.answer || payload?.reply || payload?.content || "";
  }
  const fd = new FormData();
  fd.append("image",    imageOrUrl);
  fd.append("question", question);
  const { data } = await api.post("/ai/ask-image", fd);
  const payload = data?.data || data;
  return payload?.answer || payload?.reply || payload?.content || "";
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
