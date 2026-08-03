import React, { useEffect, useMemo, useState } from 'react';
import { Award, Brain, CheckCircle2, ChevronRight, Flame, Loader2, Lock, RotateCcw, Sparkles, Star, Target, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  answerAbacusSession, finishAbacusSession, getAbacusLevels, getAbacusSkills,
  startAbacusSession, AbacusLevel, AbacusMode, AbacusSkill,
} from '../../services/abacus';

const ABACUS_MODES: Array<{ value: AbacusMode; label: string }> = [
  { value: 'GUIDED', label: 'Guidé' },
  { value: 'PRACTICE', label: 'Entraînement' },
  { value: 'TIMED', label: 'Chronométré' },
  { value: 'FLASH_ANZAN', label: 'Flash Anzan' },
];

const AbacusVisual: React.FC<{ value?: number }> = ({ value = 0 }) => {
  const digits = String(Math.abs(Math.trunc(value))).padStart(4, '0').slice(-4).split('').map(Number);
  return (
    <div className="rounded-[28px] bg-gradient-to-b from-amber-800 to-amber-950 p-4 shadow-xl border-4 border-amber-700">
      <div className="rounded-2xl bg-amber-50/95 p-3 grid grid-cols-4 gap-3">
        {digits.map((digit, column) => (
          <div key={column} className="relative h-36 flex flex-col justify-end gap-1 rounded-xl bg-amber-100/70 px-1 py-2 overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-amber-800/60" />
            {Array.from({ length: 9 }, (_, bead) => (
              <motion.div key={bead} animate={{ opacity: bead < digit ? 1 : .25, x: bead < digit ? 0 : (bead % 2 ? 7 : -7) }}
                className={`relative z-10 h-2.5 rounded-full ${bead < digit ? 'bg-gradient-to-r from-[#fcb303] to-orange-500 shadow' : 'bg-slate-300'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Abacus: React.FC = () => {
  const [levels, setLevels] = useState<AbacusLevel[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<AbacusLevel | null>(null);
  const [skills, setSkills] = useState<AbacusSkill[]>([]);
  const [mode, setMode] = useState<AbacusMode>('PRACTICE');
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const levelData = await getAbacusLevels();
      setLevels(levelData);
      setProgress({
        current_streak: Math.max(0, ...levelData.map(level => Number(level.current_streak || 0))),
        total_stars: levelData.reduce((total, level) => total + Number(level.stars || 0), 0),
      });
      const current = [...levelData].reverse().find(level => level.unlocked !== false) || levelData[0];
      setStatus({ current_level_code: current?.code || 'AB0' });
    } catch {
      toast.error('Kharandi Abacus attend la configuration des endpoints Xano.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const currentQuestion = session?.current_question || session?.question;
  const visualValue = useMemo(() => Number(currentQuestion?.visual_value ?? currentQuestion?.left ?? 0), [currentQuestion]);

  const openLevel = async (level: AbacusLevel) => {
    if (level.unlocked === false) return;
    setSubmitting(true); setSummary(null); setFeedback(null);
    try {
      const levelSkills = await getAbacusSkills(level.id);
      setSelectedLevel(level);
      setSkills(levelSkills);
    } catch { toast.error('Impossible de charger les compétences de ce niveau.'); }
    finally { setSubmitting(false); }
  };

  const start = async (skill: AbacusSkill) => {
    if (skill.unlocked === false) return;
    setSubmitting(true); setSummary(null); setFeedback(null);
    try {
      const data = await startAbacusSession({ skill_id: skill.id, mode });
      setSession(data); setAnswer(''); setQuestionStartedAt(Date.now());
    } catch { toast.error('Impossible de démarrer cette séance.'); }
    finally { setSubmitting(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.id || answer.trim() === '') return;
    const questionId = currentQuestion?.id ?? currentQuestion?.question_id;
    if (questionId === undefined || questionId === null) {
      toast.error("La question Xano ne contient pas d'identifiant."); return;
    }
    setSubmitting(true);
    try {
      const result = await answerAbacusSession(session.id, {
        question_id: questionId,
        answer: answer.trim(),
        response_time_ms: Math.max(0, Date.now() - questionStartedAt),
      });
      setFeedback(result);
      const nextQuestion = result.next_question || session.questions?.[Number(session.current_index || 1)];
      if (result.finished || !nextQuestion) {
        const finalData = await finishAbacusSession(session.id);
        setSummary(finalData); setSession(null);
        await load();
      } else {
        setTimeout(() => {
          setSession((prev: any) => ({ ...prev, ...result, current_question: nextQuestion, current_index: Number(prev.current_index || 1) + 1 }));
          setFeedback(null); setAnswer(''); setQuestionStartedAt(Date.now());
        }, 850);
      }
    } catch { toast.error('Réponse non enregistrée. Réessayez.'); }
    finally { setSubmitting(false); }
  };

  if (loading && !session) return <div className="min-h-[55vh] grid place-items-center"><Loader2 className="animate-spin text-primary" size={34} /></div>;

  if (selectedLevel && !session) return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 space-y-6">
      <button onClick={() => { setSelectedLevel(null); setSkills([]); }} className="text-sm font-black text-primary">← Retour aux niveaux</button>
      <div className="rounded-[30px] bg-white border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-black uppercase tracking-widest text-primary">{selectedLevel.code}</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">{selectedLevel.name}</h1>
        <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500">Mode de séance</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ABACUS_MODES.map(item => (
            <button key={item.value} type="button" onClick={() => setMode(item.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-black ${mode === item.value ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {!skills.length ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 font-bold">Aucune compétence publiée pour ce niveau.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map(skill => (
            <button key={skill.id} onClick={() => start(skill)} disabled={skill.unlocked === false || submitting}
              className="rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-sm hover:border-primary hover:shadow-lg disabled:opacity-50">
              <div className="flex items-center justify-between"><h2 className="font-black text-slate-900">{skill.name}</h2><ChevronRight className="text-primary" /></div>
              <p className="mt-2 text-sm text-slate-400">{skill.description || 'Compétence de calcul mental Kharandi.'}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (session && currentQuestion) return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center justify-between mb-5">
        <div><p className="text-xs font-black uppercase tracking-widest text-primary">Kharandi Abacus</p><h1 className="text-2xl font-black text-slate-900">Séance de calcul mental</h1></div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{session.current_index || 1}/{session.total_questions || 10}</span>
      </div>
      <AbacusVisual value={visualValue} />
      <form onSubmit={submit} className="mt-5 rounded-[28px] bg-white border border-slate-100 shadow-lg p-6 text-center">
        <p className="text-sm font-bold text-slate-400 mb-2">Calcule mentalement</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{currentQuestion.prompt || `${currentQuestion.left} ${currentQuestion.operator} ${currentQuestion.right}`}</h2>
        <input autoFocus inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value)} disabled={!!feedback}
          className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-center text-3xl font-black outline-none focus:border-primary" placeholder="Ta réponse" />
        {feedback && (
          <div className={`mt-4 flex items-center justify-center gap-2 font-black ${feedback.is_correct ? 'text-emerald-600' : 'text-red-500'}`}>
            {feedback.is_correct ? <CheckCircle2 /> : <XCircle />} {feedback.is_correct ? 'Bravo !' : `Bonne réponse : ${feedback.correct_answer}`}
          </div>
        )}
        <button disabled={submitting || !answer.trim() || !!feedback} className="mt-5 w-full rounded-2xl bg-primary py-4 font-black text-white disabled:opacity-50">
          {submitting ? 'Validation…' : 'Valider ma réponse'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 space-y-7">
      <section className="rounded-[36px] bg-gradient-to-br from-[#125866] via-[#18bfd6] to-cyan-400 p-7 md:p-10 text-white relative overflow-hidden">
        <Sparkles className="absolute right-8 top-8 text-white/25" size={90} />
        <p className="text-xs font-black uppercase tracking-[.22em] text-amber-200">AB0 → AB10</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-black">Kharandi Abacus</h1>
        <p className="mt-3 max-w-2xl text-white/80">Maîtrise les nombres, le boulier et le calcul mental à travers des séances progressives adaptées au programme Kharandi.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full bg-white/15 px-4 py-2 flex gap-2"><Flame size={18} /> {progress?.current_streak || 0} jours</span>
          <span className="rounded-full bg-white/15 px-4 py-2 flex gap-2"><Star size={18} /> {progress?.total_stars || 0} étoiles</span>
          <span className="rounded-full bg-white/15 px-4 py-2 flex gap-2"><Target size={18} /> Niveau {status?.current_level_code || 'AB0'}</span>
        </div>
      </section>

      {summary && <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800 font-bold flex items-center gap-3"><Award /> Séance terminée : {summary.score || 0}/{summary.total || 0}, +{summary.points_awarded || 0} points validés par Xano.</div>}

      <section>
        <div className="flex items-end justify-between mb-4"><div><p className="text-xs font-black uppercase tracking-widest text-primary">Progression</p><h2 className="text-2xl font-black text-slate-900">Choisis un niveau</h2></div><button onClick={load} className="text-sm font-bold text-primary flex gap-2"><RotateCcw size={16} /> Actualiser</button></div>
        {!levels.length ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Brain className="mx-auto text-slate-300 mb-3" size={44} /><p className="font-black text-slate-700">Les niveaux Abacus ne sont pas encore publiés dans Xano.</p><p className="text-sm text-slate-400 mt-1">Crée les niveaux AB0 à AB10 avec le prompt Xano fourni.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.sort((a,b) => Number(a.order || 0) - Number(b.order || 0)).map(level => (
              <button key={level.id} onClick={() => openLevel(level)} disabled={level.unlocked === false || submitting}
                className="text-left rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0">
                <div className="flex items-center justify-between"><span className="rounded-xl bg-primary/10 px-3 py-1 font-black text-primary">{level.code}</span>{level.unlocked === false ? <Lock className="text-slate-300" size={18} /> : <ChevronRight className="text-primary" />}</div>
                <h3 className="mt-4 font-black text-slate-900">{level.name}</h3><p className="mt-1 text-sm text-slate-400 line-clamp-2">{level.description || 'Entraînement progressif au boulier et au calcul mental.'}</p>
                <div className="mt-4 flex gap-1">{[1,2,3].map(star => <Star key={star} size={15} className={star <= Number(level.stars || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
