import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, UserPlus, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock } from "lucide-react";

const walletStats = [
  { label: "Wallets Created", value: "156", icon: UserPlus },
  { label: "Total Load Today", value: "₹3,45,000", icon: ArrowDownLeft },
  { label: "Total Withdraw Today", value: "₹1,20,000", icon: ArrowUpRight },
];

const walletTxns = [
  { id: "W01", customer: "Ajay Singh", mobile: "98765xxxxx", type: "Load", amount: 5000, status: "success", date: "2026-03-08" },
  { id: "W02", customer: "Neha Gupta", mobile: "87654xxxxx", type: "Withdraw", amount: 2000, status: "success", date: "2026-03-08" },
  { id: "W03", customer: "Ravi Tiwari", mobile: "76543xxxxx", type: "Load", amount: 10000, status: "pending", date: "2026-03-07" },
];

export default function DashboardPPIWallet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">PPI Wallet</h1>
        <p className="text-sm text-muted-foreground">Prepaid Payment Instrument wallet services.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {walletStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create"><UserPlus className="w-4 h-4 mr-1.5" /> Create Wallet</TabsTrigger>
          <TabsTrigger value="load"><ArrowDownLeft className="w-4 h-4 mr-1.5" /> Load Money</TabsTrigger>
          <TabsTrigger value="withdraw"><ArrowUpRight className="w-4 h-4 mr-1.5" /> Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle className="text-lg">Create New Wallet</CardTitle><CardDescription>Register a new PPI wallet for the customer.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Customer Name</Label><Input placeholder="Full name" /></div>
                <div className="space-y-2"><Label>Mobile Number</Label><Input placeholder="10-digit number" /></div>
                <div className="space-y-2"><Label>Aadhaar Number</Label><Input placeholder="12-digit Aadhaar" /></div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
              </div>
              <Button><UserPlus className="w-4 h-4 mr-2" /> Create Wallet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load">
          <Card>
            <CardHeader><CardTitle className="text-lg">Load Money</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Mobile / Wallet ID</Label><Input placeholder="Customer mobile" /></div>
              <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Load amount" /></div>
              <Button><ArrowDownLeft className="w-4 h-4 mr-2" /> Load Wallet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader><CardTitle className="text-lg">Withdraw to Bank</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Mobile / Wallet ID</Label><Input placeholder="Customer mobile" /></div>
              <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Withdraw amount" /></div>
              <Button><ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">Customer</th>
                <th className="text-left py-2 font-medium">Mobile</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {walletTxns.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{t.customer}</td>
                    <td className="py-2 text-muted-foreground">{t.mobile}</td>
                    <td className="py-2"><Badge variant="outline">{t.type}</Badge></td>
                    <td className="py-2 text-right font-medium">₹{t.amount.toLocaleString("en-IN")}</td>
                    <td className="py-2">
                      <Badge variant={t.status === "success" ? "default" : "secondary"} className="gap-1">
                        {t.status === "success" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{t.status}
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
