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
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !caller) throw new Error("Unauthorized");

    // Get caller's role
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();
    if (!callerRole) throw new Error("No role assigned");

    const ROLE_LEVEL: Record<string, number> = {
      admin: 1, super_distributor: 2, master_distributor: 3, distributor: 4, retailer: 5,
    };

    const { action, target_user_id, ...params } = await req.json();
    if (!action || !target_user_id) throw new Error("action and target_user_id required");

    // For non-admin callers, verify they are an ancestor of the target
    if (callerRole.role !== "admin") {
      const callerLevel = ROLE_LEVEL[callerRole.role] || 99;

      // Get target's role
      const { data: targetRoleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", target_user_id)
        .single();
      if (!targetRoleData) throw new Error("Target has no role");

      const targetLevel = ROLE_LEVEL[targetRoleData.role] || 99;
      if (callerLevel >= targetLevel) throw new Error("Cannot manage users at or above your level");

      // Verify ancestry
      const { data: targetProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("user_id", target_user_id)
        .single();
      if (targetProfile) {
        const { data: isAncestor } = await adminClient.rpc("is_ancestor_of", {
          _user_id: caller.id,
          _profile_id: targetProfile.id,
        });
        if (!isAncestor) throw new Error("Target user is not in your downline");
      }
    }

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

        // Notify user
        await adminClient.from("notifications").insert({
          user_id: target_user_id,
          title: "Profile Updated",
          message: "Your profile has been updated by an administrator.",
          type: "kyc_update",
          reference_type: "profile",
        });
        break;
      }

      case "change_role": {
        if (callerRole.role !== "admin") throw new Error("Only admins can change roles");
        const { new_role } = params;
        const validRoles = ["super_distributor", "master_distributor", "distributor", "retailer"];
        if (!validRoles.includes(new_role)) throw new Error("Invalid role");

        const { error } = await adminClient
          .from("user_roles")
          .update({ role: new_role })
          .eq("user_id", target_user_id);
        if (error) throw new Error(error.message);
        const ROLE_LABELS: Record<string, string> = { super_distributor: "Super Distributor", master_distributor: "Master Distributor", distributor: "Distributor", retailer: "Retailer" };
        result.message = `Role changed to ${new_role}`;

        await adminClient.from("notifications").insert({
          user_id: target_user_id,
          title: "Role Changed",
          message: `Your role has been changed to ${ROLE_LABELS[new_role] || new_role}.`,
          type: "role_changed",
          reference_type: "role",
        });
        break;
      }

      case "block": {
        await adminClient
          .from("profiles")
          .update({ status: "blocked" })
          .eq("user_id", target_user_id);

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "876000h",
        });
        if (error) throw new Error(error.message);
        result.message = "User blocked";

        await adminClient.from("notifications").insert({
          user_id: target_user_id,
          title: "Account Blocked",
          message: "Your account has been blocked. Contact your administrator for assistance.",
          type: "account_blocked",
          reference_type: "account",
        });
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

        await adminClient.from("notifications").insert({
          user_id: target_user_id,
          title: "Account Unblocked",
          message: "Your account has been reactivated. You can now log in.",
          type: "account_unblocked",
          reference_type: "account",
        });
        break;
      }

      case "reset_password": {
        if (callerRole.role !== "admin") throw new Error("Only admins can reset passwords");
        const { new_password } = params;
        if (!new_password || new_password.length < 6) throw new Error("Password must be at least 6 characters");

        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          password: new_password,
        });
        if (error) throw new Error(error.message);
        result.message = "Password reset successfully";

        await adminClient.from("notifications").insert({
          user_id: target_user_id,
          title: "Password Reset",
          message: "Your password has been reset by an administrator. Please log in with your new password.",
          type: "password_reset",
          reference_type: "account",
        });
        break;
      }

      case "toggle_service": {
        const { service_key, is_enabled } = params;
        if (!service_key) throw new Error("service_key required");

        if (is_enabled) {
          // Remove the override (enable the service)
          await adminClient
            .from("user_service_overrides")
            .delete()
            .eq("user_id", target_user_id)
            .eq("service_key", service_key);
        } else {
          // Add an override (disable the service)
          const { error } = await adminClient
            .from("user_service_overrides")
            .upsert({
              user_id: target_user_id,
              service_key,
              is_enabled: false,
              disabled_by: caller.id,
            }, { onConflict: "user_id,service_key" });
          if (error) throw new Error(error.message);
        }
        result.message = `Service ${service_key} ${is_enabled ? "enabled" : "disabled"} for user`;
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
