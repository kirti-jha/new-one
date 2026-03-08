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
              <Route path="users" element={
                <ProtectedRoute minRole="master_distributor">
                  <DashboardUsers />
                </ProtectedRoute>
              } />
              <Route path="wallet" element={<DashboardWallet />} />
              <Route path="transactions" element={<ComingSoon title="Transactions" />} />
              <Route path="aeps" element={<ComingSoon title="AEPS" description="Aadhaar Enabled Payment System — biometric cash withdrawal and balance inquiry." />} />
              <Route path="dmt" element={<ComingSoon title="DMT" description="Domestic Money Transfer — instant bank-to-bank transfers 24/7." />} />
              <Route path="bbps" element={<ComingSoon title="BBPS" description="Bharat Bill Payment System — utility payments, recharges, and more." />} />
              <Route path="pan" element={<ComingSoon title="PAN Services" description="NSDL/UTI integration for PAN card applications and corrections." />} />
              <Route path="commissions" element={
                <ProtectedRoute minRole="distributor">
                  <ComingSoon title="Commission Management" description="Dynamic commission slabs per role and service." />
                </ProtectedRoute>
              } />
              <Route path="kyc" element={
                <ProtectedRoute minRole="distributor">
                  <ComingSoon title="KYC Management" description="Document verification with Aadhaar, PAN, and video KYC." />
                </ProtectedRoute>
              } />
              <Route path="security" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ComingSoon title="Security" description="Two-factor authentication, session management, and audit logs." />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ComingSoon title="Settings" description="Platform configuration, branding, and notification preferences." />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
