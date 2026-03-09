import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, IndianRupee, TrendingUp, Users, Pencil, Save, X, RefreshCw, Download, Plus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import { apiFetch } from "@/services/api";

type AppRole = "admin" | "super_distributor" | "master_distributor" | "distributor" | "retailer";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_distributor: "Super Dist.",
  master_distributor: "Master Dist.",
  distributor: "Distributor",
  retailer: "Retailer",
};

const ROLE_LEVEL: Record<string, number> = {
  admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
};

const ALL_ROLES: AppRole[] = ["admin", "super_distributor", "master_distributor", "distributor", "retailer"];

interface Slab {
  id: string;
  service_key: string;
  service_label: string;
  role: AppRole;
  commission_type: string;
  commission_value: number;
  is_active: boolean;
}

interface CommissionLog {
  id: string;
  user_id: string;
  service_key: string;
  transaction_amount: number;
  commission_amount: number;
  commission_type: string;
  commission_value: number;
  created_at: string;
}

interface UserOverride {
  id: string;
  set_by: string;
  target_user_id: string;
  service_key: string;
  service_label: string;
  commission_type: string;
  commission_value: number;
  charge_type: string;
  charge_value: number;
  is_active: boolean;
  target_name?: string;
}

interface DownlineUser {
  user_id: string;
  full_name: string;
  role?: AppRole;
}

