import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { usersApi, shopsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EditButton, DeleteButton, RowActions, PrimaryButton, Badge, FilterSelect } from "@/components/shared/ActionButtons";
import { ConfirmModal } from "@/components/shared/Modal";
import { FormInput, FormSelect } from "@/components/shared/FormFields";
import { Modal } from "@/components/shared/Modal";
import { format } from "date-fns";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

const ROLE_VARIANTS: Record<string, "success" | "warning" | "default" | "danger"> = {
  admin: "danger",
  manager: "warning",
  cashier: "default",
};

const StaffPage = () => {
  const { hasRole } = useAuth();
  const { activeShop } = useShop();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<StaffMember | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [inviteForm, setInviteForm] = useState({ email: "", role: "cashier" });
  const [inviting, setInviting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter],
    queryFn: () => usersApi.getAll({ page, limit: 10, search: search || undefined, role: roleFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => usersApi.create(d),
    onSuccess: () => {
      toast.success("Staff member created");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      toast.success("Staff member updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      setEditUser(null);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      toast.success("Staff member deactivated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeactivateUser(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => setForm({ name: "", email: "", password: "", role: "cashier" });

  const openAdd = () => { setEditUser(null); resetForm(); setModalOpen(true); };
  const openEdit = (u: StaffMember) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editUser) {
      const updateData: any = { name: form.name, email: form.email, role: form.role };
      updateMutation.mutate({ id: editUser.id, data: updateData });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email.trim()) { toast.error("Email is required"); return; }
    if (!activeShop) { toast.error("No active shop"); return; }
    setInviting(true);
    try {
      const res = await shopsApi.inviteMember(activeShop.id, inviteForm);
      toast.success(res.message || "Invite sent successfully");
      setInviteModalOpen(false);
      setInviteForm({ email: "", role: "cashier" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  const columns: Column<StaffMember>[] = [
    {
      key: "name", header: "Name",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {u.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-card-foreground">{u.name}</span>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      render: (u) => <Badge variant={ROLE_VARIANTS[u.role]}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</Badge>,
    },
    {
      key: "is_active", header: "Status",
      render: (u) => <Badge variant={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "last_login", header: "Last Login",
      render: (u) => <span className="text-muted-foreground text-sm">{u.last_login ? format(new Date(u.last_login), "MMM d, yyyy HH:mm") : "Never"}</span>,
    },
    {
      key: "actions", header: "Actions", align: "right" as const,
      render: (u) => (
        <RowActions>
          <EditButton onClick={() => openEdit(u)} />
          {u.is_active && <DeleteButton onClick={() => setDeactivateUser(u)} />}
        </RowActions>
      ),
    },
  ];

  if (!hasRole("admin")) {
    return (
      <div className="animate-fade-in space-y-6">
        <EmptyState icon={Shield} title="Access Denied" description="Only administrators can manage staff members." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Staff Management" description={`${pagination?.total || 0} staff members`}>
        <div className="flex gap-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4" /> Invite via Email
          </button>
          <PrimaryButton icon={Plus} onClick={openAdd}>Add Staff</PrimaryButton>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." className="flex-1" />
        <FilterSelect value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </FilterSelect>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : users.length === 0 && !search && !roleFilter ? (
        <EmptyState icon={Users} title="No staff added yet" description="Add your first staff member to get started." actionLabel="Add Staff" onAction={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          emptyMessage="No staff members match your search"
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            pageSize: pagination.limit,
            onPageChange: setPage,
          } : undefined}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditUser(null); resetForm(); }} title={editUser ? "Edit Staff" : "Add Staff"}>
        <div className="space-y-4">
          <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          {!editUser && (
            <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
          )}
          <FormSelect
            label="Role"
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v })}
            options={[
              { label: "Cashier", value: "cashier" },
              { label: "Manager", value: "manager" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setModalOpen(false); setEditUser(null); }} className="h-10 rounded-lg border bg-card px-4 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <PrimaryButton onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editUser ? "Update" : "Create"}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deactivateUser}
        onClose={() => setDeactivateUser(null)}
        onConfirm={() => deactivateUser && deactivateMutation.mutate(deactivateUser.id)}
        title={`Deactivate "${deactivateUser?.name}"?`}
        description="This staff member will no longer be able to log in. This action can be reversed."
        confirmLabel="Deactivate"
        variant="danger"
      />

      {/* Invite Modal */}
      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Staff via Email">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send an email invitation to add a new staff member to your shop. If they already have a DukaFy account, they'll be added immediately.
          </p>
          <FormInput
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="staff@example.com"
          />
          <FormSelect
            label="Role"
            value={inviteForm.role}
            onChange={(v) => setInviteForm({ ...inviteForm, role: v })}
            options={[
              { label: "Cashier", value: "cashier" },
              { label: "Manager", value: "manager" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setInviteModalOpen(false)} className="h-10 rounded-lg border bg-card px-4 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <PrimaryButton icon={Mail} onClick={handleInvite} disabled={inviting}>
              {inviting ? "Sending..." : "Send Invite"}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffPage;
