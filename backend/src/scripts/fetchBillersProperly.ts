import "dotenv/config";
import fetch from "node-fetch";
import crypto from "crypto";

const INSTANTPAY_BASE = process.env.INSTANTPAY_BASE_URL || "https://api.instantpay.in";
const API_KEY = process.env.INSTANTPAY_API_KEY || "";
const CLIENT_ID = process.env.INSTANTPAY_CLIENT_ID || "";
const ENC_KEY = process.env.INSTANTPAY_ENCRYPTION_KEY || "";

type InstantPayResponse = {
  statuscode?: string;
  actcode?: string;
  data?: { billers?: any[] };
};

function generateSignature() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", ENC_KEY)
    .update(CLIENT_ID + API_KEY + timestamp)
    .digest("hex");
  return { timestamp, signature };
}

async function fetchBillers(cat: string) {
  const url = `${INSTANTPAY_BASE}/v1/bbps/fetch-biller`; // Verified from Supabase
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
    body: JSON.stringify({ category: cat })
  });
  const data = await res.json() as InstantPayResponse;
  console.log(`CAT ${cat} STATUS: ${res.status}`);
  if (data.statuscode === "TNP") {
      console.log(`SUCCESS! Found ${data.data.billers.length} billers`);
      console.log(`FIRST 3:`, JSON.stringify(data.data.billers.slice(0, 3)));
  } else {
      console.log(`FAILED: ${JSON.stringify(data)}`);
  }
}

async function run() {
  await fetchBillers("ELECTRICITY"); // Testing a surely working category
  await fetchBillers("MOBILE");
}
run();
