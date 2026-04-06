import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { FormInput, FormTextarea } from "@/components/shared/FormFields";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ActionButtons";

export interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: CategoryFormData;
  onSave: (data: CategoryFormData) => void;
}

const defaultData: CategoryFormData = { name: "", description: "" };

export function CategoryModal({ open, onClose, mode, initialData, onSave }: CategoryModalProps) {
  const [form, setForm] = useState<CategoryFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData || defaultData);
      setErrors({});
    }
  }, [open, initialData]);

  const update = <K extends keyof CategoryFormData>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Category name is required";
    else if (form.name.trim().length > 50) errs.name = "Max 50 characters";
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
      title={mode === "add" ? "Add Category" : "Edit Category"}
      icon={Tag}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>{mode === "add" ? "Add Category" : "Save Changes"}</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <FormInput
          label="Category Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Electronics"
          error={errors.name}
          required
          maxLength={50}
        />
        <FormTextarea
          label="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Brief description of this category..."
          rows={3}
        />
      </div>
    </Modal>
  );
}
