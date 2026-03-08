import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, IndianRupee, TrendingUp, Users, Pencil, Save, X, RefreshCw, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_distributor: "Super Dist.",
  master_distributor: "Master Dist.",
  distributor: "Distributor",
  retailer: "Retailer",
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

export default function CommissionsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [logs, setLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editType, setEditType] = useState("flat");

  const fetchSlabs = useCallback(async () => {
    const { data } = await supabase
      .from("commission_slabs")
      .select("*")
      .eq("is_active", true)
      .order("service_key")
      .order("role");
    if (data) setSlabs(data as Slab[]);
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("commission_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data as CommissionLog[]);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSlabs(), fetchLogs()]);
      setLoading(false);
    };
    load();
  }, [fetchSlabs, fetchLogs]);

  // Group slabs by service
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
    const { error } = await supabase
      .from("commission_slabs")
      .update({ commission_value: val, commission_type: editType })
      .eq("id", slab.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slab updated" });
      setEditingId(null);
      fetchSlabs();
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
            {isAdmin ? "Manage commission slabs across the hierarchy." : "View your commission earnings."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchSlabs(); fetchLogs(); }}>
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

      {/* Commission Slabs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading">Commission Slabs by Role</CardTitle>
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
                                  <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="flat">₹</SelectItem>
                                    <SelectItem value="percent">%</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  className="h-7 w-16 text-xs"
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                />
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
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                    onClick={() => {
                                      setEditingId(slab.id);
                                      setEditValue(String(slab.commission_value));
                                      setEditType(slab.commission_type);
                                    }}
                                  >
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                  </Button>
                                )}
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
    </div>
  );
}
