import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, FileText, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

const loanTypes = [
  { id: "personal", label: "Personal Loan", rate: "10.5%", maxAmount: "₹10,00,000" },
  { id: "business", label: "Business Loan", rate: "12%", maxAmount: "₹25,00,000" },
  { id: "gold", label: "Gold Loan", rate: "7.5%", maxAmount: "₹50,00,000" },
  { id: "home", label: "Home Loan", rate: "8.5%", maxAmount: "₹1,00,00,000" },
];

const applications = [
  { id: "L001", customer: "Rajesh Kumar", type: "Personal", amount: 200000, status: "approved", date: "2026-03-07" },
  { id: "L002", customer: "Priya Singh", type: "Business", amount: 500000, status: "pending", date: "2026-03-06" },
  { id: "L003", customer: "Amit Verma", type: "Gold", amount: 300000, status: "rejected", date: "2026-03-05" },
  { id: "L004", customer: "Sneha Patel", type: "Home", amount: 2500000, status: "approved", date: "2026-03-04" },
];

const statusIcon = { approved: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, rejected: <XCircle className="w-3 h-3" /> };
const statusVariant = { approved: "default" as const, pending: "secondary" as const, rejected: "destructive" as const };

export default function DashboardLoan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Loan Services</h1>
        <p className="text-sm text-muted-foreground">Personal and business loan applications with instant processing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loanTypes.map((loan) => (
          <Card key={loan.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{loan.label}</p>
                  <p className="text-xs text-muted-foreground">From {loan.rate} p.a.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Up to {loan.maxAmount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="apply">
        <TabsList>
          <TabsTrigger value="apply"><FileText className="w-4 h-4 mr-1.5" /> New Application</TabsTrigger>
          <TabsTrigger value="track"><TrendingUp className="w-4 h-4 mr-1.5" /> Track Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loan Application</CardTitle>
              <CardDescription>Fill in customer details to submit a loan application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Customer Name</Label><Input placeholder="Full name" /></div>
                <div className="space-y-2"><Label>Mobile Number</Label><Input placeholder="10-digit number" /></div>
                <div className="space-y-2"><Label>PAN Number</Label><Input placeholder="ABCDE1234F" /></div>
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{loanTypes.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Loan amount" /></div>
                <div className="space-y-2"><Label>Monthly Income (₹)</Label><Input type="number" placeholder="Monthly income" /></div>
              </div>
              <Button><Banknote className="w-4 h-4 mr-2" /> Submit Application</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="track">
          <Card>
            <CardHeader><CardTitle className="text-lg">Application History</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">ID</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{a.id}</td>
                        <td className="py-2">{a.customer}</td>
                        <td className="py-2">{a.type}</td>
                        <td className="py-2 text-right font-medium">₹{a.amount.toLocaleString("en-IN")}</td>
                        <td className="py-2">
                          <Badge variant={statusVariant[a.status as keyof typeof statusVariant]} className="gap-1">
                            {statusIcon[a.status as keyof typeof statusIcon]}{a.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground">{a.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
