import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ShopProvider } from "@/hooks/useShop";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AdminProtectedLayout } from "@/components/admin/AdminProtectedLayout";
import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";
import { RoleGuard } from "@/components/RoleGuard";
import IndexPage from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import ShopSetupPage from "./pages/ShopSetup";
import DashboardPage from "./pages/Dashboard";
import SalesPage from "./pages/Sales";
import InventoryPage from "./pages/Inventory";
import ExpensesPage from "./pages/Expenses";
import PurchaseOrdersPage from "./pages/PurchaseOrders";
import CreatePurchaseOrderPage from "./pages/CreatePurchaseOrder";
import StockAdjustmentsPage from "./pages/StockAdjustments";
import CustomersPage from "./pages/Customers";
import SuppliersPage from "./pages/Suppliers";
import ReportsPage from "./pages/Reports";
import ProfitLossPage from "./pages/ProfitLoss";
import SalesHistoryPage from "./pages/SalesHistory";
import CategoriesPage from "./pages/Categories";
import SettingsPage from "./pages/Settings";
import StaffPage from "./pages/Staff";
import ActivityLogsPage from "./pages/ActivityLogs";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";
import BillingPage from "./pages/Billing";
import ProfilePage from "./pages/Profile";
import SupportPage from "./pages/Support";
import TaxReportPage from "./pages/TaxReport";
import PaymentsPage from "./pages/Payments";
// Admin pages
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminShopsPage from "./pages/admin/AdminShops";
import AdminUsersPage from "./pages/admin/AdminUsers";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptions";
import AdminSupportPage from "./pages/admin/AdminSupport";
import AdminStaffPage from "./pages/admin/AdminStaff";
import AdminOnboardPage from "./pages/admin/AdminOnboard";
import AdminEmailPage from "./pages/admin/AdminEmail";
import AdminActivityPage from "./pages/admin/AdminActivity";
import AdminAnalyticsPage from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ShopProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route element={<ProtectedLayout />}>
                  {/* Open to all authenticated roles */}
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/sales-history" element={<SalesHistoryPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/shop-setup" element={<ShopSetupPage />} />

                  {/* Admin + Manager only */}
                  <Route path="/dashboard" element={<RoleGuard roles={["admin", "manager"]}><DashboardPage /></RoleGuard>} />
                  <Route path="/expenses" element={<RoleGuard roles={["admin", "manager"]}><ExpensesPage /></RoleGuard>} />
                  <Route path="/purchase-orders" element={<RoleGuard roles={["admin", "manager"]}><PurchaseOrdersPage /></RoleGuard>} />
                  <Route path="/purchase-orders/create" element={<RoleGuard roles={["admin", "manager"]}><CreatePurchaseOrderPage /></RoleGuard>} />
                  <Route path="/stock-adjustments" element={<RoleGuard roles={["admin", "manager"]}><StockAdjustmentsPage /></RoleGuard>} />
                  <Route path="/suppliers" element={<RoleGuard roles={["admin", "manager"]}><SuppliersPage /></RoleGuard>} />
                  <Route path="/categories" element={<RoleGuard roles={["admin", "manager"]}><CategoriesPage /></RoleGuard>} />
                  <Route path="/reports" element={<RoleGuard roles={["admin", "manager"]}><ReportsPage /></RoleGuard>} />
                  <Route path="/profit-loss" element={<RoleGuard roles={["admin", "manager"]}><ProfitLossPage /></RoleGuard>} />
                  <Route path="/tax-report" element={<RoleGuard roles={["admin", "manager"]}><TaxReportPage /></RoleGuard>} />
                  <Route path="/payments" element={<RoleGuard roles={["admin", "manager"]}><PaymentsPage /></RoleGuard>} />

                  {/* Admin only */}
                  <Route path="/staff" element={<RoleGuard roles={["admin"]}><StaffPage /></RoleGuard>} />
                  <Route path="/activity-logs" element={<RoleGuard roles={["admin"]}><ActivityLogsPage /></RoleGuard>} />
                  <Route path="/billing" element={<RoleGuard roles={["admin"]}><BillingPage /></RoleGuard>} />
                </Route>
                {/* Admin Portal */}
                <Route path="/dukafy-admin/login" element={<AdminLoginPage />} />
                <Route element={<AdminProtectedLayout />}>
                  <Route element={<AdminDashboardLayout />}>
                    <Route path="/dukafy-admin" element={<AdminDashboardPage />} />
                    <Route path="/dukafy-admin/analytics" element={<AdminAnalyticsPage />} />
                    <Route path="/dukafy-admin/shops" element={<AdminShopsPage />} />
                    <Route path="/dukafy-admin/users" element={<AdminUsersPage />} />
                    <Route path="/dukafy-admin/subscriptions" element={<AdminSubscriptionsPage />} />
                    <Route path="/dukafy-admin/support" element={<AdminSupportPage />} />
                    <Route path="/dukafy-admin/staff" element={<AdminStaffPage />} />
                    <Route path="/dukafy-admin/onboard" element={<AdminOnboardPage />} />
                    <Route path="/dukafy-admin/email" element={<AdminEmailPage />} />
                    <Route path="/dukafy-admin/activity" element={<AdminActivityPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </ShopProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
