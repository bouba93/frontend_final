import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { School, UserCircle, ArrowRight, ShieldCheck, KeyRound, Check, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  verifyActivationCode, finalizeActivation,
  schoolLogin, teacherLogin, parentLookup,
} from '../../services/ecole';

export const EcoleLogin: React.FC<{
  onParentLogin:  (data: any) => void;
  onSchoolLogin:  (profile: any) => void;
  onTeacherLogin: (profile: any) => void;
}> = ({ onParentLogin, onSchoolLogin, onTeacherLogin }) => {

  const [mode, setMode] = useState<'selection'|'school'|'parent'|'teacher'|'activation'|'setup_password'>('selection');

  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [studentId,      setStudentId]      = useState('');
  const [teacherEmail,   setTeacherEmail]   = useState('');
  const [teacherPass,    setTeacherPass]    = useState('');
  const [activCode,      setActivCode]      = useState('');
  const [activEmail,     setActivEmail]     = useState('');
  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPass,    setConfirmPass]    = useState('');
  const [matchedSchool,  setMatchedSchool]  = useState<any>(null);
  const [loading,        setLoading]        = useState(false);

  // ── Connexion école ───────────────────────────────────────────────────
  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await schoolLogin(email.trim().toLowerCase(), password);
      toast.success("Connexion direction réussie !");
      onSchoolLogin(res.profile);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Identifiants incorrects.");
    } finally { setLoading(false); }
  };

  // ── Connexion enseignant ──────────────────────────────────────────────
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await teacherLogin(teacherEmail.trim().toLowerCase(), teacherPass);
      toast.success(`Bienvenue, professeur !`);
      onTeacherLogin(res.profile);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Identifiants enseignant incorrects.");
    } finally { setLoading(false); }
  };

  // ── Accès parent ──────────────────────────────────────────────────────
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) { toast.error("Matricule requis."); return; }
    setLoading(true);
    try {
      const data = await parentLookup(studentId.trim().toUpperCase());
      onParentLogin(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Matricule introuvable.");
    } finally { setLoading(false); }
  };

  // ── Étape 1 activation — vérifier code ───────────────────────────────
  const verifyActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyActivationCode(activCode.trim().toUpperCase(), activEmail.trim().toLowerCase());
      if (res.school_name) {
        setMatchedSchool({ name: res.school_name, email: activEmail.trim().toLowerCase(), code: activCode.trim().toUpperCase() });
        setMode('setup_password');
        toast.success("Code validé ! Définissez votre mot de passe.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Code ou email incorrect.");
    } finally { setLoading(false); }
  };

  // ── Étape 2 activation — définir le mot de passe ──────────────────────
  const finalizeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Minimum 6 caractères."); return; }
    if (newPassword !== confirmPass) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const res = await finalizeActivation(matchedSchool.code, matchedSchool.email, newPassword);
      toast.success("École activée ! Connectez-vous maintenant.");
      setMode('school');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'activation.");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#18bfd6] focus:ring-4 focus:ring-[#18bfd6]/10 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Back Button to Main Platform */}
      <button 
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group cursor-pointer z-50 hover:bg-slate-50"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[#18bfd6]" />
        Retour à Kharandi
      </button>

      {/* Background Orbs with Kharandi brand colors (Cyan & Secondary Yellow) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
            opacity: [0.15, 0.22, 0.15] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-[#18bfd6]/25 blur-[130px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
            opacity: [0.1, 0.18, 0.1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-[#fcb303]/15 blur-[150px]"
        />
        {/* Brand Specific Dot Map Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#18bfd6_0.5px,transparent_0.5px),radial-gradient(#fcb303_0.5px,transparent_0.5px)] bg-[size:24px_24px] [background-position:0_0,12px_12px] opacity-[0.04]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white rounded-[32px] shadow-xl border border-slate-100/85 flex items-center justify-center mx-auto mb-6 relative group"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1NnKKOKkq_li7F4_dNgGBVUXHR_K2xL55" 
              alt="Kharandi Logo" 
              className="w-16 h-16 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#18bfd6] text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
              <School size={14} className="animate-pulse" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Kharandi École</h1>
          <p className="text-slate-500 mt-2 font-semibold text-sm">Portail scolaire — Suivi de la performance</p>
        </div>

        <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/80 border border-slate-100/50">

          {/* Sélection */}
          {mode === 'selection' && (
            <div className="space-y-3.5">
              {[
                { m: 'parent',     icon: <UserCircle size={22} />, color: 'bg-[#18bfd6]/10 text-[#18bfd6] border-[#18bfd6]/20', title: 'Espace Parent', desc: 'Suivez les résultats scolaires de votre enfant.' },
                { m: 'school',     icon: <School size={22} />,     color: 'bg-[#fcb303]/10 text-[#fcb303] border-[#fcb303]/20', title: 'Direction de l\'école', desc: 'Panel administration — scolarité et classes.' },
                { m: 'teacher',    icon: <KeyRound size={22} />,   color: 'bg-indigo-50 text-indigo-600 border-indigo-100', title: 'Espace Enseignant', desc: 'Notes, bulletins et appels de classe.' },
              ].map(({ m, icon, color, title, desc }) => (
                <button key={m} onClick={() => setMode(m as any)}
                  className="w-full p-5 rounded-2xl border-2 border-slate-100 hover:border-[#18bfd6]/40 hover:bg-slate-50/50 transition-all group flex items-start gap-4 text-left cursor-pointer">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base group-hover:text-[#18bfd6] transition-colors">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">{desc}</p>
                  </div>
                </button>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setMode('activation')}
                  className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/15 text-[#fb7f00] font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 border border-amber-500/10 cursor-pointer">
                  <ShieldCheck size={16} /> Première connexion ? Activer mon école
                </button>
              </div>
            </div>
          )}

          {/* Parent */}
          {mode === 'parent' && (
            <form onSubmit={handleParentLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Suivi Parental</h2>
                <p className="text-xs text-gray-400 mt-1">Matricule fourni par l'établissement.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Matricule de l'élève</label>
                <input type="text" required value={studentId} onChange={e => setStudentId(e.target.value)}
                  placeholder="Ex: KHA-SCH1-4A2F" className={`${inputClass} font-mono uppercase`} />
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                Accéder au dossier <ArrowRight size={18} />
              </Button>
              <button type="button" onClick={() => setMode('selection')} className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-1">Retour</button>
            </form>
          )}

          {/* École */}
          {mode === 'school' && (
            <form onSubmit={handleSchoolLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Connexion Direction</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Email de la direction</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="direction@ecole.gn" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Mot de passe</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3.5 rounded-xl font-bold bg-primary shadow-lg shadow-primary/10">Se connecter</Button>
              <button type="button" onClick={() => setMode('selection')} className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-1">Retour</button>
            </form>
          )}

          {/* Enseignant */}
          {mode === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-extrabold text-blue-900">Espace Enseignant</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Email enseignant</label>
                  <input type="email" required value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="prof@ecole.gn" className={`${inputClass} border-indigo-100 bg-indigo-50/30`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Mot de passe</label>
                  <input type="password" required value={teacherPass} onChange={e => setTeacherPass(e.target.value)} placeholder="••••••••" className={`${inputClass} border-indigo-100 bg-indigo-50/30`} />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">Ouvrir la session</Button>
              <button type="button" onClick={() => setMode('selection')} className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-1">Retour</button>
            </form>
          )}

          {/* Activation étape 1 */}
          {mode === 'activation' && (
            <form onSubmit={verifyActivation} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-extrabold text-orange-950">Activer mon école</h2>
                <p className="text-xs text-orange-500 mt-1">Informations fournies par Kharandi.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Code d'activation</label>
                  <input type="text" required value={activCode} onChange={e => setActivCode(e.target.value)} placeholder="Ex: SCH-DF67"
                    className={`${inputClass} font-mono uppercase border-orange-100 bg-orange-50/10 font-bold text-orange-700`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Email officiel de l'école</label>
                  <input type="email" required value={activEmail} onChange={e => setActivEmail(e.target.value)} placeholder="direction@votre-ecole.com" className={`${inputClass} border-orange-100 bg-orange-50/10`} />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3.5 rounded-xl font-bold bg-orange-600 hover:bg-orange-700">Vérifier le code</Button>
              <button type="button" onClick={() => setMode('selection')} className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-2">Retour</button>
            </form>
          )}

          {/* Activation étape 2 — mot de passe */}
          {mode === 'setup_password' && matchedSchool && (
            <form onSubmit={finalizeSetup} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600"><Check size={24} /></div>
                <h2 className="text-xl font-extrabold text-green-950">Sécuriser votre compte</h2>
                <p className="text-sm font-black text-slate-800 mt-1">{matchedSchool.name}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Nouveau mot de passe</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 caractères" className={`${inputClass} border-green-100 bg-green-50/10`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Confirmer</label>
                  <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Ressaisir le mot de passe" className={`${inputClass} border-green-100 bg-green-50/10`} />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3.5 rounded-xl font-bold bg-green-600 hover:bg-green-700">Activer & Terminer</Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
