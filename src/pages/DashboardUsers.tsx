import { Users, Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockUsers = [
  { id: "USR001", name: "Rajesh Kumar", role: "Super Distributor", phone: "9876543210", balance: "₹5,42,100", kyc: "Verified", status: "Active" },
  { id: "USR002", name: "Priya Sharma", role: "Master Distributor", phone: "9876543211", balance: "₹2,18,500", kyc: "Verified", status: "Active" },
  { id: "USR003", name: "Amit Patel", role: "Distributor", phone: "9876543212", balance: "₹89,200", kyc: "Pending", status: "Active" },
  { id: "USR004", name: "Sunita Devi", role: "Retailer", phone: "9876543213", balance: "₹12,450", kyc: "Verified", status: "Active" },
  { id: "USR005", name: "Vikram Singh", role: "Retailer", phone: "9876543214", balance: "₹8,900", kyc: "Rejected", status: "Blocked" },
  { id: "USR006", name: "Meena Kumari", role: "Distributor", phone: "9876543215", balance: "₹1,05,300", kyc: "Verified", status: "Active" },
];

const kycBadge: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  Verified: { icon: CheckCircle2, className: "text-success" },
  Pending: { icon: Clock, className: "text-warning" },
  Rejected: { icon: XCircle, className: "text-destructive" },
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your distribution hierarchy.</p>
        </div>
        <Button variant="hero" size="sm">+ Add User</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-1" /> Filter
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">All Users</h2>
          <span className="text-xs text-muted-foreground ml-2">({mockUsers.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["User ID", "Name", "Role", "Phone", "Balance", "KYC", "Status", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => {
                const Kyc = kycBadge[user.kyc];
                return (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-primary">{user.id}</td>
                    <td className="py-3 px-5 font-medium text-foreground">{user.name}</td>
                    <td className="py-3 px-5 text-secondary-foreground">{user.role}</td>
                    <td className="py-3 px-5 text-muted-foreground">{user.phone}</td>
                    <td className="py-3 px-5 font-medium text-foreground">{user.balance}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5">
                        <Kyc.icon className={`w-4 h-4 ${Kyc.className}`} />
                        <span className="text-xs">{user.kyc}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
