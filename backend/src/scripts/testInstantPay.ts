import "dotenv/config";
import fetch from "node-fetch";
import crypto from "crypto";

const INSTANTPAY_BASE = process.env.INSTANTPAY_BASE_URL || "https://api.instantpay.in";
const API_KEY = process.env.INSTANTPAY_API_KEY || "";
const CLIENT_ID = process.env.INSTANTPAY_CLIENT_ID || "";
const ENC_KEY = process.env.INSTANTPAY_ENCRYPTION_KEY || "";

function generateSignature(payload: string = "") {
  // Common Instant Pay Signature: HMAC-SHA256(payload, encKey) or similar
  // For GET, payload might be empty string.
  return crypto.createHmac("sha256", ENC_KEY).update(payload).digest("hex");
}

async function testEndpoint(endpoint: string, method: string = "GET", body: any = null) {
  console.log(`Testing endpoint: ${endpoint} [${method}]`);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateSignature(CLIENT_ID + API_KEY + timestamp);

  try {
    const res = await fetch(`${INSTANTPAY_BASE}${endpoint}`, {
      method,
      headers: {
        "x-api-key": API_KEY,
        "x-client-id": CLIENT_ID,
        "x-timestamp": timestamp,
        "x-signature": signature,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json() as any;
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(`Error ${endpoint}: ${e.message}`);
  }
}

async function testConnectivity() {
  await testEndpoint("/v1/utility/bank-list");
  await testEndpoint("/v1/payouts/bank-list");
  await testEndpoint("/v1/sandbox/aeps/bank-list");
  await testEndpoint("/v1/sandbox/payouts/bank-list");
  await testEndpoint("/v1/payouts/account/balance", "POST");
  await testEndpoint("/v1/identity/verify-outlet", "POST");
}

testConnectivity();
