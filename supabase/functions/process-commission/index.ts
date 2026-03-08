import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ROLE_HIERARCHY = ["retailer", "distributor", "master_distributor", "super_distributor", "admin"] as const;

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

    const { service_key, transaction_amount, retailer_user_id } = await req.json();
    if (!service_key || !transaction_amount || transaction_amount <= 0) {
      throw new Error("service_key and positive transaction_amount required");
    }

    // The retailer who performed the transaction (could be the caller or specified)
    const targetUserId = retailer_user_id || user.id;

    // Get the user's role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId)
      .single();
    if (!roleRow) throw new Error("User role not found");

    // Get all active slabs for this service
    const { data: slabs } = await admin
      .from("commission_slabs")
      .select("*")
      .eq("service_key", service_key)
      .eq("is_active", true);
    if (!slabs || slabs.length === 0) {
      return new Response(JSON.stringify({ message: "No commission slabs for this service" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const slabMap = new Map(slabs.map((s: any) => [s.role, s]));

    // Walk up the hierarchy from the target user, crediting commissions
    // First credit the performer, then walk up parent chain
    const results: any[] = [];

    // Get profile chain: target -> parent -> grandparent -> ... -> admin
    let currentUserId = targetUserId;
    const visited = new Set<string>();

    while (currentUserId && !visited.has(currentUserId)) {
      visited.add(currentUserId);

      // Get role for this user
      const { data: ur } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUserId)
        .single();
      if (!ur) break;

      const slab = slabMap.get(ur.role);
      if (slab) {
        // Calculate commission
        let commissionAmount: number;
        if (slab.commission_type === "percent") {
          commissionAmount = Math.round((transaction_amount * slab.commission_value / 100) * 100) / 100;
        } else {
          commissionAmount = Number(slab.commission_value);
        }

        if (commissionAmount > 0) {
          // Credit to wallet
          const { data: wallet } = await admin
            .from("wallets")
            .select("balance")
            .eq("user_id", currentUserId)
            .single();

          const currentBalance = wallet ? Number(wallet.balance) : 0;
          const newBalance = currentBalance + commissionAmount;

          await admin
            .from("wallets")
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq("user_id", currentUserId);

          // Create wallet transaction
          const { data: txn } = await admin
            .from("wallet_transactions")
            .insert({
              from_user_id: null,
              to_user_id: currentUserId,
              amount: commissionAmount,
              type: "commission",
              description: `Commission: ${slab.service_label} (${slab.commission_type === 'percent' ? slab.commission_value + '%' : '₹' + slab.commission_value})`,
              to_balance_after: newBalance,
              created_by: user.id,
              reference: `comm_${service_key}_${Date.now()}`,
            })
            .select("id")
            .single();

          // Log commission
          await admin.from("commission_logs").insert({
            user_id: currentUserId,
            slab_id: slab.id,
            service_key,
            transaction_amount,
            commission_amount: commissionAmount,
            commission_type: slab.commission_type,
            commission_value: Number(slab.commission_value),
            credited: true,
            wallet_txn_id: txn?.id || null,
          });

          results.push({
            user_id: currentUserId,
            role: ur.role,
            commission: commissionAmount,
          });
        }
      }

      // Walk up to parent
      const { data: profile } = await admin
        .from("profiles")
        .select("parent_id")
        .eq("user_id", currentUserId)
        .single();

      if (!profile?.parent_id) break;

      // Get user_id from parent profile id
      const { data: parentProfile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("id", profile.parent_id)
        .single();

      currentUserId = parentProfile?.user_id || null;
    }

    return new Response(JSON.stringify({ success: true, commissions: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
