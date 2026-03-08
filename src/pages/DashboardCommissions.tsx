import { BarChart3, IndianRupee, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const commissionSlabs = [
  { service: "AEPS - Cash Withdrawal", admin: "₹5", sd: "₹4", md: "₹3", dist: "₹2", retailer: "₹1.5" },
  { service: "AEPS - Balance Inquiry", admin: "₹1", sd: "₹0.80", md: "₹0.60", dist: "₹0.40", retailer: "₹0.30" },
  { service: "DMT (per ₹1,000)", admin: "₹12", sd: "₹10", md: "₹8", dist: "₹6", retailer: "₹4" },
  { service: "BBPS - Electricity", admin: "₹5", sd: "₹4", md: "₹3", dist: "₹2.5", retailer: "₹2" },
  { service: "Mobile Recharge", admin: "3.5%", sd: "3%", md: "2.5%", dist: "2%", retailer: "1.5%" },
  { service: "PAN Card", admin: "₹30", sd: "₹25", md: "₹20", dist: "₹15", retailer: "₹10" },
  { service: "Insurance Premium", admin: "2%", sd: "1.8%", md: "1.5%", dist: "1.2%", retailer: "1%" },
];

const topEarners = [
  { name: "Rajesh Kumar", role: "Super Distributor", earned: "₹1,42,500", txns: 2450 },
  { name: "Priya Sharma", role: "Master Distributor", earned: "₹89,200", txns: 1820 },
  { name: "Amit Patel", role: "Distributor", earned: "₹45,600", txns: 980 },
  { name: "Meena Kumari", role: "Distributor", earned: "₹38,100", txns: 756 },
  { name: "Sunita Devi", role: "Retailer", earned: "₹12,400", txns: 340 },
];

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Commission Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Dynamic commission slabs across the hierarchy.</p>
        </div>
        <Button variant="hero" size="sm">Edit Slabs</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Paid (Month)", value: "₹8,45,200", icon: IndianRupee, color: "text-success" },
          { label: "Avg. Per User", value: "₹2,840", icon: Users, color: "text-primary" },
          { label: "Growth", value: "+18.5%", icon: TrendingUp, color: "text-success" },
          { label: "Active Services", value: "12", icon: BarChart3, color: "text-accent" },
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
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">Commission Slabs by Role</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Service", "Admin", "Super Dist.", "Master Dist.", "Distributor", "Retailer"].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {commissionSlabs.map((row) => (
                <tr key={row.service} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-5 text-foreground font-medium">{row.service}</td>
                  <td className="py-3 px-5 text-success font-mono text-xs">{row.admin}</td>
                  <td className="py-3 px-5 text-foreground font-mono text-xs">{row.sd}</td>
                  <td className="py-3 px-5 text-foreground font-mono text-xs">{row.md}</td>
                  <td className="py-3 px-5 text-foreground font-mono text-xs">{row.dist}</td>
                  <td className="py-3 px-5 text-foreground font-mono text-xs">{row.retailer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Earners */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">Top Earners (This Month)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["#", "Name", "Role", "Earned", "Transactions"].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topEarners.map((user, i) => (
                <tr key={user.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-5 text-primary font-bold">{i + 1}</td>
                  <td className="py-3 px-5 text-foreground font-medium">{user.name}</td>
                  <td className="py-3 px-5 text-muted-foreground">{user.role}</td>
                  <td className="py-3 px-5 text-success font-medium">{user.earned}</td>
                  <td className="py-3 px-5 text-foreground">{user.txns.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
