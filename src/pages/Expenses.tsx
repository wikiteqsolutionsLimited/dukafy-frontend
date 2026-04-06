import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { expensesApi } from "@/lib/api";
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
import { ExpenseModal } from "@/components/expenses/ExpenseModal";

export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

const CATEGORIES = ["All", "Rent", "Salaries", "Utilities", "Supplies", "Marketing", "Maintenance", "Transport", "Other"];

const CATEGORY_COLORS: Record<string, "default" | "success" | "warning" | "danger"> = {
  Rent: "danger", Salaries: "warning", Utilities: "success", Supplies: "default",
  Marketing: "success", Maintenance: "warning", Transport: "default", Other: "default",
};

const PAGE_SIZE = 10;

const ExpensesPage = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, dateFrom, dateTo],
    queryFn: () => expensesApi.getAll({ page, limit: PAGE_SIZE, from: dateFrom || undefined, to: dateTo || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => {
      toast.success(`"${deleteExpense?.description}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setDeleteExpense(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const expenses: Expense[] = data?.data || [];
  const pagination = data?.pagination;

  // Client-side filters for search and category
  const filtered = expenses.filter((e) => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || e.category === category;
    return matchSearch && matchCat;
  });

  const totalExpenses = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const openAdd = () => { setEditExpense(null); setModalOpen(true); };

  const columns: Column<Expense>[] = [
    { key: "description", header: "Expense", render: (e) => <span className="font-medium text-card-foreground">{e.description}</span> },
    { key: "category", header: "Category", render: (e) => <Badge variant={CATEGORY_COLORS[e.category] || "default"}>{e.category || "—"}</Badge> },
    { key: "amount", header: "Amount", align: "right", render: (e) => <span className="font-semibold text-card-foreground">{formatCurrency(e.amount)}</span> },
    { key: "date", header: "Date", render: (e) => <span className="text-muted-foreground">{e.date ? format(new Date(e.date), "MMM dd, yyyy") : "—"}</span> },
    { key: "notes", header: "Notes", render: (e) => <span className="text-muted-foreground truncate max-w-[200px] inline-block">{e.notes || "—"}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (e) => (
        <RowActions>
          {hasRole("admin", "manager") && <EditButton onClick={() => { setEditExpense(e); setModalOpen(true); }} />}
          {hasRole("admin") && <DeleteButton onClick={() => setDeleteExpense(e)} />}
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Expenses" description={`${pagination?.total || 0} expenses`}>
        {hasRole("admin", "manager") && <PrimaryButton icon={Plus} onClick={openAdd}>Add Expense</PrimaryButton>}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <CardSection className="flex flex-col items-center justify-center py-6">
          <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">{formatCurrency(totalExpenses)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{filtered.length} transactions</p>
        </CardSection>
        <CardSection className="flex flex-col items-center justify-center py-6">
          <p className="text-sm font-medium text-muted-foreground">Highest Expense</p>
          <p className="mt-1 text-3xl font-bold text-destructive">
            {filtered.length > 0 ? formatCurrency(Math.max(...filtered.map((e) => Number(e.amount)))) : formatCurrency(0)}
          </p>
        </CardSection>
        <CardSection className="flex flex-col items-center justify-center py-6">
          <p className="text-sm font-medium text-muted-foreground">Average Expense</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {filtered.length > 0 ? formatCurrency(totalExpenses / filtered.length) : formatCurrency(0)}
          </p>
        </CardSection>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." className="flex-1" />
        <FilterSelect value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </FilterSelect>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : filtered.length === 0 && search === "" && category === "All" && !dateFrom && !dateTo ? (
        <EmptyState icon={Receipt} title="No expenses yet" description="Start tracking your expenses." actionLabel="Add Expense" onAction={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(e) => e.id}
          emptyMessage="No expenses match your filters"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}

      <ExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editExpense ? "edit" : "add"}
        initialData={editExpense ? {
          title: editExpense.description, category: editExpense.category,
          amount: String(editExpense.amount), date: editExpense.date, notes: editExpense.notes,
        } : undefined}
        onSave={(formData) => {
          setModalOpen(false);
          const apiData = { description: formData.title, amount: parseFloat(formData.amount), category: formData.category, date: formData.date, notes: formData.notes };
          const apiCall = editExpense
            ? expensesApi.update(editExpense.id, apiData)
            : expensesApi.create(apiData);
          apiCall.then(() => {
            toast.success(editExpense ? `"${formData.title}" updated` : `"${formData.title}" added`);
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
          }).catch((err) => toast.error(err.message));
        }}
      />

      <ConfirmModal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        onConfirm={() => deleteExpense && deleteMutation.mutate(deleteExpense.id)}
        title={`Delete "${deleteExpense?.description}"?`}
        description="This expense record will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ExpensesPage;
