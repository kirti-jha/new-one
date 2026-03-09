import {
  Wallet, Users, IndianRupee, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const stats = [
  { title: "My Balance", value: "₹12,80,000", change: "+6.2%", positive: true, icon: Wallet },
  { title: "E-wallet", value: "₹3,450", change: "+₹200", positive: true, icon: Activity },
  { title: "Today's Earning", value: "₹12,700", change: "+11.5%", positive: true, icon: IndianRupee },
  { title: "My Distributors", value: "42", change: "+3", positive: true, icon: Users },
];

const volumeData = [
  { date: "Mar 1", volume: 620000 }, { date: "Mar 2", volume: 780000 },
  { date: "Mar 3", volume: 540000 }, { date: "Mar 4", volume: 890000 },
  { date: "Mar 5", volume: 950000 }, { date: "Mar 6", volume: 720000 },
  { date: "Mar 7", volume: 1020000 }, { date: "Mar 8", volume: 845000 },
];

const distPerformance = [
  { name: "Dist - Mehta Solutions", volume: "₹2,10,000", retailers: 18, rate: "99.2%" },
  { name: "Dist - Yadav Agency", volume: "₹1,85,000", retailers: 15, rate: "98.1%" },
  { name: "Dist - Kumar Services", volume: "₹1,50,000", retailers: 12, rate: "97.5%" },
  { name: "Dist - Reddy Networks", volume: "₹1,20,000", retailers: 9, rate: "98.8%" },
  { name: "Dist - Tiwari Group", volume: "₹80,000", retailers: 6, rate: "96.3%" },
];

const commissionData = [
  { date: "Mar 1", earned: 9300 }, { date: "Mar 2", earned: 11700 },
  { date: "Mar 3", earned: 8100 }, { date: "Mar 4", earned: 13400 },
  { date: "Mar 5", earned: 14300 }, { date: "Mar 6", earned: 10800 },
  { date: "Mar 7", earned: 15300 }, { date: "Mar 8", earned: 12700 },
];

const fundRequests = [
  { from: "Dist - Mehta Solutions", amount: "₹1,00,000", time: "15 min ago", status: "pending" },
  { from: "Dist - Yadav Agency", amount: "₹75,000", time: "2 hr ago", status: "pending" },
  { from: "Dist - Kumar Services", amount: "₹50,000", time: "4 hr ago", status: "approved" },
];

const formatINR = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

export default function MasterDistributorOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Welcome, {name}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Your distributor network summary.</p>
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
              <TrendingUp className="w-4 h-4 text-primary" /> Daily Network Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mdVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--primary))" fill="url(#mdVolGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" /> My Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Bar dataKey="earned" name="Commission" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Distributor Performance</CardTitle></CardHeader>
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
                  {distPerformance.map((d) => (
                    <tr key={d.name} className="border-b last:border-0">
                      <td className="py-2 font-medium text-foreground text-xs sm:text-sm">{d.name}</td>
                      <td className="py-2 text-right text-foreground">{d.volume}</td>
                      <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">{d.retailers}</td>
                      <td className="py-2 text-right"><Badge variant="secondary">{d.rate}</Badge></td>
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
              <Clock className="w-4 h-4 text-primary" /> Fund Requests from Distributors
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
