const DEVICE_ID_KEY = 'kharandi_device_id';

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `web-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;

  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
