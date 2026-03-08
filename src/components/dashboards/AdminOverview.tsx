import {
  Wallet, Users, IndianRupee, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock, Shield, Server, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const stats = [
  { title: "Platform Balance", value: "₹4,82,45,890", change: "+12.5%", positive: true, icon: Wallet },
  { title: "Today's Volume", value: "₹1,28,32,450", change: "+18.2%", positive: true, icon: IndianRupee },
  { title: "Total Users", value: "12,847", change: "+124", positive: true, icon: Users },
  { title: "Platform Success Rate", value: "98.7%", change: "-0.2%", positive: false, icon: Activity },
];

const revenueData = [
  { date: "Mar 1", volume: 9200000, commission: 276000 },
  { date: "Mar 2", volume: 10800000, commission: 324000 },
  { date: "Mar 3", volume: 8900000, commission: 267000 },
  { date: "Mar 4", volume: 11400000, commission: 342000 },
  { date: "Mar 5", volume: 12300000, commission: 369000 },
  { date: "Mar 6", volume: 10100000, commission: 303000 },
  { date: "Mar 7", volume: 13200000, commission: 396000 },
  { date: "Mar 8", volume: 12832450, commission: 384973 },
];

const userBreakdown = [
  { name: "Super Distributors", value: 45 },
  { name: "Master Distributors", value: 180 },
  { name: "Distributors", value: 1420 },
  { name: "Retailers", value: 11202 },
];

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const systemAlerts = [
  { msg: "AEPS gateway latency > 2s", severity: "warning", time: "5 min ago" },
  { msg: "3 KYC approvals pending > 24hr", severity: "info", time: "1 hr ago" },
  { msg: "DMT success rate dropped to 96.2%", severity: "warning", time: "2 hr ago" },
];

const topSDs = [
  { name: "Rajiv Enterprises", volume: "₹18,45,000", users: 342, rate: "99.1%" },
  { name: "Sharma Networks", volume: "₹15,20,000", users: 289, rate: "98.5%" },
  { name: "Patel Distribution", volume: "₹12,80,000", users: 256, rate: "97.8%" },
  { name: "Gupta Services", volume: "₹11,40,000", users: 198, rate: "99.3%" },
];

const formatINR = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

export default function AdminOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}. Full platform overview.</p>
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
              <TrendingUp className="w-4 h-4 text-primary" /> Platform Volume & Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--primary))" fill="url(#adminVolGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">User Hierarchy</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {userBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {userBreakdown.map((u, i) => (
                <div key={u.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground truncate">{u.name}</span>
                  <span className="ml-auto font-medium text-foreground">{u.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Top Super Distributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="text-right py-2 font-medium">Volume</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Users</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                </tr></thead>
                <tbody>
                  {topSDs.map((sd) => (
                    <tr key={sd.name} className="border-b last:border-0">
                      <td className="py-2 font-medium text-foreground">{sd.name}</td>
                      <td className="py-2 text-right text-foreground">{sd.volume}</td>
                      <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">{sd.users}</td>
                      <td className="py-2 text-right"><Badge variant="secondary">{sd.rate}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.severity === "warning" ? "bg-warning" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
