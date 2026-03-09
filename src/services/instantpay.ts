import { apiFetch } from "./api";

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Generate a unique client reference ID for each transaction */
export function generateClientRef(prefix = "TXN") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Mapping of Supabase function names to Express REST endpoints */
const fnMap: Record<string, string> = {
  "instantpay-aeps": "/instantpay/aeps",
  "instantpay-dmt": "/instantpay/dmt",
  "instantpay-bbps": "/instantpay/bbps",
  "instantpay-payout": "/instantpay/payout",
  "instantpay-verify": "/instantpay/verify",
  "instantpay-txn-status": "/instantpay/txn-status",
};

async function invoke(fn: string, body: Record<string, unknown>) {
  let endpoint = fnMap[fn] || `/${fn}`;

  // For InstantPay proxy routes, the 'action' parameter is part of the URL in the Express backend
  if (body.action && fn !== "instantpay-txn-status") {
    endpoint = `${endpoint}/${body.action}`;
    const { action: _, ...rest } = body;
    body = rest;
  }

  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Trigger commission processing after a successful transaction.
 * This walks up the user hierarchy and credits commission to each level.
 * @param serviceKey  e.g. "aeps", "dmt", "bbps", "payout", "recharge"
 * @param amount      Transaction amount in INR
 */
export async function triggerCommission(serviceKey: string, amount: number) {
  if (amount <= 0) return;
  try {
    await apiFetch("/commission/process", {
      method: "POST",
      body: JSON.stringify({ service_key: serviceKey, transaction_amount: amount }),
    });
  } catch {
    // Commission failure is silent — don't block the user
  }
}


// ─── AePS ──────────────────────────────────────────────────────────────────────

export const aepsService = {
  getBankList: () =>
    apiFetch("/instantpay/aeps/bank-list"),

  outletLoginStatus: (merchant_code: string, terminal_id: string) =>
    invoke("instantpay-aeps", { action: "outlet_login_status", merchant_code, terminal_id }),

  outletLogin: (params: { merchant_code: string; terminal_id: string; latitude: string; longitude: string; pid_data: string }) =>
    invoke("instantpay-aeps", { action: "outlet_login", ...params }),

  cashWithdrawal: (params: { aadhaar_number: string; bank_iin: string; amount: number; merchant_code: string; terminal_id: string; pid_data: string; latitude: string; longitude: string }) =>
    invoke("instantpay-aeps", { action: "cash_withdrawal", ...params }),

  balanceEnquiry: (params: { aadhaar_number: string; bank_iin: string; merchant_code: string; terminal_id: string; pid_data: string; latitude: string; longitude: string }) =>
    invoke("instantpay-aeps", { action: "balance_enquiry", ...params }),

  miniStatement: (params: { aadhaar_number: string; bank_iin: string; merchant_code: string; terminal_id: string; pid_data: string; latitude: string; longitude: string }) =>
    invoke("instantpay-aeps", { action: "mini_statement", ...params }),

  cashDeposit: (params: { aadhaar_number: string; bank_iin: string; amount: number; merchant_code: string; terminal_id: string; pid_data: string; latitude: string; longitude: string }) =>
    invoke("instantpay-aeps", { action: "cash_deposit", ...params }),
};

// ─── DMT (Domestic Money Transfer) ─────────────────────────────────────────────

export const dmtService = {
  checkRemitter: (mobile: string) =>
    invoke("instantpay-dmt", { action: "remitter-profile", mobile }),

  registerRemitter: (params: { mobile: string; first_name: string; last_name: string; address: string; dob: string; pin_code: string }) =>
    invoke("instantpay-dmt", { action: "remitter-registration", ...params }),

  verifyRemitterOtp: (mobile: string, otp: string) =>
    invoke("instantpay-dmt", { action: "remitter-registration-verify", mobile, otp }),

  verifyBankAccount: (account_number: string, ifsc_code: string, beneficiary_name: string) =>
    invoke("instantpay-dmt", { action: "bank-details", account_number, ifsc_code, beneficiary_name }),

  addBeneficiary: (params: { mobile: string; beneficiary_name: string; account_number: string; ifsc_code: string; bank_name: string }) =>
    invoke("instantpay-dmt", { action: "beneficiary-registration", ...params }),

  addBeneficiaryVerify: (mobile: string, otp: string) =>
    invoke("instantpay-dmt", { action: "beneficiary-registration-verify", mobile, otp }),

  deleteBeneficiary: (mobile: string, beneficiary_id: string) =>
    invoke("instantpay-dmt", { action: "beneficiary-delete", mobile, beneficiary_id }),

  generateOtp: (mobile: string) =>
    invoke("instantpay-dmt", { action: "generate-otp", mobile }),

  sendMoney: (params: { mobile: string; beneficiary_id: string; amount: number; txn_type?: "IMPS" | "NEFT"; otp: string }) =>
    invoke("instantpay-dmt", {
      action: "transaction",
      client_ref_id: generateClientRef("DMT"),
      ...params,
    }),

  refund: (txn_id: string, otp: string) =>
    invoke("instantpay-dmt", { action: "refund", txn_id, otp }),
};

// ─── BBPS (Bill Payments + Recharge) ───────────────────────────────────────────

export const bbpsService = {
  fetchBillers: (category: string) =>
    invoke("instantpay-bbps", { action: "fetch-biller", category }),

  fetchBill: (biller_id: string, consumer_number: string, additional_info?: Record<string, string>) =>
    invoke("instantpay-bbps", { action: "fetch-bill", biller_id, consumer_number, additional_info }),

  payBill: (params: { biller_id: string; consumer_number: string; amount: number; mobile_number: string; additional_info?: Record<string, string> }) =>
    invoke("instantpay-bbps", {
      action: "pay-bill",
      client_ref_id: generateClientRef("BBPS"),
      ...params,
    }),

  recharge: (params: { biller_id: string; mobile_number: string; amount: number; operator: string; recharge_type?: "PREPAID" | "POSTPAID" }) =>
    invoke("instantpay-bbps", {
      action: "recharge",
      client_ref_id: generateClientRef("RCH"),
      ...params,
    }),
};

// ─── Payout ─────────────────────────────────────────────────────────────────────

export const payoutService = {
  getBankList: () =>
    apiFetch("/instantpay/payout/bank-list"),

  payToBank: (params: { beneficiary_name: string; account_number: string; ifsc_code: string; amount: number; remarks?: string; transfer_mode?: "IMPS" | "NEFT" | "RTGS" }) =>
    invoke("instantpay-payout", {
      action: "bank-accounts",
      client_ref_id: generateClientRef("PYT"),
      ...params,
    }),

  payToUpi: (vpa: string, amount: number, remarks?: string) =>
    invoke("instantpay-payout", {
      action: "upi-vpa",
      vpa,
      amount,
      remarks,
      client_ref_id: generateClientRef("UPI"),
    }),

  payToWallet: (mobile_number: string, wallet_name: string, amount: number) =>
    invoke("instantpay-payout", {
      action: "pay-wallet",
      mobile_number,
      wallet_name,
      amount,
      client_ref_id: generateClientRef("WLT"),
    }),

  payCreditCard: (card_number: string, amount: number) =>
    invoke("instantpay-payout", {
      action: "pay-credit-card",
      card_number,
      amount,
      client_ref_id: generateClientRef("CC"),
    }),
};

// ─── KYC / Verification ─────────────────────────────────────────────────────────

export const verifyService = {
  aadhaarSendOtp: (aadhaar_number: string) =>
    invoke("instantpay-verify", { action: "aadhaar-send-otp", aadhaar_number }),

  aadhaarVerifyOtp: (aadhaar_number: string, otp: string, share_code: string) =>
    invoke("instantpay-verify", { action: "aadhaar-verify-otp", aadhaar_number, otp, share_code }),

  panVerify: (pan_number: string, name?: string) =>
    invoke("instantpay-verify", { action: "pan_verify", pan_number, name }),

  bankAccountVerify: (account_number: string, ifsc_code: string) =>
    invoke("instantpay-verify", { action: "bank-account", account_number, ifsc_code }),

  upiVerify: (vpa: string) =>
    invoke("instantpay-verify", { action: "upi", vpa }),
};

// ─── Transaction Status ─────────────────────────────────────────────────────────

export const txnStatus = {
  check: (txn_id?: string, client_ref_id?: string) =>
    invoke("instantpay-txn-status", { txn_id, client_ref_id }),
};
