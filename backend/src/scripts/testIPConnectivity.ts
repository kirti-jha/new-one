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

async function test(endpoint: string) {
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "x-client-id": CLIENT_ID,
        "x-timestamp": timestamp,
        "x-signature": signature,
      },
    });
    const data = await res.json();
    console.log(`ENDPOINT: ${endpoint}`);
    console.log(`STATUS: ${res.status}`);
    console.log(`RESULT: ${JSON.stringify(data).slice(0, 200)}`);
  } catch (e: any) {
    console.log(`ERROR ${endpoint}: ${e.message}`);
  }
}

async function run() {
  await test("/v1/utility/bank-list");
  await test("/v1/sandbox/aeps/bank-list");
}
run();
