import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Award, BookOpen, Calculator, CheckCircle2, Clock3, GraduationCap, Loader2, RotateCcw, Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { startExercise, submitExercise, ExerciseAttempt } from '../../services/exercises';
import { useAuth } from '../../contexts/AuthContext';

const EXAMS = {
  CEE: { label: 'Entrée en 7ème', description: 'Certificat d’Études Élémentaires', series: '', subjects: ['Mathématiques', 'Français', 'Histoire-Géographie', 'SVT'] },
  BEPC: { label: 'BEPC Guinée', description: 'Brevet d’Études du Premier Cycle', series: '', subjects: ['Mathématiques', 'Physique', 'Chimie', 'Français', 'Histoire-Géographie', 'Anglais', 'SVT'] },
  BAC_SM: { label: 'BAC SM', description: 'Sciences Mathématiques', series: 'SM', subjects: ['Mathématiques', 'Physique', 'Chimie', 'Français', 'Anglais', 'Philosophie'] },
  BAC_SS: { label: 'BAC SS', description: 'Sciences de la Nature', series: 'SS', subjects: ['SVT', 'Physique-Chimie', 'Mathématiques', 'Français', 'Anglais', 'Philosophie'] },
  BAC_SE: { label: 'BAC SE', description: 'Sciences Économiques', series: 'SE', subjects: ['Économie', 'Mathématiques', 'Histoire-Géographie', 'Français', 'Anglais', 'Philosophie'] },
} as const;

type ExamKey = keyof typeof EXAMS;
type Step = 'exam' | 'year' | 'subject' | 'playing' | 'result';
const YEARS = Array.from({ length: 25 }, (_, index) => new Date().getFullYear() - index);

