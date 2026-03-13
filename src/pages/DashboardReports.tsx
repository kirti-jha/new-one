import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileSpreadsheet, Wallet, Banknote, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import { apiFetch } from "@/services/api";

export default function DashboardReports() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (reportType: string) => {
    if (!user) return;
    setDownloading(reportType);
    try {
      const from = `${fromDate}T00:00:00.000Z`;
      const to = `${toDate}T23:59:59.999Z`;

      if (reportType === "wallet_ledger") {
        const data = await apiFetch("/wallet/transactions");
        if (!data?.length) { toast({ title: "No data found for selected period" }); return; }

        downloadCSV(
          data.map((t: any) => ({
            ID: t.id,
            Type: t.type,
            From_User: t.from_user_id || "System",
            To_User: t.to_user_id,
            Amount: t.amount,
            Description: t.description || "",
            From_Balance: t.from_balance_after ?? "",
            To_Balance: t.to_balance_after,
            Date: new Date(t.created_at).toLocaleString("en-IN"),
          })),
          "wallet_ledger"
        );
      }

      if (reportType === "fund_requests") {
        const data = await apiFetch("/fund-requests");
        if (!data?.length) { toast({ title: "No data found for selected period" }); return; }

        downloadCSV(
          data.map((r: any) => ({
            ID: r.id,
            Amount: r.amount,
            Status: r.status,
            Payment_Mode: r.payment_mode,
            Payment_Reference: r.payment_reference,
            Payment_Date: r.payment_date,
            Remarks: r.remarks || "",
            Rejection_Reason: r.rejection_reason || "",
            Created: new Date(r.created_at).toLocaleString("en-IN"),
            Approved_At: r.approved_at ? new Date(r.approved_at).toLocaleString("en-IN") : "",
          })),
          "fund_requests"
        );
      }

      if (reportType === "commissions") {
        const data = await apiFetch("/commission/logs");
        if (!data?.length) { toast({ title: "No data found for selected period" }); return; }

        downloadCSV(
          data.map((c: any) => ({
            ID: c.id,
            Service: c.service_key,
            Transaction_Amount: c.transaction_amount,
            Commission_Amount: c.commission_amount,
            Commission_Type: c.commission_type,
            Commission_Value: c.commission_value,
            Credited: c.credited ? "Yes" : "No",
            Date: new Date(c.created_at).toLocaleString("en-IN"),
          })),
          "commission_report"
        );
      }

      if (reportType === "kyc") {
        const data = await apiFetch("/kyc");
        if (!data?.length) { toast({ title: "No data found for selected period" }); return; }

        downloadCSV(
          data.map((d: any) => ({
            ID: d.id,
            User_ID: d.user_id,
            Document_Type: d.doc_type,
            File_Name: d.file_name,
            Status: d.status,
            Review_Note: d.review_note || "",
            Created: new Date(d.created_at).toLocaleString("en-IN"),
            Reviewed_At: d.reviewed_at ? new Date(d.reviewed_at).toLocaleString("en-IN") : "",
          })),
          "kyc_report"
        );
      }

      toast({ title: "Report downloaded successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      key: "wallet_ledger",
      title: "Wallet Ledger",
      description: "Complete wallet transaction history with balances, credits, and debits.",
      icon: Wallet,
      color: "text-primary",
    },
    {
      key: "fund_requests",
      title: "Fund Requests",
      description: "All fund request records with status, payment details, and approval info.",
      icon: Banknote,
      color: "text-success",
    },
    {
      key: "commissions",
      title: "Commission Report",
      description: "Commission earnings breakdown by service, type, and transaction amount.",
      icon: BarChart3,
      color: "text-accent",
    },
    {
      key: "kyc",
      title: "KYC Report",
      description: "KYC document submissions with verification status and review details.",
      icon: FileText,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reports & Downloads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download detailed reports for wallet, fund requests, commissions, and KYC.
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-end gap-4 flex-wrap p-4 rounded-xl bg-gradient-card border border-border">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From Date</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To Date</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
        </div>
        <div className="text-xs text-muted-foreground pb-2">
          Select a date range then click any report to download.
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.key} className="hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center`}>
                  <r.icon className={`w-5 h-5 ${r.color}`} />
                </div>
                <div>
                  <CardTitle className="text-sm font-heading">{r.title}</CardTitle>
                  <CardDescription className="text-xs">{r.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleDownload(r.key)}
                disabled={downloading === r.key}
              >
                <Download className="w-4 h-4 mr-1.5" />
                {downloading === r.key ? "Downloading..." : "Download CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
