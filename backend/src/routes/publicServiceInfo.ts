import { Router } from "express";

type ServiceInfoResult = {
  title: string;
  link: string;
  snippet: string;
};

type ServiceInfoResponse = {
  provider: "google_cse" | "fallback" | "error";
  serviceKey: string;
  query: string;
  fetchedAt: string;
  overview: string;
  bullets: string[];
  results?: ServiceInfoResult[];
  error?: string;
};

const router = Router();

const QUERY_BY_KEY: Record<string, string> = {
  aeps: "AEPS Aadhaar Enabled Payment System",
  dmt: "Domestic Money Transfer (DMT) India",
  bbps: "BBPS Bharat Bill Payment System",
  recharge: "Mobile recharge DTH recharge India",
  pan: "PAN card application India",
  "credit-card": "Credit card application process India",
  "cc-bill-pay": "Credit card bill payment India",
  payout: "Payouts IMPS NEFT API India",
  matm: "Micro ATM mATM India",
  pos: "POS machine card payments India",
  insurance: "Insurance distribution India",
  loan: "Loan application process India",
  "ppi-wallet": "Prepaid payment instrument PPI wallet India",
  "sound-box": "UPI soundbox device India",
  "travel-booking": "Travel booking flight train bus booking India",
  "travel-package": "Travel packages booking India",
  pg: "Payment gateway India online payments",
  "bank-account": "Bank account opening India",
};

const FALLBACK_BY_KEY: Record<string, { overview: string; bullets: string[] }> = {
  aeps: {
    overview:
      "AEPS enables basic banking services using Aadhaar authentication via a biometric device at a retail point.",
    bullets: [
      "Cash withdrawal, balance enquiry, mini statement",
      "Biometric authentication reduces OTP dependency",
      "Works across multiple banks via enabled networks",
    ],
  },
  dmt: {
    overview: "DMT supports quick domestic transfers to Indian bank accounts with real-time status tracking.",
    bullets: ["24/7 transfers (availability depends on rails)", "Beneficiary management and limits", "Reconciliation and settlement reporting"],
  },
  bbps: {
    overview: "BBPS provides a standardized bill-pay experience across supported billers with end-to-end status visibility.",
    bullets: ["Electricity, gas, water, broadband, etc. (as supported)", "Instant confirmations where available", "Retry/complaint support with references"],
  },
  recharge: {
    overview: "Recharge covers prepaid top-ups and DTH recharges with fast confirmations and operator-wide coverage.",
    bullets: ["Mobile & DTH recharge flows", "Operator and circle handling", "Transaction status and refunds tracking"],
  },
  pan: {
    overview: "PAN services help submit PAN applications and corrections with document collection and status tracking.",
    bullets: ["New PAN and correction flows", "Document capture and verification steps", "Application status visibility"],
  },
  "credit-card": {
    overview: "Credit card services typically cover lead capture, eligibility checks, and application tracking for partners.",
    bullets: ["Lead capture and KYC basics", "Partner/bank-specific eligibility & offers", "Application tracking and payouts (if applicable)"],
  },
  "cc-bill-pay": {
    overview: "CC Bill Pay enables credit card bill payments with tracked statuses and settlement reporting.",
    bullets: ["Card/biller selection and validation", "Success/pending/failed tracking", "Reconciliation-friendly references"],
  },
  payout: {
    overview: "Payouts automate fund transfers to beneficiaries using rails like IMPS/NEFT with auditable logs.",
    bullets: ["Bulk/single payouts with beneficiary management", "Status tracking and retries", "Role-based access and limits"],
  },
  matm: {
    overview: "mATM brings cash withdrawal and balance services to retail points through micro-ATM devices.",
    bullets: ["Device-led cash withdrawal", "Balance enquiry and mini statement (as supported)", "Operational reporting and reconciliation"],
  },
  pos: {
    overview: "POS services support card acceptance and settlement tracking for merchants and distribution networks.",
    bullets: ["Card present payments", "Settlement schedules and reporting", "Dispute/chargeback support workflows (as applicable)"],
  },
  insurance: {
    overview: "Insurance services support lead capture and policy workflows for distribution partners.",
    bullets: ["Product discovery and assisted purchase", "Document/KYC support", "Policy issuance and renewal tracking"],
  },
  loan: {
    overview: "Loan services help capture leads, collect documents, and track application progress and disbursal stages.",
    bullets: ["Lead capture and eligibility", "Document checklist and verification", "Application and disbursal tracking"],
  },
  "ppi-wallet": {
    overview: "PPI wallet services support controlled spends, wallet loading, and reporting for prepaid instruments.",
    bullets: ["Wallet load and usage tracking", "Limits and compliance hooks (as applicable)", "Statements and audit-friendly logs"],
  },
  "sound-box": {
    overview: "SoundBox devices announce payment confirmations, improving merchant confidence and reducing disputes.",
    bullets: ["Audio confirmation for incoming payments", "Device onboarding and mapping", "Health/status monitoring (as applicable)"],
  },
  "travel-booking": {
    overview: "Travel booking services unify booking flows and reporting for tickets across channels where supported.",
    bullets: ["Booking flow + customer details capture", "Cancellation/refund workflows", "Unified reporting and support references"],
  },
  "travel-package": {
    overview: "Travel packages cover curated itineraries with inquiry management and follow-up workflows.",
    bullets: ["Package discovery and inquiry capture", "Quotation and follow-ups", "Booking confirmations and documentation"],
  },
  pg: {
    overview: "Payment gateway enables online collections with status tracking and settlement reporting for merchants.",
    bullets: ["Checkout/collect flows (as integrated)", "Webhooks and reconciliation", "Settlement and refund tracking"],
  },
  "bank-account": {
    overview: "Bank account services typically assist account opening flows and related operational reporting.",
    bullets: ["Assisted onboarding/KYC (as applicable)", "Account status tracking", "Settlement or account-linked reporting"],
  },
};

