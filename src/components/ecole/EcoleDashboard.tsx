import React, { useState, useEffect } from 'react';
import {
  LogOut, Users, FileText, CreditCard, Plus, LayoutDashboard,
  GraduationCap, TrendingUp, Search, Download, Clock,
  ChevronRight, Loader2, Settings, Trash2, Edit3, School, BookOpen,
  Award, Calendar, DollarSign, BarChart3, PieChart as PieIcon, Activity, Printer, Info, Copy, CheckCircle2, AlertTriangle, Send,
  Megaphone, Bell, Shield, Sparkles, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  getStudents, addStudent, deleteStudent,
  getGrades, addGrade,
  getPayments, addPayment, markPaymentPaid,
  getAbsences, addAbsence,
  getTeachers, addTeacher, deleteTeacher,
  getClasses, addClass,
  getSchedules, addSchedule, deleteSchedule,
  getExpenses, addExpense,
  getAnnouncements, addAnnouncement, deleteAnnouncement,
  getBadges, addBadge, deleteBadge, getSchoolOptions,
} from '../../services/ecole';

type Tab = 'overview' | 'students' | 'grades' | 'bulletins' | 'schedule' | 'finance' | 'payments' | 'absences' | 'teachers' | 'announcements' | 'badges';

export const EcoleDashboard: React.FC<{
  profile:   any;
  onLogout?: () => void;
}> = ({ profile, onLogout }) => {
  const isTeacher   = profile?.type === 'teacher' || profile?.role === 'teacher';
  const schoolId    = profile?.id || profile?.school_id;
  const schoolName  = profile?.name || 'Mon école';

  const [tab,        setTab]        = useState<Tab>('overview');
  const [students,   setStudents]   = useState<any[]>([]);
  const [grades,     setGrades]     = useState<any[]>([]);
  const [payments,   setPayments]   = useState<any[]>([]);
  const [absences,   setAbsences]   = useState<any[]>([]);
  const [teachers,   setTeachers]   = useState<any[]>([]);
  const [classes,    setClasses]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');

  // Local static accounting and scheduling elements
  const [expenses,   setExpenses]   = useState<any[]>([]);
  const [schedules,  setSchedules]  = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Custom finance and schedule additions
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

  const [newExpense, setNewExpense] = useState({ label: '', amount: '', category: 'Salaires', date: new Date().toISOString().split('T')[0] });
  const [newScheduleObj, setNewScheduleObj] = useState({ classe: '', day: 'Lundi', time: '08h - 10h', subject: '', teacher: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', category: 'Information', className: 'Toutes les classes' });

  // Formulaires
  const [showAddStudent,  setShowAddStudent]  = useState(false);
  const [showAddGrade,    setShowAddGrade]    = useState(false);
  const [showAddPayment,  setShowAddPayment]  = useState(false);
  const [showAddAbsence,  setShowAddAbsence]  = useState(false);
  const [showAddTeacher,  setShowAddTeacher]  = useState(false);

  const [newStudent,  setNewStudent]  = useState({ name: '', classe: '', parent_phone: '' });
  const [newGrade,    setNewGrade]    = useState({ student_id: '', subject: '', value: '', trimester: 'T1', comment: '' });
  const [newPayment,  setNewPayment]  = useState({ student_id: '', label: 'Scolarité T1', amount: '' });
  const [newAbsence,  setNewAbsence]  = useState({ student_id: '', date: new Date().toISOString().split('T')[0], subject: '', is_justified: false });
  const [newTeacher,  setNewTeacher]  = useState({ name: '', email: '', password: 'kharandi2026', classes: '' });

  // Bulletin selection states
  const [bulletinStudent, setBulletinStudent] = useState<string>('');
  const [bulletinTrimester, setBulletinTrimester] = useState<string>('T1');
  const [activeBulletinRef, setActiveBulletinRef] = useState<any | null>(null);

  // Badge Builder states
  const [hasBadgesOption, setHasBadgesOption] = useState(false);
  const [schoolBadges, setSchoolBadges] = useState<any[]>([]);
  const [showAddBadgeSetting, setShowAddBadgeSetting] = useState(false);
  const [newBadge, setNewBadge] = useState({
    student_id: '',
    title: 'Insigne d\'Excellence Académique',
    category: 'Gold',
    message: 'Félicitations chaleureuses pour des résultats remarquables et une attitude de travail exemplaire tout au long de la période scolaire.',
    signatory: isTeacher ? profile.name : 'Le Principal'
  });

  // Chargement centralisé depuis Xano.
  const loadAll = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const [s, g, p, a, t, c, scheduleData, expenseData, announcementData, badgeData, options] = await Promise.all([
        getStudents(schoolId), getGrades({ school_id: schoolId }),
        getPayments(schoolId), getAbsences(schoolId),
        getTeachers(schoolId), getClasses(schoolId),
        getSchedules({ school_id: schoolId }), getExpenses(schoolId),
        getAnnouncements({ school_id: schoolId }), getBadges({ school_id: schoolId }),
        getSchoolOptions(schoolId),
      ]);
      setStudents(s); setGrades(g); setPayments(p);
      setAbsences(a); setTeachers(t); setClasses(c);
      setSchedules(scheduleData); setExpenses(expenseData);
      setAnnouncements(announcementData); setSchoolBadges(badgeData);
      setHasBadgesOption(Boolean(options?.badges_enabled || options?.school_badges));
    } catch (err) {
      toast.error("Erreur de chargement des données.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [schoolId]);

  const tabs: { id: Tab; label: string; icon: any; teacherOnly?: boolean }[] = (
    [
      { id: 'overview',  label: 'Vue d\'ensemble', icon: LayoutDashboard },
      { id: 'students',  label: 'Élèves',          icon: Users },
      { id: 'grades',    label: 'Bulletins & Notes', icon: GraduationCap },
      { id: 'bulletins', label: 'Générateur de Bulletins', icon: Award },
      { id: 'badges',    label: 'Création de Badges', icon: Shield },
      { id: 'schedule',  label: 'Emploi du temps', icon: Calendar },
      { id: 'announcements', label: 'Annonces & Devoirs', icon: Megaphone },
      { id: 'finance',   label: 'Comptabilité',    icon: DollarSign },
      { id: 'payments',  label: 'Paiements Scolarité', icon: CreditCard },
      { id: 'absences',  label: 'Gérer les absences',   icon: Clock },
      { id: 'teachers',  label: 'Enseignants',      icon: BookOpen, teacherOnly: false },
    ] as { id: Tab; label: string; icon: any; teacherOnly?: boolean }[]
  ).filter(t => !isTeacher || (t.id !== 'teachers' && t.id !== 'finance'));

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.matricule.toLowerCase().includes(search.toLowerCase())
  );

  // Subject typical coefficients for rank calculation
  const getCoefficient = (subjectName: string) => {
    const sub = subjectName.toLowerCase();
    if (sub.includes('math')) return 4;
    if (sub.includes('phys') || sub.includes('chim')) return 3;
    if (sub.includes('philo') || sub.includes('franç') || sub.includes('liter')) return 3;
    if (sub.includes('hist') || sub.includes('géo') || sub.includes('angla')) return 2;
    return 1;
  };

  // Helper static calculations
  const totalTuitionInvoiced = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalTuitionCollected = payments.reduce((sum, p) => sum + (p.is_paid ? Number(p.amount) : 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const liveNetTreasury = totalTuitionCollected - totalExpenses;

  // Render grades coefficients for charts
  const getPerformanceChartData = () => {
    // Computes average grades per class for a visual bar chart
    const classAverages: { [classe: string]: { sum: number; count: number } } = {};
    grades.forEach(g => {
      const student = students.find(s => s.id === g.student_id);
      const cl = student?.classe || "Non affecté";
      if (!classAverages[cl]) classAverages[cl] = { sum: 0, count: 0 };
      classAverages[cl].sum += Number(g.value);
      classAverages[cl].count += 1;
    });
    return Object.keys(classAverages).map(k => ({
      class: k,
      Average: parseFloat((classAverages[k].sum / classAverages[k].count).toFixed(2))
    }));
  };

  const getGradesDistribution = () => {
    // Calculates total count of grades in categories
    // Insuffisant (<10), Passable (10-12), Bien (12-16), Excellent (>16)
    const counts = { 'Insuffisant (<10)': 0, 'Passable (10-12)': 0, 'Bien (12-16)': 0, 'Excellent (16-20)': 0 };
    grades.forEach(g => {
      const val = Number(g.value);
      if (val < 10) counts['Insuffisant (<10)'] += 1;
      else if (val < 12) counts['Passable (10-12)'] += 1;
      else if (val < 16) counts['Bien (12-16)'] += 1;
      else counts['Excellent (16-20)'] += 1;
    });
    return Object.keys(counts).map(k => ({
      name: k,
      Nombre: counts[k as keyof typeof counts]
    }));
  };

  // Class Schedule CRUD helpers
  const handleAddScheduleLocal = async () => {
    if (!newScheduleObj.subject || !newScheduleObj.classe) {
      toast.error("Matière et classe requises !");
      return;
    }
    try {
      const created = await addSchedule({ ...newScheduleObj, school_id: schoolId });
      setSchedules(current => [...current, created]);
      setNewScheduleObj({ classe: '', day: 'Lundi', time: '08h - 10h', subject: '', teacher: '' });
      setShowAddSchedule(false); toast.success("Cours programmé !");
    } catch { toast.error("Le cours n'a pas pu être enregistré."); }
  };

  const handleDeleteScheduleLocal = async (id: string) => {
    try { await deleteSchedule(id); setSchedules(current => current.filter(s => s.id !== id)); toast.success("Cours retiré de l'emploi du temps."); }
    catch { toast.error("Suppression impossible."); }
  };

  // Expenses accounting CRUD helpers
  const handleAddExpenseLocal = async () => {
    if (!newExpense.label || !newExpense.amount) {
      toast.error("Libellé et montant requis !");
      return;
    }
    try {
      const created = await addExpense({ ...newExpense, amount: Number(newExpense.amount), school_id: schoolId });
      setExpenses(current => [created, ...current]);
      setNewExpense({ label: '', amount: '', category: 'Salaires', date: new Date().toISOString().split('T')[0] });
      setShowAddExpense(false); toast.success("Dépense enregistrée avec succès !");
    } catch { toast.error("La dépense n'a pas pu être enregistrée."); }
  };

  // SMS Generator helper
  const copySmsTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copié dans le presse-papiers !");
  };

  const btnClass = "px-5 py-2.5 bg-gradient-to-r from-[#18bfd6] to-[#15adc1] hover:from-[#15adc1] hover:to-[#18bfd6] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#18bfd6]/10 hover:shadow-lg transition-all transform active:scale-95 duration-200";
  const inputCls = "w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18bfd6] focus:ring-4 focus:ring-[#18bfd6]/10 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      
      {/* Floating Ambient Brand Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#18bfd6]/5 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-[#fcb303]/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#18bfd6_0.5px,transparent_0.5px),radial-gradient(#fcb303_0.5px,transparent_0.5px)] bg-[size:32px_32px] [background-position:0_0,16px_16px] opacity-[0.03]" />
      </div>

      {/* Sidebar - Pro Left Rail */}
      <aside className="hidden md:flex flex-col w-64 glass-sidebar p-6 gap-2 shrink-0 z-10 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/1NnKKOKkq_li7F4_dNgGBVUXHR_K2xL55" 
              alt="Kharandi Logo" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-sm text-slate-900 truncate leading-tight">{schoolName}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#fcb303] mt-0.5">{isTeacher ? 'Enseignant' : 'Direction'}</p>
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          {tabs.map(t => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#18bfd6] to-[#15adc1] text-white shadow-lg shadow-[#18bfd6]/20 scale-[1.02]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}>
                <t.icon size={16} className={isActive ? "text-white" : "text-slate-400"} /> 
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
          <button onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-wider text-[#18bfd6] hover:bg-[#18bfd6]/5 w-full transition-all cursor-pointer">
            <ArrowLeft size={16} className="text-[#18bfd6]" /> <span>Plateforme Kharandi</span>
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50/60 w-full transition-all cursor-pointer">
            <LogOut size={16} /> <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto z-10 relative">
        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-4 bg-white border-b border-slate-100 scrollbar-none sticky top-0 z-20 shadow-sm">
          {tabs.map(t => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                  ${isActive ? 'bg-[#18bfd6] text-white shadow-md shadow-[#18bfd6]/15' : 'bg-slate-100 text-slate-600'}`}>
                {t.label}
              </button>
            );
          })}
          <button onClick={() => window.location.href = '/'} className="shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#18bfd6]/10 text-[#18bfd6] font-bold">
            Kharandi
          </button>
          <button onClick={onLogout} className="shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-500 font-bold shrink-0">
            Déconnexion
          </button>
        </div>

        <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24">
          {loading && (
            <div className="flex justify-center py-24">
              <Loader2 size={36} className="animate-spin text-[#18bfd6]" />
            </div>
          )}

          {/* VUE D'ENSEMBLE */}
          {!loading && tab === 'overview' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#18bfd6] bg-[#18bfd6]/10 px-3.5 py-1.5 rounded-full">
                    Kharandi ÉCOLE V2
                  </span>
                  <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
                    Bonjour, {isTeacher ? profile.name : schoolName}
                  </h1>
                  <p className="text-slate-400 font-semibold text-xs mt-1">Plateforme intelligente d'administration et d'évaluation du complexe scolaire.</p>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => setTab('bulletins')} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200/60 transition-all flex items-center justify-center gap-1.5">
                    <Award size={15} /> Bulletins
                  </button>
                  <button onClick={() => setTab('schedule')} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200/60 transition-all flex items-center justify-center gap-1.5">
                    <Calendar size={15} /> Horaires
                  </button>
                </div>
              </div>

              {/* Grid 4 Statistiques Clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Effectif Élèves', value: students.length, icon: <Users size={20}/>, color: 'bg-[#18bfd6]/10 text-[#18bfd6]', border: 'border-[#18bfd6]/10' },
                  { label: 'Notes Saisies', value: grades.length, icon: <GraduationCap size={20}/>, color: 'bg-green-500/10 text-green-600', border: 'border-green-500/10' },
                  { label: 'Scolarités Réglées', value: `${payments.filter(p=>p.is_paid).length} / ${payments.length}`, icon: <CreditCard size={20}/>, color: 'bg-indigo-500/10 text-indigo-600', border: 'border-indigo-500/10' },
                  { label: 'Absences Signalées', value: absences.length, icon: <Clock size={20}/>, color: 'bg-[#fcb303]/10 text-[#fcb303]', border: 'border-[#fcb303]/10' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-3xl p-5 border ${s.border} shadow-sm relative overflow-hidden hover:translate-y-[-2px] transition-all`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-500/5 to-transparent rounded-full blur-xl pointer-events-none" />
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${s.color} shadow-inner`}>{s.icon}</div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1.5">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* GRAPHIQUES VISUELS RECHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Graphique de distribution des notes */}
                <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-[#18bfd6]" size={18} />
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Distribution des Notes</h3>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">Évaluation Générale</span>
                  </div>
                  <div className="h-64">
                    {grades.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Aucune note pour générer le graphe</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getGradesDistribution()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} />
                          <Bar dataKey="Nombre" fill="#18bfd6" radius={[8, 8, 0, 0]}>
                            {getGradesDistribution().map((entry, index) => {
                              const colors = ['#E11D48', '#F59E0B', '#10B981', '#4F46E5'];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Graphique de performance par classe */}
                <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="text-emerald-500" size={18} />
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Moyennes par Classe (/20)</h3>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">Matières Confondues</span>
                  </div>
                  <div className="h-64">
                    {getPerformanceChartData().length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Aucune classe enregistrée</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getPerformanceChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="class" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis domain={[0, 20]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="Average" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* Copier SMS Rapide Block */}
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
                  <Send className="text-amber-500 shrink-0" size={18} />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Générateur & Modèles de Message (SMS aux Parents)</h3>
                    <p className="text-slate-400 text-[10px] font-bold">Copiez rapidement les messages types pour notifier les parents.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Notification d'Absence ⚠️",
                      desc: "Bonjour Monsieur/Madame, nous vous informons de l'absence de votre enfant ce jour à l'école. Merci de contacter la direction.",
                      btnText: "Copier le message d'absence"
                    },
                    {
                      title: "Encouragement Trimestriel 🏆",
                      desc: "Chers parents, Félicitations ! Votre enfant a obtenu de très bons résultats ce trimestre avec de solides appréciations des professeurs.",
                      btnText: "Copier le message félicitations"
                    },
                    {
                      title: "Rappel Scolarité / Paiement 💳",
                      desc: "Rappel scolarité : Chers parents, veuillez s'il vous plaît régulariser les frais de scolarité en attente de votre enfant pour ce trimestre.",
                      btnText: "Copier rappel paiement"
                    }
                  ].map((x, i) => (
                    <div key={i} className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between transition-colors">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 mb-1.5">{x.title}</p>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">"{x.desc}"</p>
                      </div>
                      <button onClick={() => copySmsTemplate(x.desc)} className="w-full py-2 bg-white hover:bg-[#18bfd6]/5 text-slate-700 hover:text-[#18bfd6] border border-slate-200 hover:border-[#18bfd6]/50 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <Copy size={12} /> {x.btnText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liste rapide élèves récents */}
              <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-100/30 p-6">
                <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-base md:text-lg">Élèves récemment enregistrés</h3>
                  <button onClick={() => setTab('students')} className="text-xs font-black text-[#18bfd6] hover:text-[#15adc1] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                    <span>Inscrire ou gérer les élèves</span> <ChevronRight size={14} />
                  </button>
                </div>
                {students.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-6 text-center">Aucun élève enregistré pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.slice(0, 6).map((s, i) => (
                      <div key={i} className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-all flex flex-col justify-between hover:border-slate-200">
                        <div>
                          <p className="font-extrabold text-xs text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                            <span className="font-mono bg-white text-slate-600 px-2 py-0.5 rounded-md text-[9px] border border-slate-100 font-bold">{s.matricule}</span>
                            <span>·</span>
                            <span>{s.classe || 'Non affecté'}</span>
                          </p>
                        </div>
                        {s.parent_phone && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                            <span className="text-[#18bfd6] font-extrabold">Parents:</span> {s.parent_phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÉLÈVES */}
          {!loading && tab === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Gestion des Élèves</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Inscrivez vos étudiants, attribuez des matricules uniques et spécifiez les classes.</p>
                </div>
                {!isTeacher && (
                  <button onClick={() => setShowAddStudent(!showAddStudent)} className={btnClass}>
                    <Plus size={16} /> <span>Inscrire un élève</span>
                  </button>
                )}
              </div>

              {showAddStudent && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-900 mb-4 text-base">Inscrire un nouvel élève</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Nom Complet de l'élève *</label>
                      <input placeholder="Ex: Jean Paul Diallo" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block font-semibold">Classe d'affection</label>
                      <select value={newStudent.classe} onChange={e => setNewStudent({...newStudent, classe: e.target.value})} className={inputCls}>
                        <option value="">Sélectionner —</option>
                        {classes.length > 0 ? (
                          classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                        ) : (
                          ['7ème Année', '8ème Année', '9ème Année', '10ème Année', '11ème SM', 'Terminal SSE', 'Terminal SM', 'Terminal SE'].map(cl => (
                            <option key={cl} value={cl}>{cl}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Téléphone des parents (SMS)</label>
                      <input placeholder="Ex: +224 626 18 71 17" value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddStudent(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newStudent.name) { toast.error("Le nom de l'élève est requis."); return; }
                      try {
                        await addStudent(schoolId, newStudent);
                        toast.success("Élève inscrit avec succès !");
                        setNewStudent({ name:'', classe:'', parent_phone:'' });
                        setShowAddStudent(false);
                        loadAll();
                      } catch { toast.error("Erreur lors de l'enregistrement de l'élève."); }
                    }} className={btnClass}>Enregistrer l'élève</button>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input placeholder="Rechercher par matricule ou nom..." value={search} onChange={e => setSearch(e.target.value)} className={`${inputCls} pl-11`} />
              </div>

              <div className="space-y-3">
                {filteredStudents.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-8 text-center bg-white rounded-3xl border border-slate-100">Aucun étudiant trouvé.</p>
                ) : (
                  filteredStudents.map(s => (
                    <div key={s.id} className="bg-white rounded-3xl border border-slate-100/95 p-5 flex items-center justify-between shadow-sm hover:translate-y-[-1px] transition-all">
                      <div>
                        <p className="font-extrabold text-[#0F172A] text-sm md:text-base">{s.name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="font-mono text-[10px] bg-[#18bfd6]/10 text-[#18bfd6] border border-[#18bfd6]/10 px-2.5 py-0.5 rounded-lg font-black">{s.matricule}</span>
                          <span className="text-xs text-slate-400 font-bold">Classe: <b className="text-[#fcb303]">{s.classe || 'Non affecté'}</b></span>
                          {s.parent_phone && <span className="text-xs text-slate-400 font-bold flex items-center gap-1">· Contact parents: <b className="text-slate-600 font-semibold">{s.parent_phone}</b></span>}
                        </div>
                      </div>
                      {!isTeacher && (
                        <button onClick={async () => { if (confirm("Êtes-vous sûr de vouloir radier cet élève de l'établissement ?")) { await deleteStudent(s.id); loadAll(); toast.success("Élève supprimé."); } }}
                          className="p-3 hover:bg-rose-50 rounded-2xl text-rose-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* NOTES ET ÉVALUATIONS */}
          {!loading && tab === 'grades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Saisie des Notes & Devoirs</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Enregistrez les notes d'évaluation continue, examens ou interrogations par matière.</p>
                </div>
                <button onClick={() => setShowAddGrade(!showAddGrade)} className={btnClass}>
                  <Plus size={16} /> <span>Saisir une note</span>
                </button>
              </div>

              {showAddGrade && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-900 mb-4 text-base">Enregistrer une évaluation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Sélectionner l'Élève *</label>
                      <select value={newGrade.student_id} onChange={e => setNewGrade({...newGrade, student_id: e.target.value})} className={inputCls}>
                        <option value="">Choisir l'étudiant —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classe || 'Classe inconnue'})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Matière *</label>
                      <input placeholder="ex: Mathématiques, Physique..." value={newGrade.subject} onChange={e => setNewGrade({...newGrade, subject: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Note obtenue (/20) *</label>
                      <input type="number" min="0" max="20" step="0.5" placeholder="ex: 15.5" value={newGrade.value} onChange={e => setNewGrade({...newGrade, value: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block font-semibold font-sans">Période d'évaluation *</label>
                      <select value={newGrade.trimester} onChange={e => setNewGrade({...newGrade, trimester: e.target.value})} className={inputCls}>
                        <option value="T1">1er Trimestre</option>
                        <option value="T2">2ème Trimestre</option>
                        <option value="T3">3ème Trimestre</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Appréciation / Observation</label>
                      <input placeholder="ex: Très bon esprit d'analyse, élève attentif" value={newGrade.comment} onChange={e => setNewGrade({...newGrade, comment: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddGrade(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newGrade.student_id || !newGrade.subject || !newGrade.value) { toast.error("Veuillez renseigner tous les champs requis."); return; }
                      try {
                        await addGrade({ ...newGrade, teacher_id: isTeacher ? profile.id : undefined });
                        toast.success("Note enregistrée avec succès !");
                        setNewGrade({ student_id:'', subject:'', value:'', trimester:'T1', comment:'' });
                        setShowAddGrade(false);
                        loadAll();
                      } catch { toast.error("Erreur lors de l'enregistrement de la note."); }
                    }} className={btnClass}>Enregistrer la note</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {grades.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                    <GraduationCap size={40} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold">Aucune note enregistrée</p>
                  </div>
                ) : (
                  grades.map(g => {
                    const val = parseFloat(g.value);
                    const valColor = val >= 12 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/10' : val >= 10 ? 'text-[#fcb303] bg-[#fcb303]/10 border-[#fcb303]/10' : 'text-rose-500 bg-rose-500/10 border-rose-500/10';
                    return (
                      <div key={g.id} className="bg-white rounded-3xl border border-slate-100/95 p-5 flex items-center justify-between shadow-sm hover:translate-y-[-1px] transition-all">
                        <div>
                          <p className="font-extrabold text-[#0F172A] text-sm md:text-base">
                            {students.find(s => s.id === g.student_id)?.name || g.student_name || 'Élève Anonyme'}
                            <span className="text-slate-400 font-bold ml-1">· {g.subject}</span>
                          </p>
                          <div className="flex items-center gap-2.5 mt-1.5 animate-fade-in">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-lg text-slate-500">{g.trimester}</span>
                            {g.comment && <span className="text-xs text-slate-400 font-semibold italic">"{g.comment}"</span>}
                          </div>
                        </div>
                        <span className={`text-base md:text-lg font-black border px-3.5 py-1.5 rounded-2xl ${valColor}`}>{g.value}/20</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* GENERATEUR DE BULLETINS (NEW IN V2) */}
          {!loading && tab === 'bulletins' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Générateur de Bulletins Scolaires</h1>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Compilez toutes les notes d'un élève, calculez sa moyenne générale coefficientée et générez son bulletin trimestriel.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Sélectionner l'Élève</label>
                  <select value={bulletinStudent} onChange={e => { setBulletinStudent(e.target.value); setActiveBulletinRef(null); }} className={inputCls}>
                    <option value="">Sélectionner un élève —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classe || "Non affecté"})</option>)}
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Période Trimestrielle</label>
                  <select value={bulletinTrimester} onChange={e => { setBulletinTrimester(e.target.value); setActiveBulletinRef(null); }} className={inputCls}>
                    <option value="T1">1er Trimestre</option>
                    <option value="T2">2ème Trimestre</option>
                    <option value="T3">3ème Trimestre</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!bulletinStudent) { toast.error("Veuillez d'abord choisir un élève !"); return; }
                    const studentData = students.find(s => s.id === bulletinStudent);
                    const studentGrades = grades.filter(g => g.student_id === bulletinStudent && g.trimester === bulletinTrimester);
                    if (studentGrades.length === 0) {
                      toast.error("Cet élève n'a reçu aucune note pour ce trimestre !");
                      setActiveBulletinRef(null);
                      return;
                    }
                    setActiveBulletinRef({ student: studentData, grades: studentGrades });
                    toast.success("Moyenne et bulletin calculés !");
                  }}
                  className={`${btnClass} w-full md:w-auto shrink-0 h-[46px]`}
                >
                  <Award size={16} /> <span>Générer le Bulletin</span>
                </button>
              </div>

              {/* RENDER THE BULLETIN FRAME */}
              {activeBulletinRef ? (() => {
                const { student, grades: studentGrades } = activeBulletinRef;
                
                // Group grades by subject for calculation
                const subjectAverages: { [sub: string]: { sum: number; count: number } } = {};
                studentGrades.forEach((g: any) => {
                  if (!subjectAverages[g.subject]) subjectAverages[g.subject] = { sum: 0, count: 0 };
                  subjectAverages[g.subject].sum += Number(g.value);
                  subjectAverages[g.subject].count += 1;
                });

                let totalWeighted = 0;
                let totalCoeffSum = 0;

                const subjectsList = Object.keys(subjectAverages).map(subject => {
                  const avg = subjectAverages[subject].sum / subjectAverages[subject].count;
                  const coeff = getCoefficient(subject);
                  totalWeighted += avg * coeff;
                  totalCoeffSum += coeff;
                  return {
                    name: subject,
                    average: avg,
                    coeff,
                    total: avg * coeff
                  };
                });

                const generalAverage = totalCoeffSum > 0 ? (totalWeighted / totalCoeffSum) : 0;
                const appreciation = generalAverage >= 16 ? "Excellent trimestre. Félicitations du conseil d'établissement." :
                                     generalAverage >= 14 ? "Très bon travail. Résultats solides." :
                                     generalAverage >= 12 ? "Trimestre satisfaisant. Poursuivez les efforts." :
                                     generalAverage >= 10 ? "Performance passable. Peut et doit mieux faire." :
                                     "Insuffisant. Redoublez de rigueur et demandez du soutien.";

                const evaluationStatus = generalAverage >= 12 ? "Encouragements" : generalAverage >= 10 ? "Tableau d'Honneur" : "Avertissement de Travail";

                return (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-1 md:p-6 bg-white border border-slate-200 shadow-xl rounded-[32px] overflow-hidden relative">
                    {/* Guinea National Colors top stripe layout decoration */}
                    <div className="absolute top-0 left-0 right-0 h-2.5 flex">
                      <div className="flex-1 bg-red-600" />
                      <div className="flex-1 bg-yellow-400" />
                      <div className="flex-1 bg-emerald-500" />
                    </div>

                    {/* Print Preview Mode Container */}
                    <div className="p-6 md:p-8 space-y-8 font-sans" id="bulletin-school-print-block">
                      {/* Bulletin Letterhead */}
                      <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
                        <div className="text-left space-y-1">
                          <h2 className="font-extrabold text-slate-905 text-lg uppercase tracking-tight">{schoolName}</h2>
                          <p className="text-slate-400 text-xs font-semibold">République de Guinée</p>
                          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold text-[#18bfd6]">Portail d'Éducation Kharandi</p>
                        </div>
                        <div className="text-right space-y-1 md:max-w-xs">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#fcb303] bg-[#fcb303]/10 px-2.5 py-1 rounded">Bulletin Officiel</span>
                          <h4 className="font-extrabold text-[#0F172A] text-sm mt-1">Scolaire Trimestriel</h4>
                          <p className="text-slate-400 text-xs font-bold leading-relaxed">{bulletinTrimester === 'T1' ? '1er Trimestre' : bulletinTrimester === 'T2' ? '2ème Trimestre' : '3ème Trimestre'} · 2026</p>
                        </div>
                      </div>

                      {/* Header Infos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-sm">
                        <div className="space-y-1.5 text-left">
                          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Élève ID & Profil :</p>
                          <p className="font-black text-slate-900 text-base">{student.name}</p>
                          <p className="text-slate-500 font-semibold text-xs mt-0.5">Matricule : <span className="font-mono bg-white border border-slate-100 px-2 py-0.5 rounded-lg text-slate-700 font-bold">{student.matricule}</span></p>
                          <p className="text-slate-500 font-semibold text-xs">Classe actuelle : <b className="text-[#0fafc1]">{student.classe || "Non affecté"}</b></p>
                        </div>
                        <div className="space-y-1.5 text-left md:text-right md:border-l border-slate-200/80 md:pl-6">
                          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Résultats Généraux :</p>
                          <p className="text-xl font-black text-[#18bfd6]">{generalAverage.toFixed(2)} / 20</p>
                          <p className="text-slate-500 font-bold text-xs">Matières évaluées : <span className="text-slate-900">{subjectsList.length}</span></p>
                          <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-current mt-1 ${generalAverage >= 12 ? 'text-green-600 bg-green-50/60' : 'text-rose-500 bg-rose-50/30'}`}>
                            Décision : {generalAverage >= 10 ? 'Admis(e)' : 'Refusé(e) / À surveiller'}
                          </span>
                        </div>
                      </div>

                      {/* Grades Table */}
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <th className="p-4">Matières Enseignées</th>
                              <th className="p-4 text-center">Moyenne Trimestrielle</th>
                              <th className="p-4 text-center">Coefficient (Coeff)</th>
                              <th className="p-4 text-center">Total Multiplié</th>
                              <th className="p-4">Appréciation par Matière</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
                            {subjectsList.map((sub, i) => (
                              <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4 font-black text-slate-900">{sub.name}</td>
                                <td className="p-4 text-center font-bold text-[#18bfd6]">{sub.average.toFixed(2)} / 20</td>
                                <td className="p-4 text-center text-slate-500 font-mono">{sub.coeff}</td>
                                <td className="p-4 text-center font-bold text-slate-900">{sub.total.toFixed(2)}</td>
                                <td className="p-4 text-slate-400 text-xs">{sub.average >= 16 ? 'Excellent travail' : sub.average >= 14 ? 'Très satisfaisant' : sub.average >= 12 ? 'Bon niveau, actif' : sub.average >= 10 ? 'Passable' : 'Doit redoubler d’efforts'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Totals */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-4 text-left p-5 rounded-2xl bg-cyan-50/20 border border-cyan-100/50">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#18bfd6] block mb-1">Observation globale du conseil des classes</span>
                            <p className="font-bold text-slate-900 text-sm italic">"{appreciation}"</p>
                          </div>
                          <div className="flex gap-2.5">
                            <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">Mention: {evaluationStatus}</span>
                            <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">Année: 2026</span>
                          </div>
                        </div>

                        {/* Signatures Panel */}
                        <div className="flex justify-between items-center text-left pt-6 sm:pt-0">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Le Principal de l'école :</h5>
                            <div className="h-10 w-24 border-b border-slate-300 relative flex items-center justify-center">
                              <span className="font-mono text-xs text-slate-400 italic">Signature / Sceau</span>
                            </div>
                            <p className="text-xs text-slate-700 font-black mt-2">Kharandi Administration</p>
                          </div>
                          
                          <div className="h-24 w-24 opacity-10 border-4 border-[#12adc1] text-[#12adc1] rounded-full flex flex-col items-center justify-center font-black flex-col text-[10px] uppercase tracking-wider">
                            <School size={20} />
                            <span>MINISTÈRE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Print Utilities Area */}
                    <div className="p-5 bg-slate-100 border-t border-slate-100 flex justify-end gap-2.5">
                      <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow hover:opacity-90"
                      >
                        <Printer size={15} /> <span>Imprimer / Exporter PDF</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })() : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                  <Award size={48} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500 font-bold text-sm">Veuillez choisir un élève et cliquer sur "Générer le Bulletin"</p>
                </div>
              )}
            </div>
          )}

          {/* EMPLOI DU TEMPS (NEW IN V2) */}
          {!loading && tab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Emploi du Temps / Classes</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Planifiez les heures de cours hebdomadaires et affectez les enseignants aux différentes matières.</p>
                </div>
                {!isTeacher && (
                  <button onClick={() => setShowAddSchedule(!showAddSchedule)} className={btnClass}>
                    <Plus size={16} /> <span>Programmer un cours</span>
                  </button>
                )}
              </div>

              {showAddSchedule && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2 text-left">
                  <h3 className="font-extrabold text-slate-900 mb-4 text-base">Programmer une plage de cours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Classe *</label>
                      <select value={newScheduleObj.classe} onChange={e => setNewScheduleObj({ ...newScheduleObj, classe: e.target.value })} className={inputCls}>
                        <option value="">Sélectionner —</option>
                        {['Terminal SSE', 'Terminal SM', '9ème Année', '8ème Année', '7ème Année'].map(cl => (
                          <option key={cl} value={cl}>{cl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Jour de la semaine *</label>
                      <select value={newScheduleObj.day} onChange={e => setNewScheduleObj({ ...newScheduleObj, day: e.target.value })} className={inputCls}>
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block font-semibold">Plage Horaire *</label>
                      <select value={newScheduleObj.time} onChange={e => setNewScheduleObj({ ...newScheduleObj, time: e.target.value })} className={inputCls}>
                        {['08h - 10h', '10h - 12h', '12h - 14h', '14h - 16h'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Matière *</label>
                      <input placeholder="ex: Mathématiques, Histoire, Anglais..." value={newScheduleObj.subject} onChange={e => setNewScheduleObj({ ...newScheduleObj, subject: e.target.value })} className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nom du Professeur responsable</label>
                      <input placeholder="ex: M. Camara / Mme. Condé" value={newScheduleObj.teacher} onChange={e => setNewScheduleObj({ ...newScheduleObj, teacher: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddSchedule(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={handleAddScheduleLocal} className={btnClass}>Enregistrer au calendrier</button>
                  </div>
                </div>
              )}

              {/* TIMETABLE WEEK VISUALIZER */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Plan de route officiel de l'établissement</p>
                </div>

                <div className="space-y-4">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => {
                    const lessons = schedules.filter(s => s.day === day);
                    return (
                      <div key={day} className="border-b border-slate-100 pb-4 last:border-none last:pb-0">
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mb-2 uppercase tracking-wide text-[#fcb303] bg-[#fcb303]/10 w-fit px-2.5 py-1 rounded-md">{day}</h4>
                        {lessons.length === 0 ? (
                          <p className="text-xs text-slate-400 font-bold italic pl-4">Aucun cours programmé ce jour-là.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {lessons.map(ls => (
                              <div key={ls.id} className="p-4 bg-slate-50 border border-slate-100/80 rounded-2xl relative flex flex-col justify-between group hover:border-[#18bfd6] transition-all">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-[#18bfd6] tracking-wider mb-2 block">{ls.time}</span>
                                  <p className="font-black text-xs text-slate-900 leading-tight">{ls.subject}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1">Avec : <span className="font-semibold text-slate-600">{ls.teacher || "Non défini"}</span></p>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">{ls.classe}</span>
                                  {!isTeacher && (
                                    <button onClick={() => handleDeleteScheduleLocal(ls.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-600 cursor-pointer">
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* COMPTABILITÉ & CHARGES (NEW IN V2) */}
          {!loading && tab === 'finance' && !isTeacher && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Comptabilité & Trésorerie</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Suivez la balance financière globale du complexe (Inflows des scolarités versus dépenses d'établissement).</p>
                </div>
                <button onClick={() => setShowAddExpense(!showAddExpense)} className={btnClass}>
                  <Plus size={16} /> <span>Ajouter une Dépense</span>
                </button>
              </div>

              {showAddExpense && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2 text-left">
                  <h3 className="font-extrabold text-slate-905 mb-4 text-base">Régister une Dépense financière</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Libellé / Description de la charge *</label>
                      <input placeholder="ex: Facture EDG, Salaire des enseignants..." value={newExpense.label} onChange={e => setNewExpense({ ...newExpense, label: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Montant de la dépense (GNF) *</label>
                      <input type="number" placeholder="ex: 1200000" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Catégorie de charge</label>
                      <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} className={inputCls}>
                        {['Salaires', 'Matériels', 'Maintenance', 'Charges fixes', 'Événements', 'Divers'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddExpense(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={handleAddExpenseLocal} className={btnClass}>Enregistrer la charge</button>
                  </div>
                </div>
              )}

              {/* Dynamic Ledger Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Scolarités Collectées", amount: totalTuitionCollected, style: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
                  { label: "Charges & Dépenses d'école", amount: totalExpenses, style: "bg-rose-50 text-rose-600 border border-rose-100" },
                  { label: "Solde de Trésorerie Net", amount: liveNetTreasury, style: liveNetTreasury >= 0 ? "bg-cyan-50/50 text-[#18bfd6] border border-cyan-100" : "bg-red-50 text-red-600 border border-red-100" }
                ].map((item, i) => (
                  <div key={i} className={`${item.style} p-5 rounded-3xl text-left shadow-sm relative overflow-hidden`}>
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-70 mb-2">{item.label}</span>
                    <p className="text-2xl md:text-3xl font-black tracking-tight font-mono">{item.amount.toLocaleString()} <span className="text-xs font-bold">GNF</span></p>
                    <span className="text-[9px] uppercase font-black tracking-widest bg-white/40 px-2 py-0.5 rounded border border-white/40 mt-3 inline-block">Mise à jour Live</span>
                  </div>
                ))}
              </div>

              {/* Expense Table List */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">Journal des Sorties de Caisse</h3>
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded">{expenses.length} dépense(s) répertoriée(s)</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <p className="text-slate-400 text-sm font-semibold text-center py-6">Aucune dépense enregistrée.</p>
                  ) : (
                    expenses.map(e => (
                      <div key={e.id} className="flex items-center justify-between py-4.5">
                        <div className="text-left space-y-1">
                          <p className="font-extrabold text-[#0F172A] text-sm">{e.label}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-slate-100 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wide">{e.category}</span>
                            <span className="text-xs text-slate-400 font-bold font-mono">{e.date}</span>
                          </div>
                        </div>
                        <span className="text-base font-black text-rose-500 font-mono">-{e.amount.toLocaleString()} GNF</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCOLARITÉS & PAIEMENTS */}
          {!loading && tab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Suivi des Scolarités d'élèves</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Vérifiez les versements effectués, facturez les trimestres en cours et suivez les impayés.</p>
                </div>
                {!isTeacher && (
                  <button onClick={() => setShowAddPayment(!showAddPayment)} className={btnClass}>
                    <Plus size={16} /> <span>Facturer un élève</span>
                  </button>
                )}
              </div>

              {showAddPayment && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-905 mb-4 text-base">Émettre une facture scolaire</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Sélectionner Élève *</label>
                      <select value={newPayment.student_id} onChange={e => setNewPayment({...newPayment, student_id: e.target.value})} className={inputCls}>
                        <option value="">Sélectionner —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classe || 'Aucune classe'})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block font-semibold">Désignation du paiement *</label>
                      <input placeholder="ex: Inscription, Scolarité Trimestre 2" value={newPayment.label} onChange={e => setNewPayment({...newPayment, label: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block font-bold">Montant Brut (GNF) *</label>
                      <input type="number" placeholder="ex: 300000" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddPayment(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newPayment.student_id || !newPayment.label || !newPayment.amount) { toast.error("Veuillez renseigner tous les champs requis."); return; }
                      try {
                        await addPayment(newPayment);
                        toast.success("Facture émise avec succès !"); setShowAddPayment(false); loadAll();
                      } catch { toast.error("Erreur d'enregistrement du paiement."); }
                    }} className={btnClass}>Créer la facture</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {payments.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-8 text-center bg-white rounded-3xl border border-slate-100">Aucun paiement répertorié.</p>
                ) : (
                  payments.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl border border-slate-100/95 p-5 flex items-center justify-between shadow-sm hover:translate-y-[-1px] transition-all">
                      <div>
                        <p className="font-extrabold text-[#0F172A] text-sm md:text-base">
                          {students.find(s => s.id === p.student_id)?.name || p.student_name || 'Élève Anonyme'}
                          <span className="text-slate-400 font-bold ml-1">· {p.label}</span>
                        </p>
                        <p className="text-xs text-[#18bfd6] font-bold mt-1.5 uppercase tracking-wider font-mono bg-[#18bfd6]/5 border border-[#18bfd6]/10 px-2.5 py-1 rounded-lg w-fit">{parseInt(p.amount).toLocaleString()} GNF</p>
                      </div>
                      {p.is_paid ? (
                        <span className="text-[10px] font-black text-green-600 bg-green-500/10 border border-green-500/10 px-4 py-2 rounded-full uppercase tracking-wider font-semibold animate-fade-in">Payé</span>
                      ) : (
                        <button onClick={async () => { await markPaymentPaid(p.id); loadAll(); toast.success("Règlement validé avec succès !"); }}
                          className="text-[10px] font-black text-[#fcb303] bg-[#fcb303]/10 border border-[#fcb303]/20 hover:bg-[#fcb303]/20 px-4 py-2.5 rounded-2xl transition-all cursor-pointer uppercase tracking-wider">
                          Valider paiement
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABSENCES */}
          {!loading && tab === 'absences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Appel & Présences journalières</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Portez les absences d'élèves par date et matière pour un meilleur suivi de l'assiduité.</p>
                </div>
                <button onClick={() => setShowAddAbsence(!showAddAbsence)} className={btnClass}>
                  <Plus size={16} /> <span>Signaler absence</span>
                </button>
              </div>

              {showAddAbsence && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-905 mb-4 text-base">Signaler une absence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center pl-1 text-left">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Élève *</label>
                      <select value={newAbsence.student_id} onChange={e => setNewAbsence({...newAbsence, student_id: e.target.value})} className={inputCls}>
                        <option value="">Sélectionner —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classe || 'Aucune classe'})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block font-bold font-mono">Date de l'absence *</label>
                      <input type="date" value={newAbsence.date} onChange={e => setNewAbsence({...newAbsence, date: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Matière / Cours concerné</label>
                      <input placeholder="ex: Physique, Français" value={newAbsence.subject} onChange={e => setNewAbsence({...newAbsence, subject: e.target.value})} className={inputCls} />
                    </div>
                    <div className="md:pt-6">
                      <label className="flex items-center gap-2.5 text-[11px] font-black uppercase text-slate-500 cursor-pointer select-none">
                        <input type="checkbox" checked={newAbsence.is_justified} onChange={e => setNewAbsence({...newAbsence, is_justified: e.target.checked})} className="w-5 h-5 accent-[#18bfd6]" />
                        <span>Justifiée par un billet</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddAbsence(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newAbsence.student_id || !newAbsence.date) { toast.error("Veuillez sélectionner l'étudiant et la date."); return; }
                      try {
                        await addAbsence(newAbsence); toast.success("Absence enregistrée avec succès !");
                        setShowAddAbsence(false); loadAll();
                      } catch { toast.error("Erreur lors de l'enregistrement de l'absence."); }
                    }} className={btnClass}>Enregistrer l'absence</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {absences.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-8 text-center bg-white rounded-3xl border border-slate-100">Aucune absence signalée.</p>
                ) : (
                  absences.map(a => (
                    <div key={a.id} className="bg-white rounded-3xl border border-slate-100/95 p-5 flex items-center justify-between shadow-sm hover:translate-y-[-1px] transition-all">
                      <div>
                        <p className="font-extrabold text-[#0F172A] text-sm md:text-base">
                          {students.find(s => s.id === a.student_id)?.name || a.student_name || 'Élève Anonyme'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded-md">{a.date}</span>
                          {a.subject && <span className="text-xs text-slate-400 font-bold">Matière: {a.subject}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-4.5 py-1.5 rounded-full uppercase tracking-wider border ${a.justified ? 'bg-green-500/10 text-green-600 border-green-500/10' : 'bg-rose-500/10 text-rose-500 border-rose-500/10'}`}>
                        {a.justified ? 'Justifiée' : 'Non justifiée'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CRÉATION DE BADGES */}
          {!loading && tab === 'badges' && (
            <div className="space-y-6 text-left animate-fade-in">
              {!hasBadgesOption ? (
                <div className="max-w-3xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden mt-4">
                  <div className="relative h-48 bg-gradient-to-r from-purple-600 via-[#18bfd6] to-[#fcb303] flex items-center p-8 overflow-hidden text-white">
                    <div className="absolute inset-0 bg-black/15 mix-blend-multiply z-0" />
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl z-0" />
                    <div className="relative z-10 space-y-2 pointer-events-none text-left">
                      <span className="text-[10px] bg-white/20 border border-white/25 text-white font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                        Option de Forfait École
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Option Bulletins, Badges & Certificats</h2>
                      <p className="text-xs text-white/95 max-w-xl font-semibold leading-relaxed">
                        Stimulez la réussite scolaire, célébrez la discipline et informez instantanément les parents d'élèves de l'établissement.
                      </p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <div className="bg-purple-50 text-purple-800 p-4 rounded-2xl border border-purple-100/50 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Complément d'abonnement optionnel</p>
                          <p className="text-2xl font-black">+ 40 000 GNF <span className="text-xs font-bold text-slate-500">/ élève / an</span></p>
                          <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                            S'ajoute à la licence standard du <span className="font-bold text-slate-700">Forfait - Kharandi École</span> de 60 000 GNF/élève/an.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-extrabold text-[#0D172A] text-sm">Ce que cette option débloque :</h4>
                          <ul className="space-y-2.5 text-xs text-slate-600 font-bold">
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                              <span>Concevoir des illustrations et insignes de prestige personnalisés (Or, Social, Progrès)</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                              <span>Émettre des attestations et diplômes de mérite d'honneur officiels imprimables</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                              <span>Transmission en temps réel sur l'Espace Parent de l'Élève</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                              <span>Notifications par email & SMS automatisées de félicitations parentales</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 p-2">
                          <img 
                            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400" 
                            alt="Student success" 
                            className="rounded-xl w-full h-36 object-cover brightness-95"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-450">Option Premium requise</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-normal mt-0.5">Activez les badges et certificats depuis votre abonnement Kharandi École.</p>
                          </div>
                          <button
                            onClick={() => { window.location.href = '/abonnements'; }}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-[#18bfd6] hover:opacity-95 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/15 cursor-pointer"
                          >
                            Activer l'option & Lancer l'Éditeur
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Upgrade Alert Controller */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                      <div>
                        <p className="font-extrabold">Option Bulletins, Badges & Certificats active (Simulée)</p>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Votre établissement dispose de l'autorisation d'imprimer des attestations de mérite et décerner des distinctions.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info("La désactivation d'une option se fait depuis l'administration Xano.")}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all self-end sm:self-auto"
                    >
                      Désactiver pour tester le paywall
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Distinctions & Badges Scolaires</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Créez et décernez de magnifiques insignes de mérite pour motiver vos élèves.</p>
                </div>
                <button
                  onClick={() => setShowAddBadgeSetting(!showAddBadgeSetting)}
                  className="px-5 py-3 bg-gradient-to-r from-[#18bfd6] to-[#15adc1] hover:to-[#129bb0] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#18bfd6]/10"
                >
                  <Plus size={16} /> <span>Décerner un nouveau badge</span>
                </button>
              </div>

              {/* Add Badge Panel */}
              {showAddBadgeSetting && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 border border-slate-200/50 p-6 rounded-[32px] shadow-sm animate-slide-in">
                  
                  {/* Form fields */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-[#0D172A] text-base flex items-center gap-2">
                      <Sparkles size={18} className="text-[#fcb303]" />
                      <span>Paramètres du Certificat</span>
                    </h3>

                    {/* Pre-fill templates shortcuts */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-450 block mb-2">Modèles prédéfinis :</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { title: "Étoile de Kharandi", cat: "Gold", msg: "Félicitations chaleureuses pour des résultats académiques exceptionnels et une attitude exemplaire tout au long de la période scolaire." },
                          { title: "Insigne de Leadership", cat: "Cyan", msg: "Décerné pour des facultés de leadership remarquables, son dévouement aux projets de classe et son excellente initiative constructive." },
                          { title: "Camarade Modèle", cat: "Violet", msg: "Distinction accordée pour son esprit de camaraderie remarquable, son entraide précieuse et son soutien quotidien envers ses pairs." },
                          { title: "Espoir du Futur - Progrès Continu", cat: "Emerald", msg: "Décerné en reconnaissance de ses efforts continus, de sa persévérance exemplaire et de sa progression spectaculaire." }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewBadge({
                                ...newBadge,
                                title: preset.title,
                                category: preset.cat,
                                message: preset.msg
                              });
                            }}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-[#18bfd6] hover:bg-[#18bfd6]/5 rounded-xl text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                          >
                            {preset.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Élève récipiendaire</label>
                        <select
                          value={newBadge.student_id}
                          onChange={e => setNewBadge({ ...newBadge, student_id: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">Sélectionner un élève...</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.classe || "Scolarisé"})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Intitulé de la distinction</label>
                          <input
                            placeholder="ex: Épée du Mérite"
                            value={newBadge.title}
                            onChange={e => setNewBadge({ ...newBadge, title: e.target.value })}
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1.5 block">Catégorie visuelle</label>
                          <select
                            value={newBadge.category}
                            onChange={e => setNewBadge({ ...newBadge, category: e.target.value })}
                            className={inputCls}
                          >
                            <option value="Gold">Grand Mérite (Or Glow)</option>
                            <option value="Cyan">Félicitations (Cyan Azure)</option>
                            <option value="Violet">Social & Solidarité (Purple Mystique)</option>
                            <option value="Emerald">Espoir & Effort (Forest Green)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Citation & Félicitations motivantes</label>
                        <textarea
                          rows={3}
                          placeholder="Décrivez précisément les accomplissements de l'élève..."
                          value={newBadge.message}
                          onChange={e => setNewBadge({ ...newBadge, message: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Autorité Signataire</label>
                        <input
                          placeholder="M. Camara, Directeur Académique"
                          value={newBadge.signatory}
                          onChange={e => setNewBadge({ ...newBadge, signatory: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setShowAddBadgeSetting(false)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={async () => {
                          if (!newBadge.student_id || !newBadge.title || !newBadge.message) {
                            toast.error("Veuillez sélectionner l'élève et remplir l'ensemble des champs.");
                            return;
                          }
                          try {
                            const recipient = students.find(st => st.id === newBadge.student_id);
                            const badgeToAdd = {
                              school_id: schoolId,
                              student_id: newBadge.student_id,
                              student_name: recipient?.name || 'Élève Récipiendaire',
                              title: newBadge.title,
                              category: newBadge.category,
                              message: newBadge.message,
                              signatory: newBadge.signatory || 'La Direction',
                              date: new Date().toISOString().split('T')[0]
                            };

                            const createdBadge = await addBadge(badgeToAdd);
                            setSchoolBadges(current => [createdBadge, ...current]);
                            toast.success("Badge décerné avec un prestige magnifique !");
                            setShowAddBadgeSetting(false);
                          } catch {
                            toast.error("Échec lors de l'enregistrement de la distinction.");
                          }
                        }}
                        className="px-5 py-2.5 bg-[#18bfd6] hover:bg-[#15adc1] text-white rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-[#18bfd6]/10"
                      >
                        Décerner l'insigne
                      </button>
                    </div>
                  </div>

                  {/* Live Visual Preview column */}
                  <div className="lg:col-span-5 flex flex-col justify-center bg-slate-100/10 border border-slate-200/60 p-6 rounded-2xl text-center space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Aperçu Réel Magnifique</p>
                      <p className="text-[11px] font-semibold text-slate-500">Voyez le rendu final instantané du badge de l'élève.</p>
                    </div>

                    {/* Styled Badge mockup card */}
                    {(() => {
                      const isGold = newBadge.category === 'Gold';
                      const isCyan = newBadge.category === 'Cyan';
                      const isViolet = newBadge.category === 'Violet';
                      
                      const bgClass = isGold
                        ? 'from-amber-500/10 via-yellow-500/5 to-amber-600/10 border-amber-500/30 shadow-amber-500/5'
                        : isCyan
                        ? 'from-[#18bfd6]/10 via-[#18bfd6]/5 to-[#18bfd6]/10 border-[#18bfd6]/30 shadow-[#18bfd6]/5'
                        : isViolet
                        ? 'from-violet-500/10 via-purple-500/5 to-violet-600/10 border-violet-500/30 shadow-violet-500/5'
                        : 'from-emerald-500/10 via-teal-500/5 to-emerald-600/10 border-emerald-500/30 shadow-emerald-500/5';
                        
                      const accentColor = isGold
                        ? 'text-amber-600'
                        : isCyan
                        ? 'text-[#18bfd6]'
                        : isViolet
                        ? 'text-purple-600'
                        : 'text-emerald-600';

                      const badgeBadgeClass = isGold
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        : isCyan
                        ? 'bg-[#18bfd6]/10 text-[#18bfd6] border-[#18bfd6]/20'
                        : isViolet
                        ? 'bg-violet-500/10 text-violet-700 border-violet-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';

                      const studentName = students.find(st => st.id === newBadge.student_id)?.name || 'Élève Kharandi';

                      return (
                        <div className={`relative overflow-hidden rounded-[32px] border bg-gradient-to-tr ${bgClass} p-6 flex flex-col justify-between shadow-xl min-h-[340px] text-left shrink-0`}>
                          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/30 via-transparent to-black/5 opacity-50 pointer-events-none" />
                          <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                          
                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${badgeBadgeClass}`}>
                                {isGold ? 'Grand Mérite' : isViolet ? 'Social & Entraide' : 'Félicitations'}
                              </span>
                              <span className="text-[9px] text-slate-450 font-mono font-bold">2026-06-15</span>
                            </div>

                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-md border border-slate-100 ${accentColor} shrink-0`}>
                                <Award size={28} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-[#0D172A] text-base leading-snug tracking-tight truncate">{newBadge.title || "Intitulé"}</h4>
                                <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 truncate">Pour : <span className="text-slate-800">{studentName}</span></p>
                              </div>
                            </div>

                            <div className="bg-white/45 backdrop-blur-sm border border-white/50 p-4 rounded-xl min-h-[90px] flex items-center">
                              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold italic">
                                "{newBadge.message || "Félicitations chaleureuses"}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/40 pt-4 mt-4 relative z-10">
                            <div>
                              <p className="text-[8px] uppercase font-black tracking-wider text-slate-400">Signataire officiel</p>
                              <p className="text-[11px] font-black text-slate-800">{newBadge.signatory || "L'autorité"}</p>
                            </div>
                            <span className="text-[9px] font-bold text-[#18bfd6] uppercase tracking-wider bg-slate-100/30 px-2 py-0.5 rounded border">Preview</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

              {/* Badges Grid list */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-[#0F172A] text-base">Historique des Mérites Décernés</h3>

                {schoolBadges.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-12 text-center bg-white rounded-3xl border border-slate-100">Aucun badge n'a été décerné pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {schoolBadges.map((b) => {
                      const isGold = b.category === 'Gold';
                      const isCyan = b.category === 'Cyan';
                      const isViolet = b.category === 'Violet';
                      
                      const bgClass = isGold
                        ? 'from-amber-500/10 via-yellow-500/5 to-amber-600/10 border-amber-500/20'
                        : isCyan
                        ? 'from-[#18bfd6]/10 via-[#18bfd6]/5 to-[#18bfd6]/10 border-[#18bfd6]/20'
                        : isViolet
                        ? 'from-violet-500/10 via-purple-500/5 to-violet-600/10 border-violet-500/20'
                        : 'from-emerald-500/10 via-teal-500/5 to-emerald-600/10 border-emerald-500/20';
                        
                      const accentColor = isGold
                        ? 'text-amber-600'
                        : isCyan
                        ? 'text-[#18bfd6]'
                        : isViolet
                        ? 'text-purple-600'
                        : 'text-emerald-600';

                      const badgeBadgeClass = isGold
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        : isCyan
                        ? 'bg-[#18bfd6]/10 text-[#18bfd6] border-[#18bfd6]/20'
                        : isViolet
                        ? 'bg-violet-500/10 text-violet-700 border-violet-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';

                      return (
                        <div
                          key={b.id}
                          className={`relative overflow-hidden rounded-[28px] border bg-gradient-to-tr ${bgClass} p-6 flex flex-col justify-between shadow-sm`}
                        >
                          <div className="space-y-4 text-left">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${badgeBadgeClass}`}>
                                {isGold ? 'Grand Mérite' : isViolet ? 'Social & Entraide' : 'Félicitations'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono font-bold">{b.date}</span>
                                <button
                                  onClick={async () => {
                                    try { await deleteBadge(String(b.id)); setSchoolBadges(current => current.filter(bg => bg.id !== b.id)); toast.success("Badge révoqué avec succès."); }
                                    catch { toast.error("Le badge n'a pas pu être révoqué."); }
                                  }}
                                  className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                  title="Révoquer le badge de mérite"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 ${accentColor} shrink-0`}>
                                <Award size={22} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-[#0D172A] text-sm leading-tight truncate">{b.title}</h4>
                                <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 truncate">Élève : <span className="text-slate-700 font-extrabold">{b.student_name}</span></p>
                              </div>
                            </div>

                            <p className="text-xs text-slate-655 leading-relaxed italic bg-white/40 p-3.5 rounded-xl border border-white/50">
                              "{b.message}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/40 pt-3 mt-4 text-xs">
                            <div className="text-left">
                              <p className="text-[8px] uppercase font-black tracking-wider text-slate-400">Décerné par</p>
                              <p className="font-extrabold text-slate-700">{b.signatory}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
                </div>
              </>
            )}
            </div>
          )}
          {!loading && tab === 'teachers' && !isTeacher && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Corps Enseignant</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Gérez l'affectation de vos professeurs officiels et leurs classes associées.</p>
                </div>
                <button onClick={() => setShowAddTeacher(!showAddTeacher)} className={btnClass}>
                  <Plus size={16} /> <span>Nouveau professeur</span>
                </button>
              </div>

              {showAddTeacher && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-900 mb-4 text-base">Créer un profil enseignant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Nom & Prénom *</label>
                      <input placeholder="ex: M. Soumah, Mme Camara" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Adresse Email officielle *</label>
                      <input type="email" placeholder="ex: conde@ecole.gn" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Mot de passe temporaire</label>
                      <input placeholder="Par défaut: kharandi2026" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block font-semibold">Classes Assignées (Séparées par virgule)</label>
                      <input placeholder="ex: Terminal SSE, Terminal SM" value={newTeacher.classes} onChange={e => setNewTeacher({...newTeacher, classes: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddTeacher(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newTeacher.name || !newTeacher.email) { toast.error("Nom et Email obligatoires."); return; }
                      try {
                        await addTeacher({
                          school_id: schoolId, name: newTeacher.name, email: newTeacher.email,
                          password: newTeacher.password,
                          classes: newTeacher.classes.split(',').map(c => c.trim()).filter(Boolean),
                        });
                        toast.success("Enseignant ajouté avec succès !"); setShowAddTeacher(false); loadAll();
                        setNewTeacher({ name: '', email: '', password: 'kharandi2026', classes: '' });
                      } catch (err: any) { toast.error(err.response?.data?.message || "Erreur lors de la création."); }
                    }} className={btnClass}>Enregistrer l'enseignant</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {teachers.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-8 text-center bg-white rounded-3xl border border-slate-100">Aucun professeur répertorié.</p>
                ) : (
                  teachers.map(t => (
                    <div key={t.id} className="bg-white rounded-3xl border border-slate-100/95 p-5 flex items-center justify-between shadow-sm hover:translate-y-[-1px] transition-all">
                      <div>
                        <p className="font-extrabold text-[#0F172A] text-sm md:text-base">{t.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="font-mono text-[10px] bg-[#fcb303]/10 text-[#fcb303] border border-[#fcb303]/10 px-2.5 py-0.5 rounded-lg font-black">{t.email}</span>
                          <span className="text-xs text-slate-400 font-bold">Classes d'intervention: <b className="text-slate-600">{(t.classes || []).join(', ') || 'Non assigné'}</b></span>
                        </div>
                      </div>
                      <button onClick={async () => { if (confirm("Êtes-vous sûr de vouloir supprimer ce professeur du corps enseignant ?")) { await deleteTeacher(t.id); loadAll(); toast.success("Enseignant supprimé."); } }}
                        className="p-3 hover:bg-rose-50 rounded-2xl text-rose-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ANNONCES & CAHIER DE DEVOIRS (NEW MANAGEMENT MODULE) */}
          {!loading && tab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Annonces & Cahier de devoirs</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Publiez les circulaires scolaires et devoirs assignés consultables instantanément par les parents d'élèves.</p>
                </div>
                <button onClick={() => setShowAddAnnouncement(!showAddAnnouncement)} className={btnClass}>
                  <Plus size={16} /> <span>Publier une annonce / devoir</span>
                </button>
              </div>

              {showAddAnnouncement && (
                <div className="bg-white rounded-[28px] border-2 border-[#18bfd6]/20 shadow-xl shadow-[#18bfd6]/5 p-6 mb-2">
                  <h3 className="font-extrabold text-slate-900 mb-4 text-base">Créer une communication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Titre de l'annonce ou devoir *</label>
                      <input placeholder="ex: Devoir de Mathématiques à rendre, Examen de physique..." value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Catégorie communication *</label>
                      <select value={newAnnouncement.category} onChange={e => setNewAnnouncement({...newAnnouncement, category: e.target.value})} className={inputCls}>
                        <option value="Information">Information administrative</option>
                        <option value="Devoir">Devoir à la maison / Exercices</option>
                        <option value="Message">Message général / Notification</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Classe ciblée *</label>
                      <select value={newAnnouncement.className} onChange={e => setNewAnnouncement({...newAnnouncement, className: e.target.value})} className={inputCls}>
                        <option value="Toutes les classes">Toutes les classes</option>
                        {classes.map(cl => (
                          <option key={cl.id} value={cl.name}>{cl.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Contenu détaillé de la publication *</label>
                      <textarea rows={4} placeholder="Rédigez ici les consignes, devoirs ou notes de service destinées aux familles..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className={`${inputCls} resize-none py-3 h-28`} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={() => setShowAddAnnouncement(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!newAnnouncement.title || !newAnnouncement.content) { toast.error("Titre et Contenu obligatoires."); return; }
                      try {
                        const createdAnnouncement = await addAnnouncement({
                          school_id: schoolId,
                          title: newAnnouncement.title,
                          content: newAnnouncement.content,
                          category: newAnnouncement.category,
                          className: newAnnouncement.className,
                          author: isTeacher ? profile.name : "La Direction"
                        });
                        setAnnouncements(current => [createdAnnouncement, ...current]);
                        toast.success("Publication diffusée avec succès !"); setShowAddAnnouncement(false);
                        setNewAnnouncement({ title: '', content: '', category: 'Information', className: 'Toutes les classes' });
                      } catch { toast.error("La publication n'a pas pu être diffusée."); }
                    }} className={btnClass}>Diffuser la communication</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-slate-400 text-sm font-semibold py-8 text-center bg-white rounded-3xl border border-slate-100">Aucune annonce diffusée actuellement.</p>
                ) : (
                  announcements.map((ann) => {
                    const isHomework = ann.category?.toLowerCase() === 'devoir';
                    const catBg = isHomework ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
                    return (
                      <div key={ann.id} className="bg-white rounded-3xl border border-slate-100/95 p-6 shadow-sm flex items-start justify-between gap-4 text-left">
                        <div className="space-y-1.5 flex-1 select-text">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${catBg}`}>
                              {ann.category || 'Information'}
                            </span>
                            <span className="text-xs text-slate-400 font-bold font-mono">{ann.date}</span>
                            <span className="text-xs text-slate-400 font-mono italic">· Auteur : {ann.author || 'Direction'}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded ml-auto">
                              Cible : {ann.className}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-[#0F172A] text-base md:text-lg leading-snug">{ann.title}</h3>
                          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-semibold mt-3 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                        <button onClick={async () => {
                          if (confirm("Supprimer cette communication définitivement ?")) {
                            try { await deleteAnnouncement(String(ann.id)); setAnnouncements(current => current.filter(a => a.id !== ann.id)); toast.success("Publication supprimée de l'espace parent."); }
                            catch { toast.error("La publication n'a pas pu être supprimée."); }
                          }
                        }}
                          className="p-3 hover:bg-rose-50 rounded-2xl text-rose-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 cursor-pointer shrink-0 mt-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
