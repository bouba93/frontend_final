import { api } from '../config/api';

export async function getAdminDashboardSummary() {
  const { data } = await api.get('/admin/dashboard/summary');
  return data?.data || data || {};
}

export async function getMyEventLogs() {
  const { data } = await api.get('/logs/user/my_events');
  const payload = data?.data || data || [];
  return Array.isArray(payload) ? payload : payload?.items || payload?.results || [];
}
