import {
  Wallet, IndianRupee, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, Fingerprint, Send, Receipt, Smartphone, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const stats = [
  { title: "Wallet Balance", value: "₹45,200", change: "-₹8,500", positive: false, icon: Wallet },
  { title: "Today's Earnings", value: "₹1,240", change: "+₹320", positive: true, icon: IndianRupee },
  { title: "Transactions Today", value: "38", change: "+5", positive: true, icon: Activity },
  { title: "Success Rate", value: "97.4%", change: "+0.5%", positive: true, icon: TrendingUp },
];

const earningsData = [
  { date: "Mar 1", earned: 980 }, { date: "Mar 2", earned: 1150 },
  { date: "Mar 3", earned: 870 }, { date: "Mar 4", earned: 1340 },
  { date: "Mar 5", earned: 1520 }, { date: "Mar 6", earned: 1080 },
  { date: "Mar 7", earned: 1680 }, { date: "Mar 8", earned: 1240 },
];

const serviceSplit = [
  { name: "AEPS", value: 42, icon: Fingerprint },
  { name: "DMT", value: 28, icon: Send },
  { name: "BBPS", value: 18, icon: Receipt },
  { name: "Recharge", value: 12, icon: Smartphone },
];

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const recentTxns = [
  { id: "TXN101", service: "AEPS", customer: "Ramesh Yadav", amount: "₹10,000", status: "success", time: "3 min ago", commission: "₹40" },
  { id: "TXN102", service: "DMT", customer: "Geeta Kumari", amount: "₹25,000", status: "success", time: "8 min ago", commission: "₹75" },
  { id: "TXN103", service: "BBPS", customer: "Sunil Verma", amount: "₹2,400", status: "success", time: "15 min ago", commission: "₹12" },
  { id: "TXN104", service: "Recharge", customer: "Kavita Devi", amount: "₹599", status: "success", time: "22 min ago", commission: "₹18" },
  { id: "TXN105", service: "DMT", customer: "Anil Sharma", amount: "₹15,000", status: "failed", time: "30 min ago", commission: "₹0" },
  { id: "TXN106", service: "AEPS", customer: "Pooja Rani", amount: "₹5,000", status: "pending", time: "35 min ago", commission: "-" },
];

const statusIcon = { success: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, failed: <XCircle className="w-3 h-3" /> };
const statusVariant = { success: "default" as const, pending: "secondary" as const, failed: "destructive" as const };

export default function RetailerOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Retailer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}. Your daily performance summary.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((card) => (
          <div key={card.title} className="p-4 sm:p-5 rounded-xl bg-gradient-card border border-border hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" /> Daily Earnings (Last 8 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Earnings"]} />
                  <Bar dataKey="earned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Service Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceSplit} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {serviceSplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {serviceSplit.map((s, i) => (
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">ID</th>
                <th className="text-left py-2 font-medium">Service</th>
                <th className="text-left py-2 font-medium hidden sm:table-cell">Customer</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-right py-2 font-medium hidden sm:table-cell">Commission</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {recentTxns.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs text-primary">{t.id}</td>
                    <td className="py-2">{t.service}</td>
                    <td className="py-2 text-muted-foreground hidden sm:table-cell">{t.customer}</td>
                    <td className="py-2 text-right font-medium text-foreground">{t.amount}</td>
                    <td className="py-2 text-right text-success hidden sm:table-cell">{t.commission}</td>
                    <td className="py-2">
                      <Badge variant={statusVariant[t.status as keyof typeof statusVariant]} className="gap-1">
                        {statusIcon[t.status as keyof typeof statusIcon]}{t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
