import { api } from '../config/api';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  attachment_url?: string;
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

const normalizeMessage = (item: any): ChatMessage => ({
  ...item,
  id: String(item?.id ?? ''),
  conversation_id: String(item?.conversation_id ?? item?.conversation?.id ?? ''),
  sender_id: String(item?.sender_id ?? item?.sender?.id ?? item?.user_id ?? ''),
  text: String(item?.body ?? item?.text ?? item?.message ?? ''),
  attachment_url: item?.attachment_url || item?.attachment?.url || item?.attachment,
});

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/chat/conversations');
  return unwrapList(data);
}

/** La route de liste renvoie les messages embarqués dans chaque conversation. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const conversations = await getConversations();
  const conversation = conversations.find(item => String(item.id) === String(conversationId));
  return (conversation?.messages || []).map(normalizeMessage);
}

export async function sendMessage(conversationId: string, body: string, attachment?: File): Promise<ChatMessage> {
  const payload: { body: string } | FormData = attachment
    ? (() => {
        const form = new FormData();
        form.append('body', body);
        form.append('attachment', attachment);
        return form;
      })()
    : { body };
  const { data } = await api.post(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, payload);
  return normalizeMessage(data?.data || data);
}

export async function markConversationRead(_conversationId: string) {
  return Promise.resolve();
}
