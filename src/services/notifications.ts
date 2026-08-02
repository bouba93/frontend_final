import { api } from '../config/api';
import { unsupportedXanoEndpoint } from '../config/xanoRoutes';

export async function sendWelcomeNotification() {
  const { data } = await api.post('/message/send_welcome_email');
  return data?.data || data;
}

export async function sendCustomNotification(
  _recipients: string[],
  _message: string,
  _method: 'SMS' | 'EMAIL' = 'SMS'
) {
  return unsupportedXanoEndpoint('Envoi groupé de notifications');
}

export async function notifyNewMessage(_phone: string, _senderName: string) {
  return undefined;
}

export async function notifyOrderConfirmation(_phone: string, _orderId: string, _total: number) {
  return undefined;
}
