import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tv, Wifi, Zap, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { TPinDialog } from "@/components/TPinDialog";
import { useToast } from "@/hooks/use-toast";
import { bbpsService } from "@/services/instantpay";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

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

interface RechargeTxn {
  id: string;
  consumer: string;
  provider: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function DashboardRecharge() {
  const { user } = useAuth();
  const [tab, setTab] = useState("mobile");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [tpinOpen, setTpinOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [processing, setProcessing] = useState(false);
  const [recentRecharges, setRecentRecharges] = useState<RechargeTxn[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  useEffect(() => { fetchRecentRecharges(); }, [user]);

  const fetchRecentRecharges = async () => {
    if (!user) return;
    setLoadingTxns(true);
    try {
      const data = await apiFetch("/transactions?service=recharge");
      setRecentRecharges(data as RechargeTxn[]);
    } catch (err) {
      console.error("Error fetching recent recharges:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleRechargeClick = () => {
    if (!selectedPlan || selectedPlan <= 0) {
      toast({ title: "Enter Amount", description: "Please select a plan or enter an amount.", variant: "destructive" });
      return;
    }
    if (!mobileNumber || (tab !== "dth" && mobileNumber.length !== 10)) {
      toast({ title: "Enter Mobile/ID", description: "Please enter a valid number.", variant: "destructive" });
      return;
    }
    if (!selectedOperator) {
      toast({ title: "Select Operator", variant: "destructive" });
      return;
    }
    setTpinOpen(true);
  };

  const processRecharge = async () => {
    setProcessing(true);
    try {
      const res = await bbpsService.recharge({
        biller_id: selectedOperator, // operator biller ID from InstantPay
        mobile_number: mobileNumber,
        amount: selectedPlan!,
        operator: selectedOperator,
        recharge_type: "PREPAID",
      });
      toast({ title: "Recharge Successful! ✓", description: `₹${selectedPlan} recharge initiated. Ref: ${res?.data?.refId || "—"}` });
      setSelectedPlan(null); setMobileNumber(""); setSelectedOperator("");
      fetchRecentRecharges();
    } catch (e: any) {
      toast({ title: "Recharge Failed", description: e.message, variant: "destructive" });
    }
    setProcessing(false);
  };

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
                    <Input
                      placeholder={type === "dth" ? "Enter customer ID" : "Enter 10-digit number"}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select value={selectedOperator} onValueChange={setSelectedOperator}>
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
                  <Button className="w-full" onClick={handleRechargeClick} disabled={processing}>
                    {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    {processing ? "Processing..." : "Recharge Now"}
                  </Button>
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
                {loadingTxns ? (
                  <tr><td colSpan={6} className="py-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></td></tr>
                ) : recentRecharges.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No recent recharges</td></tr>
                ) : (
                  recentRecharges.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 font-mono text-[10px] text-primary">{r.id.slice(0, 8)}…</td>
                      <td className="py-2">{r.consumer}</td>
                      <td className="py-2 capitalize">{r.provider}</td>
                      <td className="py-2 text-right font-medium">₹{r.amount}</td>
                      <td className="py-2 text-xs uppercase font-medium">
                        <Badge variant={r.status === "success" || r.status === "Success" ? "default" : "secondary"} className="gap-1">
                          {(r.status === "success" || r.status === "Success") ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TPinDialog
        open={tpinOpen}
        onOpenChange={setTpinOpen}
        amount={selectedPlan ?? 0}
        description={`Mobile Recharge of ₹${selectedPlan?.toLocaleString("en-IN") ?? 0}`}
        onSuccess={processRecharge}
      />
    </div>
  );
}
