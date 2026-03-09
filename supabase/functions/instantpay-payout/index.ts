// Edge Function: instantpay-payout
// Handles Payouts to bank accounts, UPI, wallets, credit cards
import { instantpayPost, instantpayGet, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "bank_list":
        return successResponse(await instantpayGet("/v1/payouts/bank-list"));

      case "pay_bank":
        // Transfer to bank account
        return successResponse(await instantpayPost("/v1/payouts/bank-accounts", {
          beneficiaryName: params.beneficiary_name,
          accountNumber: params.account_number,
          ifscCode: params.ifsc_code,
          amount: params.amount,
          remarks: params.remarks || "Payout",
          clientRefId: params.client_ref_id,
          transferMode: params.transfer_mode || "IMPS", // IMPS, NEFT, RTGS
        }));

      case "pay_upi":
        // Transfer to UPI VPA
        return successResponse(await instantpayPost("/v1/payouts/upi-vpa", {
          vpa: params.vpa, // UPI ID e.g. name@upi
          amount: params.amount,
          remarks: params.remarks || "UPI Payout",
          clientRefId: params.client_ref_id,
        }));

      case "pay_wallet":
        // Transfer to wallet (Paytm etc.)
        return successResponse(await instantpayPost("/v1/payouts/wallets", {
          mobileNumber: params.mobile_number,
          walletName: params.wallet_name, // PAYTM, PHONEPAY, etc.
          amount: params.amount,
          clientRefId: params.client_ref_id,
        }));

      case "pay_credit_card":
        // Credit card bill payment via payout
        return successResponse(await instantpayPost("/v1/payouts/credit-card", {
          cardNumber: params.card_number,
          amount: params.amount,
          clientRefId: params.client_ref_id,
        }));

      default:
        return errorResponse(`Unknown Payout action: ${action}`);
    }
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
