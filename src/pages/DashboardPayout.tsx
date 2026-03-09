import {
  ArrowUpRight, Wallet, Smartphone, CreditCard, Building2,
  CheckCircle2, XCircle, Clock, Loader2, RefreshCw, BadgeCheck, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TPinDialog } from "@/components/TPinDialog";
import { payoutService, verifyService } from "@/services/instantpay";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const payoutModes = [
  { id: "bank", label: "Bank Transfer", icon: Building2, desc: "IMPS / NEFT / RTGS" },
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Instant via UPI VPA" },
  { id: "wallet", label: "Wallet", icon: Wallet, desc: "Paytm, PhonePe, etc." },
  { id: "credit_card", label: "Credit Card", icon: CreditCard, desc: "Pay credit card bill" },
];

const transferModes = ["IMPS", "NEFT", "RTGS"];
const walletNames = ["PAYTM", "PHONEPAY", "AMAZON_PAY", "MOBIKWIK"];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
  failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

interface PayoutTxn {
  id: string;
  type: string;
  beneficiary: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function DashboardPayout() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeMode, setActiveMode] = useState("bank");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [tpinOpen, setTpinOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Bank transfer fields
  const [benefName, setBenefName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [transferMode, setTransferMode] = useState("IMPS");
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // UPI fields
  const [upiVpa, setUpiVpa] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  // Wallet fields
  const [walletMobile, setWalletMobile] = useState("");
  const [walletName, setWalletName] = useState("PAYTM");

  // Credit card fields
  const [cardNumber, setCardNumber] = useState("");

  const [transactions, setTransactions] = useState<PayoutTxn[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  useEffect(() => { fetchTransactions(); }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoadingTxns(true);
    try {
      const data = await apiFetch("/transactions?service=payout");
      setTransactions(data as PayoutTxn[]);
    } catch (err) {
      console.error("Error fetching Payout transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!accountNumber || !ifsc) { toast({ title: "Fill account details", variant: "destructive" }); return; }
    setVerifying(true);
    try {
      const res = await verifyService.bankAccountVerify(accountNumber, ifsc);
      if (res?.data?.status === "success") {
        setAccountVerified(true);
        if (res.data.accountHolderName) setBenefName(res.data.accountHolderName);
        toast({ title: "Account Verified ✓", description: `Name: ${res.data.accountHolderName || benefName}` });
      } else {
        toast({ title: "Verification Failed", description: "Invalid account or IFSC.", variant: "destructive" });
      }
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setVerifying(false);
  };

  const handleVerifyUpi = async () => {
    if (!upiVpa) { toast({ title: "Enter UPI ID", variant: "destructive" }); return; }
    setVerifyingUpi(true);
    try {
      const res = await verifyService.upiVerify(upiVpa);
      if (res?.data?.isValid) {
        setUpiVerified(true);
        toast({ title: "UPI Verified ✓", description: `Name: ${res.data.payeeName || upiVpa}` });
      } else {
        toast({ title: "Invalid UPI ID", variant: "destructive" });
      }
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setVerifyingUpi(false);
  };

  const validateAndOpenTpin = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Enter Amount", variant: "destructive" }); return;
    }
    if (activeMode === "bank" && (!accountNumber || !ifsc || !benefName)) {
      toast({ title: "Fill all bank details", variant: "destructive" }); return;
    }
    if (activeMode === "upi" && !upiVpa) {
      toast({ title: "Enter UPI ID", variant: "destructive" }); return;
    }
    if (activeMode === "wallet" && walletMobile.length !== 10) {
      toast({ title: "Enter valid mobile number", variant: "destructive" }); return;
    }
    if (activeMode === "credit_card" && cardNumber.length < 16) {
      toast({ title: "Enter valid card number", variant: "destructive" }); return;
    }
    setTpinOpen(true);
  };

  const processPayout = async () => {
    setProcessing(true);
    try {
      let res;
      switch (activeMode) {
        case "bank":
          res = await payoutService.payToBank({
            beneficiary_name: benefName,
            account_number: accountNumber,
            ifsc_code: ifsc,
            amount: parseFloat(amount),
            remarks: remarks || "Payout",
            transfer_mode: transferMode as "IMPS" | "NEFT" | "RTGS",
          });
          break;
        case "upi":
          res = await payoutService.payToUpi(upiVpa, parseFloat(amount), remarks);
          break;
        case "wallet":
          res = await payoutService.payToWallet(walletMobile, walletName, parseFloat(amount));
          break;
        case "credit_card":
          res = await payoutService.payCreditCard(cardNumber, parseFloat(amount));
          break;
      }
      toast({
        title: "Payout Initiated! ✓",
        description: `₹${parseFloat(amount).toLocaleString("en-IN")} sent. Ref: ${res?.data?.txnId || "—"}`,
      });
      setAmount(""); setRemarks(""); setAccountNumber(""); setIfsc(""); setBenefName("");
      setUpiVpa(""); setWalletMobile(""); setCardNumber(""); setAccountVerified(false); setUpiVerified(false);
      fetchTransactions();
    } catch (e: any) {
      toast({ title: "Payout Failed", description: e.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const filteredTxns = transactions.filter(t =>
    !searchTerm || t.beneficiary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Payout</h1>
        <p className="text-sm text-muted-foreground mt-1">Send money to bank accounts, UPI, wallets, and credit cards instantly.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-3">
        {payoutModes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setActiveMode(m.id); setAccountVerified(false); setUpiVerified(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${activeMode === m.id ? "bg-primary/10 border-primary" : "bg-gradient-card border-border hover:border-primary/40"}`}
          >
            <m.icon className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">{m.label}</div>
              <div className="text-[10px] text-muted-foreground">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">{payoutModes.find(m => m.id === activeMode)?.label}</h2>
          </div>

          {/* BANK */}
          {activeMode === "bank" && (
            <>
              <div><Label>Beneficiary Name *</Label><Input className="bg-secondary/50 mt-1" placeholder="Account holder name" value={benefName} onChange={(e) => setBenefName(e.target.value)} /></div>
              <div><Label>Account Number *</Label><Input className="bg-secondary/50 mt-1" placeholder="Bank account number" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); setAccountVerified(false); }} /></div>
              <div><Label>IFSC Code *</Label><Input className="bg-secondary/50 mt-1" placeholder="SBIN0001234" value={ifsc} onChange={(e) => { setIfsc(e.target.value.toUpperCase()); setAccountVerified(false); }} /></div>
              <div>
                <Label>Transfer Mode</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground" value={transferMode} onChange={(e) => setTransferMode(e.target.value)}>
                  {transferModes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleVerifyAccount} disabled={verifying || !accountNumber || !ifsc}>
                {verifying ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BadgeCheck className="w-4 h-4 mr-1" />}
                {accountVerified ? "✓ Account Verified" : "Verify Account (Penny Drop)"}
              </Button>
            </>
          )}

          {/* UPI */}
          {activeMode === "upi" && (
            <>
              <div><Label>UPI VPA / ID *</Label><Input className="bg-secondary/50 mt-1" placeholder="name@upi" value={upiVpa} onChange={(e) => { setUpiVpa(e.target.value); setUpiVerified(false); }} /></div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleVerifyUpi} disabled={verifyingUpi || !upiVpa}>
                {verifyingUpi ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BadgeCheck className="w-4 h-4 mr-1" />}
                {upiVerified ? "✓ UPI Verified" : "Verify UPI ID"}
              </Button>
            </>
          )}

          {/* WALLET */}
          {activeMode === "wallet" && (
            <>
              <div><Label>Mobile Number *</Label><Input className="bg-secondary/50 mt-1" placeholder="10-digit mobile" maxLength={10} value={walletMobile} onChange={(e) => setWalletMobile(e.target.value.replace(/\D/g, ""))} /></div>
              <div>
                <Label>Wallet</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground" value={walletName} onChange={(e) => setWalletName(e.target.value)}>
                  {walletNames.map(w => <option key={w} value={w}>{w.replace("_", " ")}</option>)}
                </select>
              </div>
            </>
          )}

          {/* CREDIT CARD */}
          {activeMode === "credit_card" && (
            <div><Label>Card Number *</Label><Input className="bg-secondary/50 mt-1" placeholder="16-digit card number" maxLength={16} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))} /></div>
          )}

          {/* Common fields */}
          <div><Label>Amount (₹) *</Label><Input type="number" className="bg-secondary/50 mt-1" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Remarks <span className="text-muted-foreground font-normal">(optional)</span></Label><Input className="bg-secondary/50 mt-1" placeholder="Payment purpose" value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>

          <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold" onClick={validateAndOpenTpin} disabled={processing}>
            {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
            {processing ? "Processing..." : "Send Payment"}
          </Button>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Payout Transactions</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Search..." autoComplete="off" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" />
              </div>
              <Button variant="ghost" size="sm" onClick={fetchTransactions}><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingTxns ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredTxns.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No payout transactions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["ID", "Type", "Beneficiary", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredTxns.map(txn => {
                    const Cfg = statusConfig[txn.status] || statusConfig.Pending;
                    return (
                      <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-primary">{txn.id.slice(0, 8)}…</td>
                        <td className="py-3 px-4 text-foreground text-xs capitalize">{txn.type}</td>
                        <td className="py-3 px-4 text-foreground text-xs">{txn.beneficiary}</td>
                        <td className="py-3 px-4 font-medium text-foreground">₹{txn.amount?.toLocaleString("en-IN")}</td>
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
        amount={parseFloat(amount) || 0}
        description={`Payout of ₹${parseFloat(amount || "0").toLocaleString("en-IN")} via ${payoutModes.find(m => m.id === activeMode)?.label}`}
        onSuccess={processPayout}
      />
    </div>
  );
}
