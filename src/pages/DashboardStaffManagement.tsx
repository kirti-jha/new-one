import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserPlus, Users, ShieldCheck, Shield, Pencil, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/services/api";

interface StaffAdmin {
  user_id: string;
  full_name: string;
  is_master_admin: boolean;
  permissions: {
    id?: string;
    can_manage_users: boolean;
    can_manage_finances: boolean;
    can_manage_commissions: boolean;
    can_manage_services: boolean;
    can_manage_settings: boolean;
    can_manage_security: boolean;
    can_view_reports: boolean;
  } | null;
}

const PERMISSION_LABELS: { key: string; label: string; desc: string; critical?: boolean }[] = [
  { key: "can_manage_users", label: "User Management", desc: "Create, edit, block users and change roles" },
  { key: "can_manage_finances", label: "Financial Controls", desc: "Approve fund requests, wallet transfers, manage bank accounts" },
  { key: "can_manage_commissions", label: "Commission Management", desc: "Edit commission slabs and charges" },
  { key: "can_manage_services", label: "Service Management", desc: "Enable/disable services globally" },
  { key: "can_view_reports", label: "Reports Access", desc: "View and download all reports" },
  { key: "can_manage_settings", label: "Platform Settings", desc: "Edit platform info, branding, API keys", critical: true },
  { key: "can_manage_security", label: "Security Settings", desc: "Security configurations and audit logs", critical: true },
];

export default function DashboardStaffManagement() {
  const { isMasterAdmin } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<StaffAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPerms, setFormPerms] = useState<Record<string, boolean>>({
    can_manage_users: true,
    can_manage_finances: true,
    can_manage_commissions: true,
    can_manage_services: true,
    can_manage_settings: false,
    can_manage_security: false,
    can_view_reports: true,
  });
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<StaffAdmin | null>(null);
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/staff/admins");
      setAdmins((data || []) as StaffAdmin[]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateStaff = async () => {
    if (!formEmail || !formPassword || !formName) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }
    if (formPassword.length < 6) {
      toast({ title: "Password min 6 characters", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await apiFetch("/staff/admins", {
        method: "POST",
        body: JSON.stringify({
          email: formEmail.trim(),
          password: formPassword,
          full_name: formName.trim(),
          phone: formPhone.trim() || null,
          permissions: formPerms,
        }),
      });

      toast({ title: "Staff admin created", description: `${formName} added as staff admin.` });
      setCreateOpen(false);
      setFormEmail("");
      setFormPassword("");
      setFormName("");
      setFormPhone("");
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openEditPerms = (admin: StaffAdmin) => {
    setEditAdmin(admin);
    setEditPerms(
      admin.permissions
        ? {
            can_manage_users: admin.permissions.can_manage_users,
            can_manage_finances: admin.permissions.can_manage_finances,
            can_manage_commissions: admin.permissions.can_manage_commissions,
            can_manage_services: admin.permissions.can_manage_services,
            can_manage_settings: admin.permissions.can_manage_settings,
            can_manage_security: admin.permissions.can_manage_security,
            can_view_reports: admin.permissions.can_view_reports,
          }
        : {
            can_manage_users: true,
            can_manage_finances: true,
            can_manage_commissions: true,
            can_manage_services: true,
            can_manage_settings: false,
            can_manage_security: false,
            can_view_reports: true,
          }
    );
    setEditOpen(true);
  };

  const handleSavePerms = async () => {
    if (!editAdmin) return;
    setSaving(true);
    try {
      await apiFetch(`/staff/permissions/${editAdmin.user_id}`, {
        method: "PATCH",
        body: JSON.stringify(editPerms),
      });
      toast({ title: "Permissions updated" });
      setEditOpen(false);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isMasterAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-lg font-heading font-semibold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-1">Only the Master Admin can manage staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create sub-admins and control what they can access.</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Add Staff Admin
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No admin accounts found.</div>
        ) : (
          admins.map((admin) => (
            <Card key={admin.user_id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {admin.is_master_admin ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-foreground">{admin.full_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {admin.is_master_admin ? (
                          <Badge className="bg-primary/10 text-primary text-xs">Master Admin</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Staff Admin</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!admin.is_master_admin && (
                    <Button variant="outline" size="sm" onClick={() => openEditPerms(admin)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit Permissions
                    </Button>
                  )}
                </div>

                {admin.is_master_admin ? (
                  <p className="text-xs text-muted-foreground">Full access to all features. Cannot be restricted.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {PERMISSION_LABELS.map((p) => {
                      const enabled = admin.permissions ? (admin.permissions as any)[p.key] : true;
                      return (
                        <span
                          key={p.key}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            enabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {enabled ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                          {p.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Staff Admin</DialogTitle>
            <DialogDescription>Create a new admin account with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Staff name" value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={100} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="staff@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} maxLength={255} /></div>
              <div className="space-y-2"><Label>Password *</Label><Input type="password" placeholder="Min 6 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="9876543210" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} maxLength={15} /></div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold">Permissions</Label>
              {PERMISSION_LABELS.map((p) => (
                <div key={p.key} className={`flex items-center justify-between p-3 rounded-lg border ${p.critical ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                    {p.critical && <div className="text-[10px] text-destructive font-medium mt-0.5">Critical permission</div>}
                  </div>
                  <Switch checked={formPerms[p.key] || false} onCheckedChange={(v) => setFormPerms({ ...formPerms, [p.key]: v })} />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateStaff} disabled={creating}><UserPlus className="w-4 h-4 mr-1.5" />{creating ? "Creating..." : "Create Staff Admin"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>Update access for {editAdmin?.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {PERMISSION_LABELS.map((p) => (
              <div key={p.key} className={`flex items-center justify-between p-3 rounded-lg border ${p.critical ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                <div>
                  <div className="text-sm font-medium text-foreground">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                  {p.critical && <div className="text-[10px] text-destructive font-medium mt-0.5">Critical</div>}
                </div>
                <Switch checked={editPerms[p.key] || false} onCheckedChange={(v) => setEditPerms({ ...editPerms, [p.key]: v })} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePerms} disabled={saving}>{saving ? "Saving..." : "Save Permissions"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
