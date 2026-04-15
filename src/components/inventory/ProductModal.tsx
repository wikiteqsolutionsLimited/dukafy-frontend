import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Package, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/shared/Modal";
import { FormField, FormInput, FormSelect, inputClassName } from "@/components/shared/FormFields";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ActionButtons";
import { categoriesApi, suppliersApi } from "@/lib/api";

export interface ProductFormData {
  name: string;
  category: string;
  quantity: string;
  buyPrice: string;
  sellPrice: string;
  supplier: string;
  image: File | null;
  category_id?: number;
  supplier_id?: number;
  vat_rate: string;
  is_vat_inclusive: boolean;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  mode?: "add" | "edit";
}

const emptyForm: ProductFormData = {
  name: "", category: "", quantity: "", buyPrice: "", sellPrice: "", supplier: "", image: null,
  vat_rate: "16", is_vat_inclusive: true,
};

export function ProductModal({ open, onClose, onSave, initialData, mode = "add" }: ProductModalProps) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => categoriesApi.getAll(),
    enabled: open,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => suppliersApi.getAll({ limit: 100 }),
    enabled: open,
  });

  const categoryOptions = (categoriesData?.data || []).map((c: any) => ({ label: c.name, value: String(c.id) }));
  const supplierOptions = (suppliersData?.data || []).map((s: any) => ({ label: s.name, value: String(s.id) }));

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialData });
      setErrors({});
      setImagePreview(null);
      setIsDragging(false);
    }
  }, [open, initialData]);

  const update = (field: keyof ProductFormData, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setErrors((e) => ({ ...e, image: "Please upload an image file" })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors((e) => ({ ...e, image: "Max file size is 5MB" })); return; }
    setForm((f) => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, image: undefined }));
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) processFile(file); };
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }, [processFile]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const removeImage = () => { setForm((f) => ({ ...f, image: null })); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Required";
    else if (form.name.trim().length > 100) e.name = "Max 100 characters";
    if (!form.category) e.category = "Required";
    if (!form.quantity) e.quantity = "Required";
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = "Invalid number";
    if (!form.buyPrice) e.buyPrice = "Required";
    else if (isNaN(Number(form.buyPrice)) || Number(form.buyPrice) < 0) e.buyPrice = "Invalid price";
    if (!form.sellPrice) e.sellPrice = "Required";
    else if (isNaN(Number(form.sellPrice)) || Number(form.sellPrice) < 0) e.sellPrice = "Invalid price";
    if (!form.supplier) e.supplier = "Required";
    if (isNaN(Number(form.vat_rate)) || Number(form.vat_rate) < 0) e.vat_rate = "Invalid VAT rate";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave({ ...form, category_id: parseInt(form.category), supplier_id: parseInt(form.supplier) });
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === "add" ? "Add Product" : "Edit Product"} icon={Package}
      footer={<><SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton><PrimaryButton onClick={handleSubmit}>{mode === "add" ? "Add Product" : "Save Changes"}</PrimaryButton></>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Product Name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Wireless Earbuds" error={errors.name} required maxLength={100} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Category" value={form.category} onChange={(v) => update("category", v)} options={categoryOptions} placeholder="Select category" error={errors.category} required />
          <FormSelect label="Supplier" value={form.supplier} onChange={(v) => update("supplier", v)} options={supplierOptions} placeholder="Select supplier" error={errors.supplier} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput label="Quantity" type="number" min="0" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" error={errors.quantity} required />
          <FormInput label="Buying Price (KES)" type="number" min="0" step="0.01" value={form.buyPrice} onChange={(e) => update("buyPrice", e.target.value)} placeholder="0.00" error={errors.buyPrice} required />
          <FormInput label="Selling Price (KES)" type="number" min="0" step="0.01" value={form.sellPrice} onChange={(e) => update("sellPrice", e.target.value)} placeholder="0.00" error={errors.sellPrice} required />
        </div>

        {/* VAT Configuration */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="VAT Rate (%)" type="number" min="0" max="100" step="0.01" value={form.vat_rate} onChange={(e) => update("vat_rate", e.target.value)} placeholder="16" error={errors.vat_rate} />
          <FormField label="VAT Type">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update("is_vat_inclusive", true)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                  form.is_vat_inclusive
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                VAT Inclusive
              </button>
              <button
                type="button"
                onClick={() => update("is_vat_inclusive", false)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                  !form.is_vat_inclusive
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                VAT Exclusive
              </button>
            </div>
          </FormField>
        </div>

        <FormField label="Product Image" error={errors.image as string} optional>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-xl border object-cover shadow-sm" />
              <button type="button" onClick={removeImage} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110"><X className="h-3.5 w-3.5" /></button>
              <p className="mt-2 text-xs text-muted-foreground">{form.image?.name}</p>
            </div>
          ) : (
            <label onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              className={cn("flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all",
                isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-accent/50")}>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-colors", isDragging ? "bg-primary/10" : "bg-muted")}>
                {isDragging ? <ImageIcon className="h-6 w-6 text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{isDragging ? "Drop image here" : "Click to upload or drag & drop"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
