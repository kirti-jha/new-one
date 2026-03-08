import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Package, CheckCircle2, Clock, XCircle, Wifi, Battery } from "lucide-react";

const models = [
  { name: "SoundBox Pro", connectivity: "4G + WiFi", battery: "72 hrs", price: "₹2,999", languages: "Hindi, English, Tamil, Telugu" },
  { name: "SoundBox Lite", connectivity: "Bluetooth", battery: "48 hrs", price: "₹1,499", languages: "Hindi, English" },
  { name: "SoundBox Max", connectivity: "4G + WiFi + BT", battery: "96 hrs", price: "₹4,499", languages: "12 Languages" },
];

const deployments = [
  { id: "SB01", merchant: "Patel Kirana Store", model: "Pro", serial: "SB-PRO-001", status: "active", date: "2026-03-06" },
  { id: "SB02", merchant: "New India Medicals", model: "Max", serial: "SB-MAX-001", status: "active", date: "2026-03-04" },
  { id: "SB03", merchant: "Quick Bites Cafe", model: "Lite", serial: "SB-LIT-001", status: "pending", date: "2026-03-08" },
  { id: "SB04", merchant: "Raj Auto Parts", model: "Pro", serial: "SB-PRO-002", status: "returned", date: "2026-02-28" },
];

const statusVariant = { active: "default" as const, pending: "secondary" as const, returned: "destructive" as const };
const statusIcon = { active: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, returned: <XCircle className="w-3 h-3" /> };

export default function DashboardSoundBox() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Sound Box</h1>
        <p className="text-sm text-muted-foreground">Payment notification sound box for merchants.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {models.map((m) => (
          <Card key={m.name}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Volume2 className="w-5 h-5 text-primary" /></div>
                <div><p className="font-semibold text-foreground text-sm">{m.name}</p><p className="text-lg font-bold text-foreground">{m.price}</p></div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Wifi className="w-3 h-3" />{m.connectivity}</p>
                <p className="flex items-center gap-1.5"><Battery className="w-3 h-3" />{m.battery} battery</p>
                <p className="flex items-center gap-1.5"><Volume2 className="w-3 h-3" />{m.languages}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Sound Box</CardTitle>
            <CardDescription>Deploy a payment sound box for a merchant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Merchant Name</Label><Input placeholder="Business name" /></div>
            <div className="space-y-2"><Label>Contact Number</Label><Input placeholder="10-digit number" /></div>
            <div className="space-y-2"><Label>Business Address</Label><Input placeholder="Full address" /></div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>{models.map((m) => <SelectItem key={m.name} value={m.name}>{m.name} — {m.price}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>UPI ID / VPA</Label>
              <Input placeholder="merchant@upi" />
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
