import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { FormInput, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ActionButtons";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: CustomerFormData;
  onSave: (data: CustomerFormData) => void;
}

const defaultData: CustomerFormData = { name: "", phone: "", email: "", address: "", notes: "" };

export function CustomerModal({ open, onClose, mode, initialData, onSave }: CustomerModalProps) {
  const [form, setForm] = useState<CustomerFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData || defaultData);
      setErrors({});
    }
  }, [open, initialData]);

  const update = <K extends keyof CustomerFormData>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Customer name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
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
      title={mode === "add" ? "Add Customer" : "Edit Customer"}
      icon={Users}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{mode === "add" ? "Add Customer" : "Save Changes"}</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormInput label="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Alice Johnson" error={errors.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Phone Number" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" error={errors.phone} required />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="alice@example.com" error={errors.email} optional />
        </div>
        <FormInput label="Address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St, City" optional />
        <FormTextarea label="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Optional notes..." rows={3} />
      </div>
    </Modal>
  );
}
