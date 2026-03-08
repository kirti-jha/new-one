import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, LogIn, ArrowLeft, KeyRound, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ForgotStep = "idle" | "identity" | "otp" | "new_password" | "done";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("idle");
  const [fpEmail, setFpEmail] = useState("");
  const [fpAadhaarLast4, setFpAadhaarLast4] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowNew, setFpShowNew] = useState(false);
  const [fpShowConfirm, setFpShowConfirm] = useState(false);
  const [fpResetToken, setFpResetToken] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpDemoOtp, setFpDemoOtp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail || fpAadhaarLast4.length !== 4) {
      toast({ title: "Invalid input", description: "Enter your email and last 4 digits of Aadhaar.", variant: "destructive" });
      return;
    }
    setFpLoading(true);
    try {
      const res = await supabase.functions.invoke("forgot-password", {
        body: { action: "verify_identity", email: fpEmail, aadhaar_last4: fpAadhaarLast4 },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      // For demo, show OTP hint
      if (res.data?._demo_otp) setFpDemoOtp(res.data._demo_otp);
      toast({ title: "OTP Sent", description: res.data?.otp_hint || "Check your registered email for OTP." });
      setForgotStep("otp");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpOtp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setFpLoading(true);
    try {
      const res = await supabase.functions.invoke("forgot-password", {
        body: { action: "verify_otp", email: fpEmail, otp: fpOtp },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      setFpResetToken(res.data.reset_token);
      toast({ title: "OTP Verified", description: "You can now set a new password." });
      setForgotStep("new_password");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpNewPassword.length < 6) {
      toast({ title: "Weak password", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setFpLoading(true);
    try {
      const res = await supabase.functions.invoke("forgot-password", {
        body: { action: "reset_password", email: fpEmail, reset_token: fpResetToken, new_password: fpNewPassword },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast({ title: "Password Reset!", description: "You can now login with your new password." });
      setForgotStep("done");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFpLoading(false);
    }
  };

  const resetForgotState = () => {
    setForgotStep("idle");
    setFpEmail("");
    setFpAadhaarLast4("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpResetToken("");
    setFpDemoOtp("");
  };

  const renderForgotPassword = () => {
    if (forgotStep === "identity") {
      return (
        <form onSubmit={handleVerifyIdentity} className="rounded-2xl bg-gradient-card border border-border p-8 space-y-5 shadow-elevated">
          <div className="text-center mb-2">
            <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="font-heading text-lg font-bold text-foreground">Verify Identity</h2>
            <p className="text-xs text-muted-foreground mt-1">Enter your registered email and Aadhaar details</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-email">Registered Email</Label>
            <Input
              id="fp-email" type="email" placeholder="you@example.com"
              value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
              required className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-aadhaar">Last 4 Digits of Aadhaar Number</Label>
            <Input
              id="fp-aadhaar" type="text" placeholder="e.g. 1234" maxLength={4}
              value={fpAadhaarLast4}
              onChange={(e) => setFpAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              required className="bg-secondary/50"
            />
            <p className="text-[10px] text-muted-foreground">The Aadhaar number registered with your account</p>
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-semibold" disabled={fpLoading}>
            <Mail className="w-4 h-4 mr-2" />
            {fpLoading ? "Verifying..." : "Send OTP"}
          </Button>
          <button type="button" onClick={resetForgotState} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </button>
        </form>
      );
    }

    if (forgotStep === "otp") {
      return (
        <form onSubmit={handleVerifyOtp} className="rounded-2xl bg-gradient-card border border-border p-8 space-y-5 shadow-elevated">
          <div className="text-center mb-2">
            <KeyRound className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="font-heading text-lg font-bold text-foreground">Enter OTP</h2>
            <p className="text-xs text-muted-foreground mt-1">
              A 6-digit OTP has been sent to {fpEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
            </p>
          </div>
          {fpDemoOtp && (
            <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-xs text-center">
              <span className="text-muted-foreground">Demo OTP: </span>
              <span className="font-mono font-bold text-foreground text-sm">{fpDemoOtp}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fp-otp">6-Digit OTP</Label>
            <Input
              id="fp-otp" type="text" placeholder="000000" maxLength={6}
              value={fpOtp}
              onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required className="bg-secondary/50 text-center text-lg tracking-[0.5em] font-mono"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-semibold" disabled={fpLoading || fpOtp.length !== 6}>
            {fpLoading ? "Verifying..." : "Verify OTP"}
          </Button>
          <button type="button" onClick={() => setForgotStep("identity")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </form>
      );
    }

    if (forgotStep === "new_password") {
      return (
        <form onSubmit={handleResetPassword} className="rounded-2xl bg-gradient-card border border-border p-8 space-y-5 shadow-elevated">
          <div className="text-center mb-2">
            <KeyRound className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="font-heading text-lg font-bold text-foreground">Set New Password</h2>
            <p className="text-xs text-muted-foreground mt-1">Choose a strong new password for your account</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-new">New Password</Label>
            <div className="relative">
              <Input
                id="fp-new" type={fpShowNew ? "text" : "password"} placeholder="••••••••"
                value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)}
                required minLength={6} className="bg-secondary/50 pr-10"
              />
              <button type="button" onClick={() => setFpShowNew(!fpShowNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {fpShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fpNewPassword && fpNewPassword.length < 6 && (
              <p className="text-xs text-destructive">Must be at least 6 characters</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-confirm">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="fp-confirm" type={fpShowConfirm ? "text" : "password"} placeholder="••••••••"
                value={fpConfirmPassword} onChange={(e) => setFpConfirmPassword(e.target.value)}
                required className="bg-secondary/50 pr-10"
              />
              <button type="button" onClick={() => setFpShowConfirm(!fpShowConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {fpShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fpConfirmPassword && fpNewPassword !== fpConfirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-semibold"
            disabled={fpLoading || fpNewPassword.length < 6 || fpNewPassword !== fpConfirmPassword}>
            {fpLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      );
    }

    if (forgotStep === "done") {
      return (
        <div className="rounded-2xl bg-gradient-card border border-border p-8 space-y-5 shadow-elevated text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Password Reset Successful!</h2>
          <p className="text-sm text-muted-foreground">You can now login with your new password.</p>
          <Button onClick={resetForgotState} className="w-full bg-gradient-primary text-primary-foreground font-semibold">
            <LogIn className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="bg-gradient-glow fixed inset-0 pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">Abheepay</span>
          </Link>
          <p className="text-muted-foreground text-sm">
            {forgotStep === "idle" ? "Sign in to your account" : "Reset your password"}
          </p>
        </div>

        {forgotStep !== "idle" ? (
          renderForgotPassword()
        ) : (
          <form onSubmit={handleLogin} className="rounded-2xl bg-gradient-card border border-border p-8 space-y-5 shadow-elevated">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotStep("identity")}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required className="bg-secondary/50 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-semibold" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Accounts are created by your administrator.<br />
              Contact your upline or admin for access.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
