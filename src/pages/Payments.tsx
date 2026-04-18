import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Smartphone, Wallet, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSection } from "@/components/shared/CardSection";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/ActionButtons";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface PaymentRow {
  id: number;
  created_at: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  phone?: string;
  sale_id?: number;
}

const PAGE_SIZE = 15;

const PaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "mpesa">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["payments", page, methodFilter, statusFilter],
    queryFn: () => paymentsApi.list({ page, limit: PAGE_SIZE, method: methodFilter, status: statusFilter }),
    refetchInterval: 30_000,
  });
  const { data: sumData } = useQuery({
    queryKey: ["payments-summary"],
    queryFn: () => paymentsApi.summary(),
    refetchInterval: 30_000,
  });
  const summary = sumData?.data || {};

  const rows: PaymentRow[] = (data?.data || []).filter((r: PaymentRow) =>
    !search || (r.reference || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || "").includes(search)
  );

  const statusBadge = (s: string) =>
    s === "completed" ? <Badge variant="success">Completed</Badge> :
    s === "pending" ? <Badge variant="warning">Pending</Badge> :
    s === "failed" ? <Badge variant="danger">Failed</Badge> :
    <Badge>{s}</Badge>;

  const methodBadge = (m: string) =>
    m === "mpesa" ? <span className="inline-flex items-center gap-1 text-[hsl(142,60%,40%)] font-semibold"><Smartphone className="h-3 w-3" /> M-Pesa</span> :
    m === "cash" ? <span className="inline-flex items-center gap-1 text-foreground"><Wallet className="h-3 w-3" /> Cash</span> :
    <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> {m}</span>;

  const columns: Column<PaymentRow>[] = [
    { key: "reference", header: "Reference", render: (r) => <span className="font-mono text-xs">{r.reference || "—"}</span> },
    { key: "method", header: "Method", render: (r) => methodBadge(r.method) },
    { key: "amount", header: "Amount", align: "right", render: (r) => <span className="font-semibold text-card-foreground">{formatCurrency(Number(r.amount))}</span> },
    { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    { key: "phone", header: "Phone", render: (r) => <span className="text-xs text-muted-foreground">{r.phone || "—"}</span> },
    { key: "sale_id", header: "Sale", render: (r) => r.sale_id ? <span className="text-xs text-muted-foreground">#{r.sale_id}</span> : <span className="text-xs text-muted-foreground">—</span> },
    { key: "created_at", header: "Date", render: (r) => <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")}</span> },
  ];

  const pagination = data?.pagination;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Payments" description="All payments received: cash, M-Pesa, and other methods">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSection className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Cash</p>
              <p className="text-lg font-bold text-card-foreground truncate">{formatCurrency(Number(summary.total_cash || 0))}</p>
            </div>
          </div>
        </CardSection>
        <CardSection className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(142,60%,40%)]/10">
              <Smartphone className="h-5 w-5 text-[hsl(142,60%,40%)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total M-Pesa</p>
              <p className="text-lg font-bold text-card-foreground truncate">{formatCurrency(Number(summary.total_mpesa || 0))}</p>
            </div>
          </div>
        </CardSection>
        <CardSection className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Loader2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-card-foreground">{summary.pending_count || 0}</p>
            </div>
          </div>
        </CardSection>
        <CardSection className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-lg font-bold text-card-foreground">{summary.failed_count || 0}</p>
            </div>
          </div>
        </CardSection>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search reference or phone..." className="flex-1" />
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value as any); setPage(1); }}
          className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground"
        >
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="mpesa">M-Pesa</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(r) => `${r.reference}-${r.id}`}
          emptyMessage="No payments yet"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
