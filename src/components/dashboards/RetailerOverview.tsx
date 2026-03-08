import {
  Wallet, IndianRupee, Activity, ArrowUpRight, ArrowDownRight,
  TrendingUp, Fingerprint, Send, Receipt, Smartphone, CheckCircle2, Clock, XCircle,
  Zap, CreditCard, FileText, Banknote, AlertTriangle, ShieldCheck,
  Landmark, Shield, Globe, Package, Plane, Heart, QrCode, Wifi,
  MonitorSmartphone, BadgeIndianRupee, HandCoins, Volume2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Link } from "react-router-dom";

const stats = [
  { title: "Wallet Balance", value: "₹45,200", change: "-₹8,500", positive: false, icon: Wallet },
  { title: "Today's Earnings", value: "₹1,240", change: "+₹320", positive: true, icon: IndianRupee },
  { title: "Transactions Today", value: "38", change: "+5", positive: true, icon: Activity },
  { title: "Success Rate", value: "97.4%", change: "+0.5%", positive: true, icon: TrendingUp },
];

const earningsData = [
  { date: "Mar 1", earned: 980, volume: 42000 },
  { date: "Mar 2", earned: 1150, volume: 51000 },
  { date: "Mar 3", earned: 870, volume: 38000 },
  { date: "Mar 4", earned: 1340, volume: 62000 },
  { date: "Mar 5", earned: 1520, volume: 71000 },
  { date: "Mar 6", earned: 1080, volume: 48000 },
  { date: "Mar 7", earned: 1680, volume: 78000 },
  { date: "Mar 8", earned: 1240, volume: 56000 },
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

const allServices = [
  { label: "AEPS", icon: Fingerprint, path: "/dashboard/aeps", bg: "bg-primary/10", color: "text-primary" },
  { label: "DMT", icon: Send, path: "/dashboard/dmt", bg: "bg-chart-2/10", color: "text-chart-2" },
  { label: "BBPS", icon: Receipt, path: "/dashboard/bbps", bg: "bg-chart-3/10", color: "text-chart-3" },
  { label: "Recharge", icon: Smartphone, path: "/dashboard/recharge", bg: "bg-chart-4/10", color: "text-chart-4" },
  { label: "PAN Card", icon: FileText, path: "/dashboard/pan", bg: "bg-primary/10", color: "text-primary" },
  { label: "Credit Card", icon: CreditCard, path: "/dashboard/credit-card", bg: "bg-chart-2/10", color: "text-chart-2" },
  { label: "CC Bill Pay", icon: BadgeIndianRupee, path: "/dashboard/cc-bill-pay", bg: "bg-chart-3/10", color: "text-chart-3" },
  { label: "Payout", icon: HandCoins, path: "/dashboard/payout", bg: "bg-chart-4/10", color: "text-chart-4" },
  { label: "mATM", icon: MonitorSmartphone, path: "/dashboard/matm", bg: "bg-primary/10", color: "text-primary" },
  { label: "POS", icon: QrCode, path: "/dashboard/pos", bg: "bg-chart-2/10", color: "text-chart-2" },
  { label: "Insurance", icon: Heart, path: "/dashboard/insurance", bg: "bg-chart-3/10", color: "text-chart-3" },
  { label: "Loan", icon: Landmark, path: "/dashboard/loan", bg: "bg-chart-4/10", color: "text-chart-4" },
  { label: "PPI Wallet", icon: Wallet, path: "/dashboard/ppi-wallet", bg: "bg-primary/10", color: "text-primary" },
  { label: "SoundBox", icon: Volume2, path: "/dashboard/sound-box", bg: "bg-chart-2/10", color: "text-chart-2" },
  { label: "Travel", icon: Plane, path: "/dashboard/travel-booking", bg: "bg-chart-3/10", color: "text-chart-3" },
  { label: "Travel Pkg", icon: Globe, path: "/dashboard/travel-package", bg: "bg-chart-4/10", color: "text-chart-4" },
  { label: "PG", icon: Shield, path: "/dashboard/pg", bg: "bg-primary/10", color: "text-primary" },
  { label: "Bank A/C", icon: Landmark, path: "/dashboard/bank-account", bg: "bg-chart-2/10", color: "text-chart-2" },
];

const pendingTasks = [
  { msg: "KYC verification pending — upload Aadhaar", severity: "warning", time: "Action needed" },
  { msg: "Fund request ₹10,000 — Awaiting approval", severity: "info", time: "Submitted 2hr ago" },
  { msg: "Low wallet balance — Add funds to continue", severity: "warning", time: "Balance < ₹5,000" },
];

const walletSummary = [
  { label: "Main Wallet", value: "₹45,200", icon: Wallet },
  { label: "E-Wallet", value: "₹2,350", icon: Zap },
  { label: "Today's Credit", value: "₹8,500", icon: ArrowUpRight },
  { label: "Today's Debit", value: "₹12,300", icon: ArrowDownRight },
];

export default function RetailerOverview({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Retailer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}. Here's your daily performance summary.</p>
      </div>

      {/* Stat Cards */}
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

      {/* All Services */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {allServices.map((svc) => (
              <Link key={svc.label} to={svc.path}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className={`w-11 h-11 rounded-xl ${svc.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <svc.icon className={`w-5 h-5 ${svc.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground text-center leading-tight">{svc.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary + Earnings Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Earnings & Volume (Last 8 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="retEarnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="earned" name="Earnings" stroke="hsl(var(--primary))" fill="url(#retEarnGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Wallet Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walletSummary.map((w) => (
                <div key={w.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <w.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{w.label}</p>
                    <p className="text-sm font-heading font-bold text-foreground">{w.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/dashboard/wallet">
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Banknote className="w-4 h-4 mr-2" /> Add Funds
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage + Pending Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Service Usage Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceSplit} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
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
                  <s.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> Pending Tasks & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.severity === "warning" ? "bg-warning" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Link to="/dashboard/kyc" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Complete KYC
                </Button>
              </Link>
              <Link to="/dashboard/fund-requests" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Banknote className="w-4 h-4 mr-1" /> Fund Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Transactions
            </CardTitle>
            <Link to="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-xs text-primary">View All →</Button>
            </Link>
          </div>
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
