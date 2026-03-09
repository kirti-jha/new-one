import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound, Eye, EyeOff, RefreshCw, CheckCircle2 } from "lucide-react";

export default function DashboardTpin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasTpin, setHasTpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [oldTpin, setOldTpin] = useState("");
  const [newTpin, setNewTpin] = useState("");
  const [confirmTpin, setConfirmTpin] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkTpinStatus();
  }, [user]);

  const checkTpinStatus = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("tpin_hash")
      .eq("user_id", user!.id)
      .single();
    setHasTpin(!!data?.tpin_hash);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (newTpin.length < 4 || newTpin.length > 6) {
      toast({ title: "Invalid PIN", description: "T-PIN must be 4 to 6 digits.", variant: "destructive" });
      return;
    }
    if (!/^\d+$/.test(newTpin)) {
      toast({ title: "Invalid PIN", description: "T-PIN must contain only digits.", variant: "destructive" });
      return;
    }
    if (newTpin !== confirmTpin) {
      toast({ title: "PIN Mismatch", description: "New PIN and confirm PIN don't match.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const res = await supabase.functions.invoke("set-tpin", {
      body: { old_tpin: hasTpin ? oldTpin : undefined, new_tpin: newTpin },
    });
    setSaving(false);

    if (res.error || res.data?.error) {
      toast({ title: "Error", description: res.data?.error || res.error?.message || "Failed to set T-PIN.", variant: "destructive" });
      return;
    }

    toast({ title: "T-PIN Updated!", description: "Your Transaction PIN has been set successfully." });
    setOldTpin(""); setNewTpin(""); setConfirmTpin("");
    setHasTpin(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="rounded-2xl bg-gradient-primary p-6 flex items-center gap-4">
        <ShieldCheck className="w-9 h-9 text-primary-foreground" />
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-foreground">T-PIN Management</h1>
          <p className="text-sm text-primary-foreground/70 mt-0.5">
            Set or update your Transaction PIN. Required for all payments.
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${hasTpin ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"}`}>
            {hasTpin ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <KeyRound className="w-5 h-5 text-warning shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${hasTpin ? "text-success" : "text-warning"}`}>
                {hasTpin ? "T-PIN is Active" : "T-PIN Not Set"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasTpin
                  ? "Your Transaction PIN is configured. All payments are secured."
                  : "Please set a T-PIN to make payments. Without it, no payment can be processed."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set / Change TPIN Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="w-4 h-4 text-primary" />
            {hasTpin ? "Change T-PIN" : "Set T-PIN"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              {hasTpin && (
                <div className="space-y-2">
                  <Label>Current T-PIN *</Label>
                  <div className="relative">
                    <Input
                      type={showOld ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter current T-PIN"
                      value={oldTpin}
                      onChange={(e) => setOldTpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pr-10 text-center tracking-widest font-bold text-lg"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>New T-PIN * <span className="text-muted-foreground font-normal">(4-6 digits)</span></Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter new T-PIN"
                    value={newTpin}
                    onChange={(e) => setNewTpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pr-10 text-center tracking-widest font-bold text-lg"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm New T-PIN *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Re-enter new T-PIN"
                    value={confirmTpin}
                    onChange={(e) => setConfirmTpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`pr-10 text-center tracking-widest font-bold text-lg ${confirmTpin && newTpin !== confirmTpin ? "border-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmTpin && newTpin !== confirmTpin && (
                  <p className="text-xs text-destructive">PINs do not match</p>
                )}
              </div>

              <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">T-PIN Guidelines:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Must be 4 to 6 digits (numbers only)</li>
                  <li>Do not share your T-PIN with anyone</li>
                  <li>Change it periodically for better security</li>
                  <li>Required for every payment/transaction</li>
                </ul>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving || newTpin.length < 4 || newTpin !== confirmTpin || (hasTpin && oldTpin.length < 4)}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : hasTpin ? "Update T-PIN" : "Set T-PIN"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
