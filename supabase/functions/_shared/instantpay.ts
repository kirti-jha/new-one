// Shared InstantPay API client utility for all Edge Functions
// Set INSTANTPAY_API_KEY and INSTANTPAY_CLIENT_ID in Supabase project secrets

const BASE_URL = "https://api.instantpay.in";

export const INSTANTPAY_KEY = Deno.env.get("INSTANTPAY_API_KEY") || "";
export const INSTANTPAY_CLIENT_ID = Deno.env.get("INSTANTPAY_CLIENT_ID") || "";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function instantpayPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": INSTANTPAY_CLIENT_ID,
      "x-api-key": INSTANTPAY_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

export async function instantpayGet(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "x-client-id": INSTANTPAY_CLIENT_ID,
      "x-api-key": INSTANTPAY_KEY,
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

export function errorResponse(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function successResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
