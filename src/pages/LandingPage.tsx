import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Send,
  Zap,
  Shield,
  Users,
  BarChart3,
  ArrowRight,
  Fingerprint,
  Receipt,
  Wallet,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const services = [
  {
    icon: Fingerprint,
    title: "AEPS",
    description: "Aadhaar-enabled cash withdrawal, balance inquiry & mini statements via biometric authentication.",
  },
  {
    icon: Send,
    title: "DMT",
    description: "Instant domestic money transfer to any bank account in India, available 24/7.",
  },
  {
    icon: Receipt,
    title: "BBPS",
    description: "Seamless utility payments — electricity, water, gas, mobile recharge & DTH.",
  },
  {
    icon: Wallet,
    title: "Payout & Settlement",
    description: "Automated IMPS/NEFT settlements with real-time processing for merchants.",
  },
  {
    icon: CreditCard,
    title: "PAN Services",
    description: "Integrated NSDL/UTI portal for new PAN applications and corrections.",
  },
  {
    icon: BarChart3,
    title: "Commission Engine",
    description: "Dynamic commission slabs configurable per role, per service for maximum profitability.",
  },
];

const features = [
  "Multi-level distribution hierarchy",
  "Real-time dual wallet system",
  "Automated KYC verification",
  "Role-based access control",
  "Live transaction monitoring",
  "Instant fund settlements",
];

const stats = [
  { value: "₹500Cr+", label: "Monthly Volume" },
  { value: "50K+", label: "Active Retailers" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Avg Settlement" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center">
            <img
              src="https://pos.abheepay.com/assets/FORMAT-PNG-Lj3U1uY2.png"
              alt="ABHEEPAY"
              className="h-10 w-auto"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="hero-outline" size="sm">Login</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8">
              <Zap className="w-3.5 h-3.5" />
              India's Next-Gen B2B FinTech Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 text-foreground">
              Power Your Business with{" "}
              <span className="text-gradient-primary">Instant Financial</span>{" "}
              Services
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              AEPS, DMT, BBPS, Payouts — everything your distribution network needs.
              Real-time settlements. Enterprise-grade security. Zero downtime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Start Earning Today
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#services">
                <Button variant="hero-outline" size="lg" className="text-base px-8">
                  Explore Services
                </Button>
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div id="stats" className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 rounded-xl bg-card/50 border border-border">
                <div className="text-2xl sm:text-3xl font-heading font-bold text-gradient-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Complete Suite of <span className="text-gradient-primary">Financial Services</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything your network needs to serve millions of customers across India.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6">
                Built for <span className="text-gradient-primary">Scale & Security</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Enterprise-grade infrastructure with multi-level access control, real-time monitoring, and automated compliance — designed for India's largest distribution networks.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="inline-block mt-8">
                <Button variant="hero" size="lg">
                  Access Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-card border border-border p-8 shadow-elevated">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <div className="font-heading font-semibold text-foreground">Security First</div>
                    <div className="text-sm text-muted-foreground">JWT + 2FA + RBAC</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {["KYC Engine with Aadhaar & PAN verification", "Role-based multi-tier hierarchy", "Encrypted wallets with audit trail", "Real-time fraud detection"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-secondary-foreground bg-secondary/50 rounded-lg px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-primary/20 bg-gradient-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-50" />
            <div className="relative z-10">
              <Users className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Ready to Scale Your Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of distributors and retailers already using Abheepay to power their financial services network.
              </p>
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="text-base px-10">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img
                src="https://pos.abheepay.com/assets/FORMAT-PNG-Lj3U1uY2.png"
                alt="ABHEEPAY"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Abheepay. All rights reserved. Built with ❤️ by the Abheepay Dev Team.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
