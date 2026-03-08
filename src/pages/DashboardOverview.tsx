import {
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";

const statsCards = [
  {
    title: "Total Balance",
    value: "₹12,45,890",
    change: "+12.5%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Today's Volume",
    value: "₹8,32,450",
    change: "+8.2%",
    positive: true,
    icon: IndianRupee,
  },
  {
    title: "Active Users",
    value: "2,847",
    change: "+24",
    positive: true,
    icon: Users,
  },
  {
    title: "Success Rate",
    value: "98.7%",
    change: "-0.2%",
    positive: false,
    icon: Activity,
  },
];

const recentTransactions = [
  { id: "TXN001", type: "DMT", user: "Rajesh Kumar", amount: "₹25,000", status: "Success", time: "2 min ago" },
  { id: "TXN002", type: "AEPS", user: "Priya Sharma", amount: "₹10,000", status: "Success", time: "5 min ago" },
  { id: "TXN003", type: "BBPS", user: "Amit Patel", amount: "₹3,500", status: "Pending", time: "8 min ago" },
  { id: "TXN004", type: "Payout", user: "Sunita Devi", amount: "₹50,000", status: "Success", time: "12 min ago" },
  { id: "TXN005", type: "DMT", user: "Vikram Singh", amount: "₹15,000", status: "Failed", time: "15 min ago" },
  { id: "TXN006", type: "AEPS", user: "Meena Kumari", amount: "₹5,000", status: "Success", time: "20 min ago" },
];

const statusColor: Record<string, string> = {
  Success: "text-success bg-success/10",
  Pending: "text-warning bg-warning/10",
  Failed: "text-destructive bg-destructive/10",
};

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="p-5 rounded-xl bg-gradient-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <card.icon className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.positive ? "text-success" : "text-destructive"}`}>
                {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.change}
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl bg-gradient-card border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Recent Transactions</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Live
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Txn ID</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-center py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-5 font-mono text-xs text-primary">{txn.id}</td>
                  <td className="py-3 px-5 text-foreground">{txn.type}</td>
                  <td className="py-3 px-5 text-foreground">{txn.user}</td>
                  <td className="py-3 px-5 text-right font-medium text-foreground">{txn.amount}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[txn.status]}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right text-muted-foreground text-xs">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
