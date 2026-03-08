import { Receipt, Zap, Droplets, Flame, Smartphone, Tv, Car, ShieldCheck, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const categories = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "text-warning" },
  { id: "water", label: "Water", icon: Droplets, color: "text-primary" },
  { id: "gas", label: "Gas & LPG", icon: Flame, color: "text-destructive" },
  { id: "mobile", label: "Mobile", icon: Smartphone, color: "text-success" },
  { id: "dth", label: "DTH", icon: Tv, color: "text-accent" },
  { id: "fastag", label: "FASTag", icon: Car, color: "text-warning" },
  { id: "insurance", label: "Insurance", icon: ShieldCheck, color: "text-primary" },
];

const recentBills = [
  { id: "BBPS001", category: "Electricity", provider: "MSEDCL", consumer: "1234567890", amount: "₹2,450", status: "Success", date: "Mar 8, 14:20" },
  { id: "BBPS002", category: "Mobile", provider: "Jio Prepaid", consumer: "9876543210", amount: "₹299", status: "Success", date: "Mar 8, 13:55" },
  { id: "BBPS003", category: "Gas", provider: "Indane Gas", consumer: "HP123456", amount: "₹1,050", status: "Pending", date: "Mar 8, 13:30" },
  { id: "BBPS004", category: "DTH", provider: "Tata Play", consumer: "TP987654", amount: "₹399", status: "Success", date: "Mar 8, 13:10" },
  { id: "BBPS005", category: "FASTag", provider: "Paytm FASTag", consumer: "FT112233", amount: "₹500", status: "Failed", date: "Mar 8, 12:45" },
  { id: "BBPS006", category: "Water", provider: "Delhi Jal Board", consumer: "DJB445566", amount: "₹850", status: "Success", date: "Mar 8, 12:20" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

export default function BBPSPage() {
  const [activeCategory, setActiveCategory] = useState("electricity");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">BBPS — Bill Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Bharat Bill Payment System — pay utility bills, recharges, and more.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${activeCategory === cat.id ? "bg-primary/10 border-primary" : "bg-gradient-card border-border hover:border-primary/40"}`}
          >
            <cat.icon className={`w-4 h-4 ${cat.color}`} />
            <span className="text-sm font-medium text-foreground">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Pay Bill</h2>
          </div>
          <div><Label>Provider</Label>
            <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground">
              <option>Select provider</option>
              <option>MSEDCL</option>
              <option>BSES Rajdhani</option>
              <option>Tata Power</option>
              <option>Adani Electricity</option>
            </select>
          </div>
          <div><Label>Consumer / Account Number</Label><Input placeholder="Enter consumer number" className="bg-secondary/50 mt-1" /></div>
          <Button variant="outline" size="sm" className="w-full">Fetch Bill</Button>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Bill Amount</span><span className="text-foreground font-medium">₹2,450</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Due Date</span><span className="text-foreground">Mar 15, 2026</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Consumer Name</span><span className="text-foreground">Rajesh Kumar</span></div>
          </div>
          <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold">Pay ₹2,450</Button>
        </div>

        {/* Recent */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Recent Payments</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["ID", "Category", "Provider", "Consumer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recentBills.map((bill) => {
                  const Cfg = statusConfig[bill.status];
                  return (
                    <tr key={bill.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{bill.id}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{bill.category}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{bill.provider}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{bill.consumer}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{bill.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                          <Cfg.icon className="w-3 h-3" />{bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{bill.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
