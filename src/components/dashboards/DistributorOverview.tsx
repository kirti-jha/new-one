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
  { title: "My Balance", value: "₹3,45,000", change: "+5.1%", positive: true, icon: Wallet },
  { title: "E-wallet", value: "₹1,850", change: "+₹120", positive: true, icon: Activity },
  { title: "Today's Earning", value: "₹2,775", change: "+9.8%", positive: true, icon: IndianRupee },
  { title: "My Retailers", value: "18", change: "+2", positive: true, icon: Users },
];

const volumeData = [
  { date: "Mar 1", volume: 145000 }, { date: "Mar 2", volume: 168000 },
  { date: "Mar 3", volume: 132000 }, { date: "Mar 4", volume: 195000 },
  { date: "Mar 5", volume: 210000 }, { date: "Mar 6", volume: 175000 },
  { date: "Mar 7", volume: 225000 }, { date: "Mar 8", volume: 185000 },
];

const retailerPerformance = [
  { name: "Sharma CSP", volume: "₹42,000", txns: 34, rate: "99.1%" },
  { name: "Gupta Store", volume: "₹38,000", txns: 28, rate: "98.5%" },
  { name: "Patel Kiosk", volume: "₹31,000", txns: 22, rate: "97.2%" },
  { name: "Das Services", volume: "₹25,000", txns: 18, rate: "96.8%" },
  { name: "Yadav Point", volume: "₹22,000", txns: 15, rate: "98.9%" },
  { name: "Nair Agency", volume: "₹18,000", txns: 12, rate: "95.5%" },
];

const commissionData = [
  { date: "Mar 1", earned: 2175 }, { date: "Mar 2", earned: 2520 },
  { date: "Mar 3", earned: 1980 }, { date: "Mar 4", earned: 2925 },
  { date: "Mar 5", earned: 3150 }, { date: "Mar 6", earned: 2625 },
  { date: "Mar 7", earned: 3375 }, { date: "Mar 8", earned: 2775 },
];

const fundRequests = [
  { from: "Sharma CSP", amount: "₹25,000", time: "30 min ago", status: "pending" },
  { from: "Gupta Store", amount: "₹15,000", time: "1 hr ago", status: "pending" },
  { from: "Patel Kiosk", amount: "₹10,000", time: "3 hr ago", status: "approved" },
];

export default function DistributorOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Welcome, {name}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Your retailer network overview.</p>
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
              <TrendingUp className="w-4 h-4 text-primary" /> Daily Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="distVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" fill="url(#distVolGrad)" strokeWidth={2} />
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
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Bar dataKey="earned" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Retailer Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Retailer</th>
                  <th className="text-right py-2 font-medium">Volume</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Txns</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                </tr></thead>
                <tbody>
                  {retailerPerformance.map((r) => (
                    <tr key={r.name} className="border-b last:border-0">
                      <td className="py-2 font-medium text-foreground text-xs sm:text-sm">{r.name}</td>
                      <td className="py-2 text-right text-foreground">{r.volume}</td>
                      <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">{r.txns}</td>
                      <td className="py-2 text-right"><Badge variant="secondary">{r.rate}</Badge></td>
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
              <Clock className="w-4 h-4 text-primary" /> Fund Requests from Retailers
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
