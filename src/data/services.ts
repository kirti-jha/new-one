import type { LucideIcon } from "lucide-react";
import {
  Fingerprint,
  Send,
  Receipt,
  Smartphone,
  FileText,
  CreditCard,
  BadgeIndianRupee,
  HandCoins,
  MonitorSmartphone,
  QrCode,
  Heart,
  Landmark,
  Wallet,
  Volume2,
  Plane,
  Globe,
  Shield,
} from "lucide-react";

export type MarketingServiceKey =
  | "aeps"
  | "remittance"
  | "bbps"
  | "recharge"
  | "pan"
  | "credit-card"
  | "cc-bill-pay"
  | "payout"
  | "matm"
  | "pos"
  | "insurance"
  | "loan"
  | "ppi-wallet"
  | "sound-box"
  | "travel-booking"
  | "travel-package"
  | "pg"
  | "bank-account";

export type MarketingService = {
  key: MarketingServiceKey;
  title: string;
  description: string;
  icon: LucideIcon;
  dashboardPath: string;
};

export const MARKETING_SERVICES: MarketingService[] = [
  {
    key: "aeps",
    title: "AEPS",
    description: "Aadhaar-enabled cash withdrawal, balance inquiry and mini statements with biometric authentication.",
    icon: Fingerprint,
    dashboardPath: "/dashboard/aeps",
  },
  {
    key: "remittance",
    title: "Remittance",
    description: "Instant domestic money transfers to any bank account in India 24/7.",
    icon: Send,
    dashboardPath: "/dashboard/remittance",
  },
  {
    key: "bbps",
    title: "BBPS",
    description: "Utility bill payments with BBPS support, with real-time status and retries.",
    icon: Receipt,
    dashboardPath: "/dashboard/bbps",
  },
  {
    key: "recharge",
    title: "Recharge",
    description: "Mobile, DTH and data card recharges across major operators with fast confirmations.",
    icon: Smartphone,
    dashboardPath: "/dashboard/recharge",
  },
  {
    key: "pan",
    title: "PAN Card",
    description: "PAN application and correction flows with document tracking and support workflows.",
    icon: FileText,
    dashboardPath: "/dashboard/pan",
  },
  {
    key: "credit-card",
    title: "Credit Card",
    description: "Credit card lead capture and tracking for partners with streamlined onboarding.",
    icon: CreditCard,
    dashboardPath: "/dashboard/credit-card",
  },
  {
    key: "cc-bill-pay",
    title: "CC Bill Pay",
    description: "Pay credit card bills quickly with status monitoring and reconciled settlement logs.",
    icon: BadgeIndianRupee,
    dashboardPath: "/dashboard/cc-bill-pay",
  },
  {
    key: "payout",
    title: "Payout",
    description: "IMPS/NEFT payouts with beneficiary management and transaction status tracking.",
    icon: HandCoins,
    dashboardPath: "/dashboard/payout",
  },
  {
    key: "matm",
    title: "mATM",
    description: "Micro-ATM cash withdrawal and balance services via device integration workflows.",
    icon: MonitorSmartphone,
    dashboardPath: "/dashboard/matm",
  },
  {
    key: "pos",
    title: "POS",
    description: "Merchant POS enablement and settlement views for operations and support.",
    icon: QrCode,
    dashboardPath: "/dashboard/pos",
  },
  {
    key: "insurance",
    title: "Insurance",
    description: "Insurance lead and policy workflows designed for distribution networks.",
    icon: Heart,
    dashboardPath: "/dashboard/insurance",
  },
  {
    key: "loan",
    title: "Loan",
    description: "Loan lead capture and tracking for partners with conversion analytics.",
    icon: Landmark,
    dashboardPath: "/dashboard/loan",
  },
  {
    key: "ppi-wallet",
    title: "PPI Wallet",
    description: "PPI wallet features for controlled spends, settlements and reporting.",
    icon: Wallet,
    dashboardPath: "/dashboard/ppi-wallet",
  },
  {
    key: "sound-box",
    title: "SoundBox",
    description: "SoundBox device enablement for payment confirmations and merchant engagement.",
    icon: Volume2,
    dashboardPath: "/dashboard/sound-box",
  },
  {
    key: "travel-booking",
    title: "Travel",
    description: "Travel booking flows for distribution networks with unified reporting.",
    icon: Plane,
    dashboardPath: "/dashboard/travel-booking",
  },
  {
    key: "travel-package",
    title: "Travel Package",
    description: "Curated travel package management with inquiry capture and follow-ups.",
    icon: Globe,
    dashboardPath: "/dashboard/travel-package",
  },
  {
    key: "pg",
    title: "Payment Gateway",
    description: "Online payment collection and wallet funding flows with audit-friendly logs.",
    icon: Shield,
    dashboardPath: "/dashboard/pg",
  },
  {
    key: "bank-account",
    title: "Bank Account",
    description: "Bank account and settlement related dashboards for operational workflows.",
    icon: Landmark,
    dashboardPath: "/dashboard/bank-account",
  },
];

export function getMarketingService(key: string) {
  return MARKETING_SERVICES.find((s) => s.key === key) || null;
}

