import { Link, Navigate, useParams } from "react-router-dom";
import { getMarketingService } from "@/data/services";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

function safeNextParam(path: string) {
  // Only allow internal routes.
  if (!path.startsWith("/")) return "/dashboard";
  if (path.startsWith("//")) return "/dashboard";
  return path;
}

export default function ServiceDetailPage() {
  const { serviceKey } = useParams();
  const svc = serviceKey ? getMarketingService(serviceKey) : null;

  if (!svc) {
    return <Navigate to="/services" replace />;
  }

  usePageTitle(`AbheePay | ${svc.title}`);

  const next = safeNextParam(svc.dashboardPath);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-4xl">
          <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground">
            &lt;- Back to Services
          </Link>

          <div className="mt-6 rounded-2xl border border-border bg-gradient-card p-8 shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <svc.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
                  {svc.title}
                </h1>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {svc.description}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to={`/login?next=${encodeURIComponent(next)}`}>
                    <Button variant="hero">Access Dashboard</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="hero-outline">Login</Button>
                  </Link>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Fast", desc: "Optimized flows designed for quick execution." },
                    { title: "Trackable", desc: "Status and reporting views for operations." },
                    { title: "Secure", desc: "Role-based access control and audit-friendly logs." },
                    { title: "Scalable", desc: "Built for distribution networks and high volume." },
                  ].map((b) => (
                    <div key={b.title} className="rounded-xl border border-border bg-secondary/20 p-4">
                      <div className="font-heading font-semibold text-foreground">{b.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="font-heading font-bold text-foreground">Want custom copy/design?</div>
            <div className="text-sm text-muted-foreground mt-1">
              Share your reference design and I'll match the layout, typography, and content style across all service pages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

