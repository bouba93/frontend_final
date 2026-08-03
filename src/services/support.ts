import { api } from '../config/api';
import { unsupportedXanoEndpoint } from '../config/xanoRoutes';

export type TicketCategory = 'TECHNICAL' | 'PAYMENT';
export type TicketStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME';

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: 1 | 2 | 3;
  replies: Array<{ author_name: string; message: string; is_staff: boolean; created_at: string }>;
  created_at: string;
}

export async function getTickets(_status?: TicketStatus): Promise<Ticket[]> {
  return [];
}

export async function createTicket(payload: {
  subject: string;
  message: string;
  category: TicketCategory;
}): Promise<Ticket> {
  const { data } = await api.post('/support/tickets', {
    category: payload.category,
    subject: payload.subject,
    message: payload.message,
  });
  return data?.data || data;
}

export async function replyToTicket(_ticketId: string, _message: string): Promise<Ticket> {
  return unsupportedXanoEndpoint('Réponse à un ticket support');
}
