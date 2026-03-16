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
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
      "x-timestamp": timestamp,
      "x-signature": signature,
    },
    body: JSON.stringify({ test: true }),
  });
  console.log(`${res.status} | ${endpoint}`);
  return res.status;
}

async function run() {
  const services = ["bbps", "billpay", "bill-payment", "bill-payments", "recharge", "recharges", "payments"];
  const actions = ["recharge", "pay-bill", "bill-payment", "prepaid"];
  
  for (const s of services) {
    await test(`/v1/${s}/recharge`);
    await test(`/v1/sandbox/${s}/recharge`);
    for (const a of actions) {
        await test(`/v1/${s}/${a}`);
        await test(`/v1/sandbox/${s}/${a}`);
    }
  }
}
run();
