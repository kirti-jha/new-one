import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ImpersonatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const userName = searchParams.get("name") || "User";

    if (!accessToken || !refreshToken) {
      setError("Invalid impersonation link.");
      return;
    }

    // Mark this tab as an impersonated session
    sessionStorage.setItem("impersonated_as", userName);

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          navigate("/dashboard", { replace: true });
        }
      });
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
