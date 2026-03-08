import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, Settings,
  Shield, Zap, ChevronLeft, Fingerprint, Send, Receipt, CreditCard, BarChart3,
  FileText, Smartphone, Banknote, Building2, CreditCard as CreditCardIcon,
  Plane, Package, ShieldCheck, Landmark, Radio, Box, QrCode,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  minRole?: AppRole;
  allowedRoles?: AppRole[];
  section?: string;
}

const ROLE_LEVEL: Record<AppRole, number> = {
  admin: 1,
  super_distributor: 2,
  master_distributor: 3,
  distributor: 4,
  retailer: 5,
};

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard", section: "Main" },
  { label: "Users", icon: Users, path: "/dashboard/users", minRole: "master_distributor", section: "Main" },
  { label: "Wallet & Funds", icon: Wallet, path: "/dashboard/wallet", section: "Main" },
  { label: "Fund Requests", icon: Banknote, path: "/dashboard/fund-requests", section: "Main" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/dashboard/transactions", section: "Main" },
  { label: "AEPS", icon: Fingerprint, path: "/dashboard/aeps", section: "Services" },
  { label: "BBPS", icon: Receipt, path: "/dashboard/bbps", section: "Services" },
  { label: "DMT", icon: Send, path: "/dashboard/dmt", section: "Services" },
  { label: "Recharge", icon: Smartphone, path: "/dashboard/recharge", section: "Services" },
  { label: "Loan", icon: Banknote, path: "/dashboard/loan", section: "Services" },
  { label: "Credit Card", icon: CreditCard, path: "/dashboard/credit-card", section: "Services" },
  { label: "CC Bill Pay", icon: CreditCardIcon, path: "/dashboard/cc-bill-pay", section: "Services" },
  { label: "Payout", icon: ArrowLeftRight, path: "/dashboard/payout", section: "Services" },
  { label: "MATM", icon: Radio, path: "/dashboard/matm", section: "Services" },
  { label: "Bank Account", icon: Building2, path: "/dashboard/bank-account", section: "Services" },
  { label: "PAN Apply", icon: FileText, path: "/dashboard/pan", section: "Services" },
  { label: "PPI Wallet", icon: Wallet, path: "/dashboard/ppi-wallet", section: "Services" },
  { label: "Travel Booking", icon: Plane, path: "/dashboard/travel-booking", section: "Services" },
  { label: "Travel Package", icon: Package, path: "/dashboard/travel-package", section: "Services" },
  { label: "Insurance", icon: ShieldCheck, path: "/dashboard/insurance", section: "Services" },
  { label: "Payment Gateway", icon: QrCode, path: "/dashboard/pg", section: "Services" },
  { label: "POS Machine", icon: Landmark, path: "/dashboard/pos", section: "Services" },
  { label: "Sound Box", icon: Box, path: "/dashboard/sound-box", section: "Services" },
  { label: "Commissions", icon: BarChart3, path: "/dashboard/commissions", minRole: "distributor", section: "Management" },
  { label: "KYC", icon: FileText, path: "/dashboard/kyc", minRole: "distributor", section: "Management" },
  { label: "Security", icon: Shield, path: "/dashboard/security", allowedRoles: ["admin"], section: "Management" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", allowedRoles: ["admin"], section: "Management" },
];

interface Props {
  onNavigate?: () => void;
}

export default function DashboardSidebar({ onNavigate }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();

  const visibleItems = navItems.filter((item) => {
    if (!role) return false;
    if (item.allowedRoles) return item.allowedRoles.includes(role);
    if (item.minRole) return ROLE_LEVEL[role] <= ROLE_LEVEL[item.minRole];
    return true;
  });

  const sections: { name: string; items: typeof navItems }[] = [];
  let lastSection = "";
  for (const item of visibleItems) {
    if (item.section !== lastSection) {
      sections.push({ name: item.section || "", items: [] });
      lastSection = item.section || "";
    }
    sections[sections.length - 1].items.push(item);
  }

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

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {sections.map((section) => (
          <div key={section.name}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.name}
              </div>
            )}
            {collapsed && section.name !== "Main" && (
              <div className="mx-3 my-2 border-t border-sidebar-border" />
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
