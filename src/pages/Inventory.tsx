import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, PackageX, AlertTriangle, DollarSign } from "lucide-react";
import { ProductModal } from "@/components/inventory/ProductModal";
import { toast } from "sonner";
import { productsApi, categoriesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EditButton, DeleteButton, RowActions, PrimaryButton, Badge, FilterSelect } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { CardSection } from "@/components/shared/CardSection";

const stockFilters = ["All Stock", "In Stock", "Low Stock", "Out of Stock"];

interface Product {
  id: number;
  name: string;
  barcode: string;
  category_name: string;
  category_id: number;
  supplier_id: number;
  buy_price: number;
  sell_price: number;
  quantity: number;
  low_stock_threshold: number;
  image_url: string;
}

const PAGE_SIZE = 10;

const stockBadge = (qty: number, threshold: number = 10) => {
  if (qty === 0) return <Badge variant="danger">Out of stock</Badge>;
  if (qty <= threshold) return <Badge variant="warning">Low ({qty})</Badge>;
  return <Badge variant="success">{qty} in stock</Badge>;
};

const InventoryPage = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: () => productsApi.getAll({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ["products-low-stock"],
    queryFn: () => productsApi.getLowStock(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      toast.success(`"${deleteProduct?.name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteProduct(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const products: Product[] = data?.data || [];
  const pagination = data?.pagination;
  const categories = ["All", ...(categoriesData?.data || []).map((c: any) => c.name)];
  const lowStockCount = lowStockData?.data?.length || 0;

  // Client-side stock filter
  const filtered = products.filter((p) => {
    if (stockFilter === "In Stock") return p.quantity > (p.low_stock_threshold || 10);
    if (stockFilter === "Low Stock") return p.quantity > 0 && p.quantity <= (p.low_stock_threshold || 10);
    if (stockFilter === "Out of Stock") return p.quantity === 0;
    return true;
  });

  const totalProducts = pagination?.total || 0;
  const totalStockValue = products.reduce((sum, p) => sum + p.quantity * Number(p.buy_price), 0);
  const outOfStockItems = products.filter((p) => p.quantity === 0).length;

  const openAdd = () => { setEditProduct(null); setModalOpen(true); };

  const columns: Column<Product>[] = [
    { key: "name", header: "Product Name", render: (p) => <span className="font-medium text-card-foreground">{p.name}</span> },
    { key: "category_name", header: "Category", render: (p) => <Badge>{p.category_name || "—"}</Badge> },
    { key: "quantity", header: "Stock", render: (p) => stockBadge(p.quantity, p.low_stock_threshold) },
    { key: "buy_price", header: "Buying Price", render: (p) => <span className="text-muted-foreground">{formatCurrency(p.buy_price)}</span> },
    { key: "sell_price", header: "Selling Price", render: (p) => <span className="font-semibold text-card-foreground">{formatCurrency(p.sell_price)}</span> },
    {
      key: "stockValue", header: "Stock Value", align: "right",
      render: (p) => (
        <span className="font-semibold text-card-foreground">
          {formatCurrency(p.quantity * Number(p.buy_price))}
        </span>
      ),
    },
    {
      key: "actions", header: "Actions", align: "right",
      render: (p) => (
        <RowActions>
          {hasRole("admin", "manager") && <EditButton onClick={() => { setEditProduct(p); setModalOpen(true); }} />}
          {hasRole("admin") && <DeleteButton onClick={() => setDeleteProduct(p)} />}
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Inventory" description={`${totalProducts} products`}>
        {hasRole("admin", "manager") && <PrimaryButton icon={Plus} onClick={openAdd}>Add Product</PrimaryButton>}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSection className="flex flex-col items-center justify-center py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </CardSection>
        <CardSection className="flex flex-col items-center justify-center py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <DollarSign className="h-5 w-5 text-accent-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(totalStockValue)}
          </p>
          <p className="text-xs text-muted-foreground">Total Stock Value</p>
        </CardSection>
        <CardSection className="flex flex-col items-center justify-center py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground">Low Stock Items</p>
        </CardSection>
        <CardSection className="flex flex-col items-center justify-center py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <PackageX className="h-5 w-5 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">{outOfStockItems}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </CardSection>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." className="flex-1" />
        <FilterSelect value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}>
          {stockFilters.map((s) => <option key={s} value={s}>{s}</option>)}
        </FilterSelect>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : filtered.length === 0 && search === "" && stockFilter === "All Stock" ? (
        <EmptyState icon={Package} title="No products yet" description="Start by adding your first product to build your inventory." actionLabel="Add Product" onAction={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(p) => p.id}
          emptyMessage="No products match your filters"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editProduct ? "edit" : "add"}
        initialData={editProduct ? {
          name: editProduct.name, category: editProduct.category_name || "",
          quantity: String(editProduct.quantity), buyPrice: String(editProduct.buy_price),
          sellPrice: String(editProduct.sell_price), supplier: "",
        } : undefined}
        onSave={(formData) => {
          setModalOpen(false);
          if (editProduct) {
            productsApi.update(editProduct.id, {
              name: formData.name, barcode: editProduct.barcode,
              category_id: editProduct.category_id, supplier_id: editProduct.supplier_id,
              buy_price: parseFloat(formData.buyPrice), sell_price: parseFloat(formData.sellPrice),
              quantity: parseInt(formData.quantity), low_stock_threshold: editProduct.low_stock_threshold,
              image_url: editProduct.image_url,
            }).then(() => {
              toast.success(`"${formData.name}" updated`);
              queryClient.invalidateQueries({ queryKey: ["products"] });
            }).catch((err) => toast.error(err.message));
          } else {
            productsApi.create({
              name: formData.name, buy_price: parseFloat(formData.buyPrice),
              sell_price: parseFloat(formData.sellPrice), quantity: parseInt(formData.quantity),
            }).then(() => {
              toast.success(`"${formData.name}" added`);
              queryClient.invalidateQueries({ queryKey: ["products"] });
            }).catch((err) => toast.error(err.message));
          }
        }}
      />

      <ConfirmModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
        title={`Delete "${deleteProduct?.name}"?`}
        description="This product will be permanently removed from your inventory."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default InventoryPage;
