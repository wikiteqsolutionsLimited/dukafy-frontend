import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Search, User, Package, ShoppingCart, Info, X, Store,
  ChevronDown, Check, MapPin, LayoutDashboard, Users, Truck,
  BarChart3, Receipt, ClipboardList, PackageMinus, Settings,
  LogOut, Menu, Tag, History, LineChart, Plus, UserPlus, Keyboard,
  Shield, FileText, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { subscriptionsApi } from "@/lib/api";
import { ProductModal, type ProductFormData } from "@/components/inventory/ProductModal";
import { CustomerModal, type CustomerFormData } from "@/components/customers/CustomerModal";
import { SearchModal } from "@/components/layout/SearchModal";

/* ── Notification types ── */
interface Notification {
  id: string;
  type: "low-stock" | "sale" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "low-stock", title: "Low Stock Alert", message: "Wireless Earbuds — only 3 left in stock", time: "2 min ago", read: false },
  { id: "2", type: "sale", title: "New Sale", message: "Order #ORD-4998 completed — $128.50", time: "8 min ago", read: false },
  { id: "3", type: "low-stock", title: "Out of Stock", message: "Yoga Mat is now out of stock", time: "15 min ago", read: false },
  { id: "4", type: "system", title: "System Update", message: "Inventory sync completed successfully", time: "1 hr ago", read: true },
  { id: "5", type: "sale", title: "New Sale", message: "Order #ORD-4997 completed — $45.00", time: "2 hrs ago", read: true },
  { id: "6", type: "system", title: "Backup Complete", message: "Daily backup finished at 3:00 AM", time: "5 hrs ago", read: true },
];

const typeConfig = {
  "low-stock": { icon: Package, color: "text-warning", bg: "bg-warning/10" },
  sale: { icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
  system: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

/* ── Navigation config ── */
const mainNav = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "POS", path: "/sales", icon: ShoppingCart },
  { title: "Inventory", path: "/inventory", icon: Package },
  { title: "Customers", path: "/customers", icon: Users },
  { title: "Suppliers", path: "/suppliers", icon: Truck },
  { title: "Reports", path: "/reports", icon: BarChart3 },
];

const moreNav = [
  { title: "Sales History", path: "/sales-history", icon: History },
  { title: "Categories", path: "/categories", icon: Tag },
  { title: "Expenses", path: "/expenses", icon: Receipt },
  { title: "Purchase Orders", path: "/purchase-orders", icon: ClipboardList },
  { title: "Stock Adjustments", path: "/stock-adjustments", icon: PackageMinus },
  { title: "Profit & Loss", path: "/profit-loss", icon: LineChart },
  { title: "Billing", path: "/billing", icon: CreditCard },
  { title: "Settings", path: "/settings", icon: Settings },
];

