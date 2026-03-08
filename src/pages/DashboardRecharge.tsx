import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tv, Wifi, Zap, CheckCircle2, Clock } from "lucide-react";

const operators = {
  mobile: ["Jio", "Airtel", "Vi", "BSNL"],
  dth: ["Tata Play", "Airtel Digital TV", "Dish TV", "Sun Direct"],
  data: ["Jio", "Airtel", "Vi", "BSNL"],
};

const plans = [
  { amount: 199, validity: "28 days", data: "1.5 GB/day", description: "Unlimited calls + 100 SMS/day" },
  { amount: 299, validity: "28 days", data: "2 GB/day", description: "Unlimited calls + 100 SMS/day" },
  { amount: 599, validity: "56 days", data: "2 GB/day", description: "Unlimited calls + 100 SMS/day" },
  { amount: 999, validity: "84 days", data: "2.5 GB/day", description: "Unlimited calls + 100 SMS/day" },
];

const recentRecharges = [
  { id: "R001", number: "98765xxxxx", operator: "Jio", amount: 299, status: "success", date: "2026-03-08" },
  { id: "R002", number: "87654xxxxx", operator: "Airtel", amount: 599, status: "success", date: "2026-03-07" },
  { id: "R003", number: "76543xxxxx", operator: "Vi", amount: 199, status: "pending", date: "2026-03-07" },
];

export default function DashboardRecharge() {
  const [tab, setTab] = useState("mobile");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Recharge</h1>
        <p className="text-sm text-muted-foreground">Mobile, DTH, and data card recharges for all major operators.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="mobile" className="gap-1.5"><Smartphone className="w-4 h-4" /> Mobile</TabsTrigger>
          <TabsTrigger value="dth" className="gap-1.5"><Tv className="w-4 h-4" /> DTH</TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5"><Wifi className="w-4 h-4" /> Data Card</TabsTrigger>
        </TabsList>

        {["mobile", "dth", "data"].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg">New Recharge</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{type === "dth" ? "Customer ID" : "Mobile Number"}</Label>
                    <Input placeholder={type === "dth" ? "Enter customer ID" : "Enter 10-digit number"} />
                  </div>
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select operator" /></SelectTrigger>
                      <SelectContent>
                        {operators[type as keyof typeof operators].map((op) => (
                          <SelectItem key={op} value={op.toLowerCase()}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input type="number" value={selectedPlan ?? ""} onChange={(e) => setSelectedPlan(Number(e.target.value))} placeholder="Enter amount" />
                  </div>
                  <Button className="w-full"><Zap className="w-4 h-4 mr-2" /> Recharge Now</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Popular Plans</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.amount}
                      onClick={() => setSelectedPlan(plan.amount)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedPlan === plan.amount ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-foreground">₹{plan.amount}</span>
                        <Badge variant="secondary">{plan.validity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.data} • {plan.description}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Recharges</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">ID</th>
                <th className="text-left py-2 font-medium">Number</th>
                <th className="text-left py-2 font-medium">Operator</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {recentRecharges.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{r.id}</td>
                    <td className="py-2">{r.number}</td>
                    <td className="py-2">{r.operator}</td>
                    <td className="py-2 text-right font-medium">₹{r.amount}</td>
                    <td className="py-2">
                      <Badge variant={r.status === "success" ? "default" : "secondary"} className="gap-1">
                        {r.status === "success" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">{r.date}</td>
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
