// Edge Function: instantpay-txn-status
// Check status of any transaction (AePS, DMT, BBPS, Payout)
import { instantpayPost, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { txn_id, client_ref_id } = await req.json();

    if (!txn_id && !client_ref_id) {
      return errorResponse("Provide txn_id or client_ref_id");
    }

    const result = await instantpayPost("/v1/reporting/transaction-status", {
      ...(txn_id ? { txnId: txn_id } : {}),
      ...(client_ref_id ? { clientRefId: client_ref_id } : {}),
    });

    return successResponse(result);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
