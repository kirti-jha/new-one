import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Wallet, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface TPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;                         // payment amount to validate against balance
  description?: string;                   // e.g. "Mobile Recharge ₹299"
  onSuccess: () => void;                  // called only after tpin + balance verified
}

export function TPinDialog({ open, onOpenChange, amount, description, onSuccess }: TPinDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tpin, setTpin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [noTpin, setNoTpin] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setTpin("");
    setShowPin(false);
    setNoTpin(false);
    fetchBalance();
    checkTpinExists();
  }, [open, user]);

  const fetchBalance = async () => {
    if (!user) return;
    setLoadingBalance(true);
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    setBalance(data ? parseFloat(String(data.balance)) : 0);
    setLoadingBalance(false);
  };

  const checkTpinExists = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("tpin_hash")
      .eq("user_id", user.id)
      .single();
    if (!(data as any)?.tpin_hash) setNoTpin(true);
  };

  const handleConfirm = async () => {
    if (!user) return;

    // Validation: amount must be positive
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Payment amount must be greater than ₹0.", variant: "destructive" });
      return;
    }

    // Validation: balance must be sufficient (strictly less than balance)
    if (balance === null) {
      toast({ title: "Error", description: "Could not fetch wallet balance.", variant: "destructive" });
      return;
    }
    if (amount >= balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your wallet balance ₹${balance.toLocaleString("en-IN")} is not enough. Payment of ₹${amount.toLocaleString("en-IN")} cannot be processed (balance must be strictly greater than the payment amount).`,
        variant: "destructive",
      });
      return;
    }

    if (tpin.length < 4) {
      toast({ title: "Enter T-PIN", description: "Please enter your 4-digit T-PIN.", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Verify T-PIN via Supabase function
    const { data, error } = await supabase.functions.invoke("verify-tpin", {
      body: { tpin },
    });
    setLoading(false);

    if (error || data?.error) {
      toast({ title: "Invalid T-PIN", description: "The T-PIN you entered is incorrect.", variant: "destructive" });
      setTpin("");
      return;
    }

    onOpenChange(false);
    onSuccess();
  };

  const insufficient = balance !== null && amount >= balance && amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            {description || `You are about to make a payment of ₹${amount.toLocaleString("en-IN")}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Balance info */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${insufficient ? "border-destructive/50 bg-destructive/5" : "border-border bg-secondary/30"}`}>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Wallet Balance</span>
            </div>
            <span className={`font-bold text-sm ${insufficient ? "text-destructive" : "text-success"}`}>
              {loadingBalance ? "..." : `₹${(balance ?? 0).toLocaleString("en-IN")}`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground">Payment Amount</span>
            <span className="font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
          </div>

          {insufficient && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Insufficient balance. Please add funds to your wallet first.</span>
            </div>
          )}

          {noTpin && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You haven't set a T-PIN yet. Please set it from TPIN settings before making payments.</span>
            </div>
          )}

          {!noTpin && !insufficient && (
            <div className="space-y-2">
              <Label htmlFor="tpin-input">Enter T-PIN *</Label>
              <div className="relative">
                <Input
                  id="tpin-input"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter your T-PIN"
                  value={tpin}
                  onChange={(e) => setTpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  className="pr-10 tracking-widest text-center text-xl font-bold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Enter your 4-6 digit Transaction PIN</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || insufficient || noTpin || tpin.length < 4}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility hook to get wallet balance
export function useWalletBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();
      setBalance(data ? parseFloat(String(data.balance)) : 0);
      setLoading(false);
    };
    fetchBalance();
  }, [user]);

  return { balance, loading };
}
