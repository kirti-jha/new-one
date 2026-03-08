import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Heart, Car, Home, CheckCircle2, Clock } from "lucide-react";

const insuranceTypes = [
  { id: "life", label: "Life Insurance", icon: ShieldCheck, desc: "Term & endowment plans" },
  { id: "health", label: "Health Insurance", icon: Heart, desc: "Mediclaim & critical illness" },
  { id: "motor", label: "Motor Insurance", icon: Car, desc: "Two-wheeler & four-wheeler" },
  { id: "home", label: "Home Insurance", icon: Home, desc: "Structure & content protection" },
];

const policies = [
  { id: "INS01", customer: "Rakesh Nair", type: "Health", provider: "Star Health", premium: 12000, status: "active", date: "2026-03-08" },
  { id: "INS02", customer: "Sunita Reddy", type: "Motor", provider: "ICICI Lombard", premium: 5600, status: "active", date: "2026-03-07" },
  { id: "INS03", customer: "Vijay Sharma", type: "Life", provider: "LIC", premium: 24000, status: "pending", date: "2026-03-06" },
];

export default function DashboardInsurance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Insurance</h1>
        <p className="text-sm text-muted-foreground">Life, health, and general insurance premium collection.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insuranceTypes.map((t) => (
          <Card key={t.id} className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <t.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Premium Collection</CardTitle>
            <CardDescription>Collect insurance premium payment from customer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Insurance Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{insuranceTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Policy Number</Label><Input placeholder="Policy / proposal number" /></div>
              <div className="space-y-2"><Label>Customer Name</Label><Input placeholder="Policy holder name" /></div>
              <div className="space-y-2"><Label>Premium Amount (₹)</Label><Input type="number" placeholder="Premium amount" /></div>
            </div>
            <Button className="w-full"><ShieldCheck className="w-4 h-4 mr-2" /> Collect Premium</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Collections</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.customer}</p>
                    <p className="text-xs text-muted-foreground">{p.type} • {p.provider} • {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{p.premium.toLocaleString("en-IN")}</p>
                    <Badge variant={p.status === "active" ? "default" : "secondary"} className="gap-1 mt-1">
                      {p.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{p.status}
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
