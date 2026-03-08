import { FileText, Search, CheckCircle2, Clock, XCircle, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const panApplications = [
  { id: "PAN001", applicant: "Ramesh Yadav", type: "New PAN", agency: "NSDL", ack: "NSDL12345678", status: "Completed", date: "Mar 8, 2026" },
  { id: "PAN002", applicant: "Sita Devi", type: "Correction", agency: "UTI", ack: "UTI98765432", status: "Processing", date: "Mar 7, 2026" },
  { id: "PAN003", applicant: "Mohan Lal", type: "New PAN", agency: "NSDL", ack: "NSDL11223344", status: "Completed", date: "Mar 7, 2026" },
  { id: "PAN004", applicant: "Gita Sharma", type: "Reprint", agency: "NSDL", ack: "NSDL55667788", status: "Rejected", date: "Mar 6, 2026" },
  { id: "PAN005", applicant: "Suresh Kumar", type: "New PAN", agency: "UTI", ack: "—", status: "Draft", date: "Mar 8, 2026" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Completed: { icon: CheckCircle2, className: "text-success bg-success/10" },
  Processing: { icon: Clock, className: "text-warning bg-warning/10" },
  Rejected: { icon: XCircle, className: "text-destructive bg-destructive/10" },
  Draft: { icon: Clock, className: "text-muted-foreground bg-muted/30" },
};

export default function PANPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">PAN Services</h1>
          <p className="text-sm text-muted-foreground mt-1">NSDL & UTI PAN card applications, corrections, and reprints.</p>
        </div>
        <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> New Application</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: "1,245", color: "text-primary" },
          { label: "Completed", value: "1,102", color: "text-success" },
          { label: "Processing", value: "98", color: "text-warning" },
          { label: "Rejected", value: "45", color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-gradient-card border border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-2xl font-heading font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl bg-gradient-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Quick Apply</h2>
          </div>
          <div><Label>Application Type</Label>
            <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground">
              <option>New PAN Card</option>
              <option>PAN Correction</option>
              <option>PAN Reprint</option>
            </select>
          </div>
          <div><Label>Agency</Label>
            <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-foreground">
              <option>NSDL (₹107)</option>
              <option>UTI (₹107)</option>
            </select>
          </div>
          <div><Label>Applicant Name</Label><Input placeholder="Full name as per Aadhaar" className="bg-secondary/50 mt-1" /></div>
          <div><Label>Aadhaar Number</Label><Input placeholder="12-digit Aadhaar" className="bg-secondary/50 mt-1" /></div>
          <div><Label>Date of Birth</Label><Input type="date" className="bg-secondary/50 mt-1" /></div>
          <div>
            <Label>Documents</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Upload Aadhaar, Photo, Signature</p>
            </div>
          </div>
          <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold">Submit Application — ₹107</Button>
        </div>

        {/* Applications Table */}
        <div className="lg:col-span-3 rounded-xl bg-gradient-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Applications</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["ID", "Applicant", "Type", "Agency", "Ack No.", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {panApplications.map((app) => {
                  const Cfg = statusConfig[app.status];
                  return (
                    <tr key={app.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{app.id}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{app.applicant}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{app.type}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{app.agency}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{app.ack}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Cfg.className}`}>
                          <Cfg.icon className="w-3 h-3" />{app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{app.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
