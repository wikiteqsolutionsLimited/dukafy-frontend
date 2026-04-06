import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EditButton, DeleteButton, RowActions, PrimaryButton } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { CategoryModal } from "@/components/categories/CategoryModal";

interface Category {
  id: number;
  name: string;
  description: string;
}

const CategoriesPage = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success(`"${deleteCategory?.name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteCategory(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const allCategories: Category[] = data?.data || [];
  const filtered = allCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditCategory(null); setModalOpen(true); };

  const columns: Column<Category>[] = [
    {
      key: "name", header: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Tag className="h-4 w-4" />
          </div>
          <span className="font-medium text-card-foreground">{c.name}</span>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (c) => <span className="text-muted-foreground">{c.description || "—"}</span> },
    {
      key: "actions", header: "Actions", align: "right",
      render: (c) => (
        <RowActions>
          {hasRole("admin", "manager") && <EditButton onClick={() => { setEditCategory(c); setModalOpen(true); }} />}
          {hasRole("admin") && <DeleteButton onClick={() => setDeleteCategory(c)} />}
        </RowActions>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Categories" description={`${filtered.length} categories`}>
        {hasRole("admin", "manager") && <PrimaryButton icon={Plus} onClick={openAdd}>Add Category</PrimaryButton>}
      </PageHeader>

      <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." className="max-w-md" />

      {isLoading ? (
        <TableSkeleton columns={3} />
      ) : filtered.length === 0 && search === "" ? (
        <EmptyState icon={Tag} title="No categories yet" description="Create your first category to organize products." actionLabel="Add Category" onAction={openAdd} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(c) => c.id} emptyMessage="No categories match your search" />
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editCategory ? "edit" : "add"}
        initialData={editCategory ? { name: editCategory.name, description: editCategory.description } : undefined}
        onSave={(formData) => {
          setModalOpen(false);
          const apiCall = editCategory
            ? categoriesApi.update(editCategory.id, formData)
            : categoriesApi.create(formData);
          apiCall.then(() => {
            toast.success(editCategory ? `"${formData.name}" updated` : `"${formData.name}" added`);
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          }).catch((err) => toast.error(err.message));
        }}
      />

      <ConfirmModal
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
        title={`Delete "${deleteCategory?.name}"?`}
        description="This category will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CategoriesPage;
