import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PackageMinus } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { FormSelect, FormInput } from "@/components/shared/FormFields";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { productsApi } from "@/lib/api";

const reasons = [
  { label: "Damaged", value: "Damaged" },
  { label: "Lost", value: "Lost" },
  { label: "Correction", value: "Correction" },
];

interface FormData {
  product: string;
  product_id: string;
  newQuantity: string;
  reason: string;
}

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

const defaultForm: FormData = { product: "", product_id: "", newQuantity: "", reason: "" };

export function StockAdjustmentModal({ open, onClose, onSave }: StockAdjustmentModalProps) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const { data: productsData } = useQuery({
    queryKey: ["products-for-adjustment"],
    queryFn: () => productsApi.getAll({ limit: 200 }),
    enabled: open,
  });

  const productOptions = (productsData?.data || []).map((p: any) => ({
    label: `${p.name} (Stock: ${p.quantity})`,
    value: String(p.id),
  }));

  useEffect(() => {
    if (open) { setForm(defaultForm); setErrors({}); }
  }, [open]);

  const update = <K extends keyof FormData>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "product_id") {
      const product = (productsData?.data || []).find((p: any) => String(p.id) === value);
      if (product) setForm((f) => ({ ...f, product_id: value, product: product.name }));
    }
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = () => {
    const errs: typeof errors = {};
    if (!form.product_id) errs.product_id = "Select a product";
    if (!form.newQuantity || isNaN(Number(form.newQuantity)) || Number(form.newQuantity) < 0) errs.newQuantity = "Valid quantity required";
    if (!form.reason) errs.reason = "Select a reason";
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Stock" icon={PackageMinus}
      footer={<>
        <button onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Cancel</button>
        <PrimaryButton onClick={handleSave}>Save Adjustment</PrimaryButton>
      </>}>
      <div className="space-y-4">
        <FormSelect label="Product" value={form.product_id} onChange={(v) => update("product_id", v)} options={productOptions} placeholder="Select product..." error={errors.product_id} required />
        <FormInput label="New Quantity" type="number" min="0" value={form.newQuantity} onChange={(e) => update("newQuantity", e.target.value)} placeholder="Enter adjusted quantity" error={errors.newQuantity} required />
        <FormSelect label="Reason" value={form.reason} onChange={(v) => update("reason", v)} options={reasons} placeholder="Select reason..." error={errors.reason} required />
      </div>
    </Modal>
  );
}
