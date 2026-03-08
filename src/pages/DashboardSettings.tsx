import { Settings, Palette, Bell, Globe, CreditCard, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const tabs = ["General", "Branding", "Notifications", "API & Integrations"] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("General");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration, branding, and integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">Platform Info</h2>
            </div>
            <div><Label>Platform Name</Label><Input defaultValue="Abheepay" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Support Email</Label><Input defaultValue="support@abheepay.com" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Support Phone</Label><Input defaultValue="+91 1800-XXX-XXXX" className="bg-secondary/50 mt-1" /></div>
            <div><Label>GST Number</Label><Input defaultValue="27AABCU9603R1ZM" className="bg-secondary/50 mt-1" /></div>
            <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Changes</Button>
          </div>
          <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-warning" />
              <h2 className="font-heading font-semibold text-foreground">Transaction Limits</h2>
            </div>
            <div><Label>AEPS Max Withdrawal</Label><Input defaultValue="10000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>DMT Max Per Transaction</Label><Input defaultValue="5000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>DMT Daily Limit Per Sender</Label><Input defaultValue="25000" type="number" className="bg-secondary/50 mt-1" /></div>
            <div><Label>Min Wallet Balance Alert</Label><Input defaultValue="1000" type="number" className="bg-secondary/50 mt-1" /></div>
            <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Limits</Button>
          </div>
        </div>
      )}

      {activeTab === "Branding" && (
        <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold text-foreground">Branding</h2>
          </div>
          <div>
            <Label>Platform Logo</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop logo here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, SVG. Max 2MB.</p>
            </div>
          </div>
          <div><Label>Primary Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary border border-border" />
              <Input defaultValue="#34D8E0" className="bg-secondary/50 max-w-xs" />
            </div>
          </div>
          <div><Label>Favicon</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Upload favicon (32x32 ICO/PNG)</p>
            </div>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Branding</Button>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            <h2 className="font-heading font-semibold text-foreground">Notification Preferences</h2>
          </div>
          {[
            { label: "Transaction Alerts", desc: "SMS/Email on every transaction", on: true },
            { label: "Low Balance Alert", desc: "Notify when wallet drops below minimum", on: true },
            { label: "KYC Status Updates", desc: "Email on KYC approval/rejection", on: true },
            { label: "Login Alerts", desc: "Notify on new device logins", on: false },
            { label: "Commission Credits", desc: "Notify on commission payouts", on: true },
            { label: "System Maintenance", desc: "Scheduled maintenance notifications", on: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div>
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
          <Button className="bg-gradient-primary text-primary-foreground font-semibold"><Save className="w-4 h-4 mr-1" /> Save Preferences</Button>
        </div>
      )}

      {activeTab === "API & Integrations" && (
        <div className="rounded-xl bg-gradient-card border border-border p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">API Keys & Integrations</h2>
          </div>
          {[
            { service: "AEPS Provider", key: "aeps_****_7823", status: "Connected" },
            { service: "DMT Gateway", key: "dmt_****_4521", status: "Connected" },
            { service: "BBPS Integration", key: "bbps_****_9012", status: "Connected" },
            { service: "SMS Gateway", key: "sms_****_3456", status: "Active" },
            { service: "Payment Gateway", key: "pg_****_7890", status: "Active" },
          ].map((api) => (
            <div key={api.service} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div>
                <div className="text-sm font-medium text-foreground">{api.service}</div>
                <div className="text-xs font-mono text-muted-foreground">{api.key}</div>
              </div>
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
