import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import BootstrapAdminPage from "./pages/BootstrapAdminPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardUsers from "./pages/DashboardUsers";
import DashboardWallet from "./pages/DashboardWallet";
import DashboardFundRequests from "./pages/DashboardFundRequests";
import DashboardTransactions from "./pages/DashboardTransactions";
import DashboardAEPS from "./pages/DashboardAEPS";
import DashboardDMT from "./pages/DashboardDMT";
import DashboardBBPS from "./pages/DashboardBBPS";
import DashboardPAN from "./pages/DashboardPAN";
import DashboardCommissions from "./pages/DashboardCommissions";
import DashboardKYC from "./pages/DashboardKYC";
import DashboardSecurity from "./pages/DashboardSecurity";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardRecharge from "./pages/DashboardRecharge";
import DashboardLoan from "./pages/DashboardLoan";
import DashboardCreditCard from "./pages/DashboardCreditCard";
import DashboardCCBillPay from "./pages/DashboardCCBillPay";
import DashboardPayout from "./pages/DashboardPayout";
import DashboardMATM from "./pages/DashboardMATM";
import DashboardBankAccount from "./pages/DashboardBankAccount";
import DashboardPPIWallet from "./pages/DashboardPPIWallet";
import DashboardTravelBooking from "./pages/DashboardTravelBooking";
import DashboardTravelPackage from "./pages/DashboardTravelPackage";
import DashboardInsurance from "./pages/DashboardInsurance";
import DashboardPG from "./pages/DashboardPG";
import DashboardPOS from "./pages/DashboardPOS";
import DashboardSoundBox from "./pages/DashboardSoundBox";
import DashboardReports from "./pages/DashboardReports";
import DashboardServiceManagement from "./pages/DashboardServiceManagement";
import DashboardStaffManagement from "./pages/DashboardStaffManagement";
import ComingSoon from "./components/ComingSoon";
import DashboardProfile from "./pages/DashboardProfile";
import DashboardTpin from "./pages/DashboardTpin";
import DashboardChangePassword from "./pages/DashboardChangePassword";
import DashboardCertificate from "./pages/DashboardCertificate";
import DashboardDeviceDriver from "./pages/DashboardDeviceDriver";
import DashboardCommissionPlan from "./pages/DashboardCommissionPlan";
import ImpersonatePage from "./pages/ImpersonatePage";
import DashboardSupport from "./pages/DashboardSupport";
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
            <Route path="/bootstrap" element={<BootstrapAdminPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/impersonate" element={<ImpersonatePage />} />
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
              <Route path="fund-requests" element={<DashboardFundRequests />} />
              <Route path="transactions" element={<DashboardTransactions />} />
              {/* Services */}
              <Route path="aeps" element={<DashboardAEPS />} />
              <Route path="bbps" element={<DashboardBBPS />} />
              <Route path="dmt" element={<DashboardDMT />} />
              <Route path="recharge" element={<DashboardRecharge />} />
              <Route path="loan" element={<DashboardLoan />} />
              <Route path="credit-card" element={<DashboardCreditCard />} />
              <Route path="cc-bill-pay" element={<DashboardCCBillPay />} />
              <Route path="payout" element={<DashboardPayout />} />
              <Route path="matm" element={<DashboardMATM />} />
              <Route path="bank-account" element={<DashboardBankAccount />} />
              <Route path="pan" element={<DashboardPAN />} />
              <Route path="ppi-wallet" element={<DashboardPPIWallet />} />
              <Route path="travel-booking" element={<DashboardTravelBooking />} />
              <Route path="travel-package" element={<DashboardTravelPackage />} />
              <Route path="insurance" element={<DashboardInsurance />} />
              <Route path="pg" element={<DashboardPG />} />
              <Route path="pos" element={<DashboardPOS />} />
              <Route path="sound-box" element={<DashboardSoundBox />} />
              {/* Management */}
              <Route path="commissions" element={<ProtectedRoute minRole="distributor"><DashboardCommissions /></ProtectedRoute>} />
              <Route path="kyc" element={<ProtectedRoute minRole="distributor"><DashboardKYC /></ProtectedRoute>} />
              <Route path="reports" element={<DashboardReports />} />
              <Route path="staff-management" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardStaffManagement /></ProtectedRoute>} />
              <Route path="service-management" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardServiceManagement /></ProtectedRoute>} />
              <Route path="security" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardSecurity /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardSettings /></ProtectedRoute>} />
              {/* User Settings (non-admin) */}
              <Route path="commission-plan" element={<DashboardCommissionPlan />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="tpin" element={<DashboardTpin />} />
              <Route path="change-password" element={<DashboardChangePassword />} />
              <Route path="certificate" element={<DashboardCertificate />} />
              <Route path="device-driver" element={<DashboardDeviceDriver />} />
              <Route path="support" element={<DashboardSupport />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
