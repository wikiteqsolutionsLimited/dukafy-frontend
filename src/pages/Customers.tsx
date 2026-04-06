import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { customersApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EditButton, DeleteButton, RowActions, PrimaryButton } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { CustomerModal } from "@/components/customers/CustomerModal";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const INITIALS_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

const PAGE_SIZE = 10;

const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => customersApi.getAll({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      toast.success(`"${deleteCustomer?.name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteCustomer(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const customers: Customer[] = data?.data || [];
  const pagination = data?.pagination;

  const openAdd = () => { setEditCustomer(null); setModalOpen(true); };

  const columns: Column<Customer>[] = [
    {
      key: "name", header: "Customer",
      render: (c, i) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${INITIALS_COLORS[i % INITIALS_COLORS.length]}`}>
            {c.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <span className="font-medium text-card-foreground">{c.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (c) => <span className="text-muted-foreground">{c.phone || "—"}</span> },
    { key: "email", header: "Email", render: (c) => <span className="text-muted-foreground">{c.email || "—"}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (c) => (
        <RowActions>
          <EditButton onClick={() => { setEditCustomer(c); setModalOpen(true); }} />
          <DeleteButton onClick={() => setDeleteCustomer(c)} />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Customers" description={`${pagination?.total || 0} customers`}>
        <PrimaryButton icon={Plus} onClick={openAdd}>Add Customer</PrimaryButton>
      </PageHeader>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." className="max-w-md" />

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : customers.length === 0 && search === "" ? (
        <EmptyState icon={Users} title="No customers yet" description="Add your first customer to start tracking purchases." actionLabel="Add Customer" onAction={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(c) => c.id}
          emptyMessage="No customers match your search"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editCustomer ? "edit" : "add"}
        initialData={editCustomer ? { name: editCustomer.name, phone: editCustomer.phone, email: editCustomer.email, address: editCustomer.address || "", notes: editCustomer.notes || "" } : undefined}
        onSave={(formData) => {
          setModalOpen(false);
          const apiCall = editCustomer
            ? customersApi.update(editCustomer.id, formData)
            : customersApi.create(formData);
          apiCall.then(() => {
            toast.success(editCustomer ? `"${formData.name}" updated` : `"${formData.name}" added`);
            queryClient.invalidateQueries({ queryKey: ["customers"] });
          }).catch((err) => toast.error(err.message));
        }}
      />

      <ConfirmModal
        open={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={() => deleteCustomer && deleteMutation.mutate(deleteCustomer.id)}
        title={`Delete "${deleteCustomer?.name}"?`}
        description="This customer and their purchase history will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CustomersPage;
