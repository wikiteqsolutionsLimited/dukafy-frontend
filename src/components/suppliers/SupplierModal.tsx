import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { FormInput, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ActionButtons";

export interface SupplierFormData {
  name: string;
  contact: string;
  email: string;
  address: string;
  notes: string;
}

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: SupplierFormData;
  onSave: (data: SupplierFormData) => void;
}

const defaultData: SupplierFormData = { name: "", contact: "", email: "", address: "", notes: "" };

export function SupplierModal({ open, onClose, mode, initialData, onSave }: SupplierModalProps) {
  const [form, setForm] = useState<SupplierFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData || defaultData);
      setErrors({});
    }
  }, [open, initialData]);

  const update = <K extends keyof SupplierFormData>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Supplier name is required";
    if (!form.contact.trim()) errs.contact = "Contact number is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add Supplier" : "Edit Supplier"}
      icon={Truck}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{mode === "add" ? "Add Supplier" : "Save Changes"}</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormInput label="Supplier Name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. TechWholesale Inc." error={errors.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Contact Number" value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="(555) 100-2000" error={errors.contact} required />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="orders@supplier.com" error={errors.email} optional />
        </div>
        <FormInput label="Address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Warehouse Rd, City" optional />
        <FormTextarea label="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Optional notes about this supplier..." rows={3} />
      </div>
    </Modal>
  );
}