const cache = new Map<string, { expiresAt: number; data: ServiceInfoResponse }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getFallback(serviceKey: string): Pick<ServiceInfoResponse, "overview" | "bullets"> {
  return (
    FALLBACK_BY_KEY[serviceKey] || {
      overview: "Explore how this service works, its key benefits, and common operational workflows.",
      bullets: ["Key capabilities and flow", "Typical requirements and checks", "Status tracking and reconciliation"],
    }
  );
}

router.get("/service-info/:serviceKey", async (req, res) => {
  const serviceKey = String(req.params.serviceKey || "").trim();
  if (!serviceKey) {
    return res.status(400).json({ error: "Missing serviceKey" });
  }

  const query = QUERY_BY_KEY[serviceKey] || serviceKey;

  const cached = cache.get(serviceKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  const fetchedAt = new Date().toISOString();

  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  try {
    if (apiKey && cx) {
      const url =
        "https://www.googleapis.com/customsearch/v1" +
        `?key=${encodeURIComponent(apiKey)}` +
        `&cx=${encodeURIComponent(cx)}` +
        `&q=${encodeURIComponent(query)}`;

      const resp = await fetch(url);
      const json = (await resp.json().catch(() => null)) as any;

      if (!resp.ok) {
        const errorMessage =
          (json && (json.error?.message || json.error?.errors?.[0]?.message)) ||
          `Google CSE request failed (${resp.status})`;
        throw new Error(errorMessage);
      }

      const items = Array.isArray(json?.items) ? json.items : [];
      const results: ServiceInfoResult[] = items.slice(0, 5).map((it: any) => ({
        title: String(it?.title || ""),
        link: String(it?.link || ""),
        snippet: String(it?.snippet || ""),
      }));

      const topSnippet = results.find((r) => r.snippet)?.snippet;
      const fallback = getFallback(serviceKey);

      const data: ServiceInfoResponse = {
        provider: "google_cse",
        serviceKey,
        query,
        fetchedAt,
        overview: topSnippet || fallback.overview,
        bullets: fallback.bullets,
        results,
      };

      cache.set(serviceKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
      return res.json(data);
    }

    const fallback = getFallback(serviceKey);
    const data: ServiceInfoResponse = {
      provider: "fallback",
      serviceKey,
      query,
      fetchedAt,
      overview: fallback.overview,
      bullets: fallback.bullets,
    };

    cache.set(serviceKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
    return res.json(data);
  } catch (e: any) {
    const fallback = getFallback(serviceKey);
    const data: ServiceInfoResponse = {
      provider: "error",
      serviceKey,
      query,
      fetchedAt,
      overview: fallback.overview,
      bullets: fallback.bullets,
      error: e?.message || "Failed to load service info",
    };

    cache.set(serviceKey, { expiresAt: Date.now() + 30 * 60 * 1000, data });
    return res.json(data);
  }
});

export default router;

