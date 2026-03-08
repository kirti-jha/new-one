import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet, ArrowUpRight, ArrowDownRight, Plus, Clock,
  CheckCircle2, Send, ArrowDownLeft, RefreshCw, CreditCard, Download, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_distributor: "Super Distributor",
  master_distributor: "Master Distributor",
  distributor: "Distributor",
  retailer: "Retailer",
};

interface WalletData {
  balance: number;
  e_wallet_balance: number;
}

interface TxnRow {
  id: string;
  from_user_id: string | null;
  to_user_id: string;
  amount: number;
  type: string;
  description: string | null;
  from_balance_after: number | null;
  to_balance_after: number;
  created_at: string;
}

interface DownlineUser {
  user_id: string;
  full_name: string;
  role: AppRole;
}

interface EWalletCredit {
  id: string;
  amount: number;
  available_at: string;
  consumed: boolean;
  source: string;
  created_at: string;
}

export default function DashboardWallet() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TxnRow[]>([]);
  const [eWalletCredits, setEWalletCredits] = useState<EWalletCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);

  // Dialog states
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [pgOpen, setPgOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Top-up form (admin only)
  const [topUpTarget, setTopUpTarget] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDesc, setTopUpDesc] = useState("");
  const [allUsers, setAllUsers] = useState<DownlineUser[]>([]);

  // Transfer form
  const [transferTarget, setTransferTarget] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  // PG form
  const [pgAmount, setPgAmount] = useState("");

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("balance, e_wallet_balance")
      .eq("user_id", user.id)
      .single();
    if (data) setWallet({ balance: parseFloat(data.balance as any), e_wallet_balance: parseFloat((data as any).e_wallet_balance as any) });
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTransactions(data as TxnRow[]);
  }, [user]);

  const fetchEWalletCredits = useCallback(async () => {
    if (!user || isAdmin) return;
    const { data } = await supabase
      .from("e_wallet_credits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEWalletCredits(data as EWalletCredit[]);
  }, [user, isAdmin]);

  const fetchDownlineUsers = useCallback(async () => {
    if (!user) return;
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (profiles && roles) {
      const roleMap = new Map(roles.map((r) => [r.user_id, r.role as AppRole]));
      const list: DownlineUser[] = profiles
        .filter((p) => p.user_id !== user.id && roleMap.has(p.user_id))
        .map((p) => ({ user_id: p.user_id, full_name: p.full_name, role: roleMap.get(p.user_id)! }));
      setAllUsers(list);
      const ROLE_LEVEL: Record<AppRole, number> = { admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5 };
      const myLevel = role ? ROLE_LEVEL[role] : 99;
      setDownlineUsers(list.filter((u) => ROLE_LEVEL[u.role] > myLevel));
    }
  }, [user, role]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchWallet(), fetchTransactions(), fetchEWalletCredits(), fetchDownlineUsers()]);
      setLoading(false);
    };
    load();
  }, [fetchWallet, fetchTransactions, fetchEWalletCredits, fetchDownlineUsers]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("wallet-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${user.id}` }, () => {
        fetchWallet();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wallet_transactions" }, () => {
        fetchTransactions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchWallet, fetchTransactions]);

  const handleTopUp = async () => {
    if (!topUpTarget || !topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({ title: "Invalid input", description: "Select user and enter a valid amount.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      const res = await supabase.functions.invoke("wallet-transfer", {
        body: { action: "top_up", to_user_id: topUpTarget, amount: parseFloat(topUpAmount), description: topUpDesc || "Admin top-up" },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast({ title: "Top-up successful", description: `₹${parseFloat(topUpAmount).toLocaleString("en-IN")} added.` });
      setTopUpOpen(false);
      setTopUpTarget(""); setTopUpAmount(""); setTopUpDesc("");
      fetchWallet(); fetchTransactions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast({ title: "Invalid input", description: "Select user and enter a valid amount.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      const res = await supabase.functions.invoke("wallet-transfer", {
        body: { action: "transfer", to_user_id: transferTarget, amount: parseFloat(transferAmount), description: transferDesc || "Fund transfer" },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast({ title: "Transfer successful", description: `₹${parseFloat(transferAmount).toLocaleString("en-IN")} transferred.` });
      setTransferOpen(false);
      setTransferTarget(""); setTransferAmount(""); setTransferDesc("");
      fetchWallet(); fetchTransactions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handlePGPayment = async () => {
    const amt = parseFloat(pgAmount);
    if (!amt || amt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setProcessing(true);
    // Simulated PG: add to main wallet after "payment"
    try {
      const res = await supabase.functions.invoke("wallet-transfer", {
        body: { action: "pg_add_fund", amount: amt },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast({ title: "Payment Successful!", description: `₹${amt.toLocaleString("en-IN")} added to your Main Wallet via PG.` });
      setPgOpen(false);
      setPgAmount("");
      fetchWallet(); fetchTransactions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportLedger = () => {
    if (!transactions.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    downloadCSV(
      transactions.map((t) => ({
        Type: t.type,
        Description: t.description || "",
        Amount: t.amount,
        Direction: t.to_user_id === user?.id ? "Credit" : "Debit",
        Balance_After: t.to_user_id === user?.id ? t.to_balance_after : t.from_balance_after ?? "",
        Date: new Date(t.created_at).toLocaleString("en-IN"),
      })),
      "wallet_ledger"
    );
  };

  const formatINR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const todayCredits = transactions
    .filter((t) => t.to_user_id === user?.id && new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayDebits = transactions
    .filter((t) => t.from_user_id === user?.id && new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // E-wallet available balance (credits past 24h cooldown)
  const now = new Date();
  const eWalletAvailable = eWalletCredits
    .filter((c) => !c.consumed && new Date(c.available_at) <= now)
    .reduce((s, c) => s + Number(c.amount), 0);
  const eWalletLocked = (wallet?.e_wallet_balance ?? 0) - eWalletAvailable;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Wallet & Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage wallets, fund transfers, and ledger.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <Button variant="hero" size="sm" onClick={() => setTopUpOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Top Up
            </Button>
          )}
          {role !== "retailer" && (
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <Send className="w-4 h-4 mr-1" /> Transfer
            </Button>
          )}
          {!isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setPgOpen(true)}>
              <CreditCard className="w-4 h-4 mr-1" /> Add Fund by PG
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleExportLedger}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className={`grid grid-cols-1 gap-4 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Main Wallet</span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {loading ? "..." : formatINR(wallet?.balance ?? 0)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Available instantly</p>
        </div>

        {!isAdmin && (
          <div className="p-5 rounded-xl bg-gradient-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">E-Wallet</span>
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div className="text-2xl font-heading font-bold text-foreground">
              {loading ? "..." : formatINR(wallet?.e_wallet_balance ?? 0)}
            </div>
            <div className="flex gap-3 mt-1 text-[10px]">
              <span className="text-success">Available: {formatINR(Math.max(0, eWalletAvailable))}</span>
              <span className="text-warning">Locked: {formatINR(Math.max(0, eWalletLocked))}</span>
            </div>
          </div>
        )}

        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today's Credits</span>
            <ArrowDownLeft className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {loading ? "..." : formatINR(todayCredits)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-success">
            <ArrowUpRight className="w-3 h-3" /> Received today
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today's Debits</span>
            <ArrowUpRight className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {loading ? "..." : formatINR(todayDebits)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive">
            <ArrowDownRight className="w-3 h-3" /> Sent today
          </div>
        </div>
      </div>

      {/* E-Wallet Credits (non-admin) */}
      {!isAdmin && eWalletCredits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" /> E-Wallet Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Source</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Available At</th>
                  </tr>
                </thead>
                <tbody>
                  {eWalletCredits.slice(0, 10).map((c) => {
                    const isAvailable = new Date(c.available_at) <= now && !c.consumed;
                    const isLocked = new Date(c.available_at) > now && !c.consumed;
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-2 font-semibold text-foreground">{formatINR(Number(c.amount))}</td>
                        <td className="py-2 text-muted-foreground capitalize text-xs">{c.source.replace(/_/g, " ")}</td>
                        <td className="py-2">
                          <Badge variant={c.consumed ? "secondary" : isAvailable ? "default" : "outline"} className="text-xs">
                            {c.consumed ? "Used" : isAvailable ? "Available" : "Locked"}
                          </Badge>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {new Date(c.available_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Transaction Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Description</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium hidden sm:table-cell">Balance After</th>
                    <th className="text-left py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const isCredit = t.to_user_id === user?.id;
                    return (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2">
                          <Badge variant={t.type === "top_up" ? "default" : t.type === "reversal" ? "destructive" : t.type === "pg_add" ? "default" : "secondary"} className="text-xs capitalize">
                            {t.type === "top_up" ? "Top Up" : t.type === "reversal" ? "Reversal" : t.type === "pg_add" ? "PG Add" : isCredit ? "Credit" : "Debit"}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell max-w-[200px] truncate">{t.description || "—"}</td>
                        <td className={`py-2 text-right font-semibold ${isCredit ? "text-success" : "text-destructive"}`}>
                          {isCredit ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">
                          {isCredit ? formatINR(Number(t.to_balance_after)) : t.from_balance_after != null ? formatINR(Number(t.from_balance_after)) : "—"}
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          <br />
                          <span className="text-[10px]">{new Date(t.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Top-Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>Add funds to any user's wallet (admin only).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={topUpTarget} onValueChange={setTopUpTarget}>
                <SelectTrigger><SelectValue placeholder="Choose user" /></SelectTrigger>
                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name} ({ROLE_LABELS[u.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} placeholder="Enter amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Bank deposit received" value={topUpDesc} onChange={(e) => setTopUpDesc(e.target.value)} maxLength={200} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTopUpOpen(false)}>Cancel</Button>
              <Button onClick={handleTopUp} disabled={processing}>
                <Plus className="w-4 h-4 mr-1.5" /> {processing ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>Send funds to a user below you in the hierarchy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              Your balance: <span className="font-bold text-foreground">{formatINR(wallet?.balance ?? 0)}</span>
            </div>
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={transferTarget} onValueChange={setTransferTarget}>
                <SelectTrigger><SelectValue placeholder="Choose downline user" /></SelectTrigger>
                <SelectContent>
                  {downlineUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name} ({ROLE_LABELS[u.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} placeholder="Transfer amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Monthly fund allocation" value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} maxLength={200} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
              <Button onClick={handleTransfer} disabled={processing}>
                <Send className="w-4 h-4 mr-1.5" /> {processing ? "Processing..." : "Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PG Add Fund Dialog */}
      <Dialog open={pgOpen} onOpenChange={setPgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fund via Payment Gateway</DialogTitle>
            <DialogDescription>Pay online to instantly add funds to your Main Wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              Current balance: <span className="font-bold text-foreground">{formatINR(wallet?.balance ?? 0)}</span>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} placeholder="Enter amount" value={pgAmount} onChange={(e) => setPgAmount(e.target.value)} />
            </div>
            <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-xs text-muted-foreground">
              <CreditCard className="w-4 h-4 text-primary inline mr-1" />
              Simulated PG: Amount will be added to your Main Wallet instantly. In production, this will redirect to a payment gateway.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPgOpen(false)}>Cancel</Button>
              <Button onClick={handlePGPayment} disabled={processing}>
                <CreditCard className="w-4 h-4 mr-1.5" /> {processing ? "Processing..." : "Pay & Add Fund"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
