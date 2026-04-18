import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Search,
  Package,
  ScanBarcode,
  Zap,
  Clock,
  TrendingUp,
  Loader2,
  Users,
  UserPlus,
  Smartphone,
  Camera,
  Barcode,
} from "lucide-react";
import { toast } from "sonner";
import { ReceiptModal, ReceiptData } from "@/components/sales/ReceiptModal";
import { OrderConfirmation } from "@/components/sales/OrderConfirmation";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { productsApi, salesApi, customersApi, mpesaApi, heldSalesApi } from "@/lib/api";
import { Modal } from "@/components/shared/Modal";
import { FormInput } from "@/components/shared/FormFields";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: number;
  name: string;
  sell_price: number;
  barcode?: string;
  category_name?: string;
  quantity: number;
  image_url?: string;
  vat_rate?: number;
  is_vat_inclusive?: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  product_id: number;
  vat_rate: number;
  is_vat_inclusive: boolean;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

const SalesPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [confirmation, setConfirmation] = useState<ReceiptData | null>(null);
  const [barcode, setBarcode] = useState("");
  const [activeCartItem, setActiveCartItem] = useState<number | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Customer selection state
  const [customerMode, setCustomerMode] = useState<
    "guest" | "existing" | "new"
  >("guest");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa">("cash");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState("");
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);

  // Cash change calculation
  const [cashAmountPaid, setCashAmountPaid] = useState("");
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [pendingChangeData, setPendingChangeData] = useState<{
    amountPaid: number;
    change: number;
    total: number;
  } | null>(null);

  // Manual barcode scanner (camera)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  // Hold sale + mobile cart drawer
  const [showHeldDrawer, setShowHeldDrawer] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [holdNote, setHoldNote] = useState("");
  const [showHoldModal, setShowHoldModal] = useState(false);

  const { data: heldData, refetch: refetchHeld } = useQuery({
    queryKey: ["held-sales"],
    queryFn: async () => {
      const res = await heldSalesApi.getAll();
      return (res.data || []) as Array<{ id: number; reference: string; note?: string; total: number; items: any[]; created_at: string }>;
    },
  });
  const heldSales = heldData || [];

  const handleHoldSale = async () => {
    if (cart.length === 0) return;
    try {
      await heldSalesApi.create({
        note: holdNote || null,
        total,
        items: cart.map((c) => ({
          product_id: c.product_id,
          name: c.name,
          price: c.price,
          qty: c.qty,
          vat_rate: c.vat_rate,
          is_vat_inclusive: c.is_vat_inclusive,
        })),
      });
      toast.success("Sale held");
      setCart([]);
      setActiveCartItem(null);
      setHoldNote("");
      setShowHoldModal(false);
      refetchHeld();
    } catch (err: any) {
      toast.error(err.message || "Failed to hold sale");
    }
  };

  const handleResumeHeld = (h: any) => {
    const items = (h.items || []).map((it: any) => ({
      id: it.product_id || it.id,
      product_id: it.product_id,
      name: it.name,
      price: Number(it.price),
      qty: Number(it.qty),
      vat_rate: Number(it.vat_rate ?? 16),
      is_vat_inclusive: it.is_vat_inclusive !== false,
    }));
    setCart(items);
    setShowHeldDrawer(false);
    heldSalesApi.delete(h.id).then(() => refetchHeld()).catch(() => {});
    toast.success("Sale resumed");
  };

  // Fetch products from API
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["pos-products"],
    queryFn: async () => {
      const res = await productsApi.getAll({ limit: 200 });
      return res.data as Product[];
    },
  });

  // Fetch today's summary
  const { data: todayData } = useQuery({
    queryKey: ["today-summary"],
    queryFn: async () => {
      const res = await salesApi.todaySummary();
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Fetch customers for picker
  const { data: customersData } = useQuery({
    queryKey: ["pos-customers", customerSearch],
    queryFn: async () => {
      const res = await customersApi.getAll({
        search: customerSearch || undefined,
        limit: 10,
      });
      return res.data as Customer[];
    },
    enabled: customerMode === "existing",
  });

  // Create sale mutation
  const saleMutation = useMutation({
    mutationFn: (data: {
      items: any[];
      payment_method: string;
      customer_id?: number;
    }) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-summary"] });
      queryClient.invalidateQueries({ queryKey: ["pos-products"] });
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => customersApi.create(data),
  });

  const products = productsData || [];
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(products.map((p) => p.category_name || "Other").filter(Boolean)),
    );
    return ["All", ...cats];
  }, [products]);

  const dailySales = todayData?.total_sales
    ? parseFloat(todayData.total_sales)
    : 0;
  const dailyTransactions = todayData?.transaction_count
    ? parseInt(todayData.transaction_count)
    : 0;
  const topProduct = todayData?.top_product || "N/A";

  // Auto-focus barcode input
  useEffect(() => {
    barcodeRef.current?.focus();
    const refocus = () => {
      const tag = document.activeElement?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT")
        barcodeRef.current?.focus();
    };
    document.addEventListener("click", refocus);
    return () => document.removeEventListener("click", refocus);
  }, []);

  const handleBarcodeScan = useCallback(async (code: string) => {
    try {
      const res = await productsApi.getByBarcode(code.trim());
      if (res.success && res.data) {
        const product = res.data as Product;
        setCart((prev) => {
          const existing = prev.find((c) => c.id === product.id);
          if (existing)
            return prev.map((c) =>
              c.id === product.id ? { ...c, qty: c.qty + 1 } : c,
            );
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.sell_price,
              qty: 1,
              product_id: product.id,
              vat_rate: product.vat_rate ?? 16,
              is_vat_inclusive: product.is_vat_inclusive !== false,
            },
          ];
        });
        setActiveCartItem(product.id);
        toast.success(`${product.name} added`, { duration: 1500 });
      }
    } catch {
      toast.error(`No product found for barcode: ${code.trim()}`, {
        duration: 2000,
      });
    }
    setBarcode("");
    barcodeRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const cat = p.category_name || "Other";
      if (catFilter !== "All" && cat !== catFilter) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !cat.toLowerCase().includes(q) &&
        !(p.barcode && p.barcode.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [search, catFilter, products]);

  const cartIds = useMemo(() => new Set(cart.map((c) => c.id)), [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing)
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.sell_price,
          qty: 1,
          product_id: product.id,
          vat_rate: product.vat_rate ?? 16,
          is_vat_inclusive: product.is_vat_inclusive !== false,
        },
      ];
    });
    setActiveCartItem(product.id);
    toast.success(`${product.name} added`, { duration: 1200 });
  }, []);

  const updateQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
  }, []);

  const removeItem = useCallback(
    (id: number) => {
      setCart((prev) => prev.filter((c) => c.id !== id));
      if (activeCartItem === id) setActiveCartItem(null);
      toast("Item removed from cart", { duration: 1200 });
    },
    [activeCartItem],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (
        e.key === "Enter" &&
        document.activeElement === searchRef.current &&
        filtered.length > 0
      ) {
        e.preventDefault();
        addToCart(filtered[0]);
        return;
      }
      if (isInput) return;
      if ((e.key === "+" || e.key === "=") && activeCartItem) {
        e.preventDefault();
        updateQty(activeCartItem, 1);
      }
      if (e.key === "-" && activeCartItem) {
        e.preventDefault();
        updateQty(activeCartItem, -1);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && activeCartItem) {
        e.preventDefault();
        removeItem(activeCartItem);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filtered, activeCartItem, addToCart, updateQty, removeItem]);

  // Per-product VAT calculation
  const { subtotal, tax, total } = useMemo(() => {
    let sub = 0, vat = 0;
    for (const c of cart) {
      const rate = c.vat_rate ?? 16;
      if (c.is_vat_inclusive) {
        const excl = c.price / (1 + rate / 100);
        sub += excl * c.qty;
        vat += (c.price - excl) * c.qty;
      } else {
        sub += c.price * c.qty;
        vat += c.price * (rate / 100) * c.qty;
      }
    }
    return { subtotal: Math.round(sub * 100) / 100, tax: Math.round(vat * 100) / 100, total: Math.round((sub + vat) * 100) / 100 };
  }, [cart]);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // If mpesa, initiate STK push
    if (paymentMethod === "mpesa") {
      if (!mpesaPhone.trim()) {
        toast.error("Enter M-Pesa phone number");
        return;
      }
      setMpesaLoading(true);
      setShowMpesaDialog(true);
      try {
        const stkRes = await mpesaApi.stkPush({
          phone: mpesaPhone,
          amount: total,
          accountReference: `SALE-${Date.now()}`,
        });
        if (stkRes.success) {
          setMpesaCheckoutId(stkRes.data.checkoutRequestID);
          toast.success("STK push sent! Check your phone.", { duration: 5000 });
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              const queryRes = await mpesaApi.stkQuery(
                stkRes.data.checkoutRequestID,
              );
              if (
                queryRes.data?.ResultCode === "0" ||
                queryRes.data?.ResultCode === 0
              ) {
                clearInterval(pollInterval);
                await completeSale("mpesa");
              } else if (attempts >= 15) {
                clearInterval(pollInterval);
                setMpesaLoading(false);
                toast.error(
                  "Payment confirmation timed out. Check M-Pesa and try again.",
                );
              }
            } catch {
              if (attempts >= 15) {
                clearInterval(pollInterval);
                setMpesaLoading(false);
              }
            }
          }, 3000);
        }
      } catch (err: any) {
        setMpesaLoading(false);
        setShowMpesaDialog(false);
        toast.error(err.message || "M-Pesa STK push failed");
      }
      return;
    }

    // Cash payment — show change calculator
    setShowChangeModal(true);
  };

  const handleCashPaymentConfirm = async () => {
    const amountPaid = parseFloat(cashAmountPaid);
    if (isNaN(amountPaid) || amountPaid < total) {
      toast.error(`Amount must be at least ${formatCurrency(total)}`);
      return;
    }
    const change = amountPaid - total;
    setPendingChangeData({ amountPaid, change, total });
    setShowChangeModal(false);
    await completeSale("cash", amountPaid, change);
  };

  const completeSale = async (method: string, amountPaid?: number, change?: number) => {
    try {
      let customerId: number | undefined;

      if (customerMode === "new" && newCustomerForm.name.trim()) {
        try {
          const custRes =
            await createCustomerMutation.mutateAsync(newCustomerForm);
          customerId = custRes.data?.id;
          queryClient.invalidateQueries({ queryKey: ["customers"] });
        } catch {
          /* proceed without customer */
        }
      } else if (customerMode === "existing" && selectedCustomer) {
        customerId = selectedCustomer.id;
      }

      await saleMutation.mutateAsync({
        items: cart.map((c) => ({
          product_id: c.product_id,
          product_name: c.name,
          quantity: c.qty,
          unit_price: c.price,
        })),
        payment_method: method,
        customer_id: customerId,
      });

      const orderData: ReceiptData = {
        items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
        subtotal,
        tax,
        total,
        paymentMethod: method === "mpesa" ? "M-Pesa" : "Cash",
        date: new Date(),
        servedBy: user?.name || "Staff",
        amountPaid: amountPaid,
        change: change,
      };
      setConfirmation(orderData);
      setShowMpesaDialog(false);
      setMpesaLoading(false);
      toast.success(
        `Sale completed — ${formatCurrency(total)} (${itemCount} items)`,
        { duration: 3000 },
      );
      setCart([]);
      setActiveCartItem(null);
      setSelectedCustomer(null);
      setCustomerMode("guest");
      setNewCustomerForm({ name: "", phone: "", email: "" });
      setCashAmountPaid("");
      setPendingChangeData(null);
    } catch (err: any) {
      setMpesaLoading(false);
      setShowMpesaDialog(false);
      toast.error(err.message || "Failed to complete sale");
    }
  };

  const handlePrintFromConfirmation = () => {
    if (confirmation) {
      setReceipt(confirmation);
      setConfirmation(null);
    }
  };

  const handleManualBarcodeScan = () => {
    if (manualBarcode.trim()) {
      handleBarcodeScan(manualBarcode.trim());
      setManualBarcode("");
      setShowBarcodeScanner(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Sales (POS)"
        description="Select products and process sales"
      />

      {/* Daily Summary */}
      <div className="grid gap-3 grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
            <Zap className="h-4.5 w-4.5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Today's Sales</p>
            <p className="text-lg font-bold text-card-foreground">
              {formatCurrency(dailySales)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-lg font-bold text-card-foreground">
              {dailyTransactions}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
            <TrendingUp className="h-4.5 w-4.5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Top Product</p>
            <p className="text-sm font-bold text-card-foreground truncate">
              {topProduct}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Products panel */}
        <div className="space-y-4 lg:col-span-3">
          <input
            ref={barcodeRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && barcode.trim())
                handleBarcodeScan(barcode);
            }}
            className="sr-only"
            aria-label="Barcode scanner input"
            tabIndex={-1}
          />

          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 px-4 py-2.5">
            <ScanBarcode className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Barcode scanner active — scan anytime
            </span>
            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Camera className="h-3.5 w-3.5" /> Manual Scan
            </button>
            {barcode && (
              <span className="font-mono text-xs text-primary">
                {barcode}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or barcode — press Enter to add first result..."
              className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm text-card-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150",
                  catFilter === c
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Loading products...
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => {
                const inCart = cart.find((c) => c.id === p.id);
                const isSelected = cartIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.quantity <= 0}
                    className={cn(
                      "group relative flex flex-col items-center rounded-xl border p-4 text-center shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]",
                      p.quantity <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "border-primary bg-accent ring-2 ring-primary/20"
                          : "bg-card hover:border-primary/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-all duration-200 group-hover:scale-110",
                        isSelected ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-card-foreground leading-tight line-clamp-2">
                      {p.name}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      {p.category_name || "Other"}
                    </span>
                    <span className="mt-2 text-base font-bold text-card-foreground">
                      {formatCurrency(p.sell_price)}
                    </span>
                    <span className={cn(
                      "mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      p.quantity > 10 ? "bg-success/10 text-success" : p.quantity > 0 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive",
                    )}>
                      {p.quantity <= 0 ? "Out of Stock" : `Stock: ${p.quantity}`}
                    </span>
                    {inCart && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm ring-2 ring-card animate-scale-in">
                        {inCart.qty}
                      </span>
                    )}
                    {p.quantity > 0 && (
                      <div
                        className={cn(
                          "absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl py-1 text-[10px] font-semibold transition-opacity",
                          isSelected
                            ? "bg-primary/10 text-primary opacity-100"
                            : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100",
                        )}
                      >
                        + Add to cart
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No products found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search or category
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 border-b px-5 py-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-card-foreground">
                Cart
              </h2>
              <span className="ml-auto rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Customer Selection */}
            <div className="border-b px-5 py-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Customer
                </span>
              </div>
              <div className="flex gap-1.5">
                {(["guest", "existing", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setCustomerMode(mode);
                      setSelectedCustomer(null);
                    }}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all",
                      customerMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {mode === "guest"
                      ? "Guest"
                      : mode === "existing"
                        ? "Existing"
                        : "New"}
                  </button>
                ))}
              </div>
              {customerMode === "existing" && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="h-8 w-full rounded-md border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  {(customersData || []).length > 0 && (
                    <div className="max-h-[120px] overflow-y-auto rounded-md border bg-background">
                      {(customersData || []).map((c: Customer) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearch("");
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted",
                            selectedCustomer?.id === c.id && "bg-accent",
                          )}
                        >
                          <span className="font-medium text-card-foreground">
                            {c.name}
                          </span>
                          <span className="text-muted-foreground">
                            {c.phone}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCustomer && (
                    <div className="flex items-center gap-2 rounded-md bg-accent/50 px-2.5 py-1.5 text-xs">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="font-medium text-card-foreground">
                        {selectedCustomer.name}
                      </span>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
              {customerMode === "new" && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) =>
                      setNewCustomerForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Customer name *"
                    className="h-8 w-full rounded-md border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <input
                    type="tel"
                    value={newCustomerForm.phone}
                    onChange={(e) =>
                      setNewCustomerForm((f) => ({
                        ...f,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Phone number *"
                    className="h-8 w-full rounded-md border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) =>
                      setNewCustomerForm((f) => ({
                        ...f,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email (optional)"
                    className="h-8 w-full rounded-md border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>

            <div className="max-h-[35vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      No items in cart
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Click products or scan barcodes to add
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => setActiveCartItem(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-150",
                        activeCartItem === item.id
                          ? "bg-accent/60 border-l-2 border-l-primary"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQty(item.id, -1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted active:scale-90"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-card-foreground">
                          {item.qty}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQty(item.id, 1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted active:scale-90"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="w-20 text-right text-sm font-semibold text-card-foreground">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {activeCartItem && cart.length > 0 && (
              <div className="flex items-center justify-center gap-3 border-t border-dashed px-4 py-2 text-[10px] text-muted-foreground/60">
                <span>
                  <kbd className="rounded border bg-muted px-1 font-mono">
                    +
                  </kbd>{" "}
                  /{" "}
                  <kbd className="rounded border bg-muted px-1 font-mono">
                    -
                  </kbd>{" "}
                  qty
                </span>
                <span>
                  <kbd className="rounded border bg-muted px-1 font-mono">
                    Del
                  </kbd>{" "}
                  remove
                </span>
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal (excl. VAT)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-primary">
                  <span>Total VAT</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-card-foreground border-t pt-3">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Payment Method
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                        paymentMethod === "cash"
                          ? "bg-primary text-primary-foreground"
                          : "border bg-muted text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("mpesa")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                        paymentMethod === "mpesa"
                          ? "bg-[hsl(142,60%,40%)] text-white"
                          : "border bg-muted text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <Smartphone className="h-3.5 w-3.5" /> M-Pesa
                    </button>
                  </div>
                  {paymentMethod === "mpesa" && (
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="Phone number (07XXXXXXXX)"
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(142,60%,40%)]/30"
                    />
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={saleMutation.isPending || mpesaLoading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {saleMutation.isPending || mpesaLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "mpesa" ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}{" "}
                      Checkout — {formatCurrency(total)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cash Change Modal */}
      <Modal
        open={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        title="Cash Payment"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowChangeModal(false)}
              className="h-10 flex-1 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleCashPaymentConfirm}
              className="h-10 flex-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Confirm Payment
            </button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Amount Due</p>
            <p className="text-3xl font-black text-card-foreground mt-1">{formatCurrency(total)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Amount Received (KES)</label>
            <input
              type="number"
              value={cashAmountPaid}
              onChange={(e) => setCashAmountPaid(e.target.value)}
              placeholder="Enter amount paid by customer"
              autoFocus
              min={0}
              step="any"
              className="h-12 w-full rounded-xl border bg-background px-4 text-lg font-bold text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCashPaymentConfirm();
              }}
            />
          </div>
          {cashAmountPaid && parseFloat(cashAmountPaid) >= total && (
            <div className="rounded-xl bg-success/10 p-4 text-center animate-fade-in">
              <p className="text-xs text-success font-medium">Change to Return</p>
              <p className="text-3xl font-black text-success mt-1">
                {formatCurrency(parseFloat(cashAmountPaid) - total)}
              </p>
            </div>
          )}
          {cashAmountPaid && parseFloat(cashAmountPaid) < total && (
            <div className="rounded-xl bg-destructive/10 p-4 text-center animate-fade-in">
              <p className="text-xs text-destructive font-medium">Insufficient Amount</p>
              <p className="text-sm text-destructive mt-1">
                Short by {formatCurrency(total - parseFloat(cashAmountPaid))}
              </p>
            </div>
          )}
          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 200, 500, 1000, 2000, 5000, 10000].filter(v => v >= total * 0.5).slice(0, 4).map((amt) => (
              <button
                key={amt}
                onClick={() => setCashAmountPaid(String(amt))}
                className="rounded-lg border bg-muted/50 py-2 text-xs font-semibold text-card-foreground transition-colors hover:bg-accent"
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Manual Barcode Scanner Modal */}
      <Modal
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        title="Manual Barcode Entry"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowBarcodeScanner(false)}
              className="h-10 flex-1 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleManualBarcodeScan}
              className="h-10 flex-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Search
            </button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Barcode className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Enter the barcode number manually or use your phone's camera to scan
            </p>
          </div>
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode number..."
            autoFocus
            className="h-12 w-full rounded-xl border bg-background px-4 text-lg font-mono text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualBarcodeScan();
            }}
          />
        </div>
      </Modal>

      {/* M-Pesa STK Dialog */}
      <Modal
        open={showMpesaDialog}
        onClose={() => {}}
        title="M-Pesa Payment"
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(142,60%,40%)]/10">
            <Smartphone className="h-8 w-8 text-[hsl(142,60%,40%)]" />
          </div>
          <h3 className="text-lg font-bold text-card-foreground">
            Confirming Payment
          </h3>
          <p className="text-sm text-muted-foreground">
            A payment request of <strong>{formatCurrency(total)}</strong> has
            been sent to <strong>{mpesaPhone}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[hsl(142,60%,40%)]" />
            <span className="text-sm text-muted-foreground">
              Waiting for confirmation...
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your M-Pesa PIN on your phone to complete the payment
          </p>
        </div>
      </Modal>

      {confirmation && (
        <OrderConfirmation
          open={!!confirmation}
          items={confirmation.items}
          subtotal={confirmation.subtotal}
          tax={confirmation.tax}
          total={confirmation.total}
          paymentMethod={confirmation.paymentMethod}
          servedBy={confirmation.servedBy}
          amountPaid={confirmation.amountPaid}
          change={confirmation.change}
          onPrintReceipt={handlePrintFromConfirmation}
          onNewSale={() => setConfirmation(null)}
        />
      )}
      {receipt && (
        <ReceiptModal
          open={!!receipt}
          onClose={() => setReceipt(null)}
          data={receipt}
        />
      )}
    </div>
  );
};

export default SalesPage;
