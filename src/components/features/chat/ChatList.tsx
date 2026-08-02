import React, { useEffect, useState } from 'react';
import { ChevronRight, MessageCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getConversations, Conversation } from '../../../services/chat';

export const ChatList: React.FC<{ onSelectConversation: (id: string) => void; search?: string }> = ({ onSelectConversation, search = '' }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try { setConversations(await getConversations()); setError(false); }
    catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const timer = window.setInterval(load, 10000); return () => window.clearInterval(timer); }, []);

  if (loading) return <div className="h-64 grid place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" /></div>;
  if (error) return <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500"><p>Impossible de charger les conversations Xano.</p><button onClick={load} className="mt-3 flex gap-2 text-primary font-bold"><RefreshCw size={17} /> Réessayer</button></div>;

  const filtered = conversations.filter(item => `${item.title || ''} ${item.other_user?.name || ''} ${item.last_message || ''}`.toLowerCase().includes(search.toLowerCase()));
  if (!filtered.length) return <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400"><MessageCircle size={48} className="mb-4 opacity-20" /><p className="font-bold">Aucune conversation</p><p className="text-sm">Contactez un répétiteur pour commencer.</p></div>;

  return <div className="space-y-3">{filtered.map(conv => {
    const name = conv.other_user?.name || conv.title || 'Conversation';
    return <motion.button whileHover={{ x: 4 }} key={conv.id} onClick={() => onSelectConversation(String(conv.id))} className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 text-left">
      <div className="flex items-center gap-4 min-w-0"><div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 grid place-items-center text-primary font-black">{name.charAt(0).toUpperCase()}</div><div className="min-w-0"><h4 className="font-black text-slate-800 truncate">{name}</h4><p className="text-sm text-slate-400 truncate">{conv.last_message || 'Commencer la discussion…'}</p></div></div>
      <div className="flex items-center gap-2">{!!conv.unread_count && <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] grid place-items-center font-black">{conv.unread_count}</span>}<ChevronRight className="text-slate-300" size={20} /></div>
    </motion.button>;
  })}</div>;
};
