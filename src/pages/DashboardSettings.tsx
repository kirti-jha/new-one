import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/services/api";
import {
  Settings, Bell, Globe, CreditCard, Save, Building2, Plus, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  is_active: boolean;
}

const settingsTabs = ["General", "Bank Accounts", "Notifications", "API & Integrations"] as const;

export default function SettingsPage() {
  const { user, isMasterAdmin, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("General");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBusiness, setProfileBusiness] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [seedingMocks, setSeedingMocks] = useState(false);

  // Bank accounts
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [editBank, setEditBank] = useState<BankAccount | null>(null);
  const [bankName, setBankName] = useState("");
  const [acctName, setAcctName] = useState("");
  const [acctNumber, setAcctNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankSaving, setBankSaving] = useState(false);

  const fetchBanks = useCallback(async () => {
    setBankLoading(true);
    try {
      const data = await apiFetch("/fund-requests/bank-accounts/all");
      if (data) {
        setBanks(data.map((b: any) => ({
          ...b,
          bank_name: b.bankName,
          account_name: b.accountName,
          account_number: b.accountNumber,
          ifsc_code: b.ifscCode,
          upi_id: b.upiId,
          is_active: b.isActive,
        })));
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
    } finally {
      setBankLoading(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "Bank Accounts") fetchBanks(); }, [activeTab, fetchBanks]);
  useEffect(() => {
    if (activeTab !== "General") return;
    const loadProfile = async () => {
      try {
        const data = await apiFetch("/auth/me");
        const p = data?.profile || {};
        setProfileName(p.fullName || "");
        setProfilePhone(p.phone || "");
        setProfileBusiness(p.businessName || "");
      } catch (err) {
        console.error("Error loading admin profile:", err);
      }
    };
    loadProfile();
  }, [activeTab]);

  const openAddBank = () => {
    setEditBank(null); setBankName(""); setAcctName(""); setAcctNumber(""); setIfsc(""); setUpiId("");
    setBankOpen(true);
  };

  const openEditBank = (b: BankAccount) => {
    setEditBank(b); setBankName(b.bank_name); setAcctName(b.account_name);
    setAcctNumber(b.account_number); setIfsc(b.ifsc_code); setUpiId(b.upi_id || "");
    setBankOpen(true);
  };

  const handleSaveBank = async () => {
    if (!bankName || !acctName || !acctNumber || !ifsc || !user) {
      toast({ title: "Missing fields", variant: "destructive" }); return;
    }
    setBankSaving(true);
    try {
      const body = {
        bank_name: bankName,
        account_name: acctName,
        account_number: acctNumber,
        ifsc_code: ifsc,
        upi_id: upiId || null,
      };

      if (editBank) {
        await apiFetch(`/fund-requests/bank-accounts/${editBank.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast({ title: "Bank account updated" });
      } else {
        await apiFetch("/fund-requests/bank-accounts", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast({ title: "Bank account added" });
      }
      setBankOpen(false); fetchBanks();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setBankSaving(false); }
  };

  const handleToggleBank = async (b: BankAccount) => {
    try {
      await apiFetch(`/fund-requests/bank-accounts/${b.id}/toggle`, { method: "PATCH" });
      fetchBanks();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: profileName.trim(),
          phone: profilePhone.trim() || null,
          business_name: profileBusiness.trim() || null,
        }),
      });
      await refreshProfile();
      toast({ title: "Profile updated", description: "Admin profile details saved successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSeedMocks = async () => {
    setSeedingMocks(true);
    try {
      const res = await apiFetch("/users/seed-mock-hierarchy", { method: "POST" });
      toast({
        title: "Mock users seeded",
        description: `${res.created_count || 0} users created. Password: ${res.password_for_all_new_users || "Test@12345"}`,
      });
    } catch (err: any) {
      toast({ title: "Seed failed", description: err.message, variant: "destructive" });
    } finally {
      setSeedingMocks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration, bank accounts, and integrations.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 w-fit flex-wrap">
        {settingsTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2"><Settings className="w-5 h-5 text-primary" /><h2 className="font-heading font-semibold text-foreground">Admin Profile</h2></div>
            <div><Label>Full Name</Label><Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="bg-secondary/50 mt-1" /></div>
            <div><Label>Phone</Label><Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="bg-secondary/50 mt-1" /></div>
            <div><Label>Business Name</Label><Input value={profileBusiness} onChange={(e) => setProfileBusiness(e.target.value)} className="bg-secondary/50 mt-1" /></div>
            <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-gradient-primary text-primary-foreground font-semibold">
              <Save className="w-4 h-4 mr-1" /> {profileSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>

          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2"><Globe className="w-5 h-5 text-primary" /><h2 className="font-heading font-semibold text-foreground">Platform Info</h2></div>
            <div><Label>Platform Name</Label><Input defaultValue="Abheepay" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Support Email</Label><Input defaultValue="support@abheepay.com" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Support Phone</Label><Input defaultValue="+91 1800-XXX-XXXX" className="bg-secondary/50 mt-1" /></div>
            <div><Label>GST Number</Label><Input defaultValue="27AABCU9603R1ZM" className="bg-secondary/50 mt-1" /></div>
            <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Changes</Button>
          </div>
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2"><CreditCard className="w-5 h-5 text-warning" /><h2 className="font-heading font-semibold text-foreground">Transaction Limits</h2></div>
            <div><Label>AEPS Max Withdrawal</Label><Input defaultValue="10000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>DMT Max Per Transaction</Label><Input defaultValue="5000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>DMT Daily Limit Per Sender</Label><Input defaultValue="25000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Min Wallet Balance Alert</Label><Input defaultValue="1000" type="number" className="bg-secondary/50 mt-1" /></div>
            <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Limits</Button>
          </div>

          {isMasterAdmin && (
            <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 mb-2"><Plus className="w-5 h-5 text-primary" /><h2 className="font-heading font-semibold text-foreground">Testing Tools</h2></div>
              <p className="text-sm text-muted-foreground">
                Seed mock users for all hierarchy levels (super distributor to retailer) so every dashboard can be tested quickly.
              </p>
              <Button onClick={handleSeedMocks} disabled={seedingMocks} className="bg-gradient-primary text-primary-foreground font-semibold">
                {seedingMocks ? "Seeding..." : "Seed Mock Hierarchy Users"}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "Bank Accounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Company Bank Accounts
            </h2>
            <Button variant="hero" size="sm" onClick={openAddBank}><Plus className="w-4 h-4 mr-1" /> Add Account</Button>
          </div>
          <p className="text-xs text-muted-foreground">Users will send payments to these accounts, then submit fund requests with payment proof.</p>

          {bankLoading ? (
            <div className="p-10 text-center text-muted-foreground">Loading...</div>
          ) : banks.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-gradient-card border border-border text-muted-foreground">
              No bank accounts added yet. Add one so users can submit fund requests.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((b) => (
                <div key={b.id} className={`rounded-xl border p-5 space-y-2 ${b.is_active ? "bg-gradient-card border-border" : "bg-secondary/20 border-border/50 opacity-60"}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-heading font-semibold text-foreground text-sm">{b.bank_name}</div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBank(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Switch checked={b.is_active} onCheckedChange={() => handleToggleBank(b)} />
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>A/C: <span className="font-mono text-foreground">{b.account_number}</span></div>
                    <div>Name: {b.account_name}</div>
                    <div>IFSC: <span className="font-mono">{b.ifsc_code}</span></div>
                    {b.upi_id && <div>UPI: <span className="font-mono text-primary">{b.upi_id}</span></div>}
                  </div>
                  {!b.is_active && <span className="text-[10px] text-destructive font-medium">Inactive — hidden from users</span>}
                </div>
              ))}
            </div>
          )}

          <Dialog open={bankOpen} onOpenChange={setBankOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editBank ? "Edit" : "Add"} Bank Account</DialogTitle>
                <DialogDescription>Users will see these details when making fund requests.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2"><Label>Bank Name *</Label><Input placeholder="e.g. State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Account Holder Name *</Label><Input placeholder="Company name" value={acctName} onChange={(e) => setAcctName(e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Account Number *</Label><Input placeholder="Account number" value={acctNumber} onChange={(e) => setAcctNumber(e.target.value)} maxLength={30} /></div>
                <div className="space-y-2"><Label>IFSC Code *</Label><Input placeholder="e.g. SBIN0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} maxLength={11} /></div>
                <div className="space-y-2"><Label>UPI ID (optional)</Label><Input placeholder="e.g. company@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} maxLength={50} /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setBankOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveBank} disabled={bankSaving}>{bankSaving ? "Saving..." : editBank ? "Update" : "Add Account"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-warning" /><h2 className="font-heading font-semibold text-foreground">Notification Preferences</h2></div>
          {[
            { label: "Transaction Alerts", desc: "SMS/Email on every transaction", on: true },
            { label: "Low Balance Alert", desc: "Notify when wallet drops below minimum", on: true },
            { label: "Fund Request Updates", desc: "Notify on fund request approval/rejection", on: true },
            { label: "KYC Status Updates", desc: "Email on KYC approval/rejection", on: true },
            { label: "Login Alerts", desc: "Notify on new device logins", on: false },
            { label: "Commission Credits", desc: "Notify on commission payouts", on: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div><div className="text-sm font-medium text-foreground">{item.label}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
          <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Preferences</Button>
        </div>
      )}

      {activeTab === "API & Integrations" && (
        <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /><h2 className="font-heading font-semibold text-foreground">API Keys & Integrations</h2></div>
          {[
            { service: "AEPS Provider", key: "aeps_****_7823", status: "Connected" },
            { service: "DMT Gateway", key: "dmt_****_4521", status: "Connected" },
            { service: "BBPS Integration", key: "bbps_****_9012", status: "Connected" },
            { service: "SMS Gateway", key: "sms_****_3456", status: "Active" },
            { service: "Payment Gateway", key: "pg_****_7890", status: "Active" },
          ].map((api) => (
            <div key={api.service} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div><div className="text-sm font-medium text-foreground">{api.service}</div><div className="text-xs font-mono text-muted-foreground">{api.key}</div></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-success font-medium">{api.status}</span>
                <Button variant="outline" size="sm" className="text-xs h-7">Regenerate</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
