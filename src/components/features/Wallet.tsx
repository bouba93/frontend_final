import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, Loader2, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { getWallet, WalletData } from '../../services/wallet';

export const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setWallet(await getWallet());
    } catch {
      toast.error('Impossible de charger le Wallet. Vérifiez la configuration Xano.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-[55vh] flex items-center justify-center gap-3 text-slate-500">
      <Loader2 className="animate-spin text-primary" /> Chargement du Wallet…
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 space-y-6">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#125866] to-[#18bfd6] p-7 md:p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm font-bold mb-3"><WalletCards size={18} /> Mon Wallet Kharandi</div>
            <p className="text-5xl font-black">{wallet?.balance || 0} <span className="text-xl text-white/70">points</span></p>
            <p className="mt-2 text-white/75 text-sm">Valeur indicative : {(wallet?.gnf_value || 0).toLocaleString('fr-FR')} GNF</p>
          </div>
          <button onClick={load} className="self-start md:self-auto flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold hover:bg-white/20">
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
        <ShieldCheck className="shrink-0" size={20} />
        <p><strong>Wallet sécurisé :</strong> les points sont calculés et enregistrés par Xano. Le navigateur ne peut ni se créditer ni se débiter lui-même. 1 point correspond à 100 GNF.</p>
      </div>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 md:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-5"><Coins className="text-[#fcb303]" /><h2 className="text-xl font-black text-slate-900">Historique des opérations</h2></div>
        {!wallet?.transactions.length ? (
          <div className="py-14 text-center text-slate-400">Aucune opération pour le moment.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {wallet.transactions.map((tx) => {
              const credit = tx.type === 'credit' || Number(tx.amount) > 0;
              return (
                <div key={tx.id} className="flex items-center gap-4 py-4">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${credit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {credit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{tx.description || (credit ? 'Points reçus' : 'Points utilisés')}</p>
                    <p className="text-xs text-slate-400">{tx.created_at ? new Date(tx.created_at).toLocaleString('fr-FR') : ''}</p>
                  </div>
                  <p className={`font-black ${credit ? 'text-emerald-600' : 'text-red-500'}`}>{credit ? '+' : '−'}{Math.abs(Number(tx.amount))} pts</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
