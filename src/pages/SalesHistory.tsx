import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { CalendarIcon, Receipt, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ViewButton, RowActions } from "@/components/shared/ActionButtons";
import { ReceiptModal, ReceiptData } from "@/components/sales/ReceiptModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { salesApi } from "@/lib/api";

const PAGE_SIZE = 20;

const SalesHistoryPage = () => {
  const [from, setFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [to, setTo] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [viewingSaleId, setViewingSaleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sales-history", page, from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const params: any = { page, limit: PAGE_SIZE };
      if (from) params.from = format(from, "yyyy-MM-dd");
      if (to) params.to = format(to, "yyyy-MM-dd'T'23:59:59");
      return salesApi.getAll(params);
    },
  });

  const sales = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // View sale details
  const { data: saleDetail } = useQuery({
    queryKey: ["sale-detail", viewingSaleId],
    queryFn: async () => {
      if (!viewingSaleId) return null;
      const res = await salesApi.getById(viewingSaleId);
      return res.data;
    },
    enabled: !!viewingSaleId,
  });

  // When sale detail loads, show receipt
  if (saleDetail && viewingSaleId) {
    const r: ReceiptData = {
      items: (saleDetail.items || []).map((i: any) => ({ name: i.product_name, qty: i.quantity, price: parseFloat(i.unit_price) })),
      subtotal: parseFloat(saleDetail.subtotal),
      tax: parseFloat(saleDetail.tax),
      total: parseFloat(saleDetail.total),
      paymentMethod: saleDetail.payment_method || "Cash",
      transactionId: `ORD-${String(saleDetail.id).padStart(4, "0")}`,
      date: new Date(saleDetail.created_at),
    };
    if (!receipt) {
      setReceipt(r);
      setViewingSaleId(null);
    }
  }

  const methodColor: Record<string, string> = {
    card: "bg-primary/10 text-primary",
    cash: "bg-success/10 text-success",
    mobile: "bg-accent text-accent-foreground",
  };

  const columns: Column<any>[] = [
    {
      key: "id", header: "Order ID",
      render: (s) => <span className="font-mono text-xs font-semibold text-card-foreground">ORD-{String(s.id).padStart(4, "0")}</span>,
    },
    {
      key: "created_at", header: "Date",
      render: (s) => <span className="text-sm text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy HH:mm")}</span>,
    },
    {
      key: "customer_name", header: "Customer",
      render: (s) => <span className="text-sm text-card-foreground">{s.customer_name || "Walk-in"}</span>,
    },
    {
      key: "total", header: "Total",
      render: (s) => <span className="text-sm font-semibold text-card-foreground">{formatCurrency(s.total)}</span>,
    },
    {
      key: "payment_method", header: "Payment",
      render: (s) => (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", methodColor[s.payment_method] || "bg-muted text-muted-foreground")}>
          {s.payment_method}
        </span>
      ),
    },
    {
      key: "cashier_name", header: "Cashier",
      render: (s) => <span className="text-sm text-muted-foreground">{s.cashier_name || "—"}</span>,
    },
    {
      key: "actions" as any, header: "Actions", align: "right" as const,
      render: (s: any) => (
        <RowActions>
          <ViewButton onClick={() => setViewingSaleId(s.id)} />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Sales History" description="View all past transactions">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">{pagination?.total || 0} orders</span>
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <DatePicker label="From" date={from} onChange={(d) => { setFrom(d); setPage(1); }} />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePicker label="To" date={to} onChange={(d) => { setTo(d); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading sales...</p>
        </div>
      ) : sales.length === 0 ? (
        <EmptyState icon={Receipt} title="No sales found" description="No transactions match your filters. Try adjusting the date range." />
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          keyExtractor={(s) => s.id}
          title="Transactions"
          description="Click View to see the full receipt"
          pagination={{ currentPage: page, totalPages, totalItems: pagination?.total || 0, pageSize: PAGE_SIZE, onPageChange: setPage }}
        />
      )}

      {receipt && <ReceiptModal open={!!receipt} onClose={() => setReceipt(null)} data={receipt} />}
    </div>
  );
};

export default SalesHistoryPage;

function DatePicker({ label, date, onChange }: { label: string; date?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-9 w-[170px] justify-start text-left text-sm font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}
