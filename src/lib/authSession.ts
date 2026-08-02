type AnyRecord = Record<string, any>;

export function unwrapApiData(response: AnyRecord | null | undefined): AnyRecord {
  return (response?.data || response || {}) as AnyRecord;
}

export function saveAuthSession(response: AnyRecord | null | undefined): AnyRecord {
  const payload = unwrapApiData(response);
  const tokens = payload.tokens || {};

  const access =
    tokens.access ||
    payload.access ||
    payload.access_token ||
    payload.authToken ||
    payload.token;
  const refresh = tokens.refresh || payload.refresh || payload.refresh_token;
  const deviceToken = payload.device_token || payload.deviceToken;

  if (!access) {
    throw new Error("Le backend n'a retourné aucun jeton d'authentification.");
  }

  localStorage.setItem('access_token', String(access));

  if (refresh) localStorage.setItem('refresh_token', String(refresh));
  else localStorage.removeItem('refresh_token');

  if (deviceToken) {
    localStorage.setItem('kharandi_device_token', String(deviceToken));
  }

  return payload;
}
