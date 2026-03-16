import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Banknote, Plus, Clock, CheckCircle2, XCircle, Send, Eye, MoreVertical,
  Search, Download, MessageSquare, Upload, RefreshCw, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import { apiFetch } from "@/services/api";

type AppRole = "admin" | "super_distributor" | "master_distributor" | "distributor" | "retailer";

const ROLE_LEVEL: Record<string, number> = {
  admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  pending: { icon: Clock, className: "text-warning bg-warning/10", label: "Pending" },
  approved: { icon: CheckCircle2, className: "text-success bg-success/10", label: "Approved" },
  rejected: { icon: XCircle, className: "text-destructive bg-destructive/10", label: "Rejected" },
};

const PAYMENT_MODES = [
  { value: "bank_transfer", label: "Bank Transfer (NEFT/RTGS/IMPS)" },
  { value: "upi", label: "UPI" },
  { value: "cash_deposit", label: "Cash Deposit" },
  { value: "cheque", label: "Cheque" },
];

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
}

interface FundRequest {
  id: string;
  requester_id: string;
  bank_account_id: string;
  amount: number;
  payment_mode: string;
  payment_reference: string;
  payment_date: string;
  receipt_path: string | null;
  receipt_name: string | null;
  remarks: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  // enriched
  requester_name?: string;
  requester_role?: string;
  bank_name?: string;
  approver_name?: string;
}

const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

