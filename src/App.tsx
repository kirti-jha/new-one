import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardUsers from "./pages/DashboardUsers";
import DashboardWallet from "./pages/DashboardWallet";
import ComingSoon from "./components/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="users" element={<DashboardUsers />} />
            <Route path="wallet" element={<DashboardWallet />} />
            <Route path="transactions" element={<ComingSoon title="Transactions" />} />
            <Route path="aeps" element={<ComingSoon title="AEPS" description="Aadhaar Enabled Payment System — biometric cash withdrawal and balance inquiry." />} />
            <Route path="dmt" element={<ComingSoon title="DMT" description="Domestic Money Transfer — instant bank-to-bank transfers 24/7." />} />
            <Route path="bbps" element={<ComingSoon title="BBPS" description="Bharat Bill Payment System — utility payments, recharges, and more." />} />
            <Route path="pan" element={<ComingSoon title="PAN Services" description="NSDL/UTI integration for PAN card applications and corrections." />} />
            <Route path="commissions" element={<ComingSoon title="Commission Management" description="Dynamic commission slabs per role and service." />} />
            <Route path="kyc" element={<ComingSoon title="KYC Management" description="Document verification with Aadhaar, PAN, and video KYC." />} />
            <Route path="security" element={<ComingSoon title="Security" description="Two-factor authentication, session management, and audit logs." />} />
            <Route path="settings" element={<ComingSoon title="Settings" description="Platform configuration, branding, and notification preferences." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
