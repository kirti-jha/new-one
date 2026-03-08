import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, CheckCircle2, Clock, XCircle, IndianRupee } from "lucide-react";

const cards = [
  { bank: "HDFC", name: "Regalia Gold", fee: "₹2,500", cashback: "5%", color: "from-yellow-500 to-amber-600" },
  { bank: "SBI", name: "SimplyCLICK", fee: "₹499", cashback: "1.25%", color: "from-blue-500 to-indigo-600" },
  { bank: "ICICI", name: "Amazon Pay", fee: "₹500", cashback: "2%", color: "from-orange-500 to-red-500" },
  { bank: "Axis", name: "Flipkart", fee: "₹500", cashback: "1.5%", color: "from-purple-500 to-violet-600" },
];

const leads = [
  { id: "CC01", customer: "Ankit Sharma", bank: "HDFC", card: "Regalia Gold", status: "approved", date: "2026-03-08", commission: 1200 },
  { id: "CC02", customer: "Meena Das", bank: "SBI", card: "SimplyCLICK", status: "pending", date: "2026-03-07", commission: 0 },
  { id: "CC03", customer: "Vikram Joshi", bank: "ICICI", card: "Amazon Pay", status: "rejected", date: "2026-03-06", commission: 0 },
];

const statusVariant = { approved: "default" as const, pending: "secondary" as const, rejected: "destructive" as const };
const statusIcon = { approved: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, rejected: <XCircle className="w-3 h-3" /> };

export default function DashboardCreditCard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Credit Card</h1>
        <p className="text-sm text-muted-foreground">Credit card applications and lead generation services.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.name} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${c.color}`} />
            <CardContent className="pt-4">
              <p className="font-semibold text-foreground">{c.bank} {c.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Fee: {c.fee}/yr • Cashback: {c.cashback}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full">Apply Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Lead</CardTitle>
            <CardDescription>Submit a credit card application for your customer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Customer Name</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Mobile Number</Label><Input placeholder="10-digit number" /></div>
            <div className="space-y-2"><Label>PAN Number</Label><Input placeholder="ABCDE1234F" /></div>
            <div className="space-y-2"><Label>Monthly Income (₹)</Label><Input type="number" placeholder="Monthly income" /></div>
            <div className="space-y-2">
              <Label>Preferred Card</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                <SelectContent>{cards.map((c) => <SelectItem key={c.name} value={c.name}>{c.bank} {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full"><CreditCard className="w-4 h-4 mr-2" /> Submit Lead</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Lead History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{l.customer}</p>
                    <p className="text-xs text-muted-foreground">{l.bank} {l.card} • {l.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {l.commission > 0 && (
                      <span className="text-xs font-medium text-primary flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />{l.commission}
                      </span>
                    )}
                    <Badge variant={statusVariant[l.status as keyof typeof statusVariant]} className="gap-1">
                      {statusIcon[l.status as keyof typeof statusIcon]}{l.status}
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
