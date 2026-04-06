import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { suppliersApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EditButton, DeleteButton, RowActions, PrimaryButton } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { SupplierModal } from "@/components/suppliers/SupplierModal";
import { useAuth } from "@/hooks/useAuth";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const PAGE_SIZE = 10;

const SuppliersPage = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, search],
    queryFn: () => suppliersApi.getAll({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      toast.success(`"${deleteSupplier?.name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleteSupplier(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const suppliers: Supplier[] = data?.data || [];
  const pagination = data?.pagination;

  const openAdd = () => { setEditSupplier(null); setModalOpen(true); };

  const columns: Column<Supplier>[] = [
    {
      key: "name", header: "Supplier",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Truck className="h-4 w-4" />
          </div>
          <span className="font-medium text-card-foreground">{s.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (s) => <span className="text-muted-foreground">{s.phone || "—"}</span> },
    { key: "email", header: "Email", render: (s) => <span className="text-muted-foreground">{s.email || "—"}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (s) => (
        <RowActions>
          {hasRole("admin", "manager") && <EditButton onClick={() => { setEditSupplier(s); setModalOpen(true); }} />}
          {hasRole("admin") && <DeleteButton onClick={() => setDeleteSupplier(s)} />}
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Suppliers" description={`${pagination?.total || 0} suppliers`}>
        {hasRole("admin", "manager") && <PrimaryButton icon={Plus} onClick={openAdd}>Add Supplier</PrimaryButton>}
      </PageHeader>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." className="max-w-md" />

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : suppliers.length === 0 && search === "" ? (
        <EmptyState icon={Truck} title="No suppliers yet" description="Add your first supplier to manage your supply chain." actionLabel="Add Supplier" onAction={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={suppliers}
          keyExtractor={(s) => s.id}
          emptyMessage="No suppliers match your search"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}

      <SupplierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editSupplier ? "edit" : "add"}
        initialData={editSupplier ? { name: editSupplier.name, contact: editSupplier.phone, email: editSupplier.email, address: editSupplier.address || "", notes: "" } : undefined}
        onSave={(formData) => {
          setModalOpen(false);
          const apiData = { name: formData.name, phone: formData.contact, email: formData.email, address: formData.address };
          const apiCall = editSupplier
            ? suppliersApi.update(editSupplier.id, apiData)
            : suppliersApi.create(apiData);
          apiCall.then(() => {
            toast.success(editSupplier ? `"${formData.name}" updated` : `"${formData.name}" added`);
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
          }).catch((err) => toast.error(err.message));
        }}
      />

      <ConfirmModal
        open={!!deleteSupplier}
        onClose={() => setDeleteSupplier(null)}
        onConfirm={() => deleteSupplier && deleteMutation.mutate(deleteSupplier.id)}
        title={`Delete "${deleteSupplier?.name}"?`}
        description="This supplier and their records will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default SuppliersPage;
