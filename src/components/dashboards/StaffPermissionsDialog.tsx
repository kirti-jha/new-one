import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  UserCog, 
  Wallet, 
  Settings, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionGroup {
  title: string;
  masterKey: string;
  icon: any;
  permissions: {
    key: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "User Management",
    masterKey: "can_manage_users",
    icon: UserCog,
    permissions: [
      { key: "can_create_users", label: "Create Users", description: "Allow adding new distributors and retailers" },
      { key: "can_edit_users", label: "Edit Users", description: "Allow modifying user profile details" },
      { key: "can_block_users", label: "Block/Unblock", description: "Allow disabling and enabling user accounts" },
      { key: "can_delete_users", label: "Delete Users", description: "Allow permanent removal of user accounts" },
      { key: "can_manage_user_services", label: "Manage Services", description: "Allow enabling/disabling specific services for a user" },
      { key: "can_change_user_roles", label: "Change Roles", description: "Allow upgrading or downgrading user roles" },
      { key: "can_reset_user_passwords", label: "Reset Passwords", description: "Allow resetting user passwords" },
      { key: "can_view_user_docs", label: "View Documents", description: "Allow viewing KYC/Aadhaar/PAN documents" },
    ],
  },
  {
    title: "Finance & Wallet",
    masterKey: "can_manage_finance",
    icon: Wallet,
    permissions: [
      { key: "can_approve_fund_requests", label: "Approve Fund Requests", description: "Allow approving incoming fund requests" },
      { key: "can_reject_fund_requests", label: "Reject Fund Requests", description: "Allow rejecting and refunding fund requests" },
      { key: "can_manage_bank_accounts", label: "Manage Bank Accounts", description: "Allow adding/editing company bank details" },
      { key: "can_view_transactions", label: "View Transactions", description: "Allow viewing detailed transaction history" },
      { key: "can_perform_wallet_transfer", label: "Wallet Transfer", description: "Allow direct wallet-to-wallet transfers" },
    ],
  },
  {
    title: "Commissions Management",
    masterKey: "can_manage_commissions",
    icon: ShieldAlert,
    permissions: [
      { key: "can_manage_commissions", label: "Edit Commissions", description: "Allow creating and editing commission slabs" },
    ],
  },
  {
    title: "System & Global Services",
    masterKey: "can_manage_services",
    icon: Settings,
    permissions: [
      { key: "can_manage_global_services", label: "Global Services", description: "Allow global service configuration" },
      { key: "can_manage_settings", label: "Global Settings", description: "Allow modifying system-wide settings" },
      { key: "can_manage_security", label: "Security Management", description: "Allow managing security and access logs" },
    ],
  },
  {
    title: "Support & Reports",
    masterKey: "can_manage_support",
    icon: FileText,
    permissions: [
      { key: "can_reply_support_tickets", label: "Reply Tickets", description: "Allow responding to support queries" },
      { key: "can_view_reports", label: "View Reports", description: "Allow accessing analytical reports" },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  initialPermissions: any;
  onUpdate: () => void;
}

export function StaffPermissionsDialog({ open, onOpenChange, userId, userName, initialPermissions, onUpdate }: Props) {
  const [perms, setPerms] = useState<any>(initialPermissions || {});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialPermissions) {
      setPerms(initialPermissions);
    }
  }, [initialPermissions, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiFetch(`/staff/permissions/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(perms),
      });
      toast({ title: "Success", description: "Permissions updated successfully." });
      onUpdate();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMaster = (group: PermissionGroup) => {
    const newVal = !perms[group.masterKey];
    const updated = { ...perms, [group.masterKey]: newVal };
    
    // If turning ON, default enable all sub-actions
    if (newVal) {
      group.permissions.forEach(p => {
        updated[p.key] = true;
      });
    }
    
    setPerms(updated);
  };

  const toggleSub = (key: string) => {
    setPerms((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Manage Staff Permissions
          </DialogTitle>
          <DialogDescription className="text-sm">
            Control access levels for <span className="font-semibold text-foreground">{userName}</span>. Enable modules to reveal specific powers.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4 mt-4">
          <div className="space-y-4 pb-4">
            {PERMISSION_GROUPS.map((group, idx) => {
              const isMasterActive = !!perms[group.masterKey];
              
              return (
                <div key={group.title} className={cn(
                  "rounded-xl border transition-all duration-300 overflow-hidden",
                  isMasterActive ? "border-primary/20 bg-primary/5 shadow-sm" : "border-border bg-card"
                )}>
                  {/* Master Toggle Area */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20"
                    onClick={() => toggleMaster(group)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isMasterActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <group.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground tracking-tight">{group.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {isMasterActive ? "Access Enabled" : "Access Disabled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={isMasterActive} 
                        onCheckedChange={() => toggleMaster(group)}
                        onClick={(e) => e.stopPropagation()} 
                      />
                      {isMasterActive ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Sub-actions (Collapsible) */}
                  {isMasterActive && (
                    <div className="p-4 pt-0 border-t border-primary/10 animate-in slide-in-from-top-1 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {group.permissions.map((p) => (
                          <div 
                            key={p.key} 
                            className="flex items-center justify-between space-x-2 rounded-lg border bg-background p-3 hover:border-primary/30 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium leading-none cursor-pointer" onClick={() => toggleSub(p.key)}>
                                {p.label}
                              </Label>
                              <p className="text-[10px] text-muted-foreground leading-tight mt-1">{p.description}</p>
                            </div>
                            <Switch 
                              checked={!!perms[p.key]} 
                              onCheckedChange={() => toggleSub(p.key)} 
                              scale={0.8}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-8 shadow-lg shadow-primary/20">
            {loading ? "Saving Changes..." : "Apply Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
