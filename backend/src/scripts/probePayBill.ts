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
};

function generateSignature() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", ENC_KEY)
    .update(CLIENT_ID + API_KEY + timestamp)
    .digest("hex");
  return { timestamp, signature };
}

async function test(billerId: string) {
  const endpoint = "/v1/bbps/pay-bill";
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
        billerId: billerId,
        consumerNumber: "9953192528",
        amount: "11",
        mobileNumber: "9953192528",
        clientRefId: "TEST_" + Date.now()
    })
  });
  const data = await res.json() as InstantPayResponse;
  console.log(`ID ${billerId}: ${res.status} | ${data.actcode || data.statuscode}`);
}

async function run() {
  for (let i = 1; i <= 5; i++) {
    await test(String(i));
  }
}
run();
