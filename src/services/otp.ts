import { api } from "../config/api";
import { saveAuthSession } from "../lib/authSession";

/**
 * Étape 1 — Envoie le code OTP par SMS.
 * @param phone  Numéro au format +224XXXXXXXXX
 */
export async function sendOTP(phone: string, purpose: "LOGIN" | "REGISTER" | "RESET" = "LOGIN"): Promise<void> {
  await api.post("/auth/otp/send/", { phone, purpose });
}

/**
 * Étape 2 — Vérifie le code et stocke les tokens JWT.
 * @param phone  Même numéro qu'à l'envoi
 * @param code   Code à 6 chiffres reçu par SMS
 */
export async function verifyOTP(phone: string, code: string) {
  const { data } = await api.post("/auth/login/verify/", { phone, code, purpose: "LOGIN" });

  return saveAuthSession(data);
}

/** Connexion directe sans OTP */
export async function loginDirect(phone: string) {
  const { data } = await api.post("/auth/login/", { phone });
  
  return saveAuthSession(data);
}
