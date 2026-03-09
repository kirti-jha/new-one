import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText, Search, CheckCircle2, Clock, XCircle, Eye, Upload,
  MoreVertical, ShieldCheck, ShieldX, MessageSquare, X, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/services/api";

const DOC_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "photo", label: "Passport Photo" },
  { value: "address_proof", label: "Address Proof" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "gst_certificate", label: "GST Certificate" },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  pending: { icon: Clock, className: "text-warning bg-warning/10", label: "Pending" },
  approved: { icon: CheckCircle2, className: "text-success bg-success/10", label: "Approved" },
  rejected: { icon: XCircle, className: "text-destructive bg-destructive/10", label: "Rejected" },
};

interface KycDoc {
  id: string;
  user_id: string;
  doc_type: string;
  file_path: string;
  file_name: string;
  status: string;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  user_name?: string;
  user_role?: string;
}

const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

export default function KYCPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [docs, setDocs] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Review
  const [reviewDoc, setReviewDoc] = useState<KycDoc | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/kyc");
      if (data) {
        setDocs(data.map((d: any) => ({
          ...d,
          user_id: d.userId,
          doc_type: d.docType,
          file_path: d.filePath,
          file_name: d.fileName,
          review_note: d.reviewNote,
          reviewed_by: d.reviewedBy,
          reviewed_at: d.reviewedAt,
          created_at: d.createdAt,
          updated_at: d.updatedAt,
        })));
      }
    } catch (err) {
      console.error("Error fetching KYC docs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async () => {
    if (!uploadType || !uploadFile || !user) {
      toast({ title: "Missing info", description: "Select document type and file.", variant: "destructive" });
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop() || "file";
      const filePath = `${user.id}/${uploadType}_${Date.now()}.${ext}`;

      const { error: storageErr } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, uploadFile);
      if (storageErr) throw storageErr;

      // Meta record in Neon
      await apiFetch("/kyc", {
        method: "POST",
        body: JSON.stringify({
          doc_type: uploadType,
          file_path: filePath,
          file_name: uploadFile.name,
        }),
      });

      toast({ title: "Document uploaded", description: "Your KYC document is pending review." });
      setUploadOpen(false);
      setUploadType("");
      setUploadFile(null);
      fetchDocs();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleReview = async (action: "approved" | "rejected") => {
    if (!reviewDoc || !user) return;
    setReviewing(true);
    try {
      await apiFetch(`/kyc/${reviewDoc.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ action, note: reviewNote }),
      });

      toast({ title: action === "approved" ? "Document approved" : "Document rejected" });
      setReviewOpen(false);
      setReviewNote("");
      fetchDocs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReviewing(false);
    }
  };

  const handlePreview = async (doc: KycDoc) => {
    const { data } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(doc.file_path, 300);
    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setPreviewOpen(true);
    } else {
      toast({ title: "Error", description: "Could not load document.", variant: "destructive" });
    }
  };

  const filtered = docs.filter((d) => {
    const tabMatch = activeTab === "All" || d.status.toLowerCase() === activeTab.toLowerCase();
    const searchMatch = !search || d.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.doc_type.toLowerCase().includes(search.toLowerCase()) || d.file_name.toLowerCase().includes(search.toLowerCase());
    // Non-admins only see their own
    const ownerMatch = isAdmin || d.user_id === user?.id;
    return tabMatch && searchMatch && ownerMatch;
  });

  const stats = {
    total: docs.filter((d) => isAdmin || d.user_id === user?.id).length,
    pending: docs.filter((d) => (isAdmin || d.user_id === user?.id) && d.status === "pending").length,
    approved: docs.filter((d) => (isAdmin || d.user_id === user?.id) && d.status === "approved").length,
    rejected: docs.filter((d) => (isAdmin || d.user_id === user?.id) && d.status === "rejected").length,
  };

  const docTypeLabel = (t: string) => DOC_TYPES.find((d) => d.value === t)?.label || t;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">KYC Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Review and approve KYC documents." : "Upload your KYC documents for verification."}
          </p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-1.5" /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-primary" },
          { label: "Approved", value: stats.approved, color: "text-success" },
          { label: "Pending", value: stats.pending, color: "text-warning" },
          { label: "Rejected", value: stats.rejected, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-card border border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-2xl font-heading font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by name or document..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
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

      {/* Table */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">KYC Documents</h2>
          <span className="text-xs text-muted-foreground ml-2">({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No documents found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[...(isAdmin ? ["User", "Role"] : []), "Document", "File", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      {isAdmin && (
                        <>
                          <td className="py-3 px-4 text-foreground font-medium text-xs">{doc.user_name}</td>
                          <td className="py-3 px-4"><Badge variant="secondary" className="text-xs capitalize">{doc.user_role?.replace(/_/g, " ")}</Badge></td>
                        </>
                      )}
                      <td className="py-3 px-4 text-foreground font-medium text-xs">{docTypeLabel(doc.doc_type)}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{doc.file_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                          <cfg.icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(doc)}>
                              <Eye className="w-4 h-4 mr-2" /> View Document
                            </DropdownMenuItem>
                            {isAdmin && doc.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setReviewDoc(doc); setReviewNote(""); setReviewOpen(true); }}>
                                  <MessageSquare className="w-4 h-4 mr-2" /> Review
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

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload KYC Document</DialogTitle>
            <DialogDescription>Upload a document for KYC verification. Max 10MB, JPG/PNG/PDF.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              {uploadFile && (
                <p className="text-xs text-muted-foreground">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                <Upload className="w-4 h-4 mr-1.5" />{uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog (Admin) */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review KYC Document</DialogTitle>
            <DialogDescription>
              {reviewDoc?.user_name} — {docTypeLabel(reviewDoc?.doc_type || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => reviewDoc && handlePreview(reviewDoc)}>
              <Eye className="w-4 h-4 mr-1.5" /> View Document
            </Button>
            <div className="space-y-2">
              <Label>Review Note (optional)</Label>
              <Textarea
                placeholder="e.g. Document is blurry, please re-upload"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleReview("rejected")} disabled={reviewing}>
                <ShieldX className="w-4 h-4 mr-1.5" />{reviewing ? "..." : "Reject"}
              </Button>
              <Button onClick={() => handleReview("approved")} disabled={reviewing}>
                <ShieldCheck className="w-4 h-4 mr-1.5" />{reviewing ? "..." : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="mt-2">
              {previewUrl.match(/\.pdf/) ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border border-border" />
              ) : (
                <img src={previewUrl} alt="KYC Document" className="w-full max-h-[60vh] object-contain rounded-lg" />
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
