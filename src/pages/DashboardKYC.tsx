import { FileText, Search, CheckCircle2, Clock, XCircle, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const kycRequests = [
  { id: "KYC001", user: "Rajesh Kumar", role: "Retailer", aadhaar: "Uploaded", pan: "Uploaded", photo: "Uploaded", video: "Done", status: "Verified", date: "Mar 8, 2026", reviewer: "Admin" },
  { id: "KYC002", user: "Amit Patel", role: "Distributor", aadhaar: "Uploaded", pan: "Uploaded", photo: "Uploaded", video: "Pending", status: "Pending", date: "Mar 7, 2026", reviewer: "—" },
  { id: "KYC003", user: "Vikram Singh", role: "Retailer", aadhaar: "Uploaded", pan: "Missing", photo: "Uploaded", video: "—", status: "Rejected", date: "Mar 6, 2026", reviewer: "Admin" },
  { id: "KYC004", user: "Sunita Devi", role: "Retailer", aadhaar: "Uploaded", pan: "Uploaded", photo: "Uploaded", video: "Done", status: "Verified", date: "Mar 5, 2026", reviewer: "Admin" },
  { id: "KYC005", user: "Meena Kumari", role: "Distributor", aadhaar: "Uploaded", pan: "Uploaded", photo: "Pending", video: "—", status: "Pending", date: "Mar 8, 2026", reviewer: "—" },
  { id: "KYC006", user: "Priya Sharma", role: "Master Distributor", aadhaar: "Uploaded", pan: "Uploaded", photo: "Uploaded", video: "Done", status: "Verified", date: "Mar 4, 2026", reviewer: "Admin" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Verified: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Pending: { icon: Clock, className: "text-warning bg-warning/10" },
  Rejected: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

const docBadge = (val: string) => {
  if (val === "Uploaded" || val === "Done") return "text-success";
  if (val === "Missing") return "text-destructive";
  return "text-warning";
};

const tabs = ["All", "Pending", "Verified", "Rejected"] as const;

export default function KYCPage() {
  const [activeTab, setActiveTab] = useState("All");
  const filtered = activeTab === "All" ? kycRequests : kycRequests.filter((k) => k.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">KYC Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Document verification — Aadhaar, PAN, Photo, and Video KYC.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: kycRequests.length, color: "text-primary" },
          { label: "Verified", value: kycRequests.filter((k) => k.status === "Verified").length, color: "text-success" },
          { label: "Pending", value: kycRequests.filter((k) => k.status === "Pending").length, color: "text-warning" },
          { label: "Rejected", value: kycRequests.filter((k) => k.status === "Rejected").length, color: "text-destructive" },
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
          <input type="text" placeholder="Search by name or ID..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
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
          <h2 className="font-heading font-semibold text-foreground">KYC Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["ID", "User", "Role", "Aadhaar", "PAN", "Photo", "Video", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((kyc) => {
                const Cfg = statusConfig[kyc.status];
                return (
                  <tr key={kyc.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-primary">{kyc.id}</td>
                    <td className="py-3 px-4 text-foreground font-medium text-xs">{kyc.user}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{kyc.role}</td>
                    <td className={`py-3 px-4 text-xs font-medium ${docBadge(kyc.aadhaar)}`}>{kyc.aadhaar}</td>
                    <td className={`py-3 px-4 text-xs font-medium ${docBadge(kyc.pan)}`}>{kyc.pan}</td>
                    <td className={`py-3 px-4 text-xs font-medium ${docBadge(kyc.photo)}`}>{kyc.photo}</td>
                    <td className={`py-3 px-4 text-xs font-medium ${docBadge(kyc.video)}`}>{kyc.video}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                        <Cfg.icon className="w-3 h-3" />{kyc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{kyc.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button className="text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></button>
                        <button className="text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
