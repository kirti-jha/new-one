import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Package, CheckCircle2, Clock, XCircle } from "lucide-react";

const posModels = [
  { name: "Android POS A920", brand: "PAX", price: "₹12,000", features: "Touchscreen, Printer, NFC" },
  { name: "mPOS D210", brand: "PAX", price: "₹5,500", features: "Bluetooth, Card Swipe" },
  { name: "Smart POS V2", brand: "Wiseasy", price: "₹15,000", features: "4G, Dual SIM, Camera" },
];

const deployments = [
  { id: "POS01", merchant: "Sharma General Store", model: "A920", serial: "PAX-2026-001", status: "active", date: "2026-03-05" },
  { id: "POS02", merchant: "City Pharmacy", model: "D210", serial: "PAX-2026-002", status: "active", date: "2026-03-03" },
  { id: "POS03", merchant: "Gupta Electronics", model: "V2", serial: "WIS-2026-001", status: "pending", date: "2026-03-07" },
  { id: "POS04", merchant: "Fresh Mart", model: "A920", serial: "PAX-2026-003", status: "returned", date: "2026-02-20" },
];

const statusVariant = { active: "default" as const, pending: "secondary" as const, returned: "destructive" as const };
const statusIcon = { active: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, returned: <XCircle className="w-3 h-3" /> };

export default function DashboardPOS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">POS Machine</h1>
        <p className="text-sm text-muted-foreground">Point of Sale machine deployment and management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {posModels.map((m) => (
          <Card key={m.name}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Landmark className="w-5 h-5 text-primary" /></div>
                <div><p className="font-semibold text-foreground text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.brand}</p></div>
              </div>
              <p className="text-xs text-muted-foreground">{m.features}</p>
              <p className="text-lg font-bold text-foreground mt-2">{m.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request POS Deployment</CardTitle>
            <CardDescription>Submit a request to deploy a POS machine for a merchant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Merchant Name</Label><Input placeholder="Business name" /></div>
            <div className="space-y-2"><Label>Contact Number</Label><Input placeholder="10-digit number" /></div>
            <div className="space-y-2"><Label>Business Address</Label><Input placeholder="Full address" /></div>
            <div className="space-y-2">
              <Label>POS Model</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>{posModels.map((m) => <SelectItem key={m.name} value={m.name}>{m.name} ({m.brand})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full"><Package className="w-4 h-4 mr-2" /> Submit Request</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Deployments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{d.merchant}</p>
                    <p className="text-xs text-muted-foreground">{d.model} • {d.serial} • {d.date}</p>
                  </div>
                  <Badge variant={statusVariant[d.status as keyof typeof statusVariant]} className="gap-1">
                    {statusIcon[d.status as keyof typeof statusIcon]}{d.status}
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
