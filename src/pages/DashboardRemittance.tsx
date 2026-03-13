import { Send, Search, UserPlus, CheckCircle2, XCircle, Clock, BadgeCheck, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { TPinDialog } from "@/components/TPinDialog";
import { useToast } from "@/hooks/use-toast";
import { remittanceService, triggerCommission } from "@/services/instantpay";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
  failed: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

interface DmtTransaction {
  id: string;
  sender: string;
  beneficiary: string;
  bank: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function RemittancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [mobile, setMobile] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [benefName, setBenefName] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [tpinOpen, setTpinOpen] = useState(false);

  // Flow state
  const [remitterChecked, setRemitterChecked] = useState(false);
  const [remitterExists, setRemitterExists] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [checkingRemitter, setCheckingRemitter] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sending, setSending] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState<DmtTransaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  useEffect(() => { fetchTransactions(); }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoadingTxns(true);
    try {
      const data = await apiFetch("/transactions?service=remittance");
      setTransactions(data as DmtTransaction[]);
    } catch (err) {
      console.error("Error fetching Remittance transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleCheckRemitter = async () => {
    if (mobile.length !== 10) {
      toast({ title: "Invalid Mobile", description: "Enter 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setCheckingRemitter(true);
    try {
      const res = await remittanceService.checkRemitter(mobile);
      setRemitterExists(res?.data?.isRegistered === true);
      setRemitterChecked(true);
      if (!res?.data?.isRegistered) {
        toast({ title: "Sender Not Registered", description: "Please register this sender first.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setCheckingRemitter(false);
  };

  const handleVerifyAccount = async () => {
    if (!accountNumber || !ifsc) {
      toast({ title: "Fill account details", description: "Enter account number and IFSC code.", variant: "destructive" });
      return;
    }
    setVerifyingAccount(true);
    try {
      const res = await remittanceService.verifyBankAccount(accountNumber, ifsc, benefName);
      if (res?.data?.status === "success") {
        setAccountVerified(true);
        if (res.data.beneficiaryName) setBenefName(res.data.beneficiaryName);
        toast({ title: "Account Verified ✓", description: `Name: ${res.data.beneficiaryName || benefName}` });
      } else {
        toast({ title: "Verification Failed", description: "Could not verify this account. Check details.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setVerifyingAccount(false);
  };

  const handleSendClick = async () => {
    if (!mobile || !accountNumber || !ifsc || !benefName || !amount) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    if (parseFloat(amount) <= 0 || parseFloat(amount) > 5000) {
      toast({ title: "Invalid Amount", description: "Amount must be between ₹1 and ₹5,000.", variant: "destructive" });
      return;
    }
    if (!accountVerified) {
      toast({ title: "Verify Account First", description: "Click 'Verify Account' before sending.", variant: "destructive" });
      return;
    }
    // Generate OTP before showing T-PIN
    setSendingOtp(true);
    try {
      await remittanceService.generateOtp(mobile);
      setOtpSent(true);
      setTpinOpen(true);
    } catch (e: any) {
      toast({ title: "OTP Error", description: e.message, variant: "destructive" });
    }
    setSendingOtp(false);
  };

  const processTransfer = async () => {
    if (!otp) {
      toast({ title: "Enter OTP", description: "Please enter the OTP sent to the sender's mobile.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await remittanceService.sendMoney({
        mobile,
        beneficiary_id: accountNumber, // using account as unique key until API returns ID
        amount: parseFloat(amount),
        otp,
        txn_type: "IMPS",
      });
      toast({ title: "Transfer Initiated!", description: `₹${parseFloat(amount).toLocaleString("en-IN")} sent. Txn ID: ${res?.data?.txnId || "—"}` });
      triggerCommission("remittance", parseFloat(amount)); // auto-credit commissions up hierarchy
      setAmount(""); setOtp(""); setOtpSent(false);
      fetchTransactions();
    } catch (e: any) {
      toast({ title: "Transfer Failed", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Money Transfer (Remittance)</h1>
          <p className="text-sm text-muted-foreground mt-1">Instant IMPS bank-to-bank transfers 24/7. Max ₹5,000/txn.</p>
        </div>
        <Button variant="hero" size="sm" disabled><UserPlus className="w-4 h-4 mr-1" /> Register Sender</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">New Transfer</h2>
            </div>

            {/* Step 1: Sender mobile */}
            <div className="space-y-2">
              <Label>Sender Mobile *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="10-digit mobile number"
                  className="bg-secondary/50"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setRemitterChecked(false); setRemitterExists(false); }}
                />
                <Button size="sm" variant="outline" onClick={handleCheckRemitter} disabled={checkingRemitter || mobile.length !== 10}>
                  {checkingRemitter ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                </Button>
              </div>
              {remitterChecked && (
                <p className={`text-xs ${remitterExists ? "text-success" : "text-destructive"}`}>
                  {remitterExists ? "✓ Sender registered" : "✗ Sender not registered"}
                </p>
              )}
            </div>

            {/* Step 2: Beneficiary details */}
            <div><Label>Beneficiary Name *</Label><Input placeholder="Account holder name" className="bg-secondary/50 mt-1" value={benefName} onChange={(e) => setBenefName(e.target.value)} /></div>
            <div><Label>Account Number *</Label><Input placeholder="Account number" className="bg-secondary/50 mt-1" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); setAccountVerified(false); }} /></div>
            <div><Label>IFSC Code *</Label><Input placeholder="SBIN0001234" className="bg-secondary/50 mt-1" value={ifsc} onChange={(e) => { setIfsc(e.target.value.toUpperCase()); setAccountVerified(false); }} /></div>
            <div><Label>Bank Name</Label><Input placeholder="e.g. State Bank of India" className="bg-secondary/50 mt-1" value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>

            <Button variant="outline" size="sm" className="w-full" onClick={handleVerifyAccount} disabled={verifyingAccount || !accountNumber || !ifsc}>
              {verifyingAccount ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BadgeCheck className="w-4 h-4 mr-1" />}
              {accountVerified ? "✓ Account Verified" : "Verify Account (Penny Drop)"}
            </Button>

            {/* Step 3: Amount */}
            <div>
              <Label>Amount (₹) * <span className="text-muted-foreground font-normal text-xs">Max ₹5,000/txn</span></Label>
              <Input type="number" placeholder="Enter amount" className="bg-secondary/50 mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} max={5000} />
            </div>

            {/* OTP field shown after OTP is sent */}
            {otpSent && (
              <div>
                <Label>Transaction OTP * <span className="text-xs text-muted-foreground">(sent to sender's mobile)</span></Label>
                <Input placeholder="Enter OTP" className="bg-secondary/50 mt-1" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} />
              </div>
            )}

            <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold" onClick={handleSendClick} disabled={sendingOtp || sending}>
              {sendingOtp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {sendingOtp ? "Sending OTP..." : "Send Money via IMPS"}
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Recent Transfers</h2>
            <Button variant="ghost" size="sm" onClick={fetchTransactions}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            {loadingTxns ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No transfers yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["ID", "Sender", "Beneficiary", "Bank / Acc", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {transactions.map((txn) => {
                    const Cfg = statusConfig[txn.status] || statusConfig.Pending;
                    return (
                      <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-primary">{txn.id.slice(0, 8)}…</td>
                        <td className="py-3 px-4 text-foreground text-xs">{txn.sender}</td>
                        <td className="py-3 px-4 text-foreground text-xs">{txn.beneficiary}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs font-mono">{txn.bank}</td>
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
        description={`Money Transfer of ₹${parseFloat(amount || "0").toLocaleString("en-IN")} via IMPS`}
        onSuccess={processTransfer}
      />
    </div>
  );
}
