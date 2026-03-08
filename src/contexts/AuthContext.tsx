import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      ]);
      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        const master = profileRes.data.is_master_admin === true;
        setIsMasterAdmin(master);
      }
      if (roleRes.data) {
        setRole(roleRes.data.role);

        // Fetch staff permissions for admin users
        if (roleRes.data.role === "admin") {
          if (profileRes.data?.is_master_admin) {
            setPermissions(DEFAULT_PERMISSIONS); // master admin has all
          } else {
            const { data: perms } = await supabase
              .from("staff_permissions")
              .select("*")
              .eq("user_id", userId)
              .single();
            if (perms) {
              setPermissions({
                can_manage_users: perms.can_manage_users,
                can_manage_finances: perms.can_manage_finances,
                can_manage_commissions: perms.can_manage_commissions,
                can_manage_services: perms.can_manage_services,
                can_manage_settings: perms.can_manage_settings,
                can_manage_security: perms.can_manage_security,
                can_view_reports: perms.can_view_reports,
              });
            } else {
              // No permissions row = full access (legacy admins)
              setPermissions(DEFAULT_PERMISSIONS);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
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

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, isMasterAdmin, permissions, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
