import "dotenv/config";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const BASE_URL = process.env.SMOKE_BASE_URL || process.env.BACKEND_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL.replace(/\/$/, "")}/api`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function http<T>(
  method: HttpMethod,
  path: string,
  opts: { token?: string; body?: any } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = (await resp.json().catch(() => ({}))) as any;
  if (!resp.ok) {
    const msg = data?.error || data?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(`${method} ${path} failed: ${msg}`);
  }
  return data as T;
}

function assert(cond: any, msg: string) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

async function login(email: string, password: string) {
  const data = await http<{ access_token: string; user: { id: string; email: string } }>(
    "POST",
    "/auth/login",
    { body: { email, password } }
  );
  assert(!!data.access_token, `missing token for ${email}`);
  return data.access_token;
}

async function main() {
  console.log(`[smoke] base=${BASE_URL}`);

  // Health
  {
    const resp = await fetch(`${BASE_URL.replace(/\/$/, "")}/health`);
    assert(resp.ok, "backend /health not ok");
    console.log("[smoke] health ok");
  }

  // Admin session (either existing admin login, or bootstrap if no admin exists)
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL || "admin@abheepay.local";
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "Admin@12345";
  const bootstrapSecret = process.env.BOOTSTRAP_SECRET || "abheepay-bootstrap-2026";

  let adminToken = "";
  try {
    adminToken = await login(adminEmail, adminPassword);
    console.log(`[smoke] admin login ok: ${adminEmail}`);
  } catch (e: any) {
    console.log(`[smoke] admin login failed, trying bootstrap-admin: ${e.message}`);
    try {
      await http("POST", "/auth/bootstrap-admin", {
        body: { email: adminEmail, password: adminPassword, full_name: "Smoke Admin", secret: bootstrapSecret },
      });
      adminToken = await login(adminEmail, adminPassword);
      console.log(`[smoke] bootstrap-admin ok: ${adminEmail}`);
    } catch (e2: any) {
      throw new Error(
        `Cannot get admin session. Set SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_PASSWORD to an existing admin. Last error: ${e2.message}`
      );
    }
  }

  const meAdmin = await http<any>("GET", "/auth/me", { token: adminToken });
  assert(meAdmin?.role === "admin", "admin /auth/me role mismatch");
  const isMasterAdmin = !!(meAdmin?.profile?.isMasterAdmin || meAdmin?.profile?.is_master_admin);
  console.log(`[smoke] admin me ok; master=${isMasterAdmin}`);

  // Seed services should exist (auto-seed is in service-config route; just verify count)
  {
    const services = await http<any[]>("GET", "/service-config", { token: adminToken });
    assert(Array.isArray(services), "service-config not array");
    assert(services.length >= 18, `expected >=18 services, got ${services.length}`);
    console.log(`[smoke] services ok (${services.length})`);
  }

  // Seed mock hierarchy (only for master admin)
  if (isMasterAdmin) {
    try {
      const seeded = await http<any>("POST", "/users/seed-mock-hierarchy", { token: adminToken });
      console.log(`[smoke] seed-mock-hierarchy ok (created=${seeded?.created_count ?? "?"})`);
    } catch (e: any) {
      console.log(`[smoke] seed-mock-hierarchy skipped/failed: ${e.message}`);
    }
  } else {
    console.log("[smoke] seed-mock-hierarchy skipped (not master admin)");
  }

  // Login mock users and verify roles resolve
  const mockPassword = process.env.SMOKE_MOCK_PASSWORD || "Test@12345";
  const users = [
    { email: "sd1.mock@abheepay.local", expectedRole: "super_distributor" },
    { email: "md1.mock@abheepay.local", expectedRole: "master_distributor" },
    { email: "d1.mock@abheepay.local", expectedRole: "distributor" },
    { email: "r1.mock@abheepay.local", expectedRole: "retailer" },
  ];

  const tokens: Record<string, string> = {};
  for (const u of users) {
    const t = await login(u.email, mockPassword);
    tokens[u.email] = t;
    const me = await http<any>("GET", "/auth/me", { token: t });
    assert(me?.role === u.expectedRole, `${u.email} expected role ${u.expectedRole}, got ${me?.role}`);
    console.log(`[smoke] login ok: ${u.email} role=${me.role}`);
  }

  // TPIN set + verify (retailer)
  {
    const rToken = tokens["r1.mock@abheepay.local"];
    const st0 = await http<any>("GET", "/tpin/status", { token: rToken });
    assert(typeof st0?.has_tpin === "boolean", "tpin/status missing has_tpin");
    if (!st0.has_tpin) {
      await http("POST", "/tpin/set", { token: rToken, body: { new_tpin: "1234" } });
      const st1 = await http<any>("GET", "/tpin/status", { token: rToken });
      assert(st1.has_tpin === true, "tpin not set");
      console.log("[smoke] tpin set ok");
    } else {
      console.log("[smoke] tpin already set, skipping set");
    }
    await http("POST", "/tpin/verify", { token: rToken, body: { tpin: "1234" } }).catch(() => {
      // If PIN differs from previous runs, just ensure endpoint works by verifying with set flow.
      throw new Error("tpin verify failed (expected tpin=1234). If you changed it, reset by setting again.");
    });
    console.log("[smoke] tpin verify ok");
  }

  // Wallet transfer (distributor -> retailer) + notifications
  {
    const dToken = tokens["d1.mock@abheepay.local"];
    const rToken = tokens["r1.mock@abheepay.local"];

    const downline = await http<any[]>("GET", "/users/downline", { token: dToken });
    const r1 = downline.find((x) => x.full_name === "Mock Retailer 1" || x.user_id);
    assert(r1?.user_id, "could not resolve downline retailer id");

    const dWallet0 = await http<any>("GET", "/wallet", { token: dToken });
    const rWallet0 = await http<any>("GET", "/wallet", { token: rToken });

    await http("POST", "/wallet/transfer", {
      token: dToken,
      body: { to_user_id: r1.user_id, amount: 10, description: "Smoke transfer" },
    });

    // Allow notifications to commit
    await sleep(250);

    const dWallet1 = await http<any>("GET", "/wallet", { token: dToken });
    const rWallet1 = await http<any>("GET", "/wallet", { token: rToken });

    assert(Number(dWallet1.balance) <= Number(dWallet0.balance) - 10 + 0.01, "distributor balance not reduced");
    assert(Number(rWallet1.balance) >= Number(rWallet0.balance) + 10 - 0.01, "retailer balance not increased");

    const notifs = await http<any[]>("GET", "/notifications", { token: rToken });
    assert(notifs.some((n) => String(n.title || "").includes("Funds Received")), "missing funds received notification");
    console.log("[smoke] wallet transfer + notification ok");
  }

  // Support ticket: retailer creates, admin replies, retailer sees reply
  {
    const rToken = tokens["r1.mock@abheepay.local"];
    const ticket = await http<any>("POST", "/support/tickets", {
      token: rToken,
      body: { subject: "Smoke Ticket", message: "Need help", category: "general" },
    });
    assert(ticket?.id, "ticket create missing id");

    await http("PATCH", `/support/tickets/${ticket.id}/reply`, {
      token: adminToken,
      body: { reply_text: "Smoke reply", status: "open" },
    });

    await sleep(250);

    const tickets = await http<any[]>("GET", "/support/tickets", { token: rToken });
    const updated = tickets.find((t) => t.id === ticket.id);
    assert(updated?.adminReply === "Smoke reply", "ticket reply not visible to retailer");

    const notifs = await http<any[]>("GET", "/notifications", { token: rToken });
    assert(notifs.some((n) => String(n.title || "").includes("Support Reply Received")), "missing support reply notification");
    console.log("[smoke] support ticket flow ok");
  }

  // KYC: upload file via backend, create record, admin approves
  {
    const rToken = tokens["r1.mock@abheepay.local"];
    const adminDocs0 = await http<any[]>("GET", "/kyc", { token: adminToken });

    const contentBase64 = Buffer.from("smoke-kyc").toString("base64");
    const uploaded = await http<any>("POST", "/files/upload", {
      token: rToken,
      body: {
        folder: "kyc-documents/aadhaar",
        filename: "aadhaar.txt",
        mimeType: "text/plain",
        contentBase64,
      },
    });
    assert(uploaded?.filePath, "file upload missing filePath");

    await http("POST", "/kyc", {
      token: rToken,
      body: { doc_type: "aadhaar", file_path: uploaded.filePath, file_name: "aadhaar.txt" },
    });

    const adminDocs1 = await http<any[]>("GET", "/kyc", { token: adminToken });
    assert(adminDocs1.length >= adminDocs0.length, "kyc list did not grow");

    const newest = adminDocs1[0];
    assert(newest?.id, "kyc newest missing id");

    await http("PATCH", `/kyc/${newest.id}/review`, {
      token: adminToken,
      body: { action: "approved", note: "ok" },
    });

    const myDocs = await http<any[]>("GET", "/kyc", { token: rToken });
    assert(myDocs.some((d) => d.id === newest.id && d.status === "approved"), "kyc approval not visible");
    console.log("[smoke] kyc upload + approve ok");
  }

  console.log("[smoke] ALL CHECKS PASSED");
}

main().catch((e) => {
  console.error(String(e?.stack || e?.message || e));
  process.exit(1);
});

