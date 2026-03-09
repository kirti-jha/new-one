import {
  Fingerprint, CheckCircle2, XCircle, Clock, IndianRupee, CreditCard,
  FileText, Smartphone, Loader2, RefreshCw, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TPinDialog } from "@/components/TPinDialog";
import { aepsService } from "@/services/instantpay";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const serviceCards = [
  { label: "Cash Withdrawal", icon: IndianRupee, desc: "Withdraw cash using fingerprint", color: "text-success", needsAmount: true },
  { label: "Balance Enquiry", icon: CreditCard, desc: "Check account balance", color: "text-primary", needsAmount: false },
  { label: "Mini Statement", icon: FileText, desc: "Last 10 transactions", color: "text-accent", needsAmount: false },
  { label: "Aadhaar Pay", icon: Smartphone, desc: "Merchant payment via Aadhaar", color: "text-warning", needsAmount: true },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
  failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

interface BankOption { iin: string; name: string; }
interface AepsTxn {
  id: string;
  type: string;
  customer: string;
  aadhaar: string;
  bank: string;
  amount: number | null;
  status: string;
  created_at: string;
}

export default function AEPSPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Operation state
  const [activeService, setActiveService] = useState("Cash Withdrawal");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [selectedBankIIN, setSelectedBankIIN] = useState("");
  const [amount, setAmount] = useState("");
  const [pidData, setPidData] = useState(""); // biometric PID XML
  const [tpinOpen, setTpinOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Bank list
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState<AepsTxn[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  // Outlet login status
  const [outletLoggedIn, setOutletLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetchBanks();
    fetchTransactions();
    checkOutletStatus();
  }, [user]);

  const checkOutletStatus = async () => {
    // In production, merchant_code & terminal_id come from the user's profile/settings
    const merchantCode = "MERCHANT001"; // placeholder until profile stores it
    const terminalId = "TERM001";
    try {
      const res = await aepsService.outletLoginStatus(merchantCode, terminalId);
      setOutletLoggedIn(res?.data?.isLoggedIn === true);
    } catch {
      setOutletLoggedIn(false);
    }
  };

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await aepsService.getBankList();
      setBanks(res?.data?.banks || []);
    } catch {
      // fallback to common banks
      setBanks([
        { iin: "607060", name: "State Bank of India" },
        { iin: "508505", name: "Punjab National Bank" },
        { iin: "508534", name: "Bank of Baroda" },
        { iin: "607153", name: "HDFC Bank" },
        { iin: "508501", name: "ICICI Bank" },
        { iin: "607059", name: "Canara Bank" },
        { iin: "607105", name: "Bank of India" },
        { iin: "608609", name: "Axis Bank" },
      ]);
    }
    setLoadingBanks(false);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoadingTxns(true);
    try {
      const data = await apiFetch("/transactions?service=aeps");
      setTransactions(data as AepsTxn[]);
    } catch (err) {
      console.error("Error fetching AEPS transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const activeCard = serviceCards.find((s) => s.label === activeService);

  const handleProceedClick = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast({ title: "Invalid Aadhaar", description: "Enter 12-digit Aadhaar number.", variant: "destructive" });
      return;
    }
    if (!selectedBankIIN) {
      toast({ title: "Select Bank", variant: "destructive" });
      return;
    }
    if (activeCard?.needsAmount && (!amount || parseFloat(amount) <= 0)) {
      toast({ title: "Enter Amount", variant: "destructive" });
      return;
    }
    if (!pidData.trim()) {
      toast({ title: "Capture Biometric", description: "Capture fingerprint from device first.", variant: "destructive" });
      return;
    }
    setTpinOpen(true);
  };

  const processAepsTransaction = async () => {
    setProcessing(true);
    const commonParams = {
      aadhaar_number: aadhaarNumber,
      bank_iin: selectedBankIIN,
      merchant_code: "MERCHANT001", // from profile in production
      terminal_id: "TERM001",
      pid_data: pidData,
      latitude: "28.6139", // from browser geolocation in production
      longitude: "77.2090",
    };

    try {
      let res;
      switch (activeService) {
        case "Cash Withdrawal":
          res = await aepsService.cashWithdrawal({ ...commonParams, amount: parseFloat(amount) });
          break;
        case "Balance Enquiry":
          res = await aepsService.balanceEnquiry(commonParams);
          break;
        case "Mini Statement":
          res = await aepsService.miniStatement(commonParams);
          break;
        case "Aadhaar Pay":
          res = await aepsService.cashDeposit({ ...commonParams, amount: parseFloat(amount) });
          break;
      }

      const txnId = res?.data?.txnId || "—";
      toast({
        title: `${activeService} Successful! ✓`,
        description: `Transaction ID: ${txnId}${res?.data?.balance ? ` | Balance: ₹${res.data.balance}` : ""}`,
      });
      setAadhaarNumber(""); setAmount(""); setPidData("");
      fetchTransactions();
    } catch (e: any) {
      toast({ title: `${activeService} Failed`, description: e.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">AEPS Services</h1>
        <p className="text-sm text-muted-foreground mt-1">Aadhaar Enabled Payment System — biometric banking at your fingertips.</p>
      </div>

      {/* Outlet Status Banner */}
      {outletLoggedIn === false && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">Outlet Not Logged In</p>
            <p className="text-xs text-muted-foreground">Perform outlet login daily before processing AePS transactions.</p>
          </div>
        </div>
      )}
      {outletLoggedIn === true && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/30 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" /> Outlet logged in — ready for transactions
        </div>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceCards.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveService(s.label)}
            className={`p-4 rounded-xl border text-left transition-all ${activeService === s.label ? "bg-primary/10 border-primary shadow-glow" : "bg-gradient-card border-border hover:border-primary/40"}`}
          >
            <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
            <div className="font-heading font-semibold text-foreground text-sm">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Transaction Form + History */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">{activeService}</h2>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Aadhaar Number *</Label>
              <Input
                placeholder="XXXX XXXX XXXX"
                className="bg-secondary/50 mt-1 tracking-widest"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
              />
            </div>
            <div>
              <Label>Bank *</Label>
              <select
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground"
                value={selectedBankIIN}
                onChange={(e) => setSelectedBankIIN(e.target.value)}
              >
                <option value="">{loadingBanks ? "Loading banks..." : "Select Bank"}</option>
                {banks.map((b) => <option key={b.iin} value={b.iin}>{b.name}</option>)}
              </select>
            </div>

            {activeCard?.needsAmount && (
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="bg-secondary/50 mt-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            )}

            {/* Biometric PID data - in production this comes from device SDK */}
            <div>
              <Label>Biometric PID Data</Label>
              <textarea
                rows={3}
                placeholder="Paste PID XML from biometric device SDK here (auto-filled in production)"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-xs text-foreground font-mono resize-none"
                value={pidData}
                onChange={(e) => setPidData(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium">⚠ Connect biometric device before proceeding</p>
              <p className="text-xs text-muted-foreground mt-1">Supported: Mantra MFS100, Morpho MSO 1300, Startek FM220</p>
            </div>

            <Button
              className="w-full bg-gradient-primary text-primary-foreground font-semibold"
              onClick={handleProceedClick}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Fingerprint className="w-4 h-4 mr-2" />}
              {processing ? "Processing..." : "Capture & Proceed"}
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Recent AEPS Transactions</h2>
            <Button variant="ghost" size="sm" onClick={fetchTransactions}><RefreshCw className="w-4 h-4" /></Button>
          </div>
          <div className="overflow-x-auto">
            {loadingTxns ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No AEPS transactions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["ID", "Type", "Bank", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {transactions.map((txn) => {
                    const Cfg = statusConfig[txn.status] || statusConfig.Pending;
                    return (
                      <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-primary">{txn.id.slice(0, 8)}…</td>
                        <td className="py-3 px-4 text-foreground text-xs">{txn.type}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{txn.bank}</td>
                        <td className="py-3 px-4 font-medium text-foreground">{txn.amount != null ? `₹${txn.amount.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                            <Cfg.icon className="w-3 h-3" />{txn.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(txn.created_at).toLocaleString("en-IN")}</td>
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
        amount={activeCard?.needsAmount ? (parseFloat(amount) || 0) : 0}
        description={`AePS ${activeService}${activeCard?.needsAmount ? ` of ₹${parseFloat(amount || "0").toLocaleString("en-IN")}` : ""}`}
        onSuccess={processAepsTransaction}
      />
    </div>
  );
}