const allNav = [...mainNav, ...moreNav];

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout, hasRole } = useAuth();
  const { shops, activeShop, switchShop } = useShop();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  const [shopOpen, setShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;

      // ESC always works
      if (e.key === "Escape") {
        setShortcutsOpen(false);
        return;
      }

      // Don't fire shortcuts when typing in inputs (except Escape)
      if (isInput && !e.ctrlKey && !e.metaKey) return;

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        navigate("/sales");
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setProductModalOpen(true);
      } else if (e.key === "/" || e.key === "?") {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [navigate]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  const handleAddShop = async () => {
    try {
      const res = await subscriptionsApi.getMy();
      const subscription = res.data;
      if (!subscription?.is_active) {
        navigate("/billing");
        return;
      }

      if (subscription.max_shops !== -1 && shops.length >= subscription.max_shops) {
        navigate("/billing");
        return;
      }

      navigate("/shop-setup?mode=create");
    } catch {
      navigate("/billing");
    }
  };

  // Build nav based on role
  const adminNav = hasRole("admin") ? [
    { title: "Staff", path: "/staff", icon: Shield },
    { title: "Activity Logs", path: "/activity-logs", icon: FileText },
  ] : [];

  const dynamicMoreNav = [...moreNav, ...adminNav];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const isMoreActive = dynamicMoreNav.some((item) => isActive(item.path));

  return (
    <header className="sticky top-0 z-30">
      {/* ── Top bar ── */}
      <div
        className="flex h-14 items-center justify-between border-b px-4 lg:px-6 backdrop-blur-sm"
        style={{
          backgroundColor: "hsl(var(--topbar-background) / 0.97)",
          borderColor: "hsl(var(--topbar-border))",
        }}
      >
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Store className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline">
              DukaFlo
            </span>
          </NavLink>
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 w-full max-w-xs rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>

          {/* Quick Actions (desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => { navigate("/sales"); }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
            >
              <Plus className="h-3.5 w-3.5" />
              New Sale
            </button>
            <button
              onClick={() => setProductModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.97]"
            >
              <Package className="h-3.5 w-3.5" />
              Add Product
            </button>
            <button
              onClick={() => setCustomerModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.97]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Right: Shop switcher + Notifications + Profile + Hamburger */}
        <div className="flex items-center gap-1.5">
          {/* Shop switcher */}
          <div ref={shopRef} className="relative hidden sm:block">
            <button
              onClick={() => setShopOpen((o) => !o)}
              className="flex h-8 items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-muted"
            >
              <Store className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate">{activeShop?.name || "Select Shop"}</span>
              <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", shopOpen && "rotate-180")} />
            </button>
            {shopOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[250px] rounded-xl border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b px-3.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Switch shop</p>
                </div>
                <div className="py-1">
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => { switchShop(shop.id); setShopOpen(false); }}
                      className={cn(
                        "flex w-full items-start gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-muted",
                        activeShop && shop.id === activeShop.id && "bg-accent/50"
                      )}
                    >
                      <Store className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", activeShop && shop.id === activeShop.id ? "text-primary" : "text-muted-foreground")} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs truncate", activeShop && shop.id === activeShop.id ? "font-semibold text-card-foreground" : "font-medium text-muted-foreground")}>{shop.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />{shop.address || "No address"}
                        </p>
                      </div>
                      {activeShop && shop.id === activeShop.id && <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="border-t px-3.5 py-2">
                  <button
                    onClick={() => { setShopOpen(false); void handleAddShop(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Shop
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[340px] rounded-xl border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-primary transition-colors hover:text-primary/80">Mark all read</button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const cfg = typeConfig[n.type];
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            "group flex cursor-pointer gap-3 border-b px-4 py-2.5 transition-colors last:border-b-0 hover:bg-muted/50",
                            !n.read && "bg-accent/30"
                          )}
                        >
                          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
                            <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-xs leading-tight", !n.read ? "font-semibold text-card-foreground" : "font-medium text-muted-foreground")}>{n.title}</p>
                              <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{n.message}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">{n.time}</p>
                          </div>
                          {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mx-1 h-6 w-px bg-border hidden sm:block" />

          {/* Shortcuts help */}
          <button
            onClick={() => setShortcutsOpen(true)}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          {/* Profile */}
          <button className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs">{user?.name || "User"}</span>
          </button>

          {/* Quick Actions (mobile) */}
          <div ref={quickRef} className="relative md:hidden">
            <button
              onClick={() => setQuickActionsOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.95]"
            >
              <Plus className="h-4 w-4" />
            </button>
            {quickActionsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[180px] rounded-xl border bg-card py-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => { setQuickActionsOpen(false); navigate("/sales"); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                >
                  <ShoppingCart className="h-4 w-4" />
                  New Sale
                </button>
                <button
                  onClick={() => { setQuickActionsOpen(false); setProductModalOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Package className="h-4 w-4" />
                  Add Product
                </button>
                <button
                  onClick={() => { setQuickActionsOpen(false); setCustomerModalOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </button>
              </div>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Navigation bar (desktop) ── */}
      <nav
        className="hidden lg:flex items-center gap-1 border-b px-4 lg:px-6 h-11"
        style={{
          backgroundColor: "hsl(var(--topbar-background) / 0.97)",
          borderColor: "hsl(var(--topbar-border))",
        }}
      >
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {isActive(item.path) && (
              <span className="absolute bottom-[-9px] left-2 right-2 h-[2px] rounded-full bg-primary" />
            )}
          </NavLink>
        ))}

        {/* More dropdown */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <span>More</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", moreOpen && "rotate-180")} />
            {isMoreActive && (
              <span className="absolute bottom-[-9px] left-2 right-2 h-[2px] rounded-full bg-primary" />
            )}
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full mt-[9px] w-[220px] rounded-xl border bg-card py-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
              {dynamicMoreNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors duration-150",
                    isActive(item.path)
                      ? "bg-accent/50 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
              <div className="my-1.5 h-px bg-border mx-3" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          className="lg:hidden border-b animate-in slide-in-from-top-2 fade-in duration-200"
          style={{
            backgroundColor: "hsl(var(--topbar-background))",
            borderColor: "hsl(var(--topbar-border))",
          }}
        >
          <nav className="flex flex-col px-3 py-2 max-h-[70vh] overflow-y-auto">
            {[...mainNav, ...dynamicMoreNav].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  isActive(item.path)
                    ? "bg-accent/50 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
            <div className="my-2 h-px bg-border" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Modals */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={(data: ProductFormData) => { console.log("Product added:", data); setProductModalOpen(false); }}
      />
      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        mode="add"
        onSave={(data: CustomerFormData) => { console.log("Customer added:", data); setCustomerModalOpen(false); }}
      />

      {/* Shortcuts help modal */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-150" onClick={() => setShortcutsOpen(false)}>
          <div
            className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-semibold text-card-foreground">Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShortcutsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { keys: ["Ctrl", "K"], label: "Focus search" },
                { keys: ["Ctrl", "N"], label: "New Sale" },
                { keys: ["Ctrl", "P"], label: "Add Product" },
                { keys: ["Ctrl", "/"], label: "Toggle shortcuts" },
                { keys: ["Esc"], label: "Close modal / menu" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground/70 text-center">Press Esc to close</p>
          </div>
        </div>
      )}
    </header>
  );
}
