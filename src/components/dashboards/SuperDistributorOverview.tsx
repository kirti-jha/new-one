import {
  Wallet, Users, IndianRupee, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const stats = [
  { title: "My Balance", value: "₹58,45,000", change: "+8.4%", positive: true, icon: Wallet },
  { title: "Network Volume", value: "₹32,80,000", change: "+15.1%", positive: true, icon: IndianRupee },
  { title: "My Downline", value: "1,245", change: "+18", positive: true, icon: Users },
  { title: "Network Success Rate", value: "98.9%", change: "+0.3%", positive: true, icon: Activity },
];

const volumeData = [
  { date: "Mar 1", myVolume: 2800000, downlineVolume: 5200000 },
  { date: "Mar 2", myVolume: 3100000, downlineVolume: 6800000 },
  { date: "Mar 3", myVolume: 2600000, downlineVolume: 4900000 },
  { date: "Mar 4", myVolume: 3400000, downlineVolume: 7100000 },
  { date: "Mar 5", myVolume: 3800000, downlineVolume: 8200000 },
  { date: "Mar 6", myVolume: 3200000, downlineVolume: 6500000 },
  { date: "Mar 7", myVolume: 4100000, downlineVolume: 9100000 },
  { date: "Mar 8", myVolume: 3280000, downlineVolume: 7800000 },
];

const mdPerformance = [
  { name: "MD 1 - Kapoor Group", volume: "₹8,20,000", retailers: 124, rate: "99.1%" },
  { name: "MD 2 - Singh Networks", volume: "₹6,50,000", retailers: 98, rate: "98.7%" },
  { name: "MD 3 - Verma Trading", volume: "₹5,10,000", retailers: 76, rate: "97.9%" },
  { name: "MD 4 - Jain Services", volume: "₹4,80,000", retailers: 68, rate: "98.4%" },
];

const fundRequests = [
  { from: "MD - Kapoor Group", amount: "₹5,00,000", time: "10 min ago", status: "pending" },
  { from: "MD - Singh Networks", amount: "₹3,00,000", time: "1 hr ago", status: "pending" },
  { from: "MD - Verma Trading", amount: "₹2,50,000", time: "2 hr ago", status: "approved" },
];

const commissionData = [
  { date: "Mar 1", earned: 42000 }, { date: "Mar 2", earned: 54000 }, { date: "Mar 3", earned: 38000 },
  { date: "Mar 4", earned: 62000 }, { date: "Mar 5", earned: 71000 }, { date: "Mar 6", earned: 48000 },
  { date: "Mar 7", earned: 78000 }, { date: "Mar 8", earned: 65000 },
];

const formatINR = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

export default function SuperDistributorOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Super Distributor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}. Your network performance at a glance.</p>
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
              <TrendingUp className="w-4 h-4 text-primary" /> My Volume vs Downline Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sdMyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sdDownGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="myVolume" name="My Volume" stroke="hsl(var(--primary))" fill="url(#sdMyGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="downlineVolume" name="Downline" stroke="hsl(var(--chart-2))" fill="url(#sdDownGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" /> Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Bar dataKey="earned" name="Commission" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Master Distributor Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="text-right py-2 font-medium">Volume</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Retailers</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                </tr></thead>
                <tbody>
                  {mdPerformance.map((md) => (
                    <tr key={md.name} className="border-b last:border-0">
                      <td className="py-2 font-medium text-foreground text-xs sm:text-sm">{md.name}</td>
                      <td className="py-2 text-right text-foreground">{md.volume}</td>
                      <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">{md.retailers}</td>
                      <td className="py-2 text-right"><Badge variant="secondary">{md.rate}</Badge></td>
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
              <Clock className="w-4 h-4 text-primary" /> Fund Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fundRequests.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.from}</p>
                    <p className="text-xs text-muted-foreground">{r.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{r.amount}</p>
                    <Badge variant={r.status === "pending" ? "secondary" : "default"} className="mt-1">{r.status}</Badge>
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
