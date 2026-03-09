// Edge Function: instantpay-verify
// KYC verification: Aadhaar eKYC, PAN, Bank Account (Penny Drop), UPI VPA
import { instantpayPost, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "aadhaar_send_otp":
        // Step 1: Send OTP to Aadhaar linked mobile
        return successResponse(await instantpayPost("/v1/identity/aadhaar-offline-ekyc-send-otp", {
          uidNumber: params.aadhaar_number,
        }));

      case "aadhaar_verify_otp":
        // Step 2: Verify OTP and get eKYC data
        return successResponse(await instantpayPost("/v1/identity/aadhaar-offline-ekyc-verify-otp", {
          uidNumber: params.aadhaar_number,
          otp: params.otp,
          shareCode: params.share_code,
        }));

      case "pan_verify":
        // PAN card verification
        return successResponse(await instantpayPost("/v1/identity/pan-verification", {
          panNumber: params.pan_number,
          name: params.name, // optional name match
        }));

      case "bank_account_verify":
        // Bank Account verification via Penny Drop
        return successResponse(await instantpayPost("/v1/financial-verification/bank-account", {
          accountNumber: params.account_number,
          ifscCode: params.ifsc_code,
        }));

      case "upi_verify":
        // UPI VPA verification
        return successResponse(await instantpayPost("/v1/financial-verification/vpa", {
          vpa: params.vpa,
        }));

      default:
        return errorResponse(`Unknown verify action: ${action}`);
    }
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
