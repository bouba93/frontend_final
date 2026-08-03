import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logout as djangoLogout } from '../services/auth';

interface UserProfile {
  uid: string; email: string; role: string; name: string;
  firstName?: string; lastName?: string; displayName?: string;
  phone?: string; interests: string[]; onboardingCompleted: boolean;
  isApproved?: boolean; isSuperadmin?: boolean;
  points?: number; subscriptionPlan?: string;
  activeAddons?: string[];
  city?: string;
  avatar?: string;
  bio?: string;
  schoolLevel?: string;
  serie?: string;
  shopName?: string;
  shopDescription?: string;
}

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isGuest: boolean;
  setGuestMode: (isGuest: boolean) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, userProfile: null, isAuthReady: false,
  isGuest: false, setGuestMode: () => {}, logout: () => {},
  refreshProfile: async () => {},
});

const mapProfile = (data: any): UserProfile => {
  if (!data) return {
    uid: 'unknown', email: '', role: 'student', name: 'Utilisateur',
    interests: [], onboardingCompleted: false, points: 0,
    subscriptionPlan: 'free', activeAddons: [],
  };
  const root = data?.data || data || {};
  const account = root.user || root.account || root.member || root;
  const p = root.profile || account.profile || {};

  const boolValue = (value: unknown) => (
    value === true || value === 1 || value === '1' ||
    String(value).toLowerCase() === 'true'
  );
  const isSuperadmin = boolValue(
    root.is_superadmin ?? root.isSuperadmin ??
    account.is_superadmin ?? account.isSuperadmin ??
    p.is_superadmin ?? p.isSuperadmin
  );

  let rawRole = String(
    root.role || account.role || p.role || (isSuperadmin ? 'ADMIN' : 'STUDENT')
  ).trim().toLowerCase();
  if (rawRole === 'tutor' || rawRole === 'teacher') rawRole = 'repetiteur';
  if (rawRole === 'vendor' || rawRole === 'seller') rawRole = 'seller';
  if (rawRole === 'superadmin' || rawRole === 'super_admin' || isSuperadmin) rawRole = 'admin';

  const phone =
    root.phone_e164 || root.phone ||
    account.phone_e164 || account.phone || account.username ||
    p.phone_e164 || p.phone || '';
  const firstName = p.first_name || account.first_name || root.first_name || '';
  const lastName = p.last_name || account.last_name || root.last_name || '';

  return {
    uid:   account.id || root.id || account.uid || root.uid || 'unknown',
    email: account.email || root.email || p.email || phone || '',
    phone,
    role:  rawRole,
    isSuperadmin,
    firstName,
    lastName,
    displayName: p.display_name || account.display_name || root.display_name || '',
    name: firstName
      ? `${firstName} ${lastName}`.trim()
      : (p.display_name || account.display_name || root.display_name || phone || 'Utilisateur'),
    interests:           p.interests || [],
    onboardingCompleted: (
      boolValue(p.onboarding_completed) ||
      boolValue(account.onboarding_completed) ||
      boolValue(root.onboarding_completed)
    ),
    isApproved:       account.is_active ?? root.is_active ?? true,
    points:           p.points ?? account.points ?? root.points ?? 0,
    subscriptionPlan: root.subscription_plan || account.subscription_plan || p.subscription_plan || 'free',
    activeAddons:     root.active_addons || account.active_addons || p.active_addons || [],
    city:             p.city || account.city || root.city || '',
    avatar:           p.avatar_url || p.avatar?.url || p.avatar || account.avatar_url || account.avatar?.url || account.avatar || root.avatar_url || root.avatar?.url || root.avatar || '',
    bio:              p.bio || account.bio || root.bio || '',
    schoolLevel:      p.school_level || p.niveau || account.school_level || account.niveau || root.school_level || root.niveau || '',
    serie:            p.serie || account.serie || root.serie || '',
    shopName:         p.shop_name || account.shop_name || root.shop_name || '',
    shopDescription:  p.shop_description || account.shop_description || root.shop_description || '',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGuest,     setIsGuest]     = useState(() => {
    localStorage.removeItem('isGuest');
    return false;
  });

  const setGuestMode = (guest: boolean) => {
    setIsGuest(false);
    localStorage.removeItem('isGuest');
  };

  const logout = () => {
    djangoLogout();
    setUserProfile(null); setIsGuest(false);
    localStorage.removeItem('isGuest');
    localStorage.removeItem('kharandi_cached_profile');
    window.location.href = '/login';
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      if (localStorage.getItem('isGuest') === 'true') {
        setUserProfile({
          uid: 'guest',
          email: 'guest@kharandi.com',
          role: 'student',
          name: 'Invité',
          interests: [],
          onboardingCompleted: true,
          isApproved: true,
          points: 100,
          subscriptionPlan: 'annuel',
          activeAddons: ['all']
        });
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
      return;
    }

    // ── Restaurer le profil mis en cache immédiatement (évite le flash login) ──
    const cached = localStorage.getItem('kharandi_cached_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUserProfile(parsed);
        setIsAuthReady(true);
      } catch {
        // cache corrompu → ignorer
      }
    }

    // ── Vérifier en arrière-plan ───────────────────────────────────────────────
    try {
      const data = await getMe();
      const profile = mapProfile(data);
      setUserProfile(profile);
      setIsAuthReady(true);
      localStorage.setItem('kharandi_cached_profile', JSON.stringify(profile));
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Token expiré → déconnecter
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('kharandi_cached_profile');
        setUserProfile(null);
        setIsAuthReady(true);
      } else {
        // Erreur réseau / Render endormi → garder le cache, rester connecté
        if (!cached) setUserProfile(null);
        setIsAuthReady(true);
      }
    }
  };

  useEffect(() => {
    const safety = setTimeout(() => setIsAuthReady(true), 5000);
    const onGuest   = () => setGuestMode(true);
    const onReload  = () => fetchProfile();
    window.addEventListener('auth:guest-login',    onGuest);
    window.addEventListener('auth:reload-profile', onReload);
    fetchProfile().finally(() => clearTimeout(safety));
    return () => {
      clearTimeout(safety);
      window.removeEventListener('auth:guest-login',    onGuest);
      window.removeEventListener('auth:reload-profile', onReload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user: userProfile, userProfile, isAuthReady, isGuest, setGuestMode, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
