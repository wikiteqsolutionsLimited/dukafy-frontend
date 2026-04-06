import { useState, useMemo } from "react";
import { useSimulatedLoading } from "@/hooks/use-loading";
import { Plus, PackageMinus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { PrimaryButton, Badge, FilterSelect, ViewButton, DeleteButton, RowActions } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { StockAdjustmentModal } from "@/components/stock/StockAdjustmentModal";

interface StockAdjustment {
  id: number;
  productName: string;
  previousQty: number;
  adjustedQty: number;
  reason: string;
  date: string;
}

const dummyAdjustments: StockAdjustment[] = [
  { id: 1, productName: "Wireless Earbuds", previousQty: 130, adjustedQty: 124, reason: "Damaged", date: "2026-03-02" },
  { id: 2, productName: "USB-C Cable (2m)", previousQty: 350, adjustedQty: 342, reason: "Lost", date: "2026-03-04" },
  { id: 3, productName: "Running Shoes", previousQty: 12, adjustedQty: 8, reason: "Damaged", date: "2026-03-06" },
  { id: 4, productName: "Desk Lamp", previousQty: 5, adjustedQty: 3, reason: "Correction", date: "2026-03-08" },
  { id: 5, productName: "Organic Coffee (500g)", previousQty: 10, adjustedQty: 0, reason: "Lost", date: "2026-03-10" },
  { id: 6, productName: "Bluetooth Speaker", previousQty: 50, adjustedQty: 45, reason: "Damaged", date: "2026-03-12" },
  { id: 7, productName: "Phone Case", previousQty: 200, adjustedQty: 189, reason: "Correction", date: "2026-03-14" },
  { id: 8, productName: "Yoga Mat", previousQty: 70, adjustedQty: 67, reason: "Lost", date: "2026-03-16" },
  { id: 9, productName: "Cotton T-Shirt (M)", previousQty: 60, adjustedQty: 56, reason: "Correction", date: "2026-03-17" },
  { id: 10, productName: "Basketball", previousQty: 8, adjustedQty: 5, reason: "Damaged", date: "2026-03-18" },
];

const REASON_VARIANTS: Record<string, "danger" | "warning" | "default"> = {
  Damaged: "danger",
  Lost: "warning",
  Correction: "default",
};

const PAGE_SIZE = 8;

const StockAdjustmentsPage = () => {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteAdj, setDeleteAdj] = useState<StockAdjustment | null>(null);
  const loading = useSimulatedLoading(600);

  const filtered = useMemo(() => {
    return dummyAdjustments.filter((a) => {
      const matchSearch = a.productName.toLowerCase().includes(search.toLowerCase());
      const matchReason = reasonFilter === "All" || a.reason === reasonFilter;
      return matchSearch && matchReason;
    });
  }, [search, reasonFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: Column<StockAdjustment>[] = [
    { key: "product", header: "Product Name", render: (a) => <span className="font-medium text-card-foreground">{a.productName}</span> },
    { key: "prev", header: "Previous Qty", align: "center", render: (a) => <span className="text-muted-foreground">{a.previousQty}</span> },
    {
      key: "adjusted", header: "Adjusted Qty", align: "center",
      render: (a) => {
        const diff = a.adjustedQty - a.previousQty;
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-card-foreground">{a.adjustedQty}</span>
            <span className={diff < 0 ? "text-xs text-destructive" : "text-xs text-success"}>({diff > 0 ? "+" : ""}{diff})</span>
          </div>
        );
      },
    },
    { key: "reason", header: "Reason", render: (a) => <Badge variant={REASON_VARIANTS[a.reason] || "default"}>{a.reason}</Badge> },
    { key: "date", header: "Date", render: (a) => <span className="text-muted-foreground">{format(new Date(a.date), "MMM dd, yyyy")}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (a) => (
        <RowActions>
          <ViewButton />
          <DeleteButton onClick={() => setDeleteAdj(a)} />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Stock Adjustments" description={`${filtered.length} adjustments recorded`}>
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

      {loading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : paginated.length === 0 && search === "" && reasonFilter === "All" ? (
        <EmptyState icon={PackageMinus} title="No stock adjustments yet" description="Record your first stock adjustment to keep inventory accurate." actionLabel="Adjust Stock" onAction={() => setModalOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(a) => a.id}
          emptyMessage="No adjustments match your filters"
          pagination={{ currentPage, totalPages, totalItems: filtered.length, pageSize: PAGE_SIZE, onPageChange: setPage }}
        />
      )}

      <StockAdjustmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => { setModalOpen(false); toast.success(`Stock adjusted for "${data.product}"`); }}
      />

      <ConfirmModal
        open={!!deleteAdj}
        onClose={() => setDeleteAdj(null)}
        onConfirm={() => { toast.success(`Adjustment for "${deleteAdj?.productName}" deleted`); setDeleteAdj(null); }}
        title={`Delete adjustment for "${deleteAdj?.productName}"?`}
        description="This stock adjustment record will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default StockAdjustmentsPage;
