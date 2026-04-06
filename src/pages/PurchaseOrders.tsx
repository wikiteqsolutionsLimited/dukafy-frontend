import { useState, useMemo } from "react";
import { useSimulatedLoading } from "@/hooks/use-loading";
import { Plus, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { PrimaryButton, Badge, FilterSelect, ViewButton, EditButton, DeleteButton, RowActions } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";

interface PurchaseOrder {
  id: string;
  supplier: string;
  totalAmount: number;
  status: "Pending" | "Completed";
  date: string;
  items: number;
}

const dummyOrders: PurchaseOrder[] = [
  { id: "PO-001", supplier: "TechWholesale Inc.", totalAmount: 4250, status: "Completed", date: "2026-03-01", items: 5 },
  { id: "PO-002", supplier: "FashionDirect", totalAmount: 1890, status: "Completed", date: "2026-03-03", items: 3 },
  { id: "PO-003", supplier: "FreshFoods Co.", totalAmount: 720, status: "Pending", date: "2026-03-07", items: 4 },
  { id: "PO-004", supplier: "HomeSupply Ltd.", totalAmount: 3100, status: "Completed", date: "2026-03-09", items: 6 },
  { id: "PO-005", supplier: "SportGear Pro", totalAmount: 2450, status: "Pending", date: "2026-03-12", items: 3 },
  { id: "PO-006", supplier: "GadgetWorld", totalAmount: 1560, status: "Pending", date: "2026-03-14", items: 2 },
  { id: "PO-007", supplier: "EcoGoods", totalAmount: 890, status: "Completed", date: "2026-03-15", items: 4 },
  { id: "PO-008", supplier: "MegaDistributors", totalAmount: 2100, status: "Completed", date: "2026-03-17", items: 7 },
  { id: "PO-009", supplier: "TechWholesale Inc.", totalAmount: 5600, status: "Pending", date: "2026-03-18", items: 8 },
  { id: "PO-010", supplier: "FashionDirect", totalAmount: 960, status: "Completed", date: "2026-03-19", items: 2 },
];

const PAGE_SIZE = 8;

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteOrder, setDeleteOrder] = useState<PurchaseOrder | null>(null);
  const loading = useSimulatedLoading(600);

  const filtered = useMemo(() => {
    return dummyOrders.filter((o) => {
      const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.supplier.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: Column<PurchaseOrder>[] = [
    { key: "id", header: "Order ID", render: (o) => <span className="font-semibold text-primary">{o.id}</span> },
    { key: "supplier", header: "Supplier", render: (o) => <span className="font-medium text-card-foreground">{o.supplier}</span> },
    { key: "items", header: "Items", render: (o) => <span className="text-muted-foreground">{o.items} products</span> },
    { key: "totalAmount", header: "Total Amount", align: "right", render: (o) => <span className="font-semibold text-card-foreground">KES {o.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span> },
    {
      key: "status", header: "Status",
      render: (o) => <Badge variant={o.status === "Completed" ? "success" : "warning"}>{o.status}</Badge>,
    },
    { key: "date", header: "Date", render: (o) => <span className="text-muted-foreground">{format(new Date(o.date), "MMM dd, yyyy")}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (o) => (
        <RowActions>
          <ViewButton />
          <EditButton />
          <DeleteButton onClick={() => setDeleteOrder(o)} />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Purchase Orders" description={`${filtered.length} orders found`}>
        <PrimaryButton icon={Plus} onClick={() => navigate("/purchase-orders/create")}>Create Purchase Order</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by order ID or supplier..." className="flex-1" />
        <FilterSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </FilterSelect>
      </div>

      {loading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : paginated.length === 0 && search === "" && statusFilter === "All" ? (
        <EmptyState icon={ClipboardList} title="No purchase orders yet" description="Create your first purchase order to start managing supplier orders." actionLabel="Create Purchase Order" onAction={() => navigate("/purchase-orders/create")} />
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(o) => o.id}
          emptyMessage="No orders match your filters"
          pagination={{ currentPage, totalPages, totalItems: filtered.length, pageSize: PAGE_SIZE, onPageChange: setPage }}
        />
      )}

      <ConfirmModal
        open={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => { setDeleteOrder(null); }}
        title={`Delete ${deleteOrder?.id}?`}
        description={`This purchase order from "${deleteOrder?.supplier}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default PurchaseOrdersPage;
