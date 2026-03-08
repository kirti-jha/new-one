import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: authError } = await callerClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Only admins can create users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      email, password, full_name, phone, business_name, role, parent_id,
      aadhaar_number, pan_number, aadhaar_image_path, pan_image_path,
      bank_name, bank_account_number, bank_ifsc, bank_account_holder,
    } = body;

    if (!email || !password || !full_name || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, password, full_name, role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "super_distributor", "master_distributor", "distributor", "retailer"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only master admin can create other admins
    if (role === "admin") {
      const { data: callerProfile } = await adminClient
        .from("profiles")
        .select("is_master_admin")
        .eq("user_id", callerUser.id)
        .single();
      if (!callerProfile?.is_master_admin) {
        return new Response(JSON.stringify({ error: "Only the Master Admin can create staff admin accounts." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create the auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser.user.id;

    // Update profile (created by trigger) with all fields
    await adminClient
      .from("profiles")
      .update({
        full_name,
        phone: phone || null,
        business_name: business_name || null,
        parent_id: parent_id || null,
        aadhaar_number: aadhaar_number || null,
        pan_number: pan_number || null,
        aadhaar_image_path: aadhaar_image_path || null,
        pan_image_path: pan_image_path || null,
        bank_name: bank_name || null,
        bank_account_number: bank_account_number || null,
        bank_ifsc: bank_ifsc || null,
        bank_account_holder: bank_account_holder || null,
      })
      .eq("user_id", userId);

    // Assign role
    await adminClient.from("user_roles").insert({
      user_id: userId,
      role,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: userId, email, full_name, role },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
