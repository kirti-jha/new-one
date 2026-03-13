import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthSession } from "@/services/api";
import usePageTitle from "@/hooks/usePageTitle";

export default function ImpersonatePage() {
  usePageTitle("AbheePay | Impersonation");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const userId = searchParams.get("user_id");
    const email = searchParams.get("email") || "impersonated@local";
    const userName = searchParams.get("name") || "User";

    if (!accessToken) {
      setError("Invalid impersonation link.");
      return;
    }

    // Mark this tab as an impersonated session
    sessionStorage.setItem("impersonated_as", userName);

    // Use sessionStorage so impersonation doesn't overwrite admin session in other tabs.
    setAuthSession(accessToken, { id: userId || "impersonated", email }, { scope: "session" });
    navigate("/dashboard", { replace: true });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={() => window.close()} className="text-sm text-muted-foreground underline">
            Close this tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Setting up impersonated session...</p>
      </div>
    </div>
  );
}
