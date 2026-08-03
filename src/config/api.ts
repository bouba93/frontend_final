import axios from "axios";
import { isAllowedXanoRoute, XanoEndpointUnavailableError } from './xanoRoutes';
export const BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
if (!BASE_URL && import.meta.env.PROD) {
  console.error("VITE_API_URL n'est pas configurée. Ajoutez l'URL du groupe API Xano dans Vercel.");
}
export const api = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" }, timeout: 60000 });
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token))); failedQueue = [];
};
api.interceptors.request.use((config) => {
  const method = String(config.method || 'GET').toUpperCase();
  const path = String(config.url || '');
  const strictRoutes = import.meta.env.VITE_STRICT_XANO_ROUTES !== 'false';
  if (strictRoutes && !isAllowedXanoRoute(method, path)) {
    return Promise.reject(new XanoEndpointUnavailableError(method, path));
  }

  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const deviceToken = localStorage.getItem('kharandi_device_token');
  if (deviceToken) {
    config.headers['X-Device-Token'] = deviceToken;
  }

  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});
api.interceptors.response.use(r => r, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry) {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) { _logout(); return Promise.reject(error); }
    if (isRefreshing) return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); }).then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
    original._retry = true; isRefreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
      const payload = data?.data || data || {};
      const tokens = payload.tokens || {};
      const access = tokens.access || payload.access || payload.access_token || payload.authToken || payload.token;
      const nextRefresh = tokens.refresh || payload.refresh || payload.refresh_token || refresh;
      if (!access) throw new Error("Le rafraîchissement Xano n'a retourné aucun jeton d'accès.");
      localStorage.setItem("access_token", String(access));
      localStorage.setItem("refresh_token", String(nextRefresh));
      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      original.headers.Authorization = `Bearer ${access}`;
      processQueue(null, String(access)); return api(original);
    } catch (e) { processQueue(e, null); _logout(); return Promise.reject(e); }
    finally { isRefreshing = false; }
  }
  return Promise.reject(error);
});
function _logout() {
  if (localStorage.getItem("isGuest") === "true") {
    return;
  }
  localStorage.removeItem("access_token"); 
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("kharandi_cached_profile");
  if (window.location.pathname !== "/login") window.location.href = "/login";
}
