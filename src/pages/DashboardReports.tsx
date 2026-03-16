import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileSpreadsheet, Wallet, Banknote, BarChart3, FileText, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/csv-export";
import { apiFetch } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [viewingLoading, setViewingLoading] = useState(false);


  const handleDownload = async (reportType: string) => {
    if (!user) return;
    setDownloading(reportType);
    try {
      const data = await fetchReportData(reportType);
      if (!data?.length) { toast({ title: "No data found for selected period" }); return; }

      const formatted = formatReportData(reportType, data);
      downloadCSV(formatted, `${reportType}_report`);
      toast({ title: "Report downloaded successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const handleViewReport = async (reportType: string) => {
    if (!user) return;
    setViewingReport(reportType);
    setViewingLoading(true);
    try {
      const data = await fetchReportData(reportType);
      if (!data?.length) { 
        toast({ title: "No data found for selected period" }); 
        setViewingReport(null);
        return; 
      }

      setReportData(formatReportData(reportType, data));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setViewingReport(null);
    } finally {
      setViewingLoading(false);
    }
  };

  const fetchReportData = async (reportType: string) => {
    // Current backend routes don't support date range filtering yet, 
    // we fetch everything and user gets the full report.
    if (reportType === "wallet_ledger") return await apiFetch("/wallet/transactions");
    if (reportType === "fund_requests") return await apiFetch("/fund-requests");
    if (reportType === "commissions") return await apiFetch("/commission/logs");
    if (reportType === "kyc") return await apiFetch("/kyc");
    return [];
  };

  const formatReportData = (reportType: string, data: any[]) => {
    if (reportType === "wallet_ledger") {
      return data.map((t: any) => ({
        ID: t.id,
        Type: t.type,
        From: t.from_user_id || "System",
        To: t.to_user_id,
        Amount: `₹${t.amount}`,
        Description: t.description || "",
        New_Balance: `₹${t.to_balance_after}`,
        Date: new Date(t.created_at).toLocaleString("en-IN"),
      }));
    }
    if (reportType === "fund_requests") {
      return data.map((r: any) => ({
        ID: r.id,
        Amount: `₹${r.amount}`,
        Status: r.status,
        Mode: r.payment_mode,
        Reference: r.payment_reference,
        Date: new Date(r.created_at).toLocaleString("en-IN"),
      }));
    }
    if (reportType === "commissions") {
      return data.map((c: any) => ({
        ID: c.id,
        Service: c.service_key,
        Txn_Amount: `₹${c.transaction_amount}`,
        Comm: `₹${c.commission_amount}`,
        Value: c.commission_value,
        Credited: c.credited ? "Yes" : "No",
        Date: new Date(c.created_at).toLocaleString("en-IN"),
      }));
    }
    if (reportType === "kyc") {
      return data.map((d: any) => ({
        ID: d.id,
        Type: d.doc_type,
        Status: d.status,
        Created: new Date(d.created_at).toLocaleString("en-IN"),
      }));
    }
    return data;
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
            <CardContent className="pt-0 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleViewReport(r.key)}
                disabled={viewingLoading && viewingReport === r.key}
              >
                {viewingLoading && viewingReport === r.key ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-1.5" />
                )}
                See Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
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

      <Dialog open={!!viewingReport && !viewingLoading} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{reports.find(r => r.key === viewingReport)?.title}</DialogTitle>
            <DialogDescription>
              Preview of the selected report. Click Download CSV for the full record.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {reportData.length > 0 && 
                    Object.keys(reportData[0]).map((key) => (
                      <TableHead key={key}>{key.replace(/_/g, " ")}</TableHead>
                    ))
                  }
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((val: any, j) => (
                      <TableCell key={j} className="whitespace-nowrap max-w-[200px] truncate">
                        {val}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setViewingReport(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
