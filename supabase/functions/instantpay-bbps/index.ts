// Edge Function: instantpay-bbps
// Handles BBPS Bill Payments (Electricity, Water, Gas, Mobile, DTH, FASTag, Insurance, Recharge)
import { instantpayPost, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "fetch_billers":
        // Get list of billers for a category
        return successResponse(await instantpayPost("/v1/bbps/fetch-biller", {
          category: params.category, // e.g. ELECTRICITY, WATER, GAS, DTH, MOBILE, FASTAG
        }));

      case "fetch_bill":
        // Fetch bill details for a consumer
        return successResponse(await instantpayPost("/v1/bbps/fetch-bill", {
          billerId: params.biller_id,
          consumerNumber: params.consumer_number,
          additionalInfo: params.additional_info || {},
        }));

      case "pay_bill":
        // Pay the bill
        return successResponse(await instantpayPost("/v1/bbps/pay-bill", {
          billerId: params.biller_id,
          consumerNumber: params.consumer_number,
          amount: params.amount,
          mobileNumber: params.mobile_number,
          clientRefId: params.client_ref_id, // unique ref you generate
          additionalInfo: params.additional_info || {},
        }));

      case "recharge":
        // Mobile / DTH / Data recharge via BBPS
        return successResponse(await instantpayPost("/v1/bbps/pay-bill", {
          billerId: params.biller_id, // operator's biller ID
          consumerNumber: params.mobile_number, // mobile / customer ID
          amount: params.amount,
          mobileNumber: params.mobile_number,
          clientRefId: params.client_ref_id,
          additionalInfo: {
            operatorName: params.operator,
            rechargeType: params.recharge_type || "PREPAID",
          },
        }));

      default:
        return errorResponse(`Unknown BBPS action: ${action}`);
    }
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
