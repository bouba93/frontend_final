import React, { useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { ExamType, importExamResults } from '../../../services/results';

export const ResultsImportAdmin: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState<ExamType>('BAC');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) { toast.error('Sélectionnez un fichier CSV.'); return; }
    setLoading(true); setResult(null);
    try {
      const response = await importExamResults(file, examType, year);
      setResult(response);
      toast.success('Le fichier a été transmis à Xano.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "L'import a échoué.");
    } finally { setLoading(false); }
  };

  return (
    <section className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Résultats nationaux</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Import CSV vers Xano</h2>
          <p className="mt-1 text-sm text-slate-500">BAC, BEPC général, BEPC franco-arabe et CEE.</p>
        </div>
        <a href="/resultats_import_modele.csv" download className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200">
          <Download size={15} /> Télécharger le modèle
        </a>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="mb-2 block text-xs font-black text-slate-500">Examen</span><select value={examType} onChange={event => setExamType(event.target.value as ExamType)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold"><option value="BAC">BAC</option><option value="BEPC_EG">BEPC – Général</option><option value="BEPC_FA">BEPC – Franco-Arabe</option><option value="CEE">Entrée en 7ᵉ (CEE)</option></select></label>
          <label><span className="mb-2 block text-xs font-black text-slate-500">Année</span><input type="number" min="2000" max="2100" value={year} onChange={event => setYear(Number(event.target.value))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold" /></label>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-primary/50 hover:bg-primary/5">
          <UploadCloud className="mb-3 text-primary" size={38} />
          <span className="font-black text-slate-800">{file?.name || 'Choisir le fichier CSV'}</span>
          <span className="mt-1 text-xs text-slate-400">La route Xano fournie accepte le format CSV.</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={event => setFile(event.target.files?.[0] || null)} />
        </label>

        <button disabled={!file || loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white disabled:opacity-50">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Importation…</> : <><FileSpreadsheet size={18} /> Importer dans Xano</>}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-center gap-2 font-black"><CheckCircle2 size={18} /> Import reçu par Xano</div>
          <p className="mt-1 text-sm">{result.message || `${result.imported_count ?? result.count ?? 'Les'} lignes ont été traitées.`}</p>
        </div>
      )}
    </section>
  );
};
