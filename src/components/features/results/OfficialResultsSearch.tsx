import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Award, Building2, Check, ChevronDown, Copy, FileSearch,
  GraduationCap, Loader2, MapPin, Search, Share2, UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { searchOfficialResults } from '../../../services/content';

type ExamCode = 'BAC' | 'BEPC' | 'BEPC_FA' | 'CEE';

const EXAMS: { code: ExamCode; label: string; short: string; color: string }[] = [
  { code: 'BAC', label: 'Baccalauréat', short: 'BAC', color: 'from-cyan-500 to-blue-600' },
  { code: 'BEPC', label: 'Brevet – Enseignement général', short: 'BEPC', color: 'from-indigo-500 to-violet-600' },
  { code: 'BEPC_FA', label: 'Brevet – Franco-Arabe', short: 'BEPC F-A', color: 'from-amber-500 to-orange-600' },
  { code: 'CEE', label: 'Entrée en 7ᵉ année', short: 'CEE', color: 'from-emerald-500 to-teal-600' },
];

const YEARS = Array.from({ length: 12 }, (_, index) => 2026 - index);

const normalizeExam = (value: string | null): ExamCode => {
  const input = (value || '').toLowerCase();
  if (input.includes('bac')) return 'BAC';
  if (input.includes('franco') || input.includes('bepc_fa') || input.includes('bepc-fa')) return 'BEPC_FA';
  if (input.includes('bepc') || input.includes('brevet')) return 'BEPC';
  return 'CEE';
};

const candidateName = (item: any) => item.noms || item.full_name || item.name || item.candidate_name || 'Candidat';
const candidateStatus = (item: any) => item.mention || item.status_label || item.status || (item.admitted ? 'ADMIS' : 'RÉSULTAT PUBLIÉ');

