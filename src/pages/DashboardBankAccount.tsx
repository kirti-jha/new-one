import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";

const partnerBanks = ["Kotak Mahindra Bank", "IDFC First Bank", "Fino Payments Bank", "Airtel Payments Bank"];

const accountTypes = ["Savings Account", "Current Account", "Jan Dhan Account"];

const applications = [
  { id: "BA01", customer: "Mohan Lal", bank: "Kotak", type: "Savings", status: "opened", date: "2026-03-08", accountNo: "XXXX5678" },
  { id: "BA02", customer: "Rekha Sharma", bank: "IDFC First", type: "Current", status: "pending", date: "2026-03-07", accountNo: "-" },
  { id: "BA03", customer: "Dinesh Patel", bank: "Fino", type: "Jan Dhan", status: "opened", date: "2026-03-06", accountNo: "XXXX1234" },
  { id: "BA04", customer: "Sita Devi", bank: "Airtel", type: "Savings", status: "rejected", date: "2026-03-05", accountNo: "-" },
];

const statusVariant = { opened: "default" as const, pending: "secondary" as const, rejected: "destructive" as const };
const statusIcon = { opened: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, rejected: <XCircle className="w-3 h-3" /> };

export default function DashboardBankAccount() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Bank Account Opening</h1>
        <p className="text-sm text-muted-foreground">Instant bank account opening with partner banks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {partnerBanks.map((bank) => (
          <Card key={bank}>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{bank}</p>
                <p className="text-xs text-muted-foreground">Partner Bank</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open New Account</CardTitle>
            <CardDescription>Fill in customer details to open a bank account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="As per Aadhaar" /></div>
              <div className="space-y-2"><Label>Mobile Number</Label><Input placeholder="10-digit number" /></div>
              <div className="space-y-2"><Label>Aadhaar Number</Label><Input placeholder="12-digit Aadhaar" /></div>
              <div className="space-y-2"><Label>PAN Number</Label><Input placeholder="ABCDE1234F" /></div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent>{partnerBanks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{accountTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input placeholder="Full address" /></div>
            <Button className="w-full"><Building2 className="w-4 h-4 mr-2" /> Submit Application</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Application History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{a.customer}</p>
                    <p className="text-xs text-muted-foreground">{a.bank} • {a.type} • {a.date}</p>
                    {a.accountNo !== "-" && <p className="text-xs font-mono text-primary mt-0.5">A/C: {a.accountNo}</p>}
                  </div>
                  <Badge variant={statusVariant[a.status as keyof typeof statusVariant]} className="gap-1">
                    {statusIcon[a.status as keyof typeof statusIcon]}{a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
