import { api } from "../config/api";

export async function getMe() {
  const { data } = await api.get("/auth/me/");
  return data?.data || data;
}

export async function updateProfile(payload: {
  first_name?: string; last_name?: string; city?: string;
  school_level?: string; bio?: string; role?: string;
  onboarding_completed?: boolean;
  kyc_document?: string | null;
  shop_name?: string;
  shop_description?: string;
}) {
  const { data } = await api.patch("/auth/me/", payload);
  return data?.data || data;
}

export async function uploadAvatar(file: File) {
  void file;
  throw new Error("L'endpoint d'envoi d'avatar n'est pas encore disponible dans Xano.");
}

export function logout(): void {
  api.post('/auth/logout/').catch(() => undefined);
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("kharandi_cached_profile");
  // NE PAS supprimer kharandi_device_token → reconnexion directe sans OTP
}

export async function getTrustedDevices() {
  const { data } = await api.get('/auth/devices/');
  return data?.data || data || [];
}

export async function revokeTrustedDevice(id: string | number) {
  await api.delete(`/auth/devices/${encodeURIComponent(id)}/`);
}

// Compatibilité Firebase — non utilisé
export async function setFirebaseToken(): Promise<void> {}
