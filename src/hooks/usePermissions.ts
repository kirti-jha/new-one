import { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export interface StaffPermissions {
  id: string;
  // Section Masters
  can_manage_users: boolean;
  can_manage_finance: boolean;
  can_manage_commissions: boolean;
  can_manage_services: boolean;
  can_manage_support: boolean;
  // Users
  can_create_users: boolean;
  can_edit_users: boolean;
  can_block_users: boolean;
  can_delete_users: boolean;
  can_manage_user_services: boolean;
  can_change_user_roles: boolean;
  can_reset_user_passwords: boolean;
  can_view_user_docs: boolean;
  // Finance
  can_approve_fund_requests: boolean;
  can_reject_fund_requests: boolean;
  can_manage_bank_accounts: boolean;
  can_view_transactions: boolean;
  can_perform_wallet_transfer: boolean;
  // Others
  can_manage_global_services: boolean;
  can_manage_settings: boolean;
  can_manage_security: boolean;
  can_reply_support_tickets: boolean;
  can_view_reports: boolean;
}

export function usePermissions() {
  const { user, role } = useAuth();
  const [permissions, setPermissions] = useState<StaffPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = role === 'admin';

  useEffect(() => {
    async function fetchPermissions() {
      if (!user || role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        // We fetch the current user's permissions from a special endpoint or from the admins list
        // For simplicity, we'll assume there's a /me/permissions endpoint or we can get it from /staff/admins
        const data = await apiFetch(`/staff/admins`);
        if (data && Array.isArray(data)) {
          const myEntry = data.find((a: any) => a.user_id === user.id);
          if (myEntry) {
            setPermissions(myEntry.permissions);
          }
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [user, role]);

  const hasPermission = (perm: keyof StaffPermissions) => {
    // Master admins always have all permissions
    if (user?.isMasterAdmin) return true;
    if (!permissions) return false;
    return !!permissions[perm];
  };

  return { permissions, loading, hasPermission, isAdmin };
}
