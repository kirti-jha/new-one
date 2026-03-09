import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { apiFetch } from "@/services/api";

type AppRole = Database["public"]["Enums"]["app_role"];

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

interface AuthContextType {
  session: Session | null;
  user: User | null;
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
  signOut: async () => { },
  refreshProfile: async () => { },
  walletBalance: 0,
  eWalletBalance: 0,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS);
  const [walletBalance, setWalletBalance] = useState(0);
  const [eWalletBalance, setEWalletBalance] = useState(0);

  const fetchUserData = async (userId: string) => {
    try {
      const data = await apiFetch("/auth/me");

      if (data.profile) {
        setProfile(data.profile as Profile);
        setIsMasterAdmin(data.profile.is_master_admin === true);
        setWalletBalance(data.walletBalance || 0);
        setEWalletBalance(data.eWalletBalance || 0);
      }

      if (data.role) {
        setRole(data.role as AppRole);

        // Fetch staff permissions for admin users
        if (data.role === "admin") {
          if (data.profile?.is_master_admin) {
            setPermissions(DEFAULT_PERMISSIONS);
          } else {
            try {
              // The backend could provide this in /auth/me too, but let's keep it separate if needed
              // for now we'll fetch it from a dedicated endpoint if we add one, 
              // or just use the default if not provided.
              // For now, let's assume the backend provides it or we default it.
              setPermissions(DEFAULT_PERMISSIONS);
            } catch (err) {
              setPermissions(DEFAULT_PERMISSIONS);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user data from backend:", err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setRole(null);
          setIsMasterAdmin(false);
          setPermissions(DEFAULT_PERMISSIONS);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setIsMasterAdmin(false);
    setPermissions(DEFAULT_PERMISSIONS);
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, isMasterAdmin, permissions, signOut, refreshProfile, walletBalance, eWalletBalance }}>
      {children}
    </AuthContext.Provider>
  );
}
