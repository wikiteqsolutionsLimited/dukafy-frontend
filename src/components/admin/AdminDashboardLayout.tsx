import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  LayoutDashboard, Store, Users, CreditCard, HeadphonesIcon,
  UserCog, Activity, Menu, X, LogOut, Mail, PlusCircle, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dukafy-admin", icon: LayoutDashboard, end: true },
  { label: "Analytics", path: "/dukafy-admin/analytics", icon: BarChart3 },
  { label: "Shops", path: "/dukafy-admin/shops", icon: Store },
  { label: "Users", path: "/dukafy-admin/users", icon: Users },
  { label: "Subscriptions", path: "/dukafy-admin/subscriptions", icon: CreditCard },
  { label: "Support", path: "/dukafy-admin/support", icon: HeadphonesIcon },
  { label: "Staff", path: "/dukafy-admin/staff", icon: UserCog },
  { label: "Onboard Shop", path: "/dukafy-admin/onboard", icon: PlusCircle },
  { label: "Send Email", path: "/dukafy-admin/email", icon: Mail },
  { label: "Activity Log", path: "/dukafy-admin/activity", icon: Activity },
];

export function AdminDashboardLayout() {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800">
          <Link to="/dukafy-admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">D</div>
            <span className="font-bold text-lg text-white">DukaFy Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-3.5rem-4rem)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(item.path, item.end)
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-4 px-4 border-b border-slate-800 bg-slate-900/50">
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <span className="text-sm text-slate-400">System Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
