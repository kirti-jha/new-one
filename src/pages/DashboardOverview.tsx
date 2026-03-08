import {
  Wallet, Users, ArrowUpRight, ArrowDownRight, IndianRupee, Activity,
  TrendingUp, Clock, Fingerprint, Send, Receipt, Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const statsCards = [
  { title: "Total Balance", value: "₹12,45,890", change: "+12.5%", positive: true, icon: Wallet },
  { title: "Today's Volume", value: "₹8,32,450", change: "+8.2%", positive: true, icon: IndianRupee },
  { title: "Active Users", value: "2,847", change: "+24", positive: true, icon: Users },
  { title: "Success Rate", value: "98.7%", change: "-0.2%", positive: false, icon: Activity },
];

const revenueData = [
  { date: "Mar 1", volume: 520000, commission: 15600, transactions: 142 },
  { date: "Mar 2", volume: 680000, commission: 20400, transactions: 189 },
  { date: "Mar 3", volume: 590000, commission: 17700, transactions: 156 },
  { date: "Mar 4", volume: 740000, commission: 22200, transactions: 205 },
  { date: "Mar 5", volume: 830000, commission: 24900, transactions: 231 },
  { date: "Mar 6", volume: 710000, commission: 21300, transactions: 198 },
  { date: "Mar 7", volume: 920000, commission: 27600, transactions: 256 },
  { date: "Mar 8", volume: 832450, commission: 24973, transactions: 243 },
];

const serviceData = [
  { name: "AEPS", value: 35, icon: Fingerprint },
  { name: "DMT", value: 28, icon: Send },
  { name: "BBPS", value: 18, icon: Receipt },
  { name: "Recharge", value: 12, icon: Smartphone },
  { name: "Others", value: 7, icon: Activity },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const hourlyData = [
  { hour: "6AM", txns: 12 }, { hour: "8AM", txns: 34 }, { hour: "10AM", txns: 67 },
  { hour: "12PM", txns: 89 }, { hour: "2PM", txns: 76 }, { hour: "4PM", txns: 54 },
  { hour: "6PM", txns: 43 }, { hour: "8PM", txns: 28 }, { hour: "10PM", txns: 15 },
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

const formatINR = (v: number) => `₹${(v / 1000).toFixed(0)}K`;

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card) => (
          <div key={card.title} className="p-4 sm:p-5 rounded-xl bg-gradient-card border border-border hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.positive ? "text-success" : "text-destructive"}`}>
                {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.change}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-foreground">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Revenue Trend + Service Split */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Revenue & Volume (Last 8 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [`₹${value.toLocaleString("en-IN")}`, name === "volume" ? "Volume" : "Commission"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--primary))" fill="url(#volumeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="hsl(var(--chart-2))" fill="url(#commGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Service Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {serviceData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {serviceData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Hourly Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Today's Transaction Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [value, "Transactions"]}
                />
                <Bar dataKey="txns" name="Transactions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <div className="rounded-xl bg-gradient-card border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Recent Transactions</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> Live
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Txn ID</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">User</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-center py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-5 font-mono text-xs text-primary">{txn.id}</td>
                  <td className="py-3 px-5 text-foreground">{txn.type}</td>
                  <td className="py-3 px-5 text-foreground hidden sm:table-cell">{txn.user}</td>
                  <td className="py-3 px-5 text-right font-medium text-foreground">{txn.amount}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[txn.status]}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right text-muted-foreground text-xs hidden sm:table-cell">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
