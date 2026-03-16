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

async function testSandbox() {
  const endpoint = "/v1/sandbox/bbps/pay-bill";
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
      "x-timestamp": timestamp,
      "x-signature": signature,
    },
    body: JSON.stringify({
        billerId: "AT01",
        consumerNumber: "9953192528",
        amount: "11",
        mobileNumber: "9953192528",
        clientRefId: "SBX_TEST_" + Date.now()
    })
  });
  const data = await res.json();
  console.log(`ENDPOINT: ${endpoint}`);
  console.log(`STATUS: ${res.status}`);
  console.log(`RESULT: ${JSON.stringify(data)}`);
}

testSandbox();