export default function DashboardFundRequests() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const canApprove = role && ROLE_LEVEL[role] < 5; // everyone except retailer
  const isAdmin = role === "admin";

  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");

  // New request
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqBank, setReqBank] = useState("");
  const [reqAmount, setReqAmount] = useState("");
  const [reqMode, setReqMode] = useState("bank_transfer");
  const [reqRef, setReqRef] = useState("");
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [reqRemarks, setReqRemarks] = useState("");
  const [reqReceipt, setReqReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Review
  const [reviewReq, setReviewReq] = useState<FundRequest | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Receipt preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqData, bankData] = await Promise.all([
        apiFetch("/fund-requests"),
        apiFetch("/fund-requests/bank-accounts"),
      ]);

      if (reqData) {
        setRequests(reqData.map((r: any) => ({
          ...r,
          id: r.id,
          requester_id: r.requesterId,
          bank_account_id: r.bankAccountId,
          payment_mode: r.paymentMode,
          payment_reference: r.paymentReference,
          payment_date: r.paymentDate,
          receipt_path: r.receiptPath,
          receipt_name: r.receiptName,
          status: r.status,
          approved_by: r.approvedBy,
          approved_at: r.approvedAt,
          rejection_reason: r.rejectionReason,
          created_at: r.createdAt,
          requester_name: r.requesterName,
          requester_role: r.requesterRole,
          bank_name: r.bankName,
          approver_name: r.approverName,
        })));
      }
      if (bankData) {
        setBankAccounts(bankData.map((a: any) => ({
          id: a.id,
          bank_name: a.bankName,
          account_name: a.accountName,
          account_number: a.accountNumber,
          ifsc_code: a.ifscCode,
          upi_id: a.upiId,
        })));
      }
    } catch (err: any) {
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmitRequest = async () => {
    console.log(`[Fund Request UI] Create Request click. Amount: ${reqAmount}, Ref: ${reqRef}`);
    if (!reqBank || !reqAmount || parseFloat(reqAmount) <= 0 || !reqRef || !reqDate || !user) {
      console.warn(`[Fund Request UI] Validation failed for fund request`);
      toast({ title: "Missing fields", description: "Fill all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      console.log(`[Fund Request UI] Calling POST /fund-requests`);
      let receiptPath: string | null = null;
      let receiptName: string | null = null;

      if (reqReceipt) {
        const ext = reqReceipt.name.split(".").pop() || "file";
        receiptPath = `${user.id}/receipt_${Date.now()}.${ext}`;
        receiptName = reqReceipt.name;
        toast({ title: "Receipt upload pending", description: "Storage migration to Neon is not enabled yet. Continuing without file upload." });
      }

      const res = await apiFetch("/fund-requests", {
        method: "POST",
        body: JSON.stringify({
          bank_account_id: reqBank,
          amount: parseFloat(reqAmount),
          payment_mode: reqMode,
          payment_reference: reqRef.trim(),
          payment_date: reqDate,
          receipt_path: receiptPath,
          receipt_name: receiptName,
          remarks: reqRemarks.trim() || null,
        }),
      });

      toast({ title: "Fund request submitted", description: "Your request is pending approval." });
      setRequestOpen(false);
      setReqBank(""); setReqAmount(""); setReqMode("bank_transfer"); setReqRef(""); setReqRemarks(""); setReqReceipt(null);
      fetchData();

      // Notifications are now handled by the backend
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    if (!reviewReq) return;
    setReviewing(true);
    try {
      const endpoint = action === "approve"
        ? `/fund-requests/${reviewReq.id}/approve`
        : `/fund-requests/${reviewReq.id}/reject`;

      const res = await apiFetch(endpoint, {
        method: "PATCH",
        body: action === "reject" ? JSON.stringify({ reason: rejectionReason }) : undefined,
      });
      toast({ title: action === "approve" ? "Request approved & funds credited" : "Request rejected" });
      setReviewOpen(false);
      setRejectionReason("");
      fetchData();

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReviewing(false);
    }
  };

  const handleViewReceipt = async (req: FundRequest) => {
    if (!req.receipt_path) {
      toast({ title: "No receipt", description: "No receipt was attached.", variant: "destructive" });
      return;
    }
    toast({ title: "Receipt unavailable", description: "Receipt preview is disabled until storage migration is completed.", variant: "destructive" });
  };

  const filtered = requests.filter((r) => {
    const tabMatch = activeTab === "All" || r.status === activeTab.toLowerCase();
    const searchMatch = !search ||
      r.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.payment_reference.toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    totalAmount: requests.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0),
  };

  const formatINR = (v: number) => `â‚¹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Fund Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canApprove ? "Manage fund requests from your downline." : "Request funds by submitting payment proof."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
          <Button variant="ghost" size="sm" onClick={() => {
            if (!filtered.length) return;
            downloadCSV(filtered.map((r) => ({
              User: r.requester_name, Amount: r.amount, Status: r.status,
              Mode: r.payment_mode, Reference: r.payment_reference, Bank: r.bank_name,
              Date: new Date(r.created_at).toLocaleString("en-IN"),
            })), "fund_requests");
          }}><Download className="w-4 h-4 mr-1" /> Export</Button>
          <Button variant="hero" size="sm" onClick={() => setRequestOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total.toString(), color: "text-primary" },
          { label: "Pending", value: stats.pending.toString(), color: "text-warning" },
          { label: "Approved", value: stats.approved.toString(), color: "text-success" },
          { label: "Rejected", value: stats.rejected.toString(), color: "text-destructive" },
          { label: "Approved Amt", value: formatINR(stats.totalAmount), color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-card border border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-xl font-heading font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or reference..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Company Bank Accounts Display */}
      {bankAccounts.length > 0 && (
        <div className="rounded-xl bg-gradient-card border border-border p-5">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Company Bank Accounts â€” Send payment here
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="p-3 rounded-lg border border-border bg-secondary/30 text-xs space-y-1">
                <div className="font-medium text-foreground">{b.bank_name}</div>
                <div className="text-muted-foreground">A/C: <span className="font-mono text-foreground">{b.account_number}</span></div>
                <div className="text-muted-foreground">Name: {b.account_name}</div>
                <div className="text-muted-foreground">IFSC: <span className="font-mono">{b.ifsc_code}</span></div>
                {b.upi_id && <div className="text-muted-foreground">UPI: <span className="font-mono text-primary">{b.upi_id}</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Banknote className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Fund Requests</h2>
          <span className="text-xs text-muted-foreground ml-2">({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No fund requests found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[...(canApprove ? ["User"] : []), "Amount", "Mode", "Reference", "Bank", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  const canReview = canApprove && r.status === "pending" && r.requester_id !== user?.id;
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      {canApprove && (
                        <td className="py-3 px-4">
                          <div className="text-foreground font-medium text-xs">{r.requester_name}</div>
                          <div className="text-muted-foreground text-[10px] capitalize">{r.requester_role?.replace(/_/g, " ")}</div>
                        </td>
                      )}
                      <td className="py-3 px-4 font-semibold text-foreground">{formatINR(Number(r.amount))}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs capitalize">{r.payment_mode.replace(/_/g, " ")}</td>
                      <td className="py-3 px-4 font-mono text-xs text-foreground">{r.payment_reference}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{r.bank_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                          <cfg.icon className="w-3 h-3" />{cfg.label}
                        </span>
                        {r.status === "rejected" && r.rejection_reason && (
                          <div className="text-[10px] text-destructive mt-0.5 max-w-[120px] truncate" title={r.rejection_reason}>{r.rejection_reason}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {r.receipt_path && (
                              <DropdownMenuItem onClick={() => handleViewReceipt(r)}>
                                <Eye className="w-4 h-4 mr-2" /> View Receipt
                              </DropdownMenuItem>
                            )}
                            {canReview && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setReviewReq(r); setRejectionReason(""); setReviewOpen(true); }}>
                                  <MessageSquare className="w-4 h-4 mr-2" /> Review & Approve/Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Fund Request</DialogTitle>
            <DialogDescription>Send payment to company bank account, then submit details here for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Bank Account Paid To *</Label>
              <Select value={reqBank} onValueChange={setReqBank}>
                <SelectTrigger><SelectValue placeholder="Select bank account" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.bank_name} â€” {b.account_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount (â‚¹) *</Label>
                <Input type="number" min={1} placeholder="Enter amount" value={reqAmount} onChange={(e) => setReqAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode *</Label>
                <Select value={reqMode} onValueChange={setReqMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Reference / UTR *</Label>
                <Input placeholder="UTR / Transaction ID" value={reqRef} onChange={(e) => setReqRef(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Payment Date *</Label>
                <Input type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Receipt (optional)</Label>
              <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setReqReceipt(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea placeholder="Any additional info..." value={reqRemarks} onChange={(e) => setReqRemarks(e.target.value)} maxLength={500} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitRequest} disabled={submitting}>
                <Send className="w-4 h-4 mr-1.5" />{submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Fund Request</DialogTitle>
            <DialogDescription>{reviewReq?.requester_name} â€” {formatINR(Number(reviewReq?.amount || 0))}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1">
              <div><span className="text-muted-foreground">Mode:</span> <span className="capitalize">{reviewReq?.payment_mode?.replace(/_/g, " ")}</span></div>
              <div><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{reviewReq?.payment_reference}</span></div>
              <div><span className="text-muted-foreground">Date:</span> {reviewReq?.payment_date}</div>
              <div><span className="text-muted-foreground">Bank:</span> {reviewReq?.bank_name}</div>
              {reviewReq?.remarks && <div><span className="text-muted-foreground">Remarks:</span> {reviewReq.remarks}</div>}
            </div>
            {reviewReq?.receipt_path && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => reviewReq && handleViewReceipt(reviewReq)}>
                <Eye className="w-4 h-4 mr-1.5" /> View Payment Receipt
              </Button>
            )}
            <div className="space-y-2">
              <Label>Rejection Reason (if rejecting)</Label>
              <Textarea placeholder="e.g. Payment not found in bank statement" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} maxLength={500} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleReview("reject")} disabled={reviewing}>
                <XCircle className="w-4 h-4 mr-1.5" />{reviewing ? "..." : "Reject"}
              </Button>
              <Button onClick={() => handleReview("approve")} disabled={reviewing}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />{reviewing ? "..." : "Approve & Credit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
          {previewUrl && (
            <div className="mt-2">
              {previewUrl.match(/\.pdf/) ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border border-border" />
              ) : (
                <img src={previewUrl} alt="Receipt" className="w-full max-h-[60vh] object-contain rounded-lg" />
              )}
              <div className="flex justify-end mt-3">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Download</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

