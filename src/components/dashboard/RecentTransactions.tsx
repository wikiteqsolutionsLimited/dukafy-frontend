import { useQuery } from "@tanstack/react-query";
import { salesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/ActionButtons";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  customer_name: string | null;
  total: string;
  payment_method: string;
  created_at: string;
  item_count?: number;
}

const columns: Column<Transaction>[] = [
  { key: "id", header: "ID", render: (tx) => <span className="font-mono text-xs text-muted-foreground">TXN-{String(tx.id).padStart(4, "0")}</span> },
  { key: "customer_name", header: "Customer", render: (tx) => <span className="font-medium text-card-foreground">{tx.customer_name || "Walk-in"}</span> },
  { key: "total", header: "Total", render: (tx) => <span className="font-semibold text-card-foreground">{formatCurrency(tx.total)}</span> },
  { key: "payment_method", header: "Payment", render: (tx) => <Badge>{tx.payment_method}</Badge> },
  { key: "created_at", header: "Time", render: (tx) => <span className="text-muted-foreground">{format(new Date(tx.created_at), "HH:mm")}</span> },
];

export function RecentTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const res = await salesApi.getAll({ limit: 6 });
      return res.data as Transaction[];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data || []}
      keyExtractor={(tx) => tx.id}
      title="Recent Transactions"
      description="Latest sales activity"
    />
  );
}
