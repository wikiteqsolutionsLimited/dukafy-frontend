import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { auditLogsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge, FilterSelect } from "@/components/shared/ActionButtons";

interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: string;
  entity: string;
  description: string;
  created_at: string;
}

const ACTION_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
  LOGIN: "default",
  SALE: "success",
  STOCK_UPDATE: "warning",
};

const ActivityLogsPage = () => {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, entityFilter, dateFrom, dateTo],
    queryFn: () => auditLogsApi.getAll({
      page, limit: 15,
      action: actionFilter || undefined,
      entity: entityFilter || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    }),
    enabled: hasRole("admin"),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const columns: Column<AuditLog>[] = [
    {
      key: "user_name", header: "User",
      render: (l) => (
        <div>
          <span className="font-medium text-card-foreground">{l.user_name || "System"}</span>
          {l.user_email && <p className="text-xs text-muted-foreground">{l.user_email}</p>}
        </div>
      ),
    },
    { key: "action", header: "Action", render: (l) => <Badge variant={ACTION_VARIANTS[l.action] || "default"}>{l.action}</Badge> },
    { key: "entity", header: "Module", render: (l) => <span className="text-sm capitalize text-muted-foreground">{l.entity}</span> },
    { key: "description", header: "Description", render: (l) => <span className="text-sm text-muted-foreground truncate max-w-[300px] inline-block">{l.description || "—"}</span> },
    {
      key: "created_at", header: "Date",
      render: (l) => <span className="text-sm text-muted-foreground">{format(new Date(l.created_at), "MMM d, yyyy HH:mm")}</span>,
    },
  ];

  if (!hasRole("admin")) {
    return (
      <div className="animate-fade-in space-y-6">
        <EmptyState icon={Shield} title="Access Denied" description="Only administrators can view activity logs." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Activity Logs" description={`${pagination?.total || 0} log entries`} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <FilterSelect value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="SALE">Sale</option>
          <option value="STOCK_UPDATE">Stock Update</option>
        </FilterSelect>
        <FilterSelect value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}>
          <option value="">All Modules</option>
          <option value="auth">Auth</option>
          <option value="product">Products</option>
          <option value="sale">Sales</option>
          <option value="user">Users</option>
          <option value="customer">Customers</option>
        </FilterSelect>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} rows={10} />
      ) : logs.length === 0 && !actionFilter && !entityFilter ? (
        <EmptyState icon={FileText} title="No activity logs yet" description="Activity will appear here as users interact with the system." />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(l) => l.id}
          emptyMessage="No logs match your filters"
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

export default ActivityLogsPage;
