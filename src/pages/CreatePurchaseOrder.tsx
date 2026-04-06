import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSelect } from "@/components/shared/FormFields";
import { CardSection } from "@/components/shared/CardSection";
import { PrimaryButton } from "@/components/shared/ActionButtons";

import { useQuery } from "@tanstack/react-query";
import { suppliersApi, productsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch suppliers and products from API
  const { data: suppliersData } = useQuery({ queryKey: ["po-suppliers"], queryFn: () => suppliersApi.getAll({ limit: 100 }) });
  const { data: productsData } = useQuery({ queryKey: ["po-products"], queryFn: () => productsApi.getAll({ limit: 200 }) });

  const supplierOptions = (suppliersData?.data || []).map((s: any) => ({ label: s.name, value: String(s.id) }));
  const productCatalog = (productsData?.data || []).map((p: any) => ({ id: p.id, name: p.name, price: Number(p.buy_price) }));

  const searchResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    return productCatalog.filter(
      (p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) && !items.some((i) => i.productId === p.id)
    );
  }, [productSearch, items]);

  const addProduct = (product: (typeof productCatalog)[0]) => {
    setItems((prev) => [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.price }]);
    setProductSearch("");
    setShowDropdown(false);
  };

  const updateItem = (idx: number, field: "quantity" | "price", value: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleSubmit = () => {
    if (!supplier) { toast.error("Please select a supplier"); return; }
    if (items.length === 0) { toast.error("Please add at least one product"); return; }
    toast.success("Purchase order created successfully!");
    navigate("/purchase-orders");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Create Purchase Order" description="Fill in the details to create a new order">
        <button
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </PageHeader>

      {/* Supplier Selection */}
      <CardSection title="Supplier">
        <div className="mt-3 max-w-sm">
          <FormSelect label="Select Supplier" value={supplier} onChange={setSupplier} options={supplierOptions} placeholder="Choose a supplier..." required />
        </div>
      </CardSection>

      {/* Product Search & Add */}
      <CardSection title="Products">
        <div className="relative mt-3 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search products to add..."
              className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md"
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card shadow-lg">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="font-medium text-card-foreground">{p.name}</span>
                   <span className="flex items-center gap-2 text-muted-foreground">
                     {formatCurrency(p.price)}
                     <Plus className="h-4 w-4 text-primary" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subtotal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.productId} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-card-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-8 w-20 rounded-lg border bg-background text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(idx, "price", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="h-8 w-24 rounded-lg border bg-background text-right text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-card-foreground">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeItem(idx)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No products added yet. Search above to add products.</p>
          </div>
        )}
      </CardSection>

      {/* Summary & Submit */}
      <CardSection>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{items.length} product{items.length !== 1 ? "s" : ""} in order</p>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              Total: {formatCurrency(total)}
            </p>
          </div>
          <PrimaryButton onClick={handleSubmit}>Submit Purchase Order</PrimaryButton>
        </div>
      </CardSection>
    </div>
  );
};

export default CreatePurchaseOrderPage;