export default function CommissionsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const canManageDownline = role ? ROLE_LEVEL[role] < 5 : false; // everyone except retailer

  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [logs, setLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editType, setEditType] = useState("flat");

  // User overrides state
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);
  const [services, setServices] = useState<{ key: string; label: string }[]>([]);

  // Add/Edit override dialog
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [editOverride, setEditOverride] = useState<UserOverride | null>(null);
  const [oTargetUser, setOTargetUser] = useState("");
  const [oServiceKey, setOServiceKey] = useState("");
  const [oCommType, setOCommType] = useState("flat");
  const [oCommValue, setOCommValue] = useState("");
  const [oChargeType, setOChargeType] = useState("flat");
  const [oChargeValue, setOChargeValue] = useState("");
  const [oSaving, setOSaving] = useState(false);

  // Edit override inline
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [eoCommType, setEoCommType] = useState("flat");
  const [eoCommValue, setEoCommValue] = useState("");
  const [eoChargeType, setEoChargeType] = useState("flat");
  const [eoChargeValue, setEoChargeValue] = useState("");

  const fetchSlabs = useCallback(async () => {
    try {
      const data = await apiFetch("/commission/slabs");
      if (data) {
        setSlabs(data.map((s: any) => ({
          ...s,
          service_key: s.serviceKey,
          service_label: s.serviceLabel,
          commission_type: s.commissionType,
          commission_value: Number(s.commissionValue),
          is_active: s.isActive,
        })));
      }
    } catch (err) {
      console.error("Error fetching slabs:", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch("/commission/logs");
      if (data) {
        setLogs(data.map((l: any) => ({
          ...l,
          service_key: l.serviceKey,
          transaction_amount: Number(l.transactionAmount),
          commission_amount: Number(l.commissionAmount),
          commission_type: l.commissionType,
          commission_value: Number(l.commissionValue),
          created_at: l.createdAt,
        })));
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  }, [user]);

  const fetchOverrides = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch("/commission/overrides");
      if (data) {
        setOverrides(data);
      }
    } catch (err) {
      console.error("Error fetching overrides:", err);
    }
  }, [user]);

  const fetchDownlineUsers = useCallback(async () => {
    if (!user || !canManageDownline) return;
    try {
      // Use existing /users endpoint which handles hierarchy for non-admins
      const data = await apiFetch("/users");
      if (data) {
        const dl = data
          .filter((u: any) => u.userId !== user.id)
          .map((u: any) => ({ user_id: u.userId, full_name: u.fullName, role: u.role }));
        setDownlineUsers(dl);
      }
    } catch (err) {
      console.error("Error fetching downline users:", err);
    }
  }, [user, canManageDownline]);

  const fetchServices = useCallback(async () => {
    try {
      const data = await apiFetch("/users/services");
      if (data) {
        setServices(data.map((s: any) => ({ key: s.service_key, label: s.service_label })));
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSlabs(), fetchLogs(), fetchOverrides(), fetchDownlineUsers(), fetchServices()]);
      setLoading(false);
    };
    load();
  }, [fetchSlabs, fetchLogs, fetchOverrides, fetchDownlineUsers, fetchServices]);

  const serviceGroups = slabs.reduce<Record<string, { label: string; slabs: Record<string, Slab> }>>((acc, s) => {
    if (!acc[s.service_key]) acc[s.service_key] = { label: s.service_label, slabs: {} };
    acc[s.service_key].slabs[s.role] = s;
    return acc;
  }, {});

  const handleSave = async (slab: Slab) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      toast({ title: "Invalid value", variant: "destructive" });
      return;
    }
    try {
      await apiFetch(`/commission/slabs/${slab.id}`, {
        method: "PATCH",
        body: JSON.stringify({ commission_value: val, commission_type: editType }),
      });
      toast({ title: "Slab updated" });
      setEditingId(null);
      fetchSlabs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openAddOverride = () => {
    setEditOverride(null);
    setOTargetUser(""); setOServiceKey(""); setOCommType("flat"); setOCommValue(""); setOChargeType("flat"); setOChargeValue("");
    setOverrideOpen(true);
  };

  const handleSaveOverride = async () => {
    if (!oTargetUser || !oServiceKey || !user) {
      toast({ title: "Select user and service", variant: "destructive" }); return;
    }
    const commVal = parseFloat(oCommValue) || 0;
    const chargeVal = parseFloat(oChargeValue) || 0;
    const svcLabel = services.find((s) => s.key === oServiceKey)?.label || oServiceKey;

    setOSaving(true);
    try {
      await apiFetch("/commission/overrides", {
        method: "POST",
        body: JSON.stringify({
          target_user_id: oTargetUser,
          service_key: oServiceKey,
          service_label: svcLabel,
          commission_type: oCommType,
          commission_value: commVal,
          charge_type: oChargeType,
          charge_value: chargeVal,
        }),
      });
      toast({ title: "Commission/Charge saved" });
      setOverrideOpen(false);
      fetchOverrides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setOSaving(false);
    }
  };

  const handleUpdateOverride = async (o: UserOverride) => {
    const commVal = parseFloat(eoCommValue) || 0;
    const chargeVal = parseFloat(eoChargeValue) || 0;
    try {
      await apiFetch(`/commission/overrides/${o.id}`, {
        method: "POST", // Backend handles upsert on POST, or I could add a PATCH
        body: JSON.stringify({
          target_user_id: o.target_user_id,
          service_key: o.service_key,
          commission_type: eoCommType,
          commission_value: commVal,
          charge_type: eoChargeType,
          charge_value: chargeVal,
        }),
      });
      toast({ title: "Updated" });
      setEditingOverrideId(null);
      fetchOverrides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await apiFetch(`/commission/overrides/${id}`, { method: "DELETE" });
      toast({ title: "Removed" });
      fetchOverrides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const totalEarned = logs.reduce((s, l) => s + Number(l.commission_amount), 0);
  const todayEarned = logs
    .filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString())
    .reduce((s, l) => s + Number(l.commission_amount), 0);

  const formatINR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Commission Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Manage global slabs and user-level commissions." : "Manage commissions & charges for your downline."}
          </p>
        </div>
        <div className="flex gap-2">
          {canManageDownline && (
            <Button variant="hero" size="sm" onClick={openAddOverride}>
              <Plus className="w-4 h-4 mr-1" /> Add Commission / Charge
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => { fetchSlabs(); fetchLogs(); fetchOverrides(); }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            if (!logs.length) return;
            downloadCSV(logs.map((l) => ({
              Service: l.service_key, Txn_Amount: l.transaction_amount,
              Commission: l.commission_amount, Type: l.commission_type,
              Value: l.commission_value, Date: new Date(l.created_at).toLocaleString("en-IN"),
            })), "commissions");
          }}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: formatINR(totalEarned), icon: IndianRupee, color: "text-success" },
          { label: "Today's Earnings", value: formatINR(todayEarned), icon: TrendingUp, color: "text-primary" },
          { label: "Transactions", value: logs.length.toString(), icon: BarChart3, color: "text-accent" },
          { label: "Active Services", value: Object.keys(serviceGroups).length.toString(), icon: Users, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* User Commission/Charge Overrides */}
      {canManageDownline && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-heading">Downline Commissions & Charges</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddOverride}>
              <Plus className="w-4 h-4 mr-1" /> Add New
            </Button>
          </CardHeader>
          <CardContent>
            {overrides.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No custom commissions or charges set. Click "Add New" to configure for your downline users.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Service</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Commission</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Charge</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrides.map((o) => {
                      const isEditingThis = editingOverrideId === o.id;
                      return (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-3 font-medium text-foreground">{o.target_name}</td>
                          <td className="py-3 px-3 text-muted-foreground capitalize">{o.service_label || o.service_key.replace(/_/g, " ")}</td>
                          <td className="py-3 px-3">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1">
                                <Select value={eoCommType} onValueChange={setEoCommType}>
                                  <SelectTrigger className="h-7 w-14 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="flat">₹</SelectItem>
                                    <SelectItem value="percent">%</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input className="h-7 w-16 text-xs" type="number" value={eoCommValue} onChange={(e) => setEoCommValue(e.target.value)} />
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs font-mono">
                                {o.commission_type === "percent" ? `${o.commission_value}%` : `₹${o.commission_value}`}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1">
                                <Select value={eoChargeType} onValueChange={setEoChargeType}>
                                  <SelectTrigger className="h-7 w-14 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="flat">₹</SelectItem>
                                    <SelectItem value="percent">%</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input className="h-7 w-16 text-xs" type="number" value={eoChargeValue} onChange={(e) => setEoChargeValue(e.target.value)} />
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs font-mono">
                                {o.charge_type === "percent" ? `${o.charge_value}%` : `₹${o.charge_value}`}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isEditingThis ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateOverride(o)}>
                                  <Save className="w-3.5 h-3.5 text-success" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingOverrideId(null)}>
                                  <X className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                  setEditingOverrideId(o.id);
                                  setEoCommType(o.commission_type); setEoCommValue(String(o.commission_value));
                                  setEoChargeType(o.charge_type); setEoChargeValue(String(o.charge_value));
                                }}>
                                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteOverride(o.id)}>
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global Commission Slabs (admin view) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Global Commission Slabs by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Service</th>
                      {ALL_ROLES.map((r) => (
                        <th key={r} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">{ROLE_LABELS[r]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(serviceGroups).map(([key, group]) => (
                      <tr key={key} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-3 text-foreground font-medium">{group.label}</td>
                        {ALL_ROLES.map((r) => {
                          const slab = group.slabs[r];
                          if (!slab) return <td key={r} className="py-3 px-3 text-muted-foreground">—</td>;
                          const isEditing = editingId === slab.id;
                          return (
                            <td key={r} className="py-3 px-3">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Select value={editType} onValueChange={setEditType}>
                                    <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="flat">₹</SelectItem>
                                      <SelectItem value="percent">%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input className="h-7 w-16 text-xs" type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSave(slab)}>
                                    <Save className="w-3 h-3 text-success" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}>
                                    <X className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-foreground font-mono text-xs">
                                    {slab.commission_type === "percent" ? `${slab.commission_value}%` : `₹${slab.commission_value}`}
                                  </span>
                                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                                    setEditingId(slab.id); setEditValue(String(slab.commission_value)); setEditType(slab.commission_type);
                                  }}>
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Commission Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading">Recent Commission Credits</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No commission credits yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Service</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Txn Amount</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Commission</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2 text-foreground capitalize">{l.service_key.replace(/_/g, " ")}</td>
                      <td className="py-2 text-right text-muted-foreground">{formatINR(Number(l.transaction_amount))}</td>
                      <td className="py-2 text-right font-semibold text-success">+{formatINR(Number(l.commission_amount))}</td>
                      <td className="py-2">
                        <Badge variant="secondary" className="text-xs">
                          {l.commission_type === "percent" ? `${l.commission_value}%` : `₹${l.commission_value}`}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Commission/Charge Dialog */}
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Commission & Charge</DialogTitle>
            <DialogDescription>Set commission and charge for a downline user on a specific service.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Select User *</Label>
              <Select value={oTargetUser} onValueChange={setOTargetUser}>
                <SelectTrigger><SelectValue placeholder="Choose downline user" /></SelectTrigger>
                <SelectContent>
                  {downlineUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name} {u.role ? `(${ROLE_LABELS[u.role]})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service *</Label>
              <Select value={oServiceKey} onValueChange={setOServiceKey}>
                <SelectTrigger><SelectValue placeholder="Choose service" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commission Type</Label>
                <Select value={oCommType} onValueChange={setOCommType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Value</Label>
                <Input type="number" placeholder="0" value={oCommValue} onChange={(e) => setOCommValue(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Charge Type</Label>
                <Select value={oChargeType} onValueChange={setOChargeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Charge Value</Label>
                <Input type="number" placeholder="0" value={oChargeValue} onChange={(e) => setOChargeValue(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOverrideOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveOverride} disabled={oSaving}>{oSaving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
