// Edge Function: instantpay-aeps
// Handles all AePS operations: Cash Withdrawal, Balance Enquiry, Mini Statement, Cash Deposit
import { instantpayPost, instantpayGet, corsHeaders, errorResponse, successResponse } from "../_shared/instantpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "bank_list":
        // GET list of banks for AePS
        return successResponse(await instantpayGet("/v1/aeps/bank-list"));

      case "outlet_login_status":
        // Check if outlet is logged in for the day
        return successResponse(await instantpayPost("/v1/aeps/outlet-login-status", {
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
        }));

      case "outlet_login":
        // Daily outlet login with biometric
        return successResponse(await instantpayPost("/v1/aeps/outlet-login", {
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
          latitude: params.latitude,
          longitude: params.longitude,
          pidData: params.pid_data, // biometric device captured data
        }));

      case "cash_withdrawal":
        // AePS Cash Withdrawal
        return successResponse(await instantpayPost("/v1/aeps/cash-withdrawal", {
          aadhaarNumber: params.aadhaar_number,
          bankIIN: params.bank_iin, // Bank IIN code from bank list
          amount: params.amount,
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
          pidData: params.pid_data,
          latitude: params.latitude,
          longitude: params.longitude,
        }));

      case "balance_enquiry":
        // AePS Balance Enquiry
        return successResponse(await instantpayPost("/v1/aeps/balance-enquiry", {
          aadhaarNumber: params.aadhaar_number,
          bankIIN: params.bank_iin,
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
          pidData: params.pid_data,
          latitude: params.latitude,
          longitude: params.longitude,
        }));

      case "mini_statement":
        // AePS Mini Statement (last 10 transactions)
        return successResponse(await instantpayPost("/v1/aeps/mini-statement", {
          aadhaarNumber: params.aadhaar_number,
          bankIIN: params.bank_iin,
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
          pidData: params.pid_data,
          latitude: params.latitude,
          longitude: params.longitude,
        }));

      case "cash_deposit":
        // AePS Cash Deposit
        return successResponse(await instantpayPost("/v1/aeps/cash-deposit", {
          aadhaarNumber: params.aadhaar_number,
          bankIIN: params.bank_iin,
          amount: params.amount,
          merchantCode: params.merchant_code,
          terminalId: params.terminal_id,
          pidData: params.pid_data,
          latitude: params.latitude,
          longitude: params.longitude,
        }));

      default:
        return errorResponse(`Unknown AePS action: ${action}`);
    }
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
