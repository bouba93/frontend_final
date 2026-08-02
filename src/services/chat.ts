import { api } from '../config/api';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  other_user?: { id: string; name: string; avatar_url?: string };
  last_message?: string;
  updated_at?: string;
  unread_count?: number;
  messages?: ChatMessage[];
}

const unwrapList = (data: any): Conversation[] => {
  const value = data?.data || data || [];
  return Array.isArray(value) ? value : value?.items || value?.results || value?.conversations || [];
};

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/chat/conversations');
  return unwrapList(data);
}

/** La route de liste renvoie les messages embarqués dans chaque conversation. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const conversations = await getConversations();
  const conversation = conversations.find(item => String(item.id) === String(conversationId));
  return conversation?.messages || [];
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const { data } = await api.post(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, { text });
  return data?.data || data;
}

export async function markConversationRead(_conversationId: string) {
  return Promise.resolve();
}
