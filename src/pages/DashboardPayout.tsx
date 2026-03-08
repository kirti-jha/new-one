import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, CheckCircle2, Clock, XCircle, Send } from "lucide-react";

const payouts = [
  { id: "PO001", beneficiary: "Suresh Enterprises", account: "XXXX4567", bank: "HDFC", amount: 50000, mode: "IMPS", status: "success", date: "2026-03-08 14:23" },
  { id: "PO002", beneficiary: "Lakshmi Traders", account: "XXXX8901", bank: "SBI", amount: 125000, mode: "NEFT", status: "success", date: "2026-03-08 12:10" },
  { id: "PO003", beneficiary: "Ravi Industries", account: "XXXX2345", bank: "ICICI", amount: 75000, mode: "RTGS", status: "pending", date: "2026-03-08 11:45" },
  { id: "PO004", beneficiary: "Pooja Services", account: "XXXX6789", bank: "Axis", amount: 25000, mode: "IMPS", status: "failed", date: "2026-03-07 16:30" },
];

const statusVariant = { success: "default" as const, pending: "secondary" as const, failed: "destructive" as const };
const statusIcon = { success: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, failed: <XCircle className="w-3 h-3" /> };

export default function DashboardPayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Payout</h1>
        <p className="text-sm text-muted-foreground">Instant payouts to bank accounts via IMPS/NEFT/RTGS.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[{ label: "Today's Payouts", value: "₹2,75,000" }, { label: "Total Transactions", value: "12" }, { label: "Success Rate", value: "91.7%" }, { label: "Pending", value: "1" }].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">New Payout</CardTitle>
            <CardDescription>Transfer funds to a bank account instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Beneficiary Name</Label><Input placeholder="Account holder name" /></div>
            <div className="space-y-2"><Label>Account Number</Label><Input placeholder="Bank account number" /></div>
            <div className="space-y-2"><Label>IFSC Code</Label><Input placeholder="e.g. HDFC0001234" /></div>
            <div className="space-y-2">
              <Label>Transfer Mode</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="imps">IMPS (Instant, up to ₹5L)</SelectItem>
                  <SelectItem value="neft">NEFT (30 min batches)</SelectItem>
                  <SelectItem value="rtgs">RTGS (Above ₹2L, real-time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Transfer amount" /></div>
            <Button className="w-full"><Send className="w-4 h-4 mr-2" /> Initiate Payout</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-lg">Payout History</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Beneficiary</th>
                  <th className="text-left py-2 font-medium">Bank</th>
                  <th className="text-left py-2 font-medium">Mode</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Time</th>
                </tr></thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.beneficiary}</td>
                      <td className="py-2 text-muted-foreground">{p.bank}</td>
                      <td className="py-2"><Badge variant="outline">{p.mode}</Badge></td>
                      <td className="py-2 text-right font-medium">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant[p.status as keyof typeof statusVariant]} className="gap-1">
                          {statusIcon[p.status as keyof typeof statusIcon]}{p.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