export const Exercises: React.FC = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('exam');
  const [exam, setExam] = useState<ExamKey | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<ExerciseAttempt | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const question = attempt?.questions[index];
  const answerKey = question ? String(question.id) : '';
  const selectedAnswer = answers[answerKey];

  useEffect(() => {
    if (step !== 'playing') return;
    const timer = window.setInterval(() => setTimeLeft(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [step, index]);

  const reset = () => {
    setStep('exam'); setExam(null); setYear(null); setSubject(null); setAttempt(null);
    setIndex(0); setAnswers({}); setResult(null); setError(''); setTimeLeft(60);
  };

  const launch = async (selectedSubject: string) => {
    if (!exam || !year) return;
    setSubject(selectedSubject); setLoading(true); setError('');
    try {
      const examInfo = EXAMS[exam];
      const data = await startExercise({
        exam: exam.startsWith('BAC') ? 'BAC' : exam,
        series: examInfo.series || undefined,
        year,
        subject: selectedSubject,
        difficulty: 'MOYEN',
      });
      if (!data.attempt_id || !data.questions.length) throw new Error('Aucune question retournée');
      setAttempt(data); setAnswers({}); setIndex(0); setTimeLeft(60); setStep('playing');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || "Impossible de démarrer l'exercice depuis Xano.";
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  };

  const chooseAnswer = (choiceIndex: number) => {
    if (!question) return;
    setAnswers(current => ({ ...current, [String(question.id)]: choiceIndex }));
  };

  const next = async () => {
    if (!attempt || !question) return;
    const completeAnswers = selectedAnswer === undefined ? { ...answers, [answerKey]: -1 } : answers;
    if (index < attempt.questions.length - 1) {
      setAnswers(completeAnswers); setIndex(value => value + 1); setTimeLeft(60); return;
    }
    setLoading(true);
    try {
      const data = await submitExercise(attempt.attempt_id, completeAnswers);
      setResult(data); setStep('result');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Le résultat n'a pas pu être enregistré.");
    } finally { setLoading(false); }
  };

  const progress = useMemo(() => attempt ? ((index + 1) / attempt.questions.length) * 100 : 0, [attempt, index]);

  if (userProfile?.role === 'repetiteur') return (
    <div className="min-h-[60vh] grid place-items-center text-center p-6"><div><GraduationCap className="mx-auto text-primary mb-4" size={48} /><h2 className="text-2xl font-black">Espace répétiteur</h2><p className="text-slate-500">Les exercices récompensés sont réservés aux élèves.</p></div></div>
  );

  if (loading) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="font-black text-slate-700">{step === 'playing' ? 'Validation sécurisée du résultat…' : 'Xano prépare ton exercice…'}</p></div>;

  if (step === 'result' && result) {
    const score = Number(result.score ?? result.correct_answers ?? 0);
    const total = Number(result.total ?? attempt?.questions.length ?? 0);
    const points = Number(result.points_awarded ?? result.points_earned ?? 0);
    const percentage = Number(result.percentage ?? (total ? Math.round(score / total * 100) : 0));
    return (
      <div className="max-w-lg mx-auto p-5 min-h-[65vh] flex items-center">
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[34px] bg-white border border-slate-100 shadow-xl p-7 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-amber-50 grid place-items-center"><Trophy className="text-[#fcb303]" size={48} /></div>
          <p className="mt-5 text-sm font-bold text-slate-400">{exam && EXAMS[exam].label} · {subject}</p>
          <h2 className="mt-2 text-5xl font-black text-primary">{percentage}%</h2>
          <p className="mt-2 text-xl font-black text-slate-800">{score}/{total} bonnes réponses</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary/5 p-4"><Award className="mx-auto text-primary mb-1" /><p className="text-2xl font-black">+{points}</p><p className="text-xs text-slate-400">points Xano</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><Star className="mx-auto text-amber-500 mb-1" /><p className="text-2xl font-black">{result.mention || (percentage >= 70 ? 'Bravo' : 'Continue')}</p><p className="text-xs text-slate-400">appréciation</p></div>
          </div>
          <p className="mt-5 text-xs text-slate-400">Le score et les points ont été calculés côté serveur. Aucune réponse correcte n'est envoyée avant la soumission.</p>
          <div className="mt-6 flex gap-3"><button onClick={() => subject && launch(subject)} className="flex-1 rounded-2xl bg-slate-100 py-3 font-black text-slate-700 flex items-center justify-center gap-2"><RotateCcw size={16} /> Refaire</button><button onClick={reset} className="flex-1 rounded-2xl bg-primary py-3 font-black text-white">Autre exercice</button></div>
        </motion.div>
      </div>
    );
  }

  if (step === 'playing' && attempt && question) return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center justify-between mb-4"><button onClick={reset} className="p-2 rounded-xl hover:bg-slate-100"><ArrowLeft /></button><span className="text-sm font-black text-slate-500">Question {index + 1}/{attempt.questions.length}</span><span className={`flex items-center gap-1 font-black ${timeLeft < 15 ? 'text-red-500' : 'text-primary'}`}><Clock3 size={17} /> {timeLeft}s</span></div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary to-[#fcb303]" /></div>
      <div className="rounded-[30px] bg-white border border-slate-100 shadow-lg p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">{subject}</p>
        {question.image_url && <img src={question.image_url} alt="Illustration de la question" className="max-h-64 mx-auto rounded-2xl mb-5" />}
        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-relaxed">{question.prompt}</h2>
        <div className="mt-6 grid gap-3">
          {question.choices.map((choice, choiceIndex) => (
            <button key={choiceIndex} onClick={() => chooseAnswer(choiceIndex)} className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${selectedAnswer === choiceIndex ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/30'}`}>
              <span className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center font-black ${selectedAnswer === choiceIndex ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + choiceIndex)}</span><span className="font-bold">{choice}</span>
            </button>
          ))}
        </div>
        <button onClick={next} className="mt-6 w-full rounded-2xl bg-primary py-4 text-white font-black flex items-center justify-center gap-2">{index === attempt.questions.length - 1 ? 'Terminer et valider' : selectedAnswer === undefined ? 'Passer la question' : 'Question suivante'} <ArrowRight size={18} /></button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
      <div className="mb-7 rounded-[32px] bg-gradient-to-br from-primary to-cyan-400 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.2em] text-white/70">Entraînement sécurisé</p><h1 className="mt-2 text-4xl font-black">Exo Gagnant</h1><p className="mt-2 text-white/80">Révise les examens guinéens et gagne des points calculés par Xano.</p></div>
      {error && <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 flex gap-3"><AlertCircle className="shrink-0" /> {error}</div>}
      {step === 'exam' && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(EXAMS).map(([key, item]) => <button key={key} onClick={() => { setExam(key as ExamKey); setStep('year'); }} className="rounded-[26px] bg-white border border-slate-100 p-6 text-left shadow-sm hover:shadow-lg transition-all"><div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">{key === 'CEE' ? <BookOpen /> : key === 'BEPC' ? <Calculator /> : <GraduationCap />}</div><h3 className="text-xl font-black text-slate-900">{item.label}</h3><p className="mt-1 text-sm text-slate-400">{item.description}</p></button>)}</div>}
      {step === 'year' && <div><button onClick={() => setStep('exam')} className="mb-5 flex gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={17} /> Retour</button><h2 className="text-2xl font-black mb-5">Choisis l'année</h2><div className="grid grid-cols-3 sm:grid-cols-5 gap-3">{YEARS.map(value => <button key={value} onClick={() => { setYear(value); setStep('subject'); }} className="rounded-2xl border border-slate-100 bg-white py-4 font-black hover:bg-primary hover:text-white">{value}</button>)}</div></div>}
      {step === 'subject' && exam && <div><button onClick={() => setStep('year')} className="mb-5 flex gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={17} /> Retour</button><h2 className="text-2xl font-black mb-5">Choisis la matière</h2><div className="grid sm:grid-cols-2 gap-3">{EXAMS[exam].subjects.map(item => <button key={item} onClick={() => launch(item)} className="rounded-2xl border border-slate-100 bg-white p-5 font-black text-left hover:border-primary hover:text-primary flex items-center justify-between"><span>{item}</span><ArrowRight size={18} /></button>)}</div></div>}
    </div>
  );
};
