import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ActionButtons";

const EXPENSE_CATEGORIES = [
  { label: "Rent", value: "Rent" },
  { label: "Salaries", value: "Salaries" },
  { label: "Utilities", value: "Utilities" },
  { label: "Supplies", value: "Supplies" },
  { label: "Marketing", value: "Marketing" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Transport", value: "Transport" },
  { label: "Other", value: "Other" },
];

export interface ExpenseFormData {
  title: string;
  category: string;
  amount: string;
  date: string;
  notes: string;
}

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: ExpenseFormData;
  onSave: (data: ExpenseFormData) => void;
}

const defaultData: ExpenseFormData = { title: "", category: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" };

export function ExpenseModal({ open, onClose, mode, initialData, onSave }: ExpenseModalProps) {
  const [form, setForm] = useState<ExpenseFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData || defaultData);
      setErrors({});
    }
  }, [open, initialData]);

  const update = <K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = "Valid amount is required";
    if (!form.date) errs.date = "Date is required";
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
      title={mode === "add" ? "Add Expense" : "Edit Expense"}
      icon={Receipt}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{mode === "add" ? "Add Expense" : "Save Changes"}</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormInput label="Title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Monthly Rent" error={errors.title} required />
        <FormSelect label="Category" value={form.category} onChange={(v) => update("category", v)} options={EXPENSE_CATEGORIES} placeholder="Select category" error={errors.category} required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="0.00" error={errors.amount} required />
          <FormInput label="Date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} error={errors.date} required />
        </div>
        <FormTextarea label="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Optional notes..." rows={3} />
      </div>
    </Modal>
  );
}
