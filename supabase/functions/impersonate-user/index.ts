import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !caller) throw new Error("Unauthorized");

    const { target_user_id } = await req.json();
    if (!target_user_id) throw new Error("target_user_id required");
    if (target_user_id === caller.id) throw new Error("Cannot impersonate yourself");

    // Get caller's role
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();
    if (!callerRole) throw new Error("No role assigned");

    // Get target's role
    const { data: targetRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", target_user_id)
      .single();
    if (!targetRole) throw new Error("Target user has no role");

    const ROLE_LEVEL: Record<string, number> = {
      admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
    };

    const callerLevel = ROLE_LEVEL[callerRole.role] || 99;
    const targetLevel = ROLE_LEVEL[targetRole.role] || 99;

    // Admin can login as anyone; others can only login as lower roles
    if (callerRole.role !== "admin") {
      if (callerLevel >= targetLevel) {
        throw new Error("You can only login as users below you in the hierarchy");
      }
      // Also verify the target is in their downline
      const { data: targetProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("user_id", target_user_id)
        .single();
      if (!targetProfile) throw new Error("Target profile not found");

      const { data: isAncestor } = await adminClient.rpc("is_ancestor_of", {
        _user_id: caller.id,
        _profile_id: targetProfile.id,
      });
      if (!isAncestor) throw new Error("Target user is not in your downline");
    }

    // Generate a magic link for the target user
    // We use generateLink to create a one-time login link
    const { data: targetUser } = await adminClient.auth.admin.getUserById(target_user_id);
    if (!targetUser?.user) throw new Error("Target user not found");

    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: targetUser.user.email!,
    });
    if (linkErr) throw new Error(linkErr.message);

    // Extract the token from the generated link
    const token_hash = linkData.properties?.hashed_token;
    if (!token_hash) throw new Error("Failed to generate login token");

    // Verify the OTP to get a session
    const { data: sessionData, error: verifyErr } = await adminClient.auth.verifyOtp({
      type: "magiclink",
      token_hash,
    });
    if (verifyErr) throw new Error(verifyErr.message);

    return new Response(JSON.stringify({
      success: true,
      access_token: sessionData.session?.access_token,
      refresh_token: sessionData.session?.refresh_token,
      user_email: targetUser.user.email,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
