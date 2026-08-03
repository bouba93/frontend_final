type AnyRecord = Record<string, any>;

export function unwrapApiData(response: AnyRecord | null | undefined): AnyRecord {
  return (response?.data || response || {}) as AnyRecord;
}

export function saveAuthSession(response: AnyRecord | null | undefined): AnyRecord {
  const payload = unwrapApiData(response);
  const auth = payload.auth || payload.session || payload;
  const tokens = auth.tokens || payload.tokens || {};

  const access =
    tokens.access ||
    tokens.access_token ||
    tokens.authToken ||
    auth.access ||
    auth.access_token ||
    auth.authToken ||
    auth.auth_token ||
    auth.token ||
    payload.access ||
    payload.access_token ||
    payload.authToken ||
    payload.auth_token ||
    payload.token;
  const refresh =
    tokens.refresh ||
    tokens.refresh_token ||
    tokens.refreshToken ||
    auth.refresh ||
    auth.refresh_token ||
    auth.refreshToken ||
    payload.refresh ||
    payload.refresh_token ||
    payload.refreshToken;
  const deviceToken =
    auth.device_token ||
    auth.deviceToken ||
    payload.device_token ||
    payload.deviceToken;

  if (!access) {
    throw new Error("Le backend n'a retourné aucun jeton d'authentification.");
  }

  localStorage.setItem('access_token', String(access));

  if (refresh) localStorage.setItem('refresh_token', String(refresh));
  else localStorage.removeItem('refresh_token');

  if (deviceToken) {
    localStorage.setItem('kharandi_device_token', String(deviceToken));
  }

  // Un changement de compte ne doit jamais réutiliser le profil de la session
  // précédente (cas typique : un élève puis le super-administrateur).
  localStorage.removeItem('kharandi_cached_profile');

  return payload;
}
