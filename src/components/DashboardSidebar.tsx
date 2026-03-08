import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, Settings,
  Shield, Zap, ChevronLeft, Fingerprint, Send, Receipt, CreditCard, BarChart3,
  FileText, Smartphone, Banknote, Building2, CreditCard as CreditCardIcon,
  Plane, Package, ShieldCheck, Landmark, Radio, Box, QrCode, FileSpreadsheet,
  Settings2, ChevronDown, UserCog, User, KeyRound, Lock, Award, Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  minRole?: AppRole;
  allowedRoles?: AppRole[];
  section?: string;
  serviceKey?: string;
  permissionKey?: string; // staff permission required
  masterOnly?: boolean;
}

const ROLE_LEVEL: Record<AppRole, number> = {
  admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
};

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  aeps: Fingerprint, bbps: Receipt, dmt: Send, recharge: Smartphone,
  loan: Banknote, credit_card: CreditCard, cc_bill_pay: CreditCardIcon,
  payout: ArrowLeftRight, matm: Radio, bank_account: Building2, pan: FileText,
  ppi_wallet: Wallet, travel_booking: Plane, travel_package: Package,
  insurance: ShieldCheck, pg: QrCode, pos: Landmark, sound_box: Box,
};

const staticItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard", section: "Main" },
  { label: "Users", icon: Users, path: "/dashboard/users", minRole: "master_distributor", section: "Main", permissionKey: "can_manage_users" },
  { label: "Wallet & Funds", icon: Wallet, path: "/dashboard/wallet", section: "Main" },
  { label: "Fund Requests", icon: Banknote, path: "/dashboard/fund-requests", section: "Main" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/dashboard/transactions", section: "Main" },
];

const managementItems: NavItem[] = [
  { label: "Staff Mgmt", icon: UserCog, path: "/dashboard/staff-management", allowedRoles: ["admin"], section: "Management", masterOnly: true },
  { label: "Commissions", icon: BarChart3, path: "/dashboard/commissions", minRole: "distributor", section: "Management", permissionKey: "can_manage_commissions" },
  { label: "KYC", icon: FileText, path: "/dashboard/kyc", minRole: "distributor", section: "Management" },
  { label: "Reports", icon: FileSpreadsheet, path: "/dashboard/reports", section: "Management", permissionKey: "can_view_reports" },
  { label: "Service Mgmt", icon: Settings2, path: "/dashboard/service-management", allowedRoles: ["admin"], section: "Management", permissionKey: "can_manage_services" },
  { label: "Security", icon: Shield, path: "/dashboard/security", allowedRoles: ["admin"], section: "Management", permissionKey: "can_manage_security" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", allowedRoles: ["admin"], section: "Management", permissionKey: "can_manage_settings" },
];

interface Props {
  onNavigate?: () => void;
}

export default function DashboardSidebar({ onNavigate }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, isMasterAdmin, permissions } = useAuth();

  const [serviceItems, setServiceItems] = useState<NavItem[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isRetailer = role === "retailer";
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchServices = async () => {
      if (!user) return;
      const { data: services } = await supabase
        .from("service_config")
        .select("service_key, service_label, route_path, is_enabled")
        .eq("is_enabled", true)
        .order("service_label");
      const { data: overrides } = await supabase
        .from("user_service_overrides")
        .select("service_key, is_enabled")
        .eq("user_id", user.id);
      const disabledKeys = new Set(
        (overrides || []).filter((o: any) => !o.is_enabled).map((o: any) => o.service_key)
      );
      if (services) {
        setServiceItems(services
          .filter((s: any) => !disabledKeys.has(s.service_key))
          .map((s: any) => ({
            label: s.service_label, icon: ICON_MAP[s.service_key] || Box,
            path: s.route_path, section: "Services", serviceKey: s.service_key,
          })));
      }
    };
    fetchServices();
  }, [user]);

  useEffect(() => {
    if (serviceItems.some((s) => location.pathname === s.path)) setServicesOpen(true);
  }, [location.pathname, serviceItems]);

  const nonServiceItems = [...staticItems, ...managementItems].filter((item) => {
    if (!role) return false;
    // Master-only items
    if (item.masterOnly && !isMasterAdmin) return false;
    // Role check
    if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
    if (item.minRole && ROLE_LEVEL[role] > ROLE_LEVEL[item.minRole]) return false;
    // Staff permission check (only for admin non-master)
    if (isAdmin && !isMasterAdmin && item.permissionKey) {
      if (!(permissions as any)[item.permissionKey]) return false;
    }
    return true;
  });

  const sections: { name: string; items: NavItem[] }[] = [];
  let lastSection = "";
  for (const item of nonServiceItems) {
    if (item.section !== lastSection) {
      sections.push({ name: item.section || "", items: [] });
      lastSection = item.section || "";
    }
    sections[sections.length - 1].items.push(item);
  }

  const showServicesDropdown = isRetailer && serviceItems.length > 0;

  const renderNavLink = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <Link key={item.path} to={item.path} onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="w-4.5 h-4.5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn("h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300", collapsed ? "w-[68px]" : "w-[250px]")}>
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-heading text-lg font-bold text-foreground">Abheepay</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {sections.map((section) => (
          <div key={section.name}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{section.name}</div>
            )}
            {collapsed && section.name !== "Main" && <div className="mx-3 my-2 border-t border-sidebar-border" />}

            {/* For Main section: render Overview first, then Services dropdown, then rest */}
            {section.name === "Main" && showServicesDropdown ? (
              <>
                {/* Overview link first */}
                {section.items.filter(i => i.path === "/dashboard").map(item => renderNavLink(item))}

                {/* Services dropdown */}
                <div className="mt-1">
                  {!collapsed && <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Services</div>}
                  {collapsed && <div className="mx-3 my-2 border-t border-sidebar-border" />}
                  <button onClick={() => setServicesOpen(!servicesOpen)}
                    className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full",
                      servicesOpen ? "bg-sidebar-accent/30 text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? "Services" : undefined}
                  >
                    <Box className="w-4.5 h-4.5 shrink-0" />
                    {!collapsed && (
                      <><span className="truncate flex-1 text-left">Services</span><ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", servicesOpen && "rotate-180")} /></>
                    )}
                  </button>
                  {servicesOpen && !collapsed && (
                    <div className="ml-3 pl-3 border-l border-sidebar-border/50 space-y-0.5 mt-0.5">
                      {serviceItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link key={item.path} to={item.path} onClick={onNavigate}
                            className={cn("flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                              isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}>
                            <item.icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {servicesOpen && collapsed && (
                    <div className="space-y-0.5 mt-0.5">
                      {serviceItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link key={item.path} to={item.path} onClick={onNavigate}
                            className={cn("flex items-center justify-center px-3 py-2 rounded-lg transition-all",
                              isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                            title={item.label}>
                            <item.icon className="w-4 h-4 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remaining Main items (excluding Overview) */}
                {section.items.filter(i => i.path !== "/dashboard").map(item => renderNavLink(item))}
              </>
            ) : (
              section.items.map((item) => renderNavLink(item))
            )}
          </div>
        ))}
      </nav>

      <button onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors">
        <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
