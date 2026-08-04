import { api } from "../config/api";
import { getOrCreateDeviceId } from "../lib/deviceId";

export async function getMe() {
  const { data } = await api.get("/auth/me/");
  return data?.data || data;
}

export async function updateProfile(payload: {
  first_name?: string; last_name?: string; city?: string; zone?: string;
  avatar?: string;
  display_name?: string;
  school_level?: string; bio?: string; role?: string;
  serie?: string;
  subjects?: string[];
  levels?: string[];
  hourly_price?: number;
  years_experience?: number;
  onboarding_completed?: boolean;
  kyc_document?: string | null;
  shop_name?: string;
  shop_description?: string;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
}) {
  const normalizedZone = payload.zone ?? payload.city;
  const body = {
    device_id: getOrCreateDeviceId(),
    ...(payload.first_name !== undefined ? { first_name: payload.first_name } : {}),
    ...(payload.last_name !== undefined ? { last_name: payload.last_name } : {}),
    ...(payload.city !== undefined ? { city: payload.city } : {}),
    ...(normalizedZone !== undefined ? { zone: normalizedZone } : {}),
    ...(payload.school_level !== undefined ? { niveau: payload.school_level } : {}),
  };
  const { data } = await api.patch("/auth/me/", body);
  return data?.data || data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  form.append('device_id', getOrCreateDeviceId());
  const { data } = await api.patch('/auth/me/', form);
  return data?.data || data;
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
