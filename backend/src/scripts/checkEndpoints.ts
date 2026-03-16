import "dotenv/config";
import fetch from "node-fetch";
import crypto from "crypto";

const INSTANTPAY_BASE = process.env.INSTANTPAY_BASE_URL || "https://api.instantpay.in";
const API_KEY = process.env.INSTANTPAY_API_KEY || "";
const CLIENT_ID = process.env.INSTANTPAY_CLIENT_ID || "";
const ENC_KEY = process.env.INSTANTPAY_ENCRYPTION_KEY || "";

function generateSignature() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", ENC_KEY)
    .update(CLIENT_ID + API_KEY + timestamp)
    .digest("hex");
  return { timestamp, signature };
}

async function testEndpoint(endpoint: string, body: any = null) {
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
  console.log(`\n--- Testing: ${url} ---`);
  try {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "x-client-id": CLIENT_ID,
        "x-timestamp": timestamp,
        "x-signature": signature,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    return result;
  } catch (e: any) {
    console.error(`Error: ${e.message}`);
  }
}

async function runTests() {
  const body = {
    billerId: "AIRTEL",
    mobile_number: "9953192528",
    amount: "10",
    clientRefId: "TEST_" + Date.now()
  };

  await testEndpoint("/v1/bbps/recharge", body);
  await testEndpoint("/v1/billpay/recharge", body);
  await testEndpoint("/v1/sandbox/bbps/recharge", body);
  await testEndpoint("/v1/sandbox/billpay/recharge", body);
  await testEndpoint("/v1/recharge/mobile", body);
  await testEndpoint("/v1/sandbox/recharge/mobile", body);
}

runTests();
