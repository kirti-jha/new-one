import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Search, UserPlus, CheckCircle2, XCircle, Clock, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

export default function DashboardUsers() {
  const { session, role: myRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBusiness, setFormBusiness] = useState("");
  const [formRole, setFormRole] = useState<AppRole | "">("");
  const [formParent, setFormParent] = useState<string>("");

  // Potential parents based on selected role
  const [parentOptions, setParentOptions] = useState<{ id: string; name: string; role: string }[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (profiles && roles) {
      const roleMap = new Map(roles.map((r) => [r.user_id, r.role]));
      const merged: UserRow[] = profiles.map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) as AppRole | undefined,
      }));
      // Sort admin first, then by created_at desc
      merged.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setUsers(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update parent options when role changes
  useEffect(() => {
    if (!formRole) {
      setParentOptions([]);
      return;
    }
    // Parent should be one level above
    const parentRoleMap: Record<string, AppRole | null> = {
      super_distributor: null, // reports to admin (no parent profile needed)
      master_distributor: "super_distributor",
      distributor: "master_distributor",
      retailer: "distributor",
    };
    const parentRole = parentRoleMap[formRole];
    if (!parentRole) {
      setParentOptions([]);
      setFormParent("");
      return;
    }
    const options = users
      .filter((u) => u.role === parentRole && u.status === "active")
      .map((u) => ({ id: u.id, name: u.full_name || u.user_id, role: ROLE_LABELS[u.role!] }));
    setParentOptions(options);
  }, [formRole, users]);

  const handleCreate = async () => {
    if (!formEmail || !formPassword || !formName || !formRole) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (formPassword.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const res = await supabase.functions.invoke("create-user", {
        body: {
          email: formEmail.trim(),
          password: formPassword,
          full_name: formName.trim(),
          phone: formPhone.trim() || null,
          business_name: formBusiness.trim() || null,
          role: formRole,
          parent_id: formParent || null,
        },
      });

      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || "Failed to create user");
      }

      toast({ title: "User created!", description: `${formName} has been added as ${ROLE_LABELS[formRole as AppRole]}.` });
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormEmail("");
    setFormPassword("");
    setFormName("");
    setFormPhone("");
    setFormBusiness("");
    setFormRole("");
    setFormParent("");
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.business_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your distribution hierarchy.</p>
        </div>
        {myRole === "admin" && (
          <Button variant="hero" size="sm" onClick={() => setDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" /> Create User
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, phone, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
      </div>

      {/* Users Table */}
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
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Business</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">KYC</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const kyc = kycBadge[u.kyc_status] || kycBadge.pending;
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-5">
                        <div className="font-medium text-foreground">{u.full_name || "—"}</div>
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant="secondary" className="text-xs">
                          {u.role ? ROLE_LABELS[u.role] : "No Role"}
                        </Badge>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the distribution hierarchy. They can log in immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Rajesh Kumar" value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="user@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" placeholder="Min 6 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="9876543210" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input placeholder="Business / Shop name" value={formBusiness} onChange={(e) => setFormBusiness(e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={formRole} onValueChange={(v) => { setFormRole(v as AppRole); setFormParent(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {CREATABLE_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {parentOptions.length > 0 && (
              <div className="space-y-2">
                <Label>Parent (Upline)</Label>
                <Select value={formParent} onValueChange={setFormParent}>
                  <SelectTrigger><SelectValue placeholder="Select parent in hierarchy" /></SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formRole === "master_distributor" && "Select the Super Distributor this MD reports to."}
                  {formRole === "distributor" && "Select the Master Distributor this Distributor reports to."}
                  {formRole === "retailer" && "Select the Distributor this Retailer reports to."}
                </p>
              </div>
            )}

            {formRole === "super_distributor" && (
              <p className="text-xs text-muted-foreground">Super Distributors report directly to the Admin.</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                {creating ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
