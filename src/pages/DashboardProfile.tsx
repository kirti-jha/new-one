import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/services/api";
import { uploadFileToBackend } from "@/services/files";
import {
  User, Phone, Briefcase, Building2, CreditCard, ShieldCheck, Camera, Save,
  FileText, Upload, CheckCircle2, Clock, XCircle, BadgeCheck, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AppRole } from "@/types/auth";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_distributor: "Super Distributor",
  master_distributor: "Master Distributor",
  distributor: "Distributor",
  retailer: "Retailer",
};

const kycStatusConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  verified: { icon: CheckCircle2, label: "Verified", color: "text-success bg-success/10" },
  pending: { icon: Clock, label: "Pending", color: "text-warning bg-warning/10" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-destructive bg-destructive/10" },
};

export default function DashboardProfile() {
  const { user, profile, role, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAcct, setBankAcct] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  // Read-only fields
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [kycStatus, setKycStatus] = useState("pending");
  const [status, setStatus] = useState("active");
  const [createdAt, setCreatedAt] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [eWalletBalance, setEWalletBalance] = useState(0);
  const [email, setEmail] = useState("");

  // Upload
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [aadhaarPath, setAadhaarPath] = useState<string | null>(null);
  const [panPath, setPanPath] = useState<string | null>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      const data = await apiFetch("/auth/me");
      const p = data?.profile;
      const w = { balance: data?.walletBalance, e_wallet_balance: data?.eWalletBalance };
      if (p) {
        setFullName(p.fullName || "");
        setPhone(p.phone || "");
        setBusinessName(p.businessName || "");
        setBankName(p.bankName || "");
        setBankAcct(p.bankAccountNumber || "");
        setBankIfsc(p.bankIfsc || "");
        setBankHolder(p.bankAccountHolder || "");
        setAadhaar(p.aadhaarNumber || "");
        setPan(p.panNumber || "");
        setKycStatus(p.kycStatus);
        setStatus(p.status);
        setCreatedAt(p.createdAt);
        setAadhaarPath(p.aadhaarImagePath);
        setPanPath(p.panImagePath);
      }
      if (w) {
        setWalletBalance(parseFloat(String(w.balance)));
        setEWalletBalance(parseFloat(String(w.e_wallet_balance)));
      }
      setEmail(user.email || "");
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          business_name: businessName.trim() || null,
          bank_name: bankName.trim() || null,
          bank_account_number: bankAcct.trim() || null,
          bank_ifsc: bankIfsc.trim().toUpperCase() || null,
          bank_account_holder: bankHolder.trim() || null,
        }),
      });
      setSaving(false);
      toast({ title: "Profile updated!", description: "Your profile has been saved successfully." });
      setEditing(false);
      await refreshProfile();
      const me = await apiFetch("/auth/me");
      const p = me?.profile;
      if (p) {
        setFullName(p.fullName || "");
        setPhone(p.phone || "");
        setBusinessName(p.businessName || "");
        setBankName(p.bankName || "");
        setBankAcct(p.bankAccountNumber || "");
        setBankIfsc(p.bankIfsc || "");
        setBankHolder(p.bankAccountHolder || "");
      }
    } catch (e: any) {
      setSaving(false);
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    }
  };

  const handleDocUpload = async (file: File, docType: "aadhaar" | "pan") => {
    if (!user) return;
    const setter = docType === "aadhaar" ? setUploadingAadhaar : setUploadingPan;
    setter(true);
    try {
      const uploaded = await uploadFileToBackend(file, `user-documents/${user.id}/${docType}`);
      const path = uploaded?.filePath;
      if (!path) throw new Error("Upload failed");

      const updateField = docType === "aadhaar" ? "aadhaar_image_path" : "pan_image_path";
      await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ [updateField]: path }),
      });
      if (docType === "aadhaar") setAadhaarPath(path);
      else setPanPath(path);
      toast({ title: `${docType === "aadhaar" ? "Aadhaar" : "PAN"} document uploaded` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
      setter(false);
      return;
    }
    setter(false);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const kycCfg = kycStatusConfig[kycStatus] || kycStatusConfig.pending;
  const KycIcon = kycCfg.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="rounded-2xl bg-gradient-primary p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-bold text-primary-foreground">{fullName || "User"}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{role ? ROLE_LABELS[role] : "—"}</Badge>
              <span className="text-sm text-primary-foreground/70">{email}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-primary-foreground/80">
              <span>Main Wallet: <strong>{formatINR(walletBalance)}</strong></span>
              <span>E-Wallet: <strong>{formatINR(eWalletBalance)}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${kycCfg.color}`}>
              <KycIcon className="w-3.5 h-3.5" />
              KYC: {kycCfg.label}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${status === "active" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>
              {status}
            </div>
          </div>
        </div>
      </div>

      {/* Personal & Business Info */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Personal Information</h2>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Full Name</Label>
            {editing ? <Input value={fullName} onChange={(e) => setFullName(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{fullName || "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
            {editing ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{phone || "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Business Name</Label>
            {editing ? <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{businessName || "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">📧 Email</Label>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">📅 Member Since</Label>
            <p className="text-sm font-medium text-foreground">{createdAt ? new Date(createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Landmark className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Bank Details</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bank Name</Label>
            {editing ? <Input value={bankName} onChange={(e) => setBankName(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{bankName || "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Account Number</Label>
            {editing ? <Input value={bankAcct} onChange={(e) => setBankAcct(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{bankAcct ? `****${bankAcct.slice(-4)}` : "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">IFSC Code</Label>
            {editing ? <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{bankIfsc || "—"}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Account Holder</Label>
            {editing ? <Input value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} /> : <p className="text-sm font-medium text-foreground">{bankHolder || "—"}</p>}
          </div>
        </div>
      </div>

      {/* KYC Documents */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">KYC Documents</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aadhaar */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Aadhaar Number</Label>
            <p className="text-sm font-medium text-foreground">{aadhaar ? `XXXX-XXXX-${aadhaar.slice(-4)}` : "Not provided"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Aadhaar Document</Label>
            {aadhaarPath ? (
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-success" />
                <span className="text-sm text-success">Uploaded</span>
              </div>
            ) : (
              <div>
                <input ref={aadhaarRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], "aadhaar")} />
                <Button variant="outline" size="sm" onClick={() => aadhaarRef.current?.click()} disabled={uploadingAadhaar}>
                  <Upload className="w-4 h-4 mr-1" /> {uploadingAadhaar ? "Uploading..." : "Upload Aadhaar"}
                </Button>
              </div>
            )}
          </div>

          {/* PAN */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">PAN Number</Label>
            <p className="text-sm font-medium text-foreground">{pan || "Not provided"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">PAN Document</Label>
            {panPath ? (
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-success" />
                <span className="text-sm text-success">Uploaded</span>
              </div>
            ) : (
              <div>
                <input ref={panRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], "pan")} />
                <Button variant="outline" size="sm" onClick={() => panRef.current?.click()} disabled={uploadingPan}>
                  <Upload className="w-4 h-4 mr-1" /> {uploadingPan ? "Uploading..." : "Upload PAN"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
