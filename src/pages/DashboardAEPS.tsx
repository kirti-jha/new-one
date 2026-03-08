import { Fingerprint, CheckCircle2, XCircle, Clock, IndianRupee, CreditCard, FileText, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const recentAeps = [
  { id: "AEPS001", type: "Cash Withdrawal", customer: "Ramesh Yadav", aadhaar: "XXXX-XXXX-4521", bank: "SBI", amount: "₹5,000", status: "Success", date: "Mar 8, 14:32" },
  { id: "AEPS002", type: "Balance Inquiry", customer: "Sita Devi", aadhaar: "XXXX-XXXX-7823", bank: "PNB", amount: "—", status: "Success", date: "Mar 8, 14:15" },
  { id: "AEPS003", type: "Mini Statement", customer: "Mohan Lal", aadhaar: "XXXX-XXXX-3341", bank: "BOB", amount: "—", status: "Success", date: "Mar 8, 13:50" },
  { id: "AEPS004", type: "Cash Withdrawal", customer: "Gita Sharma", aadhaar: "XXXX-XXXX-9912", bank: "HDFC", amount: "₹10,000", status: "Failed", date: "Mar 8, 13:30" },
  { id: "AEPS005", type: "Aadhaar Pay", customer: "Suresh Kumar", aadhaar: "XXXX-XXXX-5567", bank: "ICICI", amount: "₹2,500", status: "Pending", date: "Mar 8, 13:10" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

const serviceCards = [
  { label: "Cash Withdrawal", icon: IndianRupee, desc: "Withdraw cash using fingerprint", color: "text-success" },
  { label: "Balance Inquiry", icon: CreditCard, desc: "Check account balance", color: "text-primary" },
  { label: "Mini Statement", icon: FileText, desc: "Last 10 transactions", color: "text-accent" },
  { label: "Aadhaar Pay", icon: Smartphone, desc: "Merchant payment via Aadhaar", color: "text-warning" },
];

export default function AEPSPage() {
  const [activeService, setActiveService] = useState("Cash Withdrawal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">AEPS Services</h1>
        <p className="text-sm text-muted-foreground mt-1">Aadhaar Enabled Payment System — biometric banking at your fingertips.</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceCards.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveService(s.label)}
            className={`p-4 rounded-xl border text-left transition-all ${activeService === s.label ? "bg-primary/10 border-primary shadow-glow" : "bg-gradient-card border-border hover:border-primary/40"}`}
          >
            <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
            <div className="font-heading font-semibold text-foreground text-sm">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Transaction Form */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">{activeService}</h2>
          </div>
          <div className="space-y-3">
            <div><Label>Aadhaar Number</Label><Input placeholder="XXXX XXXX XXXX" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Bank</Label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground">
                <option>Select Bank</option>
                <option>State Bank of India</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
              </select>
            </div>
            {(activeService === "Cash Withdrawal" || activeService === "Aadhaar Pay") && (
              <div><Label>Amount (₹)</Label><Input type="number" placeholder="Enter amount" className="bg-secondary/50 mt-1" /></div>
            )}
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium">⚠ Connect biometric device before proceeding</p>
              <p className="text-xs text-muted-foreground mt-1">Supported: Mantra MFS100, Morpho MSO 1300</p>
            </div>
            <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold">
              <Fingerprint className="w-4 h-4 mr-2" /> Capture & Proceed
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Recent AEPS Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Type", "Customer", "Bank", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAeps.map((txn) => {
                  const Cfg = statusConfig[txn.status];
                  return (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{txn.id}</td>
                      <td className="py-3 px-4 text-foreground">{txn.type}</td>
                      <td className="py-3 px-4">
                        <div className="text-foreground text-xs">{txn.customer}</div>
                        <div className="text-[10px] text-muted-foreground">{txn.aadhaar}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{txn.bank}</td>
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
