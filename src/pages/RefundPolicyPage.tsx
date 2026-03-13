import { Link } from "react-router-dom";
import ComingSoon from "@/components/ComingSoon";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

export default function RefundPolicyPage() {
  usePageTitle("AbheePay | Refund Policy");

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center">
            <img
              src="https://pos.abheepay.com/assets/FORMAT-PNG-Lj3U1uY2.png"
              alt="ABHEEPAY"
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/services">
              <Button variant="hero-outline" size="sm">Services</Button>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm">Login</Button>
            </Link>
          </div>
        </div>

        <ComingSoon
          title="Refund Policy"
          description="Share the policy text and I'll publish it here with proper formatting."
        />
      </div>
    </div>
  );
}
