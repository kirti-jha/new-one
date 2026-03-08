import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const walletData = {
  mainWallet: "₹12,45,890",
  eWallet: "₹3,28,500",
  pendingSettlement: "₹1,52,000",
};

const fundRequests = [
  { id: "FND001", user: "Rajesh Kumar", amount: "₹1,00,000", method: "Bank Transfer", utr: "UTR928371", status: "Approved", date: "Mar 7, 2026" },
  { id: "FND002", user: "Amit Patel", amount: "₹50,000", method: "UPI", utr: "UTR928372", status: "Pending", date: "Mar 7, 2026" },
  { id: "FND003", user: "Meena Kumari", amount: "₹25,000", method: "QR Payment", utr: "UTR928373", status: "Pending", date: "Mar 8, 2026" },
  { id: "FND004", user: "Vikram Singh", amount: "₹75,000", method: "Bank Transfer", utr: "UTR928374", status: "Rejected", date: "Mar 6, 2026" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Approved: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Rejected: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Wallet & Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage wallets, fund requests, and settlements.</p>
        </div>
        <Button variant="hero" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Funds
        </Button>
      </div>

      {/* Wallet Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Main Wallet</span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">{walletData.mainWallet}</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <ArrowUpRight className="w-3 h-3" /> +₹2,45,000 today
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">E-Wallet</span>
            <Wallet className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">{walletData.eWallet}</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <ArrowUpRight className="w-3 h-3" /> +₹58,000 today
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Pending Settlement</span>
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">{walletData.pendingSettlement}</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <ArrowDownRight className="w-3 h-3" /> Settling in ~30 min
          </div>
        </div>
      </div>

      {/* Fund Requests */}
      <div className="rounded-xl bg-gradient-card border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">Fund Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Request ID", "User", "Amount", "Method", "UTR", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fundRequests.map((req) => {
                const StatusCfg = statusConfig[req.status];
                return (
                  <tr key={req.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-primary">{req.id}</td>
                    <td className="py-3 px-5 text-foreground">{req.user}</td>
                    <td className="py-3 px-5 font-medium text-foreground">{req.amount}</td>
                    <td className="py-3 px-5 text-muted-foreground">{req.method}</td>
                    <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{req.utr}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${StatusCfg.className}`}>
                        <StatusCfg.icon className="w-3 h-3" />
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground text-xs">{req.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
