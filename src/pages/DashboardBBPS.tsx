import { Receipt, Zap, Droplets, Flame, Smartphone, Tv, Car, ShieldCheck, Search, CheckCircle2, Clock, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { TPinDialog } from "@/components/TPinDialog";
import { useToast } from "@/hooks/use-toast";
import { bbpsService, triggerCommission } from "@/services/instantpay";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { id: "ELECTRICITY", label: "Electricity", icon: Zap, color: "text-warning" },
  { id: "WATER", label: "Water", icon: Droplets, color: "text-primary" },
  { id: "GAS", label: "Gas & LPG", icon: Flame, color: "text-destructive" },
  { id: "MOBILE", label: "Mobile", icon: Smartphone, color: "text-success" },
  { id: "DTH", label: "DTH", icon: Tv, color: "text-accent" },
  { id: "FASTAG", label: "FASTag", icon: Car, color: "text-warning" },
  { id: "INSURANCE", label: "Insurance", icon: ShieldCheck, color: "text-primary" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
  failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

interface BillInfo {
  amount: number;
  dueDate: string;
  consumerName: string;
  billNumber?: string;
}

interface BbpsTxn {
  id: string;
  category: string;
  provider: string;
  consumer: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function BBPSPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState("ELECTRICITY");
  const [billers, setBillers] = useState<{ id: string; name: string }[]>([]);
  const [selectedBiller, setSelectedBiller] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);
  const [fetchingBill, setFetchingBill] = useState(false);
  const [loadingBillers, setLoadingBillers] = useState(false);
  const [tpinOpen, setTpinOpen] = useState(false);
  const [transactions, setTransactions] = useState<BbpsTxn[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchBillers(); }, [activeCategory]);
  useEffect(() => { fetchTransactions(); }, [user]);

  const fetchBillers = async () => {
    setLoadingBillers(true);
    setBillers([]); setSelectedBiller(""); setBillInfo(null);
    try {
      const res = await bbpsService.fetchBillers(activeCategory);
      setBillers(res?.data?.billers || []);
    } catch {
      // silently fail — billers will be empty
    }
    setLoadingBillers(false);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoadingTxns(true);
    try {
      const data = await apiFetch("/transactions?service=bbps");
      setTransactions(data as BbpsTxn[]);
    } catch (err) {
      console.error("Error fetching BBPS transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleFetchBill = async () => {
    if (!selectedBiller || !consumerNumber) {
      toast({ title: "Select biller & enter consumer number", variant: "destructive" });
      return;
    }
    setFetchingBill(true);
    setBillInfo(null);
    try {
      const res = await bbpsService.fetchBill(selectedBiller, consumerNumber);
      if (res?.data) {
        setBillInfo({
          amount: res.data.amount,
          dueDate: res.data.dueDate || "—",
          consumerName: res.data.consumerName || "—",
          billNumber: res.data.billNumber,
        });
      } else {
        toast({ title: "Could not fetch bill", description: "Check consumer number or try again.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setFetchingBill(false);
  };

  const handlePayClick = () => {
    if (!billInfo) {
      toast({ title: "Fetch bill first", variant: "destructive" });
      return;
    }
    setTpinOpen(true);
  };

  const processBillPayment = async () => {
    try {
      const res = await bbpsService.payBill({
        biller_id: selectedBiller,
        consumer_number: consumerNumber,
        amount: billInfo!.amount,
        mobile_number: mobileNumber || "9999999999",
      });
      toast({ title: "Bill Paid! ✓", description: `₹${billInfo!.amount.toLocaleString("en-IN")} paid. Ref: ${res?.data?.refId || "—"}` });
      triggerCommission("bbps", billInfo!.amount); // auto-credit commissions
      setBillInfo(null); setConsumerNumber("");
      fetchTransactions();
    } catch (e: any) {
      toast({ title: "Payment Failed", description: e.message, variant: "destructive" });
    }
  };

  const filteredTxns = transactions.filter(t =>
    !searchTerm || t.provider?.toLowerCase().includes(searchTerm.toLowerCase()) || t.consumer?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">BBPS — Bill Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Bharat Bill Payment System — pay utility bills and more.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${activeCategory === cat.id ? "bg-primary/10 border-primary" : "bg-gradient-card border-border hover:border-primary/40"}`}
          >
            <cat.icon className={`w-4 h-4 ${cat.color}`} />
            <span className="text-sm font-medium text-foreground">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Pay Bill</h2>
          </div>

          <div>
            <Label>Provider / Biller</Label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground"
              value={selectedBiller}
              onChange={(e) => { setSelectedBiller(e.target.value); setBillInfo(null); }}
            >
              <option value="">{loadingBillers ? "Loading billers..." : "Select provider"}</option>
              {billers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div><Label>Consumer / Account Number</Label><Input placeholder="Enter consumer number" className="bg-secondary/50 mt-1" value={consumerNumber} onChange={(e) => { setConsumerNumber(e.target.value); setBillInfo(null); }} /></div>
          <div><Label>Your Mobile Number</Label><Input placeholder="10-digit mobile" className="bg-secondary/50 mt-1" value={mobileNumber} maxLength={10} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} /></div>

          <Button variant="outline" size="sm" className="w-full" onClick={handleFetchBill} disabled={fetchingBill}>
            {fetchingBill ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            {fetchingBill ? "Fetching..." : "Fetch Bill"}
          </Button>

          {billInfo && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Bill Amount</span><span className="text-foreground font-bold">₹{billInfo.amount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Due Date</span><span className="text-foreground">{billInfo.dueDate}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Consumer Name</span><span className="text-foreground">{billInfo.consumerName}</span></div>
              {billInfo.billNumber && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Bill No.</span><span className="text-foreground font-mono">{billInfo.billNumber}</span></div>}
            </div>
          )}

          <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold" onClick={handlePayClick} disabled={!billInfo}>
            {billInfo ? `Pay ₹${billInfo.amount.toLocaleString("en-IN")}` : "Fetch bill to pay"}
          </Button>
        </div>

        {/* Recent */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Recent Payments</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card max-w-xs">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Search..." autoComplete="off" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
              </div>
              <Button variant="ghost" size="sm" onClick={fetchTransactions}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingTxns ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredTxns.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No BBPS transactions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["ID", "Category", "Provider", "Consumer", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredTxns.map((bill) => {
                    const Cfg = statusConfig[bill.status] || statusConfig.Pending;
                    return (
                      <tr key={bill.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-primary">{bill.id.slice(0, 8)}…</td>
                        <td className="py-3 px-4 text-foreground text-xs">{bill.category}</td>
                        <td className="py-3 px-4 text-foreground text-xs">{bill.provider}</td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{bill.consumer}</td>
                        <td className="py-3 px-4 font-medium text-foreground">₹{bill.amount?.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                            <Cfg.icon className="w-3 h-3" />{bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(bill.created_at).toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <TPinDialog
        open={tpinOpen}
        onOpenChange={setTpinOpen}
        amount={billInfo?.amount ?? 0}
        description={`Bill Payment of ₹${(billInfo?.amount ?? 0).toLocaleString("en-IN")}`}
        onSuccess={processBillPayment}
      />
    </div>
  );
}
