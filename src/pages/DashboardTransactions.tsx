import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/services/api";
import { ArrowLeftRight, Search, Filter, Download, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { icon: any; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

const tabs = ["All", "Success", "Pending", "Failed"] as const;

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === "All" ? "" : activeTab.toLowerCase();
      const data = await apiFetch(`/transactions?status=${status}`);
      if (data) {
        setTransactions(data.map((t: any) => ({
          ...t,
          id: t.txnId || t.id,
          type: t.serviceType,
          user: t.userName || "Myself",
          userRole: t.userRole || "User",
          amount: `₹${Number(t.amount).toLocaleString("en-IN")}`,
          fee: `₹${Number(t.fee || 0).toLocaleString("en-IN")}`,
          status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
          date: new Date(t.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          direction: t.type === "credit" ? "in" : "out",
        })));
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status === "Success").length,
    pending: transactions.filter((t) => t.status === "Pending").length,
    failed: transactions.filter((t) => t.status === "Failed").length,
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
          <span className="text-xs text-muted-foreground ml-2">({transactions.length})</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No transactions found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["", "TXN ID", "Type", "User", "Amount", "Fee", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const Cfg = statusConfig[txn.status] || statusConfig.Pending;
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
                      <td className="py-3 px-5 text-foreground font-medium capitalize">{txn.type.replace(/_/g, " ")}</td>
                      <td className="py-3 px-5">
                        <div className="text-foreground">{txn.user}</div>
                        <div className="text-xs text-muted-foreground capitalize">{txn.userRole.replace(/_/g, " ")}</div>
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
          )}
        </div>
      </div>
    </div>
  );
}
