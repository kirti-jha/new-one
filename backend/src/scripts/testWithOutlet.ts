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

async function test(outletId: string) {
  const endpoint = "/v1/billpay/recharge";
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
  const body = {
    billerId: "AIRTEL",
    mobile_number: "9953192528",
    amount: "11", // 11 is success in sandbox
    clientRefId: "TEST_" + Date.now(),
    outletId: outletId
  };
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
      "x-timestamp": timestamp,
      "x-signature": signature,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(`OUTLET ID: ${outletId}`);
  console.log(`STATUS: ${res.status}`);
  console.log(`RESULT: ${JSON.stringify(data)}`);
}

async function run() {
  await test("1");
  await test("100");
  await test("1000");
}
run();
