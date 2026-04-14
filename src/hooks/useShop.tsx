import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { shopsApi } from "@/lib/api";

interface Shop {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  tax_rate: number;
  receipt_footer: string;
  logo_url: string | null;
  is_setup_complete: boolean;
  owner_id: number;
  member_role?: string;
}

interface ShopContextType {
  shops: Shop[];
  activeShop: Shop | null;
  isLoading: boolean;
  isSetupComplete: boolean;
  isOwner: boolean;
  canSwitchShops: boolean;
  switchShop: (shopId: number) => void;
  refresh: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await shopsApi.getMyShops();
      const shopList = res.data || [];
      setShops(shopList);
      
      // Restore active shop from localStorage or pick first
      const savedId = localStorage.getItem("active_shop_id");
      const saved = savedId ? shopList.find((s: Shop) => s.id === parseInt(savedId)) : null;
      setActiveShop(saved || shopList[0] || null);
    } catch {
      setShops([]);
      setActiveShop(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("shop_token");
    if (token) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [refresh]);

  const switchShop = useCallback((shopId: number) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      setActiveShop(shop);
      localStorage.setItem("active_shop_id", String(shopId));
    }
  }, [shops]);

  const isSetupComplete = !!activeShop?.is_setup_complete;
  const isOwner = !!activeShop && activeShop.member_role === "admin";
  const canSwitchShops = shops.filter(s => s.member_role === "admin").length > 1;

  return (
    <ShopContext.Provider value={{ shops, activeShop, isLoading, isSetupComplete, isOwner, canSwitchShops, switchShop, refresh }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
