import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Radio, Wallet, BarChart3, CheckCircle2, Clock } from "lucide-react";

const stats = [
  { label: "Today's Withdrawals", value: "₹1,85,000", icon: Wallet },
  { label: "Transactions", value: "24", icon: BarChart3 },
  { label: "Commission", value: "₹1,480", icon: Radio },
];

const transactions = [
  { id: "M001", customer: "Ramesh Yadav", card: "XXXX3456", amount: 10000, status: "success", time: "14:30" },
  { id: "M002", customer: "Geeta Devi", card: "XXXX7890", amount: 5000, status: "success", time: "13:15" },
  { id: "M003", customer: "Sunil Kumar", card: "XXXX1234", amount: 20000, status: "pending", time: "12:45" },
  { id: "M004", customer: "Kavita Singh", card: "XXXX5678", amount: 3000, status: "success", time: "11:20" },
];

export default function DashboardMATM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Micro ATM</h1>
        <p className="text-sm text-muted-foreground">Card-based cash withdrawal at merchant locations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cash Withdrawal</CardTitle>
            <CardDescription>Process card-based cash withdrawal for the customer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed text-center">
              <Radio className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Connect MATM Device</p>
              <p className="text-xs text-muted-foreground mt-1">Insert or tap the customer's debit card on the MATM device</p>
              <Button variant="outline" size="sm" className="mt-3">Detect Device</Button>
            </div>
            <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Withdrawal amount" /></div>
            <div className="space-y-2"><Label>Customer Mobile</Label><Input placeholder="For receipt SMS" /></div>
            <Button className="w-full"><Wallet className="w-4 h-4 mr-2" /> Process Withdrawal</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.customer}</p>
                    <p className="text-xs text-muted-foreground">Card {t.card} • {t.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{t.amount.toLocaleString("en-IN")}</p>
                    <Badge variant={t.status === "success" ? "default" : "secondary"} className="gap-1 mt-1">
                      {t.status === "success" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{t.status}
                    </Badge>
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
