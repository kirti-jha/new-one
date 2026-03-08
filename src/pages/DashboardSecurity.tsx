import { Shield, Smartphone, Monitor, MapPin, Clock, Lock, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const loginHistory = [
  { device: "Chrome / Windows", ip: "103.21.45.67", location: "Mumbai, MH", time: "Mar 8, 2026 14:32", status: "Active" },
  { device: "Safari / iPhone", ip: "103.21.45.68", location: "Mumbai, MH", time: "Mar 8, 2026 10:15", status: "Active" },
  { device: "Chrome / Android", ip: "182.73.12.34", location: "Delhi, DL", time: "Mar 7, 2026 22:45", status: "Expired" },
  { device: "Firefox / Linux", ip: "49.36.78.90", location: "Bangalore, KA", time: "Mar 6, 2026 09:30", status: "Expired" },
  { device: "Chrome / Windows", ip: "119.82.44.55", location: "Pune, MH", time: "Mar 5, 2026 16:20", status: "Expired" },
];

const auditLogs = [
  { action: "User role changed", target: "Amit Patel → Distributor", by: "Admin", time: "Mar 8, 14:20" },
  { action: "KYC approved", target: "Sunita Devi", by: "Admin", time: "Mar 8, 13:55" },
  { action: "Fund transfer", target: "₹1,00,000 to SD Rajesh Kumar", by: "Admin", time: "Mar 8, 12:30" },
  { action: "Commission slab updated", target: "AEPS - Cash Withdrawal", by: "Admin", time: "Mar 7, 18:45" },
  { action: "User blocked", target: "Vikram Singh", by: "Admin", time: "Mar 7, 15:10" },
  { action: "Password reset", target: "Priya Sharma", by: "Self", time: "Mar 6, 11:20" },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Security Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Two-factor auth, session management, and audit trail.</p>
      </div>

      {/* Security Settings */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-gradient-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">Two-Factor Auth</h3>
          </div>
          <p className="text-xs text-muted-foreground">Enable OTP verification for all login attempts.</p>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Enabled</Label>
            <Switch defaultChecked />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-warning" />
            <h3 className="font-heading font-semibold text-foreground">T-PIN System</h3>
          </div>
          <p className="text-xs text-muted-foreground">Require T-PIN for high-value transactions above ₹10,000.</p>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Enabled</Label>
            <Switch defaultChecked />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="font-heading font-semibold text-foreground">IP Whitelisting</h3>
          </div>
          <p className="text-xs text-muted-foreground">Restrict admin access to specific IP addresses.</p>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Enabled</Label>
            <Switch />
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Active Sessions</h2>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">Revoke All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Device", "IP Address", "Location", "Time", "Status", ""].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loginHistory.map((s, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-5 text-foreground text-xs font-medium">{s.device}</td>
                  <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{s.ip}</td>
                  <td className="py-3 px-5 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</td>
                  <td className="py-3 px-5 text-xs text-muted-foreground">{s.time}</td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "Active" ? "text-success bg-success/10" : "text-muted-foreground bg-muted/30"}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-5">
                    {s.status === "Active" && <Button variant="ghost" size="sm" className="text-xs text-destructive h-7">Revoke</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="font-heading font-semibold text-foreground">Audit Log</h2>
        </div>
        <div className="divide-y divide-border/50">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
              <div>
                <div className="text-sm text-foreground font-medium">{log.action}</div>
                <div className="text-xs text-muted-foreground">{log.target}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{log.by}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{log.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
