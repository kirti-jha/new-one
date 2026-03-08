import { Send, Search, UserPlus, CheckCircle2, XCircle, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const senders = [
  { name: "Ramesh Yadav", phone: "9876543210", verified: true, limit: "₹25,000", used: "₹15,000" },
  { name: "Sita Devi", phone: "9876543211", verified: true, limit: "₹25,000", used: "₹5,000" },
  { name: "Mohan Lal", phone: "9876543212", verified: false, limit: "₹25,000", used: "₹0" },
];

const recentDmt = [
  { id: "DMT001", sender: "Ramesh Yadav", beneficiary: "Suresh Kumar", bank: "SBI / 12345678901", amount: "₹5,000", status: "Success", date: "Mar 8, 14:20" },
  { id: "DMT002", sender: "Sita Devi", beneficiary: "Meena Kumari", bank: "PNB / 98765432101", amount: "₹10,000", status: "Success", date: "Mar 8, 13:55" },
  { id: "DMT003", sender: "Ramesh Yadav", beneficiary: "Vikram Singh", bank: "HDFC / 11223344556", amount: "₹3,000", status: "Failed", date: "Mar 8, 13:40" },
  { id: "DMT004", sender: "Sita Devi", beneficiary: "Gita Sharma", bank: "ICICI / 99887766554", amount: "₹7,500", status: "Pending", date: "Mar 8, 13:10" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

export default function DMTPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Domestic Money Transfer</h1>
          <p className="text-sm text-muted-foreground mt-1">Instant IMPS bank-to-bank transfers 24/7.</p>
        </div>
        <Button variant="hero" size="sm"><UserPlus className="w-4 h-4 mr-1" /> Register Sender</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">New Transfer</h2>
            </div>
            <div><Label>Sender Mobile</Label><Input placeholder="10-digit mobile number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Beneficiary Account</Label><Input placeholder="Account number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>IFSC Code</Label><Input placeholder="SBIN0001234" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Amount (₹)</Label><Input type="number" placeholder="Max ₹5,000 per txn" className="bg-secondary/50 mt-1" /></div>
            <Button variant="outline" size="sm" className="w-full"><BadgeCheck className="w-4 h-4 mr-1" /> Verify Account (Penny Drop)</Button>
            <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold">
              <Send className="w-4 h-4 mr-2" /> Send Money via IMPS
            </Button>
          </div>

          {/* Registered Senders */}
          <div className="rounded-xl bg-gradient-card border border-border p-5">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Registered Senders</h3>
            <div className="space-y-3">
              {senders.map((s) => (
                <div key={s.phone} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Used: {s.used}</div>
                    <div className="text-xs text-foreground">Limit: {s.limit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">DMT Transactions</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["ID", "Sender", "Beneficiary", "Bank / Acc", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recentDmt.map((txn) => {
                  const Cfg = statusConfig[txn.status];
                  return (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{txn.id}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{txn.sender}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{txn.beneficiary}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs font-mono">{txn.bank}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{txn.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                          <Cfg.icon className="w-3 h-3" />{txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{txn.date}</td>
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
