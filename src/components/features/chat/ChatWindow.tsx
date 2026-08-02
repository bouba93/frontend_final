import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getMessages, markConversationRead, sendMessage, ChatMessage } from '../../../services/chat';
import { useAuth } from '../../../contexts/AuthContext';

export const ChatWindow: React.FC<{ conversationId: string; onBack: () => void }> = ({ conversationId, onBack }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async (silent = false) => {
    try {
      setMessages(await getMessages(conversationId)); setError(false);
      await markConversationRead(conversationId).catch(() => undefined);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: silent ? 'auto' : 'smooth' }), 50);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const timer = window.setInterval(() => load(true), 5000); return () => window.clearInterval(timer); }, [conversationId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true); setText('');
    try { const message = await sendMessage(conversationId, value); setMessages(current => [...current, message]); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30); }
    catch { setText(value); toast.error("Le message n'a pas été envoyé."); }
    finally { setSending(false); }
  };

  return <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
    <div className="p-4 border-b flex items-center gap-3"><button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></button><div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center font-black text-primary">K</div><div><h4 className="font-black text-slate-800">Conversation Kharandi</h4><p className="text-[11px] text-emerald-500 font-bold">Synchronisée avec Xano</p></div></div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
      {loading ? <div className="h-full grid place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" /></div> : error ? <div className="h-full flex flex-col items-center justify-center text-slate-500"><p>Connexion momentanément indisponible.</p><button onClick={() => load()} className="mt-3 flex gap-2 font-bold text-primary"><RefreshCw size={17} /> Réessayer</button></div> : messages.map(message => {
        const mine = String(message.sender_id) === String(userProfile?.uid);
        return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}`}><p>{message.text}</p><p className={`text-[9px] mt-1 text-right ${mine ? 'text-white/60' : 'text-slate-300'}`}>{message.created_at ? new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</p></div></motion.div>;
      })}
      <div ref={bottomRef} />
    </div>
    <form onSubmit={submit} className="p-4 border-t flex gap-3"><input value={text} onChange={event => setText(event.target.value)} maxLength={2000} placeholder="Écrivez votre message…" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" /><button disabled={!text.trim() || sending} className="h-12 w-12 rounded-2xl bg-primary text-white grid place-items-center disabled:opacity-50"><Send size={20} /></button></form>
  </div>;
};
