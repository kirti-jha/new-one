// Edge Function: instantpay-dmt
// Handles Domestic Money Transfer (Remittance) via InstantPay
import { instantpayPost, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "remitter_profile":
        // Check if sender (remitter) exists
        return successResponse(await instantpayPost("/v1/remittance/remitter-profile", {
          mobile: params.mobile,
        }));

      case "remitter_register":
        // Register a new remitter
        return successResponse(await instantpayPost("/v1/remittance/remitter-registration", {
          mobile: params.mobile,
          firstName: params.first_name,
          lastName: params.last_name,
          address: params.address,
          dob: params.dob, // YYYY-MM-DD
          pinCode: params.pin_code,
        }));

      case "remitter_register_verify":
        // Verify remitter registration OTP
        return successResponse(await instantpayPost("/v1/remittance/remitter-registration-verify", {
          mobile: params.mobile,
          otp: params.otp,
        }));

      case "bank_details":
        // Validate bank account (Penny Drop)
        return successResponse(await instantpayPost("/v1/remittance/bank-details", {
          accountNumber: params.account_number,
          ifscCode: params.ifsc_code,
          beneficiaryName: params.beneficiary_name,
        }));

      case "add_beneficiary":
        // Add a new beneficiary for a remitter
        return successResponse(await instantpayPost("/v1/remittance/beneficiary-registration", {
          mobile: params.mobile,
          benefName: params.beneficiary_name,
          benefAccountNo: params.account_number,
          benefIfsc: params.ifsc_code,
          benefBankName: params.bank_name,
        }));

      case "add_beneficiary_verify":
        // Verify beneficiary OTP
        return successResponse(await instantpayPost("/v1/remittance/beneficiary-registration-verify", {
          mobile: params.mobile,
          otp: params.otp,
        }));

      case "delete_beneficiary":
        return successResponse(await instantpayPost("/v1/remittance/beneficiary-delete", {
          mobile: params.mobile,
          beneficiaryId: params.beneficiary_id,
        }));

      case "generate_otp":
        // Generate OTP before sending money
        return successResponse(await instantpayPost("/v1/remittance/generate-transaction-otp", {
          mobile: params.mobile,
        }));

      case "send_money":
        // Transfer money via IMPS/NEFT — max ₹5000/txn, ₹25000/month
        return successResponse(await instantpayPost("/v1/remittance/transaction", {
          mobile: params.mobile,
          beneficiaryId: params.beneficiary_id,
          amount: params.amount,
          txnType: params.txn_type || "IMPS", // IMPS or NEFT
          otp: params.otp,
          clientRefId: params.client_ref_id, // unique ref you generate
        }));

      case "refund_otp":
        return successResponse(await instantpayPost("/v1/remittance/transaction-refund-otp", {
          txnId: params.txn_id,
        }));

      case "refund":
        return successResponse(await instantpayPost("/v1/remittance/transaction-refund", {
          txnId: params.txn_id,
          otp: params.otp,
        }));

      default:
        return errorResponse(`Unknown DMT action: ${action}`);
    }
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
