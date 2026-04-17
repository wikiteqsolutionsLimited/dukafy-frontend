import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell, Search, User, Package, ShoppingCart, Info, X, Store,
  ChevronDown, Check, MapPin, LayoutDashboard, Users, Truck,
  BarChart3, Receipt, ClipboardList, PackageMinus, Settings,
  LogOut, Menu, Tag, History, LineChart, Plus, UserPlus, Keyboard,
  Shield, FileText, CreditCard, HeadphonesIcon, Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { subscriptionsApi, notificationsApi } from "@/lib/api";
import { ProductModal, type ProductFormData } from "@/components/inventory/ProductModal";
import { CustomerModal, type CustomerFormData } from "@/components/customers/CustomerModal";
import { SearchModal } from "@/components/layout/SearchModal";

interface BackendNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  "low-stock": { icon: Package, color: "text-warning", bg: "bg-warning/10" },
  sale: { icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
  subscription: { icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
  support: { icon: HeadphonesIcon, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

const getTypeConfig = (type: string) => typeConfig[type] || typeConfig.system;

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

/* ── Navigation config (role-filtered below) ── */
type RoleSpec = "admin" | "manager" | "cashier";
interface NavItem { title: string; path: string; icon: any; roles: RoleSpec[] }

const fullMainNav: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { title: "POS", path: "/sales", icon: ShoppingCart, roles: ["admin", "manager", "cashier"] },
  { title: "Inventory", path: "/inventory", icon: Package, roles: ["admin", "manager", "cashier"] },
  { title: "Customers", path: "/customers", icon: Users, roles: ["admin", "manager", "cashier"] },
  { title: "Suppliers", path: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
  { title: "Reports", path: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
];

const fullMoreNav: NavItem[] = [
  { title: "Sales History", path: "/sales-history", icon: History, roles: ["admin", "manager", "cashier"] },
  { title: "Categories", path: "/categories", icon: Tag, roles: ["admin", "manager"] },
  { title: "Expenses", path: "/expenses", icon: Receipt, roles: ["admin", "manager"] },
  { title: "Purchase Orders", path: "/purchase-orders", icon: ClipboardList, roles: ["admin", "manager"] },
  { title: "Stock Adjustments", path: "/stock-adjustments", icon: PackageMinus, roles: ["admin", "manager"] },
  { title: "Profit & Loss", path: "/profit-loss", icon: LineChart, roles: ["admin", "manager"] },
  { title: "Tax Report", path: "/tax-report", icon: Calculator, roles: ["admin", "manager"] },
  { title: "Billing", path: "/billing", icon: CreditCard, roles: ["admin"] },
  { title: "Support", path: "/support", icon: HeadphonesIcon, roles: ["admin", "manager", "cashier"] },
  { title: "Settings", path: "/settings", icon: Settings, roles: ["admin", "manager", "cashier"] },
];

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout: authLogout, hasRole } = useAuth();
  const { shops, activeShop, switchShop } = useShop();
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

  const role = (user?.role || "cashier") as RoleSpec;
  const canRole = (item: NavItem) => item.roles.includes(role);
  const mainNav = fullMainNav.filter(canRole);
  const moreNav = fullMoreNav.filter(canRole);
  const adminNav = hasRole("admin") ? [
    { title: "Staff", path: "/staff", icon: Shield, roles: ["admin"] as RoleSpec[] },
    { title: "Activity Logs", path: "/activity-logs", icon: FileText, roles: ["admin"] as RoleSpec[] },
  ] : [];
  const dynamicMoreNav: NavItem[] = [...moreNav, ...adminNav];

  // Backend-driven notifications
  const { data: notifData } = useQuery({
    queryKey: ["notifications", activeShop?.id],
    queryFn: () => notificationsApi.getAll({ limit: 20 }),
    enabled: !!activeShop,
    refetchInterval: 60_000,
  });
  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread", activeShop?.id],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!activeShop,
    refetchInterval: 60_000,
  });
  const notifications: BackendNotification[] = notifData?.data || [];
  const unreadCount: number = unreadData?.data?.count || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
  const dismissMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

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

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "Escape") { setShortcutsOpen(false); return; }
      if (isInput && !e.ctrlKey && !e.metaKey) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "k" || e.key === "K") { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === "n" || e.key === "N") { e.preventDefault(); navigate("/sales"); }
      else if (e.key === "p" || e.key === "P") { e.preventDefault(); if (hasRole("admin", "manager")) setProductModalOpen(true); }
      else if (e.key === "/" || e.key === "?") { e.preventDefault(); setShortcutsOpen((o) => !o); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [navigate, hasRole]);

  const handleLogout = () => { authLogout(); navigate("/login"); };

  const handleAddShop = async () => {
    try {
      const res = await subscriptionsApi.getMy();
      const subscription = res.data;
      if (!subscription?.is_active) { navigate("/billing"); return; }
      if (subscription.max_shops !== -1 && shops.length >= subscription.max_shops) { navigate("/billing"); return; }
      navigate("/shop-setup?mode=create");
    } catch {
      navigate("/billing");
    }
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const isMoreActive = dynamicMoreNav.some((item) => isActive(item.path));

  return (
    <header className="sticky top-0 z-30">
      {/* ── Top bar ── */}
      <div
        className="flex h-14 items-center justify-between border-b px-3 sm:px-4 lg:px-6 backdrop-blur-sm"
        style={{
          backgroundColor: "hsl(var(--topbar-background) / 0.97)",
          borderColor: "hsl(var(--topbar-border))",
        }}
      >
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <NavLink to={hasRole("cashier") ? "/sales" : "/dashboard"} className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Store className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline">
              DukaFy
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

          {/* Quick Actions (desktop) - hide for cashier */}
          {hasRole("admin", "manager") && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => navigate("/sales")}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
              >
                <Plus className="h-3.5 w-3.5" /> New Sale
              </button>
              <button
                onClick={() => setProductModalOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.97]"
              >
                <Package className="h-3.5 w-3.5" /> Add Product
              </button>
              <button
                onClick={() => setCustomerModalOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.97]"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add Customer
              </button>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Shop switcher — only for admins with multiple shops */}
          {shops.filter((s) => s.member_role === "admin").length > 1 && (
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
                    {shops.filter((s) => s.member_role === "admin").map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => { switchShop(shop.id); setShopOpen(false); window.location.reload(); }}
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
          )}

          {/* Notifications — backend-driven */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-[340px] max-w-[340px] rounded-xl border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllReadMutation.mutate()} className="text-xs font-medium text-primary transition-colors hover:text-primary/80">Mark all read</button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                      <p className="text-[11px] text-muted-foreground/70 px-6">You'll see alerts about low stock, sales, subscription, and support here.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const cfg = getTypeConfig(n.type);
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => !n.read && markReadMutation.mutate(n.id)}
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
                              <button onClick={(e) => { e.stopPropagation(); dismissMutation.mutate(n.id); }} className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formatRelativeTime(n.created_at)}</p>
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
          <button
            onClick={() => navigate("/profile")}
            className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs max-w-[80px] truncate">{user?.name || "User"}</span>
          </button>

          {/* Quick Actions (mobile) - hide for cashier */}
          {hasRole("admin", "manager") && (
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
                    <ShoppingCart className="h-4 w-4" /> New Sale
                  </button>
                  <button
                    onClick={() => { setQuickActionsOpen(false); setProductModalOpen(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Package className="h-4 w-4" /> Add Product
                  </button>
                  <button
                    onClick={() => { setQuickActionsOpen(false); setCustomerModalOpen(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <UserPlus className="h-4 w-4" /> Add Customer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger (mobile/tablet) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Menu"
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

        {dynamicMoreNav.length > 0 && (
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
                  <LogOut className="h-4 w-4" /> <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
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
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted mb-1"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </button>
            <div className="my-1 h-px bg-border" />
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
              <LogOut className="h-4 w-4" /> <span>Log out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Modals */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      {hasRole("admin", "manager") && (
        <>
          <ProductModal
            open={productModalOpen}
            onClose={() => setProductModalOpen(false)}
            onSave={() => setProductModalOpen(false)}
          />
          <CustomerModal
            open={customerModalOpen}
            onClose={() => setCustomerModalOpen(false)}
            mode="add"
            onSave={() => setCustomerModalOpen(false)}
          />
        </>
      )}

      {/* Shortcuts help modal */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-150 p-4" onClick={() => setShortcutsOpen(false)}>
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
                ...(hasRole("admin", "manager") ? [{ keys: ["Ctrl", "P"], label: "Add Product" }] : []),
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
