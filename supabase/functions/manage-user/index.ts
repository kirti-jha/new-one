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

    // Verify caller
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: { user: caller }, error: authErr } = await adminClient.auth.admin.getUserById(
      (await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      }).auth.getUser()).data.user?.id || ""
    );

    if (authErr || !caller) throw new Error("Unauthorized");

    // Verify admin
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();
    if (!roleData || roleData.role !== "admin") throw new Error("Only admins can manage users");

    const { action, target_user_id, ...params } = await req.json();
    if (!action || !target_user_id) throw new Error("action and target_user_id required");

    // Prevent self-modification for dangerous actions
    if (caller.id === target_user_id && ["block", "change_role"].includes(action)) {
      throw new Error("Cannot modify your own account this way");
    }

    let result: any = { success: true };

    switch (action) {
      case "edit_profile": {
        const { full_name, phone, business_name } = params;
        const updates: any = {};
        if (full_name !== undefined) updates.full_name = full_name.trim();
        if (phone !== undefined) updates.phone = phone?.trim() || null;
        if (business_name !== undefined) updates.business_name = business_name?.trim() || null;

        if (Object.keys(updates).length === 0) throw new Error("No fields to update");

        const { error } = await adminClient
          .from("profiles")
          .update(updates)
          .eq("user_id", target_user_id);
        if (error) throw new Error(error.message);
        result.message = "Profile updated";
        break;
      }

      case "change_role": {
        const { new_role } = params;
        const validRoles = ["super_distributor", "master_distributor", "distributor", "retailer"];
        if (!validRoles.includes(new_role)) throw new Error("Invalid role");

        const { error } = await adminClient
          .from("user_roles")
          .update({ role: new_role })
          .eq("user_id", target_user_id);
        if (error) throw new Error(error.message);
        result.message = `Role changed to ${new_role}`;
        break;
      }

      case "block": {
        // Set profile status to blocked and disable auth user
        await adminClient
          .from("profiles")
          .update({ status: "blocked" })
          .eq("user_id", target_user_id);

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "876000h", // ~100 years
        });
        if (error) throw new Error(error.message);
        result.message = "User blocked";
        break;
      }

      case "unblock": {
        await adminClient
          .from("profiles")
          .update({ status: "active" })
          .eq("user_id", target_user_id);

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "none",
        });
        if (error) throw new Error(error.message);
        result.message = "User unblocked";
        break;
      }

      case "reset_password": {
        const { new_password } = params;
        if (!new_password || new_password.length < 6) throw new Error("Password must be at least 6 characters");

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          password: new_password,
        });
        if (error) throw new Error(error.message);
        result.message = "Password reset successfully";
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
