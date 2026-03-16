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

async function fetchBillers() {
  const endpoint = "/v1/billpay/billers?category=Mobile Prepaid";
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
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
  console.log(`STATUS: ${res.status}`);
  console.log(`RESULT: ${JSON.stringify(data).slice(0, 500)}...`);
}

async function fetchSandboxBillers() {
  const endpoint = "/v1/sandbox/bbps/billers?category=Mobile Prepaid";
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  const { timestamp, signature } = generateSignature();
  
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
  console.log(`SANDBOX STATUS: ${res.status}`);
  console.log(`SANDBOX RESULT: ${JSON.stringify(data).slice(0, 500)}...`);
}

fetchBillers().then(() => fetchSandboxBillers());
