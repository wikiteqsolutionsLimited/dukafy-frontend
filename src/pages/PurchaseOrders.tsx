import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardList, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { PrimaryButton, Badge, FilterSelect, DeleteButton, RowActions } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { ReceivePOModal } from "@/components/purchase-orders/ReceivePOModal";
import { purchaseOrdersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface PurchaseOrder {
  id: number;
  reference: string;
  supplier_name: string;
  total_amount: number;
  status: "pending" | "completed" | "cancelled";
  item_count: number;
  total_qty_ordered?: number;
  total_qty_received?: number;
  created_at: string;
}

const PAGE_SIZE = 10;

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteOrder, setDeleteOrder] = useState<PurchaseOrder | null>(null);
  const [receiveOrder, setReceiveOrder] = useState<PurchaseOrder | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders", page, search, statusFilter],
    queryFn: () => purchaseOrdersApi.getAll({
      page, limit: PAGE_SIZE,
      search: search || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    }),
  });

  const rows: PurchaseOrder[] = data?.data || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      toast.success("Purchase order deleted");
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setDeleteOrder(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });

  // Items column with received progress

  const columns: Column<PurchaseOrder>[] = [
    { key: "ref", header: "Reference", render: (o) => <span className="font-semibold text-primary">{o.reference}</span> },
    { key: "supplier", header: "Supplier", render: (o) => <span className="font-medium text-card-foreground">{o.supplier_name || "—"}</span> },
    {
      key: "items", header: "Items",
      render: (o) => (
        <div className="flex flex-col">
          <span className="text-card-foreground">{o.item_count} product{o.item_count !== 1 ? "s" : ""}</span>
          {(o.total_qty_ordered ?? 0) > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {o.total_qty_received ?? 0} / {o.total_qty_ordered} received
            </span>
          )}
        </div>
      ),
    },
    {
      key: "total", header: "Total", align: "right",
      render: (o) => <span className="font-semibold text-card-foreground">{formatCurrency(Number(o.total_amount))}</span>,
    },
    {
      key: "status", header: "Status",
      render: (o) => (
        <Badge variant={o.status === "completed" ? "success" : o.status === "cancelled" ? "danger" : "warning"}>
          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
        </Badge>
      ),
    },
    { key: "date", header: "Date", render: (o) => <span className="text-muted-foreground">{format(new Date(o.created_at), "MMM dd, yyyy")}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (o) => (
        <RowActions>
          {o.status === "pending" && (
            <button
              onClick={() => setReceiveOrder(o)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-success transition-colors hover:bg-success/10"
              title="Receive stock"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <DeleteButton onClick={() => setDeleteOrder(o)} />
        </RowActions>
      ),
    },
  ];

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Purchase Orders" description={`${pagination?.total ?? 0} orders found`}>
        <PrimaryButton icon={Plus} onClick={() => navigate("/purchase-orders/create")}>Create Purchase Order</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by reference or supplier..." className="flex-1" />
        <FilterSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : rows.length === 0 && !search && statusFilter === "All" ? (
        <EmptyState icon={ClipboardList} title="No purchase orders yet" description="Create your first purchase order to start managing supplier orders." actionLabel="Create Purchase Order" onAction={() => navigate("/purchase-orders/create")} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(o) => o.id}
          emptyMessage="No orders match your filters"
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: pagination?.total ?? 0,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => deleteOrder && deleteMutation.mutate(deleteOrder.id)}
        title={`Delete ${deleteOrder?.reference}?`}
        description={`This purchase order from "${deleteOrder?.supplier_name}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <ReceivePOModal
        open={!!receiveOrder}
        orderId={receiveOrder?.id ?? null}
        reference={receiveOrder?.reference}
        onClose={() => setReceiveOrder(null)}
        onCompleted={() => {
          queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      />
    </div>
  );
};

export default PurchaseOrdersPage;
