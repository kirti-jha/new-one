import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, FileText, Settings,
  Shield, Zap, ChevronLeft, Fingerprint, Send, Receipt, CreditCard, BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  minRole?: AppRole; // minimum role level required (lower number = higher authority)
  allowedRoles?: AppRole[];
}

const ROLE_LEVEL: Record<AppRole, number> = {
  admin: 1,
  super_distributor: 2,
  master_distributor: 3,
  distributor: 4,
  retailer: 5,
};

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Users", icon: Users, path: "/dashboard/users", minRole: "master_distributor" },
  { label: "Wallet & Funds", icon: Wallet, path: "/dashboard/wallet" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/dashboard/transactions" },
  { label: "AEPS", icon: Fingerprint, path: "/dashboard/aeps" },
  { label: "DMT", icon: Send, path: "/dashboard/dmt" },
  { label: "BBPS", icon: Receipt, path: "/dashboard/bbps" },
  { label: "PAN Services", icon: CreditCard, path: "/dashboard/pan" },
  { label: "Commissions", icon: BarChart3, path: "/dashboard/commissions", minRole: "distributor" },
  { label: "KYC", icon: FileText, path: "/dashboard/kyc", minRole: "distributor" },
  { label: "Security", icon: Shield, path: "/dashboard/security", allowedRoles: ["admin"] },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", allowedRoles: ["admin"] },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();

  const visibleItems = navItems.filter((item) => {
    if (!role) return false;
    if (item.allowedRoles) return item.allowedRoles.includes(role);
    if (item.minRole) return ROLE_LEVEL[role] <= ROLE_LEVEL[item.minRole];
    return true;
  });

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-bold text-foreground">Abheepay</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
