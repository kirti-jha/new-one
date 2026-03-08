import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Search, UserPlus, CheckCircle2, XCircle, Clock,
  MoreVertical, Pencil, ShieldAlert, ShieldCheck, KeyRound, LogIn, Settings2, Upload,
  Ban, Store, UserCheck, UserX, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  business_name: string | null;
  kyc_status: string;
  status: string;
  parent_id: string | null;
  created_at: string;
  role?: AppRole;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_distributor: "Super Distributor",
  master_distributor: "Master Distributor",
  distributor: "Distributor",
  retailer: "Retailer",
};

const ROLE_LEVEL: Record<string, number> = {
  admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
};

const CREATABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: "super_distributor", label: "Super Distributor" },
  { value: "master_distributor", label: "Master Distributor" },
  { value: "distributor", label: "Distributor" },
  { value: "retailer", label: "Retailer" },
];

const kycBadge: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  verified: { icon: CheckCircle2, className: "text-success" },
  pending: { icon: Clock, className: "text-warning" },
  rejected: { icon: XCircle, className: "text-destructive" },
};

interface ServiceToggle {
  service_key: string;
  service_label: string;
  is_enabled: boolean;
  user_disabled: boolean;
}

export default function DashboardUsers() {
  const { user: currentUser, role: myRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = myRole === "admin";
  const canManage = myRole ? ROLE_LEVEL[myRole] < 5 : false;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processing, setProcessing] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [walletTotals, setWalletTotals] = useState<Record<string, number>>({});

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBusiness, setFormBusiness] = useState("");
  const [formRole, setFormRole] = useState<AppRole | "">("");
  const [formParent, setFormParent] = useState("");
  const [parentOptions, setParentOptions] = useState<{ id: string; name: string; role: string }[]>([]);
  // KYC fields
  const [formAadhaar, setFormAadhaar] = useState("");
  const [formPan, setFormPan] = useState("");
  const [formAadhaarFile, setFormAadhaarFile] = useState<File | null>(null);
  const [formPanFile, setFormPanFile] = useState<File | null>(null);
  // Bank fields
  const [formBankName, setFormBankName] = useState("");
  const [formBankAcct, setFormBankAcct] = useState("");
  const [formBankIfsc, setFormBankIfsc] = useState("");
  const [formBankHolder, setFormBankHolder] = useState("");

  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBusiness, setEditBusiness] = useState("");

  // Change role dialog
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState<AppRole | "">("");

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Service management dialog
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceUser, setServiceUser] = useState<UserRow | null>(null);
  const [serviceToggles, setServiceToggles] = useState<ServiceToggle[]>([]);
  const [togglingService, setTogglingService] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: wallets }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("wallets").select("user_id, balance"),
    ]);
    if (profiles && roles) {
      const roleMap = new Map(roles.map((r) => [r.user_id, r.role]));
      const merged: UserRow[] = profiles.map((p) => ({ ...p, role: roleMap.get(p.user_id) as AppRole | undefined }));
      merged.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setUsers(merged);

      // Compute wallet totals by role
      const balanceMap = new Map((wallets || []).map((w: any) => [w.user_id, parseFloat(w.balance)]));
      const totals: Record<string, number> = { total: 0, super_distributor: 0, master_distributor: 0, distributor: 0, retailer: 0 };
      merged.forEach((u) => {
        const bal = balanceMap.get(u.user_id) || 0;
        totals.total += bal;
        if (u.role && u.role !== "admin") totals[u.role] = (totals[u.role] || 0) + bal;
      });
      setWalletTotals(totals);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (!formRole) { setParentOptions([]); return; }
    const parentRoleMap: Record<string, AppRole | null> = {
      super_distributor: null,
      master_distributor: "super_distributor",
      distributor: "master_distributor",
      retailer: "distributor",
    };
    const parentRole = parentRoleMap[formRole];
    if (!parentRole) { setParentOptions([]); setFormParent(""); return; }
    setParentOptions(
      users.filter((u) => u.role === parentRole && u.status === "active")
        .map((u) => ({ id: u.id, name: u.full_name || u.user_id, role: ROLE_LABELS[u.role!] }))
    );
  }, [formRole, users]);

  const invokeManageUser = async (action: string, target_user_id: string, extra: Record<string, any> = {}) => {
    setProcessing(true);
    try {
      const res = await supabase.functions.invoke("manage-user", {
        body: { action, target_user_id, ...extra },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast({ title: "Success", description: res.data?.message || "Action completed." });
      fetchUsers();
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const uploadDocImage = async (userId: string, file: File, docType: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${docType}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("user-documents").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    return path;
  };

  const handleCreate = async () => {
    if (!formEmail || !formPassword || !formName || !formRole) {
      toast({ title: "Missing fields", description: "Fill all required fields.", variant: "destructive" });
      return;
    }
    if (formPassword.length < 6) {
      toast({ title: "Weak password", description: "Min 6 characters.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      // First create user to get their ID
      const res = await supabase.functions.invoke("create-user", {
        body: {
          email: formEmail.trim(), password: formPassword, full_name: formName.trim(),
          phone: formPhone.trim() || null, business_name: formBusiness.trim() || null,
          role: formRole, parent_id: formParent || null,
          aadhaar_number: formAadhaar.trim() || null,
          pan_number: formPan.trim().toUpperCase() || null,
          bank_name: formBankName.trim() || null,
          bank_account_number: formBankAcct.trim() || null,
          bank_ifsc: formBankIfsc.trim().toUpperCase() || null,
          bank_account_holder: formBankHolder.trim() || null,
        },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);

      const newUserId = res.data.user.id;

      // Upload images if provided (using admin's session — RLS allows admins)
      let aadhaarPath: string | null = null;
      let panPath: string | null = null;

      if (formAadhaarFile) {
        aadhaarPath = await uploadDocImage(newUserId, formAadhaarFile, "aadhaar");
      }
      if (formPanFile) {
        panPath = await uploadDocImage(newUserId, formPanFile, "pan");
      }

      // Update profile with image paths if uploaded
      if (aadhaarPath || panPath) {
        const updateData: Record<string, string> = {};
        if (aadhaarPath) updateData.aadhaar_image_path = aadhaarPath;
        if (panPath) updateData.pan_image_path = panPath;
        await supabase.from("profiles").update(updateData).eq("user_id", newUserId);
      }

      toast({ title: "User created!", description: `${formName} added as ${ROLE_LABELS[formRole as AppRole]}.` });
      setCreateOpen(false);
      resetCreateForm();
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const resetCreateForm = () => {
    setFormEmail(""); setFormPassword(""); setFormName(""); setFormPhone(""); setFormBusiness("");
    setFormRole(""); setFormParent(""); setFormAadhaar(""); setFormPan("");
    setFormAadhaarFile(null); setFormPanFile(null);
    setFormBankName(""); setFormBankAcct(""); setFormBankIfsc(""); setFormBankHolder("");
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    const ok = await invokeManageUser("edit_profile", editUser.user_id, {
      full_name: editName, phone: editPhone, business_name: editBusiness,
    });
    if (ok) setEditOpen(false);
  };

  const handleRoleSave = async () => {
    if (!roleUser || !newRole) return;
    const ok = await invokeManageUser("change_role", roleUser.user_id, { new_role: newRole });
    if (ok) setRoleOpen(false);
  };

  const handleResetSave = async () => {
    if (!resetUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast({ title: "Weak password", description: "Min 6 characters.", variant: "destructive" });
      return;
    }
    const ok = await invokeManageUser("reset_password", resetUser.user_id, { new_password: newPassword });
    if (ok) { setResetOpen(false); setNewPassword(""); }
  };

  const handleToggleBlock = async (u: UserRow) => {
    const action = u.status === "active" ? "block" : "unblock";
    await invokeManageUser(action, u.user_id);
  };

  const handleImpersonate = async (u: UserRow) => {
    setImpersonating(true);
    try {
      const res = await supabase.functions.invoke("impersonate-user", {
        body: { target_user_id: u.user_id },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);

      const { access_token, refresh_token } = res.data;
      if (!access_token || !refresh_token) throw new Error("Failed to get session tokens");

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        localStorage.setItem("impersonation_return_token", currentSession.access_token);
        localStorage.setItem("impersonation_return_refresh", currentSession.refresh_token!);
      }

      await supabase.auth.setSession({ access_token, refresh_token });
      toast({ title: `Logged in as ${u.full_name}`, description: "You are now viewing as this user." });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Impersonation failed", description: err.message, variant: "destructive" });
    } finally {
      setImpersonating(false);
    }
  };

  const openServiceManagement = async (u: UserRow) => {
    setServiceUser(u);
    const [{ data: services }, { data: overrides }] = await Promise.all([
      supabase.from("service_config").select("service_key, service_label, is_enabled").order("service_label"),
      supabase.from("user_service_overrides").select("service_key, is_enabled").eq("user_id", u.user_id),
    ]);

    const overrideMap = new Map((overrides || []).map((o: any) => [o.service_key, o.is_enabled]));
    setServiceToggles(
      (services || []).map((s: any) => ({
        service_key: s.service_key,
        service_label: s.service_label,
        is_enabled: s.is_enabled,
        user_disabled: overrideMap.has(s.service_key) && !overrideMap.get(s.service_key),
      }))
    );
    setServiceOpen(true);
  };

  const handleServiceToggle = async (serviceKey: string, currentlyDisabled: boolean) => {
    if (!serviceUser) return;
    setTogglingService(serviceKey);
    try {
      const ok = await invokeManageUser("toggle_service", serviceUser.user_id, {
        service_key: serviceKey,
        is_enabled: currentlyDisabled,
      });
      if (ok) {
        setServiceToggles((prev) =>
          prev.map((s) => s.service_key === serviceKey ? { ...s, user_disabled: !currentlyDisabled } : s)
        );
      }
    } finally {
      setTogglingService(null);
    }
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditName(u.full_name);
    setEditPhone(u.phone || "");
    setEditBusiness(u.business_name || "");
    setEditOpen(true);
  };

  const openRoleChange = (u: UserRow) => {
    setRoleUser(u);
    setNewRole(u.role || "");
    setRoleOpen(true);
  };

  const openReset = (u: UserRow) => {
    setResetUser(u);
    setNewPassword("");
    setResetOpen(true);
  };

  const filtered = users.filter((u) => {
    const q = searchInput.toLowerCase();
    const matchesSearch = !q || u.full_name?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) ||
      u.business_name?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const canManageUser = (u: UserRow) => {
    if (!myRole || !u.role) return false;
    if (u.user_id === currentUser?.id) return false;
    if (isAdmin) return true;
    return ROLE_LEVEL[myRole] < ROLE_LEVEL[u.role];
  };

  const formatINR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const totalUsers = users.filter((u) => u.role !== "admin").length;
  const sdCount = users.filter((u) => u.role === "super_distributor").length;
  const mdCount = users.filter((u) => u.role === "master_distributor").length;
  const distributorCount = users.filter((u) => u.role === "distributor").length;
  const retailerCount = users.filter((u) => u.role === "retailer").length;
  const activeCount = users.filter((u) => u.status === "active" && u.role !== "admin").length;
  const deactivatedCount = users.filter((u) => u.status !== "active" && u.role !== "admin").length;

  const handleCardClick = (roleFilter: string) => {
    setFilterRole(filterRole === roleFilter ? "all" : roleFilter);
  };

  const statsCards = [
    { label: "Total Users", value: totalUsers, sub: formatINR(walletTotals.total || 0), icon: Users, color: "text-primary bg-primary/10", filterKey: "all" },
    { label: "Super Distributors", value: sdCount, sub: formatINR(walletTotals.super_distributor || 0), icon: ShieldCheck, color: "text-chart-1 bg-chart-1/10", filterKey: "super_distributor" },
    { label: "Master Distributors", value: mdCount, sub: formatINR(walletTotals.master_distributor || 0), icon: ShieldAlert, color: "text-chart-3 bg-chart-3/10", filterKey: "master_distributor" },
    { label: "Distributors", value: distributorCount, sub: formatINR(walletTotals.distributor || 0), icon: UserPlus, color: "text-destructive bg-destructive/10", filterKey: "distributor" },
    { label: "Retailers", value: retailerCount, sub: formatINR(walletTotals.retailer || 0), icon: Store, color: "text-chart-2 bg-chart-2/10", filterKey: "retailer" },
    { label: "Active", value: activeCount, sub: null, icon: UserCheck, color: "text-success bg-success/10", filterKey: "_active" },
    { label: "Deactivated", value: deactivatedCount, sub: null, icon: UserX, color: "text-warning bg-warning/10", filterKey: "_deactivated" },
  ];

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-primary p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground">User Management</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">Manage all registered users, distributors & retailers</p>
          </div>
        </div>
        {(isAdmin || canManage) && (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
            <UserPlus className="w-4 h-4 mr-1.5" /> Add New User
          </Button>
        )}
      </div>

      {localStorage.getItem("impersonation_return_token") && (
        <div className="p-3 rounded-xl border border-warning/50 bg-warning/10 flex items-center justify-between">
          <span className="text-sm text-foreground font-medium">⚠️ You are viewing as an impersonated user.</span>
          <Button variant="outline" size="sm" onClick={async () => {
            const token = localStorage.getItem("impersonation_return_token");
            const refresh = localStorage.getItem("impersonation_return_refresh");
            if (token && refresh) {
              await supabase.auth.setSession({ access_token: token, refresh_token: refresh });
              localStorage.removeItem("impersonation_return_token");
              localStorage.removeItem("impersonation_return_refresh");
              window.location.href = "/dashboard/users";
            }
          }}>
            Return to Your Account
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-gradient-card border border-border p-4 text-center">
            <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">{loading ? "..." : stat.value}</p>
            {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{loading ? "..." : stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl bg-gradient-card border border-border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto_auto] gap-3 items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Search</span>
            <Input
              placeholder="Search by name, phone, business..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</span>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_distributor">Super Distributor</SelectItem>
                <SelectItem value="master_distributor">Master Distributor</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="retailer">Retailer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} className="bg-gradient-primary text-primary-foreground font-semibold">
            <Search className="w-4 h-4 mr-1.5" /> Search
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <XCircle className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">All Users</h2>
          <span className="text-xs text-muted-foreground ml-2">({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Role", "Phone", "Business", "KYC", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider ${i === 2 ? "hidden sm:table-cell" : ""} ${i === 3 ? "hidden md:table-cell" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const kyc = kycBadge[u.kyc_status] || kycBadge.pending;
                  const isSelf = u.user_id === currentUser?.id;
                  const canManageThis = canManageUser(u);
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-5 font-medium text-foreground">{u.full_name || "—"}</td>
                      <td className="py-3 px-5">
                        <Badge variant="secondary" className="text-xs">{u.role ? ROLE_LABELS[u.role] : "No Role"}</Badge>
                      </td>
                      <td className="py-3 px-5 text-muted-foreground hidden sm:table-cell">{u.phone || "—"}</td>
                      <td className="py-3 px-5 text-muted-foreground hidden md:table-cell">{u.business_name || "—"}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-1.5">
                          <kyc.icon className={`w-4 h-4 ${kyc.className}`} />
                          <span className="text-xs capitalize">{u.kyc_status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "active" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">You</span>
                        ) : canManageThis ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleImpersonate(u)} disabled={impersonating}>
                                <LogIn className="w-4 h-4 mr-2" /> Login as User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEdit(u)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openServiceManagement(u)}>
                                <Settings2 className="w-4 h-4 mr-2" /> Manage Services
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem onClick={() => openRoleChange(u)}>
                                    <ShieldAlert className="w-4 h-4 mr-2" /> Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openReset(u)}>
                                    <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleBlock(u)}
                                className={u.status === "active" ? "text-destructive" : "text-success"}
                              >
                                {u.status === "active" ? (
                                  <><XCircle className="w-4 h-4 mr-2" /> Block User</>
                                ) : (
                                  <><ShieldCheck className="w-4 h-4 mr-2" /> Unblock User</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user with KYC documents and bank details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Rajesh Kumar" value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="user@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} maxLength={255} /></div>
                <div className="space-y-2"><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="9876543210" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} maxLength={15} /></div>
                <div className="space-y-2"><Label>Business Name</Label><Input placeholder="Business / Shop name" value={formBusiness} onChange={(e) => setFormBusiness(e.target.value)} maxLength={200} /></div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={formRole} onValueChange={(v) => { setFormRole(v as AppRole); setFormParent(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{CREATABLE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {parentOptions.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Parent (Upline)</Label>
                  <Select value={formParent} onValueChange={setFormParent}>
                    <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent>{parentOptions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.role})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {formRole === "super_distributor" && <p className="text-xs text-muted-foreground mt-2">Reports directly to Admin.</p>}
            </div>

            <Separator />

            {/* KYC Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">KYC Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Aadhaar Number</Label>
                  <Input placeholder="XXXX XXXX XXXX" value={formAadhaar} onChange={(e) => setFormAadhaar(e.target.value.replace(/[^0-9\s]/g, ""))} maxLength={14} />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input placeholder="ABCDE1234F" value={formPan} onChange={(e) => setFormPan(e.target.value.toUpperCase())} maxLength={10} />
                </div>
                <div className="space-y-2">
                  <Label>Aadhaar Image</Label>
                  <input ref={aadhaarInputRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={(e) => setFormAadhaarFile(e.target.files?.[0] || null)} />
                  <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => aadhaarInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> {formAadhaarFile ? formAadhaarFile.name : "Upload Aadhaar"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>PAN Image</Label>
                  <input ref={panInputRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={(e) => setFormPanFile(e.target.files?.[0] || null)} />
                  <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => panInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> {formPanFile ? formPanFile.name : "Upload PAN"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bank Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Bank Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Bank Name</Label><Input placeholder="State Bank of India" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Account Holder Name</Label><Input placeholder="Account holder name" value={formBankHolder} onChange={(e) => setFormBankHolder(e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input placeholder="Account number" value={formBankAcct} onChange={(e) => setFormBankAcct(e.target.value)} maxLength={20} /></div>
                <div className="space-y-2"><Label>IFSC Code</Label><Input placeholder="SBIN0001234" value={formBankIfsc} onChange={(e) => setFormBankIfsc(e.target.value.toUpperCase())} maxLength={11} /></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={processing}><UserPlus className="w-4 h-4 mr-1.5" />{processing ? "Creating..." : "Create User"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update {editUser?.full_name}'s profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Full Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} maxLength={15} /></div>
            <div className="space-y-2"><Label>Business Name</Label><Input value={editBusiness} onChange={(e) => setEditBusiness(e.target.value)} maxLength={200} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={processing}>{processing ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Change {roleUser?.full_name}'s role. Current: <Badge variant="secondary" className="text-xs ml-1">{roleUser?.role ? ROLE_LABELS[roleUser.role] : "—"}</Badge></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger><SelectValue placeholder="Select new role" /></SelectTrigger>
                <SelectContent>{CREATABLE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-xs text-destructive">⚠️ Changing roles may affect the user's hierarchy and fund transfer permissions.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRoleOpen(false)}>Cancel</Button>
              <Button onClick={handleRoleSave} disabled={processing}>{processing ? "Saving..." : "Change Role"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {resetUser?.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
              <Button onClick={handleResetSave} disabled={processing}><KeyRound className="w-4 h-4 mr-1.5" />{processing ? "Resetting..." : "Reset Password"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Services Dialog */}
      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Services</DialogTitle>
            <DialogDescription>Enable or disable individual services for {serviceUser?.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto">
            {serviceToggles.map((s) => (
              <div key={s.service_key}
                className={`flex items-center justify-between p-3 rounded-lg border ${!s.is_enabled ? "opacity-50" : s.user_disabled ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.service_label}</p>
                  {!s.is_enabled && <p className="text-[10px] text-destructive">Globally disabled by admin</p>}
                </div>
                <Switch
                  checked={s.is_enabled && !s.user_disabled}
                  disabled={!s.is_enabled || togglingService === s.service_key}
                  onCheckedChange={() => handleServiceToggle(s.service_key, s.user_disabled)}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
