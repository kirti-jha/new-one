import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AUTH_SESSION_EVENT, apiFetch, clearAuthSession, getAuthToken, getStoredUser, type AppAuthUser } from "@/services/api";
import type { AppRole } from "@/types/auth";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  business_name: string | null;
  kyc_status: string;
  status: string;
  parent_id: string | null;
  is_master_admin: boolean;
}

export interface StaffPermissions {
  can_manage_users: boolean;
  can_manage_finances: boolean;
  can_manage_commissions: boolean;
  can_manage_services: boolean;
  can_manage_settings: boolean;
  can_manage_security: boolean;
  can_view_reports: boolean;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  can_manage_users: true,
  can_manage_finances: true,
  can_manage_commissions: true,
  can_manage_services: true,
  can_manage_settings: true,
  can_manage_security: true,
  can_view_reports: true,
};

type AppSession = { access_token: string } | null;

interface AuthContextType {
  session: AppSession;
  user: AppAuthUser | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isMasterAdmin: boolean;
  permissions: StaffPermissions;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  walletBalance: number;
  eWalletBalance: number;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  isMasterAdmin: false,
  permissions: DEFAULT_PERMISSIONS,
  signOut: async () => {},
  refreshProfile: async () => {},
  walletBalance: 0,
  eWalletBalance: 0,
});

export const useAuth = () => useContext(AuthContext);

function normalizeProfile(p: any): Profile | null {
  if (!p) return null;
  // Backend (Prisma) returns camelCase; UI expects snake_case.
  return {
    id: p.id,
    user_id: p.user_id ?? p.userId,
    full_name: p.full_name ?? p.fullName ?? "",
    phone: p.phone ?? null,
    business_name: p.business_name ?? p.businessName ?? null,
    kyc_status: p.kyc_status ?? p.kycStatus ?? "pending",
    status: p.status ?? "active",
    parent_id: p.parent_id ?? p.parentId ?? null,
    is_master_admin: p.is_master_admin ?? p.isMasterAdmin ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession>(null);
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS);
  const [walletBalance, setWalletBalance] = useState(0);
  const [eWalletBalance, setEWalletBalance] = useState(0);

  const fetchUserData = async () => {
    try {
      const data = await apiFetch("/auth/me");
      if (data.user) setUser(data.user as AppAuthUser);
      if (data.profile) {
        const normalized = normalizeProfile(data.profile);
        setProfile(normalized);
        setIsMasterAdmin(normalized?.is_master_admin === true);
      }
      setWalletBalance(data.walletBalance || 0);
      setEWalletBalance(data.eWalletBalance || 0);
      setRole((data.role || null) as AppRole | null);
      setPermissions(DEFAULT_PERMISSIONS);
    } catch (err) {
      clearAuthSession();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setIsMasterAdmin(false);
      setPermissions(DEFAULT_PERMISSIONS);
      setWalletBalance(0);
      setEWalletBalance(0);
      throw err;
    }
  };

  useEffect(() => {
    const loadSession = () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();
      if (!token || !storedUser) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setIsMasterAdmin(false);
        setPermissions(DEFAULT_PERMISSIONS);
        setWalletBalance(0);
        setEWalletBalance(0);
        setLoading(false);
        return;
      }

      setSession({ access_token: token });
      setUser(storedUser);
      fetchUserData().finally(() => setLoading(false));
    };

    window.addEventListener(AUTH_SESSION_EVENT, loadSession);
    loadSession();
    return () => window.removeEventListener(AUTH_SESSION_EVENT, loadSession);
  }, []);

  const signOut = async () => {
    clearAuthSession();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setIsMasterAdmin(false);
    setPermissions(DEFAULT_PERMISSIONS);
    setWalletBalance(0);
    setEWalletBalance(0);
  };

  const refreshProfile = async () => {
    if (!getAuthToken()) return;
    await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        isMasterAdmin,
        permissions,
        signOut,
        refreshProfile,
        walletBalance,
        eWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
