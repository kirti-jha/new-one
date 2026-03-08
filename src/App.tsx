import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardUsers from "./pages/DashboardUsers";
import DashboardWallet from "./pages/DashboardWallet";
import DashboardTransactions from "./pages/DashboardTransactions";
import DashboardAEPS from "./pages/DashboardAEPS";
import DashboardDMT from "./pages/DashboardDMT";
import DashboardBBPS from "./pages/DashboardBBPS";
import DashboardPAN from "./pages/DashboardPAN";
import DashboardCommissions from "./pages/DashboardCommissions";
import DashboardKYC from "./pages/DashboardKYC";
import DashboardSecurity from "./pages/DashboardSecurity";
import DashboardSettings from "./pages/DashboardSettings";
import ComingSoon from "./components/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<ProtectedRoute minRole="master_distributor"><DashboardUsers /></ProtectedRoute>} />
              <Route path="wallet" element={<DashboardWallet />} />
              <Route path="transactions" element={<DashboardTransactions />} />
              {/* Services */}
              <Route path="aeps" element={<DashboardAEPS />} />
              <Route path="bbps" element={<DashboardBBPS />} />
              <Route path="dmt" element={<DashboardDMT />} />
              <Route path="recharge" element={<ComingSoon title="Recharge" description="Mobile, DTH, and data card recharges for all major operators." />} />
              <Route path="loan" element={<ComingSoon title="Loan" description="Personal and business loan applications with instant processing." />} />
              <Route path="credit-card" element={<ComingSoon title="Credit Card" description="Credit card applications and lead generation services." />} />
              <Route path="cc-bill-pay" element={<ComingSoon title="CC Bill Pay" description="Credit card bill payment for all major banks." />} />
              <Route path="payout" element={<ComingSoon title="Payout" description="Instant payouts to bank accounts via IMPS/NEFT/RTGS." />} />
              <Route path="matm" element={<ComingSoon title="MATM" description="Micro ATM — card-based cash withdrawal at merchant locations." />} />
              <Route path="bank-account" element={<ComingSoon title="Bank Account" description="Instant bank account opening with partner banks." />} />
              <Route path="pan" element={<DashboardPAN />} />
              <Route path="ppi-wallet" element={<ComingSoon title="PPI Wallet" description="Prepaid Payment Instrument wallet services." />} />
              <Route path="travel-booking" element={<ComingSoon title="Travel Booking" description="Flight, bus, and hotel booking services." />} />
              <Route path="travel-package" element={<ComingSoon title="Travel Package" description="Curated travel packages and holiday deals." />} />
              <Route path="insurance" element={<ComingSoon title="Insurance" description="Life, health, and general insurance premium collection." />} />
              <Route path="pg" element={<ComingSoon title="Payment Gateway" description="Integrated payment gateway for online collections." />} />
              <Route path="pos" element={<ComingSoon title="POS Machine" description="Point of Sale machine deployment and management." />} />
              <Route path="sound-box" element={<ComingSoon title="Sound Box" description="Payment notification sound box for merchants." />} />
              {/* Management */}
              <Route path="commissions" element={<ProtectedRoute minRole="distributor"><DashboardCommissions /></ProtectedRoute>} />
              <Route path="kyc" element={<ProtectedRoute minRole="distributor"><DashboardKYC /></ProtectedRoute>} />
              <Route path="security" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardSecurity /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardSettings /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
