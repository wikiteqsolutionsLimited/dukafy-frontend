import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PackageMinus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { PrimaryButton, Badge, FilterSelect, DeleteButton, RowActions } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { StockAdjustmentModal } from "@/components/stock/StockAdjustmentModal";
import { stockAdjustmentsApi } from "@/lib/api";

interface StockAdjustment {
  id: number;
  product_id: number;
  product_name: string;
  previous_qty: number;
  new_qty: number;
  adjustment: number;
  reason: string;
  user_name?: string;
  created_at: string;
}

const REASON_VARIANTS: Record<string, "danger" | "warning" | "default"> = {
  Damaged: "danger",
  Lost: "warning",
  Correction: "default",
};

const PAGE_SIZE = 10;

const StockAdjustmentsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteAdj, setDeleteAdj] = useState<StockAdjustment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stock-adjustments", page, search, reasonFilter],
    queryFn: () => stockAdjustmentsApi.getAll({
      page, limit: PAGE_SIZE,
      search: search || undefined,
      reason: reasonFilter !== "All" ? reasonFilter : undefined,
    }),
  });

  const rows: StockAdjustment[] = data?.data || [];
  const pagination = data?.pagination;

  const createMutation = useMutation({
    mutationFn: (payload: { product_id: number; new_qty: number; reason: string }) =>
      stockAdjustmentsApi.create(payload),
    onSuccess: () => {
      toast.success("Stock adjustment recorded");
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-low-stock"] });
      setModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to record adjustment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => stockAdjustmentsApi.delete(id),
    onSuccess: () => {
      toast.success("Adjustment deleted");
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      setDeleteAdj(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });

  const columns: Column<StockAdjustment>[] = [
    { key: "product", header: "Product", render: (a) => <span className="font-medium text-card-foreground">{a.product_name || "—"}</span> },
    { key: "prev", header: "Previous", align: "center", render: (a) => <span className="text-muted-foreground">{a.previous_qty ?? "—"}</span> },
    {
      key: "new", header: "New Qty", align: "center",
      render: (a) => {
        const diff = a.adjustment;
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-card-foreground">{a.new_qty}</span>
            <span className={diff < 0 ? "text-xs text-destructive" : "text-xs text-success"}>({diff > 0 ? "+" : ""}{diff})</span>
          </div>
        );
      },
    },
    { key: "reason", header: "Reason", render: (a) => <Badge variant={REASON_VARIANTS[a.reason] || "default"}>{a.reason}</Badge> },
    { key: "user", header: "By", render: (a) => <span className="text-muted-foreground text-xs">{a.user_name || "—"}</span> },
    { key: "date", header: "Date", render: (a) => <span className="text-muted-foreground">{format(new Date(a.created_at), "MMM dd, yyyy HH:mm")}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (a) => (
        <RowActions>
          <DeleteButton onClick={() => setDeleteAdj(a)} />
        </RowActions>
      ),
    },
  ];

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Stock Adjustments" description={`${pagination?.total ?? 0} adjustments recorded`}>
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>Adjust Stock</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product name..." className="flex-1" />
        <FilterSelect value={reasonFilter} onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}>
          <option value="All">All Reasons</option>
          <option value="Damaged">Damaged</option>
          <option value="Lost">Lost</option>
          <option value="Correction">Correction</option>
        </FilterSelect>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : rows.length === 0 && !search && reasonFilter === "All" ? (
        <EmptyState icon={PackageMinus} title="No stock adjustments yet" description="Record your first stock adjustment to keep inventory accurate." actionLabel="Adjust Stock" onAction={() => setModalOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(a) => a.id}
          emptyMessage="No adjustments match your filters"
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: pagination?.total ?? 0,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      )}

      <StockAdjustmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          createMutation.mutate({
            product_id: parseInt(data.product_id, 10),
            new_qty: parseInt(data.newQuantity, 10),
            reason: data.reason,
          });
        }}
      />

      <ConfirmModal
        open={!!deleteAdj}
        onClose={() => setDeleteAdj(null)}
        onConfirm={() => deleteAdj && deleteMutation.mutate(deleteAdj.id)}
        title={`Delete adjustment for "${deleteAdj?.product_name}"?`}
        description="This stock adjustment record will be permanently removed. Note: this does NOT revert the stock change."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default StockAdjustmentsPage;
