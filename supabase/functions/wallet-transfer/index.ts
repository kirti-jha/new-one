import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // Get caller's role
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (!callerRole) {
      return new Response(JSON.stringify({ error: "No role assigned" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ROLE_LEVEL: Record<string, number> = {
      admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
    };

    if (action === "top_up") {
      if (callerRole.role !== "admin") {
        return new Response(JSON.stringify({ error: "Only admins can top up wallets" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { to_user_id, amount, description } = body;
      if (!to_user_id || !amount || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid to_user_id or amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let { data: wallet } = await adminClient
        .from("wallets")
        .select("*")
        .eq("user_id", to_user_id)
        .single();

      if (!wallet) {
        const { data: newWallet } = await adminClient
          .from("wallets")
          .insert({ user_id: to_user_id, balance: 0 })
          .select()
          .single();
        wallet = newWallet;
      }

      const newBalance = parseFloat(wallet!.balance as any) + parseFloat(amount);

      await adminClient
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", to_user_id);

      await adminClient.from("wallet_transactions").insert({
        to_user_id,
        amount: parseFloat(amount),
        type: "top_up",
        description: description || "Admin top-up",
        to_balance_after: newBalance,
        created_by: caller.id,
      });

      return new Response(JSON.stringify({ success: true, new_balance: newBalance }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "transfer") {
      const { to_user_id, amount, description } = body;
      if (!to_user_id || !amount || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid to_user_id or amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (to_user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot transfer to yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: targetRole } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", to_user_id)
        .single();

      if (!targetRole) {
        return new Response(JSON.stringify({ error: "Target user has no role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const callerLevel = ROLE_LEVEL[callerRole.role] || 99;
      const targetLevel = ROLE_LEVEL[targetRole.role] || 99;

      if (callerLevel >= targetLevel) {
        return new Response(JSON.stringify({ error: "You can only transfer funds to users below you in hierarchy" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: senderWallet } = await adminClient
        .from("wallets")
        .select("*")
        .eq("user_id", caller.id)
        .single();

      if (!senderWallet || parseFloat(senderWallet.balance as any) < parseFloat(amount)) {
        return new Response(JSON.stringify({ error: "Insufficient balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let { data: receiverWallet } = await adminClient
        .from("wallets")
        .select("*")
        .eq("user_id", to_user_id)
        .single();

      if (!receiverWallet) {
        const { data: nw } = await adminClient
          .from("wallets")
          .insert({ user_id: to_user_id, balance: 0 })
          .select()
          .single();
        receiverWallet = nw;
      }

      const senderNewBalance = parseFloat(senderWallet.balance as any) - parseFloat(amount);
      const receiverNewBalance = parseFloat(receiverWallet!.balance as any) + parseFloat(amount);

      await adminClient.from("wallets").update({ balance: senderNewBalance }).eq("user_id", caller.id);
      await adminClient.from("wallets").update({ balance: receiverNewBalance }).eq("user_id", to_user_id);

      await adminClient.from("wallet_transactions").insert({
        from_user_id: caller.id,
        to_user_id,
        amount: parseFloat(amount),
        type: "transfer",
        description: description || "Fund transfer",
        from_balance_after: senderNewBalance,
        to_balance_after: receiverNewBalance,
        created_by: caller.id,
      });

      return new Response(JSON.stringify({
        success: true,
        sender_balance: senderNewBalance,
        receiver_balance: receiverNewBalance,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "pg_add_fund") {
      // Simulated PG: add funds to caller's own main wallet
      const { amount } = body;
      if (!amount || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Admins don't need PG
      if (callerRole.role === "admin") {
        return new Response(JSON.stringify({ error: "Admins should use top-up instead" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let { data: wallet } = await adminClient
        .from("wallets")
        .select("*")
        .eq("user_id", caller.id)
        .single();

      if (!wallet) {
        const { data: nw } = await adminClient
          .from("wallets")
          .insert({ user_id: caller.id, balance: 0 })
          .select()
          .single();
        wallet = nw;
      }

      const newBalance = parseFloat(wallet!.balance as any) + parseFloat(amount);

      await adminClient
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", caller.id);

      await adminClient.from("wallet_transactions").insert({
        to_user_id: caller.id,
        amount: parseFloat(amount),
        type: "pg_add",
        description: "Fund added via Payment Gateway",
        to_balance_after: newBalance,
        created_by: caller.id,
      });

      return new Response(JSON.stringify({ success: true, new_balance: newBalance }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reverse") {
      if (callerRole.role !== "admin") {
        return new Response(JSON.stringify({ error: "Only admins can reverse transactions" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { transaction_id } = body;
      if (!transaction_id) {
        return new Response(JSON.stringify({ error: "Missing transaction_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: txn } = await adminClient
        .from("wallet_transactions")
        .select("*")
        .eq("id", transaction_id)
        .single();

      if (!txn) {
        return new Response(JSON.stringify({ error: "Transaction not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: recWallet } = await adminClient.from("wallets").select("*").eq("user_id", txn.to_user_id).single();
      if (!recWallet || parseFloat(recWallet.balance as any) < parseFloat(txn.amount as any)) {
        return new Response(JSON.stringify({ error: "Receiver has insufficient balance to reverse" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const recNew = parseFloat(recWallet.balance as any) - parseFloat(txn.amount as any);
      await adminClient.from("wallets").update({ balance: recNew }).eq("user_id", txn.to_user_id);

      let senderNew = null;
      if (txn.from_user_id) {
        const { data: senWallet } = await adminClient.from("wallets").select("*").eq("user_id", txn.from_user_id).single();
        if (senWallet) {
          senderNew = parseFloat(senWallet.balance as any) + parseFloat(txn.amount as any);
          await adminClient.from("wallets").update({ balance: senderNew }).eq("user_id", txn.from_user_id);
        }
      }

      await adminClient.from("wallet_transactions").insert({
        from_user_id: txn.to_user_id,
        to_user_id: txn.from_user_id || txn.to_user_id,
        amount: parseFloat(txn.amount as any),
        type: "reversal",
        description: `Reversal of ${transaction_id}`,
        reference: transaction_id,
        from_balance_after: recNew,
        to_balance_after: senderNew ?? recNew,
        created_by: caller.id,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use top_up, transfer, pg_add_fund, or reverse." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