export const OfficialResultsSearch: React.FC<{ standalone?: boolean }> = ({ standalone = false }) => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [exam, setExam] = useState<ExamCode>(() => normalizeExam(params.get('results') || params.get('result')));
  const [year, setYear] = useState(() => Number(params.get('year')) || 2026);
  const [filter, setFilter] = useState<'all' | 'noms' | 'pv' | 'centre'>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setResults([]); setSearched(false); setError('');
  }, [exam, year, filter]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]); setSearched(false); setError(''); return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const data = await searchOfficialResults({ q: query.trim(), exam, year, filter, limit: 100 });
        if (active) { setResults(Array.isArray(data) ? data : data?.items || []); setSearched(true); }
      } catch (requestError: any) {
        if (active) {
          setResults([]); setSearched(true);
          setError(requestError?.response?.data?.message || 'La recherche Xano est momentanément indisponible.');
        }
      } finally { if (active) setLoading(false); }
    }, 450);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, exam, year, filter]);

  const selectedExam = EXAMS.find(item => item.code === exam)!;
  const shareUrl = `${window.location.origin}/?results=${exam.toLowerCase()}&year=${year}`;

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true); toast.success('Lien public copié !');
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`${standalone ? 'min-h-screen bg-[#f8fafc]' : ''} pb-24`}>
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-[#18bfd6] to-amber-500" />
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <header className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#0f4d59] via-[#139eb2] to-[#18bfd6] p-6 md:p-10 text-white shadow-xl">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest">Résultats officiels de Guinée</span>
              <div className="flex gap-2">
                {standalone && <button onClick={() => { window.location.href = '/'; }} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold flex gap-2"><ArrowLeft size={15} /> Kharandi</button>}
                <button onClick={copyShareLink} className="rounded-xl bg-white text-[#125866] px-3 py-2 text-xs font-black flex gap-2">{copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? 'Copié' : 'Partager'}</button>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">BAC, Brevet et entrée en 7ᵉ</h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-white/80">Recherchez un candidat par nom, numéro PV ou centre pour toutes les sessions importées dans Xano.</p>
          </div>
        </header>

        <section className="mt-6 rounded-[30px] border border-slate-100 bg-white p-5 md:p-7 shadow-sm">
          <div className="grid md:grid-cols-[1.5fr_.7fr] gap-3 mb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {EXAMS.map(item => (
                <button key={item.code} onClick={() => setExam(item.code)} className={`rounded-2xl border-2 p-3 text-left transition-all ${exam === item.code ? 'border-[#18bfd6] bg-[#18bfd6]/5' : 'border-slate-100 hover:border-slate-200'}`}>
                  <span className={`inline-flex rounded-lg bg-gradient-to-r ${item.color} px-2 py-1 text-[9px] font-black text-white`}>{item.short}</span>
                  <p className="mt-2 text-xs font-black text-slate-800 leading-tight">{item.label}</p>
                </button>
              ))}
            </div>
            <label className="relative block">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Session</span>
              <select value={year} onChange={event => setYear(Number(event.target.value))} className="h-[62px] w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-lg font-black text-slate-800 outline-none focus:border-[#18bfd6]">
                {YEARS.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown className="absolute right-4 bottom-5 text-slate-400" size={18} />
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input value={query} onChange={event => setQuery(event.target.value)} autoComplete="off"
                placeholder={filter === 'pv' ? 'Entrez le numéro PV…' : filter === 'centre' ? 'Entrez le centre d’examen…' : 'Nom, PV ou centre…'}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pl-12 pr-4 font-bold outline-none focus:border-[#18bfd6] focus:bg-white" />
            </div>
            <div className="flex overflow-x-auto rounded-2xl bg-slate-100 p-1.5">
              {([['all','Tous'],['noms','Nom'],['pv','PV'],['centre','Centre']] as const).map(([code,label]) => (
                <button key={code} onClick={() => setFilter(code)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black ${filter === code ? 'bg-white text-[#139eb2] shadow-sm' : 'text-slate-500'}`}>{label}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl bg-white border border-slate-100 p-14 text-center"><Loader2 className="mx-auto animate-spin text-[#18bfd6]" size={36} /><p className="mt-3 font-bold text-slate-500">Recherche {selectedExam.short} {year}…</p></div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700"><FileSearch className="mx-auto mb-3" size={38} /><p className="font-black">{error}</p><p className="mt-1 text-sm">Vérifiez l’endpoint public `/results/` et les données importées.</p></div>
          ) : !searched ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center"><Search className="mx-auto mb-3 text-slate-300" size={42} /><h2 className="font-black text-slate-800">Rechercher dans {selectedExam.label} — {year}</h2><p className="mt-1 text-sm text-slate-400">Saisissez au moins deux caractères.</p></div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center"><UserRound className="mx-auto mb-3 text-slate-300" size={42} /><h2 className="font-black text-slate-800">Aucun candidat trouvé</h2><p className="mt-1 text-sm text-slate-400">Vérifiez l’orthographe, le PV, l’examen ou la session.</p></div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between"><p className="text-sm font-black text-slate-700">{results.length} résultat(s)</p><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{selectedExam.short} {year}</span></div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((item, index) => (
                  <motion.article key={item.id || `${item.pv}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-[10px] font-black text-white">PV : {item.pv || item.candidate_number || '—'}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-700"><Award size={11} className="inline mr-1" />{candidateStatus(item)}</span></div>
                    <h3 className="mt-4 text-lg font-black text-slate-900">{candidateName(item)}</h3>
                    <div className="mt-4 space-y-2 text-xs font-bold text-slate-500">
                      <p className="flex gap-2"><Building2 className="shrink-0 text-[#18bfd6]" size={15} /><span>Centre : {item.centre || item.center || 'Non précisé'}</span></p>
                      <p className="flex gap-2"><GraduationCap className="shrink-0 text-indigo-500" size={15} /><span>{item.serie || item.series || item.option || selectedExam.label}</span></p>
                      <p className="flex gap-2"><MapPin className="shrink-0 text-amber-500" size={15} /><span>{item.dpe || item.prefecture || item.region || item.origine || 'Guinée'}{item.rang || item.rank ? ` · Rang ${item.rang || item.rank}` : ''}</span></p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(`${candidateName(item)} — ${selectedExam.short} ${year} — PV ${item.pv || '—'} — ${candidateStatus(item)}`).then(() => toast.success('Résultat copié'))} className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#139eb2]"><Copy size={13} /> Copier ce résultat</button>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
