import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, CheckCircle2, Clock, IndianRupee } from "lucide-react";

const banks = ["HDFC Bank", "SBI Card", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "RBL Bank", "Yes Bank", "IDFC First"];

const recentPayments = [
  { id: "BP01", customer: "Rahul Mehta", bank: "HDFC Bank", cardLast4: "4521", amount: 15600, status: "success", date: "2026-03-08" },
  { id: "BP02", customer: "Sunita Rao", bank: "SBI Card", cardLast4: "8834", amount: 8200, status: "success", date: "2026-03-07" },
  { id: "BP03", customer: "Karan Gupta", bank: "ICICI Bank", cardLast4: "2290", amount: 22500, status: "pending", date: "2026-03-07" },
];

export default function DashboardCCBillPay() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">CC Bill Pay</h1>
        <p className="text-sm text-muted-foreground">Credit card bill payment for all major banks.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[{ label: "Today's Collections", value: "₹46,300" }, { label: "Payments Today", value: "3" }, { label: "Commission Earned", value: "₹185" }, { label: "Success Rate", value: "100%" }].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pay Credit Card Bill</CardTitle>
            <CardDescription>Process bill payment for your customer's credit card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                <SelectContent>{banks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Card Number (last 4 digits)</Label><Input maxLength={4} placeholder="XXXX" /></div>
            <div className="space-y-2"><Label>Customer Mobile</Label><Input placeholder="10-digit number" /></div>
            <div className="space-y-2"><Label>Bill Amount (₹)</Label><Input type="number" placeholder="Enter amount" /></div>
            <Button className="w-full"><IndianRupee className="w-4 h-4 mr-2" /> Pay Bill</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.customer}</p>
                    <p className="text-xs text-muted-foreground">{p.bank} •••• {p.cardLast4} • {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">₹{p.amount.toLocaleString("en-IN")}</p>
                    <Badge variant={p.status === "success" ? "default" : "secondary"} className="gap-1 mt-1">
                      {p.status === "success" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{p.status}
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
