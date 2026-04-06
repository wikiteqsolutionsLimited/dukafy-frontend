import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ShopProvider } from "@/hooks/useShop";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/shop-setup" element={<ShopSetupPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales-history" element={<SalesHistoryPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
                <Route path="/stock-adjustments" element={<StockAdjustmentsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profit-loss" element={<ProfitLossPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/billing" element={<BillingPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ShopProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
