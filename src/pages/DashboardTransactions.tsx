import { ArrowLeftRight, Search, Filter, Download, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mockTransactions = [
  { id: "TXN240301001", type: "AEPS Withdrawal", user: "Rajesh Kumar", userRole: "Retailer", amount: "₹5,000", fee: "₹15", status: "Success", date: "Mar 8, 2026 14:32", direction: "out" },
  { id: "TXN240301002", type: "DMT Transfer", user: "Priya Sharma", userRole: "Retailer", amount: "₹25,000", fee: "₹75", status: "Success", date: "Mar 8, 2026 14:28", direction: "out" },
  { id: "TXN240301003", type: "BBPS - Electricity", user: "Amit Patel", userRole: "Distributor", amount: "₹2,450", fee: "₹10", status: "Pending", date: "Mar 8, 2026 14:15", direction: "out" },
  { id: "TXN240301004", type: "Fund Transfer", user: "Sunita Devi", userRole: "Retailer", amount: "₹1,00,000", fee: "₹0", status: "Success", date: "Mar 8, 2026 13:55", direction: "in" },
  { id: "TXN240301005", type: "Recharge - Jio", user: "Vikram Singh", userRole: "Retailer", amount: "₹299", fee: "₹5", status: "Failed", date: "Mar 8, 2026 13:42", direction: "out" },
  { id: "TXN240301006", type: "AEPS Balance Inquiry", user: "Meena Kumari", userRole: "Distributor", amount: "₹0", fee: "₹3", status: "Success", date: "Mar 8, 2026 13:30", direction: "out" },
  { id: "TXN240301007", type: "PAN Application", user: "Rajesh Kumar", userRole: "Retailer", amount: "₹107", fee: "₹20", status: "Success", date: "Mar 8, 2026 13:10", direction: "out" },
  { id: "TXN240301008", type: "Payout - IMPS", user: "Admin", userRole: "Admin", amount: "₹5,00,000", fee: "₹100", status: "Success", date: "Mar 8, 2026 12:45", direction: "out" },
  { id: "TXN240301009", type: "BBPS - Gas", user: "Priya Sharma", userRole: "Retailer", amount: "₹1,050", fee: "₹8", status: "Pending", date: "Mar 8, 2026 12:30", direction: "out" },
  { id: "TXN240301010", type: "DMT Transfer", user: "Amit Patel", userRole: "Distributor", amount: "₹10,000", fee: "₹30", status: "Failed", date: "Mar 8, 2026 12:15", direction: "out" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

const tabs = ["All", "Success", "Pending", "Failed"] as const;

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");

  const filtered = activeTab === "All" ? mockTransactions : mockTransactions.filter((t) => t.status === activeTab);

  const stats = {
    total: mockTransactions.length,
    success: mockTransactions.filter((t) => t.status === "Success").length,
    pending: mockTransactions.filter((t) => t.status === "Pending").length,
    failed: mockTransactions.filter((t) => t.status === "Failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor all platform transactions in real-time.</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, className: "text-primary" },
          { label: "Success", value: stats.success, className: "text-success" },
          { label: "Pending", value: stats.pending, className: "text-warning" },
          { label: "Failed", value: stats.failed, className: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-card border border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-2xl font-heading font-bold mt-1 ${s.className}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by TXN ID, user, type..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Date Range</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Transaction Log</h2>
          <span className="text-xs text-muted-foreground ml-2">({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["", "TXN ID", "Type", "User", "Amount", "Fee", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => {
                const Cfg = statusConfig[txn.status];
                return (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-5">
                      {txn.direction === "in" ? (
                        <ArrowDownRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-primary">{txn.id}</td>
                    <td className="py-3 px-5 text-foreground font-medium">{txn.type}</td>
                    <td className="py-3 px-5">
                      <div className="text-foreground">{txn.user}</div>
                      <div className="text-xs text-muted-foreground">{txn.userRole}</div>
                    </td>
                    <td className="py-3 px-5 font-medium text-foreground">{txn.amount}</td>
                    <td className="py-3 px-5 text-muted-foreground">{txn.fee}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${Cfg.className}`}>
                        <Cfg.icon className="w-3 h-3" />{txn.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground text-xs">{txn.date}</td>
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
