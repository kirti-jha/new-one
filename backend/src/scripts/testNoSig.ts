import "dotenv/config";
import fetch from "node-fetch";

const INSTANTPAY_BASE = process.env.INSTANTPAY_BASE_URL || "https://api.instantpay.in";
const API_KEY = process.env.INSTANTPAY_API_KEY || "";
const CLIENT_ID = process.env.INSTANTPAY_CLIENT_ID || "";

async function testNoSig(endpoint: string) {
  const url = `${INSTANTPAY_BASE}${endpoint}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
    },
    body: JSON.stringify({ category: "Mobile Prepaid" }),
  });
  const data = await res.json();
  console.log(`ENDPOINT: ${endpoint}`);
  console.log(`STATUS: ${res.status}`);
  console.log(`RESULT: ${JSON.stringify(data).slice(0, 200)}`);
}

async function run() {
  await testNoSig("/v1/bbps/fetch-biller");
  await testNoSig("/v1/bbps/pay-bill");
}
run();
