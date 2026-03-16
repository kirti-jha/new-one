import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, IndianRupee, TrendingUp, Users, Pencil, Save, X, RefreshCw, Download, Plus, Trash2, Settings
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
  min_amount: number | null;
  max_amount: number | null;
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
  min_amount: number | null;
  max_amount: number | null;
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
  const canManageDownline = role ? ROLE_LEVEL[role] < 5 : false;

  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [logs, setLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // User overrides state
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);
  const [services, setServices] = useState<{ key: string; label: string }[]>([]);

  // Add/Edit override dialog
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [oTargetUser, setOTargetUser] = useState("");
  const [oServiceKey, setOServiceKey] = useState("");
  const [oCommType, setOCommType] = useState("flat");
  const [oCommValue, setOCommValue] = useState("");
  const [oMinAmt, setOMinAmt] = useState("");
  const [oMaxAmt, setOMaxAmt] = useState("");
  const [oChargeType, setOChargeType] = useState("flat");
  const [oChargeValue, setOChargeValue] = useState("");
  const [oSaving, setOSaving] = useState(false);

  // Edit override inline
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [eoCommType, setEoCommType] = useState("flat");
  const [eoCommValue, setEoCommValue] = useState("");
  const [eoMinAmt, setEoMinAmt] = useState("");
  const [eoMaxAmt, setEoMaxAmt] = useState("");
  const [eoChargeType, setEoChargeType] = useState("flat");
  const [eoChargeValue, setEoChargeValue] = useState("");

  // Manage slabs dialog (Admin global slabs)
  const [manageSlabsOpen, setManageSlabsOpen] = useState(false);
  const [msServiceKey, setMsServiceKey] = useState("");
  const [msServiceLabel, setMsServiceLabel] = useState("");
  const [msRole, setMsRole] = useState<AppRole>("retailer");
  
  const [newSlabMin, setNewSlabMin] = useState("");
  const [newSlabMax, setNewSlabMax] = useState("");
  const [newSlabType, setNewSlabType] = useState("flat");
  const [newSlabValue, setNewSlabValue] = useState("");
  const [savingSlab, setSavingSlab] = useState(false);

  // Edit existing slab inline inside dialog
  const [editingSlabId, setEditingSlabId] = useState<string | null>(null);
  const [esMin, setEsMin] = useState("");
  const [esMax, setEsMax] = useState("");
  const [esType, setEsType] = useState("flat");
  const [esValue, setEsValue] = useState("");

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
          min_amount: s.minAmount != null ? Number(s.minAmount) : null,
          max_amount: s.maxAmount != null ? Number(s.maxAmount) : null,
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
        setServices(data.map((s: any) => ({ key: s.serviceKey, label: s.serviceLabel })));
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

  const serviceGroups = slabs.reduce<Record<string, { label: string; slabs: Record<string, Slab[]> }>>((acc, s) => {
    if (!acc[s.service_key]) acc[s.service_key] = { label: s.service_label, slabs: {} };
    if (!acc[s.service_key].slabs[s.role]) acc[s.service_key].slabs[s.role] = [];
    acc[s.service_key].slabs[s.role].push(s);
    return acc;
  }, {});

  const openSlabManager = (serviceKey: string, serviceLabel: string, role: AppRole) => {
    setMsServiceKey(serviceKey);
    setMsServiceLabel(serviceLabel);
    setMsRole(role);
    setNewSlabMin(""); setNewSlabMax(""); setNewSlabValue(""); setNewSlabType("flat");
    setEditingSlabId(null);
    setManageSlabsOpen(true);
  };

  const handleCreateSlab = async () => {
    const val = parseFloat(newSlabValue);
    if (isNaN(val) || val < 0) {
      toast({ title: "Invalid commission value", variant: "destructive" }); return;
    }
    setSavingSlab(true);
    try {
      await apiFetch("/commission/slabs", {
        method: "POST",
        body: JSON.stringify({
          service_key: msServiceKey,
          service_label: msServiceLabel,
          role: msRole,
          commission_type: newSlabType,
          commission_value: val,
          min_amount: newSlabMin === "" ? null : parseFloat(newSlabMin),
          max_amount: newSlabMax === "" ? null : parseFloat(newSlabMax),
        })
      });
      toast({ title: "Range added successfully" });
      setNewSlabMin(""); setNewSlabMax(""); setNewSlabValue("");
      fetchSlabs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingSlab(false);
    }
  };

  const handleUpdateSlab = async (id: string) => {
    const val = parseFloat(esValue);
    if (isNaN(val) || val < 0) {
      toast({ title: "Invalid commission value", variant: "destructive" }); return;
    }
    try {
      await apiFetch(`/commission/slabs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          commission_type: esType,
          commission_value: val,
          min_amount: esMin === "" ? null : parseFloat(esMin),
          max_amount: esMax === "" ? null : parseFloat(esMax),
        })
      });
      toast({ title: "Range updated" });
      setEditingSlabId(null);
      fetchSlabs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSlab = async (id: string) => {
    try {
      await apiFetch(`/commission/slabs/${id}`, { method: "DELETE" });
      toast({ title: "Range removed" });
      fetchSlabs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const currentDialogSlabs = slabs.filter(s => s.service_key === msServiceKey && s.role === msRole);


  const openAddOverride = () => {
    setOTargetUser(""); setOServiceKey(""); 
    setOCommType("flat"); setOCommValue(""); 
    setOMinAmt(""); setOMaxAmt("");
    setOChargeType("flat"); setOChargeValue("");
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
          min_amount: oMinAmt === "" ? null : parseFloat(oMinAmt),
          max_amount: oMaxAmt === "" ? null : parseFloat(oMaxAmt),
          charge_type: oChargeType,
          charge_value: chargeVal,
        }),
      });
      toast({ title: "Override saved" });
      setOverrideOpen(false);
      fetchOverrides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setOSaving(false);
    }
  };

  const handleUpdateOverride = async (id: string) => {
    const commVal = parseFloat(eoCommValue) || 0;
    const chargeVal = parseFloat(eoChargeValue) || 0;
    try {
      await apiFetch(`/commission/overrides/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          commission_type: eoCommType,
          commission_value: commVal,
          min_amount: eoMinAmt === "" ? null : parseFloat(eoMinAmt),
          max_amount: eoMaxAmt === "" ? null : parseFloat(eoMaxAmt),
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

  const formatINR = (v: number | null | undefined) => v != null ? `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "∞";

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
              <Plus className="w-4 h-4 mr-1" /> Add Override
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
            <CardTitle className="text-base font-heading">Downline Custom Ranges</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddOverride}>
              <Plus className="w-4 h-4 mr-1" /> Add Custom Range
            </Button>
          </CardHeader>
          <CardContent>
            {overrides.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No custom ranges set. Click "Add Custom Range" to configure for your downline.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Service</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Range (₹)</th>
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
                                <Input className="h-7 w-16 text-xs" placeholder="Min" value={eoMinAmt} onChange={(e) => setEoMinAmt(e.target.value)} />
                                <span className="text-muted-foreground">-</span>
                                <Input className="h-7 w-16 text-xs" placeholder="Max" value={eoMaxAmt} onChange={(e) => setEoMaxAmt(e.target.value)} />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {o.min_amount ?? 0} to {o.max_amount ?? '∞'}
                              </span>
                            )}
                          </td>
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
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateOverride(o.id)}>
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
                                  setEoMinAmt(o.min_amount != null ? String(o.min_amount) : ""); setEoMaxAmt(o.max_amount != null ? String(o.max_amount) : "");
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
                    {services.map((svc) => (
                      <tr key={svc.key} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-3 text-foreground font-medium">{svc.label}</td>
                        {ALL_ROLES.map((r) => {
                          const roleSlabs = slabs.filter((s) => s.service_key === svc.key && s.role === r);
                          return (
                            <td key={r} className="py-3 px-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openSlabManager(svc.key, svc.label, r)}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                {roleSlabs.length > 0 ? `${roleSlabs.length} Configured` : "Configure"}
                              </Button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan={ALL_ROLES.length + 1} className="text-center py-8 text-muted-foreground">
                          No services found in configuration.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Commission Logs */}
      {/* ... keeping the same ... */}

      {/* Admin Slab Manager Dialog */}
      <Dialog open={manageSlabsOpen} onOpenChange={setManageSlabsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Slabs for {msServiceLabel}</DialogTitle>
            <DialogDescription>Role: <strong>{ROLE_LABELS[msRole]}</strong>. Define multiple commission ranges avoiding overlaps.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-2 text-xs uppercase">Range (Min - Max)</th>
                    <th className="text-left font-medium text-muted-foreground py-2 text-xs uppercase">Commission</th>
                    <th className="text-right font-medium text-muted-foreground py-2 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDialogSlabs.length === 0 && (
                     <tr><td colSpan={3} className="text-center py-4 text-muted-foreground text-xs">No slabs defined. Create one below.</td></tr>
                  )}
                  {currentDialogSlabs.map(slab => {
                    const isEd = editingSlabId === slab.id;
                    return (
                      <tr key={slab.id} className="border-b border-border/50">
                        <td className="py-2">
                          {isEd ? (
                            <div className="flex items-center gap-1">
                              <Input className="h-7 w-20 text-xs" placeholder="Min (0)" value={esMin} onChange={e => setEsMin(e.target.value)} />
                              <span>-</span>
                              <Input className="h-7 w-20 text-xs" placeholder="Max (∞)" value={esMax} onChange={e => setEsMax(e.target.value)} />
                            </div>
                          ) : (
                            <span>{slab.min_amount ?? 0} - {slab.max_amount ?? '∞'}</span>
                          )}
                        </td>
                        <td className="py-2">
                          {isEd ? (
                             <div className="flex items-center gap-1">
                               <Select value={esType} onValueChange={setEsType}>
                                 <SelectTrigger className="h-7 w-14 text-xs"><SelectValue/></SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="flat">₹</SelectItem>
                                    <SelectItem value="percent">%</SelectItem>
                                 </SelectContent>
                               </Select>
                               <Input className="h-7 w-20 text-xs" type="number" value={esValue} onChange={e => setEsValue(e.target.value)} />
                             </div>
                          ) : (
                             <Badge variant="secondary" className="text-xs font-mono">
                               {slab.commission_type === "percent" ? `${slab.commission_value}%` : `₹${slab.commission_value}`}
                             </Badge>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {isEd ? (
                             <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateSlab(slab.id)}><Save className="w-3.5 h-3.5 text-success"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingSlabId(null)}><X className="w-3.5 h-3.5 text-destructive"/></Button>
                             </div>
                          ) : (
                             <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                  setEditingSlabId(slab.id);
                                  setEsMin(slab.min_amount != null ? String(slab.min_amount) : "");
                                  setEsMax(slab.max_amount != null ? String(slab.max_amount) : "");
                                  setEsType(slab.commission_type); setEsValue(String(slab.commission_value));
                                }}><Pencil className="w-3.5 h-3.5 text-muted-foreground"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteSlab(slab.id)}><Trash2 className="w-3.5 h-3.5 text-destructive"/></Button>
                             </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-secondary/20 p-3 rounded-lg border border-border mt-4">
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-3">Add New Range</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5 flex-1 min-w-[100px]">
                   <Label className="text-xs">Min Amount</Label>
                   <Input type="number" min="0" placeholder="0 or empty" value={newSlabMin} onChange={e => setNewSlabMin(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[100px]">
                   <Label className="text-xs">Max Amount</Label>
                   <Input type="number" min="0" placeholder="Empty for ∞" value={newSlabMax} onChange={e => setNewSlabMax(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5 w-24">
                   <Label className="text-xs">Val Type</Label>
                   <Select value={newSlabType} onValueChange={setNewSlabType}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="flat">₹ Flat</SelectItem>
                         <SelectItem value="percent">% Pct</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1.5 flex-1 min-w-[100px]">
                   <Label className="text-xs">Comm. Value</Label>
                   <Input type="number" min="0" placeholder="0" value={newSlabValue} onChange={e => setNewSlabValue(e.target.value)} className="h-8 text-xs" />
                </div>
                <Button size="sm" className="h-8" onClick={handleCreateSlab} disabled={savingSlab}>
                   {savingSlab ? "Saving..." : <><Plus className="w-3 h-3 mr-1"/> Add</>}
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
               <Button variant="outline" size="sm" onClick={() => setManageSlabsOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Downline Override Dialog */}
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Commission Range</DialogTitle>
            <DialogDescription>Set specific commission/charge range for a downline.</DialogDescription>
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
                <Label>Min Amount (₹)</Label>
                <Input type="number" min="0" placeholder="0" value={oMinAmt} onChange={(e) => setOMinAmt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Amount (₹)</Label>
                <Input type="number" min="0" placeholder="Leave empty for ∞" value={oMaxAmt} onChange={(e) => setOMaxAmt(e.target.value)} />
              </div>
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
                <Input type="number" min="0" placeholder="0" value={oCommValue} onChange={(e) => setOCommValue(e.target.value)} />
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
                <Input type="number" min="0" placeholder="0" value={oChargeValue} onChange={(e) => setOChargeValue(e.target.value)} />
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
