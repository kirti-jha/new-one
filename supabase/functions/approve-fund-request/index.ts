import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);

    const { action, request_id, rejection_reason } = await req.json();
    if (!action || !request_id) throw new Error("action and request_id required");

    // Get the fund request
    const { data: fundReq, error: frErr } = await admin
      .from("fund_requests")
      .select("*")
      .eq("id", request_id)
      .single();
    if (frErr || !fundReq) throw new Error("Fund request not found");
    if (fundReq.status !== "pending") throw new Error("Request is already " + fundReq.status);

    // Verify caller is admin or upline of requester
    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = callerRole?.role === "admin";

    if (!isAdmin) {
      // Check if caller is ancestor
      const { data: reqProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("user_id", fundReq.requester_id)
        .single();

      if (!reqProfile) throw new Error("Requester profile not found");

      const { data: isAncestor } = await admin.rpc("is_ancestor_of", {
        _user_id: user.id,
        _profile_id: reqProfile.id,
      });
      if (!isAncestor) throw new Error("You are not authorized to approve this request");
    }

    if (action === "approve") {
      const amount = Number(fundReq.amount);

      // Get approver's wallet
      const { data: approverWallet } = await admin
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!approverWallet) throw new Error("Approver wallet not found");
      const approverBalance = Number(approverWallet.balance);

      // Admin can approve without balance check (top-up), others need sufficient balance
      if (!isAdmin && approverBalance < amount) {
        throw new Error(`Insufficient balance. You have ₹${approverBalance.toFixed(2)} but need ₹${amount.toFixed(2)}`);
      }

      // Get requester's wallet
      const { data: reqWallet } = await admin
        .from("wallets")
        .select("balance")
        .eq("user_id", fundReq.requester_id)
        .single();

      const reqBalance = reqWallet ? Number(reqWallet.balance) : 0;
      const newReqBalance = reqBalance + amount;

      // Deduct from approver (unless admin doing top-up)
      let newApproverBalance = approverBalance;
      if (!isAdmin) {
        newApproverBalance = approverBalance - amount;
        await admin
          .from("wallets")
          .update({ balance: newApproverBalance, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }

      // Credit to requester
      await admin
        .from("wallets")
        .update({ balance: newReqBalance, updated_at: new Date().toISOString() })
        .eq("user_id", fundReq.requester_id);

      // Create wallet transaction
      const { data: txn } = await admin
        .from("wallet_transactions")
        .insert({
          from_user_id: isAdmin ? null : user.id,
          to_user_id: fundReq.requester_id,
          amount,
          type: isAdmin ? "top_up" : "transfer",
          description: `Fund request #${request_id.slice(0, 8)} approved`,
          from_balance_after: isAdmin ? null : newApproverBalance,
          to_balance_after: newReqBalance,
          created_by: user.id,
          reference: `fund_req_${request_id}`,
        })
        .select("id")
        .single();

      // Update fund request
      await admin
        .from("fund_requests")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          wallet_txn_id: txn?.id || null,
        })
        .eq("id", request_id);

      // Notify requester
      const { data: approverProfile } = await admin.from("profiles").select("full_name").eq("user_id", user.id).single();
      await admin.from("notifications").insert({
        user_id: fundReq.requester_id,
        title: "Fund Request Approved",
        message: `Your fund request of ₹${amount.toLocaleString("en-IN")} has been approved by ${approverProfile?.full_name || "Admin"}.`,
        type: "fund_approved",
        reference_id: request_id,
        reference_type: "fund_request",
      });

      return new Response(JSON.stringify({ success: true, message: "Fund request approved and credited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      await admin
        .from("fund_requests")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejection_reason || "Rejected by reviewer",
        })
        .eq("id", request_id);

      return new Response(JSON.stringify({ success: true, message: "Fund request rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use 'approve' or 'reject'");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
